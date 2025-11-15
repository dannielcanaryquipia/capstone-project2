import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';
import { useAlert } from '../../../components/ui/AlertProvider';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import { ResponsiveBorderRadius, ResponsiveSpacing, responsiveValue } from '../../../constants/Responsive';
import { Strings } from '../../../constants/Strings';
import { useTheme } from '../../../contexts/ThemeContext';
import { useProductCategories } from '../../../hooks';
import { ImageUploadService } from '../../../services/image-upload.service';
import { ProductService } from '../../../services/product.service';
import global from '../../../styles/global';

interface ProductFormData {
  name: string;
  description: string;
  base_price: string;
  preparation_time_minutes: string;
  image_url: string;
  category_id: string;
  newCategoryName: string;
  is_available: boolean;
  is_recommended: boolean;
}

export default function CreateProductScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { show, error: showError } = useAlert();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryMode, setCategoryMode] = useState<'select' | 'create'>('select');
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    base_price: '0.00',
    preparation_time_minutes: '30',
    image_url: '',
    category_id: '',
    newCategoryName: '',
    is_available: true,
    is_recommended: false,
  });

  const { categories, isLoading: categoriesLoading, refresh: refreshCategories } = useProductCategories();

  const handleInputChange = (field: keyof ProductFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategorySelect = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      category_id: categoryId,
      newCategoryName: ''
    }));
    setCategoryMode('select');
    setShowCategoryModal(false);
  };

  const handleCreateNewCategory = () => {
    setCategoryMode('create');
    setFormData(prev => ({
      ...prev,
      category_id: ''
    }));
    setShowCategoryModal(false);
  };

  const pickImage = async (source: 'camera' | 'library') => {
    try {
      let result;
      
      if (source === 'camera') {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted === false) {
          showError('Permission Required', 'Camera permission is required to take photos.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
          showError('Permission Required', 'Photo library permission is required to select images.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        await uploadProductImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showError('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadProductImage = async (uri: string) => {
    setUploadingImage(true);
    try {
      const result = await ImageUploadService.uploadProductImage(null, uri);
      setFormData(prev => ({
        ...prev,
        image_url: result.url
      }));
    } catch (error: any) {
      console.error('Error uploading image:', error);
      showError('Upload Error', error.message || 'Failed to upload image. Please try again.');
      setImageUri(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      showError('Validation Error', 'Product name is required');
      return false;
    }
    if (!formData.description.trim()) {
      showError('Validation Error', 'Product description is required');
      return false;
    }
    if (!formData.base_price || parseFloat(formData.base_price) < 0) {
      showError('Validation Error', 'Valid base price is required');
      return false;
    }
    if (!formData.image_url.trim()) {
      showError('Validation Error', 'Product image is required');
      return false;
    }
    if (categoryMode === 'select' && !formData.category_id) {
      showError('Validation Error', 'Please select a category');
      return false;
    }
    if (categoryMode === 'create' && !formData.newCategoryName.trim()) {
      showError('Validation Error', 'Please enter a category name');
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      base_price: '0.00',
      preparation_time_minutes: '30',
      image_url: '',
      category_id: '',
      newCategoryName: '',
      is_available: true,
      is_recommended: false,
    });
    setImageUri(null);
    setCategoryMode('select');
    setShowCategoryModal(false);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      let categoryId = formData.category_id;

      // If creating a new category, find or create it
      if (categoryMode === 'create' && formData.newCategoryName.trim()) {
        const category = await ProductService.findOrCreateCategory(formData.newCategoryName.trim());
        categoryId = category.id;
        // Refresh categories list to include the new one
        await refreshCategories();
      }

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.base_price),
        preparation_time: parseInt(formData.preparation_time_minutes),
        image_url: formData.image_url.trim(),
        category_id: categoryId,
        is_available: formData.is_available,
        is_recommended: formData.is_recommended,
      };

      await ProductService.createProduct(productData);
      
      // Refresh categories if a new one was created
      if (categoryMode === 'create') {
        await refreshCategories();
      }
      
      // Reset form to clean state
      resetForm();
      
      show('Success', 'Product created successfully!', [
        { text: 'OK', style: 'default', onPress: () => router.push('/(admin)/products' as any) }
      ]);
    } catch (error: any) {
      console.error('Error creating product:', error);
      showError('Error', error.message || 'Failed to create product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    show(
      'Discard Changes',
      'Are you sure you want to discard your changes?',
      [
        { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        { text: 'Keep Editing', style: 'cancel' }
      ]
    );
  };

  if (loading || categoriesLoading) {
    return (
      <SafeAreaView 
        style={[global.screen, styles.center, { backgroundColor: colors.background }]}
        edges={['top', 'bottom', 'left', 'right']}
      >
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

  return (
    <SafeAreaView 
      style={[global.screen, { backgroundColor: colors.background }]}
      edges={['top', 'bottom', 'left', 'right']}
    >
      {/* Header */}
      <ResponsiveView style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.push('/(admin)/products' as any)} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={responsiveValue(20, 24, 28, 32)} color={colors.text} />
        </TouchableOpacity>
        <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
          Create New Product
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

          {/* Product Image Upload */}
          <ResponsiveView marginBottom="md">
            <ResponsiveView marginBottom="sm">
              <ResponsiveText size="md" weight="medium" color={colors.text}>
                Product Image *
              </ResponsiveText>
            </ResponsiveView>
            
            {imageUri ? (
              <ResponsiveView style={styles.imagePreviewContainer}>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={[styles.removeImageButton, { backgroundColor: colors.error }]}
                  onPress={() => {
                    setImageUri(null);
                    setFormData(prev => ({ ...prev, image_url: '' }));
                  }}
                >
                  <MaterialIcons name="close" size={20} color={colors.surface} />
                </TouchableOpacity>
                {uploadingImage && (
                  <ResponsiveView style={styles.uploadingOverlay}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <ResponsiveText size="sm" color={colors.text} style={{ marginTop: 8 }}>
                      Uploading...
                    </ResponsiveText>
                  </ResponsiveView>
                )}
              </ResponsiveView>
            ) : (
              <ResponsiveView style={styles.imageUploadContainer}>
                <TouchableOpacity
                  style={[styles.imageUploadButton, { 
                    backgroundColor: colors.background,
                    borderColor: colors.border 
                  }]}
                  onPress={() => show(
                    'Select Image',
                    'Choose an option',
                    [
                      { text: 'Camera', style: 'default', onPress: () => pickImage('camera') },
                      { text: 'Gallery', style: 'default', onPress: () => pickImage('library') },
                      { text: 'Cancel', style: 'cancel' }
                    ]
                  )}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <>
                      <MaterialIcons name="image" size={32} color={colors.textSecondary} />
                      <ResponsiveText size="sm" color={colors.textSecondary} style={{ marginTop: 8 }}>
                        Tap to upload image
                      </ResponsiveText>
                    </>
                  )}
                </TouchableOpacity>
              </ResponsiveView>
            )}
          </ResponsiveView>

          {/* Category Selection */}
          <ResponsiveView marginBottom="md">
            <ResponsiveView marginBottom="sm" style={styles.categoryHeader}>
              <ResponsiveText size="md" weight="medium" color={colors.text}>
                Category *
              </ResponsiveText>
              <TouchableOpacity
                onPress={() => setShowCategoryModal(true)}
                style={[styles.addCategoryButton, { backgroundColor: colors.primary }]}
              >
                <MaterialIcons name="add" size={18} color={colors.surface} />
                <ResponsiveText size="sm" color={colors.surface} style={{ marginLeft: 4 }}>
                  New
                </ResponsiveText>
              </TouchableOpacity>
            </ResponsiveView>

            {categoryMode === 'select' ? (
              <ResponsiveView style={styles.categoryContainer}>
                {categories.length === 0 ? (
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    No categories available. Create a new one.
                  </ResponsiveText>
                ) : (
                  categories.map((category) => (
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
                  ))
                )}
              </ResponsiveView>
            ) : (
              <ResponsiveView>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.background, 
                    color: colors.text,
                    borderColor: colors.border 
                  }]}
                  value={formData.newCategoryName}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, newCategoryName: value }))}
                  placeholder="Enter new category name"
                  placeholderTextColor={colors.textSecondary}
                />
                <TouchableOpacity
                  onPress={() => {
                    setCategoryMode('select');
                    setFormData(prev => ({ ...prev, newCategoryName: '' }));
                  }}
                  style={[styles.switchModeButton, { borderColor: colors.border }]}
                >
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    Select existing category instead
                  </ResponsiveText>
                </TouchableOpacity>
              </ResponsiveView>
            )}
          </ResponsiveView>

          {/* Category Selection Modal */}
          <Modal
            visible={showCategoryModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowCategoryModal(false)}
          >
            <View style={styles.modalOverlay}>
              <ResponsiveView style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                <ResponsiveView style={styles.modalHeader}>
                  <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                    Category Options
                  </ResponsiveText>
                  <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                    <MaterialIcons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </ResponsiveView>

                <TouchableOpacity
                  style={[styles.modalOption, { borderColor: colors.border }]}
                  onPress={() => {
                    setCategoryMode('select');
                    setShowCategoryModal(false);
                  }}
                >
                  <MaterialIcons name="list" size={24} color={colors.primary} />
                  <ResponsiveView style={{ marginLeft: 12 }}>
                    <ResponsiveText size="md" weight="medium" color={colors.text}>
                      Select Existing Category
                    </ResponsiveText>
                    <ResponsiveText size="sm" color={colors.textSecondary}>
                      Choose from existing categories
                    </ResponsiveText>
                  </ResponsiveView>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalOption, { borderColor: colors.border }]}
                  onPress={handleCreateNewCategory}
                >
                  <MaterialIcons name="add-circle" size={24} color={colors.primary} />
                  <ResponsiveView style={{ marginLeft: 12 }}>
                    <ResponsiveText size="md" weight="medium" color={colors.text}>
                      Create New Category
                    </ResponsiveText>
                    <ResponsiveText size="sm" color={colors.textSecondary}>
                      Add a new category to the list
                    </ResponsiveText>
                  </ResponsiveView>
                </TouchableOpacity>
              </ResponsiveView>
            </View>
          </Modal>

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
          title="Create Product"
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
  imageUploadContainer: {
    marginTop: ResponsiveSpacing.sm,
  },
  imageUploadButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: ResponsiveBorderRadius.md,
    padding: ResponsiveSpacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: responsiveValue(120, 140, 160, 180),
  },
  imagePreviewContainer: {
    position: 'relative',
    marginTop: ResponsiveSpacing.sm,
  },
  imagePreview: {
    width: '100%',
    height: responsiveValue(200, 240, 280, 320),
    borderRadius: ResponsiveBorderRadius.md,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: ResponsiveSpacing.sm,
    right: ResponsiveSpacing.sm,
    width: responsiveValue(32, 36, 40, 44),
    height: responsiveValue(32, 36, 40, 44),
    borderRadius: responsiveValue(16, 18, 20, 22),
    alignItems: 'center',
    justifyContent: 'center',
    ...Layout.shadows.sm,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: ResponsiveBorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ResponsiveSpacing.sm,
    paddingVertical: ResponsiveSpacing.xs,
    borderRadius: ResponsiveBorderRadius.sm,
  },
  switchModeButton: {
    marginTop: ResponsiveSpacing.sm,
    padding: ResponsiveSpacing.sm,
    borderWidth: 1,
    borderRadius: ResponsiveBorderRadius.sm,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: ResponsiveBorderRadius.xl,
    borderTopRightRadius: ResponsiveBorderRadius.xl,
    padding: ResponsiveSpacing.lg,
    paddingBottom: ResponsiveSpacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ResponsiveSpacing.lg,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ResponsiveSpacing.md,
    borderWidth: 1,
    borderRadius: ResponsiveBorderRadius.md,
    marginBottom: ResponsiveSpacing.md,
  },
});