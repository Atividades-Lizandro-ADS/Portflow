import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Avatar from './Avatar';
import { colors, fontSize, spacing } from '../theme';

export default function AuthorCard({ profile, onPress, size = 44 }) {
  const router = useRouter();
  const handlePress = onPress ?? (() => router.push(`/profile/${profile?.id}`));

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.75}>
      <Avatar uri={profile?.user_picture} size={size} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {profile?.first_name || profile?.username}
        </Text>
        <Text style={styles.username} numberOfLines={1}>@{profile?.username}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  info: { flex: 1, justifyContent: 'center' },
  name: { color: colors.white, fontSize: fontSize.md, fontWeight: 'bold' },
  username: { color: colors.accent, fontSize: fontSize.sm, marginTop: 2 },
});
