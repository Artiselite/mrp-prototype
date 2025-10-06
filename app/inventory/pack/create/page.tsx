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
  ArrowLeft, Save, Plus, Trash2, ClipboardCheck, Package, 
  Clock, User, AlertCircle, CheckCircle, Truck, Ruler
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useDatabaseContext } from "@/components/database-provider"
import type { PackTask, Item, PackItem } from "@/lib/types"

function CreatePackContent() {
  const router = useRouter()
  const databaseContext = useDatabaseContext()
  
  if (!databaseContext) {
    return (
      <div className="p-8">
        <div className="text-center">
          <ClipboardCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Database Error</h1>
          <p className="text-gray-600 mb-4">Unable to connect to database.</p>
        </div>
      </div>
    )
  }

  const { items = [], createPackTask, isInitialized, isLoading } = databaseContext
  
  if (isLoading || !isInitialized) {
    return (
      <div className="p-8">
        <div className="text-center">
          <ClipboardCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
          <p className="text-gray-600 mb-4">Please wait while we load the data.</p>
        </div>
      </div>
    )
  }

  const [formData, setFormData] = useState({
    operationId: `OP-${Date.now()}`,
    orderId: "",
    orderNumber: "",
    customerName: "",
    packagingType: "Standard Box",
    packagingMaterials: [] as string[],
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0
    },
    status: "Pending" as const,
    packedBy: "",
    notes: ""
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [packItems, setPackItems] = useState<PackItem[]>([])

  const packagingTypes = [
    "Standard Box",
    "Custom Box",
    "Pallet",
    "Crate",
    "Envelope",
    "Tube",
    "Bag"
  ]

  const packagingMaterials = [
    "Bubble Wrap",
    "Foam Padding",
    "Cardboard",
    "Plastic Wrap",
    "Packing Peanuts",
    "Tape",
    "Straps",
    "Labels"
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (packItems.length === 0) {
      alert("Please add at least one item to pack")
      return
    }

    setIsSubmitting(true)

    try {
      const newTask: Omit<PackTask, 'id' | 'createdAt' | 'updatedAt'> = {
        ...formData,
        items: packItems,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      createPackTask(newTask)
      router.push("/inventory")
    } catch (error) {
      console.error("Error creating pack task:", error)
      alert("Failed to create pack task. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    if (field.startsWith('dimensions.')) {
      const dimension = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [dimension]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleMaterialToggle = (material: string) => {
    setFormData(prev => ({
      ...prev,
      packagingMaterials: prev.packagingMaterials.includes(material)
        ? prev.packagingMaterials.filter(m => m !== material)
        : [...prev.packagingMaterials, material]
    }))
  }

  const addPackItem = () => {
    const newItem: PackItem = {
      id: `pack-item-${Date.now()}`,
      itemId: "",
      partNumber: "",
      description: "",
      quantity: 0,
      unit: "EA",
      packedQuantity: 0,
      status: "Pending" as const
    }
    setPackItems(prev => [...prev, newItem])
  }

  const updatePackItem = (id: string, field: string, value: any) => {
    setPackItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const removePackItem = (id: string) => {
    setPackItems(prev => prev.filter(item => item.id !== id))
  }

  const calculateVolume = () => {
    const { length, width, height } = formData.dimensions
    return length * width * height
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/inventory" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Inventory
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create Pack Task</h1>
        <p className="text-gray-600 mt-1">Create a new pack task to prepare items for shipment</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5" />
                Pack Task Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="orderNumber">Order Number</Label>
                  <Input
                    id="orderNumber"
                    value={formData.orderNumber}
                    onChange={(e) => handleChange("orderNumber", e.target.value)}
                    placeholder="e.g., SO-2024-001"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleChange("customerName", e.target.value)}
                  placeholder="Enter customer name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="packagingType">Packaging Type</Label>
                <Select 
                  value={formData.packagingType} 
                  onValueChange={(value) => handleChange("packagingType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select packaging type" />
                  </SelectTrigger>
                  <SelectContent>
                    {packagingTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Packaging Materials</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {packagingMaterials.map(material => (
                    <label key={material} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.packagingMaterials.includes(material)}
                        onChange={() => handleMaterialToggle(material)}
                        className="rounded"
                      />
                      <span className="text-sm">{material}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => handleChange("weight", parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label>Dimensions (cm)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="length" className="text-xs">Length</Label>
                    <Input
                      id="length"
                      type="number"
                      min="0"
                      value={formData.dimensions.length}
                      onChange={(e) => handleChange("dimensions.length", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="width" className="text-xs">Width</Label>
                    <Input
                      id="width"
                      type="number"
                      min="0"
                      value={formData.dimensions.width}
                      onChange={(e) => handleChange("dimensions.width", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="height" className="text-xs">Height</Label>
                    <Input
                      id="height"
                      type="number"
                      min="0"
                      value={formData.dimensions.height}
                      onChange={(e) => handleChange("dimensions.height", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                {calculateVolume() > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    Volume: {calculateVolume().toFixed(2)} cm³
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="packedBy">Packed By</Label>
                <Input
                  id="packedBy"
                  value={formData.packedBy}
                  onChange={(e) => handleChange("packedBy", e.target.value)}
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
            </CardContent>
          </Card>

          {/* Pack Items and Instructions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Items to Pack ({packItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {packItems.map((item, index) => (
                    <div key={item.id} className="p-3 border rounded-lg">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <Label htmlFor={`partNumber-${item.id}`} className="text-xs">Part Number</Label>
                          <Input
                            id={`partNumber-${item.id}`}
                            value={item.partNumber}
                            onChange={(e) => updatePackItem(item.id, "partNumber", e.target.value)}
                            placeholder="Part number"
                            size={1}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`quantity-${item.id}`} className="text-xs">Quantity</Label>
                          <Input
                            id={`quantity-${item.id}`}
                            type="number"
                            min="0"
                            value={item.quantity}
                            onChange={(e) => updatePackItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                            size={1}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <Label htmlFor={`description-${item.id}`} className="text-xs">Description</Label>
                          <Input
                            id={`description-${item.id}`}
                            value={item.description}
                            onChange={(e) => updatePackItem(item.id, "description", e.target.value)}
                            placeholder="Item description"
                            size={1}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`unit-${item.id}`} className="text-xs">Unit</Label>
                          <Input
                            id={`unit-${item.id}`}
                            value={item.unit}
                            onChange={(e) => updatePackItem(item.id, "unit", e.target.value)}
                            placeholder="EA"
                            size={1}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="text-xs">
                          {item.status}
                        </Badge>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removePackItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    onClick={addPackItem}
                    className="w-full"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item to Pack
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Pack Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Verify all items are present and correct</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Use appropriate packaging materials</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Ensure items are properly protected</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Apply shipping labels and documentation</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="w-5 h-5" />
                  Package Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Items:</span>
                    <Badge variant="outline">{packItems.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Quantity:</span>
                    <Badge variant="outline">
                      {packItems.reduce((sum, item) => sum + item.quantity, 0)} units
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Weight:</span>
                    <Badge variant="outline">{formData.weight} kg</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Volume:</span>
                    <Badge variant="outline">{calculateVolume().toFixed(2)} cm³</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Packaging:</span>
                    <Badge variant="outline">{formData.packagingType}</Badge>
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
          <Button type="submit" disabled={isSubmitting || packItems.length === 0}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Creating..." : "Create Pack Task"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function CreatePackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreatePackContent />
    </Suspense>
  )
}
