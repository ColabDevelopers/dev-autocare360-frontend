'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, Calendar, Edit } from 'lucide-react'
import { me, changePassword } from '@/services/auth'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function CustomerProfile() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pwdOpen, setPwdOpen] = useState(false)
  const [pwdCurrent, setPwdCurrent] = useState('')
  const [pwdNew, setPwdNew] = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)
  const [pwdError, setPwdError] = useState<string | null>(null)
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setError(null)
      try {
        const u = await me()
        setUser(u)
      } catch (e: any) {
        setError(e?.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const initials = useMemo(() => {
    const email: string = user?.email || ''
    const name: string = user?.name || ''
    if (name) {
      const parts = name.trim().split(' ')
      return (
        parts
          .slice(0, 2)
          .map(p => p[0]?.toUpperCase())
          .join('') || 'U'
      )
    }
    if (email) return email.split('@')[0].slice(0, 2).toUpperCase()
    return 'U'
  }, [user])

  const [firstName, lastName] = useMemo(() => {
    const name: string = user?.name || ''
    if (!name) return ['', '']
    const parts = name.trim().split(' ')
    return [parts[0] || '', parts.slice(1).join(' ') || '']
  }, [user])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <div className="flex items-center gap-2">
          <Dialog open={pwdOpen} onOpenChange={setPwdOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Change Password</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription>Update your account password.</DialogDescription>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={async e => {
                  e.preventDefault()
                  setPwdError(null)
                  setPwdSuccess(null)
                  setPwdLoading(true)
                  try {
                    await changePassword(pwdCurrent, pwdNew)
                    setPwdSuccess('Password updated successfully')
                    setPwdCurrent('')
                    setPwdNew('')
                  } catch (err: any) {
                    setPwdError(err?.message || 'Failed to change password')
                  } finally {
                    setPwdLoading(false)
                  }
                }}
              >
                {pwdError && <div className="text-sm text-destructive">{pwdError}</div>}
                {pwdSuccess && <div className="text-sm text-green-600">{pwdSuccess}</div>}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={pwdCurrent}
                    onChange={e => setPwdCurrent(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={pwdNew}
                    onChange={e => setPwdNew(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setPwdOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={pwdLoading}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {pwdLoading ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Button disabled>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarImage src="/placeholder.svg?height=96&width=96" />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <CardTitle>{user?.name || '—'}</CardTitle>
            <CardDescription>
              {(user?.roles?.[0] || 'customer')?.toString().toUpperCase()}
            </CardDescription>
            <Badge variant="secondary" className="w-fit mx-auto mt-2">
              {user?.status || 'Active'}
            </Badge>
          </CardHeader>
        </Card>

        {/* Profile Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Manage your account details and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <div className="text-sm text-destructive">{error}</div>}
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={firstName} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={lastName} readOnly />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={user?.email || ''} readOnly />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={user?.phone || ''} readOnly />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" value={user?.address || ''} readOnly />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contact Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Preferences</CardTitle>
          <CardDescription>Choose how you'd like to receive updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>Email notifications</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>SMS updates</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Appointment reminders</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
