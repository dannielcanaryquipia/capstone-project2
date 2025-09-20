import { router } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthForm from '../../components/auth/AuthForm';
import AuthHeader from '../../components/auth/AuthHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../hooks/useAuth';
import { commonRules, validateForm, ValidationErrors } from '../../utils/validation';

export default function ForgotPasswordScreen() {
  const [formData, setFormData] = useState({
    email: '',
  });
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword, isLoading, error } = useAuth();

  const validationRules = {
    email: commonRules.email,
  };

  const validateFormData = () => {
    const errors = validateForm(formData, validationRules);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleResetPassword = async () => {
    if (!validateFormData()) return;
    
    try {
      await resetPassword(formData.email);
      setIsSubmitted(true);
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
          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a password reset link to {'\n'}
            <Text style={styles.emailText}>{formData.email}</Text>
          </Text>
          <Text style={styles.instructionText}>
            If you don't see the email, check your spam folder or try again.
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.buttonFull]}
            onPress={() => router.replace('/(auth)/sign-in')}
          >
            <Text style={styles.buttonText}>Back to Sign In</Text>
          </TouchableOpacity>
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
            label="Email Address"
            value={formData.email}
            onChangeText={(value: string) => handleInputChange('email', value)}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={formErrors.email}
            fullWidth
            iconType="email"
          />

          <Button
            title="Send Reset Link"
            onPress={handleResetPassword}
            loading={isLoading}
            disabled={!formData.email || isLoading}
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
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
  emailText: {
    color: '#111827',
    fontWeight: '600',
  },
  instructionText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#111827',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  buttonFull: {
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  checkmarkContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  checkmark: {
    width: 80,
    height: 80,
  },
});
