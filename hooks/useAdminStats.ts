import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { OrderService } from '../services/order.service';
import { ProductService } from '../services/product.service';
import { OrderStats } from '../types/order.types';
import { ProductStats } from '../types/product.types';

export interface AdminStats {
  // Product stats
  total_products: number;
  available_products: number;
  unavailable_products: number;
  recommended_products: number;
  low_stock_products: number;
  total_categories: number;
  average_price: number;
  new_products_this_month: number;
  
  // Order stats
  total_orders: number;
  pending_orders: number;
  preparing_orders: number;
  out_for_delivery: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  average_order_value: number;
  completion_rate: number;
  
  // User stats
  total_users: number;
  new_users_this_month: number;
  active_users: number;
  
  // Delivery stats
  total_delivery_staff: number;
  active_delivery_staff: number;
  
  // Time-based stats
  revenue_this_month: number;
  revenue_last_month: number;
  revenue_growth: number;
  orders_this_month: number;
  orders_last_month: number;
  orders_growth: number;
  
  // Recent activity
  recent_orders: any[];
  recent_products: any[];
  recent_users: any[];
}

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch product and order stats in parallel
      const [productStats, orderStats] = await Promise.all([
        ProductService.getProductStats(),
        OrderService.getOrderStats(),
      ]);

      // Fetch additional stats
      const [
        userStats,
        deliveryStats,
        revenueStats,
        recentActivity
      ] = await Promise.all([
        fetchUserStats(),
        fetchDeliveryStats(),
        fetchRevenueStats(),
        fetchRecentActivity(),
      ]);

      const adminStats: AdminStats = {
        // Product stats
        total_products: productStats.total_products,
        available_products: productStats.available_products,
        unavailable_products: productStats.unavailable_products,
        recommended_products: productStats.recommended_products,
        low_stock_products: productStats.low_stock_products,
        total_categories: productStats.total_categories,
        average_price: productStats.average_price,
        new_products_this_month: productStats.new_products_this_month,
        
        // Order stats
        total_orders: orderStats.total_orders,
        pending_orders: orderStats.pending_orders,
        preparing_orders: orderStats.preparing_orders,
        out_for_delivery: orderStats.out_for_delivery,
        delivered_orders: orderStats.delivered_orders,
        cancelled_orders: orderStats.cancelled_orders,
        total_revenue: orderStats.total_revenue,
        average_order_value: orderStats.average_order_value,
        completion_rate: orderStats.completion_rate,
        
        // User stats
        total_users: userStats.total_users,
        new_users_this_month: userStats.new_users_this_month,
        active_users: userStats.active_users,
        
        // Delivery stats
        total_delivery_staff: deliveryStats.total_delivery_staff,
        active_delivery_staff: deliveryStats.active_delivery_staff,
        
        // Time-based stats
        revenue_this_month: revenueStats.revenue_this_month,
        revenue_last_month: revenueStats.revenue_last_month,
        revenue_growth: revenueStats.revenue_growth,
        orders_this_month: revenueStats.orders_this_month,
        orders_last_month: revenueStats.orders_last_month,
        orders_growth: revenueStats.orders_growth,
        
        // Recent activity
        recent_orders: recentActivity.recent_orders,
        recent_products: recentActivity.recent_products,
        recent_users: recentActivity.recent_users,
      };

      setStats(adminStats);
    } catch (err: any) {
      console.error('Error fetching admin stats:', err);
      setError(err.message || 'Failed to load admin statistics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Real-time subscription for stats updates
  useEffect(() => {
    const channels = [
      supabase
        .channel('admin-stats-orders')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
          },
          (payload) => {
            console.log('Order change for admin stats:', payload);
            fetchStats();
          }
        ),
      supabase
        .channel('admin-stats-products')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'products',
          },
          (payload) => {
            console.log('Product change for admin stats:', payload);
            fetchStats();
          }
        ),
      supabase
        .channel('admin-stats-users')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
          },
          (payload) => {
            console.log('User change for admin stats:', payload);
            fetchStats();
          }
        ),
    ];

    channels.forEach(channel => channel.subscribe());

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [fetchStats]);

  const refresh = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refresh,
  };
};

// Helper functions for fetching specific stats
const fetchUserStats = async () => {
  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, created_at, role');

  if (error) throw error;

  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const newUsersThisMonth = users.filter((user: any) => 
    new Date(user.created_at) >= thisMonth
  ).length;

  const activeUsers = users.filter((user: any) => 
    user.role === 'customer'
  ).length;

  return {
    total_users: users.length,
    new_users_this_month: newUsersThisMonth,
    active_users: activeUsers,
  };
};

const fetchDeliveryStats = async () => {
  const { data: deliveryStaff, error } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('role', 'delivery');

  if (error) throw error;

  return {
    total_delivery_staff: deliveryStaff.length,
    active_delivery_staff: deliveryStaff.length, // Assuming all are active for now
  };
};

const fetchRevenueStats = async () => {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const { data: thisMonthOrders, error: thisMonthError } = await supabase
    .from('orders')
    .select('total_amount, created_at')
    .gte('created_at', thisMonth.toISOString())
    .eq('status', 'delivered');

  if (thisMonthError) throw thisMonthError;

  const { data: lastMonthOrders, error: lastMonthError } = await supabase
    .from('orders')
    .select('total_amount, created_at')
    .gte('created_at', lastMonth.toISOString())
    .lte('created_at', lastMonthEnd.toISOString())
    .eq('status', 'delivered');

  if (lastMonthError) throw lastMonthError;

  const revenueThisMonth = thisMonthOrders.reduce((sum: number, order: any) => sum + order.total_amount, 0);
  const revenueLastMonth = lastMonthOrders.reduce((sum: number, order: any) => sum + order.total_amount, 0);
  const revenueGrowth = revenueLastMonth > 0 ? 
    ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100 : 0;

  const ordersThisMonth = thisMonthOrders.length;
  const ordersLastMonth = lastMonthOrders.length;
  const ordersGrowth = ordersLastMonth > 0 ? 
    ((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100 : 0;

  return {
    revenue_this_month: revenueThisMonth,
    revenue_last_month: revenueLastMonth,
    revenue_growth: revenueGrowth,
    orders_this_month: ordersThisMonth,
    orders_last_month: ordersLastMonth,
    orders_growth: ordersGrowth,
  };
};

const fetchRecentActivity = async () => {
  const [recentOrders, recentProducts, recentUsers] = await Promise.all([
    supabase
      .from('orders')
      .select(`
        id, order_number, total_amount, status, created_at,
        user:profiles(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('products')
      .select(`
        id, name, base_price, is_available, created_at,
        category:categories(name)
      `)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('profiles')
      .select('id, full_name, email, role, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  if (recentOrders.error) throw recentOrders.error;
  if (recentProducts.error) throw recentProducts.error;
  if (recentUsers.error) throw recentUsers.error;

  return {
    recent_orders: recentOrders.data || [],
    recent_products: recentProducts.data || [],
    recent_users: recentUsers.data || [],
  };
};

// Individual stat hooks for specific use cases
export const useProductStats = () => {
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ProductService.getProductStats();
      setStats(data);
    } catch (err: any) {
      console.error('Error fetching product stats:', err);
      setError(err.message || 'Failed to load product statistics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refresh: fetchStats,
  };
};

export const useOrderStats = () => {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await OrderService.getOrderStats();
      setStats(data);
    } catch (err: any) {
      console.error('Error fetching order stats:', err);
      setError(err.message || 'Failed to load order statistics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refresh: fetchStats,
  };
};
