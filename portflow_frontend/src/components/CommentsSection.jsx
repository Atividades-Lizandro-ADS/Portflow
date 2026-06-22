import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CommentItem from './CommentItem';
import { createComment } from '../api/comments';
import { useAuth } from '../context/AuthContext';
import { colors, fontSize, spacing, radius } from '../theme';

export default function CommentsSection({ postId, initialComments }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [comments, setComments] = useState(initialComments ?? []);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!text.trim() || !user) return;
    setSending(true);
    try {
      const { data } = await createComment(postId, text.trim());
      setComments((prev) => [data, ...prev]);
      setText('');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <View style={styles.list}>
        <Text style={styles.title}>Comentários</Text>
        {comments.map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            onDeleted={(cid) => setComments((prev) => prev.filter((x) => x.id !== cid))}
            onEdited={(updated) => setComments((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))}
          />
        ))}
        {comments.length === 0 && (
          <Text style={styles.empty}>Seja o primeiro a comentar.</Text>
        )}
      </View>
      {user && (
        <View style={[styles.inputRow, { marginBottom: spacing.xl + insets.bottom }]}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Adicionar comentário..."
            placeholderTextColor={colors.inputBorder}
            multiline
          />
          <TouchableOpacity onPress={handleSend} disabled={sending || !text.trim()}>
            {sending
              ? <ActivityIndicator size={22} color={colors.accent} />
              : <Ionicons name="send" size={22} color={text.trim() ? colors.accent : colors.inputBorder} />}
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.sm },
  title: { color: colors.white, fontSize: fontSize.lg, fontWeight: 'bold', marginBottom: spacing.sm },
  empty: { color: colors.textSecondary, fontSize: fontSize.sm },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm,
    marginHorizontal: spacing.lg, marginBottom: spacing.xl,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.section,
    backgroundColor: colors.formBg,
  },
  input: { flex: 1, color: colors.white, fontSize: fontSize.md, maxHeight: 100, padding: spacing.sm },
});
