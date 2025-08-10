import { AccountingProvider, AccountingConfig, AccountingTransaction, AccountingCustomer, AccountingVendor, SyncResult } from './types'

export class ZohoBooksProvider implements AccountingProvider {
  name = 'Zoho Books'

  private config: AccountingConfig
  private baseUrl = 'https://books.zoho.com/api/v3'

  constructor(config: AccountingConfig) {
    this.config = config
  }

  async authenticate(config: AccountingConfig): Promise<boolean> {
    try {
      if (!config.apiKey || !config.companyId) {
        throw new Error('Zoho Books API key and organization ID are required')
      }

      // Test authentication by getting organization info
      const response = await this.makeRequest('GET', `organizations/${config.companyId}`)
      return response.organization !== undefined
    } catch (error) {
      console.error('Zoho Books authentication failed:', error)
      return false
    }
  }

  async syncTransactions(transactions: AccountingTransaction[]): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      syncedTransactions: 0,
      failedTransactions: 0,
      syncedCustomers: 0,
      failedCustomers: 0,
      syncedVendors: 0,
      failedVendors: 0,
      errors: [],
      lastSyncTime: new Date()
    }

    try {
      for (const transaction of transactions) {
        try {
          await this.createTransaction(transaction)
          result.syncedTransactions++
        } catch (error) {
          result.failedTransactions++
          result.errors.push(`Failed to sync transaction ${transaction.id}: ${error}`)
        }
      }
    } catch (error) {
      result.success = false
      result.errors.push(`Sync failed: ${error}`)
    }

    return result
  }

  async syncCustomers(customers: AccountingCustomer[]): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      syncedTransactions: 0,
      failedTransactions: 0,
      syncedCustomers: 0,
      failedCustomers: 0,
      syncedVendors: 0,
      failedVendors: 0,
      errors: [],
      lastSyncTime: new Date()
    }

    try {
      for (const customer of customers) {
        try {
          await this.createCustomer(customer)
          result.syncedCustomers++
        } catch (error) {
          result.failedCustomers++
          result.errors.push(`Failed to sync customer ${customer.id}: ${error}`)
        }
      }
    } catch (error) {
      result.success = false
      result.errors.push(`Customer sync failed: ${error}`)
    }

    return result
  }

  async syncVendors(vendors: AccountingVendor[]): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      syncedTransactions: 0,
      failedTransactions: 0,
      syncedCustomers: 0,
      failedCustomers: 0,
      syncedVendors: 0,
      failedVendors: 0,
      errors: [],
      lastSyncTime: new Date()
    }

    try {
      for (const vendor of vendors) {
        try {
          await this.createVendor(vendor)
          result.syncedVendors++
        } catch (error) {
          result.failedVendors++
          result.errors.push(`Failed to sync vendor ${vendor.id}: ${error}`)
        }
      }
    } catch (error) {
      result.success = false
      result.errors.push(`Vendor sync failed: ${error}`)
    }

    return result
  }

  async getAccounts(): Promise<any[]> {
    try {
      const response = await this.makeRequest('GET', 'chartofaccounts')
      return response.chartofaccounts || []
    } catch (error) {
      console.error('Failed to get Zoho Books accounts:', error)
      return []
    }
  }

  async createTransaction(transaction: AccountingTransaction): Promise<string> {
    try {
      const zohoTransaction = this.convertTransactionToZoho(transaction)
      const endpoint = this.getTransactionEndpoint(transaction.type)
      const response = await this.makeRequest('POST', endpoint, zohoTransaction)
      return response.transaction?.transaction_id || transaction.id
    } catch (error) {
      throw new Error(`Failed to create transaction in Zoho Books: ${error}`)
    }
  }

  async updateTransaction(id: string, transaction: Partial<AccountingTransaction>): Promise<boolean> {
    try {
      const zohoTransaction = this.convertTransactionToZoho(transaction as AccountingTransaction)
      const endpoint = this.getTransactionEndpoint(transaction.type || 'sales')
      await this.makeRequest('PUT', `${endpoint}/${id}`, zohoTransaction)
      return true
    } catch (error) {
      console.error('Failed to update transaction in Zoho Books:', error)
      return false
    }
  }

  async deleteTransaction(id: string): Promise<boolean> {
    try {
      // Zoho Books typically doesn't allow direct deletion, but voiding
      await this.makeRequest('POST', `salesinvoices/${id}/void`)
      return true
    } catch (error) {
      console.error('Failed to delete transaction in Zoho Books:', error)
      return false
    }
  }

  async getTransactions(startDate?: Date, endDate?: Date): Promise<AccountingTransaction[]> {
    try {
      let endpoint = 'salesinvoices'
      const params: any = {}
      
      if (startDate) {
        params.date_start = startDate.toISOString().split('T')[0]
      }
      if (endDate) {
        params.date_end = endDate.toISOString().split('T')[0]
      }

      const response = await this.makeRequest('GET', endpoint, params)
      return this.convertZohoTransactions(response.invoices || [])
    } catch (error) {
      console.error('Failed to get transactions from Zoho Books:', error)
      return []
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest('GET', 'organizations')
      return Array.isArray(response.organizations) && response.organizations.length > 0
    } catch (error) {
      console.error('Zoho Books connection test failed:', error)
      return false
    }
  }

  private async makeRequest(method: string, endpoint: string, data?: any): Promise<any> {
    const url = `${this.baseUrl}/${endpoint}`
    const headers = {
      'Authorization': `Zoho-oauthtoken ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      'X-com-zoho-books-organizationid': this.config.companyId || ''
    }

    const options: RequestInit = {
      method,
      headers
    }

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data)
    }

    const response = await fetch(url, options)
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    return response.json()
  }

  private getTransactionEndpoint(type: string): string {
    const endpoints: { [key: string]: string } = {
      'sales': 'salesinvoices',
      'purchase': 'purchaseorders',
      'expense': 'expenses',
      'payment': 'customerpayments',
      'refund': 'creditnotes'
    }
    return endpoints[type] || 'journalentries'
  }

  private convertTransactionToZoho(transaction: AccountingTransaction): any {
    const baseTransaction = {
      customer_id: transaction.customerId,
      date: transaction.date.toISOString().split('T')[0],
      notes: transaction.description,
      custom_fields: [
        {
          customfield_id: 'reference_number',
          value: transaction.referenceNumber || ''
        }
      ]
    }

    switch (transaction.type) {
      case 'sales':
        return {
          ...baseTransaction,
          invoice_number: transaction.referenceNumber || `INV-${Date.now()}`,
          line_items: transaction.lineItems?.map(item => ({
            item_id: item.itemId,
            name: item.description,
            quantity: item.quantity,
            rate: item.unitPrice,
            discount: item.taxAmount ? 0 : undefined,
            tax_id: item.taxRate ? 'gst' : undefined
          })) || [],
          payment_terms: 15,
          payment_options: {
            payment_gateways: ['zoho_payments']
          }
        }

      case 'purchase':
        return {
          ...baseTransaction,
          vendor_id: transaction.vendorId,
          purchaseorder_number: transaction.referenceNumber,
          line_items: transaction.lineItems?.map(item => ({
            item_id: item.itemId,
            name: item.description,
            quantity: item.quantity,
            rate: item.unitPrice
          })) || []
        }

      case 'expense':
        return {
          ...baseTransaction,
          account_id: transaction.accountId,
          amount: transaction.amount,
          paid_through_account_id: transaction.accountId,
          date: transaction.date.toISOString().split('T')[0],
          description: transaction.description,
          reference_number: transaction.referenceNumber
        }

      case 'payment':
        return {
          ...baseTransaction,
          customer_id: transaction.customerId,
          amount: transaction.amount,
          date: transaction.date.toISOString().split('T')[0],
          payment_method: 'cash',
          description: transaction.description,
          invoices: [
            {
              invoice_id: transaction.referenceNumber,
              amount_applied: transaction.amount
            }
          ]
        }

      case 'refund':
        return {
          ...baseTransaction,
          customer_id: transaction.customerId,
          creditnote_number: transaction.referenceNumber || `CN-${Date.now()}`,
          line_items: transaction.lineItems?.map(item => ({
            item_id: item.itemId,
            name: item.description,
            quantity: item.quantity,
            rate: item.unitPrice
          })) || []
        }

      default:
        return baseTransaction
    }
  }

  private convertZohoTransactions(zohoTransactions: any[]): AccountingTransaction[] {
    return zohoTransactions.map(zohoTx => ({
      id: zohoTx.transaction_id || zohoTx.invoice_id || zohoTx.expense_id,
      type: this.mapZohoTypeToTransaction(zohoTx),
      date: new Date(zohoTx.date),
      amount: zohoTx.amount || zohoTx.total || 0,
      currency: zohoTx.currency_code || 'INR',
      description: zohoTx.notes || zohoTx.description || '',
      referenceNumber: zohoTx.invoice_number || zohoTx.reference_number,
      customerId: zohoTx.customer_id,
      accountId: zohoTx.account_id,
      taxAmount: zohoTx.tax_total,
      status: 'synced'
    }))
  }

  private mapZohoTypeToTransaction(zohoTx: any): string {
    if (zohoTx.invoice_id) return 'sales'
    if (zohoTx.purchaseorder_id) return 'purchase'
    if (zohoTx.expense_id) return 'expense'
    if (zohoTx.payment_id) return 'payment'
    if (zohoTx.creditnote_id) return 'refund'
    return 'expense'
  }

  private async createCustomer(customer: AccountingCustomer): Promise<string> {
    try {
      const zohoCustomer = {
        customer_name: customer.name,
        email: customer.email,
        phone: customer.phone,
        billing_address: {
          address: customer.address?.street,
          city: customer.address?.city,
          state: customer.address?.state,
          country: customer.address?.country,
          zip: customer.address?.postalCode
        },
        gst_treatment: 'business_gst',
        gst_number: customer.gstNumber,
        pan_number: customer.panNumber
      }

      const response = await this.makeRequest('POST', 'contacts', zohoCustomer)
      return response.contact?.contact_id || customer.id
    } catch (error) {
      throw new Error(`Failed to create customer in Zoho Books: ${error}`)
    }
  }

  private async createVendor(vendor: AccountingVendor): Promise<string> {
    try {
      const zohoVendor = {
        vendor_name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        billing_address: {
          address: vendor.address?.street,
          city: vendor.address?.city,
          state: vendor.address?.state,
          country: vendor.address?.country,
          zip: vendor.address?.postalCode
        },
        gst_treatment: 'business_gst',
        gst_number: vendor.gstNumber,
        pan_number: vendor.panNumber
      }

      const response = await this.makeRequest('POST', 'vendors', zohoVendor)
      return response.vendor?.vendor_id || vendor.id
    } catch (error) {
      throw new Error(`Failed to create vendor in Zoho Books: ${error}`)
    }
  }
}