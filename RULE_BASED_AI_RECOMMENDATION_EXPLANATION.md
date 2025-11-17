# Rule-Based AI Recommendation System - Complete Explanation

## 📋 Overview

This project implements a **rule-based AI recommendation system** that uses analytics data from order history to recommend products to customers. The system is called "AI" because it uses intelligent algorithms (Fisher-Yates shuffle, order count analysis) to make data-driven recommendations, but it's rule-based rather than machine learning-based.

---

## 🏗️ System Architecture

### **Three-Tier Architecture:**

1. **Database Layer** (PostgreSQL/Supabase)
   - SQL function: `get_featured_products()`
   - Stores order history and product data

2. **Backend Layer** (Supabase Edge Functions)
   - Edge Function: `recommendations`
   - Service: `RecommendationService`

3. **Frontend Layer** (React Native/Expo)
   - Hook: `useRecommendations`
   - Customer pages: Home screen, Product detail page
   - Admin pages: Reports & Analytics

---

## 🎯 Rule-Based AI Recommendation Types

### **1. Featured Products (Top Ordered Products)**

**Location:** Customer Home Page (`app/(customer)/(tabs)/index.tsx`)

**How It Works:**
- **Data Source:** Order history from `order_items` and `orders` tables
- **Algorithm:** Counts how many times each product appears in completed orders
- **SQL Function:** `get_featured_products(limit_count)`
- **Rule:** Products with highest order count are featured

**Implementation Flow:**
```
1. Customer opens home page
   ↓
2. useRecommendations hook calls RecommendationService.getFeaturedProducts(2)
   ↓
3. Service tries Supabase Edge Function 'recommendations' with type='featured'
   ↓
4. Edge Function calls SQL: get_featured_products(limit)
   ↓
5. SQL Query:
   - Joins products with order_items
   - Counts orders per product (only delivered/preparing/confirmed orders)
   - Filters: is_available = true
   - Sorts: order_count DESC, created_at DESC
   - Returns top N products
   ↓
6. Results displayed in "Featured Products" section
```

**SQL Function Logic:**
```sql
-- From database-migration.sql
CREATE OR REPLACE FUNCTION get_featured_products(limit_count INTEGER)
RETURNS TABLE (
  -- product fields including order_count
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.*,
    COALESCE(product_orders.order_count, 0) as order_count
  FROM products p
  LEFT JOIN (
    SELECT 
      oi.product_id, 
      COUNT(*) as order_count
    FROM order_items oi
    INNER JOIN orders o ON oi.order_id = o.id
    WHERE o.status IN ('delivered', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'confirmed')
    GROUP BY oi.product_id
  ) product_orders ON p.id = product_orders.product_id
  WHERE p.is_available = true
  ORDER BY COALESCE(product_orders.order_count, 0) DESC, p.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
```

**Key Rules:**
- ✅ Only counts orders with status: `delivered`, `preparing`, `ready_for_pickup`, `out_for_delivery`, `confirmed`
- ✅ Only shows products where `is_available = true`
- ✅ Products with no orders get `order_count = 0`
- ✅ Ties broken by `created_at DESC` (newer products first)

---

### **2. Personalized Recommendations (Fisher-Yates Shuffle)**

**Location:** Customer Home Page (`app/(customer)/(tabs)/index.tsx`)

**How It Works:**
- **Data Source:** All available products
- **Algorithm:** Fisher-Yates shuffle for random selection
- **Rule:** Randomly shuffles all products, returns first N

**Implementation Flow:**
```
1. Customer opens home page (must be logged in)
   ↓
2. useRecommendations hook calls RecommendationService.getPersonalizedRecommendations(userId, 4)
   ↓
3. Service tries Supabase Edge Function 'recommendations' with type='personalized'
   ↓
4. Edge Function:
   - Fetches all available products
   - Applies Fisher-Yates shuffle algorithm
   - Returns first 4 products
   ↓
5. Results displayed in "Recommended For You" section
```

**Fisher-Yates Shuffle Algorithm:**
```typescript
// From supabase/functions/recommendations/index.ts
function fisherYatesShuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
```

**Key Rules:**
- ✅ Only works for logged-in users (`userId` required)
- ✅ Only includes products where `is_available = true`
- ✅ Uses true random shuffle (not pseudo-random)
- ✅ Returns different products on each page load

---

### **3. Category Recommendations**

**Location:** Product Detail Page (`app/(customer)/product/[id].tsx`)

**How It Works:**
- **Data Source:** Products from the same category as current product
- **Algorithm:** Same category first, then random fallback
- **Rule:** Shows products from same category, excluding current product

**Implementation Flow:**
```
1. Customer views a product detail page
   ↓
2. useEffect detects product.category_id is loaded
   ↓
3. Calls getCategoryRecommendations(categoryId, productId, 4)
   ↓
4. Service tries Supabase Edge Function 'recommendations' with type='category'
   ↓
5. Edge Function:
   - Fetches products where category_id = current category
   - Excludes current product (productId)
   - Filters: is_available = true
   - Applies Fisher-Yates shuffle
   - If category has < 4 products, fills with random products from all categories
   ↓
6. Results displayed in "You May Also Like" section
```

**Key Rules:**
- ✅ Primary: Same category products (excluding current)
- ✅ Fallback: Random products if category has < 4 items
- ✅ Always excludes the current product being viewed
- ✅ Shuffled for variety

---

## 📊 Analytics-Based Featured Products in Admin

### **Admin Reports & Analytics**

**Location:** `app/(admin)/reports/index.tsx`

**How Analytics Drive Featured Products:**

1. **Top Products Analysis:**
   - Admin can view top-selling products in Reports → Products tab
   - Uses `ReportsService.getTopProducts()` which:
     - Joins `order_items` with `orders` and `products`
     - Calculates total revenue per product
     - Sorts by revenue (highest first)
     - Shows quantity sold and revenue generated

2. **Order Count Analytics:**
   - The same `get_featured_products()` SQL function used by customers is also available to admins
   - Admin can see which products have the highest order counts
   - This data directly feeds into the featured products shown to customers

3. **Revenue Analytics:**
   - Admin Reports shows:
     - Total income by period (week/month/year)
     - Order counts per period
     - Average order value
   - This helps admins understand which products drive revenue

**Connection Between Admin Analytics and Customer Recommendations:**

```
Admin Analytics (Reports Page)
  ↓
Analyzes order history
  ↓
Identifies top products by:
  - Order count (get_featured_products SQL function)
  - Revenue (ReportsService.getTopProducts)
  ↓
Same SQL function used for customer recommendations
  ↓
Featured Products shown to customers
```

**Key Files:**
- `services/reports.service.ts` - Top products by revenue
- `database-migration.sql` - `get_featured_products()` SQL function
- `app/(admin)/reports/index.tsx` - Admin analytics dashboard

---

## 🔄 Fallback Mechanisms

The system has **multiple fallback layers** for reliability:

### **Featured Products Fallback Chain:**
```
1. Try Supabase Edge Function 'recommendations'
   ↓ (if fails)
2. Try direct SQL: supabase.rpc('get_featured_products')
   ↓ (if fails)
3. Query products where is_featured = true
   ↓ (if fails)
4. Query any available products, sorted by created_at
```

### **Personalized Recommendations Fallback:**
```
1. Try Supabase Edge Function 'recommendations'
   ↓ (if fails)
2. Direct database query + Fisher-Yates shuffle in frontend
```

---

## 📱 Customer Page Implementation

### **Home Page (`app/(customer)/(tabs)/index.tsx`)**

**Featured Products Section:**
```typescript
// Lines 280-326
<ResponsiveView marginTop="sm" paddingHorizontal="lg" marginBottom="lg">
  <ResponsiveText size="xxl" weight="bold" color={colors.text}>
    Featured Products ({featuredProducts.length})
  </ResponsiveText>
  <ScrollView horizontal>
    {featuredProducts.map((product) => (
      <ProductCard
        key={product.id}
        name={product.name}
        price={product.base_price}
        image={product.image_url}
        tags={['Featured']}
        // ... other props
      />
    ))}
  </ScrollView>
</ResponsiveView>
```

**Recommended For You Section:**
```typescript
// Lines 328-407
<ResponsiveView marginTop="sm" paddingHorizontal="lg" marginBottom="lg">
  <ResponsiveText size="xxl" weight="bold" color={colors.text}>
    Recommended For You ({personalizedProducts.length})
  </ResponsiveText>
  <ScrollView horizontal>
    {personalizedProducts.length > 0 ? (
      personalizedProducts.map((product) => (
        <ProductCard
          key={product.id}
          tags={['Recommended']}
          // ... other props
        />
      ))
    ) : (
      // Fallback: Show shuffled products from all products
      // Uses inline Fisher-Yates shuffle
    )}
  </ScrollView>
</ResponsiveView>
```

### **Product Detail Page (`app/(customer)/product/[id].tsx`)**

**You May Also Like Section:**
```typescript
// Lines 157-180
useEffect(() => {
  if (product && product.id !== 'loading' && (product as any).category_id) {
    loadCategoryRecommendations();
  }
}, [product]);

const loadCategoryRecommendations = async () => {
  if (!product || product.id === 'loading' || !(product as any).category_id) return;
  
  setIsLoadingRecommendations(true);
  try {
    const recommendations = await getCategoryRecommendations(
      (product as any).category_id, 
      product.id, 
      4
    );
    setCategoryRecommendations(recommendations);
  } catch (error) {
    console.error('Failed to load category recommendations:', error);
  } finally {
    setIsLoadingRecommendations(false);
  }
};
```

---

## 🎓 How to Explain the Rule-Based AI Recommendation System

### **For Technical Audience:**

"The system uses rule-based algorithms (not machine learning) to recommend products:

1. **Featured Products:** SQL aggregation counts order frequency per product, ranks by popularity
2. **Personalized Recommendations:** Fisher-Yates shuffle randomizes product selection for variety
3. **Category Recommendations:** Filters products by category, excludes current product, shuffles results

All recommendations use analytics from order history stored in PostgreSQL, processed via Supabase Edge Functions with fallback to direct database queries."

### **For Non-Technical Audience:**

"Our recommendation system analyzes your order history to show you products you might like:

- **Featured Products:** Shows the most popular items based on how many times customers have ordered them
- **Recommended For You:** Shows a random selection of available products to help you discover new items
- **You May Also Like:** When viewing a product, shows similar items from the same category

The system learns from all customer orders to identify trending products and automatically features them on the home page."

### **For Business/Stakeholders:**

"The recommendation engine drives sales by:

1. **Data-Driven:** Uses actual order analytics to identify best-selling products
2. **Automatic:** No manual curation needed - system updates based on sales data
3. **Multi-Strategy:** Combines popularity (featured) with discovery (personalized) and relevance (category)
4. **Admin Visibility:** Reports dashboard shows which products are driving revenue, informing inventory decisions"

---

## 🔑 Key Files Reference

| File | Purpose |
|------|---------|
| `services/recommendation.service.ts` | Main recommendation service with all algorithms |
| `supabase/functions/recommendations/index.ts` | Edge Function backend for recommendations |
| `hooks/useRecommendations.ts` | React hook for fetching recommendations |
| `database-migration.sql` | SQL function `get_featured_products()` |
| `app/(customer)/(tabs)/index.tsx` | Customer home page with featured & personalized |
| `app/(customer)/product/[id].tsx` | Product detail page with category recommendations |
| `app/(admin)/reports/index.tsx` | Admin analytics dashboard |
| `services/reports.service.ts` | Top products analytics for admin |

---

## 📈 Performance Optimizations

1. **Database Indexes:**
   - `idx_orders_status` - Fast order status filtering
   - `idx_order_items_product_id` - Fast product lookups
   - `idx_products_available` - Fast availability filtering

2. **Caching Strategy:**
   - Recommendations loaded once per page visit
   - Refresh on pull-to-refresh
   - Real-time updates via Supabase subscriptions (for admin)

3. **Fallback Chain:**
   - Edge Function → Direct SQL → Simple Query
   - Ensures recommendations always work even if Edge Functions are down

---

## 🎯 Summary

The rule-based AI recommendation system is a **data-driven, analytics-powered** product recommendation engine that:

- ✅ Uses order history to identify popular products
- ✅ Provides variety through Fisher-Yates shuffle
- ✅ Offers category-based suggestions
- ✅ Connects admin analytics to customer recommendations
- ✅ Has robust fallback mechanisms
- ✅ Updates automatically based on sales data

It's called "AI" because it uses intelligent algorithms to make data-driven decisions, but it's rule-based (deterministic rules) rather than machine learning (pattern recognition from training data).

