import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SearchInput from '../src/components/SearchInput';
import PostCard from '../src/components/PostCard';
import Avatar from '../src/components/Avatar';
import { searchProfiles } from '../src/api/profiles';
import { getPosts } from '../src/api/posts';
import { colors, fontSize, spacing, radius } from '../src/theme';

const CARD_GAP = spacing.sm;

function ProfileItem({ profile }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={styles.profileItem}
      onPress={() => router.push(`/profile/${profile.id}`)}
      activeOpacity={0.7}
    >
      <Avatar uri={profile.user_picture} size={44} />
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{profile.first_name || profile.username}</Text>
        <Text style={styles.profileUsername}>@{profile.username}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const { q } = useLocalSearchParams();
  const router = useRouter();

  const [searchText, setSearchText] = useState(q ?? '');
  const [profiles, setProfiles] = useState([]);
  const [profilePage, setProfilePage] = useState(1);
  const [hasMoreProfiles, setHasMoreProfiles] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [loadingMoreProfiles, setLoadingMoreProfiles] = useState(false);

  const [posts, setPosts] = useState([]);
  const [postPage, setPostPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const runSearch = useCallback(async (query) => {
    if (!query.trim()) return;

    setLoadingProfiles(true);
    setLoadingPosts(true);
    setProfiles([]);
    setProfilePage(1);
    setPosts([]);
    setPostPage(1);

    const [profileRes, postRes] = await Promise.allSettled([
      searchProfiles(query, 1),
      getPosts(1, query),
    ]);

    if (profileRes.status === 'fulfilled') {
      const data = profileRes.value.data;
      setProfiles(data.results ?? data);
      setHasMoreProfiles(!!data.next);
    }
    setLoadingProfiles(false);

    if (postRes.status === 'fulfilled') {
      const data = postRes.value.data;
      setPosts(data.results ?? data);
      setHasMorePosts(!!data.next);
    }
    setLoadingPosts(false);
  }, []);

  useEffect(() => {
    if (q) runSearch(q);
  }, [q]);

  const handleSubmit = () => {
    const query = searchText.trim();
    if (!query) return;
    router.setParams({ q: query });
    runSearch(query);
  };

  const loadMoreProfiles = async () => {
    if (!hasMoreProfiles || loadingMoreProfiles) return;
    setLoadingMoreProfiles(true);
    const next = profilePage + 1;
    try {
      const { data } = await searchProfiles(q, next);
      setProfiles((prev) => [...prev, ...(data.results ?? data)]);
      setHasMoreProfiles(!!data.next);
      setProfilePage(next);
    } finally {
      setLoadingMoreProfiles(false);
    }
  };

  const loadMorePosts = () => {
    if (!hasMorePosts || loadingPosts) return;
    const next = postPage + 1;
    setPostPage(next);
    setLoadingPosts(true);
    getPosts(next, q)
      .then(({ data }) => {
        setPosts((prev) => [...prev, ...(data.results ?? data)]);
        setHasMorePosts(!!data.next);
      })
      .finally(() => setLoadingPosts(false));
  };

  const ListHeader = (
    <View>
      {/* Artistas */}
      <Text style={styles.sectionTitle}>Artistas</Text>
      {loadingProfiles ? (
        <ActivityIndicator color={colors.accent} style={styles.sectionLoader} />
      ) : profiles.length === 0 ? (
        <Text style={styles.empty}>Nenhum artista encontrado.</Text>
      ) : (
        <>
          {profiles.map((p) => <ProfileItem key={p.id} profile={p} />)}
          {hasMoreProfiles && (
            <TouchableOpacity
              style={styles.loadMoreBtn}
              onPress={loadMoreProfiles}
              disabled={loadingMoreProfiles}
            >
              {loadingMoreProfiles
                ? <ActivityIndicator color={colors.accent} size="small" />
                : <Text style={styles.loadMoreText}>Carregar mais artistas</Text>}
            </TouchableOpacity>
          )}
        </>
      )}

      {/* Posts */}
      <Text style={[styles.sectionTitle, styles.sectionTitlePosts]}>Posts</Text>
      {loadingPosts && posts.length === 0 && (
        <ActivityIndicator color={colors.accent} style={styles.sectionLoader} />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.searchWrapper}>
          <SearchInput
            value={searchText}
            onChangeText={setSearchText}
            onSubmit={handleSubmit}
            placeholder="Buscar posts e artistas..."
          />
        </View>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => <PostCard post={item} />}
        ListHeaderComponent={ListHeader}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingPosts && posts.length > 0
            ? <ActivityIndicator color={colors.accent} style={styles.footer} />
            : null
        }
        ListEmptyComponent={
          !loadingPosts && !loadingProfiles && posts.length === 0
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    paddingTop: spacing.xl,
    backgroundColor: colors.darkBg,
  },
  backBtn: {
    padding: spacing.xs,
  },
  searchWrapper: { flex: 1 },
  list: { padding: CARD_GAP },
  row: { justifyContent: 'space-between', marginBottom: CARD_GAP },
  sectionTitle: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  sectionTitlePosts: { marginTop: spacing.xl },
  sectionLoader: { marginVertical: spacing.lg },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.headerBg,
  },
  profileInfo: { flex: 1 },
  profileName: { color: colors.white, fontSize: fontSize.md, fontWeight: 'bold' },
  profileUsername: { color: colors.textSecondary, fontSize: fontSize.sm },
  loadMoreBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.button,
  },
  loadMoreText: { color: colors.accent, fontWeight: 'bold', fontSize: fontSize.sm },
  empty: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.md,
  },
  footer: { paddingVertical: spacing.lg },
});
