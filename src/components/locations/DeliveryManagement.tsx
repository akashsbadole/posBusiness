'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Clock, 
  Car,
  Calculator,
  Route,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface DeliveryZone {
  id: string;
  locationId: string;
  name: string;
  pincode: string;
  area: string;
  city: string;
  state: string;
  deliveryFee: number;
  estimatedTime: number;
  minOrderAmount?: number;
  isActive: boolean;
  createdAt: string;
  location: {
    id: string;
    name: string;
    city: string;
    state: string;
  };
}

interface DeliveryCalculation {
  isDeliverable: boolean;
  deliveryFee: number;
  estimatedTime: number;
  distance?: number;
  deliveryZone?: DeliveryZone;
  message?: string;
  availableOptions: Array<{
    type: 'delivery' | 'pickup';
    fee: number;
    estimatedTime: number;
    description: string;
  }>;
}

interface DeliveryManagementProps {
  restaurantId: string;
  locationId?: string;
}

interface ZoneFormData {
  locationId: string;
  name: string;
  pincode: string;
  area: string;
  city: string;
  state: string;
  deliveryFee: string;
  estimatedTime: string;
  minOrderAmount: string;
  isActive: boolean;
}

export default function DeliveryManagement({ restaurantId, locationId }: DeliveryManagementProps) {
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreatingZone, setIsCreatingZone] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [showZoneDialog, setShowZoneDialog] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(locationId || '');

  // Delivery calculator state
  const [calculationData, setCalculationData] = useState({
    locationId: locationId || '',
    customerPincode: '',
    orderAmount: '500',
    orderType: 'delivery' as 'delivery' | 'pickup'
  });
  const [calculationResult, setCalculationResult] = useState<DeliveryCalculation | null>(null);
  const [calculating, setCalculating] = useState(false);

  // Form state
  const [formData, setFormData] = useState<ZoneFormData>({
    locationId: locationId || '',
    name: '',
    pincode: '',
    area: '',
    city: '',
    state: '',
    deliveryFee: '',
    estimatedTime: '',
    minOrderAmount: '',
    isActive: true
  });

  useEffect(() => {
    fetchDeliveryZones();
    fetchLocations();
  }, [restaurantId, locationId]);

  const fetchDeliveryZones = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (locationId) params.append('locationId', locationId);
      if (restaurantId) params.append('restaurantId', restaurantId);

      const response = await fetch(`/api/delivery-zones?${params}`);
      const data = await response.json();
      setDeliveryZones(data.deliveryZones || []);
    } catch (error) {
      toast.error('Failed to fetch delivery zones');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch(`/api/locations?restaurantId=${restaurantId}`);
      const data = await response.json();
      setLocations(data.locations || []);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    }
  };

  const handleCreateZone = async () => {
    try {
      const payload = {
        locationId: formData.locationId,
        name: formData.name,
        pincode: formData.pincode,
        area: formData.area,
        city: formData.city,
        state: formData.state,
        deliveryFee: parseFloat(formData.deliveryFee),
        estimatedTime: parseInt(formData.estimatedTime),
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : undefined
      };

      const response = await fetch('/api/delivery-zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('Delivery zone created successfully');
        setShowZoneDialog(false);
        resetForm();
        fetchDeliveryZones();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create delivery zone');
      }
    } catch (error) {
      toast.error('Failed to create delivery zone');
    }
  };

  const handleUpdateZone = async () => {
    if (!editingZone) return;

    try {
      const payload = {
        name: formData.name,
        pincode: formData.pincode,
        area: formData.area,
        city: formData.city,
        state: formData.state,
        deliveryFee: parseFloat(formData.deliveryFee),
        estimatedTime: parseInt(formData.estimatedTime),
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : undefined,
        isActive: formData.isActive
      };

      const response = await fetch(`/api/delivery-zones/${editingZone.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('Delivery zone updated successfully');
        setShowZoneDialog(false);
        resetForm();
        setEditingZone(null);
        fetchDeliveryZones();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update delivery zone');
      }
    } catch (error) {
      toast.error('Failed to update delivery zone');
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    if (!confirm('Are you sure you want to delete this delivery zone?')) return;

    try {
      const response = await fetch(`/api/delivery-zones/${zoneId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Delivery zone deleted successfully');
        fetchDeliveryZones();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete delivery zone');
      }
    } catch (error) {
      toast.error('Failed to delete delivery zone');
    }
  };

  const handleEditZone = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setFormData({
      locationId: zone.locationId,
      name: zone.name,
      pincode: zone.pincode,
      area: zone.area,
      city: zone.city,
      state: zone.state,
      deliveryFee: zone.deliveryFee.toString(),
      estimatedTime: zone.estimatedTime.toString(),
      minOrderAmount: zone.minOrderAmount?.toString() || '',
      isActive: zone.isActive
    });
    setShowZoneDialog(true);
  };

  const resetForm = () => {
    setFormData({
      locationId: locationId || '',
      name: '',
      pincode: '',
      area: '',
      city: '',
      state: '',
      deliveryFee: '',
      estimatedTime: '',
      minOrderAmount: '',
      isActive: true
    });
    setEditingZone(null);
  };

  const handleCalculateDelivery = async () => {
    if (!calculationData.locationId || !calculationData.orderAmount) {
      toast.error('Location and order amount are required');
      return;
    }

    try {
      setCalculating(true);
      const payload = {
        locationId: calculationData.locationId,
        customerPincode: calculationData.customerPincode || undefined,
        orderAmount: parseFloat(calculationData.orderAmount),
        orderType: calculationData.orderType
      };

      const response = await fetch('/api/delivery/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data: DeliveryCalculation = await response.json();
        setCalculationResult(data);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to calculate delivery');
      }
    } catch (error) {
      toast.error('Failed to calculate delivery');
    } finally {
      setCalculating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Delivery Management</h2>
          <p className="text-muted-foreground">
            Manage delivery zones and calculate delivery fees
          </p>
        </div>
      </div>

      <Tabs defaultValue="zones" className="space-y-6">
        <TabsList>
          <TabsTrigger value="zones">Delivery Zones</TabsTrigger>
          <TabsTrigger value="calculator">Delivery Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="zones" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Delivery Zones</h3>
            <Button onClick={() => {
              resetForm();
              setShowZoneDialog(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Zone
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Zones List</CardTitle>
              <CardDescription>
                Manage delivery areas, fees, and estimated delivery times
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading delivery zones...</div>
              ) : deliveryZones.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No delivery zones found</h3>
                  <p className="text-muted-foreground">
                    Create your first delivery zone to start delivering to customers.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Zone</TableHead>
                      <TableHead>PIN Code</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Delivery Fee</TableHead>
                      <TableHead>Est. Time</TableHead>
                      <TableHead>Min Order</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveryZones.map((zone) => (
                      <TableRow key={zone.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{zone.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {zone.area}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{zone.pincode}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{zone.location.name}, {zone.location.city}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span>{formatCurrency(zone.deliveryFee)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span>{formatTime(zone.estimatedTime)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {zone.minOrderAmount ? (
                            formatCurrency(zone.minOrderAmount)
                          ) : (
                            <span className="text-muted-foreground">No minimum</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={zone.isActive ? 'default' : 'secondary'}>
                            {zone.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditZone(zone)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteZone(zone.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Calculator</CardTitle>
              <CardDescription>
                Calculate delivery fees and check availability for specific areas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {!locationId && (
                  <div>
                    <Label htmlFor="calc-location">Location</Label>
                    <Select 
                      value={calculationData.locationId} 
                      onValueChange={(value) => setCalculationData(prev => ({ ...prev, locationId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id}>
                            {loc.name}, {loc.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="pincode">Customer PIN Code</Label>
                  <Input
                    id="pincode"
                    value={calculationData.customerPincode}
                    onChange={(e) => setCalculationData(prev => ({ ...prev, customerPincode: e.target.value }))}
                    placeholder="e.g., 400053"
                  />
                </div>

                <div>
                  <Label htmlFor="orderAmount">Order Amount (₹)</Label>
                  <Input
                    id="orderAmount"
                    type="number"
                    value={calculationData.orderAmount}
                    onChange={(e) => setCalculationData(prev => ({ ...prev, orderAmount: e.target.value }))}
                    placeholder="e.g., 500"
                  />
                </div>

                <div>
                  <Label htmlFor="orderType">Order Type</Label>
                  <Select 
                    value={calculationData.orderType} 
                    onValueChange={(value: 'delivery' | 'pickup') => setCalculationData(prev => ({ ...prev, orderType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delivery">Delivery</SelectItem>
                      <SelectItem value="pickup">Pickup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleCalculateDelivery} disabled={calculating}>
                  {calculating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Calculator className="w-4 h-4 mr-2" />
                  )}
                  Calculate
                </Button>
              </div>

              {calculationResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      {calculationResult.isDeliverable ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      )}
                      <span>Delivery Calculation Result</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {calculationResult.message && (
                      <div className={`p-3 rounded-lg mb-4 ${
                        calculationResult.isDeliverable 
                          ? 'bg-green-50 text-green-800 border border-green-200' 
                          : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                      }`}>
                        {calculationResult.message}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {calculationResult.distance !== undefined && (
                        <div>
                          <Label className="text-sm font-medium">Distance</Label>
                          <p className="text-lg font-semibold">
                            {calculationResult.distance.toFixed(1)} km
                          </p>
                        </div>
                      )}

                      {calculationResult.deliveryFee > 0 && (
                        <div>
                          <Label className="text-sm font-medium">Delivery Fee</Label>
                          <p className="text-lg font-semibold">
                            {formatCurrency(calculationResult.deliveryFee)}
                          </p>
                        </div>
                      )}

                      <div>
                        <Label className="text-sm font-medium">Estimated Time</Label>
                        <p className="text-lg font-semibold">
                          {formatTime(calculationResult.estimatedTime)}
                        </p>
                      </div>

                      {calculationResult.deliveryZone?.minOrderAmount && (
                        <div>
                          <Label className="text-sm font-medium">Minimum Order</Label>
                          <p className="text-lg font-semibold">
                            {formatCurrency(calculationResult.deliveryZone.minOrderAmount)}
                          </p>
                        </div>
                      )}
                    </div>

                    {calculationResult.availableOptions.length > 0 && (
                      <div className="mt-4">
                        <Label className="text-sm font-medium mb-2">Available Options</Label>
                        <div className="space-y-2">
                          {calculationResult.availableOptions.map((option, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center space-x-2">
                                {option.type === 'delivery' ? (
                                  <Car className="w-4 h-4 text-blue-600" />
                                ) : (
                                  <Route className="w-4 h-4 text-green-600" />
                                )}
                                <span className="font-medium capitalize">{option.type}</span>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">
                                  {option.fee === 0 ? 'FREE' : formatCurrency(option.fee)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {formatTime(option.estimatedTime)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Delivery Zone Dialog */}
      <Dialog open={showZoneDialog} onOpenChange={setShowZoneDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingZone ? 'Edit Delivery Zone' : 'Create Delivery Zone'}
            </DialogTitle>
            <DialogDescription>
              {editingZone 
                ? 'Update the delivery zone details below'
                : 'Create a new delivery zone for your location'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!locationId && (
              <div>
                <Label htmlFor="zone-location">Location</Label>
                <Select 
                  value={formData.locationId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, locationId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}, {loc.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="zone-name">Zone Name</Label>
              <Input
                id="zone-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Andheri West, Bandra East"
              />
            </div>

            <div>
              <Label htmlFor="pincode">PIN Code</Label>
              <Input
                id="pincode"
                value={formData.pincode}
                onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                placeholder="e.g., 400053"
              />
            </div>

            <div>
              <Label htmlFor="area">Area/Locality</Label>
              <Input
                id="area"
                value={formData.area}
                onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                placeholder="e.g., Linking Road, Hiranandani Gardens"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="e.g., Mumbai"
                />
              </div>

              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="e.g., Maharashtra"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deliveryFee">Delivery Fee (₹)</Label>
                <Input
                  id="deliveryFee"
                  type="number"
                  value={formData.deliveryFee}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliveryFee: e.target.value }))}
                  placeholder="e.g., 50"
                />
              </div>

              <div>
                <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
                <Input
                  id="estimatedTime"
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                  placeholder="e.g., 30"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="minOrderAmount">Minimum Order Amount (₹)</Label>
              <Input
                id="minOrderAmount"
                type="number"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, minOrderAmount: e.target.value }))}
                placeholder="e.g., 200 (optional)"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowZoneDialog(false)}>
                Cancel
              </Button>
              <Button onClick={editingZone ? handleUpdateZone : handleCreateZone}>
                {editingZone ? 'Update Zone' : 'Create Zone'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}