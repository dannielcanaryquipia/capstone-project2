import React from 'react';
import { FlatList, ListRenderItem, StyleSheet, View } from 'react-native';
import { ResponsiveSpacing } from '../../constants/Responsive';
import { useTheme } from '../../contexts/ThemeContext';

interface AdminGridProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  numColumns?: number;
  spacing?: keyof typeof ResponsiveSpacing;
  keyExtractor: (item: T, index: number) => string;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  horizontal?: boolean;
}

export function AdminGrid<T>({
  data,
  renderItem,
  numColumns = 1,
  spacing = 'sm',
  keyExtractor,
  onEndReached,
  onEndReachedThreshold = 0.5,
  refreshing = false,
  onRefresh,
  ListEmptyComponent,
  ListHeaderComponent,
  ListFooterComponent,
  showsVerticalScrollIndicator = false,
  showsHorizontalScrollIndicator = false,
  horizontal = false,
}: AdminGridProps<T>) {
  const { colors } = useTheme();


  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      horizontal={horizontal}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      contentContainerStyle={[
        styles.container,
        { 
          paddingHorizontal: ResponsiveSpacing[spacing],
          paddingVertical: ResponsiveSpacing[spacing],
        }
      ]}
      columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
      ItemSeparatorComponent={() => (
        <View 
          style={{ 
            height: ResponsiveSpacing[spacing],
            width: horizontal ? ResponsiveSpacing[spacing] : '100%'
          }} 
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
  },
});
