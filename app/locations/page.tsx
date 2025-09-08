"use client"

import { useState, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Plus, Search, Building, Warehouse, Package, Users, AlertTriangle, Hash, Home } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useDatabaseContext } from "@/components/database-provider"
import type { Location } from "@/lib/types"

function LocationsContent() {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all")

  const { locations = [] } = useDatabaseContext()

  const filteredLocations = locations.filter((location: Location) => {
    const matchesSearch =
      location.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || location.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getUtilizationStatus = (current: number, capacity: number) => {
    const percentage = (current / capacity) * 100
    if (percentage >= 90) return { status: "Critical", color: "bg-red-100 text-red-800" }
    if (percentage >= 80) return { status: "High", color: "bg-yellow-100 text-yellow-800" }
    if (percentage >= 60) return { status: "Moderate", color: "bg-blue-100 text-blue-800" }
    return { status: "Low", color: "bg-green-100 text-green-800" }
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      "Warehouse": "bg-blue-100 text-blue-800",
      "Rack": "bg-green-100 text-green-800",
      "Bin": "bg-purple-100 text-purple-800",
      "Office": "bg-orange-100 text-orange-800",
      "Outdoor": "bg-red-100 text-red-800",
      "Specialized": "bg-indigo-100 text-indigo-800"
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  const getSecurityColor = (level: string) => {
    const colors: Record<string, string> = {
      "High": "bg-red-100 text-red-800",
      "Medium": "bg-yellow-100 text-yellow-800",
      "Low": "bg-green-100 text-green-800"
    }
    return colors[level] || "bg-gray-100 text-gray-800"
  }

  const locationTypes = ["All", "Warehouse", "Rack", "Bin", "Office", "Outdoor", "Specialized"]

  const getLocationsByType = (type: string) => {
    if (type === "All") return filteredLocations
    return filteredLocations.filter((location: Location) => location.type === type)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 mb-2 block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Location Master</h1>
              <p className="text-sm text-gray-600">Manage warehouse locations, storage areas, and inventory placement</p>
            </div>
            <Link href="/locations/create">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Location
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by code, name, address, or contact person..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Locations Table with Type Tabs */}
        <Tabs defaultValue="All" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            {locationTypes.map((type) => (
              <TabsTrigger key={type} value={type}>
                {type}
              </TabsTrigger>
            ))}
          </TabsList>

          {locationTypes.map((type) => (
            <TabsContent key={type} value={type}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {type === "All" ? "All Locations" : `${type} Locations`} ({getLocationsByType(type).length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getLocationsByType(type).length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead>Utilization</TableHead>
                            <TableHead>Environment</TableHead>
                            <TableHead>Security</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getLocationsByType(type).map((location: Location) => {
                            const utilizationStatus = getUtilizationStatus(location.currentUtilization, location.capacity)
                            return (
                              <TableRow key={location.id}>
                                <TableCell className="font-mono font-medium">{location.code}</TableCell>
                                <TableCell className="font-medium">{location.name}</TableCell>
                                <TableCell>
                                  <Badge className={getTypeColor(location.type)}>
                                    {location.type}
                                  </Badge>
                                </TableCell>
                                <TableCell className="max-w-xs">
                                  <div className="text-sm">
                                    <div>{location.address}</div>
                                    <div className="text-gray-500">
                                      {location.city}, {location.state} {location.zipCode}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <div className="font-medium">{location.contactPerson}</div>
                                    <div className="text-gray-500">{location.phone}</div>
                                    <div className="text-gray-500">{location.email}</div>
                                  </div>
                                </TableCell>
                                <TableCell className="font-mono">
                                  {location.capacity.toLocaleString()} {location.type === "Warehouse" ? "sq ft" : "units"}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Badge className={utilizationStatus.color}>
                                      {utilizationStatus.status}
                                    </Badge>
                                    <span className="text-sm text-gray-600">
                                      {Math.round((location.currentUtilization / location.capacity) * 100)}%
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <div>{location.temperature}</div>
                                    <div className="text-gray-500">{location.humidity}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={getSecurityColor(location.securityLevel)}>
                                    {location.securityLevel}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-mono text-center">
                                  {location.items.toLocaleString()}
                                </TableCell>
                                <TableCell className="font-mono">
                                  ${location.value.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={location.status === "Active" ? "default" : "secondary"}>
                                    {location.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Link href={`/locations/${location.id}`}>
                                      <Button size="sm" variant="outline">
                                        View
                                      </Button>
                                    </Link>
                                    <Link href={`/locations/${location.id}/edit`}>
                                      <Button size="sm" variant="outline">
                                        Edit
                                      </Button>
                                    </Link>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No locations found</h3>
                      <p className="text-gray-600 mb-4">
                        {searchTerm || statusFilter !== "all"
                          ? "Try adjusting your search or filters"
                          : `No ${type === "All" ? "" : type.toLowerCase()} locations found`}
                      </p>
                      {!searchTerm && statusFilter === "all" && (
                        <Link href="/locations/create">
                          <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add First Location
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Summary Stats */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Summary Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{filteredLocations.length}</div>
                <div className="text-sm text-blue-800">Total Locations</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {filteredLocations.filter((location: Location) => location.status === "Active").length}
                </div>
                <div className="text-sm text-green-800">Active Locations</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {filteredLocations.filter((location: Location) =>
                    (location.currentUtilization / location.capacity) >= 0.8
                  ).length}
                </div>
                <div className="text-sm text-yellow-800">High Utilization</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  ${filteredLocations.reduce((sum: number, location: Location) => sum + location.value, 0).toLocaleString()}
                </div>
                <div className="text-sm text-purple-800">Total Location Value</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function LocationsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LocationsContent />
    </Suspense>
  )
}
