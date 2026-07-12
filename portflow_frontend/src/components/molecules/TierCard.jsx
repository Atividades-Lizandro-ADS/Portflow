import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, radius } from '../../theme';
import { truncateText } from '../../utils/text';
import { NEGOTIATION_LABELS, formatTierPrice } from '../../utils/tier';

export default function TierCard({ tier, onPress, onEdit, onDelete }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85} disabled={!onPress}>
      {(onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
              <Ionicons name="pencil" size={14} color={colors.white} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity style={styles.actionBtn} onPress={onDelete}>
              <Ionicons name="trash" size={14} color={colors.danger} />
            </TouchableOpacity>
          )}
        </View>
      )}
      {tier.thumb ? (
        <Image source={{ uri: tier.thumb }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}
      <View style={styles.body}>
        <Text style={styles.title}>{tier.name}</Text>
        <Text style={styles.description} numberOfLines={3}>
          {truncateText(tier.description, 300)}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatTierPrice(tier.price)}</Text>
          {tier.negotiable && (
            <Text style={styles.negotiable}>
              É negociável · {NEGOTIATION_LABELS[tier.negotiation_direction] ?? ''}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.lightBg,
    borderRadius: radius.card,
    overflow: 'hidden',
    height: 140,
  },
  actions: {
    position: 'absolute', top: spacing.xs, right: spacing.xs, zIndex: 1,
    flexDirection: 'row', gap: spacing.xs,
  },
  actionBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center',
  },
  image: { flex: 1, height: '100%' },
  imagePlaceholder: { backgroundColor: colors.headerBg },
  body: { flex: 2, padding: spacing.md, gap: spacing.xs },
  title: { color: colors.white, fontSize: fontSize.md, fontWeight: 'bold' },
  description: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 18, flex: 1 },
  priceRow: {
    flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: spacing.sm,
    paddingTop: spacing.xs, borderTopWidth: 1, borderTopColor: colors.headerBg, marginTop: 'auto',
  },
  price: { color: colors.accent, fontSize: fontSize.md, fontWeight: 'bold' },
  negotiable: { color: colors.textSecondary, fontSize: fontSize.xs },
});
