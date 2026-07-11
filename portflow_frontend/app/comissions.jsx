import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TabSwitch from '../src/components/molecules/TabSwitch';
import TierCard from '../src/components/molecules/TierCard';
import TierDetailModal from '../src/components/organisms/TierDetailModal';
import { useAuth } from '../src/context/AuthContext';
import { getProfile } from '../src/api/profiles';
import { colors, fontSize, spacing, radius } from '../src/theme';

const COMISSIONS_TABS = [
  { id: 'chats', label: 'Chats' },
  { id: 'tiers', label: 'Tiers' },
];

export default function ComissionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [tab, setTab] = useState('chats');
  const [profile, setProfile] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);

  useFocusEffect(
    useCallback(() => {
      if (!user?.profile_id) return;
      getProfile(user.profile_id).then(({ data }) => setProfile(data));
    }, [user?.profile_id])
  );

  const tiers = profile?.commission_tiers ?? [];

  return (
    <>
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.title}>Comissions</Text>
      </View>

      <View style={styles.tabBarWrap}>
        <TabSwitch options={COMISSIONS_TABS} active={tab} onChange={setTab} />
      </View>

      {tab === 'chats' && (
        <Text style={styles.empty}>Nenhum chat por aqui ainda.</Text>
      )}

      {tab === 'tiers' && (
        <View style={styles.tierList}>
          {tiers.map((tier) => (
            <TierCard key={tier.id} tier={tier} onPress={() => setSelectedTier(tier)} />
          ))}
          {!tiers.length && (
            <Text style={styles.empty}>Nenhum tier cadastrado ainda.</Text>
          )}
          <TouchableOpacity style={styles.addTierBtn} onPress={() => router.push('/comission-tier-form')}>
            <Ionicons name="add" size={18} color={colors.darkBg} />
            <Text style={styles.addTierBtnText}>Adicionar tier</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>

      <TierDetailModal
        visible={!!selectedTier}
        tier={selectedTier}
        onClose={() => setSelectedTier(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.darkBg },
  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  title: { color: colors.white, fontSize: fontSize.xl, fontWeight: 'bold' },
  tabBarWrap: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  empty: { color: colors.textSecondary, fontSize: fontSize.sm, marginHorizontal: spacing.lg },
  tierList: { paddingHorizontal: spacing.lg, gap: spacing.md },
  addTierBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
    backgroundColor: colors.accent, borderRadius: radius.button,
    paddingVertical: spacing.md,
  },
  addTierBtnText: { color: colors.darkBg, fontSize: fontSize.sm, fontWeight: 'bold' },
});
