'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, UserPlus, Clock, CheckCircle } from 'lucide-react'
import { listEmployees, type EmployeeResponse, createEmployee, updateEmployee, deleteEmployee } from '@/services/employees'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [employees, setEmployees] = useState<EmployeeResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newDepartment, setNewDepartment] = useState('')

  const [editOpen, setEditOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editDepartment, setEditDepartment] = useState('')
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE')

  useEffect(() => {
    const load = async () => {
      setError(null)
      try {
        const data = await listEmployees()
        setEmployees(data)
      } catch (e: any) {
        setError(e?.message || 'Failed to load employees')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const filteredEmployees = employees.filter(employee => {
    const hay = `${employee.name || ''} ${employee.email || ''} ${employee.department || ''}`.toLowerCase()
    return hay.includes(searchTerm.toLowerCase())
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Employee Management</h1>
          <p className="text-muted-foreground">Manage employee accounts, roles, and performance</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Employee</DialogTitle>
              <DialogDescription>Create a new employee account.</DialogDescription>
            </DialogHeader>
            <form
              className="space-y-3"
              onSubmit={async e => {
                e.preventDefault()
                setAddError(null)
                setAddLoading(true)
                try {
                  await createEmployee({ name: newName, email: newEmail, department: newDepartment })
                  setAddOpen(false)
                  setNewName('')
                  setNewEmail('')
                  setNewDepartment('')
                  setLoading(true)
                  const data = await listEmployees()
                  setEmployees(data)
                } catch (err: any) {
                  setAddError(err?.message || 'Failed to add employee')
                } finally {
                  setAddLoading(false)
                  setLoading(false)
                }
              }}
            >
              {addError && <div className="text-sm text-destructive">{addError}</div>}
              <div className="space-y-2">
                <label className="text-sm" htmlFor="emp-name">Full Name</label>
                <Input id="emp-name" value={newName} onChange={e => setNewName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm" htmlFor="emp-email">Email</label>
                <Input id="emp-email" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm" htmlFor="emp-dept">Department</label>
                <Input id="emp-dept" value={newDepartment} onChange={e => setNewDepartment(e.target.value)} required />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={addLoading}>{addLoading ? 'Saving...' : 'Save'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">22</div>
            <p className="text-xs text-muted-foreground">92% attendance rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobs Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
          <CardDescription>View and manage all employees</CardDescription>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && <div className="text-sm text-destructive mb-3">{error}</div>}
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Employee No</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map(employee => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={'/placeholder.svg'} />
                        <AvatarFallback>
                          {(employee.name || 'N A')
                            .split(' ')
                            .map(n => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{employee.name || '—'}</div>
                        <div className="text-sm text-muted-foreground">{employee.email || '—'}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.employeeNo || '—'}</TableCell>
                  <TableCell>{employee.department || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={employee.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {employee.status || '—'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditId(employee.id as number)
                        setEditName(employee.name || '')
                        setEditDepartment(employee.department || '')
                        setEditStatus((employee.status as any) === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE')
                        setEditError(null)
                        setEditOpen(true)
                      }}
                    >
                      Update
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={async () => {
                        try {
                          await deleteEmployee(employee.id as number)
                          setEmployees(prev => prev.filter(e => e.id !== employee.id))
                        } catch (e: any) {
                          setError(e?.message || 'Failed to delete employee')
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Employee Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>Update employee details.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={async e => {
              e.preventDefault()
              if (editId == null) return
              setEditError(null)
              setEditLoading(true)
              try {
                await updateEmployee(editId, {
                  name: editName,
                  department: editDepartment,
                  status: editStatus,
                })
                const data = await listEmployees()
                setEmployees(data)
                setEditOpen(false)
              } catch (err: any) {
                setEditError(err?.message || 'Failed to update employee')
              } finally {
                setEditLoading(false)
              }
            }}
          >
            {editError && <div className="text-sm text-destructive">{editError}</div>}
            <div className="space-y-2">
              <label className="text-sm" htmlFor="edit-name">Full Name</label>
              <Input id="edit-name" value={editName} onChange={e => setEditName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm" htmlFor="edit-dept">Department</label>
              <Input id="edit-dept" value={editDepartment} onChange={e => setEditDepartment(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm" htmlFor="edit-status">Status</label>
              <select
                id="edit-status"
                className="bg-background border border-border rounded-md h-9 px-3 text-sm"
                value={editStatus}
                onChange={e => setEditStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={editLoading}>{editLoading ? 'Saving...' : 'Save'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
