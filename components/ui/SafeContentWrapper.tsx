import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

interface SafeContentWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: any;
  contentContainerStyle?: any;
}

export const SafeContentWrapper: React.FC<SafeContentWrapperProps> = ({
  children,
  scrollable = true,
  style,
  contentContainerStyle,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Calculate bottom padding to avoid tab bar overlap
  const bottomPadding = Math.max(insets.bottom, 8);
  const contentPaddingBottom = 60 + bottomPadding; // Tab bar height + safe area

  const content = (
    <View style={[styles.container, { paddingBottom: contentPaddingBottom }, style]}>
      {children}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default SafeContentWrapper;
