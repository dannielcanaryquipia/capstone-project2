import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { AdminCard, AdminLayout, AdminMetricCard, AdminSection } from '../../../components/admin';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import { ResponsiveBorderRadius, ResponsiveSpacing, responsiveValue } from '../../../constants/Responsive';
import { Strings } from '../../../constants/Strings';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAdminStats, useTopProducts } from '../../../hooks';
import { supabase } from '../../../lib/supabase';
import { ReportData, ReportsService } from '../../../services/reports.service';
const reportTabs = ['Overview', 'Sales', 'Products', 'Customers'];
const timePeriods = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' }
];

export default function AdminReportsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { stats, isLoading: statsLoading, refresh: refreshStats } = useAdminStats();
  const { topProducts, isLoading: topProductsLoading, refresh: refreshTopProducts } = useTopProducts(10);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  
  // Simple revenue analytics implementation
  const [revenueAnalytics, setRevenueAnalytics] = useState<any>(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
  
  const refreshRevenue = async () => {
    setRevenueLoading(true);
    try {
      const currentDate = new Date();
      let startDate: Date;
      let endDate: Date = currentDate;

      // Calculate date range based on selected period
      switch (selectedPeriod) {
        case 'week':
          startDate = new Date(currentDate);
          startDate.setDate(currentDate.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(currentDate.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      }

      // Fetch orders within the selected time period
      const { data: orders, error } = await supabase
        .from('orders')
        .select('total_amount, created_at, status, payment_status')
        .eq('status', 'delivered')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate totals for the selected period
      const totalIncome = orders?.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const averageOrderValue = totalOrders > 0 ? totalIncome / totalOrders : 0;

      // Calculate period-specific data
      let periodData: any[] = [];
      
      if (selectedPeriod === 'week') {
        // Group by day for the last 7 days
        const dailyMap = new Map<string, { income: number; orderCount: number }>();
        
        orders?.forEach((order: any) => {
          const orderDate = new Date(order.created_at);
          const dateKey = orderDate.toISOString().split('T')[0];
          const dayName = orderDate.toLocaleDateString('en-US', { weekday: 'short' });
          
          if (dailyMap.has(dateKey)) {
            const existing = dailyMap.get(dateKey)!;
            existing.income += order.total_amount || 0;
            existing.orderCount += 1;
          } else {
            dailyMap.set(dateKey, { 
              income: order.total_amount || 0, 
              orderCount: 1 
            });
          }
        });

        // Fill in missing days
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateKey = date.toISOString().split('T')[0];
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          
          const dayData = dailyMap.get(dateKey) || { income: 0, orderCount: 0 };
          periodData.push({
            period: dayName,
            date: dateKey,
            income: dayData.income,
            orderCount: dayData.orderCount,
          });
        }
      } else if (selectedPeriod === 'month') {
        // Group by week for the current month
        const weeklyMap = new Map<string, { income: number; orderCount: number }>();
        
        orders?.forEach((order: any) => {
          const orderDate = new Date(order.created_at);
          const weekStart = new Date(orderDate);
          weekStart.setDate(orderDate.getDate() - orderDate.getDay());
          const weekKey = weekStart.toISOString().split('T')[0];
          const weekLabel = `Week ${Math.ceil(orderDate.getDate() / 7)}`;
          
          if (weeklyMap.has(weekKey)) {
            const existing = weeklyMap.get(weekKey)!;
            existing.income += order.total_amount || 0;
            existing.orderCount += 1;
          } else {
            weeklyMap.set(weekKey, { 
              income: order.total_amount || 0, 
              orderCount: 1 
            });
          }
        });

        // Convert to array and sort
        periodData = Array.from(weeklyMap.entries()).map(([date, data]) => ({
          period: `Week ${Math.ceil(new Date(date).getDate() / 7)}`,
          date: date,
          income: data.income,
          orderCount: data.orderCount,
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      } else if (selectedPeriod === 'year') {
        // Group by month for the current year
        const monthlyMap = new Map<string, { income: number; orderCount: number }>();
        
        orders?.forEach((order: any) => {
          const orderDate = new Date(order.created_at);
          const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
          const monthName = orderDate.toLocaleDateString('default', { month: 'long' });
          
          if (monthlyMap.has(monthKey)) {
            const existing = monthlyMap.get(monthKey)!;
            existing.income += order.total_amount || 0;
            existing.orderCount += 1;
          } else {
            monthlyMap.set(monthKey, { 
              income: order.total_amount || 0, 
              orderCount: 1 
            });
          }
        });

        // Fill in missing months
        for (let i = 0; i < 12; i++) {
          const date = new Date(currentDate.getFullYear(), i, 1);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const monthName = date.toLocaleDateString('default', { month: 'long' });
          
          const monthData = monthlyMap.get(monthKey) || { income: 0, orderCount: 0 };
          periodData.push({
            period: monthName,
            date: monthKey,
            income: monthData.income,
            orderCount: monthData.orderCount,
          });
        }
      }
      
      const analytics = {
        totalIncome,
        totalOrders,
        averageOrderValue,
        periodData,
        selectedPeriod
      };
      
      console.log(`Revenue analytics for ${selectedPeriod}:`, analytics);
      setRevenueAnalytics(analytics);
    } catch (error) {
      console.error('Error loading revenue analytics:', error);
    } finally {
      setRevenueLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod]);

  useEffect(() => {
    if (stats) {
      refreshRevenue();
    }
  }, [stats]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on selected period
      const currentDate = new Date();
      let startDate: Date;
      let endDate: Date = currentDate;

      switch (selectedPeriod) {
        case 'week':
          startDate = new Date(currentDate);
          startDate.setDate(currentDate.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(currentDate.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      }

      // Fetch orders within the selected time period
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, created_at, status')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .eq('status', 'delivered');

      if (ordersError) throw ordersError;

      // Calculate period-specific totals
      const totalIncome = orders?.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const averageOrderValue = totalOrders > 0 ? totalIncome / totalOrders : 0;

      // Fetch other report data (these don't need time filtering)
      const [topProducts, customerStats, orderStatusBreakdown, recentOrders] = await Promise.all([
        ReportsService.getTopProducts(5),
        ReportsService.getCustomerStats(),
        ReportsService.getOrderStatusBreakdown(),
        ReportsService.getRecentOrders(5)
      ]);

      const reportData: ReportData = {
        totalIncome,
        totalOrders,
        averageOrderValue,
        topProducts,
        orderStatusBreakdown,
        dailyIncome: [], // We'll use periodData from revenueAnalytics instead
        customerStats,
        recentOrders
      };

      setReportData(reportData);
    } catch (error) {
      console.error('Error loading report data:', error);
      // Fallback to stats data if reports service fails
      const fallbackData: ReportData = {
        totalIncome: stats?.total_income || 0,
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
        dailyIncome: [],
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
    await Promise.all([
      refreshStats(),
      refreshTopProducts(),
      refreshRevenue(),
      loadReportData()
    ]);
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
        <AdminMetricCard
          title="Total Income"
          value={`₱${(reportData?.totalIncome || 0).toFixed(2)}`}
          subtitle={selectedPeriod === 'week' ? 'This week' : selectedPeriod === 'month' ? 'This month' : 'This year'}
          icon="attach-money"
          iconColor={colors.success}
          variant="outlined"
          size="medium"
        />
        <AdminMetricCard
          title="Total Orders"
          value={reportData?.totalOrders || 0}
          subtitle={selectedPeriod === 'week' ? 'This week' : selectedPeriod === 'month' ? 'This month' : 'This year'}
          icon="receipt"
          iconColor={colors.primary}
          variant="outlined"
          size="medium"
        />
      </ResponsiveView>

      {/* Recent Orders Section */}
      <AdminSection
        title="Recent Orders"
        subtitle="Latest order activity"
        variant="card"
      >
        {reportData?.recentOrders && reportData.recentOrders.length > 0 ? (
          <ResponsiveView style={styles.ordersList}>
            {reportData.recentOrders.slice(0, 3).map((order: any, index: number) => (
              <AdminCard
                key={index}
                variant="outlined"
                style={styles.orderCard}
              >
                <ResponsiveView style={styles.orderHeader}>
                  <ResponsiveText size="md" color={colors.text} weight="semiBold">
                    #{order.id.slice(-8)}
                  </ResponsiveText>
                  <ResponsiveText 
                    size="sm" 
                    color={order.status === 'delivered' ? colors.success : order.status === 'cancelled' ? colors.error : colors.warning}
                    weight="semiBold"
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </ResponsiveText>
                </ResponsiveView>
                <ResponsiveView marginBottom="xs">
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    {order.customer_name}
                  </ResponsiveText>
                </ResponsiveView>
                <ResponsiveView style={styles.orderFooter}>
                  <ResponsiveText size="sm" color={colors.primary} weight="semiBold">
                    ₱{order.total_amount.toFixed(2)}
                  </ResponsiveText>
                  <ResponsiveText size="xs" color={colors.textSecondary}>
                    {new Date(order.created_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: '2-digit', 
                      year: 'numeric' 
                    })}
                  </ResponsiveText>
                </ResponsiveView>
              </AdminCard>
            ))}
          </ResponsiveView>
        ) : (
          <ResponsiveView style={styles.center}>
            <ResponsiveText size="md" color={colors.textSecondary}>
              No recent orders
            </ResponsiveText>
          </ResponsiveView>
        )}
      </AdminSection>

      {/* Order Status Breakdown */}
      <AdminSection
        title="Order Status Breakdown"
        subtitle="Distribution of orders by status"
        variant="outlined"
      >
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
      </AdminSection>

      {/* Top Products Preview */}
      <AdminSection
        title="Top Products"
        subtitle="Best performing products"
        variant="outlined"
      >
        {topProductsLoading ? (
          <ResponsiveView style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <ResponsiveText size="sm" color={colors.textSecondary} style={{ marginTop: 8 }}>
              Loading top products...
            </ResponsiveText>
          </ResponsiveView>
        ) : (
          <ResponsiveView style={styles.productsList}>
            {topProducts.length > 0 ? (
              topProducts.slice(0, 5).map((product, index) => (
                <AdminCard
                  key={product.id}
                  variant="outlined"
                  style={styles.productItem}
                >
                  <ResponsiveView style={styles.productInfo}>
                    <ResponsiveText size="md" weight="medium" color={colors.text}>
                      #{index + 1} {product.name}
                    </ResponsiveText>
                    <ResponsiveText size="sm" color={colors.textSecondary}>
                      {product.category?.name || 'Unknown Category'}
                    </ResponsiveText>
                  </ResponsiveView>
                  <ResponsiveText size="sm" weight="semiBold" color={colors.primary}>
                    ₱{product.base_price.toFixed(2)}
                  </ResponsiveText>
                </AdminCard>
              ))
            ) : (
              <ResponsiveText size="md" color={colors.textSecondary} align="center">
                No products found
              </ResponsiveText>
            )}
          </ResponsiveView>
        )}
      </AdminSection>
      </ResponsiveView>
  );

  const renderCustomersTab = () => (
    <ResponsiveView style={styles.tabContent}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalCardsContainer}
        style={styles.horizontalScrollView}
      >
        <AdminMetricCard
          title="Total Customers"
          value={reportData?.customerStats?.totalCustomers || 0}
          icon="people"
          iconColor={colors.primary}
          variant="outlined"
          size="medium"
          fixedWidth={true}
        />
        <AdminMetricCard
          title="New Customers"
          value={reportData?.customerStats?.newCustomers || 0}
          icon="person-add"
          iconColor={colors.success}
          variant="outlined"
          size="medium"
          fixedWidth={true}
        />
        <AdminMetricCard
          title="Returning Customers"
          value={reportData?.customerStats?.returningCustomers || 0}
          icon="repeat"
          iconColor={colors.info}
          variant="outlined"
          size="medium"
          fixedWidth={true}
        />
      </ScrollView>
    </ResponsiveView>
  );

  const renderSalesTab = () => (
    <ResponsiveView style={styles.tabContent}>
      {/* Revenue Summary */}
      <AdminSection
        title="Revenue Summary"
        subtitle="Financial performance overview"
        variant="outlined"
      >
        {revenueLoading ? (
          <ResponsiveView style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <ResponsiveText size="sm" color={colors.textSecondary} style={{ marginTop: 8 }}>
              Loading revenue data...
            </ResponsiveText>
          </ResponsiveView>
        ) : revenueAnalytics ? (
          <ResponsiveView style={styles.cardsGrid}>
            <AdminMetricCard
              title="Total Income"
              value={`₱${revenueAnalytics.totalIncome.toFixed(2)}`}
              icon="attach-money"
              iconColor={colors.primary}
              variant="outlined"
              size="medium"
            />
            <AdminMetricCard
              title="Total Orders"
              value={revenueAnalytics.totalOrders}
              icon="receipt"
              iconColor={colors.info}
              variant="outlined"
              size="medium"
            />
          </ResponsiveView>
        ) : (
          <ResponsiveText size="md" color={colors.textSecondary} align="center">
            No revenue data available
          </ResponsiveText>
        )}
      </AdminSection>

      {/* Monthly/Yearly Revenue */}
      <AdminSection
        title={`Income by ${selectedPeriod === 'week' ? 'Day' : selectedPeriod === 'month' ? 'Week' : 'Month'}`}
        subtitle="Periodic income breakdown"
        variant="outlined"
      >
        {revenueLoading ? (
          <ResponsiveView style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <ResponsiveText size="sm" color={colors.textSecondary} style={{ marginTop: 8 }}>
              Loading revenue data...
            </ResponsiveText>
          </ResponsiveView>
        ) : revenueAnalytics ? (
          <ResponsiveView style={styles.revenueList}>
            {revenueAnalytics.periodData
              .slice(0, 12) // Show last 12 periods
              .map((period: any, index: number) => (
                <AdminCard
                  key={`${period.date}-${index}`}
                  variant="outlined"
                  style={styles.revenueItem}
                >
                  <ResponsiveView style={styles.periodInfo}>
                    <ResponsiveText size="md" weight="medium" color={colors.text}>
                      {period.period}
                    </ResponsiveText>
                    <ResponsiveText size="sm" color={colors.textSecondary}>
                      {period.orderCount} orders
                    </ResponsiveText>
                  </ResponsiveView>
                  <ResponsiveText size="lg" weight="semiBold" color={colors.primary}>
                    ₱{period.income.toFixed(2)}
                  </ResponsiveText>
                </AdminCard>
              ))}
          </ResponsiveView>
        ) : (
          <ResponsiveText size="md" color={colors.textSecondary} align="center">
            No revenue data available
          </ResponsiveText>
        )}
      </AdminSection>
    </ResponsiveView>
  );

  const renderProductsTab = () => (
    <ResponsiveView style={styles.tabContent}>
      <AdminSection
        title="Top Selling Products"
        subtitle="Best performing products by sales"
        variant="outlined"
      >
        {topProductsLoading ? (
          <ResponsiveView style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <ResponsiveText size="sm" color={colors.textSecondary} style={{ marginTop: 8 }}>
              Loading top products...
            </ResponsiveText>
          </ResponsiveView>
        ) : (
          <ResponsiveView style={styles.productsList}>
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <AdminCard
                  key={product.id}
                  variant="outlined"
                  style={styles.productItem}
                >
                  <ResponsiveView style={styles.productInfo}>
                    <ResponsiveText size="md" weight="medium" color={colors.text}>
                      {product.name}
                    </ResponsiveText>
                    <ResponsiveText size="sm" color={colors.textSecondary}>
                      {product.category?.name || 'Unknown Category'}
                    </ResponsiveText>
                    <ResponsiveText size="xs" color={colors.textSecondary}>
                      ₱{product.base_price.toFixed(2)}
                    </ResponsiveText>
                  </ResponsiveView>
                  <ResponsiveView style={styles.productStats}>
                    <ResponsiveText size="sm" weight="semiBold" color={colors.primary}>
                      #{index + 1}
                    </ResponsiveText>
                    <ResponsiveText size="xs" color={colors.textSecondary}>
                      {product.is_available ? 'Available' : 'Unavailable'}
                    </ResponsiveText>
                  </ResponsiveView>
                </AdminCard>
              ))
            ) : (
              <ResponsiveView style={styles.emptyState}>
                <ResponsiveText size="md" color={colors.textSecondary} align="center">
                  No products found
                </ResponsiveText>
              </ResponsiveView>
            )}
          </ResponsiveView>
        )}
      </AdminSection>
    </ResponsiveView>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview': return renderOverviewTab();
      case 'Sales': return renderSalesTab();
      case 'Products': return renderProductsTab();
      case 'Customers': return renderCustomersTab();
      default: return renderOverviewTab();
    }
  };

  if (loading) {
    return (
      <AdminLayout
        title="Reports & Analytics"
        subtitle="Business insights and performance metrics"
        showBackButton={true}
        onBackPress={() => router.replace('/(admin)/dashboard')}
        headerActions={
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <MaterialIcons name="refresh" size={responsiveValue(20, 24, 28, 32)} color={colors.primary} />
          </TouchableOpacity>
        }
      >
        <ResponsiveView style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="md" color={colors.textSecondary}>
              {Strings.loading}
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Reports & Analytics"
      subtitle="Business insights and performance metrics"
      showBackButton={true}
      onBackPress={() => router.replace('/(admin)/dashboard')}
      headerActions={
              <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
                <MaterialIcons name="refresh" size={responsiveValue(20, 24, 28, 32)} color={colors.primary} />
              </TouchableOpacity>
      }
    >
      {/* Time Period Selection */}
      <ResponsiveView marginBottom="sm">
        <FlatList
          data={timePeriods}
            horizontal
            showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: ResponsiveSpacing.md }}
          renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                styles.categoryItem,
                {
                  backgroundColor: selectedPeriod === item.key ? colors.primary : 'transparent',
                  borderColor: selectedPeriod === item.key ? colors.primary : colors.border,
                  borderWidth: 1,
                },
                selectedPeriod === item.key && styles.categoryItemActive,
              ]}
              onPress={() => setSelectedPeriod(item.key)}
              >
                <ResponsiveText 
                  size="sm" 
                color={selectedPeriod === item.key ? 'white' : colors.text}
                weight={selectedPeriod === item.key ? 'semiBold' : 'regular'}
                style={{ textAlign: 'center', lineHeight: undefined }}
                >
                {item.label}
                </ResponsiveText>
              </TouchableOpacity>
          )}
          keyExtractor={(item) => item.key}
        />
        </ResponsiveView>

        {/* Report Tabs */}
      <ResponsiveView marginBottom="sm">
        <FlatList
          data={reportTabs}
            horizontal
            showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: ResponsiveSpacing.md }}
          renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                styles.categoryItem,
                {
                  backgroundColor: activeTab === item ? colors.primary : 'transparent',
                  borderColor: activeTab === item ? colors.primary : colors.border,
                  borderWidth: 1,
                },
                activeTab === item && styles.categoryItemActive,
              ]}
              onPress={() => setActiveTab(item)}
              >
                <ResponsiveText 
                  size="sm" 
                color={activeTab === item ? 'white' : colors.text}
                weight={activeTab === item ? 'semiBold' : 'regular'}
                style={{ textAlign: 'center', lineHeight: undefined }}
                >
                {item}
                </ResponsiveText>
              </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
        />
      </ResponsiveView>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {renderTabContent()}
      </ScrollView>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    padding: ResponsiveSpacing.sm,
  },
  timePeriodList: {
    gap: ResponsiveSpacing.sm,
  },
  timePeriodPill: {
    marginRight: ResponsiveSpacing.sm,
  },
  tabsList: {
    gap: ResponsiveSpacing.sm,
  },
  tabPill: {
    marginRight: ResponsiveSpacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: ResponsiveSpacing.lg,
  },
  cardsGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: ResponsiveSpacing.lg,
    marginBottom: ResponsiveSpacing.xl,
    paddingHorizontal: ResponsiveSpacing.lg,
  },
  horizontalScrollView: {
    marginBottom: ResponsiveSpacing.xl,
  },
  horizontalCardsContainer: {
    flexDirection: 'row',
    paddingHorizontal: ResponsiveSpacing.lg,
    gap: ResponsiveSpacing.lg,
  },
  ordersList: {
    gap: ResponsiveSpacing.sm,
  },
  orderCard: {
    padding: ResponsiveSpacing.md,
    borderRadius: ResponsiveBorderRadius.md,
    ...Layout.shadows.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.xs,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusList: {
    gap: ResponsiveSpacing.sm,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: ResponsiveSpacing.sm,
  },
  dailyRevenueList: {
    gap: ResponsiveSpacing.sm,
  },
  dailyRevenueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: ResponsiveSpacing.sm,
  },
  dateInfo: {
    flex: 1,
  },
  productsList: {
    gap: ResponsiveSpacing.sm,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: ResponsiveSpacing.sm,
  },
  productInfo: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: ResponsiveSpacing.xl,
  },
  productStats: {
    alignItems: 'flex-end',
  },
  revenueCard: {
    alignItems: 'center',
    flex: 1,
  },
  revenueList: {
    gap: ResponsiveSpacing.sm,
  },
  revenueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: ResponsiveSpacing.sm,
    paddingHorizontal: ResponsiveSpacing.md,
    backgroundColor: '#f5f5f5',
    borderRadius: ResponsiveBorderRadius.md,
  },
  periodInfo: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: responsiveValue(12, 14, 16, 18),
    paddingVertical: responsiveValue(6, 8, 10, 12),
    borderRadius: responsiveValue(16, 18, 20, 22),
    marginRight: responsiveValue(6, 8, 10, 12),
    minWidth: responsiveValue(72, 80, 88, 100),
    minHeight: responsiveValue(36, 40, 44, 48),
  },
  categoryItemActive: {
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 0,
  },
});
