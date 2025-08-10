'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
]

export interface TranslationKeys {
  // Common
  common: {
    loading: string
    save: string
    cancel: string
    delete: string
    edit: string
    search: string
    filter: string
    sort: string
    export: string
    import: string
    print: string
    close: string
    back: string
    next: string
    previous: string
    submit: string
    confirm: string
    yes: string
    no: string
    ok: string
    error: string
    success: string
    warning: string
    info: string
    retry: string
    refresh: string
    reset: string
    clear: string
    apply: string
    view: string
    add: string
    remove: string
    update: string
    create: string
    manage: string
    settings: string
    help: string
    about: string
    logout: string
    login: string
    register: string
    profile: string
    dashboard: string
    home: string
    menu: string
    orders: string
    customers: string
    inventory: string
    reports: string
    staff: string
    tables: string
    payments: string
    taxes: string
    discounts: string
    loyalty: string
    notifications: string
    language: string
    currency: string
    date: string
    time: string
    amount: string
    quantity: string
    price: string
    total: string
    subtotal: string
    tax: string
    discount: string
    grandTotal: string
    paid: string
    due: string
    status: string
    active: string
    inactive: string
    pending: string
    confirmed: string
    preparing: string
    ready: string
    delivered: string
    cancelled: string
    refunded: string
  }
  
  // Dashboard
  dashboard: {
    title: string
    overview: string
    todaysRevenue: string
    orders: string
    customers: string
    tableOccupancy: string
    popularItems: string
    recentOrders: string
    salesChart: string
    quickActions: string
    newOrder: string
    viewAllOrders: string
    viewAllCustomers: string
    viewAllMenuItems: string
    viewInventory: string
  }
  
  // Orders
  orders: {
    title: string
    newOrder: string
    viewOrder: string
    editOrder: string
    deleteOrder: string
    orderId: string
    customer: string
    table: string
    items: string
    status: string
    payment: string
    total: string
    actions: string
    createOrder: string
    updateOrder: string
    cancelOrder: string
    markAsReady: string
    markAsDelivered: string
    printInvoice: string
    printGSTInvoice: string
    addItems: string
    removeItem: string
    updateQuantity: string
    applyDiscount: string
    addNote: string
    orderType: string
    dineIn: string
    takeaway: string
    delivery: string
    online: string
    paymentMethod: string
    cash: string
    card: string
    upi: string
    wallet: string
    netBanking: string
    orderNotes: string
    specialInstructions: string
    estimatedTime: string
    deliveryAddress: string
    contactNumber: string
  }
  
  // Menu
  menu: {
    title: string
    categories: string
    items: string
    addItem: string
    editItem: string
    deleteItem: string
    itemName: string
    description: string
    price: string
    category: string
    availability: string
    available: string
    unavailable: string
    image: string
    addOns: string
    variants: string
    ingredients: string
    allergens: string
    dietaryInfo: string
    spicyLevel: string
    preparationTime: string
    calories: string
    addCategory: string
    editCategory: string
    deleteCategory: string
    categoryName: string
    categoryDescription: string
    displayOrder: string
    manageMenu: string
    bulkImport: string
    bulkExport: string
    menuAnalytics: string
    popularItems: string
    leastPopular: string
    highMargin: string
    lowStock: string
  }
  
  // Customers
  customers: {
    title: string
    addCustomer: string
    editCustomer: string
    deleteCustomer: string
    customerName: string
    email: string
    phone: string
    address: string
    loyaltyPoints: string
    totalOrders: string
    totalSpent: string
    lastVisit: string
    preferences: string
    allergies: string
    specialRequests: string
    customerType: string
    regular: string
    vip: string
    corporate: string
    gstNumber: string
    company: string
    notes: string
    sendSMS: string
    sendEmail: string
    customerHistory: string
    orderHistory: string
    paymentHistory: string
    loyaltyProgram: string
    rewards: string
    tier: string
    points: string
    redeemPoints: string
  }
  
  // Inventory
  inventory: {
    title: string
    items: string
    addItem: string
    editItem: string
    deleteItem: string
    itemName: string
    description: string
    category: string
    quantity: string
    unit: string
    price: string
    supplier: string
    reorderLevel: string
    currentStock: string
    stockValue: string
    lastUpdated: string
    lowStockAlert: string
    outOfStock: string
    stockIn: string
    stockOut: string
    stockAdjustment: string
    stockTransfer: string
    wastage: string
    expiration: string
    batchNumber: string
    location: string
    manageInventory: string
    stockReport: string
    valuationReport: string
    movementReport: string
    expirationReport: string
    supplierManagement: string
    purchaseOrders: string
    goodsReceived: string
    purchaseReturns: string
  }
  
  // Tables
  tables: {
    title: string
    addTable: string
    editTable: string
    deleteTable: string
    tableName: string
    capacity: string
    status: string
    available: string
    occupied: string
    reserved: string
    maintenance: string
    section: string
    floor: string
    position: string
    currentOrder: string
    server: string
    duration: string
    mergeTables: string
    splitTable: string
    moveTable: string
    reserveTable: string
    tableReservation: string
    reservationDetails: string
    customerName: string
    reservationTime: string
    numberOfGuests: string
    specialRequests: string
    confirmationStatus: string
    tableLayout: string
    floorPlan: string
    tableStatus: string
    quickStats: string
  }
  
  // Payments
  payments: {
    title: string
    paymentMethods: string
    addPaymentMethod: string
    editPaymentMethod: string
    deletePaymentMethod: string
    methodName: string
    description: string
    isEnabled: string
    paymentGateway: string
    configuration: string
    testMode: string
    liveMode: string
    apiKey: string
    secretKey: string
    merchantId: string
    testPayment: string
    transactionHistory: string
    transactionId: string
    amount: string
    status: string
    paymentMethod: string
    timestamp: string
    refund: string
    partialRefund: string
    fullRefund: string
    refundReason: string
    settlement: string
    settlementReport: string
    paymentReconciliation: string
    failedPayments: string
    paymentAnalytics: string
    revenueByMethod: string
    averageTransaction: string
    paymentTrends: string
  }
  
  // Taxes
  taxes: {
    title: string
    taxRates: string
    addTaxRate: string
    editTaxRate: string
    deleteTaxRate: string
    taxName: string
    taxRate: string
    taxType: string
    inclusive: string
    exclusive: string
    applicableOn: string
    hsnCode: string
    sacCode: string
    gstTreatment: string
    cgst: string
    sgst: string
    igst: string
    utgst: string
    cess: string
    taxExempt: string
    reverseCharge: string
    taxInvoice: string
    billOfSupply: string
    exportInvoice: string
    taxReports: string
    gstReturns: string
    gstr1: string
    gstr2: string
    gstr3b: string
    taxCompliance: string
    taxCalculator: string
    taxSettings: string
  }
  
  // Discounts
  discounts: {
    title: string
    discountTypes: string
    addDiscount: string
    editDiscount: string
    deleteDiscount: string
    discountName: string
    description: string
    discountType: string
    percentage: string
    fixed: string
    buyOneGetOne: string
    happyHours: string
    loyaltyDiscount: string
    amount: string
    minOrderValue: string
    maxDiscount: string
    applicableOn: string
    categories: string
    items: string
    customers: string
    validity: string
    startDate: string
    endDate: string
    daysOfWeek: string
    timeSlots: string
    usageLimit: string
    perCustomer: string
    total: string
    isActive: string
    priority: string
    autoApply: string
    couponCode: string
    discountRules: string
    conditions: string
    actions: string
    discountAnalytics: string
    usageStats: string
    revenueImpact: string
    customerSatisfaction: string
  }
  
  // Loyalty
  loyalty: {
    title: string
    loyaltyProgram: string
    addProgram: string
    editProgram: string
    deleteProgram: string
    programName: string
    description: string
    pointsPerRupee: string
    redemptionRate: string
    minPoints: string
    maxPoints: string
    expiryDays: string
    tiers: string
    tierName: string
    tierBenefits: string
    qualifyingAmount: string
    customers: string
    points: string
    rewards: string
    addReward: string
    editReward: string
    deleteReward: string
    rewardName: string
    rewardDescription: string
    pointsRequired: string
    rewardType: string
    discount: string
    freeItem: string
    cashback: string
    validity: string
    termsConditions: string
    loyaltyAnalytics: string
    customerRetention: string
    programPerformance: string
    rewardRedemption: string
    pointsIssued: string
    pointsRedeemed: string
    activeMembers: string
    tierDistribution: string
  }
  
  // Reports
  reports: {
    title: string
    salesReports: string
    inventoryReports: string
    customerReports: string
    staffReports: string
    financialReports: string
    taxReports: string
    loyaltyReports: string
    generateReport: string
    exportReport: string
    scheduleReport: string
    reportType: string
    dateRange: string
    today: string
    yesterday: string
    thisWeek: string
    lastWeek: string
    thisMonth: string
    lastMonth: string
    thisYear: string
    lastYear: string
    custom: string
    format: string
    pdf: string
    excel: string
    csv: string
    emailReport: string
    saveReport: string
    reportTemplates: string
    savedReports: string
    scheduledReports: string
    reportAnalytics: string
    keyMetrics: string
    trends: string
    comparisons: string
    forecasts: string
  }
  
  // Staff
  staff: {
    title: string
    addStaff: string
    editStaff: string
    deleteStaff: string
    staffName: string
    email: string
    phone: string
    role: string
    permissions: string
    department: string
    joinDate: string
    salary: string
    status: string
    active: string
    inactive: string
    suspended: string
    address: string
    emergencyContact: string
    bankDetails: string
    panCard: string
    aadharCard: string
    attendance: string
    performance: string
    schedule: string
    leaveManagement: string
    payroll: string
    commissions: string
    tips: string
    staffAnalytics: string
    productivity: string
    salesPerformance: string
    customerSatisfaction: string
    attendanceReport: string
    payrollReport: string
    performanceReview: string
    training: string
    documents: string
    notifications: string
  }
  
  // Settings
  settings: {
    title: string
    general: string
    restaurantInfo: string
    branding: string
    invoice: string
    uiPreferences: string
    features: string
    notifications: string
    security: string
    integrations: string
    backup: string
    advanced: string
    restaurantName: string
    address: string
    phone: string
    email: string
    website: string
    gstNumber: string
    fssaiLicense: string
    logo: string
    theme: string
    language: string
    currency: string
    dateFormat: string
    timeFormat: string
    timezone: string
    invoiceTemplate: string
    headerColor: string
    accentColor: string
    showGST: string
    showDiscount: string
    customFooter: string
    customHeader: string
    enableInventory: string
    enableLoyalty: string
    enableOnlineOrders: string
    enableDelivery: string
    enableTableReservation: string
    emailNotifications: string
    smsNotifications: string
    orderNotifications: string
    paymentNotifications: string
    twoFactorAuth: string
    sessionTimeout: string
    passwordPolicy: string
    auditLogs: string
    dataBackup: string
    autoBackup: string
    backupFrequency: string
    backupLocation: string
    systemHealth: string
    apiKeys: string
    webhooks: string
    thirdPartyIntegrations: string
  }
  
  // Notifications
  notifications: {
    title: string
    newOrder: string
    orderStatus: string
    paymentReceived: string
    lowStock: string
    customerFeedback: string
    staffAlert: string
    systemUpdate: string
    securityAlert: string
    marketing: string
    promotional: string
    transactional: string
    sendNotification: string
    notificationType: string
    recipients: string
    message: string
    schedule: string
    immediate: string
    scheduled: string
    recurring: string
    notificationHistory: string
    deliveryStatus: string
    openRate: string
    clickRate: string
    notificationTemplates: string
    createTemplate: string
    editTemplate: string
    deleteTemplate: string
    templateName: string
    templateContent: string
    variables: string
    preview: string
    testNotification: string
    notificationSettings: string
    preferences: string
    unsubscribe: string
  }
  
  // Errors
  errors: {
    general: string
    network: string
    authentication: string
    authorization: string
    validation: string
    notFound: string
    server: string
    database: string
    payment: string
    inventory: string
    order: string
    customer: string
    staff: string
    fileUpload: string
    email: string
    sms: string
    print: string
    export: string
    import: string
    backup: string
    sync: string
    timeout: string
    quota: string
    maintenance: string
    configuration: string
    integration: string
    unknown: string
  }
}

interface I18nContextType {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string) => string
  translations: TranslationKeys
  supportedLanguages: Language[]
  isRTL: boolean
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

interface I18nProviderProps {
  children: ReactNode
  initialLanguage?: string
}

export function I18nProvider({ children, initialLanguage = 'en' }: I18nProviderProps) {
  const [language, setLanguage] = useState(initialLanguage)
  const [translations, setTranslations] = useState<TranslationKeys | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isRTL = language === 'ar' || language === 'he'

  const loadTranslations = async (lang: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/locales/${lang}.json`)
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${lang}`)
      }
      const data = await response.json()
      setTranslations(data)
    } catch (error) {
      console.error(`Error loading translations for ${lang}:`, error)
      // Fallback to English
      if (lang !== 'en') {
        const response = await fetch('/locales/en.json')
        if (response.ok) {
          const data = await response.json()
          setTranslations(data)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTranslations(language)
  }, [language])

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang)
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred_language', lang)
    }
  }

  const t = (key: string): string => {
    if (!translations) return key
    
    const keys = key.split('.')
    let value: any = translations
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return key // Return key if translation not found
      }
    }
    
    return typeof value === 'string' ? value : key
  }

  // Load saved language preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('preferred_language')
      if (savedLanguage && SUPPORTED_LANGUAGES.some(lang => lang.code === savedLanguage)) {
        setLanguage(savedLanguage)
      }
    }
  }, [])

  const value: I18nContextType = {
    language,
    setLanguage: handleSetLanguage,
    t,
    translations: translations || {} as TranslationKeys,
    supportedLanguages: SUPPORTED_LANGUAGES,
    isRTL
  }

  if (isLoading && !translations) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

// Helper hook for translation with fallback
export function useTranslation() {
  const { t, language } = useI18n()
  
  return {
    t,
    language,
    // Add common translation helpers
    formatCurrency: (amount: number, currency?: string) => {
      const curr = currency || 'INR'
      return new Intl.NumberFormat(language === 'hi' ? 'en-IN' : language, {
        style: 'currency',
        currency: curr,
      }).format(amount)
    },
    
    formatDate: (date: Date | string, format?: string) => {
      const d = new Date(date)
      const locale = language === 'hi' ? 'en-IN' : language
      
      switch (format) {
        case 'short':
          return d.toLocaleDateString(locale, { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          })
        case 'long':
          return d.toLocaleDateString(locale, { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        case 'time':
          return d.toLocaleTimeString(locale, { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        default:
          return d.toLocaleDateString(locale)
      }
    },
    
    formatNumber: (num: number) => {
      return new Intl.NumberFormat(language === 'hi' ? 'en-IN' : language).format(num)
    }
  }
}