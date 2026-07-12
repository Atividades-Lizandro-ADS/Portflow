import { Modal, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { colors, fontSize, spacing, radius } from '../../theme';

export default function AttachMenuModal({
  visible, onClose, onPickImage, onPickFile, onOpenBriefing,
  isClient, messagingDisabled, briefingDisabled,
}) {
  const handlePickImage = async () => {
    onClose();
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos acessar sua galeria.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      onPickImage({
        uri: asset.uri,
        name: asset.fileName ?? `image-${Date.now()}.jpg`,
        mimeType: asset.mimeType ?? 'image/jpeg',
        size: asset.fileSize,
      });
    }
  };

  const handlePickFile = async () => {
    onClose();
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (!result.canceled && result.assets?.[0]) {
        const file = result.assets[0];
        onPickFile({
          uri: file.uri,
          name: file.name,
          mimeType: file.mimeType ?? 'application/octet-stream',
          size: file.size,
        });
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível selecionar o arquivo.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
        <View style={styles.sheet}>
          <TouchableOpacity
            style={[styles.row, messagingDisabled && styles.rowDisabled]}
            onPress={handlePickImage}
            disabled={messagingDisabled}
          >
            <Ionicons name="image-outline" size={22} color={messagingDisabled ? colors.textSecondary : colors.accent} />
            <Text style={[styles.rowText, messagingDisabled && styles.rowTextDisabled]}>Foto</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.row, messagingDisabled && styles.rowDisabled]}
            onPress={handlePickFile}
            disabled={messagingDisabled}
          >
            <Ionicons name="document-outline" size={22} color={messagingDisabled ? colors.textSecondary : colors.accent} />
            <Text style={[styles.rowText, messagingDisabled && styles.rowTextDisabled]}>Arquivo</Text>
          </TouchableOpacity>

          {isClient && (
            <TouchableOpacity
              style={[styles.row, briefingDisabled && styles.rowDisabled]}
              onPress={() => { onClose(); onOpenBriefing(); }}
              disabled={briefingDisabled}
            >
              <Ionicons name="document-text-outline" size={22} color={briefingDisabled ? colors.textSecondary : colors.accent} />
              <View>
                <Text style={[styles.rowText, briefingDisabled && styles.rowTextDisabled]}>Enviar briefing</Text>
                {briefingDisabled && (
                  <Text style={styles.rowHint}>Já existe um briefing pendente</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.lightBg, borderTopLeftRadius: radius.section, borderTopRightRadius: radius.section,
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.xs,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  rowDisabled: { opacity: 0.5 },
  rowText: { color: colors.white, fontSize: fontSize.md, fontWeight: 'bold' },
  rowTextDisabled: { color: colors.textSecondary },
  rowHint: { color: colors.textSecondary, fontSize: fontSize.xs },
});
