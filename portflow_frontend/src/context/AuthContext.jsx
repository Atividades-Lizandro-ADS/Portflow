import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as apiLogin, logout as apiLogout } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      SecureStore.getItemAsync('access_token'),
      SecureStore.getItemAsync('user_data'),
    ]).then(([token, userData]) => {
      if (token && userData) {
        try { setUser(JSON.parse(userData)); } catch { setUser({ _tokenOnly: true }); }
      } else if (token) {
        setUser({ _tokenOnly: true });
      }
    }).finally(() => setLoading(false));
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

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
