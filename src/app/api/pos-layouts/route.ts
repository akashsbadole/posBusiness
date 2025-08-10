import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to manage POS layouts
    if (user.roleLevel !== 'SUPER_ADMIN' && user.roleLevel !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { name, businessType, fields, isDefault } = body

    // Validate required fields
    if (!name || !businessType || !fields) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Here you would save to your database
    // For now, we'll just return success
    // In a real implementation, you would save to your POS layouts table

    console.log('Saving POS layout:', {
      name,
      businessType,
      fields: fields.length,
      isDefault,
      savedBy: user.id,
      savedAt: new Date().toISOString()
    })

    return NextResponse.json({ 
      success: true, 
      message: 'POS layout saved successfully',
      layout: {
        id: `layout_${Date.now()}`,
        name,
        businessType,
        fields,
        isDefault,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error saving POS layout:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const businessType = searchParams.get('businessType')

    // Here you would fetch from your database
    // For now, we'll return mock data
    const mockLayouts = [
      {
        id: 'default_restaurant',
        name: 'Restaurant Layout',
        businessType: 'restaurant',
        isDefault: true,
        fields: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'default_retail',
        name: 'Retail Layout',
        businessType: 'retail',
        isDefault: true,
        fields: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    const layouts = businessType 
      ? mockLayouts.filter(layout => layout.businessType === businessType)
      : mockLayouts

    return NextResponse.json({ layouts })

  } catch (error) {
    console.error('Error fetching POS layouts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}