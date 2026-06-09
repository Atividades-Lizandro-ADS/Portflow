import { useState, useCallback } from 'react';
import {
  FlatList, View, StyleSheet, ActivityIndicator, RefreshControl, Text,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import PostCard from '../../src/components/PostCard';
import Navbar from '../../src/components/Navbar';
import { getPosts } from '../../src/api/posts';
import { colors, spacing } from '../../src/theme';

const CARD_GAP = spacing.sm;

export default function FeedScreen() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = useCallback(async (pageNum, isRefresh = false) => {
    if (loading && !isRefresh) return;
    setLoading(true);
    try {
      const { data } = await getPosts(pageNum);
      const results = data.results ?? data;
      setPosts((prev) => (pageNum === 1 ? results : [...prev, ...results]));
      setHasMore(!!data.next);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setPosts([]);
      setPage(1);
      setHasMore(true);
      fetchPosts(1);
    }, [])
  );

  const loadMore = () => {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    fetchPosts(next);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchPosts(1, true);
  };

  return (
    <View style={styles.container}>
      <Navbar />
      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => <PostCard post={item} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
        ListFooterComponent={
          loading && !refreshing
            ? <ActivityIndicator color={colors.accent} style={styles.footer} />
            : null
        }
        ListEmptyComponent={
          !loading
            ? <Text style={styles.empty}>Nenhum post encontrado.</Text>
            : null
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.darkBg },
  list: { padding: CARD_GAP },
  row: { justifyContent: 'space-between', marginBottom: CARD_GAP },
  footer: { paddingVertical: spacing.lg },
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xxl, fontSize: 16 },
});
