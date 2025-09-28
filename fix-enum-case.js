// Script to fix enum case mismatch in Supabase
// This script will help you apply the migration and test the fix

const { createClient } = require('@supabase/supabase-js');

// You need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixEnumCase() {
  console.log('🔧 Fixing enum case mismatch...\n');

  try {
    // Step 1: Check current order status values
    console.log('1. Checking current order status values...');
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('id, status, payment_status')
      .limit(10);

    if (orderError) {
      console.error('❌ Error fetching orders:', orderError.message);
      return;
    }

    console.log('📊 Current order statuses:');
    orders?.forEach(order => {
      console.log(`  Order ${order.id}: status="${order.status}", payment_status="${order.payment_status}"`);
    });

    // Step 2: Check if we have any capitalized values
    const hasCapitalizedValues = orders?.some(order => 
      order.status && order.status !== order.status.toLowerCase()
    );

    if (hasCapitalizedValues) {
      console.log('\n⚠️  Found capitalized enum values. You need to run the migration manually in Supabase SQL Editor.');
      console.log('\n📝 Please run this SQL in your Supabase SQL Editor:');
      console.log(`
-- Fix enum case consistency
UPDATE orders 
SET status = CASE 
  WHEN status::text = 'Pending' THEN 'pending'::order_status
  WHEN status::text = 'Confirmed' THEN 'confirmed'::order_status  
  WHEN status::text = 'Preparing' THEN 'preparing'::order_status
  WHEN status::text = 'Ready for Pickup' THEN 'ready_for_pickup'::order_status
  WHEN status::text = 'Out for Delivery' THEN 'out_for_delivery'::order_status
  WHEN status::text = 'Delivered' THEN 'delivered'::order_status
  WHEN status::text = 'Cancelled' THEN 'cancelled'::order_status
  ELSE status
END
WHERE status IS NOT NULL;

UPDATE orders 
SET payment_status = CASE 
  WHEN payment_status::text = 'Pending' THEN 'pending'::payment_status
  WHEN payment_status::text = 'Verified' THEN 'verified'::payment_status
  WHEN payment_status::text = 'Failed' THEN 'failed'::payment_status
  WHEN payment_status::text = 'Refunded' THEN 'refunded'::payment_status
  ELSE payment_status
END
WHERE payment_status IS NOT NULL;
      `);
    } else {
      console.log('✅ All enum values are already lowercase.');
    }

    // Step 3: Test a simple query to see if the error is resolved
    console.log('\n3. Testing order query...');
    const { data: testOrders, error: testError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('status', 'pending')
      .limit(1);

    if (testError) {
      console.error('❌ Test query failed:', testError.message);
      console.log('\n🔍 This suggests the enum case mismatch is still present.');
    } else {
      console.log('✅ Test query successful! Enum case mismatch appears to be fixed.');
    }

    console.log('\n🎉 Enum case fix check completed!');
    console.log('\n📋 Next steps:');
    console.log('1. If you see capitalized values above, run the SQL migration in Supabase');
    console.log('2. Restart your Expo development server');
    console.log('3. Test the app to see if the PGRST200 error is resolved');

  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
}

// Run the fix
fixEnumCase();
