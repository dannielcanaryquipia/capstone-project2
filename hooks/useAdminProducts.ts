import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { ProductService } from '../services/product.service';
import { Product, ProductCategory, ProductFilters } from '../types/product.types';

export const useAdminProducts = (filters?: ProductFilters) => {
  const queryClient = useQueryClient();

  const productsQueryKey = useMemo(() => ['admin', 'products', filters ?? {}], [filters]);
  const categoriesQueryKey = useMemo(() => ['admin', 'categories'], []);

  const {
    data: products,
    isLoading: isLoadingProducts,
    isFetching: isFetchingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery<Product[], Error>({
    queryKey: productsQueryKey,
    queryFn: () => ProductService.getProducts(filters),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  const {
    data: categories,
    isLoading: isLoadingCategories,
    isFetching: isFetchingCategories,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery<ProductCategory[], Error>({
    queryKey: categoriesQueryKey,
    queryFn: () => ProductService.getCategories(),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });

  // Real-time subscription for product updates
  useEffect(() => {
    const channel = supabase
      .channel('admin-products-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: productsQueryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, productsQueryKey]);

  // Real-time subscription for category updates
  useEffect(() => {
    const channel = supabase
      .channel('admin-categories-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, categoriesQueryKey]);

  return {
    products: products ?? [],
    categories: categories ?? [],
    isLoading: isLoadingProducts || isLoadingCategories,
    error: (productsError || categoriesError)?.message ?? null,
    refreshing: isFetchingProducts || isFetchingCategories,
    refresh: async () => {
      await Promise.all([refetchProducts(), refetchCategories()]);
    },
  };
};
