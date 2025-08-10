import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const LoginScreen = () => {
  const { login, isLoading, error } = useAuth();
  const { colors, toggleTheme } = useTheme();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  const demoAccounts = [
    {
      id: 'admin',
      email: 'admin@posbiz.com',
      password: 'admin123',
      role: 'Super Admin',
      description: 'Full system access with all permissions',
      badge: 'ADMIN',
      color: 'bg-red-50 border-red-200',
    },
    {
      id: 'manager',
      email: 'manager@restaurant.com',
      password: 'manager123',
      role: 'Restaurant Manager',
      description: 'Manage restaurant operations and staff',
      badge: 'MANAGER',
      color: 'bg-blue-50 border-blue-200',
    },
    {
      id: 'staff',
      email: 'staff@restaurant.com',
      password: 'staff123',
      role: 'Staff Member',
      description: 'Daily operations and order management',
      badge: 'STAFF',
      color: 'bg-green-50 border-green-200',
    },
    {
      id: 'demo',
      email: 'demo@posbiz.com',
      password: 'demo123',
      role: 'Demo Account',
      description: 'Testing and exploration access',
      badge: 'DEMO',
      color: 'bg-purple-50 border-purple-200',
    },
  ];

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleQuickLogin = (email: string, password: string) => {
    setFormData({ ...formData, email, password });
    setTimeout(() => {
      handleLogin();
    }, 100);
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>P</Text>
            </View>
            <Text style={styles.title}>POSBiz</Text>
            <Text style={styles.subtitle}>Business Management System</Text>
          </View>

          {/* Login Form */}
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Welcome Back</Text>
            <Text style={styles.formSubtitle}>Sign in to your account to continue</Text>

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={20} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Input
              label="Email Address"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textSecondary} />}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry={!showPassword}
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              }
            />

            <View style={styles.rememberContainer}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setFormData({ ...formData, rememberMe: !formData.rememberMe })}
              >
                <View style={[styles.checkbox, formData.rememberMe && styles.checkboxChecked]}>
                  {formData.rememberMe && (
                    <Ionicons name="checkmark" size={16} color="#ffffff" />
                  )}
                </View>
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            <Button
              title={isLoading ? "Signing in..." : "Sign In"}
              onPress={handleLogin}
              disabled={isLoading}
              style={styles.loginButton}
            />

            {isLoading && (
              <ActivityIndicator color={colors.primary} style={styles.loader} />
            )}
          </Card>

          {/* Demo Accounts */}
          <Card style={styles.demoCard}>
            <Text style={styles.demoTitle}>Demo Accounts</Text>
            <Text style={styles.demoSubtitle}>Quick access with demo credentials</Text>

            <View style={styles.demoAccountsContainer}>
              {demoAccounts.map((account) => (
                <TouchableOpacity
                  key={account.id}
                  style={[
                    styles.demoAccount,
                    selectedDemo === account.id && styles.demoAccountSelected,
                  ]}
                  onPress={() => {
                    setSelectedDemo(account.id);
                    handleQuickLogin(account.email, account.password);
                  }}
                >
                  <View style={styles.demoAccountHeader}>
                    <Text style={styles.demoAccountRole}>{account.role}</Text>
                    <View style={styles.demoBadge}>
                      <Text style={styles.demoBadgeText}>{account.badge}</Text>
                    </View>
                  </View>
                  <Text style={styles.demoAccountDescription}>{account.description}</Text>
                  <View style={styles.demoAccountFooter}>
                    <Text style={styles.demoAccountEmail}>{account.email}</Text>
                    <Text style={styles.demoAccountPassword}>{account.password}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Theme Toggle */}
          <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
            <Ionicons
              name={colors.theme === 'light' ? 'moon-outline' : 'sunny-outline'}
              size={20}
              color={colors.text}
            />
            <Text style={styles.themeToggleText}>
              {colors.theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  formCard: {
    padding: 24,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginLeft: 8,
  },
  rememberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  rememberText: {
    fontSize: 14,
    color: '#64748b',
  },
  forgotText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  loginButton: {
    marginBottom: 16,
  },
  loader: {
    marginTop: 16,
  },
  demoCard: {
    padding: 20,
    marginBottom: 20,
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  demoSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  demoAccountsContainer: {
    gap: 12,
  },
  demoAccount: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  demoAccountSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  demoAccountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoAccountRole: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  demoBadge: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  demoBadgeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  demoAccountDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  demoAccountFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  demoAccountEmail: {
    fontSize: 12,
    color: '#64748b',
  },
  demoAccountPassword: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    alignSelf: 'center',
  },
  themeToggleText: {
    fontSize: 14,
    color: '#ffffff',
    marginLeft: 8,
  },
});

export default LoginScreen;