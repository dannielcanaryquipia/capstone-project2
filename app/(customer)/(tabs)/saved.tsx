import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlert } from '../../../components/ui/AlertProvider';
import ProductCard from '../../../components/ui/ProductCard';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import Responsive from '../../../constants/Responsive';
import { useSavedProducts } from '../../../contexts/SavedProductsContext';
import { useTheme } from '../../../contexts/ThemeContext';

export default function SavedScreen() {
  const { colors } = useTheme();
  const { savedProducts, isLoading, error, unsaveProduct, refreshSavedProducts } = useSavedProducts();
  const { confirmDestructive, error: showError } = useAlert();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [removingProductId, setRemovingProductId] = useState<string | null>(null);

  const handleRemoveProduct = async (productId: string, productName: string) => {
    confirmDestructive(
      'Remove from Saved',
      `Are you sure you want to remove "${productName}" from your saved products?`,
      async () => {
        try {
          setRemovingProductId(productId);
          await unsaveProduct(productId);
          // The unsaveProduct function already refreshes the list automatically
        } catch (error) {
          console.error('Error removing product:', error);
          showError('Error', 'Failed to remove product. Please try again.');
        } finally {
          setRemovingProductId(null);
        }
      },
      () => {
        // Cancel action - do nothing
      },
      'Remove',
      'Cancel'
    );
  };

  const renderEmptyState = () => (
    <ResponsiveView 
      flex={1} 
      justifyContent="center" 
      alignItems="center" 
      paddingHorizontal="xl"
    >
      <ResponsiveView 
        backgroundColor={colors.surfaceVariant}
        borderRadius="round"
        padding="xl"
        marginBottom="lg"
      >
        <MaterialIcons 
          name="favorite-border" 
          size={Responsive.responsiveValue(48, 56, 64, 72)} 
          color={colors.textSecondary} 
        />
      </ResponsiveView>
      
      <ResponsiveView marginBottom="sm">
        <ResponsiveText 
          size="xl" 
          weight="bold" 
          color={colors.text}
          style={{ textAlign: 'center' }}
        >
          No saved products
        </ResponsiveText>
      </ResponsiveView>
      
      <ResponsiveView marginBottom="xl">
        <ResponsiveText 
          size="md" 
          color={colors.textSecondary}
          style={{ textAlign: 'center' }}
        >
          Start saving your products by tapping the heart icon on any product
        </ResponsiveText>
      </ResponsiveView>
      
      <TouchableOpacity 
        style={[styles.browseButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(customer)/menu')}
      >
        <ResponsiveText size="md" weight="semiBold" color={colors.background}>
          Browse Menu
        </ResponsiveText>
      </TouchableOpacity>
    </ResponsiveView>
  );

  const renderProduct = ({ item }: { item: any }) => {
    const product = item.product || item; // Handle both structures
    const isRemoving = removingProductId === product.id;
    
    return (
      <View style={styles.productContainer}>
        <ProductCard
          id={product.id}
          name={product.name}
          description={product.description}
          price={product.base_price || product.price}
          image={product.image_url || product.image}
          tags={product.is_recommended ? ['Recommended'] : []}
          variant="vertical"
          backgroundColor={colors.card}
          textColor={colors.text}
          priceColor={colors.themedPrice}
          onPress={() => router.push({
            pathname: '/(customer)/product/[id]',
            params: { id: product.id }
          } as any)}
        />
        <TouchableOpacity
          style={[
            styles.removeButton,
            { 
              backgroundColor: colors.error || '#FF4444',
              opacity: isRemoving ? 0.6 : 1
            }
          ]}
          onPress={() => handleRemoveProduct(product.id, product.name)}
          disabled={isRemoving}
        >
          <MaterialIcons 
            name="close" 
            size={Responsive.responsiveValue(16, 18, 20, 22)} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ResponsiveView 
          flex={1} 
          justifyContent="center" 
          alignItems="center"
          style={{ paddingTop: insets.top }}
        >
          <ResponsiveText size="lg" color={colors.textSecondary}>
            Loading saved products...
          </ResponsiveText>
        </ResponsiveView>
      </View>
    );
  }

  if (savedProducts.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ResponsiveView style={{ paddingTop: insets.top }}>
          {renderEmptyState()}
        </ResponsiveView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ResponsiveView 
        paddingHorizontal="lg" 
        paddingVertical="md"
        marginBottom="sm"
        style={{ paddingTop: insets.top }}
      >
        <ResponsiveText 
          size="xxl" 
          weight="bold" 
          color={colors.text}
        >
          Saved Products
        </ResponsiveText>
        <ResponsiveView marginTop="xs">
          <ResponsiveText 
            size="sm" 
            color={colors.textSecondary}
          >
            {savedProducts.length} saved product{savedProducts.length !== 1 ? 's' : ''}
          </ResponsiveText>
        </ResponsiveView>
      </ResponsiveView>

      <FlatList
        data={savedProducts}
        numColumns={Responsive.responsiveValue(1, 1, 1, 2)}
        key={`saved-${Responsive.responsiveValue(1, 1, 1, 2)}`}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ 
          padding: Responsive.ResponsiveSpacing.md,
          paddingBottom: Responsive.ResponsiveSpacing.xl
        }}
        columnWrapperStyle={Responsive.isTablet ? { 
          justifyContent: 'space-between',
          marginBottom: Responsive.ResponsiveSpacing.md,
          paddingHorizontal: Responsive.ResponsiveSpacing.xs,
          gap: Responsive.ResponsiveSpacing.sm
        } : undefined}
        renderItem={renderProduct}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  productContainer: {
    position: 'relative',
    marginBottom: Responsive.responsiveValue(8, 10, 12, 16),
  },
  removeButton: {
    position: 'absolute',
    top: Responsive.responsiveValue(8, 10, 12, 14),
    right: Responsive.responsiveValue(8, 10, 12, 14),
    width: Responsive.responsiveValue(28, 32, 36, 40),
    height: Responsive.responsiveValue(28, 32, 36, 40),
    borderRadius: Responsive.responsiveValue(14, 16, 18, 20),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: Responsive.responsiveValue(2, 3, 4, 6) },
    shadowOpacity: 0.25,
    shadowRadius: Responsive.responsiveValue(4, 5, 6, 8),
    elevation: Responsive.responsiveValue(3, 4, 5, 6),
  },
});


