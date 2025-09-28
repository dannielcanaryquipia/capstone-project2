import { supabase } from '../lib/supabase';
import { Order } from '../types/order.types';
import { notificationService } from './api';

export class NotificationTriggersService {
  // Subscribe to order changes and trigger notifications
  static subscribeToOrderNotifications() {
    return supabase
      .channel('order-notification-triggers')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        async (payload) => {
          const oldOrder = payload.old as Order;
          const newOrder = payload.new as Order;
          
          // Only trigger if status actually changed
          if (oldOrder.status !== newOrder.status) {
            await this.triggerOrderStatusNotification(newOrder, oldOrder.status);
          }
          
          // Trigger payment status notifications
          if (oldOrder.payment_status !== newOrder.payment_status) {
            await this.triggerPaymentStatusNotification(newOrder, oldOrder.payment_status);
          }
        }
      )
      .subscribe();
  }

  // Subscribe to delivery assignment changes
  static subscribeToDeliveryNotifications() {
    return supabase
      .channel('delivery-notification-triggers')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'delivery_assignments',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            await this.triggerDeliveryAssignmentNotification(payload.new);
          } else if (payload.eventType === 'UPDATE') {
            await this.triggerDeliveryStatusNotification(payload.new, payload.old);
          }
        }
      )
      .subscribe();
  }

  // Trigger order status change notifications
  private static async triggerOrderStatusNotification(order: Order, oldStatus: string) {
    const statusMessages: Record<string, string> = {
      'Pending': 'Your order has been received and is being processed.',
      'Preparing': 'Your order is now being prepared in our kitchen.',
      'Ready for Pickup': 'Your order is ready for pickup!',
      'Out for Delivery': 'Your order is out for delivery and on its way to you.',
      'Delivered': 'Your order has been delivered successfully. Enjoy your meal!',
      'Cancelled': 'Your order has been cancelled. If you have any questions, please contact us.',
    };

    const message = statusMessages[order.status] || `Your order status has been updated to ${order.status}.`;
    
    await notificationService.sendNotification({
      userId: order.user_id,
      title: `Order ${order.order_number} - ${order.status}`,
      message,
      type: 'order_update',
      relatedId: order.id,
    });
  }

  // Trigger payment status notifications
  private static async triggerPaymentStatusNotification(order: Order, oldPaymentStatus: string) {
    const paymentMessages = {
      'Verified': 'Your payment has been verified successfully.',
      'Paid': 'Your payment has been processed and confirmed.',
      'Failed': 'Your payment failed. Please try again or contact support.',
      'Refunded': 'Your payment has been refunded successfully.',
    };

    const message = paymentMessages[order.payment_status as keyof typeof paymentMessages] || 
      `Your payment status has been updated to ${order.payment_status}.`;
    
    await notificationService.sendNotification({
      userId: order.user_id,
      title: `Payment Update - Order ${order.order_number}`,
      message,
      type: 'payment',
      relatedId: order.id,
    });
  }

  // Trigger delivery assignment notifications
  private static async triggerDeliveryAssignmentNotification(assignment: any) {
    // Get order details
    const { data: order } = await supabase
      .from('orders')
      .select('*, user_id, order_number')
      .eq('id', assignment.order_id)
      .single();

    if (!order) return;

    await notificationService.sendNotification({
      userId: order.user_id,
      title: 'Delivery Assigned',
      message: `A delivery person has been assigned to your order ${order.order_number}. They will contact you soon.`,
      type: 'delivery',
      relatedId: order.id,
    });
  }

  // Trigger delivery status notifications
  private static async triggerDeliveryStatusNotification(newAssignment: any, oldAssignment: any) {
    if (oldAssignment.status === newAssignment.status) return;

    // Get order details
    const { data: order } = await supabase
      .from('orders')
      .select('*, user_id, order_number')
      .eq('id', newAssignment.order_id)
      .single();

    if (!order) return;

    const statusMessages = {
      'Assigned': 'Your delivery has been assigned to a rider.',
      'Picked Up': 'Your order has been picked up and is on its way.',
      'In Transit': 'Your order is currently in transit.',
      'Delivered': 'Your order has been delivered successfully!',
      'Failed': 'There was an issue with your delivery. Please contact support.',
    };

    const message = statusMessages[newAssignment.status as keyof typeof statusMessages] || 
      `Your delivery status has been updated to ${newAssignment.status}.`;

    await notificationService.sendNotification({
      userId: order.user_id,
      title: `Delivery Update - Order ${order.order_number}`,
      message,
      type: 'delivery',
      relatedId: order.id,
    });
  }

  // Send promotional notifications
  static async sendPromotionalNotification(userIds: string[], title: string, message: string) {
    await notificationService.sendBulkNotification(userIds, {
      title,
      message,
      type: 'system',
    });
  }

  // Send system maintenance notifications
  static async sendMaintenanceNotification(userIds: string[], message: string) {
    await notificationService.sendBulkNotification(userIds, {
      title: 'System Maintenance',
      message,
      type: 'system',
    });
  }

  // Send new menu item notifications
  static async sendNewMenuItemNotification(userIds: string[], productName: string) {
    await notificationService.sendBulkNotification(userIds, {
      title: 'New Menu Item Available!',
      message: `Check out our new ${productName}! Available now for ordering.`,
      type: 'system',
    });
  }

  // Send low stock alerts to admins
  static async sendLowStockAlert(productName: string, currentStock: number) {
    // Get admin user IDs
    const { data: admins } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('role', 'admin');

    if (!admins || admins.length === 0) return;

    const adminIds = admins.map((admin: any) => admin.user_id);

    await notificationService.sendBulkNotification(adminIds, {
      title: 'Low Stock Alert',
      message: `${productName} is running low. Current stock: ${currentStock} units.`,
      type: 'system',
    });
  }

  // Initialize all notification triggers
  static initializeNotificationTriggers() {
    console.log('Initializing notification triggers...');
    
    // Subscribe to order notifications
    this.subscribeToOrderNotifications();
    
    // Subscribe to delivery notifications
    this.subscribeToDeliveryNotifications();
    
    console.log('Notification triggers initialized successfully');
  }
}
