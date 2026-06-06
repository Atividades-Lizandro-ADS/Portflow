import { TouchableOpacity, Image, View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize } from '../theme';

const CARD_GAP = 8;
const CARD_SIZE = (Dimensions.get('window').width - CARD_GAP * 3) / 2;

export default function PostCard({ post }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/post/${post.id}`)}
      activeOpacity={0.85}
    >
      {post.post_thumb ? (
        <Image source={{ uri: post.post_thumb }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]} />
      )}
      <View style={styles.overlay}>
        <Text style={styles.title} numberOfLines={2}>
          {post.tittle}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.lightBg,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: colors.headerBg,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  title: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: 'bold',
  },
});
