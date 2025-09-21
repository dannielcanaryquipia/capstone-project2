import { supabase } from '../lib/supabase';
import { OrderService } from './order.service';
import { ProductService } from './product.service';
import { ReportsService } from './reports.service';
import { UserService } from './user.service';

export interface AdminDashboardData {
  // Stats
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  pendingOrders: number;
  preparingOrders: number;
  outForDeliveryOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  
  // Recent data
  recentOrders: any[];
  recentUsers: any[];
  recentProducts: any[];
  
  // Charts data
  dailyRevenue: any[];
  orderStatusBreakdown: any;
  topProducts: any[];
}

export interface AdminAnalytics {
  revenueGrowth: number;
  orderGrowth: number;
  userGrowth: number;
  productGrowth: number;
  averageOrderValue: number;
  completionRate: number;
  customerRetentionRate: number;
}

export class AdminService {
  // Get comprehensive dashboard data
  static async getDashboardData(): Promise<AdminDashboardData> {
    try {
      const [
        orderStats,
        productStats,
        userStats,
        recentOrders,
        recentUsers,
        recentProducts,
        dailyRevenue,
        orderStatusBreakdown,
        topProducts
      ] = await Promise.all([
        OrderService.getOrderStats(),
        ProductService.getProductStats(),
        UserService.getUserStats(),
        this.getRecentOrders(5),
        this.getRecentUsers(5),
        this.getRecentProducts(5),
        ReportsService.getDailyRevenue(7),
        ReportsService.getOrderStatusBreakdown(),
        ReportsService.getTopProducts(5)
      ]);

      return {
        totalOrders: orderStats.total_orders,
        totalRevenue: orderStats.total_revenue,
        totalUsers: userStats.total_users,
        totalProducts: productStats.total_products,
        pendingOrders: orderStats.pending_orders,
        preparingOrders: orderStats.preparing_orders,
        outForDeliveryOrders: orderStats.out_for_delivery,
        deliveredOrders: orderStats.delivered_orders,
        cancelledOrders: orderStats.cancelled_orders,
        recentOrders,
        recentUsers,
        recentProducts,
        dailyRevenue,
        orderStatusBreakdown,
        topProducts
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  // Get recent orders
  static async getRecentOrders(limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:profiles!orders_user_id_fkey(full_name, phone_number),
          delivery_address:addresses(full_address)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      return [];
    }
  }

  // Get recent users
  static async getRecentUsers(limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent users:', error);
      return [];
    }
  }

  // Get recent products
  static async getRecentProducts(limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent products:', error);
      return [];
    }
  }

  // Get analytics data
  static async getAnalytics(): Promise<AdminAnalytics> {
    try {
      const [
        currentMonthOrders,
        lastMonthOrders,
        currentMonthRevenue,
        lastMonthRevenue,
        currentMonthUsers,
        lastMonthUsers,
        currentMonthProducts,
        lastMonthProducts,
        orderStats
      ] = await Promise.all([
        this.getOrdersForMonth(new Date()),
        this.getOrdersForMonth(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
        this.getRevenueForMonth(new Date()),
        this.getRevenueForMonth(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
        this.getUsersForMonth(new Date()),
        this.getUsersForMonth(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
        this.getProductsForMonth(new Date()),
        this.getProductsForMonth(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
        OrderService.getOrderStats()
      ]);

      const revenueGrowth = lastMonthRevenue > 0 
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;
      
      const orderGrowth = lastMonthOrders > 0 
        ? ((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100 
        : 0;
      
      const userGrowth = lastMonthUsers > 0 
        ? ((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100 
        : 0;
      
      const productGrowth = lastMonthProducts > 0 
        ? ((currentMonthProducts - lastMonthProducts) / lastMonthProducts) * 100 
        : 0;

      return {
        revenueGrowth,
        orderGrowth,
        userGrowth,
        productGrowth,
        averageOrderValue: orderStats.average_order_value,
        completionRate: orderStats.completion_rate,
        customerRetentionRate: 0 // TODO: Implement customer retention calculation
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  // Helper methods for analytics
  private static async getOrdersForMonth(date: Date): Promise<number> {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const { count, error } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())
      .lte('created_at', endOfMonth.toISOString());

    if (error) throw error;
    return count || 0;
  }

  private static async getRevenueForMonth(date: Date): Promise<number> {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const { data, error } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', startOfMonth.toISOString())
      .lte('created_at', endOfMonth.toISOString());

    if (error) throw error;
    return data?.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0) || 0;
  }

  private static async getUsersForMonth(date: Date): Promise<number> {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())
      .lte('created_at', endOfMonth.toISOString());

    if (error) throw error;
    return count || 0;
  }

  private static async getProductsForMonth(date: Date): Promise<number> {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())
      .lte('created_at', endOfMonth.toISOString());

    if (error) throw error;
    return count || 0;
  }

  // Get system health metrics
  static async getSystemHealth(): Promise<{
    databaseStatus: 'healthy' | 'warning' | 'error';
    apiResponseTime: number;
    activeConnections: number;
    errorRate: number;
  }> {
    try {
      const startTime = Date.now();
      
      // Test database connection
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      const responseTime = Date.now() - startTime;
      
      return {
        databaseStatus: error ? 'error' : responseTime > 1000 ? 'warning' : 'healthy',
        apiResponseTime: responseTime,
        activeConnections: 0, // TODO: Implement connection tracking
        errorRate: 0 // TODO: Implement error rate tracking
      };
    } catch (error) {
      console.error('Error checking system health:', error);
      return {
        databaseStatus: 'error',
        apiResponseTime: 0,
        activeConnections: 0,
        errorRate: 100
      };
    }
  }
}
