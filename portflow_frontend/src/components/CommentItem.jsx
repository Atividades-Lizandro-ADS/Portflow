import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from './Avatar';
import { deleteComment, updateComment } from '../api/comments';
import { useAuth } from '../context/AuthContext';
import { colors, fontSize, spacing, radius } from '../theme';

export default function CommentItem({ comment, onDeleted, onEdited }) {
  const { user } = useAuth();
  const isOwner = user && comment.comment_owner?.id === user.profile_id;
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState(comment.comment_text);
  const [saving, setSaving] = useState(false);

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

  const handleSave = async () => {
    if (!editText.trim()) return;
    setSaving(true);
    try {
      const { data } = await updateComment(comment.id, editText.trim());
      onEdited?.(data);
      setEditMode(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.row}>
      <Avatar uri={comment.comment_owner?.user_picture} size={36} />
      <View style={styles.body}>
        <Text style={styles.author}>{comment.comment_owner?.username ?? 'Usuário'}</Text>
        {editMode ? (
          <View>
            <TextInput
              style={styles.editInput}
              value={editText}
              onChangeText={setEditText}
              multiline
              autoFocus
            />
            <View style={styles.editActions}>
              <TouchableOpacity onPress={() => { setEditMode(false); setEditText(comment.comment_text); }}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} disabled={saving || !editText.trim()}>
                {saving
                  ? <ActivityIndicator size={14} color={colors.accent} />
                  : <Text style={[styles.saveText, !editText.trim() && styles.saveDisabled]}>Salvar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.content}>{comment.comment_text}</Text>
        )}
      </View>
      {isOwner && !editMode && (
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => setEditMode(true)} hitSlop={8}>
            <Ionicons name="pencil-outline" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} hitSlop={8}>
            <Ionicons name="trash-outline" size={16} color={colors.danger} />
          </TouchableOpacity>
        </View>
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
  body: { flex: 1 },
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
  editInput: {
    color: colors.white,
    fontSize: fontSize.xs,
    backgroundColor: colors.formBg,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
    minHeight: 50,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  cancelText: { color: colors.textSecondary, fontSize: fontSize.xs },
  saveText: { color: colors.accent, fontSize: fontSize.xs, fontWeight: 'bold' },
  saveDisabled: { opacity: 0.4 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: 2,
  },
});
