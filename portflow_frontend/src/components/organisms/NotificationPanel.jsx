import {
  View, Text, Modal, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import NotificationItem from '../molecules/NotificationItem';
import { colors, fontSize, spacing, radius } from '../../theme';

export default function NotificationPanel({
  visible,
  onClose,
  notifications,
  unreadCount,
  loading,
  hasMore,
  onLoadMore,
  onMarkAsRead,
  onMarkAllRead,
  onNavigateToPost,
}) {
  const insets = useSafeAreaInsets();

  const handleItemPress = (notification) => {
    if (!notification.is_read) onMarkAsRead(notification.id);
    if (notification.target_post_id) onNavigateToPost(notification.target_post_id);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
        />
        <View style={[styles.panel, { paddingBottom: insets.bottom + spacing.md }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Notificações</Text>
            <View style={styles.headerActions}>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={onMarkAllRead}>
                  <Text style={styles.markAllText}>Marcar todas como lidas</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={22} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={notifications}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <NotificationItem notification={item} onPress={handleItemPress} />
            )}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            onEndReached={hasMore ? onLoadMore : null}
            onEndReachedThreshold={0.4}
            ListFooterComponent={
              loading
                ? <ActivityIndicator color={colors.accent} style={styles.loader} />
                : null
            }
            ListEmptyComponent={
              !loading && (
                <View style={styles.empty}>
                  <Ionicons
                    name="notifications-off-outline"
                    size={40}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.emptyText}>Nenhuma notificação</Text>
                </View>
              )
            }
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: colors.formBg,
    borderTopLeftRadius: radius.section,
    borderTopRightRadius: radius.section,
    maxHeight: '80%',
    minHeight: '50%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.headerBg,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.headerBg,
  },
  headerTitle: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  markAllText: {
    color: colors.accent,
    fontSize: fontSize.xs,
  },
  list: {
    padding: spacing.sm,
  },
  separator: {
    height: spacing.xs,
  },
  loader: {
    marginVertical: spacing.lg,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
});
