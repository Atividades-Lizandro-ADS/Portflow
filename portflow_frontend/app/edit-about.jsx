import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { updateAbout } from '../src/api/about';
import { getHiringOptions, getSkillOptions } from '../src/api/hiring';
import { getPrograms } from '../src/api/programs';
import ProgramChip from '../src/components/ProgramChip';
import { colors, fontSize, spacing, radius } from '../src/theme';

// Chip genérico para hiring/skill (sem logo)
function OptionChip({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.optionChip, selected && styles.optionChipActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.optionChipText, selected && styles.optionChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function EditAboutScreen() {
  const { aboutId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [summary, setSummary] = useState('');
  const [selectedHiring, setSelectedHiring] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedPrograms, setSelectedPrograms] = useState([]);

  const [hiringOptions, setHiringOptions] = useState([]);
  const [skillOptions, setSkillOptions] = useState([]);
  const [programSearch, setProgramSearch] = useState('');
  const [programResults, setProgramResults] = useState([]);
  const [searchingPrograms, setSearchingPrograms] = useState(false);
  const programDebounce = useRef(null);

  useEffect(() => {
    Promise.all([getHiringOptions(), getSkillOptions()]).then(([hRes, sRes]) => {
      setHiringOptions(hRes.data.results ?? hRes.data);
      setSkillOptions(sRes.data.results ?? sRes.data);
    }).finally(() => setLoading(false));
  }, []);

  // Pre-populate from route params (passed as JSON strings)
  const { summary: initSummary, hiring: initHiring, skills: initSkills, programs: initPrograms } = useLocalSearchParams();
  useEffect(() => {
    if (initSummary) setSummary(initSummary);
    if (initHiring) { try { setSelectedHiring(JSON.parse(initHiring)); } catch { /* ignore */ } }
    if (initSkills) { try { setSelectedSkills(JSON.parse(initSkills)); } catch { /* ignore */ } }
    if (initPrograms) { try { setSelectedPrograms(JSON.parse(initPrograms)); } catch { /* ignore */ } }
  }, []);

  const toggleHiring = (item) => {
    setSelectedHiring((prev) =>
      prev.some((h) => h.id === item.id) ? prev.filter((h) => h.id !== item.id) : [...prev, item]
    );
  };

  const toggleSkill = (item) => {
    setSelectedSkills((prev) =>
      prev.some((s) => s.id === item.id) ? prev.filter((s) => s.id !== item.id) : [...prev, item]
    );
  };

  const handleProgramSearch = (text) => {
    setProgramSearch(text);
    setProgramResults([]);
    clearTimeout(programDebounce.current);
    if (!text.trim()) return;
    setSearchingPrograms(true);
    programDebounce.current = setTimeout(async () => {
      try {
        const { data } = await getPrograms(text);
        const ids = selectedPrograms.map((p) => p.id);
        setProgramResults((data.results ?? data).filter((p) => !ids.includes(p.id)));
      } finally { setSearchingPrograms(false); }
    }, 500);
  };

  const addProgram = (p) => { setSelectedPrograms((prev) => [...prev, p]); setProgramResults([]); setProgramSearch(''); };
  const removeProgram = (id) => setSelectedPrograms((prev) => prev.filter((p) => p.id !== id));

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      await updateAbout(aboutId, {
        summary: summary.trim(),
        hiring: selectedHiring.map((h) => h.id),
        skills: selectedSkills.map((s) => s.id),
        programs_known: selectedPrograms.map((p) => p.id),
      });
      router.back();
    } catch (e) {
      const detail = e.response?.data;
      if (detail && typeof detail === 'object') {
        const first = Object.values(detail)[0];
        setError(Array.isArray(first) ? first[0] : String(first));
      } else {
        setError('Erro ao salvar. Tente novamente.');
      }
    } finally { setSaving(false); }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.accent} size="large" /></View>;
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Sobre</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Text style={styles.sectionLabel}>Resumo</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={summary}
          onChangeText={setSummary}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          placeholder="Fale sobre você, sua trajetória e estilo artístico..."
          placeholderTextColor={colors.inputBorder}
        />

        <Text style={styles.sectionLabel}>Disponível para contratação</Text>
        <View style={styles.optionsRow}>
          {hiringOptions.map((h) => (
            <OptionChip
              key={h.id}
              label={h.hire_type}
              selected={selectedHiring.some((s) => s.id === h.id)}
              onPress={() => toggleHiring(h)}
            />
          ))}
          {hiringOptions.length === 0 && <Text style={styles.emptyHint}>Nenhuma opção cadastrada pelo admin.</Text>}
        </View>

        <Text style={styles.sectionLabel}>Habilidades</Text>
        <View style={styles.optionsRow}>
          {skillOptions.map((s) => (
            <OptionChip
              key={s.id}
              label={s.skill_type}
              selected={selectedSkills.some((sk) => sk.id === s.id)}
              onPress={() => toggleSkill(s)}
            />
          ))}
          {skillOptions.length === 0 && <Text style={styles.emptyHint}>Nenhuma opção cadastrada pelo admin.</Text>}
        </View>

        <Text style={styles.sectionLabel}>Programas que domina</Text>
        <View style={styles.programSearchRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={programSearch}
            onChangeText={handleProgramSearch}
            placeholder="Buscar programa..."
            placeholderTextColor={colors.inputBorder}
            autoCapitalize="none"
          />
          {searchingPrograms && <ActivityIndicator color={colors.accent} style={{ marginLeft: spacing.sm }} />}
        </View>
        {programResults.length > 0 && (
          <View style={styles.programDropdown}>
            {programResults.map((p) => (
              <TouchableOpacity key={p.id} style={styles.programDropdownItem} onPress={() => addProgram(p)}>
                <Text style={styles.programName}>{p.program_name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {selectedPrograms.length > 0 && (
          <View style={styles.programsRow}>
            {selectedPrograms.map((p) => (
              <ProgramChip key={p.id} program={p} onRemove={() => removeProgram(p.id)} />
            ))}
          </View>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={saving}>
          {saving ? <ActivityIndicator color={colors.darkBg} /> : <Text style={styles.submitText}>Salvar</Text>}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.darkBg },
  center: { flex: 1, backgroundColor: colors.darkBg, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingBottom: spacing.md,
    backgroundColor: colors.darkBg, borderBottomWidth: 1, borderBottomColor: colors.headerBg,
  },
  backBtn: { padding: spacing.xs },
  headerTitle: { color: colors.white, fontSize: fontSize.lg, fontWeight: 'bold' },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 60 },
  sectionLabel: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: 'bold' },
  input: { backgroundColor: colors.formBg, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: radius.input, color: colors.white, fontSize: fontSize.md, padding: spacing.md },
  textArea: { minHeight: 120 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  optionChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.inputBorder, backgroundColor: colors.formBg },
  optionChipActive: { borderColor: colors.accent, backgroundColor: 'rgba(36,186,255,0.12)' },
  optionChipText: { color: colors.textSecondary, fontSize: fontSize.sm },
  optionChipTextActive: { color: colors.accent, fontWeight: 'bold' },
  emptyHint: { color: colors.inputBorder, fontSize: fontSize.sm },
  programSearchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  programDropdown: { backgroundColor: colors.lightBg, borderRadius: radius.card, borderWidth: 1, borderColor: colors.headerBg, overflow: 'hidden' },
  programDropdownItem: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.headerBg },
  programName: { color: colors.white, fontSize: fontSize.md },
  programsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  error: { color: colors.danger, fontSize: fontSize.sm, textAlign: 'center' },
  submitBtn: { backgroundColor: colors.accent, borderRadius: radius.button, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  submitText: { color: colors.darkBg, fontWeight: 'bold', fontSize: fontSize.md },
});
