import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from './Avatar';
import { deleteComment } from '../api/comments';
import { useAuth } from '../context/AuthContext';
import { colors, fontSize, spacing } from '../theme';

export default function CommentItem({ comment, onDeleted }) {
  const { user } = useAuth();
  const isOwner = user && comment.comment_owner?.id === user.id;

  const handleDelete = () => {
    Alert.alert('Deletar comentário', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: async () => {
          await deleteComment(comment.id);
          onDeleted?.(comment.id);
        },
      },
    ]);
  };

  return (
    <View style={styles.row}>
      <Avatar uri={comment.comment_owner?.profile_picture} size={36} />
      <View style={styles.body}>
        <Text style={styles.author}>{comment.comment_owner?.user?.username ?? 'Usuário'}</Text>
        <Text style={styles.content}>{comment.content}</Text>
      </View>
      {isOwner && (
        <TouchableOpacity onPress={handleDelete} hitSlop={8}>
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  body: {
    flex: 1,
  },
  author: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: 'bold',
  },
  content: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
});
