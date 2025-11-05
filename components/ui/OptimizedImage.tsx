import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { ResponsiveSpacing } from '../../constants/Responsive';
import { useTheme } from '../../contexts/ThemeContext';
import { ResponsiveText } from './ResponsiveText';

interface OptimizedImageProps {
  source: { uri: string } | string | number;
  thumbnailUri?: string;
  showErrorState?: boolean;
  showLoadingState?: boolean;
  onPress?: () => void;
  fallbackIcon?: keyof typeof MaterialIcons.glyphMap;
  fallbackText?: string;
  aspectRatio?: number;
  // @ts-ignore
  style?: ViewStyle | ViewStyle[];
}

export function OptimizedImage({
  source,
  thumbnailUri,
  showErrorState = true,
  showLoadingState = true,
  onPress,
  fallbackIcon = 'image',
  fallbackText = 'Image not available',
  aspectRatio,
  style
}: OptimizedImageProps) {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setImageLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  // Normalize source to object format
  const normalizedSource = typeof source === 'string' || typeof source === 'number'
    ? { uri: String(source) }
    : source;

  const renderContent = () => {
    if (hasError && showErrorState) {
      return (
        <View style={[styles.errorContainer, { backgroundColor: colors.surfaceVariant }]}>
          <MaterialIcons name={fallbackIcon} size={32} color={colors.textSecondary} />
          <ResponsiveText size="sm" color={colors.textSecondary} align="center">
            {fallbackText}
          </ResponsiveText>
        </View>
      );
    }

    return (
      <>
        {/* Main image with expo-image for better Supabase URL handling */}
        {/* @ts-ignore - expo-image props compatibility */}
        <Image
          source={normalizedSource}
          style={StyleSheet.absoluteFillObject}
          // @ts-ignore
          contentFit="cover"
          // @ts-ignore
          transition={200}
          // @ts-ignore
          cachePolicy="memory-disk"
          onLoadStart={handleLoadStart}
          onLoad={handleLoad}
          onError={handleError}
          // @ts-ignore
          placeholder={{ blurhash: thumbnailUri || undefined }}
          // @ts-ignore
          priority="normal"
        />

        {/* Thumbnail (blurred background) for loading state */}
        {thumbnailUri && !imageLoaded && (
          <Image
            source={{ uri: thumbnailUri }}
            style={[StyleSheet.absoluteFillObject, styles.thumbnail]}
            // @ts-ignore
            contentFit="cover"
            // @ts-ignore
            blurRadius={10}
          />
        )}

        {/* Loading indicator */}
        {isLoading && showLoadingState && (
          <View style={[styles.loadingContainer, { backgroundColor: colors.surfaceVariant }]}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
      </>
    );
  };

  const containerStyle = [
    styles.container,
    aspectRatio && { aspectRatio },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle}>
      {renderContent()}
    </View>
  );
}

interface LazyImageProps extends OptimizedImageProps {
  isVisible?: boolean;
  placeholder?: React.ReactNode;
}

export function LazyImage({
  isVisible = true,
  placeholder,
  ...props
}: LazyImageProps) {
  if (!isVisible) {
    return (
      <View style={[styles.container, props.style]}>
        {placeholder || (
          <View style={[styles.placeholder, { backgroundColor: '#f0f0f0' }]} />
        )}
      </View>
    );
  }

  return <OptimizedImage {...props} />;
}

interface ImageGridProps {
  images: Array<{
    id: string;
    url: string;
    thumbnailUrl?: string;
  }>;
  onImagePress?: (image: any) => void;
  columns?: number;
  spacing?: number;
}

export function ImageGrid({
  images,
  onImagePress,
  columns = 2,
  spacing = 8
}: ImageGridProps) {
  const { colors } = useTheme();

  const renderImage = (image: any, index: number) => (
    <OptimizedImage
      key={image.id}
      source={{ uri: image.url }}
      thumbnailUri={image.thumbnailUrl}
      style={[
        styles.gridImage,
        {
          width: `${100 / columns}%`,
          marginRight: (index + 1) % columns === 0 ? 0 : spacing,
          marginBottom: spacing,
        }
      ]}
      onPress={() => onImagePress?.(image)}
      aspectRatio={1}
    />
  );

  return (
    <View style={styles.gridContainer}>
      {images.map(renderImage)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  thumbnail: {
    opacity: 0.3,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: ResponsiveSpacing.md,
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridImage: {
    borderRadius: 8,
  },
});
