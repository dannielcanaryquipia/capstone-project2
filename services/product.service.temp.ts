import { supabase } from '../lib/supabase';
import { Product, ProductCategory, ProductFilters, ProductStats } from '../types/product.types';

export class ProductServiceTemp {
  // Get all products with filters (without category join)
  static async getProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
      let query = supabase
        .from('menu_items')
        .select(`
          *
        `)
        .order('created_at', { ascending: false });

      if (filters?.category_id) {
        // For now, skip category filtering until schema is fixed
        console.warn('Category filtering not available - database schema needs foreign key relationship');
      }

      if (filters?.is_available !== undefined) {
        query = query.eq('is_available', filters.is_available);
      }

      if (filters?.is_recommended !== undefined) {
        query = query.eq('is_recommended', filters.is_recommended);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.price_min) {
        query = query.gte('price', filters.price_min);
      }

      if (filters?.price_max) {
        query = query.lte('price', filters.price_max);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Add a default category to each product for now
      const productsWithDefaultCategory = (data || []).map((item: any) => ({
        ...item,
        category: {
          id: 'default',
          name: 'Main Dishes',
          description: 'Main course items'
        }
      }));
      
      return productsWithDefaultCategory;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Get product by ID (without category join)
  static async getProductById(productId: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;
      
      // Add default category
      if (data) {
        data.category = {
          id: 'default',
          name: 'Main Dishes',
          description: 'Main course items'
        };
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // Get product categories (simplified)
  static async getCategories(): Promise<ProductCategory[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Get product statistics (simplified)
  static async getProductStats(): Promise<ProductStats> {
    try {
      const { data: products, error: productsError } = await supabase
        .from('menu_items')
        .select('id, is_available, is_recommended, price, created_at');

      if (productsError) throw productsError;

      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id');

      if (categoriesError) throw categoriesError;

      const productsData = products as any[];
      const categoriesData = categories as any[];

      const stats: ProductStats = {
        total_products: productsData.length,
        available_products: productsData.filter(p => p.is_available).length,
        unavailable_products: productsData.filter(p => !p.is_available).length,
        recommended_products: productsData.filter(p => p.is_recommended).length,
        total_categories: categoriesData.length,
        low_stock_products: 0, // No stock tracking in current schema
        average_price: productsData.length > 0 ? 
          productsData.reduce((sum, p) => sum + p.price, 0) / productsData.length : 0,
        new_products_this_month: productsData.filter(p => 
          new Date(p.created_at).getMonth() === new Date().getMonth()
        ).length,
      };

      return stats;
    } catch (error) {
      console.error('Error fetching product stats:', error);
      throw error;
    }
  }

  // Search products (simplified)
  static async searchProducts(query: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *
        `)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('is_available', true)
        .order('name', { ascending: true });

      if (error) throw error;
      
      // Add default category to search results
      const productsWithDefaultCategory = (data || []).map((item: any) => ({
        ...item,
        category: {
          id: 'default',
          name: 'Main Dishes',
          description: 'Main course items'
        }
      }));
      
      return productsWithDefaultCategory;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  // Get low stock products (placeholder)
  static async getLowStockProducts(): Promise<Product[]> {
    try {
      return [];
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw error;
    }
  }
}
