import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, radius } from '../../theme';

const STATUS_LABELS = { pending: 'Pendente', accepted: 'Aceito', declined: 'Recusado' };
const STATUS_COLORS = { pending: colors.textSecondary, accepted: colors.accent, declined: colors.danger };

export default function BriefingCard({ briefing, isMine, onView }) {
  return (
    <View style={[styles.wrap, isMine && styles.wrapMine]}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Ionicons name="document-text" size={18} color={colors.accent} />
          <Text style={styles.title} numberOfLines={2}>Briefing — {briefing.tier_name_snapshot}</Text>
        </View>
        <View style={[styles.badge, { borderColor: STATUS_COLORS[briefing.status] }]}>
          <Text style={[styles.badgeText, { color: STATUS_COLORS[briefing.status] }]}>
            {STATUS_LABELS[briefing.status]}
          </Text>
        </View>
        <TouchableOpacity style={styles.viewBtn} onPress={onView}>
          <Text style={styles.viewBtnText}>Visualizar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  wrapMine: { justifyContent: 'flex-end' },
  card: {
    maxWidth: '85%', backgroundColor: colors.lightBg, borderRadius: radius.card,
    borderWidth: 1, borderColor: colors.headerBg, padding: spacing.md, gap: spacing.sm,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { flex: 1, color: colors.white, fontSize: fontSize.sm, fontWeight: 'bold' },
  badge: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  badgeText: { fontSize: fontSize.xs, fontWeight: 'bold' },
  viewBtn: { alignSelf: 'flex-start', paddingVertical: spacing.xs },
  viewBtnText: { color: colors.accent, fontSize: fontSize.sm, fontWeight: 'bold' },
});
