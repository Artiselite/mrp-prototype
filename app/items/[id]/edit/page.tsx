"use client"

import { useState, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { 
  Package, ArrowLeft, Save, X
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useDatabaseContext } from "@/components/database-provider"
import type { Item, Location } from "@/lib/types"

function EditItemContent() {
  const params = useParams()
  const router = useRouter()
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

  const { items = [], locations = [], updateItem, isInitialized, isLoading: dbLoading } = databaseContext
  
  // Show loading state while database is initializing
  if (dbLoading || !isInitialized) {
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

  const [formData, setFormData] = useState({
    partNumber: item?.partNumber || "",
    description: item?.description || "",
    category: item?.category || "",
    unit: item?.unit || "",
    currentStock: item?.currentStock || 0,
    minStock: item?.minStock || 0,
    maxStock: item?.maxStock || 0,
    unitCost: item?.unitCost || 0,
    location: item?.location || "",
    status: item?.status || "Active",
    notes: item?.notes || ""
  })

  const [isLoading, setIsLoading] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const updatedItem = {
        ...item,
        ...formData,
        updatedAt: new Date().toISOString()
      }

      updateItem(item.id, updatedItem)
      router.push(`/items/${item.id}`)
    } catch (error) {
      console.error("Error updating item:", error)
      alert("Failed to update item. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href={`/items/${item.id}`} className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Item
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Item</h1>
        <p className="text-gray-600 mt-1">Update item information and settings</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="partNumber">Part Number *</Label>
                <Input
                  id="partNumber"
                  value={formData.partNumber}
                  onChange={(e) => handleChange("partNumber", e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Select value={formData.unit} onValueChange={(value) => handleChange("unit", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EA">Each (EA)</SelectItem>
                    <SelectItem value="FT">Feet (FT)</SelectItem>
                    <SelectItem value="M">Meters (M)</SelectItem>
                    <SelectItem value="KG">Kilograms (KG)</SelectItem>
                    <SelectItem value="LB">Pounds (LB)</SelectItem>
                    <SelectItem value="L">Liters (L)</SelectItem>
                    <SelectItem value="GAL">Gallons (GAL)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stock & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentStock">Current Stock</Label>
                <Input
                  id="currentStock"
                  type="number"
                  min="0"
                  value={formData.currentStock}
                  onChange={(e) => handleChange("currentStock", parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <Label htmlFor="minStock">Minimum Stock</Label>
                <Input
                  id="minStock"
                  type="number"
                  min="0"
                  value={formData.minStock}
                  onChange={(e) => handleChange("minStock", parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <Label htmlFor="maxStock">Maximum Stock</Label>
                <Input
                  id="maxStock"
                  type="number"
                  min="0"
                  value={formData.maxStock}
                  onChange={(e) => handleChange("maxStock", parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Select value={formData.location} onValueChange={(value) => handleChange("location", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location: Location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name} - {location.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="unitCost">Unit Cost ($)</Label>
                <Input
                  id="unitCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unitCost}
                  onChange={(e) => handleChange("unitCost", parseFloat(e.target.value) || 0)}
                />
              </div>
              
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Link href={`/items/${item.id}`}>
            <Button type="button" variant="outline">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function EditItemPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditItemContent />
    </Suspense>
  )
}
