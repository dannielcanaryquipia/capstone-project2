import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { ResponsiveView } from './ResponsiveView';
import { SafeAreaContainer } from './SafeAreaContainer';

interface PageLayoutProps {
  children: React.ReactNode;
  backgroundColor?: string;
  scrollable?: boolean;
  padding?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  statusBarStyle?: 'light' | 'dark' | 'auto';
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  backgroundColor,
  scrollable = true,
  padding = true,
  header,
  footer,
  statusBarStyle = 'auto',
  edges = ['top', 'bottom'],
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Calculate bottom padding to avoid tab bar overlap
  const bottomPadding = Math.max(insets.bottom, 8);
  const contentPaddingBottom = 60 + bottomPadding; // Tab bar height + safe area

  const content = (
    <>
      {header && (
        <ResponsiveView paddingHorizontal="lg" paddingTop="md" paddingBottom="sm">
          {header}
        </ResponsiveView>
      )}
      
      <ResponsiveView 
        flex={1} 
        paddingHorizontal={padding ? "lg" : "none"}
        paddingVertical={padding ? "sm" : "none"}
        style={{ paddingBottom: contentPaddingBottom }}
      >
        {children}
      </ResponsiveView>
      
      {footer && (
        <ResponsiveView paddingHorizontal="lg" paddingTop="sm" paddingBottom="md">
          {footer}
        </ResponsiveView>
      )}
    </>
  );

  return (
    <SafeAreaContainer 
      backgroundColor={backgroundColor}
      statusBarStyle={statusBarStyle}
      edges={edges}
    >
      {scrollable ? (
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaContainer>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default PageLayout;
