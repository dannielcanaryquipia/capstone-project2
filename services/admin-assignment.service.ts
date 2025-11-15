import { supabase } from '../lib/supabase';
import { AutoAssignmentService } from './auto-assignment.service';
import { RiderService } from './rider.service';

export interface AssignmentDashboard {
  totalOrders: number;
  assignedOrders: number;
  unassignedOrders: number;
  availableRiders: number;
  busyRiders: number;
  assignmentRate: number;
  averageAssignmentTime: number;
}

export interface RiderAssignmentStats {
  riderId: string;
  riderName: string;
  currentOrders: number;
  maxOrders: number;
  completedToday: number;
  averageDeliveryTime: number;
  isAvailable: boolean;
  lastActive: string;
}

export class AdminAssignmentService {
  // Get assignment dashboard data
  static async getAssignmentDashboard(): Promise<AssignmentDashboard> {
    try {
      const stats = await AutoAssignmentService.getAssignmentStats();
      
      // Calculate assignment rate
      const assignmentRate = stats.totalOrders > 0 
        ? (stats.assignedOrders / stats.totalOrders) * 100 
        : 0;

      // Calculate average assignment time (simplified)
      const averageAssignmentTime = 5; // minutes - would be calculated from actual data

      return {
        ...stats,
        assignmentRate,
        averageAssignmentTime,
      };
    } catch (error) {
      console.error('Error getting assignment dashboard:', error);
      return {
        totalOrders: 0,
        assignedOrders: 0,
        unassignedOrders: 0,
        availableRiders: 0,
        busyRiders: 0,
        assignmentRate: 0,
        averageAssignmentTime: 0,
      };
    }
  }

  // Get rider assignment statistics
  static async getRiderAssignmentStats(): Promise<RiderAssignmentStats[]> {
    try {
      const { data: riders, error } = await supabase
        .from('riders')
        .select(`
          id,
          user_id,
          is_available,
          current_location,
          created_at,
          profile:profiles!riders_user_id_fkey(full_name, phone_number)
        `);

      if (error) throw error;

      const riderStats = await Promise.all(
        (riders || []).map(async (rider) => {
          // Get current order count
          const { data: assignments } = await supabase
            .from('delivery_assignments')
            .select('id, delivered_at')
            .eq('rider_id', rider.id)
            .is('delivered_at', null);

          const currentOrders = assignments?.length || 0;

          // Get completed orders today
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const { data: todayDeliveries } = await supabase
            .from('delivery_assignments')
            .select('delivered_at')
            .eq('rider_id', rider.id)
            .gte('delivered_at', today.toISOString());

          const completedToday = todayDeliveries?.length || 0;

          // Calculate average delivery time
          const { data: recentDeliveries } = await supabase
            .from('delivery_assignments')
            .select('picked_up_at, delivered_at')
            .eq('rider_id', rider.id)
            .not('delivered_at', 'is', null)
            .not('picked_up_at', 'is', null)
            .order('delivered_at', { ascending: false })
            .limit(10);

          let averageDeliveryTime = 0;
          if (recentDeliveries && recentDeliveries.length > 0) {
            const totalTime = recentDeliveries.reduce((sum, delivery) => {
              const pickedUp = new Date(delivery.picked_up_at!);
              const delivered = new Date(delivery.delivered_at!);
              return sum + (delivered.getTime() - pickedUp.getTime());
            }, 0);
            averageDeliveryTime = totalTime / recentDeliveries.length / (1000 * 60); // in minutes
          }

          return {
            riderId: rider.id,
            riderName: rider.profile?.full_name || 'Unknown Rider',
            currentOrders,
            maxOrders: 3, // Default max orders per rider
            completedToday,
            averageDeliveryTime,
            isAvailable: rider.is_available,
            lastActive: rider.created_at,
          };
        })
      );

      return riderStats;
    } catch (error) {
      console.error('Error getting rider assignment stats:', error);
      return [];
    }
  }

  // Get unassigned orders
  // IMPORTANT: Only returns delivery orders, NOT pickup orders
  static async getUnassignedOrders(): Promise<any[]> {
    try {
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
          fulfillment_type,
          delivery_address:addresses(full_address, label),
          customer:profiles!orders_user_id_fkey(full_name, phone_number)
        `)
        .in('status', ['ready_for_pickup', 'preparing'])
        .eq('fulfillment_type', 'delivery') // Only delivery orders, NOT pickup orders
        .eq('payment_verified', true)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Check which orders are already assigned
      const orderIds = orders?.map(o => o.id) || [];
      const { data: assignments } = await supabase
        .from('delivery_assignments')
        .select('order_id')
        .in('order_id', orderIds)
        .not('rider_id', 'is', null);

      const assignedOrderIds = new Set(assignments?.map(a => a.order_id) || []);
      
      // Filter out assigned orders and ensure only delivery orders
      return (orders || []).filter(order => 
        !assignedOrderIds.has(order.id) && order.fulfillment_type === 'delivery'
      );
    } catch (error) {
      console.error('Error getting unassigned orders:', error);
      return [];
    }
  }

  // Manually assign order to rider
  static async manualAssignOrder(orderId: string, riderId: string): Promise<boolean> {
    try {
      const success = await AutoAssignmentService.manualAssign(orderId, riderId);
      
      if (success) {
        // Send notification to rider
        try {
          const { data: rider } = await supabase
            .from('riders')
            .select('user_id')
            .eq('id', riderId)
            .single();

          if (rider?.user_id) {
            const { notificationService } = await import('./api');
            await notificationService.sendNotification({
              userId: rider.user_id,
              title: 'New Order Assigned',
              message: 'You have been assigned a new delivery order.',
              type: 'assignment',
              relatedId: orderId,
            });
          }
        } catch (notificationError) {
          console.warn('Failed to send assignment notification:', notificationError);
        }
      }

      return success;
    } catch (error) {
      console.error('Error manually assigning order:', error);
      return false;
    }
  }

  // Reassign order to different rider
  static async reassignOrder(orderId: string, newRiderId: string): Promise<boolean> {
    try {
      const success = await AutoAssignmentService.reassignOrder(orderId, newRiderId);
      
      if (success) {
        // Send notification to new rider
        try {
          const { data: rider } = await supabase
            .from('riders')
            .select('user_id')
            .eq('id', newRiderId)
            .single();

          if (rider?.user_id) {
            const { notificationService } = await import('./api');
            await notificationService.sendNotification({
              userId: rider.user_id,
              title: 'Order Reassigned',
              message: 'An order has been reassigned to you.',
              type: 'assignment',
              relatedId: orderId,
            });
          }
        } catch (notificationError) {
          console.warn('Failed to send reassignment notification:', notificationError);
        }
      }

      return success;
    } catch (error) {
      console.error('Error reassigning order:', error);
      return false;
    }
  }

  // Trigger auto-assignment for all unassigned orders
  static async triggerAutoAssignment(): Promise<{
    assigned: number;
    failed: number;
    errors: string[];
  }> {
    try {
      const result = await AutoAssignmentService.autoAssignOrders();
      
      // Send notifications to assigned riders
      if (result.assigned > 0) {
        try {
          // Get recently assigned orders
          const { data: recentAssignments } = await supabase
            .from('delivery_assignments')
            .select(`
              rider_id,
              order_id,
              rider:riders(user_id)
            `)
            .not('rider_id', 'is', null)
            .gte('assigned_at', new Date(Date.now() - 60000).toISOString()); // Last minute

          if (recentAssignments && recentAssignments.length > 0) {
            const { notificationService } = await import('./api');
            
            for (const assignment of recentAssignments) {
              if (assignment.rider?.user_id) {
                await notificationService.sendNotification({
                  userId: assignment.rider.user_id,
                  title: 'New Order Available',
                  message: 'A new delivery order has been assigned to you.',
                  type: 'assignment',
                  relatedId: assignment.order_id,
                });
              }
            }
          }
        } catch (notificationError) {
          console.warn('Failed to send auto-assignment notifications:', notificationError);
        }
      }

      return result;
    } catch (error: any) {
      console.error('Error triggering auto-assignment:', error);
      return { assigned: 0, failed: 0, errors: [error.message] };
    }
  }

  // Update assignment configuration
  static async updateAssignmentConfig(config: {
    maxOrdersPerRider?: number;
    assignmentRadius?: number;
    priorityWeight?: {
      distance?: number;
      riderAvailability?: number;
      orderUrgency?: number;
    };
  }): Promise<boolean> {
    try {
      AutoAssignmentService.setConfig(config);
      
      // Store configuration in database (optional)
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key: 'assignment_config',
          value: config,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.warn('Failed to store assignment config:', error);
      }

      return true;
    } catch (error) {
      console.error('Error updating assignment config:', error);
      return false;
    }
  }

  // Get assignment configuration
  static async getAssignmentConfig(): Promise<any> {
    try {
      const { data: config } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'assignment_config')
        .single();

      return config?.value || AutoAssignmentService.getConfig();
    } catch (error) {
      console.error('Error getting assignment config:', error);
      return AutoAssignmentService.getConfig();
    }
  }

  // Get assignment history
  static async getAssignmentHistory(limit: number = 50): Promise<any[]> {
    try {
      const { data: history, error } = await supabase
        .from('delivery_assignments')
        .select(`
          *,
          order:orders(order_number, total_amount, status),
          rider:riders(
            profile:profiles!riders_user_id_fkey(full_name)
          )
        `)
        .order('assigned_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return history || [];
    } catch (error) {
      console.error('Error getting assignment history:', error);
      return [];
    }
  }

  // Get rider performance metrics
  static async getRiderPerformanceMetrics(riderId: string, days: number = 30): Promise<{
    totalDeliveries: number;
    averageDeliveryTime: number;
    completionRate: number;
    customerRating: number;
    earnings: number;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get delivery assignments for the period
      const { data: assignments, error } = await supabase
        .from('delivery_assignments')
        .select(`
          *,
          order:orders(total_amount, status)
        `)
        .eq('rider_id', riderId)
        .gte('assigned_at', startDate.toISOString());

      if (error) throw error;

      const deliveries = assignments || [];
      const completedDeliveries = deliveries.filter(d => d.delivered_at);
      
      // Calculate metrics
      const totalDeliveries = deliveries.length;
      const completionRate = totalDeliveries > 0 ? (completedDeliveries.length / totalDeliveries) * 100 : 0;
      
      // Calculate average delivery time
      let averageDeliveryTime = 0;
      const completedWithTimes = completedDeliveries.filter(d => d.picked_up_at && d.delivered_at);
      if (completedWithTimes.length > 0) {
        const totalTime = completedWithTimes.reduce((sum, delivery) => {
          const pickedUp = new Date(delivery.picked_up_at!);
          const delivered = new Date(delivery.delivered_at!);
          return sum + (delivered.getTime() - pickedUp.getTime());
        }, 0);
        averageDeliveryTime = totalTime / completedWithTimes.length / (1000 * 60); // in minutes
      }

      // Calculate earnings (₱50 per delivery)
      const deliveryFee = 50;
      const earnings = completedDeliveries.length * deliveryFee;

      return {
        totalDeliveries,
        averageDeliveryTime,
        completionRate,
        customerRating: 4.5, // Would be calculated from actual ratings
        earnings,
      };
    } catch (error) {
      console.error('Error getting rider performance metrics:', error);
      return {
        totalDeliveries: 0,
        averageDeliveryTime: 0,
        completionRate: 0,
        customerRating: 0,
        earnings: 0,
      };
    }
  }
}
