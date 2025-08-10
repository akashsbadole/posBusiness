import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { apiService } from './apiService';

class NotificationService {
  private isInitialized: boolean = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    if (this.isInitialized) return;

    try {
      // Request permissions
      await this.requestPermissions();

      // Set notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      // Set up notification listeners
      this.setupNotificationListeners();

      this.isInitialized = true;
      console.log('Notification service initialized');
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }

  private async requestPermissions() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    // Get push token
    const token = await this.getPushToken();
    if (token) {
      await this.registerPushToken(token);
    }
  }

  private async getPushToken(): Promise<string | null> {
    try {
      if (Device.isDevice) {
        const { data: token } = await Notifications.getExpoPushTokenAsync();
        return token;
      } else {
        console.log('Must use physical device for push notifications');
        return null;
      }
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  private async registerPushToken(token: string) {
    try {
      await apiService.post('/notifications/register', { token });
      console.log('Push token registered successfully');
    } catch (error) {
      console.error('Error registering push token:', error);
    }
  }

  private setupNotificationListeners() {
    // Handle received notifications
    Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      // You can handle the notification here
    });

    // Handle notification responses
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
      // You can handle the user's response to the notification here
    });
  }

  // Send local notification
  async sendLocalNotification(title: string, body: string, data?: any) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  // Schedule notification
  async scheduleNotification(
    title: string,
    body: string,
    trigger: Notifications.NotificationTriggerInput,
    data?: any
  ): Promise<string> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
        },
        trigger,
      });
      return identifier;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  // Cancel scheduled notification
  async cancelNotification(identifier: string) {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  // Get all scheduled notifications
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Get notification badge count
  async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  // Set notification badge count
  async setBadgeCount(count: number) {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  // Clear notification badge
  async clearBadge() {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('Error clearing badge:', error);
    }
  }

  // Order notifications
  async notifyNewOrder(order: any) {
    await this.sendLocalNotification(
      'New Order Received',
      `Order #${order.orderNumber} for ${order.customer?.name || 'Customer'}`,
      { type: 'order', orderId: order.id }
    );
  }

  async notifyOrderStatusChange(order: any) {
    const statusMessages = {
      CONFIRMED: 'Order confirmed and being prepared',
      PREPARING: 'Order is being prepared',
      READY: 'Order is ready for pickup/delivery',
      DELIVERED: 'Order delivered successfully',
      CANCELLED: 'Order cancelled',
    };

    await this.sendLocalNotification(
      'Order Status Update',
      statusMessages[order.status] || `Order status updated to ${order.status}`,
      { type: 'order', orderId: order.id }
    );
  }

  // Customer notifications
  async notifyNewCustomer(customer: any) {
    await this.sendLocalNotification(
      'New Customer Added',
      `${customer.name} has been added as a customer`,
      { type: 'customer', customerId: customer.id }
    );
  }

  async notifyCustomerLoyaltyUpdate(customer: any, points: number) {
    await this.sendLocalNotification(
      'Loyalty Points Updated',
      `${customer.name} now has ${points} loyalty points`,
      { type: 'customer', customerId: customer.id }
    );
  }

  // System notifications
  async notifyLowStock(item: any) {
    await this.sendLocalNotification(
      'Low Stock Alert',
      `${item.name} is running low on stock`,
      { type: 'system', itemType: 'low_stock', itemId: item.id }
    );
  }

  async notifySystemAlert(message: string) {
    await this.sendLocalNotification(
      'System Alert',
      message,
      { type: 'system' }
    );
  }

  // Payment notifications
  async notifyPaymentReceived(payment: any) {
    await this.sendLocalNotification(
      'Payment Received',
      `Payment of ₹${payment.amount} received for order #${payment.orderNumber}`,
      { type: 'payment', paymentId: payment.id }
    );
  }

  async notifyPaymentFailed(payment: any) {
    await this.sendLocalNotification(
      'Payment Failed',
      `Payment of ₹${payment.amount} failed for order #${payment.orderNumber}`,
      { type: 'payment', paymentId: payment.id }
    );
  }

  // Business-specific notifications
  async notifyRestaurantTableReady(table: any) {
    await this.sendLocalNotification(
      'Table Ready',
      `Table ${table.number} is now available`,
      { type: 'restaurant', tableId: table.id }
    );
  }

  async notifyRetailLowStock(item: any) {
    await this.sendLocalNotification(
      'Low Stock Alert',
      `${item.name} is running low on stock (${item.quantity} remaining)`,
      { type: 'retail', itemId: item.id }
    );
  }

  async notifyAppointmentReminder(appointment: any) {
    await this.sendLocalNotification(
      'Appointment Reminder',
      `Appointment with ${appointment.customerName} in 30 minutes`,
      { type: 'appointment', appointmentId: appointment.id }
    );
  }

  // Daily summary notifications
  async sendDailySummary(summary: any) {
    await this.sendLocalNotification(
      'Daily Summary',
      `Today's revenue: ₹${summary.revenue}, Orders: ${summary.orders}`,
      { type: 'daily_summary', summary }
    );
  }

  // Error notifications
  async notifyError(error: any, context: string) {
    await this.sendLocalNotification(
      'Error Occurred',
      `${context}: ${error.message}`,
      { type: 'error', error }
    );
  }

  // Success notifications
  async notifySuccess(message: string, data?: any) {
    await this.sendLocalNotification(
      'Success',
      message,
      { type: 'success', data }
    );
  }

  // Get notification settings
  async getNotificationSettings() {
    try {
      const response = await apiService.get('/notifications/settings');
      return response.data;
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return null;
    }
  }

  // Update notification settings
  async updateNotificationSettings(settings: any) {
    try {
      const response = await apiService.put('/notifications/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  }

  // Get notification history
  async getNotificationHistory(page: number = 1, limit: number = 20) {
    try {
      const response = await apiService.get(`/notifications/history?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error getting notification history:', error);
      return null;
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string) {
    try {
      const response = await apiService.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();