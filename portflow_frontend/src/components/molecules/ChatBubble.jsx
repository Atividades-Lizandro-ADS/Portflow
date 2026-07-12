import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, spacing, radius } from '../../theme';
import { formatChatTimestamp } from '../../utils/date';
import ChatAttachmentPreview from './ChatAttachmentPreview';
import BriefingCard from './BriefingCard';

export default function ChatBubble({ message, isMine, onOpenBriefing }) {
  if (message.message_type === 'briefing_sent' || message.message_type === 'briefing_response') {
    if (!message.related_briefing_detail) {
      return (
        <View style={styles.wrap}>
          <Text style={styles.systemText}>Briefing removido</Text>
        </View>
      );
    }
    return (
      <BriefingCard
        briefing={message.related_briefing_detail}
        onView={() => onOpenBriefing?.(message.related_briefing_detail)}
      />
    );
  }

  return (
    <View style={[styles.row, isMine && styles.rowMine]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
        {!!message.attachments?.length && (
          <View style={styles.attachments}>
            {message.attachments.map((att) => (
              <ChatAttachmentPreview
                key={att.id}
                isMine={isMine}
                attachment={{ uri: att.file, name: att.original_filename, size: att.file_size }}
              />
            ))}
          </View>
        )}
        {!!message.body && (
          <Text style={[styles.text, isMine ? styles.textMine : styles.textOther]}>
            {message.body}
          </Text>
        )}
        <Text style={[styles.time, isMine ? styles.textMine : styles.textOther]}>
          {formatChatTimestamp(message.created_at)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginBottom: spacing.sm },
  systemText: { color: colors.textSecondary, fontSize: fontSize.xs, fontStyle: 'italic' },
  row: { flexDirection: 'row', paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  rowMine: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '78%', borderRadius: radius.card,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: 2,
  },
  bubbleMine: { backgroundColor: colors.accent, borderTopRightRadius: 2 },
  bubbleOther: { backgroundColor: colors.lightGray, borderTopLeftRadius: 2 },
  attachments: { gap: spacing.xs, marginBottom: 2 },
  text: { fontSize: fontSize.md },
  textMine: { color: colors.darkBg },
  textOther: { color: colors.white },
  time: { fontSize: fontSize.xs, alignSelf: 'flex-end', marginTop: 2, opacity: 0.7 },
});
