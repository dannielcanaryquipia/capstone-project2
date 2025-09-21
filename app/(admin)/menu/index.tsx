import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import { Strings } from '../../../constants/Strings';
import { useTheme } from '../../../contexts/ThemeContext';
import { ProductService } from '../../../services/product.service';
import { Product, ProductCategory } from '../../../types/product.types';

const categoryTabs = ['All', 'Pizza', 'Burgers', 'Pasta', 'Salads', 'Beverages', 'Desserts'];

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
    <TouchableOpacity
      style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/(admin)/menu/${item.id}` as any)}
    >
      <ResponsiveView style={styles.productHeader}>
        <ResponsiveView style={styles.productInfo}>
          <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
            {item.name}
          </ResponsiveText>
          <ResponsiveView style={styles.productMeta}>
            <ResponsiveView style={[styles.categoryBadge, { backgroundColor: `${colors.primary}20` }]}>
              <ResponsiveText size="xs" color={colors.primary} weight="semiBold">
                {getCategoryName(item.category_id)}
              </ResponsiveText>
            </ResponsiveView>
            {item.is_recommended && (
              <ResponsiveView style={[styles.recommendedBadge, { backgroundColor: `${colors.success}20` }]}>
                <MaterialIcons name="star" size={12} color={colors.success} />
                <ResponsiveView marginLeft="xs">
                  <ResponsiveText size="xs" color={colors.success} weight="semiBold">
                    Recommended
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>
            )}
          </ResponsiveView>
        </ResponsiveView>
        <MaterialIcons name="keyboard-arrow-right" size={24} color={colors.textSecondary} />
      </ResponsiveView>

      <ResponsiveView style={styles.productDescription}>
        <ResponsiveText size="sm" color={colors.textSecondary}>
          {item.description}
        </ResponsiveText>
      </ResponsiveView>

      <ResponsiveView style={styles.productFooter}>
        <ResponsiveView style={styles.priceContainer}>
          <ResponsiveText size="sm" color={colors.textSecondary}>
            Price:
          </ResponsiveText>
          <ResponsiveText size="lg" weight="semiBold" color={colors.primary}>
            ₱{(item.price || 0).toFixed(2)}
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
              size={14} 
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
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="md" color={colors.textSecondary}>
              {Strings.loading}
            </ResponsiveText>
          </ResponsiveView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ResponsiveView style={styles.header}>
        <ResponsiveText size="xl" weight="bold" color={colors.text}>
          Product Management
        </ResponsiveText>
        <ResponsiveText size="md" color={colors.textSecondary}>
          Manage {productCounts.total} products in your menu
        </ResponsiveText>
      </ResponsiveView>

      {/* Product Summary */}
      <ResponsiveView style={styles.summaryContainer}>
        <ResponsiveText size="sm" color={colors.textSecondary}>
          Active: {productCounts.active} | Inactive: {productCounts.inactive} | Recommended: {productCounts.recommended}
        </ResponsiveText>
      </ResponsiveView>

      {/* Category Tabs */}
      <ResponsiveView style={styles.tabsContainer}>
        <FlatList
          data={categoryTabs}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === item && { 
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
                activeTab !== item && { borderColor: colors.border },
              ]}
              onPress={() => setActiveTab(item)}
            >
              <ResponsiveText 
                size="sm" 
                weight="medium"
                color={activeTab === item ? colors.background : colors.text}
              >
                {item}
              </ResponsiveText>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.tabsList}
        />
      </ResponsiveView>

      {products.length > 0 ? (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      ) : (
        <ResponsiveView style={styles.emptyState}>
          <MaterialIcons name="restaurant-menu" size={64} color={colors.textSecondary} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              No Products Found
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveView marginTop="sm">
            <ResponsiveText size="md" color={colors.textSecondary} style={{ textAlign: 'center' }}>
              {activeTab === 'All' 
                ? 'No products have been added yet.'
                : `No ${activeTab.toLowerCase()} products found.`
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
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
  },
  summaryContainer: {
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.sm,
  },
  tabsContainer: {
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.md,
  },
  tabsList: {
    gap: Layout.spacing.sm,
  },
  tab: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.pill,
    borderWidth: 1,
  },
  productsList: {
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: 0,
  },
  productCard: {
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.md,
    ...Layout.shadows.sm,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  productDescription: {
    marginBottom: 12,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
});
