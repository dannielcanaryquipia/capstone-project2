import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types/product.types';

export const useTopProducts = (limit: number = 5) => {
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get top products - for now sort by creation date, can be enhanced later with actual order counts
      const { data, error: dbError } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name)
        `)
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (dbError) throw dbError;

      // Sort by creation date for now (can be enhanced with actual order counts later)
      const sortedProducts = data || [];

      setTopProducts(sortedProducts);
    } catch (err: any) {
      console.error('Error fetching top products:', err);
      setError(err.message || 'Failed to load top products');
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchTopProducts();
  }, [fetchTopProducts]);

  // Real-time subscription for product updates
  useEffect(() => {
    const channel = supabase
      .channel('top-products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        (payload) => {
          console.log('Product change received for top products:', payload);
          fetchTopProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTopProducts]);

  return {
    topProducts,
    isLoading,
    error,
    refresh: fetchTopProducts,
  };
};
