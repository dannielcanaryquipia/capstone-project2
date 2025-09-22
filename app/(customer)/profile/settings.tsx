import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity
} from 'react-native';
import Button from '../../../components/ui/Button';
import ResponsiveText from '../../../components/ui/ResponsiveText';
import ResponsiveView from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import { useTheme } from '../../../contexts/ThemeContext';
import global from '../../../styles/global';

interface SettingsItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  type: 'switch' | 'navigation';
  value?: boolean;
  onPress?: () => void;
}

export default function SettingsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: false,
    locationServices: true,
    darkMode: false,
    autoSaveAddresses: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('userSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: typeof settings) => {
    try {
      await AsyncStorage.setItem('userSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  const handleToggleSetting = async (key: keyof typeof settings) => {
    const newValue = !settings[key];
    await saveSettings({ ...settings, [key]: newValue });
    
    // Show confirmation for important settings
    if (key === 'locationServices' && newValue) {
      Alert.alert(
        'Location Services',
        'Location services help us provide accurate delivery estimates and find nearby restaurants.',
        [{ text: 'OK' }]
      );
    }
  };

  const handlePrivacyPolicy = () => {
    Alert.alert(
      'Privacy Policy',
      'Our privacy policy outlines how we collect, use, and protect your personal information. You can view the full policy on our website.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'View Online', 
          onPress: () => Linking.openURL('https://kitchenone.com/privacy-policy') 
        },
      ]
    );
  };

  const handleTermsOfService = () => {
    Alert.alert(
      'Terms of Service',
      'Our terms of service govern your use of our app and services. You can view the full terms on our website.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'View Online', 
          onPress: () => Linking.openURL('https://kitchenone.com/terms-of-service') 
        },
      ]
    );
  };

  const handleDataExport = () => {
    Alert.alert(
      'Export Data',
      'You can request a copy of all your data including orders, addresses, and preferences. This will be sent to your registered email address.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Request Export', 
          onPress: () => {
            Alert.alert('Success', 'Data export request submitted. You will receive an email within 24 hours.');
          }
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data, including orders and addresses, will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Account', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'Are you absolutely sure you want to delete your account?',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Yes, Delete', 
                  style: 'destructive',
                  onPress: () => {
                    // TODO: Implement account deletion
                    Alert.alert('Account Deletion', 'Account deletion feature will be implemented soon.');
                  }
                },
              ]
            );
          }
        },
      ]
    );
  };

  const settingsItems: SettingsItem[] = [
    {
      id: 'notifications',
      title: 'Push Notifications',
      subtitle: 'Receive order updates and promotions',
      icon: 'notifications',
      type: 'switch',
      value: settings.pushNotifications,
    },
    {
      id: 'email',
      title: 'Email Notifications',
      subtitle: 'Receive updates via email',
      icon: 'email',
      type: 'switch',
      value: settings.emailNotifications,
    },
    {
      id: 'location',
      title: 'Location Services',
      subtitle: 'Allow location access for delivery',
      icon: 'location-on',
      type: 'switch',
      value: settings.locationServices,
    },
    {
      id: 'autoSave',
      title: 'Auto-save Addresses',
      subtitle: 'Automatically save frequently used addresses',
      icon: 'save',
      type: 'switch',
      value: settings.autoSaveAddresses,
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      subtitle: 'View our privacy policy',
      icon: 'privacy-tip',
      type: 'navigation',
      onPress: handlePrivacyPolicy,
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      subtitle: 'View terms and conditions',
      icon: 'description',
      type: 'navigation',
      onPress: handleTermsOfService,
    },
    {
      id: 'export',
      title: 'Export Data',
      subtitle: 'Download a copy of your data',
      icon: 'download',
      type: 'navigation',
      onPress: handleDataExport,
    },
  ];

  const handleSettingPress = (item: SettingsItem) => {
    if (item.type === 'navigation' && item.onPress) {
      item.onPress();
    } else if (item.type === 'switch') {
      const settingKey = item.id as keyof typeof settings;
      handleToggleSetting(settingKey);
    }
  };

  return (
    <ScrollView style={[global.screen, { backgroundColor: colors.background }]}>
      <ResponsiveView padding="lg">
        {/* Header */}
        <ResponsiveView style={[styles.header, { backgroundColor: colors.surface }]}>
          <ResponsiveView style={styles.headerLeft}>
            <Button
              title=""
              onPress={() => router.back()}
              variant="text"
              icon={<MaterialIcons name="arrow-back" size={24} color={colors.text} />}
              style={styles.backButton}
            />
            <ResponsiveText size="xl" weight="bold" color={colors.text}>
              Settings
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>

        {/* Notification Settings */}
        <ResponsiveView style={styles.section}>
          <ResponsiveView marginBottom="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              Notifications
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveView style={[styles.settingsCard, { 
            backgroundColor: colors.surface,
            ...Layout.shadows.sm
          }]}>
            {settingsItems.filter(item => ['notifications', 'email'].includes(item.id)).map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.settingItem,
                  index < 1 && { borderBottomColor: colors.border },
                ]}
                onPress={() => handleSettingPress(item)}
                activeOpacity={0.7}
              >
                <ResponsiveView style={styles.settingLeft}>
                  <ResponsiveView style={[styles.settingIcon, { backgroundColor: colors.surfaceVariant }]}>
                    <MaterialIcons name={item.icon as any} size={24} color={colors.primary} />
                  </ResponsiveView>
                  <ResponsiveView style={styles.settingText}>
                    <ResponsiveText size="md" weight="medium" color={colors.text}>
                      {item.title}
                    </ResponsiveText>
                    <ResponsiveView marginTop="xs">
                      <ResponsiveText size="sm" color={colors.textSecondary}>
                        {item.subtitle}
                      </ResponsiveText>
                    </ResponsiveView>
                  </ResponsiveView>
                </ResponsiveView>
                <ResponsiveView style={styles.settingRight}>
                  <Switch
                    value={item.value}
                    onValueChange={() => handleSettingPress(item)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={item.value ? colors.white : colors.textTertiary}
                  />
                </ResponsiveView>
              </TouchableOpacity>
            ))}
          </ResponsiveView>
        </ResponsiveView>

        {/* App Settings */}
        <ResponsiveView style={styles.section}>
          <ResponsiveView marginBottom="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              App Settings
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveView style={[styles.settingsCard, { 
            backgroundColor: colors.surface,
            ...Layout.shadows.sm
          }]}>
            {settingsItems.filter(item => ['location', 'autoSave'].includes(item.id)).map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.settingItem,
                  index < 1 && { borderBottomColor: colors.border },
                ]}
                onPress={() => handleSettingPress(item)}
                activeOpacity={0.7}
              >
                <ResponsiveView style={styles.settingLeft}>
                  <ResponsiveView style={[styles.settingIcon, { backgroundColor: colors.surfaceVariant }]}>
                    <MaterialIcons name={item.icon as any} size={24} color={colors.primary} />
                  </ResponsiveView>
                  <ResponsiveView style={styles.settingText}>
                    <ResponsiveText size="md" weight="medium" color={colors.text}>
                      {item.title}
                    </ResponsiveText>
                    <ResponsiveView marginTop="xs">
                      <ResponsiveText size="sm" color={colors.textSecondary}>
                        {item.subtitle}
                      </ResponsiveText>
                    </ResponsiveView>
                  </ResponsiveView>
                </ResponsiveView>
                <ResponsiveView style={styles.settingRight}>
                  <Switch
                    value={item.value}
                    onValueChange={() => handleSettingPress(item)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={item.value ? colors.white : colors.textTertiary}
                  />
                </ResponsiveView>
              </TouchableOpacity>
            ))}
          </ResponsiveView>
        </ResponsiveView>

        {/* Legal & Privacy */}
        <ResponsiveView style={styles.section}>
          <ResponsiveView marginBottom="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              Legal & Privacy
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveView style={[styles.settingsCard, { 
            backgroundColor: colors.surface,
            ...Layout.shadows.sm
          }]}>
            {settingsItems.filter(item => ['privacy', 'terms', 'export'].includes(item.id)).map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.settingItem,
                  index < 2 && { borderBottomColor: colors.border },
                ]}
                onPress={() => handleSettingPress(item)}
                activeOpacity={0.7}
              >
                <ResponsiveView style={styles.settingLeft}>
                  <ResponsiveView style={[styles.settingIcon, { backgroundColor: colors.surfaceVariant }]}>
                    <MaterialIcons name={item.icon as any} size={24} color={colors.primary} />
                  </ResponsiveView>
                  <ResponsiveView style={styles.settingText}>
                    <ResponsiveText size="md" weight="medium" color={colors.text}>
                      {item.title}
                    </ResponsiveText>
                    <ResponsiveView marginTop="xs">
                      <ResponsiveText size="sm" color={colors.textSecondary}>
                        {item.subtitle}
                      </ResponsiveText>
                    </ResponsiveView>
                  </ResponsiveView>
                </ResponsiveView>
                <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </ResponsiveView>
        </ResponsiveView>

        {/* Danger Zone */}
        <ResponsiveView style={styles.section}>
          <ResponsiveView marginBottom="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.error}>
              Danger Zone
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveView style={[styles.dangerCard, { 
            backgroundColor: colors.surface,
            borderColor: colors.error,
            ...Layout.shadows.sm
          }]}>
            <TouchableOpacity
              style={styles.dangerItem}
              onPress={handleDeleteAccount}
              activeOpacity={0.7}
            >
              <ResponsiveView style={styles.settingLeft}>
                <ResponsiveView style={[styles.dangerIcon, { backgroundColor: colors.error + '20' }]}>
                  <MaterialIcons name="delete-forever" size={24} color={colors.error} />
                </ResponsiveView>
                <ResponsiveView style={styles.settingText}>
                  <ResponsiveText size="md" weight="medium" color={colors.error}>
                    Delete Account
                  </ResponsiveText>
                  <ResponsiveView marginTop="xs">
                    <ResponsiveText size="sm" color={colors.textSecondary}>
                      Permanently delete your account and all data
                    </ResponsiveText>
                  </ResponsiveView>
                </ResponsiveView>
              </ResponsiveView>
              <MaterialIcons name="chevron-right" size={24} color={colors.error} />
            </TouchableOpacity>
          </ResponsiveView>
        </ResponsiveView>

        {/* App Version */}
        <ResponsiveView style={styles.versionSection}>
          <ResponsiveText size="sm" color={colors.textTertiary} align="center">
            Kitchen One App v1.0.0
          </ResponsiveText>
          <ResponsiveText size="xs" color={colors.textTertiary} align="center">
            Build 2024.01.15
          </ResponsiveText>
        </ResponsiveView>
      </ResponsiveView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Layout.spacing.lg,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    ...Layout.shadows.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: Layout.spacing.sm,
    padding: Layout.spacing.sm,
  },
  section: {
    marginBottom: Layout.spacing.lg,
  },
  settingsCard: {
    borderRadius: Layout.borderRadius.lg,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.sm,
  },
  settingText: {
    flex: 1,
  },
  settingRight: {
    marginLeft: Layout.spacing.sm,
  },
  dangerCard: {
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
  },
  dangerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.sm,
  },
  versionSection: {
    marginTop: Layout.spacing.xl,
    paddingVertical: Layout.spacing.md,
  },
});
