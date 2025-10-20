import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ImageViewer } from '../../../components/admin/ImageViewer';
import Button from '../../../components/ui/Button';
import { LoadingState } from '../../../components/ui/LoadingState';
import { OptimizedImage } from '../../../components/ui/OptimizedImage';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import { ResponsiveBorderRadius, ResponsiveSpacing, responsiveValue } from '../../../constants/Responsive';
import { Strings } from '../../../constants/Strings';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import { ImageMetadata, ImageUploadService } from '../../../services/image-upload.service';
import global from '../../../styles/global';

interface ImageStats {
  totalImages: number;
  pendingVerification: number;
  verifiedImages: number;
  totalSize: number;
  recentUploads: ImageMetadata[];
}

export default function ImagesScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [stats, setStats] = useState<ImageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all');
  const [selectedImage, setSelectedImage] = useState<ImageMetadata | null>(null);
  const [showImageViewer, setShowImageViewer] = useState(false);

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [imagesData, statsData] = await Promise.all([
        ImageUploadService.getOrderImages(''), // Get all images
        ImageUploadService.getImageStats()
      ]);
      
      setImages(imagesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleVerifyImage = async (imageId: string, verified: boolean) => {
    if (!user?.id) return;

    try {
      setActionLoading(imageId);
      await ImageUploadService.verifyImage(imageId, user.id, verified);
      Alert.alert('Success', `Image ${verified ? 'verified' : 'unverified'} successfully!`);
      await loadData();
    } catch (error: any) {
      console.error('Error verifying image:', error);
      Alert.alert('Error', error.message || 'Failed to verify image');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(imageId);
              await ImageUploadService.deleteImage(imageId);
              Alert.alert('Success', 'Image deleted successfully!');
              await loadData();
            } catch (error: any) {
              console.error('Error deleting image:', error);
              Alert.alert('Error', error.message || 'Failed to delete image');
            } finally {
              setActionLoading(null);
            }
          }
        }
      ]
    );
  };

  const handleImagePress = (image: ImageMetadata) => {
    setSelectedImage(image);
    setShowImageViewer(true);
  };

  const handleCloseImageViewer = () => {
    setShowImageViewer(false);
    setSelectedImage(null);
  };

  const getFilteredImages = () => {
    if (filter === 'pending') {
      return images.filter(img => !img.verified);
    } else if (filter === 'verified') {
      return images.filter(img => img.verified);
    }
    return images;
  };

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

  const renderImageItem = ({ item }: { item: ImageMetadata }) => {
    const isActionLoading = actionLoading === item.id;
    
    return (
      <ResponsiveView style={[styles.imageCard, { backgroundColor: colors.surface }]}>
        <ResponsiveView style={styles.imageHeader}>
          <ResponsiveView style={styles.imageInfo}>
            <MaterialIcons 
              name={getImageTypeIcon(item.type)} 
              size={20} 
              color={getImageTypeColor(item.type)} 
            />
            <ResponsiveView marginLeft="sm">
              <ResponsiveText size="sm" weight="semiBold" color={colors.text}>
                {item.type.replace('_', ' ').toUpperCase()}
              </ResponsiveText>
              <ResponsiveText size="xs" color={colors.textSecondary}>
                Order: {item.orderId.slice(-8).toUpperCase()}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>
          
          <ResponsiveView style={styles.imageStatus}>
            {item.verified ? (
              <MaterialIcons name="check-circle" size={20} color={colors.success} />
            ) : (
              <MaterialIcons name="pending" size={20} color={colors.warning} />
            )}
          </ResponsiveView>
        </ResponsiveView>

        <ResponsiveView style={styles.imageContainer}>
          <OptimizedImage
            source={{ uri: item.url }}
            thumbnailUri={item.thumbnailUrl}
            style={styles.image}
            onPress={() => handleImagePress(item)}
            aspectRatio={1}
          />
        </ResponsiveView>

        <ResponsiveView style={styles.imageDetails}>
          <ResponsiveText size="xs" color={colors.textSecondary}>
            {formatFileSize(item.metadata?.size || 0)} • {item.metadata?.width}x{item.metadata?.height}
          </ResponsiveText>
          <ResponsiveText size="xs" color={colors.textSecondary}>
            {new Date(item.uploadedAt).toLocaleDateString()}
          </ResponsiveText>
        </ResponsiveView>

        <ResponsiveView style={styles.imageActions}>
          {!item.verified ? (
            <Button
              title="Verify"
              onPress={() => handleVerifyImage(item.id, true)}
              loading={isActionLoading}
              variant="primary"
              size="small"
              icon={<MaterialIcons name="check" size={16} color="white" />}
            />
          ) : (
            <Button
              title="Unverify"
              onPress={() => handleVerifyImage(item.id, false)}
              loading={isActionLoading}
              variant="outline"
              size="small"
              icon={<MaterialIcons name="close" size={16} color={colors.primary} />}
            />
          )}
          
          <Button
            title="Delete"
            onPress={() => handleDeleteImage(item.id)}
            loading={isActionLoading}
            variant="outline"
            size="small"
            icon={<MaterialIcons name="delete" size={16} color={colors.error} />}
          />
        </ResponsiveView>
      </ResponsiveView>
    );
  };

  const renderStatsCard = () => {
    if (!stats) return null;

    return (
      <ResponsiveView style={[styles.statsCard, { backgroundColor: colors.surface }]}>
        <ResponsiveView style={styles.statsHeader}>
          <ResponsiveText size="lg" weight="bold" color={colors.text}>
            Image Statistics
          </ResponsiveText>
        </ResponsiveView>
        
        <ResponsiveView style={styles.statsGrid}>
          <ResponsiveView style={styles.statItem}>
            <ResponsiveText size="xl" weight="bold" color={colors.primary}>
              {stats.totalImages}
            </ResponsiveText>
            <ResponsiveText size="sm" color={colors.textSecondary}>
              Total Images
            </ResponsiveText>
          </ResponsiveView>
          
          <ResponsiveView style={styles.statItem}>
            <ResponsiveText size="xl" weight="bold" color={colors.warning}>
              {stats.pendingVerification}
            </ResponsiveText>
            <ResponsiveText size="sm" color={colors.textSecondary}>
              Pending
            </ResponsiveText>
          </ResponsiveView>
          
          <ResponsiveView style={styles.statItem}>
            <ResponsiveText size="xl" weight="bold" color={colors.success}>
              {stats.verifiedImages}
            </ResponsiveText>
            <ResponsiveText size="sm" color={colors.textSecondary}>
              Verified
            </ResponsiveText>
          </ResponsiveView>
          
          <ResponsiveView style={styles.statItem}>
            <ResponsiveText size="xl" weight="bold" color={colors.info}>
              {formatFileSize(stats.totalSize)}
            </ResponsiveText>
            <ResponsiveText size="sm" color={colors.textSecondary}>
              Total Size
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
      </ResponsiveView>
    );
  };

  const renderFilterButtons = () => (
    <ResponsiveView style={styles.filterContainer}>
      <Button
        title="All"
        onPress={() => setFilter('all')}
        variant={filter === 'all' ? 'primary' : 'outline'}
        size="small"
      />
      <Button
        title="Pending"
        onPress={() => setFilter('pending')}
        variant={filter === 'pending' ? 'primary' : 'outline'}
        size="small"
      />
      <Button
        title="Verified"
        onPress={() => setFilter('verified')}
        variant={filter === 'verified' ? 'primary' : 'outline'}
        size="small"
      />
    </ResponsiveView>
  );

  if (loading) {
    return (
      <SafeAreaView style={[global.screen, styles.center, { backgroundColor: colors.background }]}>
        <ResponsiveView style={styles.center}>
          <LoadingState 
            message={Strings.loading} 
            fullScreen 
          />
        </ResponsiveView>
      </SafeAreaView>
    );
  }

  const filteredImages = getFilteredImages();

  return (
    <SafeAreaView style={[global.screen, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={{ flex: 1 }}>
        <ResponsiveView padding="lg">
          {/* Header */}
          <ResponsiveView style={[styles.header, { backgroundColor: colors.surface }]}>
            <ResponsiveView style={styles.headerLeft}>
              <Button
                title=""
                onPress={() => router.back()}
                variant="text"
                icon={<MaterialIcons name="arrow-back" size={24} color={colors.primary} />}
              />
              <ResponsiveView marginLeft="md">
                <ResponsiveText size="xl" weight="bold" color={colors.text}>
                  Image Management
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
            <Button
              title="Refresh"
              onPress={handleRefresh}
              variant="outline"
              size="small"
              icon={<MaterialIcons name="refresh" size={16} color={colors.primary} />}
            />
          </ResponsiveView>

          {/* Stats Card */}
          {renderStatsCard()}

          {/* Filter Buttons */}
          {renderFilterButtons()}
        </ResponsiveView>

        {/* Images List */}
        {filteredImages.length > 0 ? (
          <FlatList
            data={filteredImages}
            renderItem={renderImageItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.imagesList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={handleRefresh}
                tintColor={colors.primary}
              />
            }
            numColumns={2}
            columnWrapperStyle={styles.row}
          />
        ) : (
          <ResponsiveView style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <ResponsiveView style={[styles.emptyIcon, { backgroundColor: colors.surfaceVariant }]}>
              <MaterialIcons name="image" size={responsiveValue(48, 56, 64, 72)} color={colors.primary} />
            </ResponsiveView>
            <ResponsiveView marginTop="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text} align="center">
                No Images Found
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveView marginTop="sm">
              <ResponsiveText size="md" color={colors.textSecondary} align="center">
                {filter === 'all' 
                  ? 'No images have been uploaded yet.'
                  : `No ${filter} images found.`
                }
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>
        )}

        {/* Image Viewer Modal */}
        <ImageViewer
          visible={showImageViewer}
          onClose={handleCloseImageViewer}
          image={selectedImage}
          onVerify={handleVerifyImage}
          onDelete={handleDeleteImage}
          isActionLoading={actionLoading === selectedImage?.id}
        />
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.lg,
    padding: ResponsiveSpacing.md,
    borderRadius: ResponsiveBorderRadius.lg,
    ...Layout.shadows.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statsCard: {
    padding: ResponsiveSpacing.md,
    borderRadius: ResponsiveBorderRadius.lg,
    marginBottom: ResponsiveSpacing.lg,
    ...Layout.shadows.sm,
  },
  statsHeader: {
    marginBottom: ResponsiveSpacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: ResponsiveSpacing.lg,
  },
  imagesList: {
    paddingHorizontal: ResponsiveSpacing.lg,
    paddingTop: 0,
  },
  row: {
    justifyContent: 'space-between',
  },
  imageCard: {
    flex: 1,
    margin: ResponsiveSpacing.xs,
    padding: ResponsiveSpacing.sm,
    borderRadius: ResponsiveBorderRadius.md,
    ...Layout.shadows.sm,
  },
  imageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.sm,
  },
  imageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  imageStatus: {
    marginLeft: ResponsiveSpacing.sm,
  },
  imageContainer: {
    height: 120,
    borderRadius: ResponsiveBorderRadius.sm,
    overflow: 'hidden',
    marginBottom: ResponsiveSpacing.sm,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: ResponsiveSpacing.sm,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: ResponsiveSpacing.xxxl,
    paddingHorizontal: ResponsiveSpacing.lg,
    marginHorizontal: ResponsiveSpacing.lg,
    borderRadius: ResponsiveBorderRadius.lg,
    ...Layout.shadows.sm,
  },
  emptyIcon: {
    width: responsiveValue(80, 90, 100, 120),
    height: responsiveValue(80, 90, 100, 120),
    borderRadius: responsiveValue(40, 45, 50, 60),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.md,
  },
});
