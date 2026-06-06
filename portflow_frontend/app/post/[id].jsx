import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Image, ActivityIndicator,
  TouchableOpacity, Modal, useWindowDimensions,
  KeyboardAvoidingView, Platform, TextInput, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PostActions from '../../src/components/PostActions';
import CommentItem from '../../src/components/CommentItem';
import ProgramChip from '../../src/components/ProgramChip';
import AuthorCard from '../../src/components/AuthorCard';
import { getPost, deletePost } from '../../src/api/posts';
import { getComments, createComment } from '../../src/api/comments';
import { useAuth } from '../../src/context/AuthContext';
import { colors, fontSize, spacing, radius } from '../../src/theme';

// ─── helpers ────────────────────────────────────────────────────────────────

const GRID_FRACTION = { '1/3': 1 / 3, '2/3': 2 / 3, '3/3': 1 };

function extractYoutubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&\n?#]+)/);
  return m ? m[1] : null;
}

function extractSketchfabId(url) {
  if (!url) return null;
  const m = url.match(/sketchfab\.com\/(?:models|3d-models)\/(?:[^\/]+-)?([a-f0-9]{32})/i)
    ?? url.match(/sketchfab\.com\/(?:models|3d-models)\/([^\/\?]+)/);
  return m ? m[1] : null;
}

// ─── sub-components ─────────────────────────────────────────────────────────

function EmbedLoader() {
  return (
    <View style={[StyleSheet.absoluteFill, styles.embedLoaderBg]}>
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}

function YoutubeEmbed({ videoId, width }) {
  const [loading, setLoading] = useState(true);
  const height = width * 9 / 16;
  return (
    <View style={{ height, borderRadius: radius.card, overflow: 'hidden' }}>
      {loading && <EmbedLoader />}
      <WebView
        source={{ uri: `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0` }}
        style={{ flex: 1, backgroundColor: colors.lightBg }}
        onLoadEnd={() => setLoading(false)}
        allowsFullscreenVideo
        javaScriptEnabled
      />
    </View>
  );
}

function SketchfabEmbed({ modelId, width }) {
  const [loading, setLoading] = useState(true);
  return (
    <View style={{ height: 380, borderRadius: radius.card, overflow: 'hidden' }}>
      {loading && <EmbedLoader />}
      <WebView
        source={{ uri: `https://sketchfab.com/models/${modelId}/embed` }}
        style={{ flex: 1, backgroundColor: colors.lightBg }}
        onLoadEnd={() => setLoading(false)}
        javaScriptEnabled
      />
    </View>
  );
}

function getViewerJsUrl(mviewUrl) {
  try {
    const u = new URL(mviewUrl);
    const bucket = u.pathname.split('/').filter(Boolean)[0];
    return `${u.origin}/${bucket}/programs/viewer/viewer.js`;
  } catch {
    return null;
  }
}

function MarmosetViewer({ url }) {
  const [loading, setLoading] = useState(true);
  const viewerJsUrl = getViewerJsUrl(url);
  const safeUrl = JSON.stringify(url);
  const safeJsUrl = viewerJsUrl ? JSON.stringify(viewerJsUrl) : 'null';

  const html = `<!DOCTYPE html>
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

  return (
    <View style={{ height: 400, borderRadius: radius.card, overflow: 'hidden' }}>
      {loading && <EmbedLoader />}
      <WebView
        source={{ html }}
        style={{ flex: 1, backgroundColor: '#1a1a1a' }}
        onLoadEnd={() => setLoading(false)}
        javaScriptEnabled
        originWhitelist={['*']}
        mixedContentMode="always"
      />
    </View>
  );
}

function FullscreenModal({ images, index, onClose, onNavigate }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  if (index === null || !images[index]) return null;
  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <View style={[styles.fullscreenBg, { width, height }]}>
        <Image
          source={{ uri: images[index].post_img }}
          style={{ width, flex: 1 }}
          resizeMode="contain"
        />
        <TouchableOpacity style={[styles.fsClose, { top: insets.top + spacing.sm }]} onPress={onClose}>
          <Ionicons name="close" size={22} color={colors.white} />
        </TouchableOpacity>
        {index > 0 && (
          <TouchableOpacity style={styles.fsArrowLeft} onPress={() => onNavigate(index - 1)}>
            <Ionicons name="chevron-back" size={32} color={colors.white} />
          </TouchableOpacity>
        )}
        {index < images.length - 1 && (
          <TouchableOpacity style={styles.fsArrowRight} onPress={() => onNavigate(index + 1)}>
            <Ionicons name="chevron-forward" size={32} color={colors.white} />
          </TouchableOpacity>
        )}
        <View style={[styles.fsCounter, { bottom: insets.bottom + spacing.md }]}>
          <Text style={styles.fsCounterText}>{index + 1} / {images.length}</Text>
        </View>
      </View>
    </Modal>
  );
}

// ─── main screen ────────────────────────────────────────────────────────────

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const embedWidth = screenWidth - spacing.lg * 2;

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(null);

  useEffect(() => {
    Promise.all([getPost(id), getComments(id)])
      .then(([postRes, commentsRes]) => {
        setPost(postRes.data);
        setComments(commentsRes.data.results ?? commentsRes.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSendComment = async () => {
    if (!commentText.trim() || !user) return;
    setSending(true);
    try {
      const { data } = await createComment(id, commentText.trim());
      setComments((prev) => [data, ...prev]);
      setCommentText('');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.accent} size="large" /></View>;
  }
  if (!post) {
    return <View style={styles.center}><Text style={styles.errorText}>Post não encontrado.</Text></View>;
  }

  const images = post.images ?? [];
  const displayType = post.display_type ?? 'list';
  const youtubeId = extractYoutubeId(post.youtube_link);
  const sketchfabId = extractSketchfabId(post.sketchfab_link);
  const artLabel = post.art_type === '3' || post.art_type === '3D' ? '3D' : '2D';

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView>

        {/* Back button */}
        <TouchableOpacity style={[styles.backBtn, { top: insets.top + spacing.sm }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>

        {/* ① Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{post.tittle}</Text>
        </View>

        {/* ② Author card + owner actions */}
        <View style={styles.authorRow}>
          <AuthorCard profile={post.post_owner} />
          {user?.profile_id === post.post_owner?.id && (
            <View style={styles.ownerActions}>
              <TouchableOpacity
                style={styles.ownerBtn}
                onPress={() => router.push(`/edit-post/${post.id}`)}
              >
                <Ionicons name="pencil-outline" size={18} color={colors.accent} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ownerBtn, styles.ownerBtnDanger]}
                onPress={() => {
                  Alert.alert('Excluir post', 'Tem certeza? Esta ação não pode ser desfeita.', [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Excluir', style: 'destructive',
                      onPress: async () => {
                        try { await deletePost(post.id); router.back(); }
                        catch { Alert.alert('Erro', 'Não foi possível excluir o post.'); }
                      },
                    },
                  ]);
                }}
              >
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ③ Description */}
        {post.description ? (
          <View style={styles.section}>
            <Text style={styles.description}>{post.description}</Text>
          </View>
        ) : null}

        {/* ④ Programs */}
        {post.used_programs?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Programas utilizados</Text>
            <View style={styles.chipsRow}>
              <View style={styles.artChip}>
                <Text style={styles.artChipText}>{artLabel}</Text>
              </View>
              {post.used_programs.map((p) => (
                <ProgramChip key={p.id} program={p} />
              ))}
            </View>
          </View>
        )}

        {/* Fallback: just art type chip if no programs */}
        {!post.used_programs?.length && (
          <View style={[styles.section, { paddingTop: 0 }]}>
            <View style={styles.chipsRow}>
              <View style={styles.artChip}>
                <Text style={styles.artChipText}>{artLabel}</Text>
              </View>
            </View>
          </View>
        )}

        {/* ⑤ Gallery images */}
        {images.length > 0 && (
          <View style={styles.gallerySection}>
            {displayType === 'album' ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {images.map((img, idx) => {
                  const xFrac = GRID_FRACTION[img.cell_size_x] ?? 1 / 3;
                  const yFrac = GRID_FRACTION[img.cell_size_y] ?? 1 / 3;
                  return (
                    <TouchableOpacity key={img.id} onPress={() => setFullscreenIndex(idx)} activeOpacity={0.85}>
                      <Image
                        source={{ uri: img.post_img }}
                        style={{ width: screenWidth * xFrac, height: screenWidth * yFrac }}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              images.map((img, idx) => (
                <TouchableOpacity key={img.id} onPress={() => setFullscreenIndex(idx)} activeOpacity={0.85}>
                  <Image
                    source={{ uri: img.post_img }}
                    style={{ width: screenWidth, height: screenWidth * 0.75 }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* ⑥ YouTube */}
        {youtubeId && (
          <View style={styles.embedSection}>
            <YoutubeEmbed videoId={youtubeId} width={embedWidth} />
          </View>
        )}

        {/* ⑦ Marmoset */}
        {post.marmoview && (
          <View style={styles.embedSection}>
            <Text style={styles.sectionLabel}>Marmoset Viewer</Text>
            <MarmosetViewer url={post.marmoview} />
          </View>
        )}

        {/* ⑧ Sketchfab */}
        {sketchfabId && (
          <View style={styles.embedSection}>
            <Text style={styles.sectionLabel}>Sketchfab</Text>
            <SketchfabEmbed modelId={sketchfabId} width={embedWidth} />
          </View>
        )}

        {/* ⑨ Keywords */}
        {post.keywords_list?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Palavras-chave</Text>
            <View style={styles.chipsRow}>
              {post.keywords_list.map((kw, i) => (
                <View key={i} style={styles.keywordChip}>
                  <Text style={styles.keywordText}>#{kw}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ⑩ Like / Save */}
        <View style={styles.section}>
          <PostActions
            postId={post.id}
            initialLiked={post.liked ?? false}
            initialFavorited={post.favorited ?? false}
          />
        </View>

        {/* ⑪ Comments */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comentários</Text>
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              onDeleted={(cid) => setComments((prev) => prev.filter((x) => x.id !== cid))}
            />
          ))}
          {comments.length === 0 && (
            <Text style={styles.noComments}>Seja o primeiro a comentar.</Text>
          )}
        </View>

      </ScrollView>

      {/* Comment input */}
      {user && (
        <View style={styles.commentInputRow}>
          <TextInput
            style={styles.inputField}
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Adicionar comentário..."
            placeholderTextColor={colors.inputBorder}
            multiline
          />
          <TouchableOpacity onPress={handleSendComment} disabled={sending || !commentText.trim()}>
            {sending
              ? <ActivityIndicator size={22} color={colors.accent} />
              : <Ionicons name="send" size={22} color={commentText.trim() ? colors.accent : colors.inputBorder} />}
          </TouchableOpacity>
        </View>
      )}

      {/* Fullscreen */}
      {fullscreenIndex !== null && (
        <FullscreenModal
          images={images}
          index={fullscreenIndex}
          onClose={() => setFullscreenIndex(null)}
          onNavigate={setFullscreenIndex}
        />
      )}
    </KeyboardAvoidingView>
  );
}

// ─── styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.darkBg },
  center: { flex: 1, backgroundColor: colors.darkBg, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: colors.textSecondary, fontSize: fontSize.md },

  backBtn: {
    position: 'absolute', left: spacing.md, zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 20, padding: spacing.sm,
  },

  // ① Title
  titleSection: {
    paddingTop: spacing.xxl + spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: { color: colors.white, fontSize: fontSize.xl, fontWeight: 'bold' },

  // ② Author row
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  ownerActions: { flexDirection: 'row', gap: spacing.sm },
  ownerBtn: {
    padding: spacing.sm,
    borderRadius: radius.button,
    backgroundColor: colors.lightBg,
  },
  ownerBtnDanger: { backgroundColor: 'rgba(255,68,68,0.12)' },

  // sections
  section: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  sectionLabel: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: 'bold', marginBottom: spacing.sm },
  description: { color: colors.textSecondary, fontSize: fontSize.md, lineHeight: 22 },

  // chips row
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  artChip: {
    backgroundColor: colors.headerBg, borderRadius: radius.pill,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
  },
  artChipText: { color: colors.white, fontSize: fontSize.sm },
  keywordChip: {
    backgroundColor: colors.headerBg, borderRadius: radius.pill,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
  },
  keywordText: { color: colors.accent, fontSize: fontSize.sm },

  // gallery
  gallerySection: { marginBottom: spacing.md },

  // embeds
  embedSection: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  embedLoaderBg: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.lightBg },

  // comments
  commentsSection: { padding: spacing.lg, gap: spacing.sm },
  commentsTitle: { color: colors.white, fontSize: fontSize.lg, fontWeight: 'bold', marginBottom: spacing.sm },
  noComments: { color: colors.textSecondary, fontSize: fontSize.sm },
  commentInputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm,
    padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.headerBg,
    backgroundColor: colors.formBg,
  },
  inputField: { flex: 1, color: colors.white, fontSize: fontSize.md, maxHeight: 100, padding: spacing.sm },

  // fullscreen
  fullscreenBg: { backgroundColor: 'rgba(0,0,0,0.97)', justifyContent: 'center' },
  fsClose: {
    position: 'absolute', right: spacing.md, zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: spacing.sm,
  },
  fsArrowLeft: {
    position: 'absolute', left: spacing.md, top: '50%',
    backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: spacing.sm,
  },
  fsArrowRight: {
    position: 'absolute', right: spacing.md, top: '50%',
    backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: spacing.sm,
  },
  fsCounter: {
    position: 'absolute', alignSelf: 'center', left: 0, right: 0, alignItems: 'center',
  },
  fsCounterText: { color: 'rgba(255,255,255,0.7)', fontSize: fontSize.sm },
});
