import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Text from '../../components/ui/Text';
import { Strings } from '../../constants/Strings';
import { useAuth } from '../../hooks/useAuth';
import global from '../../styles/global';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, isLoading, error } = useAuth();

  const handleSignIn = async () => {
    if (!email || !password) return;
    try {
      await signIn(email, password);
    } catch {}
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text variant="h2" align="center">{Strings.appName.toUpperCase()}</Text>
          <Text align="center" color="#6B7280">{Strings.appTagline}</Text>
        </View>

        <View style={styles.form}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text color="#DC2626">{error}</Text>
            </View>
          ) : null}

          <Input
            label={Strings.emailLabel}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
            fullWidth
          />

          <Input
            label={Strings.passwordLabel}
            placeholder="Enter your password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
            value={password}
            onChangeText={setPassword}
            fullWidth
          />

          <View style={{ alignItems: 'flex-end', marginTop: 4 }}>
            <Text color="#4F46E5" onPress={() => router.push('/(auth)/forgot-password')}>{Strings.forgotPasswordCta}</Text>
          </View>

          <Button
            title={Strings.signInCta}
            onPress={handleSignIn}
            loading={isLoading}
            disabled={!email || !password}
            style={[global.button, (!email || !password) && global.buttonDisabled]}
            fullWidth
          />

          <View style={[global.divider]} />

          <View style={styles.footer}> 
            <Text>
              {Strings.dontHaveAccount} <Text color="#4F46E5" onPress={() => router.push('/(auth)/sign-up' as any)}>{Strings.signUpTitle}</Text>
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 0 : 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 24,
  },
  form: {
    flex: 1,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  // Footer styles
  footer: {
    marginTop: 'auto',
    marginBottom: 32,
    alignItems: 'center',
  },
  footerText: { color: '#6B7280', fontSize: 14 },
  linkText: { color: '#4F46E5', fontWeight: '600' },
  errorText: { color: '#DC2626', fontSize: 14, fontWeight: '500' },
});
