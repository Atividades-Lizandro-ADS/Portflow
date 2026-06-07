import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NotificationBadge from '../atoms/NotificationBadge';
import { colors, spacing } from '../../theme';

export default function NotificationBell({ unreadCount, onPress }) {
  return (
    <TouchableOpacity style={styles.btn} onPress={onPress} activeOpacity={0.7}>
      <View>
        <Ionicons name="notifications-outline" size={26} color={colors.white} />
        <NotificationBadge count={unreadCount} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    padding: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
