import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PostGallery from '../PostGallery';
import PostMeta from '../molecules/PostMeta';
import PostKeywords from '../molecules/PostKeywords';
import PostEmbeds from '../molecules/PostEmbeds';
import { extractYoutubeId, extractSketchfabId } from '../../utils/media';
import { colors, fontSize, spacing } from '../../theme';

function DummyActions() {
  return (
    <View style={styles.actionsRow}>
      <View style={styles.action}>
        <Ionicons name="heart-outline" size={24} color={colors.white} />
        <Text style={styles.actionText}>Curtir</Text>
      </View>
      <View style={styles.action}>
        <Ionicons name="bookmark-outline" size={24} color={colors.white} />
        <Text style={styles.actionText}>Salvar</Text>
      </View>
    </View>
  );
}

export default function PostPreview({
  tittle, description, artType, displayType,
  galleryImages, youtubeLink, sketchfabLink,
  selectedPrograms, keywords, mviewFileName,
}) {
  const youtubeId = extractYoutubeId(youtubeLink);
  const sketchfabId = extractSketchfabId(sketchfabLink);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      <View style={styles.titleSection}>
        <Text style={styles.title}>{tittle.trim() || 'Título da obra'}</Text>
      </View>

      {description.trim() ? (
        <View style={styles.section}>
          <Text style={styles.description}>{description.trim()}</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <PostMeta artType={artType} programs={selectedPrograms} />
      </View>

      <PostGallery images={galleryImages} displayType={displayType} />

      <PostEmbeds
        youtubeId={youtubeId}
        sketchfabId={sketchfabId}
        mviewFileName={mviewFileName}
      />

      <View style={styles.section}>
        <PostKeywords keywords={keywords} />
      </View>

      <View style={styles.section}>
        <DummyActions />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.darkBg },
  titleSection: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: { color: colors.white, fontSize: fontSize.xl, fontWeight: 'bold' },
  section: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  description: { color: colors.textSecondary, fontSize: fontSize.md, lineHeight: 22 },
  actionsRow: { flexDirection: 'row', gap: spacing.lg },
  action: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.sm },
  actionText: { color: colors.white, fontSize: fontSize.sm, fontWeight: 'bold' },
});
