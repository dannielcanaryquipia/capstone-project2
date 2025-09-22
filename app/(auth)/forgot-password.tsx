import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthForm from '../../components/auth/AuthForm';
import AuthHeader from '../../components/auth/AuthHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useFormValidation } from '../../hooks/useFormValidation';
import { commonRules } from '../../utils/validation';

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
  emailText: {
    // color will be set dynamically by theme
    fontWeight: '600',
    fontFamily: 'PoppinsSemiBold',
  },
  instructionText: {
    fontSize: 14,
    // color will be set dynamically by theme
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
    // color will be set dynamically by theme
    marginBottom: 8,
    fontWeight: '500',
    fontFamily: 'PoppinsMedium',
  },
  input: {
    borderWidth: 1,
    // borderColor will be set dynamically by theme
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    // backgroundColor will be set dynamically by theme
    // color will be set dynamically by theme
  },
  inputError: {
    // borderColor will be set dynamically by theme
    // backgroundColor will be set dynamically by theme
  },
  button: {
    // backgroundColor will be set dynamically by theme
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
    color: '#000000', // Constant black for button text
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'PoppinsSemiBold',
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
  errorText: {
    // color will be set dynamically by theme
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

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword, isLoading, error } = useAuth();

  const validationRules = useMemo(() => ({
    email: commonRules.email,
  }), []);

  const {
    formData,
    formErrors,
    updateField,
    validateFormData,
    isFormValid,
  } = useFormValidation(
    { email: '' },
    { rules: validationRules, debounceMs: 300 }
  );

  const handleResetPassword = useCallback(async () => {
    if (!validateFormData()) return;
    
    try {
      await resetPassword(formData.email);
      setIsSubmitted(true);
    } catch (error) {
      // Error is handled by the useAuth hook
    }
  }, [formData.email, validateFormData, resetPassword]);

  const isButtonDisabled = useMemo(() => {
    return !formData.email || isLoading || !isFormValid;
  }, [formData.email, isLoading, isFormValid]);

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
          <Text style={[styles.title, { color: colors.text }]}>Check Your Email</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            We've sent a password reset link to {'\n'}
            <Text style={[styles.emailText, { color: colors.text }]}>{formData.email}</Text>
          </Text>
          <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
            If you don't see the email, check your spam folder or try again.
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.buttonFull, { backgroundColor: colors.primary }]}
            onPress={() => router.replace('/(auth)/sign-in')}
          >
            <Text style={styles.buttonText}>Back to Sign In</Text>
          </TouchableOpacity>
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
            label="Email Address"
            value={formData.email}
            onChangeText={(value: string) => updateField('email', value)}
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
            disabled={isButtonDisabled}
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

