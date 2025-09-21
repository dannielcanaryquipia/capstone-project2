import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import Layout from '../../constants/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function AdminLayout() {
  const { signOut } = useAuth();
  const { colors } = useTheme();

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: colors.background,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarStyle: {
        backgroundColor: colors.primary,
        borderTopColor: colors.primary,
        paddingTop: Layout.spacing.sm,
        paddingBottom: Layout.spacing.sm,
        height: Layout.sizes.tabBarHeight + 10,
        ...Layout.shadows.lg,
      },
      tabBarLabelStyle: {
        fontSize: Layout.fontSize.xs,
        fontWeight: Layout.fontWeight.semiBold,
        fontFamily: Layout.fontFamily.semiBold,
        marginBottom: Layout.spacing.xs,
      },
      headerShown: false,
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
            <MaterialIcons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name="reports" 
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="analytics" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
