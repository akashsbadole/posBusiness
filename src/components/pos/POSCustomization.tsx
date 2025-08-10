"use client"

import { useState, useEffect } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  GripVertical, 
  Plus, 
  Trash2, 
  Settings, 
  Save,
  Eye,
  EyeOff,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  Package,
  User,
  Building,
  Star,
  Scissors,
  Pill,
  Dumbbell,
  Stethoscope,
  Coffee,
  Wine,
  ShoppingCart,
  Utensils
} from 'lucide-react'
import { SortableField } from './SortableField'
import { PermissionGuard } from '@/components/auth/PermissionGuard'
import { Module, PermissionAction, RoleLevel } from '@prisma/client'
import { useBusinessSettings } from '@/hooks/use-business-settings'

interface POSField {
  id: string
  name: string
  label: string
  type: 'text' | 'number' | 'email' | 'phone' | 'date' | 'time' | 'select' | 'textarea' | 'checkbox'
  required: boolean
  visible: boolean
  order: number
  placeholder?: string
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
  businessTypes: string[]
  icon?: React.ReactNode
}

interface POSLayout {
  id: string
  name: string
  businessType: string
  fields: POSField[]
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

const defaultFields: POSField[] = [
  {
    id: 'customer_name',
    name: 'customerName',
    label: 'Customer Name',
    type: 'text',
    required: true,
    visible: true,
    order: 1,
    placeholder: 'Enter customer name',
    businessTypes: ['all'],
    icon: <User className="h-4 w-4" />
  },
  {
    id: 'customer_phone',
    name: 'customerPhone',
    label: 'Phone Number',
    type: 'phone',
    required: true,
    visible: true,
    order: 2,
    placeholder: 'Enter phone number',
    businessTypes: ['all'],
    icon: <Phone className="h-4 w-4" />
  },
  {
    id: 'customer_email',
    name: 'customerEmail',
    label: 'Email Address',
    type: 'email',
    required: false,
    visible: true,
    order: 3,
    placeholder: 'Enter email address',
    businessTypes: ['all'],
    icon: <Mail className="h-4 w-4" />
  },
  {
    id: 'delivery_address',
    name: 'deliveryAddress',
    label: 'Delivery Address',
    type: 'textarea',
    required: false,
    visible: true,
    order: 4,
    placeholder: 'Enter delivery address',
    businessTypes: ['restaurant', 'retail', 'cafe', 'pharmacy', 'grocery'],
    icon: <MapPin className="h-4 w-4" />
  },
  {
    id: 'appointment_date',
    name: 'appointmentDate',
    label: 'Appointment Date',
    type: 'date',
    required: true,
    visible: true,
    order: 5,
    businessTypes: ['salon', 'spa', 'clinic', 'gym'],
    icon: <Calendar className="h-4 w-4" />
  },
  {
    id: 'appointment_time',
    name: 'appointmentTime',
    label: 'Appointment Time',
    type: 'time',
    required: true,
    visible: true,
    order: 6,
    businessTypes: ['salon', 'spa', 'clinic', 'gym'],
    icon: <Clock className="h-4 w-4" />
  },
  {
    id: 'table_number',
    name: 'tableNumber',
    label: 'Table Number',
    type: 'number',
    required: true,
    visible: true,
    order: 7,
    placeholder: 'Enter table number',
    businessTypes: ['restaurant', 'cafe', 'bar', 'hotel'],
    icon: <Building className="h-4 w-4" />
  },
  {
    id: 'room_number',
    name: 'roomNumber',
    label: 'Room Number',
    type: 'text',
    required: true,
    visible: true,
    order: 8,
    placeholder: 'Enter room number',
    businessTypes: ['hotel'],
    icon: <Building className="h-4 w-4" />
  },
  {
    id: 'prescription_id',
    name: 'prescriptionId',
    label: 'Prescription ID',
    type: 'text',
    required: true,
    visible: true,
    order: 9,
    placeholder: 'Enter prescription ID',
    businessTypes: ['pharmacy', 'clinic'],
    icon: <Pill className="h-4 w-4" />
  },
  {
    id: 'service_type',
    name: 'serviceType',
    label: 'Service Type',
    type: 'select',
    required: true,
    visible: true,
    order: 10,
    options: ['Haircut', 'Styling', 'Coloring', 'Treatment'],
    businessTypes: ['salon', 'spa'],
    icon: <Scissors className="h-4 w-4" />
  },
  {
    id: 'membership_id',
    name: 'membershipId',
    label: 'Membership ID',
    type: 'text',
    required: false,
    visible: true,
    order: 11,
    placeholder: 'Enter membership ID',
    businessTypes: ['gym', 'spa'],
    icon: <Star className="h-4 w-4" />
  },
  {
    id: 'special_instructions',
    name: 'specialInstructions',
    label: 'Special Instructions',
    type: 'textarea',
    required: false,
    visible: true,
    order: 12,
    placeholder: 'Enter any special instructions',
    businessTypes: ['all'],
    icon: <Package className="h-4 w-4" />
  }
]

const businessTypeOptions = [
  { value: 'restaurant', label: 'Restaurant', icon: <Utensils className="h-4 w-4" /> },
  { value: 'retail', label: 'Retail Store', icon: <ShoppingCart className="h-4 w-4" /> },
  { value: 'cafe', label: 'Cafe', icon: <Coffee className="h-4 w-4" /> },
  { value: 'hotel', label: 'Hotel', icon: <Building className="h-4 w-4" /> },
  { value: 'bar', label: 'Bar', icon: <Wine className="h-4 w-4" /> },
  { value: 'ecommerce', label: 'E-commerce', icon: <ShoppingCart className="h-4 w-4" /> },
  { value: 'salon', label: 'Salon', icon: <Scissors className="h-4 w-4" /> },
  { value: 'spa', label: 'Spa', icon: <Star className="h-4 w-4" /> },
  { value: 'pharmacy', label: 'Pharmacy', icon: <Pill className="h-4 w-4" /> },
  { value: 'grocery', label: 'Grocery Store', icon: <ShoppingCart className="h-4 w-4" /> },
  { value: 'food_truck', label: 'Food Truck', icon: <Package className="h-4 w-4" /> },
  { value: 'gym', label: 'Gym', icon: <Dumbbell className="h-4 w-4" /> },
  { value: 'clinic', label: 'Clinic', icon: <Stethoscope className="h-4 w-4" /> }
]

export default function POSCustomization() {
  const [selectedBusinessType, setSelectedBusinessType] = useState('restaurant')
  const [fields, setFields] = useState<POSField[]>([])
  const [layouts, setLayouts] = useState<POSLayout[]>([])
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false)
  const [newField, setNewField] = useState<Partial<POSField>>({
    name: '',
    label: '',
    type: 'text',
    required: false,
    visible: true,
    businessTypes: ['all'],
    placeholder: '',
    options: []
  })
  const [activeLayout, setActiveLayout] = useState('default')
  const [hasChanges, setHasChanges] = useState(false)

  const { data: businessSettings } = useBusinessSettings()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    // Load fields for selected business type
    const filteredFields = defaultFields.filter(field => 
      field.businessTypes.includes('all') || 
      field.businessTypes.includes(selectedBusinessType)
    )
    setFields(filteredFields.sort((a, b) => a.order - b.order))
  }, [selectedBusinessType])

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over.id)

        const reorderedFields = arrayMove(items, oldIndex, newIndex)
        const updatedFields = reorderedFields.map((field, index) => ({
          ...field,
          order: index + 1
        }))
        
        setHasChanges(true)
        return updatedFields
      })
    }
  }

  const toggleFieldVisibility = (fieldId: string) => {
    setFields(fields.map(field => 
      field.id === fieldId 
        ? { ...field, visible: !field.visible }
        : field
    ))
    setHasChanges(true)
  }

  const toggleFieldRequired = (fieldId: string) => {
    setFields(fields.map(field => 
      field.id === fieldId 
        ? { ...field, required: !field.required }
        : field
    ))
    setHasChanges(true)
  }

  const addCustomField = () => {
    if (!newField.name || !newField.label) return

    const customField: POSField = {
      id: `custom_${Date.now()}`,
      name: newField.name!,
      label: newField.label!,
      type: newField.type!,
      required: newField.required || false,
      visible: newField.visible !== false,
      order: fields.length + 1,
      placeholder: newField.placeholder,
      options: newField.options,
      businessTypes: newField.businessTypes || ['all'],
      validation: newField.validation
    }

    setFields([...fields, customField])
    setNewField({
      name: '',
      label: '',
      type: 'text',
      required: false,
      visible: true,
      businessTypes: ['all'],
      placeholder: '',
      options: []
    })
    setIsAddFieldDialogOpen(false)
    setHasChanges(true)
  }

  const removeField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId))
    setHasChanges(true)
  }

  const saveLayout = async () => {
    try {
      const layout: POSLayout = {
        id: activeLayout,
        name: `${selectedBusinessType.charAt(0).toUpperCase() + selectedBusinessType.slice(1)} Layout`,
        businessType: selectedBusinessType,
        fields: fields,
        isDefault: activeLayout === 'default',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const response = await fetch('/api/pos-layouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(layout),
      })

      if (response.ok) {
        setHasChanges(false)
        // Show success message
      }
    } catch (error) {
      console.error('Error saving layout:', error)
    }
  }

  const resetToDefault = () => {
    const defaultFieldsForType = defaultFields.filter(field => 
      field.businessTypes.includes('all') || 
      field.businessTypes.includes(selectedBusinessType)
    )
    setFields(defaultFieldsForType.sort((a, b) => a.order - b.order))
    setHasChanges(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            POS Customization
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Customize your POS interface with drag-and-drop fields
          </p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button onClick={saveLayout} className="bg-green-600 hover:bg-green-700">
              <Save className="mr-2 h-4 w-4" />
              Save Layout
            </Button>
          )}
          <Button variant="outline" onClick={resetToDefault}>
            Reset to Default
          </Button>
        </div>
      </div>

      <PermissionGuard 
        permission={{ 
          module: Module.SETTINGS, 
          action: PermissionAction.UPDATE 
        }}
        fallback={
          <Alert>
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You need super admin or admin privileges to customize POS fields.
            </AlertDescription>
          </Alert>
        }
      >
        <Tabs defaultValue="fields" className="space-y-4">
          <TabsList>
            <TabsTrigger value="fields">Field Management</TabsTrigger>
            <TabsTrigger value="layouts">Layout Templates</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="fields" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Business Type</CardTitle>
                <CardDescription>
                  Select the business type to customize its POS fields
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedBusinessType} onValueChange={setSelectedBusinessType}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          {option.icon}
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>POS Fields</CardTitle>
                    <CardDescription>
                      Drag and drop to reorder fields. Toggle visibility and requirements.
                    </CardDescription>
                  </div>
                  <Dialog open={isAddFieldDialogOpen} onOpenChange={setIsAddFieldDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Custom Field
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Custom Field</DialogTitle>
                        <DialogDescription>
                          Create a custom field for your POS interface
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="fieldName">Field Name</Label>
                          <Input
                            id="fieldName"
                            value={newField.name || ''}
                            onChange={(e) => setNewField({...newField, name: e.target.value})}
                            placeholder="e.g., customerNotes"
                          />
                        </div>
                        <div>
                          <Label htmlFor="fieldLabel">Field Label</Label>
                          <Input
                            id="fieldLabel"
                            value={newField.label || ''}
                            onChange={(e) => setNewField({...newField, label: e.target.value})}
                            placeholder="e.g., Customer Notes"
                          />
                        </div>
                        <div>
                          <Label htmlFor="fieldType">Field Type</Label>
                          <Select 
                            value={newField.type} 
                            onValueChange={(value) => setNewField({...newField, type: value as any})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="phone">Phone</SelectItem>
                              <SelectItem value="date">Date</SelectItem>
                              <SelectItem value="time">Time</SelectItem>
                              <SelectItem value="select">Select</SelectItem>
                              <SelectItem value="textarea">Textarea</SelectItem>
                              <SelectItem value="checkbox">Checkbox</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="placeholder">Placeholder</Label>
                          <Input
                            id="placeholder"
                            value={newField.placeholder || ''}
                            onChange={(e) => setNewField({...newField, placeholder: e.target.value})}
                            placeholder="Enter placeholder text"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddFieldDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={addCustomField}>Add Field</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                  modifiers={[restrictToVerticalAxis]}
                >
                  <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {fields.map((field) => (
                        <SortableField
                          key={field.id}
                          field={field}
                          onToggleVisibility={toggleFieldVisibility}
                          onToggleRequired={toggleFieldRequired}
                          onRemove={removeField}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="layouts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Saved Layouts</CardTitle>
                <CardDescription>
                  Manage your saved POS layout templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {layouts.map((layout) => (
                    <Card key={layout.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{layout.name}</CardTitle>
                        <div className="flex gap-2">
                          <Badge variant="secondary">{layout.businessType}</Badge>
                          {layout.isDefault && <Badge variant="default">Default</Badge>}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {layout.fields.length} fields
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Updated {new Date(layout.updatedAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>POS Preview</CardTitle>
                <CardDescription>
                  Preview how your POS interface will look with the current field layout
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">
                    {businessTypeOptions.find(b => b.value === selectedBusinessType)?.label} POS Form
                  </h3>
                  <div className="space-y-4">
                    {fields.filter(f => f.visible).map((field) => (
                      <div key={field.id} className="space-y-2">
                        <Label className="flex items-center gap-2">
                          {field.icon}
                          {field.label}
                          {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        {field.type === 'select' ? (
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options?.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : field.type === 'textarea' ? (
                          <Textarea
                            placeholder={field.placeholder}
                            required={field.required}
                          />
                        ) : field.type === 'checkbox' ? (
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" required={field.required} />
                            <Label>{field.label}</Label>
                          </div>
                        ) : (
                          <Input
                            type={field.type}
                            placeholder={field.placeholder}
                            required={field.required}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PermissionGuard>
    </div>
  )
}