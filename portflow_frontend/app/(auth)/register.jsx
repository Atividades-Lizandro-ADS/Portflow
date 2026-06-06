import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Link } from 'expo-router';
import { register, checkUsername } from '../../src/api/auth';
import { colors, fontSize, spacing, radius } from '../../src/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState(null); // null | 'checking' | 'available' | 'taken'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const handleUsernameChange = (text) => {
    const cleaned = text.replace(' ', '_');
    setUsername(cleaned);
    setUsernameStatus(null);

    clearTimeout(debounceRef.current);
    if (cleaned.length < 3) return;

    setUsernameStatus('checking');
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await checkUsername(cleaned);
        setUsernameStatus(data.available ? 'available' : 'taken');
      } catch {
        setUsernameStatus(null);
      }
    }, 500);
  };

  const handleRegister = async () => {
    if (!firstName || !username || !email || !password || !password2) {
      setError('Todos os campos são obrigatórios.');
      return;
    }
    if (usernameStatus === 'taken') {
      setError('Este username já está em uso.');
      return;
    }
    if (password !== password2) {
      setError('As senhas não coincidem.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register({ firstName, username, email, password, password2 });
      router.replace('/(auth)/login');
    } catch (e) {
      const detail = e.response?.data;
      if (detail && typeof detail === 'object') {
        const first = Object.values(detail)[0];
        setError(Array.isArray(first) ? first[0] : String(first));
      } else {
        setError('Erro ao criar conta.');
      }
    } finally {
      setLoading(false);
    }
  };

  const usernameIcon = () => {
    if (usernameStatus === 'checking') return <ActivityIndicator size={16} color={colors.textSecondary} />;
    if (usernameStatus === 'available') return <Ionicons name="checkmark-circle" size={18} color={colors.dragActive} />;
    if (usernameStatus === 'taken') return <Ionicons name="close-circle" size={18} color={colors.danger} />;
    return null;
  };

  const usernameHint = () => {
    if (usernameStatus === 'available') return { text: 'Username disponível', color: colors.dragActive };
    if (usernameStatus === 'taken') return { text: 'Username já em uso', color: colors.danger };
    return null;
  };

  const hint = usernameHint();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>Portflow</Text>
        <Text style={styles.subtitle}>Crie sua conta</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            placeholderTextColor={colors.inputBorder}
            value={firstName}
            onChangeText={setFirstName}
            autoCorrect={false}
          />

          <View>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                placeholder="Usuário (sem espaços)"
                placeholderTextColor={colors.inputBorder}
                value={username}
                onChangeText={handleUsernameChange}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.statusIcon}>{usernameIcon()}</View>
            </View>
            {hint && <Text style={[styles.hint, { color: hint.color }]}>{hint.text}</Text>}
          </View>

          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor={colors.inputBorder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor={colors.inputBorder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Confirmar senha"
            placeholderTextColor={colors.inputBorder}
            value={password2}
            onChangeText={setPassword2}
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
            {loading
              ? <ActivityIndicator color={colors.darkBg} />
              : <Text style={styles.btnText}>Cadastrar</Text>}
          </TouchableOpacity>

          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Já tem conta? <Text style={styles.linkAccent}>Entrar</Text></Text>
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputFlex: { flex: 1 },
  statusIcon: {
    position: 'absolute',
    right: spacing.md,
  },
  hint: { fontSize: fontSize.xs, marginTop: spacing.xs, paddingHorizontal: spacing.xs },
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
