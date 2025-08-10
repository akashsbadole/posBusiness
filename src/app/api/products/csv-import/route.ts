import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth, getRestaurantId } from '@/lib/auth'

interface CSVRow {
  name: string
  description?: string
  price: string
  category?: string
  sku?: string
  stock_quantity?: string
  barcode?: string
}

export async function POST(request: NextRequest) {
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

    const formData = await request.formData()
    const file = formData.get('file') as File
    const businessType = formData.get('businessType') as string || restaurantId

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Check file type
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'File must be a CSV' },
        { status: 400 }
      )
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    const csvText = await file.text()
    const lines = csvText.split('\n').filter(line => line.trim())

    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV must have at least a header and one data row' },
        { status: 400 }
      )
    }

    // Parse CSV
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase())
    const rows: CSVRow[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      const row: CSVRow = {
        name: '',
        price: '0'
      }

      headers.forEach((header, index) => {
        const value = values[index] || ''
        
        switch (header) {
          case 'name':
            row.name = value
            break
          case 'description':
            row.description = value
            break
          case 'price':
            row.price = value
            break
          case 'category':
            row.category = value
            break
          case 'sku':
            row.sku = value
            break
          case 'stock_quantity':
          case 'stock quantity':
            row.stock_quantity = value
            break
          case 'barcode':
            row.barcode = value
            break
        }
      })

      if (row.name) {
        rows.push(row)
      }
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'No valid product data found in CSV' },
        { status: 400 }
      )
    }

    // Import products
    const results = {
      success: true,
      message: '',
      importedCount: 0,
      errors: [] as string[],
      warnings: [] as string[]
    }

    for (const row of rows) {
      try {
        // Validate required fields
        if (!row.name.trim()) {
          results.errors.push(`Row ${rows.indexOf(row) + 2}: Product name is required`)
          continue
        }

        // Parse price
        const price = parseFloat(row.price)
        if (isNaN(price) || price < 0) {
          results.errors.push(`Row ${rows.indexOf(row) + 2}: Invalid price '${row.price}'`)
          continue
        }

        // Parse stock quantity
        let stockQuantity = 0
        if (row.stock_quantity) {
          const parsed = parseInt(row.stock_quantity)
          if (!isNaN(parsed) && parsed >= 0) {
            stockQuantity = parsed
          } else {
            results.warnings.push(`Row ${rows.indexOf(row) + 2}: Invalid stock quantity '${row.stock_quantity}', using 0`)
          }
        }

        // Check for duplicate product name
        const existingMenuItem = await db.menuItem.findFirst({
          where: {
            name: row.name.trim(),
            restaurantId: restaurantId
          }
        })

        if (existingMenuItem) {
          results.warnings.push(`Row ${rows.indexOf(row) + 2}: Menu item with name '${row.name}' already exists, skipping`)
          continue
        }

        // Find or create category
        let category = await db.category.findFirst({
          where: {
            name: row.category?.trim() || 'General',
            restaurantId: restaurantId
          }
        })

        if (!category) {
          category = await db.category.create({
            data: {
              name: row.category?.trim() || 'General',
              restaurantId: restaurantId,
              displayOrder: 0,
              isActive: true
            }
          })
        }

        // Create menu item
        await db.menuItem.create({
          data: {
            name: row.name.trim(),
            description: row.description?.trim() || '',
            price: price,
            restaurantId: restaurantId,
            categoryId: category.id,
            isActive: true,
            isAvailable: true
          }
        })

        results.importedCount++

      } catch (error) {
        console.error('Error importing row:', error)
        results.errors.push(`Row ${rows.indexOf(row) + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Generate result message
    if (results.importedCount > 0) {
      results.message = `Successfully imported ${results.importedCount} product${results.importedCount !== 1 ? 's' : ''}`
      
      if (results.warnings.length > 0) {
        results.message += ` with ${results.warnings.length} warning${results.warnings.length !== 1 ? 's' : ''}`
      }
      
      if (results.errors.length > 0) {
        results.message += ` and ${results.errors.length} error${results.errors.length !== 1 ? 's' : ''}`
      }
    } else {
      results.success = false
      results.message = 'No products were imported'
      
      if (results.errors.length > 0) {
        results.message += ` due to ${results.errors.length} error${results.errors.length !== 1 ? 's' : ''}`
      }
    }

    return NextResponse.json(results)

  } catch (error) {
    console.error('CSV import error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error processing CSV file',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      },
      { status: 500 }
    )
  }
}