import { supabase } from '../lib/supabase';
import { Order } from '../types/order.types';

export interface RiderAssignment {
  id: string;
  order_id: string;
  rider_id: string | null;
  assigned_at: string;
  picked_up_at: string | null;
  delivered_at: string | null;
  status: 'Assigned' | 'Picked Up' | 'Delivered';
  notes: string | null;
  order: Order;
}

export interface RiderStats {
  totalDeliveries: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  availableOrders: number;
  totalEarnings: number;
  todayEarnings: number;
  averageDeliveryTime: number;
}

export interface AvailableOrder {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  estimated_delivery_time: string | null;
  payment_method: string;
  payment_status: string;
  payment_verified: boolean;
  delivery_address: {
    full_address: string;
    label?: string;
  };
  customer: {
    full_name: string;
    phone_number: string;
  };
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
}

export class RiderService {
  // Get rider profile with enhanced data
  static async getRiderProfile(userId: string) {
    try {
      const { data: rider, error } = await supabase
        .from('riders')
        .select(`
          *,
          profile:profiles!riders_user_id_fkey(
            full_name,
            phone_number,
            avatar_url,
            role
          )
        `)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return rider;
    } catch (error) {
      console.error('Error fetching rider profile:', error);
      throw error;
    }
  }

  // Create rider profile if it doesn't exist
  static async createRiderProfile(userId: string, vehicleNumber?: string) {
    try {
      const { data: rider, error } = await supabase
        .from('riders')
        .insert({
          user_id: userId,
          vehicle_number: vehicleNumber,
          is_available: true,
          current_location: null
        })
        .select(`
          *,
          profile:profiles!riders_user_id_fkey(
            full_name,
            phone_number,
            avatar_url,
            role
          )
        `)
        .single();

      if (error) throw error;
      return rider;
    } catch (error) {
      console.error('Error creating rider profile:', error);
      throw error;
    }
  }

  // Update rider availability
  static async updateRiderAvailability(riderId: string, isAvailable: boolean, location?: any) {
    try {
      const updateData: any = { is_available: isAvailable };
      if (location) {
        updateData.current_location = location;
      }

      const { error } = await supabase
        .from('riders')
        .update(updateData)
        .eq('id', riderId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating rider availability:', error);
      throw error;
    }
  }

  // Get available orders for assignment
  static async getAvailableOrders(): Promise<AvailableOrder[]> {
    try {
      console.log('RiderService.getAvailableOrders: Starting query');
      
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          total_amount,
          created_at,
          estimated_delivery_time,
          payment_method,
          payment_status,
          payment_verified,
          delivery_address:addresses(full_address, label),
          customer:profiles!orders_user_id_fkey(full_name, phone_number),
          items:order_items(
            product_name:products(name),
            quantity,
            unit_price
          )
        `)
        .in('status', ['ready_for_pickup', 'preparing'])
        .or('payment_verified.eq.true,and(payment_method.eq.cod,payment_status.eq.pending)')
        .order('created_at', { ascending: true });

      console.log('RiderService.getAvailableOrders: Query result:', { orders, error });

      if (error) throw error;

      // Check which orders are already assigned
      const orderIds = orders?.map((o: any) => o.id) || [];
      const { data: assignments } = await supabase
        .from('delivery_assignments')
        .select('order_id')
        .in('order_id', orderIds)
        .not('rider_id', 'is', null);

      const assignedOrderIds = new Set(assignments?.map((a: any) => a.order_id) || []);
      
      return (orders || []).filter((order: any) => !assignedOrderIds.has(order.id));
    } catch (error) {
      console.error('Error fetching available orders:', error);
      throw error;
    }
  }

  // Get rider's assigned orders (all orders assigned to this rider)
  // Includes orders with status ready_for_pickup, out_for_delivery, and delivered
  static async getRiderOrders(riderId: string): Promise<RiderAssignment[]> {
    try {
      console.log('RiderService.getRiderOrders: Fetching orders for rider:', riderId);
      
      const { data: assignments, error } = await supabase
        .from('delivery_assignments')
        .select(`
          *,
          order:orders(
            *,
            delivery_address:addresses(*),
            customer:profiles!orders_user_id_fkey(full_name, phone_number),
            items:order_items(
              *,
              product:products(name, image_url)
            )
          )
        `)
        .eq('rider_id', riderId)
        .order('assigned_at', { ascending: false });

      console.log('RiderService.getRiderOrders: Query result:', { assignments, error });

      if (error) throw error;
      
      // Return all assigned orders, which includes ready_for_pickup, out_for_delivery, delivered, etc.
      // No filtering needed - all assignments are included regardless of order status
      return assignments || [];
    } catch (error) {
      console.error('Error fetching rider orders:', error);
      throw error;
    }
  }

  // Get rider's active orders (assigned but not delivered yet)
  static async getRiderActiveOrders(riderId: string): Promise<RiderAssignment[]> {
    try {
      console.log('RiderService.getRiderActiveOrders: Fetching active orders for rider:', riderId);
      
      const { data: assignments, error } = await supabase
        .from('delivery_assignments')
        .select(`
          *,
          order:orders(
            *,
            delivery_address:addresses(*),
            customer:profiles!orders_user_id_fkey(full_name, phone_number),
            items:order_items(
              *,
              product:products(name, image_url)
            )
          )
        `)
        .eq('rider_id', riderId)
        .is('delivered_at', null)
        .order('assigned_at', { ascending: false });

      console.log('RiderService.getRiderActiveOrders: Query result:', { assignments, error });

      if (error) throw error;
      return assignments || [];
    } catch (error) {
      console.error('Error fetching rider active orders:', error);
      throw error;
    }
  }

  // Get recent orders (last 7 days)
  // Includes orders with status ready_for_pickup, out_for_delivery, and delivered
  static async getRecentOrders(riderId: string): Promise<RiderAssignment[]> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Get all assignments for this rider, including those without assigned_at
      // Explicitly include orders with ready_for_pickup status
      const { data: assignments, error } = await supabase
        .from('delivery_assignments')
        .select(`
          *,
          order:orders(
            *,
            delivery_address:addresses(*),
            customer:profiles!orders_user_id_fkey(full_name, phone_number),
            items:order_items(
              *,
              product:products(name, image_url)
            )
          )
        `)
        .eq('rider_id', riderId)
        .order('assigned_at', { ascending: false, nullsFirst: false });

      if (error) throw error;

      // Filter by date: include orders with assigned_at >= 7 days ago, 
      // OR orders without assigned_at but with picked_up_at or delivered_at in last 7 days
      // Explicitly include ready_for_pickup orders
      const filtered = (assignments || []).filter((assignment: any) => {
        const orderStatus = assignment.order?.status?.toLowerCase();
        
        // Always include ready_for_pickup orders if they're assigned to this rider
        if (orderStatus === 'ready_for_pickup') {
          // Check if it's within the date range
          if (assignment.assigned_at) {
            return new Date(assignment.assigned_at) >= sevenDaysAgo;
          }
          if (assignment.order?.created_at) {
            return new Date(assignment.order.created_at) >= sevenDaysAgo;
          }
          return true; // Include recent ready_for_pickup orders even without timestamps
        }
        
        // Standard date filtering for other orders
        if (assignment.assigned_at) {
          return new Date(assignment.assigned_at) >= sevenDaysAgo;
        }
        // If no assigned_at, check other timestamps
        if (assignment.picked_up_at) {
          return new Date(assignment.picked_up_at) >= sevenDaysAgo;
        }
        if (assignment.delivered_at) {
          return new Date(assignment.delivered_at) >= sevenDaysAgo;
        }
        // Include if order was created in last 7 days
        if (assignment.order?.created_at) {
          return new Date(assignment.order.created_at) >= sevenDaysAgo;
        }
        return false;
      });

      // Sort by most recent activity, prioritizing ready_for_pickup orders
      return filtered.sort((a: any, b: any) => {
        const aStatus = a.order?.status?.toLowerCase();
        const bStatus = b.order?.status?.toLowerCase();
        
        // Prioritize ready_for_pickup orders
        if (aStatus === 'ready_for_pickup' && bStatus !== 'ready_for_pickup') return -1;
        if (bStatus === 'ready_for_pickup' && aStatus !== 'ready_for_pickup') return 1;
        
        const aDate = a.delivered_at || a.picked_up_at || a.assigned_at || a.order?.created_at || '';
        const bDate = b.delivered_at || b.picked_up_at || b.assigned_at || b.order?.created_at || '';
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      });
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      throw error;
    }
  }

  // Get delivered orders
  static async getDeliveredOrders(riderId: string): Promise<RiderAssignment[]> {
    try {
      console.log('RiderService.getDeliveredOrders: Fetching delivered orders for rider:', riderId);
      
      const { data: assignments, error } = await supabase
        .from('delivery_assignments')
        .select(`
          *,
          order:orders(
            *,
            delivery_address:addresses(*),
            customer:profiles!orders_user_id_fkey(full_name, phone_number),
            items:order_items(
              *,
              product:products(name, image_url)
            )
          )
        `)
        .eq('rider_id', riderId)
        .not('delivered_at', 'is', null)
        .order('delivered_at', { ascending: false });

      console.log('RiderService.getDeliveredOrders: Query result:', { assignments, error });

      if (error) throw error;
      return assignments || [];
    } catch (error) {
      console.error('Error fetching delivered orders:', error);
      throw error;
    }
  }

  // Accept order assignment
  static async acceptOrder(orderId: string, riderId: string): Promise<void> {
    try {
      // Check if order is still available
      const { data: existingAssignment, error: checkError } = await supabase
        .from('delivery_assignments')
        .select('id, rider_id')
        .eq('order_id', orderId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingAssignment && existingAssignment.rider_id) {
        throw new Error('This order has already been assigned to another rider');
      }

      const now = new Date().toISOString();

      // Create or update assignment
      if (existingAssignment) {
        // Update existing assignment - ensure assigned_at is set
        const { error: updateError } = await supabase
          .from('delivery_assignments')
          .update({ 
            rider_id: riderId,
            assigned_at: existingAssignment.assigned_at || now,
            status: 'Assigned'
          })
          .eq('id', existingAssignment.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('delivery_assignments')
          .insert({
            order_id: orderId,
            rider_id: riderId,
            status: 'Assigned',
            assigned_at: now
          });

        if (insertError) throw insertError;
      }

      // Keep order status as ready_for_pickup until rider picks it up
      // The order will be updated to out_for_delivery when rider marks it as picked up
      console.log('Order accepted by rider, keeping status as ready_for_pickup');

      // Send notification to customer
      try {
        const { data: order } = await supabase
          .from('orders')
          .select('user_id, order_number')
          .eq('id', orderId)
          .single();

        if (order?.user_id) {
          const { notificationService } = await import('./api');
          await notificationService.sendNotification({
            userId: order.user_id,
            title: 'Order accepted by rider!',
            message: `Order ${order.order_number || orderId.slice(-8)} has been accepted and will be picked up soon.`,
            type: 'delivery',
            relatedId: orderId,
          });
        }
      } catch (notificationError) {
        console.warn('Failed to send notification:', notificationError);
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      throw error;
    }
  }

  // Mark order as picked up
  static async markOrderPickedUp(orderId: string, riderId: string): Promise<void> {
    try {
      // Update delivery assignment
      const { error: assignmentError } = await supabase
        .from('delivery_assignments')
        .update({ 
          picked_up_at: new Date().toISOString(),
          status: 'Picked Up'
        })
        .eq('order_id', orderId)
        .eq('rider_id', riderId);

      if (assignmentError) throw assignmentError;

      // Update order status to out_for_delivery
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'out_for_delivery' })
        .eq('id', orderId);

      if (orderError) throw orderError;

      console.log('Order marked as picked up and status updated to out_for_delivery');
    } catch (error) {
      console.error('Error marking order as picked up:', error);
      throw error;
    }
  }

  // Verify COD payment
  static async verifyCODPayment(orderId: string, riderId: string): Promise<void> {
    try {
      // Check if this is a COD order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('payment_method, payment_verified, status')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      if (order.payment_method?.toLowerCase() !== 'cod') {
        throw new Error('This order is not a COD payment');
      }

      if (order.payment_verified) {
        throw new Error('Payment has already been verified');
      }

      // Ensure delivery assignment exists - this is critical for COD orders
      // Check if assignment exists
      const { data: existingAssignment, error: checkError } = await supabase
        .from('delivery_assignments')
        .select('id, rider_id, assigned_at')
        .eq('order_id', orderId)
        .single();

      const now = new Date().toISOString();

      // Create or update assignment if it doesn't exist or isn't assigned to this rider
      if (checkError && checkError.code === 'PGRST116') {
        // No assignment exists, create one
        console.log('Creating delivery assignment for COD order:', orderId);
        const { error: createError } = await supabase
          .from('delivery_assignments')
          .insert({
            order_id: orderId,
            rider_id: riderId,
            status: 'Picked Up',
            assigned_at: now,
            picked_up_at: now
          });

        if (createError) {
          console.error('Error creating delivery assignment:', createError);
          throw new Error('Failed to create delivery assignment');
        }
      } else if (existingAssignment) {
        // Assignment exists but might not be assigned to this rider
        if (!existingAssignment.rider_id || existingAssignment.rider_id !== riderId) {
          console.log('Updating delivery assignment for rider:', riderId);
          const { error: updateAssignError } = await supabase
            .from('delivery_assignments')
            .update({
              rider_id: riderId,
              status: 'Picked Up',
              assigned_at: existingAssignment.assigned_at || now,
              picked_up_at: existingAssignment.picked_up_at || now
            })
            .eq('id', existingAssignment.id);

          if (updateAssignError) {
            console.error('Error updating delivery assignment:', updateAssignError);
            throw new Error('Failed to update delivery assignment');
          }
        } else if (!existingAssignment.assigned_at) {
          // Assignment exists but missing assigned_at timestamp
          console.log('Fixing missing assigned_at timestamp for assignment:', existingAssignment.id);
          const { error: fixError } = await supabase
            .from('delivery_assignments')
            .update({
              assigned_at: now,
              picked_up_at: existingAssignment.picked_up_at || now
            })
            .eq('id', existingAssignment.id);

          if (fixError) {
            console.warn('Failed to fix assigned_at timestamp:', fixError);
          }
        }
      }

      // Update payment status
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'verified',
          payment_verified: true,
          payment_verified_at: now,
          payment_verified_by: riderId
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Send notification to customer
      try {
        const { data: orderData } = await supabase
          .from('orders')
          .select('user_id, order_number')
          .eq('id', orderId)
          .single();

        if (orderData?.user_id) {
          const { notificationService } = await import('./api');
          await notificationService.sendNotification({
            userId: orderData.user_id,
            title: 'Payment received',
            message: `Your COD payment for order ${orderData.order_number || orderId.slice(-8)} has been received.`,
            type: 'payment',
            relatedId: orderId,
          });
        }
      } catch (notificationError) {
        console.warn('Failed to send payment notification:', notificationError);
      }
    } catch (error) {
      console.error('Error verifying COD payment:', error);
      throw error;
    }
  }

  // Mark order as delivered with proof
  static async markOrderDelivered(
    orderId: string, 
    riderId: string, 
    proofImageUri?: string
  ): Promise<{ success: boolean; proofUploaded: boolean; message: string }> {
    try {
      const now = new Date().toISOString();
      
      // Upload proof image if provided
      let proofUrl: string | undefined;
      let proofUploaded = false;

      if (proofImageUri) {
        try {
          const { ImageUploadService } = await import('./image-upload.service');
          const uploadResult = await ImageUploadService.uploadDeliveryProof(orderId, proofImageUri, riderId);
          proofUrl = uploadResult.url;
          proofUploaded = true;
        } catch (uploadError) {
          console.error('Error uploading delivery proof:', uploadError);
          // Continue without proof rather than failing
        }
      }

      // Check if delivery assignment exists
      const { data: existingAssignment, error: checkError } = await supabase
        .from('delivery_assignments')
        .select('id, rider_id, assigned_at, picked_up_at')
        .eq('order_id', orderId)
        .single();

      // If assignment doesn't exist, create it (this handles edge cases)
      if (checkError && checkError.code === 'PGRST116') {
        console.log('Creating delivery assignment for order:', orderId);
        const { error: createError } = await supabase
          .from('delivery_assignments')
          .insert({
            order_id: orderId,
            rider_id: riderId,
            status: 'Delivered',
            assigned_at: now,
            picked_up_at: now,
            delivered_at: now
          });

        if (createError) {
          console.error('Error creating delivery assignment:', createError);
          // Continue anyway - we'll update the order status
        }
      } else if (existingAssignment) {
        // Update existing assignment
        // If not assigned to this rider, update it
        if (!existingAssignment.rider_id || existingAssignment.rider_id !== riderId) {
          console.log('Updating delivery assignment rider:', riderId);
          const { error: updateRiderError } = await supabase
            .from('delivery_assignments')
            .update({
              rider_id: riderId,
              assigned_at: existingAssignment.assigned_at || now,
              picked_up_at: existingAssignment.picked_up_at || now,
              delivered_at: now,
              status: 'Delivered'
            })
            .eq('id', existingAssignment.id);

          if (updateRiderError) {
            console.error('Error updating delivery assignment rider:', updateRiderError);
          }
        } else {
          // Update assignment with delivered status
          const { error: assignmentError } = await supabase
            .from('delivery_assignments')
            .update({
              delivered_at: now,
              status: 'Delivered',
              // Ensure assigned_at and picked_up_at are set if missing
              assigned_at: existingAssignment.assigned_at || now,
              picked_up_at: existingAssignment.picked_up_at || now
            })
            .eq('order_id', orderId)
            .eq('rider_id', riderId);

          if (assignmentError) {
            console.error('Error updating delivery assignment:', assignmentError);
            // Continue anyway - we'll update the order status
          }
        }
      }

      // Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'delivered',
          actual_delivery_time: now,
          proof_of_delivery_url: proofUrl,
          updated_at: now
        })
        .eq('id', orderId);

      if (orderError) throw orderError;

      // Send notification to customer
      try {
        const { data: orderData } = await supabase
          .from('orders')
          .select('user_id, order_number')
          .eq('id', orderId)
          .single();

        if (orderData?.user_id) {
          const { notificationService } = await import('./api');
          await notificationService.sendNotification({
            userId: orderData.user_id,
            title: 'Order delivered!',
            message: `Your order ${orderData.order_number || orderId.slice(-8)} has been delivered. Thank you!`,
            type: 'delivery',
            relatedId: orderId,
          });
        }
      } catch (notificationError) {
        console.warn('Failed to send delivery notification:', notificationError);
      }

      return {
        success: true,
        proofUploaded,
        message: proofUploaded 
          ? 'Order marked as delivered with proof photo!'
          : 'Order marked as delivered!'
      };
    } catch (error) {
      console.error('Error marking order as delivered:', error);
      return {
        success: false,
        proofUploaded: false,
        message: error instanceof Error ? error.message : 'Failed to mark order as delivered'
      };
    }
  }

  // Get rider statistics
  static async getRiderStats(riderId: string): Promise<RiderStats> {
    try {
      console.log('getRiderStats: Fetching stats for rider:', riderId);
      
      // Get all assignments for this rider
      const { data: assignments, error } = await supabase
        .from('delivery_assignments')
        .select(`
          *,
          order:orders(status, total_amount, created_at, actual_delivery_time)
        `)
        .eq('rider_id', riderId);

      if (error) throw error;

      console.log('getRiderStats: Assignments found:', assignments?.length || 0);

      const orders = assignments?.map((a: any) => a.order).filter(Boolean) || [];
      const deliveredOrders = assignments?.filter((a: any) => a.delivered_at).length || 0;
      const pendingOrders = assignments?.filter((a: any) => !a.delivered_at).length || 0;

      // Calculate earnings (₱50 per delivery)
      const deliveryFee = 50;
      const totalEarnings = deliveredOrders * deliveryFee;

      // Calculate today's earnings
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayDelivered = assignments?.filter((a: any) => {
        const deliveredAt = a.delivered_at ? new Date(a.delivered_at) : null;
        return deliveredAt && deliveredAt >= today;
      }).length || 0;
      const todayEarnings = todayDelivered * deliveryFee;

      // Calculate average delivery time
      const completedDeliveries = assignments?.filter((a: any) => a.picked_up_at && a.delivered_at) || [];
      const totalDeliveryTime = completedDeliveries.reduce((total: number, delivery: any) => {
        const pickedUp = new Date(delivery.picked_up_at!);
        const delivered = new Date(delivery.delivered_at!);
        return total + (delivered.getTime() - pickedUp.getTime());
      }, 0);
      const averageDeliveryTime = completedDeliveries.length > 0 
        ? totalDeliveryTime / completedDeliveries.length / (1000 * 60) // in minutes
        : 0;

      // Get available orders count (same logic as getAvailableOrders)
      const { data: availableOrders } = await supabase
        .from('orders')
        .select('id')
        .in('status', ['ready_for_pickup', 'preparing'])
        .or('payment_verified.eq.true,and(payment_method.eq.cod,payment_status.eq.pending)');

      const assignedOrderIds = new Set(assignments?.map((a: any) => a.order_id) || []);
      const availableCount = (availableOrders || []).filter((o: any) => !assignedOrderIds.has(o.id)).length;

      const stats = {
        totalDeliveries: orders.length,
        completedDeliveries: deliveredOrders,
        pendingDeliveries: pendingOrders,
        availableOrders: availableCount,
        totalEarnings,
        todayEarnings,
        averageDeliveryTime
      };

      console.log('getRiderStats: Calculated stats:', stats);

      return stats;
    } catch (error) {
      console.error('Error fetching rider stats:', error);
      throw error;
    }
  }

  // Get rider earnings data
  static async getRiderEarnings(riderId: string): Promise<{
    totalEarnings: number;
    thisWeek: number;
    lastWeek: number;
    thisMonth: number;
    lastMonth: number;
    todayEarnings: number;
    totalDeliveries: number;
    completedDeliveries: number;
    averageEarningPerDelivery: number;
    weeklyBreakdown: Array<{
      day: string;
      earnings: number;
      deliveries: number;
    }>;
    recentDeliveries: Array<{
      id: string;
      orderNumber: string;
      earnings: number;
      date: string;
      status: string;
    }>;
  }> {
    try {
      const deliveryFeePerOrder = 50; // ₱50 per delivery
      
      // Get all delivered assignments
      const { data: assignments, error } = await supabase
        .from('delivery_assignments')
        .select(`
          *,
          order:orders(
            id,
            order_number,
            total_amount,
            status,
            created_at
          )
        `)
        .eq('rider_id', riderId)
        .not('delivered_at', 'is', null)
        .order('delivered_at', { ascending: false });

      if (error) throw error;

      const deliveredAssignments = assignments || [];
      
      // Calculate earnings
      const earnings = deliveredAssignments.map((assignment: any) => ({
        id: assignment.id,
        orderNumber: assignment.order?.order_number || 'N/A',
        earnings: deliveryFeePerOrder,
        date: assignment.delivered_at || '',
        status: 'completed',
        orderId: assignment.order?.id || '',
      }));

      // Calculate time-based earnings
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      const thisWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      // Calculate today's earnings
      const todayEarnings = earnings
        .filter((e: any) => {
          const deliveryDate = new Date(e.date);
          return deliveryDate >= today;
        })
        .reduce((sum: number, e: any) => sum + e.earnings, 0);

      const thisWeekEarnings = earnings
        .filter((e: any) => new Date(e.date) >= thisWeekStart)
        .reduce((sum: number, e: any) => sum + e.earnings, 0);

      const lastWeekEarnings = earnings
        .filter((e: any) => {
          const date = new Date(e.date);
          return date >= lastWeekStart && date < thisWeekStart;
        })
        .reduce((sum: number, e: any) => sum + e.earnings, 0);

      const thisMonthEarnings = earnings
        .filter((e: any) => new Date(e.date) >= thisMonthStart)
        .reduce((sum: number, e: any) => sum + e.earnings, 0);

      const lastMonthEarnings = earnings
        .filter((e: any) => {
          const date = new Date(e.date);
          return date >= lastMonthStart && date < thisMonthStart;
        })
        .reduce((sum: number, e: any) => sum + e.earnings, 0);

      const totalEarnings = earnings.reduce((sum: number, e: any) => sum + e.earnings, 0);
      const totalDeliveries = deliveredAssignments.length;
      const completedDeliveries = deliveredAssignments.length;
      const averageEarningPerDelivery = totalDeliveries > 0 ? totalEarnings / totalDeliveries : 0;

      // Generate weekly breakdown
      const weeklyBreakdown = [];
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 0; i < 7; i++) {
        const dayStart = new Date(thisWeekStart.getTime() + i * 24 * 60 * 60 * 1000);
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        
        const dayEarnings = earnings
          .filter((e: any) => {
            const date = new Date(e.date);
            return date >= dayStart && date < dayEnd;
          })
          .reduce((sum: number, e: any) => sum + e.earnings, 0);

        const dayDeliveries = earnings
          .filter((e: any) => {
            const date = new Date(e.date);
            return date >= dayStart && date < dayEnd;
          }).length;

        weeklyBreakdown.push({
          day: days[i],
          earnings: dayEarnings,
          deliveries: dayDeliveries,
        });
      }

      return {
        totalEarnings,
        thisWeek: thisWeekEarnings,
        lastWeek: lastWeekEarnings,
        thisMonth: thisMonthEarnings,
        lastMonth: lastMonthEarnings,
        todayEarnings,
        totalDeliveries,
        completedDeliveries,
        averageEarningPerDelivery,
        weeklyBreakdown,
        recentDeliveries: earnings.slice(0, 10),
      };
    } catch (error) {
      console.error('Error fetching rider earnings:', error);
      throw error;
    }
  }

  // Automatic assignment system
  static async autoAssignOrders(): Promise<void> {
    try {
      // Get available orders
      const availableOrders = await this.getAvailableOrders();
      
      if (availableOrders.length === 0) {
        console.log('No available orders for auto-assignment');
        return;
      }

      // Get available riders
      const { data: availableRiders, error: ridersError } = await supabase
        .from('riders')
        .select('id, current_location, is_available')
        .eq('is_available', true);

      if (ridersError) throw ridersError;

      if (!availableRiders || availableRiders.length === 0) {
        console.log('No available riders for auto-assignment');
        return;
      }

      // Simple round-robin assignment
      for (let i = 0; i < availableOrders.length; i++) {
        const order = availableOrders[i];
        const rider = availableRiders[i % availableRiders.length];

        try {
          await this.acceptOrder(order.id, rider.id);
          console.log(`Auto-assigned order ${order.id} to rider ${rider.id}`);
        } catch (assignmentError) {
          console.error(`Failed to auto-assign order ${order.id}:`, assignmentError);
        }
      }
    } catch (error) {
      console.error('Error in auto-assignment:', error);
      throw error;
    }
  }
}
