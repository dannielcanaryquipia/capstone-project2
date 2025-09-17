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
          recipient_name: string
          phone_number: string
          address_line1: string
          address_line2: string | null
          city: string
          province: string
          postal_code: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label: string
          recipient_name: string
          phone_number: string
          address_line1: string
          address_line2?: string | null
          city: string
          province: string
          postal_code: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          label?: string
          recipient_name?: string
          phone_number?: string
          address_line1?: string
          address_line2?: string | null
          city?: string
          province?: string
          postal_code?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          status: OrderStatus
          total_amount: number
          delivery_fee: number
          tax_amount: number
          payment_status: PaymentStatus
          payment_method: PaymentMethod
          payment_reference: string | null
          delivery_address: Json
          special_instructions: string | null
          delivery_staff_id: string | null
          estimated_delivery_time: string | null
          delivered_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: OrderStatus
          total_amount: number
          delivery_fee?: number
          tax_amount?: number
          payment_status?: PaymentStatus
          payment_method: PaymentMethod
          payment_reference?: string | null
          delivery_address: Json
          special_instructions?: string | null
          delivery_staff_id?: string | null
          estimated_delivery_time?: string | null
          delivered_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: OrderStatus
          total_amount?: number
          delivery_fee?: number
          tax_amount?: number
          payment_status?: PaymentStatus
          payment_method?: PaymentMethod
          payment_reference?: string | null
          delivery_address?: Json
          special_instructions?: string | null
          delivery_staff_id?: string | null
          estimated_delivery_time?: string | null
          delivered_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          menu_item_id: string
          quantity: number
          unit_price: number
          special_instructions: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          menu_item_id: string
          quantity: number
          unit_price: number
          special_instructions?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          menu_item_id?: string
          quantity?: number
          unit_price?: number
          special_instructions?: string | null
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