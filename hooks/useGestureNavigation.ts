import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useGestureNavigation = () => {
  const insets = useSafeAreaInsets();
  
  // Detect if device uses gesture navigation
  const hasGestureNavigation = Platform.OS === 'ios' 
    ? insets.bottom > 0 
    : insets.bottom > 0;
  
  // Get appropriate bottom padding (minimum 8px for usability)
  const bottomPadding = Math.max(insets.bottom, 8);
  
  // Get tab bar height with safe area
  const tabBarHeight = 60 + bottomPadding;
  
  // Get content padding to avoid overlap
  const contentPaddingBottom = hasGestureNavigation ? bottomPadding : 0;
  
  return {
    hasGestureNavigation,
    bottomPadding,
    tabBarHeight,
    contentPaddingBottom,
    insets,
  };
};
