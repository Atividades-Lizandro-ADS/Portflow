import { useState } from 'react';
import { View, Image, TouchableOpacity, useWindowDimensions } from 'react-native';
import FullscreenImageModal from './FullscreenImageModal';

const GRID_FRACTION = { '1/3': 1 / 3, '2/3': 2 / 3, '3/3': 1 };
const LIST_GAP = 3;

const imageUri = (img) => img.post_img ?? img.uri;

export default function PostGallery({ images, displayType }) {
  const { width: screenWidth } = useWindowDimensions();
  const [fullscreenIndex, setFullscreenIndex] = useState(null);

  if (!images?.length) return null;

  return (
    <>
      <View>
        {displayType === 'album' ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {images.map((img, idx) => {
              const xFrac = GRID_FRACTION[img.cell_size_x] ?? 1 / 3;
              const yFrac = GRID_FRACTION[img.cell_size_y] ?? 1 / 3;
              return (
                <TouchableOpacity key={img.id ?? idx} onPress={() => setFullscreenIndex(idx)} activeOpacity={0.85}>
                  <Image
                    source={{ uri: imageUri(img) }}
                    style={{ width: screenWidth * xFrac, height: screenWidth * yFrac }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          images.map((img, idx) => (
            <TouchableOpacity
              key={img.id ?? idx}
              onPress={() => setFullscreenIndex(idx)}
              activeOpacity={0.85}
              style={{ marginBottom: idx < images.length - 1 ? LIST_GAP : 0 }}
            >
              <Image
                source={{ uri: imageUri(img) }}
                style={{ width: screenWidth, height: screenWidth * 0.75 }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))
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
