import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';

export default function NotificationBadge({ count }) {
  if (!count) return null;

  const label = count > 10 ? '10+' : String(count);

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: colors.danger,
    borderRadius: 100,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  text: {
    color: colors.white,
    fontSize: 9,
    fontWeight: 'bold',
  },
});
