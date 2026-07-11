import { useEffect, useState } from 'react';
import {
  View, Text, Image, TextInput, TouchableOpacity, ScrollView,
  Modal, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { createConversation, sendChatMessage } from '../../api/conversations';
import { NEGOTIATION_LABELS, formatTierPrice } from '../../utils/tier';
import { colors, fontSize, spacing, radius } from '../../theme';

export default function TierDetailModal({ visible, tier, onClose }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (visible) setMessage('');
  }, [visible]);

  if (!tier) return null;

  const handleStartNegotiation = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      const { data: conversation } = await createConversation(tier.id);
      await sendChatMessage(conversation.id, message.trim());
      Alert.alert('Mensagem enviada!', 'O artista vai receber sua mensagem e pode te responder em breve.');
      onClose();
    } catch (err) {
      const data = err?.response?.data;
      const msg = Array.isArray(data) ? data[0] : (data?.detail ?? 'Não foi possível iniciar a negociação.');
      Alert.alert('Erro', msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
          {tier.thumb ? (
            <Image source={{ uri: tier.thumb }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]} />
          )}

          <View style={styles.content}>
            <Text style={styles.name}>{tier.name}</Text>
            <Text style={styles.description}>{tier.description}</Text>

            <View style={styles.priceRow}>
              <Text style={styles.price}>{formatTierPrice(tier.price)}</Text>
              {tier.negotiable && (
                <Text style={styles.negotiable}>
                  É negociável · {NEGOTIATION_LABELS[tier.negotiation_direction] ?? ''}
                </Text>
              )}
            </View>

            {user && user.profile_id !== tier.profile && (
              <View style={styles.negotiateBox}>
                <Text style={styles.negotiateMessage}>
                  Se interessou por essa tier? Negocie com o artista
                </Text>
                <TextInput
                  style={styles.input}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Escreva sua mensagem..."
                  placeholderTextColor={colors.inputBorder}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.negotiateBtn, (!message.trim() || sending) && styles.negotiateBtnDisabled]}
                  onPress={handleStartNegotiation}
                  disabled={!message.trim() || sending}
                >
                  {sending
                    ? <ActivityIndicator color={colors.darkBg} />
                    : <Text style={styles.negotiateBtnText}>Iniciar negociação</Text>}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        <TouchableOpacity style={[styles.closeBtn, { top: insets.top + spacing.sm }]} onPress={onClose}>
          <Ionicons name="close" size={26} color={colors.white} />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.darkBg },
  image: { width: '100%', height: 280, maxHeight: 800 },
  imagePlaceholder: { backgroundColor: colors.headerBg },
  closeBtn: {
    position: 'absolute', right: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 20, padding: spacing.sm,
  },
  content: { padding: spacing.lg, gap: spacing.md },
  name: { color: colors.white, fontSize: fontSize.xxl, fontWeight: 'bold', textAlign: 'center' },
  description: { color: colors.textSecondary, fontSize: fontSize.md, lineHeight: 22 },
  priceRow: {
    flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: spacing.sm,
    paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.headerBg,
  },
  price: { color: colors.accent, fontSize: fontSize.xl, fontWeight: 'bold' },
  negotiable: { color: colors.textSecondary, fontSize: fontSize.sm },
  negotiateBox: {
    marginTop: spacing.lg, gap: spacing.sm,
    backgroundColor: colors.lightBg, borderRadius: radius.card, padding: spacing.lg,
  },
  negotiateMessage: { color: colors.white, fontSize: fontSize.md, fontWeight: 'bold' },
  input: {
    backgroundColor: colors.formBg, borderWidth: 1, borderColor: colors.inputBorder,
    borderRadius: radius.input, color: colors.white, fontSize: fontSize.md,
    padding: spacing.md, minHeight: 80, textAlignVertical: 'top',
  },
  negotiateBtn: {
    backgroundColor: colors.accent, borderRadius: radius.button,
    paddingVertical: spacing.md, alignItems: 'center',
  },
  negotiateBtnDisabled: { opacity: 0.5 },
  negotiateBtnText: { color: colors.darkBg, fontSize: fontSize.sm, fontWeight: 'bold' },
});
