'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, MoreHorizontal, Edit, Trash2, UserCheck, UserX } from 'lucide-react'
import {
  listCustomers,
  type CustomerResponse,
  updateCustomer,
  deleteCustomer,
} from '@/services/customers'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [customers, setCustomers] = useState<CustomerResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [editId, setEditId] = useState<number | string | null>(null)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE')

  useEffect(() => {
    const load = async () => {
      setError(null)
      try {
        const data = await listCustomers()
        setCustomers(data)
      } catch (e: any) {
        setError(e?.message || 'Failed to load customers')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return customers.filter(
      u =>
        (u.name || '').toLowerCase().includes(term) || (u.email || '').toLowerCase().includes(term)
    )
  }, [customers, searchTerm])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customer Management</h1>
          <p className="text-muted-foreground">Manage registered customers</p>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customers ({filteredUsers.length})</CardTitle>
          <CardDescription>Manage customer accounts</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="text-sm text-destructive mb-3">{error}</div>}
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Vehicles</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status?.toLowerCase() === 'active' ? 'default' : 'destructive'
                        }
                      >
                        {user.status || 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.joinDate}</TableCell>
                    <TableCell>{user.vehicles}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditId(user.id)
                          setEditName(user.name || '')
                          setEditPhone((user as any).phone || '')
                          setEditStatus(
                            (user.status as any)?.toLowerCase() === 'inactive'
                              ? 'INACTIVE'
                              : 'ACTIVE'
                          )
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
                            await deleteCustomer(user.id)
                            setCustomers(prev => prev.filter(c => c.id !== user.id))
                          } catch (e: any) {
                            setError(e?.message || 'Failed to delete customer')
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
      {/* Edit Customer Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Update customer details.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={async e => {
              e.preventDefault()
              if (editId == null) return
              setEditError(null)
              setEditLoading(true)
              try {
                await updateCustomer(editId, {
                  name: editName,
                  phone: editPhone,
                  status: editStatus,
                })
                const data = await listCustomers()
                setCustomers(data)
                setEditOpen(false)
              } catch (err: any) {
                setEditError(err?.message || 'Failed to update customer')
              } finally {
                setEditLoading(false)
              }
            }}
          >
            {editError && <div className="text-sm text-destructive">{editError}</div>}
            <div className="space-y-2">
              <label className="text-sm" htmlFor="cust-name">
                Full Name
              </label>
              <Input
                id="cust-name"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm" htmlFor="cust-phone">
                Phone
              </label>
              <Input
                id="cust-phone"
                value={editPhone}
                onChange={e => setEditPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm" htmlFor="cust-status">
                Status
              </label>
              <select
                id="cust-status"
                className="bg-background border border-border rounded-md h-9 px-3 text-sm"
                value={editStatus}
                onChange={e => setEditStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
