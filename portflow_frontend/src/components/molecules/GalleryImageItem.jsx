import { View, Text, Image, TextInput, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, radius } from '../../theme';

export const CELL_OPTIONS = ['1/3', '2/3', '3/3'];

export default function GalleryImageItem({ item, index, onUpdate, onRemove, showCellSizes }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(index)}>
        <Ionicons name="close-circle" size={22} color={colors.danger} />
      </TouchableOpacity>
      <Image source={{ uri: item.uri }} style={styles.thumb} resizeMode="cover" />
      <View style={styles.fields}>
        <TextInput
          style={styles.input}
          placeholder="Legenda"
          placeholderTextColor={colors.inputBorder}
          value={item.caption}
          onChangeText={(t) => onUpdate(index, 'caption', t)}
          maxLength={240}
        />
        <TextInput
          style={styles.input}
          placeholder="Legenda de acessibilidade"
          placeholderTextColor={colors.inputBorder}
          value={item.acessibilityCaption}
          onChangeText={(t) => onUpdate(index, 'acessibilityCaption', t)}
          maxLength={120}
        />
        <View style={styles.matureRow}>
          <Text style={styles.matureLabel}>Conteúdo maduro</Text>
          <Switch
            value={item.is_mature ?? false}
            onValueChange={(v) => onUpdate(index, 'is_mature', v)}
            trackColor={{ false: colors.inputBorder, true: colors.accent }}
            thumbColor={colors.white}
          />
        </View>
        {showCellSizes && (
          <View style={styles.cellRow}>
            {[['cell_size_x', 'Largura'], ['cell_size_y', 'Altura']].map(([field, label]) => (
              <View key={field} style={styles.cellGroup}>
                <Text style={styles.cellLabel}>{label}</Text>
                <View style={styles.cellOptions}>
                  {CELL_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.cellBtn, item[field] === opt && styles.cellBtnActive]}
                      onPress={() => onUpdate(index, field, opt)}
                    >
                      <Text style={[styles.cellBtnText, item[field] === opt && styles.cellBtnTextActive]}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.lightBg, borderRadius: radius.card, overflow: 'hidden', position: 'relative' },
  removeBtn: { position: 'absolute', top: spacing.sm, right: spacing.sm, zIndex: 10 },
  thumb: { width: '100%', height: 180, resizeMode: 'cover' },
  fields: { padding: spacing.md, gap: spacing.sm },
  input: { backgroundColor: colors.formBg, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: radius.input, color: colors.white, fontSize: fontSize.md, padding: spacing.md },
  cellRow: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.xs },
  cellGroup: { flex: 1, gap: spacing.xs },
  cellLabel: { color: colors.textSecondary, fontSize: fontSize.xs },
  cellOptions: { flexDirection: 'row', gap: spacing.xs },
  cellBtn: { flex: 1, paddingVertical: spacing.xs, alignItems: 'center', borderRadius: radius.input, borderWidth: 1, borderColor: colors.inputBorder },
  cellBtnActive: { borderColor: colors.accent, backgroundColor: 'rgba(36,186,255,0.12)' },
  cellBtnText: { color: colors.textSecondary, fontSize: fontSize.xs },
  cellBtnTextActive: { color: colors.accent },
  matureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs },
  matureLabel: { color: colors.textSecondary, fontSize: fontSize.sm },
});
