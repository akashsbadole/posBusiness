'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Plus, Edit, Trash2, Percent, DollarSign, Clock, Users, ShoppingCart, Tag, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface DiscountRule {
  id: string
  name: string
  description?: string
  type: 'PERCENTAGE' | 'FIXED' | 'BOGO' | 'FREE_SHIPPING'
  value: number
  conditions?: any
  targetCustomers?: any
  minPurchaseAmount?: number
  maxDiscountAmount?: number
  usageLimit?: number
  usedCount: number
  startDate?: Date
  endDate?: Date
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface DiscountManagementProps {
  restaurantId: string
}

export default function DiscountManagement({ restaurantId }: DiscountManagementProps) {
  const [discounts, setDiscounts] = useState<DiscountRule[]>([])
  const [selectedDiscount, setSelectedDiscount] = useState<DiscountRule | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchDiscounts()
  }, [restaurantId])

  const fetchDiscounts = async () => {
    try {
      const response = await fetch(`/api/discounts?restaurantId=${restaurantId}`)
      const data = await response.json()
      setDiscounts(data)
    } catch (error) {
      toast.error('Failed to fetch discounts')
    }
  }

  const handleCreateDiscount = async (discountData: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          ...discountData
        })
      })

      if (response.ok) {
        await fetchDiscounts()
        setIsCreating(false)
        toast.success('Discount created successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create discount')
      }
    } catch (error) {
      toast.error('Failed to create discount')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateDiscount = async (discountId: string, updates: any) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/discounts/${discountId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        await fetchDiscounts()
        setIsEditing(false)
        toast.success('Discount updated successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update discount')
      }
    } catch (error) {
      toast.error('Failed to update discount')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDiscount = async (discountId: string) => {
    if (!confirm('Are you sure you want to delete this discount?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/discounts/${discountId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchDiscounts()
        toast.success('Discount deleted successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete discount')
      }
    } catch (error) {
      toast.error('Failed to delete discount')
    } finally {
      setLoading(false)
    }
  }

  const toggleDiscountStatus = async (discountId: string, isActive: boolean) => {
    await handleUpdateDiscount(discountId, { isActive })
  }

  const getDiscountTypeIcon = (type: string) => {
    switch (type) {
      case 'PERCENTAGE': return <Percent className="w-4 h-4" />
      case 'FIXED': return <DollarSign className="w-4 h-4" />
      case 'BOGO': return <Tag className="w-4 h-4" />
      case 'FREE_SHIPPING': return <ShoppingCart className="w-4 h-4" />
      default: return <Tag className="w-4 h-4" />
    }
  }

  const getDiscountTypeLabel = (type: string) => {
    switch (type) {
      case 'PERCENTAGE': return 'Percentage'
      case 'FIXED': return 'Fixed Amount'
      case 'BOGO': return 'Buy One Get One'
      case 'FREE_SHIPPING': return 'Free Shipping'
      default: return type
    }
  }

  const getDiscountValueDisplay = (discount: DiscountRule) => {
    if (discount.type === 'PERCENTAGE') {
      return `${discount.value}%`
    } else if (discount.type === 'FIXED') {
      return `₹${discount.value}`
    } else if (discount.type === 'BOGO') {
      return 'BOGO'
    } else {
      return 'Free'
    }
  }

  const isDiscountActive = (discount: DiscountRule) => {
    const now = new Date()
    if (!discount.isActive) return false
    if (discount.startDate && now < discount.startDate) return false
    if (discount.endDate && now > discount.endDate) return false
    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) return false
    return true
  }

  const getDiscountStatus = (discount: DiscountRule) => {
    if (!discount.isActive) return { label: 'Inactive', variant: 'secondary' as const }
    if (discount.startDate && new Date() < discount.startDate) return { label: 'Scheduled', variant: 'outline' as const }
    if (discount.endDate && new Date() > discount.endDate) return { label: 'Expired', variant: 'destructive' as const }
    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) return { label: 'Usage Limit Reached', variant: 'destructive' as const }
    return { label: 'Active', variant: 'default' as const }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Discount Management</h2>
          <p className="text-muted-foreground">
            Create and manage discount rules for your restaurant
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Discount
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Discount</DialogTitle>
              <DialogDescription>
                Create a new discount rule with custom conditions
              </DialogDescription>
            </DialogHeader>
            <DiscountForm
              onSubmit={handleCreateDiscount}
              onCancel={() => setIsCreating(false)}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active Discounts</TabsTrigger>
          <TabsTrigger value="all">All Discounts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {discounts.filter(isDiscountActive).map((discount) => (
              <DiscountCard
                key={discount.id}
                discount={discount}
                onEdit={() => {
                  setSelectedDiscount(discount)
                  setIsEditing(true)
                }}
                onDelete={() => handleDeleteDiscount(discount.id)}
                onToggleStatus={(isActive) => toggleDiscountStatus(discount.id, isActive)}
              />
            ))}
            {discounts.filter(isDiscountActive).length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">No active discounts found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {discounts.map((discount) => (
              <DiscountCard
                key={discount.id}
                discount={discount}
                onEdit={() => {
                  setSelectedDiscount(discount)
                  setIsEditing(true)
                }}
                onDelete={() => handleDeleteDiscount(discount.id)}
                onToggleStatus={(isActive) => toggleDiscountStatus(discount.id, isActive)}
              />
            ))}
            {discounts.length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">No discounts found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Discount Analytics</CardTitle>
              <CardDescription>
                View performance metrics for your discounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Analytics dashboard will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Discount</DialogTitle>
            <DialogDescription>
              Update discount rule and conditions
            </DialogDescription>
          </DialogHeader>
          {selectedDiscount && (
            <DiscountForm
              initialData={selectedDiscount}
              onSubmit={(data) => handleUpdateDiscount(selectedDiscount.id, data)}
              onCancel={() => setIsEditing(false)}
              loading={loading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface DiscountCardProps {
  discount: DiscountRule
  onEdit: () => void
  onDelete: () => void
  onToggleStatus: (isActive: boolean) => void
}

function DiscountCard({ discount, onEdit, onDelete, onToggleStatus }: DiscountCardProps) {
  const status = getDiscountStatus(discount)
  const isActive = isDiscountActive(discount)

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {getDiscountTypeIcon(discount.type)}
              <h3 className="text-lg font-semibold">{discount.name}</h3>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            
            {discount.description && (
              <p className="text-sm text-muted-foreground">{discount.description}</p>
            )}
            
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium">{getDiscountValueDisplay(discount)}</span>
              {discount.minPurchaseAmount && (
                <span>Min: ₹{discount.minPurchaseAmount}</span>
              )}
              {discount.usageLimit && (
                <span>Used: {discount.usedCount}/{discount.usageLimit}</span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {discount.startDate && (
                <span>Starts: {format(new Date(discount.startDate), 'MMM dd, yyyy')}</span>
              )}
              {discount.endDate && (
                <span>Ends: {format(new Date(discount.endDate), 'MMM dd, yyyy')}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={discount.isActive}
              onCheckedChange={onToggleStatus}
            />
            <Button size="sm" variant="outline" onClick={onEdit}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="destructive" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface DiscountFormProps {
  initialData?: DiscountRule
  onSubmit: (data: any) => void
  onCancel: () => void
  loading?: boolean
}

function DiscountForm({ initialData, onSubmit, onCancel, loading = false }: DiscountFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    type: initialData?.type || 'PERCENTAGE',
    value: initialData?.value || 0,
    minPurchaseAmount: initialData?.minPurchaseAmount || 0,
    maxDiscountAmount: initialData?.maxDiscountAmount || 0,
    usageLimit: initialData?.usageLimit || null,
    startDate: initialData?.startDate ? format(new Date(initialData.startDate), 'yyyy-MM-dd') : '',
    endDate: initialData?.endDate ? format(new Date(initialData.endDate), 'yyyy-MM-dd') : '',
    isActive: initialData?.isActive ?? true,
    conditions: initialData?.conditions || {},
    targetCustomers: initialData?.targetCustomers || {}
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      usageLimit: formData.usageLimit || undefined
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="discount-name">Discount Name</Label>
          <Input
            id="discount-name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="discount-type">Discount Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERCENTAGE">Percentage</SelectItem>
              <SelectItem value="FIXED">Fixed Amount</SelectItem>
              <SelectItem value="BOGO">Buy One Get One</SelectItem>
              <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="discount-value">
            {formData.type === 'PERCENTAGE' ? 'Discount Percentage' : 'Discount Amount (₹)'}
          </Label>
          <Input
            id="discount-value"
            type="number"
            min="0"
            max={formData.type === 'PERCENTAGE' ? 100 : undefined}
            step={formData.type === 'PERCENTAGE' ? 1 : 0.01}
            value={formData.value}
            onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="min-purchase">Minimum Purchase Amount (₹)</Label>
          <Input
            id="min-purchase"
            type="number"
            min="0"
            step="0.01"
            value={formData.minPurchaseAmount}
            onChange={(e) => setFormData(prev => ({ ...prev, minPurchaseAmount: parseFloat(e.target.value) }))}
          />
        </div>

        <div>
          <Label htmlFor="max-discount">Maximum Discount Amount (₹)</Label>
          <Input
            id="max-discount"
            type="number"
            min="0"
            step="0.01"
            value={formData.maxDiscountAmount}
            onChange={(e) => setFormData(prev => ({ ...prev, maxDiscountAmount: parseFloat(e.target.value) }))}
          />
        </div>

        <div>
          <Label htmlFor="usage-limit">Usage Limit (Optional)</Label>
          <Input
            id="usage-limit"
            type="number"
            min="1"
            value={formData.usageLimit || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: e.target.value ? parseInt(e.target.value) : null }))}
          />
        </div>

        <div>
          <Label htmlFor="start-date">Start Date (Optional)</Label>
          <Input
            id="start-date"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="end-date">End Date (Optional)</Label>
          <Input
            id="end-date"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="discount-description">Description</Label>
        <Textarea
          id="discount-description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="is-active">Active</Label>
        <Switch
          id="is-active"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (initialData ? 'Update Discount' : 'Create Discount')}
        </Button>
      </div>
    </form>
  )
}

// Helper functions
function getDiscountStatus(discount: DiscountRule) {
  if (!discount.isActive) return { label: 'Inactive', variant: 'secondary' as const }
  if (discount.startDate && new Date() < discount.startDate) return { label: 'Scheduled', variant: 'outline' as const }
  if (discount.endDate && new Date() > discount.endDate) return { label: 'Expired', variant: 'destructive' as const }
  if (discount.usageLimit && discount.usedCount >= discount.usageLimit) return { label: 'Usage Limit Reached', variant: 'destructive' as const }
  return { label: 'Active', variant: 'default' as const }
}

function isDiscountActive(discount: DiscountRule) {
  const now = new Date()
  if (!discount.isActive) return false
  if (discount.startDate && now < discount.startDate) return false
  if (discount.endDate && now > discount.endDate) return false
  if (discount.usageLimit && discount.usedCount >= discount.usageLimit) return false
  return true
}