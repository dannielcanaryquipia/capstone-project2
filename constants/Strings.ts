// Design System: String constants used across the app

export const Strings = {
  appName: 'Kitchen One',
  appTagline: 'Delicious food, delivered fresh',

  // Auth
  signInTitle: 'Sign in',
  signUpTitle: 'Sign Up',
  forgotPasswordTitle: 'Forgot Password?',
  emailLabel: 'Email',
  passwordLabel: 'Password',
  confirmPasswordLabel: 'Confirm Password',
  fullNameLabel: 'Full Name',
  usernameLabel: 'Username',
  phoneLabel: 'Phone Number',
  optional: '(optional)',
  signInCta: 'Sign in',
  signUpCta: 'Sign up',
  resetPasswordCta: 'Send Reset Link',
  forgotPasswordCta: 'Forgot Password?',
  rememberPasswordCta: 'Sign in',
  alreadyHaveAccount: 'Already have an account?',
  dontHaveAccount: "Don't have an account?",

  // Tabs
  homeTab: 'Home',
  menuTab: 'Menu',
  cartTab: 'Cart',
} as const;

export type StringsType = typeof Strings;
export default Strings;


