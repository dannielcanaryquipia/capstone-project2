import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet
} from 'react-native';
import { AdminCard, AdminLayout, AdminSection } from '../../../components/admin';
import Button from '../../../components/ui/Button';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import { ResponsiveBorderRadius, ResponsiveSpacing, responsiveValue } from '../../../constants/Responsive';
import { Strings } from '../../../constants/Strings';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../hooks';
import { User, UserService } from '../../../services/user.service';

export default function AdminProfile() {
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
      <AdminLayout
        title="Admin Profile"
        subtitle="Manage your account settings"
        showBackButton={true}
        onBackPress={() => router.back()}
      >
        <ResponsiveView style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="md" color={colors.textSecondary}>
              {Strings.loading}
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
      </AdminLayout>
    );
  }

  if (!profile) {
    return (
      <AdminLayout
        title="Admin Profile"
        subtitle="Manage your account settings"
        showBackButton={true}
        onBackPress={() => router.back()}
      >
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
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Admin Profile"
      subtitle="Manage your account settings"
      showBackButton={true}
      onBackPress={() => router.back()}
    >

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
        <AdminSection
          title="Profile Information"
          subtitle="Your personal details"
          variant="card"
        >
          
          <AdminCard
            title="Full Name"
            subtitle={profile.full_name || 'Not provided'}
            icon={<MaterialIcons name="person" size={20} color={colors.primary} />}
            variant="outlined"
            style={styles.infoCard}
          >
            {null}
          </AdminCard>

          <AdminCard
            title="Username"
            subtitle={profile.email}
            icon={<MaterialIcons name="alternate-email" size={20} color={colors.primary} />}
            variant="outlined"
            style={styles.infoCard}
          >
            {null}
          </AdminCard>

          <AdminCard
            title="Phone Number"
            subtitle={profile.phone_number || 'Not provided'}
            icon={<MaterialIcons name="phone" size={20} color={colors.primary} />}
            variant="outlined"
            style={styles.infoCard}
          >
            {null}
          </AdminCard>

          <AdminCard
            title="Email"
            subtitle={profile.email}
            icon={<MaterialIcons name="email" size={20} color={colors.primary} />}
            variant="outlined"
            style={styles.infoCard}
          >
            {null}
          </AdminCard>

          <AdminCard
            title="Role"
            subtitle={profile.role.toUpperCase()}
            icon={<MaterialIcons name="admin-panel-settings" size={20} color={colors.primary} />}
            variant="outlined"
            style={styles.infoCard}
          >
            {null}
          </AdminCard>
        </AdminSection>

        {/* Account Security */}
        <AdminSection
          title="Account Security"
          subtitle="Manage your account security settings"
          variant="card"
        >

          {/* Password */}
          <AdminCard
            title="Password"
            subtitle="Change your password"
            icon={<MaterialIcons name="lock" size={20} color={colors.primary} />}
            variant="outlined"
            onPress={handleChangePassword}
            style={styles.infoCard}
          >
            {null}
          </AdminCard>
        </AdminSection>

        {/* Account Information */}
        <AdminSection
          title="Account Information"
          subtitle="Your account details and statistics"
          variant="card"
        >
          <AdminCard
            title="Member Since"
            subtitle={formatDate(profile.created_at)}
            icon={<MaterialIcons name="calendar-today" size={20} color={colors.primary} />}
            variant="outlined"
            style={styles.infoCard}
          >
            {null}
          </AdminCard>

          <AdminCard
            title="Total Orders"
            subtitle={`${profile.total_orders || 0} orders`}
            icon={<MaterialIcons name="shopping-cart" size={20} color={colors.primary} />}
            variant="outlined"
            style={styles.infoCard}
          >
            {null}
          </AdminCard>
        </AdminSection>
      </ScrollView>

      {/* Sign Out Button */}
      <ResponsiveView style={styles.signOutSection}>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
          variant="danger"
          size="large"
          fullWidth
          icon={<MaterialIcons name="logout" size={20} color={colors.textInverse} />}
          />
      </ResponsiveView>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
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
  infoCard: {
    marginBottom: ResponsiveSpacing.sm,
  },
  signOutSection: {
    marginTop: ResponsiveSpacing.sm,
    marginBottom: ResponsiveSpacing.lg,
    paddingHorizontal: ResponsiveSpacing.lg,
  },
});
