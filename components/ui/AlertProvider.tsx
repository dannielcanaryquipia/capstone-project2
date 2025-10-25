import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertDialog, AlertButton } from './AlertDialog';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

interface AlertContextType {
  show: (title: string, message?: string, buttons?: AlertButton[], options?: { type?: AlertType; showCloseButton?: boolean }) => void;
  hide: () => void;
  success: (title: string, message?: string, buttons?: AlertButton[]) => void;
  error: (title: string, message?: string, buttons?: AlertButton[]) => void;
  warning: (title: string, message?: string, buttons?: AlertButton[]) => void;
  info: (title: string, message?: string, buttons?: AlertButton[]) => void;
  confirm: (title: string, message: string, onConfirm: () => void, onCancel?: () => void, confirmText?: string, cancelText?: string) => void;
  confirmDestructive: (title: string, message: string, onConfirm: () => void, onCancel?: () => void, confirmText?: string, cancelText?: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: React.ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alertState, setAlertState] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    buttons?: AlertButton[];
    type: AlertType;
    showCloseButton: boolean;
  }>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
    type: 'info',
    showCloseButton: true,
  });

  const show = useCallback((
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: { type?: AlertType; showCloseButton?: boolean }
  ) => {
    setAlertState({
      visible: true,
      title,
      message,
      buttons: buttons || [{ text: 'OK', onPress: () => {} }],
      type: options?.type || 'info',
      showCloseButton: options?.showCloseButton !== false,
    });
  }, []);

  const hide = useCallback(() => {
    setAlertState(prev => ({ ...prev, visible: false }));
  }, []);

  const success = useCallback((title: string, message?: string, buttons?: AlertButton[]) => {
    show(title, message, buttons, { type: 'success' });
  }, [show]);

  const error = useCallback((title: string, message?: string, buttons?: AlertButton[]) => {
    show(title, message, buttons, { type: 'error' });
  }, [show]);

  const warning = useCallback((title: string, message?: string, buttons?: AlertButton[]) => {
    show(title, message, buttons, { type: 'warning' });
  }, [show]);

  const info = useCallback((title: string, message?: string, buttons?: AlertButton[]) => {
    show(title, message, buttons, { type: 'info' });
  }, [show]);

  const confirm = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel'
  ) => {
    show(title, message, [
      { text: cancelText, style: 'cancel', onPress: onCancel },
      { text: confirmText, style: 'default', onPress: onConfirm },
    ]);
  }, [show]);

  const confirmDestructive = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText: string = 'Delete',
    cancelText: string = 'Cancel'
  ) => {
    show(title, message, [
      { text: cancelText, style: 'cancel', onPress: onCancel },
      { text: confirmText, style: 'destructive', onPress: onConfirm },
    ], { type: 'error' });
  }, [show]);

  const contextValue: AlertContextType = {
    show,
    hide,
    success,
    error,
    warning,
    info,
    confirm,
    confirmDestructive,
  };

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      <AlertDialog
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        onClose={hide}
        type={alertState.type}
        showCloseButton={alertState.showCloseButton}
      />
    </AlertContext.Provider>
  );
};
