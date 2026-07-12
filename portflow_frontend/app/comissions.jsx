import { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TabSwitch from '../src/components/molecules/TabSwitch';
import TierCard from '../src/components/molecules/TierCard';
import TierDetailModal from '../src/components/organisms/TierDetailModal';
import DeletePostModal from '../src/components/organisms/DeletePostModal';
import ChatListItem from '../src/components/molecules/ChatListItem';
import { useAuth } from '../src/context/AuthContext';
import { getProfile } from '../src/api/profiles';
import { getConversations } from '../src/api/conversations';
import { deleteTier } from '../src/api/tiers';
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
  const [tierToDelete, setTierToDelete] = useState(null);
  const [deletingTier, setDeletingTier] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useFocusEffect(
    useCallback(() => {
      if (!user?.profile_id) return;
      getProfile(user.profile_id).then(({ data }) => setProfile(data));
      getConversations().then(({ data }) => setConversations(data.results ?? data));
    }, [user?.profile_id])
  );

  const tiers = profile?.commission_tiers ?? [];

  const chatGroups = useMemo(() => {
    const groups = [];
    const byProfile = new Map();
    for (const conversation of conversations) {
      const key = conversation.other_profile.id;
      let group = byProfile.get(key);
      if (!group) {
        group = { profile: conversation.other_profile, conversations: [] };
        byProfile.set(key, group);
        groups.push(group);
      }
      group.conversations.push(conversation);
    }
    return groups;
  }, [conversations]);

  const handleGroupPress = (group) => {
    if (group.conversations.length === 1) {
      router.push(`/chat/${group.conversations[0].id}`);
    } else {
      setSelectedGroup(group);
    }
  };

  const handleConfirmDeleteTier = async () => {
    if (!tierToDelete) return;
    setDeletingTier(true);
    try {
      await deleteTier(tierToDelete.id);
      setProfile((prev) => prev ? {
        ...prev,
        commission_tiers: prev.commission_tiers.filter((t) => t.id !== tierToDelete.id),
      } : prev);
      setTierToDelete(null);
    } finally {
      setDeletingTier(false);
    }
  };

  return (
    <>
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.title}>Comissions</Text>
      </View>

      <View style={styles.tabBarWrap}>
        <TabSwitch options={COMISSIONS_TABS} active={tab} onChange={setTab} />
      </View>

      {tab === 'chats' && !selectedGroup && (
        <View style={styles.chatList}>
          {chatGroups.map((group) => {
            const last = group.conversations[0]?.last_message;
            return (
              <ChatListItem
                key={group.profile.id}
                avatarUri={group.profile.user_picture}
                title={group.profile.first_name || group.profile.username}
                subtitle={last?.body}
                timestamp={last?.created_at ?? group.conversations[0]?.created_at}
                onPress={() => handleGroupPress(group)}
              />
            );
          })}
          {!chatGroups.length && (
            <Text style={styles.empty}>Nenhum chat por aqui ainda.</Text>
          )}
        </View>
      )}

      {tab === 'chats' && selectedGroup && (
        <View style={styles.chatList}>
          <TouchableOpacity style={styles.backRow} onPress={() => setSelectedGroup(null)}>
            <Ionicons name="arrow-back" size={18} color={colors.accent} />
            <Text style={styles.backRowText}>
              {selectedGroup.profile.first_name || selectedGroup.profile.username}
            </Text>
          </TouchableOpacity>
          {selectedGroup.conversations.map((conversation) => (
            <ChatListItem
              key={conversation.id}
              avatarUri={conversation.tier_detail.thumb}
              title={conversation.tier_detail.name}
              subtitle={conversation.last_message?.body}
              timestamp={conversation.last_message?.created_at ?? conversation.created_at}
              onPress={() => router.push(`/chat/${conversation.id}`)}
            />
          ))}
        </View>
      )}

      {tab === 'tiers' && (
        <View style={styles.tierList}>
          {tiers.map((tier) => (
            <TierCard
              key={tier.id}
              tier={tier}
              onPress={() => setSelectedTier(tier)}
              onEdit={() => router.push(`/edit-tier/${tier.id}`)}
              onDelete={() => setTierToDelete(tier)}
            />
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

      <DeletePostModal
        visible={!!tierToDelete}
        itemName={tierToDelete?.name ?? ''}
        loading={deletingTier}
        title="Excluir tier"
        message="Esta ação não pode ser desfeita. O tier deixará de ficar visível, mas as conversas já existentes com clientes serão preservadas."
        confirmLabel="Eu entendo, apagar tier"
        onCancel={() => !deletingTier && setTierToDelete(null)}
        onConfirm={handleConfirmDeleteTier}
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
  chatList: { paddingBottom: spacing.md },
  backRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
  },
  backRowText: { color: colors.accent, fontSize: fontSize.md, fontWeight: 'bold' },
  tierList: { paddingHorizontal: spacing.lg, gap: spacing.md },
  addTierBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
    backgroundColor: colors.accent, borderRadius: radius.button,
    paddingVertical: spacing.md,
  },
  addTierBtnText: { color: colors.darkBg, fontSize: fontSize.sm, fontWeight: 'bold' },
});
