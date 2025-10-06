import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import { ResponsiveBorderRadius, ResponsiveSpacing, responsiveValue } from '../../../constants/Responsive';
import { Strings } from '../../../constants/Strings';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../hooks';
import { User, UserService } from '../../../services/user.service';
import global from '../../../styles/global';

export default function AdminProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const profileData = await UserService.getUserById(user.id);
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/sign-in');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Coming Soon', 'Profile editing feature will be available soon.');
  };

  const handleChangePassword = () => {
    Alert.alert('Coming Soon', 'Password change feature will be available soon.');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[global.screen, styles.center, { backgroundColor: colors.background }]}>
        <ResponsiveView style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="md" color={colors.textSecondary}>
              {Strings.loading}
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={[global.screen, styles.center, { backgroundColor: colors.background }]}>
        <ResponsiveView style={styles.center}>
          <MaterialIcons name="error" size={responsiveValue(48, 56, 64, 72)} color={colors.error} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              Profile Not Found
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveView marginTop="sm">
            <ResponsiveText size="md" color={colors.textSecondary} style={{ textAlign: 'center' }}>
              Unable to load your profile information.
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveView marginTop="lg">
            <Button
              title="Try Again"
              onPress={loadProfile}
              variant="primary"
            />
          </ResponsiveView>
        </ResponsiveView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[global.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <ResponsiveView style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={responsiveValue(20, 24, 28, 32)} color={colors.text} />
        </TouchableOpacity>
        <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
          Admin Profile
        </ResponsiveText>
        <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
          <MaterialIcons name="edit" size={responsiveValue(20, 24, 28, 32)} color={colors.primary} />
        </TouchableOpacity>
      </ResponsiveView>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Icon and Role Badge */}
        <ResponsiveView style={styles.profileSection}>
          <ResponsiveView style={[styles.profileIcon, { backgroundColor: colors.primary }]}>
            <MaterialIcons 
              name="person" 
              size={responsiveValue(48, 56, 64, 72)} 
              color={colors.surface} 
            />
          </ResponsiveView>
          
          <ResponsiveView style={[styles.roleBadge, { backgroundColor: colors.primary }]} marginTop="sm">
            <ResponsiveText size="sm" weight="semiBold" color={colors.surface}>
              {profile.role.toUpperCase()}
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>

        {/* Profile Information */}
        <ResponsiveView style={[styles.section, { backgroundColor: colors.surface }]}>
          <ResponsiveView marginBottom="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              Profile Information
            </ResponsiveText>
          </ResponsiveView>
          
          <ResponsiveView style={styles.infoRow} marginBottom="md">
            <ResponsiveView style={styles.infoLabel}>
              <ResponsiveText size="md" color={colors.textSecondary}>
                Full Name
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveView style={styles.infoValue}>
              <ResponsiveText size="md" color={colors.text} weight="semiBold">
                {profile.full_name || 'Not provided'}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>

          <ResponsiveView style={styles.infoRow} marginBottom="md">
            <ResponsiveView style={styles.infoLabel}>
              <ResponsiveText size="md" color={colors.textSecondary}>
                Username
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveView style={styles.infoValue}>
              <ResponsiveText size="md" color={colors.text} weight="semiBold">
                {profile.email}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>

          <ResponsiveView style={styles.infoRow} marginBottom="md">
            <ResponsiveView style={styles.infoLabel}>
              <ResponsiveText size="md" color={colors.textSecondary}>
                Phone Number
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveView style={styles.infoValue}>
              <ResponsiveText size="md" color={colors.text} weight="semiBold">
                {profile.phone_number || 'Not provided'}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>

          <ResponsiveView style={styles.infoRow} marginBottom="md">
            <ResponsiveView style={styles.infoLabel}>
              <ResponsiveText size="md" color={colors.textSecondary}>
                Email
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveView style={styles.infoValue}>
              <ResponsiveText size="md" color={colors.text} weight="semiBold">
                {profile.email}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>

          <ResponsiveView style={styles.infoRow}>
            <ResponsiveView style={styles.infoLabel}>
              <ResponsiveText size="md" color={colors.textSecondary}>
                Role
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveView style={styles.infoValue}>
              <ResponsiveView style={[styles.roleBadge, { backgroundColor: colors.primary }]}>
                <ResponsiveText size="sm" weight="semiBold" color={colors.surface}>
                  {profile.role.toUpperCase()}
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
          </ResponsiveView>
        </ResponsiveView>

        {/* Account Security */}
        <ResponsiveView style={[styles.section, { backgroundColor: colors.surface }]}>
          <ResponsiveView marginBottom="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              Account Security
            </ResponsiveText>
          </ResponsiveView>
          
          {/* Account Status */}
          <ResponsiveView style={styles.securityItem} marginBottom="md">
            <ResponsiveView style={styles.securityIcon}>
              <MaterialIcons 
                name="verified" 
                size={responsiveValue(20, 22, 24, 26)} 
                color={profile.is_active ? colors.success : colors.warning} 
              />
            </ResponsiveView>
            <ResponsiveView style={styles.securityInfo} flex={1}>
              <ResponsiveText size="md" color={colors.text} weight="semiBold">
                Account Status
              </ResponsiveText>
              <ResponsiveText size="sm" color={colors.textSecondary}>
                {profile.is_active ? 'Your account is active' : 'Your account is inactive'}
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveView style={[styles.statusBadge, { 
              backgroundColor: profile.is_active ? `${colors.success}20` : `${colors.warning}20` 
            }]}>
              <ResponsiveText 
                size="xs" 
                color={profile.is_active ? colors.success : colors.warning}
                weight="semiBold"
              >
                {profile.is_active ? 'ACTIVE' : 'INACTIVE'}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>

          {/* Password */}
          <TouchableOpacity 
            style={styles.securityItem} 
            onPress={handleChangePassword}
            activeOpacity={0.7}
          >
            <ResponsiveView style={styles.securityIcon}>
              <MaterialIcons 
                name="lock" 
                size={responsiveValue(20, 22, 24, 26)} 
                color={colors.primary} 
              />
            </ResponsiveView>
            <ResponsiveView style={styles.securityInfo} flex={1}>
              <ResponsiveText size="md" color={colors.text} weight="semiBold">
                Password
              </ResponsiveText>
              <ResponsiveText size="sm" color={colors.textSecondary}>
                Change your password
              </ResponsiveText>
            </ResponsiveView>
            <MaterialIcons 
              name="chevron-right" 
              size={responsiveValue(20, 22, 24, 26)} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
        </ResponsiveView>

        {/* Account Information */}
        <ResponsiveView style={[styles.section, { backgroundColor: colors.surface }]}>
          <ResponsiveView marginBottom="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              Account Information
            </ResponsiveText>
          </ResponsiveView>
          
          <ResponsiveView style={styles.infoRow} marginBottom="md">
            <ResponsiveView style={styles.infoLabel}>
              <ResponsiveText size="md" color={colors.textSecondary}>
                Member Since
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveView style={styles.infoValue}>
              <ResponsiveText size="md" color={colors.text} weight="semiBold">
                {formatDate(profile.created_at)}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>

          <ResponsiveView style={styles.infoRow}>
            <ResponsiveView style={styles.infoLabel}>
              <ResponsiveText size="md" color={colors.textSecondary}>
                Total Orders
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveView style={styles.infoValue}>
              <ResponsiveText size="md" color={colors.text} weight="semiBold">
                {profile.total_orders || 0}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>
        </ResponsiveView>
      </ScrollView>

      {/* Action Buttons */}
      <ResponsiveView style={[styles.actionContainer, { backgroundColor: colors.surface }]}>
        <Button
          title="Edit Profile"
          onPress={handleEditProfile}
          variant="primary"
        />
        <ResponsiveView marginTop="sm">
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="outline"
          />
        </ResponsiveView>
      </ResponsiveView>
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
    alignItems: 'center',
    paddingHorizontal: ResponsiveSpacing.lg,
    paddingVertical: ResponsiveSpacing.md,
    ...Layout.shadows.sm,
  },
  backButton: {
    padding: ResponsiveSpacing.sm,
  },
  editButton: {
    padding: ResponsiveSpacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: ResponsiveSpacing.lg,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.xl,
  },
  profileIcon: {
    width: responsiveValue(80, 90, 100, 120),
    height: responsiveValue(80, 90, 100, 120),
    borderRadius: responsiveValue(40, 45, 50, 60),
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleBadge: {
    paddingHorizontal: ResponsiveSpacing.md,
    paddingVertical: ResponsiveSpacing.xs,
    borderRadius: ResponsiveBorderRadius.md,
  },
  section: {
    padding: ResponsiveSpacing.lg,
    borderRadius: ResponsiveBorderRadius.lg,
    marginBottom: ResponsiveSpacing.md,
    ...Layout.shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLabel: {
    flex: 1,
  },
  infoValue: {
    flex: 1,
    alignItems: 'flex-end',
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ResponsiveSpacing.sm,
  },
  securityIcon: {
    width: responsiveValue(40, 44, 48, 52),
    height: responsiveValue(40, 44, 48, 52),
    borderRadius: responsiveValue(20, 22, 24, 26),
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ResponsiveSpacing.md,
  },
  securityInfo: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: ResponsiveSpacing.sm,
    paddingVertical: ResponsiveSpacing.xs,
    borderRadius: ResponsiveBorderRadius.sm,
  },
  actionContainer: {
    padding: ResponsiveSpacing.lg,
    ...Layout.shadows.sm,
  },
});
