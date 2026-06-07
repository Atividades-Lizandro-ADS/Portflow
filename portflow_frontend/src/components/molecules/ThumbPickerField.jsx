import { View, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, radius } from '../../theme';

export default function ThumbPickerField({ thumbUri, onPick, showEditOverlay = false }) {
  const handlePress = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos acessar sua galeria.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets?.[0]) onPick(result.assets[0]);
  };

  return (
    <TouchableOpacity style={styles.picker} onPress={handlePress} activeOpacity={0.7}>
      {thumbUri ? (
        <>
          <Image source={{ uri: thumbUri }} style={styles.preview} />
          {showEditOverlay && (
            <View style={styles.overlay}>
              <Ionicons name="pencil" size={20} color={colors.white} />
            </View>
          )}
        </>
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="image-outline" size={40} color={colors.textSecondary} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  picker: { width: '100%', aspectRatio: 1, borderRadius: radius.card, overflow: 'hidden', backgroundColor: colors.lightBg },
  preview: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  overlay: {
    position: 'absolute', bottom: spacing.sm, right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: spacing.sm,
  },
});
