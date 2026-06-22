import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as apiLogin, logout as apiLogout, getMe } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [token, userData] = await Promise.all([
          SecureStore.getItemAsync('access_token'),
          SecureStore.getItemAsync('user_data'),
        ]);

        if (!token) return;

        let parsed = null;
        try { parsed = userData ? JSON.parse(userData) : null; } catch {}

        if (parsed?.profile_id) {
          setUser(parsed);
        } else {
          const { data } = await getMe();
          await SecureStore.setItemAsync('user_data', JSON.stringify(data));
          setUser(data);
        }
      } catch {
        // token inválido ou expirado — usuário precisa fazer login novamente
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await apiLogin(username, password);
    setUser(data.user ?? data.profile ?? {});
    return data;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const setUserData = useCallback((data) => setUser(data), []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await getMe();
      await SecureStore.setItemAsync('user_data', JSON.stringify(data));
      setUser(data);
    } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUserData, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
