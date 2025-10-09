import { Tabs } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

export default function DeliveryLayout() {
  const { signOut } = useAuth();
  const { colors } = useTheme();

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { display: 'none' },
    }}>
      <Tabs.Screen name="dashboard" options={{ href: null }} />
      <Tabs.Screen name="orders" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
