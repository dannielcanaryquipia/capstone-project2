import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ResponsiveText from '../../components/ui/ResponsiveText';
import ResponsiveView from '../../components/ui/ResponsiveView';
import Layout from '../../constants/Layout';
import { useTheme } from '../../contexts/ThemeContext';
import global from '../../styles/global';

interface ContentSection {
  title: string;
  content: string[];
}

export default function DeliveryTermsPrivacyScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');

  const termsContent: ContentSection[] = [
    {
      title: '1. Delivery Partner Agreement',
      content: [
        'By using KitchenOne as a delivery partner, you agree to provide reliable, professional delivery services to our customers. You must maintain a valid driver\'s license and appropriate vehicle insurance.',
        'You are responsible for ensuring your vehicle is in good working condition and meets all local safety requirements. Regular maintenance and safety checks are your responsibility.',
      ],
    },
    {
      title: '2. Order Acceptance and Delivery',
      content: [
        'You may accept or decline delivery requests based on your availability and location. Once accepted, you are committed to completing the delivery in a timely manner.',
        'Orders must be delivered within the estimated time frame. If you encounter delays, you must communicate with the customer and update the order status accordingly.',
        'You must verify the customer\'s identity and collect payment if required before completing the delivery.',
      ],
    },
    {
      title: '3. Customer Service Standards',
      content: [
        'Maintain professional behavior and appearance at all times. Treat customers with respect and courtesy.',
        'Handle food items carefully to maintain quality and temperature. Use appropriate delivery bags and containers.',
        'Communicate clearly with customers regarding delivery status, delays, or issues.',
      ],
    },
    {
      title: '4. Safety and Compliance',
      content: [
        'Follow all traffic laws and safety regulations. Your safety and the safety of others is our top priority.',
        'Do not use your phone while driving. Pull over safely if you need to check the app or make calls.',
        'Report any accidents, incidents, or safety concerns immediately to KitchenOne support.',
      ],
    },
    {
      title: '5. Earnings and Payments',
      content: [
        'Earnings are calculated based on delivery distance, time, and any applicable bonuses or incentives.',
        'Payments are processed weekly. You must provide accurate banking information for direct deposits.',
        'KitchenOne reserves the right to adjust earnings calculations based on service quality and customer feedback.',
      ],
    },
    {
      title: '6. Termination',
      content: [
        'Either party may terminate this agreement with written notice. KitchenOne may terminate immediately for violations of these terms.',
        'Upon termination, you must return any KitchenOne equipment or materials in your possession.',
        'You remain responsible for completing any accepted deliveries at the time of termination.',
      ],
    },
  ];

  const privacyContent: ContentSection[] = [
    {
      title: '1. Information We Collect',
      content: [
        'Personal Information: Name, phone number, email address, driver\'s license information, and vehicle details.',
        'Location Data: Real-time location tracking during active deliveries to provide accurate delivery updates.',
        'Delivery Data: Order details, delivery routes, customer interactions, and performance metrics.',
        'Device Information: Device type, operating system, app usage data, and crash reports.',
      ],
    },
    {
      title: '2. How We Use Your Information',
      content: [
        'Service Delivery: To assign deliveries, calculate earnings, and provide customer support.',
        'Safety and Security: To verify your identity, ensure compliance with safety standards, and investigate incidents.',
        'Performance Optimization: To improve delivery efficiency, route optimization, and service quality.',
        'Communication: To send important updates, earnings notifications, and service announcements.',
      ],
    },
    {
      title: '3. Information Sharing',
      content: [
        'Customers: Limited order information (name, vehicle description) for delivery identification.',
        'Service Providers: Payment processors, mapping services, and technical support partners.',
        'Legal Requirements: When required by law or to protect safety and security.',
        'Business Partners: Aggregated, anonymized data for service improvement.',
      ],
    },
    {
      title: '4. Data Security',
      content: [
        'We implement industry-standard security measures to protect your personal information.',
        'Location data is encrypted and only shared when necessary for service delivery.',
        'Access to your information is limited to authorized personnel and service providers.',
        'We regularly review and update our security practices to maintain data protection.',
      ],
    },
    {
      title: '5. Your Rights and Choices',
      content: [
        'Access: You can view and update your personal information through the app or by contacting support.',
        'Location Services: You can disable location tracking when not actively delivering, though this may affect service quality.',
        'Communication Preferences: You can opt out of non-essential communications while maintaining important service updates.',
        'Data Deletion: You may request deletion of your account and associated data, subject to legal retention requirements.',
      ],
    },
    {
      title: '6. Data Retention',
      content: [
        'Active Account: We retain your information while your account is active and for a reasonable period after.',
        'Legal Requirements: Some information may be retained longer to comply with legal obligations.',
        'Service History: Delivery history and earnings data are retained for tax and business purposes.',
        'Anonymized Data: Aggregated, anonymized data may be retained indefinitely for service improvement.',
      ],
    },
  ];

  const currentContent = activeTab === 'terms' ? termsContent : privacyContent;
  const introText = activeTab === 'terms'
    ? 'These Terms of Service govern your relationship with KitchenOne as a delivery partner. By using our platform, you agree to these terms and our delivery standards.'
    : 'This Privacy Policy explains how KitchenOne collects, uses, and protects your personal information as a delivery partner. We are committed to protecting your privacy and being transparent about our data practices.';

  return (
    <SafeAreaView style={[global.screen, { backgroundColor: colors.background }]} edges={['top']}>
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
            Terms & Privacy
          </ResponsiveText>
          <ResponsiveText size="sm" color={colors.textSecondary}>
            Legal information for delivery partners
          </ResponsiveText>
        </ResponsiveView>
      </ResponsiveView>

      {/* Tab Navigation */}
      <ResponsiveView 
        style={[styles.tabContainer, { backgroundColor: colors.surface }]}
        flexDirection="row"
        paddingHorizontal="lg"
      >
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'terms' && { borderBottomColor: colors.primary },
          ]}
          onPress={() => setActiveTab('terms')}
          activeOpacity={0.7}
        >
          <MaterialIcons 
            name="document-text" 
            size={20} 
            color={activeTab === 'terms' ? colors.primary : colors.textTertiary} 
          />
          <ResponsiveView marginLeft="xs">
            <ResponsiveText 
              size="md" 
              weight={activeTab === 'terms' ? 'semiBold' : 'regular'}
              color={activeTab === 'terms' ? colors.primary : colors.textTertiary}
            >
              Terms of Service
            </ResponsiveText>
          </ResponsiveView>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'privacy' && { borderBottomColor: colors.primary },
          ]}
          onPress={() => setActiveTab('privacy')}
          activeOpacity={0.7}
        >
          <MaterialIcons 
            name="shield-checkmark" 
            size={20} 
            color={activeTab === 'privacy' ? colors.primary : colors.textTertiary} 
          />
          <ResponsiveView marginLeft="xs">
            <ResponsiveText 
              size="md" 
              weight={activeTab === 'privacy' ? 'semiBold' : 'regular'}
              color={activeTab === 'privacy' ? colors.primary : colors.textTertiary}
            >
              Privacy Policy
            </ResponsiveText>
          </ResponsiveView>
        </TouchableOpacity>
      </ResponsiveView>

      {/* Content */}
      <ScrollView 
        style={{ flex: 1 }}
      >
        <ResponsiveView padding="lg">
          {/* Intro Card */}
          <ResponsiveView style={[styles.introCard, { 
            backgroundColor: colors.surface,
            ...Layout.shadows.sm
          }]}>
            <ResponsiveText size="md" color={colors.text}>
              {introText}
            </ResponsiveText>
          </ResponsiveView>

          {/* Content Sections */}
          {currentContent.map((section, index) => (
            <ResponsiveView 
              key={index} 
              style={[styles.sectionCard, { 
                backgroundColor: colors.surface,
                ...Layout.shadows.sm
              }]}
            >
              <ResponsiveView marginBottom="sm">
                <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                  {section.title}
                </ResponsiveText>
              </ResponsiveView>
              {section.content.map((paragraph, pIndex) => (
                <ResponsiveView key={pIndex} marginTop="sm">
                  <ResponsiveText size="md" color={colors.textSecondary}>
                    {paragraph}
                  </ResponsiveText>
                </ResponsiveView>
              ))}
            </ResponsiveView>
          ))}

          {/* Contact Information */}
          <ResponsiveView style={[styles.contactCard, { 
            backgroundColor: colors.surface,
            ...Layout.shadows.sm
          }]}>
            <ResponsiveView marginBottom="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Contact Us
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveView marginBottom="sm">
              <ResponsiveText size="md" color={colors.textSecondary}>
                If you have questions about these Terms of Service or Privacy Policy, please contact us:
              </ResponsiveText>
            </ResponsiveView>

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
                  Kitchen One
                </ResponsiveText>
              </ResponsiveView>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.contactItem, { borderTopColor: colors.border }]}
              onPress={() => Linking.openURL('tel:+639094744215')}
              activeOpacity={0.7}
            >
              <ResponsiveView style={[styles.contactIcon, { backgroundColor: colors.surfaceVariant }]}>
                <MaterialIcons name="call" size={20} color={colors.primary} />
              </ResponsiveView>
              <ResponsiveView marginLeft="sm">
                <ResponsiveText size="md" color={colors.text}>
                  +63 909 474 4215
                </ResponsiveText>
              </ResponsiveView>
            </TouchableOpacity>

            <ResponsiveView style={[styles.contactItem, { borderTopColor: colors.border }]}>
              <ResponsiveView style={[styles.contactIcon, { backgroundColor: colors.surfaceVariant }]}>
                <MaterialIcons name="location-on" size={20} color={colors.primary} />
              </ResponsiveView>
              <ResponsiveView marginLeft="sm">
                <ResponsiveText size="md" color={colors.text}>
                  San Vicente, Bulan, Sorsogon, Philippines
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
          </ResponsiveView>

          {/* Footer */}
          <ResponsiveView style={styles.footer}>
            <ResponsiveText size="sm" color={colors.textTertiary} align="center">
              Last updated: December 2024
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
      </ScrollView>
    </SafeAreaView>
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
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  introCard: {
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  sectionCard: {
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  contactCard: {
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginTop: Layout.spacing.md,
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
  footer: {
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.xl,
  },
});

