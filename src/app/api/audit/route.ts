import { NextRequest, NextResponse } from 'next/server'
import { AuditService } from '@/lib/audit'
import { AuditAction } from '@prisma/client'

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

    const filters: any = {}
    
    // Parse filters
    const action = searchParams.get('action') as AuditAction
    const entityType = searchParams.get('entityType')
    const userId = searchParams.get('userId')
    const staffId = searchParams.get('staffId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (action) filters.action = action
    if (entityType) filters.entityType = entityType
    if (userId) filters.userId = userId
    if (staffId) filters.staffId = staffId
    if (startDate) filters.startDate = new Date(startDate)
    if (endDate) filters.endDate = new Date(endDate)
    if (limit) filters.limit = limit
    if (offset) filters.offset = offset

    const result = await AuditService.getAuditLogs(restaurantId, filters)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      action,
      entityType,
      entityId,
      changes,
      oldValues,
      newValues,
      userId,
      staffId,
      restaurantId,
      orderId,
      paymentId,
      ipAddress,
      userAgent,
      securityLevel
    } = body

    if (!action || !entityType || !entityId || !restaurantId) {
      return NextResponse.json(
        { error: 'Action, entity type, entity ID, and restaurant ID are required' },
        { status: 400 }
      )
    }

    // Get client IP and user agent from request
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.ip || 
                     'unknown'
    const clientUserAgent = request.headers.get('user-agent') || 'unknown'

    await AuditService.log({
      action,
      entityType,
      entityId,
      changes,
      oldValues,
      newValues,
      userId,
      staffId,
      restaurantId,
      orderId,
      paymentId,
      ipAddress: ipAddress || clientIP,
      userAgent: userAgent || clientUserAgent,
      securityLevel
    })

    return NextResponse.json({
      message: 'Audit log created successfully'
    })
  } catch (error) {
    console.error('Error creating audit log:', error)
    return NextResponse.json(
      { error: 'Failed to create audit log' },
      { status: 500 }
    )
  }
}