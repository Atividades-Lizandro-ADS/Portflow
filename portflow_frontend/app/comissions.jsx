import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TabSwitch from '../src/components/molecules/TabSwitch';
import { colors, fontSize, spacing } from '../src/theme';

const COMISSIONS_TABS = [
  { id: 'chats', label: 'Chats' },
  { id: 'tiers', label: 'Tiers' },
];

export default function ComissionsScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('chats');

  return (
    <View style={styles.container}>
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
        <Text style={styles.empty}>Nenhum tier cadastrado ainda.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.darkBg },
  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  title: { color: colors.white, fontSize: fontSize.xl, fontWeight: 'bold' },
  tabBarWrap: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  empty: { color: colors.textSecondary, fontSize: fontSize.sm, marginHorizontal: spacing.lg },
});
