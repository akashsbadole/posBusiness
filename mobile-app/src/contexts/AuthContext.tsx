import React, { createContext, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User, Restaurant, AuthState, LoginCredentials } from '@/types';
import { authService } from '@/services/authService';
import { apiService } from '@/services/apiService';
import { usePOSStore } from '@/store';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    auth, 
    setUser, 
    setRestaurant, 
    setToken, 
    setIsAuthenticated, 
    setAuthLoading, 
    setError,
    showToast 
  } = usePOSStore();

  const login = async (credentials: LoginCredentials) => {
    try {
      setAuthLoading(true);
      
      const response = await authService.login(credentials);
      
      if (response.success && response.data) {
        const { user, restaurant, token } = response.data;
        
        // Store token securely
        await SecureStore.setItemAsync('auth_token', token);
        await SecureStore.setItemAsync('user_data', JSON.stringify(user));
        await SecureStore.setItemAsync('restaurant_data', JSON.stringify(restaurant));
        
        // Set API token
        apiService.setAuthToken(token);
        
        // Update Zustand store
        setUser(user);
        setRestaurant(restaurant);
        setToken(token);
        setIsAuthenticated(true);
        setAuthLoading(false);
        
        showToast('Login successful!', 'success');
      } else {
        setError(response.error || 'Login failed');
        showToast(response.error || 'Login failed', 'error');
      }
    } catch (error) {
      setError('An error occurred during login');
      showToast('An error occurred during login', 'error');
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear secure storage
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('user_data');
      await SecureStore.deleteItemAsync('restaurant_data');
      
      // Clear API token
      apiService.setAuthToken(null);
      
      // Update Zustand store
      setUser(null);
      setRestaurant(null);
      setToken(null);
      setIsAuthenticated(false);
      setAuthLoading(false);
      
      showToast('Logged out successfully', 'info');
    }
  };

  const checkAuth = async () => {
    try {
      setAuthLoading(true);
      
      const token = await SecureStore.getItemAsync('auth_token');
      const userData = await SecureStore.getItemAsync('user_data');
      const restaurantData = await SecureStore.getItemAsync('restaurant_data');
      
      if (token && userData && restaurantData) {
        const user = JSON.parse(userData);
        const restaurant = JSON.parse(restaurantData);
        
        // Set API token
        apiService.setAuthToken(token);
        
        // Verify token is still valid
        const isValid = await authService.verifyToken();
        
        if (isValid) {
          setUser(user);
          setRestaurant(restaurant);
          setToken(token);
          setIsAuthenticated(true);
          setAuthLoading(false);
        } else {
          await logout();
        }
      } else {
        setUser(null);
        setRestaurant(null);
        setToken(null);
        setIsAuthenticated(false);
        setAuthLoading(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      await logout();
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      const response = await authService.updateProfile(userData);
      if (response.success && response.data) {
        const updatedUser = { ...auth.user, ...response.data };
        await SecureStore.setItemAsync('user_data', JSON.stringify(updatedUser));
        setUser(updatedUser);
        showToast('Profile updated successfully', 'success');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      showToast('Failed to update profile', 'error');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        login,
        logout,
        checkAuth,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};