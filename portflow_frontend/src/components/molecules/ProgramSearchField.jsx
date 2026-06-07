import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native';
import ProgramChip from '../ProgramChip';
import { getPrograms } from '../../api/programs';
import { colors, fontSize, spacing, radius } from '../../theme';

export default function ProgramSearchField({ selected, onAdd, onRemove }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounce = useRef(null);

  const handleSearch = (text) => {
    setSearch(text);
    setResults([]);
    clearTimeout(debounce.current);
    if (!text.trim()) return;
    setSearching(true);
    debounce.current = setTimeout(async () => {
      try {
        const { data } = await getPrograms(text);
        const selectedIds = selected.map((p) => p.id);
        setResults((data.results ?? data).filter((p) => !selectedIds.includes(p.id)));
      } finally { setSearching(false); }
    }, 500);
  };

  const handleAdd = (program) => {
    onAdd(program);
    setResults([]);
    setSearch('');
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.searchRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Buscar programa..."
          placeholderTextColor={colors.inputBorder}
          value={search}
          onChangeText={handleSearch}
          autoCapitalize="none"
        />
        {searching && <ActivityIndicator color={colors.accent} style={{ marginLeft: spacing.sm }} />}
      </View>
      {results.length > 0 && (
        <View style={styles.dropdown}>
          {results.map((p) => (
            <TouchableOpacity key={p.id} style={styles.dropdownItem} onPress={() => handleAdd(p)}>
              {p.program_logo
                ? <Image source={{ uri: p.program_logo }} style={styles.logo} />
                : <View style={styles.logoPlaceholder} />}
              <Text style={styles.programName}>{p.program_name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {selected.length > 0 && (
        <View style={styles.selected}>
          {selected.map((p) => (
            <ProgramChip key={p.id} program={p} onRemove={() => onRemove(p.id)} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  searchRow: { flexDirection: 'row', alignItems: 'center' },
  input: { backgroundColor: colors.formBg, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: radius.input, color: colors.white, fontSize: fontSize.md, padding: spacing.md },
  dropdown: { backgroundColor: colors.lightBg, borderRadius: radius.card, borderWidth: 1, borderColor: colors.headerBg, overflow: 'hidden' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.headerBg },
  logo: { width: 24, height: 24, borderRadius: 4 },
  logoPlaceholder: { width: 24, height: 24, borderRadius: 4, backgroundColor: colors.headerBg },
  programName: { color: colors.white, fontSize: fontSize.md },
  selected: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
