import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import { ResponsiveBorderRadius, ResponsiveSpacing } from '../../../constants/Responsive';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import { useRiderProfile } from '../../../hooks/useRiderProfile';
import global from '../../../styles/global';

export default function RiderProfileScreen() {
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { profile, stats, isLoading, error, toggleAvailability } = useRiderProfile();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut }
      ]
    );
  };

  const handleToggleAvailability = async () => {
    try {
      await toggleAvailability();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update availability');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[global.screen, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ResponsiveView marginTop="md">
          <ResponsiveText size="md" color={colors.textSecondary}>
            Loading profile...
          </ResponsiveText>
        </ResponsiveView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[global.screen, styles.center, { backgroundColor: colors.background }]}>
        <MaterialIcons name="error-outline" size={48} color={colors.error} />
        <ResponsiveView marginTop="md">
          <ResponsiveText size="lg" color={colors.error} align="center">
            Error loading profile
          </ResponsiveText>
        </ResponsiveView>
        <ResponsiveView marginTop="sm">
          <ResponsiveText size="md" color={colors.textSecondary} align="center">
            {error}
          </ResponsiveText>
        </ResponsiveView>
        <ResponsiveView marginTop="lg">
          <Button
            title="Retry"
            onPress={() => window.location.reload()}
            variant="primary"
            size="medium"
          />
        </ResponsiveView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[global.screen, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ResponsiveView padding="lg">
          {/* Header */}
          <ResponsiveView style={[styles.header, { backgroundColor: colors.surface }]}>
            <Button
              title=""
              onPress={() => router.back()}
              variant="text"
              icon={<MaterialIcons name="arrow-back" size={24} color={colors.primary} />}
            />
            <ResponsiveText size="xl" weight="bold" color={colors.text}>
              Profile
            </ResponsiveText>
            <Button
              title="Sign Out"
              onPress={handleSignOut}
              variant="text"
              size="small"
              icon={<MaterialIcons name="logout" size={16} color={colors.error} />}
            />
          </ResponsiveView>

          {/* Profile Info */}
          <ResponsiveView style={[styles.profileCard, { backgroundColor: colors.surface }]}>
            <ResponsiveView style={styles.profileHeader}>
              <ResponsiveView style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
                <MaterialIcons name="person" size={48} color={colors.primary} />
              </ResponsiveView>
              <ResponsiveView style={styles.profileInfo}>
                <ResponsiveText size="lg" weight="bold" color={colors.text}>
                  {profile?.profile?.full_name || 'Rider'}
                </ResponsiveText>
                <ResponsiveText size="md" color={colors.textSecondary}>
                  {profile?.profile?.phone_number || 'No phone number'}
                </ResponsiveText>
                <ResponsiveView style={styles.availabilityContainer}>
                  <ResponsiveView style={[
                    styles.availabilityBadge, 
                    { backgroundColor: profile?.is_available ? colors.success + '20' : colors.error + '20' }
                  ]}>
                    <MaterialIcons 
                      name={profile?.is_available ? 'check-circle' : 'pause-circle'} 
                      size={16} 
                      color={profile?.is_available ? colors.success : colors.error} 
                    />
                    <ResponsiveView marginLeft="xs">
                      <ResponsiveText 
                        size="sm" 
                        color={profile?.is_available ? colors.success : colors.error} 
                        weight="medium"
                      >
                        {profile?.is_available ? 'Available' : 'Unavailable'}
                      </ResponsiveText>
                    </ResponsiveView>
                  </ResponsiveView>
                </ResponsiveView>
              </ResponsiveView>
            </ResponsiveView>
            
            <Button
              title={profile?.is_available ? 'Set Unavailable' : 'Set Available'}
              onPress={handleToggleAvailability}
              variant="outline"
              size="medium"
              icon={<MaterialIcons name={profile?.is_available ? 'pause' : 'play-arrow'} size={16} color={colors.primary} />}
            />
          </ResponsiveView>

          {/* Stats */}
          <ResponsiveView style={styles.statsContainer}>
            <ResponsiveView style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <MaterialIcons name="local-shipping" size={24} color={colors.primary} />
              <ResponsiveView style={styles.statContent}>
                <ResponsiveText size="lg" weight="bold" color={colors.text}>
                  {stats.totalDeliveries}
                </ResponsiveText>
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  Total Deliveries
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>

            <ResponsiveView style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <MaterialIcons name="check-circle" size={24} color={colors.success} />
              <ResponsiveView style={styles.statContent}>
                <ResponsiveText size="lg" weight="bold" color={colors.text}>
                  {stats.completedDeliveries}
                </ResponsiveText>
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  Completed
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
          </ResponsiveView>

          <ResponsiveView style={styles.statsContainer}>
            <ResponsiveView style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <MaterialIcons name="attach-money" size={24} color={colors.warning} />
              <ResponsiveView style={styles.statContent}>
                <ResponsiveText size="lg" weight="bold" color={colors.text}>
                  ₱{stats.todayEarnings.toFixed(2)}
                </ResponsiveText>
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  Today's Earnings
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>

            <ResponsiveView style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <MaterialIcons name="account-balance-wallet" size={24} color={colors.info} />
              <ResponsiveView style={styles.statContent}>
                <ResponsiveText size="lg" weight="bold" color={colors.text}>
                  ₱{stats.totalEarnings.toFixed(2)}
                </ResponsiveText>
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  Total Earnings
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
          </ResponsiveView>

          {/* Rider Details */}
          <ResponsiveView style={[styles.detailsCard, { backgroundColor: colors.surface }]}>
            <ResponsiveView marginBottom="md">
              <ResponsiveText size="lg" weight="bold" color={colors.text}>
                Rider Details
              </ResponsiveText>
            </ResponsiveView>
            
            <ResponsiveView style={styles.detailRow}>
              <ResponsiveText size="md" color={colors.textSecondary}>
                Vehicle Number:
              </ResponsiveText>
              <ResponsiveText size="md" color={colors.text}>
                {profile?.vehicle_number || 'Not set'}
              </ResponsiveText>
            </ResponsiveView>
            
            <ResponsiveView style={styles.detailRow}>
              <ResponsiveText size="md" color={colors.textSecondary}>
                Joined:
              </ResponsiveText>
              <ResponsiveText size="md" color={colors.text}>
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
              </ResponsiveText>
            </ResponsiveView>
            
            <ResponsiveView style={styles.detailRow}>
              <ResponsiveText size="md" color={colors.textSecondary}>
                Last Updated:
              </ResponsiveText>
              <ResponsiveText size="md" color={colors.text}>
                {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Unknown'}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>
        </ResponsiveView>
      </ScrollView>
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
    marginBottom: ResponsiveSpacing.xl,
    padding: ResponsiveSpacing.md,
    borderRadius: ResponsiveBorderRadius.lg,
    ...Layout.shadows.sm,
  },
  profileCard: {
    padding: ResponsiveSpacing.lg,
    borderRadius: ResponsiveBorderRadius.lg,
    marginBottom: ResponsiveSpacing.xl,
    ...Layout.shadows.sm,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ResponsiveSpacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  availabilityContainer: {
    marginTop: ResponsiveSpacing.sm,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: ResponsiveSpacing.sm,
    paddingVertical: ResponsiveSpacing.xs,
    borderRadius: ResponsiveBorderRadius.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: ResponsiveSpacing.md,
    marginBottom: ResponsiveSpacing.lg,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: ResponsiveSpacing.md,
    borderRadius: ResponsiveBorderRadius.lg,
    ...Layout.shadows.sm,
  },
  statContent: {
    marginLeft: ResponsiveSpacing.md,
  },
  detailsCard: {
    padding: ResponsiveSpacing.lg,
    borderRadius: ResponsiveBorderRadius.lg,
    ...Layout.shadows.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: ResponsiveSpacing.sm,
  },
});