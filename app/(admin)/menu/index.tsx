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
import { ResponsiveBorderRadius, ResponsiveSpacing, responsiveValue } from '../../../constants/Responsive';
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
      style={[styles.productCard, { 
        backgroundColor: colors.surface,
        ...Layout.shadows.sm
      }]}
      onPress={() => router.push(`/(admin)/menu/${item.id}` as any)}
      activeOpacity={0.7}
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
                <MaterialIcons name="star" size={responsiveValue(12, 14, 16, 18)} color={colors.success} />
                <ResponsiveView marginLeft="xs">
                  <ResponsiveText size="xs" color={colors.success} weight="semiBold">
                    Recommended
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>
            )}
          </ResponsiveView>
        </ResponsiveView>
        <MaterialIcons 
          name="keyboard-arrow-right" 
          size={responsiveValue(20, 22, 24, 28)} 
          color={colors.textSecondary} 
        />
      </ResponsiveView>

      <ResponsiveView style={styles.productDescription}>
        <ResponsiveText size="sm" color={colors.textSecondary}>
          {item.description}
        </ResponsiveText>
      </ResponsiveView>

      <ResponsiveView style={styles.productFooter}>
        <ResponsiveView style={styles.priceContainer}>
          <ResponsiveText size="sm" color={colors.textSecondary} weight="medium">
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
      <SafeAreaView style={[global.screen, styles.center, { backgroundColor: colors.background }]}>
        <ResponsiveView style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="md" color={colors.textSecondary}>
              {Strings.loading}
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[global.screen, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={{ flex: 1 }}>
        <ResponsiveView padding="lg">
          {/* Header */}
          <ResponsiveView style={[styles.header, { backgroundColor: colors.surface }]}>
            <ResponsiveView style={styles.headerLeft}>
              <ResponsiveText size="xl" weight="bold" color={colors.text}>
                Product Management
              </ResponsiveText>
              <ResponsiveText size="md" color={colors.textSecondary}>
                Manage {productCounts.total} products in your menu
              </ResponsiveText>
            </ResponsiveView>
            <Button
              title="Add Product"
              onPress={() => router.push('/(admin)/products/new' as any)}
              variant="primary"
              size="small"
              icon={<MaterialIcons name="add" size={16} color={colors.background} />}
            />
          </ResponsiveView>

          {/* Product Summary */}
          <ResponsiveView style={[styles.summaryContainer, { backgroundColor: colors.surface }]}>
            <ResponsiveView style={styles.summaryGrid}>
              <ResponsiveView style={styles.summaryItem}>
                <ResponsiveText size="sm" color={colors.textSecondary} weight="medium">
                  Total
                </ResponsiveText>
                <ResponsiveText size="lg" weight="bold" color={colors.text}>
                  {productCounts.total}
                </ResponsiveText>
              </ResponsiveView>
              <ResponsiveView style={styles.summaryItem}>
                <ResponsiveText size="sm" color={colors.textSecondary} weight="medium">
                  Active
                </ResponsiveText>
                <ResponsiveText size="lg" weight="bold" color={colors.success}>
                  {productCounts.active}
                </ResponsiveText>
              </ResponsiveView>
              <ResponsiveView style={styles.summaryItem}>
                <ResponsiveText size="sm" color={colors.textSecondary} weight="medium">
                  Inactive
                </ResponsiveText>
                <ResponsiveText size="lg" weight="bold" color={colors.error}>
                  {productCounts.inactive}
                </ResponsiveText>
              </ResponsiveView>
              <ResponsiveView style={styles.summaryItem}>
                <ResponsiveText size="sm" color={colors.textSecondary} weight="medium">
                  Recommended
                </ResponsiveText>
                <ResponsiveText size="lg" weight="bold" color={colors.warning}>
                  {productCounts.recommended}
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
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
                    activeTab !== item && { 
                      backgroundColor: colors.surface,
                      borderColor: colors.border 
                    },
                  ]}
                  onPress={() => setActiveTab(item)}
                  activeOpacity={0.7}
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
        </ResponsiveView>

        {/* Products List */}
        {products.length > 0 ? (
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.productsList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={handleRefresh}
                tintColor={colors.primary}
              />
            }
          />
        ) : (
          <ResponsiveView style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <ResponsiveView style={[styles.emptyIcon, { backgroundColor: colors.surfaceVariant }]}>
              <MaterialIcons name="restaurant-menu" size={responsiveValue(48, 56, 64, 72)} color={colors.primary} />
            </ResponsiveView>
            <ResponsiveView marginTop="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text} align="center">
                No Products Found
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveView marginTop="sm">
              <ResponsiveText size="md" color={colors.textSecondary} align="center">
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
                size="medium"
              />
            </ResponsiveView>
          </ResponsiveView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.lg,
    padding: ResponsiveSpacing.md,
    borderRadius: ResponsiveBorderRadius.lg,
    ...Layout.shadows.sm,
  },
  headerLeft: {
    flex: 1,
  },
  summaryContainer: {
    marginBottom: ResponsiveSpacing.lg,
    padding: ResponsiveSpacing.md,
    borderRadius: ResponsiveBorderRadius.lg,
    ...Layout.shadows.sm,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    padding: ResponsiveSpacing.sm,
  },
  tabsContainer: {
    marginBottom: ResponsiveSpacing.lg,
  },
  tabsList: {
    gap: ResponsiveSpacing.sm,
  },
  tab: {
    paddingHorizontal: ResponsiveSpacing.md,
    paddingVertical: ResponsiveSpacing.sm,
    borderRadius: ResponsiveBorderRadius.pill,
    borderWidth: 1,
  },
  productsList: {
    paddingHorizontal: ResponsiveSpacing.lg,
    paddingTop: 0,
  },
  productCard: {
    padding: ResponsiveSpacing.md,
    borderRadius: ResponsiveBorderRadius.md,
    marginBottom: ResponsiveSpacing.md,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ResponsiveSpacing.sm,
  },
  productInfo: {
    flex: 1,
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
  productDescription: {
    marginBottom: ResponsiveSpacing.sm,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.md,
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
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: ResponsiveSpacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: ResponsiveSpacing.xxxl,
    paddingHorizontal: ResponsiveSpacing.lg,
    marginHorizontal: ResponsiveSpacing.lg,
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
});
