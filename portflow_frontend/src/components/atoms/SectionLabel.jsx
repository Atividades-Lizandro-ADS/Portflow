import { Text, StyleSheet } from 'react-native';
import { colors, fontSize } from '../../theme';

export default function SectionLabel({ children }) {
  return <Text style={styles.label}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: 'bold' },
});
