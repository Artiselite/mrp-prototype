"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Save, Plus, Trash2, Calculator, CheckCircle, Loader2, AlertTriangle, X } from 'lucide-react'
import Link from "next/link"
import { useRouter } from "next/navigation"

import { useDatabaseContext } from "@/components/database-provider"
import type { BillOfMaterials, BOMItem } from "@/lib/types"

interface BOMEditPageProps {
  params: Promise<{ id: string }>
}

export default function EditBOMPage({ params }: BOMEditPageProps) {
  const router = useRouter()
  const {
    billsOfMaterials: boms = [],
    engineeringDrawings: drawings = [],
    items: masterItems = [],
    updateBillOfMaterials: updateBom,
    isInitialized
  } = useDatabaseContext()

  const [bom, setBom] = useState<BillOfMaterials | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    bomNumber: "",
    productName: "",
    version: "",
    revision: "",
    status: "Draft",
    bomType: "EBOM",
    createdBy: "",

    engineeringDrawingId: "none",
    notes: ""
  })

  const [items, setItems] = useState<Omit<BOMItem, "id">[]>([])
  const [revisionNotes, setRevisionNotes] = useState("")
  const [selectedMasterItemId, setSelectedMasterItemId] = useState("")
  const [showAddItemDialog, setShowAddItemDialog] = useState(false)

  const [newItem, setNewItem] = useState<Omit<BOMItem, "id">>({
    itemNumber: "",
    description: "",
    partNumber: "",
    quantity: 1,
    unit: "EA",
    unitCost: 0,
    totalCost: 0,
    materialGrade: "",
    specifications: "",
    supplier: "",
    leadTime: 0,
    category: "Raw Material",
    boqItemId: "",
  })

  // Load BOM data
  useEffect(() => {
    const loadBom = async () => {
      try {
        if (!isInitialized) return

        const resolvedParams = await params
        const bomId = resolvedParams.id

        const foundBom = boms.find((b: BillOfMaterials) => b.id === bomId)

        if (!foundBom) {
          setError("BOM not found")
          setLoading(false)
          return
        }

        setBom(foundBom)
        setFormData({
          bomNumber: foundBom.bomNumber,
          productName: foundBom.productName,
          version: foundBom.version,
          revision: foundBom.revision,
          status: foundBom.status || "Draft",
          bomType: foundBom.bomType || "EBOM",
          createdBy: foundBom.createdBy || "",

          engineeringDrawingId: foundBom.engineeringDrawingId || "none",
          notes: foundBom.notes || ""
        })
        setItems(foundBom.items || [])
        setError(null)
      } catch (err) {
        console.error("Error loading BOM:", err)
        setError("Failed to load BOM")
      } finally {
        setLoading(false)
      }
    }

    loadBom()
  }, [isInitialized, params, boms])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getNextItemNumber = () => {
    if (items.length === 0) return "1.0"
    const maxItemNumber = Math.max(
      ...items.map(item => {
        const num = parseFloat(item.itemNumber.split('.')[0]) || 0
        return num
      })
    )
    return `${maxItemNumber + 1}.0`
  }

  const handleMasterItemSelect = (itemId: string) => {
    const masterItem = masterItems.find((item: any) => item.id === itemId)
    if (masterItem) {
      setNewItem({
        itemNumber: getNextItemNumber(),
        description: masterItem.name,
        partNumber: masterItem.partNumber,
        quantity: 1,
        unit: masterItem.unit,
        unitCost: masterItem.unitCost,
        totalCost: masterItem.unitCost,
        materialGrade: "",
        specifications: masterItem.specifications,
        supplier: masterItem.supplier,
        leadTime: masterItem.leadTime,
        category: masterItem.category as BOMItem["category"],
        boqItemId: "",
      })
      setSelectedMasterItemId(itemId)
    }
  }

  const addItem = () => {
    if (!newItem.description || newItem.quantity <= 0) return

    const totalCost = newItem.quantity * newItem.unitCost
    setItems([...items, { ...newItem, totalCost }])

    // Reset form
    setNewItem({
      itemNumber: "",
      description: "",
      partNumber: "",
      quantity: 1,
      unit: "EA",
      unitCost: 0,
      totalCost: 0,
      materialGrade: "",
      specifications: "",
      supplier: "",
      leadTime: 0,
      category: "Raw Material",
      boqItemId: "",
    })
    setSelectedMasterItemId("")
    setShowAddItemDialog(false)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof BOMItem, value: any) => {
    setItems(items.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value }
        if (field === 'quantity' || field === 'unitCost') {
          updatedItem.totalCost = updatedItem.quantity * updatedItem.unitCost
        }
        return updatedItem
      }
      return item
    }))
  }

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.totalCost || (item.quantity * item.unitCost)), 0)
  }

  const handleSave = async (action: "draft" | "update" | "approve") => {
    if (!bom) return

    setSaving(true)
    setSubmitError(null)

    try {
      // Validation
      if (!formData.bomNumber.trim()) {
        throw new Error("BOM Number is required")
      }
      if (!formData.productName.trim()) {
        throw new Error("Product Name is required")
      }
      if (items.length === 0) {
        throw new Error("At least one item is required")
      }
      if (action !== "draft" && !revisionNotes.trim()) {
        throw new Error("Revision notes are required for updates")
      }

      const updatedBom: BillOfMaterials = {
        ...bom,
        ...formData,
        bomNumber: formData.bomNumber.trim(),
        productName: formData.productName.trim(),
        bomType: formData.bomType as "EBOM" | "MBOM" | "PBOM",
        engineeringDrawingId: formData.engineeringDrawingId === "none" ? undefined : formData.engineeringDrawingId,
        items: items.map((item, index) => ({
          ...item,
          id: `${formData.bomNumber.trim()}-I${index + 1}`,
          totalCost: item.quantity * item.unitCost,
        })),
        totalCost: calculateTotal(),
        itemCount: items.length,
        status: action === "approve" ? "Approved" : action === "update" ? (formData.status as any) : "Draft",
        notes: formData.notes,
        updatedAt: new Date().toISOString()
      }

      await updateBom(bom.id, updatedBom)
      router.push(`/bom/${bom.id}`)
    } catch (error) {
      console.error("Error saving BOM:", error)
      setSubmitError(error instanceof Error ? error.message : "Failed to save BOM")
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-800"
      case "Review": return "bg-yellow-100 text-yellow-800"
      case "Draft": return "bg-gray-100 text-gray-800"
      case "Rejected": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading BOM...</span>
        </div>
      </div>
    )
  }

  if (error || !bom) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">BOM Not Found</h2>
          <p className="text-gray-600 mb-4">{error || "The requested BOM could not be found."}</p>
          <Button onClick={() => router.push('/bom')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to BOMs
          </Button>
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
            <div className="flex items-center gap-4">
              <Link href={`/bom/${bom.id}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to BOM
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit BOM - {bom.bomNumber}</h1>
                <p className="text-sm text-gray-600">{bom.productName}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleSave("draft")}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save as Draft
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSave("update")}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Update BOM
              </Button>
              <Button
                onClick={() => handleSave("approve")}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Approve BOM
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700 font-medium">Error</p>
            </div>
            <p className="mt-1 text-sm text-red-600">{submitError}</p>
            <Button
              onClick={() => setSubmitError(null)}
              variant="outline"
              size="sm"
              className="mt-2 text-red-600 border-red-300 hover:bg-red-50"
            >
              Dismiss
            </Button>
          </div>
        )}

        <div className="grid grid-cols-4 gap-6">
          {/* Main Form */}
          <div className="col-span-3 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>BOM identification and details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bomNumber">BOM Number</Label>
                    <Input
                      id="bomNumber"
                      value={formData.bomNumber}
                      onChange={(e) => handleInputChange("bomNumber", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="productName">Product Name</Label>
                    <Input
                      id="productName"
                      value={formData.productName}
                      onChange={(e) => handleInputChange("productName", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      value={formData.version}
                      onChange={(e) => handleInputChange("version", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="revision">Revision</Label>
                    <Input
                      id="revision"
                      value={formData.revision}
                      onChange={(e) => handleInputChange("revision", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Review">Review</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bomType">BOM Type</Label>
                    <Select value={formData.bomType} onValueChange={(value) => handleInputChange("bomType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select BOM type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EBOM">Engineering BOM</SelectItem>
                        <SelectItem value="MBOM">Manufacturing BOM</SelectItem>
                        <SelectItem value="PBOM">Production BOM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="createdBy">Created By</Label>
                    <Input
                      id="createdBy"
                      value={formData.createdBy}
                      onChange={(e) => handleInputChange("createdBy", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Linked Records */}
            <Card>
              <CardHeader>
                <CardTitle>Linked Records</CardTitle>
                <CardDescription>Associated engineering records</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="engineeringDrawingId">Engineering Drawing</Label>
                  <Select
                    value={formData.engineeringDrawingId}
                    onValueChange={(value) => handleInputChange("engineeringDrawingId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select drawing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {drawings.map((drawing: any) => (
                        <SelectItem key={drawing.id} value={drawing.id}>
                          {drawing.drawingNumber} - {drawing.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Items Management */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>BOM Items ({items.length})</CardTitle>
                    <CardDescription>Manage items in this BOM</CardDescription>
                  </div>
                  <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add Item to BOM</DialogTitle>
                        <DialogDescription>
                          Select an item from the master list and specify quantity
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="masterItem">Select Item</Label>
                          <Select value={selectedMasterItemId} onValueChange={handleMasterItemSelect}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an item from master" />
                            </SelectTrigger>
                            <SelectContent>
                              {masterItems.filter((item: any) => item.status === "Active").map((item: any) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.partNumber} - {item.name} ({item.category})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedMasterItemId && (
                          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input
                                  id="quantity"
                                  type="number"
                                  value={newItem.quantity}
                                  onChange={(e) => setNewItem(prev => ({
                                    ...prev,
                                    quantity: parseFloat(e.target.value) || 0,
                                    totalCost: (parseFloat(e.target.value) || 0) * prev.unitCost
                                  }))}
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <div>
                                <Label htmlFor="unitCost">Unit Cost</Label>
                                <Input
                                  id="unitCost"
                                  type="number"
                                  value={newItem.unitCost}
                                  onChange={(e) => setNewItem(prev => ({
                                    ...prev,
                                    unitCost: parseFloat(e.target.value) || 0,
                                    totalCost: prev.quantity * (parseFloat(e.target.value) || 0)
                                  }))}
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="materialGrade">Material Grade (Optional)</Label>
                              <Input
                                id="materialGrade"
                                value={newItem.materialGrade}
                                onChange={(e) => setNewItem(prev => ({ ...prev, materialGrade: e.target.value }))}
                              />
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="text-sm text-gray-600">
                                Total Cost: <span className="font-medium">${(newItem.quantity * newItem.unitCost).toFixed(2)}</span>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => {
                                    setSelectedMasterItemId("")
                                    setShowAddItemDialog(false)
                                  }}
                                  variant="outline"
                                >
                                  Cancel
                                </Button>
                                <Button onClick={addItem} disabled={!selectedMasterItemId || newItem.quantity <= 0}>
                                  Add Item
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {items.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Unit Cost</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.description}</p>
                              {item.partNumber && (
                                <p className="text-xs text-gray-500">{item.partNumber}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-20"
                              min="0"
                              step="0.01"
                            />
                          </TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.unitCost}
                              onChange={(e) => updateItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                              className="w-24"
                              min="0"
                              step="0.01"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            ${(item.totalCost || (item.quantity * item.unitCost)).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No items in this BOM</p>
                    <p className="text-sm text-gray-400">Add items from the master list to build your BOM</p>
                  </div>
                )}

                {items.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total BOM Cost:</span>
                      <span>${calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Revision Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Revision Information</CardTitle>
                <CardDescription>Document changes made to this BOM</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="revisionNotes">Revision Notes *</Label>
                  <Textarea
                    id="revisionNotes"
                    placeholder="Describe the changes made to the BOM..."
                    rows={3}
                    value={revisionNotes}
                    onChange={(e) => setRevisionNotes(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">Required for updates and approvals</p>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
                <CardDescription>Special requirements and specifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="notes">BOM Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Special requirements, procurement notes, quality standards, etc."
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs font-medium text-gray-500">STATUS</Label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(formData.status)}>
                      {formData.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">TOTAL ITEMS</Label>
                  <p className="text-lg font-bold">{items.length}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">TOTAL COST</Label>
                  <p className="text-lg font-bold">${calculateTotal().toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">VERSION</Label>
                  <p className="text-lg font-bold">{formData.version} (Rev. {formData.revision})</p>
                </div>
              </CardContent>
            </Card>

            {/* Validation Checklist */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Validation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${formData.bomNumber.trim() ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>BOM Number specified</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${formData.productName.trim() ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>Product name specified</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${items.length > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>Items added</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${calculateTotal() > 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span>Costs calculated</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${revisionNotes.trim() ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span>Revision notes</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calculator className="w-4 h-4 mr-2" />
                  Recalculate Costs
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Validate BOM
                </Button>
                <Link href={`/bom/${bom.id}`} className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    View BOM Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
