import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAlert } from '../../../components/ui/AlertProvider';
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

type ThemeMode = 'light' | 'dark' | 'system';

export default function SettingsScreen() {
  const { colors, mode, setTheme } = useTheme();
  const { confirm, confirmDestructive, success, info, error: showError } = useAlert();
  const router = useRouter();
  const [settings, setSettings] = useState({
    locationServices: true,
    darkMode: false,
    autoSaveAddresses: true,
  });
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);

  useEffect(() => {
    loadSettings();
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      // Check location permission status
      try {
        const locationStatus = await Location.getForegroundPermissionsAsync();
        const locationEnabled = locationStatus.granted;
        setSettings(prev => ({ ...prev, locationServices: locationEnabled }));
      } catch (error) {
        console.error('Error checking location permissions:', error);
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('userSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
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
      showError('Error', 'Failed to save settings. Please try again.');
    }
  };

  const handleToggleSetting = async (key: keyof typeof settings) => {
    const newValue = !settings[key];
    setIsLoadingPermissions(true);

    try {
      if (key === 'locationServices') {
        if (newValue) {
          // Request location permissions
          const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
          let finalStatus = existingStatus;
          
          if (existingStatus !== 'granted') {
            const { status } = await Location.requestForegroundPermissionsAsync();
            finalStatus = status;
          }
          
          if (finalStatus === 'granted') {
            // Note: This toggle saves your preference. Location services on your device
            // are controlled by the permission you grant, not by this toggle.
            await saveSettings({ ...settings, locationServices: true });
            success('Success', 'Location permission granted');
            info(
              'Location Services',
              'Location services help us provide accurate delivery estimates and find nearby restaurants. Your device location is now accessible when the app needs it.'
            );
          } else {
            await saveSettings({ ...settings, locationServices: false });
            showError('Permission Denied', 'Location permission was denied. Please enable it in your device settings to use location features.');
          }
        } else {
          // Disable location services preference
          // Note: This only saves your preference. To fully disable location,
          // you need to revoke the permission in your device settings.
          await saveSettings({ ...settings, locationServices: false });
          info(
            'Location Services',
            'Location preference disabled. To fully disable location access, please revoke the permission in your device settings.'
          );
        }
      } else if (key === 'autoSaveAddresses') {
        // Auto-save addresses is a preference toggle only
        // It doesn't directly modify addresses in the database.
        // This setting controls whether addresses should be automatically saved
        // when entered in forms (implementation depends on form logic).
        await saveSettings({ ...settings, autoSaveAddresses: newValue });
        success('Success', `Auto-save addresses ${newValue ? 'enabled' : 'disabled'}`);
      } else {
        // For other settings (darkMode), just save locally
        await saveSettings({ ...settings, [key]: newValue });
      }
    } catch (error) {
      console.error('Error toggling setting:', error);
      showError('Error', 'Failed to update setting. Please try again.');
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  const handlePrivacyPolicy = () => {
    info(
      'Privacy Policy',
      'This will open our privacy policy'
    );
  };

  const handleTermsOfService = () => {
    info(
      'Terms of Service',
      'This will open our terms of service'
    );
  };

  const handleDataExport = () => {
    confirm(
      'Export Data',
      'You can request a copy of all your data including orders, addresses, and preferences. This will be sent to your registered email address.',
      () => {
        success('Success', 'Data export request submitted. You will receive an email within 24 hours.');
      },
      undefined,
      'Request Export',
      'Cancel'
    );
  };

  const handleDeleteAccount = () => {
    info(
      'Account Deletion',
      'Account deletion feature is coming soon. Please contact support if you need to delete your account.'
    );
  };

  const handleThemeChange = async (newMode: ThemeMode) => {
    try {
      await setTheme(newMode);
      success('Success', `Theme changed to ${newMode === 'system' ? 'System' : newMode === 'light' ? 'Light' : 'Dark'} mode`);
    } catch (error) {
      console.error('Error changing theme:', error);
      showError('Error', 'Failed to change theme. Please try again.');
    }
  };

  const themeOptions: { value: ThemeMode; label: string; subtitle: string; icon: string }[] = [
    {
      value: 'system',
      label: 'System',
      subtitle: 'Follow device theme',
      icon: 'brightness-auto',
    },
    {
      value: 'light',
      label: 'Light',
      subtitle: 'Always use light mode',
      icon: 'wb-sunny',
    },
    {
      value: 'dark',
      label: 'Dark',
      subtitle: 'Always use dark mode',
      icon: 'brightness-2',
    },
  ];

  const settingsItems: SettingsItem[] = [
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
      // Map item IDs to actual settings keys
      const idToKeyMap: Record<string, keyof typeof settings> = {
        'location': 'locationServices',
        'autoSave': 'autoSaveAddresses',
      };
      
      const settingKey = idToKeyMap[item.id];
      if (settingKey) {
        handleToggleSetting(settingKey);
      }
    }
  };

  return (
    <SafeAreaView style={[global.screen, { backgroundColor: colors.background }]}>
      <ScrollView style={{ flex: 1 }}>
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

        {/* Appearance Settings */}
        <ResponsiveView style={styles.section}>
          <ResponsiveView marginBottom="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              Appearance
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveView style={[styles.settingsCard, { 
            backgroundColor: colors.surface,
            ...Layout.shadows.sm
          }]}>
            {themeOptions.map((option, index) => {
              const isSelected = mode === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.themeOption,
                    index < themeOptions.length - 1 && { borderBottomColor: colors.border },
                  ]}
                  onPress={() => handleThemeChange(option.value)}
                  activeOpacity={0.7}
                >
                  <ResponsiveView style={styles.settingLeft}>
                    <ResponsiveView style={[styles.settingIcon, { backgroundColor: colors.surfaceVariant }]}>
                      <MaterialIcons name={option.icon as any} size={24} color={colors.primary} />
                    </ResponsiveView>
                    <ResponsiveView style={styles.settingText}>
                      <ResponsiveText size="md" weight="medium" color={colors.text}>
                        {option.label}
                      </ResponsiveText>
                      <ResponsiveView marginTop="xs">
                        <ResponsiveText size="sm" color={colors.textSecondary}>
                          {option.subtitle}
                        </ResponsiveText>
                      </ResponsiveView>
                    </ResponsiveView>
                  </ResponsiveView>
                  <ResponsiveView style={styles.settingRight}>
                    {isSelected ? (
                      <MaterialIcons name="radio-button-checked" size={24} color={colors.primary} />
                    ) : (
                      <MaterialIcons name="radio-button-unchecked" size={24} color={colors.textTertiary} />
                    )}
                  </ResponsiveView>
                </TouchableOpacity>
              );
            })}
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
            Build 2025.07.04
          </ResponsiveText>
        </ResponsiveView>
        </ResponsiveView>
      </ScrollView>
    </SafeAreaView>
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
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
  },
});
