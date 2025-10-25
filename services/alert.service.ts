import { AlertDialog, AlertButton } from '../components/ui/AlertDialog';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface AlertOptions {
  type?: AlertType;
  showCloseButton?: boolean;
}

class AlertService {
  private alertDialog: AlertDialog | null = null;
  private currentAlert: {
    title: string;
    message?: string;
    buttons?: AlertButton[];
    onClose: () => void;
    type: AlertType;
    showCloseButton: boolean;
  } | null = null;

  setAlertDialog(dialog: AlertDialog | null) {
    this.alertDialog = dialog;
  }

  show(
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions
  ): void {
    if (!this.alertDialog) {
      console.warn('AlertDialog not initialized. Please set the alert dialog first.');
      return;
    }

    this.currentAlert = {
      title,
      message,
      buttons: buttons || [{ text: 'OK', onPress: () => {} }],
      onClose: () => this.hide(),
      type: options?.type || 'info',
      showCloseButton: options?.showCloseButton !== false,
    };

    // Force re-render by updating the dialog
    this.alertDialog.setState?.(this.currentAlert);
  }

  hide(): void {
    this.currentAlert = null;
    if (this.alertDialog) {
      this.alertDialog.setState?.(null);
    }
  }

  // Convenience methods for common alert types
  success(title: string, message?: string, buttons?: AlertButton[]): void {
    this.show(title, message, buttons, { type: 'success' });
  }

  error(title: string, message?: string, buttons?: AlertButton[]): void {
    this.show(title, message, buttons, { type: 'error' });
  }

  warning(title: string, message?: string, buttons?: AlertButton[]): void {
    this.show(title, message, buttons, { type: 'warning' });
  }

  info(title: string, message?: string, buttons?: AlertButton[]): void {
    this.show(title, message, buttons, { type: 'info' });
  }

  // Confirm dialog
  confirm(
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel'
  ): void {
    this.show(title, message, [
      { text: cancelText, style: 'cancel', onPress: onCancel },
      { text: confirmText, style: 'default', onPress: onConfirm },
    ]);
  }

  // Destructive action confirmation
  confirmDestructive(
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText: string = 'Delete',
    cancelText: string = 'Cancel'
  ): void {
    this.show(title, message, [
      { text: cancelText, style: 'cancel', onPress: onCancel },
      { text: confirmText, style: 'destructive', onPress: onConfirm },
    ], { type: 'error' });
  }

  getCurrentAlert() {
    return this.currentAlert;
  }
}

export const alertService = new AlertService();
