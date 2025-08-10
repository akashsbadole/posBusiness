import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const MenuScreen = () => {
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadMenuData();
  }, []);

  useEffect(() => {
    filterMenuItems();
  }, [menuItems, selectedCategory, searchQuery]);

  const loadMenuData = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockCategories = [
        { id: '1', name: 'Starters', itemCount: 8 },
        { id: '2', name: 'Main Course', itemCount: 12 },
        { id: '3', name: 'Desserts', itemCount: 6 },
        { id: '4', name: 'Beverages', itemCount: 10 },
        { id: '5', name: 'Specials', itemCount: 4 },
      ];

      const mockMenuItems = [
        { id: '1', name: 'Paneer Tikka', price: 299, category: 'Starters', available: true, image: null },
        { id: '2', name: 'Butter Chicken', price: 399, category: 'Main Course', available: true, image: null },
        { id: '3', name: 'Biryani', price: 349, category: 'Main Course', available: true, image: null },
        { id: '4', name: 'Gulab Jamun', price: 99, category: 'Desserts', available: true, image: null },
        { id: '5', name: 'Masala Chai', price: 49, category: 'Beverages', available: true, image: null },
        { id: '6', name: 'Spring Rolls', price: 199, category: 'Starters', available: false, image: null },
        { id: '7', name: 'Dal Makhani', price: 249, category: 'Main Course', available: true, image: null },
        { id: '8', name: 'Ice Cream', price: 129, category: 'Desserts', available: true, image: null },
      ];

      setCategories(mockCategories);
      setMenuItems(mockMenuItems);
    } catch (error) {
      console.error('Error loading menu data:', error);
    }
  };

  const filterMenuItems = () => {
    let filtered = menuItems;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const [filteredItems, setFilteredItems] = useState([]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMenuData();
    setRefreshing(false);
  };

  const toggleItemAvailability = (itemId: string) => {
    setMenuItems(menuItems.map(item =>
      item.id === itemId ? { ...item, available: !item.available } : item
    ));
  };

  const deleteMenuItem = (itemId: string) => {
    Alert.alert(
      'Delete Menu Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => {
          setMenuItems(menuItems.filter(item => item.id !== itemId));
          Alert.alert('Success', 'Menu item deleted successfully');
        }}
      ]
    );
  };

  const renderMenuItem = (item: any) => (
    <Card key={item.id} style={styles.menuItemCard} variant="elevated">
      <View style={styles.menuItemHeader}>
        <View style={styles.menuItemInfo}>
          <Text style={styles.menuItemName}>{item.name}</Text>
          <Text style={styles.menuItemPrice}>₹{item.price}</Text>
          <Text style={styles.menuItemCategory}>{item.category}</Text>
        </View>
        <View style={styles.menuItemActions}>
          <TouchableOpacity
            style={[styles.availabilityToggle, { backgroundColor: item.available ? colors.success : colors.error }]}
            onPress={() => toggleItemAvailability(item.id)}
          >
            <Ionicons name={item.available ? 'checkmark' : 'close'} size={16} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // Edit item functionality
              Alert.alert('Edit Item', `Edit ${item.name}`);
            }}
          >
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => deleteMenuItem(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.menuItemFooter}>
        <Text style={[
          styles.availabilityText,
          { color: item.available ? colors.success : colors.error }
        ]}>
          {item.available ? 'Available' : 'Unavailable'}
        </Text>
        <Button
          title="Add to Order"
          variant="outline"
          size="small"
          disabled={!item.available}
        />
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Menu</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'grid' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('grid')}
          >
            <Ionicons name="grid-outline" size={20} color={viewMode === 'grid' ? '#ffffff' : colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons name="list-outline" size={20} color={viewMode === 'list' ? '#ffffff' : colors.textSecondary} />
          </TouchableOpacity>
          <Button
            title="Add Item"
            icon={<Ionicons name="add-outline" size={20} color="#ffffff" />}
            onPress={() => setShowAddItemModal(true)}
          />
        </View>
      </View>

      {/* Search */}
      <Card style={styles.searchCard} variant="elevated">
        <Input
          placeholder="Search menu items..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Ionicons name="search-outline" size={20} color={colors.textSecondary} />}
        />
      </Card>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === 'all' && styles.categoryButtonActive,
          ]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text style={[
            styles.categoryText,
            selectedCategory === 'all' && styles.categoryTextActive,
          ]}>
            All Items
          </Text>
          <Text style={styles.categoryCount}>{menuItems.length}</Text>
        </TouchableOpacity>
        
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.name && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category.name)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category.name && styles.categoryTextActive,
            ]}>
              {category.name}
            </Text>
            <Text style={styles.categoryCount}>{category.itemCount}</Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity
          style={[styles.categoryButton, styles.addCategoryButton]}
          onPress={() => setShowAddCategoryModal(true)}
        >
          <Ionicons name="add-outline" size={20} color={colors.primary} />
          <Text style={styles.addCategoryText}>Add Category</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Menu Items */}
      <ScrollView
        style={styles.menuItemsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredItems.length === 0 ? (
          <Card style={styles.emptyCard} variant="elevated">
            <Ionicons name="restaurant-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No menu items found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Add your first menu item to get started'
              }
            </Text>
          </Card>
        ) : (
          <View style={styles.menuItemsGrid}>
            {filteredItems.map(renderMenuItem)}
          </View>
        )}
      </ScrollView>

      {/* Add Item Modal */}
      <Modal
        visible={showAddItemModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Menu Item</Text>
            <TouchableOpacity onPress={() => setShowAddItemModal(false)}>
              <Ionicons name="close-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Card style={styles.modalCard} variant="elevated">
              <Text style={styles.modalSectionTitle}>Item Details</Text>
              <Input
                label="Item Name"
                placeholder="Enter item name"
              />
              <Input
                label="Price"
                placeholder="0.00"
                keyboardType="numeric"
              />
              <Input
                label="Description"
                placeholder="Enter item description"
                multiline
                numberOfLines={3}
              />
            </Card>

            <Card style={styles.modalCard} variant="elevated">
              <Text style={styles.modalSectionTitle}>Category</Text>
              <View style={styles.categorySelectContainer}>
                {categories.map((category) => (
                  <TouchableOpacity key={category.id} style={styles.categorySelectButton}>
                    <Text style={styles.categorySelectText}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            <Card style={styles.modalCard} variant="elevated">
              <Text style={styles.modalSectionTitle}>Image</Text>
              <TouchableOpacity style={styles.imageUploadButton}>
                <Ionicons name="camera-outline" size={24} color={colors.textSecondary} />
                <Text style={styles.imageUploadText}>Add Image</Text>
              </TouchableOpacity>
            </Card>

            <Button
              title="Add Menu Item"
              onPress={() => {
                setShowAddItemModal(false);
                Alert.alert('Success', 'Menu item added successfully');
              }}
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        visible={showAddCategoryModal}
        animationType="slide"
        presentationStyle="formSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Category</Text>
            <TouchableOpacity onPress={() => setShowAddCategoryModal(false)}>
              <Ionicons name="close-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Card style={styles.modalCard} variant="elevated">
              <Input
                label="Category Name"
                placeholder="Enter category name"
              />
              <Input
                label="Description"
                placeholder="Enter category description"
                multiline
                numberOfLines={2}
              />
            </Card>

            <Button
              title="Add Category"
              onPress={() => {
                setShowAddCategoryModal(false);
                Alert.alert('Success', 'Category added successfully');
              }}
            />
          </View>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewModeButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewModeButtonActive: {
    backgroundColor: '#2563eb',
  },
  searchCard: {
    margin: 16,
    padding: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
    minWidth: 100,
  },
  categoryButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginRight: 8,
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  categoryCount: {
    fontSize: 12,
    color: '#94a3b8',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  addCategoryButton: {
    backgroundColor: '#f0f9ff',
    borderColor: '#2563eb',
  },
  addCategoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563eb',
    marginLeft: 4,
  },
  menuItemsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  menuItemsGrid: {
    gap: 12,
  },
  menuItemCard: {
    padding: 16,
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  menuItemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  menuItemPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 2,
  },
  menuItemCategory: {
    fontSize: 12,
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  menuItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  availabilityToggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '500',
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
  categorySelectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categorySelectButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categorySelectText: {
    fontSize: 14,
    color: '#64748b',
  },
  imageUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  imageUploadText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
  },
});

export default MenuScreen;