import QRCode from 'qrcode';

export interface QRCodeData {
  qrCodeUrl: string;
  qrCodeData: string;
  expiresAt: Date;
}

export class QRCodeService {
  // Generate QR code for payment
  static async generatePaymentQRCode(
    orderId: string, 
    amount: number, 
    merchantName: string = 'Pizza Palace'
  ): Promise<QRCodeData> {
    try {
      // Create QR code data with payment information
      const qrData = {
        type: 'payment',
        orderId,
        amount,
        merchant: merchantName,
        timestamp: new Date().toISOString(),
        expiresIn: 15 // 15 minutes
      };

      const qrCodeData = JSON.stringify(qrData);
      
      // Generate QR code as data URL
      const qrCodeUrl = await QRCode.toDataURL(qrCodeData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      // Set expiration time (15 minutes from now)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);

      return {
        qrCodeUrl,
        qrCodeData,
        expiresAt
      };
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  // Generate QR code for order tracking
  static async generateOrderTrackingQRCode(orderId: string): Promise<string> {
    try {
      const trackingData = {
        type: 'tracking',
        orderId,
        timestamp: new Date().toISOString()
      };

      const qrCodeData = JSON.stringify(trackingData);
      
      return await QRCode.toDataURL(qrCodeData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('Error generating tracking QR code:', error);
      throw new Error('Failed to generate tracking QR code');
    }
  }

  // Check if QR code is expired
  static isQRCodeExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  // Format QR code data for display
  static formatQRCodeData(qrCodeData: string): any {
    try {
      return JSON.parse(qrCodeData);
    } catch (error) {
      console.error('Error parsing QR code data:', error);
      return null;
    }
  }
}
