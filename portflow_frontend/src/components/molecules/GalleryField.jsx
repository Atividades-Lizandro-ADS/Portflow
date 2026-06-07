import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import SectionLabel from '../atoms/SectionLabel';
import GalleryImageItem from './GalleryImageItem';
import { colors, fontSize, spacing } from '../../theme';

export default function GalleryField({
  images,
  onAdd,
  onUpdate,
  onRemove,
  showCellSizes,
  existingImages = [],
  onUpdateExisting,
  onRemoveExisting,
}) {
  const handleAdd = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: true,
    });
    if (!result.canceled) {
      onAdd(result.assets.map((a) => ({
        uri: a.uri,
        fileName: a.fileName ?? 'img.jpg',
        mimeType: a.mimeType ?? 'image/jpeg',
        caption: '',
        acessibilityCaption: '',
        cell_size_x: '1/3',
        cell_size_y: '1/3',
      })));
    }
  };

  const isEmpty = existingImages.length === 0 && images.length === 0;

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <SectionLabel>Imagens da galeria</SectionLabel>
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Ionicons name="add" size={18} color={colors.accent} />
          <Text style={styles.addText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      {existingImages.map((img, idx) => (
        <GalleryImageItem
          key={`existing-${img.id}`}
          item={img}
          index={idx}
          onUpdate={onUpdateExisting}
          onRemove={onRemoveExisting}
          showCellSizes={showCellSizes}
        />
      ))}

      {images.map((img, idx) => (
        <GalleryImageItem
          key={`new-${idx}`}
          item={img}
          index={idx}
          onUpdate={onUpdate}
          onRemove={onRemove}
          showCellSizes={showCellSizes}
        />
      ))}

      {isEmpty && (
        <Text style={styles.empty}>Nenhuma imagem adicionada</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  addText: { color: colors.accent, fontSize: fontSize.sm, fontWeight: 'bold' },
  empty: { color: colors.inputBorder, fontSize: fontSize.sm, textAlign: 'center', paddingVertical: spacing.sm },
});
