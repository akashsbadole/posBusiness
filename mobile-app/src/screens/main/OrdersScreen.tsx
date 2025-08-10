import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const OrdersScreen = () => {
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, selectedStatus]);

  const loadOrders = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockOrders = [
        { id: '1', orderNumber: 'ORD-001', customer: 'John Doe', amount: 1250, status: 'DELIVERED', time: '2:30 PM', items: 3 },
        { id: '2', orderNumber: 'ORD-002', customer: 'Jane Smith', amount: 890, status: 'PREPARING', time: '2:45 PM', items: 2 },
        { id: '3', orderNumber: 'ORD-003', customer: 'Bob Johnson', amount: 2100, status: 'CONFIRMED', time: '3:00 PM', items: 4 },
        { id: '4', orderNumber: 'ORD-004', customer: 'Alice Brown', amount: 650, status: 'READY', time: '3:15 PM', items: 1 },
        { id: '5', orderNumber: 'ORD-005', customer: 'Charlie Wilson', amount: 1800, status: 'PENDING', time: '3:30 PM', items: 3 },
      ];
      setOrders(mockOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    setFilteredOrders(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return colors.success;
      case 'PREPARING': return colors.warning;
      case 'CONFIRMED': return colors.primary;
      case 'READY': return colors.success;
      case 'PENDING': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'checkmark-circle-outline';
      case 'PREPARING': return 'restaurant-outline';
      case 'CONFIRMED': return 'checkmark-outline';
      case 'READY': return 'flash-outline';
      case 'PENDING': return 'time-outline';
      default: return 'help-circle-outline';
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'PREPARING', label: 'Preparing' },
    { value: 'READY', label: 'Ready' },
    { value: 'DELIVERED', label: 'Delivered' },
  ];

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    Alert.alert(
      'Update Order Status',
      `Are you sure you want to update this order to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Update', onPress: () => {
          setOrders(orders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
          ));
          Alert.alert('Success', 'Order status updated successfully');
        }}
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        <Button
          title="New Order"
          icon={<Ionicons name="add-outline" size={20} color="#ffffff" />}
          onPress={() => setShowCreateModal(true)}
        />
      </View>

      {/* Search and Filters */}
      <Card style={styles.searchCard} variant="elevated">
        <Input
          placeholder="Search orders..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Ionicons name="search-outline" size={20} color={colors.textSecondary} />}
        />
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statusFilterContainer}
        >
          {statusOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.statusFilter,
                selectedStatus === option.value && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => setSelectedStatus(option.value)}
            >
              <Text style={[
                styles.statusFilterText,
                selectedStatus === option.value && { color: '#ffffff' },
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Card>

      {/* Orders List */}
      <ScrollView
        style={styles.ordersList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredOrders.length === 0 ? (
          <Card style={styles.emptyCard} variant="elevated">
            <Ionicons name="receipt-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No orders found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || selectedStatus !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Create your first order to get started'
              }
            </Text>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} style={styles.orderCard} variant="elevated">
              <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                  <Text style={styles.customerName}>{order.customer}</Text>
                  <Text style={styles.orderTime}>{order.time}</Text>
                </View>
                <View style={styles.orderAmount}>
                  <Text style={styles.amount}>₹{order.amount}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                    <Ionicons name={getStatusIcon(order.status) as any} size={12} color={getStatusColor(order.status)} />
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                      {order.status}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.orderFooter}>
                <Text style={styles.itemsCount}>{order.items} items</Text>
                <View style={styles.orderActions}>
                  {order.status === 'PENDING' && (
                    <Button
                      title="Confirm"
                      variant="outline"
                      size="small"
                      onPress={() => updateOrderStatus(order.id, 'CONFIRMED')}
                    />
                  )}
                  {order.status === 'CONFIRMED' && (
                    <Button
                      title="Start Preparing"
                      variant="outline"
                      size="small"
                      onPress={() => updateOrderStatus(order.id, 'PREPARING')}
                    />
                  )}
                  {order.status === 'PREPARING' && (
                    <Button
                      title="Mark Ready"
                      variant="outline"
                      size="small"
                      onPress={() => updateOrderStatus(order.id, 'READY')}
                    />
                  )}
                  {order.status === 'READY' && (
                    <Button
                      title="Deliver"
                      variant="outline"
                      size="small"
                      onPress={() => updateOrderStatus(order.id, 'DELIVERED')}
                    />
                  )}
                  <Button
                    title="View"
                    variant="ghost"
                    size="small"
                    onPress={() => setSelectedOrder(order)}
                  />
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Create Order Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Order</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Ionicons name="close-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Card style={styles.modalCard} variant="elevated">
              <Text style={styles.modalSectionTitle}>Order Type</Text>
              <View style={styles.orderTypeContainer}>
                {['Dine In', 'Takeaway', 'Delivery'].map((type) => (
                  <TouchableOpacity key={type} style={styles.orderTypeButton}>
                    <Text style={styles.orderTypeText}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            <Card style={styles.modalCard} variant="elevated">
              <Text style={styles.modalSectionTitle}>Customer</Text>
              <Input
                placeholder="Search customer..."
                leftIcon={<Ionicons name="people-outline" size={20} color={colors.textSecondary} />}
              />
            </Card>

            <Card style={styles.modalCard} variant="elevated">
              <Text style={styles.modalSectionTitle}>Items</Text>
              <Button
                title="Add Items"
                variant="outline"
                icon={<Ionicons name="add-outline" size={20} color={colors.primary} />}
              />
            </Card>

            <Button
              title="Create Order"
              onPress={() => {
                setShowCreateModal(false);
                Alert.alert('Success', 'Order created successfully');
              }}
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  searchCard: {
    margin: 16,
    padding: 16,
  },
  statusFilterContainer: {
    marginTop: 16,
  },
  statusFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
  },
  statusFilterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  ordersList: {
    flex: 1,
    padding: 16,
  },
  orderCard: {
    marginBottom: 12,
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  orderTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  orderAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemsCount: {
    fontSize: 14,
    color: '#64748b',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalCard: {
    marginBottom: 16,
    padding: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  orderTypeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  orderTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  orderTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
});

export default OrdersScreen;