import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface TaxCalculationRequest {
  restaurantId: string
  subtotal: number
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
    category?: string
    hsnCode?: string
    isExempt?: boolean
  }>
  customerState?: string
  restaurantState?: string
  isInterState?: boolean
}

interface TaxBreakdown {
  cgst: number
  sgst: number
  igst: number
  cess: number
  total: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as TaxCalculationRequest
    const { restaurantId, subtotal, items, customerState, restaurantState, isInterState } = body

    if (!restaurantId || subtotal === undefined || !items) {
      return NextResponse.json(
        { error: 'Restaurant ID, subtotal, and items are required' },
        { status: 400 }
      )
    }

    // Get business settings for tax configuration
    const businessSettings = await db.businessSettings.findUnique({
      where: { restaurantId }
    })

    if (!businessSettings) {
      return NextResponse.json(
        { error: 'Business settings not found' },
        { status: 404 }
      )
    }

    const taxConfig = businessSettings.taxSettings || {}

    // Default tax rates if not configured
    const defaultRates = {
      cgst: taxConfig.cgstRate || 2.5,
      sgst: taxConfig.sgstRate || 2.5,
      igst: taxConfig.igstRate || 5,
      cess: taxConfig.cessRate || 0,
      standardRate: taxConfig.standardRate || 5
    }

    // Calculate tax breakdown
    const taxBreakdown: TaxBreakdown = {
      cgst: 0,
      sgst: 0,
      igst: 0,
      cess: 0,
      total: 0
    }

    // Determine if transaction is inter-state
    const isInterStateTransaction = isInterState || 
      (customerState && restaurantState && customerState !== restaurantState)

    // Process each item
    for (const item of items) {
      const itemAmount = item.price * item.quantity

      // Skip tax-exempt items
      if (item.isExempt) {
        continue
      }

      // Get item-specific tax rate or use default
      let itemTaxRate = defaultRates.standardRate

      // Check for category-specific rates
      if (item.category && taxConfig.categoryRates) {
        const categoryRate = taxConfig.categoryRates[item.category]
        if (categoryRate !== undefined) {
          itemTaxRate = categoryRate
        }
      }

      // Check for HSN code-specific rates
      if (item.hsnCode && taxConfig.hsnRates) {
        const hsnRate = taxConfig.hsnRates[item.hsnCode]
        if (hsnRate !== undefined) {
          itemTaxRate = hsnRate
        }
      }

      // Calculate tax based on transaction type
      if (isInterStateTransaction) {
        // IGST for inter-state transactions
        const igstAmount = (itemAmount * itemTaxRate) / 100
        taxBreakdown.igst += igstAmount
      } else {
        // CGST + SGST for intra-state transactions
        const cgstAmount = (itemAmount * (itemTaxRate / 2)) / 100
        const sgstAmount = (itemAmount * (itemTaxRate / 2)) / 100
        taxBreakdown.cgst += cgstAmount
        taxBreakdown.sgst += sgstAmount
      }

      // Calculate CESS if applicable
      if (taxConfig.enableCess && defaultRates.cess > 0) {
        const cessAmount = (itemAmount * defaultRates.cess) / 100
        taxBreakdown.cess += cessAmount
      }
    }

    // Calculate total tax
    taxBreakdown.total = taxBreakdown.cgst + taxBreakdown.sgst + taxBreakdown.igst + taxBreakdown.cess

    // Apply tax exemptions if configured
    if (taxConfig.exemptions) {
      for (const exemption of taxConfig.exemptions) {
        if (exemption.type === 'AMOUNT_BASED' && subtotal <= exemption.threshold) {
          // Apply exemption - reduce tax by exemption percentage
          const exemptionAmount = (taxBreakdown.total * exemption.percentage) / 100
          taxBreakdown.total -= exemptionAmount
          
          // Distribute exemption reduction proportionally
          const totalTaxComponents = taxBreakdown.cgst + taxBreakdown.sgst + taxBreakdown.igst + taxBreakdown.cess
          if (totalTaxComponents > 0) {
            const exemptionRatio = exemptionAmount / totalTaxComponents
            taxBreakdown.cgst *= (1 - exemptionRatio)
            taxBreakdown.sgst *= (1 - exemptionRatio)
            taxBreakdown.igst *= (1 - exemptionRatio)
            taxBreakdown.cess *= (1 - exemptionRatio)
          }
          break
        }
      }
    }

    // Round to 2 decimal places
    Object.keys(taxBreakdown).forEach(key => {
      taxBreakdown[key as keyof TaxBreakdown] = Math.round(taxBreakdown[key as keyof TaxBreakdown] * 100) / 100
    })

    return NextResponse.json({
      taxBreakdown,
      isInterState: isInterStateTransaction,
      effectiveRate: subtotal > 0 ? (taxBreakdown.total / subtotal) * 100 : 0,
      summary: {
        subtotal,
        taxAmount: taxBreakdown.total,
        totalAmount: subtotal + taxBreakdown.total
      }
    })

  } catch (error) {
    console.error('Error calculating tax:', error)
    return NextResponse.json(
      { error: 'Failed to calculate tax' },
      { status: 500 }
    )
  }
}