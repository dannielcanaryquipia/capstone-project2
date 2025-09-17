import { Tabs } from 'expo-router';
import { MaterialIcons, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLayout() {
  const { signOut } = useAuth();

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#4A90E2',
      tabBarInactiveTintColor: '#999',
      tabBarStyle: {
        paddingTop: 8,
        paddingBottom: 8,
        height: 60,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 4,
      },
      headerShown: true,
      headerTitleAlign: 'center',
      headerStyle: {
        backgroundColor: '#4A90E2',
      },
      headerTintColor: '#fff',
    }}>
      <Tabs.Screen 
        name="dashboard" 
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name="orders" 
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="list-alt" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name="menu" 
        options={{
          title: 'Menu',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="restaurant-menu" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name="users" 
        options={{
          title: 'Users',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name="settings" 
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
