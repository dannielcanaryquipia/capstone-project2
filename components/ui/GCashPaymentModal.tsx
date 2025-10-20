import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { responsiveValue } from '../../constants/Responsive';
import { useTheme } from '../../contexts/ThemeContext';
import Button from './Button';
import { ResponsiveText } from './ResponsiveText';

interface GCashPaymentModalProps {
  onClose: () => void;
  onConfirm: (proofUri: string) => void;
  totalAmount: number;
  qrImageSource: any;
  visible: boolean;
}

export function GCashPaymentModal({
  visible,
  onClose,
  onConfirm,
  totalAmount,
  qrImageSource
}: GCashPaymentModalProps) {
  const { colors } = useTheme();
  const [proofUri, setProofUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);

  const handleDownloadQR = () => {
    setShowZoomModal(true);
  };

  const handleZoomModalClose = () => {
    setShowZoomModal(false);
  };

  const handleUploadReceipt = async () => {
    try {
      setIsUploading(true);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProofUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      setIsUploading(true);
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProofUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleChangeReceipt = () => {
    Alert.alert(
      'Change Receipt',
      'How would you like to change the receipt?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: handleTakePhoto },
        { text: 'Choose from Gallery', onPress: handleUploadReceipt },
      ]
    );
  };

  const handleConfirm = () => {
    if (proofUri) {
      onConfirm(proofUri);
      onClose();
    }
  };

  const handleClose = () => {
    setProofUri(null);
    onClose();
  };

  return (
    <>
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
        <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <ResponsiveText size="xl" weight="bold" color={colors.text}>
              Pay via GCash
            </ResponsiveText>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Amount Display */}
            <View style={styles.amountContainer}>
              <ResponsiveText size="lg" color={colors.textSecondary}>
                Total Amount
              </ResponsiveText>
              <ResponsiveText size="xl" weight="bold" color={colors.primary}>
                ₱{totalAmount.toFixed(2)}
              </ResponsiveText>
            </View>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <ResponsiveText size="md" color={colors.text} weight="semiBold">
                Follow these steps to complete your payment:
              </ResponsiveText>
              <View style={styles.stepsList}>
                <View style={styles.stepItem}>
                  <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                    <ResponsiveText size="sm" color="white" weight="bold">1</ResponsiveText>
                  </View>
                  <ResponsiveText size="sm" color={colors.textSecondary} style={styles.stepText}>
                    Tap the QR code below to download it
                  </ResponsiveText>
                </View>
                <View style={styles.stepItem}>
                  <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                    <ResponsiveText size="sm" color="white" weight="bold">2</ResponsiveText>
                  </View>
                  <ResponsiveText size="sm" color={colors.textSecondary} style={styles.stepText}>
                    Open GCash app and scan the QR code
                  </ResponsiveText>
                </View>
                <View style={styles.stepItem}>
                  <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                    <ResponsiveText size="sm" color="white" weight="bold">3</ResponsiveText>
                  </View>
                  <ResponsiveText size="sm" color={colors.textSecondary} style={styles.stepText}>
                    Upload your payment receipt below
                  </ResponsiveText>
                </View>
              </View>
            </View>

            {/* QR Code Display */}
            <View style={[styles.qrContainer, { backgroundColor: colors.background }]}>
              <TouchableOpacity 
                onPress={handleDownloadQR}
                style={styles.qrImageContainer}
                activeOpacity={0.7}
              >
                <Image 
                  source={qrImageSource} 
                  style={styles.qrImage} 
                  resizeMode="contain"
                />
                <View style={[styles.downloadOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                  <ResponsiveText size="sm" color="white" weight="semiBold" style={styles.downloadText}>
                    Tap to Zoom
                  </ResponsiveText>
                </View>
              </TouchableOpacity>
              <ResponsiveText size="xs" color={colors.textSecondary} style={styles.downloadHint}>
                Tap to zoom and screenshot
              </ResponsiveText>
            </View>

            {/* Receipt Upload Section */}
            <View style={styles.uploadSection}>
              <ResponsiveText size="md" color={colors.text} weight="semiBold" style={styles.uploadTitle}>
                Upload Payment Receipt
              </ResponsiveText>
              
              {proofUri ? (
                <View style={styles.uploadSuccess}>
                  <View style={[styles.successIcon, { backgroundColor: colors.success }]}>
                    <MaterialIcons name="check" size={20} color="white" />
                  </View>
                  <ResponsiveText size="sm" color={colors.success} weight="semiBold">
                    Receipt uploaded successfully
                  </ResponsiveText>
                  <Button 
                    title="Change Receipt" 
                    onPress={handleChangeReceipt} 
                    variant="outline" 
                    size="small"
                    style={styles.changeButton}
                  />
                </View>
              ) : (
                <View style={styles.uploadOptions}>
                  <Button 
                    title="Take Photo" 
                    onPress={handleTakePhoto} 
                    variant="outline" 
                    size="medium"
                    loading={isUploading}
                    style={styles.uploadButton}
                    icon={<MaterialIcons name="camera-alt" size={20} color="#666" />}
                  />
                  <Button 
                    title="Choose from Gallery" 
                    onPress={handleUploadReceipt} 
                    variant="outline" 
                    size="medium"
                    loading={isUploading}
                    style={styles.uploadButton}
                    icon={<MaterialIcons name="photo-library" size={20} color="#666" />}
                  />
                </View>
              )}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={[styles.actions, { borderTopColor: colors.border }]}>
            <Button 
              title="Cancel" 
              onPress={handleClose} 
              variant="outline" 
              size="large"
              style={styles.cancelButton}
            />
            <Button 
              title={proofUri ? "Confirm Payment" : "Upload Receipt First"} 
              onPress={handleConfirm} 
              variant="primary" 
              size="large"
              disabled={!proofUri}
              style={styles.confirmButton}
            />
          </View>
        </View>
      </View>
    </Modal>

    {/* Zoom Modal */}
    <Modal
      visible={showZoomModal}
      transparent={true}
      animationType="fade"
      onRequestClose={handleZoomModalClose}
    >
      <View style={styles.zoomOverlay}>
        <View style={styles.zoomContainer}>
          {/* Close Button */}
          <TouchableOpacity
            style={styles.zoomCloseButton}
            onPress={handleZoomModalClose}
          >
            <MaterialIcons name="close" size={24} color="white" />
          </TouchableOpacity>

          {/* Instructions */}
          <View style={styles.zoomInstructions}>
            <ResponsiveText size="sm" color="white" weight="semiBold" style={styles.zoomInstructionText}>
            Take a screenshot
            </ResponsiveText>
          </View>

          {/* QR Code at Medium Size */}
          <ScrollView 
            style={styles.zoomImageContainer}
            contentContainerStyle={styles.zoomScrollContent}
            showsVerticalScrollIndicator={true}
            showsHorizontalScrollIndicator={true}
            maximumZoomScale={3.0}
            minimumZoomScale={0.5}
            bouncesZoom={true}
          >
            <Image
              source={qrImageSource}
              style={styles.zoomImage}
              resizeMode="contain"
            />
          </ScrollView>

          {/* Screenshot Instructions */}
          <View style={styles.screenshotInstructions}>
            <ResponsiveText size="xs" color="rgba(255,255,255,0.8)" style={styles.screenshotText}>
              Android: Volume Down + Power{'\n'}iOS: Volume Up + Power
            </ResponsiveText>
          </View>
        </View>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveValue(16, 20, 24, 28),
    paddingVertical: responsiveValue(20, 40, 60, 80),
  },
  modalContainer: {
    width: '100%',
    maxWidth: responsiveValue(350, 420, 480, 540),
    maxHeight: '90%',
    borderRadius: responsiveValue(12, 16, 20, 24),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: responsiveValue(2, 4, 6, 8),
    },
    shadowOpacity: 0.25,
    shadowRadius: responsiveValue(4, 8, 12, 16),
    elevation: responsiveValue(4, 8, 12, 16),
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: responsiveValue(16, 24, 32, 40),
    paddingVertical: responsiveValue(16, 20, 24, 28),
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: responsiveValue(4, 6, 8, 10),
  },
  scrollContent: {
    paddingHorizontal: responsiveValue(16, 24, 32, 40),
    paddingVertical: responsiveValue(16, 20, 24, 28),
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: responsiveValue(16, 24, 32, 40),
    paddingVertical: responsiveValue(12, 16, 20, 24),
    paddingHorizontal: responsiveValue(16, 20, 24, 28),
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: responsiveValue(8, 12, 16, 20),
  },
  instructionsContainer: {
    marginBottom: 24,
  },
  stepsList: {
    marginTop: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepText: {
    flex: 1,
    lineHeight: 20,
  },
  qrContainer: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  qrImageContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  qrImage: {
    width: responsiveValue(200, 250, 300, 350),
    height: responsiveValue(200, 250, 300, 350),
  },
  downloadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadText: {
    marginTop: 4,
  },
  downloadHint: {
    textAlign: 'center',
  },
  uploadSection: {
    marginBottom: 20,
  },
  uploadTitle: {
    marginBottom: 16,
  },
  uploadSuccess: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
  },
  successIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  changeButton: {
    marginTop: 8,
  },
  uploadOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadButton: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: responsiveValue(16, 24, 32, 40),
    paddingVertical: responsiveValue(16, 20, 24, 28),
    borderTopWidth: 1,
    gap: responsiveValue(8, 12, 16, 20),
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
  // Zoom Modal Styles
  zoomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  zoomCloseButton: {
    position: 'absolute',
    top: responsiveValue(40, 50, 60, 70),
    right: responsiveValue(16, 20, 24, 28),
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: responsiveValue(16, 20, 24, 28),
    padding: responsiveValue(6, 8, 10, 12),
  },
  zoomInstructions: {
    position: 'absolute',
    top: responsiveValue(40, 50, 60, 70),
    left: responsiveValue(16, 20, 24, 28),
    right: responsiveValue(60, 80, 100, 120),
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: responsiveValue(6, 8, 10, 12),
    paddingHorizontal: responsiveValue(8, 12, 16, 20),
    paddingVertical: responsiveValue(6, 8, 10, 12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomInstructionText: {
    textAlign: 'center',
    alignSelf: 'center',
  },
  zoomImageContainer: {
    flex: 1,
    width: '100%',
  },
  zoomScrollContent: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
    paddingVertical: 20,
  },
  zoomImage: {
    width: responsiveValue(600, 700, 800, 900),
    height: responsiveValue(600,700, 800, 900),
    maxWidth: '90%',
    maxHeight: '70%',
  },
  screenshotInstructions: {
    position: 'absolute',
    bottom: responsiveValue(40, 50, 60, 70),
    left: responsiveValue(16, 20, 24, 28),
    right: responsiveValue(16, 20, 24, 28),
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: responsiveValue(6, 8, 10, 12),
    paddingHorizontal: responsiveValue(8, 12, 16, 20),
    paddingVertical: responsiveValue(6, 8, 10, 12),
  },
  screenshotText: {
    textAlign: 'center',
    lineHeight: 16,
  },
});
