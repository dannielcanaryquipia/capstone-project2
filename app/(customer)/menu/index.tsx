import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../../../components/ui/ProductCard';
import RecommendedProductsFallback from '../../../components/ui/RecommendedProductsFallback';
import ResponsiveText from '../../../components/ui/ResponsiveText';
import ResponsiveView from '../../../components/ui/ResponsiveView';
import Responsive from '../../../constants/Responsive';
import { useSavedProducts } from '../../../contexts/SavedProductsContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useProductCategories, useProducts } from '../../../hooks';
import type { Product, ProductCategory } from '../../../types/product.types';

// Default categories for UI display
const defaultCategories = [
  { id: 'all', name: 'All' },
];

export default function MenuScreen() {
  const { colors } = useTheme();
  const { isProductSaved, toggleSave } = useSavedProducts();
  const router = useRouter();
  const { category, search } = useLocalSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const didInitFromParamsRef = useRef(false);

  // Use hooks for data fetching
  const { products, isLoading: productsLoading, error: productsError } = useProducts();
  const { categories: dbCategories, isLoading: categoriesLoading } = useProductCategories();
  
  // Debug logging
  console.log('Menu - Products loaded:', products?.length || 0);
  console.log('Menu - First product sample:', products?.[0] ? {
    id: products[0].id,
    name: products[0].name,
    image_url: products[0].image_url,
    hasImage: !!products[0].image_url
  } : 'No products');

  // Combine default categories with database categories
  const allCategories = [
    ...defaultCategories,
    ...dbCategories.map((cat: ProductCategory) => ({
      id: cat.id,
      name: (cat.name || '').trim(),
    }))
  ];


  // Memoized category lookup for better performance
  const categoryLookup = useMemo(() => {
    const lookup = new Map();
    allCategories.forEach(cat => {
      lookup.set(cat.id, cat.name);
    });
    return lookup;
  }, [allCategories]);

  // Normalize category names for robust comparisons
  const normalizeCategoryName = useCallback((name?: string) => (name || '').trim().toLowerCase(), []);

  // Helper function to get product count for a category (memoized)
  const getCategoryProductCount = useCallback((categoryId: string) => {
    if (categoryId === 'all') return products.length;
    const categoryName = categoryLookup.get(categoryId);
    const normTarget = normalizeCategoryName(categoryName);
    return products.filter(p => normalizeCategoryName(p.category?.name) === normTarget).length;
  }, [products, categoryLookup, normalizeCategoryName]);

  // Set initial category and search based on route parameters (only once)
  useEffect(() => {
    if (didInitFromParamsRef.current) return;

    if (category) {
      const foundCategory = allCategories.find(c => c.name.toLowerCase() === category.toString().toLowerCase());
      if (foundCategory) {
        setSelectedCategory(foundCategory.id);
      }
    }
    if (search) {
      setSearchQuery(search.toString());
    }

    didInitFromParamsRef.current = true;
  }, [category, search, allCategories]);

  // Enhanced search and filtering logic
  const filteredItems = useMemo(() => {
    // Early return if no products
    if (!products || products.length === 0) {
      return [];
    }
    
    const categoryName = categoryLookup.get(selectedCategory);
    const normSelected = normalizeCategoryName(categoryName);
    const searchLower = searchQuery.trim().toLowerCase();
    
    
    return products.filter((product: Product) => {
      // If no search query, show all products in category
      if (!searchLower) {
        if (selectedCategory === 'all') return true;
        const productCategoryName = normalizeCategoryName(product.category?.name);
        const matches = productCategoryName === normSelected;
        return matches;
      }
      
      // Search in product name, description, and category (case-insensitive)
      const nameMatch = product.name.toLowerCase().includes(searchLower);
      const descMatch = product.description?.toLowerCase().includes(searchLower) || false;
      const categoryMatchSearch = product.category?.name?.toLowerCase().includes(searchLower) || false;
      const matchesSearch = nameMatch || descMatch || categoryMatchSearch;
      
      // Handle "All" category with search
      if (selectedCategory === 'all') return matchesSearch;
      
      // For database categories, filter by both category and search
      const productCategoryName = normalizeCategoryName(product.category?.name);
      const categoryMatch = productCategoryName === normSelected;
      const finalMatch = categoryMatch && matchesSearch;
      return finalMatch;
    });
  }, [products, selectedCategory, searchQuery, categoryLookup, normalizeCategoryName]);

  // Optimized category selection handler
  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  // Remove emojis from input (ban emoji usage in search)
  const removeEmojis = useCallback((value: string) => {
    // Covers most emoji blocks (Misc Symbols & Pictographs, Transport & Map, Supplemental Symbols & Pictographs)
    // plus common symbols range
    const emojiRegex = /[\u2600-\u27BF\u{1F300}-\u{1F6FF}\u{1F900}-\u{1FAFF}]/gu;
    return value.replace(emojiRegex, '');
  }, []);

  // Enhanced search handlers
  const handleSearchChange = useCallback((text: string) => {
    // Strip emojis before setting state
    const sanitized = removeEmojis(text);
    setSearchQuery(sanitized);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleSearchSubmit = useCallback(() => {
    // Search is handled automatically by the filteredItems memo
    // This can be used for additional search logic if needed
  }, []);

  // Memoized product card renderer for better performance
  const renderProductCard = useCallback(({ item }: { item: Product }) => {
    console.log('Menu Product:', {
      id: item.id,
      name: item.name,
      image_url: item.image_url,
      hasImage: !!item.image_url
    });
    return (
      <ProductCard
        id={item.id}
        name={item.name}
        description={item.description}
        price={item.base_price}
        image={item.image_url || 'https://via.placeholder.com/200x150'}
        tags={item.is_recommended ? ['Recommended'] : []}
        variant="vertical"
        backgroundColor={colors.card}
        textColor={colors.text}
        priceColor={colors.themedPrice}
        onPress={() => router.push({
          pathname: '/(customer)/product/[id]',
          params: { id: item.id }
        } as any)}
      />
    );
  }, [colors, router]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Back + Search Bar */}
      <ResponsiveView flexDirection="row" alignItems="center" paddingHorizontal="lg" marginVertical="md">
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: Responsive.ResponsiveSpacing.sm, padding: Responsive.responsiveValue(4, 6, 8, 10) }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <MaterialIcons 
            name="arrow-back" 
            size={Responsive.responsiveValue(20, 22, 24, 26)} 
            color={colors.text}
          />
        </TouchableOpacity>
        <ResponsiveView 
          flex={1}
          flexDirection="row" 
          alignItems="center" 
          backgroundColor={colors.surface}
          borderRadius="md"
          paddingHorizontal="md"
          height={Responsive.InputSizes.medium.height}
          style={[styles.searchBarShadow, { borderColor: colors.border, borderWidth: 1 }]}
        >
          <MaterialIcons 
            name="search" 
            size={Responsive.responsiveValue(20, 22, 24, 26)} 
            color={colors.textSecondary}
            style={{ marginRight: Responsive.ResponsiveSpacing.sm }}
          />
          <TextInput
            style={[
              styles.searchInput, 
              { 
                color: colors.text,
                fontSize: Responsive.InputSizes.medium.fontSize
              }
            ]}
            placeholder="Search for food"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearchChange}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {/* Clear icon temporarily removed for debugging */}
        </ResponsiveView>
      </ResponsiveView>

      {/* Categories */}
      <ResponsiveView marginBottom="sm">
        {categoriesLoading ? (
          <ResponsiveView padding="md" alignItems="center">
            <ResponsiveText color={colors.textSecondary}>Loading categories...</ResponsiveText>
          </ResponsiveView>
        ) : (
          <FlatList
            data={allCategories}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: Responsive.ResponsiveSpacing.md }}
            renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryItem,
                {
                  backgroundColor: selectedCategory === item.id ? colors.categoryButtonActiveFill : 'transparent',
                  borderColor: selectedCategory === item.id ? colors.categoryButtonActiveFill : colors.categoryButtonBorder,
                  borderWidth: 1,
                },
                selectedCategory === item.id && styles.categoryItemActive,
              ]}
              onPress={() => handleCategorySelect(item.id)}
            >
                <ResponsiveText
                  size="sm"
                  color={selectedCategory === item.id ? colors.categoryButtonActiveText : colors.categoryButtonText}
                  weight={selectedCategory === item.id ? 'semiBold' : 'regular'}
                  style={{ textAlign: 'center', lineHeight: undefined }}
                >
                  {item.name}{getCategoryProductCount(item.id) > 0 ? ` (${getCategoryProductCount(item.id)})` : ''}
                </ResponsiveText>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
        />
        )}
      </ResponsiveView>

      {/* Menu Items */}
      {productsLoading ? (
        <ResponsiveView padding="lg" alignItems="center">
          <ResponsiveText color={colors.textSecondary}>Loading products...</ResponsiveText>
        </ResponsiveView>
      ) : productsError ? (
        <ResponsiveView padding="lg" alignItems="center">
          <ResponsiveText color={colors.error}>Error loading products: {productsError}</ResponsiveText>
        </ResponsiveView>
      ) : filteredItems.length === 0 ? (
        <RecommendedProductsFallback
          products={products}
          searchQuery={searchQuery}
          maxItems={4}
        />
      ) : (
        <>
           {/* Search Results Counter */}
           {false && searchQuery && (
             <ResponsiveView 
               paddingHorizontal="lg" 
               paddingBottom="sm"
               flexDirection="row"
               alignItems="center"
               justifyContent="space-between"
             >
               <ResponsiveText size="sm" color={colors.textSecondary}>
                 {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} for "{searchQuery}"
               </ResponsiveText>
               {/* Clear link temporarily removed for debugging */}
             </ResponsiveView>
           )}
           
          {/* Debug info removed */}
          
          <FlatList
            key={`menu-${Responsive.responsiveValue(1, 1, 1, 2)}`}
            data={filteredItems}
            numColumns={Responsive.responsiveValue(1, 1, 1, 2)}
            keyExtractor={(item) => item.id}
            renderItem={renderProductCard}
            contentContainerStyle={{ 
              padding: Responsive.ResponsiveSpacing.md,
              paddingBottom: Responsive.ResponsiveSpacing.xl
            }}
            columnWrapperStyle={Responsive.isTablet ? { 
              justifyContent: 'space-between',
              marginBottom: Responsive.ResponsiveSpacing.md,
              paddingHorizontal: Responsive.ResponsiveSpacing.xs,
              gap: Responsive.ResponsiveSpacing.sm
            } : undefined}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={10}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  categoriesContainer: {
    marginBottom: 10,
  },
  categoriesList: {
    paddingHorizontal: 15,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Responsive.responsiveValue(12, 14, 16, 18),
    paddingVertical: Responsive.responsiveValue(6, 8, 10, 12),
    borderRadius: Responsive.responsiveValue(16, 18, 20, 22),
    marginRight: Responsive.responsiveValue(6, 8, 10, 12),
    minWidth: Responsive.responsiveValue(72, 80, 88, 100),
    minHeight: Responsive.responsiveValue(36, 40, 44, 48),
  },
  categoryItemActive: {
    shadowColor: '#FFE44D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 0, // Remove elevation to prevent text elevation issues
  },
  categoryName: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  menuItemsContainer: {
    padding: 10,
  },
  menuItemsRow: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  menuItem: {
    borderRadius: Responsive.responsiveValue(16, 18, 20, 24),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: Responsive.responsiveValue(2, 3, 4, 6) },
    shadowOpacity: 0.15,
    shadowRadius: Responsive.responsiveValue(6, 8, 10, 12),
    elevation: Responsive.responsiveValue(4, 5, 6, 8),
    marginBottom: Responsive.responsiveValue(12, 14, 16, 20),
  },
  menuItemImageContainer: {
    position: 'relative',
    width: '100%',
  },
  menuItemImage: {
    width: '100%',
    resizeMode: 'cover',
  },
  popularBadge: {
    position: 'absolute',
    top: Responsive.responsiveValue(8, 10, 12, 14),
    left: Responsive.responsiveValue(8, 10, 12, 14),
    backgroundColor: '#FF6B35',
    paddingHorizontal: Responsive.responsiveValue(6, 8, 10, 12),
    paddingVertical: Responsive.responsiveValue(4, 5, 6, 8),
    borderRadius: Responsive.responsiveValue(12, 14, 16, 20),
  },
  recommendedBadge: {
    position: 'absolute',
    top: Responsive.responsiveValue(8, 10, 12, 14),
    left: Responsive.responsiveValue(8, 10, 12, 14),
    backgroundColor: '#4CAF50',
    paddingHorizontal: Responsive.responsiveValue(6, 8, 10, 12),
    paddingVertical: Responsive.responsiveValue(4, 5, 6, 8),
    borderRadius: Responsive.responsiveValue(12, 14, 16, 20),
  },
  menuItemInfo: {
    padding: Responsive.responsiveValue(12, 14, 16, 20),
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    padding: Responsive.responsiveValue(4, 6, 8, 10),
    marginLeft: Responsive.responsiveValue(4, 6, 8, 10),
  },
  clearSearchButton: {
    paddingHorizontal: Responsive.responsiveValue(16, 20, 24, 28),
    paddingVertical: Responsive.responsiveValue(8, 10, 12, 14),
    borderRadius: Responsive.responsiveValue(8, 10, 12, 16),
    marginTop: Responsive.responsiveValue(12, 16, 20, 24),
  },
  searchBarShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});