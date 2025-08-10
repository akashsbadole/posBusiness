import { usePOSStore } from '@/store';
import { Category, MenuItem } from '@/types';

export const useMenu = () => {
  const {
    categories,
    menuItems,
    selectedCategory,
    setCategories,
    setMenuItems,
    setSelectedCategory,
    addCategory,
    updateCategory,
    deleteCategory,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    setLoading,
    setError,
    showToast
  } = usePOSStore();

  const fetchMenu = async (restaurantId: string) => {
    try {
      setLoading(true);
      // This would integrate with your API service
      // const [categoriesResponse, menuItemsResponse] = await Promise.all([
      //   apiService.get(`/categories?restaurantId=${restaurantId}`),
      //   apiService.get(`/menu-items?restaurantId=${restaurantId}`)
      // ]);
      
      // if (categoriesResponse.success) {
      //   setCategories(categoriesResponse.data);
      // }
      // if (menuItemsResponse.success) {
      //   setMenuItems(menuItemsResponse.data);
      // }
      
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCategories([]);
      setMenuItems([]);
    } catch (error) {
      setError('Failed to fetch menu');
      showToast('Failed to fetch menu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData: Partial<Category>) => {
    try {
      setLoading(true);
      // This would integrate with your API service
      // const response = await apiService.post('/categories', categoryData);
      // if (response.success) {
      //   addCategory(response.data);
      //   return response.data;
      // }
      
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const newCategory: Category = {
        ...categoryData,
        id: Date.now().toString(),
        displayOrder: categories.length + 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Category;
      
      addCategory(newCategory);
      showToast('Category created successfully', 'success');
      return newCategory;
    } catch (error) {
      setError('Failed to create category');
      showToast('Failed to create category', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCategoryById = async (categoryId: string, updates: Partial<Category>) => {
    try {
      setLoading(true);
      // This would integrate with your API service
      // const response = await apiService.put(`/categories/${categoryId}`, updates);
      // if (response.success) {
      //   updateCategory(categoryId, updates);
      // }
      
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      updateCategory(categoryId, updates);
      showToast('Category updated successfully', 'success');
    } catch (error) {
      setError('Failed to update category');
      showToast('Failed to update category', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteCategoryById = async (categoryId: string) => {
    try {
      setLoading(true);
      // This would integrate with your API service
      // await apiService.delete(`/categories/${categoryId}`);
      
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      deleteCategory(categoryId);
      showToast('Category deleted successfully', 'success');
    } catch (error) {
      setError('Failed to delete category');
      showToast('Failed to delete category', 'error');
    } finally {
      setLoading(false);
    }
  };

  const createMenuItem = async (itemData: Partial<MenuItem>) => {
    try {
      setLoading(true);
      // This would integrate with your API service
      // const response = await apiService.post('/menu-items', itemData);
      // if (response.success) {
      //   addMenuItem(response.data);
      //   return response.data;
      // }
      
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const newItem: MenuItem = {
        ...itemData,
        id: Date.now().toString(),
        isActive: true,
        isAvailable: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as MenuItem;
      
      addMenuItem(newItem);
      showToast('Menu item created successfully', 'success');
      return newItem;
    } catch (error) {
      setError('Failed to create menu item');
      showToast('Failed to create menu item', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateMenuItemById = async (itemId: string, updates: Partial<MenuItem>) => {
    try {
      setLoading(true);
      // This would integrate with your API service
      // const response = await apiService.put(`/menu-items/${itemId}`, updates);
      // if (response.success) {
      //   updateMenuItem(itemId, updates);
      // }
      
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      updateMenuItem(itemId, updates);
      showToast('Menu item updated successfully', 'success');
    } catch (error) {
      setError('Failed to update menu item');
      showToast('Failed to update menu item', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteMenuItemById = async (itemId: string) => {
    try {
      setLoading(true);
      // This would integrate with your API service
      // await apiService.delete(`/menu-items/${itemId}`);
      
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      deleteMenuItem(itemId);
      showToast('Menu item deleted successfully', 'success');
    } catch (error) {
      setError('Failed to delete menu item');
      showToast('Failed to delete menu item', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectCategory = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const getFilteredMenuItems = () => {
    if (!selectedCategory) {
      return menuItems;
    }
    return menuItems.filter(item => item.categoryId === selectedCategory);
  };

  const getItemsByCategory = (categoryId: string) => {
    return menuItems.filter(item => item.categoryId === categoryId);
  };

  return {
    // State
    categories,
    menuItems,
    selectedCategory,
    
    // Actions
    fetchMenu,
    createCategory,
    updateCategoryById,
    deleteCategoryById,
    createMenuItem,
    updateMenuItemById,
    deleteMenuItemById,
    selectCategory,
    setSelectedCategory,
    
    // Computed
    filteredMenuItems: getFilteredMenuItems(),
    menuCount: menuItems.length,
    categoryCount: categories.length,
    getItemsByCategory,
  };
};