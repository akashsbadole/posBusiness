/**
 * Geolocation Service for detecting user location
 * Supports both HTML5 Geolocation API and IP-based geolocation
 */

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export interface GeolocationPosition {
  coords: GeolocationCoordinates;
  timestamp: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  address?: string;
  timezone?: string;
}

export interface IPLocationResponse {
  ip: string;
  city: string;
  region: string;
  region_code: string;
  country: string;
  country_name: string;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface ReverseGeocodeResponse {
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
  display_name: string;
}

class GeolocationService {
  private static instance: GeolocationService;
  private cache: Map<string, { data: LocationData; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): GeolocationService {
    if (!GeolocationService.instance) {
      GeolocationService.instance = new GeolocationService();
    }
    return GeolocationService.instance;
  }

  /**
   * Get current position using HTML5 Geolocation API
   */
  public async getCurrentPosition(options?: PositionOptions): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
          ...options
        }
      );
    });
  }

  /**
   * Get location from IP address using IP geolocation service
   */
  public async getIPLocation(): Promise<LocationData> {
    const cacheKey = 'ip_location';
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Using ipapi.co (free tier, no API key required for basic usage)
      const response = await fetch('https://ipapi.co/json/');
      const data: IPLocationResponse = await response.json();

      const locationData: LocationData = {
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city,
        state: data.region,
        country: data.country_name,
        pincode: data.postal,
        timezone: data.timezone
      };

      this.setToCache(cacheKey, locationData);
      return locationData;
    } catch (error) {
      console.error('Error getting IP location:', error);
      throw new Error('Failed to get location from IP');
    }
  }

  /**
   * Reverse geocode coordinates to get address details
   */
  public async reverseGeocode(latitude: number, longitude: number): Promise<LocationData> {
    const cacheKey = `reverse_${latitude}_${longitude}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Using Nominatim (OpenStreetMap) for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'RestaurantPOS/1.0'
          }
        }
      );
      
      const data: ReverseGeocodeResponse = await response.json();

      const locationData: LocationData = {
        latitude,
        longitude,
        city: data.address.city || data.address.suburb,
        state: data.address.state,
        country: data.address.country,
        pincode: data.address.postcode,
        address: data.display_name
      };

      this.setToCache(cacheKey, locationData);
      return locationData;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      throw new Error('Failed to reverse geocode coordinates');
    }
  }

  /**
   * Get user's location with fallback to IP-based detection
   */
  public async getUserLocation(): Promise<LocationData> {
    try {
      // Try HTML5 Geolocation first
      const position = await this.getCurrentPosition();
      const locationData = await this.reverseGeocode(
        position.coords.latitude,
        position.coords.longitude
      );
      
      return {
        ...locationData,
        accuracy: position.coords.accuracy
      };
    } catch (error) {
      console.warn('HTML5 Geolocation failed, falling back to IP-based:', error);
      // Fallback to IP-based location
      return await this.getIPLocation();
    }
  }

  /**
   * Calculate distance between two coordinates in kilometers
   */
  public calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Find nearby locations within a given radius
   */
  public findNearbyLocations<T extends { latitude: number; longitude: number }>(
    userLocation: LocationData,
    locations: T[],
    radiusKm: number = 10
  ): Array<T & { distance: number }> {
    return locations
      .map(location => ({
        ...location,
        distance: this.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          location.latitude,
          location.longitude
        )
      }))
      .filter(location => location.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  }

  /**
   * Check if a location is within delivery radius
   */
  public isWithinDeliveryRadius(
    userLocation: LocationData,
    restaurantLocation: LocationData,
    deliveryRadiusKm: number
  ): boolean {
    const distance = this.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      restaurantLocation.latitude,
      restaurantLocation.longitude
    );
    return distance <= deliveryRadiusKm;
  }

  /**
   * Get timezone offset for a location
   */
  public async getTimezone(latitude: number, longitude: number): Promise<string> {
    try {
      const response = await fetch(
        `https://api.timezonedb.com/v2.1/get-time-zone?key=YOUR_API_KEY&format=json&by=position&lat=${latitude}&lng=${longitude}`
      );
      const data = await response.json();
      return data.zoneName || 'Asia/Kolkata'; // Default to Indian timezone
    } catch (error) {
      console.error('Error getting timezone:', error);
      return 'Asia/Kolkata';
    }
  }

  /**
   * Validate PIN code for Indian addresses
   */
  public validatePINCode(pincode: string): boolean {
    // Indian PIN codes are 6 digits
    const pinRegex = /^[1-9][0-9]{5}$/;
    return pinRegex.test(pincode);
  }

  /**
   * Get state and city from PIN code (basic implementation)
   */
  public async getLocationFromPINCode(pincode: string): Promise<{ city: string; state: string }> {
    if (!this.validatePINCode(pincode)) {
      throw new Error('Invalid PIN code');
    }

    // This is a simplified implementation
    // In production, you would use a proper PIN code database or API
    const pinData: Record<string, { city: string; state: string }> = {
      '400053': { city: 'Mumbai', state: 'Maharashtra' },
      '400076': { city: 'Mumbai', state: 'Maharashtra' },
      '400050': { city: 'Mumbai', state: 'Maharashtra' },
      '560001': { city: 'Bangalore', state: 'Karnataka' },
      '600001': { city: 'Chennai', state: 'Tamil Nadu' },
      '110001': { city: 'Delhi', state: 'Delhi' },
      '700001': { city: 'Kolkata', state: 'West Bengal' },
      '500001': { city: 'Hyderabad', state: 'Telangana' },
      '380001': { city: 'Ahmedabad', state: 'Gujarat' },
      '411001': { city: 'Pune', state: 'Maharashtra' }
    };

    const firstThree = pincode.substring(0, 3);
    const location = pinData[pincode] || pinData[firstThree + '000'];

    if (location) {
      return location;
    }

    // Fallback to geocoding
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${pincode},India&limit=1`,
        {
          headers: {
            'User-Agent': 'RestaurantPOS/1.0'
          }
        }
      );
      
      const data = await response.json();
      if (data.length > 0) {
        const address = data[0].display;
        const parts = address.split(',');
        return {
          city: parts[0]?.trim() || 'Unknown',
          state: parts[1]?.trim() || 'Unknown'
        };
      }
    } catch (error) {
      console.error('Error getting location from PIN code:', error);
    }

    return { city: 'Unknown', state: 'Unknown' };
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private getFromCache(key: string): LocationData | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setToCache(key: string, data: LocationData): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear();
  }
}

export default GeolocationService;
export { GeolocationService, type LocationData, type GeolocationPosition };