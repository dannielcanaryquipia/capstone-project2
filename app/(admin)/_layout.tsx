import { Tabs } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

export default function AdminLayout() {
  const { signOut } = useAuth();
  const { colors } = useTheme();

  return (
    <Tabs screenOptions={{
      tabBarStyle: { display: 'none' }, // Hide tab bar globally
      headerShown: false, // Hide headers globally
    }}>
      <Tabs.Screen 
        name="dashboard" 
        options={{
          title: 'Dashboard',
        }}
      />
      <Tabs.Screen 
        name="orders" 
        options={{
          title: 'Orders',
        }}
      />
      <Tabs.Screen 
        name="menu" 
        options={{
          title: 'Menu',
        }}
      />
      <Tabs.Screen 
        name="users" 
        options={{
          title: 'Users',
        }}
      />
      <Tabs.Screen 
        name="reports" 
        options={{
          title: 'Reports',
        }}
      />
      <Tabs.Screen 
        name="products" 
        options={{
          title: 'Products',
        }}
      />
      <Tabs.Screen 
        name="profile" 
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
