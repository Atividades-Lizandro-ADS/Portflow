import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Image, Switch, KeyboardAvoidingView, Platform,
  Alert, useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getPost, updatePost } from '../../src/api/posts';
import { getPrograms } from '../../src/api/programs';
import ProgramChip from '../../src/components/ProgramChip';
import { colors, fontSize, spacing, radius } from '../../src/theme';

function SectionLabel({ children }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

function TypeSelector({ options, value, onChange }) {
  return (
    <View style={styles.typeRow}>
      {options.map(({ value: v, label }) => (
        <TouchableOpacity
          key={v}
          style={[styles.typeBtn, value === v && styles.typeBtnActive]}
          onPress={() => onChange(v)}
        >
          <Text style={[styles.typeBtnText, value === v && styles.typeBtnTextActive]}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function EditPostScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [tittle, setTittle] = useState('');
  const [caption, setCaption] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [artType, setArtType] = useState('2');
  const [displayType, setDisplayType] = useState('list');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [sketchfabLink, setSketchfabLink] = useState('');
  const [published, setPublished] = useState(true);

  const [newThumb, setNewThumb] = useState(null);
  const [currentThumb, setCurrentThumb] = useState(null);
  const [newMview, setNewMview] = useState(null);
  const [currentMview, setCurrentMview] = useState(null);
  const [newImages, setNewImages] = useState([]);

  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [programSearch, setProgramSearch] = useState('');
  const [programResults, setProgramResults] = useState([]);
  const [searchingPrograms, setSearchingPrograms] = useState(false);
  const programDebounce = useRef(null);

  useEffect(() => {
    getPost(id).then(({ data }) => {
      setTittle(data.tittle ?? '');
      setCaption(data.caption ?? '');
      setDescription(data.description ?? '');
      setKeywords(data.keywords ?? '');
      setArtType(data.art_type ?? '2');
      setDisplayType(data.display_type ?? 'list');
      setYoutubeLink(data.youtube_link ?? '');
      setSketchfabLink(data.sketchfab_link ?? '');
      setPublished(data.published ?? true);
      setCurrentThumb(data.post_thumb);
      setCurrentMview(data.marmoview || null);
      setSelectedPrograms(data.used_programs ?? []);
    }).finally(() => setLoading(false));
  }, [id]);

  const pickThumb = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: true, aspect: [1, 1] });
    if (!result.canceled && result.assets?.[0]) setNewThumb(result.assets[0]);
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsMultipleSelection: true });
    if (!result.canceled) {
      setNewImages((prev) => [
        ...prev,
        ...result.assets.map((a) => ({
          uri: a.uri, fileName: a.fileName ?? 'img.jpg', mimeType: a.mimeType ?? 'image/jpeg',
          caption: '', acessibilityCaption: '', cell_size_x: '1/3', cell_size_y: '1/3',
        })),
      ]);
    }
  };

  const pickMview = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (!result.canceled && result.assets?.[0]) {
        const file = result.assets[0];
        if (!file.name.toLowerCase().endsWith('.mview')) {
          Alert.alert('Arquivo inválido', 'Selecione um arquivo .mview do Marmoset Toolbag.');
          return;
        }
        setNewMview(file);
      }
    } catch { /* ignore */ }
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
    if (!tittle.trim()) { setError('O título é obrigatório.'); return; }
    if (!caption.trim()) { setError('A legenda é obrigatória.'); return; }
    if (!description.trim()) { setError('A descrição é obrigatória.'); return; }
    setError('');
    setSaving(true);
    try {
      const form = new FormData();
      form.append('tittle', tittle.trim());
      form.append('caption', caption.trim());
      form.append('description', description.trim());
      form.append('keywords', keywords.trim());
      form.append('art_type', artType);
      form.append('display_type', displayType);
      form.append('published', published ? 'true' : 'false');
      if (youtubeLink.trim()) form.append('youtube_link', youtubeLink.trim());
      if (sketchfabLink.trim()) form.append('sketchfab_link', sketchfabLink.trim());
      if (newThumb) form.append('post_thumb', { uri: newThumb.uri, name: newThumb.fileName ?? 'thumb.jpg', type: newThumb.mimeType ?? 'image/jpeg' });
      if (newMview) form.append('marmoview', { uri: newMview.uri, name: newMview.name, type: 'application/octet-stream' });
      newImages.forEach((img) => {
        form.append('post_img[]', { uri: img.uri, name: img.fileName, type: img.mimeType });
        form.append('caption[]', img.caption);
        form.append('acessibility_caption[]', img.acessibilityCaption);
        form.append('cell_size_x[]', img.cell_size_x);
        form.append('cell_size_y[]', img.cell_size_y);
      });
      selectedPrograms.forEach((p) => form.append('used_programs[]', String(p.id)));
      await updatePost(id, form);
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

  const thumbUri = newThumb?.uri ?? currentThumb;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Post</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <SectionLabel>Thumbnail</SectionLabel>
        <TouchableOpacity style={styles.thumbPicker} onPress={pickThumb} activeOpacity={0.7}>
          {thumbUri ? (
            <Image source={{ uri: thumbUri }} style={styles.thumbPreview} />
          ) : (
            <View style={styles.thumbPlaceholder}>
              <Ionicons name="image-outline" size={40} color={colors.textSecondary} />
              <Text style={styles.thumbHint}>Toque para alterar</Text>
            </View>
          )}
          {thumbUri && (
            <View style={styles.thumbOverlay}>
              <Ionicons name="pencil" size={20} color={colors.white} />
            </View>
          )}
        </TouchableOpacity>

        <SectionLabel>Tipo de arte</SectionLabel>
        <TypeSelector options={[{ value: '2', label: '2D' }, { value: '3', label: '3D' }]} value={artType} onChange={setArtType} />

        <SectionLabel>Exibição das imagens</SectionLabel>
        <TypeSelector options={[{ value: 'list', label: 'Lista' }, { value: 'album', label: 'Album' }]} value={displayType} onChange={setDisplayType} />

        <SectionLabel>Título *</SectionLabel>
        <TextInput style={styles.input} value={tittle} onChangeText={setTittle} maxLength={150} placeholderTextColor={colors.inputBorder} placeholder="Título da obra" />

        <SectionLabel>Legenda *</SectionLabel>
        <TextInput style={styles.input} value={caption} onChangeText={setCaption} maxLength={250} placeholderTextColor={colors.inputBorder} placeholder="Legenda curta" />

        <SectionLabel>Descrição *</SectionLabel>
        <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} multiline numberOfLines={5} textAlignVertical="top" placeholderTextColor={colors.inputBorder} placeholder="Descrição da obra" />

        <SectionLabel>Palavras-chave</SectionLabel>
        <TextInput style={styles.input} value={keywords} onChangeText={setKeywords} placeholderTextColor={colors.inputBorder} placeholder="#arte #digital ..." />

        <SectionLabel>Adicionar novas imagens à galeria</SectionLabel>
        <TouchableOpacity style={styles.addImgBtn} onPress={pickImages} activeOpacity={0.7}>
          <Ionicons name="add-circle-outline" size={22} color={colors.accent} />
          <Text style={styles.addImgText}>Selecionar imagens</Text>
        </TouchableOpacity>
        {newImages.length > 0 && (
          <View style={styles.newImagesRow}>
            {newImages.map((img, i) => (
              <View key={i} style={styles.newImageThumb}>
                <Image source={{ uri: img.uri }} style={{ width: 70, height: 70 }} resizeMode="cover" />
                <TouchableOpacity style={styles.removeThumb} onPress={() => setNewImages((prev) => prev.filter((_, idx) => idx !== i))}>
                  <Ionicons name="close-circle" size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <SectionLabel>Marmoset Viewer (.mview)</SectionLabel>
        <TouchableOpacity style={styles.filePicker} onPress={pickMview} activeOpacity={0.7}>
          <Ionicons name="cube-outline" size={22} color={(newMview || currentMview) ? colors.accent : colors.textSecondary} />
          <Text style={[styles.filePickerText, (newMview || currentMview) && { color: colors.accent }]}>
            {newMview ? newMview.name : currentMview ? 'Arquivo atual (toque para trocar)' : 'Selecionar .mview'}
          </Text>
          {newMview && (
            <TouchableOpacity onPress={() => setNewMview(null)}>
              <Ionicons name="close-circle" size={18} color={colors.danger} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        <SectionLabel>Programas utilizados</SectionLabel>
        <View style={styles.programSearchRow}>
          <TextInput style={[styles.input, { flex: 1 }]} value={programSearch} onChangeText={handleProgramSearch} placeholder="Buscar programa..." placeholderTextColor={colors.inputBorder} autoCapitalize="none" />
          {searchingPrograms && <ActivityIndicator color={colors.accent} style={{ marginLeft: spacing.sm }} />}
        </View>
        {programResults.length > 0 && (
          <View style={styles.programDropdown}>
            {programResults.map((p) => (
              <TouchableOpacity key={p.id} style={styles.programDropdownItem} onPress={() => addProgram(p)}>
                {p.program_logo ? <Image source={{ uri: p.program_logo }} style={styles.programLogo} /> : <View style={styles.programLogoPlaceholder} />}
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

        <SectionLabel>Link do YouTube (opcional)</SectionLabel>
        <TextInput style={styles.input} value={youtubeLink} onChangeText={setYoutubeLink} keyboardType="url" autoCapitalize="none" placeholderTextColor={colors.inputBorder} placeholder="https://youtube.com/watch?v=..." />

        <SectionLabel>Link do Sketchfab (opcional)</SectionLabel>
        <TextInput style={styles.input} value={sketchfabLink} onChangeText={setSketchfabLink} keyboardType="url" autoCapitalize="none" placeholderTextColor={colors.inputBorder} placeholder="https://sketchfab.com/3d-models/..." />

        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleLabel}>Publicado</Text>
            <Text style={styles.toggleSub}>{published ? 'Visível para todos' : 'Rascunho'}</Text>
          </View>
          <Switch value={published} onValueChange={setPublished} trackColor={{ false: colors.headerBg, true: colors.accent }} thumbColor={colors.white} />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={saving}>
          {saving ? <ActivityIndicator color={colors.darkBg} /> : <Text style={styles.submitText}>Salvar alterações</Text>}
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
  thumbPicker: { width: '100%', aspectRatio: 1, borderRadius: radius.card, overflow: 'hidden', backgroundColor: colors.lightBg },
  thumbPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  thumbPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  thumbHint: { color: colors.textSecondary, fontSize: fontSize.sm },
  thumbOverlay: {
    position: 'absolute', bottom: spacing.sm, right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: spacing.sm,
  },
  typeRow: { flexDirection: 'row', gap: spacing.sm },
  typeBtn: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.button, borderWidth: 1, borderColor: colors.inputBorder, backgroundColor: colors.formBg },
  typeBtnActive: { borderColor: colors.accent, backgroundColor: 'rgba(36,186,255,0.12)' },
  typeBtnText: { color: colors.textSecondary, fontWeight: 'bold', fontSize: fontSize.md },
  typeBtnTextActive: { color: colors.accent },
  input: { backgroundColor: colors.formBg, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: radius.input, color: colors.white, fontSize: fontSize.md, padding: spacing.md },
  textArea: { minHeight: 120 },
  addImgBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.input, borderWidth: 1, borderColor: colors.inputBorder, backgroundColor: colors.formBg },
  addImgText: { color: colors.accent, fontSize: fontSize.md, fontWeight: 'bold' },
  newImagesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  newImageThumb: { position: 'relative', borderRadius: radius.card, overflow: 'hidden' },
  removeThumb: { position: 'absolute', top: 2, right: 2 },
  filePicker: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.formBg, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: radius.input, padding: spacing.md },
  filePickerText: { flex: 1, color: colors.textSecondary, fontSize: fontSize.sm },
  programSearchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  programDropdown: { backgroundColor: colors.lightBg, borderRadius: radius.card, borderWidth: 1, borderColor: colors.headerBg, overflow: 'hidden' },
  programDropdownItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.headerBg },
  programLogo: { width: 24, height: 24, borderRadius: 4 },
  programLogoPlaceholder: { width: 24, height: 24, borderRadius: 4, backgroundColor: colors.headerBg },
  programName: { color: colors.white, fontSize: fontSize.md },
  programsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.formBg, padding: spacing.md, borderRadius: radius.card },
  toggleLabel: { color: colors.white, fontSize: fontSize.md, fontWeight: 'bold' },
  toggleSub: { color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 2 },
  error: { color: colors.danger, fontSize: fontSize.sm, textAlign: 'center' },
  submitBtn: { backgroundColor: colors.accent, borderRadius: radius.button, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  submitText: { color: colors.darkBg, fontWeight: 'bold', fontSize: fontSize.md },
});
