import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
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

type ThemeMode = 'light' | 'dark' | 'system';

export default function AdminSettingsScreen() {
  const { colors, mode, setTheme } = useTheme();
  const { success, error: showError } = useAlert();
  const router = useRouter();

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
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
  },
});

