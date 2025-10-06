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
        name="dashboard/index" 
        options={{
          title: 'Dashboard',
        }}
      />
      <Tabs.Screen 
        name="orders/index" 
        options={{
          title: 'Orders',
        }}
      />
      <Tabs.Screen 
        name="menu/index" 
        options={{
          title: 'Menu',
        }}
      />
      <Tabs.Screen 
        name="users/index" 
        options={{
          title: 'Users',
        }}
      />
      <Tabs.Screen 
        name="reports/index" 
        options={{
          title: 'Reports',
        }}
      />
      <Tabs.Screen 
        name="products/index" 
        options={{
          title: 'Products',
        }}
      />
      <Tabs.Screen 
        name="profile/index" 
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
