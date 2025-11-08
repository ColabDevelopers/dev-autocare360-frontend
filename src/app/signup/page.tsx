'use client'

import type React from 'react'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Car, Wrench, Loader2, ArrowLeft } from 'lucide-react'
import { register as registerApi, login as loginApi, me } from '@/services/auth'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
  })
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!acceptTerms) return

    setIsLoading(true)

    setError(null)
    try {
      // Register
      await registerApi(formData)
      // Login after register
      await loginApi(formData.email, formData.password)
      const user = await me()
      const primaryRole = (user?.roles?.[0] || '').toLowerCase()
      if (primaryRole === 'admin') router.push('/admin/dashboard')
      else if (primaryRole === 'employee') router.push('/employee/dashboard')
      else router.push('/customer/dashboard')
    } catch (e: any) {
      setError(e?.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-card p-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="relative">
              <Car className="h-8 w-8 text-primary" />
              <Wrench className="h-4 w-4 text-accent absolute -bottom-1 -right-1" />
            </div>
            <h1 className="text-2xl font-bold text-balance">AutoCare360</h1>
          </div>
          <p className="text-muted-foreground text-balance">Create your customer account</p>
        </div>

        {/* Signup Card */}
        <Card className="border-border/50 shadow-2xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/login')}
                className="p-1"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-2xl">Create Account</CardTitle>
                <CardDescription className="text-balance">
                  Join AutoCare360 to manage your vehicle services
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <div className="text-sm text-destructive" role="alert">
                  {error}
                </div>
              )}
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">Personal Information</h3>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={e => handleInputChange('name', e.target.value)}
                      required
                      className="bg-input border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={e => handleInputChange('email', e.target.value)}
                      required
                      className="bg-input border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={e => handleInputChange('password', e.target.value)}
                      required
                      className="bg-input border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={e => handleInputChange('phone', e.target.value)}
                      required
                      className="bg-input border-border"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">Primary Vehicle</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleMake">Make</Label>
                    <Select onValueChange={value => handleInputChange('vehicleMake', value)}>
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Select make" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="toyota">Toyota</SelectItem>
                        <SelectItem value="honda">Honda</SelectItem>
                        <SelectItem value="ford">Ford</SelectItem>
                        <SelectItem value="chevrolet">Chevrolet</SelectItem>
                        <SelectItem value="bmw">BMW</SelectItem>
                        <SelectItem value="mercedes">Mercedes-Benz</SelectItem>
                        <SelectItem value="audi">Audi</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicleModel">Model</Label>
                    <Input
                      id="vehicleModel"
                      placeholder="e.g., Camry"
                      value={formData.vehicleModel}
                      onChange={e => handleInputChange('vehicleModel', e.target.value)}
                      required
                      className="bg-input border-border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleYear">Year</Label>
                    <Select onValueChange={value => handleInputChange('vehicleYear', value)}>
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 25 }, (_, i) => 2024 - i).map(year => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={checked => setAcceptTerms(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground">
                  I agree to the{' '}
                  <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80">
                    Terms of Service
                  </Button>{' '}
                  and{' '}
                  <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80">
                    Privacy Policy
                  </Button>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading || !acceptTerms}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary hover:text-primary/80"
                  onClick={() => router.push('/login')}
                >
                  Sign in
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
