import { MaterialIcons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback
} from 'react-native';
import Layout from '../../constants/Layout';
import { ResponsiveBorderRadius, ResponsiveSpacing, responsiveValue } from '../../constants/Responsive';
import { useTheme } from '../../contexts/ThemeContext';
import { ResponsiveText } from './ResponsiveText';
import { ResponsiveView } from './ResponsiveView';

export interface DropdownMenuItem {
  id: string;
  title: string;
  icon?: string;
  color?: string;
  destructive?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

interface DropdownMenuProps {
  items: DropdownMenuItem[];
  triggerIcon?: string;
  triggerColor?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  disabled?: boolean;
  testID?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  items,
  triggerIcon = 'more-vert',
  triggerColor,
  position = 'top-right',
  disabled = false,
  testID,
}) => {
  const { colors } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [menuLayout, setMenuLayout] = useState({ width: 0, height: 0 });
  const [absolutePosition, setAbsolutePosition] = useState({ x: 0, y: 0 });
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const triggerRef = useRef<any>(null);

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const handleTriggerPress = () => {
    if (disabled) return;
    // Measure the absolute position of the trigger
    const trigger = triggerRef.current;
    if (trigger) {
      trigger.measureInWindow((x: number, y: number, width: number, height: number) => {
        setAbsolutePosition({ x, y });
        setTriggerLayout({ x, y, width, height });
        setIsVisible(true);
      });
    } else {
      setIsVisible(true);
    }
  };

  const handleTriggerLayout = (event: any) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setTriggerLayout({ x, y, width, height });
  };

  const handleMenuLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setMenuLayout({ width, height });
  };

  const getMenuPosition = () => {
    const padding = ResponsiveSpacing.sm;
    let top = absolutePosition.y;
    let left = absolutePosition.x;

    // Calculate position based on trigger position and screen boundaries
    switch (position) {
      case 'top-right':
        top = absolutePosition.y - menuLayout.height - padding;
        left = absolutePosition.x + triggerLayout.width - menuLayout.width;
        break;
      case 'top-left':
        top = absolutePosition.y - menuLayout.height - padding;
        left = absolutePosition.x;
        break;
      case 'bottom-right':
        top = absolutePosition.y + triggerLayout.height + padding;
        left = absolutePosition.x + triggerLayout.width - menuLayout.width;
        break;
      case 'bottom-left':
        top = absolutePosition.y + triggerLayout.height + padding;
        left = absolutePosition.x;
        break;
    }

    // Ensure menu stays within screen bounds
    if (left < padding) left = padding;
    if (left + menuLayout.width > screenWidth - padding) {
      left = screenWidth - menuLayout.width - padding;
    }
    if (top < padding) top = absolutePosition.y + triggerLayout.height + padding;
    if (top + menuLayout.height > screenHeight - padding) {
      top = absolutePosition.y - menuLayout.height - padding;
    }

    return { top, left };
  };

  const showMenu = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideMenu = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
    });
  };

  const handleItemPress = (item: DropdownMenuItem) => {
    if (item.disabled) return;
    hideMenu();
    // Small delay to allow animation to complete
    setTimeout(() => {
      item.onPress();
    }, 150);
  };

  const handleBackdropPress = () => {
    hideMenu();
  };

  const menuPosition = getMenuPosition();

  return (
    <>
      <TouchableOpacity
        ref={triggerRef}
        onPress={handleTriggerPress}
        onLayout={handleTriggerLayout}
        style={[
          styles.trigger,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
          disabled && styles.disabled,
        ]}
        disabled={disabled}
        testID={testID}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name={triggerIcon as any}
          size={responsiveValue(18, 20, 22, 24)}
          color={triggerColor || colors.textSecondary}
        />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="none"
        onShow={showMenu}
        onRequestClose={hideMenu}
      >
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <ResponsiveView style={styles.backdrop}>
            <Animated.View
              style={[
                styles.menu,
                {
                  top: menuPosition.top,
                  left: menuPosition.left,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  ...Layout.shadows.lg,
                },
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim,
                },
              ]}
              onLayout={handleMenuLayout}
            >
              {items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    index === 0 && styles.firstMenuItem,
                    index === items.length - 1 && styles.lastMenuItem,
                    item.disabled && styles.disabledMenuItem,
                  ]}
                  onPress={() => handleItemPress(item)}
                  disabled={item.disabled}
                  activeOpacity={0.7}
                >
                  {item.icon && (
                    <MaterialIcons
                      name={item.icon as any}
                      size={responsiveValue(16, 18, 20, 22)}
                      color={
                        item.disabled
                          ? colors.textTertiary
                          : item.destructive
                          ? colors.error
                          : item.color || colors.text
                      }
                      style={styles.menuItemIcon}
                    />
                  )}
                  <ResponsiveText
                    size="sm"
                    color={
                      item.disabled
                        ? colors.textTertiary
                        : item.destructive
                        ? colors.error
                        : colors.text
                    }
                    weight={item.destructive ? 'medium' : 'regular'}
                    style={styles.menuItemText}
                  >
                    {item.title}
                  </ResponsiveText>
                </TouchableOpacity>
              ))}
            </Animated.View>
          </ResponsiveView>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    width: responsiveValue(32, 36, 40, 44),
    height: responsiveValue(32, 36, 40, 44),
    borderRadius: ResponsiveBorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    zIndex: 9998,
    elevation: 9998,
  },
  menu: {
    position: 'absolute',
    minWidth: responsiveValue(140, 160, 180, 200),
    borderRadius: ResponsiveBorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 9999,
    elevation: 9999,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ResponsiveSpacing.md,
    paddingVertical: ResponsiveSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  firstMenuItem: {
    borderTopLeftRadius: ResponsiveBorderRadius.md,
    borderTopRightRadius: ResponsiveBorderRadius.md,
  },
  lastMenuItem: {
    borderBottomLeftRadius: ResponsiveBorderRadius.md,
    borderBottomRightRadius: ResponsiveBorderRadius.md,
    borderBottomWidth: 0,
  },
  disabledMenuItem: {
    opacity: 0.5,
  },
  menuItemIcon: {
    marginRight: ResponsiveSpacing.sm,
  },
  menuItemText: {
    flex: 1,
  },
});

export default DropdownMenu;
