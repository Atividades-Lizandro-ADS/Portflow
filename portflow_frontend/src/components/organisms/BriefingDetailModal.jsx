import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Modal, Alert, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ConfirmActionModal from './ConfirmActionModal';
import ChatAttachmentPreview from '../molecules/ChatAttachmentPreview';
import { acceptBriefing, declineBriefing } from '../../api/briefings';
import { formatTierPrice } from '../../utils/tier';
import { colors, fontSize, spacing, radius } from '../../theme';

const STATUS_LABELS = { pending: 'Pendente', accepted: 'Aceito', declined: 'Recusado' };
const STATUS_COLORS = { pending: colors.textSecondary, accepted: colors.accent, declined: colors.danger };

const formatIsoDatePt = (isoDate) => {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
};

export default function BriefingDetailModal({ visible, briefing, conversation, user, onClose, onResponded }) {
  const insets = useSafeAreaInsets();
  const [showAccept, setShowAccept] = useState(false);
  const [showDecline, setShowDecline] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!briefing) return null;

  const isArtist = conversation?.artist === user?.profile_id;
  const canRespond = isArtist && briefing.status === 'pending';
  const priceChanged = Number(briefing.agreed_price) !== Number(briefing.tier_price_snapshot);

  const handleAccept = async () => {
    setLoading(true);
    try {
      const { data } = await acceptBriefing(briefing.id);
      onResponded?.(data);
      setShowAccept(false);
      onClose();
    } catch {
      Alert.alert('Erro', 'Não foi possível aceitar o briefing.');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      const { data } = await declineBriefing(briefing.id, declineReason.trim());
      onResponded?.(data);
      setShowDecline(false);
      onClose();
    } catch {
      Alert.alert('Erro', 'Não foi possível recusar o briefing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={styles.container}>
          <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Briefing — {briefing.tier_name_snapshot}</Text>
              <View style={[styles.badge, { borderColor: STATUS_COLORS[briefing.status] }]}>
                <Text style={[styles.badgeText, { color: STATUS_COLORS[briefing.status] }]}>
                  {STATUS_LABELS[briefing.status]}
                </Text>
              </View>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.price}>{formatTierPrice(briefing.agreed_price)}</Text>
              {priceChanged && (
                <Text style={styles.priceOriginal}>
                  Valor base da tier: {formatTierPrice(briefing.tier_price_snapshot)}
                </Text>
              )}
            </View>

            <Text style={styles.label}>Detalhes do pedido</Text>
            <Text style={styles.description}>{briefing.request_details}</Text>

            <Text style={styles.label}>Prazo solicitado</Text>
            <Text style={styles.description}>{formatIsoDatePt(briefing.requested_deadline)}</Text>

            {briefing.status === 'accepted' && briefing.deadline && (
              <>
                <Text style={styles.label}>Prazo combinado</Text>
                <Text style={styles.description}>{formatIsoDatePt(briefing.deadline)}</Text>
              </>
            )}

            {briefing.status === 'declined' && !!briefing.decline_reason && (
              <>
                <Text style={styles.label}>Motivo da recusa</Text>
                <Text style={styles.description}>{briefing.decline_reason}</Text>
              </>
            )}

            {!!briefing.attachments?.length && (
              <>
                <Text style={styles.label}>Referências</Text>
                <View style={styles.attachmentsGrid}>
                  {briefing.attachments.map((att) => (
                    <ChatAttachmentPreview
                      key={att.id}
                      isMine={false}
                      attachment={{ uri: att.file, name: att.original_filename, size: att.file_size }}
                    />
                  ))}
                </View>
              </>
            )}

            {canRespond && (
              <View style={styles.actions}>
                <TouchableOpacity style={styles.declineBtn} onPress={() => setShowDecline(true)}>
                  <Text style={styles.declineBtnText}>Recusar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.acceptBtn} onPress={() => setShowAccept(true)}>
                  <Text style={styles.acceptBtnText}>Aceitar</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity style={[styles.closeBtn, { top: insets.top + spacing.sm }]} onPress={onClose}>
            <Ionicons name="close" size={26} color={colors.white} />
          </TouchableOpacity>
        </View>
      </Modal>

      <ConfirmActionModal
        visible={showAccept}
        title="Aceitar briefing"
        message={`Você vai aceitar este trabalho por ${formatTierPrice(briefing.agreed_price)}, com prazo até ${formatIsoDatePt(briefing.requested_deadline)}.`}
        confirmLabel="Aceitar briefing"
        loading={loading}
        onCancel={() => !loading && setShowAccept(false)}
        onConfirm={handleAccept}
      />

      <ConfirmActionModal
        visible={showDecline}
        title="Recusar briefing"
        message="Tem certeza que deseja recusar este briefing? Essa ação não pode ser desfeita."
        confirmLabel="Recusar briefing"
        tone="danger"
        loading={loading}
        onCancel={() => !loading && setShowDecline(false)}
        onConfirm={handleDecline}
      >
        <TextInput
          style={styles.reasonInput}
          value={declineReason}
          onChangeText={setDeclineReason}
          placeholder="Motivo da recusa (opcional)"
          placeholderTextColor={colors.inputBorder}
          multiline
        />
      </ConfirmActionModal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.darkBg },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  title: { flex: 1, color: colors.white, fontSize: fontSize.xl, fontWeight: 'bold' },
  badge: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  badgeText: { fontSize: fontSize.xs, fontWeight: 'bold' },
  priceRow: { paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.headerBg, gap: 2 },
  price: { color: colors.accent, fontSize: fontSize.xl, fontWeight: 'bold' },
  priceOriginal: { color: colors.textSecondary, fontSize: fontSize.xs },
  label: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: 'bold' },
  description: { color: colors.white, fontSize: fontSize.md, lineHeight: 22 },
  attachmentsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  declineBtn: {
    flex: 1, paddingVertical: spacing.md, borderRadius: radius.button,
    borderWidth: 1, borderColor: colors.danger, alignItems: 'center',
  },
  declineBtnText: { color: colors.danger, fontWeight: 'bold', fontSize: fontSize.sm },
  acceptBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.button, backgroundColor: colors.accent, alignItems: 'center' },
  acceptBtnText: { color: colors.darkBg, fontWeight: 'bold', fontSize: fontSize.sm },
  closeBtn: {
    position: 'absolute', right: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 20, padding: spacing.sm,
  },
  reasonInput: {
    backgroundColor: colors.formBg, borderWidth: 1, borderColor: colors.inputBorder,
    borderRadius: radius.input, color: colors.white, fontSize: fontSize.sm,
    padding: spacing.md, minHeight: 60, textAlignVertical: 'top',
  },
});
