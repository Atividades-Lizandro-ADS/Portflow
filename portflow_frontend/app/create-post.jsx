import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Image, Switch, KeyboardAvoidingView, Platform,
  Alert, useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createPost } from '../src/api/posts';
import { getPrograms } from '../src/api/programs';
import ProgramChip from '../src/components/ProgramChip';
import { colors, fontSize, spacing, radius } from '../src/theme';

// ─── helpers ────────────────────────────────────────────────────────────────

const CELL_OPTIONS = ['1/3', '2/3', '3/3'];
const GRID_FRACTION = { '1/3': 1 / 3, '2/3': 2 / 3, '3/3': 1 };

function extractYoutubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&\n?#]+)/);
  return m ? m[1] : null;
}
function extractSketchfabId(url) {
  if (!url) return null;
  const m = url.match(/sketchfab\.com\/(?:models|3d-models)\/(?:[^\/]+-)?([a-f0-9]{32})/i)
    ?? url.match(/sketchfab\.com\/(?:models|3d-models)\/([^\/\?]+)/);
  return m ? m[1] : null;
}

// ─── sub-components ─────────────────────────────────────────────────────────

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

function ImageItem({ item, index, onUpdate, onRemove, showCellSizes }) {
  return (
    <View style={styles.imageItem}>
      <TouchableOpacity style={styles.imageItemRemove} onPress={() => onRemove(index)}>
        <Ionicons name="close-circle" size={22} color={colors.danger} />
      </TouchableOpacity>
      <Image source={{ uri: item.uri }} style={styles.imageThumb} resizeMode="cover" />
      <View style={styles.imageFields}>
        <TextInput
          style={styles.input}
          placeholder="Legenda"
          placeholderTextColor={colors.inputBorder}
          value={item.caption}
          onChangeText={(t) => onUpdate(index, 'caption', t)}
          maxLength={240}
        />
        <TextInput
          style={styles.input}
          placeholder="Legenda de acessibilidade"
          placeholderTextColor={colors.inputBorder}
          value={item.acessibilityCaption}
          onChangeText={(t) => onUpdate(index, 'acessibilityCaption', t)}
          maxLength={120}
        />
        {showCellSizes && (
          <View style={styles.cellRow}>
            {[['cell_size_x', 'Largura'], ['cell_size_y', 'Altura']].map(([field, label]) => (
              <View key={field} style={styles.cellGroup}>
                <Text style={styles.cellLabel}>{label}</Text>
                <View style={styles.cellOptions}>
                  {CELL_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.cellBtn, item[field] === opt && styles.cellBtnActive]}
                      onPress={() => onUpdate(index, field, opt)}
                    >
                      <Text style={[styles.cellBtnText, item[field] === opt && styles.cellBtnTextActive]}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

// ─── preview ────────────────────────────────────────────────────────────────

function WebEmbed({ uri, height }) {
  const [loading, setLoading] = useState(true);
  return (
    <View style={{ height, borderRadius: radius.card, overflow: 'hidden', backgroundColor: colors.lightBg }}>
      {loading && (
        <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
          <ActivityIndicator color={colors.accent} />
        </View>
      )}
      <WebView source={{ uri }} style={{ flex: 1 }} onLoadEnd={() => setLoading(false)} javaScriptEnabled />
    </View>
  );
}

function PostPreview({ formData }) {
  const { width: screenWidth } = useWindowDimensions();

  const {
    tittle, caption, description, artType, displayType,
    thumb, galleryImages, youtubeLink, sketchfabLink,
    selectedPrograms, keywords, mviewFile,
  } = formData;

  const artTypeLabel = artType === '3' ? '3D' : '2D';
  const keywordsList = keywords ? keywords.split('#').map((k) => k.trim()).filter(Boolean) : [];

  const displayTitle = tittle.trim() || 'Título da obra';
  const displayCaption = caption.trim() || 'Legenda curta do post';
  const displayDesc = description.trim() || 'A descrição detalhada da sua obra aparecerá aqui.';
  const youtubeId = extractYoutubeId(youtubeLink);
  const sketchfabId = extractSketchfabId(sketchfabLink);
  const embedWidth = screenWidth - spacing.lg * 2;

  return (
    <ScrollView style={styles.previewContainer} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      {/* Thumbnail banner */}
      {thumb ? (
        <Image source={{ uri: thumb.uri }} style={{ width: screenWidth, height: screenWidth * 0.6 }} resizeMode="cover" />
      ) : (
        <View style={[styles.previewBanner, { height: screenWidth * 0.5 }]}>
          <Ionicons name="image-outline" size={48} color={colors.inputBorder} />
          <Text style={styles.previewDummy}>Thumbnail</Text>
        </View>
      )}

      {/* Gallery images */}
      {galleryImages.length > 0 ? (
        displayType === 'album' ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {galleryImages.map((img, idx) => {
              const w = screenWidth * (GRID_FRACTION[img.cell_size_x] ?? 1 / 3);
              const h = screenWidth * (GRID_FRACTION[img.cell_size_y] ?? 1 / 3);
              return <Image key={idx} source={{ uri: img.uri }} style={{ width: w, height: h }} resizeMode="cover" />;
            })}
          </View>
        ) : (
          <View>
            {galleryImages.map((img, idx) => (
              <Image key={idx} source={{ uri: img.uri }} style={{ width: screenWidth, height: screenWidth * 0.75 }} resizeMode="cover" />
            ))}
          </View>
        )
      ) : null}

      {/* Marmoset placeholder */}
      {mviewFile && (
        <View style={[styles.previewEmbedPlaceholder, { margin: spacing.lg }]}>
          <Ionicons name="cube-outline" size={32} color={colors.textSecondary} />
          <Text style={styles.previewDummy}>Marmoset Viewer</Text>
          <Text style={[styles.previewDummy, { fontSize: fontSize.xs }]}>{mviewFile.name}</Text>
        </View>
      )}

      {/* YouTube */}
      {youtubeId && (
        <View style={{ padding: spacing.lg }}>
          <WebEmbed uri={`https://www.youtube.com/embed/${youtubeId}?modestbranding=1&rel=0`} height={embedWidth * 9 / 16} />
        </View>
      )}

      {/* Sketchfab */}
      {sketchfabId && (
        <View style={{ padding: spacing.lg }}>
          <WebEmbed uri={`https://sketchfab.com/models/${sketchfabId}/embed`} height={380} />
        </View>
      )}

      {/* Info */}
      <View style={{ padding: spacing.lg, gap: spacing.md }}>
        <Text style={styles.previewTitle}>{displayTitle}</Text>
        <Text style={styles.previewCaption}>{displayCaption}</Text>
        <Text style={styles.previewDesc}>{displayDesc}</Text>

        {/* Art type + programs */}
        <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
          <View style={styles.previewTag}>
            <Text style={styles.previewTagText}>{artTypeLabel}</Text>
          </View>
          {selectedPrograms.map((p) => (
            <ProgramChip key={p.id} program={p} />
          ))}
        </View>

        {/* Keywords */}
        {keywordsList.length > 0 && (
          <>
            <Text style={styles.previewSectionLabel}>Palavras-chave</Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
              {keywordsList.map((kw, i) => (
                <View key={i} style={styles.previewKeywordTag}>
                  <Text style={styles.previewKeywordText}>#{kw}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Like / save dummy */}
        <View style={styles.previewActions}>
          <View style={styles.previewAction}>
            <Ionicons name="heart-outline" size={22} color={colors.white} />
            <Text style={styles.previewActionText}>Curtir</Text>
          </View>
          <View style={styles.previewAction}>
            <Ionicons name="bookmark-outline" size={22} color={colors.white} />
            <Text style={styles.previewActionText}>Salvar</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// ─── main screen ────────────────────────────────────────────────────────────

export default function CreatePostScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState('form'); // 'form' | 'preview'

  const [tittle, setTittle] = useState('');
  const [caption, setCaption] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [artType, setArtType] = useState('2');
  const [displayType, setDisplayType] = useState('list');
  const [thumb, setThumb] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [mviewFile, setMviewFile] = useState(null);
  const [youtubeLink, setYoutubeLink] = useState('');
  const [sketchfabLink, setSketchfabLink] = useState('');
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [programSearch, setProgramSearch] = useState('');
  const [programResults, setProgramResults] = useState([]);
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [searchingPrograms, setSearchingPrograms] = useState(false);
  const programDebounce = useRef(null);

  const formData = {
    tittle, caption, description, artType, displayType,
    thumb, galleryImages, youtubeLink, sketchfabLink,
    selectedPrograms, keywords, mviewFile,
  };

  const pickThumb = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permissão necessária', 'Precisamos acessar sua galeria.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: true, aspect: [1, 1] });
    if (!result.canceled && result.assets?.[0]) setThumb(result.assets[0]);
  };

  const pickGalleryImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsMultipleSelection: true });
    if (!result.canceled) {
      setGalleryImages((prev) => [
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
          Alert.alert('Arquivo inválido', 'Selecione um arquivo .mview exportado pelo Marmoset Toolbag.');
          return;
        }
        setMviewFile(file);
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível selecionar o arquivo.');
    }
  };

  const updateImageField = (index, field, value) =>
    setGalleryImages((prev) => prev.map((img, i) => i === index ? { ...img, [field]: value } : img));

  const removeImage = (index) => setGalleryImages((prev) => prev.filter((_, i) => i !== index));

  const handleProgramSearch = (text) => {
    setProgramSearch(text);
    setProgramResults([]);
    clearTimeout(programDebounce.current);
    if (!text.trim()) return;
    setSearchingPrograms(true);
    programDebounce.current = setTimeout(async () => {
      try {
        const { data } = await getPrograms(text);
        const selectedIds = selectedPrograms.map((p) => p.id);
        setProgramResults((data.results ?? data).filter((p) => !selectedIds.includes(p.id)));
      } finally { setSearchingPrograms(false); }
    }, 500);
  };

  const addProgram = (program) => { setSelectedPrograms((prev) => [...prev, program]); setProgramResults([]); setProgramSearch(''); };
  const removeProgram = (id) => setSelectedPrograms((prev) => prev.filter((p) => p.id !== id));

  const handleSubmit = async () => {
    if (!tittle.trim()) { setError('O título é obrigatório.'); return; }
    if (!caption.trim()) { setError('A legenda é obrigatória.'); return; }
    if (!description.trim()) { setError('A descrição é obrigatória.'); return; }
    if (!thumb) { setError('Selecione uma thumbnail para o post.'); return; }
    setError('');
    setLoading(true);
    try {
      const form = new FormData();
      form.append('tittle', tittle.trim());
      form.append('caption', caption.trim());
      form.append('description', description.trim());
      if (keywords.trim()) form.append('keywords', keywords.trim());
      form.append('art_type', artType);
      form.append('display_type', displayType);
      form.append('published', published ? 'true' : 'false');
      if (youtubeLink.trim()) form.append('youtube_link', youtubeLink.trim());
      if (sketchfabLink.trim()) form.append('sketchfab_link', sketchfabLink.trim());
      form.append('post_thumb', { uri: thumb.uri, name: thumb.fileName ?? 'thumb.jpg', type: thumb.mimeType ?? 'image/jpeg' });
      if (mviewFile) form.append('marmoview', { uri: mviewFile.uri, name: mviewFile.name, type: 'application/octet-stream' });
      galleryImages.forEach((img) => {
        form.append('post_img[]', { uri: img.uri, name: img.fileName, type: img.mimeType });
        form.append('caption[]', img.caption);
        form.append('acessibility_caption[]', img.acessibilityCaption);
        form.append('cell_size_x[]', img.cell_size_x);
        form.append('cell_size_y[]', img.cell_size_y);
      });
      selectedPrograms.forEach((p) => form.append('used_programs[]', String(p.id)));
      await createPost(form);
      router.back();
    } catch (e) {
      const detail = e.response?.data;
      if (detail && typeof detail === 'object') {
        const first = Object.values(detail)[0];
        setError(Array.isArray(first) ? first[0] : String(first));
      } else {
        setError('Erro ao criar post. Tente novamente.');
      }
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Post</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Mode toggle */}
      <View style={styles.modeBar}>
        {['form', 'preview'].map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
            onPress={() => setMode(m)}
          >
            <Text style={[styles.modeBtnText, mode === m && styles.modeBtnTextActive]}>
              {m === 'form' ? 'Cadastro' : 'Preview'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Preview mode */}
      {mode === 'preview' ? (
        <PostPreview formData={formData} />
      ) : (

        /* Form mode */
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          <SectionLabel>Thumbnail *</SectionLabel>
          <TouchableOpacity style={styles.thumbPicker} onPress={pickThumb} activeOpacity={0.7}>
            {thumb ? (
              <Image source={{ uri: thumb.uri }} style={styles.thumbPreview} />
            ) : (
              <View style={styles.thumbPlaceholder}>
                <Ionicons name="image-outline" size={40} color={colors.textSecondary} />
                <Text style={styles.thumbPlaceholderText}>Toque para selecionar</Text>
              </View>
            )}
          </TouchableOpacity>

          <SectionLabel>Tipo de arte</SectionLabel>
          <TypeSelector options={[{ value: '2', label: '2D' }, { value: '3', label: '3D' }]} value={artType} onChange={setArtType} />

          <SectionLabel>Exibição das imagens</SectionLabel>
          <TypeSelector options={[{ value: 'list', label: 'Lista' }, { value: 'album', label: 'Album' }]} value={displayType} onChange={setDisplayType} />

          <SectionLabel>Título *</SectionLabel>
          <TextInput style={styles.input} placeholder="Título da obra" placeholderTextColor={colors.inputBorder} value={tittle} onChangeText={setTittle} maxLength={150} />

          <SectionLabel>Legenda *</SectionLabel>
          <TextInput style={styles.input} placeholder="Resumo curto (máx 250 caracteres)" placeholderTextColor={colors.inputBorder} value={caption} onChangeText={setCaption} maxLength={250} />

          <SectionLabel>Descrição *</SectionLabel>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Descreva sua obra em detalhes" placeholderTextColor={colors.inputBorder} value={description} onChangeText={setDescription} multiline numberOfLines={5} textAlignVertical="top" />

          <SectionLabel>Palavras-chave</SectionLabel>
          <TextInput style={styles.input} placeholder="#arte #digital #3d ..." placeholderTextColor={colors.inputBorder} value={keywords} onChangeText={setKeywords} />

          {/* Gallery images */}
          <View style={styles.sectionHeader}>
            <SectionLabel>Imagens da galeria</SectionLabel>
            <TouchableOpacity style={styles.addImgBtn} onPress={pickGalleryImages}>
              <Ionicons name="add" size={18} color={colors.accent} />
              <Text style={styles.addImgText}>Adicionar</Text>
            </TouchableOpacity>
          </View>
          {galleryImages.map((img, idx) => (
            <ImageItem key={idx} item={img} index={idx} onUpdate={updateImageField} onRemove={removeImage} showCellSizes={displayType === 'album'} />
          ))}
          {galleryImages.length === 0 && <Text style={styles.emptyHint}>Nenhuma imagem adicionada</Text>}

          {/* Marmoset */}
          <SectionLabel>Marmoset Viewer (.mview)</SectionLabel>
          <TouchableOpacity style={styles.filePicker} onPress={pickMview} activeOpacity={0.7}>
            <Ionicons name="cube-outline" size={22} color={mviewFile ? colors.accent : colors.textSecondary} />
            <Text style={[styles.filePickerText, mviewFile && { color: colors.accent }]}>
              {mviewFile ? mviewFile.name : 'Selecionar arquivo .mview'}
            </Text>
            {mviewFile && (
              <TouchableOpacity onPress={() => setMviewFile(null)}>
                <Ionicons name="close-circle" size={18} color={colors.danger} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {/* Programs */}
          <SectionLabel>Programas utilizados</SectionLabel>
          <View style={styles.programSearch}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Buscar programa..." placeholderTextColor={colors.inputBorder} value={programSearch} onChangeText={handleProgramSearch} autoCapitalize="none" />
            {searchingPrograms && <ActivityIndicator color={colors.accent} style={{ marginLeft: spacing.sm }} />}
          </View>
          {programResults.length > 0 && (
            <View style={styles.programDropdown}>
              {programResults.map((p) => (
                <TouchableOpacity key={p.id} style={styles.programDropdownItem} onPress={() => addProgram(p)}>
                  {p.program_logo
                    ? <Image source={{ uri: p.program_logo }} style={styles.programLogo} />
                    : <View style={styles.programLogoPlaceholder} />}
                  <Text style={styles.programName}>{p.program_name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {selectedPrograms.length > 0 && (
            <View style={styles.programsSelected}>
              {selectedPrograms.map((p) => (
                <ProgramChip key={p.id} program={p} onRemove={() => removeProgram(p.id)} />
              ))}
            </View>
          )}

          <SectionLabel>Link do YouTube (opcional)</SectionLabel>
          <TextInput style={styles.input} placeholder="https://youtube.com/watch?v=..." placeholderTextColor={colors.inputBorder} value={youtubeLink} onChangeText={setYoutubeLink} keyboardType="url" autoCapitalize="none" />

          <SectionLabel>Link do Sketchfab (opcional)</SectionLabel>
          <TextInput style={styles.input} placeholder="https://sketchfab.com/3d-models/..." placeholderTextColor={colors.inputBorder} value={sketchfabLink} onChangeText={setSketchfabLink} keyboardType="url" autoCapitalize="none" />

          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Publicar agora</Text>
              <Text style={styles.toggleSub}>{published ? 'Visível para todos' : 'Salvo como rascunho'}</Text>
            </View>
            <Switch value={published} onValueChange={setPublished} trackColor={{ false: colors.headerBg, true: colors.accent }} thumbColor={colors.white} />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            {loading
              ? <ActivityIndicator color={colors.darkBg} />
              : <Text style={styles.submitText}>{published ? 'Publicar' : 'Salvar rascunho'}</Text>}
          </TouchableOpacity>

        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

// ─── styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.darkBg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingBottom: spacing.md,
    backgroundColor: colors.darkBg, borderBottomWidth: 1, borderBottomColor: colors.headerBg,
  },
  backBtn: { padding: spacing.xs },
  headerTitle: { color: colors.white, fontSize: fontSize.lg, fontWeight: 'bold' },
  // Mode toggle
  modeBar: {
    flexDirection: 'row', backgroundColor: colors.formBg,
    margin: spacing.md, borderRadius: radius.pill, overflow: 'hidden',
  },
  modeBtn: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.pill },
  modeBtnActive: { backgroundColor: colors.darkBg },
  modeBtnText: { color: colors.textSecondary, fontWeight: 'bold', fontSize: fontSize.sm },
  modeBtnTextActive: { color: colors.white },
  // Form
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  sectionLabel: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: 'bold' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addImgBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  addImgText: { color: colors.accent, fontSize: fontSize.sm, fontWeight: 'bold' },
  thumbPicker: { width: '100%', aspectRatio: 1, borderRadius: radius.card, overflow: 'hidden', backgroundColor: colors.lightBg },
  thumbPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  thumbPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  thumbPlaceholderText: { color: colors.textSecondary, fontSize: fontSize.sm },
  typeRow: { flexDirection: 'row', gap: spacing.sm },
  typeBtn: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.button, borderWidth: 1, borderColor: colors.inputBorder, backgroundColor: colors.formBg },
  typeBtnActive: { borderColor: colors.accent, backgroundColor: 'rgba(36,186,255,0.12)' },
  typeBtnText: { color: colors.textSecondary, fontWeight: 'bold', fontSize: fontSize.md },
  typeBtnTextActive: { color: colors.accent },
  input: { backgroundColor: colors.formBg, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: radius.input, color: colors.white, fontSize: fontSize.md, padding: spacing.md },
  textArea: { minHeight: 120 },
  // Gallery images
  imageItem: { backgroundColor: colors.lightBg, borderRadius: radius.card, overflow: 'hidden', position: 'relative' },
  imageItemRemove: { position: 'absolute', top: spacing.sm, right: spacing.sm, zIndex: 10 },
  imageThumb: { width: '100%', height: 180, resizeMode: 'cover' },
  imageFields: { padding: spacing.md, gap: spacing.sm },
  cellRow: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.xs },
  cellGroup: { flex: 1, gap: spacing.xs },
  cellLabel: { color: colors.textSecondary, fontSize: fontSize.xs },
  cellOptions: { flexDirection: 'row', gap: spacing.xs },
  cellBtn: { flex: 1, paddingVertical: spacing.xs, alignItems: 'center', borderRadius: radius.input, borderWidth: 1, borderColor: colors.inputBorder },
  cellBtnActive: { borderColor: colors.accent, backgroundColor: 'rgba(36,186,255,0.12)' },
  cellBtnText: { color: colors.textSecondary, fontSize: fontSize.xs },
  cellBtnTextActive: { color: colors.accent },
  emptyHint: { color: colors.inputBorder, fontSize: fontSize.sm, textAlign: 'center', paddingVertical: spacing.sm },
  // Marmoset file
  filePicker: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.formBg, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: radius.input, padding: spacing.md },
  filePickerText: { flex: 1, color: colors.textSecondary, fontSize: fontSize.sm },
  // Programs
  programSearch: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  programDropdown: { backgroundColor: colors.lightBg, borderRadius: radius.card, borderWidth: 1, borderColor: colors.headerBg, overflow: 'hidden' },
  programDropdownItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.headerBg },
  programLogo: { width: 24, height: 24, borderRadius: 4 },
  programLogoPlaceholder: { width: 24, height: 24, borderRadius: 4, backgroundColor: colors.headerBg },
  programName: { color: colors.white, fontSize: fontSize.md },
  programsSelected: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  // Toggle
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.formBg, padding: spacing.md, borderRadius: radius.card },
  toggleLabel: { color: colors.white, fontSize: fontSize.md, fontWeight: 'bold' },
  toggleSub: { color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 2 },
  error: { color: colors.danger, fontSize: fontSize.sm, textAlign: 'center' },
  submitBtn: { backgroundColor: colors.accent, borderRadius: radius.button, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  submitText: { color: colors.darkBg, fontWeight: 'bold', fontSize: fontSize.md },
  // Preview
  previewContainer: { flex: 1, backgroundColor: colors.darkBg },
  previewBanner: { backgroundColor: colors.lightBg, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  previewDummy: { color: colors.inputBorder, fontSize: fontSize.sm },
  previewEmbedPlaceholder: { backgroundColor: colors.lightBg, borderRadius: radius.card, height: 120, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  previewTitle: { color: colors.white, fontSize: fontSize.xl, fontWeight: 'bold' },
  previewCaption: { color: colors.textSecondary, fontSize: fontSize.md },
  previewDesc: { color: colors.textSecondary, fontSize: fontSize.md, lineHeight: 22 },
  previewTag: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.headerBg, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  previewTagText: { color: colors.white, fontSize: fontSize.sm },
  previewSectionLabel: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: 'bold', marginTop: spacing.xs },
  previewKeywordTag: { backgroundColor: colors.headerBg, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  previewKeywordText: { color: colors.accent, fontSize: fontSize.sm },
  previewActions: { flexDirection: 'row', gap: spacing.lg },
  previewAction: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  previewActionText: { color: colors.white, fontSize: fontSize.sm },
});
