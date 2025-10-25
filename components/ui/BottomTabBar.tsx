import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Layout from '../../constants/Layout';
import { useTheme } from '../../contexts/ThemeContext';

const ICON_MAP: Record<string, { focused: React.ComponentProps<typeof MaterialCommunityIcons>['name']; unfocused: React.ComponentProps<typeof MaterialCommunityIcons>['name']; label: string }> = {
  index: { focused: 'home', unfocused: 'home-outline', label: 'Home' },
  cart: { focused: 'cart', unfocused: 'cart-outline', label: 'Cart' },
  saved: { focused: 'bookmark', unfocused: 'bookmark-outline', label: 'Saved' },
  profile: { focused: 'account', unfocused: 'account-outline', label: 'Profile' },
};

const BottomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Calculate dynamic bottom padding based on device safe area
  const bottomPadding = Math.max(insets.bottom, 8); // Minimum 8px padding
  
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.6)',
          shadowColor: colors.black,
          paddingBottom: bottomPadding,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const options = descriptors[route.key].options;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name as never);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const iconConf = ICON_MAP[route.name] ?? { focused: 'circle', unfocused: 'circle-outline', label: options.title ?? route.name };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[
              styles.tab,
            ]}
            activeOpacity={0.8}
          >
            <View style={styles.item}>
              <MaterialCommunityIcons
                name={isFocused ? iconConf.focused : iconConf.unfocused}
                color={isFocused ? (isDark ? colors.primary : colors.black) : colors.textTertiary}
                size={26}
              />
              <Text
                style={[
                  styles.label,
                  { color: isFocused ? (isDark ? colors.primary : colors.black) : colors.textTertiary },
                ]}
              >
                {iconConf.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingTop: 12,
    borderTopWidth: 0,
    marginHorizontal: 0,
    marginBottom: 0,
    borderRadius: 0,
    overflow: 'visible',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    minHeight: 60,
  },
  tab: {
    width: '25%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    gap: 6,
  },
  item: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 12,
    fontFamily: Layout.fontFamily.regular,
  },
});

export default BottomTabBar;


