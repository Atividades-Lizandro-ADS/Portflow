import { TextInput, StyleSheet } from 'react-native';
import { colors, fontSize, spacing, radius } from '../../theme';

export default function NoPasteTextInput({ style, multiline, ...props }) {
  return (
    <TextInput
      style={[styles.input, multiline && styles.multiline, style]}
      placeholderTextColor={colors.inputBorder}
      multiline={multiline}
      contextMenuHidden
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.formBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.input,
    color: colors.white,
    fontSize: fontSize.md,
    padding: spacing.md,
  },
  multiline: { minHeight: 120 },
});
