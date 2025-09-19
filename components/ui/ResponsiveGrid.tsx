import React from 'react';
import { FlatList, FlatListProps, StyleSheet } from 'react-native';
import Responsive from '../../constants/Responsive';
import ResponsiveView from './ResponsiveView';

interface ResponsiveGridProps<T> extends Omit<FlatListProps<T>, 'numColumns'> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  
  // Grid configuration
  columns?: number | 'auto';
  spacing?: number;
  
  // Item configuration
  itemAspectRatio?: number;
  itemMinWidth?: number;
  itemMaxWidth?: number;
  
  // Container props
  containerStyle?: any;
  contentContainerStyle?: any;
  
  // Responsive breakpoints
  hideOnSmall?: boolean;
  hideOnMedium?: boolean;
  hideOnLarge?: boolean;
  hideOnTablet?: boolean;
  showOnlyOnSmall?: boolean;
  showOnlyOnMedium?: boolean;
  showOnlyOnLarge?: boolean;
  showOnlyOnTablet?: boolean;
}

export const ResponsiveGrid = <T,>({
  data,
  renderItem,
  columns = 'auto',
  spacing = 16,
  itemAspectRatio = 1,
  itemMinWidth,
  itemMaxWidth,
  containerStyle,
  contentContainerStyle,
  hideOnSmall,
  hideOnMedium,
  hideOnLarge,
  hideOnTablet,
  showOnlyOnSmall,
  showOnlyOnMedium,
  showOnlyOnLarge,
  showOnlyOnTablet,
  ...props
}: ResponsiveGridProps<T>) => {
  // Check if component should be hidden based on screen size
  const deviceSize = Responsive.getDeviceSize();
  const shouldHide = 
    (hideOnSmall && deviceSize === Responsive.DeviceSize.SMALL) ||
    (hideOnMedium && deviceSize === Responsive.DeviceSize.MEDIUM) ||
    (hideOnLarge && deviceSize === Responsive.DeviceSize.LARGE) ||
    (hideOnTablet && deviceSize === Responsive.DeviceSize.TABLET) ||
    (showOnlyOnSmall && deviceSize !== Responsive.DeviceSize.SMALL) ||
    (showOnlyOnMedium && deviceSize !== Responsive.DeviceSize.MEDIUM) ||
    (showOnlyOnLarge && deviceSize !== Responsive.DeviceSize.LARGE) ||
    (showOnlyOnTablet && deviceSize !== Responsive.DeviceSize.TABLET);

  if (shouldHide) {
    return null;
  }

  // Calculate number of columns
  const getNumColumns = () => {
    if (typeof columns === 'number') return columns;
    
    // Auto columns based on device size
    return Responsive.Grid.getColumns();
  };

  const numColumns = getNumColumns();

  // Calculate item width
  const getItemWidth = () => {
    if (itemMinWidth && itemMaxWidth) {
      const availableWidth = Responsive.ScreenDimensions.width - (spacing * 2) - (spacing * (numColumns - 1));
      const calculatedWidth = availableWidth / numColumns;
      return Math.max(itemMinWidth, Math.min(itemMaxWidth, calculatedWidth));
    }
    
    return Responsive.Grid.getItemWidth(spacing);
  };

  const itemWidth = getItemWidth();
  const itemHeight = itemAspectRatio ? itemWidth / itemAspectRatio : itemWidth;

  const responsiveStyle = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: spacing,
    },
    item: {
      width: itemWidth,
      height: itemHeight,
      marginBottom: spacing,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing,
    },
  });

  // Custom render item that wraps each item with proper styling
  const renderGridItem = ({ item, index }: { item: T; index: number }) => {
    const isLastInRow = (index + 1) % numColumns === 0;
    const isLastRow = index >= data.length - (data.length % numColumns || numColumns);
    
    return (
      <ResponsiveView
        style={[
          responsiveStyle.item,
          isLastInRow && { marginRight: 0 },
          isLastRow && { marginBottom: 0 },
        ]}
      >
        {renderItem({ item, index })}
      </ResponsiveView>
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={renderGridItem}
      numColumns={numColumns}
      keyExtractor={(_, index) => index.toString()}
      style={[responsiveStyle.container, containerStyle]}
      contentContainerStyle={[responsiveStyle.content, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      {...props}
    />
  );
};

export default ResponsiveGrid;
