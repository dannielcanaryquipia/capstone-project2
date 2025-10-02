import { useCallback, useEffect, useState } from 'react';
import { Product, RecommendationService } from '../services/recommendation.service';
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
