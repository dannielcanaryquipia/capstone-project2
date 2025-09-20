import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import Responsive from '../../constants/Responsive';
import { useTheme } from '../../contexts/ThemeContext';
import { ResponsiveText } from './ResponsiveText';
import { ResponsiveView } from './ResponsiveView';

export interface ProductCardProps {
  id: string;
  name: string;
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
  price,
  image,
  tags = [],
  onPress,
  variant = 'vertical',
  showBadges = true,
  backgroundColor,
  textColor,
  priceColor,
  width,
  height,
}) => {
  const { colors } = useTheme();
  const isHorizontal = variant === 'horizontal';
  
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
        />
        {showBadges && tags.length > 0 && (
          <>
            {tags.includes('Popular') && (
              <ResponsiveView style={styles.popularBadge}>
                <ResponsiveText size="xs" weight="bold" color="#FFFFFF">
                  Popular
                </ResponsiveText>
              </ResponsiveView>
            )}
            {tags.includes('Recommended') && (
              <ResponsiveView style={styles.recommendedBadge}>
                <ResponsiveText size="xs" weight="bold" color="#FFFFFF">
                  Recommended
                </ResponsiveText>
              </ResponsiveView>
            )}
          </>
        )}
      </ResponsiveView>
      
      <ResponsiveView 
        padding={isHorizontal ? "sm" : "md"}
        style={styles.content}
      >
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
        
        <ResponsiveView 
          flexDirection="row" 
          alignItems="center" 
          justifyContent="flex-end"
          marginTop="xs"
        >
          <ResponsiveText 
            size={isHorizontal ? "sm" : "lg"}
            weight="bold" 
            color={priceColor || colors.themedPrice}
          >
            ${price.toFixed(2)}
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
  },
  popularBadge: {
    position: 'absolute',
    top: Responsive.responsiveValue(8, 10, 12, 14),
    left: Responsive.responsiveValue(8, 10, 12, 14),
    backgroundColor: '#FF6B35',
    paddingHorizontal: Responsive.responsiveValue(6, 8, 10, 12),
    paddingVertical: Responsive.responsiveValue(4, 5, 6, 8),
    borderRadius: Responsive.responsiveValue(12, 14, 16, 20),
  },
  recommendedBadge: {
    position: 'absolute',
    top: Responsive.responsiveValue(8, 10, 12, 14),
    left: Responsive.responsiveValue(8, 10, 12, 14),
    backgroundColor: '#4CAF50',
    paddingHorizontal: Responsive.responsiveValue(6, 8, 10, 12),
    paddingVertical: Responsive.responsiveValue(4, 5, 6, 8),
    borderRadius: Responsive.responsiveValue(12, 14, 16, 20),
  },
});

export default ProductCard;
