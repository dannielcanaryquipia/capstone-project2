// Theme Colors
export const Colors = {
  // Base Colors
  tint: '#D4AF37',
  text: '#333333',
  background: '#F7F7F7',
  card: '#FFFFFF',
  border: '#E0E0E0',
  notification: '#F44336',
  
  // Border Colors
  borderLight: '#F0F0F0',
  borderDark: '#CCCCCC',
  
  // Primary Colors - Kitchen One Brand
  primary: '#D4AF37', // Dark golden yellow - main brand color
  primaryLight: '#E6C547', // Lighter dark yellow for backgrounds
  primaryDark: '#B8941F', // Darker yellow for pressed states
  
  // Secondary Colors
  secondary: '#4CAF50', // Green - success, delivery
  secondaryLight: '#81C784',
  secondaryDark: '#388E3C',
  
  // Accent Colors
  accent: '#2196F3', // Blue - info, links
  accentLight: '#64B5F6',
  accentDark: '#1976D2',
  
  // Background Colors - Kitchen One Brand
  backgroundLight: '#FFFFFF',
  backgroundDark: '#E8E6E3',
  
  // Surface Colors
  surface: '#FFFFFF',
  surfaceVariant: '#F8F9FA',
  surfaceInverse: '#1A1A1A',
  
  // Text Colors
  textSecondary: '#666666',
  textTertiary: '#999999',
  textInverse: '#FFFFFF',
  
  // Themed Text Colors for specific elements
  themedText: '#000000', // Black for light mode
  themedPrice: '#000000', // Black for light mode
  themedDiscount: '#000000', // Black for light mode
  themedViewAll: '#000000', // Black for light mode
  
  // Category Button Colors
  categoryButtonText: '#000000', // Black for light mode
  categoryButtonBorder: '#000000', // Black for light mode
  categoryButtonActiveFill: '#D4AF37', // Dark yellow for active state
  categoryButtonActiveText: '#000000', // Black text when active
  
  // Status Colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Payment Colors
  cod: '#FF9800', // Cash on Delivery
  gcash: '#00D4AA', // GCash green
  
  // Order Status Colors
  pending: '#FF9800',
  preparing: '#2196F3',
  ready: '#4CAF50',
  outForDelivery: '#9C27B0',
  delivered: '#4CAF50',
  cancelled: '#F44336',
  
  // Payment Status Colors
  paymentPending: '#FF9800',
  paymentVerified: '#4CAF50',
  paymentFailed: '#F44336',
  
  // Utility Colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Brown Colors
  brown: '#8B4513', // Saddle Brown
  brownLight: '#D2B48C', // Tan
  brownDark: '#654321', // Dark Brown
  
  // Shadow Colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.2)'
} as const;

// Type for the Colors object
export type ColorsType = typeof Colors;

// Export the default theme (light)
export default Colors;

// Light and Dark theme variants
export const lightColors = {
  ...Colors,
  // Override any light-specific colors here
};

export const darkColors = {
  ...Colors,
  // Override dark-specific colors
  background: '#121212',
  backgroundLight: '#1E1E1E',
  backgroundDark: '#0A0A0A',
  
  // Surface Colors
  surface: '#1E1E1E',
  surfaceVariant: '#2D2D2D',
  surfaceInverse: '#FFFFFF',
  
  // Text Colors
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#7A7A7A',
  textInverse: '#000000',
  
  // Themed Text Colors for specific elements (dark yellow in dark mode)
  themedText: '#D4AF37', // Dark yellow for dark mode
  themedPrice: '#D4AF37', // Dark yellow for dark mode
  themedDiscount: '#D4AF37', // Dark yellow for dark mode
  themedViewAll: '#D4AF37', // Dark yellow for dark mode
  
  // Category Button Colors (dark mode)
  categoryButtonText: '#FFFFFF', // White for dark mode
  categoryButtonBorder: '#FFFFFF', // White for dark mode
  categoryButtonActiveFill: '#D4AF37', // Dark yellow for active state (same in both modes)
  categoryButtonActiveText: '#000000', // Black text when active (same in both modes)
  
  // Border Colors
  border: '#333333',
  borderLight: '#2A2A2A',
  borderDark: '#444444',
  
  // Card Colors
  card: '#1E1E1E',
  
  // Status Colors (keep same for accessibility)
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Primary Colors (keep brand colors)
  primary: '#D4AF37',
  primaryLight: '#E6C547',
  primaryDark: '#B8941F',
  
  // Secondary Colors
  secondary: '#66BB6A',
  secondaryLight: '#81C784',
  secondaryDark: '#388E3C',
  
  // Accent Colors
  accent: '#64B5F6',
  accentLight: '#90CAF9',
  accentDark: '#1976D2',
  
  // Utility Colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.7)',
  
  // Shadow Colors (darker for dark theme)
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowDark: 'rgba(0, 0, 0, 0.5)',
};
