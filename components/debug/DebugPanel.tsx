import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Layout from '../../constants/Layout';
import { useTheme } from '../../contexts/ThemeContext';
import { useDebugData } from '../../hooks/useDebugData';
import { ResponsiveText } from '../ui/ResponsiveText';
import { ResponsiveView } from '../ui/ResponsiveView';

interface DebugPanelProps {
  isVisible: boolean;
  onToggle: () => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ isVisible, onToggle }) => {
  const { colors } = useTheme();
  const { debugInfo, testConnection, testAdminData, testUserAccess, runFullDiagnostic } = useDebugData();

  if (!isVisible) {
    return (
      <TouchableOpacity
        style={[styles.toggleButton, { backgroundColor: colors.primary }]}
        onPress={onToggle}
      >
        <MaterialIcons name="bug-report" size={20} color={colors.background} />
      </TouchableOpacity>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return colors.success;
      case 'error': return colors.error;
      case 'testing': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return 'check-circle';
      case 'error': return 'error';
      case 'testing': return 'hourglass-empty';
      default: return 'help';
    }
  };

  return (
    <ResponsiveView style={[styles.debugPanel, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ResponsiveView style={styles.debugHeader}>
        <ResponsiveText size="md" weight="bold" color={colors.text}>
          Debug Panel
        </ResponsiveText>
        <TouchableOpacity onPress={onToggle}>
          <MaterialIcons name="close" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </ResponsiveView>

      <ScrollView style={styles.debugContent} showsVerticalScrollIndicator={false}>
        {/* Connection Status */}
        <ResponsiveView style={styles.debugSection}>
          <ResponsiveView style={styles.debugSectionHeader}>
            <MaterialIcons 
              name={getStatusIcon(debugInfo.connectionStatus)} 
              size={16} 
              color={getStatusColor(debugInfo.connectionStatus)} 
            />
            <ResponsiveText size="sm" weight="semiBold" color={colors.text}>
              Connection Status
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveText 
            size="xs" 
            color={getStatusColor(debugInfo.connectionStatus)}
          >
            {debugInfo.connectionStatus.toUpperCase()}
          </ResponsiveText>
        </ResponsiveView>

        {/* Errors */}
        {debugInfo.errors.length > 0 && (
          <ResponsiveView style={styles.debugSection}>
            <ResponsiveView style={styles.debugSectionHeader}>
              <MaterialIcons name="error" size={16} color={colors.error} />
              <ResponsiveText size="sm" weight="semiBold" color={colors.text}>
                Errors ({debugInfo.errors.length})
              </ResponsiveText>
            </ResponsiveView>
            {debugInfo.errors.map((error, index) => (
              <ResponsiveText key={index} size="xs" color={colors.error}>
                • {error}
              </ResponsiveText>
            ))}
          </ResponsiveView>
        )}

        {/* Warnings */}
        {debugInfo.warnings.length > 0 && (
          <ResponsiveView style={styles.debugSection}>
            <ResponsiveView style={styles.debugSectionHeader}>
              <MaterialIcons name="warning" size={16} color={colors.warning} />
              <ResponsiveText size="sm" weight="semiBold" color={colors.text}>
                Warnings ({debugInfo.warnings.length})
              </ResponsiveText>
            </ResponsiveView>
            {debugInfo.warnings.map((warning, index) => (
              <ResponsiveText key={index} size="xs" color={colors.warning}>
                • {warning}
              </ResponsiveText>
            ))}
          </ResponsiveView>
        )}

        {/* Last Test */}
        {debugInfo.lastTest && (
          <ResponsiveView style={styles.debugSection}>
            <ResponsiveText size="xs" color={colors.textSecondary}>
              Last Test: {debugInfo.lastTest.toLocaleTimeString()}
            </ResponsiveText>
          </ResponsiveView>
        )}

        {/* Diagnostic Results */}
        {debugInfo.diagnosticResults.connection && (
          <ResponsiveView style={styles.debugSection}>
            <ResponsiveText size="sm" weight="semiBold" color={colors.text}>
              Diagnostic Results
            </ResponsiveText>
            <ResponsiveText size="xs" color={colors.textSecondary}>
              Connection: {debugInfo.diagnosticResults.connection.success ? '✅' : '❌'}
            </ResponsiveText>
            {debugInfo.diagnosticResults.adminData && (
              <ResponsiveText size="xs" color={colors.textSecondary}>
                Admin Data: {debugInfo.diagnosticResults.adminData.success ? '✅' : '❌'}
              </ResponsiveText>
            )}
            {debugInfo.diagnosticResults.userAccess && (
              <ResponsiveText size="xs" color={colors.textSecondary}>
                User Access: {debugInfo.diagnosticResults.userAccess.success ? '✅' : '❌'}
              </ResponsiveText>
            )}
          </ResponsiveView>
        )}

        {/* Action Buttons */}
        <ResponsiveView style={styles.debugActions}>
          <TouchableOpacity
            style={[styles.debugButton, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}
            onPress={testConnection}
          >
            <MaterialIcons name="refresh" size={16} color={colors.primary} />
            <ResponsiveText size="xs" color={colors.primary} weight="semiBold">
              Test Connection
            </ResponsiveText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.debugButton, { backgroundColor: colors.secondary + '20', borderColor: colors.secondary }]}
            onPress={testAdminData}
          >
            <MaterialIcons name="admin-panel-settings" size={16} color={colors.secondary} />
            <ResponsiveText size="xs" color={colors.secondary} weight="semiBold">
              Test Admin Data
            </ResponsiveText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.debugButton, { backgroundColor: colors.accent + '20', borderColor: colors.accent }]}
            onPress={runFullDiagnostic}
          >
            <MaterialIcons name="analytics" size={16} color={colors.accent} />
            <ResponsiveText size="xs" color={colors.accent} weight="semiBold">
              Full Diagnostic
            </ResponsiveText>
          </TouchableOpacity>
        </ResponsiveView>
      </ScrollView>
    </ResponsiveView>
  );
};

const styles = StyleSheet.create({
  toggleButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    ...Layout.shadows.sm,
  },
  debugPanel: {
    position: 'absolute',
    top: 100,
    right: 20,
    width: 300,
    maxHeight: 400,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    zIndex: 1000,
    ...Layout.shadows.lg,
  },
  debugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  debugContent: {
    maxHeight: 300,
  },
  debugSection: {
    padding: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  debugSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
    gap: Layout.spacing.xs,
  },
  debugActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Layout.spacing.md,
    gap: Layout.spacing.sm,
  },
  debugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
    borderWidth: 1,
    gap: Layout.spacing.xs,
  },
});
