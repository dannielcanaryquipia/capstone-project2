import { StyleSheet } from 'react-native';
import Colors from '../constants/Colors';
import Layout from '../constants/Layout';

const global = StyleSheet.create({
  // Containers
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: Layout.spacing.lg,
    paddingBottom: Layout.spacing.lg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.lg,
  },

  // Cards
  card: {
    backgroundColor: Colors.card,
    borderRadius: Layout.sizes.cardRadius,
    padding: Layout.sizes.cardPadding,
    ...Layout.shadows.sm,
  },
  heroIllustration: {
    width: '100%',
    height: 140,
    marginBottom: Layout.spacing.md,
    alignSelf: 'center',
  },

  // Buttons
  button: {
    height: Layout.sizes.buttonHeight,
    borderRadius: Layout.sizes.buttonBorderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.tint,
  },
  buttonText: {
    color: Colors.black,
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.semiBold,
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // Inputs
  input: {
    height: Layout.sizes.inputHeight,
    borderWidth: Layout.sizes.borderWidth,
    borderColor: Colors.border,
    borderRadius: Layout.sizes.inputBorderRadius,
    paddingHorizontal: Layout.sizes.inputPaddingHorizontal,
    backgroundColor: Colors.white,
    color: Colors.text,
    fontSize: Layout.fontSize.md,
  },
  label: {
    marginBottom: Layout.spacing.xs,
    color: Colors.textSecondary,
    fontSize: Layout.fontSize.sm,
  },

  // Typography
  h1: {
    fontSize: Layout.fontSize.xxxl,
    fontWeight: Layout.fontWeight.bold,
    fontFamily: Layout.fontFamily.bold,
    color: Colors.text,
  },
  h2: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: Layout.fontWeight.bold,
    fontFamily: Layout.fontFamily.bold,
    color: Colors.text,
  },
  title: {
    fontSize: Layout.fontSize.xl,
    fontWeight: Layout.fontWeight.semiBold,
    fontFamily: Layout.fontFamily.semiBold,
    color: Colors.text,
  },
  body: {
    fontSize: Layout.fontSize.md,
    fontFamily: Layout.fontFamily.regular,
    color: Colors.text,
  },
  caption: {
    fontSize: Layout.fontSize.sm,
    fontFamily: Layout.fontFamily.regular,
    color: Colors.textSecondary,
  },
  // App title with PlayfairDisplay
  appTitle: {
    fontSize: Layout.fontSize.display,
    fontFamily: Layout.fontFamily.display,
    fontWeight: Layout.fontWeight.bold,
    color: Colors.text,
  },

  // Utility
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Layout.spacing.md,
  },
});

export default global;


