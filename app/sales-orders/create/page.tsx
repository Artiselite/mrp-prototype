"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react"
import { customers, quotations, formatCurrency } from "@/lib/data"

interface SalesOrderItem {
  id: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
  steelGrade?: string
  specifications?: string
  deliveryDate?: string
}

export default function CreateSalesOrderPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    quotationId: "",
    customerId: "",
    customerPO: "",
    title: "",
    description: "",
    priority: "Medium" as "Low" | "Medium" | "High" | "Critical",
    requestedDeliveryDate: "",
    shippingAddress: "",
    billingAddress: "",
    paymentTerms: "Net 30",
    notes: "",
    taxRate: 8.5,
  })

  const [items, setItems] = useState<SalesOrderItem[]>([
    {
      id: "1",
      description: "",
      quantity: 1,
      unit: "pieces",
      unitPrice: 0,
      totalPrice: 0,
      steelGrade: "",
      specifications: "",
      deliveryDate: "",
    },
  ])

  const selectedQuotation = quotations.find((q) => q.id === formData.quotationId)
  const selectedCustomer = customers.find((c) => c.id === formData.customerId)

  const handleQuotationChange = (quotationId: string) => {
    const quotation = quotations.find((q) => q.id === quotationId)
    if (quotation) {
      setFormData((prev) => ({
        ...prev,
        quotationId,
        customerId: quotation.customerId,
        title: quotation.title,
        description: quotation.description,
        priority: "Medium" as "Low" | "Medium" | "High" | "Critical",
        paymentTerms: selectedCustomer?.paymentTerms || "Net 30",
      }))

      // Convert quotation items to sales order items
      const salesOrderItems = quotation.items.map((item, index) => ({
        id: (index + 1).toString(),
        description: item.description,
        quantity: item.quantity,
        unit: "pieces",
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        steelGrade: "",
        specifications: item.specifications,
        deliveryDate: "",
      }))
      setItems(salesOrderItems)
    }
  }

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId)
    if (customer) {
      setFormData((prev) => ({
        ...prev,
        customerId,
        paymentTerms: customer.paymentTerms,
        shippingAddress: `${customer.address}, ${customer.city}, ${customer.state} ${customer.zipCode}`,
        billingAddress: `${customer.address}, ${customer.city}, ${customer.state} ${customer.zipCode}`,
      }))
    }
  }

  const addItem = () => {
    const newItem: SalesOrderItem = {
      id: (items.length + 1).toString(),
      description: "",
      quantity: 1,
      unit: "pieces",
      unitPrice: 0,
      totalPrice: 0,
      steelGrade: "",
      specifications: "",
      deliveryDate: "",
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const updateItem = (id: string, field: keyof SalesOrderItem, value: string | number) => {
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

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const taxAmount = subtotal * (formData.taxRate / 100)
  const totalAmount = subtotal + taxAmount

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically save the sales order to your backend
    console.log("Sales Order Data:", {
      ...formData,
      items,
      subtotal,
      taxAmount,
      totalAmount,
    })
    router.push("/sales-orders")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" asChild>
              <Link href="/sales-orders">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sales Orders
              </Link>
            </Button>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Sales Order</h1>
            <p className="text-gray-600 mt-2">Convert quotation to sales order or create new order</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="quotationId">Source Quotation (Optional)</Label>
                  <Select value={formData.quotationId} onValueChange={handleQuotationChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select quotation to convert" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No quotation (new order)</SelectItem>
                      {quotations
                        .filter((q) => q.status === "Approved")
                        .map((quotation) => (
                          <SelectItem key={quotation.id} value={quotation.id}>
                            {quotation.id} - {quotation.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="customerId">Customer *</Label>
                  <Select value={formData.customerId} onValueChange={handleCustomerChange} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="customerPO">Customer PO Number *</Label>
                  <Input
                    id="customerPO"
                    value={formData.customerPO}
                    onChange={(e) => setFormData((prev) => ({ ...prev, customerPO: e.target.value }))}
                    placeholder="Enter customer PO number"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: "Low" | "Medium" | "High" | "Critical") =>
                      setFormData((prev) => ({ ...prev, priority: value }))
                    }
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
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter order title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="requestedDeliveryDate">Requested Delivery Date *</Label>
                  <Input
                    id="requestedDeliveryDate"
                    type="date"
                    value={formData.requestedDeliveryDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, requestedDeliveryDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter order description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Line Items</CardTitle>
                <Button type="button" onClick={addItem} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description *</TableHead>
                      <TableHead>Qty *</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Unit Price *</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Steel Grade</TableHead>
                      <TableHead>Delivery Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="space-y-2">
                            <Input
                              value={item.description}
                              onChange={(e) => updateItem(item.id, "description", e.target.value)}
                              placeholder="Item description"
                              required
                            />
                            <Input
                              value={item.specifications || ""}
                              onChange={(e) => updateItem(item.id, "specifications", e.target.value)}
                              placeholder="Specifications (optional)"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", Number.parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            required
                          />
                        </TableCell>
                        <TableCell>
                          <Select value={item.unit} onValueChange={(value) => updateItem(item.id, "unit", value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pieces">Pieces</SelectItem>
                              <SelectItem value="feet">Feet</SelectItem>
                              <SelectItem value="pounds">Pounds</SelectItem>
                              <SelectItem value="tons">Tons</SelectItem>
                              <SelectItem value="lots">Lots</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            required
                          />
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(item.totalPrice)}</TableCell>
                        <TableCell>
                          <Input
                            value={item.steelGrade || ""}
                            onChange={(e) => updateItem(item.id, "steelGrade", e.target.value)}
                            placeholder="e.g., A992"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            value={item.deliveryDate || ""}
                            onChange={(e) => updateItem(item.id, "deliveryDate", e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            disabled={items.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totals */}
              <div className="mt-6 flex justify-end">
                <div className="w-80 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tax Rate:</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={formData.taxRate}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, taxRate: Number.parseFloat(e.target.value) || 0 }))
                        }
                        min="0"
                        max="100"
                        step="0.1"
                        className="w-20"
                      />
                      <span>%</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax Amount:</span>
                    <span className="font-medium">{formatCurrency(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Addresses and Terms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.shippingAddress}
                  onChange={(e) => setFormData((prev) => ({ ...prev, shippingAddress: e.target.value }))}
                  placeholder="Enter shipping address"
                  rows={4}
                  required
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing Address</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.billingAddress}
                  onChange={(e) => setFormData((prev) => ({ ...prev, billingAddress: e.target.value }))}
                  placeholder="Enter billing address"
                  rows={4}
                  required
                />
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Select
                  value={formData.paymentTerms}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentTerms: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Net 15">Net 15</SelectItem>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 45">Net 45</SelectItem>
                    <SelectItem value="Net 60">Net 60</SelectItem>
                    <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Enter any additional notes or special instructions"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/sales-orders">Cancel</Link>
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              Create Sales Order
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
