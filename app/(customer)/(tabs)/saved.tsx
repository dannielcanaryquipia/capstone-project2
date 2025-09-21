import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../../../components/ui/ProductCard';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import Responsive from '../../../constants/Responsive';
import { useTheme } from '../../../contexts/ThemeContext';
import { useSavedProducts, useToggleSaveProduct } from '../../../hooks';

export default function SavedScreen() {
  const { colors } = useTheme();
  const { savedProducts, isLoading, error } = useSavedProducts();
  const { toggleSaveProduct } = useToggleSaveProduct();
  const router = useRouter();

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
        <ResponsiveText 
          size="md" 
          weight="semiBold" 
          color="#FFFFFF"
        >
          Browse Menu
        </ResponsiveText>
      </TouchableOpacity>
    </ResponsiveView>
  );

  const renderProduct = ({ item }: { item: any }) => {
    const product = item.product || item; // Handle both structures
    return (
      <ProductCard
        id={product.id}
        name={product.name}
        price={product.price}
        image={product.image_url || product.image}
        tags={product.is_recommended ? ['Recommended'] : []}
        variant="vertical"
        backgroundColor={colors.card}
        textColor={colors.text}
        priceColor={colors.themedPrice}
        isSaved={true} // All items in this list are saved
        onSaveToggle={() => toggleSaveProduct(product.id)}
        onPress={() => router.push({
          pathname: '/(customer)/product/[id]',
          params: { id: product.id }
        } as any)}
      />
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ResponsiveView 
          flex={1} 
          justifyContent="center" 
          alignItems="center"
        >
          <ResponsiveText size="lg" color={colors.textSecondary}>
            Loading saved products...
          </ResponsiveText>
        </ResponsiveView>
      </SafeAreaView>
    );
  }

  if (savedProducts.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {renderEmptyState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ResponsiveView 
        paddingHorizontal="lg" 
        paddingVertical="md"
        marginBottom="sm"
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  browseButton: {
    paddingHorizontal: Responsive.responsiveValue(24, 28, 32, 36),
    paddingVertical: Responsive.responsiveValue(12, 14, 16, 18),
    borderRadius: Responsive.responsiveValue(12, 14, 16, 20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: Responsive.responsiveValue(2, 3, 4, 6) },
    shadowOpacity: 0.15,
    shadowRadius: Responsive.responsiveValue(6, 8, 10, 12),
    elevation: Responsive.responsiveValue(4, 5, 6, 8),
  },
});


