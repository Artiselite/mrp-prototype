"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Save, Plus, X, Calculator, Wrench, ArrowRight } from 'lucide-react'
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import { useDatabaseContext } from "@/components/database-provider"
import type { BOQItem } from "@/lib/types"

export default function CreateBOQPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { useBillsOfQuantities, useEngineeringProjects, useEngineeringDrawings, useBillsOfMaterials, isInitialized } = useDatabaseContext()
  const { createBoq } = useBillsOfQuantities()
  const { projects = [] } = useEngineeringProjects()
  const { drawings = [] } = useEngineeringDrawings()
  const { boms = [] } = useBillsOfMaterials()

  const [formData, setFormData] = useState({
    boqNumber: "",
    title: "",
    projectName: "",
    description: "",
    engineeringProjectId: "none",
    engineeringDrawingId: "none",
    bomId: "none",
    createdBy: "",
  })

  const [items, setItems] = useState<Omit<BOQItem, "id">[]>([])
  const [newItem, setNewItem] = useState({
    itemNumber: "",
    description: "",
    quantity: 0,
    unit: "",
    unitRate: 0,
    category: "Material" as BOQItem["category"],
    specifications: "",
    remarks: "",
    workPackage: "",
    engineeringStatus: "Pending" as BOQItem["engineeringStatus"],
    designComplexity: "Medium" as BOQItem["designComplexity"],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Calculate costs by category
      const materialCost = items.filter(i => i.category === "Material").reduce((sum, i) => sum + i.totalAmount, 0)
      const laborCost = items.filter(i => i.category === "Labor").reduce((sum, i) => sum + i.totalAmount, 0)
      const equipmentCost = items.filter(i => i.category === "Equipment").reduce((sum, i) => sum + i.totalAmount, 0)
      const subcontractCost = items.filter(i => i.category === "Subcontract").reduce((sum, i) => sum + i.totalAmount, 0)
      const otherCost = items.filter(i => i.category === "Other").reduce((sum, i) => sum + i.totalAmount, 0)
      const totalCost = materialCost + laborCost + equipmentCost + subcontractCost + otherCost

      const newBoq = await createBoq({
        ...formData,
        // Convert "none" values back to empty strings or undefined
        engineeringProjectId: formData.engineeringProjectId === "none" ? undefined : formData.engineeringProjectId,
        engineeringDrawingId: formData.engineeringDrawingId === "none" ? undefined : formData.engineeringDrawingId,
        bomId: formData.bomId === "none" ? undefined : formData.bomId,
        status: "Draft",
        version: "1.0",
        items: items.map((item, index) => ({
          ...item,
          id: `item-${index + 1}`,
        })),
        materialCost,
        laborCost,
        equipmentCost,
        subcontractCost,
        otherCost,
        totalCost,
        revision: "Rev A",
      })

      router.push(`/boq/${newBoq.id}`)
    } catch (error) {
      console.error("Failed to create BOQ:", error)
    }
  }

  const addItem = () => {
    if (newItem.description && newItem.quantity > 0 && newItem.unitRate > 0) {
      const totalAmount = newItem.quantity * newItem.unitRate
      setItems([...items, {
        ...newItem,
        totalAmount,
      }])
      setNewItem({
        itemNumber: "",
        description: "",
        quantity: 0,
        unit: "",
        unitRate: 0,
        category: "Material",
        specifications: "",
        remarks: "",
        workPackage: "",
        engineeringStatus: "Pending",
        designComplexity: "Medium",
      })
    }
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const getCategoryColor = (category: BOQItem["category"]) => {
    switch (category) {
      case "Material": return "bg-blue-100 text-blue-800"
      case "Labor": return "bg-green-100 text-green-800"
      case "Equipment": return "bg-orange-100 text-orange-800"
      case "Subcontract": return "bg-purple-100 text-purple-800"
      case "Other": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getEngineeringStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-gray-100 text-gray-800"
      case "In Design": return "bg-yellow-100 text-yellow-800"
      case "Design Complete": return "bg-blue-100 text-blue-800"
      case "BOM Generated": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const totalCost = items?.reduce((sum, item) => sum + (item.totalAmount || 0), 0) || 0

  // Pre-populate form based on URL parameters
  useEffect(() => {
    if (!drawings || !boms || !projects) return

    const drawingId = searchParams.get('drawingId')
    const bomId = searchParams.get('bomId')
    const projectId = searchParams.get('projectId')

    if (drawingId && drawings.length > 0) {
      const drawing = drawings.find(d => d.id === drawingId)
      if (drawing) {
        setFormData(prev => ({
          ...prev,
          engineeringDrawingId: drawingId,
          title: `BOQ for ${drawing.title}`,
          projectName: drawing.projectNumber || 'Drawing Project',
          description: `Bill of Quantities for ${drawing.title} - ${drawing.description}`,
        }))
      }
    }

    if (bomId && boms.length > 0) {
      const bom = boms.find(b => b.id === bomId)
      if (bom && bom.items) {
        setFormData(prev => ({
          ...prev,
          bomId: bomId,
          title: `BOQ for ${bom.title}`,
          projectName: bom.productName,
          description: `Bill of Quantities based on ${bom.title} - ${bom.description}`,
        }))

        // Pre-populate items from BOM
        const bomItems = bom.items.map((bomItem, index) => ({
          itemNumber: `${index + 1}.1`,
          description: `${bomItem.description} - Material`,
          quantity: bomItem.quantity,
          unit: bomItem.unit,
          unitRate: bomItem.unitCost,
          totalAmount: bomItem.totalCost,
          category: "Material" as BOQItem["category"],
          specifications: bomItem.specifications || "",
          remarks: `From BOM: ${bom.bomNumber}`,
          bomItemId: bomItem.id,
        }))
        setItems(bomItems)
      }
    }

    if (projectId && projects.length > 0) {
      const project = projects.find(p => p.id === projectId)
      if (project) {
        setFormData(prev => ({
          ...prev,
          engineeringProjectId: projectId,
          title: `BOQ for ${project.title}`,
          projectName: project.title,
          description: `Bill of Quantities for ${project.title} - ${project.description}`,
        }))
      }
    }
  }, [searchParams, drawings, boms, projects])

  // Show loading state while database is initializing
  if (!isInitialized || !projects || !drawings || !boms) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading database...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <Link href="/boq" className="text-sm text-blue-600 hover:text-blue-800 mb-2 block">
                <ArrowLeft className="w-4 h-4 inline mr-1" />
                Back to BOQ
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Create Bill of Quantities</h1>
              <p className="text-sm text-gray-600">Set up a new cost estimate for a project</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>BOQ identification and project details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="boqNumber">BOQ Number</Label>
                  <Input
                    id="boqNumber"
                    value={formData.boqNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, boqNumber: e.target.value }))}
                    placeholder="BOQ-2024-XXX"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="createdBy">Created By</Label>
                  <Input
                    id="createdBy"
                    value={formData.createdBy}
                    onChange={(e) => setFormData(prev => ({ ...prev, createdBy: e.target.value }))}
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter BOQ title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  value={formData.projectName}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the scope of work"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="engineeringProjectId">Engineering Project (Optional)</Label>
                  <Select value={formData.engineeringProjectId} onValueChange={(value) => setFormData(prev => ({ ...prev, engineeringProjectId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {projects && Array.isArray(projects) && projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.projectNumber} - {project.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="engineeringDrawingId">Engineering Drawing (Optional)</Label>
                  <Select value={formData.engineeringDrawingId} onValueChange={(value) => setFormData(prev => ({ ...prev, engineeringDrawingId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select drawing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {drawings && Array.isArray(drawings) && drawings.map((drawing) => (
                        <SelectItem key={drawing.id} value={drawing.id}>
                          {drawing.drawingNumber} - {drawing.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bomId">BOM Reference (Optional)</Label>
                  <Select value={formData.bomId} onValueChange={(value) => setFormData(prev => ({ ...prev, bomId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select BOM" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {boms && Array.isArray(boms) && boms.map((bom) => (
                        <SelectItem key={bom.id} value={bom.id}>
                          {bom.bomNumber} - {bom.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* BOQ Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                BOQ Items
              </CardTitle>
              <CardDescription>
                Add cost items and quantities for the project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add New Item Form */}
              <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-medium mb-4">Add New Item</h3>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div>
                    <Label htmlFor="itemNumber">Item No.</Label>
                    <Input
                      id="itemNumber"
                      value={newItem.itemNumber}
                      onChange={(e) => setNewItem(prev => ({ ...prev, itemNumber: e.target.value }))}
                      placeholder="1.1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="itemDescription">Description</Label>
                    <Input
                      id="itemDescription"
                      value={newItem.description}
                      onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Item description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      value={newItem.unit}
                      onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
                      placeholder="EA, LF, SQ FT"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitRate">Unit Rate ($)</Label>
                    <Input
                      id="unitRate"
                      type="number"
                      value={newItem.unitRate}
                      onChange={(e) => setNewItem(prev => ({ ...prev, unitRate: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newItem.category} onValueChange={(value: BOQItem["category"]) => setNewItem(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Material">Material</SelectItem>
                        <SelectItem value="Labor">Labor</SelectItem>
                        <SelectItem value="Equipment">Equipment</SelectItem>
                        <SelectItem value="Subcontract">Subcontract</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="specifications">Specifications</Label>
                    <Input
                      id="specifications"
                      value={newItem.specifications}
                      onChange={(e) => setNewItem(prev => ({ ...prev, specifications: e.target.value }))}
                      placeholder="Technical specs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="remarks">Remarks</Label>
                    <Input
                      id="remarks"
                      value={newItem.remarks}
                      onChange={(e) => setNewItem(prev => ({ ...prev, remarks: e.target.value }))}
                      placeholder="Additional notes"
                    />
                  </div>
                </div>
                
                {/* ETO-specific fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="md:col-span-3">
                    <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                      <Wrench className="w-4 h-4" />
                      ETO Engineering Fields
                    </h4>
                  </div>
                  <div>
                    <Label htmlFor="workPackage">Work Package</Label>
                    <Input
                      id="workPackage"
                      value={newItem.workPackage}
                      onChange={(e) => setNewItem(prev => ({ ...prev, workPackage: e.target.value }))}
                      placeholder="e.g., Structural Steel Installation"
                    />
                  </div>
                  <div>
                    <Label htmlFor="engineeringStatus">Engineering Status</Label>
                    <Select value={newItem.engineeringStatus} onValueChange={(value) => setNewItem(prev => ({ ...prev, engineeringStatus: value as BOQItem["engineeringStatus"] }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Design">In Design</SelectItem>
                        <SelectItem value="Design Complete">Design Complete</SelectItem>
                        <SelectItem value="BOM Generated">BOM Generated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="designComplexity">Design Complexity</Label>
                    <Select value={newItem.designComplexity} onValueChange={(value) => setNewItem(prev => ({ ...prev, designComplexity: value as BOQItem["designComplexity"] }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-600">
                    Total Amount: <span className="font-medium">${(newItem.quantity * newItem.unitRate).toFixed(2)}</span>
                  </div>
                  <Button type="button" onClick={addItem} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </div>

              {/* Items List */}
              {items.length > 0 && (
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item No.</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>ETO Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items && Array.isArray(items) && items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.itemNumber}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.description}</p>
                              {item.specifications && (
                                <p className="text-sm text-gray-500">{item.specifications}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>${item.unitRate.toFixed(2)}</TableCell>
                          <TableCell className="font-medium">${item.totalAmount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge className={getCategoryColor(item.category)}>
                              {item.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge 
                                variant="outline" 
                                className={getEngineeringStatusColor(item.engineeringStatus || "Pending")}
                              >
                                {item.engineeringStatus || "Pending"}
                              </Badge>
                              {item.workPackage && (
                                <p className="text-xs text-gray-500">{item.workPackage}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                              {item.engineeringStatus === "Pending" && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Convert to BOM"
                                >
                                  <ArrowRight className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium">Total Cost:</span>
                      <span className="text-2xl font-bold text-green-600">${totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link href="/boq">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Create BOQ
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
