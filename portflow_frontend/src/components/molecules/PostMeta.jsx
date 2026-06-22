import { View, Text, StyleSheet } from 'react-native';
import ProgramChip from '../ProgramChip';
import { colors, fontSize, spacing, radius } from '../../theme';

export default function PostMeta({ artType, programs = [] }) {
  const label = artType === '3' || artType === '3D' ? '3D' : '2D';
  return (
    <View style={styles.row}>
      <View style={styles.artChip}>
        <Text style={styles.artChipText}>{label}</Text>
      </View>
      {programs.map((p) => <ProgramChip key={p.id} program={p} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  artChip: {
    backgroundColor: colors.headerBg, borderRadius: radius.pill,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
  },
  artChipText: { color: colors.white, fontSize: fontSize.sm },
});
