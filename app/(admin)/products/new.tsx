import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import { useTheme } from '../../../contexts/ThemeContext';
import { ProductService } from '../../../services/product.service';
import { ProductCategory, ProductFormData } from '../../../types/product.types';

export default function NewProductScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    category_id: '',
    image_url: '',
    is_available: true,
    is_recommended: false,
    preparation_time: 15,
    calories: 0,
    allergens: [],
    ingredients: [],
    stock_quantity: 0,
    low_stock_threshold: 10,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await ProductService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories. Please try again.');
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Product name is required.');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Validation Error', 'Product description is required.');
      return;
    }
    if (formData.price <= 0) {
      Alert.alert('Validation Error', 'Product price must be greater than 0.');
      return;
    }
    if (!formData.category_id) {
      Alert.alert('Validation Error', 'Please select a category.');
      return;
    }

    try {
      setLoading(true);
      
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: formData.price,
        category_id: formData.category_id,
        image_url: formData.image_url || undefined,
        is_available: formData.is_available,
        is_recommended: formData.is_recommended,
        preparation_time: formData.preparation_time,
        calories: formData.calories || undefined,
        allergens: formData.allergens,
        ingredients: formData.ingredients,
      };

      await ProductService.createProduct(productData);
      
      // Update stock if provided
      if (formData.stock_quantity && formData.stock_quantity > 0) {
        // This would be handled in the createProduct method
        // or we could call updateStock separately
      }

      Alert.alert(
        'Success', 
        'Product created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          }
        ]
      );
    } catch (error) {
      console.error('Error creating product:', error);
      Alert.alert('Error', 'Failed to create product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ResponsiveView style={styles.header}>
        <ResponsiveView style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ResponsiveText size="xl" weight="bold" color={colors.text}>
            Add New Product
          </ResponsiveText>
          <View style={{ width: 24 }} />
        </ResponsiveView>
        <ResponsiveText size="md" color={colors.textSecondary}>
          Create a new menu item for your restaurant
        </ResponsiveText>
      </ResponsiveView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ResponsiveView style={styles.form}>
          {/* Basic Information */}
          <ResponsiveView style={styles.section}>
            <ResponsiveView marginBottom="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Basic Information
              </ResponsiveText>
            </ResponsiveView>
            
            <ResponsiveView marginBottom="md">
              <ResponsiveView marginBottom="xs">
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  Product Name *
                </ResponsiveText>
              </ResponsiveView>
              <Input
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder="Enter product name"
                autoCapitalize="words"
              />
            </ResponsiveView>

            <ResponsiveView marginBottom="md">
              <ResponsiveView marginBottom="xs">
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  Description *
                </ResponsiveText>
              </ResponsiveView>
              <Input
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                placeholder="Enter product description"
                multiline
                numberOfLines={3}
              />
            </ResponsiveView>

            <ResponsiveView marginBottom="md">
              <ResponsiveView marginBottom="xs">
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  Category *
                </ResponsiveText>
              </ResponsiveView>
              <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryOption,
                        formData.category_id === category.id && {
                          backgroundColor: colors.primary,
                          borderColor: colors.primary,
                        },
                        formData.category_id !== category.id && {
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => handleInputChange('category_id', category.id)}
                    >
                      <ResponsiveText 
                        size="sm" 
                        color={formData.category_id === category.id ? colors.background : colors.text}
                        weight="medium"
                      >
                        {category.name}
                      </ResponsiveText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </ResponsiveView>

            <ResponsiveView marginBottom="md">
              <ResponsiveView marginBottom="xs">
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  Price (₱) *
                </ResponsiveText>
              </ResponsiveView>
              <Input
                value={formData.price.toString()}
                onChangeText={(value) => handleInputChange('price', parseFloat(value) || 0)}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </ResponsiveView>

            <ResponsiveView marginBottom="md">
              <ResponsiveView marginBottom="xs">
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  Image URL
                </ResponsiveText>
              </ResponsiveView>
              <Input
                value={formData.image_url}
                onChangeText={(value) => handleInputChange('image_url', value)}
                placeholder="https://example.com/image.jpg"
                keyboardType="url"
                autoCapitalize="none"
              />
            </ResponsiveView>
          </ResponsiveView>

          {/* Additional Information */}
          <ResponsiveView style={styles.section}>
            <ResponsiveView marginBottom="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Additional Information
              </ResponsiveText>
            </ResponsiveView>
            
            <ResponsiveView marginBottom="md">
              <ResponsiveView marginBottom="xs">
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  Preparation Time (minutes)
                </ResponsiveText>
              </ResponsiveView>
              <Input
                value={formData.preparation_time?.toString() || ''}
                onChangeText={(value) => handleInputChange('preparation_time', parseInt(value) || 0)}
                placeholder="15"
                keyboardType="numeric"
              />
            </ResponsiveView>

            <ResponsiveView marginBottom="md">
              <ResponsiveView marginBottom="xs">
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  Calories
                </ResponsiveText>
              </ResponsiveView>
              <Input
                value={formData.calories?.toString() || ''}
                onChangeText={(value) => handleInputChange('calories', parseInt(value) || 0)}
                placeholder="0"
                keyboardType="numeric"
              />
            </ResponsiveView>
          </ResponsiveView>

          {/* Inventory */}
          <ResponsiveView style={styles.section}>
            <ResponsiveView marginBottom="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Inventory
              </ResponsiveText>
            </ResponsiveView>
            
            <ResponsiveView marginBottom="md">
              <ResponsiveView marginBottom="xs">
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  Initial Stock Quantity
                </ResponsiveText>
              </ResponsiveView>
              <Input
                value={formData.stock_quantity?.toString() || ''}
                onChangeText={(value) => handleInputChange('stock_quantity', parseInt(value) || 0)}
                placeholder="0"
                keyboardType="numeric"
              />
            </ResponsiveView>

            <ResponsiveView marginBottom="md">
              <ResponsiveView marginBottom="xs">
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  Low Stock Threshold
                </ResponsiveText>
              </ResponsiveView>
              <Input
                value={formData.low_stock_threshold?.toString() || ''}
                onChangeText={(value) => handleInputChange('low_stock_threshold', parseInt(value) || 0)}
                placeholder="10"
                keyboardType="numeric"
              />
            </ResponsiveView>
          </ResponsiveView>

          {/* Settings */}
          <ResponsiveView style={styles.section}>
            <ResponsiveView marginBottom="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Settings
              </ResponsiveText>
            </ResponsiveView>
            
            <ResponsiveView style={styles.toggleRow}>
              <ResponsiveView style={styles.toggleInfo}>
                <ResponsiveText size="md" color={colors.text}>
                  Available for Order
                </ResponsiveText>
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  Customers can order this product
                </ResponsiveText>
              </ResponsiveView>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  formData.is_available && { backgroundColor: colors.primary },
                  !formData.is_available && { backgroundColor: colors.border },
                ]}
                onPress={() => handleInputChange('is_available', !formData.is_available)}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    formData.is_available && styles.toggleThumbActive,
                  ]}
                />
              </TouchableOpacity>
            </ResponsiveView>

            <ResponsiveView style={styles.toggleRow}>
              <ResponsiveView style={styles.toggleInfo}>
                <ResponsiveText size="md" color={colors.text}>
                  Recommended
                </ResponsiveText>
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  Show as recommended item
                </ResponsiveText>
              </ResponsiveView>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  formData.is_recommended && { backgroundColor: colors.primary },
                  !formData.is_recommended && { backgroundColor: colors.border },
                ]}
                onPress={() => handleInputChange('is_recommended', !formData.is_recommended)}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    formData.is_recommended && styles.toggleThumbActive,
                  ]}
                />
              </TouchableOpacity>
            </ResponsiveView>
          </ResponsiveView>
        </ResponsiveView>
      </ScrollView>

      <ResponsiveView style={styles.footer}>
        <Button
          title="Cancel"
          onPress={() => router.back()}
          variant="outline"
          style={styles.cancelButton}
        />
        <Button
          title="Create Product"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          variant="primary"
          style={styles.submitButton}
        />
      </ResponsiveView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  toggleInfo: {
    flex: 1,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});
