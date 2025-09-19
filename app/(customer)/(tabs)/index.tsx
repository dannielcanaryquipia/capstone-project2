import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../../constants/Colors';
import Layout from '../../../constants/Layout';
import { useAuth } from '../../../contexts/AuthContext';

const categories = [
  { id: '1', name: 'All', icon: 'food' },
  { id: '2', name: 'Pizza', icon: 'pizza' },
  { id: '3', name: 'Burger', icon: 'hamburger' },
  { id: '4', name: 'Sushi', icon: 'food-variant' },
  { id: '5', name: 'Drinks', icon: 'cup' },
];

const popularItems = [
  {
    id: '1',
    name: 'Pepperoni Pizza',
    price: 12.99,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVwcGVyb25pJTIwcGl6emF8ZW58MHx8MHx8fDA%3D',
  },
  {
    id: '2',
    name: 'Cheese Burger',
    price: 8.99,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hlZXNlJTIwYnVyZ2VyfGVufDB8fDB8fHww',
  },
];

const recommendedItems = [
  {
    id: '3',
    name: 'Margherita Pizza',
    price: 11.99,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFyZ2hlcml0YSUyMHBpenphfGVufDB8fDB8fHww',
  },
  {
    id: '4',
    name: 'Chicken Wings',
    price: 9.99,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpY2tlbiUyMHdpbmdzfGVufDB8fDB8fHww',
  },
  {
    id: '5',
    name: 'Caesar Salad',
    price: 7.99,
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2Flc2FyJTIwc2FsYWR8ZW58MHx8MHx8fDA%3D',
  },
  {
    id: '6',
    name: 'Chocolate Cake',
    price: 6.99,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hvY29sYXRlJTIwY2FrZXxlbnwwfHwwfHx8MA%3D%3D',
  },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const userName = user?.user_metadata?.name || 'Guest';
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get current time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/(customer)/menu?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => router.push('/(customer)/notification')}
          >
            <MaterialIcons name="notifications-none" size={28} color="#333" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={24} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for food or restaurant"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => {
              const isActive = selectedCategory === category.id;
              return (
                <TouchableOpacity 
                  key={category.id} 
                  style={styles.categoryItem}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <View style={[
                    styles.categoryIcon,
                    isActive && styles.categoryIconActive
                  ]}>
                    <MaterialCommunityIcons 
                      name={category.icon as any} 
                      size={24} 
                      color={isActive ? Colors.primaryLight : Colors.black} 
                    />
                  </View>
                  <Text style={[
                    styles.categoryName,
                    isActive && styles.categoryNameActive
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Popular Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Now</Text>
            <TouchableOpacity onPress={() => router.push('/(customer)/menu?category=Popular')}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularItemsContainer}
          >
            {popularItems.map((item) => (
              <TouchableOpacity key={item.id} style={styles.popularItem}>
                <Image source={{ uri: item.image }} style={styles.popularItemImage} />
                <View style={styles.popularItemInfo}>
                  <Text style={styles.popularItemName}>{item.name}</Text>
                  <View style={styles.ratingContainer}>
                    <MaterialIcons name="star" size={16} color={Colors.primaryLight} />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                  <Text style={styles.popularItemPrice}>${item.price.toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recommended For You */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended For You</Text>
            <TouchableOpacity onPress={() => router.push('/(customer)/menu?category=Recommended')}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularItemsContainer}
          >
            {recommendedItems.map((item) => (
              <TouchableOpacity key={item.id} style={styles.popularItem}>
                <Image source={{ uri: item.image }} style={styles.popularItemImage} />
                <View style={styles.popularItemInfo}>
                  <Text style={styles.popularItemName}>{item.name}</Text>
                  <View style={styles.ratingContainer}>
                    <MaterialIcons name="star" size={16} color={Colors.primaryLight} />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                  <Text style={styles.popularItemPrice}>${item.price.toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Special Offers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Special Offers</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.specialOfferCard}>
            <View style={styles.specialOfferContent}>
              <Text style={styles.specialOfferTitle}>30% OFF</Text>
              <Text style={styles.specialOfferSubtitle}>On your first order</Text>
              <Text style={styles.specialOfferCode}>Use code: WELCOME30</Text>
            </View>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zm9vZCUyMGRlbGl2ZXJ5fGVufDB8fDB8fHww' }} 
              style={styles.specialOfferImage}
            />
          </View>
        </View>
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