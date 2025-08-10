import { apiService } from './apiService';
import { Order, OrderItem, CreateOrderData, UpdateOrderData, ApiResponse, PaginatedResponse, FilterOptions, SortOptions } from '@/types';

class OrderService {
  async getOrders(
    page: number = 1,
    limit: number = 20,
    filters?: FilterOptions,
    sort?: SortOptions
  ): Promise<ApiResponse<PaginatedResponse<Order>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
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

    return apiService.get<PaginatedResponse<Order>>(`/orders?${params.toString()}`);
  }

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    return apiService.get<Order>(`/orders/${id}`);
  }

  async createOrder(orderData: CreateOrderData): Promise<ApiResponse<Order>> {
    return apiService.post<Order>('/orders', orderData);
  }

  async updateOrder(id: string, updateData: UpdateOrderData): Promise<ApiResponse<Order>> {
    return apiService.put<Order>(`/orders/${id}`, updateData);
  }

  async deleteOrder(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/orders/${id}`);
  }

  async addOrderItem(orderId: string, item: Omit<OrderItem, 'id' | 'orderId' | 'createdAt'>): Promise<ApiResponse<OrderItem>> {
    return apiService.post<OrderItem>(`/orders/${orderId}/items`, item);
  }

  async updateOrderItem(orderId: string, itemId: string, updateData: Partial<OrderItem>): Promise<ApiResponse<OrderItem>> {
    return apiService.put<OrderItem>(`/orders/${orderId}/items/${itemId}`, updateData);
  }

  async removeOrderItem(orderId: string, itemId: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/orders/${orderId}/items/${itemId}`);
  }

  async getTodayOrders(): Promise<ApiResponse<Order[]>> {
    return apiService.get<Order[]>('/orders/today');
  }

  async getOrdersByDate(date: Date): Promise<ApiResponse<Order[]>> {
    const dateString = date.toISOString().split('T')[0];
    return apiService.get<Order[]>(`/orders/date/${dateString}`);
  }

  async getOrdersByStatus(status: string): Promise<ApiResponse<Order[]>> {
    return apiService.get<Order[]>(`/orders/status/${status}`);
  }

  async getOrdersByCustomer(customerId: string): Promise<ApiResponse<Order[]>> {
    return apiService.get<Order[]>(`/orders/customer/${customerId}`);
  }

  async getOrdersByStaff(staffId: string): Promise<ApiResponse<Order[]>> {
    return apiService.get<Order[]>(`/orders/staff/${staffId}`);
  }

  async getOrdersByTable(tableId: string): Promise<ApiResponse<Order[]>> {
    return apiService.get<Order[]>(`/orders/table/${tableId}`);
  }

  async getRevenueReport(startDate: Date, endDate: Date): Promise<ApiResponse<{ totalRevenue: number; totalOrders: number; averageOrderValue: number }>> {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    return apiService.get<{ totalRevenue: number; totalOrders: number; averageOrderValue: number }>(`/orders/revenue?${params.toString()}`);
  }

  async getSalesReport(startDate: Date, endDate: Date): Promise<ApiResponse<{ byCategory: any[]; byPaymentMethod: any[]; byHour: any[] }>> {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    return apiService.get<{ byCategory: any[]; byPaymentMethod: any[]; byHour: any[] }>(`/orders/sales?${params.toString()}`);
  }

  async printOrder(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiService.post<{ success: boolean }>(`/orders/${id}/print`);
  }

  async sendOrderReceipt(id: string, email?: string, phone?: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiService.post<{ success: boolean }>(`/orders/${id}/receipt`, { email, phone });
  }

  async duplicateOrder(id: string): Promise<ApiResponse<Order>> {
    return apiService.post<Order>(`/orders/${id}/duplicate`);
  }

  async mergeOrders(sourceOrderId: string, targetOrderId: string): Promise<ApiResponse<Order>> {
    return apiService.post<Order>(`/orders/${sourceOrderId}/merge/${targetOrderId}`);
  }

  async splitOrder(id: string, items: string[]): Promise<ApiResponse<{ originalOrder: Order; newOrder: Order }>> {
    return apiService.post<{ originalOrder: Order; newOrder: Order }>(`/orders/${id}/split`, { items });
  }

  async addOrderNote(id: string, note: string): Promise<ApiResponse<Order>> {
    return apiService.post<Order>(`/orders/${id}/notes`, { note });
  }

  async updateOrderStatus(id: string, status: string): Promise<ApiResponse<Order>> {
    return apiService.patch<Order>(`/orders/${id}/status`, { status });
  }

  async assignOrderToStaff(id: string, staffId: string): Promise<ApiResponse<Order>> {
    return apiService.patch<Order>(`/orders/${id}/assign`, { staffId });
  }

  async calculateOrderTotal(id: string): Promise<ApiResponse<{ subtotal: number; tax: number; total: number }>> {
    return apiService.get<{ subtotal: number; tax: number; total: number }>(`/orders/${id}/total`);
  }

  async applyDiscount(id: string, discount: number, discountType: 'percentage' | 'fixed' = 'fixed'): Promise<ApiResponse<Order>> {
    return apiService.post<Order>(`/orders/${id}/discount`, { discount, discountType });
  }

  async processPayment(id: string, paymentMethod: string, amount: number): Promise<ApiResponse<{ success: boolean; transactionId?: string }>> {
    return apiService.post<{ success: boolean; transactionId?: string }>(`/orders/${id}/payment`, {
      paymentMethod,
      amount,
    });
  }

  async refundOrder(id: string, amount: number, reason: string): Promise<ApiResponse<{ success: boolean; refundId?: string }>> {
    return apiService.post<{ success: boolean; refundId?: string }>(`/orders/${id}/refund`, {
      amount,
      reason,
    });
  }
}

export const orderService = new OrderService();