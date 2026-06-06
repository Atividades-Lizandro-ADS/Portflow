import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform, useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthorCard from '../../src/components/AuthorCard';
import PostActions from '../../src/components/PostActions';
import ProgramChip from '../../src/components/ProgramChip';
import PostGallery from '../../src/components/PostGallery';
import YoutubeEmbed from '../../src/components/YoutubeEmbed';
import SketchfabEmbed from '../../src/components/SketchfabEmbed';
import MarmosetViewer from '../../src/components/MarmosetViewer';
import CommentsSection from '../../src/components/CommentsSection';
import { getPost, deletePost } from '../../src/api/posts';
import { getComments } from '../../src/api/comments';
import { useAuth } from '../../src/context/AuthContext';
import { extractYoutubeId, extractSketchfabId } from '../../src/utils/media';
import { colors, fontSize, spacing, radius } from '../../src/theme';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPost(id), getComments(id)])
      .then(([postRes, commentsRes]) => {
        setPost(postRes.data);
        setComments(commentsRes.data.results ?? commentsRes.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.accent} size="large" /></View>;
  }
  if (!post) {
    return <View style={styles.center}><Text style={styles.errorText}>Post não encontrado.</Text></View>;
  }

  const embedWidth = screenWidth - spacing.lg * 2;
  const youtubeId = extractYoutubeId(post.youtube_link);
  const sketchfabId = extractSketchfabId(post.sketchfab_link);
  const artLabel = post.art_type === '3' || post.art_type === '3D' ? '3D' : '2D';

  const handleDelete = () => {
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
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView>
        <TouchableOpacity style={[styles.backBtn, { top: insets.top + spacing.sm }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>

        <View style={styles.titleSection}>
          <Text style={styles.title}>{post.tittle}</Text>
        </View>

        <View style={styles.authorRow}>
          <AuthorCard profile={post.post_owner} />
          {user?.profile_id === post.post_owner?.id && (
            <View style={styles.ownerActions}>
              <TouchableOpacity style={styles.ownerBtn} onPress={() => router.push(`/edit-post/${post.id}`)}>
                <Ionicons name="pencil-outline" size={18} color={colors.accent} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.ownerBtn, styles.ownerBtnDanger]} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {post.description ? (
          <View style={styles.section}>
            <Text style={styles.description}>{post.description}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.chipsRow}>
            <View style={styles.artChip}>
              <Text style={styles.artChipText}>{artLabel}</Text>
            </View>
            {post.used_programs?.map((p) => <ProgramChip key={p.id} program={p} />)}
          </View>
        </View>

        <PostGallery images={post.images} displayType={post.display_type} />

        {youtubeId && (
          <View style={styles.embedSection}>
            <YoutubeEmbed videoId={youtubeId} width={embedWidth} />
          </View>
        )}

        {post.marmoview && (
          <View style={styles.embedSection}>
            <Text style={styles.sectionLabel}>Marmoset Viewer</Text>
            <MarmosetViewer url={post.marmoview} />
          </View>
        )}

        {sketchfabId && (
          <View style={styles.embedSection}>
            <Text style={styles.sectionLabel}>Sketchfab</Text>
            <SketchfabEmbed modelId={sketchfabId} />
          </View>
        )}

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

        <View style={styles.section}>
          <PostActions
            postId={post.id}
            initialLiked={post.liked ?? false}
            initialFavorited={post.favorited ?? false}
          />
        </View>

        <CommentsSection postId={post.id} initialComments={comments} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.darkBg },
  center: { flex: 1, backgroundColor: colors.darkBg, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: colors.textSecondary, fontSize: fontSize.md },

  backBtn: {
    position: 'absolute', left: spacing.md, zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 20, padding: spacing.sm,
  },

  titleSection: {
    paddingTop: spacing.xxl + spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: { color: colors.white, fontSize: fontSize.xl, fontWeight: 'bold' },

  authorRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: spacing.lg, marginBottom: spacing.md, padding: spacing.md,
  },
  ownerActions: { flexDirection: 'row', gap: spacing.sm },
  ownerBtn: { padding: spacing.sm, borderRadius: radius.button, backgroundColor: colors.lightBg },
  ownerBtnDanger: { backgroundColor: 'rgba(255,68,68,0.12)' },

  section: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  sectionLabel: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: 'bold', marginBottom: spacing.sm },
  description: { color: colors.textSecondary, fontSize: fontSize.md, lineHeight: 22 },

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

  embedSection: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
});
