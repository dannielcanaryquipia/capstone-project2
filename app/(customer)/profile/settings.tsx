import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import Button from '../../../components/ui/Button';
import ResponsiveText from '../../../components/ui/ResponsiveText';
import ResponsiveView from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import { useTheme } from '../../../contexts/ThemeContext';
import global from '../../../styles/global';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const settingsItems = [
    {
      id: 'notifications',
      title: 'Push Notifications',
      subtitle: 'Receive order updates and promotions',
      icon: 'notifications',
      type: 'switch',
      value: true,
    },
    {
      id: 'email',
      title: 'Email Notifications',
      subtitle: 'Receive updates via email',
      icon: 'email',
      type: 'switch',
      value: false,
    },
    {
      id: 'location',
      title: 'Location Services',
      subtitle: 'Allow location access for delivery',
      icon: 'location-on',
      type: 'switch',
      value: true,
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      subtitle: 'View our privacy policy',
      icon: 'privacy-tip',
      type: 'navigation',
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      subtitle: 'View terms and conditions',
      icon: 'description',
      type: 'navigation',
    },
  ];

  const handleSettingPress = (item: any) => {
    if (item.type === 'navigation') {
      // TODO: Implement navigation to respective pages
      console.log(`Navigate to ${item.id}`);
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

        {/* Settings Content */}
        <ResponsiveView style={styles.content}>
          <ResponsiveView style={[styles.settingsCard, { 
            backgroundColor: colors.surface,
            ...Layout.shadows.sm
          }]}>
            {settingsItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.settingItem,
                  index < settingsItems.length - 1 && { borderBottomColor: colors.border },
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
                  {item.type === 'switch' ? (
                    <Switch
                      value={item.value}
                      onValueChange={(value) => {
                        // TODO: Implement setting toggle
                        console.log(`${item.id} toggled to ${value}`);
                      }}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor={item.value ? colors.white : colors.textTertiary}
                    />
                  ) : (
                    <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
                  )}
                </ResponsiveView>
              </TouchableOpacity>
            ))}
          </ResponsiveView>
        </ResponsiveView>

        {/* App Version */}
        <ResponsiveView style={styles.versionSection}>
          <ResponsiveText size="sm" color={colors.textTertiary} align="center">
            Kitchen One App v1.0.0
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
  content: {
    flex: 1,
  },
  settingsCard: {
    borderRadius: Layout.borderRadius.lg,
    marginBottom: Layout.spacing.md,
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
