import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCart, useCartValidation } from '../../../hooks';
import global from '../../../styles/global';

export default function CartScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { 
    items, 
    totalItems, 
    subtotal, 
    deliveryFee, 
    tax, 
    total,
    selectedItems,
    selectedSubtotal,
    removeItem, 
    updateQuantity, 
    clearCart,
    toggleItemSelection,
    selectAllItems,
    clearSelection,
    getSelectedItems
  } = useCart();
  
  // Calculate total directly to avoid cart store discrepancies
  const selectedTotal = selectedSubtotal + 0 + 0; // subtotal + deliveryFee(0) + tax(0)
  const { validationErrors, isValid } = useCartValidation();
  
  const handleCheckout = () => {
    const selectedItemsList = getSelectedItems();
    if (selectedItemsList.length === 0) {
      Alert.alert('No Items Selected', 'Please select at least one item to proceed to checkout.');
      return;
    }
    if (isValid) {
      router.push('/(customer)/checkout');
    }
  };

  const handleItemPress = (item: any) => {
    // Navigate to product detail page
    router.push(`/(customer)/product/${item.product_id}`);
  };

  const renderCartItem = ({ item }: { item: any }) => {
    const isSelected = selectedItems.includes(item.id);
    
    return (
      <ResponsiveView 
        backgroundColor={colors.surface}
        borderRadius="md"
        padding="md"
        marginBottom="sm"
        flexDirection="row"
        alignItems="center"
        style={[
          styles.cartItem,
          isSelected && { borderColor: colors.text, borderWidth: 2 }
        ]}
      >
        {/* Radio Button on the left */}
        <TouchableOpacity 
          onPress={() => toggleItemSelection(item.id)}
          style={styles.radioButton}
        >
          <MaterialIcons 
            name={isSelected ? "radio-button-checked" : "radio-button-unchecked"} 
            size={24} 
            color={isSelected ? colors.text : colors.textSecondary} 
          />
        </TouchableOpacity>

        {/* Product Image */}
        <TouchableOpacity
          onPress={() => handleItemPress(item)}
          style={styles.imageContainer}
          activeOpacity={0.7}
        >
          <Image 
            source={{ uri: item.product_image || 'https://via.placeholder.com/80x80' }}
            style={styles.itemImage}
          />
        </TouchableOpacity>

        {/* Product Details */}
        <ResponsiveView flex={1} marginLeft="md">
          <ResponsiveText size="md" weight="semiBold" color={colors.text}>
            {item.product_name}
          </ResponsiveText>
          
          {/* Customization Details */}
          {(item.pizza_size || item.pizza_crust || (item.toppings && item.toppings.length > 0)) && (
            <ResponsiveView marginTop="xs">
              {item.pizza_size && (
                <ResponsiveText size="xs" color={colors.textSecondary}>
                  Size: {item.pizza_size}
                </ResponsiveText>
              )}
              {item.pizza_crust && (
                <ResponsiveText size="xs" color={colors.textSecondary}>
                  Crust: {item.pizza_crust}
                </ResponsiveText>
              )}
              {item.toppings && item.toppings.length > 0 && (
                <ResponsiveText size="xs" color={colors.textSecondary} numberOfLines={1}>
                  Toppings: {item.toppings.join(', ')}
                </ResponsiveText>
              )}
            </ResponsiveView>
          )}
          
          <ResponsiveText size="sm" color={colors.textSecondary}>
            ₱{item.unit_price.toFixed(2)} each
          </ResponsiveText>
          {item.special_instructions && (
            <ResponsiveView marginTop="xs">
              <ResponsiveText size="xs" color={colors.textSecondary}>
                Note: {item.special_instructions}
              </ResponsiveText>
            </ResponsiveView>
          )}
        </ResponsiveView>

        {/* Quantity and Price Controls */}
        <ResponsiveView alignItems="center" marginRight="sm">
          <ResponsiveView 
            flexDirection="row" 
            alignItems="center" 
            backgroundColor={colors.surfaceVariant}
            borderRadius="md"
            marginBottom="xs"
          >
            <TouchableOpacity 
              onPress={() => {
                if (item.quantity <= 1) {
                  // Show alert when trying to decrease below 1
                  Alert.alert(
                    'Remove Item',
                    `Are you sure you want to remove ${item.product_name} from your cart?`,
                    [
                      {
                        text: 'Cancel',
                        style: 'cancel',
                      },
                      {
                        text: 'Remove',
                        style: 'destructive',
                        onPress: () => removeItem(item.id),
                      },
                    ]
                  );
                } else {
                  updateQuantity(item.id, item.quantity - 1);
                }
              }}
              style={[
                styles.quantityButton,
                item.quantity <= 1 && { opacity: 0.5 }
              ]}
              disabled={item.quantity <= 1}
            >
              <MaterialIcons 
                name="remove" 
                size={16} 
                color={item.quantity <= 1 ? colors.textSecondary : colors.text} 
              />
            </TouchableOpacity>
            <ResponsiveView paddingHorizontal="md">
              <ResponsiveText size="sm" weight="semiBold" color={colors.text}>
                {item.quantity}
              </ResponsiveText>
            </ResponsiveView>
            <TouchableOpacity 
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
              style={[
                styles.quantityButton,
                item.quantity >= 10 && { opacity: 0.5 }
              ]}
              disabled={item.quantity >= 10}
            >
              <MaterialIcons 
                name="add" 
                size={16} 
                color={item.quantity >= 10 ? colors.textSecondary : colors.text} 
              />
            </TouchableOpacity>
          </ResponsiveView>
          <ResponsiveText size="sm" weight="bold" color={colors.text}>
            ₱{item.total_price.toFixed(2)}
          </ResponsiveText>
        </ResponsiveView>

        {/* Item action top-right: Remove only */}
        <ResponsiveView style={styles.itemActionsRow}>
          <TouchableOpacity 
            onPress={() => removeItem(item.id)}
            style={styles.removeButton}
          >
            <MaterialIcons name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </ResponsiveView>
      </ResponsiveView>
    );
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={[global.screen, { backgroundColor: colors.background }]}>
        <ResponsiveView 
          flex={1} 
          justifyContent="center" 
          alignItems="center" 
          paddingHorizontal="lg"
        >
          <MaterialIcons 
            name="shopping-cart" 
            size={80} 
            color={colors.textSecondary} 
          />
          <ResponsiveView marginTop="md" marginBottom="sm">
            <ResponsiveText 
              size="xl" 
              weight="bold" 
              color={colors.text}
            >
              Your cart is empty
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveView marginBottom="lg">
            <ResponsiveText 
              size="md" 
              color={colors.textSecondary} 
              style={{ textAlign: 'center' }}
            >
              Add some delicious items to get started!
            </ResponsiveText>
          </ResponsiveView>
          <Button
            title="Browse Menu"
            onPress={() => router.push('/(customer)/menu')}
            variant="primary"
            size="large"
          />
        </ResponsiveView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[global.screen, { backgroundColor: colors.background }]}>
      <ResponsiveView flex={1}>
        {/* Header */}
        <ResponsiveView 
          flexDirection="row" 
          justifyContent="space-between" 
          alignItems="center"
          paddingHorizontal="lg"
          paddingVertical="md"
          style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
        >
          <ResponsiveView>
            <ResponsiveText size="xl" weight="bold" color={colors.text}>
              Cart ({items.length})
            </ResponsiveText>
            {items.length >= 8 && (
              <ResponsiveText size="xs" color={colors.textSecondary}>
                {items.length === 10 ? 'Cart is full' : `${10 - items.length} slots remaining`}
              </ResponsiveText>
            )}
          </ResponsiveView>
          <TouchableOpacity onPress={clearSelection}>
            <ResponsiveText size="sm" color={colors.textSecondary}>
              Clear Selection
            </ResponsiveText>
          </TouchableOpacity>
        </ResponsiveView>

        {/* Selection Controls */}
        {items.length > 0 && (
          <ResponsiveView 
            flexDirection="row" 
            justifyContent="space-between" 
            alignItems="center" 
            paddingHorizontal="lg" 
            paddingVertical="sm"
            backgroundColor={colors.surface}
            marginHorizontal="lg"
            borderRadius="md"
            marginBottom="sm"
          >
            <ResponsiveText size="sm" color={colors.textSecondary}>
              {selectedItems.length} of {items.length} selected
            </ResponsiveText>
            <TouchableOpacity onPress={selectAllItems}>
              <ResponsiveText size="sm" color={colors.text}>
                Select All
              </ResponsiveText>
            </TouchableOpacity>
          </ResponsiveView>
        )}

        {/* Cart Items */}
        <FlatList
          data={items}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />

        {/* Validation Errors */}
        {!isValid && validationErrors.length > 0 && (
          <ResponsiveView 
            backgroundColor={colors.error + '10'}
            marginHorizontal="lg"
            marginBottom="md"
            padding="md"
            borderRadius="md"
          >
            {validationErrors.map((error, index) => (
              <ResponsiveText key={index} size="sm" color={colors.error}>
                • {error}
              </ResponsiveText>
            ))}
          </ResponsiveView>
        )}

        {/* Order Summary */}
        <ResponsiveView 
          backgroundColor={colors.surface}
          padding="lg"
          style={{ borderTopWidth: 1, borderTopColor: colors.border }}
        >
          <ResponsiveView marginBottom="md">
            <ResponsiveView marginBottom="sm">
              <ResponsiveText size="lg" weight="bold" color={colors.text}>
                Order Summary
              </ResponsiveText>
            </ResponsiveView>
            
            <ResponsiveView flexDirection="row" justifyContent="space-between" marginBottom="xs">
              <ResponsiveText size="md" color={colors.textSecondary}>
                Subtotal ({selectedItems.length} selected items)
              </ResponsiveText>
              <ResponsiveText size="md" color={colors.text}>
                ₱{selectedSubtotal.toFixed(2)}
              </ResponsiveText>
            </ResponsiveView>
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <ResponsiveView flexDirection="row" justifyContent="space-between" marginTop="sm">
              <ResponsiveText size="lg" weight="bold" color={colors.text}>
                Total
              </ResponsiveText>
            <ResponsiveText size="lg" weight="bold" color={colors.text}>
                ₱{selectedTotal.toFixed(2)}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>

          <Button 
            title={selectedItems.length > 0 
              ? `Proceed to Checkout (${selectedItems.length} items)` 
              : 'Select items to checkout'}
            onPress={handleCheckout}
            disabled={selectedItems.length === 0}
            variant="primary"
            size="large"
            fullWidth
          />
        </ResponsiveView>
      </ResponsiveView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: Layout.fontWeight.bold, fontFamily: Layout.fontFamily.bold, marginBottom: 8 },
  cartItem: {
    position: 'relative',
  },
  radioButton: {
    padding: 8,
    marginRight: 8,
  },
  imageContainer: {
    // Container for clickable image
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  quantityButton: {
    padding: 8,
  },
  removeButton: {
    paddingLeft: 8,
  },
  itemActionsRow: {
    position: 'absolute',
    right: 8,
    top: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  checkoutButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
});


