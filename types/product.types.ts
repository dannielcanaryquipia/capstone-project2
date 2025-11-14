// Product Management Types for Kitchen One App

export interface Product {
  id: string;
  name: string;
  description: string;
  base_price: number;
  price?: number; // For backward compatibility, will be set to base_price
  category_id: string;
  image_url?: string;
  gallery_image_urls?: string[];
  is_available: boolean;
  is_recommended: boolean;
  is_featured?: boolean;
  preparation_time_minutes?: number; // in minutes
  allergens?: string[];
  nutritional_info?: any;
  created_at: string;
  updated_at: string;
  
  // Relations
  category?: ProductCategory;
  pizza_options?: PizzaOption[];
  stock?: ProductStock;
  variants?: ProductVariant[];
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  sort_order?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductStock {
  id: string;
  product_id: string;
  quantity: number;
  low_stock_threshold?: number;
  last_updated?: string;
  last_updated_at?: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  price_modifier: number; // Additional cost for this variant
  is_available: boolean;
  sort_order?: number;
}

export interface ProductFilters {
  category_id?: string;
  is_available?: boolean;
  is_recommended?: boolean;
  search?: string;
  price_min?: number;
  price_max?: number;
  sort_by?: 'name' | 'price' | 'created_at' | 'popularity';
  sort_order?: 'asc' | 'desc';
}

export interface ProductStats {
  total_products: number;
  available_products: number;
  unavailable_products: number;
  recommended_products: number;
  total_categories: number;
  low_stock_products: number;
  average_price: number;
  new_products_this_month: number;
}

// Pizza specific types
export interface PizzaOption {
  id: string;
  product_id: string;
  size: string;
  price: number;
  crust_id: string;
  crust?: {
    id: string;
    name: string;
  };
  toppings?: {
    id: string;
    name: string;
  }[];
}

export interface PizzaCrust {
  id: string;
  name: string;
}

export interface PizzaTopping {
  id: string;
  name: string;
}

export interface PizzaToppingOption {
  id: string;
  pizza_option_id: string;
  topping_id: string;
  is_available: boolean;
  max_quantity?: number;
}

// Admin specific types
export interface AdminProductManagement {
  products: Product[];
  categories: ProductCategory[];
  stats: ProductStats;
  filters: ProductFilters;
  loading: boolean;
  error?: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url?: string;
  is_available: boolean;
  is_recommended: boolean;
  preparation_time?: number;
  calories?: number;
  allergens?: string[];
  ingredients?: string[];
  stock_quantity?: number;
  low_stock_threshold?: number;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  image_url?: string;
  sort_order?: number;
  is_active: boolean;
}

// Analytics types
export interface ProductAnalytics {
  product_id: string;
  product_name: string;
  total_orders: number;
  total_revenue: number;
  average_rating: number;
  popularity_score: number;
  trend_direction: 'up' | 'down' | 'stable';
}

export interface CategoryAnalytics {
  category_id: string;
  category_name: string;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
}

// Inventory management types
export interface InventoryAlert {
  id: string;
  product_id: string;
  product_name: string;
  current_stock: number;
  threshold: number;
  alert_type: 'low_stock' | 'out_of_stock' | 'overstock';
  created_at: string;
  is_resolved: boolean;
}

export interface StockMovement {
  id: string;
  product_id: string;
  movement_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  reference?: string; // Order ID, adjustment ID, etc.
  created_by: string;
  created_at: string;
}
