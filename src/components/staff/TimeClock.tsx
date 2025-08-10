'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Clock, 
  Play, 
  Pause, 
  Square, 
  User, 
  Calendar, 
  MapPin,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Timer
} from 'lucide-react'
import { format, startOfWeek, endOfWeek, isToday, isThisWeek } from 'date-fns'

interface TimeEntry {
  id: string
  staffId: string
  staffName: string
  clockIn: Date
  clockOut?: Date
  breakStart?: Date
  breakEnd?: Date
  location: string
  status: 'active' | 'completed' | 'on_break'
  notes?: string
  totalHours?: number
  overtimeHours?: number
}

interface StaffMember {
  id: string
  name: string
  position: string
  department: string
  hourlyRate: number
  isActive: boolean
  currentStatus: 'working' | 'on_break' | 'off_duty'
}

interface TimeClockStats {
  totalStaff: number
  activeStaff: number
  onBreakStaff: number
  totalHoursToday: number
  averageHoursPerStaff: number
  overtimeToday: number
}

export default function TimeClock() {
  const [activeTab, setActiveTab] = useState('clock')
  const [selectedStaff, setSelectedStaff] = useState('')
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [stats, setStats] = useState<TimeClockStats>({
    totalStaff: 0,
    activeStaff: 0,
    onBreakStaff: 0,
    totalHoursToday: 0,
    averageHoursPerStaff: 0,
    overtimeToday: 0
  })
  const [notes, setNotes] = useState('')
  const [location, setLocation] = useState('Main Store')
  const [selectedDateRange, setSelectedDateRange] = useState('today')
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false)
  const [newStaff, setNewStaff] = useState({
    name: '',
    position: '',
    department: '',
    hourlyRate: ''
  })

  // Initialize mock data
  useEffect(() => {
    const mockStaff: StaffMember[] = [
      {
        id: '1',
        name: 'John Smith',
        position: 'Manager',
        department: 'Management',
        hourlyRate: 25.00,
        isActive: true,
        currentStatus: 'working'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        position: 'Cashier',
        department: 'Sales',
        hourlyRate: 18.50,
        isActive: true,
        currentStatus: 'working'
      },
      {
        id: '3',
        name: 'Mike Davis',
        position: 'Stock Clerk',
        department: 'Inventory',
        hourlyRate: 16.00,
        isActive: true,
        currentStatus: 'on_break'
      },
      {
        id: '4',
        name: 'Emily Brown',
        position: 'Sales Associate',
        department: 'Sales',
        hourlyRate: 17.00,
        isActive: true,
        currentStatus: 'off_duty'
      }
    ]

    const mockTimeEntries: TimeEntry[] = [
      {
        id: '1',
        staffId: '1',
        staffName: 'John Smith',
        clockIn: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        location: 'Main Store',
        status: 'active',
        totalHours: 4
      },
      {
        id: '2',
        staffId: '2',
        staffName: 'Sarah Johnson',
        clockIn: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        location: 'Main Store',
        status: 'active',
        totalHours: 3
      },
      {
        id: '3',
        staffId: '3',
        staffName: 'Mike Davis',
        clockIn: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        breakStart: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        location: 'Main Store',
        status: 'on_break',
        totalHours: 4
      },
      {
        id: '4',
        staffId: '4',
        staffName: 'Emily Brown',
        clockIn: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
        clockOut: new Date(Date.now() - 16 * 60 * 60 * 1000), // 16 hours ago
        location: 'Main Store',
        status: 'completed',
        totalHours: 8,
        overtimeHours: 1
      }
    ]

    setStaffMembers(mockStaff)
    setTimeEntries(mockTimeEntries)
    
    // Calculate stats
    const activeEntries = mockTimeEntries.filter(entry => entry.status === 'active')
    const breakEntries = mockTimeEntries.filter(entry => entry.status === 'on_break')
    const todayEntries = mockTimeEntries.filter(entry => isToday(entry.clockIn))
    
    setStats({
      totalStaff: mockStaff.length,
      activeStaff: activeEntries.length,
      onBreakStaff: breakEntries.length,
      totalHoursToday: todayEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0),
      averageHoursPerStaff: todayEntries.length > 0 ? 
        todayEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0) / todayEntries.length : 0,
      overtimeToday: todayEntries.reduce((sum, entry) => sum + (entry.overtimeHours || 0), 0)
    })
  }, [])

  const handleClockIn = () => {
    if (!selectedStaff) return

    const staff = staffMembers.find(s => s.id === selectedStaff)
    if (!staff) return

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      staffId: selectedStaff,
      staffName: staff.name,
      clockIn: new Date(),
      location,
      status: 'active',
      notes
    }

    setTimeEntries(prev => [newEntry, ...prev])
    
    // Update staff status
    setStaffMembers(prev => 
      prev.map(s => 
        s.id === selectedStaff 
          ? { ...s, currentStatus: 'working' as const }
          : s
      )
    )

    // Reset form
    setSelectedStaff('')
    setNotes('')
  }

  const handleClockOut = (entryId: string) => {
    const entry = timeEntries.find(e => e.id === entryId)
    if (!entry) return

    const updatedEntry = {
      ...entry,
      clockOut: new Date(),
      status: 'completed' as const,
      totalHours: Math.round((Date.now() - entry.clockIn.getTime()) / (1000 * 60 * 60) * 100) / 100
    }

    setTimeEntries(prev => 
      prev.map(e => e.id === entryId ? updatedEntry : e)
    )

    // Update staff status
    setStaffMembers(prev => 
      prev.map(s => 
        s.id === entry.staffId 
          ? { ...s, currentStatus: 'off_duty' as const }
          : s
      )
    )
  }

  const handleStartBreak = (entryId: string) => {
    const entry = timeEntries.find(e => e.id === entryId)
    if (!entry) return

    const updatedEntry = {
      ...entry,
      breakStart: new Date(),
      status: 'on_break' as const
    }

    setTimeEntries(prev => 
      prev.map(e => e.id === entryId ? updatedEntry : e)
    )

    // Update staff status
    setStaffMembers(prev => 
      prev.map(s => 
        s.id === entry.staffId 
          ? { ...s, currentStatus: 'on_break' as const }
          : s
      )
    )
  }

  const handleEndBreak = (entryId: string) => {
    const entry = timeEntries.find(e => e.id === entryId)
    if (!entry || !entry.breakStart) return

    const updatedEntry = {
      ...entry,
      breakEnd: new Date(),
      status: 'active' as const
    }

    setTimeEntries(prev => 
      prev.map(e => e.id === entryId ? updatedEntry : e)
    )

    // Update staff status
    setStaffMembers(prev => 
      prev.map(s => 
        s.id === entry.staffId 
          ? { ...s, currentStatus: 'working' as const }
          : s
      )
    )
  }

  const handleAddStaff = () => {
    if (!newStaff.name || !newStaff.position || !newStaff.hourlyRate) return

    const staff: StaffMember = {
      id: Date.now().toString(),
      name: newStaff.name,
      position: newStaff.position,
      department: newStaff.department || 'General',
      hourlyRate: parseFloat(newStaff.hourlyRate),
      isActive: true,
      currentStatus: 'off_duty'
    }

    setStaffMembers(prev => [...prev, staff])
    setNewStaff({ name: '', position: '', department: '', hourlyRate: '' })
    setIsAddStaffOpen(false)
  }

  const filteredEntries = timeEntries.filter(entry => {
    if (selectedDateRange === 'today') {
      return isToday(entry.clockIn)
    } else if (selectedDateRange === 'week') {
      return isThisWeek(entry.clockIn)
    }
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'completed': return 'bg-gray-500'
      case 'on_break': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Working'
      case 'completed': return 'Completed'
      case 'on_break': return 'On Break'
      default: return 'Unknown'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Time Clock</h1>
          <p className="text-muted-foreground">Track employee hours and manage work schedules</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStaff}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Play className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeStaff}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Break</CardTitle>
            <Timer className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.onBreakStaff}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHoursToday.toFixed(1)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Hours</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageHoursPerStaff.toFixed(1)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overtime</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overtimeToday.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="clock">Clock In/Out</TabsTrigger>
          <TabsTrigger value="entries">Time Entries</TabsTrigger>
          <TabsTrigger value="staff">Staff Management</TabsTrigger>
        </TabsList>

        <TabsContent value="clock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Time Clock</CardTitle>
              <CardDescription>Clock in and out, manage breaks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="staff">Select Employee</Label>
                  <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffMembers
                        .filter(staff => staff.isActive && staff.currentStatus === 'off_duty')
                        .map(staff => (
                          <SelectItem key={staff.id} value={staff.id}>
                            {staff.name} - {staff.position}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Main Store">Main Store</SelectItem>
                      <SelectItem value="Warehouse">Warehouse</SelectItem>
                      <SelectItem value="Office">Office</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  placeholder="Add any notes about this shift..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleClockIn}
                disabled={!selectedStaff}
                className="w-full"
              >
                <Play className="mr-2 h-4 w-4" />
                Clock In
              </Button>
            </CardContent>
          </Card>

          {/* Active Time Entries */}
          <Card>
            <CardHeader>
              <CardTitle>Active Time Entries</CardTitle>
              <CardDescription>Currently clocked in employees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeEntries
                  .filter(entry => entry.status === 'active' || entry.status === 'on_break')
                  .map(entry => {
                    const staff = staffMembers.find(s => s.id === entry.staffId)
                    return (
                      <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(entry.status)}`} />
                          <div>
                            <p className="font-medium">{entry.staffName}</p>
                            <p className="text-sm text-muted-foreground">
                              {staff?.position} • {entry.location}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Clocked in: {format(entry.clockIn, 'HH:mm')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {entry.status === 'active' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStartBreak(entry.id)}
                              >
                                <Timer className="mr-2 h-4 w-4" />
                                Break
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleClockOut(entry.id)}
                              >
                                <Square className="mr-2 h-4 w-4" />
                                Clock Out
                              </Button>
                            </>
                          )}
                          
                          {entry.status === 'on_break' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleEndBreak(entry.id)}
                            >
                              <Play className="mr-2 h-4 w-4" />
                              End Break
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                
                {timeEntries.filter(entry => entry.status === 'active' || entry.status === 'on_break').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="mx-auto h-12 w-12 mb-4" />
                    <p>No active time entries</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time Entries</CardTitle>
              <CardDescription>View and manage all time entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Break</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map(entry => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.staffName}</TableCell>
                      <TableCell>{format(entry.clockIn, 'MMM dd, HH:mm')}</TableCell>
                      <TableCell>
                        {entry.clockOut ? format(entry.clockOut, 'MMM dd, HH:mm') : '-'}
                      </TableCell>
                      <TableCell>
                        {entry.breakStart && entry.breakEnd 
                          ? `${format(entry.breakStart, 'HH:mm')} - ${format(entry.breakEnd, 'HH:mm')}`
                          : entry.breakStart 
                            ? `${format(entry.breakStart, 'HH:mm')} - Present`
                            : '-'
                        }
                      </TableCell>
                      <TableCell>{entry.location}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(entry.status)}`} />
                          {getStatusText(entry.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{entry.totalHours?.toFixed(1) || '-'}</TableCell>
                      <TableCell>
                        {entry.status === 'active' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleClockOut(entry.id)}
                          >
                            Clock Out
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Staff Management</CardTitle>
                  <CardDescription>Manage employee information and rates</CardDescription>
                </div>
                <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
                  <DialogTrigger asChild>
                    <Button>Add Staff</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Staff Member</DialogTitle>
                      <DialogDescription>
                        Enter the details for the new staff member
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={newStaff.name}
                          onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        <Input
                          id="position"
                          value={newStaff.position}
                          onChange={(e) => setNewStaff(prev => ({ ...prev, position: e.target.value }))}
                          placeholder="Job position"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          value={newStaff.department}
                          onChange={(e) => setNewStaff(prev => ({ ...prev, department: e.target.value }))}
                          placeholder="Department"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                        <Input
                          id="hourlyRate"
                          type="number"
                          step="0.01"
                          value={newStaff.hourlyRate}
                          onChange={(e) => setNewStaff(prev => ({ ...prev, hourlyRate: e.target.value }))}
                          placeholder="25.00"
                        />
                      </div>
                      <Button onClick={handleAddStaff} className="w-full">
                        Add Staff Member
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Hourly Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Current Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffMembers.map(staff => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">{staff.name}</TableCell>
                      <TableCell>{staff.position}</TableCell>
                      <TableCell>{staff.department}</TableCell>
                      <TableCell>${staff.hourlyRate.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={staff.isActive ? "default" : "secondary"}>
                          {staff.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            staff.currentStatus === 'working' ? 'bg-green-500' :
                            staff.currentStatus === 'on_break' ? 'bg-yellow-500' : 'bg-gray-500'
                          }`} />
                          {staff.currentStatus === 'working' ? 'Working' :
                           staff.currentStatus === 'on_break' ? 'On Break' : 'Off Duty'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}