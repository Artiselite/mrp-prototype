"use client"

import { useState, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Package, ArrowLeft, MapPin, DollarSign, Calendar, 
  TrendingUp, AlertTriangle, Edit, Trash2
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useDatabaseContext } from "@/components/database-provider"
import type { Item, Location } from "@/lib/types"

function ItemDetailContent() {
  const params = useParams()
  const databaseContext = useDatabaseContext()
  
  // Add error handling for database context
  if (!databaseContext) {
    return (
      <div className="p-8">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Database Error</h1>
          <p className="text-gray-600 mb-4">Unable to connect to database.</p>
        </div>
      </div>
    )
  }

  const { items = [], locations = [], updateItem, deleteItem, isInitialized, isLoading } = databaseContext
  
  // Show loading state while database is initializing
  if (isLoading || !isInitialized) {
    return (
      <div className="p-8">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
          <p className="text-gray-600 mb-4">Please wait while we load the item details.</p>
        </div>
      </div>
    )
  }
  
  const item = items.find((item: Item) => item.id === params.id)
  const location = item ? locations.find((loc: Location) => loc.id === item.location) : null

  if (!item) {
    return (
      <div className="p-8">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Item Not Found</h1>
          <p className="text-gray-600 mb-4">The requested item could not be found.</p>
          <Link href="/items">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Items
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800"
      case "Inactive": return "bg-gray-100 text-gray-800"
      case "Discontinued": return "bg-red-100 text-red-800"
      default: return "bg-blue-100 text-blue-800"
    }
  }

  const getStockStatus = (currentStock: number, minStock: number) => {
    if (currentStock <= 0) return { status: "Out of Stock", color: "bg-red-100 text-red-800" }
    if (currentStock <= minStock) return { status: "Low Stock", color: "bg-yellow-100 text-yellow-800" }
    return { status: "In Stock", color: "bg-green-100 text-green-800" }
  }

  const stockStatus = getStockStatus(item.currentStock, item.minStock)

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/items" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Items
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{item.partNumber}</h1>
            <p className="text-lg text-gray-600 mt-1">{item.description}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/items/${item.id}/edit`}>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="text-red-600 hover:text-red-800"
              onClick={() => {
                if (confirm("Are you sure you want to delete this item?")) {
                  try {
                    const success = deleteItem(item.id)
                    if (success) {
                      window.location.href = "/items"
                    } else {
                      alert("Failed to delete item. Please try again.")
                    }
                  } catch (error) {
                    console.error("Error deleting item:", error)
                    alert("An error occurred while deleting the item.")
                  }
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Item Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Part Number</label>
                  <p className="text-lg font-semibold">{item.partNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-lg">{item.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Category</label>
                  <p className="text-lg">{item.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Unit</label>
                  <p className="text-lg">{item.unit}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Stock Status</label>
                  <Badge className={stockStatus.color}>
                    {stockStatus.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Unit Cost</label>
                  <p className="text-lg font-semibold">${item.unitCost.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Selling Price</label>
                  <p className="text-lg font-semibold">N/A</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Total Value</label>
                  <p className="text-lg font-semibold">${(item.currentStock * item.unitCost).toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Margin</label>
                  <p className="text-lg font-semibold">N/A</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location & Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Current Location</label>
                  <p className="text-lg">{location?.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">{location?.address || ''}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Current Stock</label>
                  <p className="text-2xl font-bold text-blue-600">{item.currentStock}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Minimum Stock</label>
                  <p className="text-lg">{item.minStock}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Maximum Stock</label>
                  <p className="text-lg">{item.maxStock}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Created</label>
                  <p className="text-sm">{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Updated</label>
                  <p className="text-sm">{new Date(item.updatedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Lead Time</label>
                  <p className="text-sm">{item.leadTime} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function ItemDetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ItemDetailContent />
    </Suspense>
  )
}
