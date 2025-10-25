import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import Responsive from '../../constants/Responsive';
import { useSavedProducts } from '../../contexts/SavedProductsContext';
import { useTheme } from '../../contexts/ThemeContext';
import type { Product } from '../../types/product.types';
import ProductCard from './ProductCard';
import ResponsiveText from './ResponsiveText';
import ResponsiveView from './ResponsiveView';

interface RecommendedProductsFallbackProps {
  products: Product[];
  searchQuery?: string;
  maxItems?: number;
  showAllProducts?: boolean; // New prop to show all products instead of just recommended
  onProductPress?: (product: Product) => void;
}

export default function RecommendedProductsFallback({
  products,
  searchQuery,
  maxItems = 6,
  showAllProducts = false,
  onProductPress
}: RecommendedProductsFallbackProps) {
  const { colors } = useTheme();
  const { isProductSaved, toggleSave } = useSavedProducts();
  const router = useRouter();

  // Fisher-Yates shuffle algorithm
  const shuffleArray = useCallback((array: Product[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Get recommended products using Fisher-Yates shuffle algorithm
  const recommendedProducts = useMemo(() => {
    if (!products || products.length === 0) {
      return [];
    }

    // Always shuffle and show products (prioritize recommended if available)
    const recommended = products.filter(product => product.is_recommended);
    
    // If we have a search query, try to find products that might be related
    if (searchQuery && searchQuery.trim().length > 0) {
      const searchLower = searchQuery.trim().toLowerCase();
      
      // Find products that might be related to the search (partial matches)
      const relatedProducts = products.filter(product => {
        const nameMatch = product.name.toLowerCase().includes(searchLower);
        const descMatch = product.description?.toLowerCase().includes(searchLower) || false;
        const categoryMatch = product.category?.name?.toLowerCase().includes(searchLower) || false;
        return nameMatch || descMatch || categoryMatch;
      });

      // Combine related products with recommended products, removing duplicates
      const allProducts = [...relatedProducts, ...recommended];
      const uniqueProducts = allProducts.filter((product, index, self) => 
        index === self.findIndex(p => p.id === product.id)
      );
      
      // If we have related products, use them; otherwise use all products
      const productsToShuffle = uniqueProducts.length > 0 ? uniqueProducts : products;
      const shuffled = shuffleArray(productsToShuffle).slice(0, 4);
      return shuffled;
    }
    
    // If no search query, prioritize recommended products but always show something
    const productsToShuffle = recommended.length > 0 ? recommended : products;
    const result = shuffleArray(productsToShuffle).slice(0, 4);
    return result;
  }, [products, searchQuery, shuffleArray]);

  const handleProductPress = (product: Product) => {
    if (onProductPress) {
      onProductPress(product);
    } else {
      router.push(`/(customer)/product/${product.id}`);
    }
  };

  const handleClearSearch = () => {
    // Navigate to menu page and clear search state
    router.replace('/(customer)/menu');
  };

  // Always show the fallback, even if no recommended products
  // This ensures users see something when there are no search results

  const numColumns = Responsive.responsiveValue(1, 1, 2, 2); // 1 column on mobile, 2 columns on tablet and larger

  return (
    <ResponsiveView flex={1} paddingHorizontal="lg">
      {/* No Results Message - Smaller and less prominent */}
      <ResponsiveView 
        alignItems="center" 
        paddingVertical="md"
        marginBottom="md"
      >
        <ResponsiveView 
          backgroundColor={colors.surfaceVariant}
          borderRadius="round"
          padding="sm"
          marginBottom="sm"
        >
          <MaterialIcons 
            name="search-off" 
            size={Responsive.responsiveValue(24, 28, 32, 36)} 
            color={colors.textSecondary} 
          />
        </ResponsiveView>
        
        <ResponsiveView marginBottom="xs">
          <ResponsiveText 
            size="md" 
            weight="semiBold" 
            color={colors.textSecondary}
            style={{ textAlign: 'center' }}
          >
            No products found
          </ResponsiveText>
        </ResponsiveView>
        
        {searchQuery && (
          <ResponsiveView marginBottom="sm">
            <ResponsiveText 
              size="sm" 
              color={colors.textSecondary}
              style={{ textAlign: 'center' }}
            >
              No results for "{searchQuery}"
            </ResponsiveText>
          </ResponsiveView>
        )}
        
        <TouchableOpacity
          style={[styles.clearSearchButton, { backgroundColor: colors.primary }]}
          onPress={handleClearSearch}
        >
          <MaterialIcons 
            name="clear" 
            size={Responsive.responsiveValue(16, 18, 20, 22)} 
            color="#FFFFFF"
            style={{ marginRight: Responsive.ResponsiveSpacing.xs }}
          />
          <ResponsiveText 
            size="sm" 
            weight="semiBold" 
            color="#FFFFFF"
          >
            Clear Search
          </ResponsiveText>
        </TouchableOpacity>
      </ResponsiveView>

      {/* Recommended Products Section - Always show if there are any products available */}
      {products && products.length > 0 && (
        <>
          <ResponsiveView marginBottom="lg">
            <ResponsiveView marginBottom="md">
              <ResponsiveText 
                size="xxl" 
                weight="bold" 
                color={colors.text}
              >
                Recommended Products
              </ResponsiveText>
            </ResponsiveView>

            <ResponsiveView marginBottom="lg">
              <ResponsiveText 
                size="md" 
                color={colors.textSecondary}
              >
                Try these popular items instead
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>

          {/* Products Grid - Responsive 2-column layout */}
          {recommendedProducts.length > 0 ? (
            <FlatList
              data={recommendedProducts}
              keyExtractor={(item) => `recommended-${item.id}`}
              numColumns={numColumns}
              key={`recommended-${numColumns}`}
              columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            renderItem={({ item }) => (
              <ResponsiveView 
                flex={1} 
                marginRight={numColumns > 1 ? "sm" : "none"}
                marginBottom="md"
              >
                <ProductCard
                  id={item.id}
                  name={item.name}
                  description={item.description}
                  price={item.base_price || item.price || 0}
                  image={item.image_url || ''}
                  onPress={() => handleProductPress(item)}
                />
              </ResponsiveView>
            )}
              contentContainerStyle={styles.productsContainer}
            />
          ) : (
            <ResponsiveView padding="lg" alignItems="center">
              <ResponsiveText color={colors.textSecondary}>
                No recommended products available
              </ResponsiveText>
            </ResponsiveView>
          )}
        </>
      )}

      {/* Fallback when no products available at all */}
      {(!products || products.length === 0) && (
        <ResponsiveView 
          alignItems="center" 
          paddingVertical="xl"
          marginTop="lg"
        >
          <ResponsiveView 
            backgroundColor={colors.surfaceVariant}
            borderRadius="round"
            padding="lg"
            marginBottom="md"
          >
            <MaterialIcons 
              name="restaurant-menu" 
              size={Responsive.responsiveValue(48, 56, 64, 72)} 
              color={colors.textSecondary} 
            />
          </ResponsiveView>
          
          <ResponsiveView marginBottom="sm">
            <ResponsiveText 
              size="lg" 
              weight="bold" 
              color={colors.text}
              style={{ textAlign: 'center' }}
            >
              No products available
            </ResponsiveText>
          </ResponsiveView>
          
          <ResponsiveView marginBottom="lg">
            <ResponsiveText 
              size="md" 
              color={colors.textSecondary}
              style={{ textAlign: 'center' }}
            >
              Check back later for new items
            </ResponsiveText>
          </ResponsiveView>
          
          <TouchableOpacity
            style={[styles.clearSearchButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(customer)/menu')}
          >
            <ResponsiveText 
              size="md" 
              weight="semiBold" 
              color="#FFFFFF"
            >
              Browse Menu
            </ResponsiveText>
          </TouchableOpacity>
        </ResponsiveView>
      )}
    </ResponsiveView>
  );
}

const styles = StyleSheet.create({
  clearSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Responsive.ResponsiveSpacing.md,
    paddingVertical: Responsive.ResponsiveSpacing.sm,
    borderRadius: Responsive.ResponsiveBorderRadius.sm,
  },
  row: {
    justifyContent: 'space-between',
  },
  productsContainer: {
    paddingBottom: Responsive.ResponsiveSpacing.xl,
    flexGrow: 1,
  },
});
