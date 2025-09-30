"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Plus, Trash2, Calculator, Send, AlertCircle, Clock } from 'lucide-react'
import Link from "next/link"
import { useDatabaseContext } from '@/components/database-provider'
import type { Quotation, QuotationItem } from '@/lib/types'
import UnitEconomicsCalculator from '@/components/unit-economics-calculator'
import { dataIntegrationService } from '@/lib/services/data-integration'

export default function EditQuotationPage() {
  const params = useParams()
  const quotationId = params.id as string

  const { quotations, customers, items, updateQuotation, isInitialized } = useDatabaseContext()

  const [quotation, setQuotation] = useState<Quotation | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const [formData, setFormData] = useState({
    customerId: "",
    customer: "",
    contactPerson: "",
    email: "",
    phone: "",
    project: "",
    description: "",
    quantity: "",
    estimatedValue: "",
    dueDate: "",
    validUntil: "",
    priority: "medium",
    notes: "",
    // ETO Workflow fields
    customerRequirements: "",
    technicalSpecifications: "",
    deliveryTerms: "",
    paymentTerms: "Net 30",
    warrantyTerms: "1 Year Standard Warranty",
    // Cost breakdown fields
    engineeringCost: 0,
    materialCost: 0,
    laborCost: 0,
    overheadCost: 0,
    profitMargin: 0
  })

  const [lineItems, setLineItems] = useState<QuotationItem[]>([])
  const [revisionNotes, setRevisionNotes] = useState("")

  // Helper function to calculate next revision
  const calculateNextRevision = (currentRevision: string, isDraft: boolean): string => {
    // Handle different revision formats (e.g., "1.0", "2.1" vs "Rev A", "Rev B")
    if (currentRevision.includes('.')) {
      // Numerical format (1.0, 2.1, etc.)
      const revisionParts = currentRevision.split('.')
      const major = parseInt(revisionParts[0]) || 1
      const minor = parseInt(revisionParts[1]) || 0
      return isDraft ? 
        `${major}.${minor + 1}` : // Minor revision for drafts
        `${major + 1}.0`          // Major revision for updates/sends
    } else if (currentRevision.toLowerCase().includes('rev')) {
      // Letter format (Rev A, Rev B, etc.)
      const revMatch = currentRevision.match(/rev\s*([a-z])/i)
      if (revMatch) {
        const currentLetter = revMatch[1].toUpperCase()
        const nextLetter = String.fromCharCode(currentLetter.charCodeAt(0) + 1)
        return isDraft ? 
          `Rev ${currentLetter}.1` : // Minor revision for drafts
          `Rev ${nextLetter}`       // Major revision for updates/sends
      } else {
        return isDraft ? "Rev A.1" : "Rev B"
      }
    } else {
      // Fallback to numerical format
      return isDraft ? "1.1" : "2.0"
    }
  }

  useEffect(() => {
    if (isInitialized && quotations && customers && quotationId) {
      const foundQuotation = quotations.find(q => q.id === quotationId)
      if (foundQuotation) {
        setQuotation(foundQuotation)

        // Find customer data to populate contact details
        const customer = customers.find(c => c.id === foundQuotation.customerId)

        // Populate form data
        setFormData({
          customerId: foundQuotation.customerId,
          customer: foundQuotation.customerName,
          contactPerson: customer?.contactPerson || "",
          email: customer?.email || "",
          phone: customer?.phone || "",
          project: foundQuotation.title,
          description: foundQuotation.description,
          quantity: "",
          estimatedValue: foundQuotation.total.toString(),
          dueDate: "",
          validUntil: foundQuotation.validUntil.split('T')[0],
          priority: "medium",
          notes: foundQuotation.notes || "",
          customerRequirements: foundQuotation.customerRequirements,
          technicalSpecifications: foundQuotation.technicalSpecifications,
          deliveryTerms: foundQuotation.deliveryTerms,
          paymentTerms: foundQuotation.paymentTerms,
          warrantyTerms: foundQuotation.warrantyTerms,
          // Cost breakdown fields
          engineeringCost: foundQuotation.engineeringCost,
          materialCost: foundQuotation.materialCost,
          laborCost: foundQuotation.laborCost,
          overheadCost: foundQuotation.overheadCost,
          profitMargin: foundQuotation.profitMargin
        })

        // Populate line items with itemId if it's from master
        const enhancedLineItems = foundQuotation.items?.map(item => ({
          ...item,
          itemId: item.isNewItem ? undefined : items?.find(i => i.name === item.description)?.id
        })) || []
        setLineItems(enhancedLineItems)
      }
      setLoading(false)
    }
  }, [isInitialized, quotations, customers, items, quotationId])

  const handleInputChange = (field: string, value: string) => {
    // Handle numeric fields
    const numericFields = ['engineeringCost', 'materialCost', 'laborCost', 'overheadCost', 'profitMargin']
    if (numericFields.includes(field)) {
      setFormData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleCustomerSelection = (customerId: string) => {
    const selectedCustomer = customers.find(c => c.id === customerId)
    if (selectedCustomer) {
      setFormData(prev => ({
        ...prev,
        customerId: customerId,
        customer: selectedCustomer.name,
        contactPerson: selectedCustomer.contactPerson || "",
        email: selectedCustomer.email || "",
        phone: selectedCustomer.phone || ""
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        customerId: "",
        customer: "",
        contactPerson: "",
        email: "",
        phone: ""
      }))
    }
  }

  const selectItemFromMaster = (lineItemId: string, itemId: string) => {
    if (!items || !itemId || itemId === "new-item" || itemId === "no-items") {
      // Clear item selection and allow manual entry
      setLineItems(lineItems.map(item => {
        if (item.id === lineItemId) {
          return {
            ...item,
            itemId: undefined,
            description: "",
            unitPrice: 0,
            totalPrice: 0,
            specifications: "",
            isNewItem: true
          }
        }
        return item
      }))
      return
    }

    const selectedItem = items.find(item =>
      item?.status === 'Active' &&
      item?.id === itemId &&
      item?.partNumber &&
      item?.name
    )

    if (selectedItem) {
      setLineItems(lineItems.map(item => {
        if (item.id === lineItemId) {
          const updatedItem = {
            ...item,
            itemId: selectedItem.id,
            description: selectedItem.name,
            unitPrice: selectedItem.unitCost || 0,
            totalPrice: item.quantity * (selectedItem.unitCost || 0),
            specifications: selectedItem.specifications || "",
            isNewItem: false
          }
          return updatedItem
        }
        return item
      }))
    }
  }

  const addLineItem = () => {
    const newItem = {
      id: `new-${Date.now()}`,
      description: "",
      quantity: 0,
      unitPrice: 0,
      totalPrice: 0,
      deliveryDate: new Date().toISOString().split('T')[0],
      specifications: "",
      isNewItem: true,
      engineeringHours: 0,
      engineeringRate: 0,
      engineeringCost: 0,
      materialCost: 0,
      laborCost: 0,
      overheadCost: 0,
      profitMargin: 0,
      itemId: undefined // Add itemId property
    } as QuotationItem & { itemId?: string }
    setLineItems([...lineItems, newItem])
  }

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id))
  }

  const updateLineItem = (id: string, field: string, value: string) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item }

        if (field === 'quantity') {
          updatedItem.quantity = parseFloat(value) || 0
          updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice
        } else if (field === 'unitPrice') {
          updatedItem.unitPrice = parseFloat(value) || 0
          updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice
        } else {
          (updatedItem as any)[field] = value
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

  const handleSave = async (action: "draft" | "update" | "send") => {
    if (!quotation) return

    setIsSaving(true)
    setSaveMessage(null)

    try {
      // Validate required fields
      if (!formData.customerId) {
        setSaveMessage({ type: 'error', message: 'Customer selection is required' })
        setIsSaving(false)
        return
      }

      if (!formData.project.trim()) {
        setSaveMessage({ type: 'error', message: 'Project title is required' })
        setIsSaving(false)
        return
      }

      // Calculate new revision number
      const currentRevision = quotation.revision || "1.0"
      const newRevision = calculateNextRevision(currentRevision, action === "draft")

      // Create updated quotation data
      const updatedQuotation: Partial<Quotation> = {
        customerId: formData.customerId,
        customerName: formData.customer,
        title: formData.project,
        description: formData.description,
        items: lineItems,
        subtotal: calculateSubtotal(),
        engineeringCost: formData.engineeringCost,
        materialCost: formData.materialCost,
        laborCost: formData.laborCost,
        overheadCost: formData.overheadCost,
        profitMargin: formData.profitMargin,
        tax: calculateTax(),
        total: calculateTotal(),
        validUntil: formData.validUntil,
        notes: formData.notes,
        customerRequirements: formData.customerRequirements,
        technicalSpecifications: formData.technicalSpecifications,
        deliveryTerms: formData.deliveryTerms,
        paymentTerms: formData.paymentTerms,
        warrantyTerms: formData.warrantyTerms,
        revision: newRevision,
        updatedAt: new Date().toISOString()
      }

      // Add revision to change history if revision notes provided
      if (revisionNotes.trim()) {
        const newChange = {
          id: `change-${Date.now()}`,
          changeNumber: `CHG-${Date.now()}`,
          quotationId: quotation.id,
          changeType: 'Scope' as const,
          reason: action === "draft" ? "Draft revision" : action === "update" ? "Quotation update" : "Updated and sent to customer",
          description: revisionNotes,
          impact: `Updated quotation details - Revision ${newRevision}`,
          costImpact: calculateTotal() - quotation.total,
          scheduleImpact: 0,
          requestedBy: 'User', // TODO: Get from auth context
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        updatedQuotation.changeHistory = [...(quotation.changeHistory || []), newChange]
      }

      // Update in database
      const success = updateQuotation(quotation.id, updatedQuotation)

      if (success) {
        setSaveMessage({
          type: 'success',
          message: action === 'draft' ? `Changes saved as draft! (Revision ${newRevision})` :
            action === 'update' ? `Quotation updated successfully! (Revision ${newRevision})` :
              `Quotation updated and sent to customer! (Revision ${newRevision})`
        })

        // Auto-hide success message after 3 seconds
        setTimeout(() => setSaveMessage(null), 3000)

        // Clear revision notes after successful save
        setRevisionNotes("")
      } else {
        setSaveMessage({ type: 'error', message: 'Failed to update quotation. Please try again.' })
      }
    } catch (error) {
      console.error('Error updating quotation:', error)
      setSaveMessage({ type: 'error', message: 'An error occurred while saving. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Loading quotation...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!quotation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <Link href="/quotations">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Quotations
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Quotation Not Found</h2>
              <p className="text-gray-500">The quotation you're trying to edit doesn't exist or has been deleted.</p>
            </div>
          </div>
        </main>
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
              <Link href={`/quotations/${quotationId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Quotation
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Quotation - {quotation.quotationNumber}</h1>
                <p className="text-sm text-gray-600">Modify quotation details and create new revision</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleSave("draft")} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save as Draft"}
              </Button>
              <Button variant="outline" onClick={() => handleSave("update")} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Updating..." : "Update Quotation"}
              </Button>
              <Button onClick={() => handleSave("send")} disabled={isSaving}>
                <Send className="w-4 h-4 mr-2" />
                {isSaving ? "Sending..." : "Update & Send"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Message */}
        {saveMessage && (
          <div className={`mb-6 p-4 rounded-md ${saveMessage.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
            <div className="flex items-center">
              {saveMessage.type === 'success' ? (
                <Save className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              {saveMessage.message}
            </div>
          </div>
        )}
        <div className="grid grid-cols-4 gap-6">
          {/* Main Form */}
          <div className="col-span-3 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>Update customer and project details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer Name *</Label>
                    {!isInitialized || !customers ? (
                      <div className="text-sm text-gray-500">Loading customers...</div>
                    ) : (
                      <Select value={formData.customerId} onValueChange={handleCustomerSelection}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a customer..." />
                        </SelectTrigger>
                        <SelectContent>
                          {customers && customers.length > 0 ? (
                            customers
                              .filter(customer => customer.status === 'Active')
                              .map(customer => (
                                <SelectItem key={customer.id} value={customer.id}>
                                  {customer.name}
                                </SelectItem>
                              ))
                          ) : (
                            <SelectItem value="no-customers" disabled>
                              No active customers found
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person *</Label>
                    <Input
                      id="contactPerson"
                      placeholder={formData.customerId ? "Auto-filled from customer" : "e.g., John Anderson"}
                      value={formData.contactPerson}
                      onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                      className={formData.customerId && formData.contactPerson ? "bg-gray-50" : ""}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={formData.customerId ? "Auto-filled from customer" : "contact@company.com"}
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={formData.customerId && formData.email ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      placeholder={formData.customerId ? "Auto-filled from customer" : "(555) 123-4567"}
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className={formData.customerId && formData.phone ? "bg-gray-50" : ""}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project">Project Name *</Label>
                  <Input
                    id="project"
                    value={formData.project}
                    onChange={(e) => handleInputChange("project", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Project Description *</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>Update project specifications and requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deliveryTerms">Delivery Terms</Label>
                    <Input
                      id="deliveryTerms"
                      placeholder="e.g., FOB Factory, 8 weeks delivery"
                      value={formData.deliveryTerms}
                      onChange={(e) => handleInputChange("deliveryTerms", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <Select value={formData.paymentTerms} onValueChange={(value) => handleInputChange("paymentTerms", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Net 15">Net 15</SelectItem>
                        <SelectItem value="Net 30">Net 30</SelectItem>
                        <SelectItem value="Net 45">Net 45</SelectItem>
                        <SelectItem value="Net 60">Net 60</SelectItem>
                        <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                        <SelectItem value="50% Advance, 50% on Delivery">50% Advance, 50% on Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warrantyTerms">Warranty Terms</Label>
                  <Input
                    id="warrantyTerms"
                    placeholder="e.g., 1 year warranty on materials and workmanship"
                    value={formData.warrantyTerms}
                    onChange={(e) => handleInputChange("warrantyTerms", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Line Items</CardTitle>
                    <CardDescription>Update detailed pricing breakdown</CardDescription>
                  </div>
                  <Button onClick={addLineItem} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Line Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[15%]">Item Selection</TableHead>
                      <TableHead className="w-[12%]">Part Number</TableHead>
                      <TableHead className="w-[20%]">Description</TableHead>
                      <TableHead className="w-[8%]">Quantity</TableHead>
                      <TableHead className="w-[12%]">Unit Price ($)</TableHead>
                      <TableHead className="w-[12%]">Total Price ($)</TableHead>
                      <TableHead className="w-[13%]">Delivery Date</TableHead>
                      <TableHead className="w-[8%]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                    <TableBody>
                      {lineItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="p-2">
                            {!isInitialized || !items ? (
                              <div className="text-sm text-gray-500">Loading items...</div>
                            ) : (
                              <Select value={(item as any).itemId || ""} onValueChange={(value) => selectItemFromMaster(item.id, value)}>
                                <SelectTrigger className="w-full text-sm">
                                  <SelectValue placeholder="Select item..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new-item">Create New Item</SelectItem>
                                  {items && items.length > 0 ? (
                                    items
                                      .filter(masterItem => masterItem?.status === 'Active' && masterItem?.id && masterItem?.partNumber && masterItem?.name)
                                      .map(masterItem => (
                                        <SelectItem key={masterItem.id} value={masterItem.id}>
                                          {masterItem.partNumber} - {masterItem.name}
                                        </SelectItem>
                                      ))
                                  ) : (
                                    <SelectItem value="no-items" disabled>
                                      No items available
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            )}
                          </TableCell>
                          <TableCell className="p-2">
                            <div className="text-sm">
                              {(item as any).itemId ?
                                items?.find(i => i.id === (item as any).itemId)?.partNumber || 'N/A' :
                                'New Item'
                              }
                            </div>
                          </TableCell>
                          <TableCell className="p-2">
                            <Input
                              placeholder="Item description"
                              value={item.description}
                              onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                              disabled={!!(item as any).itemId}
                              className="w-full text-sm"
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Input
                              placeholder="1"
                              type="number"
                              value={item.quantity.toString()}
                              onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                              className="w-full text-sm"
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Input
                              placeholder="100.00"
                              type="number"
                              step="0.01"
                              value={item.unitPrice.toString()}
                              onChange={(e) => updateLineItem(item.id, 'unitPrice', e.target.value)}
                              disabled={!!(item as any).itemId}
                              className="w-full text-sm"
                            />
                          </TableCell>
                          <TableCell className="p-2 font-medium">
                            ${item.totalPrice.toLocaleString()}
                          </TableCell>
                          <TableCell className="p-2">
                            <Input
                              type="date"
                              value={item.deliveryDate.split('T')[0]}
                              onChange={(e) => updateLineItem(item.id, 'deliveryDate', e.target.value)}
                              className="w-full text-sm"
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <div className="flex flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeLineItem(item.id)}
                                disabled={lineItems.length === 1}
                                className="w-fit"
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

            {/* Cost Breakdown */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Cost Breakdown</CardTitle>
                    <CardDescription>Detailed cost analysis and profit margins</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="engineeringCost">Engineering Cost ($)</Label>
                    <Input
                      id="engineeringCost"
                      type="number"
                      step="0.01"
                      value={formData.engineeringCost}
                      onChange={(e) => handleInputChange("engineeringCost", e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="materialCost">Material Cost ($)</Label>
                    <Input
                      id="materialCost"
                      type="number"
                      step="0.01"
                      value={formData.materialCost}
                      onChange={(e) => handleInputChange("materialCost", e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="laborCost">Labor Cost ($)</Label>
                    <Input
                      id="laborCost"
                      type="number"
                      step="0.01"
                      value={formData.laborCost}
                      onChange={(e) => handleInputChange("laborCost", e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="overheadCost">Overhead Cost ($)</Label>
                    <Input
                      id="overheadCost"
                      type="number"
                      step="0.01"
                      value={formData.overheadCost}
                      onChange={(e) => handleInputChange("overheadCost", e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profitMargin">Profit Margin ($)</Label>
                  <Input
                    id="profitMargin"
                    type="number"
                    step="0.01"
                    value={formData.profitMargin}
                      onChange={(e) => handleInputChange("profitMargin", e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                {/* Cost Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Cost Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">${calculateSubtotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Engineering Cost:</span>
                      <span className="font-medium">${formData.engineeringCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Material Cost:</span>
                      <span className="font-medium">${formData.materialCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Labor Cost:</span>
                      <span className="font-medium">${formData.laborCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Overhead Cost:</span>
                      <span className="font-medium">${formData.overheadCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-2">
                      <span className="text-gray-600">Total Cost:</span>
                      <span className="font-medium">
                        ${(formData.engineeringCost + formData.materialCost + formData.laborCost + formData.overheadCost).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Profit Margin:</span>
                      <span className="font-medium text-green-600">${formData.profitMargin.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax (8.5%):</span>
                      <span className="font-medium">${calculateTax().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2 text-blue-600">
                      <span>Total Quotation:</span>
                      <span>${calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Unit Economics Calculator */}
            <Card>
              <CardHeader>
                <CardTitle>Unit Economics Calculator</CardTitle>
                <CardDescription>
                  Advanced unit economics analysis with copper LME volatility and sensitivity analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UnitEconomicsCalculator 
                  quotationId={quotationId}
                  initialData={{
                    id: `ue_${quotationId}`,
                    quotationId,
                    baseMaterialCost: formData.materialCost || 0,
                    copperWeight: formData.materialCost ? Math.round(formData.materialCost / 100) : 0, // Estimate: ~$100 per kg copper
                    copperLMEPrice: 8500, // TODO: Fetch from LME API
                    laborCost: formData.laborCost || 0,
                    overheadCost: formData.overheadCost || 0,
                    profitMargin: calculateTotal() > 0 ? ((formData.profitMargin || 0) / calculateTotal()) * 100 : 15,
                    quantity: lineItems.reduce((sum, item) => sum + item.quantity, 0) || 1,
                    currency: 'USD',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  }}
                  onSave={(data) => {
                    console.log('Unit economics data saved:', data)
                    // Update form data with calculated values
                    setFormData(prev => ({
                      ...prev,
                      materialCost: data.baseMaterialCost,
                      laborCost: data.laborCost,
                      overheadCost: data.overheadCost,
                      profitMargin: (data.profitMargin / 100) * calculateTotal()
                    }))
                  }}
                />
              </CardContent>
            </Card>

            {/* Revision Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Revision Notes</CardTitle>
                <CardDescription>
                  Describe the changes made in this revision. Save as Draft creates minor revisions, 
                  while Update/Send creates major revisions. Supports both numerical (1.0→1.1) and letter (Rev A→Rev A.1) formats.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="revisionNotes">Changes Made *</Label>
                  <Textarea
                    id="revisionNotes"
                    placeholder="Describe what changes were made and why..."
                    rows={3}
                    value={revisionNotes}
                    onChange={(e) => setRevisionNotes(e.target.value)}
                  />
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
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs font-medium text-gray-500">STATUS</Label>
                  <Badge className={quotation.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    quotation.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                      'bg-blue-100 text-blue-800'}>
                    {quotation.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">CURRENT REVISION</Label>
                  <p className="text-sm font-medium">{quotation.revision}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">NEXT REVISION</Label>
                  <p className="text-sm font-medium text-blue-600">
                    {(() => {
                      const currentRevision = quotation.revision || "1.0"
                      const draftRevision = calculateNextRevision(currentRevision, true)
                      const updateRevision = calculateNextRevision(currentRevision, false)
                      return `${draftRevision} (Draft) / ${updateRevision} (Update)`
                    })()}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">LAST UPDATED</Label>
                  <p className="text-sm">{new Date(quotation.updatedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">CREATED</Label>
                  <p className="text-sm">{new Date(quotation.createdAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

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

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Save className="w-4 h-4 mr-2" />
                  Export to PDF
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Send className="w-4 h-4 mr-2" />
                  Send to Customer
                </Button>
              </CardContent>
            </Card>

            {/* Validation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Validation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${formData.customerId && formData.project ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>Customer & project {formData.customerId && formData.project ? 'complete' : 'required'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${lineItems.length > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>Line items {lineItems.length > 0 ? 'present' : 'required'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${revisionNotes.trim() ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span>Revision notes {revisionNotes.trim() ? 'provided' : 'recommended'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${formData.validUntil ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span>Valid until date {formData.validUntil ? 'set' : 'recommended'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
