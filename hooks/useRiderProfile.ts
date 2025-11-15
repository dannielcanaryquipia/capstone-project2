import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRefreshCoordinator } from '../contexts/RefreshCoordinatorContext';
import { authService, UpdateProfileData } from '../services/auth.service';
import { AvailableOrder, RiderAssignment, RiderService, RiderStats } from '../services/rider.service';
import { useAuth } from './useAuth';

interface RiderProfile {
  id: string;
  user_id: string;
  vehicle_number?: string;
  is_available: boolean;
  current_location?: any;
  created_at: string;
  updated_at: string;
  profile: {
    full_name?: string;
    phone_number?: string;
    email?: string;
    avatar_url?: string;
    role?: string;
  };
}

export const useRiderProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<RiderProfile | null>(null);
  const [stats, setStats] = useState<RiderStats>({
    totalDeliveries: 0,
    completedDeliveries: 0,
    pendingDeliveries: 0,
    availableOrders: 0,
    totalEarnings: 0,
    todayEarnings: 0,
    averageDeliveryTime: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get or create rider profile using the service
      let rider = await RiderService.getRiderProfile(user.id);
      
      if (!rider) {
        rider = await RiderService.createRiderProfile(user.id);
      }

      setProfile(rider);

      // Load enhanced stats
      if (rider?.id) {
        await loadStats(rider.id);
      }
    } catch (err: any) {
      console.error('Error loading rider profile:', err);
      setError(err.message || 'Failed to load rider profile');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const loadStats = useCallback(async (riderId?: string) => {
    const idToUse = riderId || profile?.id;
    if (!idToUse) return;

    try {
      console.log('Loading stats for rider ID:', idToUse);
      const riderStats = await RiderService.getRiderStats(idToUse);
      console.log('Stats loaded:', riderStats);
      setStats(riderStats);
    } catch (err: any) {
      console.error('Error loading stats:', err);
    }
  }, [profile?.id]);

  const toggleAvailability = useCallback(async () => {
    if (!profile) return;

    try {
      await RiderService.updateRiderAvailability(profile.id, !profile.is_available);
      setProfile((prev: any) => prev ? { ...prev, is_available: !prev.is_available } : null);
    } catch (err: any) {
      console.error('Error updating availability:', err);
      setError(err.message || 'Failed to update availability');
    }
  }, [profile]);

  const updateProfile = useCallback(async (updates: Partial<{ full_name?: string; phone_number?: string | null; avatar_url?: string }>) => {
    if (!user?.id || !profile) return;

    try {
      setIsLoading(true);
      setError(null);

      // Convert to UpdateProfileData format
      const updateData: UpdateProfileData = {};
      if (updates.full_name !== undefined) updateData.fullName = updates.full_name;
      if (updates.phone_number !== undefined) updateData.phoneNumber = updates.phone_number;
      if (updates.avatar_url !== undefined) updateData.avatarUrl = updates.avatar_url;

      // Update profile in database
      const updatedProfile = await authService.updateProfile(user.id, updateData);
      
      // Update local state
      setProfile((prev: any) => prev ? {
        ...prev,
        profile: {
          ...prev.profile,
          ...updates
        }
      } : null);

      return updatedProfile;
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, profile]);

  const refresh = useCallback(() => {
    fetchProfile();
  }, [fetchProfile]);

  const refreshStats = useCallback(() => {
    if (profile?.id) {
      loadStats(profile.id);
    }
  }, [profile?.id, loadStats]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    stats,
    isLoading,
    error,
    toggleAvailability,
    updateProfile,
    refresh,
    refreshStats,
  };
};

// Hook for managing rider orders
export const useRiderOrders = () => {
  const { user } = useAuth();
  const [assignedOrders, setAssignedOrders] = useState<RiderAssignment[]>([]);
  const [availableOrders, setAvailableOrders] = useState<AvailableOrder[]>([]);
  const [recentOrders, setRecentOrders] = useState<RiderAssignment[]>([]);
  const [deliveredOrders, setDeliveredOrders] = useState<RiderAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { registerRefresh, refresh: requestRefresh } = useRefreshCoordinator();

  const scheduleNotificationRefresh = useCallback(() => {
    requestRefresh(['notifications']);
    setTimeout(() => requestRefresh(['notifications']), 800);
    setTimeout(() => requestRefresh(['notifications']), 2000);
  }, [requestRefresh]);

  const fetchOrders = useCallback(async (options?: { background?: boolean }) => {
    if (!user?.id) {
      if (!options?.background) {
        setIsLoading(false);
      }
      return;
    }

    const background = options?.background ?? false;

    try {
      if (!background) {
        setIsLoading(true);
      }
      setError(null);

      // Get rider ID
      const { data: rider, error: riderError } = await supabase
        .from('riders')
        .select('id')
        .eq('user_id', user.id)
        .single();

      console.log('useRiderOrders: Rider lookup result:', { rider, riderError });

      if (!rider || !(rider as any).id) {
        console.log('useRiderOrders: No rider profile found, creating one...');
        // Try to create rider profile if it doesn't exist
        try {
          const newRider = await RiderService.createRiderProfile(user.id);
          console.log('useRiderOrders: Created rider profile:', newRider);
          if (!newRider || !newRider.id) {
            throw new Error('Failed to create rider profile');
          }
          (rider as any) = newRider;
        } catch (createError) {
          console.error('useRiderOrders: Error creating rider profile:', createError);
          throw new Error('Rider profile not found and could not be created');
        }
      }

      // Fetch all order types in parallel
      console.log('useRiderOrders: Fetching orders for rider:', (rider as any).id);
      
      const [
        assigned,
        available,
        recent,
        delivered
      ] = await Promise.all([
        RiderService.getRiderOrders((rider as any).id),
        RiderService.getAvailableOrders(),
        RiderService.getRecentOrders((rider as any).id),
        RiderService.getDeliveredOrders((rider as any).id)
      ]);

      // CRITICAL: Filter out any pickup orders that might have slipped through
      // Only delivery orders should be shown to riders
      const filteredAvailable = (available || []).filter((order: any) => {
        const isDelivery = order.fulfillment_type === 'delivery';
        if (!isDelivery) {
          console.warn('🚫 useRiderOrders: Filtering out pickup order from available orders:', order.id, order.fulfillment_type);
        }
        return isDelivery;
      });

      const filteredAssigned = (assigned || []).filter((assignment: any) => {
        const isDelivery = assignment.order?.fulfillment_type === 'delivery';
        if (!isDelivery) {
          console.warn('🚫 useRiderOrders: Filtering out pickup order from assigned orders:', assignment.order_id, assignment.order?.fulfillment_type);
        }
        return isDelivery;
      });

      const filteredRecent = (recent || []).filter((assignment: any) => {
        const isDelivery = assignment.order?.fulfillment_type === 'delivery';
        if (!isDelivery) {
          console.warn('🚫 useRiderOrders: Filtering out pickup order from recent orders:', assignment.order_id, assignment.order?.fulfillment_type);
        }
        return isDelivery;
      });

      const filteredDelivered = (delivered || []).filter((assignment: any) => {
        const isDelivery = assignment.order?.fulfillment_type === 'delivery';
        if (!isDelivery) {
          console.warn('🚫 useRiderOrders: Filtering out pickup order from delivered orders:', assignment.order_id, assignment.order?.fulfillment_type);
        }
        return isDelivery;
      });

      console.log('useRiderOrders: Fetched data (after filtering):', {
        assigned: filteredAssigned.length,
        available: filteredAvailable.length,
        recent: filteredRecent.length,
        delivered: filteredDelivered.length
      });

      // Debug: Log some sample data
      if (filteredAssigned.length > 0) {
        console.log('useRiderOrders: Sample assigned order:', filteredAssigned[0]);
      }
      if (filteredAvailable.length > 0) {
        console.log('useRiderOrders: Sample available order:', filteredAvailable[0]);
      }

      // Set filtered orders (only delivery orders)
      setAssignedOrders(filteredAssigned);
      setAvailableOrders(filteredAvailable);
      setRecentOrders(filteredRecent);
      setDeliveredOrders(filteredDelivered);

      scheduleNotificationRefresh();
    } catch (err: any) {
      console.error('Error fetching rider orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      if (!background) {
        setIsLoading(false);
      }
    }
  }, [user?.id, scheduleNotificationRefresh]);

  const acceptOrder = useCallback(async (orderId: string) => {
    if (!user?.id) return;

    try {
      const { data: rider } = await supabase
        .from('riders')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!rider || !(rider as any).id) throw new Error('Rider profile not found');

      await RiderService.acceptOrder(orderId, (rider as any).id);
      await fetchOrders(); // Refresh orders
    } catch (err: any) {
      console.error('Error accepting order:', err);
      throw err;
    }
  }, [user?.id, fetchOrders]);

  const markPickedUp = useCallback(async (orderId: string) => {
    if (!user?.id) return;

    try {
      const { data: rider } = await supabase
        .from('riders')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!rider || !(rider as any).id) throw new Error('Rider profile not found');

      await RiderService.markOrderPickedUp(orderId, (rider as any).id);
      await fetchOrders(); // Refresh orders
    } catch (err: any) {
      console.error('Error marking order as picked up:', err);
      throw err;
    }
  }, [user?.id, fetchOrders]);

  const verifyCODPayment = useCallback(async (orderId: string) => {
    if (!user?.id) return;

    try {
      const { data: rider } = await supabase
        .from('riders')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!rider || !(rider as any).id) throw new Error('Rider profile not found');

      await RiderService.verifyCODPayment(orderId, (rider as any).id);
      await fetchOrders(); // Refresh orders
    } catch (err: any) {
      console.error('Error verifying COD payment:', err);
      throw err;
    }
  }, [user?.id, fetchOrders]);

  const markDelivered = useCallback(async (orderId: string, proofImageUri?: string) => {
    if (!user?.id) return;

    try {
      const { data: rider } = await supabase
        .from('riders')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!rider || !(rider as any).id) throw new Error('Rider profile not found');

      const result = await RiderService.markOrderDelivered(orderId, (rider as any).id, proofImageUri);
      await fetchOrders(); // Refresh orders
      return result;
    } catch (err: any) {
      console.error('Error marking order as delivered:', err);
      throw err;
    }
  }, [user?.id, fetchOrders]);

  const refresh = useCallback(() => {
    return fetchOrders({ background: true });
  }, [fetchOrders]);

  useEffect(() => {
    fetchOrders();
    const unregister = registerRefresh('rider_orders', () => fetchOrders({ background: true }));
    return unregister;
  }, [fetchOrders, registerRefresh]);

  // Real-time subscription for order updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('rider-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'delivery_assignments',
        },
        (payload) => {
          console.log('📦 Delivery assignment change detected:', payload.eventType);
          fetchOrders({ background: true });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const oldOrder = payload.old as any;
          const newOrder = payload.new as any;
          const statusChanged = oldOrder?.status !== newOrder?.status;
          const status = newOrder?.status?.toLowerCase();
          
          // Only refresh if status changed to something relevant for riders
          if (statusChanged && (status === 'ready_for_pickup' || status === 'preparing' || status === 'out_for_delivery' || status === 'delivered')) {
            console.log('📦 Order status changed to rider-relevant status:', {
              orderId: newOrder.id,
              oldStatus: oldOrder?.status,
              newStatus: newOrder?.status
            });
            fetchOrders({ background: true });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const newOrder = payload.new as any;
          const status = newOrder?.status?.toLowerCase();
          
          // If a new order is created with ready_for_pickup or preparing status, refresh
          if (status === 'ready_for_pickup' || status === 'preparing') {
            console.log('📦 New order created with rider-relevant status:', {
              orderId: newOrder.id,
              status: newOrder?.status
            });
            fetchOrders({ background: true });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchOrders]);

  return {
    assignedOrders,
    availableOrders,
    recentOrders,
    deliveredOrders,
    isLoading,
    error,
    acceptOrder,
    markPickedUp,
    verifyCODPayment,
    markDelivered,
    refresh,
  };
};