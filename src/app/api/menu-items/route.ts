import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withPermission } from '@/lib/permission-middleware'
import { Module, PermissionAction } from '@prisma/client'

async function getMenuItemsHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const categoryId = searchParams.get('categoryId')

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    const whereClause: any = {
      restaurantId,
      isActive: true
    }

    if (categoryId) {
      whereClause.categoryId = categoryId
    }

    const menuItems = await db.menuItem.findMany({
      where: whereClause,
      orderBy: {
        name: 'asc'
      },
      include: {
        category: true
      }
    })

    return NextResponse.json(menuItems)
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    )
  }
}

async function createMenuItemHandler(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, price, categoryId, restaurantId, imageUrl } = body

    if (!name || !price || !categoryId || !restaurantId) {
      return NextResponse.json(
        { error: 'Name, price, category ID, and restaurant ID are required' },
        { status: 400 }
      )
    }

    const menuItem = await db.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId,
        restaurantId,
        imageUrl
      }
    })

    return NextResponse.json(menuItem, { status: 201 })
  } catch (error) {
    console.error('Error creating menu item:', error)
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    )
  }
}

export const GET = withPermission(getMenuItemsHandler, { permission: { module: Module.MENU, action: PermissionAction.READ } })
export const POST = withPermission(createMenuItemHandler, { permission: { module: Module.MENU, action: PermissionAction.CREATE } })