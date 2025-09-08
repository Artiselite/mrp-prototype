"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MapPin, ArrowLeft, Edit, Trash2, Building, Users, Package, DollarSign, AlertTriangle, Hash, Home, Search } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useDatabaseContext } from "@/components/database-provider"
import type { Location } from "@/lib/types"

export default function LocationDetailPage() {
    const params = useParams()
    const router = useRouter()
    const locationId = params.id as string

    const { locations = [], deleteLocation, items = [] } = useDatabaseContext()
    const location = locations.find(loc => loc.id === locationId)

    // Get items stored in this location
    const locationItems = items.filter(item => item.location === locationId)

    const [isLoading, setIsLoading] = useState(true)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    useEffect(() => {
        if (locations.length > 0) {
            setIsLoading(false)
        }
    }, [locations])

    const handleDelete = async () => {
        if (location) {
            try {
                await deleteLocation(location.id)
                router.push("/locations")
            } catch (error) {
                console.error("Error deleting location:", error)
            }
        }
    }

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
            "Low": "bg-green-100 text-green-800",
            "Restricted": "bg-purple-100 text-purple-800"
        }
        return colors[level] || "bg-gray-100 text-gray-800"
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading location data...</p>
                </div>
            </div>
        )
    }

    if (!location) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Location Not Found</h2>
                    <p className="text-gray-600 mb-4">The location you're looking for doesn't exist.</p>
                    <Link href="/locations">
                        <Button>
                            ← Back to Locations
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    const utilizationStatus = getUtilizationStatus(location.currentUtilization, location.capacity)
    const utilizationPercentage = Math.round((location.currentUtilization / location.capacity) * 100)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <Link href="/locations" className="text-sm text-blue-600 hover:text-blue-800 mb-2 block">
                                ← Back to Locations
                            </Link>
                            <div className="flex items-center gap-3">
                                <MapPin className="w-8 h-8 text-blue-600" />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">{location.name}</h1>
                                    <p className="text-sm text-gray-600">Location Code: {location.code}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link href={`/locations/${location.id}/edit`}>
                                <Button variant="outline">
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                            </Link>
                            <Button
                                variant="destructive"
                                onClick={() => setShowDeleteConfirm(true)}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="w-5 h-5" />
                                    Basic Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Location Code</label>
                                        <p className="text-lg font-mono">{location.code}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Type</label>
                                        <div className="mt-1">
                                            <Badge className={getTypeColor(location.type)}>
                                                {location.type}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Status</label>
                                        <div className="mt-1">
                                            <Badge variant={location.status === "Active" ? "default" : "secondary"}>
                                                {location.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Security Level</label>
                                        <div className="mt-1">
                                            <Badge className={getSecurityColor(location.securityLevel)}>
                                                {location.securityLevel}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Address Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    Address Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <p className="text-lg">{location.address}</p>
                                    <p className="text-gray-600">
                                        {location.city}, {location.state} {location.zipCode}
                                    </p>
                                    <p className="text-gray-600">{location.country}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Contact Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Contact Person</label>
                                        <p className="text-lg">{location.contactPerson}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Phone</label>
                                        <p className="text-lg">{location.phone}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Email</label>
                                        <p className="text-lg">{location.email}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Environmental Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Home className="w-5 h-5" />
                                    Environmental & Security Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Temperature</label>
                                        <p className="text-lg">{location.temperature}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Humidity</label>
                                        <p className="text-lg">{location.humidity}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                                    {/* Inventory Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Inventory ({locationItems.length} items)
                  </CardTitle>
                  <Link href="/items/create">
                    <Button size="sm">
                      <Package className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {/* Inventory Search and Filters */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex gap-4 items-center">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search items by part number, name, or category..."
                          className="pl-10"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const searchTerm = e.target.value.toLowerCase()
                            // You can implement search filtering here if needed
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Showing {locationItems.length} items in this location
                    </div>
                  </div>
                </div>
                                {locationItems.length > 0 ? (
                                    <div className="space-y-4">
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Part Number</TableHead>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead>Category</TableHead>
                                                        <TableHead>Current Stock</TableHead>
                                                        <TableHead>Unit Cost</TableHead>
                                                        <TableHead>Total Value</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead>Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {locationItems.map((item) => (
                                                        <TableRow key={item.id}>
                                                            <TableCell className="font-mono font-medium">{item.partNumber}</TableCell>
                                                            <TableCell className="font-medium">{item.name}</TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline">{item.category}</Badge>
                                                            </TableCell>
                                                            <TableCell className="font-mono">
                                                                {item.currentStock.toLocaleString()} {item.unit}
                                                            </TableCell>
                                                            <TableCell className="font-mono">${item.unitCost.toFixed(2)}</TableCell>
                                                            <TableCell className="font-mono font-medium">
                                                                ${(item.currentStock * item.unitCost).toFixed(2)}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    variant={item.status === "Active" ? "default" : "secondary"}
                                                                    className={item.status === "Discontinued" ? "bg-red-100 text-red-800" : ""}
                                                                >
                                                                    {item.status}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex gap-2">
                                                                    <Link href={`/items/${item.id}`}>
                                                                        <Button size="sm" variant="outline">
                                                                            View
                                                                        </Button>
                                                                    </Link>
                                                                    <Link href={`/items/${item.id}/edit`}>
                                                                        <Button size="sm" variant="outline">
                                                                            Edit
                                                                        </Button>
                                                                    </Link>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {/* Inventory Summary */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                <div className="text-lg font-semibold text-blue-600">{locationItems.length}</div>
                                                <div className="text-sm text-blue-800">Total Items</div>
                                            </div>
                                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                                <div className="text-lg font-semibold text-green-600">
                                                    {locationItems.reduce((sum, item) => sum + item.currentStock, 0).toLocaleString()}
                                                </div>
                                                <div className="text-sm text-green-800">Total Units</div>
                                            </div>
                                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                                                <div className="text-lg font-semibold text-purple-600">
                                                    ${locationItems.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0).toFixed(2)}
                                                </div>
                                                <div className="text-sm text-purple-800">Total Value</div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Inventory</h3>
                                        <p className="text-gray-600 mb-4">This location currently has no items stored.</p>
                                        <Link href="/items/create">
                                            <Button>
                                                <Package className="w-4 h-4 mr-2" />
                                                Add First Item
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Notes */}
                        {location.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Additional Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700">{location.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{location.capacity.toLocaleString()}</div>
                                    <div className="text-sm text-blue-800">
                                        {location.type === "Warehouse" ? "sq ft" : "units"} Capacity
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">{utilizationPercentage}%</div>
                                    <div className="text-sm text-green-800">Utilization</div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">{locationItems.length}</div>
                                    <div className="text-sm text-purple-800">Items Stored</div>
                                </div>
                                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                    <div className="text-2xl font-bold text-yellow-600">
                                        ${locationItems.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0).toFixed(2)}
                                    </div>
                                    <div className="text-sm text-yellow-800">Total Value</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Utilization Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    Utilization Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Current Usage</span>
                                        <span className="text-sm font-mono">{location.currentUtilization.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${utilizationPercentage >= 90
                                                    ? "bg-red-500"
                                                    : utilizationPercentage >= 80
                                                        ? "bg-yellow-500"
                                                        : utilizationPercentage >= 60
                                                            ? "bg-blue-500"
                                                            : "bg-green-500"
                                                }`}
                                            style={{ width: `${utilizationPercentage}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-center">
                                        <Badge className={utilizationStatus.color}>
                                            {utilizationStatus.status}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Link href={`/locations/${location.id}/edit`} className="w-full">
                                    <Button className="w-full" variant="outline">
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Location
                                    </Button>
                                </Link>
                                <Button
                                    className="w-full"
                                    variant="destructive"
                                    onClick={() => setShowDeleteConfirm(true)}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Location
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                            <h3 className="text-lg font-semibold">Delete Location</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete "{location.name}"? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
