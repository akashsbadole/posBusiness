import { db } from '@/lib/db'
import { AuditAction, SecurityLevel } from '@prisma/client'

interface AuditLogData {
  action: AuditAction
  entityType: string
  entityId: string
  changes?: string
  oldValues?: string
  newValues?: string
  userId?: string
  staffId?: string
  restaurantId: string
  orderId?: string
  paymentId?: string
  ipAddress?: string
  userAgent?: string
  securityLevel?: SecurityLevel
}

export class AuditService {
  static async log(data: AuditLogData) {
    try {
      await db.auditLog.create({
        data: {
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          changes: data.changes,
          oldValues: data.oldValues,
          newValues: data.newValues,
          userId: data.userId,
          staffId: data.staffId,
          restaurantId: data.restaurantId,
          orderId: data.orderId,
          paymentId: data.paymentId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          securityLevel: data.securityLevel || SecurityLevel.MEDIUM
        }
      })
    } catch (error) {
      console.error('Failed to create audit log:', error)
      // Don't throw the error to avoid breaking the main operation
    }
  }

  static async getAuditLogs(restaurantId: string, filters?: {
    action?: AuditAction
    entityType?: string
    userId?: string
    staffId?: string
    startDate?: Date
    endDate?: Date
    limit?: number
    offset?: number
  }) {
    try {
      const where: any = {
        restaurantId
      }

      if (filters) {
        if (filters.action) where.action = filters.action
        if (filters.entityType) where.entityType = filters.entityType
        if (filters.userId) where.userId = filters.userId
        if (filters.staffId) where.staffId = filters.staffId
        if (filters.startDate || filters.endDate) {
          where.createdAt = {}
          if (filters.startDate) where.createdAt.gte = filters.startDate
          if (filters.endDate) where.createdAt.lte = filters.endDate
        }
      }

      const limit = filters?.limit || 50
      const offset = filters?.offset || 0

      const [logs, total] = await Promise.all([
        db.auditLog.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            },
            staff: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            },
            order: {
              select: {
                id: true,
                orderNumber: true
              }
            },
            payment: {
              select: {
                id: true,
                amount: true,
                method: true,
                status: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: limit,
          skip: offset
        }),
        db.auditLog.count({ where })
      ])

      return {
        logs,
        total,
        limit,
        offset
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
      throw error
    }
  }

  static async getSecurityAlerts(restaurantId: string, days: number = 7) {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const alerts = await db.auditLog.findMany({
        where: {
          restaurantId,
          createdAt: {
            gte: startDate
          },
          securityLevel: {
            in: ['HIGH', 'CRITICAL']
          }
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          staff: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return alerts
    } catch (error) {
      console.error('Failed to fetch security alerts:', error)
      throw error
    }
  }

  static async getUserActivity(restaurantId: string, userId: string, days: number = 30) {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const activities = await db.auditLog.findMany({
        where: {
          restaurantId,
          userId,
          createdAt: {
            gte: startDate
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 100
      })

      return activities
    } catch (error) {
      console.error('Failed to fetch user activity:', error)
      throw error
    }
  }

  static async getStaffActivity(restaurantId: string, staffId: string, days: number = 30) {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const activities = await db.auditLog.findMany({
        where: {
          restaurantId,
          staffId,
          createdAt: {
            gte: startDate
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 100
      })

      return activities
    } catch (error) {
      console.error('Failed to fetch staff activity:', error)
      throw error
    }
  }
}