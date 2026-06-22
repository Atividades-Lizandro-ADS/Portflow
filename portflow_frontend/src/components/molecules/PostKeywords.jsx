import { View, Text, StyleSheet } from 'react-native';
import SectionLabel from '../atoms/SectionLabel';
import { colors, fontSize, spacing, radius } from '../../theme';

export default function PostKeywords({ keywords }) {
  const list = Array.isArray(keywords)
    ? keywords
    : (keywords ?? '').split('#').map((k) => k.trim()).filter(Boolean);

  if (!list.length) return null;

  return (
    <View style={styles.wrapper}>
      <SectionLabel>Palavras-chave</SectionLabel>
      <View style={styles.row}>
        {list.map((kw, i) => (
          <View key={i} style={styles.chip}>
            <Text style={styles.chipText}>#{kw}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    backgroundColor: colors.headerBg, borderRadius: radius.pill,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
  },
  chipText: { color: colors.accent, fontSize: fontSize.sm },
});
