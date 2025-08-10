import { apiService } from './apiService';
import { Customer, CreateCustomerData, UpdateCustomerData, ApiResponse, PaginatedResponse, FilterOptions, SortOptions } from '@/types';

class CustomerService {
  async getCustomers(
    restaurantId: string,
    page: number = 1,
    limit: number = 20,
    filters?: FilterOptions,
    sort?: SortOptions
  ): Promise<ApiResponse<PaginatedResponse<Customer>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.dateRange) {
        params.append('startDate', filters.dateRange.start.toISOString());
        params.append('endDate', filters.dateRange.end.toISOString());
      }
    }

    if (sort) {
      params.append('sortBy', sort.field);
      params.append('sortOrder', sort.order);
    }

    return apiService.get<PaginatedResponse<Customer>>(`/restaurants/${restaurantId}/customers?${params.toString()}`);
  }

  async getCustomer(restaurantId: string, customerId: string): Promise<ApiResponse<Customer>> {
    return apiService.get<Customer>(`/restaurants/${restaurantId}/customers/${customerId}`);
  }

  async createCustomer(restaurantId: string, customerData: CreateCustomerData): Promise<ApiResponse<Customer>> {
    return apiService.post<Customer>(`/restaurants/${restaurantId}/customers`, customerData);
  }

  async updateCustomer(restaurantId: string, customerId: string, updateData: UpdateCustomerData): Promise<ApiResponse<Customer>> {
    return apiService.put<Customer>(`/restaurants/${restaurantId}/customers/${customerId}`, updateData);
  }

  async deleteCustomer(restaurantId: string, customerId: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/restaurants/${restaurantId}/customers/${customerId}`);
  }

  async searchCustomers(restaurantId: string, query: string): Promise<ApiResponse<Customer[]>> {
    return apiService.get<Customer[]>(`/restaurants/${restaurantId}/customers/search?q=${encodeURIComponent(query)}`);
  }

  async getCustomerOrders(restaurantId: string, customerId: string, page: number = 1, limit: number = 10): Promise<ApiResponse<PaginatedResponse<any>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    return apiService.get<PaginatedResponse<any>>(`/restaurants/${restaurantId}/customers/${customerId}/orders?${params.toString()}`);
  }

  async getCustomerLoyaltyPoints(restaurantId: string, customerId: string): Promise<ApiResponse<{ points: number; history: any[] }>> {
    return apiService.get<{ points: number; history: any[] }>(`/restaurants/${restaurantId}/customers/${customerId}/loyalty`);
  }

  async addLoyaltyPoints(restaurantId: string, customerId: string, points: number, reason: string): Promise<ApiResponse<{ points: number }>> {
    return apiService.post<{ points: number }>(`/restaurants/${restaurantId}/customers/${customerId}/loyalty`, { points, reason });
  }

  async redeemLoyaltyPoints(restaurantId: string, customerId: string, points: number): Promise<ApiResponse<{ success: boolean; remainingPoints: number }>> {
    return apiService.post<{ success: boolean; remainingPoints: number }>(`/restaurants/${restaurantId}/customers/${customerId}/loyalty/redeem`, { points });
  }

  async getCustomerStatistics(restaurantId: string): Promise<ApiResponse<{ totalCustomers: number; newCustomers: number; loyalCustomers: number; averageOrdersPerCustomer: number }>> {
    return apiService.get<{ totalCustomers: number; newCustomers: number; loyalCustomers: number; averageOrdersPerCustomer: number }>(`/restaurants/${restaurantId}/customers/statistics`);
  }

  async getTopCustomers(restaurantId: string, limit: number = 10): Promise<ApiResponse<Customer[]>> {
    return apiService.get<Customer[]>(`/restaurants/${restaurantId}/customers/top?limit=${limit}`);
  }

  async getRecentCustomers(restaurantId: string, limit: number = 10): Promise<ApiResponse<Customer[]>> {
    return apiService.get<Customer[]>(`/restaurants/${restaurantId}/customers/recent?limit=${limit}`);
  }

  async getCustomerBirthdays(restaurantId: string, month: number): Promise<ApiResponse<Customer[]>> {
    return apiService.get<Customer[]>(`/restaurants/${restaurantId}/customers/birthdays?month=${month}`);
  }

  async sendCustomerNotification(restaurantId: string, customerId: string, message: string, type: 'email' | 'sms'): Promise<ApiResponse<{ success: boolean }>> {
    return apiService.post<{ success: boolean }>(`/restaurants/${restaurantId}/customers/${customerId}/notify`, { message, type });
  }

  async bulkSendNotifications(restaurantId: string, customerIds: string[], message: string, type: 'email' | 'sms'): Promise<ApiResponse<{ success: boolean; failed: string[] }>> {
    return apiService.post<{ success: boolean; failed: string[] }>(`/restaurants/${restaurantId}/customers/bulk-notify`, { customerIds, message, type });
  }

  async exportCustomers(restaurantId: string, format: 'csv' | 'excel' = 'csv'): Promise<ApiResponse<{ downloadUrl: string }>> {
    return apiService.get<{ downloadUrl: string }>(`/restaurants/${restaurantId}/customers/export?format=${format}`);
  }

  async importCustomers(restaurantId: string, fileUri: string): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: 'text/csv',
      name: 'customers-import.csv',
    } as any);

    return apiService.post<{ imported: number; errors: string[] }>(`/restaurants/${restaurantId}/customers/import`, formData);
  }

  async mergeCustomers(restaurantId: string, primaryCustomerId: string, secondaryCustomerId: string): Promise<ApiResponse<Customer>> {
    return apiService.post<Customer>(`/restaurants/${restaurantId}/customers/${primaryCustomerId}/merge/${secondaryCustomerId}`);
  }

  async getCustomerFeedback(restaurantId: string, customerId: string): Promise<ApiResponse<any[]>> {
    return apiService.get<any[]>(`/restaurants/${restaurantId}/customers/${customerId}/feedback`);
  }

  async addCustomerFeedback(restaurantId: string, customerId: string, rating: number, comment: string): Promise<ApiResponse<any>> {
    return apiService.post<any>(`/restaurants/${restaurantId}/customers/${customerId}/feedback`, { rating, comment });
  }

  async getCustomerPreferences(restaurantId: string, customerId: string): Promise<ApiResponse<{ preferences: any[]; recommendations: any[] }>> {
    return apiService.get<{ preferences: any[]; recommendations: any[] }>(`/restaurants/${restaurantId}/customers/${customerId}/preferences`);
  }

  async updateCustomerPreferences(restaurantId: string, customerId: string, preferences: any[]): Promise<ApiResponse<{ success: boolean }>> {
    return apiService.put<{ success: boolean }>(`/restaurants/${restaurantId}/customers/${customerId}/preferences`, { preferences });
  }
}

export const customerService = new CustomerService();