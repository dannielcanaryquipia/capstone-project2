import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../../constants/Colors';
import { useTheme } from '../../../contexts/ThemeContext';

const categories = [
  { id: '1', name: 'All', icon: 'food' },
  { id: '2', name: 'Pizza', icon: 'pizza' },
  { id: '3', name: 'Burger', icon: 'hamburger' },
  { id: '4', name: 'Sushi', icon: 'sushi' },
  { id: '5', name: 'Drinks', icon: 'cup' },
  { id: '6', name: 'Desserts', icon: 'cupcake' },
  { id: '7', name: 'Popular', icon: 'star' },
  { id: '8', name: 'Recommended', icon: 'thumb-up' },
];

const menuItems = [
  {
    id: '1',
    name: 'Pepperoni Pizza',
    category: 'Pizza',
    price: 12.99,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVwcGVyb25pJTIwcGl6emF8ZW58MHx8MHx8fDA%3D',
    tags: ['Popular'],
  },
  {
    id: '2',
    name: 'Cheese Burger',
    category: 'Burger',
    price: 8.99,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hlZXNlJTIwYnVyZ2VyfGVufDB8fDB8fHww',
    tags: ['Popular'],
  },
  {
    id: '3',
    name: 'Margherita Pizza',
    category: 'Pizza',
    price: 11.99,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFyZ2hlcml0YSUyMHBpenphfGVufDB8fDB8fHww',
    tags: ['Recommended'],
  },
  {
    id: '4',
    name: 'Chicken Wings',
    category: 'Burger',
    price: 9.99,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpY2tlbiUyMHdpbmdzfGVufDB8fDB8fHww',
    tags: ['Recommended'],
  },
  {
    id: '5',
    name: 'Caesar Salad',
    category: 'Desserts',
    price: 7.99,
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2Flc2FyJTIwc2FsYWR8ZW58MHx8MHx8fDA%3D',
    tags: ['Recommended'],
  },
  {
    id: '6',
    name: 'Chocolate Cake',
    category: 'Desserts',
    price: 6.99,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hvY29sYXRlJTIwY2FrZXxlbnwwfHwwfHx8MA%3D%3D',
    tags: ['Popular'],
  },
];

export default function MenuScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { category, search } = useLocalSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');

  // Set initial category and search based on route parameters
  useEffect(() => {
    if (category) {
      // Find category by name and set its ID
      const foundCategory = categories.find(c => c.name.toLowerCase() === category.toString().toLowerCase());
      if (foundCategory) {
        setSelectedCategory(foundCategory.id);
      }
    }
    if (search) {
      // Set search query from route parameter
      setSearchQuery(search.toString());
    }
  }, [category, search]);

  const filteredItems = menuItems.filter(
    item => {
      const categoryName = categories.find(c => c.id === selectedCategory)?.name;
      
      // Handle special categories
      if (categoryName === 'Popular') {
        return item.tags?.includes('Popular') && item.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      if (categoryName === 'Recommended') {
        return item.tags?.includes('Recommended') && item.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      
      // Handle regular categories
      return (selectedCategory === '1' || item.category === categoryName) &&
             item.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <MaterialIcons name="search" size={24} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search for food or restaurant"
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryItem,
                selectedCategory === item.id && { backgroundColor: colors.primary },
              ]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <MaterialCommunityIcons
                name={item.icon as any}
                size={24}
                color={selectedCategory === item.id ? Colors.brown : colors.primary}
              />
              <Text
                style={[
                  styles.categoryName,
                  { color: selectedCategory === item.id ? Colors.brown : colors.text },
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
        />
      </View>

      {/* Menu Items */}
      <FlatList
        data={filteredItems}
        contentContainerStyle={styles.menuItemsContainer}
        numColumns={2}
        columnWrapperStyle={styles.menuItemsRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.card }]}
            onPress={() => router.push({
              pathname: '/(customer)/product/[id]',
              params: { id: item.id }
            } as any)}
          >
            <Image source={{ uri: item.image }} style={styles.menuItemImage} />
            <View style={styles.menuItemInfo}>
              <Text style={[styles.menuItemName, { color: colors.text }]}>{item.name}</Text>
              <View style={styles.ratingContainer}>
                <MaterialIcons name="star" size={16} color="#FFD700" />
                <Text style={[styles.ratingText, { color: colors.textSecondary }]}>{item.rating}</Text>
              </View>
              <Text style={[styles.menuItemPrice, { color: colors.primary }]}>
                ${item.price.toFixed(2)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
      />
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
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
    width: '48%',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 15,
  },
  menuItemImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  menuItemInfo: {
    padding: 10,
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