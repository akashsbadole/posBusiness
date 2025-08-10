import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Category API
export const categoryApi = {
  getAll: (restaurantId: string) => 
    api.get(`/categories?restaurantId=${restaurantId}`),
  
  create: (data: any) => 
    api.post('/categories', data),
  
  update: (id: string, data: any) => 
    api.put(`/categories/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/categories/${id}`),
}

// Menu Item API
export const menuItemApi = {
  getAll: (restaurantId: string, categoryId?: string) => {
    const params = new URLSearchParams({ restaurantId })
    if (categoryId) params.append('categoryId', categoryId)
    return api.get(`/menu-items?${params}`)
  },
  
  create: (data: any) => 
    api.post('/menu-items', data),
  
  update: (id: string, data: any) => 
    api.put(`/menu-items/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/menu-items/${id}`),
}

// Order API
export const orderApi = {
  getAll: (restaurantId: string, filters?: any) => {
    const params = new URLSearchParams({ restaurantId })
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value))
        }
      })
    }
    return api.get(`/orders?${params}`)
  },
  
  getById: (id: string) => 
    api.get(`/orders/${id}`),
  
  create: (data: any) => 
    api.post('/orders', data),
  
  update: (id: string, data: any) => 
    api.put(`/orders/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/orders/${id}`),
}

// Payment API
export const paymentApi = {
  create: (data: any) => 
    api.post('/payments', data),
  
  getMethods: () => 
    api.get('/payment-methods'),
  
  processPayment: (data: any) => 
    api.post('/payment-methods', data),
}

// Billing API
export const billingApi = {
  calculate: (data: any) => 
    api.post('/billing', data),
  
  processUPIPayment: (data: any) => 
    api.put('/billing', data),
}

// Customer API
export const customerApi = {
  getAll: (restaurantId: string) => 
    api.get(`/customers?restaurantId=${restaurantId}`),
  
  create: (data: any) => 
    api.post('/customers', data),
  
  update: (id: string, data: any) => 
    api.put(`/customers/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/customers/${id}`),
}

// Table API
export const tableApi = {
  getAll: (restaurantId: string, outletId?: string) => {
    const params = new URLSearchParams({ restaurantId })
    if (outletId) params.append('outletId', outletId)
    return api.get(`/tables?${params}`)
  },
  
  create: (data: any) => 
    api.post('/tables', data),
  
  update: (id: string, data: any) => 
    api.put(`/tables/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/tables/${id}`),
}

// Staff API
export const staffApi = {
  getAll: (restaurantId: string) => 
    api.get(`/staff?restaurantId=${restaurantId}`),
  
  create: (data: any) => 
    api.post('/staff', data),
  
  update: (id: string, data: any) => 
    api.put(`/staff/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/staff/${id}`),
}

// Inventory API
export const inventoryApi = {
  getAll: (restaurantId: string, outletId?: string) => {
    const params = new URLSearchParams({ restaurantId })
    if (outletId) params.append('outletId', outletId)
    return api.get(`/inventory?${params}`)
  },
  
  create: (data: any) => 
    api.post('/inventory', data),
  
  update: (id: string, data: any) => 
    api.put(`/inventory/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/inventory/${id}`),
}

// Restaurant API
export const restaurantApi = {
  getAll: () => 
    api.get('/restaurants'),
  
  getById: (id: string) => 
    api.get(`/restaurants/${id}`),
  
  create: (data: any) => 
    api.post('/restaurants', data),
  
  update: (id: string, data: any) => 
    api.put(`/restaurants/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/restaurants/${id}`),
}

// Business Settings API
export const businessSettingsApi = {
  getByRestaurant: (restaurantId: string) => 
    api.get(`/business-settings?restaurantId=${restaurantId}`),
  
  update: (data: any) => 
    api.put('/business-settings', data),
}

// Auth API
export const authApi = {
  login: (credentials: any) => 
    api.post('/auth/login', credentials),
  
  register: (data: any) => 
    api.post('/auth/register', data),
  
  logout: () => 
    api.post('/auth/logout'),
  
  refreshToken: () => 
    api.post('/auth/refresh'),
  
  getProfile: () => 
    api.get('/auth/profile'),
}

// Subscription API
export const subscriptionApi = {
  getSubscription: (restaurantId: string) => 
    api.get(`/subscriptions?restaurantId=${restaurantId}`),
  
  createSubscription: (data: any) => 
    api.post('/subscriptions', data),
  
  updateSubscription: (data: any) => 
    api.put('/subscriptions', data),
  
  cancelSubscription: (restaurantId: string) => 
    api.delete(`/subscriptions?restaurantId=${restaurantId}`),
}

export default api