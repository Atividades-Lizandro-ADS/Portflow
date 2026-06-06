import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, spacing } from '../theme';

export default function Tag({ label }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    backgroundColor: colors.headerBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  text: {
    color: colors.white,
    fontSize: fontSize.sm,
  },
});
