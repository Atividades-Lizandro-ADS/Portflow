import { useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../src/components/ScreenHeader';
import Avatar from '../../src/components/Avatar';
import ChatBubble from '../../src/components/molecules/ChatBubble';
import { PendingAttachmentChip } from '../../src/components/molecules/ChatAttachmentPreview';
import AttachMenuModal from '../../src/components/molecules/AttachMenuModal';
import BriefingFormModal from '../../src/components/organisms/BriefingFormModal';
import BriefingDetailModal from '../../src/components/organisms/BriefingDetailModal';
import { useAuth } from '../../src/context/AuthContext';
import { getConversation, getChatMessages, sendChatMessage } from '../../src/api/conversations';
import { useChatStream } from '../../src/hooks/useChatStream';
import { colors, fontSize, spacing, radius } from '../../src/theme';

const extractErrorMessage = (err) => {
  const data = err?.response?.data;
  if (data && typeof data === 'object') {
    const first = Object.values(data)[0];
    return Array.isArray(first) ? first[0] : String(first);
  }
  return 'Não foi possível enviar a mensagem.';
};

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
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [briefingFormVisible, setBriefingFormVisible] = useState(false);
  const [activeBriefing, setActiveBriefing] = useState(null);

  const refresh = useCallback(() => {
    return Promise.all([getConversation(id), getChatMessages(id)]).then(([convRes, msgRes]) => {
      setConversation(convRes.data);
      setMessages(msgRes.data.results ?? msgRes.data);
    });
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      refresh().finally(() => setLoading(false));
    }, [refresh])
  );

  useChatStream(id, () => {
    refresh().then(() => {
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    });
  });

  const isClient = conversation && conversation.client === user?.profile_id;
  const isArtist = conversation && conversation.artist === user?.profile_id;
  const canSendMessage = conversation?.can_send_message ?? true;
  const hasPendingBriefing = messages.some((m) => m.related_briefing_detail?.status === 'pending');

  const handleSend = async () => {
    if (!text.trim() && !pendingAttachments.length) return;
    setSending(true);
    try {
      const { data } = await sendChatMessage(id, text.trim(), pendingAttachments);
      setMessages((prev) => [...prev, data]);
      setText('');
      setPendingAttachments([]);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    } catch (err) {
      Alert.alert('Erro', extractErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const handleRemovePending = (index) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBriefingCreated = () => {
    refresh();
  };

  const handleBriefingResponded = () => {
    refresh();
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
            <Text style={styles.headerTier} numberOfLines={1}>
              {conversation.tier_detail.name}
              {!conversation.tier_detail.is_active && (
                <Text style={styles.headerTierRemoved}> (tier removido)</Text>
              )}
            </Text>
          </View>
        </View>
      </ScreenHeader>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.messages}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        {messages.map((m) => (
          <ChatBubble
            key={m.id}
            message={m}
            isMine={m.sender === user?.profile_id}
            onOpenBriefing={setActiveBriefing}
          />
        ))}
        {!messages.length && (
          <Text style={styles.empty}>Nenhuma mensagem ainda. Diga oi!</Text>
        )}
      </ScrollView>

      {!canSendMessage && (
        <Text style={styles.blockedBanner}>
          {isArtist
            ? 'Comissões fechadas. Aguardando um briefing do cliente.'
            : 'Este artista está com comissões fechadas — envie um briefing para negociar.'}
        </Text>
      )}

      {!!pendingAttachments.length && (
        <ScrollView horizontal contentContainerStyle={styles.pendingRow} showsHorizontalScrollIndicator={false}>
          {pendingAttachments.map((file, index) => (
            <PendingAttachmentChip key={`${file.uri}-${index}`} attachment={file} onRemove={() => handleRemovePending(index)} />
          ))}
        </ScrollView>
      )}

      <View style={styles.inputRow}>
        <TouchableOpacity onPress={() => setShowAttachMenu(true)} disabled={!isClient && !canSendMessage}>
          <Ionicons
            name="add-circle-outline"
            size={26}
            color={(!isClient && !canSendMessage) ? colors.inputBorder : colors.accent}
          />
        </TouchableOpacity>

        {canSendMessage && (
          <>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Escreva uma mensagem..."
              placeholderTextColor={colors.inputBorder}
              multiline
            />
            <TouchableOpacity onPress={handleSend} disabled={sending || (!text.trim() && !pendingAttachments.length)}>
              {sending
                ? <ActivityIndicator size={22} color={colors.accent} />
                : <Ionicons name="send" size={22} color={(text.trim() || pendingAttachments.length) ? colors.accent : colors.inputBorder} />}
            </TouchableOpacity>
          </>
        )}
      </View>

      <AttachMenuModal
        visible={showAttachMenu}
        onClose={() => setShowAttachMenu(false)}
        onPickImage={(file) => setPendingAttachments((prev) => [...prev, file])}
        onPickFile={(file) => setPendingAttachments((prev) => [...prev, file])}
        onOpenBriefing={() => setBriefingFormVisible(true)}
        isClient={isClient}
        messagingDisabled={!canSendMessage}
        briefingDisabled={hasPendingBriefing}
      />

      <BriefingFormModal
        visible={briefingFormVisible}
        conversationId={conversation.id}
        tier={conversation.tier_detail}
        onClose={() => setBriefingFormVisible(false)}
        onCreated={handleBriefingCreated}
      />

      <BriefingDetailModal
        visible={!!activeBriefing}
        briefing={activeBriefing}
        conversation={conversation}
        user={user}
        onClose={() => setActiveBriefing(null)}
        onResponded={handleBriefingResponded}
      />
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
  headerTierRemoved: { color: colors.danger },
  messages: { paddingVertical: spacing.md, flexGrow: 1 },
  empty: { color: colors.textSecondary, fontSize: fontSize.sm, textAlign: 'center', marginTop: spacing.xl },
  blockedBanner: {
    color: colors.textSecondary, fontSize: fontSize.xs, textAlign: 'center',
    marginHorizontal: spacing.lg, marginBottom: spacing.sm,
  },
  pendingRow: { gap: spacing.sm, marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm,
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.section,
    backgroundColor: colors.formBg,
  },
  input: { flex: 1, color: colors.white, fontSize: fontSize.md, maxHeight: 100, padding: spacing.sm },
});
