import { Tabs } from 'expo-router';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function CustomerLayout() {
  const { signOut } = useAuth();

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#FF6B6B',
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
      headerShown: false,
    }}>
      <Tabs.Screen 
        name="home" 
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home-filled" size={size} color={color} />
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
        name="orders" 
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="receipt" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name="profile" 
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
