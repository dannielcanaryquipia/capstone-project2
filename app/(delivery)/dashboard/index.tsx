import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import { ResponsiveBorderRadius, ResponsiveSpacing, responsiveValue } from '../../../constants/Responsive';
import { Strings } from '../../../constants/Strings';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import global from '../../../styles/global';

interface DeliveryStats {
  total_orders: number;
  completed_orders: number;
  pending_orders: number;
  total_earnings: number;
  today_earnings: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
  delivery_address: string;
}

export default function DeliveryDashboard() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DeliveryStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      const mockStats: DeliveryStats = {
        total_orders: 45,
        completed_orders: 38,
        pending_orders: 7,
        total_earnings: 1250.50,
        today_earnings: 85.25
      };

      const mockRecentOrders: RecentOrder[] = [
        {
          id: '1',
          order_number: 'ORD-001',
          customer_name: 'John Doe',
          total_amount: 125.50,
          status: 'ready_for_pickup',
          created_at: new Date().toISOString(),
          delivery_address: '123 Main St, City'
        },
        {
          id: '2',
          order_number: 'ORD-002',
          customer_name: 'Jane Smith',
          total_amount: 89.75,
          status: 'out_for_delivery',
          created_at: new Date().toISOString(),
          delivery_address: '456 Oak Ave, City'
        }
      ];

      setStats(mockStats);
      setRecentOrders(mockRecentOrders);
    } catch (error) {
      console.error('Error loading delivery data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready_for_pickup':
        return colors.warning;
      case 'out_for_delivery':
        return colors.info;
      case 'delivered':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready_for_pickup':
        return 'restaurant';
      case 'out_for_delivery':
        return 'local-shipping';
      case 'delivered':
        return 'check-circle';
      default:
        return 'help';
    }
  };

  const quickActions = [
    {
      id: 'available-orders',
      title: 'Available Orders',
      description: 'View orders ready for pickup',
      icon: 'restaurant',
      color: colors.primary,
      onPress: () => router.push('/(delivery)/orders/available' as any)
    },
    {
      id: 'my-orders',
      title: 'My Orders',
      description: 'Track your assigned orders',
      icon: 'local-shipping',
      color: colors.info,
      onPress: () => router.push('/(delivery)/orders/my-orders' as any)
    },
    {
      id: 'earnings',
      title: 'Earnings',
      description: 'View your delivery earnings',
      icon: 'attach-money',
      color: colors.success,
      onPress: () => router.push('/(delivery)/orders/earnings' as any)
    },
    {
      id: 'profile',
      title: 'Profile',
      description: 'Update your delivery profile',
      icon: 'person',
      color: colors.secondary,
      onPress: () => router.push('/(delivery)/profile' as any)
    }
  ];

  if (loading) {
    return (
      <SafeAreaView style={[global.screen, styles.center, { backgroundColor: colors.background }]}>
        <ResponsiveView style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="md" color={colors.textSecondary}>
              {Strings.loading}
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[global.screen, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        <ResponsiveView padding="lg">
          {/* Welcome Header */}
          <ResponsiveView style={[styles.welcomeHeader, { backgroundColor: colors.surface }]}>
            <ResponsiveView style={styles.welcomeText}>
              <ResponsiveText size="md" color={colors.textSecondary}>
                Welcome back,
              </ResponsiveText>
              <ResponsiveText size="xl" weight="bold" color={colors.text}>
                {user?.user_metadata?.full_name || 'Delivery Partner'}
              </ResponsiveText>
            </ResponsiveView>
            <Button
              title=""
              onPress={() => router.push('/(delivery)/profile' as any)}
              variant="text"
              icon={<MaterialIcons name="person" size={24} color={colors.primary} />}
              style={styles.profileButton}
            />
          </ResponsiveView>

          {/* Key Metrics Cards */}
          <ResponsiveView style={styles.metricsContainer}>
            <ResponsiveView style={[styles.metricCard, { 
              backgroundColor: colors.surface,
              ...Layout.shadows.sm
            }]}>
              <ResponsiveView style={styles.metricHeader}>
                <ResponsiveView style={[styles.metricIcon, { backgroundColor: colors.primary + '20' }]}>
                  <MaterialIcons name="local-shipping" size={responsiveValue(20, 22, 24, 28)} color={colors.primary} />
                </ResponsiveView>
                <ResponsiveText size="sm" color={colors.textSecondary} weight="medium">
                  Total Orders
                </ResponsiveText>
              </ResponsiveView>
              <ResponsiveText size="xxl" weight="bold" color={colors.text}>
                {stats?.total_orders || 0}
              </ResponsiveText>
              <ResponsiveText size="xs" color={colors.textSecondary}>
                {stats?.completed_orders || 0} completed
              </ResponsiveText>
            </ResponsiveView>

            <ResponsiveView style={[styles.metricCard, { 
              backgroundColor: colors.surface,
              ...Layout.shadows.sm
            }]}>
              <ResponsiveView style={styles.metricHeader}>
                <ResponsiveView style={[styles.metricIcon, { backgroundColor: colors.success + '20' }]}>
                  <MaterialIcons name="attach-money" size={responsiveValue(20, 22, 24, 28)} color={colors.success} />
                </ResponsiveView>
                <ResponsiveText size="sm" color={colors.textSecondary} weight="medium">
                  Today's Earnings
                </ResponsiveText>
              </ResponsiveView>
              <ResponsiveText size="xxl" weight="bold" color={colors.text}>
                ₱{(stats?.today_earnings || 0).toFixed(2)}
              </ResponsiveText>
              <ResponsiveText size="xs" color={colors.textSecondary}>
                ₱{(stats?.total_earnings || 0).toFixed(2)} total
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>

          {/* Quick Actions Grid */}
          <ResponsiveView style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionCard, { 
                  backgroundColor: colors.surface,
                  ...Layout.shadows.sm
                }]}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <ResponsiveView style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                  <MaterialIcons 
                    name={action.icon as any} 
                    size={responsiveValue(24, 26, 28, 32)} 
                    color={action.color} 
                  />
                </ResponsiveView>
                <ResponsiveView marginTop="sm">
                  <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                    {action.title}
                  </ResponsiveText>
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    {action.description}
                  </ResponsiveText>
                </ResponsiveView>
              </TouchableOpacity>
            ))}
          </ResponsiveView>

          {/* Recent Orders */}
          <ResponsiveView style={styles.recentOrdersSection}>
            <ResponsiveView style={styles.sectionHeader}>
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Recent Orders
              </ResponsiveText>
              <Button
                title="View All"
                onPress={() => router.push('/(delivery)/orders/my-orders' as any)}
                variant="text"
                size="small"
              />
            </ResponsiveView>

            {recentOrders.length > 0 ? (
              <ResponsiveView style={styles.ordersList}>
                {recentOrders.slice(0, 3).map((order) => (
                  <TouchableOpacity
                    key={order.id}
                    style={[styles.orderCard, { 
                      backgroundColor: colors.surface,
                      ...Layout.shadows.sm
                    }]}
                    onPress={() => router.push(`/(delivery)/orders/${order.id}` as any)}
                    activeOpacity={0.7}
                  >
                    <ResponsiveView style={styles.orderHeader}>
                      <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                        {order.order_number}
                      </ResponsiveText>
                      <ResponsiveView style={[styles.orderStatus, { 
                        backgroundColor: getStatusColor(order.status) + '20' 
                      }]}>
                        <MaterialIcons 
                          name={getStatusIcon(order.status) as any} 
                          size={16} 
                          color={getStatusColor(order.status)} 
                        />
                        <ResponsiveText 
                          size="xs" 
                          color={getStatusColor(order.status)}
                          weight="semiBold"
                        >
                          {order.status.replace('_', ' ').toUpperCase()}
                        </ResponsiveText>
                      </ResponsiveView>
                    </ResponsiveView>
                    
                    <ResponsiveView style={styles.orderDetails}>
                      <ResponsiveText size="sm" color={colors.textSecondary}>
                        Customer: {order.customer_name}
                      </ResponsiveText>
                      <ResponsiveText size="sm" color={colors.textSecondary}>
                        Address: {order.delivery_address}
                      </ResponsiveText>
                    </ResponsiveView>
                    
                    <ResponsiveView style={styles.orderFooter}>
                      <ResponsiveText size="sm" color={colors.textSecondary}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </ResponsiveText>
                      <ResponsiveText size="md" weight="semiBold" color={colors.primary}>
                        ₱{order.total_amount.toFixed(2)}
                      </ResponsiveText>
                    </ResponsiveView>
                  </TouchableOpacity>
                ))}
              </ResponsiveView>
            ) : (
              <ResponsiveView style={[styles.emptyState, { backgroundColor: colors.surface }]}>
                <ResponsiveView style={[styles.emptyIcon, { backgroundColor: colors.surfaceVariant }]}>
                  <MaterialIcons name="local-shipping" size={responsiveValue(48, 56, 64, 72)} color={colors.primary} />
                </ResponsiveView>
                <ResponsiveView marginTop="md">
                  <ResponsiveText size="lg" weight="semiBold" color={colors.text} align="center">
                    No Recent Orders
                  </ResponsiveText>
                </ResponsiveView>
                <ResponsiveView marginTop="sm">
                  <ResponsiveText size="md" color={colors.textSecondary} align="center">
                    Orders will appear here once you start delivering
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>
            )}
          </ResponsiveView>
        </ResponsiveView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.lg,
    padding: ResponsiveSpacing.md,
    borderRadius: ResponsiveBorderRadius.lg,
    ...Layout.shadows.sm,
  },
  welcomeText: {
    flex: 1,
  },
  profileButton: {
    padding: ResponsiveSpacing.sm,
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: ResponsiveSpacing.md,
    marginBottom: ResponsiveSpacing.lg,
  },
  metricCard: {
    flex: 1,
    padding: ResponsiveSpacing.lg,
    borderRadius: ResponsiveBorderRadius.lg,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.sm,
    gap: ResponsiveSpacing.sm,
  },
  metricIcon: {
    width: responsiveValue(40, 44, 48, 56),
    height: responsiveValue(40, 44, 48, 56),
    borderRadius: responsiveValue(20, 22, 24, 28),
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: ResponsiveSpacing.xl,
  },
  actionCard: {
    width: '48%',
    padding: ResponsiveSpacing.lg,
    borderRadius: ResponsiveBorderRadius.lg,
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.md,
    minHeight: responsiveValue(120, 130, 140, 150),
  },
  actionIcon: {
    width: responsiveValue(48, 52, 56, 64),
    height: responsiveValue(48, 52, 56, 64),
    borderRadius: responsiveValue(24, 26, 28, 32),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.sm,
  },
  recentOrdersSection: {
    marginBottom: ResponsiveSpacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.md,
  },
  ordersList: {
    gap: ResponsiveSpacing.sm,
  },
  orderCard: {
    padding: ResponsiveSpacing.md,
    borderRadius: ResponsiveBorderRadius.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.sm,
  },
  orderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ResponsiveSpacing.sm,
    paddingVertical: ResponsiveSpacing.xs,
    borderRadius: ResponsiveBorderRadius.sm,
    gap: ResponsiveSpacing.xs,
  },
  orderDetails: {
    marginBottom: ResponsiveSpacing.sm,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: ResponsiveSpacing.xxxl,
    paddingHorizontal: ResponsiveSpacing.lg,
    borderRadius: ResponsiveBorderRadius.lg,
    ...Layout.shadows.sm,
  },
  emptyIcon: {
    width: responsiveValue(80, 90, 100, 120),
    height: responsiveValue(80, 90, 100, 120),
    borderRadius: responsiveValue(40, 45, 50, 60),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.md,
  },
});
