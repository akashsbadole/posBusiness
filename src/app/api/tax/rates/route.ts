import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    // Get business settings for tax rates
    const businessSettings = await db.businessSettings.findUnique({
      where: { restaurantId }
    })

    const taxConfig = businessSettings?.taxSettings || {}

    // Return comprehensive tax rates configuration
    return NextResponse.json({
      standardRates: {
        cgstRate: taxConfig.cgstRate || 2.5,
        sgstRate: taxConfig.sgstRate || 2.5,
        igstRate: taxConfig.igstRate || 5,
        cessRate: taxConfig.cessRate || 0,
        standardRate: taxConfig.standardRate || 5
      },
      categoryRates: taxConfig.categoryRates || {},
      hsnRates: taxConfig.hsnRates || {},
      exemptions: taxConfig.exemptions || [],
      enableCess: taxConfig.enableCess || false,
      taxSlabs: taxConfig.taxSlabs || [
        { minAmount: 0, maxAmount: 1000, rate: 0 },
        { minAmount: 1000, maxAmount: 5000, rate: 5 },
        { minAmount: 5000, maxAmount: null, rate: 12 }
      ]
    })
  } catch (error) {
    console.error('Error fetching tax rates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tax rates' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurantId, rates } = body

    if (!restaurantId || !rates) {
      return NextResponse.json(
        { error: 'Restaurant ID and rates are required' },
        { status: 400 }
      )
    }

    // Validate rates
    if (rates.cgstRate < 0 || rates.cgstRate > 50) {
      return NextResponse.json(
        { error: 'CGST rate must be between 0 and 50%' },
        { status: 400 }
      )
    }

    if (rates.sgstRate < 0 || rates.sgstRate > 50) {
      return NextResponse.json(
        { error: 'SGST rate must be between 0 and 50%' },
        { status: 400 }
      )
    }

    if (rates.igstRate < 0 || rates.igstRate > 50) {
      return NextResponse.json(
        { error: 'IGST rate must be between 0 and 50%' },
        { status: 400 }
      )
    }

    if (rates.cessRate < 0 || rates.cessRate > 50) {
      return NextResponse.json(
        { error: 'CESS rate must be between 0 and 50%' },
        { status: 400 }
      )
    }

    // Get current business settings
    const businessSettings = await db.businessSettings.findUnique({
      where: { restaurantId }
    })

    const currentTaxConfig = businessSettings?.taxSettings || {}

    // Update tax rates
    const updatedTaxConfig = {
      ...currentTaxConfig,
      cgstRate: rates.cgstRate,
      sgstRate: rates.sgstRate,
      igstRate: rates.igstRate,
      cessRate: rates.cessRate,
      standardRate: rates.standardRate || (rates.cgstRate + rates.sgstRate),
      enableCess: rates.enableCess !== false,
      categoryRates: rates.categoryRates || {},
      hsnRates: rates.hsnRates || {},
      exemptions: rates.exemptions || [],
      taxSlabs: rates.taxSlabs || []
    }

    // Update business settings
    const updatedSettings = await db.businessSettings.upsert({
      where: { restaurantId },
      update: { taxSettings: updatedTaxConfig },
      create: {
        restaurantId,
        taxSettings: updatedTaxConfig
      }
    })

    return NextResponse.json({
      success: true,
      taxConfig: updatedTaxConfig,
      message: 'Tax rates updated successfully'
    })

  } catch (error) {
    console.error('Error updating tax rates:', error)
    return NextResponse.json(
      { error: 'Failed to update tax rates' },
      { status: 500 }
    )
  }
}