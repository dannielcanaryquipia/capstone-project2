import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    StyleSheet,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RiderOrdersManager from '../../../components/rider/RiderOrdersManager';
import Button from '../../../components/ui/Button';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import { ResponsiveBorderRadius, ResponsiveSpacing } from '../../../constants/Responsive';
import { useTheme } from '../../../contexts/ThemeContext';
import global from '../../../styles/global';

export default function OrdersScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[global.screen, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={{ flex: 1 }}>
        <ResponsiveView padding="lg">
          {/* Header */}
          <ResponsiveView style={[styles.header, { backgroundColor: colors.surface }]}>
            <ResponsiveView style={styles.headerLeft}>
              <Button
                title=""
                onPress={() => router.back()}
                variant="text"
                icon={<MaterialIcons name="arrow-back" size={24} color={colors.primary} />}
              />
              <ResponsiveView marginLeft="md">
                <ResponsiveText size="xl" weight="bold" color={colors.text}>
                  Delivery Orders
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
          </ResponsiveView>

          {/* Orders Manager */}
          <RiderOrdersManager 
            showAvailableOrders={true}
            showAssignedOrders={true}
            showRecentOrders={true}
            showDeliveredOrders={true}
          />
        </ResponsiveView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.lg,
    padding: ResponsiveSpacing.md,
    borderRadius: ResponsiveBorderRadius.lg,
    ...Layout.shadows.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  section: {
    marginBottom: ResponsiveSpacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.md,
    paddingHorizontal: ResponsiveSpacing.sm,
  },
  ordersList: {
    gap: ResponsiveSpacing.sm,
  },
  emptyState: {
    padding: ResponsiveSpacing.xl,
    borderRadius: ResponsiveBorderRadius.lg,
    alignItems: 'center',
    ...Layout.shadows.sm,
  },
});