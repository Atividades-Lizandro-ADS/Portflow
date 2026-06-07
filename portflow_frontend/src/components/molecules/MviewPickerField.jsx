import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { colors, fontSize, spacing, radius } from '../../theme';

export default function MviewPickerField({ current, picked, onPick, onRemovePicked }) {
  const handlePress = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (!result.canceled && result.assets?.[0]) {
        const file = result.assets[0];
        if (!file.name.toLowerCase().endsWith('.mview')) {
          Alert.alert('Arquivo inválido', 'Selecione um arquivo .mview exportado pelo Marmoset Toolbag.');
          return;
        }
        onPick(file);
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível selecionar o arquivo.');
    }
  };

  const hasFile = picked || current;
  const label = picked
    ? picked.name
    : current
    ? 'Arquivo atual (toque para trocar)'
    : 'Selecionar arquivo .mview';

  return (
    <TouchableOpacity style={styles.picker} onPress={handlePress} activeOpacity={0.7}>
      <Ionicons name="cube-outline" size={22} color={hasFile ? colors.accent : colors.textSecondary} />
      <Text style={[styles.text, hasFile && styles.textActive]}>{label}</Text>
      {picked && (
        <TouchableOpacity onPress={onRemovePicked}>
          <Ionicons name="close-circle" size={18} color={colors.danger} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  picker: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.formBg, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: radius.input, padding: spacing.md },
  text: { flex: 1, color: colors.textSecondary, fontSize: fontSize.sm },
  textActive: { color: colors.accent },
});
