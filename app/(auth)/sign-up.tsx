import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Text from '../../components/ui/Text';
import { Strings } from '../../constants/Strings';
import { useAuth } from '../../hooks/useAuth';
import global from '../../styles/global';

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
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { signUp, isLoading, error } = useAuth();

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
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
    if (!validateForm()) return;
    
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
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text variant="h2" align="center">{Strings.appName.toUpperCase()}</Text>
          <Text align="center" color="#6B7280">{Strings.appTagline}</Text>
        </View>

        {/* Decorative/banner image in the form area */}
        <Image source={require('../../assets/images/checkmark-circle.png')} style={global.heroIllustration} resizeMode="contain" />

        <View style={[styles.form, global.card]}> 
          {error ? (
            <View style={styles.errorContainer}>
              <Text color="#DC2626">{error}</Text>
            </View>
          ) : null}

          <Input
            label={Strings.fullNameLabel}
            value={formData.fullName}
            onChangeText={(t) => handleInputChange('fullName', t)}
            placeholder="Enter your full name"
            autoCapitalize="words"
            leftIcon={<MaterialIcons name="person-outline" size={20} color="#9CA3AF" />}
            error={formErrors.fullName}
            fullWidth
          />

          <Input
            label={Strings.emailLabel}
            value={formData.email}
            onChangeText={(t) => handleInputChange('email', t)}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            leftIcon={<MaterialIcons name="alternate-email" size={20} color="#9CA3AF" />}
            error={formErrors.email}
            fullWidth
          />

          <Input
            label={Strings.passwordLabel}
            value={formData.password}
            onChangeText={(t) => handleInputChange('password', t)}
            placeholder="Create a password (min 6 characters)"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            leftIcon={<MaterialIcons name="lock-outline" size={20} color="#9CA3AF" />}
            error={formErrors.password}
            fullWidth
          />

          <Input
            label={Strings.confirmPasswordLabel}
            value={formData.confirmPassword}
            onChangeText={(t) => handleInputChange('confirmPassword', t)}
            placeholder="Confirm your password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            leftIcon={<MaterialIcons name="lock" size={20} color="#9CA3AF" />}
            error={formErrors.confirmPassword}
            fullWidth
          />

          <Input
            label={`${Strings.phoneLabel} ${Strings.optional}`}
            value={formData.phone}
            onChangeText={(t) => handleInputChange('phone', t)}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            leftIcon={<MaterialIcons name="phone" size={20} color="#9CA3AF" />}
            fullWidth
          />

          <Button
            title={Strings.signUpCta}
            onPress={handleSignUp}
            loading={isLoading}
            disabled={!formData.email || !formData.password || !formData.confirmPassword || !formData.fullName}
            style={[global.button, (!formData.email || !formData.password || !formData.confirmPassword || !formData.fullName) && global.buttonDisabled]}
            fullWidth
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              {Strings.alreadyHaveAccount}{' '}
              <Text style={styles.loginLink} onPress={() => !isLoading && router.replace('/(auth)/sign-in')}>
                {Strings.signInTitle}
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
