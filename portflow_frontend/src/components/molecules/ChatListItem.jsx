import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Avatar from '../Avatar';
import { colors, fontSize, spacing } from '../../theme';
import { formatChatTimestamp } from '../../utils/date';

export default function ChatListItem({ avatarUri, title, subtitle, timestamp, onPress }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <Avatar uri={avatarUri} size={52} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{subtitle || 'Inicie a conversa'}</Text>
      </View>
      {timestamp ? <Text style={styles.timestamp}>{formatChatTimestamp(timestamp)}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.headerBg,
  },
  info: { flex: 1, gap: 2 },
  title: { color: colors.white, fontSize: fontSize.md, fontWeight: 'bold' },
  subtitle: { color: colors.textSecondary, fontSize: fontSize.sm },
  timestamp: { color: colors.textSecondary, fontSize: fontSize.xs },
});
