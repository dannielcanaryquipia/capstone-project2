import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import { Strings } from '../../../constants/Strings';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../lib/supabase';

interface EarningsData {
  totalEarnings: number;
  thisWeek: number;
  lastWeek: number;
  thisMonth: number;
  lastMonth: number;
  totalDeliveries: number;
  completedDeliveries: number;
  averageEarningPerDelivery: number;
  rating: number;
  weeklyBreakdown: Array<{
    day: string;
    earnings: number;
    deliveries: number;
  }>;
  recentDeliveries: Array<{
    id: string;
    orderNumber: string;
    earnings: number;
    date: string;
    status: string;
  }>;
}

const timeTabs = ['Today', 'This Week', 'This Month', 'All Time'];

export default function EarningsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('This Week');

  useEffect(() => {
    loadEarningsData();
  }, [activeTab]);

  const loadEarningsData = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        setEarningsData(null);
        return;
      }

      // Fetch real earnings data from the database
      const { data: assignments, error } = await supabase
        .from('delivery_assignments')
        .select(`
          *,
          order:orders(
            id,
            order_number,
            total_amount,
            status,
            created_at,
            delivered_at
          )
        `)
        .eq('rider_id', user.id)
        .eq('status', 'Delivered')
        .order('delivered_at', { ascending: false });

      if (error) throw error;

      const deliveredAssignments = assignments || [];
      
      // Calculate earnings (assuming 10% of order total as delivery fee)
      const deliveryFeeRate = 0.1;
      const earnings = deliveredAssignments.map((assignment: any) => ({
        id: assignment.id,
        orderNumber: assignment.order?.order_number || 'N/A',
        earnings: (assignment.order?.total_amount || 0) * deliveryFeeRate,
        date: assignment.delivered_at || assignment.order?.created_at || '',
        status: 'completed',
        orderId: assignment.order?.id || '',
      }));

      // Calculate time-based earnings
      const now = new Date();
      const thisWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const thisWeekEarnings = earnings
        .filter(e => new Date(e.date) >= thisWeekStart)
        .reduce((sum, e) => sum + e.earnings, 0);

      const lastWeekEarnings = earnings
        .filter(e => {
          const date = new Date(e.date);
          return date >= lastWeekStart && date < thisWeekStart;
        })
        .reduce((sum, e) => sum + e.earnings, 0);

      const thisMonthEarnings = earnings
        .filter(e => new Date(e.date) >= thisMonthStart)
        .reduce((sum, e) => sum + e.earnings, 0);

      const lastMonthEarnings = earnings
        .filter(e => {
          const date = new Date(e.date);
          return date >= lastMonthStart && date < thisMonthStart;
        })
        .reduce((sum, e) => sum + e.earnings, 0);

      const totalEarnings = earnings.reduce((sum, e) => sum + e.earnings, 0);
      const totalDeliveries = deliveredAssignments.length;
      const completedDeliveries = deliveredAssignments.length;
      const averageEarningPerDelivery = totalDeliveries > 0 ? totalEarnings / totalDeliveries : 0;

      // Generate weekly breakdown
      const weeklyBreakdown = [];
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 0; i < 7; i++) {
        const dayStart = new Date(thisWeekStart.getTime() + i * 24 * 60 * 60 * 1000);
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        
        const dayEarnings = earnings
          .filter(e => {
            const date = new Date(e.date);
            return date >= dayStart && date < dayEnd;
          })
          .reduce((sum, e) => sum + e.earnings, 0);

        const dayDeliveries = earnings
          .filter(e => {
            const date = new Date(e.date);
            return date >= dayStart && date < dayEnd;
          }).length;

        weeklyBreakdown.push({
          day: days[i],
          earnings: dayEarnings,
          deliveries: dayDeliveries,
        });
      }

      const realData: EarningsData = {
        totalEarnings,
        thisWeek: thisWeekEarnings,
        lastWeek: lastWeekEarnings,
        thisMonth: thisMonthEarnings,
        lastMonth: lastMonthEarnings,
        totalDeliveries,
        completedDeliveries,
        averageEarningPerDelivery,
        rating: 4.8, // Keep mock rating for now
        weeklyBreakdown,
        recentDeliveries: earnings.slice(0, 10), // Show last 10 deliveries
      };
      
      setEarningsData(realData);
    } catch (error) {
      console.error('Error loading earnings data:', error);
      // Fallback to empty data on error
      setEarningsData({
        totalEarnings: 0,
        thisWeek: 0,
        lastWeek: 0,
        thisMonth: 0,
        lastMonth: 0,
        totalDeliveries: 0,
        completedDeliveries: 0,
        averageEarningPerDelivery: 0,
        rating: 0,
        weeklyBreakdown: [],
        recentDeliveries: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEarningsData();
    setRefreshing(false);
  };

  const handleWithdrawEarnings = () => {
    Alert.alert(
      'Withdraw Earnings',
      'Withdraw your earnings to your bank account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Withdraw', onPress: () => console.log('Withdraw earnings') },
      ]
    );
  };

  const getCurrentEarnings = () => {
    switch (activeTab) {
      case 'Today': return (earningsData?.thisWeek || 0) / 7; // Approximate daily
      case 'This Week': return earningsData?.thisWeek || 0;
      case 'This Month': return earningsData?.thisMonth || 0;
      case 'All Time': return earningsData?.totalEarnings || 0;
      default: return 0;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderEarningsCard = (title: string, amount: number, icon: string, color: string) => (
    <ResponsiveView style={[styles.earningsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ResponsiveView style={styles.cardHeader}>
        <MaterialIcons name={icon as any} size={24} color={color} />
        <ResponsiveText size="sm" color={colors.textSecondary}>
          {title}
        </ResponsiveText>
      </ResponsiveView>
      <ResponsiveText size="xxl" weight="bold" color={color}>
        ₱{amount.toFixed(2)}
      </ResponsiveText>
    </ResponsiveView>
  );

  const renderWeeklyBreakdown = () => (
    <ResponsiveView style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ResponsiveView marginBottom="md">
        <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
          This Week's Breakdown
        </ResponsiveText>
      </ResponsiveView>
      <ResponsiveView style={styles.weeklyChart}>
        {earningsData?.weeklyBreakdown.map((day, index) => (
          <ResponsiveView key={index} style={styles.dayColumn}>
            <ResponsiveView 
              style={[
                styles.bar, 
                { 
                  height: (day.earnings / 65) * 100, // Scale to max 65
                  backgroundColor: colors.primary 
                }
              ]} 
            >
              <View />
            </ResponsiveView>
            <ResponsiveView marginTop="xs">
              <ResponsiveText size="xs" color={colors.textSecondary}>
                {day.day}
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveText size="xs" color={colors.text} weight="semiBold">
              ₱{day.earnings.toFixed(0)}
            </ResponsiveText>
          </ResponsiveView>
        ))}
      </ResponsiveView>
    </ResponsiveView>
  );

  const renderRecentDeliveries = () => (
    <ResponsiveView style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ResponsiveView style={styles.sectionHeader}>
        <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
          Recent Deliveries
        </ResponsiveText>
        <TouchableOpacity onPress={() => router.push('/(delivery)/orders/my-orders' as any)}>
          <ResponsiveText size="sm" color={colors.primary}>
            View All
          </ResponsiveText>
        </TouchableOpacity>
      </ResponsiveView>
      
      <ResponsiveView style={styles.deliveriesList}>
        {earningsData?.recentDeliveries.slice(0, 5).map((delivery) => (
          <ResponsiveView key={delivery.id} style={styles.deliveryItem}>
            <ResponsiveView style={styles.deliveryInfo}>
              <ResponsiveText size="md" weight="medium" color={colors.text}>
                {delivery.orderNumber}
              </ResponsiveText>
              <ResponsiveText size="sm" color={colors.textSecondary}>
                {formatDate(delivery.date)}
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveView style={styles.deliveryEarnings}>
              <ResponsiveText size="md" weight="semiBold" color={colors.success}>
                +₱{delivery.earnings.toFixed(2)}
              </ResponsiveText>
              <ResponsiveView style={[styles.statusBadge, { backgroundColor: `${colors.success}20` }]}>
                <MaterialIcons name="check-circle" size={12} color={colors.success} />
                <ResponsiveView marginLeft="xs">
                  <ResponsiveText size="xs" color={colors.success} weight="semiBold">
                    Completed
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>
            </ResponsiveView>
          </ResponsiveView>
        ))}
      </ResponsiveView>
    </ResponsiveView>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="md" color={colors.textSecondary}>
              {Strings.loading}
            </ResponsiveText>
          </ResponsiveView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ResponsiveView style={styles.header}>
        <ResponsiveText size="xl" weight="bold" color={colors.text}>
          My Earnings
        </ResponsiveText>
        <ResponsiveText size="md" color={colors.textSecondary}>
          Track your delivery earnings and performance
        </ResponsiveText>
      </ResponsiveView>

      {/* Time Period Tabs */}
      <ResponsiveView style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsList}
        >
          {timeTabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && { 
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
                activeTab !== tab && { borderColor: colors.border },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <ResponsiveText 
                size="sm" 
                weight="medium"
                color={activeTab === tab ? colors.background : colors.text}
              >
                {tab}
              </ResponsiveText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ResponsiveView>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <ResponsiveView style={styles.content}>
          {/* Main Earnings Card */}
          <ResponsiveView style={[styles.mainEarningsCard, { backgroundColor: colors.primary }]}>
            <ResponsiveText size="lg" weight="semiBold" color={colors.background}>
              {activeTab} Earnings
            </ResponsiveText>
            <ResponsiveText size="xxxl" weight="bold" color={colors.background}>
              ₱{getCurrentEarnings().toFixed(2)}
            </ResponsiveText>
            <ResponsiveView style={styles.withdrawButton}>
              <Button
                title="Withdraw Earnings"
                onPress={handleWithdrawEarnings}
                variant="secondary"
                size="small"
              />
            </ResponsiveView>
          </ResponsiveView>

          {/* Stats Cards */}
          <ResponsiveView style={styles.statsGrid}>
            {renderEarningsCard(
              'Total Deliveries',
              earningsData?.totalDeliveries || 0,
              'delivery-dining',
              colors.info
            )}
            {renderEarningsCard(
              'Completed',
              earningsData?.completedDeliveries || 0,
              'check-circle',
              colors.success
            )}
            {renderEarningsCard(
              'Avg per Delivery',
              earningsData?.averageEarningPerDelivery || 0,
              'trending-up',
              colors.warning
            )}
            {renderEarningsCard(
              'Rating',
              earningsData?.rating || 0,
              'star',
              colors.primary
            )}
          </ResponsiveView>

          {/* Weekly Breakdown Chart */}
          {activeTab === 'This Week' && renderWeeklyBreakdown()}

          {/* Recent Deliveries */}
          {renderRecentDeliveries()}
        </ResponsiveView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  tabsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  tabsList: {
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  mainEarningsCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  withdrawButton: {
    marginTop: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  earningsCard: {
    flex: 1,
    minWidth: 150,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  sectionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    marginBottom: 8,
  },
  deliveriesList: {
    gap: 12,
  },
  deliveryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryEarnings: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
});
