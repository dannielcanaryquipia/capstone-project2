import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../../../components/ui/ProductCard';
import RecommendedProductsFallback from '../../../components/ui/RecommendedProductsFallback';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import Responsive from '../../../constants/Responsive';
import { useNotificationContext } from '../../../contexts/NotificationContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCart, useCurrentUserProfile, useProductCategories, useProducts } from '../../../hooks';
import { useAuth } from '../../../hooks/useAuth';
import { useOrders } from '../../../hooks/useOrders';
import { useRecommendations } from '../../../hooks/useRecommendations';
import { Order } from '../../../types/order.types';

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const { user, profile: authProfile } = useAuth();
  const { profile } = useCurrentUserProfile();
  const router = useRouter();
  const userName = authProfile?.full_name || profile?.full_name || user?.user_metadata?.name || 'Guest';
  const [searchQuery, setSearchQuery] = useState('');
  
  // Ban emoji usage in search input
  const removeEmojis = useCallback((value: string) => {
    const emojiRegex = /[\u2600-\u27BF\u{1F300}-\u{1F6FF}\u{1F900}-\u{1FAFF}]/gu;
    return value.replace(emojiRegex, '');
  }, []);
  
  // Use hooks for data fetching
  const { products, isLoading: productsLoading, error: productsError } = useProducts();
  const { categories, isLoading: categoriesLoading } = useProductCategories();
  const { addItem } = useCart();
  const { unreadCount } = useNotificationContext();
  const { orders: allOrders, isLoading: ordersLoading } = useOrders();
  const recentOrders = allOrders.slice(0, 3);
  
  // Add AI recommendations
  const { 
    featuredProducts, 
    personalizedProducts, 
    isLoading: recommendationsLoading,
    error: recommendationsError 
  } = useRecommendations();
  
  // Remove old hardcoded recommendations
  // const popularProducts = products.filter(product => product.is_recommended).slice(0, 4);
  // const recommendedProducts = products.filter(product => product.is_recommended).slice(0, 2);
  
  // Get current time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Reset search query when returning to home page
  useFocusEffect(
    useCallback(() => {
      setSearchQuery('');
    }, [])
  );

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/(customer)/menu?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Get status color for order status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'confirmed': return colors.info;
      case 'preparing': return colors.primary;
      case 'ready_for_pickup': return colors.warning;
      case 'out_for_delivery': return colors.info;
      case 'delivered': return colors.success;
      case 'cancelled': return colors.error;
      default: return colors.textSecondary;
    }
  };


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ResponsiveView 
          flexDirection="row" 
          justifyContent="space-between" 
          alignItems="flex-start"
          paddingHorizontal="lg"
          paddingTop="lg"
          paddingBottom="lg"
        >
          <ResponsiveView flex={1}>
            <ResponsiveView marginBottom="sm">
              <ResponsiveText 
                size="lg" 
                color={colors.textSecondary} 
                weight="medium"
                lineHeight="relaxed"
              >
                {getGreeting()}
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveView marginBottom="xs">
              <ResponsiveText 
                size="display" 
                weight="bold" 
                color={colors.text}
                lineHeight="tight"
              >
                {userName}
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveText 
              size="md" 
              color={colors.textSecondary} 
              weight="regular"
              lineHeight="normal"
            >
              What would you like to order today?
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveView flexDirection="row" alignItems="center" marginLeft="md">
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => router.push('/(customer)/notification')}
              activeOpacity={0.7}
            >
              <ResponsiveView style={[
                styles.notificationIconContainer,
                {
                  backgroundColor: unreadCount > 0
                    ? colors.primary + '20'
                    : 'transparent',
                }
              ]}>
                <MaterialIcons 
                  name="notifications-none" 
                  size={Responsive.responsiveValue(28, 30, 32, 36)} 
                  color={unreadCount > 0 ? colors.primary : colors.text} 
                />
                {unreadCount > 0 && (
                  <View style={[styles.notificationBadge, { backgroundColor: colors.error }]}>
                    <ResponsiveText 
                      size="xs" 
                      weight="bold" 
                      color={colors.textInverse}
                      style={styles.badgeText}
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </ResponsiveText>
                  </View>
                )}
              </ResponsiveView>
            </TouchableOpacity>
          </ResponsiveView>
        </ResponsiveView>

        {/* Error Display */}
        {productsError && (
          <ResponsiveView 
            backgroundColor={colors.error + '20'}
            marginHorizontal="lg"
            marginVertical="sm"
            padding="md"
            borderRadius="md"
          >
            <ResponsiveText size="sm" color={colors.error}>
              Error loading products: {productsError}
            </ResponsiveText>
          </ResponsiveView>
        )}

        {/* Search Bar */}
        <ResponsiveView 
          flexDirection="row" 
          alignItems="center" 
          backgroundColor={colors.surface}
          borderRadius="md"
          marginHorizontal="lg"
          marginBottom="lg"
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
                fontFamily: Layout.fontFamily.regular,
                fontSize: Responsive.InputSizes.medium.fontSize
              }
            ]}
            placeholder="Search for food"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={(t) => setSearchQuery(removeEmojis(t))}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={handleClearSearch}
              style={styles.clearButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons 
                name="clear" 
                size={Responsive.responsiveValue(18, 20, 22, 24)} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
          )}
        </ResponsiveView>

        {/* Special Offers */}
        <ResponsiveView marginBottom="lg" paddingHorizontal="lg">
        <ResponsiveView 
          flexDirection="row" 
          justifyContent="flex-start" 
          alignItems="center"
          marginBottom="lg"
        >
          <ResponsiveText size="xxl" weight="bold" color={colors.text}>
            Special Offers
          </ResponsiveText>
        </ResponsiveView>
          <ResponsiveView 
            backgroundColor={colors.primary + '10'}
            borderRadius="lg"
            padding="lg"
            flexDirection="row"
            alignItems="center"
            style={{ overflow: 'hidden' }}
          >
            <ResponsiveView flex={1}>
              <ResponsiveView marginBottom="xs">
                <ResponsiveText 
                  size="xxl" 
                  weight="bold" 
                  color={colors.themedDiscount}
                >
                  30% OFF
                </ResponsiveText>
              </ResponsiveView>
              <ResponsiveView marginBottom="sm">
                <ResponsiveText 
                  size="md" 
                  color={colors.textSecondary}
                >
                  On your first order
                </ResponsiveText>
              </ResponsiveView>
              <ResponsiveView 
                backgroundColor={colors.primary + '20'}
                paddingHorizontal="sm"
                paddingVertical="xs"
                borderRadius="pill"
                alignSelf="flex-start"
              >
                <ResponsiveText 
                  size="sm" 
                  color={colors.themedDiscount}
                >
                  Use code: WELCOME30
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zm9vZCUyMGRlbGl2ZXJ5fGVufDB8fDB8fHww' }} 
              style={[
                styles.specialOfferImage,
                { 
                  width: Responsive.responsiveValue(100, 110, 120, 140),
                  height: Responsive.responsiveValue(80, 90, 100, 120),
                  marginLeft: Responsive.ResponsiveSpacing.sm
                }
              ]}
            />
          </ResponsiveView>
        </ResponsiveView>


        {/* Featured Products Section - AI Powered */}
        <ResponsiveView marginTop="sm" paddingHorizontal="lg" marginBottom="lg">
          <ResponsiveView 
            flexDirection="row" 
            justifyContent="space-between" 
            alignItems="center"
            marginBottom="lg"
          >
            <ResponsiveText size="xxl" weight="bold" color={colors.text}>
              Featured Products ({featuredProducts.length})
            </ResponsiveText>
            <TouchableOpacity onPress={() => router.push('/(customer)/menu')}>
              <ResponsiveText size="md" weight="semiBold" color={colors.themedViewAll}>
                View All
              </ResponsiveText>
            </TouchableOpacity>
          </ResponsiveView>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: Responsive.ResponsiveSpacing.xs }}
          >
            {recommendationsLoading ? (
              <ResponsiveView padding="lg">
                <ResponsiveText color={colors.textSecondary}>Loading featured products...</ResponsiveText>
              </ResponsiveView>
            ) : (
              featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  description={product.description}
                  price={product.base_price}
                  image={product.image_url || 'https://via.placeholder.com/200x150'}
                  tags={['Featured']}
                  variant="horizontal"
                  width={Responsive.responsiveValue(160, 170, 180, 200)}
                  onPress={() => router.push({
                    pathname: '/(customer)/product/[id]',
                    params: { id: product.id }
                  } as any)}
                />
              ))
            )}
          </ScrollView>
        </ResponsiveView>

        {/* Recommended For You Section - AI Powered */}
        <ResponsiveView marginTop="sm" paddingHorizontal="lg" marginBottom="lg">
          <ResponsiveView 
            flexDirection="row" 
            justifyContent="space-between" 
            alignItems="center"
            marginBottom="lg"
          >
            <ResponsiveText size="xxl" weight="bold" color={colors.text}>
              Recommended For You ({personalizedProducts.length})
            </ResponsiveText>
            <TouchableOpacity onPress={() => router.push('/(customer)/menu')}>
              <ResponsiveText size="md" weight="semiBold" color={colors.themedViewAll}>
                View All
              </ResponsiveText>
            </TouchableOpacity>
          </ResponsiveView>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: Responsive.ResponsiveSpacing.xs }}
          >
            {recommendationsLoading ? (
              <ResponsiveView padding="lg">
                <ResponsiveText color={colors.textSecondary}>Loading recommendations...</ResponsiveText>
              </ResponsiveView>
            ) : personalizedProducts.length > 0 ? (
              personalizedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  description={product.description}
                  price={product.base_price}
                  image={product.image_url || 'https://via.placeholder.com/200x150'}
                  tags={['Recommended']}
                  variant="horizontal"
                  width={Responsive.responsiveValue(160, 170, 180, 200)}
                  onPress={() => router.push({
                    pathname: '/(customer)/product/[id]',
                    params: { id: product.id }
                  } as any)}
                />
              ))
            ) : (
              // Show shuffled recommended products when no personalized products
              products && products.length > 0 ? (
                // Fisher-Yates shuffle algorithm
                (() => {
                  const shuffled = [...products];
                  for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                  }
                  return shuffled.slice(0, 4);
                })().map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    description={product.description}
                    price={product.base_price || product.price || 0}
                    image={product.image_url || 'https://via.placeholder.com/200x150'}
                    tags={['Recommended']}
                    variant="horizontal"
                    width={Responsive.responsiveValue(160, 170, 180, 200)}
                    onPress={() => router.push({
                      pathname: '/(customer)/product/[id]',
                      params: { id: product.id }
                    } as any)}
                  />
                ))
              ) : (
                <ResponsiveView padding="lg">
                  <ResponsiveText color={colors.textSecondary}>No products available</ResponsiveText>
                </ResponsiveView>
              )
            )}
          </ScrollView>
        </ResponsiveView>

        {/* Quick Actions */}
        <ResponsiveView marginTop="sm" paddingHorizontal="lg" marginBottom="lg">
          <ResponsiveView 
            flexDirection="row" 
            justifyContent="space-between" 
            alignItems="center"
            marginBottom="lg"
          >
            <ResponsiveText size="xxl" weight="bold" color={colors.text}>
              Quick Actions
            </ResponsiveText>
          </ResponsiveView>
          
          <ResponsiveView 
            flexDirection="row" 
            justifyContent="space-between"
          >
            {/* View Cart Button */}
            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '20' }]}
              onPress={() => router.push('/(customer)/(tabs)/cart')}
            >
              <ResponsiveView alignItems="center" padding="md">
                <ResponsiveView 
                  backgroundColor={colors.primary + '20'}
                  borderRadius="round"
                  padding="md"
                  marginBottom="sm"
                >
                  <MaterialIcons 
                    name="shopping-cart" 
                    size={Responsive.responsiveValue(24, 26, 28, 32)} 
                    color={colors.primary} 
                  />
                </ResponsiveView>
                <ResponsiveText 
                  size="sm" 
                  weight="semiBold" 
                  color={colors.text}
                  align="center"
                >
                  View Cart
                </ResponsiveText>
              </ResponsiveView>
            </TouchableOpacity>

            {/* Add Address Button */}
            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: colors.textSecondary + '10', borderColor: colors.textSecondary + '20' }]}
              onPress={() => router.push('/(customer)/profile/addresses')}
            >
              <ResponsiveView alignItems="center" padding="md">
                <ResponsiveView 
                  backgroundColor={colors.textSecondary + '20'}
                  borderRadius="round"
                  padding="md"
                  marginBottom="sm"
                >
                  <MaterialIcons 
                    name="location-on" 
                    size={Responsive.responsiveValue(24, 26, 28, 32)} 
                    color={colors.textSecondary} 
                  />
                </ResponsiveView>
                <ResponsiveText 
                  size="sm" 
                  weight="semiBold" 
                  color={colors.text}
                  align="center"
                >
                  Add Address
                </ResponsiveText>
              </ResponsiveView>
            </TouchableOpacity>
          </ResponsiveView>
        </ResponsiveView>

        {/* Recent Orders */}
        {recentOrders && recentOrders.length > 0 && (
          <ResponsiveView marginTop="sm" paddingHorizontal="lg" marginBottom="lg">
            <ResponsiveView 
              flexDirection="row" 
              justifyContent="space-between" 
              alignItems="center"
              marginBottom="lg"
            >
              <ResponsiveText size="xxl" weight="bold" color={colors.text}>
                Recent Orders ({recentOrders.length})
              </ResponsiveText>
              <TouchableOpacity onPress={() => router.push('/(customer)/orders')}>
                <ResponsiveText size="md" weight="semiBold" color={colors.themedViewAll}>
                  View All
                </ResponsiveText>
              </TouchableOpacity>
            </ResponsiveView>
            
            <ResponsiveView style={[styles.ordersCard, { backgroundColor: colors.surface }]}>
              {recentOrders.map((order: Order, index: number) => (
                <TouchableOpacity
                  key={order.id}
                  style={[
                    styles.orderItem,
                    index < recentOrders.length - 1 && { borderBottomColor: colors.border }
                  ]}
                  onPress={() => router.push({
                    pathname: '/(customer)/orders/[id]',
                    params: { id: order.id }
                  } as any)}
                  activeOpacity={0.7}
                >
                  <ResponsiveView style={styles.orderLeft}>
                    <ResponsiveView style={[styles.orderIcon, { backgroundColor: colors.surfaceVariant }]}>
                      <MaterialIcons name="receipt" size={20} color={colors.themedText} />
                    </ResponsiveView>
                    <ResponsiveView style={styles.orderDetails}>
                      <ResponsiveText size="md" weight="medium" color={colors.text}>
                        Order #{order.order_number || order.id.slice(-8)}
                      </ResponsiveText>
                      <ResponsiveView marginTop="xs">
                        <ResponsiveText size="sm" color={colors.textSecondary}>
                          {new Date(order.created_at).toLocaleDateString()} • ₱{order.total_amount?.toFixed(2) || '0.00'}
                        </ResponsiveText>
                      </ResponsiveView>
                    </ResponsiveView>
                  </ResponsiveView>
                  <ResponsiveView style={styles.orderRight}>
                    <ResponsiveView style={[styles.statusBadge, { 
                      backgroundColor: getStatusColor(order.status) + '20' 
                    }]}>
                      <ResponsiveText size="xs" color={getStatusColor(order.status)} weight="semiBold">
                        {order.status.replace('_', ' ').toUpperCase()}
                      </ResponsiveText>
                    </ResponsiveView>
                    <MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />
                  </ResponsiveView>
                </TouchableOpacity>
              ))}
            </ResponsiveView>
          </ResponsiveView>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor will be set dynamically by theme
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
    fontFamily: Layout.fontFamily.regular,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: Layout.fontFamily.bold,
    color: '#333',
    marginTop: 2,
  },
  notificationButton: {
    position: 'relative',
    zIndex: 10,
  },
  notificationIconContainer: {
    position: 'relative',
    padding: Responsive.responsiveValue(8, 10, 12, 14),
    borderRadius: Responsive.responsiveValue(20, 22, 24, 28),
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    zIndex: 10,
  },
  notificationBadge: {
    position: 'absolute',
    right: Responsive.responsiveValue(4, 6, 8, 10),
    top: Responsive.responsiveValue(4, 6, 8, 10),
    minWidth: Responsive.responsiveValue(16, 18, 20, 22),
    height: Responsive.responsiveValue(16, 18, 20, 22),
    borderRadius: Responsive.responsiveValue(8, 9, 10, 11),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Responsive.responsiveValue(4, 5, 6, 7),
    zIndex: 11,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeText: {
    fontSize: Responsive.responsiveValue(8, 9, 10, 11),
    lineHeight: Responsive.responsiveValue(10, 11, 12, 13),
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  searchBarShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  clearButton: {
    padding: Responsive.responsiveValue(4, 6, 8, 10),
    marginLeft: Responsive.responsiveValue(4, 6, 8, 10),
  },
  specialOfferImage: {
    borderRadius: 12,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 100,
  },
  ordersCard: {
    borderRadius: Layout.borderRadius.lg,
    ...Layout.shadows.sm,
    overflow: 'hidden',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
  },
  orderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.sm,
  },
  orderDetails: {
    flex: 1,
  },
  orderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Layout.spacing.xs,
    paddingVertical: 2,
    borderRadius: Layout.borderRadius.xs,
  },
});