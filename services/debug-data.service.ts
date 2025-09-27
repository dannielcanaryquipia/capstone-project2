import { supabase } from '../lib/supabase';

export class DebugDataService {
  // Test basic Supabase connection
  static async testConnection() {
    try {
      console.log('Testing Supabase connection...');
      const { data, error } = await supabase.from('products').select('count').limit(1);
      
      if (error) {
        console.error('Supabase connection error:', error);
        return { success: false, error: error.message };
      }
      
      console.log('Supabase connection successful');
      return { success: true, data };
    } catch (err: any) {
      console.error('Supabase connection failed:', err);
      return { success: false, error: err.message };
    }
  }

  // Test products table access
  static async testProductsTable() {
    try {
      console.log('Testing products table access...');
      const { data, error } = await supabase
        .from('products')
        .select('id, name, base_price, image_url, is_available, is_recommended')
        .limit(5);
      
      if (error) {
        console.error('Products table error:', error);
        return { success: false, error: error.message };
      }
      
      console.log('Products table access successful:', data);
      return { success: true, data, count: data?.length || 0 };
    } catch (err: any) {
      console.error('Products table access failed:', err);
      return { success: false, error: err.message };
    }
  }

  // Test categories table access
  static async testCategoriesTable() {
    try {
      console.log('Testing categories table access...');
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, description')
        .limit(5);
      
      if (error) {
        console.error('Categories table error:', error);
        return { success: false, error: error.message };
      }
      
      console.log('Categories table access successful:', data);
      return { success: true, data, count: data?.length || 0 };
    } catch (err: any) {
      console.error('Categories table access failed:', err);
      return { success: false, error: err.message };
    }
  }

  // Test full product query with relationships
  static async testFullProductQuery() {
    try {
      console.log('Testing full product query with relationships...');
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name, description),
          pizza_options:pizza_options(
            id,
            size,
            price,
            crust_id,
            crust:crusts(name)
          )
        `)
        .limit(3);
      
      if (error) {
        console.error('Full product query error:', error);
        return { success: false, error: error.message };
      }
      
      console.log('Full product query successful:', data);
      return { success: true, data, count: data?.length || 0 };
    } catch (err: any) {
      console.error('Full product query failed:', err);
      return { success: false, error: err.message };
    }
  }

  // Run all tests
  static async runAllTests() {
    console.log('=== Starting Debug Data Tests ===');
    
    const connectionTest = await this.testConnection();
    const productsTest = await this.testProductsTable();
    const categoriesTest = await this.testCategoriesTable();
    const fullQueryTest = await this.testFullProductQuery();
    
    console.log('=== Debug Test Results ===');
    console.log('Connection:', connectionTest);
    console.log('Products:', productsTest);
    console.log('Categories:', categoriesTest);
    console.log('Full Query:', fullQueryTest);
    
    return {
      connection: connectionTest,
      products: productsTest,
      categories: categoriesTest,
      fullQuery: fullQueryTest
    };
  }
}
