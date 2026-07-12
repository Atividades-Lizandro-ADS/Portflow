import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Modal, ActivityIndicator, Platform, KeyboardAvoidingView, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import SectionLabel from '../atoms/SectionLabel';
import { PendingAttachmentChip } from '../molecules/ChatAttachmentPreview';
import { createBriefing } from '../../api/briefings';
import { NEGOTIATION_LABELS, formatTierPrice } from '../../utils/tier';
import { colors, fontSize, spacing, radius } from '../../theme';

const toISODateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatDatePt = (date) => date.toLocaleDateString('pt-BR');

export default function BriefingFormModal({ visible, conversationId, tier, onClose, onCreated }) {
  const insets = useSafeAreaInsets();
  const [price, setPrice] = useState('');
  const [requestDetails, setRequestDetails] = useState('');
  const [deadline, setDeadline] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setPrice(tier ? String(tier.price) : '');
      setRequestDetails('');
      setDeadline(null);
      setReferences([]);
      setError('');
    }
  }, [visible, tier]);

  if (!tier) return null;

  const handlePickReference = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true, multiple: true });
      if (!result.canceled) {
        const files = (result.assets ?? []).map((f) => ({ uri: f.uri, name: f.name, mimeType: f.mimeType, size: f.size }));
        setReferences((prev) => [...prev, ...files]);
      }
    } catch {
      setError('Não foi possível selecionar o arquivo.');
    }
  };

  const handleRemoveReference = (index) => {
    setReferences((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDateValueChange = (event, selected) => {
    if (Platform.OS === 'android') setShowPicker(false);
    setDeadline(selected);
  };

  const handleDateDismiss = () => {
    setShowPicker(false);
  };

  const handleSubmit = async () => {
    if (!requestDetails.trim()) { setError('Descreva os detalhes do pedido.'); return; }
    if (!deadline) { setError('Escolha um prazo.'); return; }

    const normalizedPrice = tier.negotiable ? price.trim().replace(',', '.') : String(tier.price);
    if (!normalizedPrice || Number.isNaN(Number(normalizedPrice))) { setError('Informe um valor válido.'); return; }
    if (tier.negotiable) {
      const numeric = Number(normalizedPrice);
      if (tier.negotiation_direction === 'up' && numeric < Number(tier.price)) {
        setError('Esta tier só pode ser negociada para mais.'); return;
      }
      if (tier.negotiation_direction === 'down' && numeric > Number(tier.price)) {
        setError('Esta tier só pode ser negociada para menos.'); return;
      }
    }

    setError('');
    setLoading(true);
    try {
      const form = new FormData();
      form.append('conversation', conversationId);
      form.append('agreed_price', normalizedPrice);
      form.append('request_details', requestDetails.trim());
      form.append('requested_deadline', toISODateString(deadline));
      references.forEach((file) => {
        form.append('references[]', { uri: file.uri, name: file.name, type: file.mimeType ?? 'application/octet-stream' });
      });
      const { data } = await createBriefing(form);
      onCreated?.(data);
      onClose();
    } catch (e) {
      const detail = e.response?.data;
      if (detail && typeof detail === 'object') {
        const first = Object.values(detail)[0];
        setError(Array.isArray(first) ? first[0] : String(first));
      } else {
        setError('Erro ao enviar briefing. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Briefing — {tier.name}</Text>

          <SectionLabel>Valor *</SectionLabel>
          {tier.negotiable ? (
            <>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
                placeholder={String(tier.price)}
                placeholderTextColor={colors.inputBorder}
              />
              <Text style={styles.hint}>
                Preço base {formatTierPrice(tier.price)} · {NEGOTIATION_LABELS[tier.negotiation_direction] ?? ''}
              </Text>
            </>
          ) : (
            <View style={styles.fixedPrice}>
              <Text style={styles.fixedPriceText}>{formatTierPrice(tier.price)}</Text>
              <Text style={styles.hint}>Esta tier não é negociável.</Text>
            </View>
          )}

          <SectionLabel>Detalhes do pedido *</SectionLabel>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={requestDetails}
            onChangeText={setRequestDetails}
            placeholder="Descreva o que você precisa..."
            placeholderTextColor={colors.inputBorder}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          <SectionLabel>Prazo desejado *</SectionLabel>
          <TouchableOpacity style={styles.dateField} onPress={() => setShowPicker(true)}>
            <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
            <Text style={deadline ? styles.dateText : styles.datePlaceholder}>
              {deadline ? formatDatePt(deadline) : 'Selecionar data'}
            </Text>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={deadline ?? new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={new Date()}
              onValueChange={handleDateValueChange}
              onDismiss={handleDateDismiss}
            />
          )}
          {showPicker && Platform.OS === 'ios' && (
            <TouchableOpacity style={styles.doneBtn} onPress={() => setShowPicker(false)}>
              <Text style={styles.doneBtnText}>Concluído</Text>
            </TouchableOpacity>
          )}

          <SectionLabel>Referências (opcional)</SectionLabel>
          <TouchableOpacity style={styles.attachBtn} onPress={handlePickReference}>
            <Ionicons name="attach" size={18} color={colors.accent} />
            <Text style={styles.attachBtnText}>Anexar arquivo</Text>
          </TouchableOpacity>
          {!!references.length && (
            <View style={styles.referencesList}>
              {references.map((file, index) => (
                <PendingAttachmentChip key={`${file.uri}-${index}`} attachment={file} onRemove={() => handleRemoveReference(index)} />
              ))}
            </View>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            {loading
              ? <ActivityIndicator color={colors.darkBg} />
              : <Text style={styles.submitText}>Enviar briefing</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.darkBg },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  title: { color: colors.white, fontSize: fontSize.xl, fontWeight: 'bold', marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.formBg, borderWidth: 1, borderColor: colors.inputBorder,
    borderRadius: radius.input, color: colors.white, fontSize: fontSize.md, padding: spacing.md,
  },
  textArea: { minHeight: 120 },
  hint: { color: colors.textSecondary, fontSize: fontSize.xs },
  fixedPrice: {
    backgroundColor: colors.formBg, borderWidth: 1, borderColor: colors.inputBorder,
    borderRadius: radius.input, padding: spacing.md, gap: 2,
  },
  fixedPriceText: { color: colors.accent, fontSize: fontSize.lg, fontWeight: 'bold' },
  dateField: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.formBg, borderWidth: 1, borderColor: colors.inputBorder,
    borderRadius: radius.input, padding: spacing.md,
  },
  dateText: { color: colors.white, fontSize: fontSize.md },
  datePlaceholder: { color: colors.inputBorder, fontSize: fontSize.md },
  doneBtn: { alignSelf: 'flex-end', paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  doneBtnText: { color: colors.accent, fontWeight: 'bold' },
  attachBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    borderWidth: 1, borderColor: colors.inputBorder, borderStyle: 'dashed',
    borderRadius: radius.input, padding: spacing.md, justifyContent: 'center',
  },
  attachBtnText: { color: colors.accent, fontWeight: 'bold', fontSize: fontSize.sm },
  referencesList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  error: { color: colors.danger, fontSize: fontSize.sm, textAlign: 'center' },
  submitBtn: { backgroundColor: colors.accent, borderRadius: radius.button, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  submitText: { color: colors.darkBg, fontWeight: 'bold', fontSize: fontSize.md },
  cancelBtn: { alignItems: 'center', paddingVertical: spacing.sm },
  cancelBtnText: { color: colors.textSecondary, fontSize: fontSize.sm },
});
