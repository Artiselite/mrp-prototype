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
import { ArrowLeft, Save, Plus, Trash2, Calculator, Send, DollarSign, Loader2 } from 'lucide-react'
import Link from "next/link"
import { useDatabaseContext } from "@/components/database-provider"
import type { Invoice, Customer, InvoiceItem } from "@/lib/types"

interface EditInvoicePageProps {
  params: Promise<{ id: string }>
}

export default function EditInvoicePage({ params }: EditInvoicePageProps) {
  const { invoices, customers, updateInvoice, isLoading } = useDatabaseContext()
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  
  const [formData, setFormData] = useState({
    salesOrderId: "",
    customerId: "",
    customerName: "",
    project: "",
    status: "Draft" as "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled",
    issueDate: "",
    dueDate: "",
    notes: ""
  })

  const [lineItems, setLineItems] = useState<InvoiceItem[]>([])

  // Resolve params
  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  // Load invoice data
  useEffect(() => {
    if (resolvedParams && invoices.length > 0) {
      const foundInvoice = invoices.find(inv => inv.id === resolvedParams.id)
      if (foundInvoice) {
        setInvoice(foundInvoice)
        setFormData({
          salesOrderId: foundInvoice.salesOrderId || "",
          customerId: foundInvoice.customerId,
          customerName: foundInvoice.customerName,
          project: foundInvoice.project || "",
          status: foundInvoice.status,
          issueDate: foundInvoice.issueDate,
          dueDate: foundInvoice.dueDate,
          notes: foundInvoice.notes || ""
        })
        setLineItems(foundInvoice.items)
        
        const foundCustomer = customers.find(cust => cust.id === foundInvoice.customerId)
        if (foundCustomer) {
          setCustomer(foundCustomer)
        }
      }
    }
  }, [resolvedParams, invoices, customers])

  const [revisionNotes, setRevisionNotes] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addLineItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 0,
      unitPrice: 0,
      totalPrice: 0
    }
    setLineItems([...lineItems, newItem])
  }

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id))
  }

  const updateLineItem = (id: string, field: string, value: string | number) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        if (field === 'quantity' || field === 'unitPrice') {
          const quantity = typeof value === 'number' ? value : parseFloat(value.toString()) || 0
          const unitPrice = field === 'unitPrice' ? quantity : item.unitPrice
          const quantityValue = field === 'quantity' ? quantity : item.quantity
          updatedItem.totalPrice = quantityValue * unitPrice
        }
        return updatedItem
      }
      return item
    }))
  }

  const calculateSubtotal = () => {
    return lineItems.reduce((total, item) => total + item.totalPrice, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.085
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const handleSave = (action: "draft" | "update" | "send") => {
    if (!invoice) return
    
    const subtotal = calculateSubtotal()
    const tax = calculateTax()
    const total = calculateTotal()
    
    const updatedInvoice: Partial<Invoice> = {
      salesOrderId: formData.salesOrderId,
      project: formData.project,
      status: formData.status,
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      notes: formData.notes,
      items: lineItems,
      subtotal,
      tax,
      total,
      revision: (parseInt(invoice.revision) + 1).toString()
    }
    
    updateInvoice(invoice.id, updatedInvoice)
    console.log("Invoice updated:", { ...formData, lineItems, revisionNotes, action })
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

  // Loading state
  if (isLoading || !resolvedParams) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    )
  }

  // Invoice not found
  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h1>
          <p className="text-gray-600 mb-4">The invoice you're trying to edit doesn't exist.</p>
          <Link href="/invoicing">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Invoicing
            </Button>
          </Link>
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
              <Link href={`/invoicing/${resolvedParams?.id}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Invoice
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Invoice - {invoice.invoiceNumber}</h1>
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
                    <Label htmlFor="salesOrder">Sales Order</Label>
                    <Input 
                      id="salesOrder" 
                      value={formData.salesOrderId}
                      onChange={(e) => handleInputChange("salesOrderId", e.target.value)}
                      placeholder="SO-2024-001"
                    />
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
                    <Label htmlFor="issueDate">Date Issued</Label>
                    <Input 
                      id="issueDate" 
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) => handleInputChange("issueDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input 
                      id="dueDate" 
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => handleInputChange("dueDate", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>Customer details (read-only)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer Name</Label>
                    <Input 
                      id="customer" 
                      value={formData.customerName}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input 
                      id="contactPerson" 
                      value={customer?.contactPerson || ""}
                      disabled
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerAddress">Billing Address</Label>
                  <Textarea 
                    id="customerAddress" 
                    rows={3}
                    value={customer?.address || ""}
                    disabled
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={customer?.email || ""}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      value={customer?.phone || ""}
                      disabled
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
                      <TableHead>Description</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price (RM)</TableHead>
                      <TableHead>Total (RM)</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item) => (
                      <TableRow key={item.id}>
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
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="1200"
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          RM{item.totalPrice.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
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
                      <span className="font-medium">RM{calculateSubtotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (8.5%):</span>
                      <span className="font-medium">RM{calculateTax().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>RM{calculateTotal().toLocaleString()}</span>
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
                  <Label htmlFor="project">Project</Label>
                  <Input 
                    id="project" 
                    value={formData.project}
                    onChange={(e) => handleInputChange("project", e.target.value)}
                    placeholder="Project name"
                  />
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
                  <p className="text-sm font-medium">{formData.issueDate}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">DUE DATE</Label>
                  <p className="text-sm">{formData.dueDate}</p>
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
                  <p className="text-lg font-bold">RM{calculateSubtotal().toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">TAX (8.5%)</Label>
                  <p className="text-sm">RM{calculateTax().toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">TOTAL</Label>
                  <p className="text-xl font-bold text-blue-600">RM{calculateTotal().toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Line Item Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Line Item Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <Badge className="bg-blue-100 text-blue-800" variant="outline">
                    Items ({lineItems.length})
                  </Badge>
                  <span className="text-sm font-medium">RM{calculateSubtotal().toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs font-medium text-gray-500">STATUS</Label>
                  <p className="text-sm">{formData.status}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">AMOUNT DUE</Label>
                  <p className="text-lg font-bold text-red-600">RM{calculateTotal().toLocaleString()}</p>
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
