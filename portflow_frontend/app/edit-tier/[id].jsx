import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenHeader from '../../src/components/ScreenHeader';
import SectionLabel from '../../src/components/atoms/SectionLabel';
import ThumbPickerField from '../../src/components/molecules/ThumbPickerField';
import TypeSelector from '../../src/components/molecules/TypeSelector';
import { getTier, updateTier } from '../../src/api/tiers';
import { colors, fontSize, spacing, radius } from '../../src/theme';

const NEGOTIATION_OPTIONS = [
  { value: 'up', label: 'Só pra cima' },
  { value: 'down', label: 'Só pra baixo' },
  { value: 'both', label: 'Os dois lados' },
];

export default function EditTierScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currentThumb, setCurrentThumb] = useState(null);
  const [newThumb, setNewThumb] = useState(null);
  const [negotiable, setNegotiable] = useState(false);
  const [negotiationDirection, setNegotiationDirection] = useState('both');

  useEffect(() => {
    getTier(id).then(({ data }) => {
      setName(data.name ?? '');
      setDescription(data.description ?? '');
      setPrice(data.price ?? '');
      setCurrentThumb(data.thumb ?? null);
      setNegotiable(data.negotiable ?? false);
      setNegotiationDirection(data.negotiation_direction ?? 'both');
    }).finally(() => setPageLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    if (!name.trim()) { setError('O nome do tier é obrigatório.'); return; }
    if (!description.trim()) { setError('A descrição é obrigatória.'); return; }
    const normalizedPrice = price.trim().replace(',', '.');
    if (!normalizedPrice || Number.isNaN(Number(normalizedPrice))) { setError('Informe um preço válido.'); return; }
    setError('');
    setSaving(true);
    try {
      const form = new FormData();
      form.append('name', name.trim());
      form.append('description', description.trim());
      form.append('price', normalizedPrice);
      form.append('negotiable', negotiable ? 'true' : 'false');
      if (negotiable) form.append('negotiation_direction', negotiationDirection);
      if (newThumb) {
        form.append('thumb', { uri: newThumb.uri, name: newThumb.fileName ?? 'thumb.jpg', type: newThumb.mimeType ?? 'image/jpeg' });
      }
      await updateTier(id, form);
      router.back();
    } catch (e) {
      const detail = e.response?.data;
      if (detail && typeof detail === 'object') {
        const first = Object.values(detail)[0];
        setError(Array.isArray(first) ? first[0] : String(first));
      } else {
        setError('Erro ao salvar o tier. Tente novamente.');
      }
    } finally { setSaving(false); }
  };

  if (pageLoading) {
    return <View style={styles.center}><ActivityIndicator color={colors.accent} size="large" /></View>;
  }

  const thumbUri = newThumb?.uri ?? currentThumb;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader onBack={() => router.back()} title="Editar tier" />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <SectionLabel>Imagem (opcional)</SectionLabel>
        <ThumbPickerField thumbUri={thumbUri} onPick={setNewThumb} showEditOverlay={!!thumbUri} />

        <SectionLabel>Nome *</SectionLabel>
        <TextInput
          style={styles.input}
          placeholder="Ex: Ilustração simples"
          placeholderTextColor={colors.inputBorder}
          value={name}
          onChangeText={setName}
          maxLength={100}
        />

        <SectionLabel>Descrição *</SectionLabel>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descreva o que está incluso nesse tier"
          placeholderTextColor={colors.inputBorder}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        <SectionLabel>Preço (R$) *</SectionLabel>
        <TextInput
          style={styles.input}
          placeholder="0,00"
          placeholderTextColor={colors.inputBorder}
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
        />

        <View style={styles.negotiableRow}>
          <View style={styles.negotiableLabelGroup}>
            <Text style={styles.negotiableLabel}>Preço negociável</Text>
            <Text style={styles.negotiableHint}>
              Permite que o cliente negocie o valor durante a conversa.
            </Text>
          </View>
          <Switch
            value={negotiable}
            onValueChange={setNegotiable}
            trackColor={{ false: colors.inputBorder, true: colors.accent }}
            thumbColor={colors.white}
          />
        </View>

        {negotiable && (
          <>
            <SectionLabel>Direção da negociação</SectionLabel>
            <TypeSelector
              options={NEGOTIATION_OPTIONS}
              value={negotiationDirection}
              onChange={setNegotiationDirection}
            />
          </>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={saving}>
          {saving
            ? <ActivityIndicator color={colors.darkBg} />
            : <Text style={styles.submitText}>Salvar alterações</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.darkBg },
  center: { flex: 1, backgroundColor: colors.darkBg, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  input: {
    backgroundColor: colors.formBg, borderWidth: 1, borderColor: colors.inputBorder,
    borderRadius: radius.input, color: colors.white, fontSize: fontSize.md, padding: spacing.md,
  },
  textArea: { minHeight: 120 },
  error: { color: colors.danger, fontSize: fontSize.sm, textAlign: 'center' },
  submitBtn: { backgroundColor: colors.accent, borderRadius: radius.button, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  submitText: { color: colors.darkBg, fontWeight: 'bold', fontSize: fontSize.md },
  negotiableRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  negotiableLabelGroup: { flex: 1, gap: spacing.xs },
  negotiableLabel: { color: colors.white, fontSize: fontSize.md, fontWeight: 'bold' },
  negotiableHint: { color: colors.textSecondary, fontSize: fontSize.xs, lineHeight: 18 },
});
