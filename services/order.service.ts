import { supabase } from '../lib/supabase';
import {
  DeliveryOrder,
  Order,
  OrderFilters,
  OrderItem,
  OrderStats,
  OrderStatus,
  OrderTracking,
  OrderUpdate
} from '../types/order.types';

export class OrderService {
  // Helper function to convert app status to database status
  private static convertStatusToDb(status: string): string {
    // Try different possible ENUM value formats
    const statusMap: { [key: string]: string[] } = {
      'pending': ['Pending', 'pending', 'PENDING'],
      'confirmed': ['Confirmed', 'confirmed', 'CONFIRMED'],
      'preparing': ['Preparing', 'preparing', 'PREPARING'],
      'ready_for_pickup': ['Ready for Pickup', 'ready_for_pickup', 'READY_FOR_PICKUP'],
      'out_for_delivery': ['Out for Delivery', 'out_for_delivery', 'OUT_FOR_DELIVERY'],
      'delivered': ['Delivered', 'delivered', 'DELIVERED'],
      'cancelled': ['Cancelled', 'cancelled', 'CANCELLED']
    };
    
    const possibleValues = statusMap[status] || [status];
    // Return the first possible value (most likely to work)
    return possibleValues[0];
  }

  // Helper function to convert database status to app status
  private static convertStatusFromDb(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Pending': 'pending',
      'Confirmed': 'confirmed',
      'Preparing': 'preparing', 
      'Ready for Pickup': 'ready_for_pickup',
      'Out for Delivery': 'out_for_delivery',
      'Delivered': 'delivered',
      'Cancelled': 'cancelled'
    };
    return statusMap[status] || status;
  }

  // Get orders for a user
  static async getUserOrders(userId: string, filters?: OrderFilters): Promise<Order[]> {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*),
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
      return data || [];
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
          items:order_items(*),
          delivery_address:addresses(*)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data as Order;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
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
  }): Promise<Order> {
    try {
      // Calculate totals
      const subtotal = orderData.items.reduce((sum, item) => sum + item.total_price, 0);
      const delivery_fee = 50; // Fixed delivery fee
      const tax_amount = subtotal * 0.12; // 12% tax
      const total_amount = subtotal + delivery_fee + tax_amount;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: orderData.user_id,
          order_number: this.generateOrderNumber(),
          status: 'pending',
          payment_status: 'pending',
          payment_method: orderData.payment_method,
          subtotal,
          delivery_fee,
          tax_amount,
          total_amount,
          delivery_address_id: orderData.delivery_address_id,
          delivery_instructions: orderData.delivery_instructions,
          notes: orderData.notes,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.product_image,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        special_instructions: item.special_instructions,
        pizza_size: item.pizza_size,
        pizza_crust: item.pizza_crust,
        toppings: item.toppings,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

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
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      // Set specific timestamps based on status
      switch (status) {
        case 'confirmed':
          updateData.confirmed_at = new Date().toISOString();
          break;
        case 'preparing':
          updateData.prepared_at = new Date().toISOString();
          break;
        case 'ready_for_pickup':
          updateData.picked_up_at = new Date().toISOString();
          break;
        case 'delivered':
          updateData.delivered_at = new Date().toISOString();
          break;
        case 'cancelled':
          updateData.cancelled_at = new Date().toISOString();
          break;
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      // Add tracking entry
      await this.addOrderTracking(orderId, status, updatedBy, notes);
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Add order tracking entry
  static async addOrderTracking(
    orderId: string,
    status: OrderStatus,
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
          user:profiles!orders_user_id_fkey(full_name, phone_number)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status.length > 0) {
        const dbStatuses = filters.status.map(s => this.convertStatusToDb(s));
        query = query.in('status', dbStatuses);
      }

      if (filters?.search) {
        query = query.or(`order_number.ilike.%${filters.search}%,user.full_name.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching admin orders:', error);
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

      const stats: OrderStats = {
        total_orders: data.length,
        pending_orders: data.filter((o: any) => o.status === 'Pending').length,
        preparing_orders: data.filter((o: any) => o.status === 'Preparing').length,
        out_for_delivery: data.filter((o: any) => o.status === 'Out for Delivery').length,
        delivered_orders: data.filter((o: any) => o.status === 'Delivered').length,
        cancelled_orders: data.filter((o: any) => o.status === 'Cancelled').length,
        total_revenue: data.reduce((sum: number, o: any) => sum + o.total_amount, 0),
        average_order_value: 0,
        completion_rate: 0,
      };

      stats.average_order_value = stats.total_orders > 0 ? stats.total_revenue / stats.total_orders : 0;
      stats.completion_rate = stats.total_orders > 0 ? 
        (stats.delivered_orders / stats.total_orders) * 100 : 0;

      return stats;
    } catch (error) {
      console.error('Error fetching order stats:', error);
      throw error;
    }
  }

  // Delivery: Get available orders
  static async getAvailableOrders(): Promise<DeliveryOrder[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*),
          delivery_address:addresses(*),
          user:profiles!orders_user_id_fkey(full_name, phone_number)
        `)
        .eq('status', 'ready_for_pickup')
        .is('assigned_delivery_id', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Transform to delivery orders with distance calculation
      return (data || []).map((order: any) => ({
        order,
        distance: 0, // Calculate based on delivery person location
        estimated_time: 30, // Calculate based on distance
        customer_phone: order.user?.phone_number || '',
        customer_name: order.user?.full_name || '',
        priority: 'medium' as const,
      }));
    } catch (error) {
      console.error('Error fetching available orders:', error);
      throw error;
    }
  }

  // Delivery: Assign order to delivery person
  static async assignOrderToDelivery(
    orderId: string, 
    deliveryPersonId: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          assigned_delivery_id: deliveryPersonId,
          status: 'out_for_delivery',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) throw error;

      // Add tracking entry
      await this.addOrderTracking(orderId, 'out_for_delivery', deliveryPersonId);
    } catch (error) {
      console.error('Error assigning order:', error);
      throw error;
    }
  }

  // Cancel order
  static async cancelOrder(
    orderId: string, 
    reason: string, 
    cancelledBy: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          cancellation_reason: reason,
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) throw error;

      // Add tracking entry
      await this.addOrderTracking(orderId, 'cancelled', cancelledBy, reason);
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
