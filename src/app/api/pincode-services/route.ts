import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import GeolocationService from '@/lib/geolocation';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const pincode = searchParams.get('pincode');
    const restaurantId = searchParams.get('restaurantId');
    const locationId = searchParams.get('locationId');

    const geoService = GeolocationService.getInstance();

    switch (action) {
      case 'validate':
        // Validate PIN code format
        if (!pincode) {
          return NextResponse.json({ error: 'PIN code is required' }, { status: 400 });
        }

        const isValid = geoService.validatePINCode(pincode);
        return NextResponse.json({ 
          isValid, 
          pincode,
          message: isValid ? 'Valid PIN code format' : 'Invalid PIN code format' 
        });

      case 'lookup':
        // Get location details from PIN code
        if (!pincode) {
          return NextResponse.json({ error: 'PIN code is required' }, { status: 400 });
        }

        try {
          const location = await geoService.getLocationFromPINCode(pincode);
          return NextResponse.json({
            pincode,
            location,
            isValid: true
          });
        } catch (error) {
          return NextResponse.json({
            pincode,
            isValid: false,
            error: 'PIN code not found in database'
          }, { status: 404 });
        }

      case 'check-delivery':
        // Check if delivery is available for PIN code
        if (!pincode || !restaurantId) {
          return NextResponse.json({ error: 'PIN code and restaurant ID are required' }, { status: 400 });
        }

        // Get all locations for the restaurant
        const locations = await db.location.findMany({
          where: { restaurantId },
          include: {
            deliveryZones: {
              where: { isActive: true }
            }
          }
        });

        let deliveryAvailable = false;
        let deliveryOptions: any[] = [];

        for (const location of locations) {
          // Check if PIN code matches any delivery zone
          const deliveryZone = location.deliveryZones.find(zone => zone.pincode === pincode);
          
          if (deliveryZone && location.isDeliveryEnabled) {
            deliveryAvailable = true;
            deliveryOptions.push({
              locationId: location.id,
              locationName: location.name,
              deliveryFee: deliveryZone.deliveryFee,
              estimatedTime: deliveryZone.estimatedTime,
              minOrderAmount: deliveryZone.minOrderAmount,
              zoneName: deliveryZone.name
            });
          }
        }

        // Also check if PIN code matches the location's city
        if (!deliveryAvailable) {
          try {
            const pincodeLocation = await geoService.getLocationFromPINCode(pincode);
            
            for (const location of locations) {
              if (location.city.toLowerCase() === pincodeLocation.city.toLowerCase() && location.isDeliveryEnabled) {
                // Find the default delivery zone for this location
                const defaultZone = location.deliveryZones[0];
                if (defaultZone) {
                  deliveryAvailable = true;
                  deliveryOptions.push({
                    locationId: location.id,
                    locationName: location.name,
                    deliveryFee: defaultZone.deliveryFee,
                    estimatedTime: defaultZone.estimatedTime,
                    minOrderAmount: defaultZone.minOrderAmount,
                    zoneName: 'City-wide delivery',
                    isCityWide: true
                  });
                }
              }
            }
          } catch (error) {
            // PIN code not found, continue without city-wide delivery
          }
        }

        return NextResponse.json({
          pincode,
          deliveryAvailable,
          deliveryOptions: deliveryOptions.sort((a, b) => a.deliveryFee - b.deliveryFee),
          restaurantId
        });

      case 'nearby-pincodes':
        // Get nearby PIN codes (simplified implementation)
        if (!pincode || !locationId) {
          return NextResponse.json({ error: 'PIN code and location ID are required' }, { status: 400 });
        }

        // Get the location details
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

        // Get all delivery zones for the same city
        const nearbyZones = await db.deliveryZone.findMany({
          where: {
            city: location.city,
            isActive: true,
            pincode: { not: pincode }
          },
          include: {
            location: {
              select: {
                id: true,
                name: true
              }
            }
          }
        });

        const nearbyPincodes = nearbyZones.map(zone => ({
          pincode: zone.pincode,
          area: zone.area,
          deliveryFee: zone.deliveryFee,
          estimatedTime: zone.estimatedTime,
          location: zone.location
        }));

        return NextResponse.json({
          pincode,
          nearbyPincodes,
          city: location.city
        });

      case 'service-areas':
        // Get all service areas (PIN codes) for a restaurant
        if (!restaurantId) {
          return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 });
        }

        const serviceLocations = await db.location.findMany({
          where: { restaurantId },
          include: {
            deliveryZones: {
              where: { isActive: true },
              select: {
                pincode: true,
                area: true,
                city: true,
                state: true,
                deliveryFee: true,
                estimatedTime: true,
                minOrderAmount: true
              }
            }
          }
        });

        const serviceAreas = serviceLocations.flatMap(location => 
          location.deliveryZones.map(zone => ({
            pincode: zone.pincode,
            area: zone.area,
            city: zone.city,
            state: zone.state,
            deliveryFee: zone.deliveryFee,
            estimatedTime: zone.estimatedTime,
            minOrderAmount: zone.minOrderAmount,
            locationName: location.name
          }))
        );

        // Group by PIN code (in case multiple locations serve the same PIN code)
        const uniquePincodes = serviceAreas.reduce((acc, area) => {
          if (!acc[area.pincode]) {
            acc[area.pincode] = area;
          } else {
            // Keep the one with lower delivery fee
            if (area.deliveryFee < acc[area.pincode].deliveryFee) {
              acc[area.pincode] = area;
            }
          }
          return acc;
        }, {} as Record<string, any>);

        return NextResponse.json({
          restaurantId,
          serviceAreas: Object.values(uniquePincodes),
          totalPincodes: Object.keys(uniquePincodes).length
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('PIN code services API error:', error);
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
    const { action, ...params } = body;

    switch (action) {
      case 'bulk-check-delivery':
        // Check delivery availability for multiple PIN codes
        const { pincodes, restaurantId } = params;

        if (!pincodes || !Array.isArray(pincodes) || !restaurantId) {
          return NextResponse.json({ error: 'PIN codes array and restaurant ID are required' }, { status: 400 });
        }

        const results = await Promise.all(
          pincodes.map(async (pincode: string) => {
            try {
              const response = await fetch(`/api/pincode-services?action=check-delivery&pincode=${pincode}&restaurantId=${restaurantId}`);
              const data = await response.json();
              return { pincode, ...data };
            } catch (error) {
              return { pincode, deliveryAvailable: false, error: 'Failed to check' };
            }
          })
        );

        return NextResponse.json({
          restaurantId,
          results,
          totalChecked: pincodes.length,
          availablePincodes: results.filter(r => r.deliveryAvailable).length
        });

      case 'add-service-area':
        // Add a new service area (PIN code) for a location
        const { locationId, pincode, area, deliveryFee, estimatedTime, minOrderAmount } = params;

        if (!locationId || !pincode || !deliveryFee || !estimatedTime) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate PIN code format
        const geoService = GeolocationService.getInstance();
        if (!geoService.validatePINCode(pincode)) {
          return NextResponse.json({ error: 'Invalid PIN code format' }, { status: 400 });
        }

        // Get location details
        const location = await db.location.findUnique({
          where: { id: locationId }
        });

        if (!location) {
          return NextResponse.json({ error: 'Location not found' }, { status: 404 });
        }

        // Check if delivery zone already exists
        const existingZone = await db.deliveryZone.findFirst({
          where: {
            locationId,
            pincode
          }
        });

        if (existingZone) {
          return NextResponse.json({ error: 'Service area already exists for this PIN code' }, { status: 400 });
        }

        // Get location details from PIN code
        let pincodeLocation = { city: location.city, state: location.state };
        try {
          pincodeLocation = await geoService.getLocationFromPINCode(pincode);
        } catch (error) {
          // Use location's city/state as fallback
        }

        // Create delivery zone
        const deliveryZone = await db.deliveryZone.create({
          data: {
            locationId,
            name: area || `${pincode} Area`,
            pincode,
            area: area || pincode,
            city: pincodeLocation.city,
            state: pincodeLocation.state,
            deliveryFee,
            estimatedTime,
            minOrderAmount: minOrderAmount || null
          }
        });

        return NextResponse.json({
          message: 'Service area added successfully',
          deliveryZone
        }, { status: 201 });

      case 'remove-service-area':
        // Remove a service area
        const { zoneId } = params;

        if (!zoneId) {
          return NextResponse.json({ error: 'Zone ID is required' }, { status: 400 });
        }

        await db.deliveryZone.delete({
          where: { id: zoneId }
        });

        return NextResponse.json({ message: 'Service area removed successfully' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('PIN code services POST API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}