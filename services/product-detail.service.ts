import { supabase } from '../lib/supabase';

export interface PizzaOption {
  id: string;
  size: string;
  price: number;
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

      // Get pizza options
      const { data: pizzaOptions, error: pizzaOptionsError } = await supabase
        .from('pizza_options')
        .select(`
          id,
          size,
          price
        `)
        .eq('product_id', productId);

      if (pizzaOptionsError) throw pizzaOptionsError;

      // Get all toppings for mapping
      const { data: allToppings, error: toppingsError } = await supabase
        .from('toppings')
        .select('id, name');

      if (toppingsError) {
        console.warn('Error fetching toppings:', toppingsError);
      }

      const toppingMap = new Map((allToppings || []).map((topping: any) => [topping.id, topping]));

      // Get toppings for each pizza option
      const pizzaOptionsWithToppings = await Promise.all(
        (pizzaOptions || []).map(async (option: any) => {
          const { data: pizzaToppingOptions, error: pizzaToppingError } = await supabase
            .from('pizza_topping_options')
            .select('topping_id')
            .eq('pizza_option_id', option.id);

          if (pizzaToppingError) {
            console.warn('Error fetching pizza topping options:', pizzaToppingError);
            return {
              ...option,
              toppings: []
            };
          }

          const toppings = (pizzaToppingOptions || [])
            .map((pto: any) => toppingMap.get(pto.topping_id))
            .filter(Boolean);

          return {
            ...option,
            toppings
          };
        })
      );

      return {
        ...(product as any),
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
      const { data: pizzaOptions, error } = await supabase
        .from('pizza_options')
        .select(`
          id,
          size,
          price,
          crust_id
        `)
        .eq('product_id', productId)
        .order('size');

      if (error) throw error;

      // Get all crusts for mapping
      const { data: crusts, error: crustsError } = await supabase
        .from('crusts')
        .select('id, name');

      if (crustsError) {
        console.warn('Error fetching crusts:', crustsError);
      }

      const crustMap = new Map((crusts || []).map((crust: any) => [crust.id, crust]));

      // Return pizza options with crust information
      return (pizzaOptions || []).map((option: any) => {
        const crust = crustMap.get(option.crust_id);
        return {
          id: option.id,
          product_id: productId,
          size: option.size,
          price: option.price,
          crust_id: option.crust_id,
          crust: crust ? {
            id: option.crust_id,
            name: crust.name
          } : undefined
        };
      });
    } catch (error) {
      console.error('Error fetching pizza options:', error);
      throw error;
    }
  }

  // Get toppings for a specific pizza option
  static async getPizzaOptionToppings(pizzaOptionId: string): Promise<{ id: string; name: string }[]> {
    try {
      // Get pizza topping options
      const { data: pizzaToppingOptions, error: pizzaToppingError } = await supabase
        .from('pizza_topping_options')
        .select('topping_id')
        .eq('pizza_option_id', pizzaOptionId);

      if (pizzaToppingError) throw pizzaToppingError;

      if (!pizzaToppingOptions || pizzaToppingOptions.length === 0) {
        return [];
      }

      // Get toppings by IDs
      const toppingIds = pizzaToppingOptions.map((pto: any) => pto.topping_id);
      const { data: toppings, error: toppingsError } = await supabase
        .from('toppings')
        .select('id, name')
        .in('id', toppingIds);

      if (toppingsError) throw toppingsError;
      return toppings || [];
    } catch (error) {
      console.error('Error fetching pizza option toppings:', error);
      throw error;
    }
  }
}
