import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthForm from '../../components/auth/AuthForm';
import AuthHeader from '../../components/auth/AuthHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../hooks/useAuth';
import { commonRules, validateForm, ValidationErrors } from '../../utils/validation';

export default function ResetPasswordScreen() {
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
      <SafeAreaView style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.checkmarkContainer}>
            <Image
              source={require('../../assets/images/checkmark-circle.png')}
              style={styles.checkmark}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Password Reset Successful</Text>
          <Text style={styles.subtitle}>
            Your password has been updated successfully. You'll be redirected to sign in shortly.
          </Text>
          <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
            <Text style={styles.backButtonText}>
              <Text>Back to </Text>
              <Text style={[styles.backButtonLink, { color: Colors.black }]} onPress={() => !isLoading && router.back()}>
                Sign In
              </Text>
            </Text>
          </View>
        </AuthForm>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    color: '#6B7280',
    fontSize: 14,
  },
  backButtonLink: {
    color: '#3B82F6',
    fontWeight: '600',
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
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
});
