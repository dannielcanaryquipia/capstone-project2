import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import Responsive from '../../constants/Responsive';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui/Button';
import { ResponsiveText } from '../ui/ResponsiveText';
import { ResponsiveView } from '../ui/ResponsiveView';

interface PaymentProofUploadProps {
  onProofUploaded: (proofUrl: string) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const PaymentProofUpload: React.FC<PaymentProofUploadProps> = ({
  onProofUploaded,
  onCancel,
  isLoading = false
}) => {
  const { colors } = useTheme();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your photo library to upload payment proof.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      console.error('Image picker error:', error);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your camera to take a photo of your payment proof.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      console.error('Camera error:', error);
    }
  };

  const uploadProof = async () => {
    if (!selectedImage) return;

    setIsUploading(true);
    try {
      // In a real app, you would upload to Supabase Storage here
      // For now, we'll simulate the upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful upload
      const proofUrl = `payment-proof-${Date.now()}.jpg`;
      onProofUploaded(proofUrl);
      
      Alert.alert(
        'Success',
        'Payment proof uploaded successfully. We will verify your payment shortly.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to upload payment proof. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  if (isLoading) {
    return (
      <ResponsiveView 
        alignItems="center" 
        justifyContent="center" 
        padding="xl"
        backgroundColor={colors.surface}
        borderRadius="lg"
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <ResponsiveText 
          size="md" 
          color={colors.textSecondary} 
          marginTop="md"
        >
          Processing payment...
        </ResponsiveText>
      </ResponsiveView>
    );
  }

  return (
    <ResponsiveView 
      backgroundColor={colors.surface}
      borderRadius="lg"
      padding="xl"
    >
      {/* Header */}
      <ResponsiveView marginBottom="lg" alignItems="center">
        <ResponsiveText 
          size="xl" 
          weight="bold" 
          color={colors.text}
          marginBottom="sm"
        >
          Upload Payment Proof
        </ResponsiveText>
        <ResponsiveText 
          size="sm" 
          color={colors.textSecondary}
          align="center"
          lineHeight="relaxed"
        >
          Please upload a screenshot or photo of your GCash payment confirmation
        </ResponsiveText>
      </ResponsiveView>

      {/* Image Preview or Upload Area */}
      {selectedImage ? (
        <ResponsiveView marginBottom="lg">
          <ResponsiveView 
            backgroundColor={colors.background}
            borderRadius="md"
            padding="md"
            alignItems="center"
          >
            <Image
              source={{ uri: selectedImage }}
              style={styles.imagePreview}
              contentFit="contain"
            />
            <TouchableOpacity
              style={[styles.removeButton, { backgroundColor: colors.error }]}
              onPress={removeImage}
            >
              <MaterialIcons name="close" size={20} color="white" />
            </TouchableOpacity>
          </ResponsiveView>
        </ResponsiveView>
      ) : (
        <ResponsiveView 
          marginBottom="lg"
          backgroundColor={colors.background}
          borderRadius="md"
          padding="xl"
          alignItems="center"
          borderWidth={2}
          borderColor={colors.border}
          borderStyle="dashed"
        >
          <MaterialIcons 
            name="cloud-upload" 
            size={48} 
            color={colors.textSecondary} 
          />
          <ResponsiveText 
            size="md" 
            color={colors.textSecondary}
            marginTop="md"
            align="center"
          >
            No image selected
          </ResponsiveText>
        </ResponsiveView>
      )}

      {/* Upload Options */}
      <ResponsiveView flexDirection="row" marginBottom="lg">
        <Button
          title="Take Photo"
          onPress={takePhoto}
          variant="outline"
          size="medium"
          flex={1}
          marginRight="sm"
          icon="camera-alt"
        />
        <Button
          title="Choose from Gallery"
          onPress={pickImage}
          variant="outline"
          size="medium"
          flex={1}
          marginLeft="sm"
          icon="photo-library"
        />
      </ResponsiveView>

      {/* Instructions */}
      <ResponsiveView 
        backgroundColor={colors.info + '10'}
        padding="md"
        borderRadius="md"
        marginBottom="lg"
      >
        <ResponsiveText 
          size="sm" 
          color={colors.info}
          align="center"
          lineHeight="relaxed"
        >
          📱 Make sure the screenshot shows:{'\n'}
          • Transaction amount{'\n'}
          • Reference number{'\n'}
          • Date and time{'\n'}
          • GCash logo/branding
        </ResponsiveText>
      </ResponsiveView>

      {/* Actions */}
      <ResponsiveView flexDirection="row" width="100%">
        <Button
          title="Cancel"
          onPress={onCancel}
          variant="text"
          size="medium"
          flex={1}
          marginRight="sm"
        />
        <Button
          title={isUploading ? "Uploading..." : "Upload Proof"}
          onPress={uploadProof}
          variant="primary"
          size="medium"
          flex={1}
          marginLeft="sm"
          disabled={!selectedImage || isUploading}
          loading={isUploading}
        />
      </ResponsiveView>
    </ResponsiveView>
  );
};

const styles = StyleSheet.create({
  imagePreview: {
    width: Responsive.responsiveValue(200, 220, 240, 260),
    height: Responsive.responsiveValue(150, 165, 180, 195),
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
