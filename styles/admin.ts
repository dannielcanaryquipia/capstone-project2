import { StyleSheet } from 'react-native';
import Layout from '../constants/Layout';
import { ResponsiveBorderRadius, ResponsiveSpacing, responsiveValue } from '../constants/Responsive';

export const adminStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header styles
  header: {
    paddingHorizontal: ResponsiveSpacing.lg,
    paddingVertical: ResponsiveSpacing.md,
    ...Layout.shadows.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ResponsiveSpacing.sm,
  },

  // Card styles
  card: {
    backgroundColor: 'white',
    borderRadius: ResponsiveBorderRadius.lg,
    padding: ResponsiveSpacing.md,
    marginBottom: ResponsiveSpacing.sm,
    ...Layout.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.sm,
  },
  cardIcon: {
    width: responsiveValue(32, 36, 40, 44),
    height: responsiveValue(32, 36, 40, 44),
    borderRadius: ResponsiveBorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ResponsiveSpacing.sm,
  },
  cardContent: {
    flex: 1,
  },

  // Grid styles
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: ResponsiveSpacing.sm,
  },

  // List styles
  list: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ResponsiveSpacing.sm,
    paddingHorizontal: ResponsiveSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemContent: {
    flex: 1,
  },
  listItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ResponsiveSpacing.sm,
  },

  // Status styles
  statusBadge: {
    paddingHorizontal: ResponsiveSpacing.sm,
    paddingVertical: ResponsiveSpacing.xs,
    borderRadius: ResponsiveBorderRadius.sm,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: responsiveValue(10, 11, 12, 13),
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  // Action styles
  actionButton: {
    paddingHorizontal: ResponsiveSpacing.md,
    paddingVertical: ResponsiveSpacing.sm,
    borderRadius: ResponsiveBorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: responsiveValue(12, 13, 14, 15),
    fontWeight: '600',
  },

  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: ResponsiveSpacing.xl,
  },
  loadingText: {
    marginTop: ResponsiveSpacing.sm,
  },

  // Empty state styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: ResponsiveSpacing.xl,
  },
  emptyStateIcon: {
    marginBottom: ResponsiveSpacing.md,
  },
  emptyStateText: {
    textAlign: 'center',
    marginBottom: ResponsiveSpacing.sm,
  },
  emptyStateSubtext: {
    textAlign: 'center',
    marginBottom: ResponsiveSpacing.lg,
  },

  // Form styles
  form: {
    flex: 1,
  },
  formGroup: {
    marginBottom: ResponsiveSpacing.md,
  },
  formLabel: {
    marginBottom: ResponsiveSpacing.xs,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: ResponsiveBorderRadius.sm,
    paddingHorizontal: ResponsiveSpacing.md,
    paddingVertical: ResponsiveSpacing.sm,
    fontSize: responsiveValue(14, 15, 16, 17),
  },
  formError: {
    marginTop: ResponsiveSpacing.xs,
  },

  // Tab styles
  tabContainer: {
    flexDirection: 'row',
    marginBottom: ResponsiveSpacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: ResponsiveSpacing.sm,
    paddingHorizontal: ResponsiveSpacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  inactiveTab: {
    borderBottomColor: 'transparent',
  },

  // Metric styles
  metricCard: {
    borderRadius: ResponsiveBorderRadius.lg,
    padding: ResponsiveSpacing.md,
    marginBottom: ResponsiveSpacing.sm,
    ...Layout.shadows.sm,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.sm,
  },
  metricIcon: {
    width: responsiveValue(32, 36, 40, 44),
    height: responsiveValue(32, 36, 40, 44),
    borderRadius: ResponsiveBorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ResponsiveSpacing.sm,
  },
  metricValue: {
    fontSize: responsiveValue(24, 28, 32, 36),
    fontWeight: 'bold',
  },
  metricLabel: {
    fontSize: responsiveValue(12, 13, 14, 15),
    opacity: 0.7,
  },

  // Responsive utilities
  responsiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  responsiveColumn: {
    flexDirection: 'column',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  spaceAround: {
    justifyContent: 'space-around',
  },
  spaceEvenly: {
    justifyContent: 'space-evenly',
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  alignCenter: {
    alignItems: 'center',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  justifyStart: {
    justifyContent: 'flex-start',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  justifyEnd: {
    justifyContent: 'flex-end',
  },
});
