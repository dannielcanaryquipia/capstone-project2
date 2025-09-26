import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CartNotification } from '../../../components/ui/CartNotification';
import SelectablePill from '../../../components/ui/SelectablePill';
import Layout from '../../../constants/Layout';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCart } from '../../../hooks/useCart';
import { useCrusts, useProductDetail } from '../../../hooks/useProductDetail';

const { width } = Dimensions.get('window');

// Mock data fallback for loading states
const mockProductData = {
  id: 'loading',
  name: 'Loading...',
  description: 'Loading product details...',
  base_price: 0,
  image_url: 'https://via.placeholder.com/400x300',
  is_available: true,
  is_recommended: false,
  preparation_time_minutes: 30,
  allergens: [],
  nutritional_info: null,
  category: { name: 'Loading...', description: '' },
  pizza_options: [],
};

export default function ProductScreen() {
  const { id } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedCrust, setSelectedCrust] = useState('');
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [addedItem, setAddedItem] = useState<{
    name: string;
    quantity: number;
    totalPrice: number;
  } | null>(null);

  // Fetch real product data from backend
  const { productDetail, isLoading, error } = useProductDetail(id as string);
  const product = productDetail || mockProductData;

  // Determine if this is a Pizza category (to show size & crust)
  const isPizzaCategory = useMemo(() => {
    const name = (product.category?.name || '').trim().toLowerCase();
    return name === 'pizza' || name === 'pizzas';
  }, [product]);

  // Derive sizes and crusts from product.pizza_options
  const availableSizes = useMemo(() => {
    return Array.from(new Set((product.pizza_options || []).map((o: any) => o.size)));
  }, [product]);

  // Fetch all crusts from crusts table (not from pizza_options)
  const { crusts: allCrusts } = useCrusts();
  const availableCrustsForSize = useMemo(() => (allCrusts || []).map(c => c.name), [allCrusts]);

  // Determine price based on selected size (fallback to base_price)
  const selectedSizePrice = useMemo(() => {
    const option = (product.pizza_options || []).find((o: any) => o.size === selectedSize);
    return option?.price ?? product.base_price;
  }, [product, selectedSize]);

  // Initialize defaults when data is ready
  useEffect(() => {
    if (!selectedSize && availableSizes.length > 0) {
      setSelectedSize(availableSizes[0]);
    }
  }, [availableSizes, selectedSize]);

  useEffect(() => {
    if (!selectedCrust && availableCrustsForSize.length > 0) {
      setSelectedCrust(availableCrustsForSize[0]);
    }
  }, [availableCrustsForSize, selectedCrust]);

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  const addToCart = () => {
    if (!product || product.id === 'loading') return;

    // Convert ProductDetail to Product type for cart
    const productForCart = {
      ...product,
      category_id: (product.category as any)?.id || '',
      price: selectedSizePrice, // Use the selected size price
      category: product.category ? {
        ...product.category,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } : undefined,
    };

    // Prepare cart options for pizza items
    const cartOptions: any = {};
    if (isPizzaCategory) {
      if (selectedSize) cartOptions.pizza_size = selectedSize;
      if (selectedCrust) cartOptions.pizza_crust = selectedCrust;
    }

    // Add item to cart
    addItem(productForCart as any, quantity, cartOptions);

    // Store added item info for notification
    setAddedItem({
      name: product.name,
      quantity,
      totalPrice: selectedSizePrice * quantity,
    });

    // Show notification
    setShowCartNotification(true);
  };

  const handleGoToCart = () => {
    setShowCartNotification(false);
    router.push('/(customer)/(tabs)/cart');
  };

  const handleContinueShopping = () => {
    setShowCartNotification(false);
    // Optionally reset quantity
    setQuantity(1);
  };

  const handleCloseNotification = () => {
    setShowCartNotification(false);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading product...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.error }]}>Error loading product: {error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={28} color={isDark ? colors.primary : colors.white} style={styles.iconShadow} />
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="favorite-border" size={28} color={isDark ? colors.primary : colors.white} style={styles.iconShadow} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <Image source={{ uri: product.image_url || 'https://via.placeholder.com/400x300' }} style={styles.productImage} />

        {/* Product Info */}
        <View style={[styles.productInfo, { backgroundColor: colors.card }]}>
          <View style={styles.productHeader}>
            <View style={styles.productTitleContainer}>
              <Text
                style={[styles.productName, { color: colors.text }]}
                numberOfLines={2}
                ellipsizeMode="tail"
                adjustsFontSizeToFit
                minimumFontScale={0.9}
              >
                {product.name}
              </Text>
            </View>
            <Text style={[styles.price, { color: colors.themedPrice }]}>₱{selectedSizePrice.toFixed(2)}</Text>
          </View>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {product.description}
          </Text>

          {/* Size Selection (from product_options) - Only for Pizza */}
          {isPizzaCategory && availableSizes.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Size</Text>
              <View style={styles.sizeContainer}>
                {availableSizes.map(size => (
                  <SelectablePill
                    key={String(size)}
                    label={String(size).charAt(0).toUpperCase() + String(size).slice(1)}
                    selected={selectedSize === size}
                    onPress={() => setSelectedSize(size)}
                    size="md"
                  />
                ))}
              </View>
            </View>
          )}

          {/* Crust Selection (from crusts.name) - Only for Pizza */}
          {isPizzaCategory && availableCrustsForSize.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Crust</Text>
              <View style={styles.sizeContainer}>
                {availableCrustsForSize.map(crust => (
                  <SelectablePill
                    key={String(crust)}
                    label={String(crust).charAt(0).toUpperCase() + String(crust).slice(1)}
                    selected={selectedCrust === crust}
                    onPress={() => setSelectedCrust(crust)}
                    size="md"
                  />
                ))}
              </View>
            </View>
          )}

          {/* Allergens */}
          {product.allergens && product.allergens.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Allergens</Text>
              <View style={styles.ingredientsContainer}>
                {product.allergens.map((allergen: string, index: number) => (
                  <View key={index} style={[styles.ingredientTag, { backgroundColor: colors.background }]}>
                    <Text style={[styles.ingredientText, { color: colors.text }]}>{allergen}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Preparation Time */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Preparation Time</Text>
            <Text style={[styles.preparationTime, { color: colors.textSecondary }]}>
              {product.preparation_time_minutes || 30} minutes
            </Text>
          </View>

          {/* Category Info */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Category</Text>
            <Text style={[styles.categoryName, { color: colors.textSecondary }]}>
              {product.category?.name || 'Unknown'}
            </Text>
            {product.category?.description && (
              <Text style={[styles.categoryDescription, { color: colors.textSecondary }]}>
                {product.category.description}
              </Text>
            )}
          </View>
        </View>

        {/* You May Also Like (mockup) */}
        <View style={styles.relatedSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>You may also like</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.relatedItemsContainer}
          >
            {[1, 2, 3].map((i) => (
              <View key={i} style={[styles.relatedItem, { backgroundColor: colors.card }]}>
                <Image
                  source={{ uri: 'https://via.placeholder.com/200x120' }}
                  style={styles.relatedItemImage}
                />
                <Text style={[styles.relatedItemName, { color: colors.text }]}>Sample Product {i}</Text>
                <Text style={[styles.relatedItemPrice, { color: colors.themedPrice }]}>₱{(product.base_price + i * 10).toFixed(2)}</Text>
              </View>
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
          <Text style={[styles.addToCartText, { color: colors.black }]}>Add to Cart - ₱{(selectedSizePrice * quantity).toFixed(2)}</Text>
        </TouchableOpacity>
      </View>

      {/* Cart Notification Modal */}
      {addedItem && (
        <CartNotification
          visible={showCartNotification}
          productName={addedItem.name}
          quantity={addedItem.quantity}
          totalPrice={addedItem.totalPrice}
          onGoToCart={handleGoToCart}
          onContinueShopping={handleContinueShopping}
          onClose={handleCloseNotification}
        />
      )}
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
    backgroundColor: 'transparent',
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
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  iconShadow: {
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
  productTitleContainer: {
    flex: 1,
    paddingRight: 12,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: Layout.fontFamily.regular,
    textAlign: 'center',
  },
  preparationTime: {
    fontSize: 16,
    fontFamily: Layout.fontFamily.regular,
    marginTop: 4,
  },
  categoryName: {
    fontSize: 16,
    fontFamily: Layout.fontFamily.semiBold,
    marginTop: 4,
  },
  categoryDescription: {
    fontSize: 14,
    fontFamily: Layout.fontFamily.regular,
    marginTop: 2,
    fontStyle: 'italic',
  },
  pizzaOptionContent: {
    padding: 12,
    alignItems: 'center',
  },
});