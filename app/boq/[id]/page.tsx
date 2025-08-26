"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  Plus, 
  X, 
  Eye, 
  FileText, 
  Calculator, 
  Wrench, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  Upload,
  Settings
} from 'lucide-react'
import Link from "next/link"
import { useRouter } from "next/navigation"

import { useDatabaseContext } from "@/components/database-provider"
import type { BillOfQuantities, BOQItem } from "@/lib/types"

interface BOQDetailsPageProps {
  params: Promise<{
    id: string
  }>
}

export default function BOQDetailsPage({ params }: BOQDetailsPageProps) {
  const router = useRouter()
  const { useBillsOfQuantities, useEngineeringProjects, useEngineeringDrawings, useBillsOfMaterials } = useDatabaseContext()
  const { boqs, updateBoq } = useBillsOfQuantities()
  const { projects } = useEngineeringProjects()
  const { drawings } = useEngineeringDrawings()
  const { boms } = useBillsOfMaterials()

  const [boq, setBOQ] = useState<BillOfQuantities | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<BillOfQuantities>>({})
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false)
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)
  const [newItem, setNewItem] = useState<Omit<BOQItem, "id">>({
    itemNumber: "",
    description: "",
    quantity: 0,
    unit: "",
    unitRate: 0,
    totalAmount: 0,
    category: "Material",
    specifications: "",
    remarks: "",
    workPackage: "",
    engineeringStatus: "Pending",
    designComplexity: "Medium",
  })

  // Load BOQ data
  useEffect(() => {
    const loadBOQ = async () => {
      const resolvedParams = await params
      const foundBOQ = boqs.find(b => b.id === resolvedParams.id)
      if (foundBOQ) {
        setBOQ(foundBOQ)
        setEditForm(foundBOQ)
      }
    }
    loadBOQ()
  }, [boqs, params])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Final": return "bg-green-100 text-green-800"
      case "Approved": return "bg-blue-100 text-blue-800"
      case "Under Review": return "bg-yellow-100 text-yellow-800"
      case "Draft": return "bg-gray-100 text-gray-800"
      case "Revised": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getETOStatusColor = (status: string) => {
    switch (status) {
      case "BOQ Submitted": return "bg-gray-100 text-gray-800"
      case "Engineering Design": return "bg-yellow-100 text-yellow-800"
      case "BOM Generation": return "bg-blue-100 text-blue-800"
      case "Manufacturing Ready": return "bg-green-100 text-green-800"
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

  const handleSave = async () => {
    if (!boq || !editForm) return

    try {
      const updatedBOQ: BillOfQuantities = {
        ...boq,
        ...editForm,
        updatedAt: new Date().toISOString(),
      }

      await updateBoq(updatedBOQ)
      setBOQ(updatedBOQ)
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating BOQ:", error)
    }
  }

  const handleStatusUpdate = async (newStatus: BillOfQuantities["status"]) => {
    if (!boq) return

    const updatedBOQ: BillOfQuantities = {
      ...boq,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    }

    await updateBoq(updatedBOQ)
    setBOQ(updatedBOQ)
  }

  const handleETOStatusUpdate = async (newStatus: string) => {
    if (!boq) return

    let newProgress = boq.engineeringProgress || 0
    switch (newStatus) {
      case "BOQ Submitted": newProgress = 0; break
      case "Engineering Design": newProgress = 50; break
      case "BOM Generation": newProgress = 75; break
      case "Manufacturing Ready": newProgress = 100; break
    }

    const updatedBOQ: BillOfQuantities = {
      ...boq,
      etoStatus: newStatus as BillOfQuantities["etoStatus"],
      engineeringProgress: newProgress,
      updatedAt: new Date().toISOString(),
    }

    await updateBoq(updatedBOQ)
    setBOQ(updatedBOQ)
  }

  const addOrUpdateItem = () => {
    if (!boq) return

    const totalAmount = newItem.quantity * newItem.unitRate
    const itemWithTotal = { ...newItem, totalAmount }

    let updatedItems: BOQItem[]
    if (editingItemIndex !== null) {
      // Update existing item
      updatedItems = boq.items.map((item, index) => 
        index === editingItemIndex 
          ? { ...itemWithTotal, id: item.id }
          : item
      )
    } else {
      // Add new item
      const newItemWithId: BOQItem = {
        ...itemWithTotal,
        id: `${boq.id}-I${boq.items.length + 1}`,
      }
      updatedItems = [...boq.items, newItemWithId]
    }

    // Recalculate costs
    const materialCost = updatedItems.filter(i => i.category === "Material").reduce((sum, i) => sum + i.totalAmount, 0)
    const laborCost = updatedItems.filter(i => i.category === "Labor").reduce((sum, i) => sum + i.totalAmount, 0)
    const equipmentCost = updatedItems.filter(i => i.category === "Equipment").reduce((sum, i) => sum + i.totalAmount, 0)
    const subcontractCost = updatedItems.filter(i => i.category === "Subcontract").reduce((sum, i) => sum + i.totalAmount, 0)
    const otherCost = updatedItems.filter(i => i.category === "Other").reduce((sum, i) => sum + i.totalAmount, 0)
    const totalCost = materialCost + laborCost + equipmentCost + subcontractCost + otherCost

    const updatedBOQ: BillOfQuantities = {
      ...boq,
      items: updatedItems,
      materialCost,
      laborCost,
      equipmentCost,
      subcontractCost,
      otherCost,
      totalCost,
      updatedAt: new Date().toISOString(),
    }

    updateBoq(updatedBOQ)
    setBOQ(updatedBOQ)
    
    // Reset form
    setNewItem({
      itemNumber: "",
      description: "",
      quantity: 0,
      unit: "",
      unitRate: 0,
      totalAmount: 0,
      category: "Material",
      specifications: "",
      remarks: "",
      workPackage: "",
      engineeringStatus: "Pending",
      designComplexity: "Medium",
    })
    setEditingItemIndex(null)
    setIsItemDialogOpen(false)
  }

  const editItem = (index: number) => {
    if (!boq) return
    
    const item = boq.items[index]
    setNewItem({
      itemNumber: item.itemNumber,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unitRate: item.unitRate,
      totalAmount: item.totalAmount,
      category: item.category,
      specifications: item.specifications || "",
      remarks: item.remarks || "",
      workPackage: item.workPackage || "",
      engineeringStatus: item.engineeringStatus || "Pending",
      designComplexity: item.designComplexity || "Medium",
    })
    setEditingItemIndex(index)
    setIsItemDialogOpen(true)
  }

  const removeItem = (index: number) => {
    if (!boq) return

    const updatedItems = boq.items.filter((_, i) => i !== index)
    
    // Recalculate costs
    const materialCost = updatedItems.filter(i => i.category === "Material").reduce((sum, i) => sum + i.totalAmount, 0)
    const laborCost = updatedItems.filter(i => i.category === "Labor").reduce((sum, i) => sum + i.totalAmount, 0)
    const equipmentCost = updatedItems.filter(i => i.category === "Equipment").reduce((sum, i) => sum + i.totalAmount, 0)
    const subcontractCost = updatedItems.filter(i => i.category === "Subcontract").reduce((sum, i) => sum + i.totalAmount, 0)
    const otherCost = updatedItems.filter(i => i.category === "Other").reduce((sum, i) => sum + i.totalAmount, 0)
    const totalCost = materialCost + laborCost + equipmentCost + subcontractCost + otherCost

    const updatedBOQ: BillOfQuantities = {
      ...boq,
      items: updatedItems,
      materialCost,
      laborCost,
      equipmentCost,
      subcontractCost,
      otherCost,
      totalCost,
      updatedAt: new Date().toISOString(),
    }

    updateBoq(updatedBOQ)
    setBOQ(updatedBOQ)
  }

  const updateItemStatus = async (index: number, newStatus: BOQItem["engineeringStatus"]) => {
    if (!boq) return

    const updatedItems = boq.items.map((item, i) => 
      i === index 
        ? { ...item, engineeringStatus: newStatus }
        : item
    )

    const updatedBOQ: BillOfQuantities = {
      ...boq,
      items: updatedItems,
      updatedAt: new Date().toISOString(),
    }

    await updateBoq(updatedBOQ)
    setBOQ(updatedBOQ)
  }

  if (!boq) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading BOQ details...</p>
        </div>
      </div>
    )
  }

  // Get linked project, drawing, and BOM
  const linkedProject = projects.find(p => p.id === boq.engineeringProjectId)
  const linkedDrawing = drawings.find(d => d.id === boq.engineeringDrawingId)
  const linkedBOM = boms.find(b => b.id === boq.bomId)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/boq">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to BOQs
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{boq.boqNumber}</h1>
                <p className="text-gray-600">{boq.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(boq.status)}>
                {boq.status}
              </Badge>
              <Badge variant="outline" className={getETOStatusColor(boq.etoStatus || "BOQ Submitted")}>
                {boq.etoStatus || "BOQ Submitted"}
              </Badge>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSave} size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* BOQ Information */}
            <Card>
              <CardHeader>
                <CardTitle>BOQ Information</CardTitle>
                <CardDescription>Basic details and project information</CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={editForm.title || ""}
                          onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="projectName">Project Name</Label>
                        <Input
                          id="projectName"
                          value={editForm.projectName || ""}
                          onChange={(e) => setEditForm(prev => ({ ...prev, projectName: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={editForm.description || ""}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="createdBy">Created By</Label>
                        <Input
                          id="createdBy"
                          value={editForm.createdBy || ""}
                          onChange={(e) => setEditForm(prev => ({ ...prev, createdBy: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="contractReference">Contract Reference</Label>
                        <Input
                          id="contractReference"
                          value={editForm.contractReference || ""}
                          onChange={(e) => setEditForm(prev => ({ ...prev, contractReference: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Project Name</Label>
                        <p className="mt-1">{boq.projectName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Created By</Label>
                        <p className="mt-1">{boq.createdBy}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Description</Label>
                      <p className="mt-1">{boq.description}</p>
                    </div>
                    {boq.contractReference && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Contract Reference</Label>
                        <p className="mt-1">{boq.contractReference}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Version</Label>
                        <p className="mt-1">{boq.version}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Revision</Label>
                        <p className="mt-1">{boq.revision}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Last Updated</Label>
                        <p className="mt-1">{new Date(boq.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* BOQ Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>BOQ Items</CardTitle>
                    <CardDescription>Detailed breakdown of quantities and costs</CardDescription>
                  </div>
                  <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => {
                        setEditingItemIndex(null)
                        setNewItem({
                          itemNumber: "",
                          description: "",
                          quantity: 0,
                          unit: "",
                          unitRate: 0,
                          totalAmount: 0,
                          category: "Material",
                          specifications: "",
                          remarks: "",
                          workPackage: "",
                          engineeringStatus: "Pending",
                          designComplexity: "Medium",
                        })
                      }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {editingItemIndex !== null ? "Edit BOQ Item" : "Add New BOQ Item"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingItemIndex !== null ? "Update the BOQ item details" : "Add a new item to the bill of quantities"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="itemNumber">Item Number</Label>
                            <Input
                              id="itemNumber"
                              value={newItem.itemNumber}
                              onChange={(e) => setNewItem(prev => ({ ...prev, itemNumber: e.target.value }))}
                              placeholder="1.1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="category">Category</Label>
                            <Select value={newItem.category} onValueChange={(value) => setNewItem(prev => ({ ...prev, category: value as BOQItem["category"] }))}>
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
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={newItem.description}
                            onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Detailed description of the work or material"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                              id="quantity"
                              type="number"
                              value={newItem.quantity}
                              onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
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
                              placeholder="EA, MT, M, etc."
                            />
                          </div>
                          <div>
                            <Label htmlFor="unitRate">Unit Rate ($)</Label>
                            <Input
                              id="unitRate"
                              type="number"
                              value={newItem.unitRate}
                              onChange={(e) => setNewItem(prev => ({ ...prev, unitRate: parseFloat(e.target.value) || 0 }))}
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                        
                        {/* ETO Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="md:col-span-2">
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="specifications">Specifications</Label>
                            <Input
                              id="specifications"
                              value={newItem.specifications}
                              onChange={(e) => setNewItem(prev => ({ ...prev, specifications: e.target.value }))}
                              placeholder="Technical specifications"
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
                        
                        <div className="flex justify-between items-center pt-4">
                          <div className="text-sm text-gray-600">
                            Total Amount: <span className="font-medium">${(newItem.quantity * newItem.unitRate).toFixed(2)}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsItemDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="button" onClick={addOrUpdateItem}>
                              {editingItemIndex !== null ? "Update Item" : "Add Item"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {boq.items.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {boq.items.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.itemNumber}</p>
                              <Badge className={getCategoryColor(item.category)} size="sm">
                                {item.category}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.description}</p>
                              {item.workPackage && (
                                <p className="text-xs text-gray-500">{item.workPackage}</p>
                              )}
                              {item.specifications && (
                                <p className="text-xs text-gray-500">Spec: {item.specifications}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{item.quantity} {item.unit}</TableCell>
                          <TableCell>${item.unitRate.toFixed(2)}</TableCell>
                          <TableCell className="font-medium">${item.totalAmount.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Select 
                                value={item.engineeringStatus || "Pending"} 
                                onValueChange={(value) => updateItemStatus(index, value as BOQItem["engineeringStatus"])}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pending">Pending</SelectItem>
                                  <SelectItem value="In Design">In Design</SelectItem>
                                  <SelectItem value="Design Complete">Design Complete</SelectItem>
                                  <SelectItem value="BOM Generated">BOM Generated</SelectItem>
                                </SelectContent>
                              </Select>
                              {item.designComplexity && (
                                <Badge variant="outline" size="sm">
                                  {item.designComplexity}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => editItem(index)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                              {item.engineeringStatus === "Design Complete" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-800"
                                  title="Generate BOM"
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
                ) : (
                  <div className="text-center py-12">
                    <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No items added yet</p>
                    <Button onClick={() => setIsItemDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Item
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* ETO Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  ETO Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Engineering Progress</span>
                      <span>{boq.engineeringProgress || 0}%</span>
                    </div>
                    <Progress value={boq.engineeringProgress || 0} className="h-2" />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">ETO Status</Label>
                    <Select 
                      value={boq.etoStatus || "BOQ Submitted"} 
                      onValueChange={handleETOStatusUpdate}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BOQ Submitted">BOQ Submitted</SelectItem>
                        <SelectItem value="Engineering Design">Engineering Design</SelectItem>
                        <SelectItem value="BOM Generation">BOM Generation</SelectItem>
                        <SelectItem value="Manufacturing Ready">Manufacturing Ready</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">BOQ Status</Label>
                    <Select value={boq.status} onValueChange={handleStatusUpdate}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Under Review">Under Review</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Final">Final</SelectItem>
                        <SelectItem value="Revised">Revised</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {boq.workPackages && boq.workPackages.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Work Packages</Label>
                      <div className="mt-2 space-y-1">
                        {boq.workPackages.map((pkg, index) => (
                          <Badge key={index} variant="outline" className="block text-center">
                            {pkg}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cost Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Cost Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Material Cost</span>
                    <span className="font-medium">${boq.materialCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Labor Cost</span>
                    <span className="font-medium">${boq.laborCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Equipment Cost</span>
                    <span className="font-medium">${boq.equipmentCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Subcontract Cost</span>
                    <span className="font-medium">${boq.subcontractCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Other Cost</span>
                    <span className="font-medium">${boq.otherCost.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Cost</span>
                    <span>${boq.totalCost.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Linked Records */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Linked Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {linkedProject && (
                    <div>
                      <Label className="text-xs text-gray-500">Engineering Project</Label>
                      <Link href={`/engineering/${linkedProject.id}`}>
                        <p className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                          {linkedProject.projectName}
                        </p>
                      </Link>
                    </div>
                  )}
                  
                  {linkedDrawing && (
                    <div>
                      <Label className="text-xs text-gray-500">Engineering Drawing</Label>
                      <p className="text-sm">{linkedDrawing.drawingNumber}</p>
                    </div>
                  )}
                  
                  {linkedBOM && (
                    <div>
                      <Label className="text-xs text-gray-500">Bill of Materials</Label>
                      <Link href={`/bom/${linkedBOM.id}`}>
                        <p className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                          {linkedBOM.bomNumber}
                        </p>
                      </Link>
                    </div>
                  )}

                  {boq.generatedBOMs && boq.generatedBOMs.length > 0 && (
                    <div>
                      <Label className="text-xs text-gray-500">Generated BOMs</Label>
                      <div className="space-y-1">
                        {boq.generatedBOMs.map((bomId, index) => {
                          const bom = boms.find(b => b.id === bomId)
                          return (
                            <Link key={index} href={`/bom/${bomId}`}>
                              <p className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                                {bom?.bomNumber || bomId}
                              </p>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Export BOQ
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Items
                  </Button>
                  <Link href={`/boq/${boq.id}/edit`}>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      Advanced Edit
                    </Button>
                  </Link>
                  <Link href={`/bom/create?boqId=${boq.id}`}>
                    <Button className="w-full justify-start">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Generate BOM
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
