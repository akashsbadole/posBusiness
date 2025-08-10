'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Clock,
  DollarSign,
  Truck,
  Upload,
  Download,
  Loader2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

interface ServiceArea {
  pincode: string;
  area: string;
  city: string;
  state: string;
  deliveryFee: number;
  estimatedTime: number;
  minOrderAmount?: number;
  locationName: string;
}

interface PINCodeValidation {
  isValid: boolean;
  pincode: string;
  message?: string;
  location?: {
    city: string;
    state: string;
  };
}

interface DeliveryCheck {
  pincode: string;
  deliveryAvailable: boolean;
  deliveryOptions: Array<{
    locationId: string;
    locationName: string;
    deliveryFee: number;
    estimatedTime: number;
    minOrderAmount?: number;
    zoneName: string;
    isCityWide?: boolean;
  }>;
}

interface PINCodeServicesProps {
  restaurantId: string;
  locationId?: string;
}

export default function PINCodeServices({ restaurantId, locationId }: PINCodeServicesProps) {
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState(locationId || '');
  const [loading, setLoading] = useState(false);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [pincodeValidation, setPINCodeValidation] = useState<PINCodeValidation | null>(null);
  const [deliveryCheck, setDeliveryCheck] = useState<DeliveryCheck | null>(null);
  const [bulkCheckResults, setBulkCheckResults] = useState<any[]>([]);
  const [showAddServiceArea, setShowAddServiceArea] = useState(false);

  // Form states
  const [pincodeInput, setPINcodeInput] = useState('');
  const [bulkPINcodes, setBulkPINcodes] = useState('');
  const [newServiceArea, setNewServiceArea] = useState({
    locationId: locationId || '',
    pincode: '',
    area: '',
    deliveryFee: '',
    estimatedTime: '',
    minOrderAmount: ''
  });

  useEffect(() => {
    fetchLocations();
    fetchServiceAreas();
  }, [restaurantId]);

  const fetchLocations = async () => {
    try {
      const response = await fetch(`/api/locations?restaurantId=${restaurantId}`);
      const data = await response.json();
      setLocations(data.locations || []);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    }
  };

  const fetchServiceAreas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pincode-services?action=service-areas&restaurantId=${restaurantId}`);
      const data = await response.json();
      setServiceAreas(data.serviceAreas || []);
    } catch (error) {
      toast.error('Failed to fetch service areas');
    } finally {
      setLoading(false);
    }
  };

  const validatePINcode = async () => {
    if (!pincodeInput) {
      toast.error('Please enter a PIN code');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/pincode-services?action=validate&pincode=${pincodeInput}`);
      const data: PINCodeValidation = await response.json();
      setPINCodeValidation(data);

      if (data.isValid) {
        toast.success('Valid PIN code format');
      } else {
        toast.error('Invalid PIN code format');
      }
    } catch (error) {
      toast.error('Failed to validate PIN code');
    } finally {
      setLoading(false);
    }
  };

  const lookupPINcode = async () => {
    if (!pincodeInput) {
      toast.error('Please enter a PIN code');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/pincode-services?action=lookup&pincode=${pincodeInput}`);
      const data = await response.json();
      
      if (data.isValid) {
        setPINCodeValidation(data);
        toast.success('PIN code found in database');
      } else {
        setPINCodeValidation(data);
        toast.error('PIN code not found');
      }
    } catch (error) {
      toast.error('Failed to lookup PIN code');
    } finally {
      setLoading(false);
    }
  };

  const checkDeliveryAvailability = async () => {
    if (!pincodeInput || !restaurantId) {
      toast.error('PIN code and restaurant are required');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/pincode-services?action=check-delivery&pincode=${pincodeInput}&restaurantId=${restaurantId}`);
      const data: DeliveryCheck = await response.json();
      setDeliveryCheck(data);

      if (data.deliveryAvailable) {
        toast.success('Delivery is available for this PIN code');
      } else {
        toast.error('Delivery is not available for this PIN code');
      }
    } catch (error) {
      toast.error('Failed to check delivery availability');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCheck = async () => {
    const pincodes = bulkPINcodes.split('\n').filter(p => p.trim()).map(p => p.trim());
    
    if (pincodes.length === 0) {
      toast.error('Please enter at least one PIN code');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/pincode-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk-check-delivery',
          pincodes,
          restaurantId
        })
      });

      const data = await response.json();
      setBulkCheckResults(data.results);
      
      toast.success(`Checked ${data.totalChecked} PIN codes, ${data.availablePincodes} have delivery available`);
    } catch (error) {
      toast.error('Failed to check bulk PIN codes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddServiceArea = async () => {
    try {
      const response = await fetch('/api/pincode-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add-service-area',
          locationId: newServiceArea.locationId,
          pincode: newServiceArea.pincode,
          area: newServiceArea.area,
          deliveryFee: parseFloat(newServiceArea.deliveryFee),
          estimatedTime: parseInt(newServiceArea.estimatedTime),
          minOrderAmount: newServiceArea.minOrderAmount ? parseFloat(newServiceArea.minOrderAmount) : undefined
        })
      });

      if (response.ok) {
        toast.success('Service area added successfully');
        setShowAddServiceArea(false);
        setNewServiceArea({
          locationId: locationId || '',
          pincode: '',
          area: '',
          deliveryFee: '',
          estimatedTime: '',
          minOrderAmount: ''
        });
        fetchServiceAreas();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add service area');
      }
    } catch (error) {
      toast.error('Failed to add service area');
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

  const exportServiceAreas = () => {
    const csvContent = [
      ['PIN Code', 'Area', 'City', 'State', 'Delivery Fee', 'Estimated Time', 'Min Order Amount', 'Location'].join(','),
      ...serviceAreas.map(area => [
        area.pincode,
        area.area,
        area.city,
        area.state,
        area.deliveryFee,
        area.estimatedTime,
        area.minOrderAmount || '',
        area.locationName
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `service-areas-${restaurantId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Service areas exported successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">PIN Code Services</h2>
          <p className="text-muted-foreground">
            Manage PIN code-based location services and delivery areas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportServiceAreas}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowAddServiceArea(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Service Area
          </Button>
        </div>
      </div>

      <Tabs defaultValue="lookup" className="space-y-6">
        <TabsList>
          <TabsTrigger value="lookup">PIN Code Lookup</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Check</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Check</TabsTrigger>
          <TabsTrigger value="service-areas">Service Areas</TabsTrigger>
        </TabsList>

        <TabsContent value="lookup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>PIN Code Lookup & Validation</CardTitle>
              <CardDescription>
                Validate PIN code format and lookup location information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter PIN code (e.g., 400053)"
                  value={pincodeInput}
                  onChange={(e) => setPINcodeInput(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={validatePINcode} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Validate
                </Button>
                <Button variant="outline" onClick={lookupPINcode} disabled={loading}>
                  <Search className="w-4 h-4" />
                  Lookup
                </Button>
              </div>

              {pincodeValidation && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      {pincodeValidation.isValid ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="font-semibold">
                        PIN Code: {pincodeValidation.pincode}
                      </span>
                      <Badge variant={pincodeValidation.isValid ? 'default' : 'destructive'}>
                        {pincodeValidation.isValid ? 'Valid' : 'Invalid'}
                      </Badge>
                    </div>
                    
                    {pincodeValidation.message && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {pincodeValidation.message}
                      </p>
                    )}

                    {pincodeValidation.location && (
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{pincodeValidation.location.city}</span>
                        </div>
                        <span>•</span>
                        <span>{pincodeValidation.location.state}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Availability Check</CardTitle>
              <CardDescription>
                Check if delivery is available for a specific PIN code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter PIN code to check delivery"
                  value={pincodeInput}
                  onChange={(e) => setPINcodeInput(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={checkDeliveryAvailability} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                  Check Delivery
                </Button>
              </div>

              {deliveryCheck && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-4">
                      {deliveryCheck.deliveryAvailable ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="font-semibold">
                        {deliveryCheck.deliveryAvailable ? 'Delivery Available' : 'Delivery Not Available'}
                      </span>
                      <Badge variant={deliveryCheck.deliveryAvailable ? 'default' : 'destructive'}>
                        PIN: {deliveryCheck.pincode}
                      </Badge>
                    </div>

                    {deliveryCheck.deliveryAvailable && deliveryCheck.deliveryOptions.length > 0 && (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Available Delivery Options:</Label>
                        {deliveryCheck.deliveryOptions.map((option, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">{option.locationName}</div>
                              <div className="text-sm text-muted-foreground">{option.zoneName}</div>
                              {option.isCityWide && (
                                <Badge variant="secondary" className="text-xs mt-1">
                                  City-wide
                                </Badge>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-1">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <span className="font-semibold">{formatCurrency(option.deliveryFee)}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>{formatTime(option.estimatedTime)}</span>
                              </div>
                              {option.minOrderAmount && (
                                <div className="text-xs text-muted-foreground">
                                  Min: {formatCurrency(option.minOrderAmount)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bulk PIN Code Check</CardTitle>
              <CardDescription>
                Check delivery availability for multiple PIN codes at once
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bulk-pincodes">Enter PIN codes (one per line)</Label>
                <Textarea
                  id="bulk-pincodes"
                  value={bulkPINcodes}
                  onChange={(e) => setBulkPINcodes(e.target.value)}
                  placeholder="400053&#10;400076&#10;400050&#10;560001&#10;600001"
                  rows={6}
                />
              </div>

              <Button onClick={handleBulkCheck} disabled={loading || !bulkPINcodes.trim()}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                Check All PIN Codes
              </Button>

              {bulkCheckResults.length > 0 && (
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Results ({bulkCheckResults.length} PIN codes checked)</Label>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {bulkCheckResults.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          {result.deliveryAvailable ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className="font-medium">{result.pincode}</span>
                        </div>
                        <div className="text-right">
                          {result.deliveryAvailable ? (
                            <Badge variant="default">
                              Available ({result.deliveryOptions?.length || 0} options)
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Not Available</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="service-areas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Areas</CardTitle>
              <CardDescription>
                View all PIN codes where delivery is available
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading service areas...</div>
              ) : serviceAreas.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No service areas found</h3>
                  <p className="text-muted-foreground">
                    Add service areas to start delivering to customers.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PIN Code</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Delivery Fee</TableHead>
                      <TableHead>Est. Time</TableHead>
                      <TableHead>Min Order</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceAreas.map((area, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Badge variant="outline">{area.pincode}</Badge>
                        </TableCell>
                        <TableCell>{area.area}</TableCell>
                        <TableCell>{area.city}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span>{formatCurrency(area.deliveryFee)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span>{formatTime(area.estimatedTime)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {area.minOrderAmount ? (
                            formatCurrency(area.minOrderAmount)
                          ) : (
                            <span className="text-muted-foreground">No minimum</span>
                          )}
                        </TableCell>
                        <TableCell>{area.locationName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Service Area Dialog */}
      <Dialog open={showAddServiceArea} onOpenChange={setShowAddServiceArea}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Service Area</DialogTitle>
            <DialogDescription>
              Add a new PIN code to your delivery service areas
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!locationId && (
              <div>
                <Label htmlFor="service-location">Location</Label>
                <Select 
                  value={newServiceArea.locationId} 
                  onValueChange={(value) => setNewServiceArea(prev => ({ ...prev, locationId: value }))}
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
              <Label htmlFor="service-pincode">PIN Code</Label>
              <Input
                id="service-pincode"
                value={newServiceArea.pincode}
                onChange={(e) => setNewServiceArea(prev => ({ ...prev, pincode: e.target.value }))}
                placeholder="e.g., 400053"
              />
            </div>

            <div>
              <Label htmlFor="service-area">Area/Locality</Label>
              <Input
                id="service-area"
                value={newServiceArea.area}
                onChange={(e) => setNewServiceArea(prev => ({ ...prev, area: e.target.value }))}
                placeholder="e.g., Andheri West"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="delivery-fee">Delivery Fee (₹)</Label>
                <Input
                  id="delivery-fee"
                  type="number"
                  value={newServiceArea.deliveryFee}
                  onChange={(e) => setNewServiceArea(prev => ({ ...prev, deliveryFee: e.target.value }))}
                  placeholder="e.g., 50"
                />
              </div>

              <div>
                <Label htmlFor="estimated-time">Estimated Time (minutes)</Label>
                <Input
                  id="estimated-time"
                  type="number"
                  value={newServiceArea.estimatedTime}
                  onChange={(e) => setNewServiceArea(prev => ({ ...prev, estimatedTime: e.target.value }))}
                  placeholder="e.g., 30"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="min-order">Minimum Order Amount (₹)</Label>
              <Input
                id="min-order"
                type="number"
                value={newServiceArea.minOrderAmount}
                onChange={(e) => setNewServiceArea(prev => ({ ...prev, minOrderAmount: e.target.value }))}
                placeholder="e.g., 200 (optional)"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddServiceArea(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddServiceArea}>
                Add Service Area
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}