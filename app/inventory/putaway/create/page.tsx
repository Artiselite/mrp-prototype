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
  ArrowLeft, Save, Plus, Trash2, Package, MapPin, 
  Clock, User, AlertCircle, CheckCircle
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useDatabaseContext } from "@/components/database-provider"
import type { PutawayTask, Item, Location } from "@/lib/types"

function CreatePutawayContent() {
  const router = useRouter()
  const databaseContext = useDatabaseContext()
  
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

  const { items = [], locations = [], createPutawayTask, isInitialized, isLoading } = databaseContext
  
  if (isLoading || !isInitialized) {
    return (
      <div className="p-8">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
    quantity: 0,
    receivedLocation: "Receiving Dock",
    suggestedLocation: "",
    status: "Pending" as const,
    putawayBy: "",
    notes: ""
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)

  const handleItemChange = (itemId: string) => {
    const item = items.find((item: Item) => item.id === itemId)
    setSelectedItem(item || null)
    setFormData(prev => ({
      ...prev,
      itemId,
      partNumber: item?.partNumber || ""
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const newTask: Omit<PutawayTask, 'id' | 'createdAt' | 'updatedAt'> = {
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      createPutawayTask(newTask)
      router.push("/inventory")
    } catch (error) {
      console.error("Error creating putaway task:", error)
      alert("Failed to create putaway task. Please try again.")
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

  const getSuggestedLocation = (itemId: string) => {
    const item = items.find((item: Item) => item.id === itemId)
    if (item) {
      // Simple logic to suggest location based on item category
      const category = item.category.toLowerCase()
      if (category.includes('steel') || category.includes('metal')) {
        return "Rack-1-Bin-1"
      } else if (category.includes('aluminum')) {
        return "Rack-2-Bin-1"
      } else if (category.includes('plastic')) {
        return "Rack-3-Bin-1"
      }
    }
    return "Rack-1-Bin-1"
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/inventory" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Inventory
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create Putaway Task</h1>
        <p className="text-gray-600 mt-1">Create a new putaway task to move items from receiving to storage</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Putaway Details
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
                <Label htmlFor="itemId">Item *</Label>
                <Select value={formData.itemId} onValueChange={handleItemChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select item to put away" />
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
                      <span className="text-blue-700">Category:</span>
                      <span className="ml-2">{selectedItem.category}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Current Stock:</span>
                      <span className="ml-2">{selectedItem.currentStock}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Unit:</span>
                      <span className="ml-2">{selectedItem.unit}</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="quantity">Quantity to Put Away *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleChange("quantity", parseInt(e.target.value) || 0)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="receivedLocation">Received Location</Label>
                <Select 
                  value={formData.receivedLocation} 
                  onValueChange={(value) => handleChange("receivedLocation", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select received location" />
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
                <Label htmlFor="suggestedLocation">Suggested Storage Location</Label>
                <div className="flex gap-2">
                  <Input
                    id="suggestedLocation"
                    value={formData.suggestedLocation}
                    onChange={(e) => handleChange("suggestedLocation", e.target.value)}
                    placeholder="e.g., Rack-1-Bin-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const suggested = getSuggestedLocation(formData.itemId)
                      handleChange("suggestedLocation", suggested)
                    }}
                  >
                    Auto Suggest
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="putawayBy">Assigned To</Label>
                <Input
                  id="putawayBy"
                  value={formData.putawayBy}
                  onChange={(e) => handleChange("putawayBy", e.target.value)}
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

          {/* Instructions and Status */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Verify item details match the physical items</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Check item condition before putting away</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Ensure storage location is clean and accessible</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Update inventory levels after completion</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Task Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      Pending
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Priority:</span>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      Normal
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Created:</span>
                    <span className="text-sm text-gray-600">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">From:</span> {formData.receivedLocation}
                  </div>
                  <div>
                    <span className="font-medium">To:</span> {formData.suggestedLocation || "Not specified"}
                  </div>
                  <div>
                    <span className="font-medium">Quantity:</span> {formData.quantity} units
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
          <Button type="submit" disabled={isSubmitting || !formData.itemId || formData.quantity <= 0}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Creating..." : "Create Putaway Task"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function CreatePutawayPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreatePutawayContent />
    </Suspense>
  )
}
