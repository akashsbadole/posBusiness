import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface BarcodeItem {
  barcode: string
  name: string
  price: number
  quantity: number
  category?: string
  hsnCode?: string
  gstRate?: number
}

// Mock product database - in a real implementation, this would be in your database
const mockProducts: { [key: string]: BarcodeItem } = {
  '8901058334258': {
    barcode: '8901058334258',
    name: 'Basmati Rice Premium',
    price: 299.99,
    quantity: 1,
    category: 'Groceries',
    hsnCode: '10063010',
    gstRate: 5
  },
  '8906001234567': {
    barcode: '8906001234567',
    name: 'Toor Dal (Split Pigeon Peas)',
    price: 189.50,
    quantity: 1,
    category: 'Groceries',
    hsnCode: '07132090',
    gstRate: 5
  },
  '8901234567890': {
    barcode: '8901234567890',
    name: 'Refined Sunflower Oil',
    price: 145.00,
    quantity: 1,
    category: 'Groceries',
    hsnCode: '15151990',
    gstRate: 5
  },
  '8909876543210': {
    barcode: '8909876543210',
    name: 'Fresh Milk 1L',
    price: 56.00,
    quantity: 1,
    category: 'Dairy',
    hsnCode: '04012090',
    gstRate: 0
  },
  '8905555555555': {
    barcode: '8905555555555',
    name: 'Wheat Flour Atta',
    price: 89.99,
    quantity: 1,
    category: 'Groceries',
    hsnCode: '11010000',
    gstRate: 5
  },
  '8901111111111': {
    barcode: '8901111111111',
    name: 'Masoor Dal (Red Lentils)',
    price: 156.75,
    quantity: 1,
    category: 'Groceries',
    hsnCode: '07132090',
    gstRate: 5
  },
  '8902222222222': {
    barcode: '8902222222222',
    name: 'Moong Dal (Split Green Gram)',
    price: 178.25,
    quantity: 1,
    category: 'Groceries',
    hsnCode: '07132090',
    gstRate: 5
  },
  '8903333333333': {
    barcode: '8903333333333',
    name: 'Urad Dal (Black Gram)',
    price: 195.50,
    quantity: 1,
    category: 'Groceries',
    hsnCode: '07132090',
    gstRate: 5
  },
  '8904444444444': {
    barcode: '8904444444444',
    name: 'Chana Dal (Split Chickpeas)',
    price: 134.00,
    quantity: 1,
    category: 'Groceries',
    hsnCode: '07132090',
    gstRate: 5
  },
  '8906666666666': {
    barcode: '8906666666666',
    name: 'Groundnut Oil',
    price: 167.80,
    quantity: 1,
    category: 'Groceries',
    hsnCode: '15079000',
    gstRate: 5
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { barcode: string } }
) {
  try {
    const { barcode } = params

    if (!barcode) {
      return NextResponse.json(
        { error: 'Barcode is required' },
        { status: 400 }
      )
    }

    // First, try to find the product in the mock database
    const mockProduct = mockProducts[barcode]
    if (mockProduct) {
      return NextResponse.json({
        success: true,
        product: mockProduct,
        source: 'mock'
      })
    }

    // If not found in mock database, try to find in actual database
    // This would typically search for products with matching barcode in your inventory
    try {
      const dbProduct = await db.menuItem.findFirst({
        where: {
          // Assuming you have a barcode field in your menu items
          // If not, you might need to add it or search by name/code
          OR: [
            { name: { contains: barcode } },
            { description: { contains: barcode } }
          ]
        },
        include: {
          category: true
        }
      })

      if (dbProduct) {
        const product: BarcodeItem = {
          barcode: barcode,
          name: dbProduct.name,
          price: dbProduct.price,
          quantity: 1,
          category: dbProduct.category?.name || 'Uncategorized',
          hsnCode: dbProduct.description?.match(/HSN:\s*(\d+)/)?.[1] || undefined,
          gstRate: 5 // Default GST rate, you might want to store this in the database
        }

        return NextResponse.json({
          success: true,
          product,
          source: 'database'
        })
      }
    } catch (dbError) {
      console.error('Database search error:', dbError)
      // Continue to return not found
    }

    // If not found anywhere
    return NextResponse.json(
      { 
        success: false,
        error: 'Product not found for this barcode',
        barcode 
      },
      { status: 404 }
    )
  } catch (error) {
    console.error('Error searching for product by barcode:', error)
    return NextResponse.json(
      { error: 'Failed to search for product' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { barcode, name, price, category, hsnCode, gstRate } = body

    if (!barcode || !name || price === undefined) {
      return NextResponse.json(
        { error: 'Barcode, name, and price are required' },
        { status: 400 }
      )
    }

    // Check if product already exists
    const existingProduct = mockProducts[barcode]
    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this barcode already exists' },
        { status: 400 }
      )
    }

    // In a real implementation, you would save this to your database
    // For now, we'll just return success
    
    const newProduct: BarcodeItem = {
      barcode,
      name,
      price,
      quantity: 1,
      category,
      hsnCode,
      gstRate: gstRate || 5
    }

    return NextResponse.json({
      success: true,
      product: newProduct,
      message: 'Product created successfully'
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}