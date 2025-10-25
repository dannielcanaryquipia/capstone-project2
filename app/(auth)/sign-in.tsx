import { router } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { useFormValidation } from '../../hooks/useFormValidation';
import global from '../../styles/global';
import { commonRules } from '../../utils/validation';

export default function SignInScreen() {
  const { colors } = useTheme();
  const { signIn, isLoading, error } = useAuth();

  const validationRules = useMemo(() => ({
    email: commonRules.email,
    password: commonRules.password,
  }), []);

  const {
    formData,
    formErrors,
    updateField,
    validateFormData,
    isFormValid,
  } = useFormValidation(
    { email: '', password: '' },
    { rules: validationRules, debounceMs: 300 }
  );

  const handleSignIn = useCallback(async () => {
    if (!validateFormData()) return;
    
    try {
      await signIn(formData.email, formData.password);
    } catch (error) {
      // Error is handled by the useAuth hook
    }
  }, [formData.email, formData.password, validateFormData, signIn]);

  const isButtonDisabled = useMemo(() => {
    return !formData.email || !formData.password || isLoading || !isFormValid;
  }, [formData.email, formData.password, isLoading, isFormValid]);

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
                label={Strings.emailLabel}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={formData.email}
                onChangeText={(value) => updateField('email', value)}
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
                onChangeText={(value) => updateField('password', value)}
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
                disabled={isButtonDisabled}
                style={[global.button, isButtonDisabled && global.buttonDisabled]}
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
