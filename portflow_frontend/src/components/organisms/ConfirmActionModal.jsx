import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, radius } from '../../theme';

export default function ConfirmActionModal({
  visible, title, message, confirmLabel, cancelLabel = 'Cancelar',
  loading, onCancel, onConfirm, tone = 'accent', children,
}) {
  const confirmColor = tone === 'danger' ? colors.danger : colors.accent;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onCancel} activeOpacity={1} disabled={loading} />
        <View style={styles.card}>
          <Ionicons
            name={tone === 'danger' ? 'warning' : 'help-circle'}
            size={28}
            color={confirmColor}
            style={styles.icon}
          />
          <Text style={styles.title}>{title}</Text>
          {!!message && <Text style={styles.message}>{message}</Text>}
          {children}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} disabled={loading}>
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: confirmColor }]}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={colors.darkBg} />
                : <Text style={styles.confirmBtnText}>{confirmLabel}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  card: { backgroundColor: colors.lightBg, borderRadius: radius.section, padding: spacing.xl, gap: spacing.md, width: '100%' },
  icon: { alignSelf: 'center' },
  title: { color: colors.white, fontSize: fontSize.lg, fontWeight: 'bold', textAlign: 'center' },
  message: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  cancelBtn: {
    flex: 1, paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderRadius: radius.button,
    borderWidth: 1, borderColor: colors.inputBorder, alignItems: 'center', justifyContent: 'center',
  },
  cancelText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: 'bold' },
  confirmBtn: { flex: 1, paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
  confirmBtnText: { color: colors.darkBg, fontSize: fontSize.sm, fontWeight: 'bold' },
});
