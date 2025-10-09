import { Notification } from '../lib/database.types';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';

type MenuItem = Database['public']['Tables']['menu_items']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];
type Address = Database['public']['Tables']['addresses']['Row'];
type Review = Database['public']['Tables']['reviews']['Row'];
type PromoCode = Database['public']['Tables']['promo_codes']['Row'];
// Define CartItem type since cart_items table might not exist in the database yet
type CartItem = {
  id: string;
  user_id: string;
  menu_item_id: string;
  quantity: number;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
};
type PaymentMethod = 'cod' | 'credit_card' | 'gcash' | 'paypal';
type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered' | 'cancelled';

// Extend the types with any additional fields if needed
interface ExtendedMenuItem extends MenuItem {
  // Add any additional fields here
}

interface ExtendedOrder extends Order {
  items?: OrderItem[];
}

interface ExtendedCartItem extends CartItem {
  menu_item?: MenuItem;
}

// Menu Service
export const menuService = {
  // Get all categories with their menu items
  getCategories: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Get all menu items, optionally filtered by category
  getMenuItems: async (categoryId?: string): Promise<MenuItem[]> => {
    let query = supabase
      .from('menu_items')
      .select('*')
      .eq('is_available', true);
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    const { data, error } = await query.order('name');
    
    if (error) throw error;
    return data || [];
  },

  // Get featured menu items
  getFeaturedItems: async (limit = 10): Promise<MenuItem[]> => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_available', true)
      .eq('is_featured', true)
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  // Get menu item by ID
  getMenuItem: async (id: string): Promise<MenuItem | null> => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  },
};

// Order Service
export const orderService = {
  // Create a new order
  createOrder: async (orderData: {
    userId: string;
    items: Array<{
      menuItemId: string;
      quantity: number;
      specialInstructions?: string;
    }>;
    deliveryAddress: Address;
    paymentMethod: PaymentMethod;
    specialInstructions?: string;
  }): Promise<Order> => {
    // In a real app, we would calculate totals, apply discounts, etc.
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: orderData.userId,
        status: 'pending',
        total_amount: 0, // Calculate this based on items
        delivery_fee: 0, // Calculate based on distance
        tax_amount: 0, // Calculate based on location
        payment_method: orderData.paymentMethod,
        payment_status: orderData.paymentMethod === 'cod' ? 'pending' : 'completed',
        delivery_address: orderData.deliveryAddress,
        special_instructions: orderData.specialInstructions,
      })
      .select()
      .single();

    if (error) throw error;
    return order;
  },

  // Get user's order history
  getOrderHistory: async (userId: string): Promise<Order[]> => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get order details by ID
  getOrderDetails: async (orderId: string): Promise<{ order: Order; items: OrderItem[] } | null> => {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (orderError) throw orderError;
    if (!order) return null;

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
    
    if (itemsError) throw itemsError;
    
    return { order, items: items || [] };
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<Order> => {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

// Cart Service
export const cartService = {
  // Get user's cart
  getCart: async (userId: string): Promise<CartItem[]> => {
    const { data, error } = await supabase
      .from('carts')
      .select('items')
      .eq('user_id', userId)
      .single();
    
    if (error) return [];
    return data?.items || [];
  },

  // Update user's cart
  updateCart: async (userId: string, items: CartItem[]): Promise<CartItem[]> => {
    const { data, error } = await supabase
      .from('carts')
      .upsert({
        user_id: userId,
        items,
        updated_at: new Date().toISOString(),
      })
      .select('items')
      .single();
    
    if (error) throw error;
    return data?.items || [];
  },

  // Clear user's cart
  clearCart: async (userId: string): Promise<void> => {
    await supabase
      .from('carts')
      .delete()
      .eq('user_id', userId);
  },
};

// User Service
export const userService = {
  // Get user profile
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update user profile
  updateProfile: async (userId: string, updates: {
    fullName?: string;
    phoneNumber?: string;
    avatarUrl?: string;
  }) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: updates.fullName,
        phone_number: updates.phoneNumber,
        avatar_url: updates.avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get user addresses
  getAddresses: async (userId: string): Promise<Address[]> => {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Add a new address
  addAddress: async (address: Omit<Address, 'id' | 'created_at' | 'updated_at'>): Promise<Address> => {
    const { data, error } = await supabase
      .from('addresses')
      .insert(address)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update an existing address
  updateAddress: async (addressId: string, updates: Partial<Address>): Promise<Address> => {
    const { data, error } = await supabase
      .from('addresses')
      .update(updates)
      .eq('id', addressId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete an address
  deleteAddress: async (addressId: string): Promise<void> => {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId);
    
    if (error) throw error;
  },
};

// Review Service
export const reviewService = {
  // Add a review for an order
  addReview: async (review: {
    orderId: string;
    userId: string;
    rating: number;
    comment?: string;
  }): Promise<Review> => {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        order_id: review.orderId,
        user_id: review.userId,
        rating: review.rating,
        comment: review.comment,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get reviews for a menu item
  getMenuItemReviews: async (menuItemId: string): Promise<Review[]> => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles!reviews_user_id_fkey(full_name, avatar_url)')
      .eq('menu_item_id', menuItemId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
};

// Promo Code Service
export const promoCodeService = {
  // Validate a promo code
  validatePromoCode: async (code: string, userId: string): Promise<{
    isValid: boolean;
    message?: string;
    promoCode?: PromoCode;
  }> => {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();
    
    if (error || !data) {
      return { 
        isValid: false, 
        message: 'Invalid promo code' 
      };
    }

    const now = new Date();
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);

    if (now < startDate) {
      return { 
        isValid: false, 
        message: 'This promo code is not yet valid' 
      };
    }

    if (now > endDate) {
      return { 
        isValid: false, 
        message: 'This promo code has expired' 
      };
    }

    if (data.max_uses && data.current_uses >= data.max_uses) {
      return { 
        isValid: false, 
        message: 'This promo code has reached its maximum usage limit' 
      };
    }

    // In a real app, you might want to check if the user has already used this code
    // and implement per-user usage limits

    return { 
      isValid: true, 
      promoCode: data 
    };
  },

  // Apply a promo code to an order
  applyPromoCode: async (code: string, orderAmount: number): Promise<{
    success: boolean;
    message?: string;
    discountAmount?: number;
    finalAmount?: number;
  }> => {
    const { isValid, message, promoCode } = await promoCodeService.validatePromoCode(code, '');
    
    if (!isValid || !promoCode) {
      return { 
        success: false, 
        message: message || 'Invalid promo code' 
      };
    }

    // Check minimum order amount
    if (promoCode.min_order_amount && orderAmount < promoCode.min_order_amount) {
      return { 
        success: false, 
        message: `Minimum order amount of $${promoCode.min_order_amount} required` 
      };
    }

    // Calculate discount
    let discountAmount = 0;
    
    if (promoCode.discount_type === 'percentage') {
      discountAmount = orderAmount * (promoCode.discount_value / 100);
      
      // Apply maximum discount if set
      if (promoCode.max_discount && discountAmount > promoCode.max_discount) {
        discountAmount = promoCode.max_discount;
      }
    } else {
      // Fixed amount discount
      discountAmount = promoCode.discount_value;
    }
    
    const finalAmount = Math.max(0, orderAmount - discountAmount);
    
    return {
      success: true,
      discountAmount,
      finalAmount,
    };
  },
};

// Notification Service
export const notificationService = {
  // Get user notifications
  getNotifications: async (userId: string, limit = 20): Promise<Notification[]> => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  // Get unread notifications count
  getUnreadCount: async (userId: string): Promise<number> => {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    
    if (error) throw error;
    return count || 0;
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<void> => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true } as never)
      .eq('id', notificationId);
    
    if (error) throw error;
  },

  // Mark all notifications as read
  markAllAsRead: async (userId: string): Promise<void> => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true } as never)
      .eq('user_id', userId)
      .eq('is_read', false);
    
    if (error) throw error;
  },

  // Send a notification
  sendNotification: async (notification: {
    userId: string;
    title: string;
    message: string;
    type: 'order_update' | 'payment' | 'delivery' | 'system';
    relatedId?: string;
  }): Promise<Notification> => {
    const notificationData = {
      user_id: notification.userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      related_order_id: notification.relatedId || null,
      is_read: false,
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationData as never)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to create notification');
    return data as Notification;
  },

  // Send notification to multiple users
  sendBulkNotification: async (userIds: string[], notification: {
    title: string;
    message: string;
    type: 'order_update' | 'payment' | 'delivery' | 'system';
    relatedId?: string;
  }): Promise<void> => {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      related_order_id: notification.relatedId || null,
      is_read: false,
    }));

    const { error } = await supabase
      .from('notifications')
      .insert(notifications as never[]);
    
    if (error) throw error;
  },

  // Delete notification
  deleteNotification: async (notificationId: string): Promise<void> => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
    
    if (error) throw error;
  },

  // Clear old notifications (older than 30 days)
  clearOldNotifications: async (userId: string): Promise<void> => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .lt('created_at', thirtyDaysAgo.toISOString());
    
    if (error) throw error;
  },
};
