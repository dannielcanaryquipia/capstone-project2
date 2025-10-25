import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAlert } from '../../../components/ui/AlertProvider';
import Button from '../../../components/ui/Button';
import ResponsiveText from '../../../components/ui/ResponsiveText';
import ResponsiveView from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import { useTheme } from '../../../contexts/ThemeContext';
import global from '../../../styles/global';

export default function HelpSupportScreen() {
  const { colors } = useTheme();
  const { info, confirm } = useAlert();
  const router = useRouter();

  const helpItems = [
    {
      id: 'faq',
      title: 'Frequently Asked Questions',
      subtitle: 'Find answers to common questions',
      icon: 'help-outline',
      onPress: () => {
        info('FAQ', 'FAQ section coming soon!');
      },
    },
    {
      id: 'contact',
      title: 'Contact Support',
      subtitle: 'Get help from our support team',
      icon: 'support-agent',
      onPress: () => {
        confirm(
          'Contact Support',
          'Choose how you\'d like to contact us:',
          () => Linking.openURL('mailto:support@kitchenone.com'),
          undefined,
          'Email',
          'Cancel'
        );
      },
    },
    {
      id: 'feedback',
      title: 'Send Feedback',
      subtitle: 'Share your thoughts and suggestions',
      icon: 'feedback',
      onPress: () => {
        info('Feedback', 'Feedback form coming soon!');
      },
    },
    {
      id: 'report',
      title: 'Report a Problem',
      subtitle: 'Report bugs or issues',
      icon: 'bug-report',
      onPress: () => {
        info('Report Problem', 'Problem reporting form coming soon!');
      },
    },
  ];

  const quickActions = [
    {
      id: 'order-help',
      title: 'Order Help',
      subtitle: 'Track orders, cancellations, refunds',
      icon: 'shopping-bag',
    },
    {
      id: 'delivery-help',
      title: 'Delivery Help',
      subtitle: 'Delivery times, addresses, drivers',
      icon: 'local-shipping',
    },
    {
      id: 'payment-help',
      title: 'Payment Help',
      subtitle: 'Billing, payment methods, refunds',
      icon: 'payment',
    },
    {
      id: 'account-help',
      title: 'Account Help',
      subtitle: 'Login, profile, settings',
      icon: 'account-circle',
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
              Help & Support
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>

        {/* Quick Actions */}
        <ResponsiveView style={styles.section}>
          <ResponsiveView marginBottom="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              Quick Help
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveView style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.quickActionItem, { backgroundColor: colors.surface }]}
                onPress={() => {
                  info(action.title, `${action.subtitle} - Coming soon!`);
                }}
                activeOpacity={0.7}
              >
                <ResponsiveView style={[styles.quickActionIcon, { backgroundColor: colors.surfaceVariant }]}>
                  <MaterialIcons name={action.icon as any} size={24} color={colors.primary} />
                </ResponsiveView>
                <ResponsiveView marginTop="xs">
                  <ResponsiveText size="sm" weight="medium" color={colors.text} align="center">
                    {action.title}
                  </ResponsiveText>
                </ResponsiveView>
              </TouchableOpacity>
            ))}
          </ResponsiveView>
        </ResponsiveView>

        {/* Support Options */}
        <ResponsiveView style={styles.section}>
          <ResponsiveView marginBottom="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              Get Support
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveView style={[styles.supportCard, { 
            backgroundColor: colors.surface,
            ...Layout.shadows.sm
          }]}>
            {helpItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.supportItem,
                  index < helpItems.length - 1 && { borderBottomColor: colors.border },
                ]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <ResponsiveView style={styles.supportLeft}>
                  <ResponsiveView style={[styles.supportIcon, { backgroundColor: colors.surfaceVariant }]}>
                    <MaterialIcons name={item.icon as any} size={24} color={colors.primary} />
                  </ResponsiveView>
                  <ResponsiveView style={styles.supportText}>
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

        {/* Contact Information */}
        <ResponsiveView style={styles.section}>
          <ResponsiveView marginBottom="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              Contact Information
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveView style={[styles.contactCard, { 
            backgroundColor: colors.surface,
            ...Layout.shadows.sm
          }]}>
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => Linking.openURL('https://www.facebook.com/profile.php?id=100076165180445')}
              activeOpacity={0.7}
            >
              <ResponsiveView style={[styles.contactIcon, { backgroundColor: colors.surfaceVariant }]}>
                <MaterialIcons name="facebook" size={20} color={colors.primary} />
              </ResponsiveView>
              <ResponsiveView marginLeft="sm">
                <ResponsiveText size="md" color={colors.text}>
                  Kitchen ONE
                </ResponsiveText>
              </ResponsiveView>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => Linking.openURL('tel:09094744215')}
              activeOpacity={0.7}
            >
              <ResponsiveView style={[styles.contactIcon, { backgroundColor: colors.surfaceVariant }]}>
                <MaterialIcons name="phone" size={20} color={colors.primary} />
              </ResponsiveView>
              <ResponsiveView marginLeft="sm">
                <ResponsiveText size="md" color={colors.text}>
                  09094744215
                </ResponsiveText>
              </ResponsiveView>
            </TouchableOpacity>
            <ResponsiveView style={styles.contactItem}>
              <ResponsiveView style={[styles.contactIcon, { backgroundColor: colors.surfaceVariant }]}>
                <MaterialIcons name="schedule" size={20} color={colors.primary} />
              </ResponsiveView>
              <ResponsiveView marginLeft="sm">
                <ResponsiveText size="md" color={colors.text}>
                  Mon-Fri: 9AM-6PM EST
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
          </ResponsiveView>
        </ResponsiveView>

        {/* Emergency Contact */}
        <ResponsiveView style={styles.emergencySection}>
          <ResponsiveView style={[styles.emergencyCard, { 
            backgroundColor: colors.warning + '20',
            borderLeftColor: colors.warning
          }]}>
            <MaterialIcons name="warning" size={24} color={colors.warning} />
            <ResponsiveView style={styles.emergencyText}>
              <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                Need immediate help?
              </ResponsiveText>
              <ResponsiveView marginTop="xs">
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  For urgent delivery issues, call our hotline
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
            <Button
              title="Call Now"
              onPress={() => Linking.openURL('tel:09094744215')}
              variant="primary"
              size="small"
            />
          </ResponsiveView>
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
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    width: '48%',
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
    ...Layout.shadows.sm,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportCard: {
    borderRadius: Layout.borderRadius.lg,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
  },
  supportLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  supportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.sm,
  },
  supportText: {
    flex: 1,
  },
  contactCard: {
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
  },
  contactIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.sm,
  },
  emergencySection: {
    marginTop: Layout.spacing.sm,
  },
  emergencyCard: {
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  emergencyText: {
    flex: 1,
    marginLeft: Layout.spacing.sm,
    marginRight: Layout.spacing.sm,
  },
});
