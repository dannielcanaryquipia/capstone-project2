import { router } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthFooter from '../../components/auth/AuthFooter';
import AuthForm from '../../components/auth/AuthForm';
import AuthHeader from '../../components/auth/AuthHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Strings } from '../../constants/Strings';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useFormValidation } from '../../hooks/useFormValidation';
import global from '../../styles/global';
import { commonRules } from '../../utils/validation';

const createStyles = (colors: any) => StyleSheet.create({
  safeArea: { 
    flex: 1, 
    // backgroundColor will be set dynamically by theme
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20, // Extra padding at bottom for better scrolling
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 0 : 40,
    minHeight: '100%', // Ensure minimum height for proper scrolling
  },
  form: {
    flex: 1,
  },
});

export default function SignUpScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { signUp, isLoading, error } = useAuth();

  const validationRules = useMemo(() => ({
    fullName: commonRules.fullName,
    email: commonRules.email,
    password: commonRules.password,
    confirmPassword: {
      ...commonRules.confirmPassword,
      custom: (value: string) => {
        // This will be updated when password changes
        return null;
      },
    },
    phone: commonRules.phone,
  }), []);

  const {
    formData,
    formErrors,
    updateField,
    validateFormData,
    isFormValid,
  } = useFormValidation(
    { email: '', password: '', confirmPassword: '', fullName: '', phone: '' },
    { rules: validationRules, debounceMs: 300 }
  );

  // Update confirmPassword validation when password changes
  const handlePasswordChange = useCallback((value: string) => {
    updateField('password', value);
    // Re-validate confirmPassword if it has a value
    if (formData.confirmPassword) {
      const confirmPasswordError = formData.confirmPassword !== value ? 'Passwords do not match' : '';
      // This will be handled by the validation system
    }
  }, [updateField, formData.confirmPassword]);

  const handleSignUp = useCallback(async () => {
    if (!validateFormData()) return;
    
    try {
      await signUp(formData.email, formData.password, formData.fullName, formData.phone);
      // Success handling is done in the useAuth hook
    } catch (error) {
      // Error is handled by the useAuth hook
    }
  }, [formData.email, formData.password, formData.fullName, formData.phone, validateFormData, signUp]);

  const isButtonDisabled = useMemo(() => {
    return !formData.email || !formData.password || !formData.confirmPassword || !formData.fullName || isLoading || !isFormValid;
  }, [formData.email, formData.password, formData.confirmPassword, formData.fullName, isLoading, isFormValid]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <AuthHeader />

            <AuthForm error={error} style={styles.form}>
              <Input
                label={Strings.fullNameLabel}
                value={formData.fullName}
                onChangeText={(value) => updateField('fullName', value)}
                placeholder="Enter your full name"
                autoCapitalize="words"
                error={formErrors.fullName}
                fullWidth
                iconType="person"
              />

              <Input
                label={Strings.emailLabel}
                value={formData.email}
                onChangeText={(value) => updateField('email', value)}
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
                onChangeText={handlePasswordChange}
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
                onChangeText={(value) => updateField('confirmPassword', value)}
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
                onChangeText={(value) => updateField('phone', value)}
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
                disabled={isButtonDisabled}
                style={[global.button, isButtonDisabled && global.buttonDisabled]}
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
