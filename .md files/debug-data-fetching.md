# Data Fetching Debug Guide for Expo Go

## 🚨 Critical Issues Identified

### 1. Database Schema Mismatches
- **Table Names**: Code queries `products` but DB has `menu_items`
- **Column Names**: Code uses `base_price` but DB has `price`
- **Missing Tables**: `product_stock`, `order_tracking` don't exist
- **Foreign Keys**: Incorrect relationship references

### 2. Service Layer Problems
- **Wrong Table Queries**: Services query non-existent tables
- **Status Mismatches**: Order status values don't match DB enums
- **Missing Error Handling**: Database errors not properly caught

### 3. Hook Implementation Issues
- **Silent Failures**: Real-time subscriptions fail without notification
- **Poor Error States**: Loading states don't handle errors properly
- **Missing Debug Info**: No console logging for debugging

## 🔧 Step-by-Step Fix

### Step 1: Fix Database Schema
Run these SQL commands in your Supabase SQL editor:

```sql
-- Create missing tables
CREATE TABLE IF NOT EXISTS products (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    description text,
    base_price numeric(10, 2) NOT NULL,
    price numeric(10, 2) NOT NULL DEFAULT 0,
    category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    image_url text,
    is_available boolean DEFAULT true,
    is_recommended boolean DEFAULT false,
    preparation_time_minutes integer DEFAULT 30,
    calories integer,
    allergens text[],
    ingredients text[],
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_stock (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity integer DEFAULT 0,
    low_stock_threshold integer DEFAULT 10,
    last_updated timestamptz DEFAULT now()
);

-- Copy data from menu_items to products
INSERT INTO products (id, name, description, base_price, price, category_id, image_url, is_available, is_recommended, preparation_time_minutes, created_at, updated_at)
SELECT id, name, description, price, price, category_id, image_url, is_available, is_featured, preparation_time, created_at, updated_at
FROM menu_items
ON CONFLICT (id) DO NOTHING;

-- Update products price column
UPDATE products SET price = base_price WHERE price = 0;

-- Create initial stock entries
INSERT INTO product_stock (product_id, quantity)
SELECT id, 100 FROM products
ON CONFLICT (product_id) DO NOTHING;
```

### Step 2: Fix Service Layer
Update your services to handle errors properly:

```typescript
// services/debug.service.ts
export class DebugService {
  static async testDatabaseConnection() {
    try {
      console.log('🔍 Testing database connection...');
      
      // Test basic connection
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, role')
        .limit(1);
      
      if (profilesError) {
        console.error('❌ Profiles table error:', profilesError);
        return { success: false, error: profilesError };
      }
      
      console.log('✅ Profiles table OK:', profiles);
      
      // Test products table
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, base_price')
        .limit(1);
      
      if (productsError) {
        console.error('❌ Products table error:', productsError);
        return { success: false, error: productsError };
      }
      
      console.log('✅ Products table OK:', products);
      
      // Test orders table
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, status, total_amount')
        .limit(1);
      
      if (ordersError) {
        console.error('❌ Orders table error:', ordersError);
        return { success: false, error: ordersError };
      }
      
      console.log('✅ Orders table OK:', orders);
      
      return { success: true, data: { profiles, products, orders } };
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      return { success: false, error };
    }
  }
}
```

### Step 3: Add Debug Hooks
Create debug hooks to monitor data fetching:

```typescript
// hooks/useDebugData.ts
import { useState, useEffect } from 'react';
import { DebugService } from '../services/debug.service';

export const useDebugData = () => {
  const [debugInfo, setDebugInfo] = useState({
    connectionStatus: 'testing',
    errors: [] as string[],
    lastTest: null as Date | null,
  });

  const testConnection = async () => {
    setDebugInfo(prev => ({ ...prev, connectionStatus: 'testing' }));
    
    const result = await DebugService.testDatabaseConnection();
    
    if (result.success) {
      setDebugInfo(prev => ({
        ...prev,
        connectionStatus: 'connected',
        errors: [],
        lastTest: new Date(),
      }));
    } else {
      setDebugInfo(prev => ({
        ...prev,
        connectionStatus: 'error',
        errors: [result.error?.message || 'Unknown error'],
        lastTest: new Date(),
      }));
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return {
    debugInfo,
    testConnection,
  };
};
```

### Step 4: Update Admin Dashboard with Debug Info
Add debug information to your admin dashboard:

```typescript
// app/(admin)/dashboard/index.tsx - Add this to your component
import { useDebugData } from '../../../hooks/useDebugData';

export default function AdminDashboard() {
  const { debugInfo, testConnection } = useDebugData();
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  
  // Add debug panel
  const renderDebugPanel = () => (
    <ResponsiveView style={[styles.debugPanel, { backgroundColor: colors.card }]}>
      <ResponsiveText size="sm" weight="bold" color={colors.text}>
        Debug Info
      </ResponsiveText>
      <ResponsiveText size="xs" color={debugInfo.connectionStatus === 'connected' ? colors.success : colors.error}>
        Status: {debugInfo.connectionStatus}
      </ResponsiveText>
      {debugInfo.errors.length > 0 && (
        <ResponsiveText size="xs" color={colors.error}>
          Errors: {debugInfo.errors.join(', ')}
        </ResponsiveText>
      )}
      <Button
        title="Test Connection"
        onPress={testConnection}
        size="small"
        variant="outline"
      />
    </ResponsiveView>
  );

  // Add this to your render method
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView>
        {/* Add debug panel at the top */}
        {renderDebugPanel()}
        
        {/* Rest of your existing content */}
        {/* ... */}
      </ScrollView>
    </SafeAreaView>
  );
}
```

### Step 5: Enhanced Error Handling
Update your hooks with better error handling:

```typescript
// hooks/useAdminStats.ts - Enhanced version
export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setDebugInfo(null);

      console.log('🔍 Fetching admin stats...');

      // Test database connection first
      const connectionTest = await DebugService.testDatabaseConnection();
      if (!connectionTest.success) {
        throw new Error(`Database connection failed: ${connectionTest.error?.message}`);
      }

      // Fetch product and order stats in parallel
      console.log('📊 Fetching product stats...');
      const productStats = await ProductService.getProductStats();
      console.log('✅ Product stats:', productStats);

      console.log('📊 Fetching order stats...');
      const orderStats = await OrderService.getOrderStats();
      console.log('✅ Order stats:', orderStats);

      // Rest of your existing code...
      const adminStats: AdminStats = {
        // ... your existing stats mapping
      };

      setStats(adminStats);
      setDebugInfo({ productStats, orderStats });
      console.log('✅ Admin stats loaded successfully');
    } catch (err: any) {
      console.error('❌ Error fetching admin stats:', err);
      setError(err.message || 'Failed to load admin statistics');
      setDebugInfo({ error: err.message, stack: err.stack });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Rest of your existing code...
};
```

## 🚀 Testing Steps

1. **Add Debug Service**: Create the debug service file
2. **Update Admin Dashboard**: Add debug panel to see connection status
3. **Check Console**: Look for detailed error messages in Expo Go
4. **Test Database**: Run the SQL commands to fix schema
5. **Monitor Network**: Check if requests are reaching Supabase

## 🔍 Common Expo Go Issues

1. **Network Timeout**: Increase timeout in Supabase client
2. **CORS Issues**: Check Supabase CORS settings
3. **Environment Variables**: Verify EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
4. **RLS Policies**: Check if Row Level Security is blocking requests

## 📱 Expo Go Debugging

To see console logs in Expo Go:
1. Open Expo Go app
2. Shake your device or press Cmd+D (iOS) / Cmd+M (Android)
3. Select "Debug Remote JS"
4. Open browser dev tools to see console logs

This will help you identify exactly where the data fetching is failing.
