import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlert } from '../../components/ui/AlertProvider';
import Button from '../../components/ui/Button';
import ResponsiveText from '../../components/ui/ResponsiveText';
import ResponsiveView from '../../components/ui/ResponsiveView';
import Layout from '../../constants/Layout';
import { useTheme } from '../../contexts/ThemeContext';
import global from '../../styles/global';

interface SettingsItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  type: 'switch' | 'navigation';
  value?: boolean;
  onPress?: () => void;
}

export default function DeliverySettingsScreen() {
  const { colors } = useTheme();
  const { confirm, confirmDestructive, success, info, error: showError } = useAlert();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: false,
    locationServices: true,
    soundEnabled: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('deliverySettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: typeof settings) => {
    try {
      await AsyncStorage.setItem('deliverySettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      showError('Error', 'Failed to save settings. Please try again.');
    }
  };

  const handleToggleSetting = async (key: keyof typeof settings) => {
    const newValue = !settings[key];
    await saveSettings({ ...settings, [key]: newValue });
    
    if (key === 'locationServices' && newValue) {
      info(
        'Location Services',
        'Location services are required for delivery tracking and order assignment.'
      );
    }
  };

  const settingsItems: SettingsItem[] = [
    {
      id: 'notifications',
      title: 'Push Notifications',
      subtitle: 'Receive order updates and notifications',
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
      subtitle: 'Allow location access for deliveries',
      icon: 'location-on',
      type: 'switch',
      value: settings.locationServices,
    },
    {
      id: 'sound',
      title: 'Sound Alerts',
      subtitle: 'Enable sound for new orders',
      icon: 'volume-up',
      type: 'switch',
      value: settings.soundEnabled,
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      subtitle: 'Read our privacy policy',
      icon: 'shield-checkmark',
      type: 'navigation',
      onPress: () => router.push('/(delivery)/terms-privacy'),
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      subtitle: 'Read our terms of service',
      icon: 'document-text',
      type: 'navigation',
      onPress: () => router.push('/(delivery)/terms-privacy'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: 'help-circle-outline',
      type: 'navigation',
      onPress: () => router.push('/(delivery)/help-support'),
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
    <View style={[global.screen, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top }}
      >
        {/* Header */}
        <ResponsiveView 
          style={[styles.header, { backgroundColor: colors.surface }]}
          flexDirection="row"
          alignItems="center"
          paddingHorizontal="lg"
          paddingVertical="md"
        >
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ResponsiveView marginLeft="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              Settings
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>

        <ResponsiveView padding="lg">
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
              {settingsItems.filter(item => ['location', 'sound'].includes(item.id)).map((item, index) => (
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

          {/* Legal & Support */}
          <ResponsiveView style={styles.section}>
            <ResponsiveView marginBottom="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Legal & Support
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveView style={[styles.settingsCard, { 
              backgroundColor: colors.surface,
              ...Layout.shadows.sm
            }]}>
              {settingsItems.filter(item => ['privacy', 'terms', 'help'].includes(item.id)).map((item, index) => (
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

          {/* App Version */}
          <ResponsiveView style={styles.versionSection}>
            <ResponsiveText size="sm" color={colors.textTertiary} align="center">
              Kitchen One Delivery App v1.0.0
            </ResponsiveText>
            <ResponsiveText size="xs" color={colors.textTertiary} align="center">
              Build 2024.12.15
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: Layout.spacing.sm,
    marginLeft: -Layout.spacing.sm,
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
  versionSection: {
    marginTop: Layout.spacing.xl,
    paddingVertical: Layout.spacing.md,
  },
});

