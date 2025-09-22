import { supabase } from '../lib/supabase';

export interface PizzaOption {
  id: string;
  size: string;
  price: number;
  crust: {
    id: string;
    name: string;
  };
  toppings?: {
    id: string;
    name: string;
  }[];
}

export interface ProductDetail {
  id: string;
  name: string;
  description: string;
  base_price: number;
  image_url: string;
  gallery_image_urls: string[];
  is_available: boolean;
  is_recommended: boolean;
  is_featured: boolean;
  preparation_time_minutes: number;
  allergens: string[];
  nutritional_info: any;
  category: {
    id: string;
    name: string;
    description: string;
  };
  pizza_options: PizzaOption[];
  created_at: string;
  updated_at: string;
}

export class ProductDetailService {
  // Get detailed product information with pizza options and toppings
  static async getProductDetail(productId: string): Promise<ProductDetail | null> {
    try {
      // First get the basic product info with category
      const { data: product, error: productError } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name, description)
        `)
        .eq('id', productId)
        .single();

      if (productError) throw productError;
      if (!product) return null;

      // Get pizza options with crust information
      const { data: pizzaOptions, error: pizzaOptionsError } = await supabase
        .from('pizza_options')
        .select(`
          id,
          size,
          price,
          crust:crusts(name)
        `)
        .eq('product_id', productId);

      if (pizzaOptionsError) throw pizzaOptionsError;

      // Get toppings for each pizza option
      const pizzaOptionsWithToppings = await Promise.all(
        (pizzaOptions || []).map(async (option) => {
          const { data: toppings, error: toppingsError } = await supabase
            .from('pizza_topping_options')
            .select(`
              topping:toppings(name)
            `)
            .eq('pizza_option_id', option.id);

          if (toppingsError) {
            console.warn('Error fetching toppings for pizza option:', toppingsError);
            return {
              ...option,
              toppings: []
            };
          }

          return {
            ...option,
            toppings: toppings?.map(t => t.topping) || []
          };
        })
      );

      return {
        ...product,
        pizza_options: pizzaOptionsWithToppings
      };
    } catch (error) {
      console.error('Error fetching product detail:', error);
      throw error;
    }
  }

  // Get all available crusts
  static async getCrusts(): Promise<{ id: string; name: string }[]> {
    try {
      const { data, error } = await supabase
        .from('crusts')
        .select('id, name')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching crusts:', error);
      throw error;
    }
  }

  // Get all available toppings
  static async getToppings(): Promise<{ id: string; name: string }[]> {
    try {
      const { data, error } = await supabase
        .from('toppings')
        .select('id, name')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching toppings:', error);
      throw error;
    }
  }

  // Get pizza options for a specific product
  static async getPizzaOptions(productId: string): Promise<PizzaOption[]> {
    try {
      const { data, error } = await supabase
        .from('pizza_options')
        .select(`
          id,
          size,
          price,
          crust:crusts(name)
        `)
        .eq('product_id', productId)
        .order('size');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pizza options:', error);
      throw error;
    }
  }

  // Get toppings for a specific pizza option
  static async getPizzaOptionToppings(pizzaOptionId: string): Promise<{ id: string; name: string }[]> {
    try {
      const { data, error } = await supabase
        .from('pizza_topping_options')
        .select(`
          topping:toppings(id, name)
        `)
        .eq('pizza_option_id', pizzaOptionId);

      if (error) throw error;
      return data?.map(item => item.topping) || [];
    } catch (error) {
      console.error('Error fetching pizza option toppings:', error);
      throw error;
    }
  }
}
