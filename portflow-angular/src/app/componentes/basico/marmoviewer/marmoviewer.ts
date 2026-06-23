import { Component, ElementRef, effect, input, viewChild } from '@angular/core';

function viewerJsUrl(mviewUrl: string): string | null {
  try {
    const u = new URL(mviewUrl);
    const bucket = u.pathname.split('/').filter(Boolean)[0];
    return `${u.origin}/${bucket}/programs/viewer/viewer.js`;
  } catch {
    return null;
  }
}

const CDN_URL = 'https://viewer.marmoset.co/main/marmoset.js';

function buildHtml(safeUrl: string, safeJsUrl: string): string {
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
    var FALLBACK_URL=${safeJsUrl};
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
    function loadScript(src, onSuccess, onFail){
      var s=document.createElement('script');
      s.src=src;
      s.onload=function(){
        if(typeof marmoset!=='undefined'&&marmoset.WebViewer){
          onSuccess();
        }else{
          onFail();
        }
      };
      s.onerror=onFail;
      document.head.appendChild(s);
    }
    loadScript(
      '${CDN_URL}',
      startViewer,
      function(){
        if(!FALLBACK_URL){
          showError('Falha ao carregar o viewer (CDN indispon\\u00edvel e sem fallback no MinIO).');
          return;
        }
        loadScript(FALLBACK_URL, startViewer, function(){
          showError('Falha ao carregar o viewer.\\nCDN: ${CDN_URL}\\nFallback: '+FALLBACK_URL);
        });
      }
    );
  </script>
</body>
</html>`;
}

@Component({
  selector: 'app-marmoviewer',
  imports: [],
  templateUrl: './marmoviewer.html',
  styleUrl: './marmoviewer.scss',
})
export class Marmoviewer {
  url = input.required<string>();

  private iframeRef = viewChild.required<ElementRef<HTMLIFrameElement>>('iframeEl');

  constructor() {
    effect(() => {
      const jsUrl = viewerJsUrl(this.url());
      const html = buildHtml(
        JSON.stringify(this.url()),
        jsUrl ? JSON.stringify(jsUrl) : 'null'
      );
      this.iframeRef().nativeElement.srcdoc = html;
    });
  }
}
