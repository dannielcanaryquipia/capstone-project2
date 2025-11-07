import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRefreshCoordinator } from '../contexts/RefreshCoordinatorContext';
import { OrderService } from '../services/order.service';
import { Order, OrderFilters } from '../types/order.types';

export const useAdminOrders = (filters?: OrderFilters) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { registerRefresh, refresh: requestRefresh } = useRefreshCoordinator();

  const scheduleNotificationRefresh = useCallback(() => {
    requestRefresh(['notifications']);
    setTimeout(() => requestRefresh(['notifications']), 800);
    setTimeout(() => requestRefresh(['notifications']), 2000);
  }, [requestRefresh]);

  const fetchOrders = useCallback(async (options?: { background?: boolean }) => {
    const background = options?.background;
    try {
      if (!background) {
        setIsLoading(true);
      }
      setError(null);
      const data = await OrderService.getAdminOrders(filters);
      setOrders(data);
    } catch (err: any) {
      console.error('Error fetching admin orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      if (!background) {
        setIsLoading(false);
      }
    }
  }, [JSON.stringify(filters)]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders({ background: true });
    scheduleNotificationRefresh();
    setRefreshing(false);
  }, [fetchOrders, scheduleNotificationRefresh]);

  useEffect(() => {
    fetchOrders();
    const unregister = registerRefresh('admin_orders', () => fetchOrders({ background: true }));
    return unregister;
  }, [fetchOrders, registerRefresh]);

  // Real-time subscription for all order updates
  useEffect(() => {
    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('Admin order change received:', payload);
          // Refetch orders when any order changes
          fetchOrders({ background: true });
          scheduleNotificationRefresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders, scheduleNotificationRefresh]);

  return {
    orders,
    isLoading,
    error,
    refreshing,
    refresh,
  };
};
