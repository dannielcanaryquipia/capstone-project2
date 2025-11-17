import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { AdminCard, AdminLayout, AdminSection } from '../../../components/admin';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import { ResponsiveBorderRadius, ResponsiveSpacing } from '../../../constants/Responsive';
import { useTheme } from '../../../contexts/ThemeContext';
import { supabase } from '../../../lib/supabase';

export default function DateOrdersDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (date) {
      loadOrdersForDate();
    }
  }, [date]);

  const loadOrdersForDate = async () => {
    if (!date) return;
    
    try {
      setLoading(true);
      
      // Parse the date string (YYYY-MM-DD) and create date range in local timezone
      // This ensures we match orders based on local date, not UTC date
      const [year, month, day] = date.split('-').map(Number);
      const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
      const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);

      // Convert to ISO strings for database query (but based on local date)
      const startISO = startDate.toISOString();
      const endISO = endDate.toISOString();

      // Fetch orders for the specific date
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          created_at,
          status,
          payment_status,
          user:profiles!orders_user_id_fkey(full_name, phone_number)
        `)
        .eq('status', 'delivered')
        .gte('created_at', startISO)
        .lte('created_at', endISO)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter orders to ensure they match the exact local date
      // This handles any edge cases with timezone conversion
      const filteredOrders = (ordersData || []).filter((order: any) => {
        const orderDate = new Date(order.created_at);
        const orderYear = orderDate.getFullYear();
        const orderMonth = orderDate.getMonth() + 1;
        const orderDay = orderDate.getDate();
        return orderYear === year && orderMonth === month && orderDay === day;
      });

      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error loading orders for date:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrdersForDate();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const totalIncome = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const totalOrders = orders.length;

  const handleOrderPress = (orderId: string) => {
    router.push({
      pathname: '/(admin)/orders/[id]',
      params: { id: orderId }
    } as any);
  };

  if (loading && !refreshing) {
    return (
      <AdminLayout
        title="Date Orders"
        subtitle="Orders for selected date"
        showBackButton={true}
        onBackPress={() => router.back()}
      >
        <ResponsiveView style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="md" color={colors.textSecondary}>
              Loading orders...
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={formatDate(date || '')}
      subtitle={`${totalOrders} ${totalOrders === 1 ? 'order' : 'orders'}`}
      showBackButton={true}
      onBackPress={() => router.back()}
    >
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Summary Cards */}
        <ResponsiveView padding="lg">
          <ResponsiveView style={styles.summaryGrid}>
            <AdminCard
              variant="outlined"
              style={[styles.summaryCard, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, marginRight: ResponsiveSpacing.sm }]}
            >
              <ResponsiveView style={styles.summaryContent}>
                <MaterialIcons name="receipt" size={24} color={colors.primary} />
                <ResponsiveView marginLeft="sm">
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    Total Orders
                  </ResponsiveText>
                  <ResponsiveText size="xl" weight="bold" color={colors.text}>
                    {totalOrders}
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>
            </AdminCard>

            <AdminCard
              variant="outlined"
              style={[styles.summaryCard, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
            >
              <ResponsiveView style={styles.summaryContent}>
                <MaterialIcons name="attach-money" size={24} color={colors.success} />
                <ResponsiveView marginLeft="sm">
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    Total Income
                  </ResponsiveText>
                  <ResponsiveText size="xl" weight="bold" color={colors.primary}>
                    ₱{totalIncome.toFixed(2)}
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>
            </AdminCard>
          </ResponsiveView>

          {/* Orders List */}
          <AdminSection
            title="All Orders"
            subtitle={`Orders placed on ${formatDate(date || '')}`}
            variant="outlined"
          >
            {orders.length > 0 ? (
              <ResponsiveView style={styles.ordersList}>
                {orders.map((order, index) => (
                  <AdminCard
                    key={order.id}
                    variant="outlined"
                    onPress={() => handleOrderPress(order.id)}
                    style={[
                      styles.orderCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.borderLight,
                        marginBottom: index === orders.length - 1 ? 0 : ResponsiveSpacing.sm
                      }
                    ]}
                  >
                    <ResponsiveView style={styles.orderHeader}>
                      <ResponsiveView style={styles.orderInfo}>
                        <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                          Order #{order.order_number || order.id.slice(-8)}
                        </ResponsiveText>
                        {order.user?.full_name && (
                          <ResponsiveView marginTop="xxs">
                            <ResponsiveText size="sm" color={colors.textSecondary}>
                              {order.user.full_name}
                            </ResponsiveText>
                          </ResponsiveView>
                        )}
                        <ResponsiveView marginTop="xxs">
                          <ResponsiveText size="xs" color={colors.textSecondary}>
                            {formatTime(order.created_at)}
                          </ResponsiveText>
                        </ResponsiveView>
                      </ResponsiveView>
                      <ResponsiveView style={styles.orderAmount}>
                        <ResponsiveText size="lg" weight="semiBold" color={colors.primary}>
                          ₱{order.total_amount?.toFixed(2) || '0.00'}
                        </ResponsiveText>
                        <MaterialIcons 
                          name="chevron-right" 
                          size={20} 
                          color={colors.textSecondary} 
                          style={styles.chevron}
                        />
                      </ResponsiveView>
                    </ResponsiveView>
                  </AdminCard>
                ))}
              </ResponsiveView>
            ) : (
              <ResponsiveView style={styles.emptyState}>
                <MaterialIcons name="receipt-long" size={48} color={colors.textSecondary} />
                <ResponsiveView marginTop="md">
                  <ResponsiveText size="md" color={colors.textSecondary} align="center">
                    No orders found for this date
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>
            )}
          </AdminSection>
        </ResponsiveView>
      </ScrollView>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    marginBottom: ResponsiveSpacing.lg,
  },
  summaryCard: {
    flex: 1,
    padding: ResponsiveSpacing.md,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ordersList: {
    // Spacing handled by marginBottom on items
  },
  orderCard: {
    padding: ResponsiveSpacing.md,
    borderRadius: ResponsiveBorderRadius.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderInfo: {
    flex: 1,
  },
  orderAmount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    marginLeft: ResponsiveSpacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ResponsiveSpacing.xxl,
  },
});

