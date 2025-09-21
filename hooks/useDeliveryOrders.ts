import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { OrderService } from '../services/order.service';
import { DeliveryOrder, Order } from '../types/order.types';

export const useAvailableOrders = () => {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailableOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await OrderService.getAvailableOrders();
      setOrders(data);
    } catch (err: any) {
      console.error('Error fetching available orders:', err);
      setError(err.message || 'Failed to load available orders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailableOrders();
  }, [fetchAvailableOrders]);

  // Real-time subscription for available orders updates
  useEffect(() => {
    const channel = supabase
      .channel('available-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: 'status=eq.ready_for_pickup',
        },
        (payload) => {
          console.log('Available order change received:', payload);
          fetchAvailableOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAvailableOrders]);

  const refresh = useCallback(() => {
    fetchAvailableOrders();
  }, [fetchAvailableOrders]);

  return {
    orders,
    isLoading,
    error,
    refresh,
  };
};

export const useMyDeliveryOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchMyOrders = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*),
          delivery_address:addresses(*),
          user:profiles(full_name, phone_number)
        `)
        .eq('assigned_delivery_id', user.id)
        .in('status', ['out_for_delivery', 'delivered'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      console.error('Error fetching my delivery orders:', err);
      setError(err.message || 'Failed to load my delivery orders');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  // Real-time subscription for my delivery orders updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('my-delivery-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `assigned_delivery_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('My delivery order change received:', payload);
          fetchMyOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchMyOrders]);

  const refresh = useCallback(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  return {
    orders,
    isLoading,
    error,
    refresh,
  };
};

export const useAssignOrder = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const assignOrder = useCallback(async (orderId: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      await OrderService.assignOrderToDelivery(orderId, user.id);
    } catch (err: any) {
      console.error('Error assigning order:', err);
      setError(err.message || 'Failed to assign order');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  return {
    assignOrder,
    isLoading,
    error,
  };
};

export const useUpdateDeliveryStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const updateStatus = useCallback(async (
    orderId: string,
    status: 'out_for_delivery' | 'delivered',
    notes?: string
  ) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      await OrderService.updateOrderStatus(orderId, status, user.id, notes);
    } catch (err: any) {
      console.error('Error updating delivery status:', err);
      setError(err.message || 'Failed to update delivery status');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  return {
    updateStatus,
    isLoading,
    error,
  };
};

export const useDeliveryEarnings = () => {
  const [earnings, setEarnings] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    total: 0,
    completedDeliveries: 0,
    averageEarningPerDelivery: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchEarnings = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(today);
      thisWeek.setDate(today.getDate() - today.getDay());
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Fetch completed deliveries
      const { data: completedOrders, error } = await supabase
        .from('orders')
        .select('total_amount, delivered_at, delivery_fee')
        .eq('assigned_delivery_id', user.id)
        .eq('status', 'delivered');

      if (error) throw error;

      // Calculate earnings
      const todayEarnings = completedOrders
        .filter((order: any) => new Date(order.delivered_at) >= today)
        .reduce((sum: number, order: any) => sum + (order.delivery_fee || 0), 0);

      const thisWeekEarnings = completedOrders
        .filter((order: any) => new Date(order.delivered_at) >= thisWeek)
        .reduce((sum: number, order: any) => sum + (order.delivery_fee || 0), 0);

      const thisMonthEarnings = completedOrders
        .filter((order: any) => new Date(order.delivered_at) >= thisMonth)
        .reduce((sum: number, order: any) => sum + (order.delivery_fee || 0), 0);

      const totalEarnings = completedOrders
        .reduce((sum: number, order: any) => sum + (order.delivery_fee || 0), 0);

      const completedDeliveries = completedOrders.length;
      const averageEarningPerDelivery = completedDeliveries > 0 ? 
        totalEarnings / completedDeliveries : 0;

      setEarnings({
        today: todayEarnings,
        thisWeek: thisWeekEarnings,
        thisMonth: thisMonthEarnings,
        total: totalEarnings,
        completedDeliveries,
        averageEarningPerDelivery,
      });
    } catch (err: any) {
      console.error('Error fetching delivery earnings:', err);
      setError(err.message || 'Failed to load delivery earnings');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  // Real-time subscription for earnings updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('delivery-earnings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `assigned_delivery_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Delivery earnings change received:', payload);
          fetchEarnings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchEarnings]);

  const refresh = useCallback(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  return {
    earnings,
    isLoading,
    error,
    refresh,
  };
};

export const useDeliveryStats = () => {
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    completedDeliveries: 0,
    pendingDeliveries: 0,
    averageDeliveryTime: 0,
    customerRating: 0,
    onTimeDeliveries: 0,
    lateDeliveries: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchStats = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch all orders assigned to this delivery person
      const { data: orders, error } = await supabase
        .from('orders')
        .select('status, created_at, delivered_at, prepared_at')
        .eq('assigned_delivery_id', user.id);

      if (error) throw error;

      const totalDeliveries = orders.length;
      const completedDeliveries = orders.filter((order: any) => order.status === 'delivered').length;
      const pendingDeliveries = orders.filter((order: any) => 
        ['out_for_delivery'].includes(order.status)
      ).length;

      // Calculate average delivery time
      const completedOrders = orders.filter((order: any) => 
        order.status === 'delivered' && order.prepared_at && order.delivered_at
      );
      
      const averageDeliveryTime = completedOrders.length > 0 ? 
        completedOrders.reduce((sum: number, order: any) => {
          const preparedAt = new Date(order.prepared_at);
          const deliveredAt = new Date(order.delivered_at);
          return sum + (deliveredAt.getTime() - preparedAt.getTime());
        }, 0) / completedOrders.length / (1000 * 60) : 0; // in minutes

      // For now, we'll use placeholder values for rating and on-time delivery
      // In a real app, these would come from a ratings/reviews table
      const customerRating = 4.5; // Placeholder
      const onTimeDeliveries = Math.floor(completedDeliveries * 0.85); // Placeholder
      const lateDeliveries = completedDeliveries - onTimeDeliveries;

      setStats({
        totalDeliveries,
        completedDeliveries,
        pendingDeliveries,
        averageDeliveryTime,
        customerRating,
        onTimeDeliveries,
        lateDeliveries,
      });
    } catch (err: any) {
      console.error('Error fetching delivery stats:', err);
      setError(err.message || 'Failed to load delivery statistics');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

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

export const useDeliveryLocation = () => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // This would use a location service like expo-location
      // For now, we'll use a placeholder
      const mockLocation = {
        latitude: 14.5995, // Manila coordinates
        longitude: 120.9842,
        accuracy: 10,
      };
      
      setLocation(mockLocation);
    } catch (err: any) {
      console.error('Error getting current location:', err);
      setError(err.message || 'Failed to get current location');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateLocation = useCallback(async (newLocation: {
    latitude: number;
    longitude: number;
    accuracy: number;
  }) => {
    setLocation(newLocation);
    
    // In a real app, you would update the delivery person's location in the database
    // and notify the system about their current position
  }, []);

  return {
    location,
    isLoading,
    error,
    getCurrentLocation,
    updateLocation,
  };
};
