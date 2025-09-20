import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../../../components/ui/ProductCard';
import ResponsiveText from '../../../components/ui/ResponsiveText';
import ResponsiveView from '../../../components/ui/ResponsiveView';
import Responsive from '../../../constants/Responsive';
import { useTheme } from '../../../contexts/ThemeContext';

const categories = [
  { id: '1', name: 'All', icon: 'food' },
  { id: '7', name: 'Popular', icon: 'star' },
  { id: '8', name: 'Recommended', icon: 'thumb-up' },
  { id: '2', name: 'Pizza', icon: 'pizza' },
  { id: '3', name: 'Burger', icon: 'hamburger' },
  { id: '4', name: 'Sushi', icon: 'sushi' },
  { id: '5', name: 'Drinks', icon: 'cup' },
  { id: '6', name: 'Desserts', icon: 'cupcake' },
];

const menuItems = [
  {
    id: '1',
    name: 'Pepperoni Pizza',
    category: 'Pizza',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVwcGVyb25pJTIwcGl6emF8ZW58MHx8MHx8fDA%3D',
    tags: ['Popular'],
  },
  {
    id: '2',
    name: 'Cheese Burger',
    category: 'Burger',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hlZXNlJTIwYnVyZ2VyfGVufDB8fDB8fHww',
    tags: ['Popular'],
  },
  {
    id: '3',
    name: 'Margherita Pizza',
    category: 'Pizza',
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFyZ2hlcml0YSUyMHBpenphfGVufDB8fDB8fHww',
    tags: ['Recommended'],
  },
  {
    id: '4',
    name: 'Chicken Wings',
    category: 'Burger',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpY2tlbiUyMHdpbmdzfGVufDB8fDB8fHww',
    tags: ['Recommended'],
  },
  {
    id: '5',
    name: 'Caesar Salad',
    category: 'Desserts',
    price: 7.99,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2Flc2FyJTIwc2FsYWR8ZW58MHx8MHx8fDA%3D',
    tags: ['Recommended'],
  },
  {
    id: '6',
    name: 'Chocolate Cake',
    category: 'Desserts',
    price: 6.99,
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
      <ResponsiveView 
        flexDirection="row" 
        alignItems="center" 
        backgroundColor={colors.card}
        marginHorizontal="lg"
        marginVertical="md"
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
          placeholder="Search for food or restaurant"
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </ResponsiveView>

      {/* Categories */}
      <ResponsiveView marginBottom="sm">
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Responsive.ResponsiveSpacing.md }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryItem,
                {
                  backgroundColor: selectedCategory === item.id ? colors.categoryButtonActiveFill : 'transparent',
                  borderColor: selectedCategory === item.id ? colors.categoryButtonActiveFill : colors.categoryButtonBorder,
                  borderWidth: 1,
                },
                selectedCategory === item.id && styles.categoryItemActive,
              ]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <ResponsiveText
                size="sm"
                color={selectedCategory === item.id ? colors.categoryButtonActiveText : colors.categoryButtonText}
                weight={selectedCategory === item.id ? 'semiBold' : 'regular'}
              >
                {item.name}
              </ResponsiveText>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
        />
      </ResponsiveView>

      {/* Menu Items */}
      <FlatList
        data={filteredItems}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ 
          padding: Responsive.ResponsiveSpacing.md,
          paddingBottom: Responsive.ResponsiveSpacing.xl
        }}
        columnWrapperStyle={{ 
          justifyContent: 'space-between',
          marginBottom: Responsive.ResponsiveSpacing.md,
          paddingHorizontal: Responsive.ResponsiveSpacing.xs,
          gap: Responsive.ResponsiveSpacing.sm
        }}
        renderItem={({ item }) => (
          <ProductCard
            id={item.id}
            name={item.name}
            price={item.price}
            image={item.image}
            tags={item.tags}
            variant="vertical"
            backgroundColor={colors.card}
            textColor={colors.text}
            priceColor={colors.themedPrice}
            onPress={() => router.push({
              pathname: '/(customer)/product/[id]',
              params: { id: item.id }
            } as any)}
          />
        )}
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Responsive.responsiveValue(16, 18, 20, 24),
    paddingVertical: Responsive.responsiveValue(8, 10, 12, 14),
    borderRadius: Responsive.responsiveValue(20, 22, 24, 28),
    marginRight: Responsive.responsiveValue(8, 10, 12, 14),
    minWidth: Responsive.responsiveValue(60, 70, 80, 90),
  },
  categoryItemActive: {
    shadowColor: '#FFE44D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
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
    borderRadius: Responsive.responsiveValue(16, 18, 20, 24),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: Responsive.responsiveValue(2, 3, 4, 6) },
    shadowOpacity: 0.15,
    shadowRadius: Responsive.responsiveValue(6, 8, 10, 12),
    elevation: Responsive.responsiveValue(4, 5, 6, 8),
    marginBottom: Responsive.responsiveValue(12, 14, 16, 20),
  },
  menuItemImageContainer: {
    position: 'relative',
    width: '100%',
  },
  menuItemImage: {
    width: '100%',
    resizeMode: 'cover',
  },
  popularBadge: {
    position: 'absolute',
    top: Responsive.responsiveValue(8, 10, 12, 14),
    left: Responsive.responsiveValue(8, 10, 12, 14),
    backgroundColor: '#FF6B35',
    paddingHorizontal: Responsive.responsiveValue(6, 8, 10, 12),
    paddingVertical: Responsive.responsiveValue(4, 5, 6, 8),
    borderRadius: Responsive.responsiveValue(12, 14, 16, 20),
  },
  recommendedBadge: {
    position: 'absolute',
    top: Responsive.responsiveValue(8, 10, 12, 14),
    left: Responsive.responsiveValue(8, 10, 12, 14),
    backgroundColor: '#4CAF50',
    paddingHorizontal: Responsive.responsiveValue(6, 8, 10, 12),
    paddingVertical: Responsive.responsiveValue(4, 5, 6, 8),
    borderRadius: Responsive.responsiveValue(12, 14, 16, 20),
  },
  menuItemInfo: {
    padding: Responsive.responsiveValue(12, 14, 16, 20),
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