import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Layout from '../../../constants/Layout';
import { useTheme } from '../../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const productData = {
  id: '1',
  name: 'Pepperoni Pizza',
  description: 'Classic pepperoni pizza with mozzarella cheese and tomato sauce, topped with fresh basil leaves.',
  price: 12.99,
  rating: 4.8,
  reviewCount: 124,
  calories: 850,
  ingredients: ['Pepperoni', 'Mozzarella', 'Tomato Sauce', 'Basil'],
  image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVwcGVyb25pJTIwcGl6emF8ZW58MHx8MHx8fDA%3D',
  relatedItems: [
    {
      id: '2',
      name: 'Cheese Burger',
      price: 8.99,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hlZXNlJTIwYnVyZ2VyfGVufDB8fDB8fHww',
    },
    // Add more related items...
  ],
};

export default function ProductScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('medium');
  const [selectedCrust, setSelectedCrust] = useState('original');

  // In a real app, you would fetch the product data based on the ID
  const product = productData;

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  const addToCart = () => {
    // Add to cart logic here
    console.log(`Added ${quantity} ${product.name}(s) to cart`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="heart-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="share-social-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <Image source={{ uri: product.image }} style={styles.productImage} />

        {/* Product Info */}
        <View style={[styles.productInfo, { backgroundColor: colors.card }]}>
          <View style={styles.productHeader}>
            <View>
              <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
              <View style={styles.ratingContainer}>
                <MaterialIcons name="star" size={20} color="#FFD700" />
                <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                  {product.rating} ({product.reviewCount} reviews)
                </Text>
              </View>
            </View>
            <Text style={[styles.price, { color: colors.themedPrice }]}>${product.price.toFixed(2)}</Text>
          </View>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {product.description}
          </Text>

          {/* Size Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Size</Text>
            <View style={styles.sizeContainer}>
              {['small', 'medium', 'large'].map(size => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeButton,
                    selectedSize === size && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      selectedSize === size && { color: '#fff' },
                    ]}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Crust Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Crust</Text>
            <View style={styles.crustContainer}>
              {['original', 'thin', 'cheese'].map(crust => (
                <TouchableOpacity
                  key={crust}
                  style={[
                    styles.crustButton,
                    selectedCrust === crust && { borderColor: colors.primary },
                  ]}
                  onPress={() => setSelectedCrust(crust)}
                >
                  <Text
                    style={[
                      styles.crustText,
                      { color: colors.text },
                      selectedCrust === crust && { color: colors.primary, fontWeight: Layout.fontWeight.semiBold, fontFamily: Layout.fontFamily.semiBold },
                    ]}
                  >
                    {crust.charAt(0).toUpperCase() + crust.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Ingredients */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Ingredients</Text>
            <View style={styles.ingredientsContainer}>
              {product.ingredients.map((ingredient, index) => (
                <View key={index} style={[styles.ingredientTag, { backgroundColor: colors.background }]}>
                  <Text style={[styles.ingredientText, { color: colors.text }]}>{ingredient}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Nutrition Info */}
          <View style={styles.nutritionContainer}>
            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionValue, { color: colors.primary }]}>{product.calories}</Text>
              <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>Calories</Text>
            </View>
            <View style={styles.nutritionDivider} />
            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionValue, { color: colors.primary }]}>12g</Text>
              <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>Fat</Text>
            </View>
            <View style={styles.nutritionDivider} />
            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionValue, { color: colors.primary }]}>24g</Text>
              <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>Protein</Text>
            </View>
          </View>
        </View>

        {/* Related Items */}
        <View style={styles.relatedSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>You may also like</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.relatedItemsContainer}
          >
            {product.relatedItems.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[styles.relatedItem, { backgroundColor: colors.card }]}
                onPress={() => router.push({
                  pathname: '/(customer)/product/[id]',
                  params: { id: item.id }
                } as any)}
              >
                <Image source={{ uri: item.image }} style={styles.relatedItemImage} />
                <Text style={[styles.relatedItemName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.relatedItemPrice, { color: colors.themedPrice }]}>
                  ${item.price.toFixed(2)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Add to Cart Bar */}
      <View style={[styles.cartBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View style={styles.quantitySelector}>
          <TouchableOpacity onPress={decreaseQuantity} style={styles.quantityButton}>
            <MaterialIcons name="remove" size={20} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.quantityText, { color: colors.text }]}>{quantity}</Text>
          <TouchableOpacity onPress={increaseQuantity} style={styles.quantityButton}>
            <MaterialIcons name="add" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.addToCartButton, { backgroundColor: colors.primary }]}
          onPress={addToCart}
        >
          <Text style={styles.addToCartText}>Add to Cart - ${(product.price * quantity).toFixed(2)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  productImage: {
    width: '100%',
    height: width * 0.8,
    resizeMode: 'cover',
  },
  productInfo: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    padding: 20,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: Layout.fontWeight.semiBold,
    fontFamily: Layout.fontFamily.semiBold,
    marginBottom: 15,
  },
  sizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sizeButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sizeText: {
    fontSize: 14,
    fontWeight: Layout.fontWeight.medium,
    fontFamily: Layout.fontFamily.medium,
  },
  crustContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  crustButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    margin: 5,
  },
  crustText: {
    fontSize: 14,
  },
  ingredientsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  ingredientTag: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    margin: 5,
  },
  ingredientText: {
    fontSize: 14,
  },
  nutritionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 15,
    padding: 15,
    marginTop: 10,
  },
  nutritionItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  nutritionLabel: {
    fontSize: 12,
  },
  nutritionDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 5,
  },
  relatedSection: {
    padding: 20,
    paddingBottom: 100, // Extra padding for the cart bar
  },
  relatedItemsContainer: {
    paddingVertical: 10,
  },
  relatedItem: {
    width: 150,
    borderRadius: 15,
    overflow: 'hidden',
    marginRight: 15,
    padding: 10,
  },
  relatedItemImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  relatedItemName: {
    fontSize: 14,
    fontWeight: Layout.fontWeight.semiBold,
    fontFamily: Layout.fontFamily.semiBold,
    marginBottom: 5,
  },
  relatedItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 25,
    padding: 5,
    marginRight: 15,
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: Layout.fontWeight.semiBold,
    fontFamily: Layout.fontFamily.semiBold,
    marginHorizontal: 10,
    minWidth: 20,
    textAlign: 'center',
  },
  addToCartButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: Layout.fontWeight.semiBold,
    fontFamily: Layout.fontFamily.semiBold,
  },
});