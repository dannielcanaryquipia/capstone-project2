import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../../../components/ui/ProductCard';
import ResponsiveText from '../../../components/ui/ResponsiveText';
import ResponsiveView from '../../../components/ui/ResponsiveView';
import Responsive from '../../../constants/Responsive';
import { useSavedProducts } from '../../../contexts/SavedProductsContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useProductCategories, useProducts } from '../../../hooks';
import type { Product, ProductCategory } from '../../../types/product.types';

// Default categories for UI display
const defaultCategories = [
  { id: '1', name: 'All', icon: 'food' },
  { id: '7', name: 'Popular', icon: 'star' },
  { id: '8', name: 'Recommended', icon: 'thumb-up' },
];

export default function MenuScreen() {
  const { colors } = useTheme();
  const { isProductSaved, toggleSave } = useSavedProducts();
  const router = useRouter();
  const { category, search } = useLocalSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');

  // Use hooks for data fetching
  const { products, isLoading: productsLoading, error: productsError } = useProducts();
  const { categories: dbCategories, isLoading: categoriesLoading } = useProductCategories();

  // Combine default categories with database categories
  const allCategories = [
    ...defaultCategories,
    ...dbCategories.map((cat: ProductCategory) => ({
      id: cat.id,
      name: cat.name,
      icon: 'food' // Default icon for database categories
    }))
  ];

  // Set initial category and search based on route parameters
  useEffect(() => {
    if (category) {
      // Find category by name and set its ID
      const foundCategory = allCategories.find(c => c.name.toLowerCase() === category.toString().toLowerCase());
      if (foundCategory) {
        setSelectedCategory(foundCategory.id);
      }
    }
    if (search) {
      // Set search query from route parameter
      setSearchQuery(search.toString());
    }
  }, [category, search, allCategories]);

  const filteredItems = products.filter(
    (product: Product) => {
      const categoryName = allCategories.find(c => c.id === selectedCategory)?.name;
      
      // Handle special categories
      if (categoryName === 'Popular') {
        return product.is_recommended && product.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      if (categoryName === 'Recommended') {
        return product.is_recommended && product.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      
      // Handle regular categories
      return (selectedCategory === '1' || product.category?.name === categoryName) &&
             product.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <ResponsiveView 
        flexDirection="row" 
        alignItems="center" 
        backgroundColor={colors.card}
        marginHorizontal="lg"
        marginVertical="md"
        borderRadius="md"
        paddingHorizontal="md"
        height={Responsive.InputSizes.medium.height}
      >
        <MaterialIcons 
          name="search" 
          size={Responsive.responsiveValue(20, 22, 24, 28)} 
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
          placeholder="Search for food or restaurant"
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </ResponsiveView>

      {/* Categories */}
      <ResponsiveView marginBottom="sm">
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
              onPress={() => setSelectedCategory(item.id)}
            >
              <ResponsiveText
                size="sm"
                color={selectedCategory === item.id ? colors.categoryButtonActiveText : colors.categoryButtonText}
                weight={selectedCategory === item.id ? 'semiBold' : 'regular'}
              >
                {item.name}
              </ResponsiveText>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
        />
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
      ) : (
        <FlatList
          key={`menu-${Responsive.responsiveValue(1, 1, 1, 2)}`}
          data={filteredItems}
          numColumns={Responsive.responsiveValue(1, 1, 1, 2)}
          keyExtractor={(item) => item.id}
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
          renderItem={({ item }) => (
            <ProductCard
              id={item.id}
              name={item.name}
              price={item.price}
              image={item.image_url || 'https://via.placeholder.com/200x150'}
              tags={item.is_recommended ? ['Recommended'] : []}
              variant="vertical"
              backgroundColor={colors.card}
              textColor={colors.text}
              priceColor={colors.themedPrice}
              isSaved={isProductSaved(item.id)}
              onSaveToggle={toggleSave}
              onPress={() => router.push({
                pathname: '/(customer)/product/[id]',
                params: { id: item.id }
              } as any)}
            />
          )}
        />
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Responsive.responsiveValue(12, 14, 16, 18),
    paddingVertical: Responsive.responsiveValue(6, 8, 10, 12),
    borderRadius: Responsive.responsiveValue(16, 18, 20, 22),
    marginRight: Responsive.responsiveValue(6, 8, 10, 12),
    minWidth: Responsive.responsiveValue(50, 60, 70, 80),
  },
  categoryItemActive: {
    shadowColor: '#FFE44D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
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
});