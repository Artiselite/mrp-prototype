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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, Plus, Trash2, Calculator, Send, FileText, Settings, Wrench, CheckCircle, AlertCircle } from 'lucide-react'
import Link from "next/link"
import { useDatabaseContext } from '@/components/database-provider'
import UnitEconomicsCalculator from '@/components/unit-economics-calculator'
import { dataIntegrationService } from '@/lib/services/data-integration'

export default function CreateQuotationPage() {
  const { items, quotations, customers, createQuotation, isInitialized } = useDatabaseContext()

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

  // Workflow status tracking
  const [workflowStatus, setWorkflowStatus] = useState({
    quotationCreated: false,
    engineeringAssigned: false,
    engineeringDrawingCreated: false,
    boqGenerated: false,
    sentToCustomer: false,
    customerFeedbackReceived: false,
    poReceived: false,
    convertedToSO: false,
    soId: undefined as string | undefined
  })

  const [engineeringData, setEngineeringData] = useState({
    assignedEngineer: "",
    estimatedEngineeringHours: "",
    engineeringStatus: "Not Started",
    drawingRevision: "Rev A",
    drawingNotes: ""
  })

  const [boqData, setBOQData] = useState({
    boqStatus: "Not Generated",
    totalMaterialCost: 0,
    totalLaborCost: 0,
    totalEquipmentCost: 0,
    boqItems: []
  })

  // Unit Economics State
  const [unitEconomics, setUnitEconomics] = useState({
    showCostBreakdown: false,
    selectedProduct: null as any,
    lineItemId: null as number | null,
    unitCost: 0,
    materialCost: 0,
    laborCost: 0,
    overheadCost: 0,
    otherCosts: 0,
    proposedPrice: 0,
    unitMargin: 0,
    marginPercent: 0,
    totalContribution: 0,
    marginStatus: 'unknown' as 'healthy' | 'borderline' | 'below' | 'unknown'
  })


  const [lineItems, setLineItems] = useState([
    {
      id: 1,
      itemId: "",
      partNumber: "",
      description: "",
      quantity: "",
      unit: "pcs",
      rate: "",
      amount: 0,
      category: "materials",
      specifications: "",
      isNewItem: false
    }
  ])

  // Save functionality state
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
      // Clear customer data if no selection
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

  const addLineItem = () => {
    const newItem = {
      id: Date.now(),
      itemId: "",
      partNumber: "",
      description: "",
      quantity: "",
      unit: "pcs",
      rate: "",
      amount: 0,
      category: "materials",
      specifications: "",
      isNewItem: false
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

  const selectItemFromMaster = (lineItemId: number, itemId: string) => {
    if (!items || !itemId || itemId === "new-item" || itemId === "no-items") {
      // Clear item selection for new item creation
      if (itemId === "new-item") {
        setLineItems(lineItems.map(item => {
          if (item.id === lineItemId) {
            return {
              ...item,
              itemId: "",
              partNumber: "",
              description: "",
              unit: "pcs",
              rate: "",
              category: "materials",
              specifications: "",
              isNewItem: true
            }
          }
          return item
        }))
      }
      return
    }
    const selectedItem = items.find(item => item.id === itemId)
    if (selectedItem) {
      setLineItems(lineItems.map(item => {
        if (item.id === lineItemId) {
          const updatedItem = {
            ...item,
            itemId: selectedItem.id,
            partNumber: selectedItem.partNumber,
            description: selectedItem.name,
            unit: selectedItem.unit,
            rate: item.rate || selectedItem.unitCost.toString(), // Keep existing rate or use default
            category: selectedItem.category.toLowerCase(),
            specifications: selectedItem.specifications,
            isNewItem: false
          }
          // Recalculate amount
          const quantity = parseFloat(updatedItem.quantity) || 0
          const rate = parseFloat(updatedItem.rate) || 0
          updatedItem.amount = quantity * rate
          return updatedItem
        }
        return item
      }))

      // Show cost breakdown panel when product is selected
      showCostBreakdown(selectedItem, lineItemId)
    }
  }

  // Unit Economics Functions
  const showCostBreakdown = (product: any, lineItemId: number) => {
    // Get current line item rate
    const lineItem = lineItems.find(item => item.id === lineItemId)
    const currentRate = lineItem ? parseFloat(lineItem.rate) || 0 : product.unitCost * 1.2
    
    // Simulate cost build-up from BOM and routing
    const materialCost = product.unitCost * 0.6 // 60% materials
    const laborCost = product.unitCost * 0.25   // 25% labor
    const overheadCost = product.unitCost * 0.1 // 10% overhead
    const otherCosts = product.unitCost * 0.05  // 5% other costs
    const unitCost = materialCost + laborCost + overheadCost + otherCosts

    setUnitEconomics(prev => ({
      ...prev,
      showCostBreakdown: true,
      selectedProduct: product,
      unitCost,
      materialCost,
      laborCost,
      overheadCost,
      otherCosts,
      proposedPrice: currentRate,
      lineItemId
    }))

    calculateMargins(currentRate, lineItemId)
  }

  const calculateMargins = (proposedPrice: number, lineItemId?: number) => {
    const quantity = lineItemId ? 
      (lineItems.find(item => item.id === lineItemId)?.quantity || 1) : 
      (unitEconomics.selectedProduct ? 1 : 1)
    const unitMargin = proposedPrice - unitEconomics.unitCost
    const marginPercent = unitEconomics.unitCost > 0 ? (unitMargin / proposedPrice) * 100 : 0
    const totalContribution = unitMargin * parseFloat(quantity.toString())

    // Determine margin status
    let marginStatus: 'healthy' | 'borderline' | 'below' | 'unknown' = 'unknown'
    if (marginPercent >= 20) marginStatus = 'healthy'
    else if (marginPercent >= 10) marginStatus = 'borderline'
    else if (marginPercent > 0) marginStatus = 'below'

    setUnitEconomics(prev => ({
      ...prev,
      proposedPrice,
      unitMargin,
      marginPercent,
      totalContribution,
      marginStatus
    }))
  }

  const updateProposedPrice = (price: number, lineItemId?: number) => {
    // Update the line item rate first
    if (lineItemId) {
      updateLineItem(lineItemId, 'rate', price.toString())
    }
    
    // Then calculate margins
    calculateMargins(price, lineItemId)
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

  const handleEngineeringChange = (field: string, value: string) => {
    setEngineeringData(prev => ({ ...prev, [field]: value }))
  }

  // Validation function for quotation data
  const validateQuotation = (action: "draft" | "submit" | "send" | "assign_engineering") => {
    const errors: string[] = []

    // Basic validation for all actions
    if (!formData.customerId) errors.push('Customer selection is required')
    if (!formData.project.trim()) errors.push('Project title is required')

    // Stricter validation for non-draft actions
    if (action !== 'draft') {
      if (!formData.contactPerson.trim()) errors.push('Contact person is required')
      if (!formData.email.trim()) errors.push('Email is required')
      if (lineItems.length === 0) errors.push('At least one line item is required')
      if (lineItems.some(item => !item.description.trim() || !item.quantity || !item.rate)) {
        errors.push('All line items must have description, quantity, and rate')
      }
    }

    // Additional validation for engineering assignment
    if (action === 'assign_engineering') {
      if (!engineeringData.assignedEngineer) errors.push('Engineer assignment is required')
    }

    // Additional validation for sending to customer
    if (action === 'send') {
      if (!workflowStatus.boqGenerated) errors.push('BOQ must be generated before sending to customer')
      if (!formData.validUntil) errors.push('Valid until date is required')
    }

    return errors
  }

  const handleSave = async (action: "draft" | "submit" | "send" | "assign_engineering") => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      // Validate required fields based on action
      const validationErrors = validateQuotation(action)
      if (validationErrors.length > 0) {
        setSaveMessage({ type: 'error', message: `Validation failed: ${validationErrors.join(', ')}` })
        setIsSaving(false)
        return
      }

      // Generate quotation number if not exists
      const quotationNumber = `Q${Date.now()}`
      const currentDate = new Date().toISOString().split('T')[0]

      // Prepare quotation data
      const quotationData = {
        customerId: formData.customerId,
        customerName: formData.customer,
        quotationNumber,
        title: formData.project,
        description: formData.description,
        status: action === 'draft' ? 'Draft' as const : 'Under Review' as const,
        items: lineItems.map(item => ({
          id: item.id.toString(),
          description: item.description,
          quantity: parseFloat(item.quantity) || 0,
          unitPrice: parseFloat(item.rate) || 0,
          totalPrice: (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0),
          deliveryDate: formData.dueDate || currentDate,
          specifications: item.description,
          isNewItem: !item.itemId,
          engineeringHours: 0,
          engineeringRate: 0,
          engineeringCost: 0,
          materialCost: (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0) * 0.6,
          laborCost: (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0) * 0.3,
          overheadCost: (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0) * 0.1,
          profitMargin: 0,
          bomId: undefined,
          drawingId: undefined
        })),
        subtotal: calculateSubtotal(),
        engineeringCost: formData.engineeringCost || 0,
        materialCost: formData.materialCost || calculateSubtotal() * 0.6,
        laborCost: formData.laborCost || calculateSubtotal() * 0.3,
        overheadCost: formData.overheadCost || calculateSubtotal() * 0.1,
        profitMargin: formData.profitMargin || 0,
        tax: calculateTax(),
        total: calculateTotal(),
        validUntil: formData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        revision: 'v1.0',
        salesPerson: 'Current User', // TODO: Get from auth context
        customerRequirements: formData.customerRequirements,
        technicalSpecifications: formData.technicalSpecifications,
        deliveryTerms: formData.deliveryTerms,
        paymentTerms: formData.paymentTerms,
        warrantyTerms: formData.warrantyTerms,
        notes: formData.notes,
        changeHistory: [],

        // ETO Workflow fields
        workflowStage: action === 'draft' ? 'Draft' as const :
          action === 'assign_engineering' ? 'Engineering' as const :
            action === 'send' ? 'Customer Review' as const : 'Draft' as const,
        assignedEngineer: action === 'assign_engineering' ? engineeringData.assignedEngineer : undefined,
        estimatedEngineeringHours: parseFloat(engineeringData.estimatedEngineeringHours) || 0,
        engineeringStatus: action === 'assign_engineering' ? 'In Progress' as const : 'Not Started' as const,
        drawingRevision: engineeringData.drawingRevision,
        drawingNotes: engineeringData.drawingNotes,
        engineeringDrawingCreated: workflowStatus.engineeringDrawingCreated,
        boqGenerated: workflowStatus.boqGenerated,
        boqId: workflowStatus.boqGenerated ? `BOQ-${quotationNumber}` : undefined,
        sentToCustomer: action === 'send' || workflowStatus.sentToCustomer,
        customerFeedbackReceived: workflowStatus.customerFeedbackReceived,
        poReceived: workflowStatus.poReceived,
        convertedToSO: workflowStatus.convertedToSO,
        soId: workflowStatus.soId
      }

      // Save to database
      const savedQuotation = createQuotation(quotationData)

      if (savedQuotation) {
        // Update workflow status based on action
        if (action === "draft") {
          setWorkflowStatus(prev => ({ ...prev, quotationCreated: true }))
          setSaveMessage({ type: 'success', message: 'Quotation saved as draft successfully!' })
        } else if (action === "assign_engineering") {
          setWorkflowStatus(prev => ({
            ...prev,
            quotationCreated: true,
            engineeringAssigned: true
          }))
          setEngineeringData(prev => ({ ...prev, engineeringStatus: "In Progress" }))
          setSaveMessage({ type: 'success', message: 'Quotation saved and assigned to engineering!' })
        } else if (action === "send") {
          setWorkflowStatus(prev => ({ ...prev, sentToCustomer: true }))
          setSaveMessage({ type: 'success', message: 'Quotation sent to customer successfully!' })
        } else {
          setSaveMessage({ type: 'success', message: 'Quotation saved successfully!' })
        }

        // Auto-hide success message after 3 seconds
        setTimeout(() => setSaveMessage(null), 3000)
      } else {
        setSaveMessage({ type: 'error', message: 'Failed to save quotation. Please try again.' })
      }
    } catch (error) {
      console.error('Error saving quotation:', error)
      setSaveMessage({ type: 'error', message: 'An error occurred while saving. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  const generateBOQ = () => {
    // Simulate BOQ generation from engineering drawings
    setBOQData(prev => ({
      ...prev,
      boqStatus: "Generated",
      totalMaterialCost: calculateSubtotal() * 0.6,
      totalLaborCost: calculateSubtotal() * 0.3,
      totalEquipmentCost: calculateSubtotal() * 0.1
    }))
    setWorkflowStatus(prev => ({ ...prev, boqGenerated: true }))
  }

  const createEngineeringDrawing = () => {
    // For now, just save the quotation as draft first
    handleSave("draft").then(() => {
      // Navigate to engineering creation with quotation context
      const quotationData = {
        customer: formData.customer,
        customerId: formData.customerId,
        project: formData.project,
        description: formData.description,
        technicalSpecifications: formData.technicalSpecifications,
        engineerAssigned: engineeringData.assignedEngineer,
        estimatedHours: engineeringData.estimatedEngineeringHours
      }
      
      const params = new URLSearchParams({
        quotationId: 'temp-quotation', // This would be the actual quotation ID after save
        source: 'quotation',
        customer: formData.customer,
        customerId: formData.customerId,
        project: formData.project,
        description: formData.description,
        specifications: formData.technicalSpecifications,
        engineer: engineeringData.assignedEngineer
      })
      
      window.location.href = `/engineering/create?${params.toString()}`
    })
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
              <Button variant="outline" onClick={() => handleSave("draft")} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save as Draft"}
              </Button>
              <Button variant="outline" onClick={() => handleSave("assign_engineering")} disabled={isSaving}>
                <Settings className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Assign Engineering"}
              </Button>
              <Button variant="outline" onClick={createEngineeringDrawing} disabled={!workflowStatus.engineeringAssigned}>
                <FileText className="w-4 h-4 mr-2" />
                Create Drawing
              </Button>
              <Button variant="outline" onClick={generateBOQ} disabled={!workflowStatus.engineeringDrawingCreated}>
                <Calculator className="w-4 h-4 mr-2" />
                Generate BOQ
              </Button>
              <Button onClick={() => handleSave("send")} disabled={!workflowStatus.boqGenerated || isSaving}>
                <Send className="w-4 h-4 mr-2" />
                {isSaving ? "Sending..." : "Send to Customer"}
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
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              {saveMessage.message}
            </div>
          </div>
        )}

        {/* Workflow Status Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Workflow Progress</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {workflowStatus.quotationCreated ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-gray-400" />
                  )}
                  <span className={workflowStatus.quotationCreated ? "text-green-700" : "text-gray-500"}>
                    Quotation Created
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {workflowStatus.engineeringAssigned ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-gray-400" />
                  )}
                  <span className={workflowStatus.engineeringAssigned ? "text-green-700" : "text-gray-500"}>
                    Engineering Assigned
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {workflowStatus.engineeringDrawingCreated ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-gray-400" />
                  )}
                  <span className={workflowStatus.engineeringDrawingCreated ? "text-green-700" : "text-gray-500"}>
                    Drawing Created
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {workflowStatus.boqGenerated ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-gray-400" />
                  )}
                  <span className={workflowStatus.boqGenerated ? "text-green-700" : "text-gray-500"}>
                    BOQ Generated
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {workflowStatus.sentToCustomer ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-gray-400" />
                  )}
                  <span className={workflowStatus.sentToCustomer ? "text-green-700" : "text-gray-500"}>
                    Sent to Customer
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="quotation" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="quotation">Quotation Details</TabsTrigger>
            <TabsTrigger value="engineering">Engineering</TabsTrigger>
            <TabsTrigger value="boq">Bill of Quantities</TabsTrigger>
            <TabsTrigger value="unit-economics">Unit Economics</TabsTrigger>
            <TabsTrigger value="summary">Summary & Send</TabsTrigger>
          </TabsList>

          <TabsContent value="quotation">
            <div className="grid grid-cols-5 gap-6">
              {/* Main Form - Left Side */}
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
                    <CardDescription>Project requirements and specifications</CardDescription>
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
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[15%]">Item Selection</TableHead>
                          <TableHead className="w-[12%]">Part Number</TableHead>
                          <TableHead className="w-[25%]">Description</TableHead>
                          <TableHead className="w-[8%]">Quantity</TableHead>
                          <TableHead className="w-[8%]">Unit</TableHead>
                          <TableHead className="w-[12%]">Unit Price ($)</TableHead>
                          <TableHead className="w-[12%]">Amount ($)</TableHead>
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
                                  <Select value={item.itemId || ""} onValueChange={(value) => selectItemFromMaster(item.id, value)}>
                                    <SelectTrigger className="w-full text-sm">
                                      <SelectValue placeholder="Select item..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="new-item">-- Create New Item --</SelectItem>
                                      {items && items.length > 0 ? (
                                        items.filter(masterItem =>
                                          masterItem?.status === 'Active' &&
                                          masterItem?.id &&
                                          masterItem?.partNumber &&
                                          masterItem?.name
                                        ).map((masterItem) => (
                                          <SelectItem key={masterItem.id} value={masterItem.id}>
                                            {masterItem.partNumber} - {masterItem.name}
                                          </SelectItem>
                                        ))
                                      ) : (
                                        <SelectItem value="no-items" disabled>No items available</SelectItem>
                                      )}
                                    </SelectContent>
                                  </Select>
                                )}
                              </TableCell>
                              <TableCell className="p-2">
                                <Input
                                  placeholder="Part number"
                                  value={item.partNumber}
                                  onChange={(e) => updateLineItem(item.id, 'partNumber', e.target.value)}
                                  disabled={!!item.itemId}
                                  className="w-full text-sm"
                                />
                              </TableCell>
                              <TableCell className="p-2">
                                <Input
                                  placeholder="Item description"
                                  value={item.description}
                                  onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                                  disabled={!!item.itemId}
                                  className="w-full text-sm"
                                />
                              </TableCell>
                              <TableCell className="p-2">
                                <Input
                                  placeholder="8"
                                  value={item.quantity}
                                  onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                                  className="w-full text-sm"
                                />
                              </TableCell>
                              <TableCell className="p-2">
                                <Input
                                  placeholder="pcs"
                                  value={item.unit}
                                  onChange={(e) => updateLineItem(item.id, 'unit', e.target.value)}
                                  disabled={!!item.itemId}
                                  className="w-full text-sm"
                                />
                              </TableCell>
                              <TableCell className="p-2">
                                <Input
                                  placeholder="0.00"
                                  type="number"
                                  step="0.01"
                                  value={item.rate}
                                  onChange={(e) => updateLineItem(item.id, 'rate', e.target.value)}
                                  className="w-full text-sm"
                                />
                              </TableCell>
                              <TableCell className="p-2 font-medium text-right">
                                ${item.amount.toLocaleString()}
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

              {/* Profitability Panel - Right Side */}
              <div className="col-span-2 space-y-6">
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

                {/* Unit Economics - Cost Breakdown Panel */}
                {unitEconomics.showCostBreakdown && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-lg text-blue-900">Cost Breakdown</CardTitle>
                          <CardDescription className="text-blue-700">
                            Live Cost Analysis
                          </CardDescription>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setUnitEconomics(prev => ({ ...prev, showCostBreakdown: false }))}
                        >
                          ×
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Line Item Selector */}
                      <div>
                        <Label htmlFor="lineItemSelector">Select Line Item</Label>
                        <Select 
                          value={unitEconomics.lineItemId?.toString() || ""} 
                          onValueChange={(value) => {
                            const lineItemId = parseInt(value)
                            const lineItem = lineItems.find(item => item.id === lineItemId)
                            if (lineItem && lineItem.itemId) {
                              const product = items?.find(item => item.id === lineItem.itemId)
                              if (product) {
                                showCostBreakdown(product, lineItemId)
                              }
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a line item to analyze" />
                          </SelectTrigger>
                          <SelectContent>
                            {lineItems
                              .filter(item => item.itemId && item.description)
                              .map((item) => (
                                <SelectItem key={item.id} value={item.id.toString()}>
                                  {item.description} (Qty: {item.quantity})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Selected Line Item Info */}
                      {unitEconomics.selectedProduct && (
                        <div className="bg-white rounded-lg p-3 border">
                          <div className="text-sm font-medium text-gray-900">
                            {unitEconomics.selectedProduct.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {unitEconomics.selectedProduct.partNumber} • Qty: {lineItems.find(item => item.id === unitEconomics.lineItemId)?.quantity || 1}
                          </div>
                        </div>
                      )}

                      {/* Cost Components */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Materials:</span>
                          <span className="font-medium">${unitEconomics.materialCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Labor:</span>
                          <span className="font-medium">${unitEconomics.laborCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Overhead:</span>
                          <span className="font-medium">${unitEconomics.overheadCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Other Costs:</span>
                          <span className="font-medium">${unitEconomics.otherCosts.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold border-t pt-2">
                          <span>Unit Cost:</span>
                          <span>${unitEconomics.unitCost.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Price Input & Margin Display */}
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="proposedPrice">Proposed Unit Price ($)</Label>
                          <Input
                            id="proposedPrice"
                            type="number"
                            step="0.01"
                            value={unitEconomics.proposedPrice}
                            onChange={(e) => updateProposedPrice(parseFloat(e.target.value) || 0)}
                            className="text-lg font-semibold"
                          />
                        </div>

                        {/* Margin Indicators */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-3 bg-white rounded-lg border">
                            <div className="text-sm text-gray-600">Unit Margin</div>
                            <div className={`text-lg font-bold ${
                              unitEconomics.marginStatus === 'healthy' ? 'text-green-600' :
                              unitEconomics.marginStatus === 'borderline' ? 'text-yellow-600' :
                              unitEconomics.marginStatus === 'below' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              ${unitEconomics.unitMargin.toFixed(2)}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg border">
                            <div className="text-sm text-gray-600">Margin %</div>
                            <div className={`text-lg font-bold ${
                              unitEconomics.marginStatus === 'healthy' ? 'text-green-600' :
                              unitEconomics.marginStatus === 'borderline' ? 'text-yellow-600' :
                              unitEconomics.marginStatus === 'below' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {unitEconomics.marginPercent.toFixed(1)}%
                            </div>
                          </div>
                        </div>

                        {/* Traffic Light Indicator */}
                        <div className="flex items-center justify-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            unitEconomics.marginStatus === 'healthy' ? 'bg-green-500' :
                            unitEconomics.marginStatus === 'borderline' ? 'bg-yellow-500' :
                            unitEconomics.marginStatus === 'below' ? 'bg-red-500' : 'bg-gray-400'
                          }`}></div>
                          <span className="text-sm font-medium">
                            {unitEconomics.marginStatus === 'healthy' ? 'Healthy Margin' :
                             unitEconomics.marginStatus === 'borderline' ? 'Borderline Margin' :
                             unitEconomics.marginStatus === 'below' ? 'Below Threshold' : 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}


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
                      <div className={`w-2 h-2 rounded-full ${lineItems.some(item => item.description && item.quantity && item.rate) ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span>Line items {lineItems.some(item => item.description && item.quantity && item.rate) ? 'configured' : 'required'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${lineItems.filter(item => item.itemId).length > 0 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span>{lineItems.filter(item => item.itemId).length} items from master</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${lineItems.filter(item => !item.itemId && item.partNumber).length > 0 ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
                      <span>{lineItems.filter(item => !item.itemId && item.partNumber).length} new items</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Margin Threshold Alert */}
                {unitEconomics.marginStatus === 'below' && (
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                      <CardTitle className="text-lg text-red-900 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Margin Below Threshold
                      </CardTitle>
                      <CardDescription className="text-red-700">
                        This quotation is below minimum margin requirements
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-red-800">
                          <strong>Current Margin:</strong> {unitEconomics.marginPercent.toFixed(1)}% 
                          (Minimum Required: 10%)
                        </div>
                        <div className="text-sm text-red-700">
                          Consider adjusting the proposed price or requesting approval from management.
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateProposedPrice(unitEconomics.unitCost * 1.15)}
                            className="border-red-300 text-red-700 hover:bg-red-100"
                          >
                            Adjust to 15% Margin
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-red-300 text-red-700 hover:bg-red-100"
                          >
                            Request Approval
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      Add from Item Master
                    </Button>
                    <Link href="/items/create">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <FileText className="w-4 h-4 mr-2" />
                        Create New Item
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Calculator className="w-4 h-4 mr-2" />
                      Calculate from BOM
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="engineering">
            <div className="grid grid-cols-5 gap-6">
              <div className="col-span-3 space-y-6">
                {/* Engineering Assignment */}
                <Card>
                  <CardHeader>
                    <CardTitle>Engineering Assignment</CardTitle>
                    <CardDescription>Assign engineering team and define requirements</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="assignedEngineer">Assigned Engineer *</Label>
                        <Select value={engineeringData.assignedEngineer} onValueChange={(value) => handleEngineeringChange("assignedEngineer", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select engineer" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="jane-engineer">Jane Engineer</SelectItem>
                            <SelectItem value="john-smith">John Smith</SelectItem>
                            <SelectItem value="mike-design">Mike Design</SelectItem>
                            <SelectItem value="sarah-cad">Sarah CAD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estimatedHours">Estimated Engineering Hours</Label>
                        <Input
                          id="estimatedHours"
                          type="number"
                          placeholder="40"
                          value={engineeringData.estimatedEngineeringHours}
                          onChange={(e) => handleEngineeringChange("estimatedEngineeringHours", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="engineeringStatus">Engineering Status</Label>
                      <Select value={engineeringData.engineeringStatus} onValueChange={(value) => handleEngineeringChange("engineeringStatus", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Not Started">Not Started</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Drawing Complete">Drawing Complete</SelectItem>
                          <SelectItem value="Review Required">Review Required</SelectItem>
                          <SelectItem value="Approved">Approved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Engineering Drawing */}
                <Card>
                  <CardHeader>
                    <CardTitle>Engineering Drawing</CardTitle>
                    <CardDescription>Create and manage engineering drawings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="drawingRevision">Drawing Revision</Label>
                        <Input
                          id="drawingRevision"
                          placeholder="Rev A"
                          value={engineeringData.drawingRevision}
                          onChange={(e) => handleEngineeringChange("drawingRevision", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Drawing Status</Label>
                        <Badge className={workflowStatus.engineeringDrawingCreated ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {workflowStatus.engineeringDrawingCreated ? "Drawing Complete" : "Not Created"}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="drawingNotes">Drawing Notes</Label>
                      <Textarea
                        id="drawingNotes"
                        placeholder="Engineering drawing notes and specifications..."
                        rows={4}
                        value={engineeringData.drawingNotes}
                        onChange={(e) => handleEngineeringChange("drawingNotes", e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={createEngineeringDrawing} disabled={!workflowStatus.engineeringAssigned}>
                        <FileText className="w-4 h-4 mr-2" />
                        Create Engineering Drawing
                      </Button>
                      <Button variant="outline">
                        <FileText className="w-4 h-4 mr-2" />
                        Upload Drawing
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="col-span-2 space-y-6">
                {/* Engineering Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Engineering Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      {workflowStatus.engineeringAssigned ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                      )}
                      <span>Engineer Assigned</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {workflowStatus.engineeringDrawingCreated ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                      )}
                      <span>Drawing Created</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {workflowStatus.boqGenerated ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                      )}
                      <span>BOQ Generated</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="boq">
            <div className="grid grid-cols-5 gap-6">
              <div className="col-span-3 space-y-6">
                {/* BOQ Generation */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Bill of Quantities (BOQ)</CardTitle>
                        <CardDescription>Generate BOQ from engineering drawings</CardDescription>
                      </div>
                      <Button onClick={generateBOQ} disabled={!workflowStatus.engineeringDrawingCreated}>
                        <Calculator className="w-4 h-4 mr-2" />
                        Generate BOQ
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {workflowStatus.boqGenerated ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600">Material Cost</p>
                            <p className="text-2xl font-bold text-blue-600">${boqData.totalMaterialCost.toLocaleString()}</p>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-gray-600">Labor Cost</p>
                            <p className="text-2xl font-bold text-green-600">${boqData.totalLaborCost.toLocaleString()}</p>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <p className="text-sm text-gray-600">Equipment Cost</p>
                            <p className="text-2xl font-bold text-purple-600">${boqData.totalEquipmentCost.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="mt-6">
                          <Badge className="bg-green-100 text-green-800">BOQ Generated Successfully</Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">BOQ will be generated from engineering drawings</p>
                        <p className="text-sm text-gray-400">Complete engineering drawing first</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="col-span-2 space-y-6">
                {/* BOQ Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">BOQ Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge className={boqData.boqStatus === "Generated" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {boqData.boqStatus}
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="unit-economics">
            <div className="space-y-6">
              <UnitEconomicsCalculator 
                quotationId="temp-quotation"
                initialData={{
                  id: 'temp-ue',
                  quotationId: 'temp-quotation',
                  baseMaterialCost: formData.materialCost || 0,
                  copperWeight: formData.materialCost ? Math.round(formData.materialCost / 100) : 0, // Estimate: ~$100 per kg copper
                  copperLMEPrice: 8500, // TODO: Fetch from LME API
                  laborCost: formData.laborCost || 0,
                  overheadCost: formData.overheadCost || 0,
                  profitMargin: 15, // Default profit margin
                  quantity: lineItems.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0) || 1,
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
            </div>
          </TabsContent>

          <TabsContent value="summary">
            <div className="grid grid-cols-5 gap-6">
              <div className="col-span-3 space-y-6">
                {/* Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quotation Summary</CardTitle>
                    <CardDescription>Review and send quotation to customer</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2">Customer Information</h4>
                        <p className="text-sm text-gray-600">Customer: {formData.customer || "Not specified"}</p>
                        <p className="text-sm text-gray-600">Contact: {formData.contactPerson || "Not specified"}</p>
                        <p className="text-sm text-gray-600">Project: {formData.project || "Not specified"}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Engineering Status</h4>
                        <p className="text-sm text-gray-600">Engineer: {engineeringData.assignedEngineer || "Not assigned"}</p>
                        <p className="text-sm text-gray-600">Drawing: {workflowStatus.engineeringDrawingCreated ? "Complete" : "Pending"}</p>
                        <p className="text-sm text-gray-600">BOQ: {workflowStatus.boqGenerated ? "Generated" : "Pending"}</p>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Cost Breakdown</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Subtotal: ${calculateSubtotal().toLocaleString()}</p>
                          <p className="text-sm text-gray-600">Tax: ${calculateTax().toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold">Total: ${calculateTotal().toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button onClick={() => handleSave("send")} disabled={!workflowStatus.boqGenerated || isSaving}>
                        <Send className="w-4 h-4 mr-2" />
                        {isSaving ? "Sending..." : "Send to Customer"}
                      </Button>
                      <Button variant="outline">
                        <FileText className="w-4 h-4 mr-2" />
                        Preview PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="col-span-2 space-y-6">
                {/* Workflow Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Workflow Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      {workflowStatus.quotationCreated ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="text-sm">Quotation Created</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {workflowStatus.engineeringAssigned ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="text-sm">Engineering Assigned</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {workflowStatus.engineeringDrawingCreated ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="text-sm">Drawing Created</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {workflowStatus.boqGenerated ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="text-sm">BOQ Generated</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {workflowStatus.sentToCustomer ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="text-sm">Sent to Customer</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
