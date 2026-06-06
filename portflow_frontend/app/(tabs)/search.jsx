import { useState, useRef } from 'react';
import {
  FlatList, View, StyleSheet, ActivityIndicator, Text,
} from 'react-native';
import PostCard from '../../src/components/PostCard';
import SearchInput from '../../src/components/SearchInput';
import { getPosts } from '../../src/api/posts';
import { colors, spacing } from '../../src/theme';

export default function SearchScreen() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const timeout = useRef(null);

  const fetchPosts = async (pageNum, term) => {
    if (!term) { setPosts([]); return; }
    setLoading(true);
    try {
      const { data } = await getPosts(pageNum, term);
      const results = data.results ?? data;
      setPosts((prev) => (pageNum === 1 ? results : [...prev, ...results]));
      setHasMore(!!data.next);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      setPage(1);
      fetchPosts(1, text);
    }, 400);
  };

  const loadMore = () => {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    fetchPosts(next, search);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SearchInput value={search} onChangeText={handleSearch} placeholder="Buscar artistas e obras..." />
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => <PostCard post={item} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator color={colors.accent} style={styles.footer} /> : null}
        ListEmptyComponent={
          !loading && search
            ? <Text style={styles.empty}>Nenhum resultado para "{search}".</Text>
            : (!search ? <Text style={styles.hint}>Digite para buscar.</Text> : null)
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.darkBg },
  header: { padding: spacing.md, backgroundColor: colors.darkBg },
  list: { padding: spacing.sm },
  row: { justifyContent: 'space-between', marginBottom: spacing.sm },
  footer: { paddingVertical: spacing.lg },
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xxl, fontSize: 16 },
  hint: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xxl, fontSize: 16 },
});
