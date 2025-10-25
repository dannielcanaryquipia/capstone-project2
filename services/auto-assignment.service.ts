import { supabase } from '../lib/supabase';
import { RiderService } from './rider.service';

export interface AssignmentConfig {
  maxOrdersPerRider: number;
  assignmentRadius: number; // in kilometers
  priorityWeight: {
    distance: number;
    riderAvailability: number;
    orderUrgency: number;
  };
}

export class AutoAssignmentService {
  private static config: AssignmentConfig = {
    maxOrdersPerRider: 3,
    assignmentRadius: 10, // 10km radius
    priorityWeight: {
      distance: 0.4,
      riderAvailability: 0.3,
      orderUrgency: 0.3,
    }
  };

  // Set assignment configuration
  static setConfig(config: Partial<AssignmentConfig>) {
    this.config = { ...this.config, ...config };
  }

  // Get current configuration
  static getConfig(): AssignmentConfig {
    return { ...this.config };
  }

  // Main auto-assignment function
  static async autoAssignOrders(): Promise<{
    assigned: number;
    failed: number;
    errors: string[];
  }> {
    try {
      console.log('🚀 Starting auto-assignment process...');
      
      // Get available orders
      const availableOrders = await RiderService.getAvailableOrders();
      
      if (availableOrders.length === 0) {
        console.log('📭 No available orders for assignment');
        return { assigned: 0, failed: 0, errors: [] };
      }

      // Get available riders
      const availableRiders = await this.getAvailableRiders();
      
      if (availableRiders.length === 0) {
        console.log('👥 No available riders for assignment');
        return { assigned: 0, failed: 0, errors: ['No available riders'] };
      }

      console.log(`📦 Found ${availableOrders.length} available orders`);
      console.log(`👥 Found ${availableRiders.length} available riders`);

      let assigned = 0;
      let failed = 0;
      const errors: string[] = [];

      // Process each order
      for (const order of availableOrders) {
        try {
          // Find best rider for this order
          const bestRider = await this.findBestRiderForOrder(order, availableRiders);
          
          if (bestRider) {
            // Check if rider can take more orders
            const riderCurrentOrders = await this.getRiderCurrentOrderCount(bestRider.id);
            
            if (riderCurrentOrders < this.config.maxOrdersPerRider) {
              // Assign order to rider
              await RiderService.acceptOrder(order.id, bestRider.id);
              assigned++;
              console.log(`✅ Assigned order ${order.id} to rider ${bestRider.id}`);
              
              // Update rider's current order count
              bestRider.currentOrders = (bestRider.currentOrders || 0) + 1;
            } else {
              console.log(`⚠️ Rider ${bestRider.id} has reached max orders (${this.config.maxOrdersPerRider})`);
            }
          } else {
            console.log(`❌ No suitable rider found for order ${order.id}`);
            failed++;
          }
        } catch (error: any) {
          console.error(`❌ Error assigning order ${order.id}:`, error);
          errors.push(`Order ${order.id}: ${error.message}`);
          failed++;
        }
      }

      console.log(`🎯 Auto-assignment completed: ${assigned} assigned, ${failed} failed`);
      
      return { assigned, failed, errors };
    } catch (error: any) {
      console.error('❌ Auto-assignment failed:', error);
      return { assigned: 0, failed: 0, errors: [error.message] };
    }
  }

  // Get available riders with their current workload
  private static async getAvailableRiders(): Promise<any[]> {
    try {
      const { data: riders, error } = await supabase
        .from('riders')
        .select(`
          id,
          user_id,
          is_available,
          current_location,
          profile:profiles!riders_user_id_fkey(full_name, phone_number)
        `)
        .eq('is_available', true);

      if (error) throw error;

      // Get current order counts for each rider
      const ridersWithCounts = await Promise.all(
        (riders || []).map(async (rider) => {
          const currentOrders = await this.getRiderCurrentOrderCount(rider.id);
          return {
            ...rider,
            currentOrders,
            canTakeMore: currentOrders < this.config.maxOrdersPerRider
          };
        })
      );

      return ridersWithCounts.filter(rider => rider.canTakeMore);
    } catch (error) {
      console.error('Error fetching available riders:', error);
      return [];
    }
  }

  // Get current order count for a rider
  private static async getRiderCurrentOrderCount(riderId: string): Promise<number> {
    try {
      const { data: assignments, error } = await supabase
        .from('delivery_assignments')
        .select('id')
        .eq('rider_id', riderId)
        .is('delivered_at', null); // Only count undelivered orders

      if (error) throw error;
      return assignments?.length || 0;
    } catch (error) {
      console.error('Error getting rider order count:', error);
      return 0;
    }
  }

  // Find the best rider for a specific order
  private static async findBestRiderForOrder(order: any, availableRiders: any[]): Promise<any | null> {
    if (availableRiders.length === 0) return null;

    // Calculate scores for each rider
    const riderScores = await Promise.all(
      availableRiders.map(async (rider) => {
        const score = await this.calculateRiderScore(order, rider);
        return { rider, score };
      })
    );

    // Sort by score (highest first)
    riderScores.sort((a, b) => b.score - a.score);

    // Return the best rider
    return riderScores[0]?.rider || null;
  }

  // Calculate score for a rider-order combination
  private static async calculateRiderScore(order: any, rider: any): Promise<number> {
    let score = 0;

    // Distance score (closer is better)
    const distanceScore = await this.calculateDistanceScore(order, rider);
    score += distanceScore * this.config.priorityWeight.distance;

    // Rider availability score (less busy is better)
    const availabilityScore = this.calculateAvailabilityScore(rider);
    score += availabilityScore * this.config.priorityWeight.riderAvailability;

    // Order urgency score (newer orders are more urgent)
    const urgencyScore = this.calculateUrgencyScore(order);
    score += urgencyScore * this.config.priorityWeight.orderUrgency;

    return score;
  }

  // Calculate distance-based score
  private static async calculateDistanceScore(order: any, rider: any): Promise<number> {
    try {
      // For now, use a simple random score since we don't have actual location data
      // In a real implementation, you would use geolocation services
      const orderLocation = order.delivery_address?.coordinates || { lat: 0, lng: 0 };
      const riderLocation = rider.current_location || { lat: 0, lng: 0 };

      // Calculate distance (simplified)
      const distance = this.calculateDistance(
        orderLocation.lat, orderLocation.lng,
        riderLocation.lat, riderLocation.lng
      );

      // Score decreases with distance (closer = higher score)
      const maxDistance = this.config.assignmentRadius;
      const normalizedDistance = Math.min(distance / maxDistance, 1);
      return 1 - normalizedDistance; // Closer = higher score
    } catch (error) {
      console.error('Error calculating distance score:', error);
      return 0.5; // Default neutral score
    }
  }

  // Calculate availability-based score
  private static calculateAvailabilityScore(rider: any): number {
    const currentOrders = rider.currentOrders || 0;
    const maxOrders = this.config.maxOrdersPerRider;
    
    // Score decreases as rider gets busier
    return 1 - (currentOrders / maxOrders);
  }

  // Calculate urgency-based score
  private static calculateUrgencyScore(order: any): number {
    const orderAge = Date.now() - new Date(order.created_at).getTime();
    const maxAge = 30 * 60 * 1000; // 30 minutes in milliseconds
    
    // Score decreases as order gets older
    const normalizedAge = Math.min(orderAge / maxAge, 1);
    return 1 - normalizedAge;
  }

  // Calculate distance between two points (Haversine formula)
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // Manual assignment for specific order and rider
  static async manualAssign(orderId: string, riderId: string): Promise<boolean> {
    try {
      await RiderService.acceptOrder(orderId, riderId);
      console.log(`✅ Manually assigned order ${orderId} to rider ${riderId}`);
      return true;
    } catch (error: any) {
      console.error(`❌ Manual assignment failed:`, error);
      return false;
    }
  }

  // Reassign order to different rider
  static async reassignOrder(orderId: string, newRiderId: string): Promise<boolean> {
    try {
      // First, remove current assignment
      const { error: removeError } = await supabase
        .from('delivery_assignments')
        .update({ rider_id: null })
        .eq('order_id', orderId);

      if (removeError) throw removeError;

      // Then assign to new rider
      await RiderService.acceptOrder(orderId, newRiderId);
      console.log(`✅ Reassigned order ${orderId} to rider ${newRiderId}`);
      return true;
    } catch (error: any) {
      console.error(`❌ Reassignment failed:`, error);
      return false;
    }
  }

  // Get assignment statistics
  static async getAssignmentStats(): Promise<{
    totalOrders: number;
    assignedOrders: number;
    unassignedOrders: number;
    availableRiders: number;
    busyRiders: number;
  }> {
    try {
      // Get total orders
      const { data: totalOrders } = await supabase
        .from('orders')
        .select('id')
        .in('status', ['ready_for_pickup', 'preparing', 'out_for_delivery']);

      // Get assigned orders
      const { data: assignedOrders } = await supabase
        .from('delivery_assignments')
        .select('id')
        .not('rider_id', 'is', null);

      // Get available riders
      const { data: availableRiders } = await supabase
        .from('riders')
        .select('id, is_available')
        .eq('is_available', true);

      // Get busy riders (with active assignments)
      const { data: busyRiders } = await supabase
        .from('delivery_assignments')
        .select('rider_id')
        .not('rider_id', 'is', null)
        .is('delivered_at', null);

      const uniqueBusyRiders = new Set(busyRiders?.map(a => a.rider_id) || []);

      return {
        totalOrders: totalOrders?.length || 0,
        assignedOrders: assignedOrders?.length || 0,
        unassignedOrders: (totalOrders?.length || 0) - (assignedOrders?.length || 0),
        availableRiders: availableRiders?.length || 0,
        busyRiders: uniqueBusyRiders.size,
      };
    } catch (error) {
      console.error('Error getting assignment stats:', error);
      return {
        totalOrders: 0,
        assignedOrders: 0,
        unassignedOrders: 0,
        availableRiders: 0,
        busyRiders: 0,
      };
    }
  }

  // Trigger auto-assignment when admin updates order status
  static async onOrderStatusUpdate(orderId: string, newStatus: string): Promise<void> {
    try {
      // Only auto-assign when order becomes ready for pickup
      if (newStatus === 'ready_for_pickup') {
        console.log(`🔄 Order ${orderId} is ready for pickup, triggering auto-assignment...`);
        
        // Small delay to ensure order is properly updated
        setTimeout(async () => {
          const result = await this.autoAssignOrders();
          console.log(`🎯 Auto-assignment result:`, result);
        }, 1000);
      }
    } catch (error) {
      console.error('Error in order status update handler:', error);
    }
  }
}
