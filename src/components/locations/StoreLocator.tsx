'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MapPin, 
  Search, 
  Navigation, 
  Phone, 
  Clock, 
  Star,
  Car,
  Route,
  Filter,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import GeolocationService, { type LocationData } from '@/lib/geolocation';

interface StoreLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email?: string;
  latitude: number;
  longitude: number;
  type: 'restaurant' | 'cloud_kitchen' | 'food_truck' | 'kiosk';
  status: 'active' | 'inactive' | 'maintenance';
  capacity: number;
  openingHours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  deliveryRadius: number;
  isDeliveryEnabled: boolean;
  isPickupEnabled: boolean;
  distance?: number;
  rating?: number;
}

interface StoreLocatorProps {
  restaurantId: string;
  onLocationSelect?: (location: StoreLocation) => void;
}

export default function StoreLocator({ restaurantId, onLocationSelect }: StoreLocatorProps) {
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<StoreLocation[]>([]);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<StoreLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'name' | 'rating'>('distance');
  const [showMap, setShowMap] = useState(false);
  const [radius, setRadius] = useState(10);

  const geoService = GeolocationService.getInstance();

  useEffect(() => {
    fetchLocations();
    detectUserLocation();
  }, []);

  useEffect(() => {
    filterAndSortLocations();
  }, [locations, userLocation, searchQuery, selectedCity, selectedType, sortBy, radius]);

  const fetchLocations = async () => {
    try {
      const response = await fetch(`/api/locations?restaurantId=${restaurantId}`);
      const data = await response.json();
      
      // Transform API data to StoreLocation format
      const storeLocations: StoreLocation[] = data.locations.map((loc: any) => ({
        id: loc.id,
        name: loc.name,
        address: loc.address,
        city: loc.city,
        state: loc.state,
        pincode: loc.pincode,
        phone: loc.phone,
        email: loc.email,
        latitude: loc.latitude || 19.0760, // Default to Mumbai if not set
        longitude: loc.longitude || 72.8777,
        type: loc.type,
        status: loc.status,
        capacity: loc.capacity,
        openingHours: loc.openingHours || {},
        deliveryRadius: loc.deliveryRadius || 5,
        isDeliveryEnabled: loc.isDeliveryEnabled,
        isPickupEnabled: loc.isPickupEnabled,
        rating: Math.random() * 2 + 3 // Mock rating for demo
      }));

      setLocations(storeLocations);
    } catch (error) {
      toast.error('Failed to fetch locations');
    }
  };

  const detectUserLocation = async () => {
    try {
      setLoading(true);
      const location = await geoService.getUserLocation();
      setUserLocation(location);
    } catch (error) {
      console.error('Failed to detect user location:', error);
      toast.warning('Could not detect your location. Please enable location services.');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortLocations = () => {
    let filtered = [...locations];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(loc =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.pincode.includes(searchQuery)
      );
    }

    // Filter by city
    if (selectedCity) {
      filtered = filtered.filter(loc => loc.city === selectedCity);
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(loc => loc.type === selectedType);
    }

    // Filter by radius if user location is available
    if (userLocation) {
      filtered = filtered.map(loc => ({
        ...loc,
        distance: geoService.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          loc.latitude,
          loc.longitude
        )
      })).filter(loc => (loc.distance || 0) <= radius);
    }

    // Sort locations
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    setFilteredLocations(filtered);
  };

  const handleLocationSelect = (location: StoreLocation) => {
    setSelectedLocation(location);
    onLocationSelect?.(location);
  };

  const getCurrentLocation = () => {
    detectUserLocation();
  };

  const getOpenStatus = (openingHours: any) => {
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    const todayHours = openingHours[day];
    if (!todayHours || todayHours.closed) {
      return { status: 'closed', label: 'Closed' };
    }

    const openTime = parseInt(todayHours.open.replace(':', ''));
    const closeTime = parseInt(todayHours.close.replace(':', ''));

    if (currentTime >= openTime && currentTime <= closeTime) {
      return { status: 'open', label: 'Open' };
    }

    return { status: 'closed', label: 'Closed' };
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    }
    return `${distance.toFixed(1)}km away`;
  };

  const getCities = () => {
    const cities = [...new Set(locations.map(loc => loc.city))];
    return cities.sort();
  };

  const getDirections = (location: StoreLocation) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${location.latitude},${location.longitude}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Store Locator</h2>
          <p className="text-muted-foreground">
            Find our nearest outlets and restaurants
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={getCurrentLocation} disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4 mr-2" />
            )}
            Use My Location
          </Button>
          <Button variant="outline" onClick={() => setShowMap(true)}>
            <MapPin className="w-4 h-4 mr-2" />
            View Map
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {getCities().map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="cloud_kitchen">Cloud Kitchen</SelectItem>
                <SelectItem value="food_truck">Food Truck</SelectItem>
                <SelectItem value="kiosk">Kiosk</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>

            <Select value={radius.toString()} onValueChange={(value) => setRadius(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Radius" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 km</SelectItem>
                <SelectItem value="10">10 km</SelectItem>
                <SelectItem value="25">25 km</SelectItem>
                <SelectItem value="50">50 km</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredLocations.map(location => {
          const openStatus = getOpenStatus(location.openingHours);
          
          return (
            <Card 
              key={location.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedLocation?.id === location.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleLocationSelect(location)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{location.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={location.status === 'active' ? 'default' : 'secondary'}>
                      {location.status}
                    </Badge>
                    <Badge variant={openStatus.status === 'open' ? 'default' : 'destructive'}>
                      {openStatus.label}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{location.address}, {location.city}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>{location.phone}</span>
                    </div>
                    {location.distance && (
                      <span className="text-muted-foreground">
                        {formatDistance(location.distance)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{location.rating?.toFixed(1) || 'N/A'}</span>
                    </div>
                    <Badge variant="outline">
                      {location.type.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {location.isDeliveryEnabled && (
                      <div className="flex items-center space-x-1">
                        <Car className="h-3 w-3" />
                        <span>Delivery ({location.deliveryRadius}km)</span>
                      </div>
                    )}
                    {location.isPickupEnabled && (
                      <div className="flex items-center space-x-1">
                        <Route className="h-3 w-3" />
                        <span>Pickup</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">
                      Capacity: {location.capacity > 0 ? `${location.capacity} seats` : 'Cloud Kitchen'}
                    </span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        getDirections(location);
                      }}
                    >
                      <Route className="w-3 h-3 mr-1" />
                      Directions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredLocations.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No locations found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or increasing the search radius.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Location Details Dialog */}
      {selectedLocation && (
        <Dialog open={!!selectedLocation} onOpenChange={() => setSelectedLocation(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedLocation.name}</DialogTitle>
              <DialogDescription>
                {selectedLocation.address}, {selectedLocation.city}, {selectedLocation.pincode}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <p className="text-sm text-muted-foreground">{selectedLocation.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground">{selectedLocation.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedLocation.type.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Capacity</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedLocation.capacity > 0 ? `${selectedLocation.capacity} seats` : 'Cloud Kitchen'}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Services</label>
                <div className="flex gap-2 mt-1">
                  {selectedLocation.isDeliveryEnabled && (
                    <Badge variant="secondary">
                      <Car className="w-3 h-3 mr-1" />
                      Delivery ({selectedLocation.deliveryRadius}km)
                    </Badge>
                  )}
                  {selectedLocation.isPickupEnabled && (
                    <Badge variant="secondary">
                      <Route className="w-3 h-3 mr-1" />
                      Pickup
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Opening Hours</label>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  {Object.entries(selectedLocation.openingHours).map(([day, hours]: [string, any]) => (
                    <div key={day} className="flex justify-between">
                      <span className="capitalize">{day}</span>
                      <span className={hours.closed ? 'text-red-500' : 'text-green-500'}>
                        {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => getDirections(selectedLocation)}
                  className="flex-1"
                >
                  <Route className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedLocation.phone);
                    toast.success('Phone number copied to clipboard');
                  }}
                >
                  Copy Phone
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Map View Dialog (Placeholder) */}
      <Dialog open={showMap} onOpenChange={setShowMap}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Store Locations Map</DialogTitle>
            <DialogDescription>
              Interactive map showing all store locations
            </DialogDescription>
          </DialogHeader>
          
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Map View</h3>
              <p className="text-muted-foreground">
                Map integration would be implemented here using Google Maps or similar service.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}