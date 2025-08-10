// Shared types for Zustand state management across Next.js and React Native

export interface Restaurant {
  id: string
  name: string
  address: string
  phone: string
  email: string
  gstNumber?: string
  description?: string
  businessType: string
  isActive: boolean
  isVerified?: boolean
  ownerId?: string
  tradeName?: string
  logo?: string
  website?: string
  fssaiNumber?: string
  createdAt: string
  updatedAt: string
}

export interface Staff {
  id: string
  name: string
  email: string
  phone: string
  role: string
  password?: string
  passwordHash?: string
  isActive: boolean
  isVerified: boolean
  lastLoginAt?: string
  userId?: string
  restaurantId: string
  outletId?: string
  roleId?: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  description?: string
  displayOrder: number
  isActive: boolean
  restaurantId: string
  menuItems?: MenuItem[]
  createdAt: string
  updatedAt: string
}

export interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  categoryId: string
  restaurantId: string
  isActive: boolean
  isAvailable: boolean
  imageUrl?: string
  category?: Category
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: string
  name: string
  email?: string
  phone: string
  address?: string
  loyaltyPoints: number
  restaurantId: string
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  orderNumber: string
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED'
  customerId?: string
  tableId?: string
  staffId: string
  restaurantId: string
  outletId?: string
  subtotal: number
  gstAmount: number
  totalAmount: number
  discount: number
  notes?: string
  customer?: Customer
  table?: any
  staff?: Staff
  orderItems?: OrderItem[]
  payments?: Payment[]
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  orderId: string
  menuItemId: string
  quantity: number
  price: number
  notes?: string
  menuItem?: MenuItem
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  orderId: string
  amount: number
  method: 'CASH' | 'UPI' | 'CARD' | 'NET_BANKING' | 'WALLET'
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  transactionId?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Table {
  id: string
  number: number
  capacity: number
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE'
  restaurantId: string
  outletId?: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  name: string
  emailVerified: boolean
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  staff: Staff | null
  restaurant: Restaurant | null
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
}

export interface UIState {
  theme: 'light' | 'dark'
  language: string
  isOnline: boolean
  isLoading: boolean
  error: string | null
  showToast: boolean
  toastMessage: string
  toastType: 'success' | 'error' | 'info' | 'warning'
}

export interface OfflineState {
  isOnline: boolean
  pendingOrders: Order[]
  pendingSync: any[]
  lastSync: string | null
}

export interface POSState {
  // Auth state
  auth: AuthState
  
  // Restaurant state
  currentRestaurant: Restaurant | null
  currentStaff: Staff | null
  
  // Menu state
  categories: Category[]
  menuItems: MenuItem[]
  selectedCategory: string | null
  
  // Order state
  orders: Order[]
  currentOrder: Order | null
  orderItems: OrderItem[]
  
  // Customer state
  customers: Customer[]
  
  // Table state
  tables: Table[]
  
  // Cart state
  cart: OrderItem[]
  
  // UI state
  ui: UIState
  
  // Offline state
  offline: OfflineState
}

// Action types for Zustand store
export interface POSActions {
  // Auth actions
  setUser: (user: User | null) => void
  setStaff: (staff: Staff | null) => void
  setRestaurant: (restaurant: Restaurant | null) => void
  setToken: (token: string | null) => void
  setIsAuthenticated: (isAuthenticated: boolean) => void
  setAuthLoading: (loading: boolean) => void
  
  // Restaurant actions
  setCurrentRestaurant: (restaurant: Restaurant) => void
  setCurrentStaff: (staff: Staff) => void
  
  // Menu actions
  setCategories: (categories: Category[]) => void
  setMenuItems: (menuItems: MenuItem[]) => void
  setSelectedCategory: (categoryId: string | null) => void
  addCategory: (category: Category) => void
  updateCategory: (id: string, updates: Partial<Category>) => void
  deleteCategory: (id: string) => void
  addMenuItem: (menuItem: MenuItem) => void
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void
  deleteMenuItem: (id: string) => void
  
  // Order actions
  setOrders: (orders: Order[]) => void
  setCurrentOrder: (order: Order | null) => void
  setOrderItems: (items: OrderItem[]) => void
  addOrder: (order: Order) => void
  updateOrder: (id: string, updates: Partial<Order>) => void
  deleteOrder: (id: string) => void
  addOrderItem: (item: OrderItem) => void
  updateOrderItem: (id: string, updates: Partial<OrderItem>) => void
  removeOrderItem: (id: string) => void
  
  // Customer actions
  setCustomers: (customers: Customer[]) => void
  addCustomer: (customer: Customer) => void
  updateCustomer: (id: string, updates: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  
  // Table actions
  setTables: (tables: Table[]) => void
  addTable: (table: Table) => void
  updateTable: (id: string, updates: Partial<Table>) => void
  deleteTable: (id: string) => void
  
  // Cart actions
  addToCart: (item: OrderItem) => void
  removeFromCart: (id: string) => void
  updateCartItem: (id: string, updates: Partial<OrderItem>) => void
  clearCart: () => void
  getCartTotal: () => number
  
  // UI actions
  setTheme: (theme: 'light' | 'dark') => void
  setLanguage: (language: string) => void
  setOnlineStatus: (isOnline: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void
  hideToast: () => void
  
  // Offline actions
  setOnlineStatus: (isOnline: boolean) => void
  addPendingOrder: (order: Order) => void
  removePendingOrder: (orderId: string) => void
  addPendingSync: (item: any) => void
  removePendingSync: (syncId: string) => void
  setLastSync: (timestamp: string) => void
}

// Combined state and actions interface
export interface POSStore extends POSState, POSActions {}