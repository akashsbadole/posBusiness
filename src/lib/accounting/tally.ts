import { AccountingProvider, AccountingConfig, AccountingTransaction, AccountingCustomer, AccountingVendor, SyncResult } from './types'

export class TallyProvider implements AccountingProvider {
  name = 'Tally'

  private config: AccountingConfig

  constructor(config: AccountingConfig) {
    this.config = config
  }

  async authenticate(config: AccountingConfig): Promise<boolean> {
    try {
      // Tally typically uses XML over HTTP or ODBC
      // For this implementation, we'll simulate the authentication
      if (!config.baseUrl || !config.companyId) {
        throw new Error('Tally base URL and company ID are required')
      }

      // In a real implementation, this would make an HTTP request to Tally
      // Example: POST to http://tally-server:9000 with XML request
      const testRequest = {
        request: {
          type: 'authenticate',
          company: config.companyId,
          apiKey: config.apiKey
        }
      }

      // Simulate API call
      console.log('Authenticating with Tally:', testRequest)
      
      // Return true for demo purposes
      return true
    } catch (error) {
      console.error('Tally authentication failed:', error)
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
      // In real implementation, this would fetch accounts from Tally
      // Tally XML request for ledger accounts
      const request = this.createTallyXMLRequest({
        type: 'get_ledgers',
        company: this.config.companyId
      })

      const response = await this.makeTallyRequest(request)
      return response.ledgers || []
    } catch (error) {
      console.error('Failed to get Tally accounts:', error)
      return []
    }
  }

  async createTransaction(transaction: AccountingTransaction): Promise<string> {
    try {
      const tallyVoucher = this.convertTransactionToTallyVoucher(transaction)
      const request = this.createTallyXMLRequest({
        type: 'create_voucher',
        company: this.config.companyId,
        voucher: tallyVoucher
      })

      const response = await this.makeTallyRequest(request)
      return response.voucherId || transaction.id
    } catch (error) {
      throw new Error(`Failed to create transaction in Tally: ${error}`)
    }
  }

  async updateTransaction(id: string, transaction: Partial<AccountingTransaction>): Promise<boolean> {
    try {
      const tallyVoucher = this.convertTransactionToTallyVoucher(transaction as AccountingTransaction)
      const request = this.createTallyXMLRequest({
        type: 'alter_voucher',
        company: this.config.companyId,
        voucher: { ...tallyVoucher, id }
      })

      await this.makeTallyRequest(request)
      return true
    } catch (error) {
      console.error('Failed to update transaction in Tally:', error)
      return false
    }
  }

  async deleteTransaction(id: string): Promise<boolean> {
    try {
      const request = this.createTallyXMLRequest({
        type: 'delete_voucher',
        company: this.config.companyId,
        voucherId: id
      })

      await this.makeTallyRequest(request)
      return true
    } catch (error) {
      console.error('Failed to delete transaction in Tally:', error)
      return false
    }
  }

  async getTransactions(startDate?: Date, endDate?: Date): Promise<AccountingTransaction[]> {
    try {
      const request = this.createTallyXMLRequest({
        type: 'get_vouchers',
        company: this.config.companyId,
        startDate,
        endDate
      })

      const response = await this.makeTallyRequest(request)
      return this.convertTallyVouchersToTransactions(response.vouchers || [])
    } catch (error) {
      console.error('Failed to get transactions from Tally:', error)
      return []
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const request = this.createTallyXMLRequest({
        type: 'test_connection',
        company: this.config.companyId
      })

      await this.makeTallyRequest(request)
      return true
    } catch (error) {
      console.error('Tally connection test failed:', error)
      return false
    }
  }

  private createTallyXMLRequest(data: any): string {
    // Convert request to Tally XML format
    return `<?xml version="1.0" encoding="UTF-8"?>
      <ENVELOPE>
        <HEADER>
          <TALLYREQUEST>Export Data</TALLYREQUEST>
        </HEADER>
        <BODY>
          <IMPORTDATA>
            <REQUESTDESC>
              <REPORTNAME>${data.type}</REPORTNAME>
              <STATICVARIABLES>
                <SVCURRENTCOMPANY>${data.company}</SVCURRENTCOMPANY>
              </STATICVARIABLES>
            </REQUESTDESC>
            ${data.voucher ? this.createVoucherXML(data.voucher) : ''}
          </IMPORTDATA>
        </BODY>
      </ENVELOPE>`
  }

  private createVoucherXML(voucher: any): string {
    return `
      <REQUESTDATA>
        <TALLYMESSAGE>
          <VOUCHER>
            <DATE>${this.formatDate(voucher.date)}</DATE>
            <VOUCHERTYPENAME>${voucher.type}</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${voucher.referenceNumber || ''}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>${voucher.partyName || ''}</PARTYLEDGERNAME>
            <NARRATION>${voucher.description || ''}</NARRATION>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${voucher.accountName}</LEDGERNAME>
              <AMOUNT>${voucher.amount}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>`
  }

  private async makeTallyRequest(xmlRequest: string): Promise<any> {
    // In real implementation, this would make HTTP request to Tally server
    // For demo, we'll simulate the response
    console.log('Sending Tally XML request:', xmlRequest)
    
    // Simulate API response
    return {
      status: 'success',
      voucherId: 'TALLY_' + Date.now(),
      message: 'Transaction processed successfully'
    }
  }

  private convertTransactionToTallyVoucher(transaction: AccountingTransaction): any {
    return {
      date: transaction.date,
      type: this.mapTransactionTypeToTally(transaction.type),
      referenceNumber: transaction.referenceNumber,
      description: transaction.description,
      amount: transaction.amount,
      accountName: transaction.accountId,
      partyName: transaction.customerId || transaction.vendorId
    }
  }

  private mapTransactionTypeToTally(type: string): string {
    const mapping: { [key: string]: string } = {
      'sales': 'Sales',
      'purchase': 'Purchase',
      'expense': 'Payment',
      'payment': 'Receipt',
      'refund': 'Credit Note'
    }
    return mapping[type] || 'Journal'
  }

  private convertTallyVouchersToTransactions(vouchers: any[]): AccountingTransaction[] {
    return vouchers.map(voucher => ({
      id: voucher.id,
      type: this.mapTallyTypeToTransaction(voucher.type),
      date: new Date(voucher.date),
      amount: voucher.amount,
      currency: 'INR',
      description: voucher.narration,
      referenceNumber: voucher.voucherNumber,
      accountId: voucher.ledgerName,
      status: 'synced'
    }))
  }

  private mapTallyTypeToTransaction(type: string): string {
    const mapping: { [key: string]: string } = {
      'Sales': 'sales',
      'Purchase': 'purchase',
      'Payment': 'expense',
      'Receipt': 'payment',
      'Credit Note': 'refund',
      'Journal': 'expense'
    }
    return mapping[type] || 'expense'
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0] // YYYY-MM-DD format
  }

  private async createCustomer(customer: AccountingCustomer): Promise<string> {
    try {
      const request = this.createTallyXMLRequest({
        type: 'create_ledger',
        company: this.config.companyId,
        ledger: {
          name: customer.name,
          parent: 'Sundry Debtors',
          address: customer.address,
          gstin: customer.gstNumber,
          pan: customer.panNumber
        }
      })

      const response = await this.makeTallyRequest(request)
      return response.ledgerId || customer.id
    } catch (error) {
      throw new Error(`Failed to create customer in Tally: ${error}`)
    }
  }

  private async createVendor(vendor: AccountingVendor): Promise<string> {
    try {
      const request = this.createTallyXMLRequest({
        type: 'create_ledger',
        company: this.config.companyId,
        ledger: {
          name: vendor.name,
          parent: 'Sundry Creditors',
          address: vendor.address,
          gstin: vendor.gstNumber,
          pan: vendor.panNumber
        }
      })

      const response = await this.makeTallyRequest(request)
      return response.ledgerId || vendor.id
    } catch (error) {
      throw new Error(`Failed to create vendor in Tally: ${error}`)
    }
  }
}