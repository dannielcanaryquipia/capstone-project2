import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import Responsive from '../../constants/Responsive';
import { useTheme } from '../../contexts/ThemeContext';
import { ResponsiveText } from './ResponsiveText';
import { ResponsiveView } from './ResponsiveView';

export interface ProductCardProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  tags?: string[];
  onPress?: () => void;
  variant?: 'horizontal' | 'vertical';
  showBadges?: boolean;
  backgroundColor?: string;
  textColor?: string;
  priceColor?: string;
  width?: number;
  height?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  description,
  price,
  image,
  tags = [],
  onPress,
  variant = 'vertical',
  showBadges = false,
  backgroundColor,
  textColor,
  priceColor,
  width,
  height,
}) => {
  const { colors } = useTheme();
  const isHorizontal = variant === 'horizontal';
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  
  const cardStyle = [
    styles.card,
    isHorizontal ? styles.horizontalCard : styles.verticalCard,
    { backgroundColor: backgroundColor || colors.surface },
    ...(width ? [{ width }] : [{ flex: 1 }]),
    ...(height ? [{ height }] : []),
  ];

  const imageStyle = [
    styles.image,
    isHorizontal ? styles.horizontalImage : styles.verticalImage,
    { height: isHorizontal ? Responsive.responsiveValue(80, 90, 100, 120) : Responsive.responsiveValue(120, 130, 140, 160) }
  ];

  return (
    <TouchableOpacity 
      style={cardStyle}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <ResponsiveView style={styles.imageContainer}>
        <Image 
          source={{ uri: image }} 
          style={imageStyle}
          onLoadStart={() => {
            console.log('Image loading started for:', image);
            setImageLoading(true);
            setImageError(false);
          }}
          onLoad={() => {
            console.log('Image loaded successfully:', image);
            setImageLoading(false);
          }}
          onError={(error) => {
            console.log('Image load error for:', image, error);
            setImageLoading(false);
            setImageError(true);
          }}
          resizeMode="cover"
        />
        
        {/* Loading indicator */}
        {imageLoading && (
          <View style={[styles.loadingContainer, { backgroundColor: colors.surface }]}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
        
        {/* Error state */}
        {imageError && (
          <View style={[styles.errorContainer, { backgroundColor: colors.surface }]}>
            <MaterialIcons name="broken-image" size={24} color={colors.textSecondary} />
          </View>
        )}
      </ResponsiveView>
      
      <ResponsiveView 
        padding={isHorizontal ? "sm" : "md"}
        style={styles.content}
      >
        <ResponsiveView>
          <ResponsiveView marginBottom="xs">
            <ResponsiveText 
              size={isHorizontal ? "sm" : "md"}
              weight="semiBold" 
              color={textColor || colors.text}
              numberOfLines={isHorizontal ? 1 : 2}
            >
              {name}
            </ResponsiveText>
          </ResponsiveView>
          
          {description && (
            <ResponsiveView marginBottom="xs">
              <ResponsiveText 
                size={isHorizontal ? "xs" : "sm"}
                weight="regular" 
                color={colors.textSecondary}
                numberOfLines={isHorizontal ? 1 : 2}
                lineHeight="tight"
              >
                {description}
              </ResponsiveText>
            </ResponsiveView>
          )}
        </ResponsiveView>
        
        <ResponsiveView 
          flexDirection="row" 
          alignItems="center" 
          justifyContent="flex-start"
          style={{ marginTop: 'auto' }}
        >
          <ResponsiveText 
            size={isHorizontal ? "sm" : "lg"}
            weight="bold" 
            color={priceColor || colors.themedPrice}
          >
            ₱{(price || 0).toFixed(2)}
          </ResponsiveText>
        </ResponsiveView>
      </ResponsiveView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Responsive.responsiveValue(16, 18, 20, 24),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: Responsive.responsiveValue(2, 3, 4, 6) },
    shadowOpacity: 0.15,
    shadowRadius: Responsive.responsiveValue(6, 8, 10, 12),
    elevation: Responsive.responsiveValue(4, 5, 6, 8),
  },
  verticalCard: {
    marginBottom: Responsive.responsiveValue(12, 14, 16, 20),
  },
  horizontalCard: {
    marginRight: Responsive.ResponsiveSpacing.md,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
  },
  image: {
    width: '100%',
    resizeMode: 'cover',
  },
  verticalImage: {
    // Additional vertical image styles if needed
  },
  horizontalImage: {
    // Additional horizontal image styles if needed
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProductCard;
