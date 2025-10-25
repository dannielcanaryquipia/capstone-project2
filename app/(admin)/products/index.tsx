import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import { AdminCard, AdminLayout, AdminSection } from '../../../components/admin';
import Button from '../../../components/ui/Button';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import { ResponsiveBorderRadius, ResponsiveSpacing, responsiveValue } from '../../../constants/Responsive';
import { Strings } from '../../../constants/Strings';
import { useTheme } from '../../../contexts/ThemeContext';
import { useProductCategories, useProducts } from '../../../hooks';
import { ProductService } from '../../../services/product.service';
import { Product, ProductCategory } from '../../../types/product.types';

export default function AdminProductsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Use the improved hooks with real-time updates
  const { 
    products, 
    isLoading: productsLoading, 
    error: productsError, 
    refresh: refreshProducts,
    loadMore,
    hasMore,
    isFetchingMore,
  } = useProducts({
    category_id: activeCategory === 'all' ? undefined : activeCategory,
    search: searchQuery || undefined,
  });
  
  const { 
    categories, 
    isLoading: categoriesLoading 
  } = useProductCategories();
  
  const loading = productsLoading || categoriesLoading;
  const error = productsError;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshProducts();
    setRefreshing(false);
  };

  const handleToggleAvailability = async (productId: string, currentStatus: boolean) => {
    Alert.alert(
      'Toggle Availability',
      `Are you sure you want to ${currentStatus ? 'disable' : 'enable'} this product?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: currentStatus ? 'Disable' : 'Enable', 
          onPress: async () => {
            try {
              await ProductService.toggleAvailability(productId);
              await refreshProducts();
              Alert.alert('Success', 'Product availability updated successfully!');
            } catch (error) {
              console.error('Error updating product:', error);
              Alert.alert('Error', 'Failed to update product. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${productName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await ProductService.deleteProduct(productId);
              await refreshProducts();
              Alert.alert('Success', 'Product deleted successfully!');
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', 'Failed to delete product. Please try again.');
            }
          }
        }
      ]
    );
  };

  const categoryMap = useMemo(() => new Map(categories.map((c: ProductCategory) => [c.id, c.name])), [categories]);
  const getCategoryName = (categoryId: string) => categoryMap.get(categoryId) || 'Unknown';

  const renderProductItem = ({ item }: { item: Product }) => (
    <AdminCard
      title={item.name}
      subtitle={item.description}
      icon={
        <MaterialIcons 
          name="restaurant-menu" 
          size={responsiveValue(20, 22, 24, 28)} 
          color={colors.primary} 
        />
      }
      onPress={() => router.push(`/(admin)/products/${item.id}` as any)}
      variant="outlined"
      style={styles.productCard}
    >
      <ResponsiveView style={styles.productMeta}>
        <ResponsiveView style={[styles.categoryBadge, { backgroundColor: `${colors.primary}20` }]}>
          <ResponsiveText size="xs" color={colors.primary} weight="semiBold">
            {getCategoryName(item.category_id)}
          </ResponsiveText>
        </ResponsiveView>
        {item.is_recommended && (
          <ResponsiveView style={[styles.recommendedBadge, { backgroundColor: `${colors.success}20` }]}>
            <MaterialIcons name="star" size={responsiveValue(12, 14, 16, 18)} color={colors.success} />
            <ResponsiveView marginLeft="xs">
              <ResponsiveText size="xs" color={colors.success} weight="semiBold">
                Recommended
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>
        )}
      </ResponsiveView>

      <ResponsiveView style={styles.productFooter}>
        <ResponsiveView style={styles.priceContainer}>
          <ResponsiveText size="sm" color={colors.textSecondary}>
            Price:
          </ResponsiveText>
          <ResponsiveText size="lg" weight="semiBold" color={colors.primary}>
            ₱{(item.base_price || 0).toFixed(2)}
          </ResponsiveText>
        </ResponsiveView>
        
        <ResponsiveView style={styles.statusContainer}>
          <ResponsiveView 
            style={[
              styles.statusBadge, 
              { backgroundColor: item.is_available ? `${colors.success}20` : `${colors.error}20` }
            ]}
          >
            <MaterialIcons 
              name={item.is_available ? 'check-circle' : 'cancel'} 
              size={responsiveValue(12, 14, 16, 18)} 
              color={item.is_available ? colors.success : colors.error} 
            />
            <ResponsiveView marginLeft="xs">
              <ResponsiveText 
                size="xs" 
                color={item.is_available ? colors.success : colors.error}
                weight="semiBold"
              >
                {item.is_available ? 'Available' : 'Unavailable'}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>
        </ResponsiveView>
      </ResponsiveView>

      {item.stock && (
        <ResponsiveView style={styles.stockInfo}>
          <MaterialIcons name="inventory" size={responsiveValue(14, 16, 18, 20)} color={colors.textSecondary} />
          <ResponsiveView marginLeft="xs">
            <ResponsiveText size="sm" color={colors.textSecondary}>
              Stock: {item.stock.quantity} units
              {item.stock.quantity <= (item.stock.low_stock_threshold || 10) && (
                <ResponsiveText size="sm" color={colors.warning} weight="semiBold">
                  {' '}(Low Stock)
                </ResponsiveText>
              )}
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
      )}

      <ResponsiveView style={styles.productActions}>
        <Button
          title={item.is_available ? 'Disable' : 'Enable'}
          onPress={() => handleToggleAvailability(item.id, item.is_available)}
          variant="outline"
          size="small"
        />
        <Button
          title="Edit"
          onPress={() => router.push(`/(admin)/products/${item.id}` as any)}
          variant="primary"
          size="small"
        />
        <Button
          title="Delete"
          onPress={() => handleDeleteProduct(item.id, item.name)}
          variant="danger"
          size="small"
        />
      </ResponsiveView>
    </AdminCard>
  );

  if (loading) {
    return (
      <AdminLayout
        title="Manage Products"
        subtitle="Loading..."
        showBackButton={true}
        onBackPress={() => router.replace('/(admin)/dashboard')}
        backgroundColor={colors.background}
      >
        <ResponsiveView style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="md" color={colors.textSecondary}>
              {Strings.loading}
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Manage Products"
      subtitle="Manage your restaurant menu items and inventory"
      showBackButton={true}
      onBackPress={() => router.replace('/(admin)/dashboard')}
      headerActions={
        <Button
          title="Add Product"
          onPress={() => router.push('/(admin)/products/new' as any)}
          variant="primary"
          size="small"
          icon={<MaterialIcons name="add" size={16} color={colors.background} />}
        />
      }
      backgroundColor={colors.background}
    >
      {/* Category Filter */}
      <ResponsiveView marginBottom="sm">
        <FlatList
          data={[{ id: 'all', name: 'All' }, ...categories]}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: ResponsiveSpacing.md }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryItem,
                {
                  backgroundColor: activeCategory === item.id ? colors.primary : 'transparent',
                  borderColor: activeCategory === item.id ? colors.primary : colors.border,
                  borderWidth: 1,
                },
                activeCategory === item.id && styles.categoryItemActive,
              ]}
              onPress={() => setActiveCategory(item.id)}
            >
              <ResponsiveText
                size="sm"
                color={activeCategory === item.id ? 'white' : colors.text}
                weight={activeCategory === item.id ? 'semiBold' : 'regular'}
                style={{ textAlign: 'center', lineHeight: undefined, textTransform: 'capitalize' }}
              >
                {(item.name || '').trim()}
              </ResponsiveText>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
        />
      </ResponsiveView>

      {products.length > 0 ? (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (hasMore && !isFetchingMore) {
              loadMore();
            }
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListFooterComponent={
            isFetchingMore ? (
              <ActivityIndicator style={{ marginVertical: ResponsiveSpacing.md }} color={colors.primary} />
            ) : null
          }
        />
      ) : (
        <AdminSection title="No Products Found" variant="card">
          <ResponsiveView style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <ResponsiveView style={[styles.emptyIcon, { backgroundColor: colors.surfaceVariant }]}>
              <MaterialIcons name="restaurant-menu" size={responsiveValue(48, 56, 64, 72)} color={colors.primary} />
            </ResponsiveView>
            <ResponsiveView marginTop="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                No Products Found
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveView marginTop="sm">
              <ResponsiveText size="md" color={colors.textSecondary} style={{ textAlign: 'center' }}>
                {activeCategory === 'all' 
                  ? 'No products have been added yet.'
                  : `No products found in this category.`
                }
              </ResponsiveText>
            </ResponsiveView>
            
            <ResponsiveView marginTop="lg">
              <Button
                title="Add First Product"
                onPress={() => router.push('/(admin)/products/new' as any)}
                variant="primary"
              />
            </ResponsiveView>
          </ResponsiveView>
        </AdminSection>
      )}
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsList: {
    paddingHorizontal: ResponsiveSpacing.md,
    gap: ResponsiveSpacing.sm,
  },
  categoryPill: {
    marginRight: ResponsiveSpacing.sm,
  },
  productsList: {
    paddingHorizontal: ResponsiveSpacing.lg,
    paddingTop: 0,
  },
  productCard: {
    marginBottom: ResponsiveSpacing.md,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: ResponsiveSpacing.sm,
    gap: ResponsiveSpacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: ResponsiveSpacing.sm,
    paddingVertical: ResponsiveSpacing.xs,
    borderRadius: ResponsiveBorderRadius.sm,
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ResponsiveSpacing.sm,
    paddingVertical: ResponsiveSpacing.xs,
    borderRadius: ResponsiveBorderRadius.sm,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ResponsiveSpacing.sm,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ResponsiveSpacing.sm,
    paddingVertical: ResponsiveSpacing.xs,
    borderRadius: ResponsiveBorderRadius.sm,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.md,
    paddingVertical: ResponsiveSpacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: ResponsiveSpacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: ResponsiveSpacing.xxxl,
    paddingHorizontal: ResponsiveSpacing.lg,
    borderRadius: ResponsiveBorderRadius.lg,
    ...Layout.shadows.sm,
  },
  emptyIcon: {
    width: responsiveValue(80, 90, 100, 120),
    height: responsiveValue(80, 90, 100, 120),
    borderRadius: responsiveValue(40, 45, 50, 60),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.md,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: responsiveValue(12, 14, 16, 18),
    paddingVertical: responsiveValue(6, 8, 10, 12),
    borderRadius: responsiveValue(16, 18, 20, 22),
    marginRight: responsiveValue(6, 8, 10, 12),
    minWidth: responsiveValue(72, 80, 88, 100),
    minHeight: responsiveValue(36, 40, 44, 48),
  },
  categoryItemActive: {
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 0,
  },
});
