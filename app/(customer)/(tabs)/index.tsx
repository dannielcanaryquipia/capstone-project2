import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../../../components/ui/ProductCard';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import Colors from '../../../constants/Colors';
import Layout from '../../../constants/Layout';
import Responsive from '../../../constants/Responsive';
import { useAuth } from '../../../contexts/AuthContext';


const popularItems = [
  {
    id: '1',
    name: 'Pepperoni Pizza',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVwcGVyb25pJTIwcGl6emF8ZW58MHx8MHx8fDA%3D',
    tags: ['Popular'],
  },
  {
    id: '2',
    name: 'Cheese Burger',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hlZXNlJTIwYnVyZ2VyfGVufDB8fDB8fHww',
    tags: ['Popular'],
  },
];

const recommendedItems = [
  {
    id: '3',
    name: 'Margherita Pizza',
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFyZ2hlcml0YSUyMHBpenphfGVufDB8fDB8fHww',
    tags: ['Recommended'],
  },
  {
    id: '4',
    name: 'Chicken Wings',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpY2tlbiUyMHdpbmdzfGVufDB8fDB8fHww',
    tags: ['Recommended'],
  },
  {
    id: '5',
    name: 'Caesar Salad',
    price: 7.99,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2Flc2FyJTIwc2FsYWR8ZW58MHx8MHx8fDA%3D',
    tags: ['Recommended'],
  },
  {
    id: '6',
    name: 'Chocolate Cake',
    price: 6.99,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hvY29sYXRlJTIwY2FrZXxlbnwwfHwwfHx8MA%3D%3D',
    tags: ['Popular'],
  },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const userName = user?.user_metadata?.name || 'Guest';
  const [searchQuery, setSearchQuery] = useState('');
  
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
    <SafeAreaView style={styles.container}>
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
                color="#666" 
                weight="regular"
              >
                {getGreeting()}
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveText 
              size="xxxl" 
              weight="bold" 
              color="#333"
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
              color="#333" 
            />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </ResponsiveView>

        {/* Search Bar */}
        <ResponsiveView 
          flexDirection="row" 
          alignItems="center" 
          backgroundColor="#f5f5f5"
          borderRadius="md"
          marginHorizontal="lg"
          marginVertical="md"
          paddingHorizontal="md"
          height={Responsive.InputSizes.medium.height}
        >
          <MaterialIcons 
            name="search" 
            size={Responsive.responsiveValue(20, 22, 24, 28)} 
            color="#999" 
            style={{ marginRight: Responsive.ResponsiveSpacing.sm }}
          />
          <TextInput
            style={[styles.searchInput, { fontSize: Responsive.InputSizes.medium.fontSize }]}
            placeholder="Search for food or restaurant"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={handleClearSearch}
              style={styles.clearButton}
            >
              <MaterialIcons 
                name="clear" 
                size={Responsive.responsiveValue(18, 20, 22, 24)} 
                color="#999" 
              />
            </TouchableOpacity>
          )}
        </ResponsiveView>

        {/* Special Offers */}
        <ResponsiveView marginTop="sm" paddingHorizontal="lg" marginBottom="lg">
          <ResponsiveView 
            flexDirection="row" 
            justifyContent="space-between" 
            alignItems="center"
            marginBottom="md"
          >
            <ResponsiveText size="xl" weight="bold" color="#333">
              Special Offers
            </ResponsiveText>
            <TouchableOpacity>
              <ResponsiveText size="sm" weight="bold" color={Colors.black}>
                View All
              </ResponsiveText>
            </TouchableOpacity>
          </ResponsiveView>
          <ResponsiveView 
            backgroundColor={Colors.primaryLight + '10'}
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
                  color={Colors.primaryLight}
                >
                  30% OFF
                </ResponsiveText>
              </ResponsiveView>
              <ResponsiveView marginBottom="sm">
                <ResponsiveText 
                  size="md" 
                  color="#666"
                >
                  On your first order
                </ResponsiveText>
              </ResponsiveView>
              <ResponsiveView 
                backgroundColor={Colors.primaryLight + '20'}
                paddingHorizontal="sm"
                paddingVertical="xs"
                borderRadius="pill"
                alignSelf="flex-start"
              >
                <ResponsiveText 
                  size="sm" 
                  color={Colors.primaryLight}
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
            <ResponsiveText size="xl" weight="bold" color="#333">
              Popular Now
            </ResponsiveText>
            <TouchableOpacity onPress={() => router.push('/(customer)/menu?category=Popular')}>
              <ResponsiveText size="sm" weight="bold" color={Colors.black}>
                View All
              </ResponsiveText>
            </TouchableOpacity>
          </ResponsiveView>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: Responsive.ResponsiveSpacing.xs }}
          >
            {popularItems.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                name={item.name}
                price={item.price}
                image={item.image}
                tags={item.tags}
                variant="horizontal"
                width={Responsive.responsiveValue(160, 170, 180, 200)}
                onPress={() => router.push({
                  pathname: '/(customer)/product/[id]',
                  params: { id: item.id }
                } as any)}
              />
            ))}
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
            <ResponsiveText size="xl" weight="bold" color="#333">
              Recommended For You
            </ResponsiveText>
            <TouchableOpacity onPress={() => router.push('/(customer)/menu?category=Recommended')}>
              <ResponsiveText size="sm" weight="bold" color={Colors.black}>
                View All
              </ResponsiveText>
            </TouchableOpacity>
          </ResponsiveView>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: Responsive.ResponsiveSpacing.xs }}
          >
            {recommendedItems.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                name={item.name}
                price={item.price}
                image={item.image}
                tags={item.tags}
                variant="horizontal"
                width={Responsive.responsiveValue(160, 170, 180, 200)}
                onPress={() => router.push({
                  pathname: '/(customer)/product/[id]',
                  params: { id: item.id }
                } as any)}
              />
            ))}
          </ScrollView>
        </ResponsiveView>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
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
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primaryLight,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 15,
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
    color: '#333',
  },
  clearButton: {
    padding: Responsive.ResponsiveSpacing.xs,
    marginLeft: Responsive.ResponsiveSpacing.xs,
  },
  section: {
    marginTop: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Layout.fontFamily.bold,
    color: '#333',
  },
  seeAllText: {
    color: Colors.black,
    fontSize: 14,
    fontFamily: Layout.fontFamily.bold,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    paddingVertical: 10,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 70,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.black + '20', // Black with 20% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIconActive: {
    backgroundColor: Colors.black + '20', // Keep black background even when active
  },
  categoryName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontFamily: Layout.fontFamily.regular,
  },
  categoryNameActive: {
    color: Colors.brown, // Brown text when active
    fontWeight: '600',
  },
  popularItemsContainer: {
    paddingVertical: 5,
  },
  popularItem: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginRight: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  popularItemImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  popularItemInfo: {
    padding: 12,
  },
  popularItemName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Layout.fontFamily.semiBold,
    color: '#333',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  ratingText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
    fontFamily: Layout.fontFamily.regular,
  },
  popularItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Layout.fontFamily.bold,
    color: Colors.primaryLight,
  },
  specialOfferCard: {
    backgroundColor: Colors.primaryLight + '10', // Adding 10% opacity
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  specialOfferContent: {
    flex: 1,
  },
  specialOfferTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: Layout.fontFamily.bold,
    color: Colors.primaryLight,
    marginBottom: 5,
  },
  specialOfferSubtitle: {
    fontSize: 16,
    fontFamily: Layout.fontFamily.regular,
    color: '#666',
    marginBottom: 10,
  },
  specialOfferCode: {
    fontSize: 14,
    fontFamily: Layout.fontFamily.regular,
    color: Colors.primaryLight,
    backgroundColor: Colors.primaryLight + '20', // Adding 20% opacity
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  specialOfferImage: {
    width: 120,
    height: 100,
    resizeMode: 'contain',
    marginLeft: 10,
  },
});