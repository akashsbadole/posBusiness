import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const { colors } = useTheme();
  const { user, restaurant } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    todayRevenue: 0,
    todayOrders: 0,
    todayCustomers: 0,
    tableOccupancy: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStats({
        todayRevenue: 15420,
        todayOrders: 45,
        todayCustomers: 32,
        tableOccupancy: 75,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const statCards = [
    {
      title: "Today's Revenue",
      value: `₹${stats.todayRevenue.toLocaleString('en-IN')}`,
      change: "+12.5%",
      icon: 'trending-up-outline',
      color: colors.success,
      gradient: [colors.success + '20', colors.success + '10'],
    },
    {
      title: "Orders",
      value: stats.todayOrders.toString(),
      change: "+8.2%",
      icon: 'receipt-outline',
      color: colors.primary,
      gradient: [colors.primary + '20', colors.primary + '10'],
    },
    {
      title: "Customers",
      value: stats.todayCustomers.toString(),
      change: "+5.1%",
      icon: 'people-outline',
      color: colors.secondary,
      gradient: [colors.secondary + '20', colors.secondary + '10'],
    },
    {
      title: "Table Occupancy",
      value: `${stats.tableOccupancy}%`,
      change: "+2.3%",
      icon: 'grid-outline',
      color: colors.warning,
      gradient: [colors.warning + '20', colors.warning + '10'],
    },
  ];

  const quickActions = [
    {
      title: 'New Order',
      icon: 'add-circle-outline',
      color: colors.primary,
      onPress: () => console.log('New Order'),
    },
    {
      title: 'View Menu',
      icon: 'restaurant-outline',
      color: colors.secondary,
      onPress: () => console.log('View Menu'),
    },
    {
      title: 'Add Customer',
      icon: 'person-add-outline',
      color: colors.success,
      onPress: () => console.log('Add Customer'),
    },
    {
      title: 'View Reports',
      icon: 'bar-chart-outline',
      color: colors.warning,
      onPress: () => console.log('View Reports'),
    },
  ];

  const recentOrders = [
    { id: '1', orderNumber: 'ORD-001', customer: 'John Doe', amount: 1250, status: 'DELIVERED' },
    { id: '2', orderNumber: 'ORD-002', customer: 'Jane Smith', amount: 890, status: 'PREPARING' },
    { id: '3', orderNumber: 'ORD-003', customer: 'Bob Johnson', amount: 2100, status: 'CONFIRMED' },
    { id: '4', orderNumber: 'ORD-004', customer: 'Alice Brown', amount: 650, status: 'READY' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return colors.success;
      case 'PREPARING': return colors.warning;
      case 'CONFIRMED': return colors.primary;
      case 'READY': return colors.success;
      default: return colors.textSecondary;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.restaurantName}>{restaurant?.name}</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-circle-outline" size={40} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        {statCards.map((stat, index) => (
          <Card key={index} style={styles.statCard} variant="elevated">
            <LinearGradient
              colors={stat.gradient}
              style={styles.statCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.statCardContent}>
                <View style={styles.statIconContainer}>
                  <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                </View>
                <View style={styles.statTextContainer}>
                  <Text style={styles.statTitle}>{stat.title}</Text>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={[styles.statChange, { color: stat.color }]}>
                    {stat.change}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Card>
        ))}
      </View>

      {/* Quick Actions */}
      <Card style={styles.sectionCard} variant="elevated">
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsContainer}>
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

      {/* Recent Orders */}
      <Card style={styles.sectionCard} variant="elevated">
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.recentOrdersContainer}>
          {recentOrders.map((order) => (
            <View key={order.id} style={styles.orderItem}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                <Text style={styles.customerName}>{order.customer}</Text>
              </View>
              <View style={styles.orderDetails}>
                <Text style={styles.orderAmount}>₹{order.amount}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {order.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </Card>

      {/* Business Insights */}
      <Card style={styles.sectionCard} variant="elevated">
        <Text style={styles.sectionTitle}>Business Insights</Text>
        <View style={styles.insightsContainer}>
          <View style={styles.insightItem}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <View style={styles.insightText}>
              <Text style={styles.insightTitle}>Peak Hours</Text>
              <Text style={styles.insightValue}>7-9 PM</Text>
            </View>
          </View>
          <View style={styles.insightItem}>
            <Ionicons name="star-outline" size={20} color={colors.warning} />
            <View style={styles.insightText}>
              <Text style={styles.insightTitle}>Popular Item</Text>
              <Text style={styles.insightValue}>Butter Chicken</Text>
            </View>
          </View>
          <View style={styles.insightItem}>
            <Ionicons name="trending-up-outline" size={20} color={colors.success} />
            <View style={styles.insightText}>
              <Text style={styles.insightTitle}>Growth Rate</Text>
              <Text style={styles.insightValue}>+15.3%</Text>
            </View>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  restaurantName: {
    fontSize: 16,
    color: '#64748b',
  },
  profileButton: {
    padding: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 64) / 2,
    minHeight: 120,
    padding: 0,
    overflow: 'hidden',
  },
  statCardGradient: {
    flex: 1,
    borderRadius: 12,
  },
  statCardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statTextContainer: {
    flex: 1,
  },
  statTitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  statChange: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    minWidth: (width - 64) / 4,
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
  recentOrdersContainer: {
    gap: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  customerName: {
    fontSize: 14,
    color: '#64748b',
  },
  orderDetails: {
    alignItems: 'flex-end',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  insightsContainer: {
    gap: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
  },
  insightText: {
    marginLeft: 12,
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  insightValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
});

export default DashboardScreen;