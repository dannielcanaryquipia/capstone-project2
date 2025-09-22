import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity
} from 'react-native';
import Button from '../../../components/ui/Button';
import ResponsiveText from '../../../components/ui/ResponsiveText';
import ResponsiveView from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import { useTheme } from '../../../contexts/ThemeContext';
import {
    CreateAddressData,
    UpdateAddressData,
    useAddress,
    useAddressValidation,
    useCreateAddress,
    useUpdateAddress
} from '../../../hooks/useAddresses';
import global from '../../../styles/global';

export default function AddressFormScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { addressId } = useLocalSearchParams<{ addressId?: string }>();
  const isEditing = !!addressId;
  
  const { address, isLoading: loadingAddress } = useAddress(addressId || '');
  const { createAddress, isLoading: isCreating } = useCreateAddress();
  const { updateAddress, isLoading: isUpdating } = useUpdateAddress();
  const { validationErrors, validateAddress } = useAddressValidation();
  
  const [formData, setFormData] = useState<CreateAddressData>({
    label: '',
    full_name: '',
    phone_number: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United States',
    is_default: false,
    delivery_instructions: '',
  });

  const isLoading = isCreating || isUpdating || (isEditing && loadingAddress);

  // Load address data when editing
  useEffect(() => {
    if (isEditing && address) {
      setFormData({
        label: address.label,
        full_name: address.full_name,
        phone_number: address.phone_number,
        address_line_1: address.address_line_1,
        address_line_2: address.address_line_2 || '',
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country,
        is_default: address.is_default,
        delivery_instructions: address.delivery_instructions || '',
      });
    }
  }, [isEditing, address]);

  const handleInputChange = (field: keyof CreateAddressData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Validate form
    if (!validateAddress(formData)) {
      Alert.alert('Validation Error', 'Please fix the errors before saving.');
      return;
    }

    try {
      if (isEditing) {
        const updateData: UpdateAddressData = {
          id: addressId!,
          ...formData,
        };
        await updateAddress(updateData);
        Alert.alert('Success', 'Address updated successfully');
      } else {
        await createAddress(formData);
        Alert.alert('Success', 'Address added successfully');
      }
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save address. Please try again.');
    }
  };

  const handleCancel = () => {
    if (formData.label || formData.full_name || formData.address_line_1) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  const renderInput = (
    field: keyof CreateAddressData,
    label: string,
    placeholder: string,
    options: {
      keyboardType?: 'default' | 'phone-pad' | 'numeric';
      autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
      multiline?: boolean;
      numberOfLines?: number;
    } = {}
  ) => {
    const value = formData[field] as string;
    const error = validationErrors[field];
    
    return (
      <ResponsiveView style={styles.inputGroup}>
        <ResponsiveView marginBottom="xs">
          <ResponsiveText size="md" weight="medium" color={colors.text}>
            {label}
            {['label', 'full_name', 'phone_number', 'address_line_1', 'city', 'state', 'postal_code', 'country'].includes(field) && ' *'}
          </ResponsiveText>
        </ResponsiveView>
        <TextInput
          style={[
            styles.textInput,
            { 
              borderColor: error ? colors.error : colors.border,
              color: colors.text,
              backgroundColor: colors.surface 
            },
            options.multiline && styles.multilineInput
          ]}
          value={value}
          onChangeText={(text) => handleInputChange(field, text)}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          keyboardType={options.keyboardType || 'default'}
          autoCapitalize={options.autoCapitalize || 'sentences'}
          multiline={options.multiline}
          numberOfLines={options.numberOfLines}
          autoCorrect={false}
        />
        {error && (
          <ResponsiveView marginTop="xs">
            <ResponsiveText size="sm" color={colors.error}>
              {error}
            </ResponsiveText>
          </ResponsiveView>
        )}
      </ResponsiveView>
    );
  };

  return (
    <ScrollView style={[global.screen, { backgroundColor: colors.background }]}>
      <ResponsiveView padding="lg">
        {/* Header */}
        <ResponsiveView style={[styles.header, { backgroundColor: colors.surface }]}>
          <ResponsiveView style={styles.headerLeft}>
            <Button
              title=""
              onPress={handleCancel}
              variant="text"
              icon={<MaterialIcons name="arrow-back" size={24} color={colors.text} />}
              style={styles.backButton}
            />
            <ResponsiveText size="xl" weight="bold" color={colors.text}>
              {isEditing ? 'Edit Address' : 'Add Address'}
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>

        {/* Form */}
        <ResponsiveView style={styles.form}>
          {/* Address Label */}
          {renderInput('label', 'Address Label', 'e.g., Home, Work, Office')}

          {/* Recipient Information */}
          <ResponsiveView style={styles.section}>
            <ResponsiveView marginBottom="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Recipient Information
              </ResponsiveText>
            </ResponsiveView>
            {renderInput('full_name', 'Full Name', 'Enter recipient name')}
            {renderInput('phone_number', 'Phone Number', 'Enter phone number', { keyboardType: 'phone-pad' })}
          </ResponsiveView>

          {/* Address Information */}
          <ResponsiveView style={styles.section}>
            <ResponsiveView marginBottom="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Address Information
              </ResponsiveText>
            </ResponsiveView>
            {renderInput('address_line_1', 'Address Line 1', 'Street address, P.O. box, company name')}
            {renderInput('address_line_2', 'Address Line 2', 'Apartment, suite, unit, building, floor, etc. (optional)')}
            
            <ResponsiveView style={styles.row}>
              <ResponsiveView style={styles.halfWidth}>
                {renderInput('city', 'City', 'Enter city')}
              </ResponsiveView>
              <ResponsiveView style={styles.halfWidth}>
                {renderInput('state', 'State/Province', 'Enter state')}
              </ResponsiveView>
            </ResponsiveView>
            
            <ResponsiveView style={styles.row}>
              <ResponsiveView style={styles.halfWidth}>
                {renderInput('postal_code', 'Postal Code', 'Enter postal code', { keyboardType: 'numeric' })}
              </ResponsiveView>
              <ResponsiveView style={styles.halfWidth}>
                {renderInput('country', 'Country', 'Enter country')}
              </ResponsiveView>
            </ResponsiveView>
          </ResponsiveView>

          {/* Additional Information */}
          <ResponsiveView style={styles.section}>
            <ResponsiveView marginBottom="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Additional Information
              </ResponsiveText>
            </ResponsiveView>
            
            {renderInput('delivery_instructions', 'Delivery Instructions', 'Any special instructions for delivery (optional)', {
              multiline: true,
              numberOfLines: 3
            })}

            {/* Set as Default */}
            <TouchableOpacity
              style={[styles.checkboxRow, { borderColor: colors.border }]}
              onPress={() => handleInputChange('is_default', !formData.is_default)}
              activeOpacity={0.7}
            >
              <ResponsiveView style={[styles.checkbox, { 
                backgroundColor: formData.is_default ? colors.primary : 'transparent',
                borderColor: formData.is_default ? colors.primary : colors.border
              }]}>
                {formData.is_default && (
                  <MaterialIcons name="check" size={16} color={colors.textInverse} />
                )}
              </ResponsiveView>
              <ResponsiveView marginLeft="sm" style={styles.checkboxText}>
                <ResponsiveText size="md" color={colors.text}>
                  Set as default address
                </ResponsiveText>
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  This will be used as your primary delivery address
                </ResponsiveText>
              </ResponsiveView>
            </TouchableOpacity>
          </ResponsiveView>
        </ResponsiveView>

        {/* Action Buttons */}
        <ResponsiveView style={styles.actions}>
          <Button
            title="Cancel"
            onPress={handleCancel}
            variant="outline"
            size="large"
            style={styles.cancelButton}
          />
          <Button
            title={isEditing ? 'Update Address' : 'Add Address'}
            onPress={handleSave}
            variant="primary"
            size="large"
            loading={isLoading}
            disabled={isLoading}
            style={styles.saveButton}
          />
        </ResponsiveView>
      </ResponsiveView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Layout.spacing.lg,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    ...Layout.shadows.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: Layout.spacing.sm,
    padding: Layout.spacing.sm,
  },
  form: {
    flex: 1,
  },
  section: {
    marginBottom: Layout.spacing.lg,
  },
  inputGroup: {
    marginBottom: Layout.spacing.md,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: Layout.borderRadius.sm,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.sm,
    fontSize: Layout.fontSize.md,
    fontFamily: Layout.fontFamily.regular,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },
  halfWidth: {
    flex: 1,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Layout.spacing.sm,
    borderWidth: 1,
    borderRadius: Layout.borderRadius.sm,
    paddingHorizontal: Layout.spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxText: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
    marginTop: Layout.spacing.lg,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
});
