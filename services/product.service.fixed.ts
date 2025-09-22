import { supabase } from '../lib/supabase';
import { Product, ProductCategory, ProductFilters, ProductStats } from '../types/product.types';

export class ProductServiceFixed {
  // Check which table exists and use the correct one
  private static async getTableInfo() {
    try {
      // Try products table first
      const { data: productsTest, error: productsError } = await supabase
        .from('products')
        .select('id')
        .limit(1);
      
      if (!productsError) {
        return { tableName: 'products', hasBasePrice: true };
      }
      
      // Try menu_items table as fallback
      const { data: menuItemsTest, error: menuItemsError } = await supabase
        .from('menu_items')
        .select('id')
        .limit(1);
      
      if (!menuItemsError) {
        return { tableName: 'menu_items', hasBasePrice: false };
      }
      
      throw new Error('Neither products nor menu_items table exists');
    } catch (error) {
      console.error('Error checking table info:', error);
      throw error;
    }
  }

  // Get all products with filters
  static async getProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
      const tableInfo = await this.getTableInfo();
      console.log('🔍 [ProductService] Using table:', tableInfo.tableName);
      
      let query = supabase
        .from(tableInfo.tableName)
        .select(`
          *,
          category:categories(name, description)
        `)
        .order('created_at', { ascending: false });

      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }

      if (filters?.is_available !== undefined) {
        query = query.eq('is_available', filters.is_available);
      }

      if (filters?.is_recommended !== undefined) {
        // Handle different column names
        const recommendedColumn = tableInfo.tableName === 'products' ? 'is_recommended' : 'is_featured';
        query = query.eq(recommendedColumn, filters.is_recommended);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.price_min) {
        const priceColumn = tableInfo.hasBasePrice ? 'base_price' : 'price';
        query = query.gte(priceColumn, filters.price_min);
      }

      if (filters?.price_max) {
        const priceColumn = tableInfo.hasBasePrice ? 'base_price' : 'price';
        query = query.lte(priceColumn, filters.price_max);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ [ProductService] Query error:', error);
        throw error;
      }

      // Transform data to match Product interface
      const products = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        base_price: tableInfo.hasBasePrice ? item.base_price : item.price,
        price: tableInfo.hasBasePrice ? item.base_price : item.price,
        category_id: item.category_id,
        image_url: item.image_url,
        is_available: item.is_available ?? true,
        is_recommended: tableInfo.tableName === 'products' ? item.is_recommended : item.is_featured,
        preparation_time_minutes: item.preparation_time_minutes || item.preparation_time || 30,
        calories: item.calories,
        allergens: item.allergens || [],
        ingredients: item.ingredients || [],
        created_at: item.created_at,
        updated_at: item.updated_at,
        category: item.category,
        stock: null, // Will be fetched separately if needed
        variants: [], // Will be fetched separately if needed
      }));

      console.log('✅ [ProductService] Products fetched:', products.length);
      return products;
    } catch (error) {
      console.error('❌ [ProductService] Error fetching products:', error);
      throw error;
    }
  }

  // Get product by ID
  static async getProductById(productId: string): Promise<Product | null> {
    try {
      const tableInfo = await this.getTableInfo();
      
      const { data, error } = await supabase
        .from(tableInfo.tableName)
        .select(`
          *,
          category:categories(name, description)
        `)
        .eq('id', productId)
        .single();

      if (error) {
        console.error('❌ [ProductService] Product fetch error:', error);
        throw error;
      }

      if (!data) return null;

      // Transform data to match Product interface
      const product: Product = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        base_price: tableInfo.hasBasePrice ? data.base_price : data.price,
        price: tableInfo.hasBasePrice ? data.base_price : data.price,
        category_id: data.category_id,
        image_url: data.image_url,
        is_available: data.is_available ?? true,
        is_recommended: tableInfo.tableName === 'products' ? data.is_recommended : data.is_featured,
        preparation_time_minutes: data.preparation_time_minutes || data.preparation_time || 30,
        calories: data.calories,
        allergens: data.allergens || [],
        ingredients: data.ingredients || [],
        created_at: data.created_at,
        updated_at: data.updated_at,
        category: data.category,
        stock: null,
        variants: [],
      };

      console.log('✅ [ProductService] Product fetched:', product.name);
      return product;
    } catch (error) {
      console.error('❌ [ProductService] Error fetching product:', error);
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

      if (error) {
        console.error('❌ [ProductService] Categories fetch error:', error);
        throw error;
      }

      const categories = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        image_url: item.image_url,
        sort_order: item.sort_order || item.display_order || 0,
        is_active: item.is_active ?? true,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      console.log('✅ [ProductService] Categories fetched:', categories.length);
      return categories;
    } catch (error) {
      console.error('❌ [ProductService] Error fetching categories:', error);
      throw error;
    }
  }

  // Get product statistics
  static async getProductStats(): Promise<ProductStats> {
    try {
      const tableInfo = await this.getTableInfo();
      
      const { data: products, error: productsError } = await supabase
        .from(tableInfo.tableName)
        .select('id, is_available, is_recommended, base_price, price, created_at');

      if (productsError) {
        console.error('❌ [ProductService] Products stats error:', productsError);
        throw productsError;
      }

      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id');

      if (categoriesError) {
        console.error('❌ [ProductService] Categories stats error:', categoriesError);
        throw categoriesError;
      }

      const productsData = products as any[];
      const categoriesData = categories as any[];

      const stats: ProductStats = {
        total_products: productsData.length,
        available_products: productsData.filter(p => p.is_available).length,
        unavailable_products: productsData.filter(p => !p.is_available).length,
        recommended_products: productsData.filter(p => 
          tableInfo.tableName === 'products' ? p.is_recommended : p.is_featured
        ).length,
        total_categories: categoriesData.length,
        low_stock_products: 0, // Will be calculated separately if stock table exists
        average_price: productsData.length > 0 ? 
          productsData.reduce((sum, p) => sum + (tableInfo.hasBasePrice ? p.base_price : p.price), 0) / productsData.length : 0,
        new_products_this_month: productsData.filter(p => 
          new Date(p.created_at).getMonth() === new Date().getMonth()
        ).length,
      };

      console.log('✅ [ProductService] Stats calculated:', stats);
      return stats;
    } catch (error) {
      console.error('❌ [ProductService] Error fetching product stats:', error);
      throw error;
    }
  }

  // Search products
  static async searchProducts(query: string): Promise<Product[]> {
    try {
      const tableInfo = await this.getTableInfo();
      
      const { data, error } = await supabase
        .from(tableInfo.tableName)
        .select(`
          *,
          category:categories(name)
        `)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('is_available', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ [ProductService] Search error:', error);
        throw error;
      }

      // Transform data to match Product interface
      const products = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        base_price: tableInfo.hasBasePrice ? item.base_price : item.price,
        price: tableInfo.hasBasePrice ? item.base_price : item.price,
        category_id: item.category_id,
        image_url: item.image_url,
        is_available: item.is_available ?? true,
        is_recommended: tableInfo.tableName === 'products' ? item.is_recommended : item.is_featured,
        preparation_time_minutes: item.preparation_time_minutes || item.preparation_time || 30,
        calories: item.calories,
        allergens: item.allergens || [],
        ingredients: item.ingredients || [],
        created_at: item.created_at,
        updated_at: item.updated_at,
        category: item.category,
        stock: null,
        variants: [],
      }));

      console.log('✅ [ProductService] Search results:', products.length);
      return products;
    } catch (error) {
      console.error('❌ [ProductService] Error searching products:', error);
      throw error;
    }
  }
}
