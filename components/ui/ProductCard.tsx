import { MaterialIcons } from '@expo/vector-icons';
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
  isSaved?: boolean;
  onSaveToggle?: (productId: string, isSaved: boolean) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
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
  isSaved = false,
  onSaveToggle,
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
        {/* Heart Icon for Save/Unsave */}
        <TouchableOpacity
          style={styles.heartButton}
          onPress={() => onSaveToggle?.(id, !isSaved)}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name={isSaved ? "favorite" : "favorite-border"}
            size={Responsive.responsiveValue(20, 22, 24, 28)}
            color={isSaved ? "#FF6B6B" : colors.textSecondary}
          />
        </TouchableOpacity>
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
  },
  heartButton: {
    position: 'absolute',
    top: Responsive.responsiveValue(8, 10, 12, 14),
    right: Responsive.responsiveValue(8, 10, 12, 14),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: Responsive.responsiveValue(16, 18, 20, 24),
    padding: Responsive.responsiveValue(6, 8, 10, 12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default ProductCard;
