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
    selectedTotal,
    removeItem, 
    updateQuantity, 
    clearCart,
    toggleItemSelection,
    selectAllItems,
    clearSelection,
    getSelectedItems
  } = useCart();
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
        <Image 
          source={{ uri: item.product_image || 'https://via.placeholder.com/80x80' }}
          style={styles.itemImage}
        />

        {/* Product Details */}
        <ResponsiveView flex={1} marginLeft="md">
          <ResponsiveText size="md" weight="semiBold" color={colors.text}>
            {item.product_name}
          </ResponsiveText>
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
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
              style={styles.quantityButton}
            >
              <MaterialIcons name="remove" size={16} color={colors.text} />
            </TouchableOpacity>
            <ResponsiveView paddingHorizontal="md">
              <ResponsiveText size="sm" weight="semiBold" color={colors.text}>
                {item.quantity}
              </ResponsiveText>
            </ResponsiveView>
            <TouchableOpacity 
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
              style={styles.quantityButton}
            >
              <MaterialIcons name="add" size={16} color={colors.text} />
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
          <ResponsiveText size="xl" weight="bold" color={colors.text}>
            Cart ({totalItems})
          </ResponsiveText>
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
              {selectedItems.length} of {totalItems} selected
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
            
            <ResponsiveView flexDirection="row" justifyContent="space-between" marginBottom="xs">
              <ResponsiveText size="md" color={colors.textSecondary}>
                Delivery Fee
              </ResponsiveText>
              <ResponsiveText size="md" color={colors.text}>
                ₱{(0).toFixed(2)}
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


