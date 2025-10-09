import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet
} from 'react-native';
import { AdminCard, AdminLayout, AdminMetricCard, AdminSection } from '../../../components/admin';
import Button from '../../../components/ui/Button';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import SelectablePill from '../../../components/ui/SelectablePill';
import { ResponsiveBorderRadius, ResponsiveSpacing, responsiveValue } from '../../../constants/Responsive';
import { useTheme } from '../../../contexts/ThemeContext';
import { ProductService } from '../../../services/product.service';
import { Product, ProductCategory } from '../../../types/product.types';
export default function AdminMenuScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [productCounts, setProductCounts] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    recommended: 0
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        ProductService.getProducts({
          category_id: activeTab === 'All' ? undefined : categories.find(c => c.name === activeTab)?.id,
        }),
        ProductService.getCategories(),
      ]);
      
      setProducts(productsData);
      setCategories(categoriesData);
      
      // Calculate product counts
      const counts = {
        total: productsData.length,
        active: productsData.filter(p => p.is_available).length,
        inactive: productsData.filter(p => !p.is_available).length,
        recommended: productsData.filter(p => p.is_recommended).length
      };
      setProductCounts(counts);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load menu items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
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
              await loadData();
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
              await loadData();
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

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <AdminCard
      title={item.name}
      subtitle={`${getCategoryName(item.category_id)} • ₱${(item.price || 0).toFixed(2)}`}
      icon={
        <MaterialIcons 
          name="restaurant-menu" 
          size={responsiveValue(20, 22, 24, 28)} 
          color={colors.primary} 
        />
      }
      variant="outlined"
      onPress={() => router.push(`/(admin)/menu/${item.id}` as any)}
    >
      <ResponsiveView style={styles.productContent}>
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

        <ResponsiveView style={styles.productDescription}>
          <ResponsiveText size="sm" color={colors.textSecondary}>
            {item.description}
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
      </ResponsiveView>
    </AdminCard>
  );

  const headerActions = (
    <Button
      title="Add Product"
      onPress={() => router.push('/(admin)/products/new' as any)}
      variant="primary"
      size="small"
      icon={<MaterialIcons name="add" size={16} color={colors.background} />}
    />
  );

  return (
    <AdminLayout
      title="Product Management"
      subtitle={`Manage ${productCounts.total} products in your menu`}
      showBackButton={true}
      onBackPress={() => router.replace('/(admin)/dashboard')}
      headerActions={headerActions}
      padding="lg"
    >
      {/* Product Summary */}
      <AdminSection title="Product Overview" variant="card">
        <ResponsiveView style={styles.summaryGrid}>
          <AdminMetricCard
            title="Total Products"
            value={productCounts.total}
            icon="restaurant-menu"
            iconColor={colors.primary}
          />
          <AdminMetricCard
            title="Active"
            value={productCounts.active}
            icon="check-circle"
            iconColor={colors.success}
          />
          <AdminMetricCard
            title="Inactive"
            value={productCounts.inactive}
            icon="cancel"
            iconColor={colors.error}
          />
          <AdminMetricCard
            title="Recommended"
            value={productCounts.recommended}
            icon="star"
            iconColor={colors.warning}
          />
        </ResponsiveView>
      </AdminSection>

      {/* Category Filter */}
      <AdminSection title="Filter by Category" variant="card">
        <FlatList
          data={categoryTabs}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <SelectablePill
              label={item}
              selected={activeTab === item}
              onPress={() => setActiveTab(item)}
              style={styles.filterPill}
            />
          )}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.tabsList}
        />
      </AdminSection>

      {/* Products List */}
      {products.length > 0 ? (
        <AdminSection 
          title={`${activeTab} Products`} 
          subtitle={`${products.length} products found`}
          variant="card"
        >
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={handleRefresh}
                tintColor={colors.primary}
              />
            }
          />
        </AdminSection>
      ) : (
        <AdminSection 
          title="No Products Found" 
          subtitle={activeTab === 'All' 
            ? 'No products have been added yet.'
            : `No ${activeTab.toLowerCase()} products found.`
          }
          variant="card"
        >
          <ResponsiveView style={styles.emptyState}>
            <ResponsiveView style={[styles.emptyIcon, { backgroundColor: colors.surfaceVariant }]}>
              <MaterialIcons name="restaurant-menu" size={responsiveValue(48, 56, 64, 72)} color={colors.primary} />
            </ResponsiveView>
            
            <ResponsiveView marginTop="lg">
              <Button
                title="Add First Product"
                onPress={() => router.push('/(admin)/products/new' as any)}
                variant="primary"
                size="medium"
              />
            </ResponsiveView>
          </ResponsiveView>
        </AdminSection>
      )}
    </AdminLayout>
  );
}

const categoryTabs = ['All', 'Pizza', 'Burgers', 'Pasta', 'Salads', 'Beverages', 'Desserts'];

const styles = StyleSheet.create({
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: ResponsiveSpacing.sm,
  },
  tabsList: {
    gap: ResponsiveSpacing.sm,
  },
  filterPill: {
    marginRight: ResponsiveSpacing.sm,
  },
  productContent: {
    gap: ResponsiveSpacing.sm,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
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
  productDescription: {
    marginVertical: ResponsiveSpacing.xs,
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
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: ResponsiveSpacing.sm,
    marginTop: ResponsiveSpacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: ResponsiveSpacing.xxxl,
  },
  emptyIcon: {
    width: responsiveValue(80, 90, 100, 120),
    height: responsiveValue(80, 90, 100, 120),
    borderRadius: responsiveValue(40, 45, 50, 60),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.md,
  },
});
