import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fontSize, spacing, radius } from '../../theme';

export default function MatureContentGate({ isLoggedIn, onContinue, onCancel, onLogin }) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>⚠️</Text>
        <Text style={styles.title}>Conteúdo maduro</Text>
        <Text style={styles.message}>
          {isLoggedIn
            ? 'O post a seguir tem conteúdo marcado como maduro. Deseja prosseguir?'
            : 'O post a seguir tem conteúdo marcado como maduro. Você precisa efetuar login caso deseje acessar.'}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
          {isLoggedIn ? (
            <TouchableOpacity style={styles.confirmBtn} onPress={onContinue}>
              <Text style={styles.confirmText}>Prosseguir</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.confirmBtn} onPress={onLogin}>
              <Text style={styles.confirmText}>Fazer login</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.lightBg,
    borderRadius: radius.section,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
  },
  icon: { fontSize: 40 },
  title: { color: colors.white, fontSize: fontSize.lg, fontWeight: 'bold', textAlign: 'center' },
  message: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    alignItems: 'center',
  },
  cancelText: { color: colors.textSecondary, fontSize: fontSize.md, fontWeight: 'bold' },
  confirmBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  confirmText: { color: colors.darkBg, fontSize: fontSize.md, fontWeight: 'bold' },
});
