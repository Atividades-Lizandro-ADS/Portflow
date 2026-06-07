import { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthorCard from '../../src/components/AuthorCard';
import PostActions from '../../src/components/PostActions';
import PostGallery from '../../src/components/PostGallery';
import CommentsSection from '../../src/components/CommentsSection';
import PostMeta from '../../src/components/molecules/PostMeta';
import PostKeywords from '../../src/components/molecules/PostKeywords';
import PostEmbeds from '../../src/components/molecules/PostEmbeds';
import { getPost, deletePost } from '../../src/api/posts';
import { getComments } from '../../src/api/comments';
import { useAuth } from '../../src/context/AuthContext';
import { extractYoutubeId, extractSketchfabId } from '../../src/utils/media';
import { colors, fontSize, spacing, radius } from '../../src/theme';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      Promise.all([getPost(id), getComments(id)])
        .then(([postRes, commentsRes]) => {
          setPost(postRes.data);
          setComments(commentsRes.data.results ?? commentsRes.data);
        })
        .finally(() => setLoading(false));
    }, [id])
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.accent} size="large" /></View>;
  }
  if (!post) {
    return <View style={styles.center}><Text style={styles.errorText}>Post não encontrado.</Text></View>;
  }

  const youtubeId = extractYoutubeId(post.youtube_link);
  const sketchfabId = extractSketchfabId(post.sketchfab_link);

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
        </View>

        {user?.profile_id === post.post_owner?.id && (
          <View style={styles.ownerRow}>
            <TouchableOpacity style={styles.ownerBtnEdit} onPress={() => router.push(`/edit-post/${post.id}`)}>
              <Ionicons name="pencil-outline" size={16} color={colors.accent} />
              <Text style={styles.ownerBtnEditText}>Editar post</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ownerBtnDelete} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={16} color={colors.danger} />
              <Text style={styles.ownerBtnDeleteText}>Excluir</Text>
            </TouchableOpacity>
          </View>
        )}

        {post.description ? (
          <View style={styles.section}>
            <Text style={styles.description}>{post.description}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <PostMeta artType={post.art_type} programs={post.used_programs} />
        </View>

        <PostGallery images={post.images} displayType={post.display_type} />

        <PostEmbeds
          youtubeId={youtubeId}
          sketchfabId={sketchfabId}
          marmoviewUrl={post.marmoview}
        />

        <View style={styles.section}>
          <PostKeywords keywords={post.keywords_list} />
        </View>

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
    marginHorizontal: spacing.lg, marginBottom: spacing.xs, padding: spacing.md,
  },
  ownerRow: {
    flexDirection: 'row', gap: spacing.sm,
    marginHorizontal: spacing.lg, marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  ownerBtnEdit: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.xs, paddingVertical: spacing.sm,
    borderRadius: radius.button, borderWidth: 1, borderColor: colors.accent,
  },
  ownerBtnEditText: { color: colors.accent, fontSize: fontSize.sm, fontWeight: 'bold' },
  ownerBtnDelete: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.xs, paddingVertical: spacing.sm,
    borderRadius: radius.button, backgroundColor: 'rgba(255,68,68,0.12)',
  },
  ownerBtnDeleteText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: 'bold' },

  section: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  description: { color: colors.textSecondary, fontSize: fontSize.md, lineHeight: 22 },
});
