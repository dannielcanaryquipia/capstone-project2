import { supabase } from '../lib/supabase';
import { Product, ProductCategory, ProductFilters, ProductStats } from '../types/product.types';

export class ProductService {
  // Get all products with filters
  static async getProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(name, description),
          pizza_options:pizza_options(
            id,
            size,
            price
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
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
        query = query.gte('base_price', filters.price_min);
      }

      if (filters?.price_max) {
        query = query.lte('base_price', filters.price_max);
      }

      const { data, error } = await query;

      if (error) {
        console.error('ProductService Error:', error);
        throw error;
      }
      
      
      return data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Get product by ID
  static async getProductById(productId: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name, description),
          pizza_options:pizza_options(
            id,
            size,
            price
          )
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // Create new product
  static async createProduct(productData: {
    name: string;
    description: string;
    price: number;
    category_id: string;
    image_url?: string;
    is_available?: boolean;
    is_recommended?: boolean;
    preparation_time?: number;
    calories?: number;
    allergens?: string[];
    ingredients?: string[];
    variants?: any[];
  }): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          description: productData.description,
          base_price: productData.price,
          category_id: productData.category_id,
          image_url: productData.image_url,
          is_available: productData.is_available ?? true,
          is_recommended: productData.is_recommended ?? false,
          preparation_time_minutes: productData.preparation_time,
          allergens: productData.allergens,
        } as any)
        .select()
        .single();

      if (error) throw error;

      return await this.getProductById((data as any).id) as Product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Update product
  static async updateProduct(
    productId: string, 
    updates: Partial<Product>
  ): Promise<Product> {
    try {
      const { error } = await (supabase as any)
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId);

      if (error) throw error;
      return await this.getProductById(productId) as Product;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Delete product
  static async deleteProduct(productId: string): Promise<void> {
    try {
      // Delete the product
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Toggle product availability
  static async toggleAvailability(productId: string): Promise<Product> {
    try {
      const product = await this.getProductById(productId);
      if (!product) throw new Error('Product not found');

      return await this.updateProduct(productId, {
        is_available: !product.is_available,
      });
    } catch (error) {
      console.error('Error toggling product availability:', error);
      throw error;
    }
  }

  // Get product categories
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

  // Create category
  static async createCategory(categoryData: {
    name: string;
    description?: string;
    image_url?: string;
    sort_order?: number;
  }): Promise<ProductCategory> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(categoryData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  // Update category
  static async updateCategory(
    categoryId: string, 
    updates: Partial<ProductCategory>
  ): Promise<ProductCategory> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', categoryId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  // Delete category
  static async deleteCategory(categoryId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  // Get product statistics
  static async getProductStats(): Promise<ProductStats> {
    try {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, is_available, is_recommended, base_price, created_at');

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
          productsData.reduce((sum, p) => sum + p.base_price, 0) / productsData.length : 0,
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

  // Get low stock products (placeholder - no stock tracking in current schema)
  static async getLowStockProducts(): Promise<Product[]> {
    try {
      // Return empty array since stock tracking is not implemented
      return [];
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw error;
    }
  }

  // Search products
  static async searchProducts(query: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name, description),
          pizza_options:pizza_options(
            id,
            size,
            price
          )
        `)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('is_available', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
}
