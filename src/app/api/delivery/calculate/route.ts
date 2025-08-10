import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import GeolocationService from '@/lib/geolocation';

interface DeliveryCalculationRequest {
  locationId: string;
  customerPincode?: string;
  customerAddress?: {
    latitude?: number;
    longitude?: number;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  orderAmount: number;
  orderType: 'delivery' | 'pickup';
}

interface DeliveryCalculationResponse {
  isDeliverable: boolean;
  deliveryFee: number;
  estimatedTime: number;
  distance?: number;
  deliveryZone?: any;
  message?: string;
  availableOptions: Array<{
    type: 'delivery' | 'pickup';
    fee: number;
    estimatedTime: number;
    description: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: DeliveryCalculationRequest = await request.json();
    const { locationId, customerPincode, customerAddress, orderAmount, orderType } = body;

    if (!locationId || orderAmount === undefined) {
      return NextResponse.json({ error: 'Location ID and order amount are required' }, { status: 400 });
    }

    // Get location details
    const location = await db.location.findUnique({
      where: { id: locationId },
      include: {
        deliveryZones: {
          where: { isActive: true }
        }
      }
    });

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    const geoService = GeolocationService.getInstance();
    const response: DeliveryCalculationResponse = {
      isDeliverable: false,
      deliveryFee: 0,
      estimatedTime: 0,
      availableOptions: []
    };

    // Check if pickup is available
    if (location.isPickupEnabled) {
      response.availableOptions.push({
        type: 'pickup',
        fee: 0,
        estimatedTime: 15, // 15 minutes for pickup
        description: 'Pickup from restaurant'
      });
    }

    // Check delivery availability
    if (orderType === 'delivery' && location.isDeliveryEnabled) {
      let deliveryZone = null;
      let distance = null;

      // Method 1: Check by PIN code
      if (customerPincode) {
        deliveryZone = location.deliveryZones.find(zone => 
          zone.pincode === customerPincode
        );
      }

      // Method 2: Check by coordinates
      if (!deliveryZone && customerAddress?.latitude && customerAddress?.longitude) {
        distance = geoService.calculateDistance(
          customerAddress.latitude,
          customerAddress.longitude,
          location.latitude || 19.0760, // Default to Mumbai if not set
          location.longitude || 72.8777
        );

        // Check if within delivery radius
        if (distance <= (location.deliveryRadius || 10)) {
          // Find the best matching delivery zone based on distance
          deliveryZone = location.deliveryZones.reduce((best, zone) => {
            if (!best) return zone;
            
            // Simple heuristic: prefer zones with lower delivery fees
            return zone.deliveryFee < best.deliveryFee ? zone : best;
          }, null);
        }
      }

      // Method 3: Check by city/state
      if (!deliveryZone && customerAddress?.city) {
        const sameCity = customerAddress.city.toLowerCase() === location.city.toLowerCase();
        if (sameCity) {
          deliveryZone = location.deliveryZones.find(zone => 
            zone.city.toLowerCase() === location.city.toLowerCase()
          );
        }
      }

      if (deliveryZone) {
        // Check minimum order amount
        if (deliveryZone.minOrderAmount && orderAmount < deliveryZone.minOrderAmount) {
          response.message = `Minimum order amount of ₹${deliveryZone.minOrderAmount} required for delivery`;
        } else {
          response.isDeliverable = true;
          response.deliveryFee = deliveryZone.deliveryFee;
          response.estimatedTime = deliveryZone.estimatedTime;
          response.deliveryZone = deliveryZone;
          response.distance = distance;

          response.availableOptions.push({
            type: 'delivery',
            fee: deliveryZone.deliveryFee,
            estimatedTime: deliveryZone.estimatedTime,
            description: `Delivery to ${deliveryZone.area || deliveryZone.pincode}`
          });
        }
      } else if (distance !== null) {
        response.message = `Delivery not available. Distance: ${distance.toFixed(1)}km (Max: ${location.deliveryRadius || 10}km)`;
      } else {
        response.message = 'Delivery not available for your area';
      }
    }

    // Apply location-specific offers that might affect delivery
    try {
      const offersResponse = await fetch('/api/location-offers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId,
          orderAmount,
          customerData: customerAddress ? {
            city: customerAddress.city,
            state: customerAddress.state,
            pincode: customerAddress.pincode || customerPincode,
            latitude: customerAddress.latitude,
            longitude: customerAddress.longitude
          } : undefined
        })
      });

      if (offersResponse.ok) {
        const offersData = await offersResponse.json();
        
        // Check for free delivery offers
        const freeDeliveryOffer = offersData.applicableOffers?.find((offer: any) => 
          offer.type === 'FREE_DELIVERY'
        );

        if (freeDeliveryOffer) {
          // Update delivery option to show free delivery
          const deliveryOption = response.availableOptions.find(opt => opt.type === 'delivery');
          if (deliveryOption) {
            deliveryOption.fee = 0;
            deliveryOption.description += ' (FREE with offer)';
          }
        }
      }
    } catch (error) {
      console.error('Error checking delivery offers:', error);
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error calculating delivery:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}