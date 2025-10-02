# 🚀 Kitchen One App - Implementation Completion Guide

## 📋 **Overview**
This guide provides a step-by-step implementation plan to complete all missing features in the Kitchen One App system, including AI-based recommendations using Supabase backend functions.

## 🎯 **Current Status Analysis**

### ✅ **Already Implemented (Database)**
- **Payment Transactions**: Complete payment tracking system
- **Order Management**: Full order lifecycle with status history
- **User Roles**: Customer, Admin, Rider with proper relationships
- **Product System**: Complete with pizza customization
- **Delivery System**: Rider assignments and tracking
- **Notifications**: User notification system
- **Inventory Management**: Stock tracking with transactions

### ❌ **Missing Implementation (Application Layer)**
- **QR Code Generation**: No QR code generation for online payments
- **Payment Proof Upload**: No UI for uploading payment screenshots
- **Admin Verification Interface**: No admin interface for payment verification
- **Payment Method Selection**: No UI for selecting payment methods
- **Responsive Admin/Delivery UI**: Admin and delivery screens need responsive design
- **Payment Verification Workflow**: No automated workflow for payment verification
- **AI-Based Recommendations**: No recommendation system for products

---

## 🤖 **PHASE 0: AI-Based Recommendation System**

### **Task 0.1: Supabase Edge Functions for Recommendations**

**Files to Create**:
- `supabase/functions/recommendations/index.ts`
- `supabase/functions/recommendations/package.json`

**Implementation**:
```typescript
// supabase/functions/recommendations/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RecommendationRequest {
  type: 'featured' | 'personalized' | 'category' | 'random'
  userId?: string
  categoryId?: string
  productId?: string
  limit?: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { type, userId, categoryId, productId, limit = 4 }: RecommendationRequest = await req.json()

    let recommendations = []

    switch (type) {
      case 'featured':
        recommendations = await getFeaturedProducts(supabaseClient, limit)
        break
      case 'personalized':
        recommendations = await getPersonalizedRecommendations(supabaseClient, userId!, limit)
        break
      case 'category':
        recommendations = await getCategoryRecommendations(supabaseClient, categoryId!, productId!, limit)
        break
      case 'random':
        recommendations = await getRandomRecommendations(supabaseClient, limit)
        break
    }

    return new Response(
      JSON.stringify({ recommendations }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

// Featured Products: Top ordered products from order history
async function getFeaturedProducts(supabase: any, limit: number) {
  const { data, error } = await supabase
    .rpc('get_featured_products', { limit_count: limit })

  if (error) throw error
  return data || []
}

// Personalized Recommendations: Fisher-Yates algorithm for random selection
async function getPersonalizedRecommendations(supabase: any, userId: string, limit: number) {
  // Get all available products
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_available', true)

  if (error) throw error
  if (!products || products.length === 0) return []

  // Apply Fisher-Yates shuffle algorithm
  const shuffledProducts = fisherYatesShuffle([...products])
  
  // Return limited results
  return shuffledProducts.slice(0, limit)
}

// Category Recommendations: Products from same category, fallback to random
async function getCategoryRecommendations(supabase: any, categoryId: string, productId: string, limit: number) {
  // Get products from same category excluding current product
  const { data: categoryProducts, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_available', true)
    .neq('id', productId)

  if (error) throw error

  // If category has products, return them (shuffled)
  if (categoryProducts && categoryProducts.length > 0) {
    const shuffled = fisherYatesShuffle([...categoryProducts])
    return shuffled.slice(0, limit)
  }

  // Fallback: Get random products from all categories
  const { data: allProducts, error: allError } = await supabase
    .from('products')
    .select('*')
    .eq('is_available', true)
    .neq('id', productId)

  if (allError) throw allError

  const shuffled = fisherYatesShuffle([...allProducts])
  return shuffled.slice(0, limit)
}

// Random Recommendations: Random products from all categories
async function getRandomRecommendations(supabase: any, limit: number) {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_available', true)

  if (error) throw error

  const shuffled = fisherYatesShuffle([...products])
  return shuffled.slice(0, limit)
}

// Fisher-Yates Shuffle Algorithm
function fisherYatesShuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
```

### **Task 0.2: Database Functions for Featured Products**

**Files to Create**:
- `database/functions/get_featured_products.sql`

**Implementation**:
```sql
-- Function to get featured products based on order history
CREATE OR REPLACE FUNCTION get_featured_products(limit_count INTEGER DEFAULT 4)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  category_id UUID,
  base_price NUMERIC,
  image_url TEXT,
  gallery_image_urls TEXT[],
  is_available BOOLEAN,
  is_recommended BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  preparation_time_minutes INTEGER,
  is_featured BOOLEAN,
  order_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.category_id,
    p.base_price,
    p.image_url,
    p.gallery_image_urls,
    p.is_available,
    p.is_recommended,
    p.created_at,
    p.updated_at,
    p.preparation_time_minutes,
    p.is_featured,
    COALESCE(product_orders.order_count, 0) as order_count
  FROM products p
  LEFT JOIN (
    SELECT 
      oi.product_id,
      COUNT(*) as order_count
    FROM order_items oi
    INNER JOIN orders o ON oi.order_id = o.id
    WHERE o.status IN ('delivered', 'preparing', 'ready_for_pickup', 'out_for_delivery')
    GROUP BY oi.product_id
  ) product_orders ON p.id = product_orders.product_id
  WHERE p.is_available = true
  ORDER BY COALESCE(product_orders.order_count, 0) DESC, p.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
```

### **Task 0.3: Recommendation Service**

**Files to Create**:
- `services/recommendation.service.ts`

**Implementation**:
```typescript
// services/recommendation.service.ts
import { supabase } from '../lib/supabase';

export interface RecommendationRequest {
  type: 'featured' | 'personalized' | 'category' | 'random';
  userId?: string;
  categoryId?: string;
  productId?: string;
  limit?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category_id: string;
  base_price: number;
  image_url: string;
  gallery_image_urls: string[];
  is_available: boolean;
  is_recommended: boolean;
  created_at: string;
  updated_at: string;
  preparation_time_minutes: number;
  is_featured: boolean;
  order_count?: number;
}

export class RecommendationService {
  // Get featured products (top ordered)
  static async getFeaturedProducts(limit: number = 2): Promise<Product[]> {
    const { data, error } = await supabase.functions.invoke('recommendations', {
      body: {
        type: 'featured',
        limit
      }
    });

    if (error) throw error;
    return data.recommendations || [];
  }

  // Get personalized recommendations (Fisher-Yates shuffle)
  static async getPersonalizedRecommendations(userId: string, limit: number = 4): Promise<Product[]> {
    const { data, error } = await supabase.functions.invoke('recommendations', {
      body: {
        type: 'personalized',
        userId,
        limit
      }
    });

    if (error) throw error;
    return data.recommendations || [];
  }

  // Get category-based recommendations
  static async getCategoryRecommendations(categoryId: string, productId: string, limit: number = 4): Promise<Product[]> {
    const { data, error } = await supabase.functions.invoke('recommendations', {
      body: {
        type: 'category',
        categoryId,
        productId,
        limit
      }
    });

    if (error) throw error;
    return data.recommendations || [];
  }

  // Get random recommendations
  static async getRandomRecommendations(limit: number = 4): Promise<Product[]> {
    const { data, error } = await supabase.functions.invoke('recommendations', {
      body: {
        type: 'random',
        limit
      }
    });

    if (error) throw error;
    return data.recommendations || [];
  }
}
```

### **Task 0.4: Recommendation Hooks**

**Files to Create**:
- `hooks/useRecommendations.ts`

**Implementation**:
```typescript
// hooks/useRecommendations.ts
import { useState, useEffect, useCallback } from 'react';
import { RecommendationService, Product } from '../services/recommendation.service';
import { useAuth } from './useAuth';

export const useRecommendations = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [personalizedProducts, setPersonalizedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load featured products
  const loadFeaturedProducts = useCallback(async (limit: number = 2) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const products = await RecommendationService.getFeaturedProducts(limit);
      setFeaturedProducts(products);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load featured products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load personalized recommendations
  const loadPersonalizedRecommendations = useCallback(async (limit: number = 4) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const products = await RecommendationService.getPersonalizedRecommendations(user.id, limit);
      setPersonalizedProducts(products);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load personalized recommendations');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Get category recommendations
  const getCategoryRecommendations = useCallback(async (
    categoryId: string, 
    productId: string, 
    limit: number = 4
  ): Promise<Product[]> => {
    try {
      const products = await RecommendationService.getCategoryRecommendations(categoryId, productId, limit);
      return products;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load category recommendations');
      return [];
    }
  }, []);

  // Get random recommendations
  const getRandomRecommendations = useCallback(async (limit: number = 4): Promise<Product[]> => {
    try {
      const products = await RecommendationService.getRandomRecommendations(limit);
      return products;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load random recommendations');
      return [];
    }
  }, []);

  // Load initial recommendations
  useEffect(() => {
    loadFeaturedProducts();
    if (user) {
      loadPersonalizedRecommendations();
    }
  }, [loadFeaturedProducts, loadPersonalizedRecommendations, user]);

  return {
    featuredProducts,
    personalizedProducts,
    getCategoryRecommendations,
    getRandomRecommendations,
    loadFeaturedProducts,
    loadPersonalizedRecommendations,
    isLoading,
    error
  };
};
```

### **Task 0.5: Update Homepage with AI Recommendations**

**Files to Modify**:
- `app/(customer)/(tabs)/index.tsx`

**Implementation**:
```typescript
// Update the homepage to use AI recommendations
import { useRecommendations } from '../../../hooks/useRecommendations';

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const { user, profile: authProfile } = useAuth();
  const { profile } = useCurrentUserProfile();
  const router = useRouter();
  const userName = authProfile?.full_name || profile?.full_name || user?.user_metadata?.name || 'Guest';
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use AI recommendations instead of hardcoded data
  const { 
    featuredProducts, 
    personalizedProducts, 
    isLoading: recommendationsLoading,
    error: recommendationsError 
  } = useRecommendations();
  
  // Remove old hardcoded recommendations
  // const popularProducts = products.filter(product => product.is_recommended).slice(0, 4);
  // const recommendedProducts = products.filter(product => product.is_recommended).slice(0, 2);

  // ... existing code ...

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ... existing header and search code ... */}

        {/* Featured Products Section - Top Ordered Products */}
        <ResponsiveView marginTop="sm" paddingHorizontal="lg" marginBottom="lg">
          <ResponsiveView 
            flexDirection="row" 
            justifyContent="space-between" 
            alignItems="center"
            marginBottom="lg"
          >
            <ResponsiveText size="xxl" weight="bold" color={colors.text}>
              Featured Products ({featuredProducts.length})
            </ResponsiveText>
            <TouchableOpacity onPress={() => router.push('/(customer)/menu')}>
              <ResponsiveText size="md" weight="semiBold" color={colors.themedViewAll}>
                View All
              </ResponsiveText>
            </TouchableOpacity>
          </ResponsiveView>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: Responsive.ResponsiveSpacing.xs }}
          >
            {recommendationsLoading ? (
              <ResponsiveView padding="lg">
                <ResponsiveText color={colors.textSecondary}>Loading featured products...</ResponsiveText>
              </ResponsiveView>
            ) : (
              featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  description={product.description}
                  price={product.base_price}
                  image={product.image_url || 'https://via.placeholder.com/200x150'}
                  tags={['Featured']}
                  variant="horizontal"
                  width={Responsive.responsiveValue(160, 170, 180, 200)}
                  onPress={() => router.push({
                    pathname: '/(customer)/product/[id]',
                    params: { id: product.id }
                  } as any)}
                />
              ))
            )}
          </ScrollView>
        </ResponsiveView>

        {/* Recommended For You Section - Fisher-Yates Shuffled Products */}
        <ResponsiveView marginTop="sm" paddingHorizontal="lg" marginBottom="lg">
          <ResponsiveView 
            flexDirection="row" 
            justifyContent="space-between" 
            alignItems="center"
            marginBottom="lg"
          >
            <ResponsiveText size="xxl" weight="bold" color={colors.text}>
              Recommended For You ({personalizedProducts.length})
            </ResponsiveText>
            <TouchableOpacity onPress={() => router.push('/(customer)/menu')}>
              <ResponsiveText size="md" weight="semiBold" color={colors.themedViewAll}>
                View All
              </ResponsiveText>
            </TouchableOpacity>
          </ResponsiveView>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: Responsive.ResponsiveSpacing.xs }}
          >
            {recommendationsLoading ? (
              <ResponsiveView padding="lg">
                <ResponsiveText color={colors.textSecondary}>Loading recommendations...</ResponsiveText>
              </ResponsiveView>
            ) : (
              personalizedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  description={product.description}
                  price={product.base_price}
                  image={product.image_url || 'https://via.placeholder.com/200x150'}
                  tags={['Recommended']}
                  variant="horizontal"
                  width={Responsive.responsiveValue(160, 170, 180, 200)}
                  onPress={() => router.push({
                    pathname: '/(customer)/product/[id]',
                    params: { id: product.id }
                  } as any)}
                />
              ))
            )}
          </ScrollView>
        </ResponsiveView>

        {/* ... rest of existing code ... */}
      </ScrollView>
    </SafeAreaView>
  );
}
```

### **Task 0.6: Update Product Detail with Category Recommendations**

**Files to Create/Modify**:
- `app/(customer)/product/[id].tsx`

**Implementation**:
```typescript
// Add to product detail page
import { useRecommendations } from '../../../hooks/useRecommendations';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const [product, setProduct] = useState<Product | null>(null);
  const [categoryRecommendations, setCategoryRecommendations] = useState<Product[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  
  const { getCategoryRecommendations, getRandomRecommendations } = useRecommendations();

  // Load product details
  useEffect(() => {
    if (id) {
      loadProduct(id as string);
    }
  }, [id]);

  // Load category recommendations when product is loaded
  useEffect(() => {
    if (product) {
      loadCategoryRecommendations();
    }
  }, [product]);

  const loadCategoryRecommendations = async () => {
    if (!product) return;
    
    setIsLoadingRecommendations(true);
    try {
      const recommendations = await getCategoryRecommendations(
        product.category_id, 
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

  // ... existing product detail code ...

  return (
    <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
      <ScrollView>
        {/* ... existing product detail content ... */}

        {/* You May Also Like Section */}
        <ResponsiveView marginTop="lg" paddingHorizontal="lg" marginBottom="lg">
          <ResponsiveText size="xxl" weight="bold" color={colors.text} marginBottom="lg">
            You May Also Like
          </ResponsiveText>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: Responsive.ResponsiveSpacing.xs }}
          >
            {isLoadingRecommendations ? (
              <ResponsiveView padding="lg">
                <ResponsiveText color={colors.textSecondary}>Loading recommendations...</ResponsiveText>
              </ResponsiveView>
            ) : (
              categoryRecommendations.map((recommendedProduct) => (
                <ProductCard
                  key={recommendedProduct.id}
                  id={recommendedProduct.id}
                  name={recommendedProduct.name}
                  description={recommendedProduct.description}
                  price={recommendedProduct.base_price}
                  image={recommendedProduct.image_url || 'https://via.placeholder.com/200x150'}
                  tags={['Recommended']}
                  variant="vertical"
                  width={Responsive.responsiveValue(160, 170, 180, 200)}
                  onPress={() => router.push({
                    pathname: '/(customer)/product/[id]',
                    params: { id: recommendedProduct.id }
                  } as any)}
                />
              ))
            )}
          </ScrollView>
        </ResponsiveView>
      </ScrollView>
    </SafeAreaView>
  );
}
```

---

## 🏗️ **PHASE 1: Database Schema & API Foundation**

### **Task 1.1: Database Schema Updates**

**Files to Create/Modify**:
- `database/migrations/001_add_payment_verification.sql`
- `types/payment.types.ts`
- `types/database.types.ts` (update)

**Implementation**:
```sql
-- Add payment verification fields to payment_transactions table
ALTER TABLE payment_transactions 
ADD COLUMN qr_code_url TEXT,
ADD COLUMN qr_code_data TEXT,
ADD COLUMN qr_code_expires_at TIMESTAMP WITH TIME ZONE;

-- Add payment method to orders table (if not already there)
ALTER TABLE orders 
ADD COLUMN payment_method TEXT DEFAULT 'cod';

-- Add payment verification status to orders
ALTER TABLE orders 
ADD COLUMN payment_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN payment_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN payment_verified_by UUID REFERENCES profiles(id);
```

### **Task 1.2: Type Definitions**

**Files to Create**:
- `types/payment.types.ts`

**Implementation**:
```typescript
export interface PaymentTransaction {
  id: string;
  order_id: string;
  amount: number;
  payment_method: 'cod' | 'online' | 'cash_on_pickup';
  status: 'pending' | 'verified' | 'failed';
  transaction_reference?: string;
  proof_of_payment_url?: string;
  verified_by?: string;
  verified_at?: string;
  qr_code_url?: string;
  qr_code_data?: string;
  qr_code_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface QRCodeData {
  order_id: string;
  amount: number;
  merchant: string;
  account: string;
  timestamp: number;
  instructions: string;
}

export interface PaymentVerificationRequest {
  order_id: string;
  proof_url: string;
  payment_method: string;
}
```

### **Task 1.3: API Services**

**Files to Create**:
- `services/payment.service.ts`
- `services/qr.service.ts`

**Implementation**:
```typescript
// services/payment.service.ts
import { supabase } from '../lib/supabase';
import { PaymentTransaction, PaymentVerificationRequest } from '../types/payment.types';

export class PaymentService {
  // Generate QR code for payment
  static async generateQRCode(orderId: string): Promise<{ qr_code_url: string; expires_at: string }> {
    // Implementation for QR code generation
  }

  // Upload payment proof
  static async uploadPaymentProof(data: PaymentVerificationRequest): Promise<PaymentVerificationResponse> {
    // Implementation for proof upload
  }

  // Get payment verification status
  static async getPaymentStatus(orderId: string): Promise<PaymentTransaction | null> {
    // Implementation for status check
  }

  // Admin: Get pending verifications
  static async getPendingVerifications(): Promise<PaymentTransaction[]> {
    // Implementation for admin dashboard
  }

  // Admin: Verify payment
  static async verifyPayment(verificationId: string, approved: boolean, reason?: string): Promise<boolean> {
    // Implementation for admin verification
  }
}
```

---

## 🎨 **PHASE 2: UI Components & Responsive Design**

### **Task 2.1: Payment Components**

**Files to Create**:
- `components/payment/QRCodeDisplay.tsx`
- `components/payment/PaymentMethodSelector.tsx`
- `components/payment/PaymentProofUpload.tsx`
- `components/payment/PaymentStatusIndicator.tsx`

**Implementation**:
```typescript
// components/payment/PaymentMethodSelector.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { ResponsiveView } from '../ui/ResponsiveView';
import { ResponsiveText } from '../ui/ResponsiveText';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import Responsive from '../../constants/Responsive';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'cod' | 'online' | 'cash_on_pickup';
  icon: string;
  description: string;
}

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onSelectMethod: (method: string) => void;
  disabled?: boolean;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'cod',
    name: 'Cash on Delivery',
    type: 'cod',
    icon: 'money',
    description: 'Pay when your order arrives'
  },
  {
    id: 'online',
    name: 'Online Payment',
    type: 'online',
    icon: 'qr-code',
    description: 'Pay via QR code and upload proof'
  },
  {
    id: 'cash_on_pickup',
    name: 'Cash on Pickup',
    type: 'cash_on_pickup',
    icon: 'store',
    description: 'Pay when you pick up your order'
  }
];

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
  disabled = false
}) => {
  const { colors } = useTheme();

  return (
    <ResponsiveView>
      <ResponsiveText size="lg" weight="bold" color={colors.text} marginBottom="md">
        Payment Method
      </ResponsiveText>
      
      {paymentMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.methodCard,
            {
              backgroundColor: selectedMethod === method.id ? colors.primary + '20' : colors.surface,
              borderColor: selectedMethod === method.id ? colors.primary : colors.border,
              opacity: disabled ? 0.6 : 1
            }
          ]}
          onPress={() => !disabled && onSelectMethod(method.id)}
          disabled={disabled}
        >
          <ResponsiveView flexDirection="row" alignItems="center">
            <ResponsiveView 
              backgroundColor={selectedMethod === method.id ? colors.primary : colors.surfaceVariant}
              borderRadius="round"
              padding="md"
              marginRight="md"
            >
              <MaterialIcons 
                name={method.icon as any} 
                size={Responsive.responsiveValue(24, 26, 28, 32)} 
                color={selectedMethod === method.id ? colors.textInverse : colors.text} 
              />
            </ResponsiveView>
            
            <ResponsiveView flex={1}>
              <ResponsiveText 
                size="md" 
                weight="semiBold" 
                color={colors.text}
                marginBottom="xs"
              >
                {method.name}
              </ResponsiveText>
              <ResponsiveText 
                size="sm" 
                color={colors.textSecondary}
              >
                {method.description}
              </ResponsiveText>
            </ResponsiveView>
            
            {selectedMethod === method.id && (
              <MaterialIcons 
                name="check-circle" 
                size={Responsive.responsiveValue(24, 26, 28, 32)} 
                color={colors.primary} 
              />
            )}
          </ResponsiveView>
        </TouchableOpacity>
      ))}
    </ResponsiveView>
  );
};

const styles = StyleSheet.create({
  methodCard: {
    borderWidth: 2,
    borderRadius: Responsive.ResponsiveBorderRadius.md,
    padding: Responsive.ResponsiveSpacing.md,
    marginBottom: Responsive.ResponsiveSpacing.sm,
  },
});
```

### **Task 2.2: Admin Payment Verification Components**

**Files to Create**:
- `components/admin/PaymentVerificationCard.tsx`
- `components/admin/PaymentVerificationList.tsx`
- `components/admin/PaymentProofViewer.tsx`

**Implementation**:
```typescript
// components/admin/PaymentVerificationCard.tsx
import React from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';
import { ResponsiveView } from '../ui/ResponsiveView';
import { ResponsiveText } from '../ui/ResponsiveText';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { PaymentTransaction } from '../../types/payment.types';
import Responsive from '../../constants/Responsive';

interface PaymentVerificationCardProps {
  transaction: PaymentTransaction;
  onVerify: (transactionId: string, approved: boolean) => void;
  onViewProof: (proofUrl: string) => void;
}

export const PaymentVerificationCard: React.FC<PaymentVerificationCardProps> = ({
  transaction,
  onVerify,
  onViewProof
}) => {
  const { colors } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return colors.success;
      case 'failed': return colors.error;
      default: return colors.warning;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return 'check-circle';
      case 'failed': return 'cancel';
      default: return 'pending';
    }
  };

  return (
    <ResponsiveView 
      backgroundColor={colors.surface}
      borderRadius="lg"
      padding="md"
      marginBottom="sm"
      style={styles.card}
    >
      <ResponsiveView flexDirection="row" justifyContent="space-between" alignItems="flex-start">
        <ResponsiveView flex={1}>
          <ResponsiveText size="md" weight="bold" color={colors.text} marginBottom="xs">
            Order #{transaction.order_id.slice(-8)}
          </ResponsiveText>
          
          <ResponsiveText size="sm" color={colors.textSecondary} marginBottom="xs">
            Amount: ₱{transaction.amount.toFixed(2)}
          </ResponsiveText>
          
          <ResponsiveText size="sm" color={colors.textSecondary} marginBottom="xs">
            Method: {transaction.payment_method.toUpperCase()}
          </ResponsiveText>
          
          <ResponsiveView flexDirection="row" alignItems="center" marginBottom="sm">
            <MaterialIcons 
              name={getStatusIcon(transaction.status)} 
              size={16} 
              color={getStatusColor(transaction.status)} 
            />
            <ResponsiveText 
              size="sm" 
              color={getStatusColor(transaction.status)}
              marginLeft="xs"
            >
              {transaction.status.toUpperCase()}
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
        
        <ResponsiveView alignItems="flex-end">
          {transaction.proof_of_payment_url && (
            <TouchableOpacity
              style={[styles.proofButton, { backgroundColor: colors.primary }]}
              onPress={() => onViewProof(transaction.proof_of_payment_url!)}
            >
              <MaterialIcons name="visibility" size={16} color={colors.textInverse} />
              <ResponsiveText size="xs" color={colors.textInverse} marginLeft="xs">
                View Proof
              </ResponsiveText>
            </TouchableOpacity>
          )}
        </ResponsiveView>
      </ResponsiveView>
      
      {transaction.status === 'pending' && (
        <ResponsiveView flexDirection="row" justifyContent="space-between" marginTop="md">
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error }]}
            onPress={() => onVerify(transaction.id, false)}
          >
            <MaterialIcons name="close" size={16} color={colors.textInverse} />
            <ResponsiveText size="sm" color={colors.textInverse} marginLeft="xs">
              Reject
            </ResponsiveText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.success }]}
            onPress={() => onVerify(transaction.id, true)}
          >
            <MaterialIcons name="check" size={16} color={colors.textInverse} />
            <ResponsiveText size="sm" color={colors.textInverse} marginLeft="xs">
              Approve
            </ResponsiveText>
          </TouchableOpacity>
        </ResponsiveView>
      )}
    </ResponsiveView>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  proofButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Responsive.ResponsiveSpacing.sm,
    paddingVertical: Responsive.ResponsiveSpacing.xs,
    borderRadius: Responsive.ResponsiveBorderRadius.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Responsive.ResponsiveSpacing.md,
    paddingVertical: Responsive.ResponsiveSpacing.sm,
    borderRadius: Responsive.ResponsiveBorderRadius.md,
    flex: 1,
    marginHorizontal: Responsive.ResponsiveSpacing.xs,
  },
});
```

---

## 🔧 **PHASE 3: Hooks & State Management**

### **Task 3.1: Payment Hooks**

**Files to Create**:
- `hooks/usePayment.ts`
- `hooks/usePaymentVerification.ts`
- `hooks/useQRCode.ts`

**Implementation**:
```typescript
// hooks/usePayment.ts
import { useState, useCallback } from 'react';
import { PaymentService } from '../services/payment.service';
import { PaymentTransaction } from '../types/payment.types';

export const usePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQRCode = useCallback(async (orderId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await PaymentService.generateQRCode(orderId);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadPaymentProof = useCallback(async (orderId: string, proofUrl: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await PaymentService.uploadPaymentProof({
        order_id: orderId,
        proof_url: proofUrl
      });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload proof');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    generateQRCode,
    uploadPaymentProof,
    isLoading,
    error
  };
};
```

### **Task 3.2: Admin Payment Verification Hooks**

**Files to Create**:
- `hooks/useAdminPaymentVerification.ts`

### **Task 3.3: Update Existing Hooks**

**Files to Modify**:
- `hooks/useOrders.ts` - Add payment verification status
- `hooks/useCart.ts` - Add payment method selection
- `hooks/index.ts` - Export new hooks

---

## 📱 **PHASE 4: Screen Implementations**

### **Task 4.1: Customer Payment Screens**

**Files to Create/Modify**:
- `app/(customer)/payment/qr-code.tsx`
- `app/(customer)/payment/upload-proof.tsx`
- `app/(customer)/checkout.tsx` (modify)

**Implementation**:
```typescript
// app/(customer)/payment/qr-code.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { QRCodeDisplay } from '../../../components/payment/QRCodeDisplay';
import { usePayment } from '../../../hooks/usePayment';
import { useTheme } from '../../../contexts/ThemeContext';

export default function QRCodeScreen() {
  const { orderId } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const { generateQRCode, isLoading, error } = usePayment();
  
  const [qrData, setQrData] = useState<{ qr_code_url: string; expires_at: string } | null>(null);

  useEffect(() => {
    if (orderId) {
      loadQRCode();
    }
  }, [orderId]);

  const loadQRCode = async () => {
    try {
      const result = await generateQRCode(orderId as string);
      setQrData(result);
    } catch (err) {
      Alert.alert('Error', 'Failed to generate QR code');
    }
  };

  const handleDownload = () => {
    // Implement QR code download
  };

  const handleRefresh = () => {
    loadQRCode();
  };

  const handleUploadProof = () => {
    router.push(`/(customer)/payment/upload-proof?orderId=${orderId}`);
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
      <ScrollView>
        <ResponsiveView padding="lg">
          <ResponsiveText 
            size="xxl" 
            weight="bold" 
            color={colors.text}
            marginBottom="lg"
          >
            Payment QR Code
          </ResponsiveText>
          
          {qrData && (
            <QRCodeDisplay
              qrCodeUrl={qrData.qr_code_url}
              expiresAt={qrData.expires_at}
              onDownload={handleDownload}
              onRefresh={handleRefresh}
            />
          )}
          
          <ResponsiveView marginTop="lg">
            <ResponsiveText 
              size="md" 
              color={colors.textSecondary}
              marginBottom="md"
            >
              After making payment, upload proof of payment:
            </ResponsiveText>
            
            <TouchableOpacity 
              style={[styles.uploadButton, { backgroundColor: colors.primary }]}
              onPress={handleUploadProof}
            >
              <ResponsiveText size="md" weight="semiBold" color={colors.textInverse}>
                Upload Proof of Payment
              </ResponsiveText>
            </TouchableOpacity>
          </ResponsiveView>
        </ResponsiveView>
      </ScrollView>
    </SafeAreaView>
  );
}
```

### **Task 4.2: Admin Payment Verification Screens**

**Files to Create/Modify**:
- `app/(admin)/payments/verifications.tsx`
- `app/(admin)/payments/verification/[id].tsx`
- `app/(admin)/dashboard/index.tsx` (modify)

### **Task 4.3: Delivery Payment-Aware Screens**

**Files to Modify**:
- `app/(delivery)/orders/available.tsx`
- `app/(delivery)/orders/my-orders.tsx`
- `app/(delivery)/dashboard/index.tsx`

---

## 🔄 **PHASE 5: Integration & Workflow**

### **Task 5.1: Order Flow Integration**

**Files to Modify**:
- `hooks/useOrders.ts`
- `services/order.service.ts`
- `app/(customer)/checkout.tsx`

**Implementation**:
```typescript
// Update order creation to include payment method
const createOrder = async (orderData: CreateOrderRequest) => {
  const order = {
    ...orderData,
    payment_method: orderData.payment_method || 'cod',
    payment_verified: orderData.payment_method === 'cod' // COD is auto-verified
  };
  
  // Create order logic
};

// Update order status updates to check payment verification
const updateOrderStatus = async (orderId: string, status: string) => {
  // Check if payment is verified for non-COD orders
  if (status === 'preparing' && order.payment_method !== 'cod') {
    const paymentStatus = await PaymentService.getPaymentStatus(orderId);
    if (!paymentStatus?.verified) {
      throw new Error('Payment must be verified before preparing order');
    }
  }
  
  // Update order status
};
```

### **Task 5.2: Real-time Notifications**

**Files to Create**:
- `services/notification.service.ts`
- `hooks/useNotifications.ts`
- `components/common/NotificationCenter.tsx`

### **Task 5.3: Error Handling & Validation**

**Files to Create/Modify**:
- `utils/paymentValidation.ts`
- `components/common/ErrorBoundary.tsx`
- `hooks/useErrorHandler.ts`

---

## 🧪 **PHASE 6: Testing & Quality Assurance**

### **Task 6.1: Unit Tests**

**Files to Create**:
- `__tests__/services/payment.service.test.ts`
- `__tests__/hooks/usePayment.test.ts`
- `__tests__/components/payment/QRCodeDisplay.test.tsx`
- `__tests__/services/recommendation.service.test.ts`
- `__tests__/hooks/useRecommendations.test.ts`

### **Task 6.2: Integration Tests**

**Files to Create**:
- `__tests__/integration/payment-flow.test.ts`
- `__tests__/integration/admin-verification.test.ts`
- `__tests__/integration/recommendation-system.test.ts`

### **Task 6.3: E2E Tests**

**Files to Create**:
- `e2e/payment-verification.spec.ts`
- `e2e/admin-dashboard.spec.ts`
- `e2e/recommendation-system.spec.ts`

---

## 📊 **PHASE 7: Performance & Optimization**

### **Task 7.1: Image Optimization**

**Files to Create/Modify**:
- `utils/imageOptimization.ts`
- `components/common/OptimizedImage.tsx`

### **Task 7.2: Caching Strategy**

**Files to Create/Modify**:
- `hooks/useCache.ts`
- `services/cache.service.ts`

### **Task 7.3: Bundle Optimization**

**Files to Modify**:
- `metro.config.js`
- `babel.config.js`

---

## 🚀 **PHASE 8: Deployment & Monitoring**

### **Task 8.1: Environment Configuration**

**Files to Create/Modify**:
- `.env.production`
- `app.config.js`

### **Task 8.2: Monitoring Setup**

**Files to Create**:
- `utils/analytics.ts`
- `utils/crashReporting.ts`

### **Task 8.3: Documentation**

**Files to Create**:
- `docs/API.md`
- `doc

- `docs/COMPONENTS.md`
- `docs/DEPLOYMENT.md`

---

## 📋 **Implementation Checklist**

### **Phase 0: AI-Based Recommendations** ✅
- [ ] Supabase Edge Functions for recommendations
- [ ] Database functions for featured products
- [ ] Recommendation service implementation
- [ ] Recommendation hooks
- [ ] Update homepage with AI recommendations
- [ ] Update product detail with category recommendations
- [ ] Test recommendation algorithms

### **Phase 1: Database Updates** ✅
- [ ] Add QR code fields to payment_transactions
- [ ] Update type definitions
- [ ] Test database migrations

### **Phase 2: UI Components** ✅
- [ ] Payment method selector
- [ ] QR code display component
- [ ] Payment proof upload component
- [ ] Admin verification components
- [ ] Apply responsive design to admin/delivery

### **Phase 3: Services & API** ✅
- [ ] Payment service implementation
- [ ] QR code service implementation
- [ ] File upload service
- [ ] Admin verification service

### **Phase 4: Hooks & State** ✅
- [ ] Payment hooks
- [ ] Admin verification hooks
- [ ] QR code hooks
- [ ] State management updates

### **Phase 5: Screen Implementation** ✅
- [ ] Customer payment screens
- [ ] Admin verification screens
- [ ] Checkout flow updates
- [ ] Order processing updates

### **Phase 6: Integration** ✅
- [ ] Payment workflow integration
- [ ] Order status updates
- [ ] Real-time notifications
- [ ] Error handling

### **Phase 7: Responsive Design** ✅
- [ ] Admin screens responsive
- [ ] Delivery screens responsive
- [ ] Component consistency
- [ ] Cross-device testing

### **Phase 8: Testing** ✅
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance testing

---

## 🎯 **Success Criteria**

### **Functional Requirements**
- [ ] **AI Recommendations**: Featured products based on order history
- [ ] **AI Recommendations**: Personalized recommendations using Fisher-Yates algorithm
- [ ] **AI Recommendations**: Category-based recommendations with random fallback
- [ ] **Payment System**: QR code generation for online payments
- [ ] **Payment System**: Payment proof upload functionality
- [ ] **Payment System**: Admin payment verification interface
- [ ] **Payment System**: Payment-aware order processing
- [ ] **Responsive Design**: Consistent design across all screens

### **Technical Requirements**
- [ ] **Backend**: Supabase Edge Functions for recommendations
- [ ] **Database**: Leverages existing schema with minimal changes
- [ ] **Performance**: Efficient recommendation algorithms
- [ ] **Type Safety**: Type-safe implementation throughout
- [ ] **Error Handling**: Comprehensive error handling
- [ ] **Testing**: Well-tested codebase

### **User Experience Requirements**
- [ ] **Intuitive Flow**: Easy payment and recommendation experience
- [ ] **Clear Indicators**: Status indicators for all processes
- [ ] **Responsive**: Works across all device sizes
- [ ] **Fast**: Quick loading and processing
- [ ] **Accessible**: Accessible design patterns

---

## 🤖 **AI Recommendation System Details**

### **Algorithm Specifications**

#### **1. Featured Products (Top Ordered)**
- **Data Source**: `order_items` joined with `orders`
- **Algorithm**: Count orders per product, sort by count
- **Limit**: 2 products
- **Display**: Horizontal scroll in "Featured Products" section

#### **2. Personalized Recommendations (Fisher-Yates)**
- **Data Source**: All available products
- **Algorithm**: Fisher-Yates shuffle for random selection
- **Limit**: 2-4 products (scrollable)
- **Display**: Horizontal scroll in "Recommended For You" section

#### **3. Category Recommendations**
- **Data Source**: Products from same category
- **Algorithm**: 
  - Primary: Same category products (excluding current)
  - Fallback: Random products if category has only 1 item
- **Limit**: 4 products
- **Display**: Horizontal scroll in "You May Also Like" section

### **Implementation Benefits**
- **No External APIs**: Pure Supabase backend implementation
- **Scalable**: Efficient database queries
- **Customizable**: Easy to modify algorithms
- **Performance**: Fast response times
- **Maintainable**: Clean, readable code

---

## 📊 **Database Schema for Recommendations**

### **Existing Tables Used**
- `products` - Product catalog
- `categories` - Product categories
- `order_items` - Order history for featured products
- `orders` - Order status filtering

### **New Functions Added**
- `get_featured_products(limit_count)` - SQL function for top products
- `recommendations` - Supabase Edge Function for all recommendation types

### **No Schema Changes Required**
- Uses existing product and order data
- Leverages current relationships
- No additional tables needed

---

## 🔧 **Development Workflow**

### **Step 1: Backend Setup**
1. Deploy Supabase Edge Functions
2. Create database functions
3. Test recommendation algorithms
4. Verify data accuracy

### **Step 2: Frontend Integration**
1. Create recommendation service
2. Implement recommendation hooks
3. Update homepage with AI recommendations
4. Add category recommendations to product detail

### **Step 3: Payment System**
1. Implement payment components
2. Add payment verification workflow
3. Update order processing
4. Apply responsive design

### **Step 4: Testing & Optimization**
1. Test all recommendation algorithms
2. Verify payment workflows
3. Performance optimization
4. Cross-device testing

---

## 📞 **Support & Resources**

### **Documentation**
- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

### **Tools & Libraries**
- [React Query](https://tanstack.com/query/latest)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Expo Router](https://expo.github.io/router/)
- [React Native Paper](https://reactnativepaper.com/)
- [QRCode Library](https://www.npmjs.com/package/qrcode)

### **Testing Tools**
- [Jest](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Detox](https://github.com/wix/Detox)

### **Algorithm References**
- [Fisher-Yates Shuffle](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
- [SQL Window Functions](https://www.postgresql.org/docs/current/tutorial-window.html)
- [Supabase RPC Functions](https://supabase.com/docs/guides/database/functions)

---

## 🎯 **Key Features Summary**

### **AI-Based Recommendations**
- ✅ **Featured Products**: Top ordered products from history
- ✅ **Personalized**: Fisher-Yates shuffled recommendations
- ✅ **Category-Based**: Same category with random fallback
- ✅ **Backend-Only**: Pure Supabase implementation

### **Payment Verification System**
- ✅ **QR Code Generation**: For online payments
- ✅ **Proof Upload**: Customer payment proof submission
- ✅ **Admin Verification**: Manual verification workflow
- ✅ **Order Integration**: Payment-aware order processing

### **Responsive Design System**
- ✅ **Consistent Components**: ResponsiveView and ResponsiveText
- ✅ **Cross-Device**: Works on all screen sizes
- ✅ **Admin/Delivery**: Applied to all user roles
- ✅ **Maintainable**: Centralized design system

---

**This implementation guide provides a comprehensive roadmap to complete all missing features in the Kitchen One App system, with special focus on AI-based recommendations and payment verification workflows. The implementation is designed to be incremental, maintainable, and leverages your existing database schema effectively.**