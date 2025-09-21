import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthForm from '../../components/auth/AuthForm';
import AuthHeader from '../../components/auth/AuthHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { commonRules, validateForm, ValidationErrors } from '../../utils/validation';

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor will be set dynamically by theme
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  form: {
    width: '100%',
  },
  backButton: {
    marginTop: 16,
    alignItems: 'center',
    padding: 8,
  },
  backButtonText: {
    // color will be set dynamically by theme
    fontSize: 14,
  },
  backButtonLink: {
    // color will be set dynamically by theme
    fontWeight: '600',
    fontFamily: 'PoppinsSemiBold',
  },
  checkmarkContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  checkmark: {
    width: 80,
    height: 80,
  },
  loader: {
    marginTop: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'PoppinsBold',
    // color will be set dynamically by theme
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    // color will be set dynamically by theme
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
});

export default function ResetPasswordScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { updatePassword, isLoading, error } = useAuth();
  const { token } = useLocalSearchParams<{ token?: string }>();

  useEffect(() => {
    // Check if we have a valid token when the component mounts
    if (!token) {
      router.replace('/(auth)/forgot-password');
    }
  }, [token]);

  const validationRules = {
    password: commonRules.password,
    confirmPassword: {
      ...commonRules.confirmPassword,
      custom: (value: string) => {
        if (formData.password && value !== formData.password) {
          return 'Passwords do not match';
        }
        return null;
      },
    },
  };

  const validateFormData = () => {
    const errors = validateForm(formData, validationRules);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleResetPassword = async () => {
    if (!validateFormData()) return;
    
    try {
      await updatePassword(formData.password);
      setIsSubmitted(true);
      
      // Auto-navigate to sign-in after a short delay
      setTimeout(() => {
        router.replace('/(auth)/sign-in');
      }, 2000);
    } catch (error) {
      // Error is handled by the useAuth hook
    }
  };

  if (isSubmitted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.contentContainer}>
          <View style={styles.checkmarkContainer}>
            <Image
              source={require('../../assets/images/checkmark-circle.png')}
              style={styles.checkmark}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Password Reset Successful</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Your password has been updated successfully. You'll be redirected to sign in shortly.
          </Text>
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.contentContainer}>
        <AuthHeader />

        <AuthForm error={error} style={styles.form}>
          <Input
            label="New Password"
            value={formData.password}
            onChangeText={(value: string) => handleInputChange('password', value)}
            placeholder="Enter new password (min 6 characters)"
            autoCapitalize="none"
            autoComplete="new-password"
            error={formErrors.password}
            fullWidth
            iconType="password"
            showPasswordToggle
          />

          <Input
            label="Confirm New Password"
            value={formData.confirmPassword}
            onChangeText={(value: string) => handleInputChange('confirmPassword', value)}
            placeholder="Confirm your new password"
            autoCapitalize="none"
            autoComplete="new-password"
            error={formErrors.confirmPassword}
            fullWidth
            iconType="password"
            showPasswordToggle
          />

          <Button
            title="Update Password"
            onPress={handleResetPassword}
            loading={isLoading}
            disabled={!formData.password || !formData.confirmPassword || isLoading}
            fullWidth
          />

          <View style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: colors.textSecondary }]}>
              <Text>Back to </Text>
              <Text style={[styles.backButtonLink, { color: colors.themedText }]} onPress={() => !isLoading && router.back()}>
                Sign In
              </Text>
            </Text>
          </View>
        </AuthForm>
      </View>
    </SafeAreaView>
  );
}

