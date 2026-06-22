import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, radius } from '../theme';

export default function ProgramChip({ program, onRemove }) {
  return (
    <View style={styles.chip}>
      {program.program_logo ? (
        <Image source={{ uri: program.program_logo }} style={styles.logo} />
      ) : null}
      <Text style={styles.name}>{program.program_name}</Text>
      {onRemove ? (
        <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close" size={14} color={colors.textSecondary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.headerBg,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  logo: { width: 16, height: 16, borderRadius: 3 },
  name: { color: colors.white, fontSize: fontSize.sm },
});
