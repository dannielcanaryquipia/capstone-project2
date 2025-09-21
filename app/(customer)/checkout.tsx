import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/ui/Button';
import { ResponsiveText } from '../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../components/ui/ResponsiveView';
import Layout from '../../constants/Layout';
import { useTheme } from '../../contexts/ThemeContext';

export default function CheckoutScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ResponsiveView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
          Checkout
        </ResponsiveText>
        <View style={{ width: 24 }} />
      </ResponsiveView>

      <ScrollView style={styles.content}>
        <ResponsiveView style={styles.comingSoonContainer}>
          <MaterialIcons name="shopping-cart" size={64} color={colors.primary} />
          <ResponsiveText size="xl" weight="bold" color={colors.text} style={styles.title}>
            Checkout Coming Soon
          </ResponsiveText>
          <ResponsiveText size="md" color={colors.textSecondary} style={styles.description}>
            We're working on an amazing checkout experience for you!
          </ResponsiveText>
        </ResponsiveView>
      </ScrollView>

      <ResponsiveView style={styles.footer}>
        <Button
          title="Continue Shopping"
          onPress={() => router.push('/(customer)/(tabs)')}
          variant="primary"
          fullWidth
        />
      </ResponsiveView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  content: {
    flex: 1,
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.xl,
    paddingVertical: Layout.spacing.xxxl,
  },
  title: {
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
});
