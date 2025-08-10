import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const outletId = searchParams.get('outletId')

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    const whereClause: any = {
      restaurantId
    }

    if (outletId) {
      whereClause.outletId = outletId
    }

    const tables = await db.table.findMany({
      where: whereClause,
      orderBy: {
        number: 'asc'
      }
    })

    return NextResponse.json(tables)
  } catch (error) {
    console.error('Error fetching tables:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tables' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { number, capacity, restaurantId, outletId } = body

    if (!number || !capacity || !restaurantId) {
      return NextResponse.json(
        { error: 'Table number, capacity, and restaurant ID are required' },
        { status: 400 }
      )
    }

    const table = await db.table.create({
      data: {
        number,
        capacity,
        restaurantId,
        outletId: outletId || null,
        status: 'AVAILABLE'
      }
    })

    return NextResponse.json(table, { status: 201 })
  } catch (error) {
    console.error('Error creating table:', error)
    return NextResponse.json(
      { error: 'Failed to create table' },
      { status: 500 }
    )
  }
}