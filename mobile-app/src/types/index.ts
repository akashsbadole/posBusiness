export interface User {
  id: string;
  name: string;
  email: string;
  restaurantId: string;
  role: StaffRole;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  gstNumber?: string;
  businessType: BusinessType;
  description?: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  isActive: boolean;
  restaurantId: string;
  outletId?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  restaurantId: string;
  isActive: boolean;
  isAvailable: boolean;
  imageUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  restaurantId: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderType: OrderType;
  status: OrderStatus;
  customer?: Customer;
  customerId?: string;
  table?: Table;
  tableId?: string;
  staff: Staff;
  staffId: string;
  restaurantId: string;
  outletId?: string;
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  discount: number;
  notes?: string;
  isPaid: boolean;
  appointmentDate?: Date;
  serviceType?: string;
  customFields?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItem: MenuItem;
  menuItemId: string;
  quantity: number;
  price: number;
  notes?: string;
  createdAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  loyaltyPoints: number;
  restaurantId: string;
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  restaurantId: string;
  outletId?: string;
}

export interface AuthState {
  user: User | null;
  restaurant: Restaurant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export interface AppState {
  auth: AuthState;
  orders: OrdersState;
  menu: MenuState;
  customers: CustomersState;
  offline: OfflineState;
  ui: UIState;
}

export interface OrdersState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
}

export interface MenuState {
  categories: Category[];
  menuItems: MenuItem[];
  isLoading: boolean;
  error: string | null;
}

export interface CustomersState {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
}

export interface OfflineState {
  isOnline: boolean;
  offlineOrders: Order[];
  syncQueue: any[];
  isSyncing: boolean;
}

export interface UIState {
  theme: 'light' | 'dark';
  language: string;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'order' | 'customer' | 'system' | 'payment';
  data?: any;
  read: boolean;
  createdAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateOrderData {
  orderType: OrderType;
  customerId?: string;
  tableId?: string;
  items: OrderItem[];
  notes?: string;
}

export interface UpdateOrderData {
  status?: OrderStatus;
  items?: OrderItem[];
  notes?: string;
  discount?: number;
}

export interface CreateCustomerData {
  name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface UpdateCustomerData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface CreateMenuItemData {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
}

export interface UpdateMenuItemData {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  isActive?: boolean;
  isAvailable?: boolean;
  imageUrl?: string;
}

// Enums
export enum StaffRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER',
  WAITER = 'WAITER',
  CHEF = 'CHEF',
  KITCHEN_STAFF = 'KITCHEN_STAFF',
  BARBER = 'BARBER',
  BEAUTICIAN = 'BEAUTICIAN',
  PHARMACIST = 'PHARMACIST',
  SALES_ASSOCIATE = 'SALES_ASSOCIATE',
  STORE_MANAGER = 'STORE_MANAGER',
  HOTEL_STAFF = 'HOTEL_STAFF',
}

export enum BusinessType {
  RESTAURANT = 'RESTAURANT',
  RETAIL_STORE = 'RETAIL_STORE',
  CAFE = 'CAFE',
  HOTEL = 'HOTEL',
  BAR = 'BAR',
  ECOMMERCE = 'ECOMMERCE',
  SALON = 'SALON',
  SPA = 'SPA',
  PHARMACY = 'PHARMACY',
  GROCERY_STORE = 'GROCERY_STORE',
  FOOD_TRUCK = 'FOOD_TRUCK',
  GYM = 'GYM',
  CLINIC = 'CLINIC',
}

export enum OrderType {
  DINE_IN = 'DINE_IN',
  TAKEAWAY = 'TAKEAWAY',
  DELIVERY = 'DELIVERY',
  APPOINTMENT = 'APPOINTMENT',
  SERVICE = 'SERVICE',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum TableStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  MAINTENANCE = 'MAINTENANCE',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FilterOptions {
  search?: string;
  status?: string;
  category?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}