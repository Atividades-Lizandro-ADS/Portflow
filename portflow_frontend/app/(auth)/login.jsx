import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { colors, fontSize, spacing, radius } from '../../src/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Preencha usuário/e-mail e senha.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      router.replace('/(tabs)/feed');
    } catch {
      setError('Usuário ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>Portflow</Text>
        <Text style={styles.subtitle}>Entre na sua conta</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Usuário ou e-mail"
            placeholderTextColor={colors.inputBorder}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor={colors.inputBorder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
            {loading
              ? <ActivityIndicator color={colors.darkBg} />
              : <Text style={styles.btnText}>Entrar</Text>}
          </TouchableOpacity>

          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Não tem conta? <Text style={styles.linkAccent}>Cadastre-se</Text></Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.darkBg },
  inner: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.accent,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  form: { gap: spacing.md },
  input: {
    backgroundColor: colors.formBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.input,
    color: colors.white,
    fontSize: fontSize.md,
    padding: spacing.md,
  },
  error: { color: colors.danger, fontSize: fontSize.sm, textAlign: 'center' },
  btn: {
    backgroundColor: colors.accent,
    borderRadius: radius.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  btnText: { color: colors.darkBg, fontWeight: 'bold', fontSize: fontSize.md },
  link: { color: colors.textSecondary, textAlign: 'center', fontSize: fontSize.sm },
  linkAccent: { color: colors.accent, fontWeight: 'bold' },
});
