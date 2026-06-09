import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { NavigationBar } from 'expo-navigation-bar';
import { AuthProvider } from '../src/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar hidden />
      <NavigationBar hidden />
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
