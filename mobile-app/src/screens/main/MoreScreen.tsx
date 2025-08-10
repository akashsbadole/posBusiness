import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const MoreScreen = () => {
  const { colors } = useTheme();
  const { user, restaurant, logout } = useAuth();

  const menuItems = [
    {
      title: 'Settings',
      icon: 'settings-outline',
      color: colors.primary,
      onPress: () => Alert.alert('Settings', 'Settings screen coming soon'),
    },
    {
      title: 'Reports & Analytics',
      icon: 'bar-chart-outline',
      color: colors.secondary,
      onPress: () => Alert.alert('Reports', 'Reports screen coming soon'),
    },
    {
      title: 'Inventory',
      icon: 'cube-outline',
      color: colors.success,
      onPress: () => Alert.alert('Inventory', 'Inventory screen coming soon'),
    },
    {
      title: 'Staff Management',
      icon: 'people-outline',
      color: colors.warning,
      onPress: () => Alert.alert('Staff', 'Staff management coming soon'),
    },
    {
      title: 'Tables & Reservations',
      icon: 'grid-outline',
      color: colors.primary,
      onPress: () => Alert.alert('Tables', 'Tables management coming soon'),
    },
    {
      title: 'Payment Methods',
      icon: 'card-outline',
      color: colors.secondary,
      onPress: () => Alert.alert('Payments', 'Payment methods coming soon'),
    },
    {
      title: 'Notifications',
      icon: 'notifications-outline',
      color: colors.warning,
      onPress: () => Alert.alert('Notifications', 'Notifications settings coming soon'),
    },
    {
      title: 'Help & Support',
      icon: 'help-circle-outline',
      color: colors.success,
      onPress: () => Alert.alert('Support', 'Help & support coming soon'),
    },
    {
      title: 'About',
      icon: 'information-circle-outline',
      color: colors.textSecondary,
      onPress: () => Alert.alert('About', 'POSBiz Mobile App v1.0.0'),
    },
  ];

  const quickActions = [
    {
      title: 'Generate Report',
      icon: 'document-text-outline',
      color: colors.primary,
      onPress: () => Alert.alert('Report', 'Generate report functionality coming soon'),
    },
    {
      title: 'Backup Data',
      icon: 'cloud-upload-outline',
      color: colors.success,
      onPress: () => Alert.alert('Backup', 'Data backup coming soon'),
    },
    {
      title: 'Sync Data',
      icon: 'sync-outline',
      color: colors.warning,
      onPress: () => Alert.alert('Sync', 'Data synchronization coming soon'),
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* User Profile Card */}
      <Card style={styles.profileCard} variant="elevated">
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person-circle-outline" size={60} color={colors.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileRole}>{user?.role}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
        </View>
        
        <View style={styles.profileStats}>
          <View style={styles.profileStat}>
            <Text style={styles.profileStatValue}>{restaurant?.name}</Text>
            <Text style={styles.profileStatLabel}>Business</Text>
          </View>
          <View style={styles.profileStat}>
            <Text style={styles.profileStatValue}>Active</Text>
            <Text style={styles.profileStatLabel}>Status</Text>
          </View>
        </View>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.sectionCard} variant="elevated">
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.quickActionButton, { backgroundColor: action.color + '10' }]}
              onPress={action.onPress}
            >
              <Ionicons name={action.icon as any} size={24} color={action.color} />
              <Text style={[styles.quickActionText, { color: action.color }]}>
                {action.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Menu Items */}
      <Card style={styles.sectionCard} variant="elevated">
        <Text style={styles.sectionTitle}>More Options</Text>
        <View style={styles.menuItemsList}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuItemIcon, { backgroundColor: item.color + '10' }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* App Info */}
      <Card style={styles.sectionCard} variant="elevated">
        <Text style={styles.sectionTitle}>App Information</Text>
        <View style={styles.appInfoContainer}>
          <View style={styles.appInfoItem}>
            <Text style={styles.appInfoLabel}>Version</Text>
            <Text style={styles.appInfoValue}>1.0.0</Text>
          </View>
          <View style={styles.appInfoItem}>
            <Text style={styles.appInfoLabel}>Build</Text>
            <Text style={styles.appInfoValue}>2024.08.10</Text>
          </View>
          <View style={styles.appInfoItem}>
            <Text style={styles.appInfoLabel}>Environment</Text>
            <Text style={styles.appInfoValue}>Development</Text>
          </View>
        </View>
      </Card>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <Button
          title="Logout"
          variant="outline"
          icon={<Ionicons name="log-out-outline" size={20} color={colors.error} />}
          onPress={handleLogout}
          style={styles.logoutButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  profileCard: {
    margin: 16,
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileAvatar: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748b',
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profileStat: {
    alignItems: 'center',
    flex: 1,
  },
  profileStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  profileStatLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  sectionCard: {
    margin: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    minWidth: (328 - 32) / 3,
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  menuItemsList: {
    gap: 0,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  appInfoContainer: {
    gap: 12,
  },
  appInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appInfoLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  appInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  logoutContainer: {
    margin: 16,
    marginBottom: 32,
  },
  logoutButton: {
    borderColor: '#ef4444',
  },
});

export default MoreScreen;