import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('logo') as File
    const restaurantId = formData.get('restaurantId') as string

    if (!file || !restaurantId) {
      return NextResponse.json(
        { error: 'Logo file and restaurant ID are required' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'logos')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${restaurantId}_${timestamp}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Logo URL for public access
    const logoUrl = `/uploads/logos/${fileName}`

    // Update business settings with logo URL
    const businessSettings = await db.businessSettings.upsert({
      where: { restaurantId },
      update: { logo: logoUrl },
      create: {
        restaurantId,
        logo: logoUrl,
        invoiceSettings: {}
      }
    })

    return NextResponse.json({
      logoUrl,
      businessSettings
    })
  } catch (error) {
    console.error('Error uploading logo:', error)
    return NextResponse.json(
      { error: 'Failed to upload logo' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    // Get current business settings
    const businessSettings = await db.businessSettings.findUnique({
      where: { restaurantId }
    })

    if (!businessSettings || !businessSettings.logo) {
      return NextResponse.json(
        { error: 'No logo found for this restaurant' },
        { status: 404 }
      )
    }

    // Remove logo from database
    await db.businessSettings.update({
      where: { restaurantId },
      data: { logo: null }
    })

    // Note: In a production environment, you might want to delete the actual file
    // from the filesystem here. For now, we'll just remove the reference.

    return NextResponse.json({ message: 'Logo removed successfully' })
  } catch (error) {
    console.error('Error removing logo:', error)
    return NextResponse.json(
      { error: 'Failed to remove logo' },
      { status: 500 }
    )
  }
}