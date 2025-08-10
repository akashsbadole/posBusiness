import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, template, isDefault, customizations } = body
    const templateId = params.id

    // Get the template to verify it exists
    const existingTemplate = await db.invoiceTemplate.findUnique({
      where: { id: templateId }
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await db.invoiceTemplate.updateMany({
        where: { 
          restaurantId: existingTemplate.restaurantId,
          id: { not: templateId }
        },
        data: { isDefault: false }
      })
    }

    // Update template
    const updatedTemplate = await db.invoiceTemplate.update({
      where: { id: templateId },
      data: {
        ...(name && { name }),
        ...(template && { template }),
        ...(isDefault !== undefined && { isDefault }),
        ...(customizations && { customizations })
      }
    })

    return NextResponse.json(updatedTemplate)
  } catch (error) {
    console.error('Error updating invoice template:', error)
    return NextResponse.json(
      { error: 'Failed to update invoice template' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id

    // Get the template to verify it exists
    const existingTemplate = await db.invoiceTemplate.findUnique({
      where: { id: templateId }
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Don't allow deletion of default template if it's the only one
    if (existingTemplate.isDefault) {
      const templateCount = await db.invoiceTemplate.count({
        where: { restaurantId: existingTemplate.restaurantId }
      })

      if (templateCount === 1) {
        return NextResponse.json(
          { error: 'Cannot delete the only template' },
          { status: 400 }
        )
      }
    }

    // Delete template
    await db.invoiceTemplate.delete({
      where: { id: templateId }
    })

    // If this was the default, set another template as default
    if (existingTemplate.isDefault) {
      const remainingTemplate = await db.invoiceTemplate.findFirst({
        where: { restaurantId: existingTemplate.restaurantId }
      })

      if (remainingTemplate) {
        await db.invoiceTemplate.update({
          where: { id: remainingTemplate.id },
          data: { isDefault: true }
        })
      }
    }

    return NextResponse.json({ message: 'Template deleted successfully' })
  } catch (error) {
    console.error('Error deleting invoice template:', error)
    return NextResponse.json(
      { error: 'Failed to delete invoice template' },
      { status: 500 }
    )
  }
}