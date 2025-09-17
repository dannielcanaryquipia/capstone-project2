// Base User Type
export interface User {
  id: string;
  email?: string;
  created_at: string;
  updated_at?: string;
}

// User Profile Type
export interface Profile {
  id: string;
  username: string;
  full_name?: string;
  phone_number?: string;
  role: 'customer' | 'admin' | 'delivery_staff';
  avatar_url?: string;
  created_at: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  last_login?: string;
  preferences?: any;
}

// Category Type
export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  products?: Product[];
  product_count?: number;
}

// Product Type
export interface Product {
  id: string;
  name: string;
  description?: string;
  category_id?: string;
  base_price: number;
  image_url?: string;
  gallery_image_urls?: string[];
  is_available: boolean;
  is_recommended: boolean;
  created_at: string;
  updated_at: string;
  preparation_time_minutes?: number;
  is_featured?: boolean;
  allergens?: string[];
  nutritional_info?: any;
  category?: Category;
  stock?: ProductStock;
  pizza_options?: PizzaOptionWithCrust[];
}

// Product Stock Type
export interface ProductStock {
  id: string;
  product_id: string;
  quantity: number;
  last_updated_at: string;
  product?: Product;
}

// Crust Type
export interface Crust {
  id: string;
  name: string;
}

// Pizza Option Type
export interface PizzaOption {
  id: string;
  product_id?: string;
  size: string;
  price: number;
  crust_id: string;
  crust?: Crust;
}

// Address Type
export interface Address {
  id: string;
  user_id: string;
  label?: string;
  full_address: string;
  is_default: boolean;
  created_at: string;
}

// Order Status Type
export type OrderStatus = 'Pending' | 'Preparing' | 'Ready for Pickup' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

// Payment Status Type
export type PaymentStatus = 'Pending' | 'Verified' | 'Paid' | 'Failed' | 'Refunded';

// Delivery Status Type
export type DeliveryStatus = 'Assigned' | 'Picked Up' | 'In Transit' | 'Delivered' | 'Failed';

// User Role Type
export type UserRole = 'customer' | 'admin' | 'delivery_staff';

// Payment Method Type
export type PaymentMethod = 'COD' | 'GCash' | 'card';

// Order Type
export interface Order {
  id: string;
  user_id: string;
  delivery_address_id: string;
  total_amount: number;
  status: OrderStatus;
  payment_method?: string;
  payment_status: PaymentStatus;
  order_notes?: string;
  created_at: string;
  updated_at: string;
  proof_of_payment_url?: string;
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
  customer_notes?: string;
  admin_notes?: string;
  delivery_address?: Address;
  user?: Profile;
  order_items?: OrderItem[];
  delivery_assignment?: DeliveryAssignment;
  payment_transactions?: PaymentTransaction[];
}

// Order Item Type
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  pizza_option_id?: string;
  quantity: number;
  unit_price: number;
  customization_details?: any;
  selected_size?: string;
  created_at: string;
  product?: Product;
  pizza_option?: PizzaOptionWithCrust;
}

// Extended Types with Relations
export interface ProductWithCategory extends Product {
  category?: Category;
  stock?: ProductStock;
  pizza_options?: PizzaOptionWithCrust[];
}

export interface PizzaOptionWithCrust extends PizzaOption {
  crust?: Crust;
}

export interface OrderWithDetails extends Order {
  user?: Profile;
  delivery_address?: Address;
  order_items?: OrderItemWithProduct[];
}

export interface OrderItemWithProduct extends OrderItem {
  product?: Product;
  pizza_option?: PizzaOptionWithCrust;
}

export interface CategoryWithProducts extends Category {
  products?: Product[];
  product_count?: number;
}

// Cart and UI Types
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  unit_price: number;
  customization?: {
    size?: string;
    crust?: string;
    pizza_option_id?: string;
  };
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
}

// Form Types
export interface SignUpForm {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  username: string;
  phoneNumber?: string;
}

export interface SignInForm {
  email: string;
  password: string;
}

export interface ProductForm {
  name: string;
  description?: string;
  category_id?: string;
  base_price: number;
  image_url?: string;
  gallery_image_urls?: string[];
  is_available: boolean;
  is_recommended: boolean;
}

export interface AddressForm {
  label?: string;
  full_address: string;
  is_default: boolean;
}

export interface CheckoutForm {
  delivery_address_id: string;
  payment_method: PaymentMethod;
  order_notes?: string;
  proof_of_payment_url?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Filter and Search Types
export interface ProductFilters {
  category_id?: string;
  min_price?: number;
  max_price?: number;
  is_available?: boolean;
  is_recommended?: boolean;
  search?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  date_from?: string;
  date_to?: string;
  user_id?: string;
}

// Report Types
export interface SalesReport {
  total_sales: number;
  total_orders: number;
  average_order_value: number;
  top_products: Array<{
    product_id: string;
    product_name: string;
    quantity_sold: number;
    revenue: number;
  }>;
  sales_by_date: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
}

export interface InventoryReport {
  total_products: number;
  low_stock_products: number;
  out_of_stock_products: number;
  products: Array<{
    product_id: string;
    product_name: string;
    current_stock: number;
    last_updated: string;
  }>;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order_update' | 'payment' | 'delivery' | 'system';
  is_read: boolean;
  related_order_id?: string;
  created_at: string;
  related_order?: Order;
}

// Saved Products Types
export interface SavedProduct {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

// AI Recommendation Types
export interface Recommendation {
  product_id: string;
  product: Product;
  reason: 'frequent_order' | 'popular_item' | 'similar_taste' | 'trending';
  score: number;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Navigation Types
export type RootStackParamList = {
  '(auth)': undefined;
  '(customer)': undefined;
  '(admin)': undefined;
  '(delivery)': undefined;
};

export type AuthStackParamList = {
  'sign-in': undefined;
  'sign-up': undefined;
  'forgot-password': undefined;
  'verify-email': undefined;
};

export type CustomerStackParamList = {
  'index': undefined;
  'menu/[category]': { category: string };
  'product/[id]': { id: string };
  'cart': undefined;
  'checkout': undefined;
  'orders/index': undefined;
  'orders/[id]': { id: string };
  'profile/index': undefined;
  'profile/addresses': undefined;
  'profile/edit': undefined;
  'recommended': undefined;
};

export type AdminStackParamList = {
  'index': undefined;
  'orders/index': undefined;
  'orders/[id]': { id: string };
  'products/index': undefined;
  'products/add': undefined;
  'products/[id]': { id: string };
  'categories/index': undefined;
  'categories/[id]': { id: string };
  'inventory': undefined;
  'users/index': undefined;
  'users/[id]': { id: string };
  'reports': undefined;
};

export type DeliveryStackParamList = {
  'index': undefined;
  'order/[id]': { id: string };
};

// Payment related types
export interface PaymentTransaction {
  id: string;
  order_id: string;
  amount: number;
  payment_method: string;
  status: PaymentStatus;
  transaction_reference?: string;
  proof_of_payment_url?: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
  verified_by_user?: Profile;
}

// Delivery related types
export interface Rider {
  id: string;
  user_id: string;
  vehicle_number?: string;
  is_available: boolean;
  current_location?: { lat: number; lng: number };
  created_at: string;
  updated_at: string;
  user?: Profile;
}

export interface DeliveryAssignment {
  id: string;
  order_id: string;
  rider_id?: string;
  assigned_at: string;
  picked_up_at?: string;
  delivered_at?: string;
  status: DeliveryStatus;
  notes?: string;
  rider?: Rider;
  order?: Order;
}

// Inventory related types
export interface InventoryTransaction {
  id: string;
  product_id: string;
  transaction_type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason?: string;
  performed_by: string;
  created_at: string;
  product?: Product;
  performed_by_user?: Profile;
}

// Order notes types
export interface OrderNote {
  id: string;
  order_id: string;
  note: string;
  added_by: string;
  note_type: 'status_update' | 'payment_note' | 'delivery_note' | 'customer_note' | 'general';
  created_at: string;
  added_by_user?: Profile;
}

// Cart types
export interface OrderForm {
  delivery_address_id: string;
  payment_method: 'COD' | 'COP' | 'Online';
  customer_notes?: string;
}

export interface PaymentForm {
  payment_method: 'COD' | 'COP' | 'Online';
  proof_of_payment_url?: string;
}

// Admin types
export interface AdminDashboard {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  lowStockProducts: ProductStock[];
  recentOrders: Order[];
}

// Rider types
export interface RiderDashboard {
  assignedDeliveries: DeliveryAssignment[];
  completedDeliveries: DeliveryAssignment[];
  totalDeliveries: number;
  totalEarnings: number;
}

// Database Tables
export type Tables = {
  users: User;
  profiles: Profile;
  categories: Category;
  products: Product;
  product_stock: ProductStock;
  crusts: Crust;
  pizza_options: PizzaOption;
  addresses: Address;
  orders: Order;
  order_items: OrderItem;
  payment_transactions: PaymentTransaction;
  riders: Rider;
  delivery_assignments: DeliveryAssignment;
  inventory_transactions: InventoryTransaction;
  order_notes: OrderNote;
  saved_products: SavedProduct;
  notifications: Notification;
};

export type TableName = keyof Tables;
