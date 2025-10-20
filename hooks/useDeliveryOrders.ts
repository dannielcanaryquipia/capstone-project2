import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Order } from '../types/order.types';
import { useAuth } from './useAuth';

export const useDeliveryOrders = () => {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchOrders = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch active orders (ready_for_pickup and out_for_delivery)
      const { data: activeOrdersData, error: activeOrdersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          total_amount,
          created_at,
          actual_delivery_time,
          delivery_address,
          customer_notes,
          payment_method,
          payment_status,
          user:profiles!orders_user_id_fkey(
            full_name,
            phone_number
          )
        `)
        .in('status', ['ready_for_pickup', 'out_for_delivery'])
        .order('created_at', { ascending: false });

      if (activeOrdersError) {
        console.error('Error loading active orders:', activeOrdersError);
        setActiveOrders([]);
      } else {
        setActiveOrders(activeOrdersData || []);
      }

      // Fetch delivered orders
      const { data: deliveredOrdersData, error: deliveredOrdersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          total_amount,
          created_at,
          actual_delivery_time,
          delivery_address,
          customer_notes,
          payment_method,
          payment_status,
          proof_of_delivery_url,
          user:profiles!orders_user_id_fkey(
            full_name,
            phone_number
          )
        `)
        .eq('status', 'delivered')
        .order('actual_delivery_time', { ascending: false })
        .limit(20);

      if (deliveredOrdersError) {
        console.error('Error loading delivered orders:', deliveredOrdersError);
        setDeliveredOrders([]);
      } else {
        setDeliveredOrders(deliveredOrdersData || []);
      }
    } catch (err: any) {
      console.error('Error fetching delivery orders:', err);
      setError(err.message || 'Failed to load delivery orders');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const refresh = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Real-time subscription for order updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('delivery-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('Order change detected:', payload);
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchOrders]);

  return {
    activeOrders,
    deliveredOrders,
    isLoading,
    error,
    refresh,
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
      
      // Get delivered orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, actual_delivery_time, created_at')
        .eq('status', 'delivered')
        .order('actual_delivery_time', { ascending: false });

      if (ordersError) {
        throw ordersError;
      }

      const completedDeliveries = orders?.length || 0;
      const deliveryFee = 50;
      const total = completedDeliveries * deliveryFee;

      // Calculate time-based earnings
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(today);
      thisWeek.setDate(today.getDate() - today.getDay());
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const todayDelivered = orders?.filter((order: any) => {
        const deliveredAt = order.actual_delivery_time ? new Date(order.actual_delivery_time) : null;
        return deliveredAt && deliveredAt >= today;
      }).length || 0;

      const thisWeekDelivered = orders?.filter((order: any) => {
        const deliveredAt = order.actual_delivery_time ? new Date(order.actual_delivery_time) : null;
        return deliveredAt && deliveredAt >= thisWeek;
      }).length || 0;

      const thisMonthDelivered = orders?.filter((order: any) => {
        const deliveredAt = order.actual_delivery_time ? new Date(order.actual_delivery_time) : null;
        return deliveredAt && deliveredAt >= thisMonth;
      }).length || 0;

      setEarnings({
        today: todayDelivered * deliveryFee,
        thisWeek: thisWeekDelivered * deliveryFee,
        thisMonth: thisMonthDelivered * deliveryFee,
        total,
        completedDeliveries,
        averageEarningPerDelivery: completedDeliveries > 0 ? total / completedDeliveries : 0,
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

  return {
    earnings,
    isLoading,
    error,
    refresh: fetchEarnings,
  };
};