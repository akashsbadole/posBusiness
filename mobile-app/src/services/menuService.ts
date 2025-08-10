import { apiService } from './apiService';
import { MenuItem, Category, CreateMenuItemData, UpdateMenuItemData, ApiResponse, PaginatedResponse, FilterOptions, SortOptions } from '@/types';

class MenuService {
  async getCategories(restaurantId: string): Promise<ApiResponse<Category[]>> {
    return apiService.get<Category[]>(`/restaurants/${restaurantId}/categories`);
  }

  async createCategory(restaurantId: string, categoryData: Omit<Category, 'id' | 'restaurantId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Category>> {
    return apiService.post<Category>(`/restaurants/${restaurantId}/categories`, categoryData);
  }

  async updateCategory(restaurantId: string, categoryId: string, updateData: Partial<Category>): Promise<ApiResponse<Category>> {
    return apiService.put<Category>(`/restaurants/${restaurantId}/categories/${categoryId}`, updateData);
  }

  async deleteCategory(restaurantId: string, categoryId: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/restaurants/${restaurantId}/categories/${categoryId}`);
  }

  async getMenuItems(
    restaurantId: string,
    page: number = 1,
    limit: number = 50,
    filters?: FilterOptions,
    sort?: SortOptions
  ): Promise<ApiResponse<PaginatedResponse<MenuItem>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.dateRange) {
        params.append('startDate', filters.dateRange.start.toISOString());
        params.append('endDate', filters.dateRange.end.toISOString());
      }
    }

    if (sort) {
      params.append('sortBy', sort.field);
      params.append('sortOrder', sort.order);
    }

    return apiService.get<PaginatedResponse<MenuItem>>(`/restaurants/${restaurantId}/menu-items?${params.toString()}`);
  }

  async getMenuItem(restaurantId: string, itemId: string): Promise<ApiResponse<MenuItem>> {
    return apiService.get<MenuItem>(`/restaurants/${restaurantId}/menu-items/${itemId}`);
  }

  async createMenuItem(restaurantId: string, itemData: CreateMenuItemData): Promise<ApiResponse<MenuItem>> {
    return apiService.post<MenuItem>(`/restaurants/${restaurantId}/menu-items`, itemData);
  }

  async updateMenuItem(restaurantId: string, itemId: string, updateData: UpdateMenuItemData): Promise<ApiResponse<MenuItem>> {
    return apiService.put<MenuItem>(`/restaurants/${restaurantId}/menu-items/${itemId}`, updateData);
  }

  async deleteMenuItem(restaurantId: string, itemId: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/restaurants/${restaurantId}/menu-items/${itemId}`);
  }

  async getItemsByCategory(restaurantId: string, categoryId: string): Promise<ApiResponse<MenuItem[]>> {
    return apiService.get<MenuItem[]>(`/restaurants/${restaurantId}/categories/${categoryId}/items`);
  }

  async getAvailableItems(restaurantId: string): Promise<ApiResponse<MenuItem[]>> {
    return apiService.get<MenuItem[]>(`/restaurants/${restaurantId}/menu-items/available`);
  }

  async getPopularItems(restaurantId: string, limit: number = 10): Promise<ApiResponse<MenuItem[]>> {
    return apiService.get<MenuItem[]>(`/restaurants/${restaurantId}/menu-items/popular?limit=${limit}`);
  }

  async getNewItems(restaurantId: string, limit: number = 10): Promise<ApiResponse<MenuItem[]>> {
    return apiService.get<MenuItem[]>(`/restaurants/${restaurantId}/menu-items/new?limit=${limit}`);
  }

  async uploadMenuItemImage(restaurantId: string, itemId: string, imageUri: string): Promise<ApiResponse<{ imageUrl: string }>> {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'menu-item-image.jpg',
    } as any);

    return apiService.post<{ imageUrl: string }>(`/restaurants/${restaurantId}/menu-items/${itemId}/image`, formData);
  }

  async updateMenuItemStock(restaurantId: string, itemId: string, stock: number): Promise<ApiResponse<MenuItem>> {
    return apiService.patch<MenuItem>(`/restaurants/${restaurantId}/menu-items/${itemId}/stock`, { stock });
  }

  async bulkUpdateMenuItemPrices(restaurantId: string, updates: Array<{ itemId: string; price: number }>): Promise<ApiResponse<MenuItem[]>> {
    return apiService.post<MenuItem[]>(`/restaurants/${restaurantId}/menu-items/bulk-update-prices`, { updates });
  }

  async bulkUpdateMenuItemAvailability(restaurantId: string, updates: Array<{ itemId: string; isAvailable: boolean }>): Promise<ApiResponse<MenuItem[]>> {
    return apiService.post<MenuItem[]>(`/restaurants/${restaurantId}/menu-items/bulk-update-availability`, { updates });
  }

  async getMenuStatistics(restaurantId: string): Promise<ApiResponse<{ totalItems: number; availableItems: number; categories: number; popularItems: MenuItem[] }>> {
    return apiService.get<{ totalItems: number; availableItems: number; categories: number; popularItems: MenuItem[] }>(`/restaurants/${restaurantId}/menu/statistics`);
  }

  async searchMenuItems(restaurantId: string, query: string): Promise<ApiResponse<MenuItem[]>> {
    return apiService.get<MenuItem[]>(`/restaurants/${restaurantId}/menu-items/search?q=${encodeURIComponent(query)}`);
  }

  async duplicateMenuItem(restaurantId: string, itemId: string): Promise<ApiResponse<MenuItem>> {
    return apiService.post<MenuItem>(`/restaurants/${restaurantId}/menu-items/${itemId}/duplicate`);
  }

  async exportMenu(restaurantId: string, format: 'csv' | 'excel' = 'csv'): Promise<ApiResponse<{ downloadUrl: string }>> {
    return apiService.get<{ downloadUrl: string }>(`/restaurants/${restaurantId}/menu/export?format=${format}`);
  }

  async importMenu(restaurantId: string, fileUri: string): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: 'text/csv',
      name: 'menu-import.csv',
    } as any);

    return apiService.post<{ imported: number; errors: string[] }>(`/restaurants/${restaurantId}/menu/import`, formData);
  }

  async reorderCategories(restaurantId: string, categoryIds: string[]): Promise<ApiResponse<Category[]>> {
    return apiService.post<Category[]>(`/restaurants/${restaurantId}/categories/reorder`, { categoryIds });
  }

  async reorderMenuItems(restaurantId: string, categoryId: string, itemIds: string[]): Promise<ApiResponse<MenuItem[]>> {
    return apiService.post<MenuItem[]>(`/restaurants/${restaurantId}/categories/${categoryId}/items/reorder`, { itemIds });
  }
}

export const menuService = new MenuService();