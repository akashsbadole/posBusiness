"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import { format, addDays, startOfWeek, endOfWeek, isToday, parseISO } from 'date-fns'

interface Shift {
  id: string
  staffId: string
  staffName: string
  startTime: string
  endTime: string | null
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  expectedRevenue: number
  actualRevenue: number
  cashOpening: number
  cashClosing: number | null
  notes: string
  createdAt: string
  updatedAt: string
}

interface Staff {
  id: string
  name: string
  role: string
  isActive: boolean
}

interface ShiftSummary {
  totalShifts: number
  activeShifts: number
  completedShifts: number
  totalRevenue: number
  averageRevenuePerShift: number
  cashDiscrepancies: number
}

export default function ShiftsManagement() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [summary, setSummary] = useState<ShiftSummary>({
    totalShifts: 0,
    activeShifts: 0,
    completedShifts: 0,
    totalRevenue: 0,
    averageRevenuePerShift: 0,
    cashDiscrepancies: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  // Form states
  const [formData, setFormData] = useState({
    staffId: '',
    startTime: '',
    endTime: '',
    expectedRevenue: '',
    cashOpening: '',
    notes: ''
  })

  // Mock data for demonstration
  useEffect(() => {
    const mockStaff: Staff[] = [
      { id: '1', name: 'John Smith', role: 'Manager', isActive: true },
      { id: '2', name: 'Jane Doe', role: 'Cashier', isActive: true },
      { id: '3', name: 'Mike Johnson', role: 'Server', isActive: true },
      { id: '4', name: 'Sarah Wilson', role: 'Cashier', isActive: true }
    ]

    const mockShifts: Shift[] = [
      {
        id: '1',
        staffId: '1',
        staffName: 'John Smith',
        startTime: '2024-01-15T09:00:00Z',
        endTime: '2024-01-15T17:00:00Z',
        status: 'COMPLETED',
        expectedRevenue: 5000,
        actualRevenue: 5250,
        cashOpening: 1000,
        cashClosing: 1250,
        notes: 'Good day, high customer traffic',
        createdAt: '2024-01-15T08:30:00Z',
        updatedAt: '2024-01-15T17:30:00Z'
      },
      {
        id: '2',
        staffId: '2',
        staffName: 'Jane Doe',
        startTime: '2024-01-15T10:00:00Z',
        endTime: null,
        status: 'ACTIVE',
        expectedRevenue: 3000,
        actualRevenue: 0,
        cashOpening: 500,
        cashClosing: null,
        notes: 'Morning shift',
        createdAt: '2024-01-15T09:30:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '3',
        staffId: '3',
        staffName: 'Mike Johnson',
        startTime: '2024-01-16T12:00:00Z',
        endTime: null,
        status: 'SCHEDULED',
        expectedRevenue: 2500,
        actualRevenue: 0,
        cashOpening: 300,
        cashClosing: null,
        notes: 'Lunch shift',
        createdAt: '2024-01-15T16:00:00Z',
        updatedAt: '2024-01-15T16:00:00Z'
      }
    ]

    const mockSummary: ShiftSummary = {
      totalShifts: mockShifts.length,
      activeShifts: mockShifts.filter(s => s.status === 'ACTIVE').length,
      completedShifts: mockShifts.filter(s => s.status === 'COMPLETED').length,
      totalRevenue: mockShifts.reduce((sum, s) => sum + s.actualRevenue, 0),
      averageRevenuePerShift: mockShifts.filter(s => s.status === 'COMPLETED').length > 0 
        ? mockShifts.filter(s => s.status === 'COMPLETED').reduce((sum, s) => sum + s.actualRevenue, 0) / mockShifts.filter(s => s.status === 'COMPLETED').length 
        : 0,
      cashDiscrepancies: mockShifts.filter(s => s.status === 'COMPLETED').reduce((sum, s) => {
        if (s.cashClosing !== null) {
          const expected = s.cashOpening + s.actualRevenue
          return sum + Math.abs(expected - s.cashClosing)
        }
        return sum
      }, 0)
    }

    setStaff(mockStaff)
    setShifts(mockShifts)
    setSummary(mockSummary)
    setIsLoading(false)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500'
      case 'COMPLETED': return 'bg-blue-500'
      case 'SCHEDULED': return 'bg-yellow-500'
      case 'CANCELLED': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Play className="h-4 w-4" />
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />
      case 'SCHEDULED': return <Clock className="h-4 w-4" />
      case 'CANCELLED': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const handleCreateShift = async () => {
    try {
      const newShift: Shift = {
        id: Date.now().toString(),
        staffId: formData.staffId,
        staffName: staff.find(s => s.id === formData.staffId)?.name || '',
        startTime: formData.startTime,
        endTime: formData.endTime,
        status: 'SCHEDULED',
        expectedRevenue: parseFloat(formData.expectedRevenue) || 0,
        actualRevenue: 0,
        cashOpening: parseFloat(formData.cashOpening) || 0,
        cashClosing: null,
        notes: formData.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      setShifts([newShift, ...shifts])
      setIsCreateDialogOpen(false)
      resetForm()
      
      // Update summary
      setSummary(prev => ({
        ...prev,
        totalShifts: prev.totalShifts + 1
      }))
    } catch (error) {
      console.error('Error creating shift:', error)
    }
  }

  const handleStartShift = async (shiftId: string) => {
    try {
      setShifts(shifts.map(shift => 
        shift.id === shiftId 
          ? { ...shift, status: 'ACTIVE' as const, updatedAt: new Date().toISOString() }
          : shift
      ))
      
      // Update summary
      setSummary(prev => ({
        ...prev,
        activeShifts: prev.activeShifts + 1
      }))
    } catch (error) {
      console.error('Error starting shift:', error)
    }
  }

  const handleEndShift = async (shiftId: string) => {
    try {
      setShifts(shifts.map(shift => 
        shift.id === shiftId 
          ? { 
              ...shift, 
              status: 'COMPLETED' as const, 
              endTime: new Date().toISOString(),
              cashClosing: shift.cashOpening + shift.actualRevenue,
              updatedAt: new Date().toISOString()
            }
          : shift
      ))
      
      // Update summary
      setSummary(prev => ({
        ...prev,
        activeShifts: prev.activeShifts - 1,
        completedShifts: prev.completedShifts + 1,
        totalRevenue: prev.totalRevenue + (shifts.find(s => s.id === shiftId)?.actualRevenue || 0)
      }))
    } catch (error) {
      console.error('Error ending shift:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      staffId: '',
      startTime: '',
      endTime: '',
      expectedRevenue: '',
      cashOpening: '',
      notes: ''
    })
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const formatDateTime = (dateString: string) => {
    return format(parseISO(dateString), 'MMM dd, yyyy HH:mm')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shifts Management</h1>
          <p className="text-gray-600">Manage staff shifts and track cash flow</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Shift
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Shift</DialogTitle>
              <DialogDescription>
                Schedule a new shift for staff member
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="staff">Staff Member</Label>
                <Select value={formData.staffId} onValueChange={(value) => setFormData({...formData, staffId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.filter(s => s.isActive).map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} - {member.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="endTime">End Time (Optional)</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="expectedRevenue">Expected Revenue (₹)</Label>
                <Input
                  id="expectedRevenue"
                  type="number"
                  placeholder="0.00"
                  value={formData.expectedRevenue}
                  onChange={(e) => setFormData({...formData, expectedRevenue: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="cashOpening">Opening Cash (₹)</Label>
                <Input
                  id="cashOpening"
                  type="number"
                  placeholder="0.00"
                  value={formData.cashOpening}
                  onChange={(e) => setFormData({...formData, cashOpening: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateShift} className="flex-1">
                  Create Shift
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Shifts</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalShifts}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Shifts</p>
                <p className="text-2xl font-bold text-green-600">{summary.activeShifts}</p>
              </div>
              <Play className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Revenue/Shift</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.averageRevenuePerShift)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active">Active Shifts</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Shifts</CardTitle>
              <CardDescription>Overview of all shifts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Cash Flow</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shifts.map((shift) => (
                      <TableRow key={shift.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{shift.staffName}</div>
                            <div className="text-sm text-gray-500">
                              {staff.find(s => s.id === shift.staffId)?.role}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatDateTime(shift.startTime)}</TableCell>
                        <TableCell>
                          {shift.endTime ? formatDateTime(shift.endTime) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(shift.status)} text-white`}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(shift.status)}
                              {shift.status}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>Expected: {formatCurrency(shift.expectedRevenue)}</div>
                            <div className="text-sm text-gray-500">
                              Actual: {formatCurrency(shift.actualRevenue)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>Opening: {formatCurrency(shift.cashOpening)}</div>
                            <div className="text-sm text-gray-500">
                              Closing: {shift.cashClosing ? formatCurrency(shift.cashClosing) : '-'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {shift.status === 'SCHEDULED' && (
                              <Button
                                size="sm"
                                onClick={() => handleStartShift(shift.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Play className="h-3 w-3" />
                              </Button>
                            )}
                            {shift.status === 'ACTIVE' && (
                              <Button
                                size="sm"
                                onClick={() => handleEndShift(shift.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                <Pause className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedShift(shift)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Shifts</CardTitle>
              <CardDescription>Currently active shifts</CardDescription>
            </CardHeader>
            <CardContent>
              {shifts.filter(s => s.status === 'ACTIVE').length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No active shifts</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {shifts.filter(s => s.status === 'ACTIVE').map((shift) => (
                    <Card key={shift.id} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{shift.staffName}</h3>
                            <p className="text-sm text-gray-600">
                              {staff.find(s => s.id === shift.staffId)?.role}
                            </p>
                            <p className="text-sm text-gray-500">
                              Started: {formatDateTime(shift.startTime)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Expected Revenue</p>
                            <p className="font-semibold">{formatCurrency(shift.expectedRevenue)}</p>
                            <p className="text-sm text-gray-600">Opening Cash</p>
                            <p className="font-semibold">{formatCurrency(shift.cashOpening)}</p>
                          </div>
                          <Button
                            onClick={() => handleEndShift(shift.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Pause className="mr-2 h-4 w-4" />
                            End Shift
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Shifts</CardTitle>
              <CardDescription>Finished shifts with revenue tracking</CardDescription>
            </CardHeader>
            <CardContent>
              {shifts.filter(s => s.status === 'COMPLETED').length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No completed shifts</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {shifts.filter(s => s.status === 'COMPLETED').map((shift) => (
                    <Card key={shift.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{shift.staffName}</h3>
                            <p className="text-sm text-gray-600">
                              {staff.find(s => s.id === shift.staffId)?.role}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDateTime(shift.startTime)} - {formatDateTime(shift.endTime!)}
                            </p>
                            {shift.notes && (
                              <p className="text-sm text-gray-500 mt-1">{shift.notes}</p>
                            )}
                          </div>
                          <div className="text-right space-y-1">
                            <div>
                              <p className="text-sm text-gray-600">Revenue</p>
                              <p className="font-semibold">{formatCurrency(shift.actualRevenue)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Cash Flow</p>
                              <p className="font-semibold">
                                {formatCurrency(shift.cashOpening)} → {formatCurrency(shift.cashClosing!)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Expected vs Actual</p>
                              <p className={`font-semibold ${
                                shift.actualRevenue >= shift.expectedRevenue 
                                  ? 'text-green-600' 
                                  : 'text-red-600'
                              }`}>
                                {formatCurrency(shift.expectedRevenue)} → {formatCurrency(shift.actualRevenue)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Shifts</CardTitle>
              <CardDescription>Upcoming shifts</CardDescription>
            </CardHeader>
            <CardContent>
              {shifts.filter(s => s.status === 'SCHEDULED').length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No scheduled shifts</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {shifts.filter(s => s.status === 'SCHEDULED').map((shift) => (
                    <Card key={shift.id} className="border-l-4 border-l-yellow-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{shift.staffName}</h3>
                            <p className="text-sm text-gray-600">
                              {staff.find(s => s.id === shift.staffId)?.role}
                            </p>
                            <p className="text-sm text-gray-500">
                              Scheduled: {formatDateTime(shift.startTime)}
                              {shift.endTime && ` - ${formatDateTime(shift.endTime)}`}
                            </p>
                            {shift.notes && (
                              <p className="text-sm text-gray-500 mt-1">{shift.notes}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Expected Revenue</p>
                            <p className="font-semibold">{formatCurrency(shift.expectedRevenue)}</p>
                            <p className="text-sm text-gray-600">Opening Cash</p>
                            <p className="font-semibold">{formatCurrency(shift.cashOpening)}</p>
                          </div>
                          <Button
                            onClick={() => handleStartShift(shift.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Start Shift
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Shift Details Dialog */}
      {selectedShift && (
        <Dialog open={!!selectedShift} onOpenChange={() => setSelectedShift(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Shift Details</DialogTitle>
              <DialogDescription>
                Detailed information about the shift
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Staff Member</Label>
                  <p className="font-semibold">{selectedShift.staffName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Role</Label>
                  <p className="font-semibold">
                    {staff.find(s => s.id === selectedShift.staffId)?.role}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge className={`${getStatusColor(selectedShift.status)} text-white`}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(selectedShift.status)}
                      {selectedShift.status}
                    </div>
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Duration</Label>
                  <p className="font-semibold">
                    {formatDateTime(selectedShift.startTime)}
                    {selectedShift.endTime && ` - ${formatDateTime(selectedShift.endTime)}`}
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Financial Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Expected Revenue</Label>
                    <p className="font-semibold">{formatCurrency(selectedShift.expectedRevenue)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Actual Revenue</Label>
                    <p className="font-semibold">{formatCurrency(selectedShift.actualRevenue)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Opening Cash</Label>
                    <p className="font-semibold">{formatCurrency(selectedShift.cashOpening)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Closing Cash</Label>
                    <p className="font-semibold">
                      {selectedShift.cashClosing ? formatCurrency(selectedShift.cashClosing) : '-'}
                    </p>
                  </div>
                </div>
              </div>
              
              {selectedShift.notes && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-gray-600">{selectedShift.notes}</p>
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedShift(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}