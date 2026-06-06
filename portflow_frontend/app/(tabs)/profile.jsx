import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, Image,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../../src/components/Avatar';
import PostCard from '../../src/components/PostCard';
import ProgramChip from '../../src/components/ProgramChip';
import { useAuth } from '../../src/context/AuthContext';
import { getProfile } from '../../src/api/profiles';
import { colors, fontSize, spacing, radius } from '../../src/theme';

function GuestScreen() {
  const router = useRouter();
  return (
    <View style={styles.guestContainer}>
      <Ionicons name="person-circle-outline" size={80} color={colors.textSecondary} />
      <Text style={styles.guestTitle}>Você não tem uma conta</Text>
      <Text style={styles.guestSub}>Crie uma conta ou faça login para acessar seu perfil.</Text>
      <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/(auth)/login')}>
        <Text style={styles.loginBtnText}>Entrar / Cadastrar</Text>
      </TouchableOpacity>
    </View>
  );
}

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

function SectionTitle({ children }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function AboutSection({ about, isOwner, onEdit }) {
  if (!about) return null;
  return (
    <View style={styles.aboutCard}>
      <View style={styles.aboutHeader}>
        <Text style={styles.aboutTitle}>Sobre</Text>
        {isOwner && (
          <TouchableOpacity onPress={onEdit} style={styles.editBtn}>
            <Ionicons name="pencil-outline" size={16} color={colors.accent} />
            <Text style={styles.editBtnText}>Editar</Text>
          </TouchableOpacity>
        )}
      </View>

      {about.summary ? <Text style={styles.summary}>{about.summary}</Text> : null}

      {about.hiring?.length > 0 && (
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

      {about.skills?.length > 0 && (
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

      {about.programs_known?.length > 0 && (
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
  );
}

export default function MyProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!user?.profile_id) { setLoading(false); return; }
      setLoading(true);
      getProfile(user.profile_id)
        .then(({ data }) => setProfile(data))
        .finally(() => setLoading(false));
    }, [user?.profile_id])
  );

  if (!user) return <GuestScreen />;

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja mesmo sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: async () => { await logout(); } },
    ]);
  };

  const handleEditAbout = () => {
    if (!profile?.about) return;
    router.push({
      pathname: '/edit-about',
      params: {
        aboutId: profile.about.id,
        summary: profile.about.summary ?? '',
        hiring: JSON.stringify(profile.about.hiring ?? []),
        skills: JSON.stringify(profile.about.skills ?? []),
        programs: JSON.stringify(profile.about.programs_known ?? []),
      },
    });
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.accent} size="large" /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>

      {/* Banner */}
      {profile?.profile_banner ? (
        <Image source={{ uri: profile.profile_banner }} style={styles.banner} resizeMode="cover" />
      ) : (
        <View style={[styles.banner, styles.bannerPlaceholder]} />
      )}

      {/* Header */}
      <View style={[styles.profileHeader, { paddingTop: insets.top + spacing.sm }]}>
        <Avatar uri={profile?.user_picture} size={80} />
        <View style={styles.profileInfo}>
          <Text style={styles.firstName}>{profile?.first_name ?? ''}</Text>
          <Text style={styles.username}>@{profile?.username ?? user.username}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>

      {/* About */}
      <AboutSection about={profile?.about} isOwner onEdit={handleEditAbout} />

      {/* Published posts */}
      <SectionTitle>Portfolio</SectionTitle>
      <PostsGrid posts={profile?.posts} />

      {/* Drafts */}
      {profile?.drafts?.length > 0 && (
        <>
          <SectionTitle>Meus Rascunhos</SectionTitle>
          <PostsGrid posts={profile.drafts} />
        </>
      )}

      {profile?.liked_posts?.length > 0 && (
        <>
          <SectionTitle>Meus Likes</SectionTitle>
          <PostsGrid posts={profile.liked_posts} />
        </>
      )}

      {profile?.saved_posts !== undefined && (
        <>
          <SectionTitle>Favoritos</SectionTitle>
          <PostsGrid posts={profile.saved_posts} />
        </>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.darkBg },
  center: { flex: 1, backgroundColor: colors.darkBg, alignItems: 'center', justifyContent: 'center' },
  guestContainer: { flex: 1, backgroundColor: colors.darkBg, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.lg },
  guestTitle: { color: colors.white, fontSize: fontSize.xl, fontWeight: 'bold', textAlign: 'center' },
  guestSub: { color: colors.textSecondary, fontSize: fontSize.md, textAlign: 'center', lineHeight: 22 },
  loginBtn: { backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, marginTop: spacing.sm },
  loginBtnText: { color: colors.darkBg, fontWeight: 'bold', fontSize: fontSize.md },
  banner: { width: '100%', height: 160, backgroundColor: colors.lightBg },
  bannerPlaceholder: { backgroundColor: colors.lightBg },
  profileHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingBottom: spacing.md,
    marginTop: -40, backgroundColor: colors.darkBg,
  },
  profileInfo: { flex: 1 },
  firstName: { color: colors.white, fontSize: fontSize.lg, fontWeight: 'bold' },
  username: { color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 2 },
  logoutBtn: { padding: spacing.sm },
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
  sectionTitle: { color: colors.white, fontSize: fontSize.lg, fontWeight: 'bold', marginHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.sm, gap: spacing.sm },
  gridItem: { width: '48.5%' },
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md, fontSize: fontSize.sm, paddingHorizontal: spacing.lg },
});
