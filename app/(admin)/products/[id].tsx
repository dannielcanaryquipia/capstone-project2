import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import { ResponsiveBorderRadius, ResponsiveSpacing, responsiveValue } from '../../../constants/Responsive';
import { Strings } from '../../../constants/Strings';
import { useTheme } from '../../../contexts/ThemeContext';
import { useProductCategories } from '../../../hooks';
import { ProductService } from '../../../services/product.service';
import global from '../../../styles/global';
import { Product } from '../../../types/product.types';

interface ProductFormData {
  name: string;
  description: string;
  base_price: string;
  preparation_time_minutes: string;
  image_url: string;
  category_id: string;
  is_available: boolean;
  is_recommended: boolean;
}

export default function EditProductScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    base_price: '0.00',
    preparation_time_minutes: '30',
    image_url: '',
    category_id: '',
    is_available: true,
    is_recommended: false,
  });

  const { categories, isLoading: categoriesLoading } = useProductCategories();

  useEffect(() => {
    if (id && id !== 'new') {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    if (!id || id === 'new') return;
    
    setLoading(true);
    try {
      const productData = await ProductService.getProductById(id);
      if (productData) {
        setProduct(productData);
        setFormData({
          name: productData.name,
          description: productData.description || '',
          base_price: productData.base_price.toString(),
          preparation_time_minutes: productData.preparation_time_minutes?.toString() || '30',
          image_url: productData.image_url || '',
          category_id: productData.category_id || '',
          is_available: productData.is_available,
          is_recommended: productData.is_recommended,
        });
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'Failed to load product details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategorySelect = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      category_id: categoryId
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Product name is required');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Validation Error', 'Product description is required');
      return false;
    }
    if (!formData.base_price || parseFloat(formData.base_price) < 0) {
      Alert.alert('Validation Error', 'Valid base price is required');
      return false;
    }
    if (!formData.category_id) {
      Alert.alert('Validation Error', 'Please select a category');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!id || id === 'new' || !product) return;
    if (!validateForm()) return;

    setSaving(true);
    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.base_price),
        preparation_time: parseInt(formData.preparation_time_minutes),
        image_url: formData.image_url.trim() || undefined,
        category_id: formData.category_id,
        is_available: formData.is_available,
        is_recommended: formData.is_recommended,
      };

      await ProductService.updateProduct(id, productData);
      Alert.alert('Success', 'Product updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error updating product:', error);
      Alert.alert('Error', 'Failed to update product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard your changes?',
      [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() }
      ]
    );
  };

  if (loading || categoriesLoading) {
    return (
      <SafeAreaView style={[global.screen, styles.center, { backgroundColor: colors.background }]}>
        <ResponsiveView style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="md" color={colors.textSecondary}>
              {Strings.loading}
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
      </SafeAreaView>
    );
  }

  if (!product && id !== 'new') {
    return (
      <SafeAreaView style={[global.screen, styles.center, { backgroundColor: colors.background }]}>
        <ResponsiveView style={styles.center}>
          <MaterialIcons name="error" size={responsiveValue(48, 56, 64, 72)} color={colors.error} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              Product Not Found
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveView marginTop="sm">
            <ResponsiveText size="md" color={colors.textSecondary} style={{ textAlign: 'center' }}>
              The product you're looking for doesn't exist.
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveView marginTop="lg">
            <Button
              title="Go Back"
              onPress={() => router.back()}
              variant="primary"
            />
          </ResponsiveView>
        </ResponsiveView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[global.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <ResponsiveView style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={responsiveValue(20, 24, 28, 32)} color={colors.text} />
        </TouchableOpacity>
        <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
          Edit Product
        </ResponsiveText>
        <View style={{ width: responsiveValue(20, 24, 28, 32) }} />
      </ResponsiveView>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ResponsiveView style={[styles.formContainer, { backgroundColor: colors.surface }]}>
          {/* Product Name */}
          <ResponsiveView marginBottom="md">
            <ResponsiveView marginBottom="sm">
              <ResponsiveText size="md" weight="medium" color={colors.text}>
                Product Name *
              </ResponsiveText>
            </ResponsiveView>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.background, 
                color: colors.text,
                borderColor: colors.border 
              }]}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter product name"
              placeholderTextColor={colors.textSecondary}
            />
          </ResponsiveView>

          {/* Description */}
          <ResponsiveView marginBottom="md">
            <ResponsiveView marginBottom="sm">
              <ResponsiveText size="md" weight="medium" color={colors.text}>
                Description *
              </ResponsiveText>
            </ResponsiveView>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: colors.background, 
                color: colors.text,
                borderColor: colors.border 
              }]}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              placeholder="Enter product description"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </ResponsiveView>

          {/* Base Price */}
          <ResponsiveView marginBottom="md">
            <ResponsiveView marginBottom="sm">
              <ResponsiveText size="md" weight="medium" color={colors.text}>
                Base Price *
              </ResponsiveText>
            </ResponsiveView>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.background, 
                color: colors.text,
                borderColor: colors.border 
              }]}
              value={formData.base_price}
              onChangeText={(value) => handleInputChange('base_price', value)}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </ResponsiveView>

          {/* Preparation Time */}
          <ResponsiveView marginBottom="md">
            <ResponsiveView marginBottom="sm">
              <ResponsiveText size="md" weight="medium" color={colors.text}>
                Preparation Time (minutes)
              </ResponsiveText>
            </ResponsiveView>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.background, 
                color: colors.text,
                borderColor: colors.border 
              }]}
              value={formData.preparation_time_minutes}
              onChangeText={(value) => handleInputChange('preparation_time_minutes', value)}
              placeholder="30"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </ResponsiveView>

          {/* Image URL */}
          <ResponsiveView marginBottom="md">
            <ResponsiveView marginBottom="sm">
              <ResponsiveText size="md" weight="medium" color={colors.text}>
                Image URL
              </ResponsiveText>
            </ResponsiveView>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.background, 
                color: colors.text,
                borderColor: colors.border 
              }]}
              value={formData.image_url}
              onChangeText={(value) => handleInputChange('image_url', value)}
              placeholder="Enter image URL (optional)"
              placeholderTextColor={colors.textSecondary}
            />
          </ResponsiveView>

          {/* Category Selection */}
          <ResponsiveView marginBottom="md">
            <ResponsiveView marginBottom="sm">
              <ResponsiveText size="md" weight="medium" color={colors.text}>
                Category *
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveView style={styles.categoryContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    { 
                      backgroundColor: formData.category_id === category.id ? colors.primary : colors.background,
                      borderColor: colors.border
                    }
                  ]}
                  onPress={() => handleCategorySelect(category.id)}
                >
                  <ResponsiveText 
                    size="md" 
                    color={formData.category_id === category.id ? colors.surface : colors.text}
                    weight={formData.category_id === category.id ? 'semiBold' : 'regular'}
                  >
                    {category.name}
                  </ResponsiveText>
                </TouchableOpacity>
              ))}
            </ResponsiveView>
          </ResponsiveView>

          {/* Available for Order Toggle */}
          <ResponsiveView style={styles.toggleContainer} marginBottom="md">
            <ResponsiveView style={styles.toggleInfo}>
              <ResponsiveText size="md" weight="medium" color={colors.text}>
                Available for Order
              </ResponsiveText>
              <ResponsiveText size="sm" color={colors.textSecondary}>
                Make this product available for customers to order
              </ResponsiveText>
            </ResponsiveView>
            <TouchableOpacity
              style={[
                styles.toggle,
                { backgroundColor: formData.is_available ? colors.primary : colors.border }
              ]}
              onPress={() => handleInputChange('is_available', !formData.is_available)}
            >
              <View
                style={[
                  styles.toggleThumb,
                  { 
                    backgroundColor: colors.surface,
                    transform: [{ translateX: formData.is_available ? 20 : 2 }]
                  }
                ]}
              />
            </TouchableOpacity>
          </ResponsiveView>

          {/* Recommended Product Toggle */}
          <ResponsiveView style={styles.toggleContainer} marginBottom="lg">
            <ResponsiveView style={styles.toggleInfo}>
              <ResponsiveText size="md" weight="medium" color={colors.text}>
                Recommended Product
              </ResponsiveText>
              <ResponsiveText size="sm" color={colors.textSecondary}>
                Show this product in the recommended section
              </ResponsiveText>
            </ResponsiveView>
            <TouchableOpacity
              style={[
                styles.toggle,
                { backgroundColor: formData.is_recommended ? colors.primary : colors.border }
              ]}
              onPress={() => handleInputChange('is_recommended', !formData.is_recommended)}
            >
              <View
                style={[
                  styles.toggleThumb,
                  { 
                    backgroundColor: colors.surface,
                    transform: [{ translateX: formData.is_recommended ? 20 : 2 }]
                  }
                ]}
              />
            </TouchableOpacity>
          </ResponsiveView>
        </ResponsiveView>
      </ScrollView>

      {/* Action Buttons */}
      <ResponsiveView style={[styles.actionContainer, { backgroundColor: colors.surface }]}>
        <Button
          title="Update Product"
          onPress={handleSave}
          variant="primary"
          loading={saving}
          disabled={saving}
        />
        <ResponsiveView marginTop="sm">
          <Button
            title="Cancel"
            onPress={handleCancel}
            variant="outline"
            disabled={saving}
          />
        </ResponsiveView>
      </ResponsiveView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ResponsiveSpacing.lg,
    paddingVertical: ResponsiveSpacing.md,
    ...Layout.shadows.sm,
  },
  backButton: {
    padding: ResponsiveSpacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: ResponsiveSpacing.lg,
  },
  formContainer: {
    padding: ResponsiveSpacing.lg,
    borderRadius: ResponsiveBorderRadius.lg,
    ...Layout.shadows.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: ResponsiveBorderRadius.md,
    paddingHorizontal: ResponsiveSpacing.md,
    paddingVertical: ResponsiveSpacing.sm,
    fontSize: responsiveValue(14, 16, 18, 20),
  },
  textArea: {
    borderWidth: 1,
    borderRadius: ResponsiveBorderRadius.md,
    paddingHorizontal: ResponsiveSpacing.md,
    paddingVertical: ResponsiveSpacing.sm,
    fontSize: responsiveValue(14, 16, 18, 20),
    minHeight: responsiveValue(80, 90, 100, 120),
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ResponsiveSpacing.sm,
  },
  categoryButton: {
    paddingHorizontal: ResponsiveSpacing.md,
    paddingVertical: ResponsiveSpacing.sm,
    borderRadius: ResponsiveBorderRadius.md,
    borderWidth: 1,
    minWidth: responsiveValue(80, 90, 100, 120),
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleInfo: {
    flex: 1,
    marginRight: ResponsiveSpacing.md,
  },
  toggle: {
    width: responsiveValue(44, 48, 52, 56),
    height: responsiveValue(24, 26, 28, 30),
    borderRadius: responsiveValue(12, 13, 14, 15),
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: responsiveValue(20, 22, 24, 26),
    height: responsiveValue(20, 22, 24, 26),
    borderRadius: responsiveValue(10, 11, 12, 13),
  },
  actionContainer: {
    padding: ResponsiveSpacing.lg,
    ...Layout.shadows.sm,
  },
});
