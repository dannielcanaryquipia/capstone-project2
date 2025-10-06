import { supabase } from '../lib/supabase';

export interface TopProduct {
  id: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
  averagePrice: number;
  basePrice: number;
  imageUrl: string | null;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

export interface CustomerStats {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
}

export interface OrderStatusBreakdown {
  pending: number;
  preparing: number;
  outForDelivery: number;
  delivered: number;
  cancelled: number;
}

export interface ReportData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: TopProduct[];
  orderStatusBreakdown: OrderStatusBreakdown;
  dailyRevenue: DailyRevenue[];
  customerStats: CustomerStats;
  recentOrders?: Array<{
    id: string;
    customer_name: string;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
}

export class ReportsService {
  // Get recent orders with customer name
  static async getRecentOrders(limit: number = 5): Promise<ReportData['recentOrders']> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at,
          profiles:profiles!orders_user_id_fkey(full_name, username)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((o: any) => ({
        id: o.id,
        customer_name: o.profiles?.full_name || o.profiles?.username || 'Customer',
        total_amount: o.total_amount || 0,
        status: (o.status || '').toString().toLowerCase().replace(/\s+/g, '_'),
        created_at: o.created_at,
      }));
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      return [];
    }
  }
  // Get top products by revenue, computed from order_items joined with orders (delivered by default)
  static async getTopProducts(limit: number = 5, includeStatuses: string[] = ['Delivered']): Promise<TopProduct[]> {
    try {
      // Join orders to ensure we only count items from qualifying orders
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          quantity,
          unit_price,
          products!inner(name, id, base_price, image_url),
          orders!inner(status)
        `)
        .in('orders.status', includeStatuses);

      if (error) throw error;

      // Group by product and calculate totals
      const productMap = new Map<string, { 
        quantity: number; 
        revenue: number; 
        product: { id: string; name: string; base_price: number; image_url: string | null }
      }>();
      
      data?.forEach((item: any) => {
        const product = item.products;
        if (!product) return; // Skip if no product data
        
        const productId = product.id;
        const productName = product.name || 'Unknown Product';
        const quantity = item.quantity || 0;
        const revenue = (item.unit_price || 0) * quantity;
        
        if (productMap.has(productId)) {
          const existing = productMap.get(productId)!;
          existing.quantity += quantity;
          existing.revenue += revenue;
        } else {
          productMap.set(productId, { 
            quantity, 
            revenue, 
            product: {
              id: product.id,
              name: product.name,
              base_price: product.base_price,
              image_url: product.image_url
            }
          });
        }
      });

      // Convert to array and sort by revenue
      const topProducts = Array.from(productMap.entries())
        .map(([productId, data]) => ({
          id: data.product.id,
          name: data.product.name,
          totalQuantity: data.quantity,
          totalRevenue: data.revenue,
          averagePrice: data.revenue / data.quantity,
          basePrice: data.product.base_price,
          imageUrl: data.product.image_url
        }))
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, limit);

      return topProducts;
    } catch (error) {
      console.error('Error fetching top products:', error);
      return [];
    }
  }

  // Get daily revenue for the last 7 days
  static async getDailyRevenue(days: number = 7): Promise<DailyRevenue[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const { data, error } = await supabase
        .from('orders')
        .select('created_at, total_amount')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date
      const dailyMap = new Map<string, { revenue: number; orders: number }>();
      
      data?.forEach((order: any) => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        const amount = order.total_amount || 0;
        
        if (dailyMap.has(date)) {
          const existing = dailyMap.get(date)!;
          existing.revenue += amount;
          existing.orders += 1;
        } else {
          dailyMap.set(date, { revenue: amount, orders: 1 });
        }
      });

      // Fill in missing dates with zero values
      const dailyRevenue: DailyRevenue[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayData = dailyMap.get(dateStr) || { revenue: 0, orders: 0 };
        dailyRevenue.push({
          date: dateStr,
          revenue: dayData.revenue,
          orders: dayData.orders
        });
      }

      return dailyRevenue;
    } catch (error) {
      console.error('Error fetching daily revenue:', error);
      return [];
    }
  }

  // Get customer statistics
  static async getCustomerStats(): Promise<CustomerStats> {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('created_at, role')
        .eq('role', 'customer');

      if (profilesError) throw profilesError;

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const totalCustomers = profiles?.length || 0;
      const newCustomers = profiles?.filter((p: any) => 
        new Date(p.created_at) >= thisMonth
      ).length || 0;
      const returningCustomers = totalCustomers - newCustomers;

      return {
        totalCustomers,
        newCustomers,
        returningCustomers
      };
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      return {
        totalCustomers: 0,
        newCustomers: 0,
        returningCustomers: 0
      };
    }
  }

  // Get order status breakdown
  static async getOrderStatusBreakdown(): Promise<OrderStatusBreakdown> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('status');

      if (error) throw error;

      const breakdown = {
        pending: 0,
        preparing: 0,
        outForDelivery: 0,
        delivered: 0,
        cancelled: 0
      };

      data?.forEach((order: any) => {
        const status = order.status?.toLowerCase();
        switch (status) {
          case 'pending':
            breakdown.pending++;
            break;
          case 'preparing':
            breakdown.preparing++;
            break;
          case 'out for delivery':
          case 'out_for_delivery':
            breakdown.outForDelivery++;
            break;
          case 'delivered':
            breakdown.delivered++;
            break;
          case 'cancelled':
            breakdown.cancelled++;
            break;
        }
      });

      return breakdown;
    } catch (error) {
      console.error('Error fetching order status breakdown:', error);
      return {
        pending: 0,
        preparing: 0,
        outForDelivery: 0,
        delivered: 0,
        cancelled: 0
      };
    }
  }

  // Get comprehensive report data
  static async getReportData(): Promise<ReportData> {
    try {
      const [
        topProducts,
        dailyRevenue,
        customerStats,
        orderStatusBreakdown,
        recentOrders
      ] = await Promise.all([
        this.getTopProducts(5),
        this.getDailyRevenue(7),
        this.getCustomerStats(),
        this.getOrderStatusBreakdown(),
        this.getRecentOrders(5)
      ]);

      // Calculate totals
      const totalRevenue = dailyRevenue.reduce((sum, day) => sum + day.revenue, 0);
      const totalOrders = dailyRevenue.reduce((sum, day) => sum + day.orders, 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      return {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        topProducts,
        orderStatusBreakdown,
        dailyRevenue,
        customerStats,
        recentOrders
      };
    } catch (error) {
      console.error('Error fetching report data:', error);
      throw error;
    }
  }
}
