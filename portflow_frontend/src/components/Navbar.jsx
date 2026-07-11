import { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, StyleSheet, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Avatar from './Avatar';
import SearchInput from './SearchInput';
import NotificationBell from './molecules/NotificationBell';
import NotificationPanel from './organisms/NotificationPanel';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { colors, fontSize, spacing, radius } from '../theme';

const NAVBAR_INNER_HEIGHT = 52;

function MenuItem({ icon, label, onPress, danger }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon} size={18} color={danger ? colors.danger : colors.white} />
      <Text style={[styles.menuItemText, danger && { color: colors.danger }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const isLoggedIn = !!user;
  const profileId = user?.profile_id;

  const {
    notifications,
    unreadCount,
    loading,
    hasMore,
    fetchNotifications,
    handleMarkAsRead,
    handleMarkAllRead,
  } = useNotifications({ enabled: isLoggedIn });

  const menuTop = insets.top + 16 + NAVBAR_INNER_HEIGHT + spacing.sm;

  const handleSearch = () => {
    const q = searchText.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    Alert.alert('Sair', 'Deseja mesmo sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  };

  const handleOpenNotifications = () => {
    setShowNotifications(true);
    fetchNotifications(true);
  };

  const handleNavigateToPost = (postId) => {
    setShowNotifications(false);
    router.push(`/post/${postId}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.row}>
        <TouchableOpacity style={styles.brandBtn} onPress={() => router.push('/(tabs)/feed')}>
          <Text style={styles.brandText}>Portflow</Text>
        </TouchableOpacity>

        <View style={styles.searchWrapper}>
          <SearchInput
            value={searchText}
            onChangeText={setSearchText}
            onSubmit={handleSearch}
            placeholder="Buscar posts e artistas..."
          />
        </View>

        {isLoggedIn && (
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowCreateMenu(true)}>
            <Ionicons name="add-circle-outline" size={30} color={colors.white} />
          </TouchableOpacity>
        )}

        {isLoggedIn && (
          <NotificationBell
            unreadCount={unreadCount}
            onPress={handleOpenNotifications}
          />
        )}

        {isLoggedIn ? (
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowUserMenu(true)}>
            <Avatar uri={user.user_picture} size={32} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={showUserMenu} transparent animationType="fade" onRequestClose={() => setShowUserMenu(false)}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowUserMenu(false)} activeOpacity={1} />
        <View style={[styles.menu, { top: menuTop, right: spacing.md }]}>
          <MenuItem
            icon="person-outline"
            label="Meu perfil"
            onPress={() => { setShowUserMenu(false); router.push(`/profile/${profileId}`); }}
          />
          <MenuItem
            icon="briefcase-outline"
            label="Comissions"
            onPress={() => { setShowUserMenu(false); router.push('/comissions'); }}
          />
          {/* <MenuItem
            icon="bookmark-outline"
            label="Meus favoritos"
            onPress={() => { setShowUserMenu(false); router.push('/my-favorites'); }}
          /> */}
          <View style={styles.divider} />
          <MenuItem icon="log-out-outline" label="Sair" onPress={handleLogout} danger />
        </View>
      </Modal>

      <Modal visible={showCreateMenu} transparent animationType="fade" onRequestClose={() => setShowCreateMenu(false)}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowCreateMenu(false)} activeOpacity={1} />
        <View style={[styles.menu, { top: menuTop, right: spacing.md + 44 }]}>
          <MenuItem
            icon="image-outline"
            label="Criar Post"
            onPress={() => { setShowCreateMenu(false); router.push('/create-post'); }}
          />
        </View>
      </Modal>

      <NotificationPanel
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={() => fetchNotifications(false)}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllRead={handleMarkAllRead}
        onNavigateToPost={handleNavigateToPost}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.darkBg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: NAVBAR_INNER_HEIGHT,
  },
  brandBtn: {
    justifyContent: 'center',
    paddingRight: spacing.xs,
  },
  brandText: { color: colors.accent, fontWeight: 'bold', fontSize: fontSize.lg },
  searchWrapper: { flex: 1 },
  iconBtn: {
    padding: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  loginText: { color: colors.darkBg, fontWeight: 'bold', fontSize: fontSize.sm },
  menu: {
    position: 'absolute',
    backgroundColor: colors.lightBg,
    borderRadius: radius.card,
    minWidth: 200,
    paddingVertical: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  menuItemText: { color: colors.white, fontSize: fontSize.md },
  divider: {
    height: 1,
    backgroundColor: colors.headerBg,
    marginVertical: spacing.xs,
  },
});
