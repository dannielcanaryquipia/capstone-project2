import { StyleSheet } from 'react-native';
import Colors from './Colors';
import Layout from './Layout';

// Helper function to create type-safe styles
function createStyles<T extends Record<string, any>>(styles: T): T {
  return StyleSheet.create(styles);
}

// Common container styles
export const container = createStyles({
  flex: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowAround: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
  },
  absoluteCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
});

// Common text styles
export const text = createStyles({
  // Headers
  h1: {
    fontSize: Layout.fontSize.xxxl,
    fontWeight: Layout.fontWeight.bold,
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  h2: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: Layout.fontWeight.bold,
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  h3: {
    fontSize: Layout.fontSize.xl,
    fontWeight: Layout.fontWeight.semiBold,
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  h4: {
    fontSize: Layout.fontSize.lg,
    fontWeight: Layout.fontWeight.semiBold,
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  
  // Body text
  body: {
    fontSize: Layout.fontSize.md,
    color: Colors.text,
    lineHeight: Layout.lineHeight.normal * Layout.fontSize.md,
  },
  bodySmall: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: Layout.lineHeight.normal * Layout.fontSize.sm,
  },
  bodyXSmall: {
    fontSize: Layout.fontSize.xs,
    color: Colors.textTertiary,
    lineHeight: Layout.lineHeight.normal * Layout.fontSize.xs,
  },
  
  // Utility text
  bold: {
    fontWeight: Layout.fontWeight.bold,
  },
  semiBold: {
    fontWeight: Layout.fontWeight.semiBold,
  },
  center: {
    textAlign: 'center',
  },
  right: {
    textAlign: 'right',
  },
  uppercase: {
    textTransform: 'uppercase',
  },
  capitalize: {
    textTransform: 'capitalize',
  },
  error: {
    color: Colors.error,
    fontSize: Layout.fontSize.sm,
    marginTop: Layout.spacing.xs,
  },
  link: {
    color: Colors.accent,
    textDecorationLine: 'underline',
  },
});

// Common form styles
export const form = createStyles({
  input: {
    height: Layout.sizes.inputHeight,
    borderWidth: Layout.sizes.borderWidth,
    borderColor: Colors.border,
    borderRadius: Layout.sizes.inputBorderRadius,
    paddingHorizontal: Layout.sizes.inputPaddingHorizontal,
    backgroundColor: Colors.backgroundLight,
    fontSize: Layout.fontSize.md,
    color: Colors.text,
  },
  inputFocused: {
    borderColor: Colors.primary,
  },
  inputError: {
    borderColor: Colors.error,
  },
  label: {
    marginBottom: Layout.spacing.xs,
    color: Colors.textSecondary,
    fontSize: Layout.fontSize.sm,
  },
  errorText: text.error,
  helperText: {
    color: Colors.textTertiary,
    fontSize: Layout.fontSize.xs,
    marginTop: Layout.spacing.xs,
  },
});

// Common card styles
export const card = createStyles({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.sizes.cardRadius,
    padding: Layout.sizes.cardPadding,
    ...Layout.shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  title: {
    ...text.h4,
    marginBottom: 0,
  },
  footer: {
    marginTop: Layout.spacing.md,
    paddingTop: Layout.spacing.sm,
    borderTopWidth: Layout.sizes.borderWidth,
    borderTopColor: Colors.borderLight,
  },
});

// Common button styles
export const button = createStyles({
  base: {
    height: Layout.sizes.buttonHeight,
    borderRadius: Layout.sizes.buttonBorderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: Layout.spacing.lg,
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: Layout.sizes.borderWidth,
    borderColor: Colors.primary,
  },
  text: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  disabled: {
    opacity: 0.6,
  },
  small: {
    height: Layout.sizes.buttonSmallHeight,
    paddingHorizontal: Layout.spacing.md,
  },
  large: {
    height: Layout.sizes.buttonLargeHeight,
    paddingHorizontal: Layout.spacing.xl,
  },
  fullWidth: {
    width: '100%',
  },
  icon: {
    marginRight: Layout.spacing.sm,
  },
  textPrimary: {
    color: Colors.white,
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.semiBold,
  },
  textOutline: {
    color: Colors.primary,
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.semiBold,
  },
  textText: {
    color: Colors.primary,
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.semiBold,
  },
});

// Common badge styles
export const badge = createStyles({
  container: {
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xxs,
    borderRadius: Layout.borderRadius.pill,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: Layout.fontSize.xs,
    fontWeight: Layout.fontWeight.semiBold,
    textAlign: 'center',
  },
  // Status variants
  success: {
    backgroundColor: `${Colors.success}20`,
  },
  warning: {
    backgroundColor: `${Colors.warning}20`,
  },
  error: {
    backgroundColor: `${Colors.error}20`,
  },
  info: {
    backgroundColor: `${Colors.info}20`,
  },
  // Text colors for each variant
  textSuccess: {
    color: Colors.success,
  },
  textWarning: {
    color: Colors.warning,
  },
  textError: {
    color: Colors.error,
  },
  textInfo: {
    color: Colors.info,
  },
});

// Common divider styles
export const divider = createStyles({
  default: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Layout.spacing.md,
  },
  light: {
    backgroundColor: Colors.borderLight,
  },
  vertical: {
    width: 1,
    height: '100%',
    marginVertical: 0,
    marginHorizontal: Layout.spacing.md,
  },
});

// Common list item styles
export const listItem = createStyles({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  content: {
    flex: 1,
    marginRight: Layout.spacing.md,
  },
  title: {
    ...text.body,
    fontWeight: Layout.fontWeight.medium,
    marginBottom: Layout.spacing.xxs,
  },
  subtitle: {
    ...text.bodySmall,
    color: Colors.textSecondary,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  icon: {
    marginRight: Layout.spacing.md,
  },
  chevron: {
    marginLeft: 'auto',
  },
});

// Common loading/empty states
export const states = createStyles({
  loadingContainer: {
    ...container.center,
    padding: Layout.spacing.xl,
  },
  emptyContainer: {
    ...container.center,
    padding: Layout.spacing.xl,
  },
  emptyText: {
    ...text.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Layout.spacing.md,
  },
  errorContainer: {
    ...container.center,
    padding: Layout.spacing.xl,
  },
  errorText: {
    ...text.body,
    color: Colors.error,
    textAlign: 'center',
    marginTop: Layout.spacing.md,
  },
  retryButton: {
    marginTop: Layout.spacing.md,
  },
});

// Common shadow styles
export const shadows = {
  ...Layout.shadows,
  // Add any additional shadow styles here
};

// Common spacing utilities
export const spacing = {
  // Margin
  m: (size: keyof typeof Layout.spacing) => ({
    margin: Layout.spacing[size],
  }),
  mx: (size: keyof typeof Layout.spacing) => ({
    marginHorizontal: Layout.spacing[size],
  }),
  my: (size: keyof typeof Layout.spacing) => ({
    marginVertical: Layout.spacing[size],
  }),
  mt: (size: keyof typeof Layout.spacing) => ({
    marginTop: Layout.spacing[size],
  }),
  mb: (size: keyof typeof Layout.spacing) => ({
    marginBottom: Layout.spacing[size],
  }),
  ml: (size: keyof typeof Layout.spacing) => ({
    marginLeft: Layout.spacing[size],
  }),
  mr: (size: keyof typeof Layout.spacing) => ({
    marginRight: Layout.spacing[size],
  }),
  
  // Padding
  p: (size: keyof typeof Layout.spacing) => ({
    padding: Layout.spacing[size],
  }),
  px: (size: keyof typeof Layout.spacing) => ({
    paddingHorizontal: Layout.spacing[size],
  }),
  py: (size: keyof typeof Layout.spacing) => ({
    paddingVertical: Layout.spacing[size],
  }),
  pt: (size: keyof typeof Layout.spacing) => ({
    paddingTop: Layout.spacing[size],
  }),
  pb: (size: keyof typeof Layout.spacing) => ({
    paddingBottom: Layout.spacing[size],
  }),
  pl: (size: keyof typeof Layout.spacing) => ({
    paddingLeft: Layout.spacing[size],
  }),
  pr: (size: keyof typeof Layout.spacing) => ({
    paddingRight: Layout.spacing[size],
  }),
};

// Export all styles
export default {
  container,
  text,
  form,
  card,
  button,
  badge,
  divider,
  listItem,
  states,
  shadows,
  spacing,
} as const;
