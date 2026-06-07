import { useState } from 'react';
import { View, Image, Text, TouchableOpacity, useWindowDimensions, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import FullscreenImageModal from './FullscreenImageModal';
import { useAuth } from '../context/AuthContext';
import { colors, fontSize, spacing } from '../theme';

const GRID_FRACTION = { '1/3': 1 / 3, '2/3': 2 / 3, '3/3': 1 };
const LIST_GAP = 3;

const imageUri = (img) => img.post_img ?? img.uri;

function MatureOverlay({ revealed, isLoggedIn, onReveal, onLogin }) {
  if (revealed) return null;
  return (
    <TouchableOpacity
      style={styles.matureOverlay}
      onPress={isLoggedIn ? onReveal : onLogin}
      activeOpacity={0.85}
    >
      <Text style={styles.matureOverlayText}>
        {isLoggedIn
          ? 'Conteúdo sensível\nToque para revelar'
          : 'Conteúdo sensível\nFaça login para visualizar'}
      </Text>
    </TouchableOpacity>
  );
}

export default function PostGallery({ images, displayType, postIsMature = false }) {
  const { width: screenWidth } = useWindowDimensions();
  const [fullscreenIndex, setFullscreenIndex] = useState(null);
  const [revealed, setRevealed] = useState(new Set());
  const { user } = useAuth();
  const router = useRouter();

  if (!images?.length) return null;

  const isLoggedIn = !!user;

  const revealImage = (key) => setRevealed((prev) => new Set([...prev, key]));

  const handleLogin = () => {
    Alert.alert(
      'Login necessário',
      'Faça login para visualizar conteúdo maduro.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Fazer login', onPress: () => router.push('/(auth)/login') },
      ]
    );
  };

  const isImageMature = (img, idx) => {
    if (postIsMature) return false;
    return img.is_mature === true;
  };

  const isRevealed = (img, idx) => revealed.has(img.id ?? idx);

  return (
    <>
      <View>
        {displayType === 'album' ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {images.map((img, idx) => {
              const xFrac = GRID_FRACTION[img.cell_size_x] ?? 1 / 3;
              const yFrac = GRID_FRACTION[img.cell_size_y] ?? 1 / 3;
              const mature = isImageMature(img, idx);
              const imgRevealed = isRevealed(img, idx);
              return (
                <TouchableOpacity
                  key={img.id ?? idx}
                  onPress={() => !mature || imgRevealed ? setFullscreenIndex(idx) : null}
                  activeOpacity={0.85}
                  style={{ position: 'relative' }}
                >
                  <Image
                    source={{ uri: imageUri(img) }}
                    style={{ width: screenWidth * xFrac, height: screenWidth * yFrac }}
                    resizeMode="cover"
                    blurRadius={mature && !imgRevealed ? 20 : 0}
                  />
                  {mature && (
                    <MatureOverlay
                      revealed={imgRevealed}
                      isLoggedIn={isLoggedIn}
                      onReveal={() => revealImage(img.id ?? idx)}
                      onLogin={handleLogin}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          images.map((img, idx) => {
            const mature = isImageMature(img, idx);
            const imgRevealed = isRevealed(img, idx);
            return (
              <TouchableOpacity
                key={img.id ?? idx}
                onPress={() => !mature || imgRevealed ? setFullscreenIndex(idx) : null}
                activeOpacity={0.85}
                style={[{ marginBottom: idx < images.length - 1 ? LIST_GAP : 0, position: 'relative' }]}
              >
                <Image
                  source={{ uri: imageUri(img) }}
                  style={{ width: screenWidth, height: screenWidth * 0.75 }}
                  resizeMode="cover"
                  blurRadius={mature && !imgRevealed ? 20 : 0}
                />
                {mature && (
                  <MatureOverlay
                    revealed={imgRevealed}
                    isLoggedIn={isLoggedIn}
                    onReveal={() => revealImage(img.id ?? idx)}
                    onLogin={handleLogin}
                  />
                )}
              </TouchableOpacity>
            );
          })
        )}
      </View>
      <FullscreenImageModal
        images={images}
        index={fullscreenIndex}
        onClose={() => setFullscreenIndex(null)}
        onNavigate={setFullscreenIndex}
      />
    </>
  );
}

const styles = StyleSheet.create({
  matureOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  matureOverlayText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 22,
  },
});
