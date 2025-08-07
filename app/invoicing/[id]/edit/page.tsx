"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Plus, Trash2, Calculator, Send, DollarSign } from 'lucide-react'
import Link from "next/link"

export default function EditInvoicePage({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState({
    workOrderId: "WO-2024-003",
    customer: "Industrial Corp",
    customerAddress: "123 Industrial Blvd, Manufacturing City, MC 12345",
    contactPerson: "Robert Johnson",
    email: "r.johnson@industrialcorp.com",
    phone: "(555) 987-6543",
    project: "Custom Fabricated Brackets",
    status: "paid",
    dateIssued: "2024-01-26",
    dateDue: "2024-02-25",
    terms: "Net 30 days",
    notes: "Payment terms: Net 30 days. Late payments subject to 1.5% monthly service charge."
  })

  const [lineItems, setLineItems] = useState([
    { 
      id: 1,
      description: "Material Cost (A572 Grade 50)", 
      quantity: "8", 
      unit: "tons",
      rate: "1200", 
      amount: 9600,
      category: "materials"
    },
    { 
      id: 2,
      description: "Fabrication Labor", 
      quantity: "40", 
      unit: "hours",
      rate: "85", 
      amount: 3400,
      category: "labor"
    },
    { 
      id: 3,
      description: "Machining Services", 
      quantity: "16", 
      unit: "hours",
      rate: "120", 
      amount: 1920,
      category: "services"
    },
    { 
      id: 4,
      description: "Quality Inspection", 
      quantity: "1", 
      unit: "project",
      rate: "500", 
      amount: 500,
      category: "services"
    }
  ])

  const [revisionNotes, setRevisionNotes] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addLineItem = () => {
    const newItem = {
      id: Date.now(),
      description: "",
      quantity: "",
      unit: "hours",
      rate: "",
      amount: 0,
      category: "services"
    }
    setLineItems([...lineItems, newItem])
  }

  const removeLineItem = (id: number) => {
    setLineItems(lineItems.filter(item => item.id !== id))
  }

  const updateLineItem = (id: number, field: string, value: string) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        if (field === 'quantity' || field === 'rate') {
          const quantity = parseFloat(updatedItem.quantity) || 0
          const rate = parseFloat(updatedItem.rate) || 0
          updatedItem.amount = quantity * rate
        }
        return updatedItem
      }
      return item
    }))
  }

  const calculateSubtotal = () => {
    return lineItems.reduce((total, item) => total + item.amount, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.085
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const handleSave = (action: "draft" | "update" | "send") => {
    console.log("Saving invoice:", { ...formData, lineItems, revisionNotes, action })
    // Handle save logic here
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800"
      case "sent": return "bg-blue-100 text-blue-800"
      case "draft": return "bg-gray-100 text-gray-800"
      case "overdue": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "materials": return "bg-blue-100 text-blue-800"
      case "labor": return "bg-green-100 text-green-800"
      case "services": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href={`/invoicing/${params.id}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Invoice
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Invoice - INV-2024-001</h1>
                <p className="text-sm text-gray-600">Update invoice details and line items</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleSave("draft")}>
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
              <Button variant="outline" onClick={() => handleSave("update")}>
                <Save className="w-4 h-4 mr-2" />
                Update Invoice
              </Button>
              <Button onClick={() => handleSave("send")}>
                <Send className="w-4 h-4 mr-2" />
                Update & Send
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-4 gap-6">
          {/* Main Form */}
          <div className="col-span-3 space-y-6">
            {/* Invoice Header Information */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Information</CardTitle>
                <CardDescription>Update invoice header and customer details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workOrder">Source Work Order</Label>
                    <Select value={formData.workOrderId} onValueChange={(value) => handleInputChange("workOrderId", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WO-2024-001">WO-2024-001 - Industrial Warehouse Frame</SelectItem>
                        <SelectItem value="WO-2024-002">WO-2024-002 - Bridge Support Beams</SelectItem>
                        <SelectItem value="WO-2024-003">WO-2024-003 - Custom Fabricated Brackets</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Invoice Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateIssued">Date Issued</Label>
                    <Input 
                      id="dateIssued" 
                      type="date"
                      value={formData.dateIssued}
                      onChange={(e) => handleInputChange("dateIssued", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateDue">Due Date</Label>
                    <Input 
                      id="dateDue" 
                      type="date"
                      value={formData.dateDue}
                      onChange={(e) => handleInputChange("dateDue", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>Update billing information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer Name *</Label>
                    <Input 
                      id="customer" 
                      value={formData.customer}
                      onChange={(e) => handleInputChange("customer", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person *</Label>
                    <Input 
                      id="contactPerson" 
                      value={formData.contactPerson}
                      onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerAddress">Billing Address *</Label>
                  <Textarea 
                    id="customerAddress" 
                    rows={3}
                    value={formData.customerAddress}
                    onChange={(e) => handleInputChange("customerAddress", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input 
                      id="phone" 
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoice Line Items */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Invoice Line Items</CardTitle>
                    <CardDescription>Update detailed breakdown of charges</CardDescription>
                  </div>
                  <Button onClick={addLineItem} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Line Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Rate ($)</TableHead>
                      <TableHead>Amount ($)</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Select value={item.category} onValueChange={(value) => updateLineItem(item.id, 'category', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="materials">Materials</SelectItem>
                              <SelectItem value="labor">Labor</SelectItem>
                              <SelectItem value="services">Services</SelectItem>
                              <SelectItem value="delivery">Delivery</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Item description"
                            value={item.description}
                            onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="8"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="tons"
                            value={item.unit}
                            onChange={(e) => updateLineItem(item.id, 'unit', e.target.value)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="1200"
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateLineItem(item.id, 'rate', e.target.value)}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          ${item.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Calculator className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeLineItem(item.id)}
                              disabled={lineItems.length === 1}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Invoice Totals */}
                <div className="mt-6 flex justify-end">
                  <div className="w-80 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-medium">${calculateSubtotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (8.5%):</span>
                      <span className="font-medium">${calculateTax().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>${calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revision Information */}
            <Card>
              <CardHeader>
                <CardTitle>Update Information</CardTitle>
                <CardDescription>Document changes made to this invoice</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="revisionNotes">Update Notes *</Label>
                  <Textarea 
                    id="revisionNotes" 
                    placeholder="Describe the changes made to the invoice..."
                    rows={3}
                    value={revisionNotes}
                    onChange={(e) => setRevisionNotes(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Terms and Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Terms & Conditions</CardTitle>
                <CardDescription>Payment terms and additional information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="terms">Payment Terms</Label>
                  <Select value={formData.terms} onValueChange={(value) => handleInputChange("terms", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Net 15 days">Net 15 days</SelectItem>
                      <SelectItem value="Net 30 days">Net 30 days</SelectItem>
                      <SelectItem value="Net 45 days">Net 45 days</SelectItem>
                      <SelectItem value="Due on receipt">Due on receipt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes & Terms</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Payment terms, late fees, special conditions, etc."
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
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs font-medium text-gray-500">STATUS</Label>
                  <Badge className={getStatusColor(formData.status)}>
                    {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">INVOICE DATE</Label>
                  <p className="text-sm font-medium">{formData.dateIssued}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">DUE DATE</Label>
                  <p className="text-sm">{formData.dateDue}</p>
                </div>
              </CardContent>
            </Card>

            {/* Invoice Totals */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Invoice Totals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs font-medium text-gray-500">SUBTOTAL</Label>
                  <p className="text-lg font-bold">${calculateSubtotal().toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">TAX (8.5%)</Label>
                  <p className="text-sm">${calculateTax().toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">TOTAL</Label>
                  <p className="text-xl font-bold text-blue-600">${calculateTotal().toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Line Item Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Line Item Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {['materials', 'labor', 'services', 'delivery'].map(category => {
                  const categoryItems = lineItems.filter(item => item.category === category)
                  const categoryTotal = categoryItems.reduce((sum, item) => sum + item.amount, 0)
                  
                  if (categoryItems.length === 0) return null
                  
                  return (
                    <div key={category} className="flex justify-between items-center">
                      <Badge className={getCategoryColor(category)} variant="outline">
                        {category.charAt(0).toUpperCase() + category.slice(1)} ({categoryItems.length})
                      </Badge>
                      <span className="text-sm font-medium">${categoryTotal.toLocaleString()}</span>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs font-medium text-gray-500">TERMS</Label>
                  <p className="text-sm">{formData.terms}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">AMOUNT DUE</Label>
                  <p className="text-lg font-bold text-red-600">${calculateTotal().toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Validation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Validation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Customer information complete</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Line items present</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Totals calculated</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Update notes required</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
