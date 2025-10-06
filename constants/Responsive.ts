import { Dimensions, PixelRatio } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Device type detection
export const isTablet = screenWidth >= 768;
export const isSmallDevice = screenWidth < 375;
export const isLargeDevice = screenWidth >= 414;
export const isXLargeDevice = screenWidth >= 768;

// Screen size categories
export const DeviceSize = {
  SMALL: 'small',      // < 375px (iPhone SE, small Android)
  MEDIUM: 'medium',    // 375px - 414px (iPhone 12, 13, 14)
  LARGE: 'large',      // 414px - 768px (iPhone 14 Plus, large Android)
  TABLET: 'tablet',    // >= 768px (iPad, Android tablets)
} as const;

export type DeviceSizeType = typeof DeviceSize[keyof typeof DeviceSize];

// Get current device size
export const getDeviceSize = (): DeviceSizeType => {
  if (screenWidth < 375) return DeviceSize.SMALL;
  if (screenWidth < 414) return DeviceSize.MEDIUM;
  if (screenWidth < 768) return DeviceSize.LARGE;
  return DeviceSize.TABLET;
};

// Responsive breakpoints
export const Breakpoints = {
  xs: 0,      // Extra small devices
  sm: 375,    // Small devices (phones)
  md: 414,    // Medium devices (large phones)
  lg: 768,    // Large devices (tablets)
  xl: 1024,   // Extra large devices (large tablets)
} as const;

// Check if current screen matches breakpoint
export const isBreakpoint = (breakpoint: keyof typeof Breakpoints): boolean => {
  return screenWidth >= Breakpoints[breakpoint];
};

// Responsive value function - returns different values based on screen size
export const responsiveValue = <T>(
  small: T,
  medium?: T,
  large?: T,
  tablet?: T
): T => {
  const deviceSize = getDeviceSize();
  
  switch (deviceSize) {
    case DeviceSize.SMALL:
      return small;
    case DeviceSize.MEDIUM:
      return medium ?? small;
    case DeviceSize.LARGE:
      return large ?? medium ?? small;
    case DeviceSize.TABLET:
      return tablet ?? large ?? medium ?? small;
    default:
      return small;
  }
};

// Responsive width calculation
export const responsiveWidth = (percentage: number): number => {
  return (screenWidth * percentage) / 100;
};

// Responsive height calculation
export const responsiveHeight = (percentage: number): number => {
  return (screenHeight * percentage) / 100;
};

// Scale font size based on screen width
export const scaleFontSize = (size: number): number => {
  const scale = screenWidth / 375; // Base width is iPhone 12 (375px)
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Scale dimensions based on screen width
export const scaleSize = (size: number): number => {
  const scale = screenWidth / 375; // Base width is iPhone 12 (375px)
  return Math.round(PixelRatio.roundToNearestPixel(size * scale));
};

// Get responsive spacing
export const getResponsiveSpacing = (base: number) => {
  return responsiveValue(
    base,                    // Small devices
    base * 1.1,             // Medium devices
    base * 1.2,             // Large devices
    base * 1.5              // Tablets
  );
};

// Get responsive font size
export const getResponsiveFontSize = (base: number) => {
  return responsiveValue(
    base,                    // Small devices
    base * 1.05,            // Medium devices
    base * 1.1,             // Large devices
    base * 1.2              // Tablets
  );
};

// Get responsive padding
export const getResponsivePadding = (base: number) => {
  return responsiveValue(
    base,                    // Small devices
    base * 1.1,             // Medium devices
    base * 1.2,             // Large devices
    base * 1.5              // Tablets
  );
};

// Get responsive margin
export const getResponsiveMargin = (base: number) => {
  return responsiveValue(
    base,                    // Small devices
    base * 1.1,             // Medium devices
    base * 1.2,             // Large devices
    base * 1.5              // Tablets
  );
};

// Grid system for responsive layouts
export const Grid = {
  // Number of columns based on device size
  getColumns: () => {
    return responsiveValue(2, 2, 3, 4); // 2 cols on phone, 3 on large phone, 4 on tablet
  },
  
  // Calculate item width based on columns and spacing
  getItemWidth: (spacing: number = 16) => {
    const columns = Grid.getColumns();
    const totalSpacing = spacing * (columns - 1);
    return (screenWidth - totalSpacing - 32) / columns; // 32 is horizontal padding
  },
  
  // Calculate item height maintaining aspect ratio
  getItemHeight: (aspectRatio: number = 1, spacing: number = 16) => {
    const width = Grid.getItemWidth(spacing);
    return width / aspectRatio;
  }
};

// Responsive image dimensions
export const ImageSizes = {
  // Profile images
  avatar: {
    small: responsiveValue(32, 36, 40, 48),
    medium: responsiveValue(48, 56, 64, 72),
    large: responsiveValue(64, 72, 80, 96),
  },
  
  // Product images
  product: {
    small: responsiveValue(80, 90, 100, 120),
    medium: responsiveValue(120, 140, 160, 200),
    large: responsiveValue(160, 180, 200, 240),
  },
  
  // Category icons
  category: {
    small: responsiveValue(40, 45, 50, 60),
    medium: responsiveValue(60, 70, 80, 100),
    large: responsiveValue(80, 90, 100, 120),
  },
  
  // Hero/banner images
  hero: {
    height: responsiveValue(200, 220, 240, 300),
  }
};

// Responsive button sizes
export const ButtonSizes = {
  small: {
    height: responsiveValue(32, 36, 40, 48),
    paddingHorizontal: responsiveValue(12, 14, 16, 20),
    fontSize: responsiveValue(12, 13, 14, 16),
  },
  medium: {
    height: responsiveValue(40, 44, 48, 56),
    paddingHorizontal: responsiveValue(16, 18, 20, 24),
    fontSize: responsiveValue(14, 15, 16, 18),
  },
  large: {
    height: responsiveValue(48, 52, 56, 64),
    paddingHorizontal: responsiveValue(20, 22, 24, 28),
    fontSize: responsiveValue(16, 17, 18, 20),
  },
};

// Responsive card dimensions
export const CardSizes = {
  small: {
    padding: responsiveValue(12, 14, 16, 20),
    borderRadius: responsiveValue(8, 10, 12, 16),
  },
  medium: {
    padding: responsiveValue(16, 18, 20, 24),
    borderRadius: responsiveValue(12, 14, 16, 20),
  },
  large: {
    padding: responsiveValue(20, 22, 24, 28),
    borderRadius: responsiveValue(16, 18, 20, 24),
  },
};

// Responsive input dimensions
export const InputSizes = {
  small: {
    height: responsiveValue(36, 40, 44, 48),
    paddingHorizontal: responsiveValue(12, 14, 16, 20),
    fontSize: responsiveValue(12, 13, 14, 16),
  },
  medium: {
    height: responsiveValue(44, 48, 52, 56),
    paddingHorizontal: responsiveValue(16, 18, 20, 24),
    fontSize: responsiveValue(14, 15, 16, 18),
  },
  large: {
    height: responsiveValue(52, 56, 60, 64),
    paddingHorizontal: responsiveValue(20, 22, 24, 28),
    fontSize: responsiveValue(16, 17, 18, 20),
  },
};

// Responsive text sizes
export const TextSizes = {
  xxs: responsiveValue(8, 9, 10, 12),
  xs: responsiveValue(10, 11, 12, 14),
  sm: responsiveValue(12, 13, 14, 16),
  md: responsiveValue(14, 15, 16, 18),
  lg: responsiveValue(16, 17, 18, 20),
  xl: responsiveValue(18, 19, 20, 22),
  xxl: responsiveValue(20, 22, 24, 26),
  xxxl: responsiveValue(24, 26, 28, 32),
  display: responsiveValue(28, 30, 32, 36),
};

// Responsive spacing scale
export const ResponsiveSpacing = {
  none: 0,
  xxs: responsiveValue(2, 3, 4, 6),
  xs: responsiveValue(4, 5, 6, 8),
  sm: responsiveValue(8, 9, 10, 12),
  md: responsiveValue(12, 14, 16, 20),
  lg: responsiveValue(16, 18, 20, 24),
  xl: responsiveValue(20, 22, 24, 28),
  xxl: responsiveValue(24, 26, 28, 32),
  xxxl: responsiveValue(32, 36, 40, 48),
  huge: responsiveValue(40, 44, 48, 56),
};

// Responsive border radius
export const ResponsiveBorderRadius = {
  none: 0,
  xs: responsiveValue(2, 3, 4, 6),
  sm: responsiveValue(4, 5, 6, 8),
  md: responsiveValue(6, 8, 10, 12),
  lg: responsiveValue(8, 10, 12, 16),
  xl: responsiveValue(12, 14, 16, 20),
  xxl: responsiveValue(16, 18, 20, 24),
  round: responsiveValue(25, 28, 30, 35),
  pill: 999,
};

// Screen dimensions
export const ScreenDimensions = {
  width: screenWidth,
  height: screenHeight,
  isLandscape: screenWidth > screenHeight,
  isPortrait: screenHeight > screenWidth,
};

// Safe area helpers
export const SafeArea = {
  top: responsiveValue(44, 44, 44, 20), // Status bar height
  bottom: responsiveValue(34, 34, 34, 20), // Home indicator height
  horizontal: responsiveValue(16, 20, 24, 32), // Horizontal safe area
  
  // Gesture navigation utilities
  getDynamicBottom: (insets: { bottom: number }) => {
    return Math.max(insets.bottom, 8); // Minimum 8px padding
  },
  
  getTabBarHeight: (insets: { bottom: number }) => {
    const bottomPadding = Math.max(insets.bottom, 8);
    return 60 + bottomPadding;
  },
};

// Shadows (imported from Layout)
export const Shadows = {
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;

// Export all responsive utilities
export const Responsive = {
  // Device detection
  isTablet,
  isSmallDevice,
  isLargeDevice,
  isXLargeDevice,
  getDeviceSize,
  isBreakpoint,
  
  // Responsive functions
  responsiveValue,
  responsiveWidth,
  responsiveHeight,
  scaleFontSize,
  scaleSize,
  
  // Spacing and sizing
  getResponsiveSpacing,
  getResponsiveFontSize,
  getResponsivePadding,
  getResponsiveMargin,
  
  // Grid system
  Grid,
  
  // Predefined sizes
  ImageSizes,
  ButtonSizes,
  CardSizes,
  InputSizes,
  TextSizes,
  ResponsiveSpacing,
  ResponsiveBorderRadius,
  Shadows,
  
  // Screen info
  ScreenDimensions,
  SafeArea,
  
  // Constants
  DeviceSize,
  Breakpoints,
} as const;

export default Responsive;
