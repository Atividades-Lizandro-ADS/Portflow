import { Modal, View, Image, TouchableOpacity, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontSize, spacing } from '../theme';

export default function FullscreenImageModal({ images, index, onClose, onNavigate }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  if (index === null || !images[index]) return null;

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <View style={[styles.bg, { width, height }]}>
        <Image
          source={{ uri: images[index].post_img }}
          style={{ width, flex: 1 }}
          resizeMode="contain"
        />
        <TouchableOpacity style={[styles.close, { top: insets.top + spacing.sm }]} onPress={onClose}>
          <Ionicons name="close" size={22} color={colors.white} />
        </TouchableOpacity>
        {index > 0 && (
          <TouchableOpacity style={styles.arrowLeft} onPress={() => onNavigate(index - 1)}>
            <Ionicons name="chevron-back" size={32} color={colors.white} />
          </TouchableOpacity>
        )}
        {index < images.length - 1 && (
          <TouchableOpacity style={styles.arrowRight} onPress={() => onNavigate(index + 1)}>
            <Ionicons name="chevron-forward" size={32} color={colors.white} />
          </TouchableOpacity>
        )}
        <View style={[styles.counter, { bottom: insets.bottom + spacing.md }]}>
          <Text style={styles.counterText}>{index + 1} / {images.length}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: 'rgba(0,0,0,0.97)', justifyContent: 'center' },
  close: {
    position: 'absolute', right: spacing.md, zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: spacing.sm,
  },
  arrowLeft: {
    position: 'absolute', left: spacing.md, top: '50%',
    backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: spacing.sm,
  },
  arrowRight: {
    position: 'absolute', right: spacing.md, top: '50%',
    backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: spacing.sm,
  },
  counter: {
    position: 'absolute', left: 0, right: 0, alignItems: 'center',
  },
  counterText: { color: 'rgba(255,255,255,0.7)', fontSize: fontSize.sm },
});
