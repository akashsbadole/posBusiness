import { AccountingProvider, AccountingConfig, AccountingTransaction, AccountingCustomer, AccountingVendor, SyncResult } from './types'
import { TallyProvider } from './tally'
import { ZohoBooksProvider } from './zoho'

export class AccountingManager {
  private providers: Map<string, AccountingProvider> = new Map()
  private configs: Map<string, AccountingConfig> = new Map()

  constructor() {
    // Register providers
    this.providers.set('tally', new TallyProvider({} as AccountingConfig))
    this.providers.set('zoho', new ZohoBooksProvider({} as AccountingConfig))
  }

  async addConfig(config: AccountingConfig): Promise<boolean> {
    try {
      // Test the configuration
      const provider = this.providers.get(config.provider)
      if (!provider) {
        throw new Error(`Unsupported accounting provider: ${config.provider}`)
      }

      const isAuthenticated = await provider.authenticate(config)
      if (!isAuthenticated) {
        throw new Error(`Failed to authenticate with ${config.provider}`)
      }

      // Store the configuration
      this.configs.set(config.provider, config)
      
      // Update provider with new config
      this.providers.set(config.provider, this.createProvider(config))
      
      return true
    } catch (error) {
      console.error(`Failed to add accounting config for ${config.provider}:`, error)
      return false
    }
  }

  async removeConfig(provider: string): Promise<boolean> {
    try {
      this.configs.delete(provider)
      return true
    } catch (error) {
      console.error(`Failed to remove accounting config for ${provider}:`, error)
      return false
    }
  }

  getConfig(provider: string): AccountingConfig | undefined {
    return this.configs.get(provider)
  }

  getAllConfigs(): AccountingConfig[] {
    return Array.from(this.configs.values())
  }

  async syncTransactions(provider: string, transactions: AccountingTransaction[]): Promise<SyncResult> {
    const config = this.configs.get(provider)
    if (!config) {
      throw new Error(`No configuration found for provider: ${provider}`)
    }

    const accountingProvider = this.createProvider(config)
    return await accountingProvider.syncTransactions(transactions)
  }

  async syncCustomers(provider: string, customers: AccountingCustomer[]): Promise<SyncResult> {
    const config = this.configs.get(provider)
    if (!config) {
      throw new Error(`No configuration found for provider: ${provider}`)
    }

    const accountingProvider = this.createProvider(config)
    return await accountingProvider.syncCustomers(customers)
  }

  async syncVendors(provider: string, vendors: AccountingVendor[]): Promise<SyncResult> {
    const config = this.configs.get(provider)
    if (!config) {
      throw new Error(`No configuration found for provider: ${provider}`)
    }

    const accountingProvider = this.createProvider(config)
    return await accountingProvider.syncVendors(vendors)
  }

  async syncAllData(provider: string, data: {
    transactions: AccountingTransaction[]
    customers: AccountingCustomer[]
    vendors: AccountingVendor[]
  }): Promise<SyncResult> {
    const config = this.configs.get(provider)
    if (!config) {
      throw new Error(`No configuration found for provider: ${provider}`)
    }

    const accountingProvider = this.createProvider(config)
    
    const results = await Promise.all([
      accountingProvider.syncTransactions(data.transactions),
      accountingProvider.syncCustomers(data.customers),
      accountingProvider.syncVendors(data.vendors)
    ])

    const combinedResult: SyncResult = {
      success: results.every(r => r.success),
      syncedTransactions: results[0].syncedTransactions,
      failedTransactions: results[0].failedTransactions,
      syncedCustomers: results[1].syncedCustomers,
      failedCustomers: results[1].failedCustomers,
      syncedVendors: results[2].syncedVendors,
      failedVendors: results[2].failedVendors,
      errors: [...results[0].errors, ...results[1].errors, ...results[2].errors],
      lastSyncTime: new Date()
    }

    // Update last sync time
    config.lastSync = combinedResult.lastSyncTime
    this.configs.set(provider, config)

    return combinedResult
  }

  async getAccounts(provider: string): Promise<any[]> {
    const config = this.configs.get(provider)
    if (!config) {
      throw new Error(`No configuration found for provider: ${provider}`)
    }

    const accountingProvider = this.createProvider(config)
    return await accountingProvider.getAccounts()
  }

  async createTransaction(provider: string, transaction: AccountingTransaction): Promise<string> {
    const config = this.configs.get(provider)
    if (!config) {
      throw new Error(`No configuration found for provider: ${provider}`)
    }

    const accountingProvider = this.createProvider(config)
    return await accountingProvider.createTransaction(transaction)
  }

  async updateTransaction(provider: string, id: string, transaction: Partial<AccountingTransaction>): Promise<boolean> {
    const config = this.configs.get(provider)
    if (!config) {
      throw new Error(`No configuration found for provider: ${provider}`)
    }

    const accountingProvider = this.createProvider(config)
    return await accountingProvider.updateTransaction(id, transaction)
  }

  async deleteTransaction(provider: string, id: string): Promise<boolean> {
    const config = this.configs.get(provider)
    if (!config) {
      throw new Error(`No configuration found for provider: ${provider}`)
    }

    const accountingProvider = this.createProvider(config)
    return await accountingProvider.deleteTransaction(id)
  }

  async getTransactions(provider: string, startDate?: Date, endDate?: Date): Promise<AccountingTransaction[]> {
    const config = this.configs.get(provider)
    if (!config) {
      throw new Error(`No configuration found for provider: ${provider}`)
    }

    const accountingProvider = this.createProvider(config)
    return await accountingProvider.getTransactions(startDate, endDate)
  }

  async testConnection(provider: string): Promise<boolean> {
    const config = this.configs.get(provider)
    if (!config) {
      throw new Error(`No configuration found for provider: ${provider}`)
    }

    const accountingProvider = this.createProvider(config)
    return await accountingProvider.testConnection()
  }

  async testAllConnections(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {}
    
    for (const [provider, config] of this.configs) {
      try {
        results[provider] = await this.testConnection(provider)
      } catch (error) {
        console.error(`Connection test failed for ${provider}:`, error)
        results[provider] = false
      }
    }

    return results
  }

  async autoSync(provider: string): Promise<SyncResult> {
    const config = this.configs.get(provider)
    if (!config) {
      throw new Error(`No configuration found for provider: ${provider}`)
    }

    // Check if auto-sync is enabled and it's time to sync
    if (!config.isEnabled) {
      throw new Error(`Auto-sync is disabled for provider: ${provider}`)
    }

    const now = new Date()
    const lastSync = config.lastSync || new Date(0)
    const syncInterval = this.getSyncInterval(config.syncFrequency)

    if (now.getTime() - lastSync.getTime() < syncInterval) {
      throw new Error(`Auto-sync not due yet for provider: ${provider}`)
    }

    // Get data to sync (this would typically come from your database)
    const data = await this.getDataToSync(provider)
    
    return await this.syncAllData(provider, data)
  }

  private createProvider(config: AccountingConfig): AccountingProvider {
    switch (config.provider) {
      case 'tally':
        return new TallyProvider(config)
      case 'zoho':
        return new ZohoBooksProvider(config)
      default:
        throw new Error(`Unsupported provider: ${config.provider}`)
    }
  }

  private getSyncInterval(frequency: string): number {
    const intervals: { [key: string]: number } = {
      'realtime': 0, // Sync immediately
      'hourly': 60 * 60 * 1000, // 1 hour
      'daily': 24 * 60 * 60 * 1000, // 24 hours
      'weekly': 7 * 24 * 60 * 60 * 1000 // 7 days
    }
    return intervals[frequency] || intervals.daily
  }

  private async getDataToSync(provider: string): Promise<{
    transactions: AccountingTransaction[]
    customers: AccountingCustomer[]
    vendors: AccountingVendor[]
  }> {
    // This would typically fetch data from your database
    // For now, we'll return empty arrays
    return {
      transactions: [],
      customers: [],
      vendors: []
    }
  }

  // Utility methods for converting POS data to accounting format
  convertOrderToTransaction(order: any): AccountingTransaction {
    return {
      id: order.id,
      type: 'sales',
      date: new Date(order.createdAt),
      amount: order.totalAmount,
      currency: 'INR',
      description: `Order #${order.id} - ${order.customer?.name || 'Walk-in Customer'}`,
      referenceNumber: order.id,
      customerId: order.customerId,
      accountId: 'sales_account', // This would be mapped from config
      taxAmount: order.taxAmount,
      taxRate: order.taxRate,
      lineItems: order.items?.map((item: any) => ({
        id: item.id,
        description: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        amount: item.total,
        accountId: 'sales_account',
        taxRate: item.taxRate,
        taxAmount: item.taxAmount,
        itemId: item.menuItemId,
        categoryId: item.categoryId
      })) || [],
      status: 'pending'
    }
  }

  convertCustomerToAccounting(customer: any): AccountingCustomer {
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address ? {
        street: customer.address.street,
        city: customer.address.city,
        state: customer.address.state,
        country: customer.address.country || 'India',
        postalCode: customer.address.postalCode
      } : undefined,
      gstNumber: customer.gstNumber,
      panNumber: customer.panNumber,
      syncStatus: 'pending'
    }
  }

  convertVendorToAccounting(vendor: any): AccountingVendor {
    return {
      id: vendor.id,
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address ? {
        street: vendor.address.street,
        city: vendor.address.city,
        state: vendor.address.state,
        country: vendor.address.country || 'India',
        postalCode: vendor.address.postalCode
      } : undefined,
      gstNumber: vendor.gstNumber,
      panNumber: vendor.panNumber,
      syncStatus: 'pending'
    }
  }
}

// Global instance
export const accountingManager = new AccountingManager()