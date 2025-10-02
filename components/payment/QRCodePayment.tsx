import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet } from 'react-native';
import Responsive from '../../constants/Responsive';
import { useTheme } from '../../contexts/ThemeContext';
import { QRCodeData, QRCodeService } from '../../services/qr-code.service';
import { Button } from '../ui/Button';
import { ResponsiveText } from '../ui/ResponsiveText';
import { ResponsiveView } from '../ui/ResponsiveView';

interface QRCodePaymentProps {
  orderId: string;
  amount: number;
  onPaymentComplete?: () => void;
  onCancel?: () => void;
}

export const QRCodePayment: React.FC<QRCodePaymentProps> = ({
  orderId,
  amount,
  onPaymentComplete,
  onCancel
}) => {
  const { colors } = useTheme();
  const [qrCodeData, setQrCodeData] = useState<QRCodeData | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Generate QR code on mount
  useEffect(() => {
    generateQRCode();
  }, []);

  // Check expiration every second
  useEffect(() => {
    if (!qrCodeData) return;

    const interval = setInterval(() => {
      const now = new Date();
      const expiresAt = new Date(qrCodeData.expiresAt);
      const remaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
      
      setTimeLeft(remaining);
      setIsExpired(remaining === 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [qrCodeData]);

  const generateQRCode = async () => {
    try {
      setIsGenerating(true);
      const qrData = await QRCodeService.generatePaymentQRCode(orderId, amount);
      setQrCodeData(qrData);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate QR code. Please try again.');
      console.error('QR Code generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefresh = () => {
    generateQRCode();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isGenerating) {
    return (
      <ResponsiveView 
        alignItems="center" 
        justifyContent="center" 
        padding="xl"
        backgroundColor={colors.surface}
        borderRadius="lg"
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <ResponsiveText 
          size="md" 
          color={colors.textSecondary} 
          marginTop="md"
        >
          Generating QR Code...
        </ResponsiveText>
      </ResponsiveView>
    );
  }

  if (!qrCodeData) {
    return (
      <ResponsiveView 
        alignItems="center" 
        justifyContent="center" 
        padding="xl"
        backgroundColor={colors.surface}
        borderRadius="lg"
      >
        <MaterialIcons 
          name="error-outline" 
          size={48} 
          color={colors.error} 
        />
        <ResponsiveText 
          size="md" 
          color={colors.error} 
          marginTop="md"
          align="center"
        >
          Failed to generate QR code
        </ResponsiveText>
        <Button 
          title="Try Again" 
          onPress={handleRefresh}
          variant="primary"
          size="medium"
          marginTop="md"
        />
      </ResponsiveView>
    );
  }

  return (
    <ResponsiveView 
      backgroundColor={colors.surface}
      borderRadius="lg"
      padding="xl"
      alignItems="center"
    >
      {/* Header */}
      <ResponsiveView marginBottom="lg" alignItems="center">
        <ResponsiveText 
          size="xl" 
          weight="bold" 
          color={colors.text}
          marginBottom="sm"
        >
          Scan to Pay
        </ResponsiveText>
        <ResponsiveText 
          size="lg" 
          weight="semiBold" 
          color={colors.primary}
        >
          ₱{amount.toFixed(2)}
        </ResponsiveText>
      </ResponsiveView>

      {/* QR Code */}
      <ResponsiveView 
        backgroundColor={colors.background}
        padding="lg"
        borderRadius="md"
        marginBottom="lg"
        style={styles.qrCodeContainer}
      >
        <Image
          source={{ uri: qrCodeData.qrCodeUrl }}
          style={styles.qrCode}
          contentFit="contain"
        />
      </ResponsiveView>

      {/* Timer */}
      <ResponsiveView 
        flexDirection="row" 
        alignItems="center" 
        marginBottom="lg"
        backgroundColor={isExpired ? colors.error + '20' : colors.warning + '20'}
        paddingHorizontal="md"
        paddingVertical="sm"
        borderRadius="pill"
      >
        <MaterialIcons 
          name={isExpired ? "timer-off" : "timer"} 
          size={20} 
          color={isExpired ? colors.error : colors.warning} 
        />
        <ResponsiveText 
          size="sm" 
          color={isExpired ? colors.error : colors.warning}
          marginLeft="xs"
          weight="semiBold"
        >
          {isExpired ? 'Expired' : `Expires in ${formatTime(timeLeft)}`}
        </ResponsiveText>
      </ResponsiveView>

      {/* Instructions */}
      <ResponsiveView marginBottom="lg" alignItems="center">
        <ResponsiveText 
          size="sm" 
          color={colors.textSecondary}
          align="center"
          lineHeight="relaxed"
        >
          1. Open your GCash app{'\n'}
          2. Tap "Scan QR" or "QR Code"{'\n'}
          3. Scan this QR code{'\n'}
          4. Complete the payment
        </ResponsiveText>
      </ResponsiveView>

      {/* Actions */}
      <ResponsiveView flexDirection="row" width="100%">
        <Button
          title="Refresh QR"
          onPress={handleRefresh}
          variant="outline"
          size="medium"
          flex={1}
          marginRight="sm"
        />
        <Button
          title="Cancel"
          onPress={onCancel}
          variant="text"
          size="medium"
          flex={1}
          marginLeft="sm"
        />
      </ResponsiveView>
    </ResponsiveView>
  );
};

const styles = StyleSheet.create({
  qrCodeContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrCode: {
    width: Responsive.responsiveValue(200, 220, 240, 260),
    height: Responsive.responsiveValue(200, 220, 240, 260),
  },
});
