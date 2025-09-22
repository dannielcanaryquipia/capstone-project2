import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase-client';

interface SavedProduct {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    tags?: string[];
  };
}

interface SavedProductsContextType {
  savedProducts: SavedProduct[];
  savedProductIds: Set<string>;
  isLoading: boolean;
  error: string | null;
  saveProduct: (productId: string) => Promise<void>;
  unsaveProduct: (productId: string) => Promise<void>;
  toggleSave: (productId: string) => Promise<void>;
  isProductSaved: (productId: string) => boolean;
  refreshSavedProducts: () => Promise<void>;
}

const SavedProductsContext = createContext<SavedProductsContextType | undefined>(undefined);

export const useSavedProducts = () => {
  const context = useContext(SavedProductsContext);
  if (!context) {
    throw new Error('useSavedProducts must be used within a SavedProductsProvider');
  }
  return context;
};

interface SavedProductsProviderProps {
  children: ReactNode;
}

export const SavedProductsProvider: React.FC<SavedProductsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([]);
  const [savedProductIds, setSavedProductIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch saved products from database
  const fetchSavedProducts = async () => {
    if (!user) {
      setSavedProducts([]);
      setSavedProductIds(new Set());
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('saved_products')
        .select(`
          id,
          user_id,
          product_id,
          created_at,
          products!inner(
            id,
            name,
            base_price,
            image_url,
            category:categories(name),
            is_recommended
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData: SavedProduct[] = data?.map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        product_id: item.product_id,
        created_at: item.created_at,
        product: {
          id: item.products.id,
          name: item.products.name,
          price: item.products.base_price,
          image: item.products.image_url,
          category: item.products.category?.name || 'Unknown',
          tags: item.products.is_recommended ? ['Recommended'] : [],
        }
      })) || [];

      setSavedProducts(formattedData);
      setSavedProductIds(new Set(formattedData.map(item => item.product_id)));
    } catch (err) {
      console.error('Error fetching saved products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch saved products');
    } finally {
      setIsLoading(false);
    }
  };

  // Save a product
  const saveProduct = async (productId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_products')
        .insert({
          user_id: user.id,
          product_id: productId,
        });

      if (error) throw error;

      // Refresh the list
      await fetchSavedProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err instanceof Error ? err.message : 'Failed to save product');
    }
  };

  // Unsave a product
  const unsaveProduct = async (productId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_products')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      // Refresh the list
      await fetchSavedProducts();
    } catch (err) {
      console.error('Error unsaving product:', err);
      setError(err instanceof Error ? err.message : 'Failed to unsave product');
    }
  };

  // Toggle save/unsave
  const toggleSave = async (productId: string) => {
    if (isProductSaved(productId)) {
      await unsaveProduct(productId);
    } else {
      await saveProduct(productId);
    }
  };

  // Check if product is saved
  const isProductSaved = (productId: string): boolean => {
    return savedProductIds.has(productId);
  };

  // Refresh saved products
  const refreshSavedProducts = async () => {
    await fetchSavedProducts();
  };

  // Load saved products when user changes
  useEffect(() => {
    fetchSavedProducts();
  }, [user]);

  const value: SavedProductsContextType = {
    savedProducts,
    savedProductIds,
    isLoading,
    error,
    saveProduct,
    unsaveProduct,
    toggleSave,
    isProductSaved,
    refreshSavedProducts,
  };

  return (
    <SavedProductsContext.Provider value={value}>
      {children}
    </SavedProductsContext.Provider>
  );
};

export default SavedProductsContext;
