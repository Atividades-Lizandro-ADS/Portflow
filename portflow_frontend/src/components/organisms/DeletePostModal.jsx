import { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NoPasteTextInput from '../atoms/NoPasteTextInput';
import { colors, fontSize, spacing, radius } from '../../theme';

export default function DeletePostModal({ visible, postTitle, loading, onCancel, onConfirm }) {
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (visible) setConfirmText('');
  }, [visible]);

  const canConfirm = confirmText === postTitle;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onCancel} activeOpacity={1} />
        <View style={styles.card}>
          <Ionicons name="warning" size={28} color={colors.danger} style={styles.icon} />
          <Text style={styles.title}>Excluir post</Text>
          <Text style={styles.message}>
            Esta ação não pode ser desfeita. Todos os likes, comentários e imagens ligados a este post serão excluídos permanentemente.
          </Text>
          <Text style={styles.message}>
            Para confirmar, digite <Text style={styles.postName}>{postTitle}</Text> abaixo:
          </Text>
          <NoPasteTextInput
            value={confirmText}
            onChangeText={setConfirmText}
            placeholder={postTitle}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} disabled={loading}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, !canConfirm && styles.confirmBtnDisabled]}
              onPress={onConfirm}
              disabled={!canConfirm || loading}
            >
              {loading
                ? <ActivityIndicator color={colors.white} />
                : <Text style={styles.confirmBtnText}>Eu entendo, apagar post</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.lightBg,
    borderRadius: radius.section,
    padding: spacing.xl,
    gap: spacing.md,
    width: '100%',
  },
  icon: { alignSelf: 'center' },
  title: { color: colors.white, fontSize: fontSize.lg, fontWeight: 'bold', textAlign: 'center' },
  message: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 20 },
  postName: { color: colors.danger, fontWeight: 'bold' },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  cancelBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: 'bold', textAlign: 'center' },
  confirmBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.button,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDisabled: { backgroundColor: colors.modal, opacity: 0.5 },
  confirmBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: 'bold', textAlign: 'center' },
});
