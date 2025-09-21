import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../../../components/ui/ProductCard';
import ResponsiveText from '../../../components/ui/ResponsiveText';
import ResponsiveView from '../../../components/ui/ResponsiveView';
import Responsive from '../../../constants/Responsive';
import { useSavedProducts } from '../../../contexts/SavedProductsContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useProductCategories, useProducts } from '../../../hooks';
import type { Product } from '../../../types/product.types';

export default function CategoryMenuScreen() {
  const { colors } = useTheme();
  const { isProductSaved, toggleSave } = useSavedProducts();
  const router = useRouter();
  const { category } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  // Use hooks for data fetching
  const { products, isLoading: productsLoading, error: productsError } = useProducts();
  const { categories: dbCategories, isLoading: categoriesLoading } = useProductCategories();

  // Find the category by name
  const currentCategory = dbCategories.find(cat => 
    cat.name.toLowerCase() === category?.toString().toLowerCase()
  );

  const filteredItems = products.filter(
    (product: Product) => {
      // Filter by category
      const matchesCategory = !currentCategory || product.category?.name === currentCategory.name;
      
      // Filter by search query
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    }
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <ResponsiveView 
        flexDirection="row" 
        alignItems="center" 
        paddingHorizontal="lg"
        paddingVertical="md"
      >
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons 
            name="arrow-back" 
            size={Responsive.responsiveValue(24, 26, 28, 32)} 
            color={colors.text} 
          />
        </TouchableOpacity>
        <ResponsiveView marginLeft="md">
          <ResponsiveText 
            size="xl" 
            weight="bold" 
            color={colors.text}
          >
            {currentCategory?.name || 'Category'}
          </ResponsiveText>
        </ResponsiveView>
      </ResponsiveView>

      {/* Search Bar */}
      <ResponsiveView 
        flexDirection="row" 
        alignItems="center" 
        backgroundColor={colors.card}
        marginHorizontal="lg"
        marginBottom="md"
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
          placeholder="Search within category"
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </ResponsiveView>

      {/* Products */}
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
          key={`category-menu-${Responsive.responsiveValue(1, 1, 1, 2)}`}
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
  backButton: {
    padding: Responsive.ResponsiveSpacing.sm,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
});
