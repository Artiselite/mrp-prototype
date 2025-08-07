"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Save, Plus, Trash2, Calculator, Send } from 'lucide-react'
import Link from "next/link"

export default function CreateQuotationPage() {
  const [formData, setFormData] = useState({
    customer: "",
    contactPerson: "",
    email: "",
    phone: "",
    project: "",
    description: "",
    steelType: "",
    quantity: "",
    estimatedValue: "",
    dueDate: "",
    validUntil: "",
    priority: "medium",
    notes: ""
  })

  const [lineItems, setLineItems] = useState([
    { id: 1, category: "materials", description: "", quantity: "", unit: "pcs", rate: "", amount: 0 }
  ])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addLineItem = () => {
    const newItem = {
      id: Date.now(),
      category: "materials",
      description: "",
      quantity: "",
      unit: "pcs",
      rate: "",
      amount: 0
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

  const handleSave = (action: "draft" | "submit" | "send") => {
    console.log("Saving quotation:", { ...formData, lineItems, action })
    // Handle save logic here
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/quotations">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Quotations
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Quotation</h1>
                <p className="text-sm text-gray-600">Generate a new customer quotation</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleSave("draft")}>
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
              <Button variant="outline" onClick={() => handleSave("submit")}>
                <Save className="w-4 h-4 mr-2" />
                Submit for Review
              </Button>
              <Button onClick={() => handleSave("send")}>
                <Send className="w-4 h-4 mr-2" />
                Create & Send
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-4 gap-6">
          {/* Main Form */}
          <div className="col-span-3 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>Enter customer and project details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer Name *</Label>
                    <Input 
                      id="customer" 
                      placeholder="e.g., ABC Steel Works"
                      value={formData.customer}
                      onChange={(e) => handleInputChange("customer", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person *</Label>
                    <Input 
                      id="contactPerson" 
                      placeholder="e.g., John Anderson"
                      value={formData.contactPerson}
                      onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input 
                      id="email" 
                      type="email"
                      placeholder="contact@company.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input 
                      id="phone" 
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project">Project Name *</Label>
                  <Input 
                    id="project" 
                    placeholder="e.g., Industrial Warehouse Frame"
                    value={formData.project}
                    onChange={(e) => handleInputChange("project", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Project Description *</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Detailed description of the project requirements..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Technical Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Technical Specifications</CardTitle>
                <CardDescription>Steel requirements and project specifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="steelType">Primary Steel Type *</Label>
                    <Select value={formData.steelType} onValueChange={(value) => handleInputChange("steelType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select steel type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a36">A36 Structural Steel</SelectItem>
                        <SelectItem value="a992">A992 Grade 50</SelectItem>
                        <SelectItem value="a572">A572 Grade 50</SelectItem>
                        <SelectItem value="a514">A514 High Strength</SelectItem>
                        <SelectItem value="a588">A588 Weathering Steel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Estimated Quantity *</Label>
                    <Input 
                      id="quantity" 
                      placeholder="e.g., 50 tons"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange("quantity", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority Level</Label>
                    <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Required Completion Date *</Label>
                    <Input 
                      id="dueDate" 
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => handleInputChange("dueDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validUntil">Quotation Valid Until</Label>
                    <Input 
                      id="validUntil" 
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => handleInputChange("validUntil", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Line Items</CardTitle>
                    <CardDescription>Detailed pricing breakdown</CardDescription>
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
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="pcs"
                            value={item.unit}
                            onChange={(e) => updateLineItem(item.id, 'unit', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="2450"
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateLineItem(item.id, 'rate', e.target.value)}
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
                
                {/* Totals */}
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

            {/* Additional Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
                <CardDescription>Special requirements and notes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="notes">Special Requirements & Notes</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Any special requirements, delivery instructions, or additional notes..."
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pricing Summary</CardTitle>
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

            {/* Validation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Validation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${formData.customer ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span>Customer information {formData.customer ? 'complete' : 'required'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${formData.project ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span>Project details {formData.project ? 'complete' : 'required'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${lineItems.some(item => item.description) ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span>Line items {lineItems.some(item => item.description) ? 'added' : 'required'}</span>
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
                  Calculate Materials
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Import Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
