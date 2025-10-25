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
import { RiderService } from '../../../services/rider.service';

interface EarningsData {
  totalEarnings: number;
  thisWeek: number;
  lastWeek: number;
  thisMonth: number;
  lastMonth: number;
  todayEarnings: number;
  totalDeliveries: number;
  completedDeliveries: number;
  averageEarningPerDelivery: number;
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

      // Get or create rider profile
      let rider = await RiderService.getRiderProfile(user.id);
      if (!rider) {
        rider = await RiderService.createRiderProfile(user.id);
      }

      if (!rider?.id) {
        throw new Error('Failed to get or create rider profile');
      }

      console.log('Loading earnings for rider:', rider.id);

      // Get earnings data using the service
      const earningsData = await RiderService.getRiderEarnings(rider.id);
      
      console.log('Earnings data loaded:', earningsData);

        const realData: EarningsData = {
          ...earningsData,
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
          todayEarnings: 0,
          totalDeliveries: 0,
          completedDeliveries: 0,
          averageEarningPerDelivery: 0,
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
      case 'Today': return earningsData?.todayEarnings || 0;
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

  // Show empty state if no earnings data
  if (!earningsData || earningsData.totalDeliveries === 0) {
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

        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <ResponsiveView style={styles.content}>
            <ResponsiveView style={[styles.emptyState, { backgroundColor: colors.surface }]}>
              <MaterialIcons name="account-balance-wallet" size={64} color={colors.textSecondary} />
              <ResponsiveView marginTop="lg">
                <ResponsiveText size="lg" color={colors.text} align="center" weight="semiBold">
                  No Earnings Yet
                </ResponsiveText>
              </ResponsiveView>
              <ResponsiveView marginTop="sm">
                <ResponsiveText size="md" color={colors.textSecondary} align="center">
                  Complete your first delivery to start earning!
                </ResponsiveText>
              </ResponsiveView>
              <ResponsiveView marginTop="lg">
                <Button
                  title="View Available Orders"
                  onPress={() => router.push('/(delivery)/orders' as any)}
                  variant="primary"
                  size="medium"
                />
              </ResponsiveView>
            </ResponsiveView>
          </ResponsiveView>
        </ScrollView>
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
          {/* Debug Info */}
          {__DEV__ && (
            <ResponsiveView style={[styles.debugCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <ResponsiveText size="sm" color={colors.textSecondary}>
                Debug Info:
              </ResponsiveText>
              <ResponsiveText size="xs" color={colors.textSecondary}>
                Total Deliveries: {earningsData?.totalDeliveries || 0} | 
                This Week: ₱{earningsData?.thisWeek?.toFixed(2) || '0.00'} | 
                This Month: ₱{earningsData?.thisMonth?.toFixed(2) || '0.00'}
              </ResponsiveText>
            </ResponsiveView>
          )}

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
  emptyState: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  debugCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
});
