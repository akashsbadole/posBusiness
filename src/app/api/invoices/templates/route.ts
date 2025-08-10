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

    // Get invoice templates for the restaurant
    const templates = await db.invoiceTemplate.findMany({
      where: { restaurantId },
      orderBy: { isDefault: 'desc' }
    })

    // Get business settings for logo and customizations
    const businessSettings = await db.businessSettings.findUnique({
      where: { restaurantId }
    })

    return NextResponse.json({
      templates,
      businessSettings: businessSettings?.invoiceSettings || {},
      defaultLogo: businessSettings?.logo || null
    })
  } catch (error) {
    console.error('Error fetching invoice templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoice templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      restaurantId,
      name,
      template,
      isDefault = false,
      customizations = {}
    } = body

    if (!restaurantId || !name || !template) {
      return NextResponse.json(
        { error: 'Restaurant ID, name, and template are required' },
        { status: 400 }
      )
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await db.invoiceTemplate.updateMany({
        where: { restaurantId },
        data: { isDefault: false }
      })
    }

    // Create new template
    const newTemplate = await db.invoiceTemplate.create({
      data: {
        restaurantId,
        name,
        template,
        isDefault,
        customizations
      }
    })

    return NextResponse.json(newTemplate)
  } catch (error) {
    console.error('Error creating invoice template:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice template' },
      { status: 500 }
    )
  }
}