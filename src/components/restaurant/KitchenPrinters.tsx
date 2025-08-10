"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Printer, 
  Settings, 
  Plus, 
  Trash2, 
  TestTube, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface KitchenPrinter {
  id: string
  name: string
  type: 'thermal' | 'inkjet' | 'laser'
  connection: 'ethernet' | 'bluetooth' | 'usb'
  ipAddress?: string
  macAddress?: string
  status: 'online' | 'offline' | 'error'
  paperSize: '80mm' | '58mm' | 'A4'
  autoCut: boolean
  kitchenStation: string
  isActive: boolean
  lastUsed: Date
  testPrintStatus?: 'success' | 'failed' | 'printing'
}

interface KitchenStation {
  id: string
  name: string
  description: string
  printerId?: string
  isActive: boolean
}

export default function KitchenPrinters() {
  const [printers, setPrinters] = useState<KitchenPrinter[]>([
    {
      id: '1',
      name: 'Main Kitchen Printer',
      type: 'thermal',
      connection: 'ethernet',
      ipAddress: '192.168.1.100',
      status: 'online',
      paperSize: '80mm',
      autoCut: true,
      kitchenStation: 'main_kitchen',
      isActive: true,
      lastUsed: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: '2',
      name: 'Bar Printer',
      type: 'thermal',
      connection: 'bluetooth',
      macAddress: '00:1B:44:11:3A:B7',
      status: 'offline',
      paperSize: '58mm',
      autoCut: false,
      kitchenStation: 'bar',
      isActive: false,
      lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000)
    }
  ])

  const [stations, setStations] = useState<KitchenStation[]>([
    {
      id: 'main_kitchen',
      name: 'Main Kitchen',
      description: 'Hot food preparation area',
      printerId: '1',
      isActive: true
    },
    {
      id: 'bar',
      name: 'Bar',
      description: 'Beverage preparation area',
      printerId: '2',
      isActive: true
    },
    {
      id: 'dessert',
      name: 'Dessert Station',
      description: 'Dessert and sweet preparation',
      isActive: false
    }
  ])

  const [isAddingPrinter, setIsAddingPrinter] = useState(false)
  const [newPrinter, setNewPrinter] = useState<Partial<KitchenPrinter>>({
    name: '',
    type: 'thermal',
    connection: 'ethernet',
    paperSize: '80mm',
    autoCut: true,
    kitchenStation: '',
    isActive: true
  })
  const [isAddingStation, setIsAddingStation] = useState(false)
  const [newStation, setNewStation] = useState<Partial<KitchenStation>>({
    name: '',
    description: '',
    isActive: true
  })
  const { toast } = useToast()

  const handleTestPrint = async (printerId: string) => {
    setPrinters(prev => prev.map(p => 
      p.id === printerId ? { ...p, testPrintStatus: 'printing' } : p
    ))

    // Simulate test print
    setTimeout(() => {
      const success = Math.random() > 0.3 // 70% success rate
      setPrinters(prev => prev.map(p => 
        p.id === printerId ? { 
          ...p, 
          testPrintStatus: success ? 'success' : 'failed',
          lastUsed: new Date()
        } : p
      ))

      toast({
        title: success ? "Test Print Successful" : "Test Print Failed",
        description: success 
          ? "Test page printed successfully from kitchen printer."
          : "Failed to print test page. Check printer connection.",
        variant: success ? "default" : "destructive"
      })
    }, 2000)
  }

  const handleAddPrinter = () => {
    if (!newPrinter.name || !newPrinter.kitchenStation) {
      toast({
        title: "Validation Error",
        description: "Printer name and kitchen station are required.",
        variant: "destructive"
      })
      return
    }

    const printer: KitchenPrinter = {
      id: Date.now().toString(),
      name: newPrinter.name!,
      type: newPrinter.type!,
      connection: newPrinter.connection!,
      ipAddress: newPrinter.ipAddress,
      macAddress: newPrinter.macAddress,
      status: 'offline',
      paperSize: newPrinter.paperSize!,
      autoCut: newPrinter.autoCut!,
      kitchenStation: newPrinter.kitchenStation!,
      isActive: newPrinter.isActive!,
      lastUsed: new Date()
    }

    setPrinters(prev => [...prev, printer])
    setIsAddingPrinter(false)
    setNewPrinter({
      name: '',
      type: 'thermal',
      connection: 'ethernet',
      paperSize: '80mm',
      autoCut: true,
      kitchenStation: '',
      isActive: true
    })

    toast({
      title: "Printer Added",
      description: "New kitchen printer has been added successfully."
    })
  }

  const handleDeletePrinter = (printerId: string) => {
    setPrinters(prev => prev.filter(p => p.id !== printerId))
    // Update stations that reference this printer
    setStations(prev => prev.map(s => 
      s.printerId === printerId ? { ...s, printerId: undefined } : s
    ))

    toast({
      title: "Printer Removed",
      description: "Kitchen printer has been removed successfully."
    })
  }

  const handleTogglePrinter = (printerId: string) => {
    setPrinters(prev => prev.map(p => 
      p.id === printerId ? { ...p, isActive: !p.isActive } : p
    ))

    const printer = printers.find(p => p.id === printerId)
    toast({
      title: printer?.isActive ? "Printer Disabled" : "Printer Enabled",
      description: `Kitchen printer has been ${printer?.isActive ? 'disabled' : 'enabled'}.`
    })
  }

  const handleAddStation = () => {
    if (!newStation.name) {
      toast({
        title: "Validation Error",
        description: "Station name is required.",
        variant: "destructive"
      })
      return
    }

    const station: KitchenStation = {
      id: newStation.name.toLowerCase().replace(/\s+/g, '_'),
      name: newStation.name!,
      description: newStation.description!,
      isActive: newStation.isActive!
    }

    setStations(prev => [...prev, station])
    setIsAddingStation(false)
    setNewStation({
      name: '',
      description: '',
      isActive: true
    })

    toast({
      title: "Station Added",
      description: "New kitchen station has been added successfully."
    })
  }

  const handleDeleteStation = (stationId: string) => {
    setStations(prev => prev.filter(s => s.id !== stationId))
    // Update printers that reference this station
    setPrinters(prev => prev.map(p => 
      p.kitchenStation === stationId ? { ...p, kitchenStation: '' } : p
    ))

    toast({
      title: "Station Removed",
      description: "Kitchen station has been removed successfully."
    })
  }

  const handleToggleStation = (stationId: string) => {
    setStations(prev => prev.map(s => 
      s.id === stationId ? { ...s, isActive: !s.isActive } : s
    ))

    const station = stations.find(s => s.id === stationId)
    toast({
      title: station?.isActive ? "Station Disabled" : "Station Enabled",
      description: `Kitchen station has been ${station?.isActive ? 'disabled' : 'enabled'}.`
    })
  }

  const handleAssignPrinter = (stationId: string, printerId: string) => {
    setStations(prev => prev.map(s => 
      s.id === stationId ? { ...s, printerId } : s
    ))

    toast({
      title: "Printer Assigned",
      description: "Printer has been assigned to the kitchen station."
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'offline': return 'bg-gray-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getTestPrintStatusIcon = (status?: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />
      case 'printing': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Kitchen Printers</h2>
          <p className="text-gray-600">Manage kitchen printers and stations for order printing</p>
        </div>
        <Button onClick={() => setIsAddingPrinter(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Printer
        </Button>
      </div>

      <Tabs defaultValue="printers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="printers">Printers</TabsTrigger>
          <TabsTrigger value="stations">Kitchen Stations</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="printers" className="space-y-4">
          <div className="grid gap-4">
            {printers.map((printer) => (
              <Card key={printer.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{printer.name}</CardTitle>
                        <Badge className={getStatusColor(printer.status)}>
                          {printer.status}
                        </Badge>
                        {printer.testPrintStatus && (
                          <div className="flex items-center gap-1">
                            {getTestPrintStatusIcon(printer.testPrintStatus)}
                          </div>
                        )}
                      </div>
                      <CardDescription>
                        {printer.type.charAt(0).toUpperCase() + printer.type.slice(1)} printer • {printer.connection} • {printer.paperSize}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={printer.isActive}
                        onCheckedChange={() => handleTogglePrinter(printer.id)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestPrint(printer.id)}
                        disabled={printer.testPrintStatus === 'printing'}
                      >
                        <TestTube className="mr-2 h-4 w-4" />
                        Test Print
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePrinter(printer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Connection</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {printer.connection === 'ethernet' ? (
                          <Wifi className="h-4 w-4 text-green-500" />
                        ) : (
                          <WifiOff className="h-4 w-4 text-gray-500" />
                        )}
                        <span className="capitalize">{printer.connection}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Address</Label>
                      <p className="mt-1">
                        {printer.ipAddress || printer.macAddress || 'Not configured'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Kitchen Station</Label>
                      <p className="mt-1 capitalize">
                        {printer.kitchenStation.replace('_', ' ') || 'Not assigned'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Last Used</Label>
                      <p className="mt-1">
                        {printer.lastUsed.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Kitchen Stations</h3>
            <Button onClick={() => setIsAddingStation(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Station
            </Button>
          </div>

          <div className="grid gap-4">
            {stations.map((station) => (
              <Card key={station.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{station.name}</CardTitle>
                      <CardDescription>{station.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={station.isActive}
                        onCheckedChange={() => handleToggleStation(station.id)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteStation(station.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Assigned Printer</Label>
                      <Select
                        value={station.printerId || ''}
                        onValueChange={(value) => handleAssignPrinter(station.id, value)}
                      >
                        <SelectTrigger className="w-64">
                          <SelectValue placeholder="Select printer" />
                        </SelectTrigger>
                        <SelectContent>
                          {printers
                            .filter(p => p.isActive)
                            .map(printer => (
                              <SelectItem key={printer.id} value={printer.id}>
                                {printer.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      {station.printerId ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">Printer assigned</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-yellow-600">No printer assigned</span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Printer Settings</CardTitle>
              <CardDescription>Configure global printer settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="auto-print">Auto-print Orders</Label>
                  <Switch id="auto-print" defaultChecked />
                  <p className="text-sm text-gray-500">Automatically print orders when they are created</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="print-receipts">Include Receipts</Label>
                  <Switch id="print-receipts" defaultChecked />
                  <p className="text-sm text-gray-500">Print customer receipts with kitchen orders</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="print-modifiers">Print Modifiers</Label>
                  <Switch id="print-modifiers" defaultChecked />
                  <p className="text-sm text-gray-500">Include item modifications in kitchen tickets</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duplicate-orders">Duplicate Orders</Label>
                  <Switch id="duplicate-orders" />
                  <p className="text-sm text-gray-500">Print duplicate copies of each order</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Print Format</CardTitle>
              <CardDescription>Customize kitchen ticket format</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="font-size">Font Size</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="print-logo">Print Logo</Label>
                  <Switch id="print-logo" />
                  <p className="text-sm text-gray-500">Include restaurant logo on kitchen tickets</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Printer Dialog */}
      {isAddingPrinter && (
        <Card className="border-2 border-dashed border-gray-300">
          <CardHeader>
            <CardTitle>Add New Kitchen Printer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="printer-name">Printer Name</Label>
                <Input
                  id="printer-name"
                  value={newPrinter.name}
                  onChange={(e) => setNewPrinter(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter printer name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="printer-type">Printer Type</Label>
                <Select
                  value={newPrinter.type}
                  onValueChange={(value) => setNewPrinter(prev => ({ ...prev, type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thermal">Thermal</SelectItem>
                    <SelectItem value="inkjet">Inkjet</SelectItem>
                    <SelectItem value="laser">Laser</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="connection-type">Connection Type</Label>
                <Select
                  value={newPrinter.connection}
                  onValueChange={(value) => setNewPrinter(prev => ({ ...prev, connection: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ethernet">Ethernet</SelectItem>
                    <SelectItem value="bluetooth">Bluetooth</SelectItem>
                    <SelectItem value="usb">USB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paper-size">Paper Size</Label>
                <Select
                  value={newPrinter.paperSize}
                  onValueChange={(value) => setNewPrinter(prev => ({ ...prev, paperSize: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="80mm">80mm</SelectItem>
                    <SelectItem value="58mm">58mm</SelectItem>
                    <SelectItem value="A4">A4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newPrinter.connection === 'ethernet' && (
                <div className="space-y-2">
                  <Label htmlFor="ip-address">IP Address</Label>
                  <Input
                    id="ip-address"
                    value={newPrinter.ipAddress}
                    onChange={(e) => setNewPrinter(prev => ({ ...prev, ipAddress: e.target.value }))}
                    placeholder="192.168.1.100"
                  />
                </div>
              )}
              {newPrinter.connection === 'bluetooth' && (
                <div className="space-y-2">
                  <Label htmlFor="mac-address">MAC Address</Label>
                  <Input
                    id="mac-address"
                    value={newPrinter.macAddress}
                    onChange={(e) => setNewPrinter(prev => ({ ...prev, macAddress: e.target.value }))}
                    placeholder="00:1B:44:11:3A:B7"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="kitchen-station">Kitchen Station</Label>
                <Select
                  value={newPrinter.kitchenStation}
                  onValueChange={(value) => setNewPrinter(prev => ({ ...prev, kitchenStation: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select kitchen station" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.filter(s => s.isActive).map(station => (
                      <SelectItem key={station.id} value={station.id}>
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="auto-cut">Auto Cut</Label>
                <Switch
                  id="auto-cut"
                  checked={newPrinter.autoCut}
                  onCheckedChange={(checked) => setNewPrinter(prev => ({ ...prev, autoCut: checked }))}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddPrinter}>
                <Plus className="mr-2 h-4 w-4" />
                Add Printer
              </Button>
              <Button variant="outline" onClick={() => setIsAddingPrinter(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Station Dialog */}
      {isAddingStation && (
        <Card className="border-2 border-dashed border-gray-300">
          <CardHeader>
            <CardTitle>Add New Kitchen Station</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="station-name">Station Name</Label>
                <Input
                  id="station-name"
                  value={newStation.name}
                  onChange={(e) => setNewStation(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter station name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="station-description">Description</Label>
                <Input
                  id="station-description"
                  value={newStation.description}
                  onChange={(e) => setNewStation(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter station description"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddStation}>
                <Plus className="mr-2 h-4 w-4" />
                Add Station
              </Button>
              <Button variant="outline" onClick={() => setIsAddingStation(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}