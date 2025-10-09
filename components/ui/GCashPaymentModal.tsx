import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
// Use dynamic require for these modules to avoid TypeScript issues
import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { PanGestureHandler, PinchGestureHandler, State } from 'react-native-gesture-handler';
import { useTheme } from '../../contexts/ThemeContext';
import Button from './Button';
import { ResponsiveText } from './ResponsiveText';

interface GCashPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (proofUri: string) => void;
  totalAmount: number;
  qrImageSource: any;
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
  
  // Zoom functionality
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);

  const handleDownloadQR = () => {
    setShowZoomModal(true);
  };

  const handleZoomModalClose = () => {
    setShowZoomModal(false);
    // Reset zoom values
    scale.setValue(1);
    translateX.setValue(0);
    translateY.setValue(0);
    lastScale.current = 1;
    lastTranslateX.current = 0;
    lastTranslateY.current = 0;
  };

  const handlePinch = Animated.event(
    [{ nativeEvent: { scale: scale } }],
    { useNativeDriver: true }
  );

  const handlePan = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onPinchStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastScale.current *= event.nativeEvent.scale;
      scale.setValue(1);
    }
  };

  const onPanStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastTranslateX.current += event.nativeEvent.translationX;
      lastTranslateY.current += event.nativeEvent.translationY;
      translateX.setValue(0);
      translateY.setValue(0);
    }
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
              Pinch to zoom • Drag to move • Take a screenshot
            </ResponsiveText>
          </View>

          {/* Zoomable QR Code */}
          <View style={styles.zoomImageContainer}>
            <PanGestureHandler
              onGestureEvent={handlePan}
              onHandlerStateChange={onPanStateChange}
              minPointers={1}
              maxPointers={1}
            >
              <Animated.View>
                <PinchGestureHandler
                  onGestureEvent={handlePinch}
                  onHandlerStateChange={onPinchStateChange}
                >
                  <Animated.View
                    style={[
                      styles.zoomImageWrapper,
                      {
                        transform: [
                          { scale: Animated.multiply(scale, lastScale.current) },
                          { translateX: Animated.add(translateX, lastTranslateX.current) },
                          { translateY: Animated.add(translateY, lastTranslateY.current) },
                        ],
                      },
                    ]}
                  >
                    <Image
                      source={qrImageSource}
                      style={styles.zoomImage}
                      resizeMode="contain"
                    />
                  </Animated.View>
                </PinchGestureHandler>
              </Animated.View>
            </PanGestureHandler>
          </View>

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
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
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
    width: 200,
    height: 200,
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
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    gap: 12,
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
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  zoomInstructions: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 80,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  zoomInstructionText: {
    textAlign: 'center',
  },
  zoomImageContainer: {
    width: '100%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomImageWrapper: {
    width: 300,
    height: 300,
  },
  zoomImage: {
    width: '100%',
    height: '100%',
  },
  screenshotInstructions: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  screenshotText: {
    textAlign: 'center',
    lineHeight: 16,
  },
});
