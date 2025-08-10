import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const TwoFactorScreen = () => {
  const { colors } = useTheme();
  const [method, setMethod] = useState<'SMS' | 'EMAIL' | 'TOTP'>('SMS');
  const [otpCode, setOtpCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const handleSendCode = async () => {
    if (method === 'SMS' && !phoneNumber) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }
    if (method === 'EMAIL' && !email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsCodeSent(true);
      
      if (method === 'TOTP') {
        setQrCodeUrl('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=OTP_SECRET');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!otpCode) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to main app
      // This would be handled by navigation
      Alert.alert('Success', '2FA verification successful');
    } catch (error) {
      Alert.alert('Error', 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Verification code resent');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.primary, colors.secondary]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <Card style={styles.card}>
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark-outline" size={40} color={colors.primary} />
            </View>
          </View>

          <Text style={styles.title}>Two-Factor Authentication</Text>
          <Text style={styles.subtitle}>
            Choose a verification method to secure your account
          </Text>

          {/* Method Selection */}
          <View style={styles.methodContainer}>
            <TouchableOpacity
              style={[
                styles.methodButton,
                method === 'SMS' && styles.methodButtonActive,
              ]}
              onPress={() => setMethod('SMS')}
            >
              <Ionicons
                name="phone-portrait-outline"
                size={24}
                color={method === 'SMS' ? colors.primary : colors.textSecondary}
              />
              <Text style={[
                styles.methodText,
                method === 'SMS' && styles.methodTextActive,
              ]}>
                SMS
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodButton,
                method === 'EMAIL' && styles.methodButtonActive,
              ]}
              onPress={() => setMethod('EMAIL')}
            >
              <Ionicons
                name="mail-outline"
                size={24}
                color={method === 'EMAIL' ? colors.primary : colors.textSecondary}
              />
              <Text style={[
                styles.methodText,
                method === 'EMAIL' && styles.methodTextActive,
              ]}>
                Email
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodButton,
                method === 'TOTP' && styles.methodButtonActive,
              ]}
              onPress={() => setMethod('TOTP')}
            >
              <Ionicons
                name="qr-code-outline"
                size={24}
                color={method === 'TOTP' ? colors.primary : colors.textSecondary}
              />
              <Text style={[
                styles.methodText,
                method === 'TOTP' && styles.methodTextActive,
              ]}>
                Authenticator
              </Text>
            </TouchableOpacity>
          </View>

          {/* Method-specific inputs */}
          {method === 'SMS' && !isCodeSent && (
            <Input
              label="Phone Number"
              placeholder="+91 98765 43210"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              leftIcon={<Ionicons name="call-outline" size={20} color={colors.textSecondary} />}
            />
          )}

          {method === 'EMAIL' && !isCodeSent && (
            <Input
              label="Email Address"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textSecondary} />}
            />
          )}

          {method === 'TOTP' && qrCodeUrl && (
            <View style={styles.qrContainer}>
              <Text style={styles.qrTitle}>Scan QR Code</Text>
              <Text style={styles.qrSubtitle}>
                Open your authenticator app and scan this QR code
              </Text>
              <View style={styles.qrCodeContainer}>
                <Ionicons name="qr-code" size={120} color={colors.textSecondary} />
              </View>
              <Text style={styles.qrInstructions}>
                Or enter this code manually: ABC123DEF456
              </Text>
            </View>
          )}

          {/* OTP Input */}
          {isCodeSent && (
            <Input
              label="Verification Code"
              placeholder="Enter 6-digit code"
              value={otpCode}
              onChangeText={setOtpCode}
              keyboardType="number-pad"
              maxLength={6}
              leftIcon={<Ionicons name="key-outline" size={20} color={colors.textSecondary} />}
            />
          )}

          {/* Action Buttons */}
          {!isCodeSent ? (
            <Button
              title={isLoading ? "Sending..." : "Send Verification Code"}
              onPress={handleSendCode}
              disabled={isLoading}
            />
          ) : (
            <>
              <Button
                title={isLoading ? "Verifying..." : "Verify Code"}
                onPress={handleVerifyCode}
                disabled={isLoading}
                style={styles.verifyButton}
              />
              
              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendCode}
                disabled={isLoading}
              >
                <Text style={styles.resendText}>Resend Code</Text>
              </TouchableOpacity>
            </>
          )}

          {isLoading && (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          )}

          {/* Skip for demo */}
          <TouchableOpacity style={styles.skipButton}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </Card>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    padding: 24,
    borderRadius: 16,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  methodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  methodButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    marginHorizontal: 4,
  },
  methodButtonActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  methodText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    fontWeight: '500',
  },
  methodTextActive: {
    color: '#2563eb',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  qrSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
  },
  qrCodeContainer: {
    width: 200,
    height: 200,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  qrInstructions: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  verifyButton: {
    marginBottom: 16,
  },
  resendButton: {
    alignItems: 'center',
    padding: 12,
  },
  resendText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  loader: {
    marginTop: 16,
  },
  skipButton: {
    alignItems: 'center',
    marginTop: 24,
  },
  skipText: {
    fontSize: 14,
    color: '#64748b',
  },
});

export default TwoFactorScreen;