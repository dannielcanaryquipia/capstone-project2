import { StyleSheet } from 'react-native';
import Layout from '../constants/Layout';

const global = StyleSheet.create({
  // Containers
  screen: {
    flex: 1,
    // backgroundColor will be set dynamically by theme
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
    // backgroundColor will be set dynamically by theme
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
    // backgroundColor will be set dynamically by theme
  },
  buttonText: {
    // color will be set dynamically by theme
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.semiBold,
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // Inputs
  input: {
    height: 45, // Fixed height for consistent form appearance
    borderWidth: Layout.sizes.borderWidth,
    // borderColor will be set dynamically by theme
    borderRadius: Layout.sizes.inputBorderRadius,
    paddingHorizontal: Layout.sizes.inputPaddingHorizontal,
    // backgroundColor and color will be set dynamically by theme
    fontSize: Layout.fontSize.md,
  },
  label: {
    marginBottom: Layout.spacing.xs,
    // color will be set dynamically by theme
    fontSize: Layout.fontSize.sm,
  },

  // Typography
  h1: {
    fontSize: Layout.fontSize.xxxl,
    fontWeight: Layout.fontWeight.bold,
    fontFamily: Layout.fontFamily.bold,
    // color will be set dynamically by theme
  },
  h2: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: Layout.fontWeight.bold,
    fontFamily: Layout.fontFamily.bold,
    // color will be set dynamically by theme
  },
  title: {
    fontSize: Layout.fontSize.xl,
    fontWeight: Layout.fontWeight.semiBold,
    fontFamily: Layout.fontFamily.semiBold,
    // color will be set dynamically by theme
  },
  body: {
    fontSize: Layout.fontSize.md,
    fontFamily: Layout.fontFamily.regular,
    // color will be set dynamically by theme
  },
  caption: {
    fontSize: Layout.fontSize.sm,
    fontFamily: Layout.fontFamily.regular,
    // color will be set dynamically by theme
  },
  // App title with PlayfairDisplay
  appTitle: {
    fontSize: Layout.fontSize.display,
    fontFamily: Layout.fontFamily.display,
    fontWeight: Layout.fontWeight.bold,
    // color will be set dynamically by theme
  },

  // Utility
  divider: {
    height: 1,
    // backgroundColor will be set dynamically by theme
    marginVertical: Layout.spacing.md,
  },
});

export default global;


