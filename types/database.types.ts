export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered' | 'cancelled'
type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'
type PaymentMethod = 'cod' | 'gcash' | 'card'
type UserRole = 'customer' | 'admin' | 'delivery'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone_number: string | null
          avatar_url: string | null
          role: UserRole
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone_number?: string | null
          avatar_url?: string | null
          role?: UserRole
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone_number?: string | null
          avatar_url?: string | null
          role?: UserRole
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      delivery_profiles: {
        Row: {
          id: string
          vehicle_type: string | null
          vehicle_number: string | null
          current_location: unknown | null
          is_available: boolean
          total_deliveries: number
          rating: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          vehicle_type?: string | null
          vehicle_number?: string | null
          current_location?: unknown | null
          is_available?: boolean
          total_deliveries?: number
          rating?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicle_type?: string | null
          vehicle_number?: string | null
          current_location?: unknown | null
          is_available?: boolean
          total_deliveries?: number
          rating?: number
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          image_url: string | null
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          image_url?: string | null
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          category_id: string
          is_available: boolean
          is_featured: boolean
          preparation_time: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          category_id: string
          is_available?: boolean
          is_featured?: boolean
          preparation_time: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          category_id?: string
          is_available?: boolean
          is_featured?: boolean
          preparation_time?: number
          created_at?: string
          updated_at?: string
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          label: string
          full_address: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label: string
          full_address: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          label?: string
          full_address?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          order_number: string | null
          status: OrderStatus
          total_amount: number
          delivery_fee: number
          tax_amount: number
          payment_status: PaymentStatus
          payment_method: PaymentMethod
          payment_reference: string | null
          payment_verified: boolean
          payment_verified_at: string | null
          payment_verified_by: string | null
          delivery_address: Json
          special_instructions: string | null
          customer_notes: string | null
          admin_notes: string | null
          delivery_staff_id: string | null
          estimated_delivery_time: string | null
          actual_delivery_time: string | null
          delivered_at: string | null
          proof_of_delivery_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_number?: string | null
          status?: OrderStatus
          total_amount: number
          delivery_fee?: number
          tax_amount?: number
          payment_status?: PaymentStatus
          payment_method: PaymentMethod
          payment_reference?: string | null
          payment_verified?: boolean
          payment_verified_at?: string | null
          payment_verified_by?: string | null
          delivery_address: Json
          special_instructions?: string | null
          customer_notes?: string | null
          admin_notes?: string | null
          delivery_staff_id?: string | null
          estimated_delivery_time?: string | null
          actual_delivery_time?: string | null
          delivered_at?: string | null
          proof_of_delivery_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          order_number?: string | null
          status?: OrderStatus
          total_amount?: number
          delivery_fee?: number
          tax_amount?: number
          payment_status?: PaymentStatus
          payment_method?: PaymentMethod
          payment_reference?: string | null
          payment_verified?: boolean
          payment_verified_at?: string | null
          payment_verified_by?: string | null
          delivery_address?: Json
          special_instructions?: string | null
          customer_notes?: string | null
          admin_notes?: string | null
          delivery_staff_id?: string | null
          estimated_delivery_time?: string | null
          actual_delivery_time?: string | null
          delivered_at?: string | null
          proof_of_delivery_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          pizza_option_id: string | null
          quantity: number
          unit_price: number
          customization_details: Json | null
          selected_size: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          pizza_option_id?: string | null
          quantity: number
          unit_price: number
          customization_details?: Json | null
          selected_size?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          pizza_option_id?: string | null
          quantity?: number
          unit_price?: number
          customization_details?: Json | null
          selected_size?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      carts: {
        Row: {
          id: string
          user_id: string
          items: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          items?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          items?: Json
          created_at?: string
          updated_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          menu_item_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          menu_item_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          menu_item_id?: string
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          order_id: string
          user_id: string
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          user_id: string
          rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          user_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      promo_codes: {
        Row: {
          id: string
          code: string
          description: string | null
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          min_order_amount: number
          max_discount: number | null
          start_date: string
          end_date: string
          max_uses: number | null
          current_uses: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          description?: string | null
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          min_order_amount?: number
          max_discount?: number | null
          start_date: string
          end_date: string
          max_uses?: number | null
          current_uses?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          description?: string | null
          discount_type?: 'percentage' | 'fixed'
          discount_value?: number
          min_order_amount?: number
          max_discount?: number | null
          start_date?: string
          end_date?: string
          max_uses?: number | null
          current_uses?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      saved_products: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      riders: {
        Row: {
          id: string
          user_id: string
          vehicle_number: string | null
          is_available: boolean
          current_location: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vehicle_number?: string | null
          is_available?: boolean
          current_location?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          vehicle_number?: string | null
          is_available?: boolean
          current_location?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      delivery_assignments: {
        Row: {
          id: string
          order_id: string
          rider_id: string | null
          assigned_at: string
          picked_up_at: string | null
          delivered_at: string | null
          status: 'Assigned' | 'Picked Up' | 'Delivered'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          rider_id?: string | null
          assigned_at?: string
          picked_up_at?: string | null
          delivered_at?: string | null
          status?: 'Assigned' | 'Picked Up' | 'Delivered'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          rider_id?: string | null
          assigned_at?: string
          picked_up_at?: string | null
          delivered_at?: string | null
          status?: 'Assigned' | 'Picked Up' | 'Delivered'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          category_id: string | null
          base_price: number
          image_url: string | null
          gallery_image_urls: string[] | null
          is_available: boolean
          is_recommended: boolean
          is_featured: boolean
          preparation_time_minutes: number | null
          allergens: string[] | null
          nutritional_info: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category_id?: string | null
          base_price: number
          image_url?: string | null
          gallery_image_urls?: string[] | null
          is_available?: boolean
          is_recommended?: boolean
          is_featured?: boolean
          preparation_time_minutes?: number | null
          allergens?: string[] | null
          nutritional_info?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category_id?: string | null
          base_price?: number
          image_url?: string | null
          gallery_image_urls?: string[] | null
          is_available?: boolean
          is_recommended?: boolean
          is_featured?: boolean
          preparation_time_minutes?: number | null
          allergens?: string[] | null
          nutritional_info?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      pizza_options: {
        Row: {
          id: string
          product_id: string
          size: string
          price: number
          crust_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          size: string
          price: number
          crust_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          size?: string
          price?: number
          crust_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      crusts: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      payment_transactions: {
        Row: {
          id: string
          order_id: string
          amount: number
          payment_method: string
          status: PaymentStatus
          transaction_reference: string | null
          proof_of_payment_url: string | null
          verified_by: string | null
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          amount: number
          payment_method: string
          status?: PaymentStatus
          transaction_reference?: string | null
          proof_of_payment_url?: string | null
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          amount?: number
          payment_method?: string
          status?: PaymentStatus
          transaction_reference?: string | null
          proof_of_payment_url?: string | null
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'order_update' | 'payment' | 'delivery' | 'system'
          is_read: boolean
          related_order_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: 'order_update' | 'payment' | 'delivery' | 'system'
          is_read?: boolean
          related_order_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'order_update' | 'payment' | 'delivery' | 'system'
          is_read?: boolean
          related_order_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      image_metadata: {
        Row: {
          id: string
          order_id: string
          type: 'payment_proof' | 'delivery_proof'
          url: string
          thumbnail_url: string | null
          uploaded_by: string
          uploaded_at: string
          metadata: Json
          verified: boolean
          verified_by: string | null
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          type: 'payment_proof' | 'delivery_proof'
          url: string
          thumbnail_url?: string | null
          uploaded_by: string
          uploaded_at?: string
          metadata: Json
          verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          type?: 'payment_proof' | 'delivery_proof'
          url?: string
          thumbnail_url?: string | null
          uploaded_by?: string
          uploaded_at?: string
          metadata?: Json
          verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      order_status: OrderStatus
      payment_status: PaymentStatus
      payment_method: PaymentMethod
      user_role: UserRole
    }
  }
}

// Helper types for table operations
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]
export type TableRow<T extends keyof Database['public']['Tables']> = Tables<T>['Row']
export type TableInsert<T extends keyof Database['public']['Tables']> = Tables<T>['Insert']
export type TableUpdate<T extends keyof Database['public']['Tables']> = Tables<T>['Update']