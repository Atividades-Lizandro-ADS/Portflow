import { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import FullscreenImageModal from '../FullscreenImageModal';
import { isImageFilename, formatFileSize } from '../../utils/files';
import { colors, fontSize, spacing, radius } from '../../theme';

export default function ChatAttachmentPreview({ attachment, isMine }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const isImage = isImageFilename(attachment.name);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const dest = `${FileSystem.cacheDirectory}${attachment.name}`;
      const { uri } = await FileSystem.downloadAsync(attachment.uri, dest);
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Download concluído', `Arquivo salvo em ${uri}`);
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível baixar o arquivo.');
    } finally {
      setDownloading(false);
    }
  };

  if (isImage) {
    return (
      <>
        <TouchableOpacity onPress={() => setPreviewOpen(true)} activeOpacity={0.85}>
          <Image source={{ uri: attachment.uri }} style={styles.image} resizeMode="cover" />
        </TouchableOpacity>
        {previewOpen && (
          <FullscreenImageModal
            images={[{ uri: attachment.uri }]}
            index={0}
            onClose={() => setPreviewOpen(false)}
            onNavigate={() => {}}
          />
        )}
      </>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.fileRow, isMine ? styles.fileRowMine : styles.fileRowOther]}
      onPress={handleDownload}
      disabled={downloading}
    >
      <Ionicons name="document-attach" size={20} color={isMine ? colors.darkBg : colors.white} />
      <View style={styles.fileInfo}>
        <Text style={[styles.fileName, isMine ? styles.textMine : styles.textOther]} numberOfLines={1}>
          {attachment.name}
        </Text>
        <Text style={[styles.fileSize, isMine ? styles.textMine : styles.textOther]}>
          {formatFileSize(attachment.size)}
        </Text>
      </View>
      {downloading
        ? <ActivityIndicator size={16} color={isMine ? colors.darkBg : colors.white} />
        : <Ionicons name="download-outline" size={18} color={isMine ? colors.darkBg : colors.white} />}
    </TouchableOpacity>
  );
}

export function PendingAttachmentChip({ attachment, onRemove }) {
  const isImage = isImageFilename(attachment.name);
  return (
    <View style={styles.chip}>
      {isImage
        ? <Image source={{ uri: attachment.uri }} style={styles.chipImage} resizeMode="cover" />
        : (
          <View style={styles.chipFileIcon}>
            <Ionicons name="document-attach" size={18} color={colors.white} />
          </View>
        )}
      <Text style={styles.chipName} numberOfLines={1}>{attachment.name}</Text>
      <TouchableOpacity style={styles.chipRemove} onPress={onRemove}>
        <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { width: 200, height: 200, borderRadius: radius.card, marginBottom: 2 },
  fileRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.sm,
    borderRadius: radius.input, minWidth: 180,
  },
  fileRowMine: { backgroundColor: 'rgba(0,0,0,0.08)' },
  fileRowOther: { backgroundColor: 'rgba(255,255,255,0.08)' },
  fileInfo: { flex: 1 },
  fileName: { fontSize: fontSize.sm, fontWeight: 'bold' },
  fileSize: { fontSize: fontSize.xs, opacity: 0.8 },
  textMine: { color: colors.darkBg },
  textOther: { color: colors.white },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.formBg, borderRadius: radius.pill,
    paddingVertical: spacing.xs, paddingHorizontal: spacing.sm,
    borderWidth: 1, borderColor: colors.inputBorder, maxWidth: 160,
  },
  chipImage: { width: 24, height: 24, borderRadius: radius.input },
  chipFileIcon: {
    width: 24, height: 24, borderRadius: radius.input,
    backgroundColor: colors.headerBg, alignItems: 'center', justifyContent: 'center',
  },
  chipName: { color: colors.white, fontSize: fontSize.xs, flexShrink: 1 },
  chipRemove: { marginLeft: 2 },
});
