import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../../../components/ui/ProductCard';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import Responsive from '../../../constants/Responsive';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCart, useProductCategories, useProducts } from '../../../hooks';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const userName = user?.user_metadata?.name || 'Guest';
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use hooks for data fetching
  const { products, isLoading: productsLoading, error: productsError } = useProducts();
  const { categories, isLoading: categoriesLoading } = useProductCategories();
  const { addItem } = useCart();
  
  // Filter products for different sections
  const popularProducts = products.filter(product => product.is_recommended).slice(0, 4);
  const recommendedProducts = products.filter(product => product.is_available).slice(0, 6);
  
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ResponsiveView 
          flexDirection="row" 
          justifyContent="space-between" 
          alignItems="center"
          paddingHorizontal="lg"
          paddingTop="sm"
          paddingBottom="sm"
        >
          <ResponsiveView>
            <ResponsiveView marginBottom="xs">
              <ResponsiveText 
                size="sm" 
                color={colors.textSecondary} 
                weight="regular"
              >
                {getGreeting()}
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveText 
              size="xxxl" 
              weight="bold" 
              color={colors.text}
            >
              {userName}
            </ResponsiveText>
          </ResponsiveView>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => router.push('/(customer)/notification')}
          >
            <MaterialIcons 
              name="notifications-none" 
              size={Responsive.responsiveValue(24, 26, 28, 32)} 
              color={colors.text} 
            />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </ResponsiveView>

        {/* Search Bar */}
        <ResponsiveView 
          flexDirection="row" 
          alignItems="center" 
          backgroundColor={colors.surfaceVariant}
          borderRadius="md"
          marginHorizontal="lg"
          marginBottom="lg"
          paddingHorizontal="md"
        >
          <MaterialIcons 
            name="search" 
            size={Responsive.responsiveValue(20, 22, 24, 26)} 
            color={colors.textSecondary} 
          />
          <TextInput
            style={[
              styles.searchInput,
              {
                color: colors.text,
                fontFamily: Layout.fontFamily.regular,
                fontSize: Responsive.responsiveValue(14, 15, 16, 18),
              }
            ]}
            placeholder="Search for food, drinks, or restaurants..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
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
            justifyContent="space-between" 
            alignItems="center"
            marginBottom="md"
          >
            <ResponsiveText size="xl" weight="bold" color={colors.text}>
              Special Offers
            </ResponsiveText>
            <TouchableOpacity>
              <ResponsiveText size="sm" weight="bold" color={colors.themedViewAll}>
                View All
              </ResponsiveText>
            </TouchableOpacity>
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

        {/* Popular Items */}
        <ResponsiveView marginTop="sm" paddingHorizontal="lg" marginBottom="lg">
          <ResponsiveView 
            flexDirection="row" 
            justifyContent="space-between" 
            alignItems="center"
            marginBottom="md"
          >
            <ResponsiveText size="xl" weight="bold" color={colors.text}>
              Popular Now
            </ResponsiveText>
            <TouchableOpacity onPress={() => router.push('/(customer)/menu?category=Popular')}>
              <ResponsiveText size="sm" weight="bold" color={colors.themedViewAll}>
                View All
              </ResponsiveText>
            </TouchableOpacity>
          </ResponsiveView>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: Responsive.ResponsiveSpacing.xs }}
          >
            {productsLoading ? (
              <ResponsiveView padding="lg">
                <ResponsiveText color={colors.textSecondary}>Loading popular items...</ResponsiveText>
              </ResponsiveView>
            ) : (
              popularProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.image_url || 'https://via.placeholder.com/200x150'}
                  tags={product.is_recommended ? ['Recommended'] : []}
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

        {/* Recommended For You */}
        <ResponsiveView marginTop="sm" paddingHorizontal="lg" marginBottom="lg">
          <ResponsiveView 
            flexDirection="row" 
            justifyContent="space-between" 
            alignItems="center"
            marginBottom="md"
          >
            <ResponsiveText size="xl" weight="bold" color={colors.text}>
              Recommended For You
            </ResponsiveText>
            <TouchableOpacity onPress={() => router.push('/(customer)/menu?category=Recommended')}>
              <ResponsiveText size="sm" weight="bold" color={colors.themedViewAll}>
                View All
              </ResponsiveText>
            </TouchableOpacity>
          </ResponsiveView>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: Responsive.ResponsiveSpacing.xs }}
          >
            {productsLoading ? (
              <ResponsiveView padding="lg">
                <ResponsiveText color={colors.textSecondary}>Loading recommended items...</ResponsiveText>
              </ResponsiveView>
            ) : (
              recommendedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.image_url || 'https://via.placeholder.com/200x150'}
                  tags={product.is_recommended ? ['Recommended'] : []}
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

        {/* Quick Actions */}
        <ResponsiveView marginTop="sm" paddingHorizontal="lg" marginBottom="lg">
          <ResponsiveView 
            flexDirection="row" 
            justifyContent="space-between" 
            alignItems="center"
            marginBottom="md"
          >
            <ResponsiveText size="xl" weight="bold" color={colors.text}>
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

            {/* Track Order Button */}
            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: colors.themedPrice + '10', borderColor: colors.themedPrice + '20' }]}
              onPress={() => router.push('/(customer)/orders')}
            >
              <ResponsiveView alignItems="center" padding="md">
                <ResponsiveView 
                  backgroundColor={colors.themedPrice + '20'}
                  borderRadius="round"
                  padding="md"
                  marginBottom="sm"
                >
                  <MaterialIcons 
                    name="local-shipping" 
                    size={Responsive.responsiveValue(24, 26, 28, 32)} 
                    color={colors.themedPrice} 
                  />
                </ResponsiveView>
                <ResponsiveText 
                  size="sm" 
                  weight="semiBold" 
                  color={colors.text}
                  align="center"
                >
                  Track Order
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
  },
  notificationBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  specialOfferImage: {
    borderRadius: 12,
  },
  quickActionCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 100,
  },
});