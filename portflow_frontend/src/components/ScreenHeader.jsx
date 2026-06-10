import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontSize, spacing } from '../theme';

export default function ScreenHeader({ onBack, title, children, noBorder = false }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing.md }, !noBorder && styles.bordered]}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={colors.white} />
      </TouchableOpacity>
      {title ? (
        <>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.spacer} />
        </>
      ) : children ? (
        <View style={styles.contentArea}>{children}</View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.darkBg,
  },
  bordered: {
    borderBottomWidth: 1,
    borderBottomColor: colors.headerBg,
  },
  backBtn: { padding: spacing.xs },
  title: {
    flex: 1,
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  spacer: { width: 40 },
  contentArea: { flex: 1, marginLeft: spacing.sm },
});
