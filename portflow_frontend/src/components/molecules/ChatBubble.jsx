import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, spacing, radius } from '../../theme';
import { formatChatTimestamp } from '../../utils/date';

export default function ChatBubble({ message, isMine }) {
  return (
    <View style={[styles.row, isMine && styles.rowMine]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
        <Text style={[styles.text, isMine ? styles.textMine : styles.textOther]}>
          {message.body}
        </Text>
        <Text style={[styles.time, isMine ? styles.textMine : styles.textOther]}>
          {formatChatTimestamp(message.created_at)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  rowMine: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '78%', borderRadius: radius.card,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: 2,
  },
  bubbleMine: { backgroundColor: colors.accent, borderTopRightRadius: 2 },
  bubbleOther: { backgroundColor: colors.lightGray, borderTopLeftRadius: 2 },
  text: { fontSize: fontSize.md },
  textMine: { color: colors.darkBg },
  textOther: { color: colors.white },
  time: { fontSize: fontSize.xs, alignSelf: 'flex-end', marginTop: 2, opacity: 0.7 },
});
