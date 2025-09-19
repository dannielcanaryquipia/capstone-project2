import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Standard spacing scale
export const Spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// Border radius scale
export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  round: 50,
  pill: 999,
} as const;

// Font sizes
export const FontSize = {
  xxs: 10,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
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

// Component sizes
export const Sizes = {
  // Screen
  screenWidth: width,
  screenHeight: height,
  
  // Header
  headerHeight: 60,
  headerPaddingHorizontal: Spacing.md,
  
  // Tab bar
  tabBarHeight: 60,
  
  // Buttons
  buttonHeight: 48,
  buttonSmallHeight: 36,
  buttonLargeHeight: 56,
  buttonBorderRadius: BorderRadius.md,
  
  // Inputs
  inputHeight: 48,
  inputBorderRadius: BorderRadius.sm,
  inputPaddingHorizontal: Spacing.md,
  
  // Cards
  cardRadius: BorderRadius.lg,
  cardPadding: Spacing.md,
  
  // Icons
  iconSmall: 16,
  iconMedium: 24,
  iconLarge: 32,
  
  // Avatar
  avatarSmall: 32,
  avatarMedium: 48,
  avatarLarge: 64,
  
  // Badge
  badgeHeight: 24,
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
