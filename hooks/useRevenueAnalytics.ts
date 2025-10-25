import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface RevenueData {
  month: string;
  year: number;
  revenue: number;
  orderCount: number;
}

export interface RevenueAnalytics {
  monthly: RevenueData[];
  yearly: RevenueData[];
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
}

export const useRevenueAnalytics = (timePeriod: 'month' | 'year' = 'month') => {
  const [analytics, setAnalytics] = useState<RevenueAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenueAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get current date for filtering
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11
      
      // Fetch orders data
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, created_at, status')
        .eq('status', 'delivered') // Only count delivered orders
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Process monthly data
      const monthlyData: { [key: string]: { revenue: number; orderCount: number } } = {};
      const yearlyData: { [key: string]: { revenue: number; orderCount: number } } = {};

      orders?.forEach((order: any) => {
        const orderDate = new Date(order.created_at);
        const year = orderDate.getFullYear();
        const month = orderDate.getMonth() + 1;
        
        const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
        const yearKey = year.toString();
        
        // Monthly data
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { revenue: 0, orderCount: 0 };
        }
        monthlyData[monthKey].revenue += order.total_amount;
        monthlyData[monthKey].orderCount += 1;
        
        // Yearly data
        if (!yearlyData[yearKey]) {
          yearlyData[yearKey] = { revenue: 0, orderCount: 0 };
        }
        yearlyData[yearKey].revenue += order.total_amount;
        yearlyData[yearKey].orderCount += 1;
      });

      // Convert to arrays and sort
      const monthlyArray: RevenueData[] = Object.entries(monthlyData)
        .map(([key, data]) => {
          const [year, month] = key.split('-');
          return {
            month: new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long' }),
            year: parseInt(year),
            revenue: data.revenue,
            orderCount: data.orderCount,
          };
        })
        .sort((a, b) => b.year - a.year || b.month.localeCompare(a.month));

      const yearlyArray: RevenueData[] = Object.entries(yearlyData)
        .map(([year, data]) => ({
          month: 'Year',
          year: parseInt(year),
          revenue: data.revenue,
          orderCount: data.orderCount,
        }))
        .sort((a, b) => b.year - a.year);

      // Calculate totals
      const totalRevenue = orders?.reduce((sum: number, order: any) => sum + order.total_amount, 0) || 0;
      const totalOrders = orders?.length || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      setAnalytics({
        monthly: monthlyArray,
        yearly: yearlyArray,
        totalRevenue,
        totalOrders,
        averageOrderValue,
      });
    } catch (err: any) {
      console.error('Error fetching revenue analytics:', err);
      setError(err.message || 'Failed to load revenue analytics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRevenueAnalytics();
  }, [fetchRevenueAnalytics]);

  // Real-time subscription for order updates
  useEffect(() => {
    const channel = supabase
      .channel('revenue-analytics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('Order change received for revenue analytics:', payload);
          fetchRevenueAnalytics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRevenueAnalytics]);

  return {
    analytics,
    isLoading,
    error,
    refresh: fetchRevenueAnalytics,
  };
};
