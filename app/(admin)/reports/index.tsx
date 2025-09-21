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
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import { Strings } from '../../../constants/Strings';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAdminStats } from '../../../hooks';
import { ReportData, ReportsService } from '../../../services/reports.service';

const reportTabs = ['Overview', 'Sales', 'Products', 'Customers', 'Delivery'];
const timePeriods = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'quarter', label: 'This Quarter' },
  { key: 'year', label: 'This Year' }
];

export default function AdminReportsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { stats, isLoading: statsLoading, refresh: refreshStats } = useAdminStats();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      // Fetch real report data from backend
      const reportData = await ReportsService.getReportData();
      setReportData(reportData);
    } catch (error) {
      console.error('Error loading report data:', error);
      // Fallback to stats data if reports service fails
      const fallbackData: ReportData = {
        totalRevenue: stats?.total_revenue || 0,
        totalOrders: stats?.total_orders || 0,
        averageOrderValue: stats?.average_order_value || 0,
        topProducts: [],
        orderStatusBreakdown: {
          pending: stats?.pending_orders || 0,
          preparing: stats?.preparing_orders || 0,
          outForDelivery: stats?.out_for_delivery || 0,
          delivered: stats?.delivered_orders || 0,
          cancelled: stats?.cancelled_orders || 0,
        },
        dailyRevenue: [],
        customerStats: {
          totalCustomers: stats?.total_users || 0,
          newCustomers: 0,
          returningCustomers: 0,
        },
      };
      setReportData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReportData();
    setRefreshing(false);
  };

  const handleExportReport = () => {
    Alert.alert(
      'Export Report',
      'Choose export format:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'PDF', onPress: () => console.log('Export as PDF') },
        { text: 'Excel', onPress: () => console.log('Export as Excel') },
        { text: 'CSV', onPress: () => console.log('Export as CSV') },
      ]
    );
  };

  const renderOverviewTab = () => (
    <ResponsiveView style={styles.tabContent}>
      {/* Revenue Cards */}
      <ResponsiveView style={styles.cardsGrid}>
        <ResponsiveView style={[styles.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ResponsiveView style={styles.cardHeader}>
            <MaterialIcons name="attach-money" size={24} color={colors.primary} />
            <ResponsiveText size="sm" color={colors.textSecondary}>
              Total Revenue
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveText size="xxl" weight="bold" color={colors.primary}>
            ₱{(reportData?.totalRevenue || 0).toFixed(2)}
          </ResponsiveText>
        </ResponsiveView>

        <ResponsiveView style={[styles.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ResponsiveView style={styles.cardHeader}>
            <MaterialIcons name="receipt" size={24} color={colors.success} />
            <ResponsiveText size="sm" color={colors.textSecondary}>
              Total Orders
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveText size="xxl" weight="bold" color={colors.success}>
            {reportData?.totalOrders}
          </ResponsiveText>
        </ResponsiveView>

        <ResponsiveView style={[styles.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ResponsiveView style={styles.cardHeader}>
            <MaterialIcons name="trending-up" size={24} color={colors.info} />
            <ResponsiveText size="sm" color={colors.textSecondary}>
              Avg Order Value
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveText size="xxl" weight="bold" color={colors.info}>
            ₱{(reportData?.averageOrderValue || 0).toFixed(2)}
          </ResponsiveText>
        </ResponsiveView>

        <ResponsiveView style={[styles.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ResponsiveView style={styles.cardHeader}>
            <MaterialIcons name="people" size={24} color={colors.warning} />
            <ResponsiveText size="sm" color={colors.textSecondary}>
              Total Customers
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveText size="xxl" weight="bold" color={colors.warning}>
            {reportData?.customerStats.totalCustomers}
          </ResponsiveText>
        </ResponsiveView>
      </ResponsiveView>

      {/* Order Status Breakdown */}
      <ResponsiveView style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ResponsiveView marginBottom="md">
          <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
            Order Status Breakdown
          </ResponsiveText>
        </ResponsiveView>
        <ResponsiveView style={styles.statusList}>
          {Object.entries(reportData?.orderStatusBreakdown || {}).map(([status, count]) => (
            <ResponsiveView key={status} style={styles.statusItem}>
              <ResponsiveText size="sm" color={colors.textSecondary}>
                {status.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </ResponsiveText>
              <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                {count}
              </ResponsiveText>
            </ResponsiveView>
          ))}
        </ResponsiveView>
      </ResponsiveView>
    </ResponsiveView>
  );

  const renderSalesTab = () => (
    <ResponsiveView style={styles.tabContent}>
      <ResponsiveView style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ResponsiveView marginBottom="md">
          <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
            Daily Revenue (Last 5 Days)
          </ResponsiveText>
        </ResponsiveView>
        <ResponsiveView style={styles.dailyRevenueList}>
          {reportData?.dailyRevenue.map((day, index) => (
            <ResponsiveView key={index} style={styles.dailyRevenueItem}>
              <ResponsiveView style={styles.dateInfo}>
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  {new Date(day.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </ResponsiveText>
                <ResponsiveText size="xs" color={colors.textSecondary}>
                  {day.orders} orders
                </ResponsiveText>
              </ResponsiveView>
              <ResponsiveText size="md" weight="semiBold" color={colors.primary}>
                ₱{(day.revenue || 0).toFixed(2)}
              </ResponsiveText>
            </ResponsiveView>
          ))}
        </ResponsiveView>
      </ResponsiveView>
    </ResponsiveView>
  );

  const renderProductsTab = () => (
    <ResponsiveView style={styles.tabContent}>
      <ResponsiveView style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ResponsiveView marginBottom="md">
          <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
            Top Selling Products
          </ResponsiveText>
        </ResponsiveView>
        <ResponsiveView style={styles.productsList}>
          {reportData?.topProducts.map((product, index) => (
            <ResponsiveView key={index} style={styles.productItem}>
              <ResponsiveView style={styles.productInfo}>
                <ResponsiveText size="md" weight="medium" color={colors.text}>
                  {product.name}
                </ResponsiveText>
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  {product.quantity} sold
                </ResponsiveText>
              </ResponsiveView>
              <ResponsiveText size="md" weight="semiBold" color={colors.primary}>
                ₱{(product.revenue || 0).toFixed(2)}
              </ResponsiveText>
            </ResponsiveView>
          ))}
        </ResponsiveView>
      </ResponsiveView>
    </ResponsiveView>
  );

  const renderCustomersTab = () => (
    <ResponsiveView style={styles.tabContent}>
      <ResponsiveView style={styles.cardsGrid}>
        <ResponsiveView style={[styles.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ResponsiveView style={styles.cardHeader}>
            <MaterialIcons name="people" size={24} color={colors.primary} />
            <ResponsiveText size="sm" color={colors.textSecondary}>
              Total Customers
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveText size="xxl" weight="bold" color={colors.primary}>
            {reportData?.customerStats.totalCustomers}
          </ResponsiveText>
        </ResponsiveView>

        <ResponsiveView style={[styles.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ResponsiveView style={styles.cardHeader}>
            <MaterialIcons name="person-add" size={24} color={colors.success} />
            <ResponsiveText size="sm" color={colors.textSecondary}>
              New Customers
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveText size="xxl" weight="bold" color={colors.success}>
            {reportData?.customerStats.newCustomers}
          </ResponsiveText>
        </ResponsiveView>

        <ResponsiveView style={[styles.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ResponsiveView style={styles.cardHeader}>
            <MaterialIcons name="repeat" size={24} color={colors.info} />
            <ResponsiveText size="sm" color={colors.textSecondary}>
              Returning Customers
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveText size="xxl" weight="bold" color={colors.info}>
            {reportData?.customerStats.returningCustomers}
          </ResponsiveText>
        </ResponsiveView>
      </ResponsiveView>
    </ResponsiveView>
  );

  const renderDeliveryTab = () => (
    <ResponsiveView style={styles.tabContent}>
      <ResponsiveView style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ResponsiveView marginBottom="md">
          <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
            Delivery Performance
          </ResponsiveText>
        </ResponsiveView>
        <ResponsiveView style={styles.deliveryStats}>
          <ResponsiveView style={styles.deliveryStatItem}>
            <MaterialIcons name="delivery-dining" size={20} color={colors.primary} />
            <ResponsiveView marginLeft="sm">
              <ResponsiveText size="sm" color={colors.textSecondary}>
                Average Delivery Time
              </ResponsiveText>
              <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                25 minutes
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>
          
          <ResponsiveView style={styles.deliveryStatItem}>
            <MaterialIcons name="check-circle" size={20} color={colors.success} />
            <ResponsiveView marginLeft="sm">
              <ResponsiveText size="sm" color={colors.textSecondary}>
                On-Time Delivery Rate
              </ResponsiveText>
              <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                94.2%
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>
          
          <ResponsiveView style={styles.deliveryStatItem}>
            <MaterialIcons name="star" size={20} color={colors.warning} />
            <ResponsiveView marginLeft="sm">
              <ResponsiveText size="sm" color={colors.textSecondary}>
                Customer Rating
              </ResponsiveText>
              <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                4.8/5.0
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>
        </ResponsiveView>
      </ResponsiveView>
    </ResponsiveView>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview': return renderOverviewTab();
      case 'Sales': return renderSalesTab();
      case 'Products': return renderProductsTab();
      case 'Customers': return renderCustomersTab();
      case 'Delivery': return renderDeliveryTab();
      default: return renderOverviewTab();
    }
  };

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
          Reports & Analytics
        </ResponsiveText>
        <ResponsiveText size="md" color={colors.textSecondary}>
          Business insights and performance metrics
        </ResponsiveText>
      </ResponsiveView>

      {/* Time Period Selection */}
      <ResponsiveView style={styles.timePeriodContainer}>
        <ResponsiveText size="sm" color={colors.textSecondary} style={styles.timePeriodLabel}>
          Time Period:
        </ResponsiveText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.timePeriodList}
        >
          {timePeriods.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.timePeriodTab,
                selectedPeriod === period.key && { 
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
                selectedPeriod !== period.key && { borderColor: colors.border },
              ]}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <ResponsiveText 
                size="sm" 
                weight="medium"
                color={selectedPeriod === period.key ? colors.background : colors.text}
              >
                {period.label}
              </ResponsiveText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ResponsiveView>

      {/* Report Tabs */}
      <ResponsiveView style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsList}
        >
          {reportTabs.map((tab) => (
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
        {renderTabContent()}
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
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
  },
  timePeriodContainer: {
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.md,
  },
  timePeriodLabel: {
    marginBottom: Layout.spacing.sm,
  },
  timePeriodList: {
    gap: Layout.spacing.sm,
  },
  timePeriodTab: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.pill,
    borderWidth: 1,
  },
  tabsContainer: {
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.md,
  },
  tabsList: {
    gap: Layout.spacing.sm,
  },
  tab: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.pill,
    borderWidth: 1,
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  reportCard: {
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
  statusList: {
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dailyRevenueList: {
    gap: 12,
  },
  dailyRevenueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dateInfo: {
    flex: 1,
  },
  productsList: {
    gap: 12,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  productInfo: {
    flex: 1,
  },
  deliveryStats: {
    gap: 16,
  },
  deliveryStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
