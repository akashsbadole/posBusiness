import { useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-auth';

export const useBiometrics = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [supportedTypes, setSupportedTypes] = useState<LocalAuthentication.AuthenticationType[]>([]);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const available = await LocalAuthentication.hasHardwareAsync();
      setIsAvailable(available);

      if (available) {
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsEnrolled(enrolled);

        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        setSupportedTypes(types);
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
    }
  };

  const authenticate = async (promptMessage: string = 'Authenticate to continue'): Promise<boolean> => {
    try {
      if (!isAvailable || !isEnrolled) {
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Use password',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  };

  const getBiometricType = (): string => {
    if (!isAvailable) return 'Not available';
    if (!isEnrolled) return 'Not enrolled';

    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Fingerprint';
    }
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACE_ID)) {
      return 'Face ID';
    }
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris';
    }
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face Recognition';
    }

    return 'Biometric';
  };

  const getBiometricIcon = (): string => {
    if (!isAvailable || !isEnrolled) return 'lock-closed-outline';

    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'finger-print-outline';
    }
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACE_ID)) {
      return 'person-outline';
    }
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'eye-outline';
    }
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'person-outline';
    }

    return 'lock-closed-outline';
  };

  return {
    isAvailable,
    isEnrolled,
    supportedTypes,
    authenticate,
    getBiometricType,
    getBiometricIcon,
    checkBiometricAvailability,
  };
};