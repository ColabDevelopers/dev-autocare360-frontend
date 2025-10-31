// 'use client'

// import { useState } from 'react'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Badge } from '@/components/ui/badge'
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'
// import { Car, Plus, Edit, Trash2, Calendar, Wrench } from 'lucide-react'

// // Mock data
// const mockVehicles = [
//   {
//     id: 1,
//     make: 'Toyota',
//     model: 'Camry',
//     year: 2020,
//     plate: 'ABC-1234',
//     vin: '1HGBH41JXMN109186',
//     color: 'Silver',
//     mileage: 45000,
//     lastService: '2024-01-10',
//     nextService: '2024-04-10',
//     status: 'Active',
//   },
//   {
//     id: 2,
//     make: 'Honda',
//     model: 'Civic',
//     year: 2019,
//     plate: 'XYZ-5678',
//     vin: '2HGFC2F59JH123456',
//     color: 'Blue',
//     mileage: 52000,
//     lastService: '2023-12-15',
//     nextService: '2024-03-15',
//     status: 'Active',
//   },
// ]

// export default function VehiclesPage() {
//   const [vehicles, setVehicles] = useState(mockVehicles)
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
//   const [newVehicle, setNewVehicle] = useState({
//     make: '',
//     model: '',
//     year: '',
//     plate: '',
//     vin: '',
//     color: '',
//     mileage: '',
//   })

//   const handleAddVehicle = () => {
//     const vehicle = {
//       id: vehicles.length + 1,
//       ...newVehicle,
//       year: Number.parseInt(newVehicle.year),
//       mileage: Number.parseInt(newVehicle.mileage),
//       lastService: 'N/A',
//       nextService: 'TBD',
//       status: 'Active',
//     }
//     setVehicles([...vehicles, vehicle])
//     setNewVehicle({
//       make: '',
//       model: '',
//       year: '',
//       plate: '',
//       vin: '',
//       color: '',
//       mileage: '',
//     })
//     setIsAddDialogOpen(false)
//   }

//   const handleDeleteVehicle = (id: number) => {
//     setVehicles(vehicles.filter(v => v.id !== id))
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-foreground text-balance">My Vehicles</h1>
//           <p className="text-muted-foreground text-balance">
//             Manage your registered vehicles and their service history.
//           </p>
//         </div>
//         <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//           <DialogTrigger asChild>
//             <Button className="bg-primary hover:bg-primary/90">
//               <Plus className="mr-2 h-4 w-4" />
//               Add Vehicle
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="sm:max-w-[500px]">
//             <DialogHeader>
//               <DialogTitle>Add New Vehicle</DialogTitle>
//               <DialogDescription>
//                 Enter your vehicle details to add it to your account.
//               </DialogDescription>
//             </DialogHeader>
//             <div className="grid gap-4 py-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="make">Make</Label>
//                   <Select onValueChange={value => setNewVehicle({ ...newVehicle, make: value })}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select make" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="toyota">Toyota</SelectItem>
//                       <SelectItem value="honda">Honda</SelectItem>
//                       <SelectItem value="ford">Ford</SelectItem>
//                       <SelectItem value="chevrolet">Chevrolet</SelectItem>
//                       <SelectItem value="bmw">BMW</SelectItem>
//                       <SelectItem value="mercedes">Mercedes-Benz</SelectItem>
//                       <SelectItem value="audi">Audi</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="model">Model</Label>
//                   <Input
//                     id="model"
//                     value={newVehicle.model}
//                     onChange={e => setNewVehicle({ ...newVehicle, model: e.target.value })}
//                     placeholder="e.g., Camry"
//                   />
//                 </div>
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="year">Year</Label>
//                   <Select onValueChange={value => setNewVehicle({ ...newVehicle, year: value })}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select year" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {Array.from({ length: 25 }, (_, i) => 2024 - i).map(year => (
//                         <SelectItem key={year} value={year.toString()}>
//                           {year}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="plate">License Plate</Label>
//                   <Input
//                     id="plate"
//                     value={newVehicle.plate}
//                     onChange={e =>
//                       setNewVehicle({ ...newVehicle, plate: e.target.value.toUpperCase() })
//                     }
//                     placeholder="e.g., ABC-1234"
//                   />
//                 </div>
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="vin">VIN</Label>
//                 <Input
//                   id="vin"
//                   value={newVehicle.vin}
//                   onChange={e =>
//                     setNewVehicle({ ...newVehicle, vin: e.target.value.toUpperCase() })
//                   }
//                   placeholder="17-character VIN"
//                   maxLength={17}
//                 />
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="color">Color</Label>
//                   <Input
//                     id="color"
//                     value={newVehicle.color}
//                     onChange={e => setNewVehicle({ ...newVehicle, color: e.target.value })}
//                     placeholder="e.g., Silver"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="mileage">Current Mileage</Label>
//                   <Input
//                     id="mileage"
//                     type="number"
//                     value={newVehicle.mileage}
//                     onChange={e => setNewVehicle({ ...newVehicle, mileage: e.target.value })}
//                     placeholder="e.g., 45000"
//                   />
//                 </div>
//               </div>
//             </div>
//             <div className="flex justify-end space-x-2">
//               <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
//                 Cancel
//               </Button>
//               <Button onClick={handleAddVehicle} className="bg-primary hover:bg-primary/90">
//                 Add Vehicle
//               </Button>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {/* Vehicles Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {vehicles.map(vehicle => (
//           <Card key={vehicle.id} className="border-border/50">
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <div className="bg-primary/10 p-2 rounded-lg">
//                     <Car className="h-6 w-6 text-primary" />
//                   </div>
//                   <div>
//                     <CardTitle className="text-lg">
//                       {vehicle.year} {vehicle.make} {vehicle.model}
//                     </CardTitle>
//                     <CardDescription>
//                       {vehicle.plate} • {vehicle.color}
//                     </CardDescription>
//                   </div>
//                 </div>
//                 <Badge variant="secondary" className="bg-green-500/10 text-green-500">
//                   {vehicle.status}
//                 </Badge>
//               </div>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-2 gap-4 text-sm">
//                 <div>
//                   <p className="text-muted-foreground">VIN</p>
//                   <p className="font-mono">{vehicle.vin}</p>
//                 </div>
//                 <div>
//                   <p className="text-muted-foreground">Mileage</p>
//                   <p>{vehicle.mileage.toLocaleString()} miles</p>
//                 </div>
//                 <div>
//                   <p className="text-muted-foreground">Last Service</p>
//                   <p>{vehicle.lastService}</p>
//                 </div>
//                 <div>
//                   <p className="text-muted-foreground">Next Service</p>
//                   <p>{vehicle.nextService}</p>
//                 </div>
//               </div>

//               <div className="flex space-x-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => {
//                     console.log('[v0] Edit vehicle clicked for:', vehicle.id)
//                     // TODO: Implement edit vehicle functionality
//                   }}
//                 >
//                   <Edit className="mr-1 h-3 w-3" />
//                   Edit
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => {
//                     console.log('[v0] Book service clicked for vehicle:', vehicle.id)
//                     // TODO: Navigate to appointments page with vehicle pre-selected
//                     window.location.href = '/customer/appointments'
//                   }}
//                 >
//                   <Calendar className="mr-1 h-3 w-3" />
//                   Book Service
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => {
//                     console.log('[v0] Request project clicked for vehicle:', vehicle.id)
//                     // TODO: Navigate to projects page with vehicle pre-selected
//                     window.location.href = '/customer/projects'
//                   }}
//                 >
//                   <Wrench className="mr-1 h-3 w-3" />
//                   Request Project
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => handleDeleteVehicle(vehicle.id)}
//                   className="text-destructive hover:text-destructive"
//                 >
//                   <Trash2 className="mr-1 h-3 w-3" />
//                   Delete
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Service History Table */}
//       <Card className="border-border/50">
//         <CardHeader>
//           <CardTitle>Service History</CardTitle>
//           <CardDescription>
//             Complete history of all services performed on your vehicles
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Date</TableHead>
//                 <TableHead>Vehicle</TableHead>
//                 <TableHead>Service</TableHead>
//                 <TableHead>Technician</TableHead>
//                 <TableHead>Cost</TableHead>
//                 <TableHead>Status</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               <TableRow>
//                 <TableCell>2024-01-10</TableCell>
//                 <TableCell>2020 Toyota Camry</TableCell>
//                 <TableCell>Oil Change</TableCell>
//                 <TableCell>Mike Johnson</TableCell>
//                 <TableCell>$45.00</TableCell>
//                 <TableCell>
//                   <Badge variant="secondary" className="bg-green-500/10 text-green-500">
//                     Completed
//                   </Badge>
//                 </TableCell>
//               </TableRow>
//               <TableRow>
//                 <TableCell>2023-12-15</TableCell>
//                 <TableCell>2019 Honda Civic</TableCell>
//                 <TableCell>Brake Inspection</TableCell>
//                 <TableCell>Sarah Wilson</TableCell>
//                 <TableCell>$120.00</TableCell>
//                 <TableCell>
//                   <Badge variant="secondary" className="bg-green-500/10 text-green-500">
//                     Completed
//                   </Badge>
//                 </TableCell>
//               </TableRow>
//               <TableRow>
//                 <TableCell>2023-11-20</TableCell>
//                 <TableCell>2020 Toyota Camry</TableCell>
//                 <TableCell>Tire Rotation</TableCell>
//                 <TableCell>Alex Rodriguez</TableCell>
//                 <TableCell>$35.00</TableCell>
//                 <TableCell>
//                   <Badge variant="secondary" className="bg-green-500/10 text-green-500">
//                     Completed
//                   </Badge>
//                 </TableCell>
//               </TableRow>
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
