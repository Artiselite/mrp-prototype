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
import { ArrowLeft, Save, Plus, X, Calculator, ArrowRight } from 'lucide-react'
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import { useDatabaseContext } from "@/components/database-provider"
import type { BOQItem } from "@/lib/types"

export default function CreateBOQPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { 
    billsOfQuantities: boqs = [], 
    engineeringDrawings: drawings = [], 
    quotations = [], 
    items: masterItems = [],
    isInitialized,
    createBillOfQuantities: createBoq,
    updateQuotation
  } = useDatabaseContext()

  const [formData, setFormData] = useState({
    boqNumber: "",
    title: "",
    projectName: "",
    description: "",
    engineeringDrawingId: "none",
    quotationId: "none",
    createdBy: "",
    // ETO workflow fields
    contractReference: "",
    workflowStage: "BOQ Submitted" as const,
  })

  const [items, setItems] = useState<Omit<BOQItem, "id">[]>([])
  const [newItem, setNewItem] = useState({
    selectedItemId: "",
    itemNumber: "",
    description: "",
    quantity: 0,
    unit: "",
    unitRate: 0,
    category: "Material" as BOQItem["category"],
    specifications: "",
    remarks: "",
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
        engineeringDrawingId: formData.engineeringDrawingId === "none" ? undefined : formData.engineeringDrawingId,
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
        // ETO workflow fields
        etoStatus: "BOQ Submitted",
        engineeringProgress: 25, // BOQ created represents 25% progress
      })

      // Update linked quotation if selected
      if (formData.quotationId !== "none") {
        const quotation = quotations.find((q: any) => q.id === formData.quotationId)
        if (quotation) {
          updateQuotation(formData.quotationId, {
            boqGenerated: true,
            boqId: newBoq.id,
            workflowStage: "Ready to Send",
            updatedAt: new Date().toISOString(),
          })
        }
      }

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
        selectedItemId: "",
        itemNumber: "",
        description: "",
        quantity: 0,
        unit: "",
        unitRate: 0,
        category: "Material",
        specifications: "",
        remarks: "",
      })
    }
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemSelection = (itemId: string) => {
    if (!itemId || itemId === "") {
      // Clear item fields when no item is selected
      setNewItem(prev => ({
        ...prev,
        selectedItemId: "",
        itemNumber: "",
        description: "",
        unit: "",
        unitRate: 0,
        specifications: "",
      }))
      return
    }

    setNewItem(prev => ({ ...prev, selectedItemId: itemId }))

    if (!masterItems || !Array.isArray(masterItems)) {
      return
    }

    const selectedItem = masterItems.find(item => item && item.id === itemId)
    if (selectedItem) {
      setNewItem(prev => ({
        ...prev,
        itemNumber: selectedItem.partNumber || "",
        description: selectedItem.name || "",
        unit: selectedItem.unit || "",
        unitRate: selectedItem.unitCost || 0,
        specifications: selectedItem.specifications || "",
        category: selectedItem.category === "Raw Materials" ? "Material" :
          selectedItem.category === "Finished Goods" ? "Material" :
            selectedItem.category === "Services" ? "Labor" : "Material",
      }))
    }
  }

  const handleQuotationSelection = (selectedQuotationId: string) => {
    setFormData(prev => ({ ...prev, quotationId: selectedQuotationId }))

    if (selectedQuotationId === "none") {
      // Clear auto-populated data when "No Quotation" is selected
      setFormData(prev => ({
        ...prev,
        boqNumber: "",
        title: "",
        projectName: "",
        description: "",
        contractReference: "",
        createdBy: "",
        engineeringDrawingId: "none",
      }))
      setItems([])
      return
    }

    // Auto-populate from selected quotation
    const quotation = quotations.find((q: any) => q.id === selectedQuotationId)
    if (quotation) {
      // Auto-generate BOQ number based on quotation
      const boqNumber = `BOQ-${quotation.quotationNumber.replace('Q', '')}`

      setFormData(prev => ({
        ...prev,
        boqNumber,
        title: `BOQ for ${quotation.title}`,
        projectName: quotation.title,
        description: `Bill of Quantities for ${quotation.title} - ${quotation.description}`,
        contractReference: quotation.quotationNumber,
        createdBy: quotation.salesPerson || "Current User",
      }))

      // Pre-populate BOQ items from quotation items
      if (quotation.items && quotation.items.length > 0) {
        const boqItems = quotation.items.map((quotItem: any, index: number) => ({
          itemNumber: `${index + 1}.0`,
          description: quotItem.description,
          quantity: quotItem.quantity,
          unit: "EA", // Default unit, can be changed
          unitRate: quotItem.unitPrice,
          totalAmount: quotItem.totalPrice,
          category: "Material" as BOQItem["category"],
          specifications: quotItem.specifications || "",
          remarks: `From Quotation: ${quotation.quotationNumber}`,
        }))
        setItems(boqItems)
      }

      // Find linked engineering drawing if available
      if (quotation.engineeringProjectId && drawings.length > 0) {
        const linkedDrawing = drawings.find((d: any) => d.projectId === quotation.engineeringProjectId)
        if (linkedDrawing) {
          setFormData(prev => ({
            ...prev,
            engineeringDrawingId: linkedDrawing.id,
          }))
        }
      }
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

  const totalCost = items?.reduce((sum, item) => sum + (item.totalAmount || 0), 0) || 0

  // Pre-populate form based on URL parameters
  useEffect(() => {
    if (!drawings || !quotations) return

    const drawingId = searchParams.get('drawingId')
    const quotationId = searchParams.get('quotationId')

    if (drawingId && drawings.length > 0) {
      const drawing = drawings.find((d: any) => d.id === drawingId)
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

    if (quotationId && quotations.length > 0) {
      const quotation = quotations.find((q: any) => q.id === quotationId)
      if (quotation) {
        // Auto-generate BOQ number based on quotation
        const boqNumber = `BOQ-${quotation.quotationNumber.replace('Q', '')}`

        setFormData(prev => ({
          ...prev,
          quotationId: quotationId,
          boqNumber,
          title: `BOQ for ${quotation.title}`,
          projectName: quotation.title,
          description: `Bill of Quantities for ${quotation.title} - ${quotation.description}`,
          contractReference: quotation.quotationNumber,
          createdBy: quotation.salesPerson || "Current User",
        }))

        // Pre-populate BOQ items from quotation items
        if (quotation.items && quotation.items.length > 0) {
          const boqItems = quotation.items.map((quotItem: any, index: number) => ({
            itemNumber: `${index + 1}.0`,
            description: quotItem.description,
            quantity: quotItem.quantity,
            unit: "EA", // Default unit, can be changed
            unitRate: quotItem.unitPrice,
            totalAmount: quotItem.totalPrice,
            category: "Material" as BOQItem["category"],
            specifications: quotItem.specifications || "",
            remarks: `From Quotation: ${quotation.quotationNumber}`,
          }))
          setItems(boqItems)
        }

        // Find linked engineering drawing if available
        if (quotation.engineeringProjectId && drawings.length > 0) {
          const linkedDrawing = drawings.find(d => d.projectId === quotation.engineeringProjectId)
          if (linkedDrawing) {
            setFormData(prev => ({
              ...prev,
              engineeringDrawingId: linkedDrawing.id,
            }))
          }
        }
      }
    }
  }, [searchParams, drawings, quotations])

  // Debug logging
  console.log('BOQ Create Debug:', {
    isInitialized,
    drawings: drawings ? `array(${drawings.length})` : drawings,
    quotations: quotations ? `array(${quotations.length})` : quotations,
    masterItems: masterItems ? `array(${masterItems.length})` : masterItems
  })

  // Show loading state while database is initializing
  if (!isInitialized || !Array.isArray(drawings) || !Array.isArray(quotations) || !Array.isArray(masterItems)) {
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
        {/* ETO Workflow Context */}
        {formData.quotationId !== "none" && quotations.length > 0 && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900 flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Workflow Progress
              </CardTitle>
              <CardDescription className="text-green-700">
                Creating BOQ as part of Engineer-to-Order workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Quotation Created</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Engineering Drawing</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-600">BOQ Generation</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-500">Send to Customer</span>
                </div>
              </div>
              {(() => {
                const quotation = quotations.find(q => q.id === formData.quotationId)
                return quotation && (
                  <div className="mt-4 p-3 bg-white rounded border">
                    <h4 className="font-medium text-green-900">Source Quotation Details</h4>
                    <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                      <div>
                        <span className="font-medium">Quotation:</span> {quotation.quotationNumber}
                      </div>
                      <div>
                        <span className="font-medium">Customer:</span> {quotation.customerName}
                      </div>
                      <div>
                        <span className="font-medium">Value:</span> ${quotation.total.toLocaleString()}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        )}

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

              {/* Source Selection */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-medium text-blue-900 mb-3">Source Selection</h3>
                <p className="text-sm text-blue-700 mb-4">Link this BOQ to an existing quotation</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quotationId">Source Quotation (Recommended)</Label>
                    <Select key="quotation-select" value={formData.quotationId} onValueChange={handleQuotationSelection}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select quotation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Quotation</SelectItem>
                        {quotations && Array.isArray(quotations) && quotations.length > 0 ? (
                          quotations
                            .filter(q => {
                              if (!q || !q.id) return false
                              if (q.status === 'Rejected' || q.status === 'Expired') return false
                              return true
                            })
                            .map((quotation) => {
                              const quotationNumber = quotation.quotationNumber || 'N/A'
                              const title = quotation.title || 'Untitled'
                              const customerName = quotation.customerName || 'Unknown'
                              const displayText = `${quotationNumber} - ${title} (${customerName})`

                              return (
                                <SelectItem key={`quotation-${quotation.id}`} value={quotation.id}>
                                  {displayText}
                                </SelectItem>
                              )
                            })
                        ) : (
                          <SelectItem value="loading-quotations" disabled>
                            {quotations && quotations.length === 0 ? "No quotations available" : "Loading quotations..."}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-blue-600 mt-1">
                      Selecting a quotation will auto-populate BOQ details and items
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="contractReference">Contract Reference</Label>
                    <Input
                      id="contractReference"
                      value={formData.contractReference}
                      onChange={(e) => setFormData(prev => ({ ...prev, contractReference: e.target.value }))}
                      placeholder="Customer contract/PO reference"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="engineeringDrawingId">Engineering Drawing (Optional)</Label>
                <Select key="drawing-select" value={formData.engineeringDrawingId} onValueChange={(value) => setFormData(prev => ({ ...prev, engineeringDrawingId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select drawing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {drawings && Array.isArray(drawings) && drawings.length > 0 ? (
                      drawings
                        .filter(drawing => drawing && drawing.id && drawing.drawingNumber && drawing.title)
                        .map((drawing) => (
                          <SelectItem key={drawing.id} value={drawing.id}>
                            {drawing.drawingNumber} - {drawing.title}
                          </SelectItem>
                        ))
                    ) : (
                      <SelectItem value="loading-drawings" disabled>
                        {drawings && drawings.length === 0 ? "No drawings available" : "Loading drawings..."}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
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

                {/* Item Master Selection */}
                {isInitialized && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Label htmlFor="itemMaster">Select Item from Master (Recommended)</Label>
                    <Select key="item-master-select" value={newItem.selectedItemId} onValueChange={handleItemSelection}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose from item master or enter manually below" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual-entry">Manual Entry</SelectItem>
                        {masterItems && Array.isArray(masterItems) && masterItems.length > 0 ? (
                          masterItems
                            .filter(item => item && item.id && item.partNumber && item.name)
                            .map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.partNumber} - {item.name} ({item.category || 'No Category'})
                              </SelectItem>
                            ))
                        ) : (
                          <SelectItem value="loading" disabled>
                            {masterItems && masterItems.length === 0 ? "No items available" : "Loading items..."}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-blue-600 mt-1">
                      Selecting an item will auto-populate details below
                    </p>
                  </div>
                )}

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
                    <Label htmlFor="itemDescription">
                      Description {newItem.selectedItemId && <span className="text-xs text-blue-600">(Auto-populated)</span>}
                    </Label>
                    <Input
                      id="itemDescription"
                      value={newItem.description}
                      onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Item description"
                      className={newItem.selectedItemId ? "bg-blue-50 border-blue-200" : ""}
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
                    <Label htmlFor="unit">
                      Unit {newItem.selectedItemId && <span className="text-xs text-blue-600">(Auto-populated)</span>}
                    </Label>
                    <Input
                      id="unit"
                      value={newItem.unit}
                      onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
                      placeholder="EA, LF, SQ FT"
                      className={newItem.selectedItemId ? "bg-blue-50 border-blue-200" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitRate">
                      Unit Rate ($) {newItem.selectedItemId && <span className="text-xs text-blue-600">(Auto-populated)</span>}
                    </Label>
                    <Input
                      id="unitRate"
                      type="number"
                      value={newItem.unitRate}
                      onChange={(e) => setNewItem(prev => ({ ...prev, unitRate: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={newItem.selectedItemId ? "bg-blue-50 border-blue-200" : ""}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select key="category-select" value={newItem.category} onValueChange={(value: BOQItem["category"]) => setNewItem(prev => ({ ...prev, category: value }))}>
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
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </Button>
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

          {/* ETO Workflow Actions */}
          {formData.quotationId !== "none" && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Next Steps in ETO Workflow</CardTitle>
                <CardDescription className="text-blue-700">
                  Simplified workflow: BOQ creation → Customer approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded border">
                    <h4 className="font-medium mb-2">1. Review BOQ</h4>
                    <p className="text-sm text-gray-600 mb-3">Engineering review and approval of quantities and costs</p>
                    <Badge variant="outline" className="text-xs">After Creation</Badge>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <h4 className="font-medium mb-2">2. Send to Customer</h4>
                    <p className="text-sm text-gray-600 mb-3">Update quotation and send to customer for approval</p>
                    <Badge variant="outline" className="text-xs">Final Step</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit */}
          <div className="flex justify-between items-center">
            <div>
              {items.length > 0 && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{items.length}</span> items •
                  <span className="font-medium"> ${totalCost.toFixed(2)}</span> total value
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <Link href="/boq">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="flex items-center gap-2"
                disabled={items.length === 0}
              >
                <Save className="w-4 h-4" />
                Create BOQ
                {formData.quotationId !== "none" && (
                  <span className="ml-1 text-xs opacity-75">& Update Quotation</span>
                )}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
