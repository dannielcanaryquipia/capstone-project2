import { router } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthFooter from '../../components/auth/AuthFooter';
import AuthForm from '../../components/auth/AuthForm';
import AuthHeader from '../../components/auth/AuthHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Strings } from '../../constants/Strings';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import global from '../../styles/global';
import { commonRules, validateForm, ValidationErrors } from '../../utils/validation';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  form: {
    width: '100%',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#111827',
  },
  inputError: {
    borderColor: '#F87171',
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#93C5FD',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    color: '#6B7280',
    marginHorizontal: 12,
    fontSize: 14,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  socialButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: '#6B7280',
    fontSize: 15,
  },
  loginLink: {
    color: '#3B82F6',
    fontWeight: '600',
    marginLeft: 4,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
});

export default function SignUpScreen() {
  const { colors } = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: ''
  });
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  const { signUp, isLoading, error } = useAuth();

  const validationRules = {
    fullName: commonRules.fullName,
    email: commonRules.email,
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
    phone: commonRules.phone,
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

  const handleSignUp = async () => {
    if (!validateFormData()) return;
    
    try {
      await signUp(formData.email, formData.password, formData.fullName, formData.phone);
      // Success handling is done in the useAuth hook
    } catch (error) {
      // Error is handled by the useAuth hook
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <AuthHeader />

        {/* Decorative/banner image in the form area */}
        <Image source={require('../../assets/images/checkmark-circle.png')} style={global.heroIllustration} resizeMode="contain" />

        <AuthForm error={error} style={[styles.form, global.card]}>
          <Input
            label={Strings.fullNameLabel}
            value={formData.fullName}
            onChangeText={(value) => handleInputChange('fullName', value)}
            placeholder="Enter your full name"
            autoCapitalize="words"
            error={formErrors.fullName}
            fullWidth
            iconType="person"
          />

          <Input
            label={Strings.emailLabel}
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={formErrors.email}
            fullWidth
            iconType="email"
          />

          <Input
            label={Strings.passwordLabel}
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            placeholder="Create a password (min 6 characters)"
            autoCapitalize="none"
            autoComplete="new-password"
            error={formErrors.password}
            fullWidth
            iconType="password"
            showPasswordToggle
          />

          <Input
            label={Strings.confirmPasswordLabel}
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
            placeholder="Confirm your password"
            autoCapitalize="none"
            autoComplete="new-password"
            error={formErrors.confirmPassword}
            fullWidth
            iconType="password"
            showPasswordToggle
          />

          <Input
            label={`${Strings.phoneLabel} ${Strings.optional}`}
            value={formData.phone}
            onChangeText={(value) => handleInputChange('phone', value)}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            error={formErrors.phone}
            fullWidth
            iconType="phone"
          />

          <Button
            title={Strings.signUpCta}
            onPress={handleSignUp}
            loading={isLoading}
            disabled={!formData.email || !formData.password || !formData.confirmPassword || !formData.fullName || isLoading}
            style={[global.button, (!formData.email || !formData.password || !formData.confirmPassword || !formData.fullName) && global.buttonDisabled]}
            fullWidth
          />


          <AuthFooter
            primaryText={Strings.alreadyHaveAccount}
            linkText={Strings.signInTitle}
            onLinkPress={() => !isLoading && router.replace('/(auth)/sign-in')}
            disabled={isLoading}
          />
        </AuthForm>
      </ScrollView>
    </SafeAreaView>
  );
}
