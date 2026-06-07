import { View, Text, Switch, StyleSheet } from 'react-native';
import { colors, fontSize, spacing, radius } from '../../theme';

export default function PublishToggle({ value, onChange }) {
  return (
    <View style={styles.row}>
      <View>
        <Text style={styles.label}>Publicar agora</Text>
        <Text style={styles.sub}>{value ? 'Visível para todos' : 'Salvo como rascunho'}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.headerBg, true: colors.accent }}
        thumbColor={colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.formBg, padding: spacing.md, borderRadius: radius.card },
  label: { color: colors.white, fontSize: fontSize.md, fontWeight: 'bold' },
  sub: { color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 2 },
});
