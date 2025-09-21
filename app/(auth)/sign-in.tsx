import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthFooter from '../../components/auth/AuthFooter';
import AuthForm from '../../components/auth/AuthForm';
import AuthHeader from '../../components/auth/AuthHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Layout from '../../constants/Layout';
import { Strings } from '../../constants/Strings';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import global from '../../styles/global';
import { commonRules, validateForm, ValidationErrors } from '../../utils/validation';

export default function SignInScreen() {
  const { colors } = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  const { signIn, isLoading, error } = useAuth();

  const validationRules = {
    email: commonRules.email,
    password: commonRules.password,
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

  const handleSignIn = async () => {
    if (!validateFormData()) return;
    
    try {
      await signIn(formData.email, formData.password);
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
            label={Strings.emailLabel}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            error={formErrors.email}
            fullWidth
            iconType="email"
          />

          <Input
            label={Strings.passwordLabel}
            placeholder="Enter your password"
            autoCapitalize="none"
            autoComplete="current-password"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            error={formErrors.password}
            fullWidth
            iconType="password"
            showPasswordToggle
          />

          <View style={styles.forgotPasswordContainer}>
            <Text 
              style={[styles.forgotPasswordText, { color: colors.themedText }]}
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              {Strings.forgotPasswordCta}
            </Text>
          </View>

          <Button
            title={Strings.signInCta}
            onPress={handleSignIn}
            loading={isLoading}
            disabled={!formData.email || !formData.password || isLoading}
            style={[global.button, (!formData.email || !formData.password) && global.buttonDisabled]}
            fullWidth
          />

          <AuthFooter
            primaryText={Strings.dontHaveAccount}
            linkText={Strings.signUpTitle}
            onLinkPress={() => router.push('/(auth)/sign-up' as any)}
            disabled={isLoading}
          />
        </AuthForm>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: 4,
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: Layout.fontWeight.medium,
    fontFamily: Layout.fontFamily.medium,
  },
});
