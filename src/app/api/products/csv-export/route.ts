import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth, getRestaurantId } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Check authentication and get restaurant ID
    const session = await auth(request)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const restaurantId = await getRestaurantId(request)
    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const fields = searchParams.get('fields')?.split(',').filter(Boolean) || []
    const businessType = searchParams.get('businessType') || restaurantId

    // Validate fields
    const validFields = [
      'id', 'name', 'description', 'price', 'category', 'categoryId', 
      'isActive', 'isAvailable', 'createdAt', 'updatedAt'
    ]

    const selectedFields = fields.filter(field => validFields.includes(field))
    
    // Always include required fields
    const requiredFields = ['name', 'price']
    requiredFields.forEach(field => {
      if (!selectedFields.includes(field)) {
        selectedFields.push(field)
      }
    })

    if (selectedFields.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields selected for export' },
        { status: 400 }
      )
    }

    // Fetch menu items
    const menuItems = await db.menuItem.findMany({
      where: {
        restaurantId: businessType
      },
      orderBy: {
        name: 'asc'
      },
      include: {
        category: true
      }
    })

    if (menuItems.length === 0) {
      return NextResponse.json(
        { error: 'No menu items found to export' },
        { status: 404 }
      )
    }

    // Generate CSV content
    const headers = selectedFields.map(field => {
      switch (field) {
        case 'categoryId': return 'Category ID'
        case 'isAvailable': return 'Available'
        case 'createdAt': return 'Created Date'
        case 'updatedAt': return 'Updated Date'
        default: return field.charAt(0).toUpperCase() + field.slice(1)
      }
    })

    const csvRows = [headers.join(',')]

    menuItems.forEach(menuItem => {
      const row = selectedFields.map(field => {
        let value: any
        
        switch (field) {
          case 'id':
            value = menuItem.id
            break
          case 'name':
            value = menuItem.name
            break
          case 'description':
            value = menuItem.description
            break
          case 'price':
            value = menuItem.price
            break
          case 'category':
            value = menuItem.category?.name || ''
            break
          case 'categoryId':
            value = menuItem.categoryId
            break
          case 'isActive':
            value = menuItem.isActive
            break
          case 'isAvailable':
            value = menuItem.isAvailable
            break
          case 'createdAt':
            value = menuItem.createdAt.toISOString()
            break
          case 'updatedAt':
            value = menuItem.updatedAt.toISOString()
            break
          default:
            value = ''
        }

        // Escape commas and quotes, wrap in quotes if needed
        if (typeof value === 'string') {
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }
        
        return String(value)
      })
      
      csvRows.push(row.join(','))
    })

    const csvContent = csvRows.join('\n')
    
    // Create response with CSV file
    const fileName = `menu_items_export_${businessType}_${new Date().toISOString().split('T')[0]}.csv`
    
    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'X-Export-Count': menuItems.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

    return response

  } catch (error) {
    console.error('CSV export error:', error)
    return NextResponse.json(
      { error: 'Error exporting products' },
      { status: 500 }
    )
  }
}