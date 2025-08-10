import { apiService } from './apiService';
import { User, Restaurant, LoginCredentials, ApiResponse } from '@/types';

class AuthService {
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; restaurant: Restaurant; token: string }>> {
    return apiService.post('/auth/login', credentials);
  }

  async logout(): Promise<ApiResponse<void>> {
    return apiService.post('/auth/logout');
  }

  async verifyToken(): Promise<ApiResponse<boolean>> {
    return apiService.get('/auth/verify');
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return apiService.post('/auth/refresh');
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return apiService.put('/auth/profile', userData);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiService.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    return apiService.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiService.post('/auth/reset-password', { token, newPassword });
  }

  async enable2FA(method: 'SMS' | 'EMAIL' | 'TOTP'): Promise<ApiResponse<{ secret: string; qrCodeUrl?: string }>> {
    return apiService.post('/auth/2fa/enable', { method });
  }

  async verify2FA(code: string, method: 'SMS' | 'EMAIL' | 'TOTP'): Promise<ApiResponse<{ backupCodes: string[] }>> {
    return apiService.post('/auth/2fa/verify', { code, method });
  }

  async disable2FA(): Promise<ApiResponse<void>> {
    return apiService.post('/auth/2fa/disable');
  }
}

export const authService = new AuthService();