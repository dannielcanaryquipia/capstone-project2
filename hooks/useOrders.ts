import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { OrderService } from '../services/order.service';
import { Order, OrderFilters, OrderStats, OrderTracking } from '../types/order.types';
import { useAuth } from './useAuth';

export const useOrders = (filters?: OrderFilters) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchOrders = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await OrderService.getUserOrders(user.id, filters);
      setOrders(data);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, JSON.stringify(filters)]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Real-time subscription for order updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('user-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Order change received:', payload);
          // Refetch orders when any order changes
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const refresh = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    isLoading,
    error,
    refresh,
  };
};

export const useOrder = (orderId: string) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await OrderService.getOrderById(orderId);
      setOrder(data);
    } catch (err: any) {
      console.error('Error fetching order:', err);
      setError(err.message || 'Failed to load order');
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Real-time subscription for specific order updates
  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          console.log('Order update received:', payload);
          setOrder(payload.new as Order);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const refresh = useCallback(() => {
    fetchOrder();
  }, [fetchOrder]);

  return {
    order,
    isLoading,
    error,
    refresh,
  };
};

export const useOrderTracking = (orderId: string) => {
  const [tracking, setTracking] = useState<OrderTracking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = useCallback(async () => {
    if (!orderId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await OrderService.getOrderTracking(orderId);
      setTracking(data);
    } catch (err: any) {
      console.error('Error fetching order tracking:', err);
      setError(err.message || 'Failed to load order tracking');
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchTracking();
  }, [fetchTracking]);

  const refresh = useCallback(() => {
    fetchTracking();
  }, [fetchTracking]);

  return {
    tracking,
    isLoading,
    error,
    refresh,
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

export const useCreateOrder = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = useCallback(async (orderData: {
    items: any[];
    delivery_address_id: string;
    payment_method: string;
    delivery_instructions?: string;
    notes?: string;
    processing_fee?: number;
  }) => {
    if (!orderData.items.length) {
      throw new Error('Order must contain at least one item');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const order = await OrderService.createOrder({
        user_id: user.id,
        ...orderData,
      });

      return order;
    } catch (err: any) {
      console.error('Error creating order:', err);
      setError(err.message || 'Failed to create order');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createOrder,
    isLoading,
    error,
  };
};

export const useCancelOrder = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelOrder = useCallback(async (orderId: string, reason: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      await OrderService.cancelOrder(orderId, reason, user.id);
    } catch (err: any) {
      console.error('Error cancelling order:', err);
      setError(err.message || 'Failed to cancel order');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    cancelOrder,
    isLoading,
    error,
  };
};

// Admin hooks
export const useAdminOrders = (filters?: OrderFilters) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await OrderService.getAdminOrders(filters);
      setOrders(data);
    } catch (err: any) {
      console.error('Error fetching admin orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Real-time subscription for all order updates
  useEffect(() => {
    const channel = supabase
      .channel('admin-orders-changes')
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
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const refresh = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    isLoading,
    error,
    refresh,
  };
};

export const useUpdateOrderStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = useCallback(async (
    orderId: string,
    status: string,
    notes?: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      await OrderService.updateOrderStatus(orderId, status as any, user.id, notes);
    } catch (err: any) {
      console.error('Error updating order status:', err);
      setError(err.message || 'Failed to update order status');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    updateStatus,
    isLoading,
    error,
  };
};
