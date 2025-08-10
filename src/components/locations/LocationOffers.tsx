'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Gift, 
  MapPin, 
  Percent, 
  DollarSign,
  Calendar,
  Users,
  Target,
  Copy,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

interface LocationOffer {
  id: string;
  locationId: string;
  title: string;
  description?: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_DELIVERY' | 'BUY_ONE_GET_ONE' | 'COMBO_OFFER';
  value: number;
  conditions?: string;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  targetCustomers?: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  location: {
    id: string;
    name: string;
    city: string;
    state: string;
  };
}

interface LocationOffersProps {
  restaurantId: string;
  locationId?: string;
}

interface OfferFormData {
  locationId: string;
  title: string;
  description: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_DELIVERY' | 'BUY_ONE_GET_ONE' | 'COMBO_OFFER';
  value: number;
  conditions: string;
  minOrderAmount: string;
  maxDiscountAmount: string;
  usageLimit: string;
  targetCustomers: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export default function LocationOffers({ restaurantId, locationId }: LocationOffersProps) {
  const [offers, setOffers] = useState<LocationOffer[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreatingOffer, setIsCreatingOffer] = useState(false);
  const [editingOffer, setEditingOffer] = useState<LocationOffer | null>(null);
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(locationId || '');

  // Form state
  const [formData, setFormData] = useState<OfferFormData>({
    locationId: locationId || '',
    title: '',
    description: '',
    type: 'PERCENTAGE',
    value: 0,
    conditions: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    targetCustomers: '',
    isActive: true,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchOffers();
    fetchLocations();
  }, [restaurantId, locationId]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (locationId) params.append('locationId', locationId);
      if (restaurantId) params.append('restaurantId', restaurantId);

      const response = await fetch(`/api/location-offers?${params}`);
      const data = await response.json();
      setOffers(data.offers || []);
    } catch (error) {
      toast.error('Failed to fetch offers');
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

  const handleCreateOffer = async () => {
    try {
      const payload = {
        locationId: formData.locationId,
        title: formData.title,
        description: formData.description || undefined,
        type: formData.type,
        value: formData.value,
        conditions: formData.conditions ? JSON.parse(formData.conditions) : undefined,
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : undefined,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        targetCustomers: formData.targetCustomers ? JSON.parse(formData.targetCustomers) : undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined
      };

      const response = await fetch('/api/location-offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('Offer created successfully');
        setShowOfferDialog(false);
        resetForm();
        fetchOffers();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create offer');
      }
    } catch (error) {
      toast.error('Failed to create offer');
    }
  };

  const handleUpdateOffer = async () => {
    if (!editingOffer) return;

    try {
      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        type: formData.type,
        value: formData.value,
        conditions: formData.conditions ? JSON.parse(formData.conditions) : undefined,
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : undefined,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        targetCustomers: formData.targetCustomers ? JSON.parse(formData.targetCustomers) : undefined,
        isActive: formData.isActive,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined
      };

      const response = await fetch(`/api/location-offers/${editingOffer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('Offer updated successfully');
        setShowOfferDialog(false);
        resetForm();
        setEditingOffer(null);
        fetchOffers();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update offer');
      }
    } catch (error) {
      toast.error('Failed to update offer');
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;

    try {
      const response = await fetch(`/api/location-offers/${offerId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Offer deleted successfully');
        fetchOffers();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete offer');
      }
    } catch (error) {
      toast.error('Failed to delete offer');
    }
  };

  const handleEditOffer = (offer: LocationOffer) => {
    setEditingOffer(offer);
    setFormData({
      locationId: offer.locationId,
      title: offer.title,
      description: offer.description || '',
      type: offer.type,
      value: offer.value,
      conditions: offer.conditions || '',
      minOrderAmount: offer.minOrderAmount?.toString() || '',
      maxDiscountAmount: offer.maxDiscountAmount?.toString() || '',
      usageLimit: offer.usageLimit?.toString() || '',
      targetCustomers: offer.targetCustomers || '',
      isActive: offer.isActive,
      startDate: offer.startDate ? new Date(offer.startDate).toISOString().split('T')[0] : '',
      endDate: offer.endDate ? new Date(offer.endDate).toISOString().split('T')[0] : ''
    });
    setShowOfferDialog(true);
  };

  const resetForm = () => {
    setFormData({
      locationId: locationId || '',
      title: '',
      description: '',
      type: 'PERCENTAGE',
      value: 0,
      conditions: '',
      minOrderAmount: '',
      maxDiscountAmount: '',
      usageLimit: '',
      targetCustomers: '',
      isActive: true,
      startDate: '',
      endDate: ''
    });
    setEditingOffer(null);
  };

  const duplicateOffer = (offer: LocationOffer) => {
    setFormData({
      locationId: offer.locationId,
      title: `${offer.title} (Copy)`,
      description: offer.description || '',
      type: offer.type,
      value: offer.value,
      conditions: offer.conditions || '',
      minOrderAmount: offer.minOrderAmount?.toString() || '',
      maxDiscountAmount: offer.maxDiscountAmount?.toString() || '',
      usageLimit: offer.usageLimit?.toString() || '',
      targetCustomers: offer.targetCustomers || '',
      isActive: false,
      startDate: '',
      endDate: ''
    });
    setShowOfferDialog(true);
  };

  const getOfferTypeIcon = (type: string) => {
    switch (type) {
      case 'PERCENTAGE':
        return <Percent className="w-4 h-4" />;
      case 'FIXED_AMOUNT':
        return <DollarSign className="w-4 h-4" />;
      case 'FREE_DELIVERY':
        return <MapPin className="w-4 h-4" />;
      case 'BUY_ONE_GET_ONE':
        return <Gift className="w-4 h-4" />;
      case 'COMBO_OFFER':
        return <Target className="w-4 h-4" />;
      default:
        return <Gift className="w-4 h-4" />;
    }
  };

  const getOfferTypeLabel = (type: string) => {
    switch (type) {
      case 'PERCENTAGE':
        return 'Percentage Discount';
      case 'FIXED_AMOUNT':
        return 'Fixed Amount';
      case 'FREE_DELIVERY':
        return 'Free Delivery';
      case 'BUY_ONE_GET_ONE':
        return 'Buy One Get One';
      case 'COMBO_OFFER':
        return 'Combo Offer';
      default:
        return type;
    }
  };

  const formatOfferValue = (offer: LocationOffer) => {
    switch (offer.type) {
      case 'PERCENTAGE':
        return `${offer.value}% off`;
      case 'FIXED_AMOUNT':
        return `₹${offer.value} off`;
      case 'FREE_DELIVERY':
        return 'Free Delivery';
      case 'BUY_ONE_GET_ONE':
        return 'BOGO';
      case 'COMBO_OFFER':
        return `₹${offer.value} off`;
      default:
        return offer.value.toString();
    }
  };

  const isOfferActive = (offer: LocationOffer) => {
    if (!offer.isActive) return false;
    
    const now = new Date();
    const startDate = offer.startDate ? new Date(offer.startDate) : null;
    const endDate = offer.endDate ? new Date(offer.endDate) : null;

    if (startDate && now < startDate) return false;
    if (endDate && now > endDate) return false;

    return true;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Location-Specific Offers</h2>
          <p className="text-muted-foreground">
            Manage offers and promotions for specific locations
          </p>
        </div>
        <Button onClick={() => {
          resetForm();
          setShowOfferDialog(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Create Offer
        </Button>
      </div>

      {/* Offers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Offers List</CardTitle>
          <CardDescription>
            View and manage all location-specific offers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading offers...</div>
          ) : offers.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No offers found</h3>
              <p className="text-muted-foreground">
                Create your first location-specific offer to get started.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Offer</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{offer.title}</div>
                        {offer.description && (
                          <div className="text-sm text-muted-foreground">
                            {offer.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{offer.location.name}, {offer.location.city}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getOfferTypeIcon(offer.type)}
                        <span>{getOfferTypeLabel(offer.type)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {formatOfferValue(offer)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {offer.usedCount}
                        {offer.usageLimit && ` / ${offer.usageLimit}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isOfferActive(offer) ? 'default' : 'secondary'}>
                        {isOfferActive(offer) ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditOffer(offer)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => duplicateOffer(offer)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteOffer(offer.id)}
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

      {/* Create/Edit Offer Dialog */}
      <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOffer ? 'Edit Offer' : 'Create New Offer'}
            </DialogTitle>
            <DialogDescription>
              {editingOffer 
                ? 'Update the offer details below'
                : 'Create a new location-specific offer'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!locationId && (
              <div>
                <Label htmlFor="location">Location</Label>
                <Select value={formData.locationId} onValueChange={(value) => setFormData(prev => ({ ...prev, locationId: value }))}>
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
              <Label htmlFor="title">Offer Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Weekend Special, Happy Hour Discount"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the offer"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Offer Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage Discount</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                    <SelectItem value="FREE_DELIVERY">Free Delivery</SelectItem>
                    <SelectItem value="BUY_ONE_GET_ONE">Buy One Get One</SelectItem>
                    <SelectItem value="COMBO_OFFER">Combo Offer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                  placeholder={formData.type === 'PERCENTAGE' ? 'e.g., 10 for 10%' : 'e.g., 100 for ₹100'}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minOrderAmount">Minimum Order Amount (₹)</Label>
                <Input
                  id="minOrderAmount"
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, minOrderAmount: e.target.value }))}
                  placeholder="e.g., 500"
                />
              </div>

              <div>
                <Label htmlFor="maxDiscountAmount">Maximum Discount (₹)</Label>
                <Input
                  id="maxDiscountAmount"
                  type="number"
                  value={formData.maxDiscountAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxDiscountAmount: e.target.value }))}
                  placeholder="e.g., 200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="usageLimit">Usage Limit</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: e.target.value }))}
                  placeholder="e.g., 100"
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="conditions">Conditions (JSON)</Label>
              <Textarea
                id="conditions"
                value={formData.conditions}
                onChange={(e) => setFormData(prev => ({ ...prev, conditions: e.target.value }))}
                placeholder='{"orderConditions": {"minimumItems": 2, "specificCategories": ["pizza", "burger"]}}'
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="targetCustomers">Target Customers (JSON)</Label>
              <Textarea
                id="targetCustomers"
                value={formData.targetCustomers}
                onChange={(e) => setFormData(prev => ({ ...prev, targetCustomers: e.target.value }))}
                placeholder='{"customerTypes": ["new", "vip"], "orderConditions": {"minimumOrderValue": 1000}}'
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowOfferDialog(false)}>
                Cancel
              </Button>
              <Button onClick={editingOffer ? handleUpdateOffer : handleCreateOffer}>
                {editingOffer ? 'Update Offer' : 'Create Offer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}