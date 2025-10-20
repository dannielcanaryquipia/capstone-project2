import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Layout from '../../constants/Layout';
import { ResponsiveBorderRadius, ResponsiveSpacing } from '../../constants/Responsive';
import { useTheme } from '../../contexts/ThemeContext';
import { ImageMetadata } from '../../services/image-upload.service';
import Button from '../ui/Button';
import { ResponsiveText } from '../ui/ResponsiveText';
import { ResponsiveView } from '../ui/ResponsiveView';

interface ImageViewerProps {
  visible: boolean;
  onClose: () => void;
  image: ImageMetadata | null;
  onVerify?: (imageId: string, verified: boolean) => void;
  onDelete?: (imageId: string) => void;
  isActionLoading?: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function ImageViewer({
  visible,
  onClose,
  image,
  onVerify,
  onDelete,
  isActionLoading = false
}: ImageViewerProps) {
  const { colors } = useTheme();
  const [imageError, setImageError] = useState(false);

  if (!image) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getImageTypeIcon = (type: string) => {
    switch (type) {
      case 'payment_proof':
        return 'payment';
      case 'delivery_proof':
        return 'local-shipping';
      default:
        return 'image';
    }
  };

  const getImageTypeColor = (type: string) => {
    switch (type) {
      case 'payment_proof':
        return colors.primary;
      case 'delivery_proof':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  const handleVerify = () => {
    if (onVerify) {
      onVerify(image.id, !image.verified);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            if (onDelete) {
              onDelete(image.id);
            }
          }
        }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <ResponsiveView style={[styles.header, { backgroundColor: colors.surface }]}>
          <ResponsiveView style={styles.headerLeft}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <ResponsiveView marginLeft="md">
              <ResponsiveText size="lg" weight="bold" color={colors.text}>
                Image Details
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>
          
          <ResponsiveView style={styles.headerRight}>
            {image.verified ? (
              <MaterialIcons name="check-circle" size={24} color={colors.success} />
            ) : (
              <MaterialIcons name="pending" size={24} color={colors.warning} />
            )}
          </ResponsiveView>
        </ResponsiveView>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Image Info */}
          <ResponsiveView style={[styles.infoCard, { backgroundColor: colors.surface }]}>
            <ResponsiveView style={styles.infoHeader}>
              <MaterialIcons 
                name={getImageTypeIcon(image.type)} 
                size={20} 
                color={getImageTypeColor(image.type)} 
              />
              <ResponsiveView marginLeft="sm">
                <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                  {image.type.replace('_', ' ').toUpperCase()}
                </ResponsiveText>
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  Order: {image.orderId.slice(-8).toUpperCase()}
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>

            <ResponsiveView style={styles.infoDetails}>
              <ResponsiveView style={styles.infoRow}>
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  File Size:
                </ResponsiveText>
                <ResponsiveText size="sm" color={colors.text}>
                  {formatFileSize(image.metadata?.size || 0)}
                </ResponsiveText>
              </ResponsiveView>
              
              <ResponsiveView style={styles.infoRow}>
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  Dimensions:
                </ResponsiveText>
                <ResponsiveText size="sm" color={colors.text}>
                  {image.metadata?.width}x{image.metadata?.height}
                </ResponsiveText>
              </ResponsiveView>
              
              <ResponsiveView style={styles.infoRow}>
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  Format:
                </ResponsiveText>
                <ResponsiveText size="sm" color={colors.text}>
                  {image.metadata?.format?.toUpperCase() || 'JPEG'}
                </ResponsiveText>
              </ResponsiveView>
              
              <ResponsiveView style={styles.infoRow}>
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  Uploaded:
                </ResponsiveText>
                <ResponsiveText size="sm" color={colors.text}>
                  {new Date(image.uploadedAt).toLocaleString()}
                </ResponsiveText>
              </ResponsiveView>

              {image.verified && image.verifiedAt && (
                <ResponsiveView style={styles.infoRow}>
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    Verified:
                  </ResponsiveText>
                  <ResponsiveText size="sm" color={colors.success}>
                    {new Date(image.verifiedAt).toLocaleString()}
                  </ResponsiveText>
                </ResponsiveView>
              )}
            </ResponsiveView>
          </ResponsiveView>

          {/* Image Display */}
          <ResponsiveView style={[styles.imageCard, { backgroundColor: colors.surface }]}>
            <ResponsiveView style={styles.imageContainer}>
              {imageError ? (
                <ResponsiveView style={[styles.errorContainer, { backgroundColor: colors.surfaceVariant }]}>
                  <MaterialIcons name="error" size={48} color={colors.error} />
                  <ResponsiveText size="md" color={colors.error} align="center">
                    Failed to load image
                  </ResponsiveText>
                  <Button
                    title="Retry"
                    onPress={() => setImageError(false)}
                    variant="outline"
                    size="small"
                    style={styles.retryButton}
                  />
                </ResponsiveView>
              ) : (
                <Image
                  source={{ uri: image.url }}
                  style={styles.image}
                  resizeMode="contain"
                  onError={() => setImageError(true)}
                />
              )}
            </ResponsiveView>
          </ResponsiveView>

          {/* Actions */}
          <ResponsiveView style={[styles.actionsCard, { backgroundColor: colors.surface }]}>
            <ResponsiveView style={styles.actionsHeader}>
              <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                Actions
              </ResponsiveText>
            </ResponsiveView>

            <ResponsiveView style={styles.actionButtons}>
              <Button
                title={image.verified ? 'Unverify' : 'Verify'}
                onPress={handleVerify}
                loading={isActionLoading}
                variant={image.verified ? 'outline' : 'primary'}
                size="medium"
                icon={
                  <MaterialIcons 
                    name={image.verified ? 'close' : 'check'} 
                    size={16} 
                    color={image.verified ? colors.primary : 'white'} 
                  />
                }
                style={styles.actionButton}
              />
              
              <Button
                title="Delete"
                onPress={handleDelete}
                loading={isActionLoading}
                variant="outline"
                size="medium"
                icon={<MaterialIcons name="delete" size={16} color={colors.error} />}
                style={styles.actionButton}
              />
            </ResponsiveView>
          </ResponsiveView>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: ResponsiveSpacing.md,
    ...Layout.shadows.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  closeButton: {
    padding: ResponsiveSpacing.xs,
  },
  headerRight: {
    marginLeft: ResponsiveSpacing.md,
  },
  content: {
    flex: 1,
    padding: ResponsiveSpacing.md,
  },
  infoCard: {
    padding: ResponsiveSpacing.md,
    borderRadius: ResponsiveBorderRadius.lg,
    marginBottom: ResponsiveSpacing.md,
    ...Layout.shadows.sm,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.md,
  },
  infoDetails: {
    gap: ResponsiveSpacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageCard: {
    borderRadius: ResponsiveBorderRadius.lg,
    marginBottom: ResponsiveSpacing.md,
    overflow: 'hidden',
    ...Layout.shadows.sm,
  },
  imageContainer: {
    height: screenHeight * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: ResponsiveSpacing.lg,
  },
  retryButton: {
    marginTop: ResponsiveSpacing.md,
  },
  actionsCard: {
    padding: ResponsiveSpacing.md,
    borderRadius: ResponsiveBorderRadius.lg,
    ...Layout.shadows.sm,
  },
  actionsHeader: {
    marginBottom: ResponsiveSpacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: ResponsiveSpacing.xs,
  },
});
