"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CreateItemPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    partNumber: "",
    name: "",
    category: "Raw Material",
    description: "",
    unit: "EA",
    unitCost: 0,
    minStock: 0,
    maxStock: 100,
    currentStock: 0,
    leadTime: 7,
    supplier: "",
    location: "",
    status: "Active",
    specifications: "",
    notes: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.partNumber.trim()) {
      newErrors.partNumber = "Part number is required"
    }
    if (!formData.name.trim()) {
      newErrors.name = "Item name is required"
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }
    if (formData.unitCost < 0) {
      newErrors.unitCost = "Unit cost must be non-negative"
    }
    if (formData.minStock < 0) {
      newErrors.minStock = "Minimum stock must be non-negative"
    }
    if (formData.maxStock <= formData.minStock) {
      newErrors.maxStock = "Maximum stock must be greater than minimum stock"
    }
    if (formData.currentStock < 0) {
      newErrors.currentStock = "Current stock must be non-negative"
    }
    if (formData.leadTime < 0) {
      newErrors.leadTime = "Lead time must be non-negative"
    }
    if (!formData.supplier.trim()) {
      newErrors.supplier = "Supplier is required"
    }
    if (!formData.location.trim()) {
      newErrors.location = "Location is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      console.log("Creating item:", formData)
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push("/items")
    } catch (error) {
      console.error("Error creating item:", error)
      setErrors({ submit: "Failed to create item. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link href="/items" className="text-sm text-blue-600 hover:text-blue-800 mr-4">
              <ArrowLeft className="w-4 h-4 inline mr-1" />
              Back to Items
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Create New Item</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="partNumber">Part Number *</Label>
                    <Input
                      id="partNumber"
                      value={formData.partNumber}
                      onChange={(e) => handleInputChange("partNumber", e.target.value)}
                      className={errors.partNumber ? "border-red-500" : ""}
                      placeholder="e.g., STL-001"
                    />
                    {errors.partNumber && <p className="text-red-500 text-sm mt-1">{errors.partNumber}</p>}
                  </div>
                  <div>
                    <Label htmlFor="name">Item Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={errors.name ? "border-red-500" : ""}
                      placeholder="e.g., Steel Plate"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Raw Material">Raw Material</SelectItem>
                        <SelectItem value="Fasteners">Fasteners</SelectItem>
                        <SelectItem value="Consumables">Consumables</SelectItem>
                        <SelectItem value="Finishing">Finishing</SelectItem>
                        <SelectItem value="Components">Components</SelectItem>
                        <SelectItem value="Tools">Tools</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit of Measure</Label>
                    <Select value={formData.unit} onValueChange={(value) => handleInputChange("unit", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EA">Each (EA)</SelectItem>
                        <SelectItem value="FT">Feet (FT)</SelectItem>
                        <SelectItem value="IN">Inches (IN)</SelectItem>
                        <SelectItem value="LB">Pounds (LB)</SelectItem>
                        <SelectItem value="KG">Kilograms (KG)</SelectItem>
                        <SelectItem value="GAL">Gallons (GAL)</SelectItem>
                        <SelectItem value="L">Liters (L)</SelectItem>
                        <SelectItem value="M">Meters (M)</SelectItem>
                        <SelectItem value="YD">Yards (YD)</SelectItem>
                        <SelectItem value="BOX">Box (BOX)</SelectItem>
                        <SelectItem value="ROLL">Roll (ROLL)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className={errors.description ? "border-red-500" : ""}
                    placeholder="Detailed description of the item..."
                    rows={3}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost and Stock Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unitCost">Unit Cost *</Label>
                    <Input
                      id="unitCost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.unitCost}
                      onChange={(e) => handleInputChange("unitCost", parseFloat(e.target.value) || 0)}
                      className={errors.unitCost ? "border-red-500" : ""}
                      placeholder="0.00"
                    />
                    {errors.unitCost && <p className="text-red-500 text-sm mt-1">{errors.unitCost}</p>}
                  </div>
                  <div>
                    <Label htmlFor="currentStock">Current Stock</Label>
                    <Input
                      id="currentStock"
                      type="number"
                      min="0"
                      value={formData.currentStock}
                      onChange={(e) => handleInputChange("currentStock", parseInt(e.target.value) || 0)}
                      className={errors.currentStock ? "border-red-500" : ""}
                      placeholder="0"
                    />
                    {errors.currentStock && <p className="text-red-500 text-sm mt-1">{errors.currentStock}</p>}
                  </div>
                  <div>
                    <Label htmlFor="minStock">Minimum Stock Level</Label>
                    <Input
                      id="minStock"
                      type="number"
                      min="0"
                      value={formData.minStock}
                      onChange={(e) => handleInputChange("minStock", parseInt(e.target.value) || 0)}
                      className={errors.minStock ? "border-red-500" : ""}
                      placeholder="0"
                    />
                    {errors.minStock && <p className="text-red-500 text-sm mt-1">{errors.minStock}</p>}
                  </div>
                  <div>
                    <Label htmlFor="maxStock">Maximum Stock Level</Label>
                    <Input
                      id="maxStock"
                      type="number"
                      min="1"
                      value={formData.maxStock}
                      onChange={(e) => handleInputChange("maxStock", parseInt(e.target.value) || 100)}
                      className={errors.maxStock ? "border-red-500" : ""}
                      placeholder="100"
                    />
                    {errors.maxStock && <p className="text-red-500 text-sm mt-1">{errors.maxStock}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Supply Chain Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplier">Primary Supplier *</Label>
                    <Input
                      id="supplier"
                      value={formData.supplier}
                      onChange={(e) => handleInputChange("supplier", e.target.value)}
                      className={errors.supplier ? "border-red-500" : ""}
                      placeholder="e.g., SteelCo Industries"
                    />
                    {errors.supplier && <p className="text-red-500 text-sm mt-1">{errors.supplier}</p>}
                  </div>
                  <div>
                    <Label htmlFor="leadTime">Lead Time (days)</Label>
                    <Input
                      id="leadTime"
                      type="number"
                      min="0"
                      value={formData.leadTime}
                      onChange={(e) => handleInputChange("leadTime", parseInt(e.target.value) || 0)}
                      className={errors.leadTime ? "border-red-500" : ""}
                      placeholder="7"
                    />
                    {errors.leadTime && <p className="text-red-500 text-sm mt-1">{errors.leadTime}</p>}
                  </div>
                  <div>
                    <Label htmlFor="location">Storage Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      className={errors.location ? "border-red-500" : ""}
                      placeholder="e.g., Warehouse A, Rack 3"
                    />
                    {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Discontinued">Discontinued</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="specifications">Technical Specifications</Label>
                  <Textarea
                    id="specifications"
                    value={formData.specifications}
                    onChange={(e) => handleInputChange("specifications", e.target.value)}
                    placeholder="Technical specifications, material properties, etc..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Additional notes, special handling instructions, etc..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Link href="/items">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                {isSubmitting ? "Creating..." : "Create Item"}
              </Button>
            </div>

            {errors.submit && (
              <div className="text-red-500 text-center">{errors.submit}</div>
            )}
          </div>
        </form>
      </main>
    </div>
  )
}
