'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Separator } from '@/components/ui/separator'
import {
  Car,
  CalendarIcon,
  Clock,
  Wrench,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Plus,
} from 'lucide-react'
import { LiveProgress } from '@/components/real-time/live-progress'
import { useCustomerDashboard } from '@/hooks/useCustomerDashboard'

export default function CustomerDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const {
    stats,
    activeServices,
    upcomingAppointments,
    nextService,
    recentNotifications,
    isLoading,
    error,
  } = useCustomerDashboard()

  const totalVehicles = stats?.totalVehicles ?? 0
  const activeServicesCount = stats?.activeServices ?? 0
  const completedServices = stats?.completedServices ?? 0

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
          <p className="text-muted-foreground">Here's what's happening with your vehicles today.</p>
        </div>
        <div className="flex space-x-2">
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => (window.location.href = '/customer/appointments')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Book Service
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = '/customer/projects')}>
            <Wrench className="mr-2 h-4 w-4" />
            Request Project
          </Button>
        </div>
      </div>

      {/* ✅ Stats Section - uses same logic as AdminDashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Active Services */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : error ? (
              <div className="text-sm text-red-500">Error loading</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{activeServicesCount}</div>
                <p className="text-xs text-muted-foreground">
                  {activeServicesCount > 0 ? `${activeServicesCount} currently active` : 'No active services'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Completed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : error ? (
              <div className="text-sm text-red-500">Error loading</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{completedServices}</div>
                <p className="text-xs text-muted-foreground">
                  {completedServices === 1 ? 'service completed' : 'services completed'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* ✅ Vehicles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : error ? (
              <div className="text-sm text-red-500">Error loading</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{totalVehicles}</div>
                <p className="text-xs text-muted-foreground">Registered</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Next Service */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Next Service</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : error ? (
              <div className="text-sm text-red-500">Error loading</div>
            ) : nextService ? (
              <>
                <div className="text-2xl font-bold">
                  {new Date(nextService.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                <p className="text-xs text-muted-foreground">{nextService.service}</p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">No upcoming service</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Services & Projects */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wrench className="h-5 w-5" />
                <span>Current Services & Projects</span>
              </CardTitle>
              <CardDescription>
                Track the progress of your ongoing services in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LiveProgress services={activeServices} />
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5" />
                <span>Upcoming Appointments</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading appointments...</div>
              ) : error ? (
                <div className="text-sm text-red-500">Error loading appointments</div>
              ) : upcomingAppointments.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No upcoming appointments. Book a service to get started!
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <CalendarIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{appointment.service}</h4>
                          <p className="text-sm text-muted-foreground">{appointment.vehicle}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {new Date(appointment.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">{appointment.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Recent Updates</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading notifications...</div>
              ) : recentNotifications.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No recent updates
                </div>
              ) : (
                <div className="space-y-3">
                  {recentNotifications.map((notification, index) => (
                    <div key={notification.id}>
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            notification.type === 'success'
                              ? 'bg-green-500'
                              : notification.type === 'info'
                                ? 'bg-blue-500'
                                : 'bg-yellow-500'
                          }`}
                        />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">{notification.time}</p>
                        </div>
                      </div>
                      {index < recentNotifications.length - 1 && <Separator className="my-3" />}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
