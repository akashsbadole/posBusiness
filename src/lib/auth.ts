import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

export interface AuthSession {
  userId: string
  restaurantId: string
  email: string
  role?: string
}

export async function auth(request?: NextRequest): Promise<AuthSession | null> {
  try {
    // For client-side components, check localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        return null
      }

      try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
        
        // Verify token is not expired (24 hours)
        if (decoded.timestamp && Date.now() - decoded.timestamp > 24 * 60 * 60 * 1000) {
          localStorage.removeItem('auth_token')
          return null
        }

        return {
          userId: decoded.userId,
          restaurantId: decoded.restaurantId,
          email: decoded.email,
          role: decoded.role
        }
      } catch (error) {
        console.error('Error decoding auth token:', error)
        localStorage.removeItem('auth_token')
        return null
      }
    }

    // For server-side API routes, check Authorization header
    if (request) {
      const authHeader = request.headers.get('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null
      }

      const token = authHeader.substring(7)
      try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
        
        // Verify token is not expired (24 hours)
        if (decoded.timestamp && Date.now() - decoded.timestamp > 24 * 60 * 60 * 1000) {
          return null
        }

        // Verify user exists in database
        const user = await db.user.findUnique({
          where: { id: decoded.userId },
          include: {
            restaurants: {
              where: { id: decoded.restaurantId }
            }
          }
        })

        if (!user || user.restaurants.length === 0) {
          return null
        }

        return {
          userId: decoded.userId,
          restaurantId: decoded.restaurantId,
          email: decoded.email,
          role: decoded.role
        }
      } catch (error) {
        console.error('Error decoding auth token:', error)
        return null
      }
    }

    return null
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

// Helper function to get restaurant ID from session
export async function getRestaurantId(request?: NextRequest): Promise<string | null> {
  const session = await auth(request)
  return session?.restaurantId || null
}

// Helper function to verify user has permission for a restaurant
export async function verifyRestaurantAccess(restaurantId: string, request?: NextRequest): Promise<boolean> {
  const session = await auth(request)
  if (!session) {
    return false
  }

  // Allow access if user owns the restaurant or has staff access
  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      restaurants: {
        where: { id: restaurantId }
      },
      staff: {
        where: { 
          restaurantId: restaurantId,
          isActive: true
        }
      }
    }
  })

  return user && (user.restaurants.length > 0 || user.staff.length > 0)
}