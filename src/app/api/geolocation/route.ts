import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import GeolocationService, { type LocationData } from '@/lib/geolocation';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const geoService = GeolocationService.getInstance();

    switch (action) {
      case 'current':
        // Get current user location
        const userLocation = await geoService.getUserLocation();
        return NextResponse.json(userLocation);

      case 'ip':
        // Get IP-based location
        const ipLocation = await geoService.getIPLocation();
        return NextResponse.json(ipLocation);

      case 'reverse':
        // Reverse geocode coordinates
        const lat = searchParams.get('lat');
        const lon = searchParams.get('lon');
        
        if (!lat || !lon) {
          return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
        }

        const reverseLocation = await geoService.reverseGeocode(
          parseFloat(lat),
          parseFloat(lon)
        );
        return NextResponse.json(reverseLocation);

      case 'pincode':
        // Get location from PIN code
        const pincode = searchParams.get('pincode');
        if (!pincode) {
          return NextResponse.json({ error: 'PIN code is required' }, { status: 400 });
        }

        const pincodeLocation = await geoService.getLocationFromPINCode(pincode);
        return NextResponse.json(pincodeLocation);

      case 'validate-pincode':
        // Validate PIN code
        const codeToValidate = searchParams.get('pincode');
        if (!codeToValidate) {
          return NextResponse.json({ error: 'PIN code is required' }, { status: 400 });
        }

        const isValid = geoService.validatePINCode(codeToValidate);
        return NextResponse.json({ isValid });

      case 'distance':
        // Calculate distance between two points
        const lat1 = searchParams.get('lat1');
        const lon1 = searchParams.get('lon1');
        const lat2 = searchParams.get('lat2');
        const lon2 = searchParams.get('lon2');

        if (!lat1 || !lon1 || !lat2 || !lon2) {
          return NextResponse.json({ error: 'All coordinates are required' }, { status: 400 });
        }

        const distance = geoService.calculateDistance(
          parseFloat(lat1),
          parseFloat(lon1),
          parseFloat(lat2),
          parseFloat(lon2)
        );
        return NextResponse.json({ distance });

      case 'nearby':
        // Find nearby locations
        const userLat = searchParams.get('userLat');
        const userLon = searchParams.get('userLon');
        const radius = parseFloat(searchParams.get('radius') || '10');
        const locations = JSON.parse(searchParams.get('locations') || '[]');

        if (!userLat || !userLon) {
          return NextResponse.json({ error: 'User coordinates are required' }, { status: 400 });
        }

        const userLoc: LocationData = {
          latitude: parseFloat(userLat),
          longitude: parseFloat(userLon)
        };

        const nearbyLocations = geoService.findNearbyLocations(userLoc, locations, radius);
        return NextResponse.json(nearbyLocations);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Geolocation API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
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

    const geoService = GeolocationService.getInstance();

    switch (action) {
      case 'save-user-location':
        // Save user location to database
        const { latitude, longitude, accuracy, customerId } = params;
        
        if (!latitude || !longitude) {
          return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
        }

        // Import db dynamically to avoid circular dependencies
        const { db } = await import('@/lib/db');
        
        // Get location details
        const locationDetails = await geoService.reverseGeocode(latitude, longitude);
        
        // Save to UserLocation table
        const userLocation = await db.userLocation.create({
          data: {
            customerId,
            latitude,
            longitude,
            accuracy,
            city: locationDetails.city,
            state: locationDetails.state,
            pincode: locationDetails.pincode,
            country: locationDetails.country,
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
          }
        });

        return NextResponse.json(userLocation);

      case 'clear-cache':
        // Clear geolocation cache
        geoService.clearCache();
        return NextResponse.json({ message: 'Cache cleared successfully' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Geolocation POST API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}