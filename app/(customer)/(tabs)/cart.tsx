import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    removeItem, 
    updateQuantity, 
    clearCart 
  } = useCart();
  const { validationErrors, isValid } = useCartValidation();
  
  const handleCheckout = () => {
    if (isValid) {
      router.push('/(customer)/checkout');
    }
  };

  const renderCartItem = ({ item }: { item: any }) => (
    <ResponsiveView 
      backgroundColor={colors.surface}
      borderRadius="md"
      padding="md"
      marginBottom="sm"
      flexDirection="row"
      alignItems="center"
    >
      <Image 
        source={{ uri: item.product_image || 'https://via.placeholder.com/80x80' }}
        style={styles.itemImage}
      />
      <ResponsiveView flex={1} marginLeft="md">
        <ResponsiveText size="md" weight="semiBold" color={colors.text}>
          {item.product_name}
        </ResponsiveText>
        <ResponsiveText size="sm" color={colors.textSecondary}>
          ${item.unit_price.toFixed(2)} each
        </ResponsiveText>
        {item.special_instructions && (
          <ResponsiveView marginTop="xs">
            <ResponsiveText size="xs" color={colors.textSecondary}>
              Note: {item.special_instructions}
            </ResponsiveText>
          </ResponsiveView>
        )}
      </ResponsiveView>
      <ResponsiveView alignItems="center">
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
        <ResponsiveText size="sm" weight="bold" color={colors.primary}>
          ${item.total_price.toFixed(2)}
        </ResponsiveText>
      </ResponsiveView>
      <TouchableOpacity 
        onPress={() => removeItem(item.id)}
        style={styles.removeButton}
      >
        <MaterialIcons name="close" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </ResponsiveView>
  );

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
          <TouchableOpacity 
            style={[styles.browseButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(customer)/(tabs)')}
          >
            <ResponsiveText size="md" weight="semiBold" color={colors.background}>
              Browse Menu
            </ResponsiveText>
          </TouchableOpacity>
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
          <TouchableOpacity onPress={clearCart}>
            <ResponsiveText size="sm" color={colors.error}>
              Clear All
            </ResponsiveText>
          </TouchableOpacity>
        </ResponsiveView>

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
                Subtotal ({totalItems} items)
              </ResponsiveText>
              <ResponsiveText size="md" color={colors.text}>
                ${subtotal.toFixed(2)}
              </ResponsiveText>
            </ResponsiveView>
            
            <ResponsiveView flexDirection="row" justifyContent="space-between" marginBottom="xs">
              <ResponsiveText size="md" color={colors.textSecondary}>
                Delivery Fee
              </ResponsiveText>
              <ResponsiveText size="md" color={colors.text}>
                ${deliveryFee.toFixed(2)}
              </ResponsiveText>
            </ResponsiveView>
            
            <ResponsiveView flexDirection="row" justifyContent="space-between" marginBottom="sm">
              <ResponsiveText size="md" color={colors.textSecondary}>
                Tax
              </ResponsiveText>
              <ResponsiveText size="md" color={colors.text}>
                ${tax.toFixed(2)}
              </ResponsiveText>
            </ResponsiveView>
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <ResponsiveView flexDirection="row" justifyContent="space-between" marginTop="sm">
              <ResponsiveText size="lg" weight="bold" color={colors.text}>
                Total
              </ResponsiveText>
              <ResponsiveText size="lg" weight="bold" color={colors.primary}>
                ${total.toFixed(2)}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>

          <TouchableOpacity 
            style={[
              styles.checkoutButton, 
              { 
                backgroundColor: isValid ? colors.primary : colors.textSecondary,
                opacity: isValid ? 1 : 0.6
              }
            ]}
            onPress={handleCheckout}
            disabled={!isValid}
          >
            <ResponsiveText size="md" weight="bold" color={colors.background}>
              Proceed to Checkout
            </ResponsiveText>
          </TouchableOpacity>
        </ResponsiveView>
      </ResponsiveView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: Layout.fontWeight.bold, fontFamily: Layout.fontFamily.bold, marginBottom: 8 },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  quantityButton: {
    padding: 8,
  },
  removeButton: {
    padding: 8,
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


