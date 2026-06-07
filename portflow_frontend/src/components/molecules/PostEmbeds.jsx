import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import YoutubeEmbed from '../YoutubeEmbed';
import SketchfabEmbed from '../SketchfabEmbed';
import MarmosetViewer from '../MarmosetViewer';
import SectionLabel from '../atoms/SectionLabel';
import { colors, fontSize, spacing, radius } from '../../theme';

export default function PostEmbeds({ youtubeId, sketchfabId, marmoviewUrl, mviewFileName }) {
  const { width: screenWidth } = useWindowDimensions();
  const embedWidth = screenWidth - spacing.lg * 2;

  const hasYoutube = !!youtubeId;
  const hasMarmoview = !!(marmoviewUrl || mviewFileName);
  const hasSketchfab = !!sketchfabId;

  if (!hasYoutube && !hasMarmoview && !hasSketchfab) return null;

  return (
    <View style={styles.wrapper}>
      {hasYoutube && (
        <View style={styles.embed}>
          <YoutubeEmbed videoId={youtubeId} width={embedWidth} />
        </View>
      )}
      {hasMarmoview && (
        <View style={styles.embed}>
          <SectionLabel>Marmoset Viewer</SectionLabel>
          <View style={styles.marmosetGap} />
          {marmoviewUrl ? (
            <MarmosetViewer url={marmoviewUrl} />
          ) : (
            <View style={styles.mviewPlaceholder}>
              <Ionicons name="cube-outline" size={32} color={colors.textSecondary} />
              <Text style={styles.mviewText}>{mviewFileName}</Text>
            </View>
          )}
        </View>
      )}
      {hasSketchfab && (
        <View style={styles.embed}>
          <SectionLabel>Sketchfab</SectionLabel>
          <View style={styles.marmosetGap} />
          <SketchfabEmbed modelId={sketchfabId} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
    marginTop: 10,
  },
  embed: {},
  marmosetGap: { height: spacing.sm },
  mviewPlaceholder: {
    backgroundColor: colors.lightBg, borderRadius: radius.card,
    height: 120, alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
  },
  mviewText: { color: colors.textSecondary, fontSize: fontSize.sm },
});
