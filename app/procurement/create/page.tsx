"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShoppingCart, Plus, Trash2, ArrowLeft, Save, Send, Calculator } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { suppliers, billsOfMaterials } from "@/lib/data"
import type { PurchaseOrderItem, Item } from "@/lib/types"
import UnitEconomicsCalculator from "@/components/unit-economics-calculator"
import ItemSelector from "@/components/item-selector"
import { calculateOrderEconomics } from "@/lib/services/item-economics"
import { AlertTriangle, TrendingUp, DollarSign } from "lucide-react"
import { useDatabaseContext } from "@/components/database-provider"

export default function CreatePurchaseOrderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { subcontractorWorkOrders = [] } = useDatabaseContext()
  
  const [formData, setFormData] = useState({
    supplierId: "",
    bomId: "",
    priority: "Medium",
    requestedDeliveryDate: "",
    shippingAddress: "123 Factory St, Production City, PC 12345",
    paymentTerms: "Net 30",
    notes: "",
  })

  const [items, setItems] = useState<PurchaseOrderItem[]>([])

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showUnitEconomics, setShowUnitEconomics] = useState(false)

  // Handle workOrderId query parameter to pre-populate form
  useEffect(() => {
    const workOrderId = searchParams.get('workOrderId')
    if (workOrderId) {
      const workOrder = subcontractorWorkOrders.find(wo => wo.id === workOrderId)
      if (workOrder) {
        setFormData(prev => ({
          ...prev,
          supplierId: workOrder.supplierId,
          priority: workOrder.priority || "Medium",
          notes: `Purchase order for subcontractor work order: ${workOrder.workOrderNumber} - ${workOrder.workDescription}`
        }))
      }
    }
  }, [searchParams, subcontractorWorkOrders])

  const addItemFromMaster = (item: Item, quantity: number) => {
    const newItem: PurchaseOrderItem = {
      id: item.id,
      description: item.name,
      partNumber: item.partNumber,
      quantity: quantity,
      unit: item.unit,
      unitPrice: item.unitCost,
      totalPrice: item.unitCost * quantity,
      steelGrade: item.specifications.includes('Grade') ? 
        item.specifications.match(/Grade\s+([A-Z0-9]+)/)?.[1] || '' : '',
      urgency: "Medium",
      requestedDate: "",
      specifications: item.specifications,
      notes: item.notes || "",
    }
    setItems([...items, newItem])
  }

  const addManualItem = () => {
    const newItem: PurchaseOrderItem = {
      id: `manual_${Date.now()}`,
      description: "",
      partNumber: "",
      quantity: 1,
      unit: "pieces",
      unitPrice: 0,
      totalPrice: 0,
      steelGrade: "",
      urgency: "Medium",
      requestedDate: "",
      specifications: "",
      notes: "",
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const updateItem = (id: string, field: keyof PurchaseOrderItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          if (field === "quantity" || field === "unitPrice") {
            updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice
          }
          return updatedItem
        }
        return item
      }),
    )
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0)
  }

  const calculateTax = (subtotal: number) => {
    return subtotal * 0.085 // 8.5% tax rate
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const tax = calculateTax(subtotal)
    const shipping = 500 // Fixed shipping cost
    return subtotal + tax + shipping
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.supplierId) {
      newErrors.supplierId = "Supplier is required"
    }
    if (!formData.requestedDeliveryDate) {
      newErrors.requestedDeliveryDate = "Delivery date is required"
    }

    // Validate items
    items.forEach((item, index) => {
      if (!item.description) {
        newErrors[`item_${index}_description`] = "Description is required"
      }
      if (!item.partNumber) {
        newErrors[`item_${index}_partNumber`] = "Part number is required"
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = "Quantity must be greater than 0"
      }
      if (item.unitPrice <= 0) {
        newErrors[`item_${index}_unitPrice`] = "Unit price must be greater than 0"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (status: "Draft" | "Sent") => {
    if (!validateForm()) {
      return
    }

    // Generate new PO ID
    const newId = `PO-2024-${String(Date.now()).slice(-3)}`

    const subtotal = calculateSubtotal()
    const taxAmount = calculateTax(subtotal)
    const shippingCost = 500
    const totalAmount = subtotal + taxAmount + shippingCost

    const newPO = {
      id: newId,
      supplierId: formData.supplierId,
      supplier: suppliers.find((s) => s.id === formData.supplierId)?.name || "",
      bomId: formData.bomId || undefined,
      status,
      priority: formData.priority as "Low" | "Medium" | "High" | "Critical",
      orderDate: new Date().toISOString().split("T")[0],
      requestedDeliveryDate: formData.requestedDeliveryDate,
      subtotal,
      taxRate: 8.5,
      taxAmount,
      shippingCost,
      totalAmount,
      items,
      shippingAddress: formData.shippingAddress,
      paymentTerms: formData.paymentTerms,
      notes: formData.notes,
    }

    console.log("Creating PO:", newPO)
    // In a real app, this would be an API call
    router.push("/procurement")
  }

  const selectedSupplier = suppliers.find((s) => s.id === formData.supplierId)
  
  // Calculate real-time economics for selected items
  const orderEconomics = calculateOrderEconomics(items)
  
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'High': return 'bg-orange-100 text-orange-800'
      case 'Critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link href="/procurement">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Procurement
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-8 h-8 text-purple-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Create Purchase Order</h1>
                  <p className="text-sm text-gray-600">Create a new purchase order for materials and supplies</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowUnitEconomics(!showUnitEconomics)}
              >
                <Calculator className="w-4 h-4 mr-2" />
                {showUnitEconomics ? 'Hide' : 'Show'} Unit Economics
              </Button>
              <Button variant="outline" onClick={() => handleSubmit("Draft")}>
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
              <Button onClick={() => handleSubmit("Sent")}>
                <Send className="w-4 h-4 mr-2" />
                Send to Supplier
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Unit Economics Calculator Section */}
        {showUnitEconomics && (
          <div className="mb-8">
            <UnitEconomicsCalculator 
              quotationId={`PO-${Date.now()}`}
              onSave={(data) => {
                console.log('Unit economics saved:', data)
                // In a real app, this would save to the database
              }}
            />
          </div>
        )}

        {/* Purchase Order Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Purchase Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplier">Supplier *</Label>
                    <Select
                      value={formData.supplierId}
                      onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
                    >
                      <SelectTrigger className={errors.supplierId ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            <div>
                              <div className="font-medium">{supplier.name}</div>
                              <div className="text-sm text-gray-500">{supplier.specialties.join(", ")}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.supplierId && <p className="text-sm text-red-500 mt-1">{errors.supplierId}</p>}
                  </div>

                  <div>
                    <Label htmlFor="bom">Related BOM (Optional)</Label>
                    <Select
                      value={formData.bomId}
                      onValueChange={(value) => setFormData({ ...formData, bomId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select BOM" />
                      </SelectTrigger>
                      <SelectContent>
                        {billsOfMaterials.map((bom) => (
                          <SelectItem key={bom.id} value={bom.id}>
                            {bom.id} - {bom.productName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({ ...formData, priority: value })}
                    >
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

                  <div>
                    <Label htmlFor="deliveryDate">Requested Delivery Date *</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={formData.requestedDeliveryDate}
                      onChange={(e) => setFormData({ ...formData, requestedDeliveryDate: e.target.value })}
                      className={errors.requestedDeliveryDate ? "border-red-500" : ""}
                    />
                    {errors.requestedDeliveryDate && (
                      <p className="text-sm text-red-500 mt-1">{errors.requestedDeliveryDate}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="shippingAddress">Shipping Address</Label>
                  <Textarea
                    id="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <Select
                      value={formData.paymentTerms}
                      onValueChange={(value) => setFormData({ ...formData, paymentTerms: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Net 15">Net 15</SelectItem>
                        <SelectItem value="Net 30">Net 30</SelectItem>
                        <SelectItem value="Net 45">Net 45</SelectItem>
                        <SelectItem value="Net 60">Net 60</SelectItem>
                        <SelectItem value="COD">Cash on Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    placeholder="Additional notes or special instructions..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            {/* Supplier Info */}
            {selectedSupplier && (
              <Card>
                <CardHeader>
                  <CardTitle>Supplier Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium">{selectedSupplier.name}</p>
                    <p className="text-sm text-gray-600">{selectedSupplier.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{selectedSupplier.email}</p>
                    <p className="text-sm text-gray-600">{selectedSupplier.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {selectedSupplier.address}, {selectedSupplier.city}, {selectedSupplier.state}{" "}
                      {selectedSupplier.zipCode}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">Rating: {selectedSupplier.rating}/5</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Specialties:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedSupplier.specialties.map((specialty) => (
                        <Badge key={specialty} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>MYR{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8.5%):</span>
                  <span>MYR{calculateTax(calculateSubtotal()).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>MYR2,400.00</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>MYR{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Items: {items.length}</p>
                  <p>Total Quantity: {items.reduce((sum, item) => sum + item.quantity, 0)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Real-time Economics Summary */}
        {items.length > 0 && (
          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <TrendingUp className="w-5 h-5" />
                Real-time Economics Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-blue-600">MYR{orderEconomics.totalBaseCost.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Base Cost</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-orange-600">MYR{orderEconomics.totalCopperCost.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Copper Cost</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-green-600">MYR{orderEconomics.totalCost.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Total Cost</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-purple-600">{orderEconomics.averageMargin.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Avg Margin</div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Risk Level:</span>
                  <Badge className={getRiskColor(orderEconomics.riskLevel)}>
                    {orderEconomics.riskLevel}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    ({orderEconomics.copperExposure.toFixed(1)}% copper exposure)
                  </span>
                </div>
                {orderEconomics.recommendations.length > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-orange-600">
                      {orderEconomics.recommendations.length} recommendation{orderEconomics.recommendations.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
              
              {orderEconomics.recommendations.length > 0 && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-orange-200">
                  <div className="text-sm font-medium text-orange-800 mb-2">Action Items:</div>
                  <ul className="text-sm text-orange-700 space-y-2">
                    {orderEconomics.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-orange-600 mt-0.5">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                    <div className="text-xs text-blue-800">
                      <strong>Need Help?</strong> Contact Finance team (ext. 1234) for hedging strategies or Procurement Manager (ext. 5678) for supplier negotiations.
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Item Master Selection - Full Width */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add Items from Item Master</CardTitle>
          </CardHeader>
          <CardContent>
            <ItemSelector 
              onItemSelect={addItemFromMaster}
              selectedItems={items.map(item => item.id)}
            />
          </CardContent>
        </Card>

        {/* Line Items Table - Full Width */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Purchase Order Line Items</CardTitle>
              <Button onClick={addManualItem} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Manual Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead className="min-w-[200px]">Description *</TableHead>
                    <TableHead className="min-w-[120px]">Part Number *</TableHead>
                    <TableHead className="w-[120px]">Qty *</TableHead>
                    <TableHead className="w-[80px]">Unit</TableHead>
                    <TableHead className="w-[150px]">Unit Price *</TableHead>
                    <TableHead className="w-[150px]">Total</TableHead>
                    <TableHead className="w-[80px]">Urgency</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(item.id, "description", e.target.value)}
                            placeholder="Item description"
                            className={`${errors[`item_${index}_description`] ? "border-red-500" : ""} text-sm`}
                          />
                          {errors[`item_${index}_description`] && (
                            <p className="text-xs text-red-500">{errors[`item_${index}_description`]}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Input
                            value={item.partNumber}
                            onChange={(e) => updateItem(item.id, "partNumber", e.target.value)}
                            placeholder="Part number"
                            className={`${errors[`item_${index}_partNumber`] ? "border-red-500" : ""} text-sm`}
                          />
                          {errors[`item_${index}_partNumber`] && (
                            <p className="text-xs text-red-500">{errors[`item_${index}_partNumber`]}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 0)}
                            min="1"
                            className={`${errors[`item_${index}_quantity`] ? "border-red-500" : ""} text-sm`}
                          />
                          {errors[`item_${index}_quantity`] && (
                            <p className="text-xs text-red-500">{errors[`item_${index}_quantity`]}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select value={item.unit} onValueChange={(value) => updateItem(item.id, "unit", value)}>
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pieces">Pieces</SelectItem>
                            <SelectItem value="feet">Feet</SelectItem>
                            <SelectItem value="pounds">Pounds</SelectItem>
                            <SelectItem value="tons">Tons</SelectItem>
                            <SelectItem value="sheets">Sheets</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateItem(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)
                            }
                            min="0"
                            className={`${errors[`item_${index}_unitPrice`] ? "border-red-500" : ""} text-sm`}
                          />
                          {errors[`item_${index}_unitPrice`] && (
                            <p className="text-xs text-red-500">{errors[`item_${index}_unitPrice`]}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">MYR{item.totalPrice.toFixed(2)}</div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={item.urgency}
                          onValueChange={(value) => updateItem(item.id, "urgency", value)}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
