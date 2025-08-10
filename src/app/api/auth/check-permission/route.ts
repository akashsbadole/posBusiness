import { NextRequest, NextResponse } from 'next/server'
import { hasPermission } from '@/lib/auth-enhanced'
import { Module, PermissionAction } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { permission } = body

    if (!permission || !permission.module || !permission.action) {
      return NextResponse.json({ error: 'Invalid permission check' }, { status: 400 })
    }

    const hasAccess = await hasPermission(request, {
      module: permission.module as Module,
      action: permission.action as PermissionAction,
      resource: permission.resource
    })

    return NextResponse.json({ hasPermission: hasAccess })
  } catch (error) {
    console.error('Error checking permission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}