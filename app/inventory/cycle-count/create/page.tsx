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
  Clock, User, AlertCircle, CheckCircle, MapPin, Calculator
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useDatabaseContext } from "@/components/database-provider"
import type { CycleCount, CycleCountItem, Item, Location } from "@/lib/types"

function CreateCycleCountContent() {
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

  const { items = [], locations = [], createCycleCount, isInitialized, isLoading } = databaseContext
  
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
    countNumber: `CC-${Date.now()}`,
    location: "",
    countType: "Random" as const,
    status: "Scheduled" as const,
    scheduledDate: new Date().toISOString().split('T')[0],
    countedBy: "",
    varianceThreshold: 5,
    notes: ""
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cycleCountItems, setCycleCountItems] = useState<CycleCountItem[]>([])

  const countTypes = [
    { value: "Full", label: "Full Count - All items in location" },
    { value: "Partial", label: "Partial Count - Selected items only" },
    { value: "ABC", label: "ABC Count - High-value items" },
    { value: "Random", label: "Random Count - Sample items" }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cycleCountItems.length === 0) {
      alert("Please add at least one item to count")
      return
    }

    setIsSubmitting(true)

    try {
      const newCycleCount: Omit<CycleCount, 'id' | 'createdAt' | 'updatedAt'> = {
        ...formData,
        items: cycleCountItems,
        totalVariance: 0,
        varianceValue: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      createCycleCount(newCycleCount)
      router.push("/inventory")
    } catch (error) {
      console.error("Error creating cycle count:", error)
      alert("Failed to create cycle count. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addCycleCountItem = () => {
    const newItem: CycleCountItem = {
      id: `cycle-item-${Date.now()}`,
      itemId: "",
      partNumber: "",
      description: "",
      expectedQuantity: 0,
      countedQuantity: 0,
      variance: 0,
      varianceValue: 0,
      status: "Pending" as const
    }
    setCycleCountItems(prev => [...prev, newItem])
  }

  const updateCycleCountItem = (id: string, field: string, value: any) => {
    setCycleCountItems(prev => prev.map(item => {
      const updated = { ...item, [field]: value }
      if (field === 'expectedQuantity' || field === 'countedQuantity') {
        updated.variance = updated.countedQuantity - updated.expectedQuantity
        // Assuming unit cost of 1 for variance calculation - should be improved
        updated.varianceValue = updated.variance * 1
      }
      return updated
    }))
  }

  const removeCycleCountItem = (id: string) => {
    setCycleCountItems(prev => prev.filter(item => item.id !== id))
  }

  const calculateTotalVariance = () => {
    return cycleCountItems.reduce((sum, item) => sum + item.variance, 0)
  }

  const calculateVarianceValue = () => {
    return cycleCountItems.reduce((sum, item) => sum + item.varianceValue, 0)
  }

  const getVarianceStatus = (variance: number, threshold: number) => {
    const absVariance = Math.abs(variance)
    if (absVariance === 0) return { status: "Perfect", color: "bg-green-100 text-green-800" }
    if (absVariance <= threshold) return { status: "Within Tolerance", color: "bg-blue-100 text-blue-800" }
    if (absVariance <= threshold * 2) return { status: "Minor Variance", color: "bg-yellow-100 text-yellow-800" }
    return { status: "Major Variance", color: "bg-red-100 text-red-800" }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/inventory" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Inventory
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create Cycle Count</h1>
        <p className="text-gray-600 mt-1">Create a new cycle count to audit inventory accuracy</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5" />
                Cycle Count Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="countNumber">Count Number</Label>
                <Input
                  id="countNumber"
                  value={formData.countNumber}
                  onChange={(e) => handleChange("countNumber", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Select 
                  value={formData.location} 
                  onValueChange={(value) => handleChange("location", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location to count" />
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
                <Label htmlFor="countType">Count Type</Label>
                <Select 
                  value={formData.countType} 
                  onValueChange={(value) => handleChange("countType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select count type" />
                  </SelectTrigger>
                  <SelectContent>
                    {countTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <Label htmlFor="varianceThreshold">Variance Threshold (%)</Label>
                  <Input
                    id="varianceThreshold"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.varianceThreshold}
                    onChange={(e) => handleChange("varianceThreshold", parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="countedBy">Counted By</Label>
                <Input
                  id="countedBy"
                  value={formData.countedBy}
                  onChange={(e) => handleChange("countedBy", e.target.value)}
                  placeholder="Enter counter name"
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

          {/* Items and Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Items to Count ({cycleCountItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cycleCountItems.map((item, index) => {
                    const varianceStatus = getVarianceStatus(item.variance, formData.varianceThreshold)
                    return (
                      <div key={item.id} className="p-3 border rounded-lg">
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <Label htmlFor={`partNumber-${item.id}`} className="text-xs">Part Number</Label>
                            <Input
                              id={`partNumber-${item.id}`}
                              value={item.partNumber}
                              onChange={(e) => updateCycleCountItem(item.id, "partNumber", e.target.value)}
                              placeholder="Part number"
                              size={1}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`description-${item.id}`} className="text-xs">Description</Label>
                            <Input
                              id={`description-${item.id}`}
                              value={item.description}
                              onChange={(e) => updateCycleCountItem(item.id, "description", e.target.value)}
                              placeholder="Item description"
                              size={1}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <Label htmlFor={`expectedQuantity-${item.id}`} className="text-xs">Expected Qty</Label>
                            <Input
                              id={`expectedQuantity-${item.id}`}
                              type="number"
                              min="0"
                              value={item.expectedQuantity}
                              onChange={(e) => updateCycleCountItem(item.id, "expectedQuantity", parseInt(e.target.value) || 0)}
                              size={1}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`countedQuantity-${item.id}`} className="text-xs">Counted Qty</Label>
                            <Input
                              id={`countedQuantity-${item.id}`}
                              type="number"
                              min="0"
                              value={item.countedQuantity}
                              onChange={(e) => updateCycleCountItem(item.id, "countedQuantity", parseInt(e.target.value) || 0)}
                              size={1}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-sm">
                            <span className="font-medium">Variance: </span>
                            <Badge className={varianceStatus.color}>
                              {item.variance > 0 ? '+' : ''}{item.variance}
                            </Badge>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeCycleCountItem(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                  
                  <Button
                    type="button"
                    onClick={addCycleCountItem}
                    className="w-full"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item to Count
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Count Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Count all items in the specified location</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Record actual quantities accurately</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Note any damaged or unusable items</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Investigate significant variances</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Count Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Items:</span>
                    <Badge variant="outline">{cycleCountItems.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Variance:</span>
                    <Badge variant="outline">
                      {calculateTotalVariance() > 0 ? '+' : ''}{calculateTotalVariance()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Variance Value:</span>
                    <Badge variant="outline">
                      ${calculateVarianceValue().toFixed(2)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Threshold:</span>
                    <Badge variant="outline">{formData.varianceThreshold}%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      Scheduled
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
          <Button type="submit" disabled={isSubmitting || cycleCountItems.length === 0}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Creating..." : "Create Cycle Count"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function CreateCycleCountPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateCycleCountContent />
    </Suspense>
  )
}
