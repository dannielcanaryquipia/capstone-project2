import { useCallback, useEffect, useState } from 'react';
import { ProductDetail, ProductDetailService } from '../services/product-detail.service';

export const useProductDetail = (productId: string) => {
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductDetail = useCallback(async () => {
    if (!productId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await ProductDetailService.getProductDetail(productId);
      setProductDetail(data);
    } catch (err: any) {
      console.error('Error fetching product detail:', err);
      setError(err.message || 'Failed to load product details');
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProductDetail();
  }, [fetchProductDetail]);

  const refresh = useCallback(() => {
    fetchProductDetail();
  }, [fetchProductDetail]);

  return {
    productDetail,
    isLoading,
    error,
    refresh,
  };
};

export const useCrusts = () => {
  const [crusts, setCrusts] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCrusts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ProductDetailService.getCrusts();
      setCrusts(data);
    } catch (err: any) {
      console.error('Error fetching crusts:', err);
      setError(err.message || 'Failed to load crusts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCrusts();
  }, [fetchCrusts]);

  return {
    crusts,
    isLoading,
    error,
    refresh: fetchCrusts,
  };
};

export const useToppings = () => {
  const [toppings, setToppings] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchToppings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ProductDetailService.getToppings();
      setToppings(data);
    } catch (err: any) {
      console.error('Error fetching toppings:', err);
      setError(err.message || 'Failed to load toppings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToppings();
  }, [fetchToppings]);

  return {
    toppings,
    isLoading,
    error,
    refresh: fetchToppings,
  };
};
