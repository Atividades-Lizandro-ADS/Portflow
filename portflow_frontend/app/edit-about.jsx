import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform, Image, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../src/components/ScreenHeader';
import Avatar from '../src/components/Avatar';
import { updateAbout } from '../src/api/about';
import { updateProfile } from '../src/api/profiles';
import { checkUsername } from '../src/api/auth';
import { useAuth } from '../src/context/AuthContext';
import { getHiringOptions, getSkillOptions } from '../src/api/hiring';
import { getPrograms } from '../src/api/programs';
import ProgramChip from '../src/components/ProgramChip';
import { colors, fontSize, spacing, radius } from '../src/theme';

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
  const {
    aboutId, profileId,
    summary: initSummary,
    hiring: initHiring,
    skills: initSkills,
    programs: initPrograms,
    firstName: initFirstName,
    currentUsername: initUsername,
    avatarUri: initAvatarUri,
    bannerUri: initBannerUri,
  } = useLocalSearchParams();

  const router = useRouter();
  const { refreshUser } = useAuth();
  const usernameDebounce = useRef(null);
  const programDebounce = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [firstName, setFirstName] = useState(initFirstName ?? '');
  const [username, setUsername] = useState(initUsername ?? '');
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [newAvatar, setNewAvatar] = useState(null);
  const [newBanner, setNewBanner] = useState(null);

  const [summary, setSummary] = useState('');
  const [selectedHiring, setSelectedHiring] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [hiringOptions, setHiringOptions] = useState([]);
  const [skillOptions, setSkillOptions] = useState([]);
  const [programSearch, setProgramSearch] = useState('');
  const [programResults, setProgramResults] = useState([]);
  const [searchingPrograms, setSearchingPrograms] = useState(false);

  useEffect(() => {
    Promise.all([getHiringOptions(), getSkillOptions()]).then(([hRes, sRes]) => {
      setHiringOptions(hRes.data.results ?? hRes.data);
      setSkillOptions(sRes.data.results ?? sRes.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (initSummary) setSummary(initSummary);
    if (initHiring) { try { setSelectedHiring(JSON.parse(initHiring)); } catch { } }
    if (initSkills) { try { setSelectedSkills(JSON.parse(initSkills)); } catch { } }
    if (initPrograms) { try { setSelectedPrograms(JSON.parse(initPrograms)); } catch { } }
  }, []);

  const handleUsernameChange = (text) => {
    const cleaned = text.replace(/\s/g, '_');
    setUsername(cleaned);
    setUsernameStatus(null);
    clearTimeout(usernameDebounce.current);
    if (cleaned === initUsername || cleaned.length < 3) return;
    setUsernameStatus('checking');
    usernameDebounce.current = setTimeout(async () => {
      try {
        const { data } = await checkUsername(cleaned);
        setUsernameStatus(data.available ? 'available' : 'taken');
      } catch {
        setUsernameStatus(null);
      }
    }, 500);
  };

  const pickImage = async (aspect, onPicked) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos acessar sua galeria.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect,
    });
    if (!result.canceled && result.assets?.[0]) onPicked(result.assets[0]);
  };

  const toggleHiring = (item) =>
    setSelectedHiring((prev) =>
      prev.some((h) => h.id === item.id) ? prev.filter((h) => h.id !== item.id) : [...prev, item]
    );

  const toggleSkill = (item) =>
    setSelectedSkills((prev) =>
      prev.some((s) => s.id === item.id) ? prev.filter((s) => s.id !== item.id) : [...prev, item]
    );

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

  const addProgram = (p) => {
    setSelectedPrograms((prev) => [...prev, p]);
    setProgramResults([]);
    setProgramSearch('');
  };

  const removeProgram = (id) => setSelectedPrograms((prev) => prev.filter((p) => p.id !== id));

  const handleSubmit = async () => {
    const usernameChanged = username.trim() !== initUsername;
    if (usernameChanged && usernameStatus === 'taken') {
      setError('Username já está em uso.');
      return;
    }
    if (usernameChanged && usernameStatus === 'checking') {
      setError('Aguarde a verificação do username.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const profileForm = new FormData();
      profileForm.append('first_name', firstName.trim());
      if (usernameChanged) profileForm.append('username', username.trim());
      if (newAvatar) profileForm.append('user_picture', { uri: newAvatar.uri, name: newAvatar.fileName ?? 'avatar.jpg', type: newAvatar.mimeType ?? 'image/jpeg' });
      if (newBanner) profileForm.append('profile_banner', { uri: newBanner.uri, name: newBanner.fileName ?? 'banner.jpg', type: newBanner.mimeType ?? 'image/jpeg' });

      await Promise.all([
        updateProfile(profileId, profileForm),
        updateAbout(aboutId, {
          summary: summary.trim(),
          hiring: selectedHiring.map((h) => h.id),
          skills: selectedSkills.map((s) => s.id),
          programs_known: selectedPrograms.map((p) => p.id),
        }),
      ]);
      refreshUser().catch(() => {});
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

  const avatarDisplay = newAvatar?.uri || initAvatarUri || null;
  const bannerDisplay = newBanner?.uri || initBannerUri || null;

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.accent} size="large" /></View>;
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader onBack={() => router.back()} title="Editar Perfil" />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <View style={styles.imagesSection}>
          <TouchableOpacity onPress={() => pickImage([3, 1], setNewBanner)} activeOpacity={0.8} style={styles.bannerWrapper}>
            {bannerDisplay ? (
              <Image source={{ uri: bannerDisplay }} style={styles.banner} resizeMode="cover" />
            ) : (
              <View style={[styles.banner, styles.bannerEmpty]}>
                <Ionicons name="image-outline" size={28} color={colors.textSecondary} />
                <Text style={styles.bannerHint}>Banner (toque para adicionar)</Text>
              </View>
            )}
            <View style={styles.bannerEditBadge}>
              <Ionicons name="camera-outline" size={14} color={colors.white} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => pickImage([1, 1], setNewAvatar)} activeOpacity={0.8} style={styles.avatarWrapper}>
            <Avatar uri={avatarDisplay} size={64} />
            <View style={styles.avatarEditBadge}>
              <Ionicons name="camera-outline" size={12} color={colors.white} />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Nome</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Seu nome"
          placeholderTextColor={colors.inputBorder}
          autoCorrect={false}
        />

        <Text style={styles.sectionLabel}>Usuário</Text>
        <View>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputFlex]}
              value={username}
              onChangeText={handleUsernameChange}
              placeholder="username"
              placeholderTextColor={colors.inputBorder}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.statusIcon}>
              {usernameStatus === 'checking' && <ActivityIndicator size={16} color={colors.textSecondary} />}
              {usernameStatus === 'available' && <Ionicons name="checkmark-circle" size={18} color={colors.dragActive} />}
              {usernameStatus === 'taken' && <Ionicons name="close-circle" size={18} color={colors.danger} />}
            </View>
          </View>
          {usernameStatus === 'available' && <Text style={[styles.statusHint, { color: colors.dragActive }]}>Username disponível</Text>}
          {usernameStatus === 'taken' && <Text style={[styles.statusHint, { color: colors.danger }]}>Username já em uso</Text>}
        </View>

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
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 60 },

  imagesSection: { gap: spacing.md },
  bannerWrapper: { borderRadius: radius.card, overflow: 'hidden', position: 'relative' },
  banner: { width: '100%', height: 120, backgroundColor: colors.lightBg },
  bannerEmpty: { alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  bannerHint: { color: colors.textSecondary, fontSize: fontSize.xs },
  bannerEditBadge: {
    position: 'absolute', bottom: spacing.sm, right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: spacing.xs + 2,
  },
  avatarWrapper: { alignSelf: 'flex-start', position: 'relative' },
  avatarEditBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: colors.accent, borderRadius: 10, padding: 4,
  },

  sectionLabel: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: 'bold' },
  input: {
    backgroundColor: colors.formBg, borderWidth: 1, borderColor: colors.inputBorder,
    borderRadius: radius.input, color: colors.white, fontSize: fontSize.md, padding: spacing.md,
  },
  textArea: { minHeight: 120 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  inputFlex: { flex: 1 },
  statusIcon: { position: 'absolute', right: spacing.md },
  statusHint: { fontSize: fontSize.xs, marginTop: spacing.xs, paddingHorizontal: spacing.xs },

  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  optionChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: radius.pill, borderWidth: 1, borderColor: colors.inputBorder, backgroundColor: colors.formBg,
  },
  optionChipActive: { borderColor: colors.accent, backgroundColor: 'rgba(36,186,255,0.12)' },
  optionChipText: { color: colors.textSecondary, fontSize: fontSize.sm },
  optionChipTextActive: { color: colors.accent, fontWeight: 'bold' },
  emptyHint: { color: colors.inputBorder, fontSize: fontSize.sm },

  programSearchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  programDropdown: {
    backgroundColor: colors.lightBg, borderRadius: radius.card,
    borderWidth: 1, borderColor: colors.headerBg, overflow: 'hidden',
  },
  programDropdownItem: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.headerBg },
  programName: { color: colors.white, fontSize: fontSize.md },
  programsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },

  error: { color: colors.danger, fontSize: fontSize.sm, textAlign: 'center' },
  submitBtn: {
    backgroundColor: colors.accent, borderRadius: radius.button,
    paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.sm,
  },
  submitText: { color: colors.darkBg, fontWeight: 'bold', fontSize: fontSize.md },
});
