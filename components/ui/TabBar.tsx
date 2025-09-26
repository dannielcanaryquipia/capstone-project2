import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import Layout from '../../constants/Layout';
import { useTheme } from '../../contexts/ThemeContext';
import { ResponsiveText } from './ResponsiveText';
import { ResponsiveView } from './ResponsiveView';

export interface TabItem {
  key: string;
  label: string;
  count?: number;
  color?: string;
}

interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (tabKey: string) => void;
  horizontal?: boolean;
  showScrollIndicator?: boolean;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'small' | 'medium' | 'large';
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTab,
  onTabPress,
  horizontal = true,
  showScrollIndicator = false,
  variant = 'default',
  size = 'medium',
}) => {
  const { colors } = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: Layout.spacing.sm,
          paddingVertical: Layout.spacing.xs,
          borderRadius: Layout.borderRadius.sm,
          textSize: 'sm' as const,
        };
      case 'large':
        return {
          paddingHorizontal: Layout.spacing.lg,
          paddingVertical: Layout.spacing.md,
          borderRadius: Layout.borderRadius.lg,
          textSize: 'lg' as const,
        };
      default: // medium
        return {
          paddingHorizontal: Layout.spacing.md,
          paddingVertical: Layout.spacing.sm,
          borderRadius: Layout.borderRadius.md,
          textSize: 'md' as const,
        };
    }
  };

  const getVariantStyles = (isActive: boolean, tabColor?: string) => {
    const activeColor = tabColor || colors.primary;
    
    switch (variant) {
      case 'pills':
        return {
          backgroundColor: isActive ? activeColor : 'transparent',
          borderWidth: 1,
          borderColor: isActive ? activeColor : colors.border,
          textColor: isActive ? colors.background : colors.text,
        };
      case 'underline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
          borderBottomWidth: isActive ? 2 : 0,
          borderBottomColor: isActive ? activeColor : 'transparent',
          textColor: isActive ? activeColor : colors.textSecondary,
        };
      default: // default
        return {
          backgroundColor: isActive ? `${activeColor}20` : 'transparent',
          borderWidth: 1,
          borderColor: isActive ? activeColor : colors.border,
          textColor: isActive ? activeColor : colors.text,
        };
    }
  };

  const renderTab = ({ item }: { item: TabItem }) => {
    const isActive = activeTab === item.key;
    const sizeStyles = getSizeStyles();
    const variantStyles = getVariantStyles(isActive, item.color);

    return (
      <TouchableOpacity
        style={[
          styles.tab,
          {
            paddingHorizontal: sizeStyles.paddingHorizontal,
            paddingVertical: sizeStyles.paddingVertical,
            borderRadius: sizeStyles.borderRadius,
            backgroundColor: variantStyles.backgroundColor,
            borderWidth: variantStyles.borderWidth,
            borderColor: variantStyles.borderColor,
            borderBottomWidth: variantStyles.borderBottomWidth,
            borderBottomColor: variantStyles.borderBottomColor,
          },
        ]}
        onPress={() => onTabPress(item.key)}
      >
        <ResponsiveText
          size={sizeStyles.textSize}
          weight="medium"
          color={variantStyles.textColor}
        >
          {item.label}
        </ResponsiveText>
        {item.count !== undefined && (
          <ResponsiveView 
            style={[
              styles.countBadge,
              {
                backgroundColor: isActive ? colors.background : colors.textSecondary,
              }
            ]}
          >
            <ResponsiveText
              size="xs"
              weight="semiBold"
              color={isActive ? colors.primary : colors.background}
            >
              {item.count}
            </ResponsiveText>
          </ResponsiveView>
        )}
      </TouchableOpacity>
    );
  };

  const containerStyle = horizontal ? styles.horizontalContainer : styles.verticalContainer;

  return (
    <ResponsiveView style={containerStyle}>
      <FlatList
        data={tabs}
        renderItem={renderTab}
        keyExtractor={(item) => item.key}
        horizontal={horizontal}
        showsHorizontalScrollIndicator={showScrollIndicator}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={horizontal ? styles.horizontalContent : styles.verticalContent}
      />
    </ResponsiveView>
  );
};

const styles = StyleSheet.create({
  horizontalContainer: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.sm,
  },
  verticalContainer: {
    paddingVertical: Layout.spacing.sm,
  },
  horizontalContent: {
    gap: Layout.spacing.sm,
  },
  verticalContent: {
    gap: Layout.spacing.xs,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    marginLeft: Layout.spacing.xs,
    paddingHorizontal: Layout.spacing.xs,
    paddingVertical: 2,
    borderRadius: Layout.borderRadius.sm,
    minWidth: 20,
    alignItems: 'center',
  },
});
