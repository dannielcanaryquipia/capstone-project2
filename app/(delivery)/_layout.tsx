import { Tabs } from 'expo-router';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function DeliveryLayout() {
  const { signOut } = useAuth();

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#4CAF50',
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
        backgroundColor: '#4CAF50',
      },
      headerTintColor: '#fff',
    }}>
      <Tabs.Screen 
        name="available-orders" 
        options={{
          title: 'Available',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="delivery-dining" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name="my-orders" 
        options={{
          title: 'My Deliveries',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="list-alt" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name="earnings" 
        options={{
          title: 'Earnings',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="money-bill-wave" size={size} color={color} />
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
