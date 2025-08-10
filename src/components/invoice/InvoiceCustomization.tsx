'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ColorPicker } from '@/components/ui/color-picker'
import { Upload, Download, Trash2, Plus, Edit, Save, Eye, Palette, Settings } from 'lucide-react'
import { toast } from 'sonner'

interface InvoiceTemplate {
  id: string
  name: string
  template: string
  isDefault: boolean
  customizations: any
  createdAt: string
  updatedAt: string
}

interface InvoiceSettings {
  headerColor: string
  accentColor: string
  showGST: boolean
  showDiscount: boolean
  showQRCode: boolean
  showBarcode: boolean
  customHeader: string
  customFooter: string
  fontSize: number
  fontFamily: string
  paperSize: string
  orientation: string
}

interface InvoiceCustomizationProps {
  restaurantId: string
}

export default function InvoiceCustomization({ restaurantId }: InvoiceCustomizationProps) {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([])
  const [businessSettings, setBusinessSettings] = useState<any>({})
  const [logo, setLogo] = useState<string | null>(null)
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>({
    headerColor: '#000000',
    accentColor: '#4f46e5',
    showGST: true,
    showDiscount: true,
    showQRCode: false,
    showBarcode: false,
    customHeader: '',
    customFooter: '',
    fontSize: 12,
    fontFamily: 'Courier New',
    paperSize: 'A4',
    orientation: 'portrait'
  })
  const [selectedTemplate, setSelectedTemplate] = useState<InvoiceTemplate | null>(null)
  const [isEditingTemplate, setIsEditingTemplate] = useState(false)
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  // Fetch templates and settings
  useEffect(() => {
    fetchTemplatesAndSettings()
  }, [restaurantId])

  const fetchTemplatesAndSettings = async () => {
    try {
      const response = await fetch(`/api/invoices/templates?restaurantId=${restaurantId}`)
      const data = await response.json()
      
      if (data.templates) {
        setTemplates(data.templates)
        const defaultTemplate = data.templates.find((t: InvoiceTemplate) => t.isDefault)
        setSelectedTemplate(defaultTemplate || data.templates[0] || null)
      }
      
      if (data.businessSettings) {
        setBusinessSettings(data.businessSettings)
        setInvoiceSettings(prev => ({ ...prev, ...data.businessSettings }))
      }
      
      if (data.defaultLogo) {
        setLogo(data.defaultLogo)
      }
    } catch (error) {
      toast.error('Failed to fetch invoice settings')
    }
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    const formData = new FormData()
    formData.append('logo', file)
    formData.append('restaurantId', restaurantId)

    try {
      const response = await fetch('/api/invoices/logo', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (response.ok) {
        setLogo(data.logoUrl)
        toast.success('Logo uploaded successfully')
      } else {
        toast.error(data.error || 'Failed to upload logo')
      }
    } catch (error) {
      toast.error('Failed to upload logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleLogoRemove = async () => {
    try {
      const response = await fetch(`/api/invoices/logo?restaurantId=${restaurantId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setLogo(null)
        toast.success('Logo removed successfully')
      } else {
        toast.error('Failed to remove logo')
      }
    } catch (error) {
      toast.error('Failed to remove logo')
    }
  }

  const handleSettingsSave = async () => {
    try {
      const response = await fetch('/api/invoices/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          invoiceSettings
        })
      })

      if (response.ok) {
        toast.success('Invoice settings saved successfully')
      } else {
        toast.error('Failed to save settings')
      }
    } catch (error) {
      toast.error('Failed to save settings')
    }
  }

  const handleTemplateCreate = async (templateData: any) => {
    try {
      const response = await fetch('/api/invoices/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          ...templateData
        })
      })

      if (response.ok) {
        await fetchTemplatesAndSettings()
        setIsCreatingTemplate(false)
        toast.success('Template created successfully')
      } else {
        toast.error('Failed to create template')
      }
    } catch (error) {
      toast.error('Failed to create template')
    }
  }

  const handleTemplateUpdate = async (templateId: string, updates: any) => {
    try {
      const response = await fetch(`/api/invoices/templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        await fetchTemplatesAndSettings()
        setIsEditingTemplate(false)
        toast.success('Template updated successfully')
      } else {
        toast.error('Failed to update template')
      }
    } catch (error) {
      toast.error('Failed to update template')
    }
  }

  const handleTemplateDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const response = await fetch(`/api/invoices/templates/${templateId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchTemplatesAndSettings()
        toast.success('Template deleted successfully')
      } else {
        toast.error('Failed to delete template')
      }
    } catch (error) {
      toast.error('Failed to delete template')
    }
  }

  const handleSetDefaultTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/invoices/templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true })
      })

      if (response.ok) {
        await fetchTemplatesAndSettings()
        toast.success('Default template updated')
      } else {
        toast.error('Failed to set default template')
      }
    } catch (error) {
      toast.error('Failed to set default template')
    }
  }

  const generatePreview = () => {
    // This would generate a preview of the invoice with current settings
    // For now, we'll just open a preview dialog
    setPreviewMode(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Invoice Customization</h2>
          <p className="text-muted-foreground">
            Customize your invoice templates, upload logos, and configure invoice settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={generatePreview} variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSettingsSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="logo">Logo & Branding</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Invoice Templates
              </CardTitle>
              <CardDescription>
                Manage your invoice templates and customize their appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {templates.map((template) => (
                    <Button
                      key={template.id}
                      variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      {template.name}
                      {template.isDefault && <Badge className="ml-2" variant="secondary">Default</Badge>}
                    </Button>
                  ))}
                </div>
                <Dialog open={isCreatingTemplate} onOpenChange={setIsCreatingTemplate}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      New Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Template</DialogTitle>
                      <DialogDescription>
                        Create a new invoice template with custom settings
                      </DialogDescription>
                    </DialogHeader>
                    <TemplateForm
                      onSubmit={handleTemplateCreate}
                      onCancel={() => setIsCreatingTemplate(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {selectedTemplate && (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg">{selectedTemplate.name}</CardTitle>
                        {selectedTemplate.isDefault && (
                          <Badge variant="secondary">Default Template</Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Dialog open={isEditingTemplate} onOpenChange={setIsEditingTemplate}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Template</DialogTitle>
                              <DialogDescription>
                                Update template settings and customizations
                              </DialogDescription>
                            </DialogHeader>
                            <TemplateForm
                              initialData={selectedTemplate}
                              onSubmit={(data) => handleTemplateUpdate(selectedTemplate.id, data)}
                              onCancel={() => setIsEditingTemplate(false)}
                            />
                          </DialogContent>
                        </Dialog>
                        {!selectedTemplate.isDefault && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetDefaultTemplate(selectedTemplate.id)}
                          >
                            Set as Default
                          </Button>
                        )}
                        {templates.length > 1 && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleTemplateDelete(selectedTemplate.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Template:</strong> {selectedTemplate.template}
                      </div>
                      <div>
                        <strong>Created:</strong> {new Date(selectedTemplate.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="mt-4">
                      <strong>Customizations:</strong>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                        {JSON.stringify(selectedTemplate.customizations, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Logo & Branding
              </CardTitle>
              <CardDescription>
                Upload your business logo and manage branding elements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="logo-upload">Business Logo</Label>
                  <div className="mt-2 flex items-center gap-4">
                    {logo ? (
                      <div className="relative">
                        <img
                          src={logo}
                          alt="Business Logo"
                          className="w-32 h-32 object-contain border rounded"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2"
                          onClick={handleLogoRemove}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 border-2 border-dashed border-muted-foreground/25 rounded flex items-center justify-center">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                      />
                      <p className="text-sm text-muted-foreground">
                        Upload your business logo (JPG, PNG, GIF, WebP - max 5MB)
                      </p>
                      {uploadingLogo && (
                        <p className="text-sm text-blue-600">Uploading...</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Invoice Settings
              </CardTitle>
              <CardDescription>
                Configure general invoice settings and display options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="header-color">Header Color</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        id="header-color"
                        type="color"
                        value={invoiceSettings.headerColor}
                        onChange={(e) => setInvoiceSettings(prev => ({ ...prev, headerColor: e.target.value }))}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={invoiceSettings.headerColor}
                        onChange={(e) => setInvoiceSettings(prev => ({ ...prev, headerColor: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="accent-color">Accent Color</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        id="accent-color"
                        type="color"
                        value={invoiceSettings.accentColor}
                        onChange={(e) => setInvoiceSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={invoiceSettings.accentColor}
                        onChange={(e) => setInvoiceSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="font-size">Font Size</Label>
                    <Input
                      id="font-size"
                      type="number"
                      value={invoiceSettings.fontSize}
                      onChange={(e) => setInvoiceSettings(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                      min="8"
                      max="24"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="font-family">Font Family</Label>
                    <Select
                      value={invoiceSettings.fontFamily}
                      onValueChange={(value) => setInvoiceSettings(prev => ({ ...prev, fontFamily: value }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Courier New">Courier New</SelectItem>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                        <SelectItem value="Helvetica">Helvetica</SelectItem>
                        <SelectItem value="Georgia">Georgia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="paper-size">Paper Size</Label>
                    <Select
                      value={invoiceSettings.paperSize}
                      onValueChange={(value) => setInvoiceSettings(prev => ({ ...prev, paperSize: value }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A4">A4</SelectItem>
                        <SelectItem value="A5">A5</SelectItem>
                        <SelectItem value="Letter">Letter</SelectItem>
                        <SelectItem value="Legal">Legal</SelectItem>
                        <SelectItem value="Thermal">Thermal (80mm)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="orientation">Orientation</Label>
                    <Select
                      value={invoiceSettings.orientation}
                      onValueChange={(value) => setInvoiceSettings(prev => ({ ...prev, orientation: value }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Portrait</SelectItem>
                        <SelectItem value="landscape">Landscape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-gst">Show GST Details</Label>
                      <Switch
                        id="show-gst"
                        checked={invoiceSettings.showGST}
                        onCheckedChange={(checked) => setInvoiceSettings(prev => ({ ...prev, showGST: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-discount">Show Discount</Label>
                      <Switch
                        id="show-discount"
                        checked={invoiceSettings.showDiscount}
                        onCheckedChange={(checked) => setInvoiceSettings(prev => ({ ...prev, showDiscount: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-qrcode">Show QR Code</Label>
                      <Switch
                        id="show-qrcode"
                        checked={invoiceSettings.showQRCode}
                        onCheckedChange={(checked) => setInvoiceSettings(prev => ({ ...prev, showQRCode: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-barcode">Show Barcode</Label>
                      <Switch
                        id="show-barcode"
                        checked={invoiceSettings.showBarcode}
                        onCheckedChange={(checked) => setInvoiceSettings(prev => ({ ...prev, showBarcode: checked }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="custom-header">Custom Header</Label>
                  <Textarea
                    id="custom-header"
                    placeholder="Enter custom header text or HTML"
                    value={invoiceSettings.customHeader}
                    onChange={(e) => setInvoiceSettings(prev => ({ ...prev, customHeader: e.target.value }))}
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="custom-footer">Custom Footer</Label>
                  <Textarea
                    id="custom-footer"
                    placeholder="Enter custom footer text or HTML"
                    value={invoiceSettings.customFooter}
                    onChange={(e) => setInvoiceSettings(prev => ({ ...prev, customFooter: e.target.value }))}
                    className="mt-2"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Advanced invoice customization options and export settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Advanced features like custom CSS, invoice numbering patterns, and export formats will be available here.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={previewMode} onOpenChange={setPreviewMode}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
            <DialogDescription>
              Preview of your invoice with current settings
            </DialogDescription>
          </DialogHeader>
          <div className="border rounded p-4 bg-white">
            <p className="text-center text-muted-foreground">Invoice preview will be shown here</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface TemplateFormProps {
  initialData?: InvoiceTemplate
  onSubmit: (data: any) => void
  onCancel: () => void
}

function TemplateForm({ initialData, onSubmit, onCancel }: TemplateFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    template: initialData?.template || 'default',
    isDefault: initialData?.isDefault || false,
    customizations: initialData?.customizations || {}
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="template-name">Template Name</Label>
        <Input
          id="template-name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="template-type">Template Type</Label>
        <Select
          value={formData.template}
          onValueChange={(value) => setFormData(prev => ({ ...prev, template: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="modern">Modern</SelectItem>
            <SelectItem value="classic">Classic</SelectItem>
            <SelectItem value="minimal">Minimal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="is-default">Set as Default Template</Label>
        <Switch
          id="is-default"
          checked={formData.isDefault}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: checked }))}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </form>
  )
}