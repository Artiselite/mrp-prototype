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
  ArrowLeft, Save, Plus, Trash2, Truck, Package, 
  Clock, User, AlertCircle, CheckCircle, MapPin, DollarSign
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useDatabaseContext } from "@/components/database-provider"
import type { Shipment, ShipmentItem, Address } from "@/lib/types"

function CreateShipmentContent() {
  const router = useRouter()
  const databaseContext = useDatabaseContext()
  
  if (!databaseContext) {
    return (
      <div className="p-8">
        <div className="text-center">
          <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Database Error</h1>
          <p className="text-gray-600 mb-4">Unable to connect to database.</p>
        </div>
      </div>
    )
  }

  const { items = [], createShipment, isInitialized, isLoading } = databaseContext
  
  if (isLoading || !isInitialized) {
    return (
      <div className="p-8">
        <div className="text-center">
          <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
          <p className="text-gray-600 mb-4">Please wait while we load the data.</p>
        </div>
      </div>
    )
  }

  const [formData, setFormData] = useState({
    shipmentNumber: `SH-${Date.now()}`,
    orderId: "",
    orderNumber: "",
    customerId: "",
    customerName: "",
    carrier: "",
    trackingNumber: "",
    shippingMethod: "Standard",
    status: "Pending" as const,
    scheduledDate: new Date().toISOString().split('T')[0],
    shippingAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA",
      contactPerson: "",
      phone: "",
      email: ""
    } as Address,
    billingAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA"
    } as Address,
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0
    },
    shippingCost: 0,
    insuranceValue: 0,
    specialInstructions: ""
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shipmentItems, setShipmentItems] = useState<ShipmentItem[]>([])

  const carriers = [
    "FedEx",
    "UPS",
    "DHL",
    "USPS",
    "Amazon Logistics",
    "Local Courier"
  ]

  const shippingMethods = [
    "Standard",
    "Express",
    "Overnight",
    "2-Day",
    "Ground",
    "Air"
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (shipmentItems.length === 0) {
      alert("Please add at least one item to the shipment")
      return
    }

    setIsSubmitting(true)

    try {
      const newShipment: Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'> = {
        ...formData,
        items: shipmentItems,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      createShipment(newShipment)
      router.push("/inventory")
    } catch (error) {
      console.error("Error creating shipment:", error)
      alert("Failed to create shipment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    if (field.startsWith('shippingAddress.') || field.startsWith('billingAddress.')) {
      const [addressType, addressField] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [addressType]: {
          ...prev[addressType as keyof typeof prev] as Address,
          [addressField]: value
        }
      }))
    } else if (field.startsWith('dimensions.')) {
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

  const addShipmentItem = () => {
    const newItem: ShipmentItem = {
      id: `shipment-item-${Date.now()}`,
      itemId: "",
      partNumber: "",
      description: "",
      quantity: 0,
      unit: "EA",
      unitPrice: 0,
      totalPrice: 0,
      packedQuantity: 0,
      shippedQuantity: 0
    }
    setShipmentItems(prev => [...prev, newItem])
  }

  const updateShipmentItem = (id: string, field: string, value: any) => {
    setShipmentItems(prev => prev.map(item => {
      const updated = { ...item, [field]: value }
      if (field === 'quantity' || field === 'unitPrice') {
        updated.totalPrice = updated.quantity * updated.unitPrice
      }
      return updated
    }))
  }

  const removeShipmentItem = (id: string) => {
    setShipmentItems(prev => prev.filter(item => item.id !== id))
  }

  const calculateTotalValue = () => {
    return shipmentItems.reduce((sum, item) => sum + item.totalPrice, 0)
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
        <h1 className="text-3xl font-bold text-gray-900">Create Shipment</h1>
        <p className="text-gray-600 mt-1">Create a new shipment to dispatch items to customers</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Shipment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shipmentNumber">Shipment Number</Label>
                  <Input
                    id="shipmentNumber"
                    value={formData.shipmentNumber}
                    onChange={(e) => handleChange("shipmentNumber", e.target.value)}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="carrier">Carrier</Label>
                  <Select 
                    value={formData.carrier} 
                    onValueChange={(value) => handleChange("carrier", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select carrier" />
                    </SelectTrigger>
                    <SelectContent>
                      {carriers.map(carrier => (
                        <SelectItem key={carrier} value={carrier}>
                          {carrier}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="shippingMethod">Shipping Method</Label>
                  <Select 
                    value={formData.shippingMethod} 
                    onValueChange={(value) => handleChange("shippingMethod", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {shippingMethods.map(method => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="trackingNumber">Tracking Number</Label>
                  <Input
                    id="trackingNumber"
                    value={formData.trackingNumber}
                    onChange={(e) => handleChange("trackingNumber", e.target.value)}
                    placeholder="Auto-generated or manual"
                  />
                </div>
                <div>
                  <Label htmlFor="scheduledDate">Scheduled Date</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => handleChange("scheduledDate", e.target.value)}
                    required
                  />
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shippingCost">Shipping Cost ($)</Label>
                  <Input
                    id="shippingCost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.shippingCost}
                    onChange={(e) => handleChange("shippingCost", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="insuranceValue">Insurance Value ($)</Label>
                  <Input
                    id="insuranceValue"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.insuranceValue}
                    onChange={(e) => handleChange("insuranceValue", parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="specialInstructions">Special Instructions</Label>
                <Textarea
                  id="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={(e) => handleChange("specialInstructions", e.target.value)}
                  rows={3}
                  placeholder="Special handling instructions, delivery notes, etc."
                />
              </div>
            </CardContent>
          </Card>

          {/* Addresses and Items */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="shippingStreet">Street Address</Label>
                  <Input
                    id="shippingStreet"
                    value={formData.shippingAddress.street}
                    onChange={(e) => handleChange("shippingAddress.street", e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="shippingCity">City</Label>
                    <Input
                      id="shippingCity"
                      value={formData.shippingAddress.city}
                      onChange={(e) => handleChange("shippingAddress.city", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="shippingState">State</Label>
                    <Input
                      id="shippingState"
                      value={formData.shippingAddress.state}
                      onChange={(e) => handleChange("shippingAddress.state", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="shippingZip">ZIP Code</Label>
                    <Input
                      id="shippingZip"
                      value={formData.shippingAddress.zipCode}
                      onChange={(e) => handleChange("shippingAddress.zipCode", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="shippingCountry">Country</Label>
                    <Input
                      id="shippingCountry"
                      value={formData.shippingAddress.country}
                      onChange={(e) => handleChange("shippingAddress.country", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="shippingContact">Contact Person</Label>
                    <Input
                      id="shippingContact"
                      value={formData.shippingAddress.contactPerson}
                      onChange={(e) => handleChange("shippingAddress.contactPerson", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="shippingPhone">Phone</Label>
                    <Input
                      id="shippingPhone"
                      value={formData.shippingAddress.phone}
                      onChange={(e) => handleChange("shippingAddress.phone", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Shipment Items ({shipmentItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shipmentItems.map((item, index) => (
                    <div key={item.id} className="p-3 border rounded-lg">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <Label htmlFor={`partNumber-${item.id}`} className="text-xs">Part Number</Label>
                          <Input
                            id={`partNumber-${item.id}`}
                            value={item.partNumber}
                            onChange={(e) => updateShipmentItem(item.id, "partNumber", e.target.value)}
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
                            onChange={(e) => updateShipmentItem(item.id, "quantity", parseInt(e.target.value) || 0)}
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
                            onChange={(e) => updateShipmentItem(item.id, "description", e.target.value)}
                            placeholder="Item description"
                            size={1}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`unitPrice-${item.id}`} className="text-xs">Unit Price</Label>
                          <Input
                            id={`unitPrice-${item.id}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateShipmentItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                            size={1}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          <span className="font-medium">Total: ${item.totalPrice.toFixed(2)}</span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeShipmentItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    onClick={addShipmentItem}
                    className="w-full"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item to Shipment
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Shipment Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Items:</span>
                    <Badge variant="outline">{shipmentItems.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Value:</span>
                    <Badge variant="outline">${calculateTotalValue().toFixed(2)}</Badge>
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
                    <span className="text-sm font-medium">Shipping Cost:</span>
                    <Badge variant="outline">${formData.shippingCost.toFixed(2)}</Badge>
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
          <Button type="submit" disabled={isSubmitting || shipmentItems.length === 0}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Creating..." : "Create Shipment"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function CreateShipmentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateShipmentContent />
    </Suspense>
  )
}
