'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users, UserPlus, Shield } from 'lucide-react'
import { RoleLevel, StaffRole } from '@prisma/client'

interface Role {
  id: string
  name: string
  description?: string
  level: RoleLevel
  isSystem: boolean
  isActive: boolean
}

interface Staff {
  id: string
  name: string
  email: string
  phone: string
  role: StaffRole
  isActive: boolean
  assignedRole?: Role
}

interface StaffRoleAssignmentProps {
  restaurantId: string
}

export default function StaffRoleAssignment({ restaurantId }: StaffRoleAssignmentProps) {
  const [staff, setStaff] = useState<Staff[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedRoleId, setSelectedRoleId] = useState<string>('')

  useEffect(() => {
    fetchData()
  }, [restaurantId])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch staff
      const staffResponse = await fetch(`/api/staff?restaurantId=${restaurantId}`)
      if (staffResponse.ok) {
        const staffData = await staffResponse.json()
        setStaff(staffData)
      }

      // Fetch roles
      const rolesResponse = await fetch(`/api/roles?restaurantId=${restaurantId}`)
      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json()
        setRoles(rolesData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignRole = async () => {
    if (!selectedStaff || !selectedRoleId) return

    try {
      const response = await fetch(`/api/staff/${selectedStaff.id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roleId: selectedRoleId,
        }),
      })

      if (response.ok) {
        await fetchData()
        setIsAssignDialogOpen(false)
        setSelectedStaff(null)
        setSelectedRoleId('')
      }
    } catch (error) {
      console.error('Error assigning role:', error)
    }
  }

  const handleRemoveRole = async (staffId: string) => {
    if (!confirm('Are you sure you want to remove this role assignment?')) {
      return
    }

    try {
      const response = await fetch(`/api/staff/${staffId}/role`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error removing role:', error)
    }
  }

  const getRoleLevelColor = (level: RoleLevel) => {
    switch (level) {
      case RoleLevel.SUPER_ADMIN:
        return 'bg-red-100 text-red-800'
      case RoleLevel.STORE_ADMIN:
        return 'bg-blue-100 text-blue-800'
      case RoleLevel.STORE_STAFF:
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStaffRoleColor = (role: StaffRole) => {
    switch (role) {
      case StaffRole.OWNER:
        return 'bg-purple-100 text-purple-800'
      case StaffRole.MANAGER:
        return 'bg-blue-100 text-blue-800'
      case StaffRole.CASHIER:
        return 'bg-green-100 text-green-800'
      case StaffRole.WAITER:
        return 'bg-yellow-100 text-yellow-800'
      case StaffRole.CHEF:
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Staff Role Assignment</h2>
          <p className="text-muted-foreground">
            Assign permission-based roles to your staff members
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Staff Members</span>
          </CardTitle>
          <CardDescription>
            View and manage role assignments for your restaurant staff
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Permission Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Badge className={getStaffRoleColor(member.role)}>
                      {member.role.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {member.assignedRole ? (
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4" />
                        <Badge className={getRoleLevelColor(member.assignedRole.level)}>
                          {member.assignedRole.name}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">No role assigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.isActive ? 'default' : 'secondary'}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Dialog open={isAssignDialogOpen && selectedStaff?.id === member.id} onOpenChange={(open) => {
                        setIsAssignDialogOpen(open)
                        if (open) {
                          setSelectedStaff(member)
                          setSelectedRoleId(member.assignedRole?.id || '')
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <UserPlus className="mr-2 h-4 w-4" />
                            {member.assignedRole ? 'Change Role' : 'Assign Role'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              {member.assignedRole ? 'Change Role' : 'Assign Role'} for {member.name}
                            </DialogTitle>
                            <DialogDescription>
                              Select a permission-based role to assign to this staff member.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Role</label>
                              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                  {roles.filter(role => role.isActive).map((role) => (
                                    <SelectItem key={role.id} value={role.id}>
                                      <div className="flex items-center space-x-2">
                                        <Shield className="h-4 w-4" />
                                        <span>{role.name}</span>
                                        <Badge className={getRoleLevelColor(role.level)} variant="secondary">
                                          {role.level.replace('_', ' ')}
                                        </Badge>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {member.assignedRole?.description && (
                              <div className="p-3 bg-muted rounded-md">
                                <p className="text-sm">
                                  <strong>Current Role:</strong> {member.assignedRole.description}
                                </p>
                              </div>
                            )}

                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleAssignRole} disabled={!selectedRoleId}>
                                {member.assignedRole ? 'Update Role' : 'Assign Role'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {member.assignedRole && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveRole(member.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {staff.length === 0 && (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium">No staff members found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started by adding staff members to your restaurant.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff.length}</div>
            <p className="text-xs text-muted-foreground">
              {staff.filter(s => s.isActive).length} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Roles Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staff.filter(s => s.assignedRole).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {staff.filter(s => !s.assignedRole).length} unassigned
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roles.filter(r => r.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {roles.filter(r => !r.isActive).length} inactive
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}