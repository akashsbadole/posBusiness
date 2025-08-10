import { NextRequest, NextResponse } from 'next/server'
import { hasRoleLevel } from '@/lib/auth-enhanced'
import { RoleLevel } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { minimumLevel } = body

    if (!minimumLevel) {
      return NextResponse.json({ error: 'Minimum role level required' }, { status: 400 })
    }

    const hasAccess = await hasRoleLevel(request, minimumLevel as RoleLevel)

    return NextResponse.json({ hasRoleLevel: hasAccess })
  } catch (error) {
    console.error('Error checking role level:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}