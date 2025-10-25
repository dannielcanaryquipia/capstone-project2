import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useAlert } from './AlertProvider';
import Button from './Button';

/**
 * Demo component showing how to use the new custom alert system
 * This replaces React Native's default Alert.alert with beautiful custom modals
 * that match the CartNotification design.
 */
export const AlertDemo: React.FC = () => {
  const { 
    success, 
    error, 
    warning, 
    info, 
    confirm, 
    confirmDestructive 
  } = useAlert();

  const showSuccessAlert = () => {
    success(
      'Success!',
      'Your action was completed successfully.',
      [{ text: 'Great!', onPress: () => console.log('Success acknowledged') }]
    );
  };

  const showErrorAlert = () => {
    error(
      'Error Occurred',
      'Something went wrong. Please try again.',
      [{ text: 'Try Again', onPress: () => console.log('Retrying...') }]
    );
  };

  const showWarningAlert = () => {
    warning(
      'Warning',
      'This action may have unintended consequences.',
      [{ text: 'I Understand', onPress: () => console.log('Warning acknowledged') }]
    );
  };

  const showInfoAlert = () => {
    info(
      'Information',
      'Here is some important information you should know.',
      [{ text: 'Got it', onPress: () => console.log('Info acknowledged') }]
    );
  };

  const showConfirmAlert = () => {
    confirm(
      'Confirm Action',
      'Are you sure you want to proceed with this action?',
      () => console.log('Action confirmed'),
      () => console.log('Action cancelled'),
      'Yes, Proceed',
      'Cancel'
    );
  };

  const showDestructiveConfirmAlert = () => {
    confirmDestructive(
      'Delete Item',
      'This action cannot be undone. Are you sure you want to delete this item?',
      () => console.log('Item deleted'),
      () => console.log('Deletion cancelled'),
      'Delete',
      'Cancel'
    );
  };

  return (
    <View style={styles.container}>
      <Button
        title="Show Success Alert"
        onPress={showSuccessAlert}
        variant="primary"
        style={styles.button}
      />
      
      <Button
        title="Show Error Alert"
        onPress={showErrorAlert}
        variant="secondary"
        style={styles.button}
      />
      
      <Button
        title="Show Warning Alert"
        onPress={showWarningAlert}
        variant="outline"
        style={styles.button}
      />
      
      <Button
        title="Show Info Alert"
        onPress={showInfoAlert}
        variant="outline"
        style={styles.button}
      />
      
      <Button
        title="Show Confirm Alert"
        onPress={showConfirmAlert}
        variant="primary"
        style={styles.button}
      />
      
      <Button
        title="Show Destructive Confirm"
        onPress={showDestructiveConfirmAlert}
        variant="secondary"
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 12,
  },
  button: {
    marginBottom: 8,
  },
});

export default AlertDemo;
