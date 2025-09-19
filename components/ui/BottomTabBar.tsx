import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

const ICON_MAP: Record<string, { focused: React.ComponentProps<typeof MaterialCommunityIcons>['name']; unfocused: React.ComponentProps<typeof MaterialCommunityIcons>['name']; label: string }> = {
  index: { focused: 'home', unfocused: 'home-outline', label: 'Home' },
  cart: { focused: 'cart', unfocused: 'cart-outline', label: 'Cart' },
  saved: { focused: 'bookmark', unfocused: 'bookmark-outline', label: 'Saved' },
  profile: { focused: 'account', unfocused: 'account-outline', label: 'Profile' },
};

const BottomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.container}>
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
            style={styles.tab}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name={isFocused ? iconConf.focused : iconConf.unfocused}
              color={isFocused ? Colors.black : '#7A7A7A'}
              size={28}
            />
            <Text style={[styles.label, { color: isFocused ? Colors.black : '#7A7A7A' }]}>
              {iconConf.label}
            </Text>
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
    height: 120,
    paddingBottom: 60,
    paddingTop: 30,
    backgroundColor: Colors.white,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
  },
  tab: {
    width: '25%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontFamily: Layout.fontFamily.regular,
  },
});

export default BottomTabBar;


