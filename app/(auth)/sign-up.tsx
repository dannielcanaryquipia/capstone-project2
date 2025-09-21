import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
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

const createStyles = (colors: any) => StyleSheet.create({
  safeArea: { 
    flex: 1, 
    // backgroundColor will be set dynamically by theme
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 0 : 40,
  },
  form: {
    flex: 1,
  },
});

export default function SignUpScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <AuthHeader />

        <AuthForm error={error} style={styles.form}>
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
      </View>
    </SafeAreaView>
  );
}
