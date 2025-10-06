import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ProductService } from '../services/product.service';
import { Product, ProductCategory, ProductFilters, ProductStats } from '../types/product.types';

export const useProducts = (filters?: ProductFilters) => {
  const pageSize = 20;
  const key = useMemo(() => ['products-lite', filters ?? {}], [filters]);

  const query = useInfiniteQuery<Product[], Error>({
    queryKey: key,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const offset = (pageParam as number) * pageSize;
      return ProductService.getProductsLite(filters, { limit: pageSize, offset });
    },
    getNextPageParam: (lastPage, allPages) => (lastPage.length < pageSize ? undefined : allPages.length),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  const products = (query.data?.pages ?? []).flat();

  // Real-time subscription for product updates
  useEffect(() => {
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        () => query.refetch()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [query]);

  const refresh = useCallback(async () => {
    await query.refetch();
  }, [query]);

  return {
    products,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refresh,
    loadMore: query.fetchNextPage,
    hasMore: !!query.hasNextPage,
    isFetchingMore: query.isFetchingNextPage,
  };
};

export const useProduct = (productId: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!productId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await ProductService.getProductById(productId);
      setProduct(data);
    } catch (err: any) {
      console.error('Error fetching product:', err);
      setError(err.message || 'Failed to load product');
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Real-time subscription for specific product updates
  useEffect(() => {
    if (!productId) return;

    const channel = supabase
      .channel(`product-${productId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `id=eq.${productId}`,
        },
        (payload) => {
          console.log('Product update received:', payload);
          setProduct(payload.new as Product);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId]);

  const refresh = useCallback(() => {
    fetchProduct();
  }, [fetchProduct]);

  return {
    product,
    isLoading,
    error,
    refresh,
  };
};

export const useProductCategories = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ProductService.getCategories();
      setCategories(data);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Real-time subscription for category updates
  useEffect(() => {
    const channel = supabase
      .channel('categories-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories',
        },
        (payload) => {
          console.log('Category change received:', payload);
          fetchCategories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCategories]);

  const refresh = useCallback(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    isLoading,
    error,
    refresh,
  };
};

export const useProductStats = () => {
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ProductService.getProductStats();
      setStats(data);
    } catch (err: any) {
      console.error('Error fetching product stats:', err);
      setError(err.message || 'Failed to load product statistics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refresh = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refresh,
  };
};

export const useProductSearch = (query: string) => {
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProducts = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await ProductService.searchProducts(searchQuery);
      setSearchResults(data);
    } catch (err: any) {
      console.error('Error searching products:', err);
      setError(err.message || 'Failed to search products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts(query);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [query, searchProducts]);

  return {
    searchResults,
    isLoading,
    error,
    searchProducts,
  };
};

export const useLowStockProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLowStockProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ProductService.getLowStockProducts();
      setProducts(data);
    } catch (err: any) {
      console.error('Error fetching low stock products:', err);
      setError(err.message || 'Failed to load low stock products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLowStockProducts();
  }, [fetchLowStockProducts]);

  // Real-time subscription for stock updates
  useEffect(() => {
    const channel = supabase
      .channel('stock-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_stock',
        },
        (payload) => {
          console.log('Stock change received:', payload);
          fetchLowStockProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLowStockProducts]);

  const refresh = useCallback(() => {
    fetchLowStockProducts();
  }, [fetchLowStockProducts]);

  return {
    products,
    isLoading,
    error,
    refresh,
  };
};
