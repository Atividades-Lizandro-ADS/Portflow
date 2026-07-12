import { useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../src/components/ScreenHeader';
import Avatar from '../../src/components/Avatar';
import ChatBubble from '../../src/components/molecules/ChatBubble';
import { useAuth } from '../../src/context/AuthContext';
import { getConversation, getChatMessages, sendChatMessage } from '../../src/api/conversations';
import { colors, fontSize, spacing, radius } from '../../src/theme';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const scrollRef = useRef(null);

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      Promise.all([getConversation(id), getChatMessages(id)])
        .then(([convRes, msgRes]) => {
          setConversation(convRes.data);
          setMessages(msgRes.data.results ?? msgRes.data);
        })
        .finally(() => setLoading(false));
    }, [id])
  );

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const { data } = await sendChatMessage(id, text.trim());
      setMessages((prev) => [...prev, data]);
      setText('');
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.accent} size="large" /></View>;
  }

  if (!conversation) {
    return <View style={styles.center}><Text style={styles.errorText}>Conversa não encontrada.</Text></View>;
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader onBack={() => router.back()}>
        <View style={styles.headerContent}>
          <Avatar uri={conversation.other_profile.user_picture} size={36} />
          <View style={styles.headerInfo}>
            <Text style={styles.headerName} numberOfLines={1}>
              {conversation.other_profile.first_name || conversation.other_profile.username}
            </Text>
            <Text style={styles.headerTier} numberOfLines={1}>{conversation.tier_detail.name}</Text>
          </View>
        </View>
      </ScreenHeader>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.messages}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        {messages.map((m) => (
          <ChatBubble key={m.id} message={m} isMine={m.sender === user?.profile_id} />
        ))}
        {!messages.length && (
          <Text style={styles.empty}>Nenhuma mensagem ainda. Diga oi!</Text>
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Escreva uma mensagem..."
          placeholderTextColor={colors.inputBorder}
          multiline
        />
        <TouchableOpacity onPress={handleSend} disabled={sending || !text.trim()}>
          {sending
            ? <ActivityIndicator size={22} color={colors.accent} />
            : <Ionicons name="send" size={22} color={text.trim() ? colors.accent : colors.inputBorder} />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.darkBg },
  center: { flex: 1, backgroundColor: colors.darkBg, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: colors.textSecondary, fontSize: fontSize.md },
  headerContent: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: spacing.sm },
  headerInfo: { flex: 1, gap: 2 },
  headerName: { color: colors.white, fontSize: fontSize.md, fontWeight: 'bold' },
  headerTier: { color: colors.textSecondary, fontSize: fontSize.xs },
  messages: { paddingVertical: spacing.md, flexGrow: 1 },
  empty: { color: colors.textSecondary, fontSize: fontSize.sm, textAlign: 'center', marginTop: spacing.xl },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm,
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.section,
    backgroundColor: colors.formBg,
  },
  input: { flex: 1, color: colors.white, fontSize: fontSize.md, maxHeight: 100, padding: spacing.sm },
});
