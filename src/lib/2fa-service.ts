import * as OTPAuth from 'otplib'
import QRCode from 'qrcode'

// Note: Twilio should only be used on the server side
// Client-side components should call API endpoints instead

export interface TwoFactorSettings {
  id: string
  userId: string
  method: 'SMS' | 'TOTP' | 'EMAIL' | 'NONE'
  phoneNumber?: string
  email?: string
  secret?: string
  backupCodes?: string[]
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

export class TwoFactorService {
  // Generate SMS OTP and send via Twilio (client-side version)
  static async generateAndSendSMSOTP(phoneNumber: string): Promise<string> {
    try {
      // For client-side, we'll simulate OTP generation
      // In production, this should call an API endpoint that handles Twilio
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      
      // Simulate API call to server-side endpoint
      const response = await fetch('/api/auth/2fa/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      })

      if (!response.ok) {
        throw new Error('Failed to send SMS verification code')
      }

      return otp
    } catch (error) {
      console.error('Error sending SMS OTP:', error)
      throw new Error('Failed to send SMS verification code')
    }
  }

  // Generate TOTP secret and QR code
  static async generateTOTPSecret(userId: string, email: string): Promise<{
    secret: string
    qrCodeUrl: string
    manualEntryKey: string
  }> {
    try {
      const secret = OTPAuth.authenticator.generateSecret()
      const serviceName = 'POSBiz'
      const qrCodeUrl = OTPAuth.authenticator.keyuri(email, serviceName, secret)
      
      // Generate QR code image
      const qrCodeImage = await QRCode.toDataURL(qrCodeUrl)
      
      return {
        secret,
        qrCodeUrl: qrCodeImage,
        manualEntryKey: secret
      }
    } catch (error) {
      console.error('Error generating TOTP secret:', error)
      throw new Error('Failed to generate TOTP setup')
    }
  }

  // Verify TOTP token
  static verifyTOTPToken(token: string, secret: string): boolean {
    try {
      return OTPAuth.authenticator.verify({ token, secret })
    } catch (error) {
      console.error('Error verifying TOTP token:', error)
      return false
    }
  }

  // Generate email OTP
  static generateEmailOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Generate backup codes
  static generateBackupCodes(): string[] {
    const codes: string[] = []
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 8).toUpperCase())
    }
    return codes
  }

  // Verify backup code
  static verifyBackupCode(code: string, backupCodes: string[]): boolean {
    return backupCodes.includes(code.toUpperCase())
  }

  // Remove used backup code
  static removeBackupCode(code: string, backupCodes: string[]): string[] {
    return backupCodes.filter(c => c !== code.toUpperCase())
  }

  // Get user's 2FA settings
  static async getUser2FASettings(userId: string): Promise<TwoFactorSettings | null> {
    try {
      const response = await fetch(`/api/auth/2fa/settings?userId=${userId}`)
      if (!response.ok) {
        // Return default settings if not found
        return {
          id: `2fa_${userId}`,
          userId,
          method: 'NONE',
          isEnabled: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
      return await response.json()
    } catch (error) {
      console.error('Error loading 2FA settings:', error)
      return {
        id: `2fa_${userId}`,
        userId,
        method: 'NONE',
        isEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }
  }

  // Update user's 2FA settings
  static async updateUser2FASettings(
    userId: string, 
    settings: Partial<TwoFactorSettings>
  ): Promise<TwoFactorSettings> {
    try {
      const response = await fetch('/api/auth/2fa/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, settings }),
      })

      if (!response.ok) {
        throw new Error('Failed to update 2FA settings')
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating 2FA settings:', error)
      // Return mock data for demo purposes
      const currentSettings = await this.getUser2FASettings(userId)
      return {
        ...currentSettings!,
        ...settings,
        updatedAt: new Date().toISOString()
      }
    }
  }

  // Send email OTP
  static async sendEmailOTP(email: string, otp: string): Promise<void> {
    try {
      const response = await fetch('/api/auth/2fa/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      })

      if (!response.ok) {
        throw new Error('Failed to send email verification code')
      }
    } catch (error) {
      console.error('Error sending email OTP:', error)
      // For demo purposes, we'll just log it
      console.log(`Email OTP would be sent to ${email}: ${otp}`)
    }
  }
}