import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontSize, spacing } from '../src/theme';

export default function ComissionTierFormScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { paddingTop: insets.top + spacing.md }]}>Novo tier</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.darkBg },
  title: { color: colors.white, fontSize: fontSize.xl, fontWeight: 'bold', paddingHorizontal: spacing.lg },
});
