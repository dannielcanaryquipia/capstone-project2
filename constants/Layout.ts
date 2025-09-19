import { Dimensions } from 'react-native';
import Responsive from './Responsive';

const { width, height } = Dimensions.get('window');

// Standard spacing scale (now responsive)
export const Spacing = {
  none: 0,
  xxs: Responsive.ResponsiveSpacing.xxs,
  xs: Responsive.ResponsiveSpacing.xs,
  sm: Responsive.ResponsiveSpacing.sm,
  md: Responsive.ResponsiveSpacing.md,
  lg: Responsive.ResponsiveSpacing.lg,
  xl: Responsive.ResponsiveSpacing.xl,
  xxl: Responsive.ResponsiveSpacing.xxl,
  xxxl: Responsive.ResponsiveSpacing.xxxl,
} as const;

// Border radius scale (now responsive)
export const BorderRadius = {
  none: 0,
  xs: Responsive.ResponsiveBorderRadius.xs,
  sm: Responsive.ResponsiveBorderRadius.sm,
  md: Responsive.ResponsiveBorderRadius.md,
  lg: Responsive.ResponsiveBorderRadius.lg,
  xl: Responsive.ResponsiveBorderRadius.xl,
  xxl: Responsive.ResponsiveBorderRadius.xxl,
  round: Responsive.ResponsiveBorderRadius.round,
  pill: Responsive.ResponsiveBorderRadius.pill,
} as const;

// Font sizes (now responsive)
export const FontSize = {
  xxs: Responsive.TextSizes.xxs,
  xs: Responsive.TextSizes.xs,
  sm: Responsive.TextSizes.sm,
  md: Responsive.TextSizes.md,
  lg: Responsive.TextSizes.lg,
  xl: Responsive.TextSizes.xl,
  xxl: Responsive.TextSizes.xxl,
  xxxl: Responsive.TextSizes.xxxl,
  display: Responsive.TextSizes.display,
} as const;

// Line heights
export const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.8,
} as const;

// Font weights
export const FontWeight = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
} as const;

// Font families
export const FontFamily = {
  regular: 'PoppinsRegular',
  medium: 'PoppinsMedium',
  semiBold: 'PoppinsSemiBold',
  bold: 'PoppinsBold',
  light: 'PoppinsLight',
  black: 'PoppinsBlack',
  display: 'PlayfairDisplay', // For titles and headings
} as const;

// Component sizes (now responsive)
export const Sizes = {
  // Screen
  screenWidth: width,
  screenHeight: height,
  
  // Header
  headerHeight: Responsive.responsiveValue(50, 55, 60, 70),
  headerPaddingHorizontal: Spacing.md,
  
  // Tab bar
  tabBarHeight: Responsive.responsiveValue(50, 55, 60, 70),
  
  // Buttons
  buttonHeight: Responsive.ButtonSizes.medium.height,
  buttonSmallHeight: Responsive.ButtonSizes.small.height,
  buttonLargeHeight: Responsive.ButtonSizes.large.height,
  buttonBorderRadius: BorderRadius.md,
  
  // Inputs
  inputHeight: Responsive.InputSizes.medium.height,
  inputBorderRadius: BorderRadius.sm,
  inputPaddingHorizontal: Spacing.md,
  
  // Cards
  cardRadius: BorderRadius.lg,
  cardPadding: Spacing.md,
  
  // Icons
  iconSmall: Responsive.responsiveValue(14, 16, 18, 20),
  iconMedium: Responsive.responsiveValue(20, 22, 24, 28),
  iconLarge: Responsive.responsiveValue(28, 30, 32, 36),
  
  // Avatar
  avatarSmall: Responsive.ImageSizes.avatar.small,
  avatarMedium: Responsive.ImageSizes.avatar.medium,
  avatarLarge: Responsive.ImageSizes.avatar.large,
  
  // Badge
  badgeHeight: Responsive.responsiveValue(20, 22, 24, 28),
  badgePaddingHorizontal: Spacing.sm,
  
  // Divider
  dividerHeight: 1,
  
  // Border width
  borderWidth: 1,
  borderWidthThick: 2,
} as const;

// Shadows
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

// Animation
const Animation = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const;

// Z-index
const ZIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Export all layout constants
export const Layout = {
  spacing: Spacing,
  borderRadius: BorderRadius,
  fontSize: FontSize,
  lineHeight: LineHeight,
  fontWeight: FontWeight,
  fontFamily: FontFamily,
  sizes: Sizes,
  shadows: Shadows,
  animation: Animation,
  zIndex: ZIndex,
} as const;

export type LayoutType = typeof Layout;
export default Layout;
