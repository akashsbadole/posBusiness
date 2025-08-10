export interface AccountingConfig {
  provider: 'tally' | 'zoho' | 'quickbooks' | 'xero'
  apiKey?: string
  apiSecret?: string
  companyId?: string
  baseUrl?: string
  isEnabled: boolean
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly'
  lastSync?: Date
  mappings?: AccountingMappings
}

export interface AccountingMappings {
  // Account mappings
  salesAccount?: string
  purchaseAccount?: string
  taxAccount?: string
  discountAccount?: string
  expenseAccount?: string
  assetAccount?: string
  liabilityAccount?: string
  equityAccount?: string
  
  // Tax mappings
  cgstAccount?: string
  sgstAccount?: string
  igstAccount?: string
  cessAccount?: string
  
  // Category mappings
  foodCategory?: string
  beverageCategory?: string
  serviceCategory?: string
  otherCategory?: string
}

export interface AccountingTransaction {
  id: string
  type: 'sales' | 'purchase' | 'expense' | 'payment' | 'refund'
  date: Date
  amount: number
  currency: string
  description: string
  referenceNumber?: string
  customerId?: string
  vendorId?: string
  accountId: string
  taxAmount?: number
  taxRate?: number
  lineItems?: AccountingLineItem[]
  status: 'pending' | 'synced' | 'failed'
  errorMessage?: string
}

export interface AccountingLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  accountId: string
  taxRate?: number
  taxAmount?: number
  itemId?: string
  categoryId?: string
}

export interface AccountingCustomer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: {
    street?: string
    city?: string
    state?: string
    country?: string
    postalCode?: string
  }
  gstNumber?: string
  panNumber?: string
  accountingId?: string // ID in the accounting system
  syncStatus: 'pending' | 'synced' | 'failed'
}

export interface AccountingVendor {
  id: string
  name: string
  email?: string
  phone?: string
  address?: {
    street?: string
    city?: string
    state?: string
    country?: string
    postalCode?: string
  }
  gstNumber?: string
  panNumber?: string
  accountingId?: string // ID in the accounting system
  syncStatus: 'pending' | 'synced' | 'failed'
}

export interface SyncResult {
  success: boolean
  syncedTransactions: number
  failedTransactions: number
  syncedCustomers: number
  failedCustomers: number
  syncedVendors: number
  failedVendors: number
  errors: string[]
  lastSyncTime: Date
}

export interface AccountingProvider {
  name: string
  authenticate(config: AccountingConfig): Promise<boolean>
  syncTransactions(transactions: AccountingTransaction[]): Promise<SyncResult>
  syncCustomers(customers: AccountingCustomer[]): Promise<SyncResult>
  syncVendors(vendors: AccountingVendor[]): Promise<SyncResult>
  getAccounts(): Promise<any[]>
  createTransaction(transaction: AccountingTransaction): Promise<string>
  updateTransaction(id: string, transaction: Partial<AccountingTransaction>): Promise<boolean>
  deleteTransaction(id: string): Promise<boolean>
  getTransactions(startDate?: Date, endDate?: Date): Promise<AccountingTransaction[]>
  testConnection(): Promise<boolean>
}