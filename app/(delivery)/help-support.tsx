import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlert } from '../../components/ui/AlertProvider';
import Button from '../../components/ui/Button';
import ResponsiveText from '../../components/ui/ResponsiveText';
import ResponsiveView from '../../components/ui/ResponsiveView';
import Layout from '../../constants/Layout';
import { useTheme } from '../../contexts/ThemeContext';
import global from '../../styles/global';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export default function DeliveryHelpSupportScreen() {
  const { colors } = useTheme();
  const { info, show } = useAlert();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const categories = ['All', 'Orders', 'Delivery', 'Earnings', 'Payment', 'Issues', 'Account'];

  const faqItems: FAQItem[] = [
    {
      id: 1,
      question: 'How do I accept a delivery order?',
      answer: 'When a new order is available, you\'ll receive a notification. Tap "Accept Delivery" to take the order. Make sure you\'re in the delivery area.',
      category: 'Orders',
    },
    {
      id: 2,
      question: 'How do I complete a delivery?',
      answer: 'After delivering the order to the customer, tap "Complete Delivery" in the order details. This will mark the order as delivered and update your earnings.',
      category: 'Delivery',
    },
    {
      id: 3,
      question: 'What if I can\'t find the customer\'s address?',
      answer: 'Contact the customer using the phone number provided in the order details. If you still can\'t locate them, contact support for assistance.',
      category: 'Delivery',
    },
    {
      id: 4,
      question: 'How do I track my earnings?',
      answer: 'Go to your profile to view your delivery statistics and earnings. Earnings are calculated based on completed deliveries and distance traveled.',
      category: 'Earnings',
    },
    {
      id: 5,
      question: 'What if a customer is not available?',
      answer: 'Try calling the customer first. If they don\'t respond, wait for 5 minutes then contact support. Do not leave the order unattended.',
      category: 'Delivery',
    },
    {
      id: 6,
      question: 'How do I report an issue with an order?',
      answer: 'Use the "Report Issue" option in the order details or contact support directly. Include the order number and describe the problem clearly.',
      category: 'Issues',
    },
    {
      id: 7,
      question: 'What payment methods do customers use?',
      answer: 'Customers can pay with cash on delivery, GCash, or other online payment methods. Always verify payment before completing delivery.',
      category: 'Payment',
    },
    {
      id: 8,
      question: 'How do I update my availability status?',
      answer: 'Your status is automatically set to "Available for Delivery" when you\'re online. You can go offline by signing out of the app.',
      category: 'Account',
    },
  ];

  const filteredFAQs = selectedCategory === 'All' 
    ? faqItems 
    : faqItems.filter(item => item.category === selectedCategory);

  const handleContactSupport = () => {
    show(
      'Contact Support',
      'Choose how you\'d like to contact us',
      [
        {
          text: 'Call Us',
          onPress: () => Linking.openURL('tel:+639094744215'),
          style: 'default',
        },
        {
          text: 'Message on FB Page',
          onPress: () => Linking.openURL('https://www.facebook.com/profile.php?id=100076165180445'),
          style: 'default',
        },
        {
          text: 'Live Chat',
          onPress: () => info('Live Chat', 'Live chat feature coming soon!'),
          style: 'default',
        },
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
      ]
    );
  };

  const handleReportIssue = () => {
    show(
      'Report Issue',
      'What type of issue are you experiencing?',
      [
        {
          text: 'Delivery Problem',
          onPress: () => Linking.openURL('https://www.facebook.com/profile.php?id=100076165180445'),
          style: 'default',
        },
        {
          text: 'App Problem',
          onPress: () => Linking.openURL('https://www.facebook.com/profile.php?id=100076165180445'),
          style: 'default',
        },
        {
          text: 'Payment Issue',
          onPress: () => Linking.openURL('https://www.facebook.com/profile.php?id=100076165180445'),
          style: 'default',
        },
        {
          text: 'Customer Issue',
          onPress: () => Linking.openURL('https://www.facebook.com/profile.php?id=100076165180445'),
          style: 'default',
        },
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
      ]
    );
  };

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
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
              Help & Support
            </ResponsiveText>
            <ResponsiveText size="sm" color={colors.textSecondary}>
              We're here to help you
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>

        <ResponsiveView padding="lg">
          {/* Quick Actions */}
          <ResponsiveView style={styles.section}>
            <ResponsiveView marginBottom="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Quick Actions
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveView style={[styles.quickActionsCard, { 
              backgroundColor: colors.surface,
              ...Layout.shadows.sm
            }]}>
              <TouchableOpacity
                style={styles.quickActionItem}
                onPress={handleContactSupport}
                activeOpacity={0.7}
              >
                <ResponsiveView style={[styles.quickActionIcon, { backgroundColor: colors.surfaceVariant }]}>
                  <MaterialIcons name="call" size={24} color={colors.primary} />
                </ResponsiveView>
                <ResponsiveView style={styles.quickActionText}>
                  <ResponsiveText size="md" weight="medium" color={colors.text}>
                    Contact Support
                  </ResponsiveText>
                  <ResponsiveView marginTop="xs">
                    <ResponsiveText size="sm" color={colors.textSecondary}>
                      Get help from our team
                    </ResponsiveText>
                  </ResponsiveView>
                </ResponsiveView>
                <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickActionItem, { borderTopColor: colors.border }]}
                onPress={handleReportIssue}
                activeOpacity={0.7}
              >
                <ResponsiveView style={[styles.quickActionIcon, { backgroundColor: colors.surfaceVariant }]}>
                  <MaterialIcons name="warning" size={24} color={colors.primary} />
                </ResponsiveView>
                <ResponsiveView style={styles.quickActionText}>
                  <ResponsiveText size="md" weight="medium" color={colors.text}>
                    Report an Issue
                  </ResponsiveText>
                  <ResponsiveView marginTop="xs">
                    <ResponsiveText size="sm" color={colors.textSecondary}>
                      Tell us about a problem
                    </ResponsiveText>
                  </ResponsiveView>
                </ResponsiveView>
                <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickActionItem, { borderTopColor: colors.border }]}
                onPress={() => info('Delivery Guide', 'Delivery guide coming soon!')}
                activeOpacity={0.7}
              >
                <ResponsiveView style={[styles.quickActionIcon, { backgroundColor: colors.surfaceVariant }]}>
                  <MaterialIcons name="delivery-dining" size={24} color={colors.primary} />
                </ResponsiveView>
                <ResponsiveView style={styles.quickActionText}>
                  <ResponsiveText size="md" weight="medium" color={colors.text}>
                    Delivery Guide
                  </ResponsiveText>
                  <ResponsiveView marginTop="xs">
                    <ResponsiveText size="sm" color={colors.textSecondary}>
                      Learn delivery best practices
                    </ResponsiveText>
                  </ResponsiveView>
                </ResponsiveView>
                <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
              </TouchableOpacity>
            </ResponsiveView>
          </ResponsiveView>

          {/* FAQ Section */}
          <ResponsiveView style={styles.section}>
            <ResponsiveView marginBottom="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Frequently Asked Questions
              </ResponsiveText>
            </ResponsiveView>

            {/* Category Filter */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
              contentContainerStyle={styles.categoryContainer}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: selectedCategory === category ? colors.primary : colors.surface,
                      borderColor: colors.border,
                    }
                  ]}
                  onPress={() => setSelectedCategory(category)}
                  activeOpacity={0.7}
                >
                  <ResponsiveText 
                    size="sm" 
                    weight={selectedCategory === category ? 'semiBold' : 'regular'}
                    color={selectedCategory === category ? colors.textInverse : colors.text}
                  >
                    {category}
                  </ResponsiveText>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* FAQ Items */}
            <ResponsiveView style={[styles.faqCard, { 
              backgroundColor: colors.surface,
              ...Layout.shadows.sm
            }]}>
              {filteredFAQs.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.faqItem,
                    index < filteredFAQs.length - 1 && { borderBottomColor: colors.border },
                  ]}
                  onPress={() => toggleFAQ(item.id)}
                  activeOpacity={0.7}
                >
                  <ResponsiveView style={styles.faqQuestion}>
                    <ResponsiveText size="md" weight="medium" color={colors.text} style={{ flex: 1 }}>
                      {item.question}
                    </ResponsiveText>
                    <MaterialIcons 
                      name={expandedFAQ === item.id ? 'expand-less' : 'expand-more'} 
                      size={24} 
                      color={colors.textTertiary} 
                    />
                  </ResponsiveView>
                  {expandedFAQ === item.id && (
                    <ResponsiveView marginTop="sm">
                      <ResponsiveText size="sm" color={colors.textSecondary}>
                        {item.answer}
                      </ResponsiveText>
                    </ResponsiveView>
                  )}
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
                onPress={() => Linking.openURL('tel:+639094744215')}
                activeOpacity={0.7}
              >
                <ResponsiveView style={[styles.contactIcon, { backgroundColor: colors.surfaceVariant }]}>
                  <MaterialIcons name="call" size={20} color={colors.primary} />
                </ResponsiveView>
                <ResponsiveView marginLeft="sm">
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    Phone:
                  </ResponsiveText>
                  <ResponsiveText size="md" color={colors.text}>
                    +63 909 474 4215
                  </ResponsiveText>
                </ResponsiveView>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.contactItem, { borderTopColor: colors.border }]}
                onPress={() => Linking.openURL('https://www.facebook.com/profile.php?id=100076165180445')}
                activeOpacity={0.7}
              >
                <ResponsiveView style={[styles.contactIcon, { backgroundColor: colors.surfaceVariant }]}>
                  <MaterialIcons name="facebook" size={20} color={colors.primary} />
                </ResponsiveView>
                <ResponsiveView marginLeft="sm">
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    Facebook:
                  </ResponsiveText>
                  <ResponsiveText size="md" color={colors.text}>
                    Kitchen One
                  </ResponsiveText>
                </ResponsiveView>
              </TouchableOpacity>

              <ResponsiveView style={[styles.contactItem, { borderTopColor: colors.border }]}>
                <ResponsiveView style={[styles.contactIcon, { backgroundColor: colors.surfaceVariant }]}>
                  <MaterialIcons name="schedule" size={20} color={colors.primary} />
                </ResponsiveView>
                <ResponsiveView marginLeft="sm">
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    Hours:
                  </ResponsiveText>
                  <ResponsiveText size="md" color={colors.text}>
                    6:00 AM - 12:00 AM
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>

              <ResponsiveView style={[styles.contactItem, { borderTopColor: colors.border }]}>
                <ResponsiveView style={[styles.contactIcon, { backgroundColor: colors.surfaceVariant }]}>
                  <MaterialIcons name="location-on" size={20} color={colors.primary} />
                </ResponsiveView>
                <ResponsiveView marginLeft="sm">
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    Office:
                  </ResponsiveText>
                  <ResponsiveText size="md" color={colors.text}>
                    San Vicente, Bulan, Sorsogon, Philippines
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>
            </ResponsiveView>
          </ResponsiveView>

          {/* Emergency Contact */}
          <ResponsiveView style={styles.section}>
            <ResponsiveView style={[styles.emergencyCard, { 
              backgroundColor: colors.warning + '20',
              borderLeftColor: colors.warning
            }]}>
              <MaterialIcons name="warning" size={24} color={colors.warning} />
              <ResponsiveView style={styles.emergencyText}>
                <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                  Emergency Contact
                </ResponsiveText>
                <ResponsiveView marginTop="xs">
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    Emergency: +63 909 474 4215
                  </ResponsiveText>
                  <ResponsiveView marginTop="xs">
                    <ResponsiveText size="xs" color={colors.textTertiary}>
                      Use this number for urgent delivery issues, safety concerns, or accidents.
                    </ResponsiveText>
                  </ResponsiveView>
                </ResponsiveView>
              </ResponsiveView>
              <Button
                title="Call"
                onPress={() => Linking.openURL('tel:+639094744215')}
                variant="primary"
                size="small"
              />
            </ResponsiveView>
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
  quickActionsCard: {
    borderRadius: Layout.borderRadius.lg,
  },
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    borderTopWidth: 1,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.sm,
  },
  quickActionText: {
    flex: 1,
  },
  categoryScroll: {
    marginBottom: Layout.spacing.md,
  },
  categoryContainer: {
    paddingRight: Layout.spacing.md,
  },
  categoryChip: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.pill,
    borderWidth: 1,
    marginRight: Layout.spacing.sm,
  },
  faqCard: {
    borderRadius: Layout.borderRadius.lg,
  },
  faqItem: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactCard: {
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
    borderTopWidth: 1,
  },
  contactIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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

