import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getPost, updatePost } from '../../src/api/posts';
import { updatePostImage, deletePostImage } from '../../src/api/post-images';
import SectionLabel from '../../src/components/atoms/SectionLabel';
import TypeSelector from '../../src/components/molecules/TypeSelector';
import ThumbPickerField from '../../src/components/molecules/ThumbPickerField';
import GalleryField from '../../src/components/molecules/GalleryField';
import MviewPickerField from '../../src/components/molecules/MviewPickerField';
import ProgramSearchField from '../../src/components/molecules/ProgramSearchField';
import PublishToggle from '../../src/components/molecules/PublishToggle';
import PostPreview from '../../src/components/organisms/PostPreview';
import { colors, fontSize, spacing, radius } from '../../src/theme';

function normalizeExistingImage(img) {
  return {
    id: img.id,
    uri: img.post_img,
    caption: img.caption ?? '',
    acessibilityCaption: img.acessibility_caption ?? '',
    cell_size_x: img.cell_size_x ?? '1/3',
    cell_size_y: img.cell_size_y ?? '1/3',
    is_mature: img.is_mature ?? false,
  };
}

export default function EditPostScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState('form');
  const [pageLoading, setPageLoading] = useState(true);
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

  const [currentThumb, setCurrentThumb] = useState(null);
  const [newThumb, setNewThumb] = useState(null);
  const [currentMview, setCurrentMview] = useState(null);
  const [newMview, setNewMview] = useState(null);

  const [isMature, setIsMature] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [selectedPrograms, setSelectedPrograms] = useState([]);

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
      setIsMature(data.is_mature ?? false);
      setCurrentThumb(data.post_thumb ?? null);
      setCurrentMview(data.marmoview ?? null);
      setSelectedPrograms(data.used_programs ?? []);
      setExistingImages((data.images ?? []).map(normalizeExistingImage));
    }).finally(() => setPageLoading(false));
  }, [id]);

  const updateExistingImageField = (index, field, value) =>
    setExistingImages((prev) => prev.map((img, i) => (i === index ? { ...img, [field]: value } : img)));

  const removeExistingImage = (index) => {
    const img = existingImages[index];
    setRemovedImageIds((prev) => [...prev, img.id]);
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const updateNewImageField = (index, field, value) =>
    setNewImages((prev) => prev.map((img, i) => (i === index ? { ...img, [field]: value } : img)));

  const removeNewImage = (index) => setNewImages((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!tittle.trim()) { setError('O título é obrigatório.'); return; }
    if (!caption.trim()) { setError('A legenda é obrigatória.'); return; }
    if (!description.trim()) { setError('A descrição é obrigatória.'); return; }
    setError('');
    setSaving(true);
    try {
      await Promise.all(removedImageIds.map((imgId) => deletePostImage(imgId)));

      await Promise.all(existingImages.map((img) =>
        updatePostImage(img.id, {
          caption: img.caption,
          acessibility_caption: img.acessibilityCaption,
          cell_size_x: img.cell_size_x,
          cell_size_y: img.cell_size_y,
          is_mature: img.is_mature,
        })
      ));

      const form = new FormData();
      form.append('tittle', tittle.trim());
      form.append('caption', caption.trim());
      form.append('description', description.trim());
      form.append('keywords', keywords.trim());
      form.append('art_type', artType);
      form.append('display_type', displayType);
      form.append('published', published ? 'true' : 'false');
      form.append('is_mature', isMature ? 'true' : 'false');
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
        form.append('is_mature[]', img.is_mature ? 'true' : 'false');
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

  if (pageLoading) {
    return <View style={styles.center}><ActivityIndicator color={colors.accent} size="large" /></View>;
  }

  const thumbUri = newThumb?.uri ?? currentThumb;
  const allGalleryImages = [...existingImages, ...newImages];

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Post</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.modeBar}>
        {['form', 'preview'].map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
            onPress={() => setMode(m)}
          >
            <Text style={[styles.modeBtnText, mode === m && styles.modeBtnTextActive]}>
              {m === 'form' ? 'Edição' : 'Preview'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode === 'preview' ? (
        <PostPreview
          tittle={tittle}
          description={description}
          artType={artType}
          displayType={displayType}
          galleryImages={allGalleryImages}
          youtubeLink={youtubeLink}
          sketchfabLink={sketchfabLink}
          selectedPrograms={selectedPrograms}
          keywords={keywords}
          mviewFileName={newMview?.name ?? (currentMview ? 'Arquivo existente' : null)}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <SectionLabel>Thumbnail</SectionLabel>
          <ThumbPickerField thumbUri={thumbUri} onPick={setNewThumb} showEditOverlay={!!thumbUri} />

          <SectionLabel>Tipo de arte</SectionLabel>
          <TypeSelector
            options={[{ value: '2', label: '2D' }, { value: '3', label: '3D' }]}
            value={artType}
            onChange={setArtType}
          />

          <SectionLabel>Exibição das imagens</SectionLabel>
          <TypeSelector
            options={[{ value: 'list', label: 'Lista' }, { value: 'album', label: 'Album' }]}
            value={displayType}
            onChange={setDisplayType}
          />

          <SectionLabel>Título *</SectionLabel>
          <TextInput
            style={styles.input}
            placeholder="Título da obra"
            placeholderTextColor={colors.inputBorder}
            value={tittle}
            onChangeText={setTittle}
            maxLength={150}
          />

          <SectionLabel>Legenda *</SectionLabel>
          <TextInput
            style={styles.input}
            placeholder="Resumo curto (máx 250 caracteres)"
            placeholderTextColor={colors.inputBorder}
            value={caption}
            onChangeText={setCaption}
            maxLength={250}
          />

          <SectionLabel>Descrição *</SectionLabel>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descreva sua obra em detalhes"
            placeholderTextColor={colors.inputBorder}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          <SectionLabel>Palavras-chave</SectionLabel>
          <TextInput
            style={styles.input}
            placeholder="#arte #digital #3d ..."
            placeholderTextColor={colors.inputBorder}
            value={keywords}
            onChangeText={setKeywords}
          />

          <GalleryField
            images={newImages}
            onAdd={(imgs) => setNewImages((prev) => [...prev, ...imgs])}
            onUpdate={updateNewImageField}
            onRemove={removeNewImage}
            showCellSizes={displayType === 'album'}
            existingImages={existingImages}
            onUpdateExisting={updateExistingImageField}
            onRemoveExisting={removeExistingImage}
          />

          <SectionLabel>Marmoset Viewer (.mview)</SectionLabel>
          <MviewPickerField
            current={currentMview}
            picked={newMview}
            onPick={setNewMview}
            onRemovePicked={() => setNewMview(null)}
          />

          <SectionLabel>Programas utilizados</SectionLabel>
          <ProgramSearchField
            selected={selectedPrograms}
            onAdd={(p) => setSelectedPrograms((prev) => [...prev, p])}
            onRemove={(id) => setSelectedPrograms((prev) => prev.filter((p) => p.id !== id))}
          />

          <SectionLabel>Link do YouTube (opcional)</SectionLabel>
          <TextInput
            style={styles.input}
            placeholder="https://youtube.com/watch?v=..."
            placeholderTextColor={colors.inputBorder}
            value={youtubeLink}
            onChangeText={setYoutubeLink}
            keyboardType="url"
            autoCapitalize="none"
          />

          <SectionLabel>Link do Sketchfab (opcional)</SectionLabel>
          <TextInput
            style={styles.input}
            placeholder="https://sketchfab.com/3d-models/..."
            placeholderTextColor={colors.inputBorder}
            value={sketchfabLink}
            onChangeText={setSketchfabLink}
            keyboardType="url"
            autoCapitalize="none"
          />

          <PublishToggle value={published} onChange={setPublished} />

          <View style={styles.matureRow}>
            <View style={styles.matureLabelGroup}>
              <Text style={styles.matureLabel}>Conteúdo maduro</Text>
              <Text style={styles.matureHint}>
                Se apenas parte do post tiver conteúdo sensível, marque as imagens individualmente. A thumbnail não deve conter conteúdo sensível.
              </Text>
            </View>
            <Switch
              value={isMature}
              onValueChange={setIsMature}
              trackColor={{ false: colors.inputBorder, true: colors.accent }}
              thumbColor={colors.white}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={saving}>
            {saving
              ? <ActivityIndicator color={colors.darkBg} />
              : <Text style={styles.submitText}>Salvar alterações</Text>}
          </TouchableOpacity>
        </ScrollView>
      )}
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
  modeBar: {
    flexDirection: 'row', backgroundColor: colors.formBg,
    margin: spacing.md, borderRadius: radius.pill, overflow: 'hidden',
  },
  modeBtn: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.pill },
  modeBtnActive: { backgroundColor: colors.darkBg },
  modeBtnText: { color: colors.textSecondary, fontWeight: 'bold', fontSize: fontSize.sm },
  modeBtnTextActive: { color: colors.white },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  input: { backgroundColor: colors.formBg, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: radius.input, color: colors.white, fontSize: fontSize.md, padding: spacing.md },
  textArea: { minHeight: 120 },
  error: { color: colors.danger, fontSize: fontSize.sm, textAlign: 'center' },
  submitBtn: { backgroundColor: colors.accent, borderRadius: radius.button, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  submitText: { color: colors.darkBg, fontWeight: 'bold', fontSize: fontSize.md },
  matureRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  matureLabelGroup: { flex: 1, gap: spacing.xs },
  matureLabel: { color: colors.white, fontSize: fontSize.md, fontWeight: 'bold' },
  matureHint: { color: colors.textSecondary, fontSize: fontSize.xs, lineHeight: 18 },
});
