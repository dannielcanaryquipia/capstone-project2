import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ResponsiveText from './ResponsiveText';
import ResponsiveView from './ResponsiveView';
import { useTheme } from '../../contexts/ThemeContext';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface AlertDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onClose: () => void;
  type?: 'info' | 'success' | 'warning' | 'error';
  showCloseButton?: boolean;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  visible,
  title,
  message,
  buttons = [],
  onClose,
  type = 'info',
  showCloseButton = true,
}) => {
  const { colors } = useTheme();

  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return {
          name: 'check-circle' as const,
          color: colors.success,
          backgroundColor: colors.success + '20',
        };
      case 'warning':
        return {
          name: 'warning' as const,
          color: colors.warning || '#FFA500',
          backgroundColor: (colors.warning || '#FFA500') + '20',
        };
      case 'error':
        return {
          name: 'error' as const,
          color: colors.error || '#FF4444',
          backgroundColor: (colors.error || '#FF4444') + '20',
        };
      default:
        return {
          name: 'info' as const,
          color: colors.primary,
          backgroundColor: colors.primary + '20',
        };
    }
  };

  const iconConfig = getIconConfig();

  const getButtonStyle = (buttonStyle?: string) => {
    switch (buttonStyle) {
      case 'destructive':
        return {
          backgroundColor: colors.error || '#FF4444',
          borderColor: colors.error || '#FF4444',
        };
      case 'cancel':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.border,
        };
      default:
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        };
    }
  };

  const getButtonTextColor = (buttonStyle?: string) => {
    switch (buttonStyle) {
      case 'destructive':
        return colors.white;
      case 'cancel':
        return colors.text;
      default:
        return colors.white;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <ResponsiveView style={[styles.container, { backgroundColor: colors.card }]}>
          {/* Close Button */}
          {showCloseButton && (
            <TouchableOpacity 
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.background + '80' }]}
            >
              <MaterialIcons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          )}

          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: iconConfig.backgroundColor }]}>
            <MaterialIcons 
              name={iconConfig.name} 
              size={48} 
              color={iconConfig.color} 
            />
          </View>

          {/* Title */}
          <ResponsiveText 
            style={[styles.title, { color: colors.text }]}
            size="lg"
            weight="semiBold"
          >
            {title}
          </ResponsiveText>

          {/* Message */}
          {message && (
            <ResponsiveText 
              style={[styles.message, { color: colors.textSecondary }]}
              size="md"
            >
              {message}
            </ResponsiveText>
          )}

          {/* Buttons */}
          {buttons.length > 0 && (
            <View style={styles.buttonContainer}>
              {buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    getButtonStyle(button.style),
                    button.style === 'cancel' && styles.cancelButton,
                  ]}
                  onPress={() => {
                    if (button.onPress) {
                      button.onPress();
                    }
                    onClose();
                  }}
                >
                  <ResponsiveText 
                    style={[
                      styles.buttonText,
                      { color: getButtonTextColor(button.style) }
                    ]}
                    size="md"
                    weight="medium"
                  >
                    {button.text}
                  </ResponsiveText>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ResponsiveView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    minHeight: 48,
    borderWidth: 1,
  },
  cancelButton: {
    borderWidth: 1,
  },
  buttonText: {
    textAlign: 'center',
  },
});
