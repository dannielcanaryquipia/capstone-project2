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
    try {
      // Try Edge Function first
      const { data, error } = await supabase.functions.invoke('recommendations', {
        body: {
          type: 'featured',
          limit
        }
      });

      if (error) throw error;
      return data.recommendations || [];
    } catch (error) {
      console.warn('Edge Function not available, falling back to direct database query:', error);
      
      // Fallback to direct database query
      try {
        const { data, error: dbError } = await supabase
          .rpc('get_featured_products', { limit_count: limit });

        if (dbError) throw dbError;
        return data || [];
      } catch (dbError) {
        console.warn('Database function failed, using basic query:', dbError);
        
        // Final fallback: get available products marked as featured
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('is_available', true)
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (productsError) {
          console.warn('Featured products query failed, using all available products:', productsError);
          
          // Ultimate fallback: get any available products
          const { data: allProducts, error: allError } = await supabase
            .from('products')
            .select('*')
            .eq('is_available', true)
            .order('created_at', { ascending: false })
            .limit(limit);

          if (allError) throw allError;
          return allProducts || [];
        }
        
        return products || [];
      }
    }
  }

  // Get personalized recommendations (Fisher-Yates shuffle)
  static async getPersonalizedRecommendations(userId: string, limit: number = 4): Promise<Product[]> {
    try {
      // Try Edge Function first
      const { data, error } = await supabase.functions.invoke('recommendations', {
        body: {
          type: 'personalized',
          userId,
          limit
        }
      });

      if (error) throw error;
      return data.recommendations || [];
    } catch (error) {
      console.warn('Edge Function not available, falling back to direct database query:', error);
      
      // Fallback: Get random available products
      try {
        const { data: products, error: dbError } = await supabase
          .from('products')
          .select('*')
          .eq('is_available', true)
          .limit(limit * 2); // Get more to shuffle

        if (dbError) throw dbError;
        
        // Apply Fisher-Yates shuffle
        const shuffled = this.fisherYatesShuffle(products || []);
        return shuffled.slice(0, limit);
      } catch (dbError) {
        console.error('Database fallback failed:', dbError);
        return [];
      }
    }
  }

  // Get category-based recommendations
  static async getCategoryRecommendations(categoryId: string, productId: string, limit: number = 4): Promise<Product[]> {
    try {
      // Try Edge Function first
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
    } catch (error) {
      console.warn('Edge Function not available, falling back to direct database query:', error);
      
      // Fallback: Get products from same category
      try {
        const { data: categoryProducts, error: dbError } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', categoryId)
          .eq('is_available', true)
          .neq('id', productId)
          .limit(limit);

        if (dbError) throw dbError;
        
        if (categoryProducts && categoryProducts.length > 0) {
          return categoryProducts;
        }

        // Fallback: Get random products from all categories
        const { data: allProducts, error: allError } = await supabase
          .from('products')
          .select('*')
          .eq('is_available', true)
          .neq('id', productId)
          .limit(limit);

        if (allError) throw allError;
        
        const shuffled = this.fisherYatesShuffle(allProducts || []);
        return shuffled.slice(0, limit);
      } catch (dbError) {
        console.error('Database fallback failed:', dbError);
        return [];
      }
    }
  }

  // Get random recommendations
  static async getRandomRecommendations(limit: number = 4): Promise<Product[]> {
    try {
      // Try Edge Function first
      const { data, error } = await supabase.functions.invoke('recommendations', {
        body: {
          type: 'random',
          limit
        }
      });

      if (error) throw error;
      return data.recommendations || [];
    } catch (error) {
      console.warn('Edge Function not available, falling back to direct database query:', error);
      
      // Fallback: Get random available products
      try {
        const { data: products, error: dbError } = await supabase
          .from('products')
          .select('*')
          .eq('is_available', true)
          .limit(limit * 2); // Get more to shuffle

        if (dbError) throw dbError;
        
        // Apply Fisher-Yates shuffle
        const shuffled = this.fisherYatesShuffle(products || []);
        return shuffled.slice(0, limit);
      } catch (dbError) {
        console.error('Database fallback failed:', dbError);
        return [];
      }
    }
  }

  // Fisher-Yates Shuffle Algorithm
  private static fisherYatesShuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
