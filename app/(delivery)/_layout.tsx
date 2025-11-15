import { Stack } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

export default function DeliveryLayout() {
  const { signOut } = useAuth();
  const { colors } = useTheme();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="help-support" />
      <Stack.Screen name="terms-privacy" />
    </Stack>
  );
}
