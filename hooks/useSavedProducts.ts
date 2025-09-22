import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types/product.types';
import { useAuth } from './useAuth';

export interface SavedProduct {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export const useSavedProducts = () => {
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchSavedProducts = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('saved_products')
        .select(`
          *,
          product:products(
            *,
            category:categories(name, description)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedProducts(data || []);
    } catch (err: any) {
      console.error('Error fetching saved products:', err);
      setError(err.message || 'Failed to load saved products');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSavedProducts();
  }, [fetchSavedProducts]);

  // Real-time subscription for saved products updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('saved-products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'saved_products',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Saved product change received:', payload);
          fetchSavedProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchSavedProducts]);

  const refresh = useCallback(() => {
    fetchSavedProducts();
  }, [fetchSavedProducts]);

  return {
    savedProducts,
    isLoading,
    error,
    refresh,
  };
};

export const useSaveProduct = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const saveProduct = useCallback(async (productId: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Check if product is already saved
      const { data: existing, error: checkError } = await supabase
        .from('saved_products')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existing) {
        throw new Error('Product is already saved');
      }

      const { data, error } = await supabase
        .from('saved_products')
        .insert({
          user_id: user.id,
          product_id: productId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error saving product:', err);
      setError(err.message || 'Failed to save product');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  return {
    saveProduct,
    isLoading,
    error,
  };
};

export const useUnsaveProduct = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const unsaveProduct = useCallback(async (productId: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase
        .from('saved_products')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
    } catch (err: any) {
      console.error('Error unsaving product:', err);
      setError(err.message || 'Failed to unsave product');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  return {
    unsaveProduct,
    isLoading,
    error,
  };
};

export const useToggleSaveProduct = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const toggleSaveProduct = useCallback(async (productId: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Check if product is already saved
      const { data: existing, error: checkError } = await supabase
        .from('saved_products')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existing) {
        // Unsave the product
        const { error: deleteError } = await supabase
          .from('saved_products')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (deleteError) throw deleteError;
        return { action: 'unsaved', savedProduct: null };
      } else {
        // Save the product
        const { data, error: insertError } = await supabase
          .from('saved_products')
          .insert({
            user_id: user.id,
            product_id: productId,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return { action: 'saved', savedProduct: data };
      }
    } catch (err: any) {
      console.error('Error toggling save product:', err);
      setError(err.message || 'Failed to toggle save product');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  return {
    toggleSaveProduct,
    isLoading,
    error,
  };
};

export const useIsProductSaved = (productId: string) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const checkIfSaved = useCallback(async () => {
    if (!user?.id || !productId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('saved_products')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setIsSaved(!!data);
    } catch (err: any) {
      console.error('Error checking if product is saved:', err);
      setError(err.message || 'Failed to check if product is saved');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, productId]);

  useEffect(() => {
    checkIfSaved();
  }, [checkIfSaved]);

  return {
    isSaved,
    isLoading,
    error,
    refresh: checkIfSaved,
  };
};

export const useSavedProductsCount = () => {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchCount = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { count, error } = await supabase
        .from('saved_products')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;
      setCount(count || 0);
    } catch (err: any) {
      console.error('Error fetching saved products count:', err);
      setError(err.message || 'Failed to load saved products count');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  // Real-time subscription for count updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('saved-products-count-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'saved_products',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Saved product count change received:', payload);
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchCount]);

  return {
    count,
    isLoading,
    error,
    refresh: fetchCount,
  };
};

// Hook to get saved product IDs for quick checking
export const useSavedProductIds = () => {
  const { savedProducts, isLoading, error } = useSavedProducts();
  
  const savedProductIds = savedProducts.map(sp => sp.product_id);
  
  return {
    savedProductIds,
    isLoading,
    error,
  };
};
