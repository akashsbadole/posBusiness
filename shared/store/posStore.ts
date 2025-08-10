import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { POSStore, Restaurant, Staff, Category, MenuItem, Customer, Order, OrderItem, Table, User } from '../types'

// Platform-specific storage
const createStorage = () => {
  if (typeof window !== 'undefined') {
    // Web environment (Next.js)
    return {
      getItem: (name: string) => {
        const item = localStorage.getItem(name)
        return item ? JSON.parse(item) : null
      },
      setItem: (name: string, value: any) => {
        localStorage.setItem(name, JSON.stringify(value))
      },
      removeItem: (name: string) => {
        localStorage.removeItem(name)
      }
    }
  } else {
    // React Native environment
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default
      return {
        getItem: async (name: string) => {
          const item = await AsyncStorage.getItem(name)
          return item ? JSON.parse(item) : null
        },
        setItem: async (name: string, value: any) => {
          await AsyncStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: async (name: string) => {
          await AsyncStorage.removeItem(name)
        }
      }
    } catch {
      // Fallback for environments without AsyncStorage
      return {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
      }
    }
  }
}

const storage = createStorage()

export const usePOSStore = create<POSStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial auth state
        auth: {
          user: null,
          staff: null,
          restaurant: null,
          isAuthenticated: false,
          isLoading: false,
          token: null
        },

        // Initial restaurant state
        currentRestaurant: null,
        currentStaff: null,

        // Initial menu state
        categories: [],
        menuItems: [],
        selectedCategory: null,

        // Initial order state
        orders: [],
        currentOrder: null,
        orderItems: [],

        // Initial customer state
        customers: [],

        // Initial table state
        tables: [],

        // Initial cart state
        cart: [],

        // Initial UI state
        ui: {
          theme: 'light',
          language: 'en',
          isOnline: true,
          isLoading: false,
          error: null,
          showToast: false,
          toastMessage: '',
          toastType: 'info'
        },

        // Initial offline state
        offline: {
          isOnline: true,
          pendingOrders: [],
          pendingSync: [],
          lastSync: null
        },

        // Auth actions
        setUser: (user: User | null) => set((state) => ({
          auth: { ...state.auth, user }
        })),

        setStaff: (staff: Staff | null) => set((state) => ({
          auth: { ...state.auth, staff },
          currentStaff: staff
        })),

        setRestaurant: (restaurant: Restaurant | null) => set((state) => ({
          auth: { ...state.auth, restaurant },
          currentRestaurant: restaurant
        })),

        setToken: (token: string | null) => set((state) => ({
          auth: { ...state.auth, token }
        })),

        setIsAuthenticated: (isAuthenticated: boolean) => set((state) => ({
          auth: { ...state.auth, isAuthenticated }
        })),

        setAuthLoading: (loading: boolean) => set((state) => ({
          auth: { ...state.auth, isLoading: loading }
        })),

        // Restaurant actions
        setCurrentRestaurant: (restaurant: Restaurant) => set({ currentRestaurant: restaurant }),
        setCurrentStaff: (staff: Staff) => set({ currentStaff: staff }),

        // Menu actions
        setCategories: (categories: Category[]) => set({ categories }),
        setMenuItems: (menuItems: MenuItem[]) => set({ menuItems }),
        setSelectedCategory: (categoryId: string | null) => set({ selectedCategory: categoryId }),
        
        addCategory: (category: Category) => set((state) => ({ 
          categories: [...state.categories, category] 
        })),
        
        updateCategory: (id: string, updates: Partial<Category>) => set((state) => ({
          categories: state.categories.map(cat => 
            cat.id === id ? { ...cat, ...updates } : cat
          )
        })),
        
        deleteCategory: (id: string) => set((state) => ({
          categories: state.categories.filter(cat => cat.id !== id)
        })),
        
        addMenuItem: (menuItem: MenuItem) => set((state) => ({ 
          menuItems: [...state.menuItems, menuItem] 
        })),
        
        updateMenuItem: (id: string, updates: Partial<MenuItem>) => set((state) => ({
          menuItems: state.menuItems.map(item => 
            item.id === id ? { ...item, ...updates } : item
          )
        })),
        
        deleteMenuItem: (id: string) => set((state) => ({
          menuItems: state.menuItems.filter(item => item.id !== id)
        })),

        // Order actions
        setOrders: (orders: Order[]) => set({ orders }),
        setCurrentOrder: (order: Order | null) => set({ currentOrder: order }),
        setOrderItems: (items: OrderItem[]) => set({ orderItems: items }),
        
        addOrder: (order: Order) => set((state) => ({ 
          orders: [order, ...state.orders] 
        })),
        
        updateOrder: (id: string, updates: Partial<Order>) => set((state) => ({
          orders: state.orders.map(order => 
            order.id === id ? { ...order, ...updates } : order
          ),
          currentOrder: state.currentOrder?.id === id 
            ? { ...state.currentOrder, ...updates } 
            : state.currentOrder
        })),
        
        deleteOrder: (id: string) => set((state) => ({
          orders: state.orders.filter(order => order.id !== id),
          currentOrder: state.currentOrder?.id === id ? null : state.currentOrder
        })),
        
        addOrderItem: (item: OrderItem) => set((state) => ({ 
          orderItems: [...state.orderItems, item] 
        })),
        
        updateOrderItem: (id: string, updates: Partial<OrderItem>) => set((state) => ({
          orderItems: state.orderItems.map(item => 
            item.id === id ? { ...item, ...updates } : item
          )
        })),
        
        removeOrderItem: (id: string) => set((state) => ({
          orderItems: state.orderItems.filter(item => item.id !== id)
        })),

        // Customer actions
        setCustomers: (customers: Customer[]) => set({ customers }),
        addCustomer: (customer: Customer) => set((state) => ({ 
          customers: [...state.customers, customer] 
        })),
        updateCustomer: (id: string, updates: Partial<Customer>) => set((state) => ({
          customers: state.customers.map(customer => 
            customer.id === id ? { ...customer, ...updates } : customer
          )
        })),
        deleteCustomer: (id: string) => set((state) => ({
          customers: state.customers.filter(customer => customer.id !== id)
        })),

        // Table actions
        setTables: (tables: Table[]) => set({ tables }),
        addTable: (table: Table) => set((state) => ({ 
          tables: [...state.tables, table] 
        })),
        updateTable: (id: string, updates: Partial<Table>) => set((state) => ({
          tables: state.tables.map(table => 
            table.id === id ? { ...table, ...updates } : table
          )
        })),
        deleteTable: (id: string) => set((state) => ({
          tables: state.tables.filter(table => table.id !== id)
        })),

        // Cart actions
        addToCart: (item: OrderItem) => set((state) => {
          const existingItem = state.cart.find(cartItem => cartItem.menuItemId === item.menuItemId)
          if (existingItem) {
            return {
              cart: state.cart.map(cartItem =>
                cartItem.menuItemId === item.menuItemId
                  ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                  : cartItem
              )
            }
          } else {
            return { cart: [...state.cart, item] }
          }
        }),
        
        removeFromCart: (id: string) => set((state) => ({
          cart: state.cart.filter(item => item.id !== id)
        })),
        
        updateCartItem: (id: string, updates: Partial<OrderItem>) => set((state) => ({
          cart: state.cart.map(item =>
            item.id === id ? { ...item, ...updates } : item
          )
        })),
        
        clearCart: () => set({ cart: [] }),
        
        getCartTotal: () => {
          const { cart } = get()
          return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
        },

        // UI actions
        setTheme: (theme: 'light' | 'dark') => set((state) => ({
          ui: { ...state.ui, theme }
        })),
        
        setLanguage: (language: string) => set((state) => ({
          ui: { ...state.ui, language }
        })),
        
        setOnlineStatus: (isOnline: boolean) => set((state) => ({
          ui: { ...state.ui, isOnline },
          offline: { ...state.offline, isOnline }
        })),
        
        setLoading: (loading: boolean) => set((state) => ({
          ui: { ...state.ui, isLoading: loading }
        })),
        
        setError: (error: string | null) => set((state) => ({
          ui: { ...state.ui, error }
        })),
        
        clearError: () => set((state) => ({
          ui: { ...state.ui, error: null }
        })),
        
        showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => set((state) => ({
          ui: { ...state.ui, showToast: true, toastMessage: message, toastType: type }
        })),
        
        hideToast: () => set((state) => ({
          ui: { ...state.ui, showToast: false }
        })),

        // Offline actions
        addPendingOrder: (order: Order) => set((state) => ({
          offline: { ...state.offline, pendingOrders: [...state.offline.pendingOrders, order] }
        })),
        
        removePendingOrder: (orderId: string) => set((state) => ({
          offline: { ...state.offline, pendingOrders: state.offline.pendingOrders.filter(order => order.id !== orderId) }
        })),
        
        addPendingSync: (item: any) => set((state) => ({
          offline: { ...state.offline, pendingSync: [...state.offline.pendingSync, item] }
        })),
        
        removePendingSync: (syncId: string) => set((state) => ({
          offline: { ...state.offline, pendingSync: state.offline.pendingSync.filter(item => item.id !== syncId) }
        })),
        
        setLastSync: (timestamp: string) => set((state) => ({
          offline: { ...state.offline, lastSync: timestamp }
        }))
      }),
      {
        name: 'pos-storage',
        storage: storage,
        partialize: (state) => ({
          auth: state.auth,
          currentRestaurant: state.currentRestaurant,
          currentStaff: state.currentStaff,
          cart: state.cart,
          ui: {
            theme: state.ui.theme,
            language: state.ui.language
          }
        })
      }
    ),
    { name: 'pos-store' }
  )
)