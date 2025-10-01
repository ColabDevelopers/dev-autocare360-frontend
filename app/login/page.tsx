'use client'

import type React from 'react'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Car, Wrench, Shield, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    console.log('[v0] Login attempt with email:', email)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mock authentication - in real app, validate credentials
    if (email && password) {
      // Store user role in localStorage for demo
      const role = email.includes('admin')
        ? 'admin'
        : email.includes('employee')
          ? 'employee'
          : 'customer'
      console.log('[v0] Determined role:', role, 'for email:', email)

      try {
        localStorage.setItem('userRole', role)
        localStorage.setItem('userEmail', email)

        // Verify storage was successful
        const storedRole = localStorage.getItem('userRole')
        const storedEmail = localStorage.getItem('userEmail')

        console.log('[v0] Stored in localStorage - role:', storedRole, 'email:', storedEmail)

        // Add a small delay to ensure localStorage is fully committed
        await new Promise(resolve => setTimeout(resolve, 100))

        // Redirect based on role
        if (role === 'admin') {
          console.log('[v0] Redirecting to admin dashboard')
          router.push('/admin/dashboard')
        } else if (role === 'employee') {
          console.log('[v0] Redirecting to employee dashboard')
          router.push('/employee/dashboard')
        } else {
          console.log('[v0] Redirecting to customer dashboard')
          router.push('/customer/dashboard')
        }
      } catch (error) {
        console.error('[v0] Error storing authentication data:', error)
      }
    } else {
      console.log('[v0] Login failed - missing email or password')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-card p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="relative">
              <Car className="h-8 w-8 text-primary" />
              <Wrench className="h-4 w-4 text-accent absolute -bottom-1 -right-1" />
            </div>
            <h1 className="text-2xl font-bold text-balance">AutoCare360</h1>
          </div>
          <p className="text-muted-foreground text-balance">
            Professional service management system
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-border/50 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center text-balance">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="bg-input border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="bg-input border-border"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={checked => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm text-muted-foreground">
                  Remember me
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button variant="outline" className="w-full bg-transparent" type="button">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77C17.45 20.53 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                New customer?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary hover:text-primary/80"
                  onClick={() => router.push('/signup')}
                >
                  Create an account
                </Button>
              </p>
              <Button
                variant="link"
                className="p-0 h-auto text-sm text-muted-foreground hover:text-foreground"
              >
                Forgot your password?
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="border-accent/20 bg-accent/5">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-accent mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-accent">Demo Credentials</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Customer: customer@demo.com</p>
                  <p>Employee: employee@demo.com</p>
                  <p>Admin: admin@demo.com</p>
                  <p>Password: any password</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
