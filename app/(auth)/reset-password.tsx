import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { Text } from '../../components/ui/Text';

export default function ResetPasswordScreen() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { updatePassword } = useAuth();
  const { token } = useLocalSearchParams<{ token?: string }>();

  useEffect(() => {
    // Check if we have a valid token when the component mounts
    if (!token) {
      router.replace('/(auth)/forgot-password');
    }
  }, [token]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
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

  const handleResetPassword = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await updatePassword(formData.password);
      setIsSubmitted(true);
      
      // Auto-navigate to sign-in after a short delay
      setTimeout(() => {
        router.replace('/(auth)/sign-in');
      }, 2000);
    } catch (error) {
      // Error is handled by the useAuth hook
    } finally {
      setIsLoading(false);
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
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Create New Password</Text>
          <Text style={styles.subtitle}>
            Create a new password for your account
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={[
                styles.input,
                formErrors.password ? styles.inputError : null
              ]}
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
              placeholder="Enter new password (min 6 characters)"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              editable={!isLoading}
              onBlur={() => {
                if (formData.password) validateForm();
              }}
            />
            {formErrors.password && (
              <Text style={styles.errorText}>{formErrors.password}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={[
                styles.input,
                formErrors.confirmPassword ? styles.inputError : null
              ]}
              value={formData.confirmPassword}
              onChangeText={(text) => handleInputChange('confirmPassword', text)}
              placeholder="Confirm your new password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              editable={!isLoading}
              onSubmitEditing={handleResetPassword}
              returnKeyType="go"
              onBlur={() => {
                if (formData.confirmPassword) validateForm();
              }}
            />
            {formErrors.confirmPassword && (
              <Text style={styles.errorText}>{formErrors.confirmPassword}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              (isLoading || !formData.password || !formData.confirmPassword) && styles.buttonDisabled
            ]}
            onPress={handleResetPassword}
            disabled={isLoading || !formData.password || !formData.confirmPassword}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Update Password</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => !isLoading && router.back()}
            disabled={isLoading}
          >
            <Text style={styles.backButtonText}>
              <Text>Back to </Text>
              <Text style={styles.backButtonLink}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 32,
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
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
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
    marginTop: 8,
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
  loader: {
    marginTop: 24,
  },
});
