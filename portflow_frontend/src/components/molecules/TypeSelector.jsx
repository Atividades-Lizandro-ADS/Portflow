import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fontSize, spacing, radius } from '../../theme';

export default function TypeSelector({ options, value, onChange }) {
  return (
    <View style={styles.row}>
      {options.map(({ value: v, label }) => (
        <TouchableOpacity
          key={v}
          style={[styles.btn, value === v && styles.btnActive]}
          onPress={() => onChange(v)}
        >
          <Text style={[styles.text, value === v && styles.textActive]}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  btn: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.button, borderWidth: 1, borderColor: colors.inputBorder, backgroundColor: colors.formBg },
  btnActive: { borderColor: colors.accent, backgroundColor: 'rgba(36,186,255,0.12)' },
  text: { color: colors.textSecondary, fontWeight: 'bold', fontSize: fontSize.md },
  textActive: { color: colors.accent },
});
