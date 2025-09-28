import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

interface NotificationBadgeProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
  maxCount?: number;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  size = 'small',
  maxCount = 99,
}) => {
  if (count <= 0) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  const getBadgeSize = () => {
    switch (size) {
      case 'small':
        return {
          width: 16,
          height: 16,
          fontSize: 10,
          borderRadius: 8,
        };
      case 'medium':
        return {
          width: 20,
          height: 20,
          fontSize: 12,
          borderRadius: 10,
        };
      case 'large':
        return {
          width: 24,
          height: 24,
          fontSize: 14,
          borderRadius: 12,
        };
      default:
        return {
          width: 16,
          height: 16,
          fontSize: 10,
          borderRadius: 8,
        };
    }
  };

  const badgeStyle = getBadgeSize();

  return (
    <View style={[styles.badge, badgeStyle]}>
      <Text style={[styles.badgeText, { fontSize: badgeStyle.fontSize }]}>
        {displayCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    minHeight: 16,
  },
  badgeText: {
    color: Colors.white,
    fontFamily: Layout.fontFamily.bold,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
