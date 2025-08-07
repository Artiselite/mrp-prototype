"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Save, Plus, Calculator, Send, Trash2 } from 'lucide-react'
import Link from "next/link"

export default function CreateInvoicePage() {
  const [formData, setFormData] = useState({
    workOrderId: "",
    dueDate: "",
    notes: ""
  })

  const [lineItems, setLineItems] = useState([
    { id: 1, description: "", quantity: "", rate: "", amount: 0 }
  ])

  const workOrders = [
    { id: "WO-2024-001", project: "Industrial Warehouse Frame", customer: "ABC Steel Works", status: "Completed" },
    { id: "WO-2024-002", project: "Bridge Support Beams", customer: "Metro Construction", status: "Completed" },
    { id: "WO-2024-003", project: "Custom Fabricated Brackets", customer: "Industrial Corp", status: "Completed" }
  ]

  const addLineItem = () => {
    const newItem = {
      id: Date.now(),
      description: "",
      quantity: "",
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
    return calculateSubtotal() * 0.085 // 8.5% tax
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const selectedWorkOrder = workOrders.find(wo => wo.id === formData.workOrderId)

  const handleSave = (action: "draft" | "send") => {
    console.log("Saving invoice:", { ...formData, lineItems, action })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/invoicing">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Invoicing
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
                <p className="text-sm text-gray-600">Generate invoice from completed work order</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleSave("draft")}>
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
              <Button onClick={() => handleSave("send")}>
                <Send className="w-4 h-4 mr-2" />
                Create & Send
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Source Work Order */}
          <Card>
            <CardHeader>
              <CardTitle>Source Information</CardTitle>
              <CardDescription>Select completed work order for invoicing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workOrder">Completed Work Order *</Label>
                  <Select value={formData.workOrderId} onValueChange={(value) => setFormData(prev => ({ ...prev, workOrderId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select completed work order" />
                    </SelectTrigger>
                    <SelectContent>
                      {workOrders.map((workOrder) => (
                        <SelectItem key={workOrder.id} value={workOrder.id}>
                          {workOrder.id} - {workOrder.project}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Payment Due Date *</Label>
                  <Input 
                    id="dueDate" 
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>

              {selectedWorkOrder && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">{selectedWorkOrder.project}</h4>
                  <p className="text-sm text-blue-700">Customer: {selectedWorkOrder.customer}</p>
                  <p className="text-sm text-blue-700">Status: {selectedWorkOrder.status}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice Line Items */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Invoice Line Items</CardTitle>
                  <CardDescription>Detailed breakdown of charges</CardDescription>
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
                    <TableHead>Description</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Rate ($)</TableHead>
                    <TableHead>Amount ($)</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Input
                          placeholder="e.g., Material Cost"
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="50 tons"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="1800"
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
              
              {/* Invoice Totals */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
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
              </div>
            </CardContent>
          </Card>

          {/* Invoice Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Notes</CardTitle>
              <CardDescription>Payment terms and additional information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes & Terms</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Payment terms: Net 30 days. Late payments subject to 1.5% monthly service charge. All materials remain property of seller until payment is received in full."
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
