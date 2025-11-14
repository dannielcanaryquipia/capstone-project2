// Order Management Types based on Kitchen One App patterns

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready_for_pickup' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'cancelled';

export type PaymentStatus = 
  | 'pending' 
  | 'verified' 
  | 'failed' 
  | 'refunded';

export type PaymentMethod =
  | 'cod'
  | 'gcash'
  | 'credit_card'
  | 'paypal';

export type FulfillmentType = 'delivery' | 'pickup';

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
  // Pizza specific options
  pizza_size?: string;
  pizza_crust?: string;
  pizza_slice?: string;
  toppings?: string[];
  // Customization details (JSON stored in database)
  customization_details?: any;
  // Product relationship
  product?: {
    name: string;
    image_url: string;
  };
}

export interface DeliveryAddress {
  id: string;
  user_id: string;
  label: string; // Home, Office, etc.
  full_address: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  is_default: boolean;
  contact_phone?: string;
  special_instructions?: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: OrderStatus;
  fulfillment_type: FulfillmentType;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  
  // Order details
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  
  // Delivery information
  delivery_address: DeliveryAddress | null;
  delivery_instructions?: string;
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
  pickup_ready_at?: string;
  picked_up_at?: string;
  pickup_verified_at?: string;
  pickup_verified_by?: string;
  pickup_location_snapshot?: string;
  pickup_notes?: string;

  // Related user (admin queries may join profiles)
  user?: {
    full_name?: string;
    phone_number?: string;
  };
  
  // Assignment
  assigned_delivery_id?: string;
  delivery_person_name?: string;
  delivery_person_phone?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  prepared_at?: string;
  picked_up_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  
  // Additional info
  notes?: string;
  cancellation_reason?: string;
  rating?: number;
  review?: string;
}

export interface OrderTracking {
  order_id: string;
  status: OrderStatus;
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
  updated_by: string; // user_id or 'system'
}

export interface OrderFilters {
  status?: OrderStatus[];
  payment_status?: PaymentStatus[];
  date_from?: string;
  date_to?: string;
  search?: string;
  assigned_delivery_id?: string;
}

export interface OrderStats {
  total_orders: number;
  pending_orders: number;
  preparing_orders: number;
  ready_for_pickup_orders: number;
  out_for_delivery: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_income: number;
  cancelled_income: number;
  average_order_value: number;
  completion_rate: number;
}

// Admin specific types
export interface AdminOrderManagement {
  orders: Order[];
  stats: OrderStats;
  filters: OrderFilters;
  loading: boolean;
  error?: string;
}

// Delivery specific types
export interface DeliveryOrder {
  order: Order;
  distance: number; // in km
  estimated_time: number; // in minutes
  customer_phone: string;
  customer_name: string;
  priority: 'low' | 'medium' | 'high';
}

export interface DeliveryStats {
  total_deliveries: number;
  completed_deliveries: number;
  pending_deliveries: number;
  total_earnings: number;
  average_delivery_time: number; // in minutes
  rating: number;
}

// Real-time update types
export interface OrderUpdate {
  order_id: string;
  status: OrderStatus;
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  message?: string;
}

// Notification types
export interface OrderNotification {
  id: string;
  order_id: string;
  user_id: string;
  type: 'status_update' | 'delivery_assigned' | 'payment_required' | 'order_ready';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
}
