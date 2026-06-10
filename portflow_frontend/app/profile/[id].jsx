import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, Image,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../../src/components/Avatar';
import PostCard from '../../src/components/PostCard';
import ProgramChip from '../../src/components/ProgramChip';
import { useAuth } from '../../src/context/AuthContext';
import { getProfile } from '../../src/api/profiles';
import { colors, fontSize, spacing, radius } from '../../src/theme';

function PostsGrid({ posts }) {
  if (!posts?.length) return <Text style={styles.empty}>Nenhum post aqui ainda.</Text>;
  return (
    <View style={styles.grid}>
      {posts.map((item) => (
        <View key={item.id} style={styles.gridItem}>
          <PostCard post={item} />
        </View>
      ))}
    </View>
  );
}

export default function ProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('portfolio');

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      getProfile(id)
        .then(({ data }) => setProfile(data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [id])
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.accent} size="large" /></View>;
  }

  const isOwner = user?.profile_id === Number(id);
  const about = profile?.about;
  const posts = profile?.posts ?? [];
  const drafts = profile?.drafts ?? [];
  const likedPosts = profile?.liked_posts ?? [];

  const handleEditAbout = () => {
    if (!about) return;
    router.push({
      pathname: '/edit-about',
      params: {
        aboutId: about.id,
        summary: about.summary ?? '',
        hiring: JSON.stringify(about.hiring ?? []),
        skills: JSON.stringify(about.skills ?? []),
        programs: JSON.stringify(about.programs_known ?? []),
      },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>

      {/* Banner */}
      {profile?.profile_banner ? (
        <Image source={{ uri: profile.profile_banner }} style={styles.banner} resizeMode="cover" />
      ) : (
        <View style={[styles.banner, styles.bannerPlaceholder]} />
      )}

      {/* Back button */}
      <TouchableOpacity style={[styles.backBtn, { top: insets.top + spacing.sm }]} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={colors.white} />
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.profileHeader}>
        <Avatar uri={profile?.user_picture} size={80} />
        <View style={styles.profileInfo}>
          <Text style={styles.firstName}>{profile?.first_name || profile?.username}</Text>
          <Text style={styles.username}>@{profile?.username}</Text>
        </View>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {['portfolio', 'sobre'].map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'portfolio' ? 'Portfolio' : 'Sobre'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'portfolio' && (
        <>
          <PostsGrid posts={posts} />

          {isOwner && drafts.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Meus Rascunhos</Text>
              <PostsGrid posts={drafts} />
            </>
          )}

          {isOwner && likedPosts.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Meus Likes</Text>
              <PostsGrid posts={likedPosts} />
            </>
          )}
        </>
      )}

      {tab === 'sobre' && (
        <View style={styles.aboutCard}>
          <View style={styles.aboutHeader}>
            <Text style={styles.aboutTitle}>Sobre</Text>
            {isOwner && about && (
              <TouchableOpacity onPress={handleEditAbout} style={styles.editBtn}>
                <Ionicons name="pencil-outline" size={16} color={colors.accent} />
                <Text style={styles.editBtnText}>Editar</Text>
              </TouchableOpacity>
            )}
          </View>

          {!about && (
            <Text style={styles.empty}>Nenhuma informação disponível.</Text>
          )}

          {about?.summary ? <Text style={styles.summary}>{about.summary}</Text> : null}

          {about?.hiring?.length > 0 && (
            <View style={styles.aboutGroup}>
              <Text style={styles.aboutGroupLabel}>Disponível para</Text>
              <View style={styles.chipsRow}>
                {about.hiring.map((h) => (
                  <View key={h.id} style={styles.tagChip}>
                    <Text style={styles.tagChipText}>{h.hire_type}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {about?.skills?.length > 0 && (
            <View style={styles.aboutGroup}>
              <Text style={styles.aboutGroupLabel}>Habilidades</Text>
              <View style={styles.chipsRow}>
                {about.skills.map((s) => (
                  <View key={s.id} style={styles.tagChip}>
                    <Text style={styles.tagChipText}>{s.skill_type}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {about?.programs_known?.length > 0 && (
            <View style={styles.aboutGroup}>
              <Text style={styles.aboutGroupLabel}>Programas</Text>
              <View style={styles.chipsRow}>
                {about.programs_known.map((p) => (
                  <ProgramChip key={p.id} program={p} />
                ))}
              </View>
            </View>
          )}
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.darkBg },
  center: { flex: 1, backgroundColor: colors.darkBg, alignItems: 'center', justifyContent: 'center' },
  banner: { width: '100%', height: 200 },
  bannerPlaceholder: { backgroundColor: colors.lightBg },
  backBtn: {
    position: 'absolute', left: spacing.md, zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 20, padding: spacing.sm,
  },
  profileHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    marginTop: -40, backgroundColor: colors.darkBg,
  },
  profileInfo: { flex: 1 },
  firstName: { color: colors.white, fontSize: fontSize.lg, fontWeight: 'bold' },
  username: { color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 2 },
  aboutCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md, backgroundColor: colors.lightBg, borderRadius: radius.card, padding: spacing.lg, gap: spacing.md },
  aboutHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  aboutTitle: { color: colors.white, fontSize: fontSize.lg, fontWeight: 'bold' },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  editBtnText: { color: colors.accent, fontSize: fontSize.sm, fontWeight: 'bold' },
  summary: { color: colors.textSecondary, fontSize: fontSize.md, lineHeight: 22 },
  aboutGroup: { gap: spacing.sm },
  aboutGroupLabel: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: 'bold' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tagChip: { backgroundColor: colors.headerBg, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  tagChipText: { color: colors.white, fontSize: fontSize.sm },
  tabBar: { flexDirection: 'row', backgroundColor: colors.formBg, marginHorizontal: spacing.lg, borderRadius: radius.pill, overflow: 'hidden', marginBottom: spacing.md },
  tabBtn: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.pill },
  tabActive: { backgroundColor: colors.darkBg },
  tabText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: 'bold' },
  tabTextActive: { color: colors.white },
  sectionTitle: { color: colors.white, fontSize: fontSize.lg, fontWeight: 'bold', marginHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.sm, gap: spacing.sm },
  gridItem: { width: '48.5%' },
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md, fontSize: fontSize.sm, paddingHorizontal: spacing.lg },
});
