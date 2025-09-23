"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
// import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Plus, 
  Edit, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  X,
  Settings,
  Clock,
  User,
  Factory,
  CheckCircle,
  AlertTriangle,
  FileText,
  Copy
} from "lucide-react"
import { useDatabaseContext } from "@/components/database-provider"
import { ProcessStep } from "@/lib/types"

export default function ProcessStepsPage() {
  const { 
    workstations = [], 
    operators = [],
    productionWorkOrders: workOrders = [],
    processSteps = [],
    getProcessStepsByWorkOrder,
    createProcessStep,
    updateProcessStep,
    deleteProcessStep
  } = useDatabaseContext()

  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string>("")
  const [isEditing, setIsEditing] = useState(false)
  const [editingStep, setEditingStep] = useState<ProcessStep | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([])
  const [workOrderSteps, setWorkOrderSteps] = useState<ProcessStep[]>([])
  const [selectedSteps, setSelectedSteps] = useState<Set<string>>(new Set())

  const [newStep, setNewStep] = useState({
    stepName: "",
    estimatedDuration: "",
    operatorId: "",
    workstationId: "",
    qualityCheckRequired: false,
    notes: ""
  })

  // Load process steps for selected work order
  useEffect(() => {
    if (selectedWorkOrder) {
      const steps = getProcessStepsByWorkOrder(selectedWorkOrder)
      setWorkOrderSteps(steps)
    } else {
      setWorkOrderSteps([])
    }
    // Clear selection when work order changes
    setSelectedSteps(new Set())
  }, [selectedWorkOrder, getProcessStepsByWorkOrder])

  // Load available templates
  useEffect(() => {
    // In a real app, this would fetch from API
    const mockTemplates = [
      {
        id: "T001",
        name: "Standard Steel Fabrication",
        description: "Basic steel cutting, welding, and finishing process",
        category: "Steel Fabrication",
        stepCount: 4
      },
      {
        id: "T002",
        name: "Rush Order Process",
        description: "Expedited process for urgent orders",
        category: "Rush Orders",
        stepCount: 3
      },
      {
        id: "T003",
        name: "Quality Focus Process",
        description: "Enhanced quality checks and inspections",
        category: "Quality Focus",
        stepCount: 5
      }
    ]
    setAvailableTemplates(mockTemplates)
  }, [])

  const handleAddStep = () => {
    if (!selectedWorkOrder) {
      alert("Please select a work order first")
      return
    }

    if (!newStep.stepName || !newStep.estimatedDuration) {
      alert("Please fill in step name and estimated duration")
      return
    }

    const step = createProcessStep({
      workOrderId: selectedWorkOrder,
      operationIndex: workOrderSteps.length,
      stepName: newStep.stepName,
      status: "Pending",
      estimatedDuration: parseInt(newStep.estimatedDuration),
      actualDuration: 0,
      operatorId: newStep.operatorId || undefined,
      workstationId: newStep.workstationId || undefined,
      qualityCheckRequired: newStep.qualityCheckRequired,
      qualityStatus: newStep.qualityCheckRequired ? "Pending" : undefined,
      notes: newStep.notes || undefined
    })

    // Refresh the work order steps to show the newly added step
    const updatedSteps = getProcessStepsByWorkOrder(selectedWorkOrder)
    setWorkOrderSteps(updatedSteps)

    setNewStep({
      stepName: "",
      estimatedDuration: "",
      operatorId: "",
      workstationId: "",
      qualityCheckRequired: false,
      notes: ""
    })
    setShowForm(false)
  }

  const handleEditStep = (step: ProcessStep) => {
    setEditingStep(step)
    setIsEditing(true)
    setNewStep({
      stepName: step.stepName,
      estimatedDuration: step.estimatedDuration.toString(),
      operatorId: step.operatorId || "",
      workstationId: step.workstationId || "",
      qualityCheckRequired: step.qualityCheckRequired,
      notes: step.notes || ""
    })
    setShowForm(true)
  }

  const handleUpdateStep = () => {
    if (!editingStep) return

    const updatedStep = updateProcessStep(editingStep.id, {
      stepName: newStep.stepName,
      estimatedDuration: parseInt(newStep.estimatedDuration),
      operatorId: newStep.operatorId || undefined,
      workstationId: newStep.workstationId || undefined,
      qualityCheckRequired: newStep.qualityCheckRequired,
      qualityStatus: newStep.qualityCheckRequired ? (editingStep.qualityStatus || "Pending") : undefined,
      notes: newStep.notes || undefined
    })

    if (updatedStep) {
      // Refresh the work order steps to show the updated step
      const updatedSteps = getProcessStepsByWorkOrder(selectedWorkOrder)
      setWorkOrderSteps(updatedSteps)

      setIsEditing(false)
      setEditingStep(null)
      setNewStep({
        stepName: "",
        estimatedDuration: "",
        operatorId: "",
        workstationId: "",
        qualityCheckRequired: false,
        notes: ""
      })
      setShowForm(false)
    }
  }

  const handleDeleteStep = (stepId: string) => {
    if (confirm("Are you sure you want to delete this process step?")) {
      deleteProcessStep(stepId)
      // Refresh the work order steps to show the updated list
      const updatedSteps = getProcessStepsByWorkOrder(selectedWorkOrder)
      setWorkOrderSteps(updatedSteps)
    }
  }

  const handleMoveStep = (stepId: string, direction: 'up' | 'down') => {
    const stepIndex = workOrderSteps.findIndex(step => step.id === stepId)
    if (stepIndex === -1) return

    const newSteps = [...workOrderSteps]
    const targetIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1

    if (targetIndex >= 0 && targetIndex < newSteps.length) {
      // Swap steps
      [newSteps[stepIndex], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[stepIndex]]
      
      // Update operation indices
      newSteps.forEach((step, index) => {
        updateProcessStep(step.id, { operationIndex: index })
      })

      // Refresh the work order steps to show the updated order
      const updatedSteps = getProcessStepsByWorkOrder(selectedWorkOrder)
      setWorkOrderSteps(updatedSteps)
    }
  }

  const getOperatorName = (operatorId: string) => {
    const operator = operators.find(op => op.id === operatorId)
    return operator ? operator.name : "Unassigned"
  }

  const getWorkstationName = (workstationId: string) => {
    const workstation = workstations.find(ws => ws.id === workstationId)
    return workstation ? workstation.name : "Unassigned"
  }

  // Checkbox selection handlers
  const handleSelectStep = (stepId: string) => {
    setSelectedSteps(prev => {
      const newSet = new Set(prev)
      if (newSet.has(stepId)) {
        newSet.delete(stepId)
      } else {
        newSet.add(stepId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedSteps.size === workOrderSteps.length) {
      // If all are selected, deselect all
      setSelectedSteps(new Set())
    } else {
      // Select all
      setSelectedSteps(new Set(workOrderSteps.map(step => step.id)))
    }
  }

  const handleBulkDelete = () => {
    if (selectedSteps.size === 0) {
      alert("Please select steps to delete")
      return
    }

    if (confirm(`Are you sure you want to delete ${selectedSteps.size} selected process step(s)?`)) {
      selectedSteps.forEach(stepId => {
        deleteProcessStep(stepId)
      })
      
      // Refresh the work order steps to show the updated list
      const updatedSteps = getProcessStepsByWorkOrder(selectedWorkOrder)
      setWorkOrderSteps(updatedSteps)
      
      // Clear selection
      setSelectedSteps(new Set())
    }
  }

  const handleApplyTemplate = (templateId: string) => {
    if (!selectedWorkOrder) {
      alert("Please select a work order first")
      return
    }

    // In a real app, this would fetch template steps from API
    const templateSteps = [
      {
        workOrderId: selectedWorkOrder,
        operationIndex: workOrderSteps.length,
        stepName: "Setup",
        status: "Pending" as const,
        estimatedDuration: 120,
        actualDuration: 0,
        qualityCheckRequired: false
      },
      {
        workOrderId: selectedWorkOrder,
        operationIndex: workOrderSteps.length + 1,
        stepName: "Cutting Operations",
        status: "Pending" as const,
        estimatedDuration: 480,
        actualDuration: 0,
        qualityCheckRequired: true,
        qualityStatus: "Pending" as const
      },
      {
        workOrderId: selectedWorkOrder,
        operationIndex: workOrderSteps.length + 2,
        stepName: "Welding Operations",
        status: "Pending" as const,
        estimatedDuration: 360,
        actualDuration: 0,
        qualityCheckRequired: true,
        qualityStatus: "Pending" as const
      },
      {
        workOrderId: selectedWorkOrder,
        operationIndex: workOrderSteps.length + 3,
        stepName: "Quality Check",
        status: "Pending" as const,
        estimatedDuration: 60,
        actualDuration: 0,
        qualityCheckRequired: true,
        qualityStatus: "Pending" as const
      }
    ]

    // Create each step in the database
    templateSteps.forEach(step => {
      createProcessStep(step)
    })

    // Refresh the work order steps to show the newly added template steps
    const updatedSteps = getProcessStepsByWorkOrder(selectedWorkOrder)
    setWorkOrderSteps(updatedSteps)

    setShowTemplateSelector(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800"
      case "In Progress": return "bg-blue-100 text-blue-800"
      case "Paused": return "bg-yellow-100 text-yellow-800"
      case "Pending": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Process Steps Management</h1>
          <p className="text-muted-foreground">
            Define and manage process steps for work orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowTemplateSelector(true)}>
            <FileText className="w-4 h-4 mr-2" />
            Apply Template
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Process Step
          </Button>
        </div>
      </div>

      {/* Work Order Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Work Order</CardTitle>
          <CardDescription>
            Choose a work order to define process steps for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select value={selectedWorkOrder} onValueChange={setSelectedWorkOrder}>
              <SelectTrigger className="w-80">
                <SelectValue placeholder="Select a work order" />
              </SelectTrigger>
              <SelectContent>
                {workOrders.map((workOrder) => (
                  <SelectItem key={workOrder.id} value={workOrder.id}>
                    {workOrder.productName} - {workOrder.status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
                {selectedWorkOrder && (
                  <Badge variant="outline">
                    {workOrderSteps.length} steps defined
                  </Badge>
                )}
          </div>
        </CardContent>
      </Card>

      {/* Template Selector */}
      {showTemplateSelector && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Apply Process Step Template
              <Button variant="ghost" size="sm" onClick={() => setShowTemplateSelector(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              Select a template to quickly add common process steps to this work order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Category:</span>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Steps:</span>
                      <span className="font-medium">{template.stepCount}</span>
                    </div>
                    <Button 
                      onClick={() => handleApplyTemplate(template.id)}
                      className="w-full"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Apply Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Process Steps Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {isEditing ? "Edit Process Step" : "Add New Process Step"}
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stepName">Step Name *</Label>
                <Input
                  id="stepName"
                  placeholder="e.g., Setup, Cutting, Welding"
                  value={newStep.stepName}
                  onChange={(e) => setNewStep(prev => ({ ...prev, stepName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedDuration">Estimated Duration (minutes) *</Label>
                <Input
                  id="estimatedDuration"
                  type="number"
                  placeholder="e.g., 120"
                  value={newStep.estimatedDuration}
                  onChange={(e) => setNewStep(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="operator">Assigned Operator</Label>
                <Select value={newStep.operatorId} onValueChange={(value) => setNewStep(prev => ({ ...prev, operatorId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-operator">No operator assigned</SelectItem>
                    {operators.map((operator) => (
                      <SelectItem key={operator.id} value={operator.id}>
                        {operator.name} - {operator.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="workstation">Assigned Workstation</Label>
                <Select value={newStep.workstationId} onValueChange={(value) => setNewStep(prev => ({ ...prev, workstationId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select workstation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-workstation">No workstation assigned</SelectItem>
                    {workstations.map((workstation) => (
                      <SelectItem key={workstation.id} value={workstation.id}>
                        {workstation.name} - {workstation.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes or instructions for this step"
                value={newStep.notes}
                onChange={(e) => setNewStep(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="qualityCheck"
                checked={newStep.qualityCheckRequired}
                onChange={(e) => setNewStep(prev => ({ ...prev, qualityCheckRequired: e.target.checked }))}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <Label htmlFor="qualityCheck">Quality Check Required</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={isEditing ? handleUpdateStep : handleAddStep}>
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? "Update Step" : "Add Step"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Process Steps List */}
      {selectedWorkOrder && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Process Steps for Work Order</CardTitle>
                <CardDescription>
                  Manage the sequence and details of process steps
                </CardDescription>
              </div>
              {workOrderSteps.length > 0 && (
                <div className="flex items-center gap-2">
                  {selectedSteps.size > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {selectedSteps.size} selected
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDelete}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Selected
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
                {workOrderSteps.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No process steps defined yet</p>
                    <p className="text-sm">Click "Add Process Step" or "Apply Template" to get started</p>
                  </div>
                ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={workOrderSteps.length > 0 && selectedSteps.size === workOrderSteps.length}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                    </TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Step Name</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead>Workstation</TableHead>
                    <TableHead>Quality Check</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                    <TableBody>
                      {workOrderSteps.map((step, index) => (
                    <TableRow key={step.id} className={selectedSteps.has(step.id) ? "bg-blue-50" : ""}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedSteps.has(step.id)}
                          onChange={() => handleSelectStep(step.id)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{index + 1}</span>
                          <div className="flex flex-col">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveStep(step.id, 'up')}
                              disabled={index === 0}
                              className="h-4 p-0"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMoveStep(step.id, 'down')}
                                  disabled={index === workOrderSteps.length - 1}
                                  className="h-4 p-0"
                                >
                              <ArrowDown className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{step.stepName}</div>
                          {step.notes && (
                            <div className="text-sm text-muted-foreground">{step.notes}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{Math.floor(step.estimatedDuration / 60)}h {step.estimatedDuration % 60}m</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{getOperatorName(step.operatorId || "")}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Factory className="w-4 h-4 text-muted-foreground" />
                          <span>{getWorkstationName(step.workstationId || "")}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {step.qualityCheckRequired ? (
                          <Badge className="bg-purple-100 text-purple-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Required
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not Required</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStep(step)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStep(step.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
