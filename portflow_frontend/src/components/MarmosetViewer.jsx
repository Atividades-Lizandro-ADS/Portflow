import { useState } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, colors, spacing } from '../theme';
import EmbedLoader from './EmbedLoader';

function viewerJsUrl(mviewUrl) {
  try {
    const u = new URL(mviewUrl);
    const bucket = u.pathname.split('/').filter(Boolean)[0];
    return `${u.origin}/${bucket}/programs/viewer/viewer.js`;
  } catch {
    return null;
  }
}

function buildHtml(safeUrl, safeJsUrl) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:100%;height:100%;background:#1a1a1a;overflow:hidden}
    #loader{position:fixed;inset:0;display:flex;align-items:center;justify-content:center}
    #spinner{width:32px;height:32px;border:3px solid #333;border-top-color:#24BAFF;border-radius:50%;animation:spin .8s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
    #err{display:none;color:#ff4444;padding:20px;font-family:sans-serif;font-size:13px;text-align:center;white-space:pre-wrap}
  </style>
</head>
<body>
  <div id="loader"><div id="spinner"></div></div>
  <div id="err"></div>
  <script>
    var MVIEW_URL=${safeUrl};
    var JS_URL=${safeJsUrl};
    function showError(msg){
      document.getElementById('loader').style.display='none';
      var el=document.getElementById('err');
      el.style.display='block';
      el.textContent=msg;
    }
    function startViewer(){
      document.getElementById('loader').style.display='none';
      try{
        var w=window.innerWidth,h=window.innerHeight;
        var viewer=new marmoset.WebViewer(w,h,MVIEW_URL);
        document.body.appendChild(viewer.domRoot);
        viewer.onLoad=function(){ viewer.resize(window.innerWidth,window.innerHeight); };
        viewer.onError=function(e){ showError('Viewer error: '+e); };
        window.onresize=function(){ viewer.resize(window.innerWidth,window.innerHeight); };
      }catch(e){
        showError(e.message);
      }
    }
    if(!JS_URL){
      showError('URL do .mview inválida');
    } else {
      var s=document.createElement('script');
      s.src=JS_URL;
      s.onload=function(){
        if(typeof marmoset!=='undefined'&&marmoset.WebViewer){
          startViewer();
        }else{
          showError('marmoset.WebViewer não encontrado.\\nEnvie viewer.js ao MinIO em:\\nprograms/viewer/viewer.js');
        }
      };
      s.onerror=function(){
        showError('Falha ao carregar viewer.js do MinIO.\\nURL: '+JS_URL+'\\n\\nEnvie o arquivo via MinIO Console (porta 9001).\\nPath: programs/viewer/viewer.js');
      };
      document.head.appendChild(s);
    }
  </script>
</body>
</html>`;
}

function ViewerWebView({ html, onLoad }) {
  return (
    <WebView
      source={{ html }}
      style={{ flex: 1, backgroundColor: '#1a1a1a' }}
      onLoadEnd={onLoad}
      javaScriptEnabled
      originWhitelist={['*']}
      mixedContentMode="always"
    />
  );
}

export default function MarmosetViewer({ url }) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [fsLoading, setFsLoading] = useState(true);

  const jsUrl = viewerJsUrl(url);
  const safeUrl = JSON.stringify(url);
  const safeJsUrl = jsUrl ? JSON.stringify(jsUrl) : 'null';
  const html = buildHtml(safeUrl, safeJsUrl);

  return (
    <>
      <View style={styles.container}>
        {loading && <EmbedLoader />}
        <ViewerWebView html={html} onLoad={() => setLoading(false)} />
        {!loading && (
          <TouchableOpacity style={styles.expandBtn} onPress={() => { setFsLoading(true); setFullscreen(true); }}>
            <Ionicons name="expand" size={18} color={colors.white} />
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={fullscreen} animationType="fade" onRequestClose={() => setFullscreen(false)}>
        <View style={[styles.fullscreen, { paddingTop: insets.top }]}>
          {fsLoading && <EmbedLoader />}
          <ViewerWebView html={html} onLoad={() => setFsLoading(false)} />
          <TouchableOpacity style={[styles.closeBtn, { top: insets.top + spacing.sm }]} onPress={() => setFullscreen(false)}>
            <Ionicons name="contract" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 400,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  expandBtn: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: spacing.sm,
  },
  fullscreen: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  closeBtn: {
    position: 'absolute',
    right: spacing.md,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: spacing.sm,
  },
});
