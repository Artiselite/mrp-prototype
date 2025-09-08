"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Factory, 
  Users, 
  FileText, 
  Plus, 
  CheckCircle, 
  ArrowRight,
  ArrowLeft,
  Calendar,
  Target,
  Clock,
  AlertTriangle
} from "lucide-react"
import { useDatabaseContext } from "@/components/database-provider"
import { useRouter } from "next/navigation"

export default function WorkOrderCreationWizard() {
  const { 
    workstations = [], 
    operators = [], 
    productionWorkOrders: workOrders = [],
    customers = [],
    createProductionWorkOrder,
    updateWorkstation,
    updateOperator,
    refreshProductionWorkOrders
  } = useDatabaseContext()
  const router = useRouter()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [workOrderData, setWorkOrderData] = useState({
    productName: "",
    description: "",
    quantity: 1,
    customer: "",
    project: "",
    priority: "Medium",
    dueDate: "",
    assignedWorkstation: "",
    assignedOperator: "",
    operations: [] as Array<{
      step: string;
      duration: string;
      status: "Pending" | "In Progress" | "Completed";
    }>
  })

  const steps = [
    { id: 1, title: "Basic Information", description: "Define work order details" },
    { id: 2, title: "Resource Assignment", description: "Assign workstation and operator" },
    { id: 3, title: "Operations Planning", description: "Define production operations" },
    { id: 4, title: "Review & Create", description: "Review and create work order" }
  ]

  const [newOperation, setNewOperation] = useState({
    step: "",
    duration: "",
    description: ""
  })

  const addOperation = () => {
    if (newOperation.step && newOperation.duration) {
      const operation = {
        step: newOperation.step,
        duration: newOperation.duration,
        status: "Pending" as "Pending" | "In Progress" | "Completed"
      }
      
      setWorkOrderData(prev => ({
        ...prev,
        operations: [...prev.operations, operation]
      }))
      
      setNewOperation({ step: "", duration: "", description: "" })
    }
  }

  const removeOperation = (index: number) => {
    setWorkOrderData(prev => ({
      ...prev,
      operations: prev.operations.filter((_, i) => i !== index)
    }))
  }

  const progress = (currentStep / steps.length) * 100

  const availableWorkstations = workstations.filter(ws => ws.status === "Active" && !ws.currentWorkOrder)
  const availableOperators = operators.filter(op => op.status === "Active" && !op.currentWorkOrder)

  const createWorkOrder = async () => {
    setIsSubmitting(true)
    try {
      // Create the work order
      const newWorkOrderData = {
        productName: workOrderData.productName,
        description: workOrderData.description,
        quantity: workOrderData.quantity,
        customer: workOrderData.customer,
        project: workOrderData.project,
        priority: workOrderData.priority as "Low" | "Medium" | "High" | "Critical",
        dueDate: workOrderData.dueDate,
        status: "Planned" as const,
        progress: 0,
        assignedTeam: "Production Team A",
        supervisor: "Mike Johnson",
        operations: workOrderData.operations,
        revision: "1.0",
        bomId: "",
        workOrderNumber: `WO${String(workOrders.length + 1).padStart(3, '0')}`,
        startDate: new Date().toISOString().split('T')[0],
        assignedTo: workOrderData.assignedOperator || "Unassigned",
        estimatedHours: 40,
        actualHours: 0,
        notes: ""
      }

      const createdWorkOrder = createProductionWorkOrder(newWorkOrderData)

      // Assign to workstation if selected
      if (workOrderData.assignedWorkstation) {
        const workstation = workstations.find(ws => ws.id === workOrderData.assignedWorkstation)
        if (workstation) {
          updateWorkstation(workOrderData.assignedWorkstation, {
            ...workstation,
            currentWorkOrder: createdWorkOrder.id,
            status: "Active"
          })
        }
      }

      // Assign to operator if selected
      if (workOrderData.assignedOperator) {
        const operator = operators.find(op => op.id === workOrderData.assignedOperator)
        if (operator) {
          updateOperator(workOrderData.assignedOperator, {
            ...operator,
            currentWorkOrder: createdWorkOrder.id,
            currentWorkstation: workOrderData.assignedWorkstation,
            status: "Active"
          })
        }
      }

      // Refresh data
      refreshProductionWorkOrders()

      // Show success message
      alert(`Work order ${createdWorkOrder.id} created successfully and assigned to resources!`)

      // Navigate back to production dashboard
      router.push('/production')
    } catch (error) {
      console.error("Error creating work order:", error)
      alert("Failed to create work order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Create Work Order</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Create a new work order and assign it to shopfloor resources
        </p>
        
        {/* Progress */}
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Creation Progress</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Steps */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep > step.id ? <CheckCircle className="w-4 h-4" /> : step.id}
              </div>
              <div className="ml-2">
                <div className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-gray-400 mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStep === 1 && <FileText className="w-5 h-5" />}
            {currentStep === 2 && <Factory className="w-5 h-5" />}
            {currentStep === 3 && <Target className="w-5 h-5" />}
            {currentStep === 4 && <CheckCircle className="w-5 h-5" />}
            Step {currentStep}: {steps[currentStep - 1].title}
          </CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="product-name">Product Name</Label>
                  <Input
                    id="product-name"
                    placeholder="e.g., W12x26 Steel I-Beam Assembly"
                    value={workOrderData.productName}
                    onChange={(e) => setWorkOrderData(prev => ({ ...prev, productName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description of the work order..."
                    value={workOrderData.description}
                    onChange={(e) => setWorkOrderData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={workOrderData.quantity}
                    onChange={(e) => setWorkOrderData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customer">Customer</Label>
                  <Select value={workOrderData.customer} onValueChange={(value) => setWorkOrderData(prev => ({ ...prev, customer: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer: any) => (
                        <SelectItem key={customer.id} value={customer.name}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="project">Project</Label>
                  <Input
                    id="project"
                    placeholder="e.g., Bridge Construction Project"
                    value={workOrderData.project}
                    onChange={(e) => setWorkOrderData(prev => ({ ...prev, project: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={workOrderData.priority} onValueChange={(value) => setWorkOrderData(prev => ({ ...prev, priority: value }))}>
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
                  <Label htmlFor="due-date">Due Date</Label>
                  <Input
                    id="due-date"
                    type="date"
                    value={workOrderData.dueDate}
                    onChange={(e) => setWorkOrderData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Resource Assignment */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Factory className="w-5 h-5" />
                      Available Workstations
                    </CardTitle>
                    <CardDescription>
                      {availableWorkstations.length} workstations available
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {availableWorkstations.map((workstation: any) => (
                        <div 
                          key={workstation.id} 
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            workOrderData.assignedWorkstation === workstation.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setWorkOrderData(prev => ({ ...prev, assignedWorkstation: workstation.id }))}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{workstation.name}</div>
                              <div className="text-sm text-gray-600">{workstation.location}</div>
                            </div>
                            <Badge variant="outline">{workstation.type}</Badge>
                          </div>
                        </div>
                      ))}
                      {availableWorkstations.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                          <p>No workstations available</p>
                          <p className="text-sm">All workstations are currently assigned</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Available Operators
                    </CardTitle>
                    <CardDescription>
                      {availableOperators.length} operators available
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {availableOperators.map((operator: any) => (
                        <div 
                          key={operator.id} 
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            workOrderData.assignedOperator === operator.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setWorkOrderData(prev => ({ ...prev, assignedOperator: operator.id }))}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{operator.name}</div>
                              <div className="text-sm text-gray-600">{operator.position}</div>
                            </div>
                            <Badge variant="outline">{operator.shift}</Badge>
                          </div>
                        </div>
                      ))}
                      {availableOperators.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                          <p>No operators available</p>
                          <p className="text-sm">All operators are currently assigned</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 3: Operations Planning */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Add Operation</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="operation-step">Operation Step</Label>
                      <Input
                        id="operation-step"
                        placeholder="e.g., Material Preparation"
                        value={newOperation.step}
                        onChange={(e) => setNewOperation(prev => ({ ...prev, step: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="operation-duration">Duration</Label>
                      <Input
                        id="operation-duration"
                        placeholder="e.g., 2 days"
                        value={newOperation.duration}
                        onChange={(e) => setNewOperation(prev => ({ ...prev, duration: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="operation-description">Description</Label>
                      <Textarea
                        id="operation-description"
                        placeholder="Detailed description of the operation..."
                        value={newOperation.description}
                        onChange={(e) => setNewOperation(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    <Button onClick={addOperation} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Operation
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Operations ({workOrderData.operations.length})</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {workOrderData.operations.map((operation, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{operation.step}</div>
                            <div className="text-sm text-gray-600">{operation.duration}</div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeOperation(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    {workOrderData.operations.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No operations defined yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Create */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Work Order Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div><strong>Product:</strong> {workOrderData.productName}</div>
                    <div><strong>Customer:</strong> {workOrderData.customer}</div>
                    <div><strong>Project:</strong> {workOrderData.project}</div>
                    <div><strong>Quantity:</strong> {workOrderData.quantity}</div>
                    <div><strong>Priority:</strong> 
                      <Badge className="ml-2" variant={
                        workOrderData.priority === "Critical" ? "destructive" :
                        workOrderData.priority === "High" ? "destructive" :
                        workOrderData.priority === "Medium" ? "default" : "secondary"
                      }>
                        {workOrderData.priority}
                      </Badge>
                    </div>
                    <div><strong>Due Date:</strong> {workOrderData.dueDate}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Resource Assignment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div><strong>Workstation:</strong> {
                      workstations.find(ws => ws.id === workOrderData.assignedWorkstation)?.name || "Not assigned"
                    }</div>
                    <div><strong>Operator:</strong> {
                      operators.find(op => op.id === workOrderData.assignedOperator)?.name || "Not assigned"
                    }</div>
                    <div><strong>Operations:</strong> {workOrderData.operations.length} steps</div>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold">Ready to Create Work Order?</h3>
                <p className="text-gray-600">
                  This will create a new work order and assign it to the selected resources.
                </p>
                <Button 
                  size="lg" 
                  className="w-full max-w-md"
                  onClick={createWorkOrder}
                  disabled={isSubmitting}
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {isSubmitting ? "Creating Work Order..." : "Create Work Order"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button 
          onClick={() => setCurrentStep(prev => Math.min(steps.length, prev + 1))}
          disabled={currentStep === steps.length}
        >
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
