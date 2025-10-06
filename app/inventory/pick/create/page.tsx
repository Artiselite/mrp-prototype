"use client"

import { useState, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, Save, Plus, Trash2, Target, MapPin, 
  Clock, User, AlertCircle, CheckCircle, Package
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useDatabaseContext } from "@/components/database-provider"
import type { PickTask, Item, Location } from "@/lib/types"

function CreatePickContent() {
  const router = useRouter()
  const databaseContext = useDatabaseContext()
  
  if (!databaseContext) {
    return (
      <div className="p-8">
        <div className="text-center">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Database Error</h1>
          <p className="text-gray-600 mb-4">Unable to connect to database.</p>
        </div>
      </div>
    )
  }

  const { items = [], locations = [], createPickTask, isInitialized, isLoading } = databaseContext
  
  if (isLoading || !isInitialized) {
    return (
      <div className="p-8">
        <div className="text-center">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
          <p className="text-gray-600 mb-4">Please wait while we load the data.</p>
        </div>
      </div>
    )
  }

  const [formData, setFormData] = useState({
    operationId: `OP-${Date.now()}`,
    itemId: "",
    partNumber: "",
    description: "",
    quantity: 0,
    unit: "EA",
    location: "",
    binLocation: "",
    pickedQuantity: 0,
    status: "Pending" as const,
    pickedBy: "",
    notes: ""
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [pickItems, setPickItems] = useState<Array<{
    id: string
    itemId: string
    partNumber: string
    description: string
    quantity: number
    unit: string
    location: string
    binLocation: string
  }>>([])

  const handleItemChange = (itemId: string) => {
    const item = items.find((item: Item) => item.id === itemId)
    setSelectedItem(item || null)
    setFormData(prev => ({
      ...prev,
      itemId,
      partNumber: item?.partNumber || "",
      description: item?.description || "",
      unit: item?.unit || "EA",
      location: item?.location || ""
    }))
  }

  const addPickItem = () => {
    if (!selectedItem || formData.quantity <= 0) return

    const newItem = {
      id: `pick-item-${Date.now()}`,
      itemId: formData.itemId,
      partNumber: formData.partNumber,
      description: formData.description,
      quantity: formData.quantity,
      unit: formData.unit,
      location: formData.location,
      binLocation: formData.binLocation
    }

    setPickItems(prev => [...prev, newItem])
    
    // Reset form
    setFormData(prev => ({
      ...prev,
      itemId: "",
      partNumber: "",
      description: "",
      quantity: 0,
      location: "",
      binLocation: ""
    }))
    setSelectedItem(null)
  }

  const removePickItem = (id: string) => {
    setPickItems(prev => prev.filter(item => item.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pickItems.length === 0) {
      alert("Please add at least one item to pick")
      return
    }

    setIsSubmitting(true)

    try {
      // Create a pick task for each item
      for (const item of pickItems) {
        const newTask: Omit<PickTask, 'id' | 'createdAt' | 'updatedAt'> = {
          operationId: formData.operationId,
          itemId: item.itemId,
          partNumber: item.partNumber,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          location: item.location,
          binLocation: item.binLocation,
          pickedQuantity: 0,
          status: "Pending" as const,
          pickedBy: formData.pickedBy,
          notes: formData.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        createPickTask(newTask)
      }

      router.push("/inventory")
    } catch (error) {
      console.error("Error creating pick tasks:", error)
      alert("Failed to create pick tasks. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const getBinLocation = (itemId: string) => {
    const item = items.find((item: Item) => item.id === itemId)
    if (item) {
      // Simple logic to suggest bin location
      const category = item.category.toLowerCase()
      if (category.includes('steel') || category.includes('metal')) {
        return "Bin-A1"
      } else if (category.includes('aluminum')) {
        return "Bin-B1"
      } else if (category.includes('plastic')) {
        return "Bin-C1"
      }
    }
    return "Bin-A1"
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/inventory" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Inventory
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create Pick List</h1>
        <p className="text-gray-600 mt-1">Create a new pick list to retrieve items from storage</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Pick List Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="operationId">Operation ID</Label>
                <Input
                  id="operationId"
                  value={formData.operationId}
                  onChange={(e) => handleChange("operationId", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="itemId">Item to Pick *</Label>
                <Select value={formData.itemId} onValueChange={handleItemChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select item to pick" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item: Item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.partNumber} - {item.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedItem && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Selected Item Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-blue-700">Part Number:</span>
                      <span className="ml-2">{selectedItem.partNumber}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Available Stock:</span>
                      <span className="ml-2">{selectedItem.currentStock}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Category:</span>
                      <span className="ml-2">{selectedItem.category}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Unit:</span>
                      <span className="ml-2">{selectedItem.unit}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity to Pick *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={selectedItem?.currentStock || 0}
                    value={formData.quantity}
                    onChange={(e) => handleChange("quantity", parseInt(e.target.value) || 0)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => handleChange("unit", e.target.value)}
                    disabled
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Storage Location</Label>
                  <Select 
                    value={formData.location} 
                    onValueChange={(value) => handleChange("location", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location: Location) => (
                        <SelectItem key={location.id} value={location.name}>
                          {location.name} - {location.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="binLocation">Bin Location</Label>
                  <div className="flex gap-2">
                    <Input
                      id="binLocation"
                      value={formData.binLocation}
                      onChange={(e) => handleChange("binLocation", e.target.value)}
                      placeholder="e.g., Bin-A1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const suggested = getBinLocation(formData.itemId)
                        handleChange("binLocation", suggested)
                      }}
                    >
                      Auto
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="pickedBy">Assigned To</Label>
                <Input
                  id="pickedBy"
                  value={formData.pickedBy}
                  onChange={(e) => handleChange("pickedBy", e.target.value)}
                  placeholder="Enter operator name"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={3}
                  placeholder="Additional notes or special instructions"
                />
              </div>

              <Button
                type="button"
                onClick={addPickItem}
                disabled={!selectedItem || formData.quantity <= 0}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to Pick List
              </Button>
            </CardContent>
          </Card>

          {/* Pick List Items */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Pick List Items ({pickItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pickItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No items added to pick list yet</p>
                    <p className="text-sm">Add items using the form on the left</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pickItems.map((item, index) => (
                      <div key={item.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium">{item.partNumber}</div>
                            <div className="text-sm text-gray-600">{item.description}</div>
                            <div className="text-sm text-gray-500">
                              Qty: {item.quantity} {item.unit} | Location: {item.location} | Bin: {item.binLocation}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removePickItem(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Pick Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Verify item details before picking</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Check item condition and quantity</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Update inventory levels after picking</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Place items in designated staging area</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Task Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Items:</span>
                    <Badge variant="outline">{pickItems.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Quantity:</span>
                    <Badge variant="outline">
                      {pickItems.reduce((sum, item) => sum + item.quantity, 0)} units
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      Pending
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Link href="/inventory">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting || pickItems.length === 0}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Creating..." : "Create Pick List"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function CreatePickPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreatePickContent />
    </Suspense>
  )
}
