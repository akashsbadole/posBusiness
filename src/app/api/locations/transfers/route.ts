import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const fromLocationId = searchParams.get('fromLocationId');
    const toLocationId = searchParams.get('toLocationId');

    const offset = (page - 1) * limit;

    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (fromLocationId) whereClause.fromLocationId = fromLocationId;
    if (toLocationId) whereClause.toLocationId = toLocationId;

    const transfers = await db.inventoryTransfer.findMany({
      where: whereClause,
      include: {
        fromLocation: true,
        toLocation: true,
        item: true,
        requestedBy: true,
        approvedBy: true
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    });

    const total = await db.inventoryTransfer.count({ where: whereClause });

    return NextResponse.json({
      transfers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching inventory transfers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      fromLocationId,
      toLocationId,
      itemId,
      quantity,
      notes
    } = body;

    // Validate required fields
    if (!fromLocationId || !toLocationId || !itemId || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if from and to locations are different
    if (fromLocationId === toLocationId) {
      return NextResponse.json({ error: 'Source and destination locations must be different' }, { status: 400 });
    }

    // Get item details from source location
    const sourceItem = await db.menuItem.findFirst({
      where: {
        id: itemId,
        locationId: fromLocationId
      }
    });

    if (!sourceItem) {
      return NextResponse.json({ error: 'Item not found in source location' }, { status: 404 });
    }

    // Check if sufficient quantity is available
    if (sourceItem.stock < quantity) {
      return NextResponse.json({ 
        error: 'Insufficient quantity available',
        available: sourceItem.stock,
        requested: quantity
      }, { status: 400 });
    }

    // Create inventory transfer request
    const transfer = await db.inventoryTransfer.create({
      data: {
        fromLocationId,
        toLocationId,
        itemId,
        quantity,
        status: 'pending',
        requestedById: session.user?.id,
        notes
      },
      include: {
        fromLocation: true,
        toLocation: true,
        item: true,
        requestedBy: true
      }
    });

    // Create notification for managers
    await db.notification.create({
      data: {
        title: 'New Inventory Transfer Request',
        message: `Transfer request for ${quantity} units of ${sourceItem.name} from ${transfer.fromLocation.name} to ${transfer.toLocation.name}`,
        type: 'inventory_transfer',
        data: {
          transferId: transfer.id,
          fromLocationId,
          toLocationId,
          itemId,
          quantity
        }
      }
    });

    return NextResponse.json(transfer, { status: 201 });
  } catch (error) {
    console.error('Error creating inventory transfer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const transferId = searchParams.get('id');
    const body = await request.json();
    const { status, approvedNotes } = body;

    if (!transferId) {
      return NextResponse.json({ error: 'Transfer ID is required' }, { status: 400 });
    }

    // Get transfer details
    const transfer = await db.inventoryTransfer.findUnique({
      where: { id: transferId },
      include: {
        fromLocation: true,
        toLocation: true,
        item: true
      }
    });

    if (!transfer) {
      return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });
    }

    // Validate status transition
    const validTransitions = {
      'pending': ['approved', 'cancelled'],
      'approved': ['in_transit', 'cancelled'],
      'in_transit': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': []
    };

    if (!validTransitions[transfer.status].includes(status)) {
      return NextResponse.json({ 
        error: `Cannot change status from ${transfer.status} to ${status}` 
      }, { status: 400 });
    }

    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    // Add approval details if approving
    if (status === 'approved') {
      updateData.approvedById = session.user?.id;
      updateData.approvedAt = new Date();
      updateData.approvedNotes = approvedNotes;
    }

    // Add completion details if completing
    if (status === 'completed') {
      updateData.completedAt = new Date();
      updateData.completedById = session.user?.id;
    }

    // Update transfer
    const updatedTransfer = await db.inventoryTransfer.update({
      where: { id: transferId },
      data: updateData,
      include: {
        fromLocation: true,
        toLocation: true,
        item: true,
        requestedBy: true,
        approvedBy: true
      }
    });

    // If approved, update inventory
    if (status === 'approved') {
      // Deduct from source location
      await db.menuItem.update({
        where: { 
          id: transfer.itemId,
          locationId: transfer.fromLocationId 
        },
        data: {
          stock: {
            decrement: transfer.quantity
          }
        }
      });

      // Add to destination location
      const destinationItem = await db.menuItem.findFirst({
        where: {
          name: transfer.item.name,
          locationId: transfer.toLocationId
        }
      });

      if (destinationItem) {
        await db.menuItem.update({
          where: { id: destinationItem.id },
          data: {
            stock: {
              increment: transfer.quantity
            }
          }
        });
      } else {
        // Create new item in destination if it doesn't exist
        await db.menuItem.create({
          data: {
            name: transfer.item.name,
            locationId: transfer.toLocationId,
            stock: transfer.quantity,
            price: transfer.item.price,
            cost: transfer.item.cost,
            category: transfer.item.category,
            isActive: true
          }
        });
      }

      // Create inventory transaction records
      await db.inventoryTransaction.create({
        data: {
          itemId: transfer.itemId,
          locationId: transfer.fromLocationId,
          quantity: -transfer.quantity,
          type: 'transfer_out',
          referenceId: transfer.id,
          notes: `Transfer to ${transfer.toLocation.name}`
        }
      });

      await db.inventoryTransaction.create({
        data: {
          itemId: transfer.itemId,
          locationId: transfer.toLocationId,
          quantity: transfer.quantity,
          type: 'transfer_in',
          referenceId: transfer.id,
          notes: `Transfer from ${transfer.fromLocation.name}`
        }
      });
    }

    // Create notification
    await db.notification.create({
      data: {
        title: `Inventory Transfer ${status}`,
        message: `Transfer of ${transfer.quantity} units of ${transfer.item.name} has been ${status}`,
        type: 'inventory_transfer_update',
        data: {
          transferId: transfer.id,
          status,
          fromLocationId: transfer.fromLocationId,
          toLocationId: transfer.toLocationId
        }
      }
    });

    return NextResponse.json(updatedTransfer);
  } catch (error) {
    console.error('Error updating inventory transfer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}