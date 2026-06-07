import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, radius } from '../../theme';

const TEMPLATE_ICONS = {
  NEW_LIKE: 'heart',
  NEW_COMMENT: 'chatbubble',
  POST_MILESTONE: 'trophy',
  NEW_FOLLOWER: 'person-add',
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function NotificationItem({ notification, onPress }) {
  const { template, title, is_read, created_at } = notification;
  const icon = TEMPLATE_ICONS[template?.code] ?? 'notifications';

  return (
    <TouchableOpacity
      style={[styles.container, !is_read && styles.unread]}
      onPress={() => onPress(notification)}
      activeOpacity={0.75}
    >
      <View style={[styles.iconWrap, !is_read && styles.iconWrapActive]}>
        <Ionicons
          name={icon}
          size={18}
          color={is_read ? colors.textSecondary : colors.accent}
        />
      </View>
      <View style={styles.content}>
        <Text
          style={[styles.title, !is_read && styles.titleUnread]}
          numberOfLines={2}
        >
          {title}
        </Text>
        <Text style={styles.time}>{timeAgo(created_at)}</Text>
      </View>
      {!is_read && <View style={styles.dot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.card,
  },
  unread: {
    backgroundColor: colors.lightBg,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.headerBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapActive: {
    backgroundColor: `${colors.accent}22`,
  },
  content: { flex: 1 },
  title: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  titleUnread: {
    color: colors.white,
    fontWeight: '600',
  },
  time: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
});
