import * as SecureStore from 'expo-secure-store';
import api from './client';

export const login = async (username, password) => {
  const { data } = await api.post('/api/auth/login/', { username, password });
  await SecureStore.setItemAsync('access_token', data.access);
  await SecureStore.setItemAsync('refresh_token', data.refresh);
  await SecureStore.setItemAsync('user_data', JSON.stringify(data.user ?? data.profile ?? {}));
  return data;
};

export const register = async ({ firstName, username, email, password, password2 }) => {
  const { data } = await api.post('/api/auth/register/', {
    first_name: firstName,
    username,
    email,
    password,
    password2,
  });
  if (data.user) {
    await SecureStore.setItemAsync('user_data', JSON.stringify(data.user));
  }
  return data;
};

export const logout = async () => {
  const refresh = await SecureStore.getItemAsync('refresh_token');
  if (refresh) {
    await api.post('/api/auth/logout/', { refresh }).catch(() => {});
  }
  await SecureStore.deleteItemAsync('access_token');
  await SecureStore.deleteItemAsync('refresh_token');
  await SecureStore.deleteItemAsync('user_data');
};

export const getStoredToken = () => SecureStore.getItemAsync('access_token');

export const checkUsername = (username) =>
  api.get('/api/auth/check-username/', { params: { username } });

export const getMe = () => api.get('/api/auth/me/');
