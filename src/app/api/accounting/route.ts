import { NextRequest, NextResponse } from 'next/server'
import { accountingManager } from '@/lib/accounting/manager'
import { AccountingConfig } from '@/lib/accounting/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const provider = searchParams.get('provider')

    if (!action) {
      return NextResponse.json(
        { error: 'Action parameter is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'list':
        const configs = accountingManager.getAllConfigs()
        return NextResponse.json({ configs })

      case 'get':
        if (!provider) {
          return NextResponse.json(
            { error: 'Provider parameter is required' },
            { status: 400 }
          )
        }
        const config = accountingManager.getConfig(provider)
        return NextResponse.json({ config })

      case 'accounts':
        if (!provider) {
          return NextResponse.json(
            { error: 'Provider parameter is required' },
            { status: 400 }
          )
        }
        const accounts = await accountingManager.getAccounts(provider)
        return NextResponse.json({ accounts })

      case 'transactions':
        if (!provider) {
          return NextResponse.json(
            { error: 'Provider parameter is required' },
            { status: 400 }
          )
        }
        const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined
        const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined
        const transactions = await accountingManager.getTransactions(provider, startDate, endDate)
        return NextResponse.json({ transactions })

      case 'test':
        if (!provider) {
          return NextResponse.json(
            { error: 'Provider parameter is required' },
            { status: 400 }
          )
        }
        const testResult = await accountingManager.testConnection(provider)
        return NextResponse.json({ success: testResult })

      case 'testAll':
        const allTestResults = await accountingManager.testAllConnections()
        return NextResponse.json({ results: allTestResults })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Accounting GET error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, provider, config, data } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action parameter is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'addConfig':
        if (!config) {
          return NextResponse.json(
            { error: 'Config parameter is required' },
            { status: 400 }
          )
        }
        const addResult = await accountingManager.addConfig(config)
        return NextResponse.json({ success: addResult })

      case 'removeConfig':
        if (!provider) {
          return NextResponse.json(
            { error: 'Provider parameter is required' },
            { status: 400 }
          )
        }
        const removeResult = await accountingManager.removeConfig(provider)
        return NextResponse.json({ success: removeResult })

      case 'syncTransactions':
        if (!provider || !data?.transactions) {
          return NextResponse.json(
            { error: 'Provider and transactions data are required' },
            { status: 400 }
          )
        }
        const syncResult = await accountingManager.syncTransactions(provider, data.transactions)
        return NextResponse.json(syncResult)

      case 'syncCustomers':
        if (!provider || !data?.customers) {
          return NextResponse.json(
            { error: 'Provider and customers data are required' },
            { status: 400 }
          )
        }
        const customerSyncResult = await accountingManager.syncCustomers(provider, data.customers)
        return NextResponse.json(customerSyncResult)

      case 'syncVendors':
        if (!provider || !data?.vendors) {
          return NextResponse.json(
            { error: 'Provider and vendors data are required' },
            { status: 400 }
          )
        }
        const vendorSyncResult = await accountingManager.syncVendors(provider, data.vendors)
        return NextResponse.json(vendorSyncResult)

      case 'syncAll':
        if (!provider || !data) {
          return NextResponse.json(
            { error: 'Provider and data are required' },
            { status: 400 }
          )
        }
        const allSyncResult = await accountingManager.syncAllData(provider, data)
        return NextResponse.json(allSyncResult)

      case 'createTransaction':
        if (!provider || !data?.transaction) {
          return NextResponse.json(
            { error: 'Provider and transaction data are required' },
            { status: 400 }
          )
        }
        const transactionId = await accountingManager.createTransaction(provider, data.transaction)
        return NextResponse.json({ transactionId })

      case 'updateTransaction':
        if (!provider || !data?.id || !data?.transaction) {
          return NextResponse.json(
            { error: 'Provider, transaction ID, and transaction data are required' },
            { status: 400 }
          )
        }
        const updateResult = await accountingManager.updateTransaction(provider, data.id, data.transaction)
        return NextResponse.json({ success: updateResult })

      case 'deleteTransaction':
        if (!provider || !data?.id) {
          return NextResponse.json(
            { error: 'Provider and transaction ID are required' },
            { status: 400 }
          )
        }
        const deleteResult = await accountingManager.deleteTransaction(provider, data.id)
        return NextResponse.json({ success: deleteResult })

      case 'autoSync':
        if (!provider) {
          return NextResponse.json(
            { error: 'Provider parameter is required' },
            { status: 400 }
          )
        }
        const autoSyncResult = await accountingManager.autoSync(provider)
        return NextResponse.json(autoSyncResult)

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Accounting POST error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}