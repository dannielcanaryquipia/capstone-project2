import { supabase } from '../lib/supabase';
import {
  Order,
  OrderFilters,
  OrderItem,
  OrderStats,
  OrderStatus,
  OrderTracking,
  OrderUpdate
} from '../types/order.types';
import { notificationService } from './api';

export class OrderService {
  // Helper function to convert app status to database status
  private static convertStatusToDb(status: string): string {
    // Database now uses lowercase values
    const statusMap: { [key: string]: string } = {
      'pending': 'pending',
      'confirmed': 'preparing', // Note: 'confirmed' maps to 'preparing' in your DB
      'preparing': 'preparing',
      'ready_for_pickup': 'ready_for_pickup',
      'out_for_delivery': 'out_for_delivery',
      'delivered': 'delivered',
      'cancelled': 'cancelled'
    };
    
    return statusMap[status] || status;
  }

  // Helper function to convert database status to app status
  private static convertStatusFromDb(status: string): string {
    // Database now uses lowercase values, so just return as is
    const statusMap: { [key: string]: string } = {
      'pending': 'pending',
      'preparing': 'preparing',
      'ready_for_pickup': 'ready_for_pickup',
      'out_for_delivery': 'out_for_delivery',
      'delivered': 'delivered',
      'cancelled': 'cancelled'
    };
    
    return statusMap[status] || status.toLowerCase();
  }

  // Get orders for a user
  static async getUserOrders(userId: string, filters?: OrderFilters): Promise<Order[]> {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(name, image_url)
          ),
          delivery_address:addresses(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status.length > 0) {
        const dbStatuses = filters.status.map(s => this.convertStatusToDb(s));
        query = query.in('status', dbStatuses);
      }

      if (filters?.payment_status && filters.payment_status.length > 0) {
        query = query.in('payment_status', filters.payment_status);
      }

      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Convert database status back to app format and convert order items
      const convertedData = (data || []).map((order: any) => {
        const convertedItems = order.items?.map((item: any) => {
          const customization = item.customization_details || {};
          return {
            id: item.id,
            product_id: item.product_id,
            product_name: customization.product_name || item.product?.name || 'Unknown Product',
            product_image: customization.product_image || item.product?.image_url || '',
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: customization.total_price || (item.quantity * item.unit_price),
            special_instructions: customization.special_instructions || '',
            pizza_size: customization.pizza_size || item.selected_size,
            pizza_crust: customization.pizza_crust || '',
            toppings: customization.toppings || [],
            customization_details: customization,
          };
        }) || [];

        return {
          ...order,
          status: this.convertStatusFromDb(order.status),
          items: convertedItems,
        };
      });
      
      return convertedData;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  }

  // Get order by ID
  static async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(name, image_url)
          ),
          delivery_address:addresses(*),
          customer:profiles!orders_user_id_fkey(full_name, phone_number, username),
          payment_transactions(
            *,
            proof_of_payment_url
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      
      // Convert order items to match expected format
      const convertedItems = data.items?.map((item: any) => {
        const customization = item.customization_details || {};
        return {
          id: item.id,
          product_id: item.product_id,
          product_name: customization.product_name || item.product?.name || 'Unknown Product',
          product_image: customization.product_image || item.product?.image_url || '',
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: customization.total_price || (item.quantity * item.unit_price),
          special_instructions: customization.special_instructions || '',
          pizza_size: customization.pizza_size || item.selected_size,
          pizza_crust: customization.pizza_crust || '',
          toppings: customization.toppings || [],
          customization_details: customization,
        };
      }) || [];
      
      // Extract proof of payment URL from payment transactions
      const proofOfPaymentUrl = data.payment_transactions?.[0]?.proof_of_payment_url || data.proof_of_payment_url;
      
      // Convert database status back to app format
      const convertedOrder = {
        ...data,
        status: this.convertStatusFromDb(data.status),
        items: convertedItems,
        proof_of_payment_url: proofOfPaymentUrl,
        proof_of_delivery_url: (data as any).proof_of_delivery_url,
      };
      
      return convertedOrder as Order;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  // Fetch image proofs (payment and delivery) for an order
  static async getOrderProofImages(orderId: string): Promise<{
    paymentProofs: Array<{
      id: string;
      url: string;
      thumbnail_url?: string;
      uploaded_at?: string;
      verified?: boolean;
    }>;
    deliveryProofs: Array<{
      id: string;
      url: string;
      thumbnail_url?: string;
      uploaded_at?: string;
      verified?: boolean;
    }>;
  }> {
    try {
      const { data, error } = await supabase
        .from('image_metadata' as any)
        .select('*')
        .eq('order_id', orderId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      const paymentProofs = (data || []).filter((it: any) => it.type === 'payment_proof');
      const deliveryProofs = (data || []).filter((it: any) => it.type === 'delivery_proof');

      return { paymentProofs, deliveryProofs };
    } catch (e) {
      console.warn('getOrderProofImages failed', e);
      return { paymentProofs: [], deliveryProofs: [] };
    }
  }

  // Create new order
  static async createOrder(orderData: {
    user_id: string;
    items: Omit<OrderItem, 'id'>[];
    delivery_address_id: string;
    payment_method: string;
    delivery_instructions?: string;
    notes?: string;
    processing_fee?: number;
  }): Promise<Order> {
    try {
      // Calculate totals
      const subtotal = orderData.items.reduce((sum, item) => sum + item.total_price, 0);
      const processing_fee = orderData.processing_fee || 0; // Use processing fee from checkout
      const total_amount = subtotal + processing_fee; // Only include processing fee in total

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
        user_id: orderData.user_id,
        status: 'Pending',
        payment_status: 'Pending',
          payment_method: orderData.payment_method,
          total_amount,
          delivery_address_id: orderData.delivery_address_id,
          order_notes: orderData.notes,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        selected_size: item.pizza_size,
        customization_details: {
          product_name: item.product_name,
          product_image: item.product_image,
          total_price: item.total_price,
          special_instructions: item.special_instructions,
          pizza_size: item.pizza_size,
          pizza_crust: item.pizza_crust,
          toppings: item.toppings,
          ...item.customization_details,
        },
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Send notification to customer about order placement
      try {
        await notificationService.sendNotification({
          userId: orderData.user_id,
          title: 'Order Placed Successfully!',
          message: `Your order has been placed and is being processed. Order #${order.id.slice(-6).toUpperCase()}`,
          type: 'order_update',
          relatedId: order.id,
        });
      } catch (notificationError) {
        console.error('Error sending order notification:', notificationError);
        // Don't throw error for notification failure
      }

      // Send notification to admin about new order
      try {
        // Get all admin users
        const { data: adminUsers } = await supabase
          .from('profiles')
          .select('id')
          .in('role', ['admin', 'super_admin']);

        if (adminUsers && adminUsers.length > 0) {
          const adminUserIds = adminUsers.map((admin: any) => admin.id);
          await notificationService.sendBulkNotification(adminUserIds, {
            title: 'New Order Received!',
            message: `New order #${order.id.slice(-6).toUpperCase()} has been placed and needs attention.`,
            type: 'order_update',
            relatedId: order.id,
          });
        }
      } catch (adminNotificationError) {
        console.error('Error sending admin notification:', adminNotificationError);
        // Don't throw error for notification failure
      }

      // Return complete order
      return await this.getOrderById(order.id) as Order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Update order status
  static async updateOrderStatus(
    orderId: string, 
    status: OrderStatus, 
    updatedBy: string,
    notes?: string
  ): Promise<void> {
    try {
      const dbStatus = this.convertStatusToDb(status);
      const updateData: any = {
        status: dbStatus,
        updated_at: new Date().toISOString(),
      };

      // No per-status timestamp columns exist in schema; rely on updated_at and history table

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      // Add tracking entry
      await this.addOrderTracking(orderId, dbStatus, updatedBy, notes);

      // Send customer notification for key transitions
      try {
        if (dbStatus === 'Preparing' || dbStatus === 'Out for Delivery') {
          const { data: ord } = await supabase
            .from('orders')
            .select('id, user_id, status, order_number')
            .eq('id', orderId)
            .single();
          if (ord?.user_id) {
            const isDelivery = dbStatus === 'Out for Delivery';
            await notificationService.sendNotification({
              userId: ord.user_id,
              title: isDelivery ? 'Your order is on the way' : 'Your order is being prepared',
              message: isDelivery
                ? `Order ${ord.order_number || orderId.slice(-8)} is now out for delivery.`
                : `Order ${ord.order_number || orderId.slice(-8)} is now being prepared by the kitchen.`,
              type: isDelivery ? 'delivery' : 'order_update',
              relatedId: orderId,
            });
          }
        }
      } catch (notifyErr) {
        console.warn('Non-fatal: failed to send status notification', notifyErr);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Add order tracking entry
  static async addOrderTracking(
    orderId: string,
    status: string, // This will be the database status format
    updatedBy: string,
    notes?: string
  ): Promise<void> {
    try {
      // For now, we'll just log the tracking info since the table doesn't exist
      // In a real implementation, you would create the order_tracking table
      console.log('Order tracking:', {
        order_id: orderId,
        status,
        updated_by: updatedBy,
        notes,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error adding order tracking:', error);
      throw error;
    }
  }

  // Get order tracking history
  static async getOrderTracking(orderId: string): Promise<OrderTracking[]> {
    try {
      // For now, return empty array since the table doesn't exist
      // In a real implementation, you would create the order_tracking table
      return [];
    } catch (error) {
      console.error('Error fetching order tracking:', error);
      throw error;
    }
  }

  // Admin: Get all orders with filters
  static async getAdminOrders(filters?: OrderFilters): Promise<Order[]> {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*),
          delivery_address:addresses(*),
          user:profiles!orders_user_id_fkey(full_name, phone_number),
          payment_transactions(
            *,
            proof_of_payment_url
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status.length > 0) {
        const dbStatuses = filters.status.map(s => this.convertStatusToDb(s));
        query = query.in('status', dbStatuses);
      }

      if (filters?.search) {
        query = query.or(`id.ilike.%${filters.search}%,user.full_name.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Convert database status back to app format
      const convertedData = (data || []).map((order: any) => {
        // Extract proof of payment URL from payment transactions
        const proofOfPaymentUrl = order.payment_transactions?.[0]?.proof_of_payment_url || order.proof_of_payment_url;
        
        return {
          ...order,
          status: this.convertStatusFromDb(order.status),
          proof_of_payment_url: proofOfPaymentUrl,
        };
      });
      
      return convertedData;
    } catch (error) {
      console.error('Error fetching admin orders:', error);
      throw error;
    }
  }

  // Rider: Get rider-specific order statistics
  static async getRiderStats(riderId: string): Promise<OrderStats> {
    try {
      // Get orders assigned to this rider through delivery_assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from('delivery_assignments')
        .select(`
          id,
          delivered_at,
          order:orders(
            id,
            status,
            total_amount,
            created_at,
            actual_delivery_time,
            payment_verified_by,
            payment_verified_at
          )
        `)
        .eq('rider_id', riderId);

      if (assignmentsError) throw assignmentsError;

      const orders = (assignments || []).map((assignment: any) => assignment.order).filter(Boolean);
      
      // Debug: Log unique status values for this rider
      const uniqueStatuses = [...new Set(orders.map((o: any) => o.status))];
      console.log('Rider order statuses:', uniqueStatuses);
      console.log('Total orders for rider:', orders.length);
      console.log('Orders with actual_delivery_time:', orders.filter((o: any) => o.actual_delivery_time).length);
      console.log('Orders with payment_verified_by:', orders.filter((o: any) => o.payment_verified_by).length);
      console.log('Delivery assignments with delivered_at:', (assignments || []).filter((a: any) => a.delivered_at).length);

      // Helper function to check status with multiple possible formats
      const getStatusCount = (statusValue: string) => {
        return orders.filter((o: any) => {
          const status = o.status?.toLowerCase();
          const targetStatus = statusValue.toLowerCase();
          
          // Check for exact match
          if (status === targetStatus) return true;
          
          // Check for common variations
          if (targetStatus === 'pending' && status === 'pending') return true;
          if (targetStatus === 'preparing' && (status === 'preparing' || status === 'confirmed')) return true;
          if (targetStatus === 'out_for_delivery' && (status === 'out_for_delivery' || status === 'out for delivery' || status === 'outfordelivery' || status === 'ready for pickup')) return true;
          if (targetStatus === 'delivered' && status === 'delivered') return true;
          if (targetStatus === 'cancelled' && (status === 'cancelled' || status === 'canceled')) return true;
          
          return false;
        }).length;
      };

      // Calculate today's date for today's earnings
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Filter orders delivered today using both delivered_at from delivery_assignments and actual_delivery_time from orders
      const todayOrders = (assignments || []).filter((assignment: any) => {
        const order = assignment.order;
        if (!order) return false;
        
        // Check both delivered_at from delivery_assignments and actual_delivery_time from orders
        const deliveredAt = assignment.delivered_at ? new Date(assignment.delivered_at) : 
                           (order.actual_delivery_time ? new Date(order.actual_delivery_time) : null);
        
        return deliveredAt && deliveredAt >= today;
      });

      // Calculate delivery fee (₱50 per delivery)
      const deliveryFee = 50;
      
      // Count delivered orders using delivered_at field instead of status
      const deliveredOrdersCount = (assignments || []).filter((assignment: any) => 
        assignment.delivered_at !== null
      ).length;

      const stats: OrderStats = {
        total_orders: orders.length,
        pending_orders: getStatusCount('pending'),
        preparing_orders: getStatusCount('preparing'),
        out_for_delivery: getStatusCount('out_for_delivery'),
        delivered_orders: deliveredOrdersCount,
        cancelled_orders: getStatusCount('cancelled'),
        total_income: deliveredOrdersCount * deliveryFee, // Rider earnings based on deliveries
        cancelled_income: 0, // Riders don't get paid for cancelled orders
        average_order_value: 0,
        completion_rate: 0,
      };

      // Add today's earnings as a custom field
      (stats as any).today_earnings = todayOrders.length * deliveryFee;

      stats.average_order_value = stats.total_orders > 0 ? stats.total_income / stats.total_orders : 0;
      stats.completion_rate = stats.total_orders > 0 ? 
        (stats.delivered_orders / stats.total_orders) * 100 : 0;

      console.log('Rider stats calculated:', stats);
      return stats;
    } catch (error) {
      console.error('Error fetching rider stats:', error);
      throw error;
    }
  }

  // Admin: Get order statistics
  static async getOrderStats(): Promise<OrderStats> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('status, total_amount, created_at');

      if (error) throw error;

      // Debug: Log unique status values to see what's actually in the database
      const uniqueStatuses = [...new Set(data.map((o: any) => o.status))];
      console.log('Unique order statuses in database:', uniqueStatuses);

      // Helper function to check status with multiple possible formats
      const getStatusCount = (statusValue: string) => {
        return data.filter((o: any) => {
          const status = o.status?.toLowerCase();
          const targetStatus = statusValue.toLowerCase();
          
          // Check for exact match
          if (status === targetStatus) return true;
          
          // Check for common variations
          if (targetStatus === 'pending' && status === 'pending') return true;
          if (targetStatus === 'preparing' && (status === 'preparing' || status === 'confirmed')) return true;
          if (targetStatus === 'out_for_delivery' && (status === 'out_for_delivery' || status === 'out for delivery' || status === 'outfordelivery' || status === 'ready for pickup')) return true;
          if (targetStatus === 'delivered' && status === 'delivered') return true;
          if (targetStatus === 'cancelled' && (status === 'cancelled' || status === 'canceled')) return true;
          
          return false;
        }).length;
      };

      const stats: OrderStats = {
        total_orders: data.length,
        pending_orders: getStatusCount('pending'),
        preparing_orders: getStatusCount('preparing'),
        out_for_delivery: getStatusCount('out_for_delivery'),
        delivered_orders: getStatusCount('delivered'),
        cancelled_orders: getStatusCount('cancelled'),
        total_income: data
          .filter((o: any) => {
            const status = o.status?.toLowerCase();
            return status === 'delivered';
          })
          .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0),
        cancelled_income: data
          .filter((o: any) => {
            const status = o.status?.toLowerCase();
            return status === 'cancelled' || status === 'canceled';
          })
          .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0),
        average_order_value: 0,
        completion_rate: 0,
      };

      stats.average_order_value = stats.total_orders > 0 ? stats.total_income / stats.total_orders : 0;
      stats.completion_rate = stats.total_orders > 0 ? 
        (stats.delivered_orders / stats.total_orders) * 100 : 0;

      console.log('Order stats calculated:', stats);
      return stats;
    } catch (error) {
      console.error('Error fetching order stats:', error);
      throw error;
    }
  }

  // Admin: Verify GCash payment and update order + payment_transactions
  static async verifyPayment(orderId: string, verifiedBy: string): Promise<void> {
    try {
      const now = new Date().toISOString();

      const { error: orderErr } = await supabase
        .from('orders')
        .update({
          payment_status: 'verified',
          payment_verified: true,
          payment_verified_at: now,
          payment_verified_by: verifiedBy,
          status: 'preparing',
          updated_at: now,
        })
        .eq('id', orderId);
      if (orderErr) throw orderErr;

      const { error: txnErr } = await supabase
        .from('payment_transactions' as any)
        .update({ status: 'verified', verified_by: verifiedBy, verified_at: now } as any)
        .eq('order_id', orderId);
      if (txnErr) throw txnErr;

      // Notify customer payment verified
      try {
        const { data: ord } = await supabase
          .from('orders')
          .select('id, user_id, order_number')
          .eq('id', orderId)
          .single();
        if (ord?.user_id) {
          await notificationService.sendNotification({
            userId: ord.user_id,
            title: 'Payment verified',
            message: `We have verified your payment for order ${ord.order_number || orderId.slice(-8)}. We are preparing your order now.`,
            type: 'payment',
            relatedId: orderId,
          });
        }
      } catch (notifyErr) {
        console.warn('Non-fatal: failed to send payment notification', notifyErr);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  // Delivery: Verify COD payment and update order status
  static async verifyCODPayment(orderId: string, verifiedBy: string): Promise<void> {
    try {
      const now = new Date().toISOString();

      // First check if this is a COD order
      const { data: orderData, error: orderCheckError } = await supabase
        .from('orders')
        .select('payment_method, payment_verified, status')
        .eq('id', orderId)
        .single();

      if (orderCheckError) throw orderCheckError;
      
      if (orderData.payment_method !== 'COD' && orderData.payment_method !== 'cod') {
        throw new Error('This order is not a COD payment. Only COD orders can be verified by delivery staff.');
      }

      if (orderData.payment_verified) {
        throw new Error('Payment for this order has already been verified.');
      }

      if (orderData.status !== 'out_for_delivery' && orderData.status !== 'Out for Delivery') {
        throw new Error('Order must be out for delivery before payment can be verified.');
      }

      // Update order with payment verification
      const { error: orderErr } = await supabase
        .from('orders')
        .update({
          payment_status: 'verified',
          payment_verified: true,
          payment_verified_at: now,
          payment_verified_by: verifiedBy,
          updated_at: now,
        })
        .eq('id', orderId);
      if (orderErr) throw orderErr;

      // Add tracking entry for payment verification
      await this.addOrderTracking(orderId, 'Payment Verified', verifiedBy, 'COD payment verified by delivery staff');

      // Notify customer payment verified
      try {
        const { data: ord } = await supabase
          .from('orders')
          .select('id, user_id, order_number')
          .eq('id', orderId)
          .single();
        if (ord?.user_id) {
          await notificationService.sendNotification({
            userId: ord.user_id,
            title: 'Payment received',
            message: `We have received your COD payment for order ${ord.order_number || orderId.slice(-8)}. Thank you!`,
            type: 'payment',
            relatedId: orderId,
          });
        }
      } catch (notifyErr) {
        console.warn('Non-fatal: failed to send payment notification', notifyErr);
      }
    } catch (error) {
      console.error('Error verifying COD payment:', error);
      throw error;
    }
  }

  // Delivery: Get recent orders for delivery management
  static async getRecentOrdersForDelivery(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*),
          delivery_address:addresses(*),
          user:profiles!orders_user_id_fkey(full_name, phone_number)
        `)
        .in('status', ['Ready for Pickup', 'Out for Delivery'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []) as Order[];
    } catch (error) {
      console.error('Error fetching recent orders for delivery:', error);
      throw error;
    }
  }

  // Delivery: Get recent delivered orders by rider
  static async getRecentDeliveredOrders(riderId: string): Promise<Order[]> {
    try {
      console.log('Fetching delivered orders for rider ID:', riderId);
      
      const { data, error } = await supabase
        .from('delivery_assignments')
        .select(`
          id,
          delivered_at,
          order:orders(
            *,
            items:order_items(*),
            delivery_address:addresses(*),
            user:profiles!orders_user_id_fkey(full_name, phone_number),
            payment_verified_by,
            payment_verified_at,
            actual_delivery_time
          )
        `)
        .eq('rider_id', riderId)
        .not('delivered_at', 'is', null)
        .order('delivered_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Supabase error fetching delivered orders:', error);
        throw error;
      }

      console.log('Raw delivery assignments data:', data?.length || 0);
      
      const orders = (data || []).map((assignment: any) => {
        if (!assignment.order) {
          console.warn('Assignment without order:', assignment.id);
          return null;
        }
        return {
          ...assignment.order,
          delivery_assignment_delivered_at: assignment.delivered_at
        };
      }).filter(Boolean);
      
      console.log('Processed delivered orders:', orders.length);
      return orders as Order[];
    } catch (error) {
      console.error('Error fetching recent delivered orders:', error);
      throw error;
    }
  }

  // Assignment-based APIs removed; rider flow now relies on admin-assigned orders only

  // Delivery: Mark order delivered with optional proof image
  static async markOrderDelivered(
    orderId: string,
    userId: string,
    proofLocalUri?: string
  ): Promise<{ success: boolean; proofUploaded: boolean; message: string }> {
    try {
      // First get the rider ID for this user, create if needed
      let { data: rider, error: riderError } = await supabase
        .from('riders')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (riderError || !rider) {
        // Check if user has delivery role in profiles
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', userId)
          .single();

        if (profileError || !profile) {
          throw new Error('User profile not found.');
        }

        // Check for various possible delivery role values
        const deliveryRoles = ['delivery_staff', 'delivery', 'rider', 'driver'];
        if (!deliveryRoles.includes(profile.role)) {
          throw new Error(`User does not have delivery role. Current role: ${profile.role}. Expected one of: ${deliveryRoles.join(', ')}`);
        }

        // Create rider record for this user
        const { data: newRider, error: createError } = await supabase
          .from('riders')
          .insert({
            user_id: userId,
            is_available: true
          } as any)
          .select('id')
          .single();

        if (createError || !newRider) {
          throw new Error('Failed to create rider record.');
        }

        rider = newRider;
      }

      // Upload delivery proof image using the new service
      let proofUrl: string | undefined;
      let proofUploaded = false;
      if (proofLocalUri) {
        try {
          console.log('🔄 Starting delivery proof upload...', { 
            orderId, 
            userId, 
            proofLocalUri: proofLocalUri.substring(0, 50) + '...' 
          });
          
          const { ImageUploadService } = await import('./image-upload.service');
          console.log('📦 ImageUploadService imported successfully');
          
          const uploadResult = await ImageUploadService.uploadDeliveryProof(orderId, proofLocalUri, userId);
          console.log('📸 Upload result received:', { 
            hasUrl: !!uploadResult.url, 
            hasThumbnail: !!uploadResult.thumbnailUrl,
            metadata: uploadResult.metadata 
          });
          
          proofUrl = uploadResult.url;
          proofUploaded = true;
          console.log('✅ Delivery proof uploaded successfully:', proofUrl);
        } catch (uploadError) {
          console.error('❌ Error uploading delivery proof:', uploadError);
          console.error('❌ Upload error details:', {
            message: (uploadError as any).message,
            stack: (uploadError as any).stack,
            name: (uploadError as any).name
          });
          // Continue without photo rather than failing the delivery
        }
      } else {
        console.log('ℹ️ No proof photo provided for delivery');
      }

      // Update delivery assignment
      console.log('🔄 Updating delivery assignment status to delivered...', { orderId, riderId: (rider as any).id });
      const { error: assignErr } = await supabase
        .from('delivery_assignments' as any)
        .update({ delivered_at: new Date().toISOString(), notes: null } as any)
        .eq('order_id', orderId)
        .eq('rider_id', (rider as any).id);
      if (assignErr) {
        console.error('❌ Error updating delivery assignment:', assignErr);
        throw assignErr;
      }
      console.log('✅ Delivery assignment updated successfully');

      // Update order status
      const deliveryTime = new Date().toISOString();
      console.log('🔄 Updating order status to delivered...', { 
        orderId, 
        deliveryTime,
        currentTime: new Date().toLocaleString()
      });
      const { error: ordErr } = await supabase
        .from('orders')
        .update({ 
          status: 'delivered', 
          updated_at: deliveryTime, 
          actual_delivery_time: deliveryTime 
        })
        .eq('id', orderId);
      if (ordErr) {
        console.error('❌ Error updating order status:', ordErr);
        throw ordErr;
      }
      console.log('✅ Order status updated successfully to delivered');

      // Verify the order was updated correctly
      const { data: updatedOrder, error: verifyErr } = await supabase
        .from('orders')
        .select('id, status, actual_delivery_time, updated_at')
        .eq('id', orderId)
        .single();
      
      if (verifyErr) {
        console.warn('⚠️ Could not verify order update:', verifyErr);
      } else {
        console.log('✅ Order verification successful:', {
          id: updatedOrder.id,
          status: updatedOrder.status,
          actual_delivery_time: updatedOrder.actual_delivery_time,
          updated_at: updatedOrder.updated_at
        });
      }

      // Notify customer
      try {
        const { data: ord } = await supabase
          .from('orders')
          .select('user_id, order_number')
          .eq('id', orderId)
          .single();
        if (ord?.user_id) {
          await notificationService.sendNotification({
            userId: ord.user_id,
            title: 'Order delivered',
            message: `Your order ${ord.order_number || orderId.slice(-8)} has been delivered. Thank you!`,
            type: 'delivery',
            relatedId: orderId,
          });
        }
      } catch (e) {
        console.warn('Non-fatal: failed to send delivered notification', e);
      }

      // Trigger real-time update for admin dashboard
      try {
        console.log('📡 Broadcasting order delivered update...', { orderId, riderId: (rider as any).id });
        await supabase
          .channel('admin-stats-update')
          .send({
            type: 'broadcast',
            event: 'order_delivered',
            payload: { orderId, riderId: (rider as any).id }
          });
        console.log('✅ Broadcast sent successfully');
      } catch (broadcastError) {
        console.warn('⚠️ Failed to broadcast order delivered update:', broadcastError);
      }

      // Return success response with proof upload status
      return {
        success: true,
        proofUploaded,
        message: proofUploaded 
          ? 'Order marked as delivered with proof photo! Customer has been notified.'
          : 'Order marked as delivered! Customer has been notified.'
      };
    } catch (error) {
      console.error('Error marking order delivered:', error);
      return {
        success: false,
        proofUploaded: false,
        message: error instanceof Error ? error.message : 'Failed to mark order as delivered'
      };
    }
  }

  // Cancel order
  static async cancelOrder(
    orderId: string, 
    reason: string, 
    cancelledBy: string
  ): Promise<void> {
    try {
      const dbStatus = this.convertStatusToDb('cancelled');
      const { error } = await supabase
        .from('orders')
        .update({
          status: dbStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) throw error;

      // Add tracking entry
      await this.addOrderTracking(orderId, dbStatus, cancelledBy, reason);
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  // Generate unique order number
  private static generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `KO-${timestamp.slice(-6)}-${random}`;
  }

  // Subscribe to real-time order updates
  static subscribeToOrderUpdates(
    orderId: string,
    callback: (update: OrderUpdate) => void
  ) {
    return supabase
      .channel(`order-${orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      }, (payload) => {
        callback({
          order_id: payload.new.id,
          status: payload.new.status,
          timestamp: payload.new.updated_at,
          message: `Order status updated to ${payload.new.status}`,
        });
      })
      .subscribe();
  }
}
