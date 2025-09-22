// Quick test script to verify database fixes
// Run this with: node test-database-fix.js

const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase URL and anon key
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseFix() {
  console.log('🔍 Testing database fixes...\n');

  try {
    // Test 1: Check if menu_items table exists and has data
    console.log('1. Testing menu_items table...');
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, name, price, category_id')
      .limit(5);

    if (menuError) {
      console.error('❌ menu_items table error:', menuError.message);
    } else {
      console.log('✅ menu_items table OK:', menuItems?.length || 0, 'items found');
    }

    // Test 2: Check if saved_products table works with menu_items
    console.log('\n2. Testing saved_products with menu_items...');
    const { data: savedProducts, error: savedError } = await supabase
      .from('saved_products')
      .select(`
        *,
        product:menu_items(
          id,
          name,
          price,
          image_url,
          category:categories(name)
        )
      `)
      .limit(5);

    if (savedError) {
      console.error('❌ saved_products with menu_items error:', savedError.message);
    } else {
      console.log('✅ saved_products with menu_items OK:', savedProducts?.length || 0, 'saved items found');
    }

    // Test 3: Check if categories table exists
    console.log('\n3. Testing categories table...');
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name')
      .limit(5);

    if (catError) {
      console.error('❌ categories table error:', catError.message);
    } else {
      console.log('✅ categories table OK:', categories?.length || 0, 'categories found');
    }

    // Test 4: Check if orders table exists
    console.log('\n4. Testing orders table...');
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, total_amount, status')
      .limit(5);

    if (orderError) {
      console.error('❌ orders table error:', orderError.message);
    } else {
      console.log('✅ orders table OK:', orders?.length || 0, 'orders found');
    }

    console.log('\n🎉 Database fix test completed!');
    console.log('\nIf you see any ❌ errors above, those are the issues that need to be fixed in your Supabase database.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDatabaseFix();
