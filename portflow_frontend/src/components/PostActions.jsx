import { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { toggleLike, toggleFavorite } from '../api/posts';
import { colors, fontSize, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';

export default function PostActions({ postId, initialLiked = false, initialFavorited = false }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);

  const handleLike = async () => {
    if (!user || loadingLike) return;
    setLiked((prev) => !prev);
    setLoadingLike(true);
    try {
      await toggleLike(postId);
    } catch {
      setLiked((prev) => !prev);
    } finally {
      setLoadingLike(false);
    }
  };

  const handleFavorite = async () => {
    if (!user || loadingFav) return;
    setFavorited((prev) => !prev);
    setLoadingFav(true);
    try {
      await toggleFavorite(postId);
    } catch {
      setFavorited((prev) => !prev);
    } finally {
      setLoadingFav(false);
    }
  };

  if (!user) return null;

  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.btn} onPress={handleLike} activeOpacity={0.7}>
        {loadingLike ? (
          <ActivityIndicator size={20} color={colors.accent} />
        ) : (
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={24}
            color={liked ? colors.accent : colors.white}
          />
        )}
        <Text style={[styles.label, liked && styles.accentLabel]}>
          {liked ? 'Curtido' : 'Curtir'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={handleFavorite} activeOpacity={0.7}>
        {loadingFav ? (
          <ActivityIndicator size={20} color={colors.accent} />
        ) : (
          <Ionicons
            name={favorited ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={favorited ? colors.accent : colors.white}
          />
        )}
        <Text style={[styles.label, favorited && styles.accentLabel]}>
          {favorited ? 'Salvo' : 'Salvar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  label: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: 'bold',
  },
  accentLabel: {
    color: colors.accent,
  },
});
