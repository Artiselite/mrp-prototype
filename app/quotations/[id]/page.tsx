"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Edit, Download, Send, FileText, CheckCircle, AlertCircle, Clock, Settings, Mail, ShoppingCart, Upload, DollarSign, ChevronDown, ChevronUp, TrendingUp, Factory, Zap, Calculator } from 'lucide-react'
import Link from "next/link"
import { useDatabaseContext } from '@/components/database-provider'
import type { Quotation } from '@/lib/types'
import UnitEconomicsCalculator from '@/components/unit-economics-calculator'
import { dataIntegrationService, type IntegratedQuotationData } from '@/lib/services/data-integration'

export default function QuotationDetailPage() {
  const params = useParams()
  const quotationId = params.id as string

  const { quotations, salesOrders, updateQuotation, createSalesOrder, isInitialized } = useDatabaseContext()

  const [quotation, setQuotation] = useState<Quotation | null>(null)
  const [integratedData, setIntegratedData] = useState<IntegratedQuotationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [isSalesOrderDialogOpen, setIsSalesOrderDialogOpen] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [isPOReceivedDialogOpen, setIsPOReceivedDialogOpen] = useState(false)
  const [poNumber, setPONumber] = useState('')
  const [poDate, setPODate] = useState('')
  const [poAmount, setPOAmount] = useState('')
  const [poFile, setPOFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isUnitEconomicsExpanded, setIsUnitEconomicsExpanded] = useState(false)
  const [isProductionFeasibilityExpanded, setIsProductionFeasibilityExpanded] = useState(false)

  useEffect(() => {
    if (isInitialized && quotations && quotationId) {
      const foundQuotation = quotations.find(q => q.id === quotationId)
      setQuotation(foundQuotation || null)
      
      if (foundQuotation) {
        // Initialize data integration service with available data
        dataIntegrationService.initialize({
          quotations,
          // Add other data sources as they become available
        })
        
        // Get integrated data
        const integrated = dataIntegrationService.getIntegratedQuotationData(quotationId)
        setIntegratedData(integrated)
      }
      
      setLoading(false)
    }
  }, [isInitialized, quotations, quotationId])

  // Set default PO date and amount when dialog opens
  useEffect(() => {
    if (isPOReceivedDialogOpen) {
      if (!poDate) {
        setPODate(new Date().toISOString().split('T')[0])
      }
      if (!poAmount && quotation) {
        setPOAmount(quotation.total.toString())
      }
    }
  }, [isPOReceivedDialogOpen, poDate, poAmount, quotation])

  // Helper functions for ETO workflow
  const getWorkflowStage = (quotation: Quotation | null) => {
    if (!quotation) return 'Unknown'

    // Use the stored workflowStage if available, otherwise derive from flags
    if (quotation.workflowStage) {
      return quotation.workflowStage
    }

    // Fallback to deriving from individual flags
    if (quotation.status === 'Approved' && quotation.poReceived) {
      return 'PO Received'
    } else if (quotation.sentToCustomer) {
      return 'Customer Review'
    } else if (quotation.boqGenerated) {
      return 'Ready to Send'
    } else if (quotation.engineeringDrawingCreated) {
      return 'BOQ Pending'
    } else if (quotation.engineeringProjectId) {
      return 'Engineering'
    } else {
      return 'Draft'
    }
  }

  const getEngineeringStatus = (quotation: Quotation | null) => {
    if (!quotation) return 'Unknown'
    if (quotation.engineeringReviewer && quotation.managementApprover) {
      return 'Fully Approved'
    } else if (quotation.engineeringReviewer) {
      return 'Engineering Approved'
    } else if (quotation.engineeringProjectId) {
      return 'Engineering In Progress'
    } else {
      return 'No Engineering'
    }
  }

  const getBOQStatus = (quotation: Quotation | null) => {
    if (!quotation) return 'Unknown'
    if (quotation.boqGenerated) {
      return 'BOQ Generated'
    } else if (quotation.engineeringDrawingCreated) {
      return 'Drawing Complete'
    } else if (quotation.engineeringProjectId) {
      return 'Engineering In Progress'
    } else {
      return 'Not Started'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800'
      case 'Sent': return 'bg-blue-100 text-blue-800'
      case 'Under Review': return 'bg-yellow-100 text-yellow-800'
      case 'Customer Review': return 'bg-purple-100 text-purple-800'
      case 'Negotiation': return 'bg-orange-100 text-orange-800'
      case 'Approved': return 'bg-green-100 text-green-800'
      case 'Completed': return 'bg-emerald-100 text-emerald-800'
      case 'Rejected': return 'bg-red-100 text-red-800'
      case 'Expired': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getWorkflowStatusColor = (stage: string) => {
    switch (stage) {
      case 'Draft': return 'bg-gray-100 text-gray-800'
      case 'Engineering': return 'bg-blue-100 text-blue-800'
      case 'BOQ Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Ready to Send': return 'bg-green-100 text-green-800'
      case 'Customer Review': return 'bg-purple-100 text-purple-800'
      case 'PO Received': return 'bg-emerald-100 text-emerald-800'
      case 'Completed': return 'bg-emerald-100 text-emerald-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSendToCustomer = () => {
    if (!quotation) return

    // Update quotation status to sent
    const updatedQuotation = {
      ...quotation,
      status: 'Sent' as const,
      sentToCustomer: true,
      workflowStage: 'Customer Review' as const,
      updatedAt: new Date().toISOString()
    }

    // Update both local state and database
    setQuotation(updatedQuotation)
    updateQuotation(quotation.id, updatedQuotation)
    setIsEmailDialogOpen(false)
  }

  const handleConvertToSalesOrder = async () => {
    if (!quotation) return

    setIsConverting(true)

    try {
      // Create sales order from quotation
      const salesOrderData = {
        customerId: quotation.customerId,
        customerName: quotation.customerName,
        quotationId: quotation.id,
        salesOrderNumber: `SO-${Date.now()}`,
        customerPO: poNumber || `PO-${Date.now()}`, // Use entered PO number
        title: quotation.title,
        description: quotation.description,
        status: 'Draft' as const,
        items: quotation.items.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          deliveryDate: item.deliveryDate,
          specifications: item.specifications,
          status: 'Pending' as const
        })),
        subtotal: quotation.subtotal,
        tax: quotation.tax,
        total: quotation.total,
        orderDate: new Date().toISOString(),
        requestedDeliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        shippingAddress: 'Customer Address', // This would come from customer
        billingAddress: 'Customer Address', // This would come from customer
        paymentTerms: quotation.paymentTerms || 'Net 30',
        revision: '1.0',
        notes: `Converted from quotation ${quotation.quotationNumber}`
      }

      console.log('About to create sales order with data:', salesOrderData)
      const newSalesOrder = createSalesOrder(salesOrderData)

      console.log('Sales Order creation result:', newSalesOrder)
      console.log('Sales Order data sent:', salesOrderData)
      console.log('Sales Order ID generated:', newSalesOrder?.id)
      console.log('Sales Order object keys:', newSalesOrder ? Object.keys(newSalesOrder) : 'No sales order created')

      if (newSalesOrder) {
        // Update quotation to mark it as converted
        const updatedQuotation = {
          ...quotation,
          status: 'Completed' as const,
          convertedToSO: true,
          soId: newSalesOrder.id,
          workflowStage: 'Completed' as const,
          updatedAt: new Date().toISOString()
        }

        // Update both local state and database
        setQuotation(updatedQuotation)
        const updateResult = updateQuotation(quotation.id, updatedQuotation)
        console.log('Quotation update result:', updateResult)

        // Debug: Check if sales order is in database
        console.log('Checking if sales order exists in database...')
        console.log('Sales Order ID to check:', newSalesOrder.id)

        // Verify sales order was created by checking database
        setTimeout(() => {
          console.log('Verifying sales order in database...')
          // This would be a good place to verify the sales order exists
          // For now, we'll just log the verification attempt
        }, 1000)

        setIsSalesOrderDialogOpen(false)

        // Show success message and navigate to sales order
        console.log('Quotation successfully converted to Sales Order:', newSalesOrder.id)
        console.log('Sales Order object:', newSalesOrder)

        // Show success message to user
        alert(`Quotation successfully converted to Sales Order!\n\nSales Order ID: ${newSalesOrder.id}\n\nYou will be redirected to the Sales Order page in a moment.`)

        // Verify sales order was created by checking the database
        setTimeout(() => {
          console.log('Verifying sales order creation...')
          // Navigate to the newly created sales order
          window.location.href = `/sales-orders/${newSalesOrder.id}`
        }, 3000) // Increased delay to ensure database is fully updated

        // Fallback: If navigation fails, redirect to sales orders list
        setTimeout(() => {
          console.log('Fallback: Redirecting to sales orders list')
          window.location.href = '/sales-orders'
        }, 5000) // 5 second fallback
      }
    } catch (error) {
      console.error('Error converting quotation to sales order:', error)
    } finally {
      setIsConverting(false)
    }
  }

  const handleMarkPOReceived = () => {
    if (!quotation || !poNumber.trim()) return

    setIsUploading(true)

    try {
      // Simulate file upload (in real app, this would upload to cloud storage)
      if (poFile) {
        console.log('Uploading PO file:', poFile.name, 'Size:', poFile.size, 'bytes')
        // Simulate upload delay
        setTimeout(() => {
          console.log('PO file uploaded successfully')
        }, 1000)
      }

      // Update quotation to mark PO as received
      const updatedQuotation = {
        ...quotation,
        poReceived: true,
        workflowStage: 'PO Received' as const,
        updatedAt: new Date().toISOString()
      }

      // Update both local state and database
      setQuotation(updatedQuotation)
      updateQuotation(quotation.id, updatedQuotation)

      // Reset form and close dialog
      setPONumber('')
      setPODate('')
      setPOAmount('')
      setPOFile(null)
      setIsPOReceivedDialogOpen(false)
    } catch (error) {
      console.error('Error marking PO as received:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a valid file type: PDF, JPEG, PNG, or Word document')
        return
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      setPOFile(file)
    }
  }

  const removeFile = () => {
    setPOFile(null)
  }

  // Unit Economics calculations
  const calculateUnitEconomics = (quotation: Quotation | null, integratedData: IntegratedQuotationData | null) => {
    if (!quotation || !quotation.items || quotation.items.length === 0) {
      return {
        totalQuantity: 0,
        unitCost: 0,
        unitPrice: 0,
        unitMargin: 0,
        unitMarginPercent: 0,
        marginColor: 'text-gray-500'
      }
    }

    const totalQuantity = quotation.items.reduce((sum, item) => sum + item.quantity, 0)
    
    // Use integrated data if available, otherwise fallback to quotation data
    let unitCost, unitPrice, unitMargin
    
    if (integratedData) {
      unitCost = integratedData.unitEconomics.unitCost
      unitPrice = integratedData.unitEconomics.unitPrice
      unitMargin = integratedData.unitEconomics.profitMargin
    } else {
      // Fallback calculation using quotation data
      const totalCost = quotation.materialCost + quotation.laborCost + quotation.overheadCost
      unitCost = totalQuantity > 0 ? totalCost / totalQuantity : 0
      const unitProfit = totalQuantity > 0 ? quotation.profitMargin / totalQuantity : 0
      unitPrice = unitCost + unitProfit
      unitMargin = unitProfit
    }
    
    const unitMarginPercent = unitPrice > 0 ? (unitMargin / unitPrice) * 100 : 0

    // Traffic light colors for margin
    let marginColor = 'text-gray-500'
    if (unitMarginPercent >= 20) {
      marginColor = 'text-green-600'
    } else if (unitMarginPercent >= 10) {
      marginColor = 'text-yellow-600'
    } else if (unitMarginPercent > 0) {
      marginColor = 'text-orange-600'
    } else {
      marginColor = 'text-red-600'
    }

    return {
      totalQuantity,
      unitCost,
      unitPrice,
      unitMargin,
      unitMarginPercent,
      marginColor
    }
  }

  // Business process feasibility data (VSM for quotation-to-delivery flow)
  const getProductionFeasibility = (quotation: Quotation | null) => {
    if (!quotation) return null

    // Business process steps with realistic load percentages based on quotation status
    const steps = [
      { 
        name: 'Quotation', 
        cycleTime: 2, 
        waitTime: 1, 
        load: quotation.status === 'Draft' ? 95 : 20, 
        color: 'bg-blue-500',
        status: quotation.status,
        description: 'Initial quote preparation'
      },
      { 
        name: 'Sales Order', 
        cycleTime: 1, 
        waitTime: 3, 
        load: quotation.convertedToSO ? 15 : (quotation.poReceived ? 85 : 0), 
        color: 'bg-green-500',
        status: quotation.convertedToSO ? 'Completed' : quotation.poReceived ? 'In Progress' : 'Pending',
        description: 'Customer PO and order conversion'
      },
      { 
        name: 'Project Scoping', 
        cycleTime: 3, 
        waitTime: 2, 
        load: quotation.engineeringProjectId ? 60 : (quotation.workflowStage === 'Engineering' ? 90 : 0), 
        color: 'bg-purple-500',
        status: quotation.engineeringProjectId ? 'In Progress' : 'Pending',
        description: 'Engineering and technical design'
      },
      { 
        name: 'Production Line', 
        cycleTime: 5, 
        waitTime: 1, 
        load: quotation.convertedToSO ? 75 : 0, 
        color: 'bg-orange-500',
        status: quotation.convertedToSO ? 'Ready' : 'Pending',
        description: 'Manufacturing and assembly'
      },
      { 
        name: 'Invoicing', 
        cycleTime: 1, 
        waitTime: 2, 
        load: quotation.convertedToSO ? 40 : 0, 
        color: 'bg-indigo-500',
        status: quotation.convertedToSO ? 'Ready' : 'Pending',
        description: 'Billing and payment processing'
      }
    ]

    // Find bottleneck (highest load)
    const bottleneck = steps.reduce((max, step) => step.load > max.load ? step : max, steps[0])

    // Calculate total process time
    const totalCycleTime = steps.reduce((sum, step) => sum + step.cycleTime, 0)
    const totalWaitTime = steps.reduce((sum, step) => sum + step.waitTime, 0)

    return {
      steps,
      bottleneck,
      totalCycleTime,
      totalWaitTime,
      currentStage: quotation.workflowStage || 'Draft'
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
              <p className="text-gray-500">The quotation you're looking for doesn't exist or has been deleted.</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/quotations">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Quotations
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{quotation.title}</h1>
              <div className="flex items-center gap-4">
                <p className="text-gray-600">Quotation {quotation.quotationNumber}</p>
                <Badge variant="outline" className="text-sm">
                  {quotation.revision || "Rev 1.0"}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(quotation.status)}>
              {quotation.status}
            </Badge>
            <Badge className={getWorkflowStatusColor(getWorkflowStage(quotation))}>
              {getWorkflowStage(quotation)}
            </Badge>
            <Link href={`/quotations/${quotation.id}/edit`}>
              <Button>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
          </div>
        </div>

        {/* Combined Workflow Progress and Production Feasibility */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            {/* Workflow Progress - Always Visible */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Workflow Progress</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {quotation.engineeringProjectId ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-gray-400" />}
                  <span className="text-sm">Engineering</span>
                </div>
                <div className="flex items-center gap-2">
                  {quotation.engineeringDrawingCreated ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-gray-400" />}
                  <span className="text-sm">Drawing</span>
                </div>
                <div className="flex items-center gap-2">
                  {quotation.boqGenerated ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-gray-400" />}
                  <span className="text-sm">BOQ</span>
                </div>
                <div className="flex items-center gap-2">
                  {quotation.sentToCustomer ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-gray-400" />}
                  <span className="text-sm">Sent</span>
                </div>
                <div className="flex items-center gap-2">
                  {quotation.poReceived ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-gray-400" />}
                  <span className="text-sm">PO Received</span>
                </div>
              </div>
            </div>

            {/* Production Feasibility - Expandable Section */}
            <div className="border-t pt-6">
              <div 
                className="flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors p-2 -m-2 rounded"
                onClick={() => setIsProductionFeasibilityExpanded(!isProductionFeasibilityExpanded)}
              >
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  <Factory className="w-5 h-5" />
                  VSM Analysis
                </h4>
                {isProductionFeasibilityExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
              
              {isProductionFeasibilityExpanded && (
                <div className="mt-4 space-y-4">
                  {(() => {
                    const feasibility = getProductionFeasibility(quotation)
                    if (!feasibility) return null

                    return (
                      <>
                        {/* Bottleneck Analysis */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Zap className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-800">Process Bottleneck Analysis</span>
                          </div>
                          
                          {/* Combined Bottleneck Bar */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              <span>Process Load Distribution</span>
                              <span>Bottleneck: {feasibility.bottleneck.name}</span>
                            </div>
                            
                            <div className="flex h-4 bg-gray-200 rounded-full overflow-hidden">
                              {feasibility.steps.map((step, index) => (
                                <div
                                  key={step.name}
                                  className={`${step.color} transition-all duration-300 ${
                                    step.name === feasibility.bottleneck.name ? 'ring-2 ring-red-400 ring-opacity-50' : ''
                                  }`}
                                  style={{ 
                                    width: `${(step.load / Math.max(...feasibility.steps.map(s => s.load))) * 100}%`,
                                    minWidth: step.load > 0 ? '8px' : '0px'
                                  }}
                                  title={`${step.name}: ${step.load}% load`}
                                />
                              ))}
                            </div>
                            
                            {/* Load Ratios */}
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Bottleneck Load:</span>
                                <span className="font-medium text-red-600">{feasibility.bottleneck.load}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Avg Load:</span>
                                <span className="font-medium text-gray-700">
                                  {Math.round(feasibility.steps.reduce((sum, step) => sum + step.load, 0) / feasibility.steps.length)}%
                                </span>
                              </div>
                            </div>
                            
                            {/* Bottleneck Impact */}
                            <div className="text-xs text-gray-500 mt-2">
                              <span className="font-medium">Impact:</span> {feasibility.bottleneck.name} is 
                              <span className="font-medium text-red-600 mx-1">
                                {Math.round((feasibility.bottleneck.load / Math.max(...feasibility.steps.map(s => s.load))) * 100)}%
                              </span>
                              of the total process load
                            </div>
                          </div>
                        </div>

                        {/* VSM Timeline */}
                        <div className="space-y-3">
                          <h5 className="text-sm font-medium text-gray-700">Business Process Flow</h5>
                          {feasibility.steps.map((step, index) => (
                            <div key={step.name} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-700">{step.name}</span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    step.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                    step.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                    step.status === 'Ready' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {step.status}
                                  </span>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  step.load >= 90 ? 'bg-red-100 text-red-800' :
                                  step.load >= 75 ? 'bg-orange-100 text-orange-800' :
                                  step.load >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                  step.load > 0 ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-500'
                                }`}>
                                  {step.load}% load
                                </span>
                              </div>
                              
                              <p className="text-xs text-gray-500">{step.description}</p>
                              
                              {/* Gantt-style bars */}
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500 w-12">Process:</span>
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${step.color}`}
                                      style={{ width: `${Math.min(step.cycleTime * 15, 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-500">{step.cycleTime}d</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500 w-12">Wait:</span>
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="h-2 rounded-full bg-gray-400"
                                      style={{ width: `${Math.min(step.waitTime * 15, 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-500">{step.waitTime}d</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Summary */}
                        <div className="border-t pt-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Total Process Time:</span>
                              <span className="ml-2 font-medium">{feasibility.totalCycleTime}d</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Total Wait Time:</span>
                              <span className="ml-2 font-medium">{feasibility.totalWaitTime}d</span>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            Current Stage: <span className="font-medium">{feasibility.currentStage}</span>
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-gray-500">CUSTOMER</Label>
                    <p className="text-sm font-medium">{quotation.customerName}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-500">PROJECT</Label>
                    <p className="text-sm font-medium">{quotation.title}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-500">QUOTATION NUMBER</Label>
                    <p className="text-sm font-medium">{quotation.quotationNumber}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-500">REVISION</Label>
                    <p className="text-sm font-medium">{quotation.revision || "Rev 1.0"}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-500">WORKFLOW STAGE</Label>
                    <Badge className={getWorkflowStatusColor(getWorkflowStage(quotation))}>
                      {getWorkflowStage(quotation)}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-500">STATUS</Label>
                    <Badge className={getStatusColor(quotation.status)}>
                      {quotation.status}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-gray-500">ENGINEERING STATUS</Label>
                    <p className="text-sm font-medium">{getEngineeringStatus(quotation)}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-500">BOQ STATUS</Label>
                    <p className="text-sm font-medium">{getBOQStatus(quotation)}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">DESCRIPTION</Label>
                  <p className="text-sm text-gray-700 mt-1">{quotation.description}</p>
                </div>
                {quotation.notes && (
                  <div>
                    <Label className="text-xs font-medium text-gray-500">NOTES</Label>
                    <p className="text-sm text-gray-700 mt-1">{quotation.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader>
                <CardTitle>Line Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total Price</TableHead>
                      <TableHead>Delivery Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotation.items && quotation.items.length > 0 ? (
                      quotation.items.map((item, index) => (
                        <TableRow key={item.id || index}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.description}</p>
                              {item.specifications && (
                                <p className="text-sm text-gray-500">{item.specifications}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>RM{item.unitPrice.toLocaleString()}</TableCell>
                          <TableCell className="font-medium">RM{item.totalPrice.toLocaleString()}</TableCell>
                          <TableCell>{item.deliveryDate}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No line items found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Simple Summary */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>RM{quotation.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Engineering Cost:</span>
                        <span>RM{quotation.engineeringCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax:</span>
                        <span>RM{quotation.tax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total:</span>
                        <span>RM{quotation.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="revisions" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="revisions">Revisions</TabsTrigger>
                <TabsTrigger value="attachments">Attachments</TabsTrigger>
                <TabsTrigger value="unit-economics">Unit Economics</TabsTrigger>
              </TabsList>

              <TabsContent value="revisions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Revision History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Current Revision Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-blue-900">Current Revision</h4>
                          <p className="text-sm text-blue-700">
                            {quotation.revision || "Rev 1.0"} • Last updated {new Date(quotation.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {quotation.changeHistory && quotation.changeHistory.length > 0 ? (
                        quotation.changeHistory.map((change, index) => (
                          <div key={change.id || index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{change.changeNumber}</Badge>
                                <span className="font-medium">{change.changeType}</span>
                              </div>
                              <span className="text-sm text-gray-500">{change.createdAt}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Requested by: {change.requestedBy}</p>
                            <p className="text-gray-700 mb-2">{change.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span>Cost Impact: ${change.costImpact.toLocaleString()}</span>
                              <span>Schedule Impact: {change.scheduleImpact} days</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No revision history available</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="attachments" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Attachments & Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No attachments uploaded yet</p>
                      <Button variant="outline" className="mt-4">
                        <FileText className="w-4 h-4 mr-2" />
                        Upload Documents
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="unit-economics" className="space-y-4">
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
            initialData={integratedData ? {
              id: `ue_${quotationId}`,
              quotationId,
              baseMaterialCost: integratedData.unitEconomics.baseMaterialCost,
              copperWeight: integratedData.unitEconomics.copperWeight,
              copperLMEPrice: integratedData.unitEconomics.copperLMEPrice,
              laborCost: integratedData.unitEconomics.laborCost,
              overheadCost: integratedData.unitEconomics.overheadCost,
              profitMargin: integratedData.unitEconomics.profitMargin,
              quantity: integratedData.unitEconomics.quantity,
              currency: 'MYR',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            } : {
              id: `ue_${quotationId}`,
              quotationId,
              baseMaterialCost: quotation?.materialCost || 0,
              copperWeight: quotation?.materialCost ? Math.round(quotation.materialCost / 100) : 0, // Estimate: ~$100 per kg copper
              copperLMEPrice: 8500, // TODO: Fetch from LME API
              laborCost: quotation?.laborCost || 0,
              overheadCost: quotation?.overheadCost || 0,
              profitMargin: quotation?.items && quotation.items.length > 0 ?
                ((quotation.profitMargin || 0) / quotation.items.reduce((sum, item) => sum + item.quantity, 0)) * 100 : 15,
              quantity: quotation?.items?.reduce((sum, item) => sum + item.quantity, 0) || 1,
              currency: 'MYR',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }}
            onSave={(data) => {
              console.log('Unit economics data saved:', data)
              // Update quotation with new cost data
              if (quotation) {
                const updatedQuotation = {
                  ...quotation,
                  materialCost: data.baseMaterialCost,
                  laborCost: data.laborCost,
                  overheadCost: data.overheadCost,
                  profitMargin: (data.profitMargin / 100) * quotation.subtotal
                }
                updateQuotation(quotationId, updatedQuotation)
              }
            }}
          />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cost Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Cost Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">RM{quotation.total.toLocaleString()}</div>
                    <div className="text-sm text-blue-700">Total Quotation Value</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">RM{quotation.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Engineering:</span>
                    <span className="font-medium">RM{quotation.engineeringCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Materials:</span>
                    <span className="font-medium">RM{quotation.materialCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Labor:</span>
                    <span className="font-medium">RM{quotation.laborCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Overhead:</span>
                    <span className="font-medium">RM{quotation.overheadCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="text-gray-600">Profit:</span>
                    <span className="font-medium text-green-600">RM{quotation.profitMargin.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">RM{quotation.tax.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded p-2">
                  <div className="text-xs text-gray-600 text-center">
                    Profit Margin: {quotation.total > 0 ? ((quotation.profitMargin / quotation.total) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Unit Economics Panel */}
            <Card>
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setIsUnitEconomicsExpanded(!isUnitEconomicsExpanded)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Unit Economics
                  </CardTitle>
                  {isUnitEconomicsExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </CardHeader>
              {isUnitEconomicsExpanded && (
                <CardContent className="space-y-4">
                  {(() => {
                    const unitEcon = calculateUnitEconomics(quotation, integratedData)
                    return (
                      <>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              RM{unitEcon.unitPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-sm text-blue-700">Unit Price</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-lg font-semibold text-gray-700">
                              RM{unitEcon.unitCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-xs text-gray-500">Unit Cost</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-lg font-semibold text-gray-700">
                              {unitEcon.totalQuantity}
                            </div>
                            <div className="text-xs text-gray-500">Total Quantity</div>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-600">Unit Margin:</span>
                            <div className="text-right">
                              <div className={`text-lg font-bold ${unitEcon.marginColor}`}>
                                RM{unitEcon.unitMargin.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                              </div>
                              <div className={`text-sm ${unitEcon.marginColor}`}>
                                {unitEcon.unitMarginPercent.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                          
                          {/* Traffic light indicator */}
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              unitEcon.unitMarginPercent >= 20 ? 'bg-green-500' :
                              unitEcon.unitMarginPercent >= 10 ? 'bg-yellow-500' :
                              unitEcon.unitMarginPercent > 0 ? 'bg-orange-500' : 'bg-red-500'
                            }`} />
                            <span className="text-xs text-gray-500">
                              {unitEcon.unitMarginPercent >= 20 ? 'Excellent margin' :
                               unitEcon.unitMarginPercent >= 10 ? 'Good margin' :
                               unitEcon.unitMarginPercent > 0 ? 'Low margin' : 'Negative margin'}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          <strong>Calculation:</strong> Unit Cost = (Materials + Labor + Overhead) ÷ Quantity | Unit Price = Unit Cost + Unit Profit
                        </div>
                      </>
                    )
                  })()}
                </CardContent>
              )}
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs font-medium text-gray-500">REVISION</Label>
                  <p className="text-sm font-medium">{quotation.revision || "Rev 1.0"}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">CREATED</Label>
                  <p className="text-sm">{new Date(quotation.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">UPDATED</Label>
                  <p className="text-sm">{new Date(quotation.updatedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">VALID UNTIL</Label>
                  <p className="text-sm">{new Date(quotation.validUntil).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">SALES PERSON</Label>
                  <p className="text-sm">{quotation.salesPerson}</p>
                </div>
              </CardContent>
            </Card>

            {/* Status Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {!quotation.engineeringProjectId && (
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Assign Engineering
                  </Button>
                )}
                {quotation.boqGenerated && !quotation.sentToCustomer && (
                  <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Send className="w-4 h-4 mr-2" />
                        Send to Customer
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Mail className="w-5 h-5 text-blue-600" />
                          Send Quotation to Customer
                        </DialogTitle>
                        <DialogDescription>
                          Review the email content before sending to {quotation.customerName}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        {/* Email Preview */}
                        <div className="border rounded-lg p-4 bg-gray-50">
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs font-medium text-gray-500">TO:</Label>
                              <p className="text-sm">{quotation.customerName} &lt;customer@example.com&gt;</p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-gray-500">SUBJECT:</Label>
                              <p className="text-sm">Quotation {quotation.quotationNumber} - {quotation.title}</p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-gray-500">MESSAGE:</Label>
                              <div className="mt-2 p-3 bg-white border rounded text-sm">
                                <p>Dear {quotation.customerName},</p>
                                <br />
                                <p>Thank you for your interest in our services. Please find attached our detailed quotation for {quotation.title}.</p>
                                <br />
                                <p><strong>Quotation Details:</strong></p>
                                <ul className="list-disc list-inside ml-4 space-y-1">
                                  <li>Quotation Number: {quotation.quotationNumber}</li>
                                  <li>Total Value: RM{quotation.total.toLocaleString()}</li>
                                  <li>Valid Until: {new Date(quotation.validUntil).toLocaleDateString()}</li>
                                  <li>Revision: {quotation.revision || 'Rev 1.0'}</li>
                                </ul>
                                <br />
                                <p>This quotation includes:</p>
                                <ul className="list-disc list-inside ml-4 space-y-1">
                                  <li>Detailed item breakdown with specifications</li>
                                  <li>Engineering drawings and technical details</li>
                                  <li>Bill of Quantities (BOQ) for accurate costing</li>
                                  <li>Delivery and payment terms</li>
                                </ul>
                                <br />
                                <p>Please review the attached documents and let us know if you have any questions or require modifications.</p>
                                <br />
                                <p>We look forward to your response.</p>
                                <br />
                                <p>Best regards,<br />
                                  {quotation.salesPerson}<br />
                                  Sales Team</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3">
                          <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleSendToCustomer} className="bg-blue-600 hover:bg-blue-700">
                            <Send className="w-4 h-4 mr-2" />
                            Send Email
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                {quotation.sentToCustomer && !quotation.poReceived && (
                  <Dialog open={isPOReceivedDialogOpen} onOpenChange={setIsPOReceivedDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark PO Received
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          Mark Purchase Order Received
                        </DialogTitle>
                        <DialogDescription>
                          Enter the customer's purchase order details to proceed with the quotation.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        {/* PO Details Form */}
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="poNumber">Purchase Order Number *</Label>
                            <Input
                              id="poNumber"
                              value={poNumber}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPONumber(e.target.value)}
                              placeholder="Enter PO number"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="poDate">PO Date</Label>
                            <Input
                              id="poDate"
                              type="date"
                              value={poDate}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPODate(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="poAmount">PO Amount</Label>
                            <Input
                              id="poAmount"
                              type="number"
                              value={poAmount}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPOAmount(e.target.value)}
                              placeholder="Enter PO amount"
                              step="0.01"
                            />
                          </div>

                          {/* File Upload Section */}
                          <div>
                            <Label htmlFor="poFile">Upload Purchase Order Document</Label>
                            <div className="mt-2">
                              {!poFile ? (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                                  <input
                                    id="poFile"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    onChange={handleFileChange}
                                    className="hidden"
                                  />
                                  <label htmlFor="poFile" className="cursor-pointer">
                                    <div className="flex flex-col items-center">
                                      <FileText className="w-8 h-8 text-gray-400 mb-2" />
                                      <p className="text-sm text-gray-600">
                                        <span className="font-medium text-blue-600 hover:text-blue-500">
                                          Click to upload
                                        </span>{' '}
                                        or drag and drop
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        PDF, JPEG, PNG, or Word documents up to 5MB
                                      </p>
                                    </div>
                                  </label>
                                </div>
                              ) : (
                                <div className="border rounded-lg p-3 bg-blue-50">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <FileText className="w-5 h-5 text-blue-600" />
                                      <div>
                                        <p className="text-sm font-medium text-blue-900">{poFile.name}</p>
                                        <p className="text-xs text-blue-700">
                                          {(poFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={removeFile}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <AlertCircle className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3">
                          <Button variant="outline" onClick={() => setIsPOReceivedDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button
                            onClick={handleMarkPOReceived}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={!poNumber.trim() || isUploading}
                          >
                            {isUploading ? (
                              <>
                                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                {poFile ? 'Uploading & Processing...' : 'Processing...'}
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark PO Received
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                {quotation.poReceived && !quotation.convertedToSO && (
                  <Dialog open={isSalesOrderDialogOpen} onOpenChange={setIsSalesOrderDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Complete Quotation
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <ShoppingCart className="w-5 h-5 text-green-600" />
                          Convert Quotation to Sales Order
                        </DialogTitle>
                        <DialogDescription>
                          Complete the quotation by converting it to a sales order. This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        {/* Confirmation Details */}
                        <div className="border rounded-lg p-4 bg-green-50">
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs font-medium text-green-600">QUOTATION DETAILS</Label>
                              <p className="text-sm font-medium text-green-900">{quotation.title}</p>
                              <p className="text-xs text-green-700">#{quotation.quotationNumber} - Rev {quotation.revision || '1.0'}</p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-green-600">CUSTOMER</Label>
                              <p className="text-sm text-green-900">{quotation.customerName}</p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-green-600">TOTAL VALUE</Label>
                              <p className="text-lg font-bold text-green-900">RM{quotation.total.toLocaleString()}</p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-green-600">ITEMS</Label>
                              <p className="text-sm text-green-900">{quotation.items.length} line items</p>
                            </div>
                          </div>
                        </div>

                        {/* Warning Message */}
                        <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-yellow-800">Important Notice</p>
                              <p className="text-sm text-yellow-700 mt-1">
                                Converting this quotation to a sales order will:
                              </p>
                              <ul className="list-disc list-inside ml-4 mt-2 text-sm text-yellow-700 space-y-1">
                                <li>Mark the quotation as "Completed"</li>
                                <li>Create a new sales order with all quotation details</li>
                                <li>Update the workflow stage to "PO Received"</li>
                                <li>Enable project and work order creation</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3">
                          <Button variant="outline" onClick={() => setIsSalesOrderDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button
                            onClick={handleConvertToSalesOrder}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={isConverting}
                          >
                            {isConverting ? (
                              <>
                                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Converting...
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Convert to Sales Order
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>

            {/* Related Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Related Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Engineering Documents */}
                {quotation.engineeringProjectId && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-500">ENGINEERING</Label>
                    <Link href={`/engineering/${quotation.engineeringProjectId}`}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <FileText className="w-4 h-4 mr-2" />
                        Engineering Drawing
                      </Button>
                    </Link>
                  </div>
                )}

                {/* BOQ Documents */}
                {quotation.boqId && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-500">BILL OF QUANTITIES</Label>
                    <Link href={`/boq/${quotation.boqId}`}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <FileText className="w-4 h-4 mr-2" />
                        BOQ Details
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Sales Order Documents */}
                {quotation.convertedToSO && quotation.soId && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-500">SALES ORDER</Label>
                    <Link href={`/sales-orders/${quotation.soId}`}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <FileText className="w-4 h-4 mr-2" />
                        Sales Order Details
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Customer Documents */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-500">CUSTOMER</Label>
                  <Link href={`/customers/${quotation.customerId}`}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      Customer Profile
                    </Button>
                  </Link>
                </div>

                {/* No Related Items Message */}
                {!quotation.engineeringProjectId && !quotation.boqId && !quotation.soId && (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">No related documents yet</p>
                    <p className="text-xs text-gray-400 mt-1">Documents will appear here as the workflow progresses</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Document Generation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Document Generation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Quotation PDF
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export All Documents
                </Button>
                {quotation.boqId && (
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate BOQ PDF
                  </Button>
                )}
                {quotation.engineeringProjectId && (
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Engineering PDF
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
