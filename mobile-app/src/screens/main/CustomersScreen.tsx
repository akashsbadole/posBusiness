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

const CustomersScreen = () => {
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [filterByLoyalty, setFilterByLoyalty] = useState('all');

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchQuery, sortBy, filterByLoyalty]);

  const loadCustomers = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockCustomers = [
        { id: '1', name: 'John Doe', email: 'john@example.com', phone: '+91 98765 43210', loyaltyPoints: 150, totalOrders: 12, totalSpent: 15420 },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+91 87654 32109', loyaltyPoints: 320, totalOrders: 25, totalSpent: 28900 },
        { id: '3', name: 'Bob Johnson', email: 'bob@example.com', phone: '+91 76543 21098', loyaltyPoints: 85, totalOrders: 8, totalSpent: 8900 },
        { id: '4', name: 'Alice Brown', email: 'alice@example.com', phone: '+91 65432 10987', loyaltyPoints: 450, totalOrders: 38, totalSpent: 45600 },
        { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', phone: '+91 54321 09876', loyaltyPoints: 200, totalOrders: 18, totalSpent: 22100 },
      ];

      setCustomers(mockCustomers);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const filterCustomers = () => {
    let filtered = [...customers];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery)
      );
    }

    // Loyalty filter
    if (filterByLoyalty !== 'all') {
      filtered = filtered.filter(customer => {
        switch (filterByLoyalty) {
          case 'bronze':
            return customer.loyaltyPoints < 100;
          case 'silver':
            return customer.loyaltyPoints >= 100 && customer.loyaltyPoints < 300;
          case 'gold':
            return customer.loyaltyPoints >= 300 && customer.loyaltyPoints < 500;
          case 'platinum':
            return customer.loyaltyPoints >= 500;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'loyalty':
          return b.loyaltyPoints - a.loyaltyPoints;
        case 'orders':
          return b.totalOrders - a.totalOrders;
        case 'spent':
          return b.totalSpent - a.totalSpent;
        default:
          return 0;
      }
    });

    setFilteredCustomers(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCustomers();
    setRefreshing(false);
  };

  const getLoyaltyTier = (points: number) => {
    if (points < 100) return { tier: 'Bronze', color: '#cd7f32' };
    if (points < 300) return { tier: 'Silver', color: '#c0c0c0' };
    if (points < 500) return { tier: 'Gold', color: '#ffd700' };
    return { tier: 'Platinum', color: '#e5e4e2' };
  };

  const deleteCustomer = (customerId: string) => {
    Alert.alert(
      'Delete Customer',
      'Are you sure you want to delete this customer?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => {
          setCustomers(customers.filter(customer => customer.id !== customerId));
          Alert.alert('Success', 'Customer deleted successfully');
        }}
      ]
    );
  };

  const addLoyaltyPoints = (customerId: string, points: number) => {
    setCustomers(customers.map(customer =>
      customer.id === customerId 
        ? { ...customer, loyaltyPoints: customer.loyaltyPoints + points }
        : customer
    ));
    Alert.alert('Success', `${points} loyalty points added`);
  };

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'loyalty', label: 'Loyalty Points' },
    { value: 'orders', label: 'Total Orders' },
    { value: 'spent', label: 'Total Spent' },
  ];

  const loyaltyFilters = [
    { value: 'all', label: 'All Customers' },
    { value: 'bronze', label: 'Bronze Tier' },
    { value: 'silver', label: 'Silver Tier' },
    { value: 'gold', label: 'Gold Tier' },
    { value: 'platinum', label: 'Platinum Tier' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Customers</Text>
        <Button
          title="Add Customer"
          icon={<Ionicons name="person-add-outline" size={20} color="#ffffff" />}
          onPress={() => setShowAddCustomerModal(true)}
        />
      </View>

      {/* Search and Filters */}
      <Card style={styles.searchCard} variant="elevated">
        <Input
          placeholder="Search customers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Ionicons name="search-outline" size={20} color={colors.textSecondary} />}
        />
        
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {loyaltyFilters.map((filter) => (
              <TouchableOpacity
                key={filter.value}
                style={[
                  styles.filterButton,
                  filterByLoyalty === filter.value && styles.filterButtonActive,
                ]}
                onPress={() => setFilterByLoyalty(filter.value)}
              >
                <Text style={[
                  styles.filterText,
                  filterByLoyalty === filter.value && styles.filterTextActive,
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortButton,
                  sortBy === option.value && styles.sortButtonActive,
                ]}
                onPress={() => setSortBy(option.value)}
              >
                <Text style={[
                  styles.sortText,
                  sortBy === option.value && styles.sortTextActive,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Card>

      {/* Customers List */}
      <ScrollView
        style={styles.customersList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredCustomers.length === 0 ? (
          <Card style={styles.emptyCard} variant="elevated">
            <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No customers found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || filterByLoyalty !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Add your first customer to get started'
              }
            </Text>
          </Card>
        ) : (
          <View style={styles.customersGrid}>
            {filteredCustomers.map((customer) => {
              const loyaltyTier = getLoyaltyTier(customer.loyaltyPoints);
              return (
                <Card key={customer.id} style={styles.customerCard} variant="elevated">
                  <View style={styles.customerHeader}>
                    <View style={styles.customerInfo}>
                      <View style={styles.customerNameRow}>
                        <Text style={styles.customerName}>{customer.name}</Text>
                        <View style={[styles.loyaltyBadge, { backgroundColor: loyaltyTier.color + '20' }]}>
                          <Text style={[styles.loyaltyBadgeText, { color: loyaltyTier.color }]}>
                            {loyaltyTier.tier}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.customerEmail}>{customer.email}</Text>
                      <Text style={styles.customerPhone}>{customer.phone}</Text>
                    </View>
                    <View style={styles.customerStats}>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{customer.loyaltyPoints}</Text>
                        <Text style={styles.statLabel}>Points</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{customer.totalOrders}</Text>
                        <Text style={styles.statLabel}>Orders</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>₹{customer.totalSpent.toLocaleString()}</Text>
                        <Text style={styles.statLabel}>Spent</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.customerActions}>
                    <Button
                      title="View Orders"
                      variant="outline"
                      size="small"
                      onPress={() => {
                        setSelectedCustomer(customer);
                        Alert.alert('Customer Orders', `View orders for ${customer.name}`);
                      }}
                    />
                    <Button
                      title="Add Points"
                      variant="outline"
                      size="small"
                      onPress={() => {
                        Alert.prompt(
                          'Add Loyalty Points',
                          'Enter points to add:',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Add', onPress: (points) => {
                              if (points) {
                                addLoyaltyPoints(customer.id, parseInt(points));
                              }
                            }}
                          ],
                          'plain-text',
                          '10'
                        );
                      }}
                    />
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => {
                        Alert.alert('Edit Customer', `Edit ${customer.name}`);
                      }}
                    >
                      <Ionicons name="create-outline" size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => deleteCustomer(customer.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Add Customer Modal */}
      <Modal
        visible={showAddCustomerModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Customer</Text>
            <TouchableOpacity onPress={() => setShowAddCustomerModal(false)}>
              <Ionicons name="close-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Card style={styles.modalCard} variant="elevated">
              <Text style={styles.modalSectionTitle}>Personal Information</Text>
              <Input
                label="Full Name"
                placeholder="Enter customer name"
              />
              <Input
                label="Email Address"
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input
                label="Phone Number"
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            </Card>

            <Card style={styles.modalCard} variant="elevated">
              <Text style={styles.modalSectionTitle}>Address</Text>
              <Input
                label="Address"
                placeholder="Enter address"
              />
              <Input
                label="City"
                placeholder="Enter city"
              />
              <Input
                label="State"
                placeholder="Enter state"
              />
              <Input
                label="PIN Code"
                placeholder="Enter PIN code"
                keyboardType="number-pad"
              />
            </Card>

            <Card style={styles.modalCard} variant="elevated">
              <Text style={styles.modalSectionTitle}>Initial Loyalty Points</Text>
              <Input
                placeholder="Enter initial points"
                keyboardType="numeric"
                defaultValue="0"
              />
            </Card>

            <Button
              title="Add Customer"
              onPress={() => {
                setShowAddCustomerModal(false);
                Alert.alert('Success', 'Customer added successfully');
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
  filtersContainer: {
    marginTop: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  sortContainer: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginRight: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
  },
  sortButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  sortText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  sortTextActive: {
    color: '#ffffff',
  },
  customersList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  customersGrid: {
    gap: 12,
  },
  customerCard: {
    padding: 16,
  },
  customerHeader: {
    marginBottom: 16,
  },
  customerInfo: {
    marginBottom: 16,
  },
  customerNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  loyaltyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  loyaltyBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  customerEmail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: '#64748b',
  },
  customerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  customerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default CustomersScreen;