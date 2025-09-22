import { supabase } from '../lib/supabase';

export interface DebugResult {
  success: boolean;
  error?: any;
  data?: any;
  timestamp: string;
}

export class DebugService {
  static async testDatabaseConnection(): Promise<DebugResult> {
    const timestamp = new Date().toISOString();
    
    try {
      console.log('🔍 [DEBUG] Testing database connection...');
      
      // Test basic connection
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, role')
        .limit(1);
      
      if (profilesError) {
        console.error('❌ [DEBUG] Profiles table error:', profilesError);
        return { success: false, error: profilesError, timestamp };
      }
      
      console.log('✅ [DEBUG] Profiles table OK:', profiles);
      
      // Test products table (check if it exists)
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, base_price')
        .limit(1);
      
      if (productsError) {
        console.error('❌ [DEBUG] Products table error:', productsError);
        // Try menu_items table instead
        const { data: menuItems, error: menuItemsError } = await supabase
          .from('menu_items')
          .select('id, name, price')
          .limit(1);
        
        if (menuItemsError) {
          console.error('❌ [DEBUG] Menu items table error:', menuItemsError);
          return { success: false, error: { products: productsError, menuItems: menuItemsError }, timestamp };
        }
        
        console.log('✅ [DEBUG] Menu items table OK (using fallback):', menuItems);
        return { success: true, data: { profiles, products: menuItems }, timestamp };
      }
      
      console.log('✅ [DEBUG] Products table OK:', products);
      
      // Test orders table
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, status, total_amount')
        .limit(1);
      
      if (ordersError) {
        console.error('❌ [DEBUG] Orders table error:', ordersError);
        return { success: false, error: ordersError, timestamp };
      }
      
      console.log('✅ [DEBUG] Orders table OK:', orders);
      
      return { 
        success: true, 
        data: { profiles, products, orders }, 
        timestamp 
      };
    } catch (error) {
      console.error('❌ [DEBUG] Database connection test failed:', error);
      return { success: false, error, timestamp };
    }
  }

  static async testAdminDataFetching(): Promise<DebugResult> {
    const timestamp = new Date().toISOString();
    
    try {
      console.log('🔍 [DEBUG] Testing admin data fetching...');
      
      // Test admin orders
      const { data: adminOrders, error: adminOrdersError } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*),
          delivery_address:addresses(*),
          user:profiles!orders_user_id_fkey(full_name, phone_number)
        `)
        .limit(5);
      
      if (adminOrdersError) {
        console.error('❌ [DEBUG] Admin orders error:', adminOrdersError);
        return { success: false, error: adminOrdersError, timestamp };
      }
      
      console.log('✅ [DEBUG] Admin orders OK:', adminOrders);
      
      // Test product stats
      const { data: productStats, error: productStatsError } = await supabase
        .from('products')
        .select('id, is_available, is_recommended, base_price, created_at');
      
      if (productStatsError) {
        console.error('❌ [DEBUG] Product stats error:', productStatsError);
        return { success: false, error: productStatsError, timestamp };
      }
      
      console.log('✅ [DEBUG] Product stats OK:', productStats);
      
      return { 
        success: true, 
        data: { adminOrders, productStats }, 
        timestamp 
      };
    } catch (error) {
      console.error('❌ [DEBUG] Admin data fetching test failed:', error);
      return { success: false, error, timestamp };
    }
  }

  static async testUserRoleAccess(): Promise<DebugResult> {
    const timestamp = new Date().toISOString();
    
    try {
      console.log('🔍 [DEBUG] Testing user role access...');
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('❌ [DEBUG] User not authenticated:', userError);
        return { success: false, error: userError || 'No user', timestamp };
      }
      
      console.log('✅ [DEBUG] User authenticated:', user.id);
      
      // Check user profile and role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, full_name')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('❌ [DEBUG] Profile fetch error:', profileError);
        return { success: false, error: profileError, timestamp };
      }
      
      console.log('✅ [DEBUG] User profile:', profile);
      
      // Test role-based access
      if (profile.role === 'admin') {
        const { data: allOrders, error: allOrdersError } = await supabase
          .from('orders')
          .select('id, status')
          .limit(5);
        
        if (allOrdersError) {
          console.error('❌ [DEBUG] Admin access test failed:', allOrdersError);
          return { success: false, error: allOrdersError, timestamp };
        }
        
        console.log('✅ [DEBUG] Admin access confirmed:', allOrders);
      }
      
      return { 
        success: true, 
        data: { user, profile }, 
        timestamp 
      };
    } catch (error) {
      console.error('❌ [DEBUG] User role access test failed:', error);
      return { success: false, error, timestamp };
    }
  }

  static async runFullDiagnostic(): Promise<{
    connection: DebugResult;
    adminData: DebugResult;
    userAccess: DebugResult;
    summary: {
      allPassed: boolean;
      errors: string[];
      warnings: string[];
    };
  }> {
    console.log('🔍 [DEBUG] Running full diagnostic...');
    
    const connection = await this.testDatabaseConnection();
    const adminData = await this.testAdminDataFetching();
    const userAccess = await this.testUserRoleAccess();
    
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!connection.success) {
      errors.push('Database connection failed');
    }
    
    if (!adminData.success) {
      errors.push('Admin data fetching failed');
    }
    
    if (!userAccess.success) {
      errors.push('User access test failed');
    }
    
    if (errors.length === 0) {
      console.log('✅ [DEBUG] All tests passed!');
    } else {
      console.error('❌ [DEBUG] Tests failed:', errors);
    }
    
    return {
      connection,
      adminData,
      userAccess,
      summary: {
        allPassed: errors.length === 0,
        errors,
        warnings,
      },
    };
  }
}
