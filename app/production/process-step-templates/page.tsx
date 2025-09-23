"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy,
  Save,
  X,
  Settings,
  Clock,
  User,
  Factory,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  FileText,
  Star
} from "lucide-react"
import { useDatabaseContext } from "@/components/database-provider"
import { ProcessStep } from "@/lib/types"

interface ProcessStepTemplate {
  id: string
  name: string
  description: string
  category: string
  steps: ProcessStep[]
  isDefault: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
}

export default function ProcessStepTemplatesPage() {
  const { 
    workstations = [], 
    operators = []
  } = useDatabaseContext()

  const [templates, setTemplates] = useState<ProcessStepTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<ProcessStepTemplate | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const [templateForm, setTemplateForm] = useState({
    name: "",
    description: "",
    category: "",
    isDefault: false
  })

  const [newStep, setNewStep] = useState({
    stepName: "",
    estimatedDuration: "",
    operatorId: "",
    workstationId: "",
    qualityCheckRequired: false,
    notes: ""
  })

  // Load templates on component mount
  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = () => {
    // In a real app, this would fetch from API
    const mockTemplates: ProcessStepTemplate[] = [
      {
        id: "T001",
        name: "Standard Steel Fabrication",
        description: "Basic steel cutting, welding, and finishing process",
        category: "Steel Fabrication",
        isDefault: true,
        createdBy: "System",
        createdAt: "2024-01-15T08:00:00Z",
        updatedAt: "2024-01-15T08:00:00Z",
        steps: [
          {
            id: "TS001",
            workOrderId: "TEMPLATE",
            operationIndex: 0,
            stepName: "Setup",
            status: "Pending",
            estimatedDuration: 120,
            actualDuration: 0,
            operatorId: "",
            workstationId: "",
            qualityCheckRequired: false,
            createdAt: "2024-01-15T08:00:00Z",
            updatedAt: "2024-01-15T08:00:00Z"
          },
          {
            id: "TS002",
            workOrderId: "TEMPLATE",
            operationIndex: 1,
            stepName: "Cutting Operations",
            status: "Pending",
            estimatedDuration: 480,
            actualDuration: 0,
            operatorId: "",
            workstationId: "",
            qualityCheckRequired: true,
            qualityStatus: "Pending",
            createdAt: "2024-01-15T08:00:00Z",
            updatedAt: "2024-01-15T08:00:00Z"
          },
          {
            id: "TS003",
            workOrderId: "TEMPLATE",
            operationIndex: 2,
            stepName: "Welding Operations",
            status: "Pending",
            estimatedDuration: 360,
            actualDuration: 0,
            operatorId: "",
            workstationId: "",
            qualityCheckRequired: true,
            qualityStatus: "Pending",
            createdAt: "2024-01-15T08:00:00Z",
            updatedAt: "2024-01-15T08:00:00Z"
          },
          {
            id: "TS004",
            workOrderId: "TEMPLATE",
            operationIndex: 3,
            stepName: "Quality Check",
            status: "Pending",
            estimatedDuration: 60,
            actualDuration: 0,
            operatorId: "",
            workstationId: "",
            qualityCheckRequired: true,
            qualityStatus: "Pending",
            createdAt: "2024-01-15T08:00:00Z",
            updatedAt: "2024-01-15T08:00:00Z"
          }
        ]
      },
      {
        id: "T002",
        name: "Rush Order Process",
        description: "Expedited process for urgent orders",
        category: "Rush Orders",
        isDefault: false,
        createdBy: "John Smith",
        createdAt: "2024-01-20T10:00:00Z",
        updatedAt: "2024-01-20T10:00:00Z",
        steps: [
          {
            id: "TR001",
            workOrderId: "TEMPLATE",
            operationIndex: 0,
            stepName: "Quick Setup",
            status: "Pending",
            estimatedDuration: 60,
            actualDuration: 0,
            operatorId: "",
            workstationId: "",
            qualityCheckRequired: false,
            createdAt: "2024-01-20T10:00:00Z",
            updatedAt: "2024-01-20T10:00:00Z"
          },
          {
            id: "TR002",
            workOrderId: "TEMPLATE",
            operationIndex: 1,
            stepName: "Priority Cutting",
            status: "Pending",
            estimatedDuration: 240,
            actualDuration: 0,
            operatorId: "",
            workstationId: "",
            qualityCheckRequired: true,
            qualityStatus: "Pending",
            createdAt: "2024-01-20T10:00:00Z",
            updatedAt: "2024-01-20T10:00:00Z"
          },
          {
            id: "TR003",
            workOrderId: "TEMPLATE",
            operationIndex: 2,
            stepName: "Fast Welding",
            status: "Pending",
            estimatedDuration: 180,
            actualDuration: 0,
            operatorId: "",
            workstationId: "",
            qualityCheckRequired: true,
            qualityStatus: "Pending",
            createdAt: "2024-01-20T10:00:00Z",
            updatedAt: "2024-01-20T10:00:00Z"
          }
        ]
      }
    ]
    setTemplates(mockTemplates)
  }

  const categories = ["all", "Steel Fabrication", "Rush Orders", "Quality Focus", "Assembly", "Custom"]

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleCreateTemplate = () => {
    if (!templateForm.name || !templateForm.category) {
      alert("Please fill in template name and category")
      return
    }

    const newTemplate: ProcessStepTemplate = {
      id: `T_${Date.now()}`,
      name: templateForm.name,
      description: templateForm.description,
      category: templateForm.category,
      isDefault: templateForm.isDefault,
      createdBy: "Current User", // In real app, get from auth
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: []
    }

    setTemplates(prev => [...prev, newTemplate])
    setTemplateForm({ name: "", description: "", category: "", isDefault: false })
    setShowForm(false)
  }

  const handleEditTemplate = (template: ProcessStepTemplate) => {
    setSelectedTemplate(template)
    setIsEditing(true)
    setTemplateForm({
      name: template.name,
      description: template.description,
      category: template.category,
      isDefault: template.isDefault
    })
    setShowForm(true)
  }

  const handleUpdateTemplate = () => {
    if (!selectedTemplate) return

    const updatedTemplate = {
      ...selectedTemplate,
      name: templateForm.name,
      description: templateForm.description,
      category: templateForm.category,
      isDefault: templateForm.isDefault,
      updatedAt: new Date().toISOString()
    }

    setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? updatedTemplate : t))
    setIsEditing(false)
    setSelectedTemplate(null)
    setTemplateForm({ name: "", description: "", category: "", isDefault: false })
    setShowForm(false)
  }

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      setTemplates(prev => prev.filter(t => t.id !== templateId))
    }
  }

  const handleCopyTemplate = (template: ProcessStepTemplate) => {
    const copiedTemplate: ProcessStepTemplate = {
      ...template,
      id: `T_${Date.now()}`,
      name: `${template.name} (Copy)`,
      isDefault: false,
      createdBy: "Current User",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: template.steps.map(step => ({
        ...step,
        id: `TS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        workOrderId: "TEMPLATE"
      }))
    }

    setTemplates(prev => [...prev, copiedTemplate])
  }

  const handleAddStep = () => {
    if (!selectedTemplate) return

    if (!newStep.stepName || !newStep.estimatedDuration) {
      alert("Please fill in step name and estimated duration")
      return
    }

    const step: ProcessStep = {
      id: `TS_${Date.now()}`,
      workOrderId: "TEMPLATE",
      operationIndex: selectedTemplate.steps.length,
      stepName: newStep.stepName,
      status: "Pending",
      estimatedDuration: parseInt(newStep.estimatedDuration),
      actualDuration: 0,
      operatorId: newStep.operatorId || undefined,
      workstationId: newStep.workstationId || undefined,
      qualityCheckRequired: newStep.qualityCheckRequired,
      qualityStatus: newStep.qualityCheckRequired ? "Pending" : undefined,
      notes: newStep.notes || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedTemplate = {
      ...selectedTemplate,
      steps: [...selectedTemplate.steps, step],
      updatedAt: new Date().toISOString()
    }

    setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? updatedTemplate : t))
    setSelectedTemplate(updatedTemplate)
    setNewStep({
      stepName: "",
      estimatedDuration: "",
      operatorId: "",
      workstationId: "",
      qualityCheckRequired: false,
      notes: ""
    })
  }

  const handleDeleteStep = (stepId: string) => {
    if (!selectedTemplate) return

    const updatedSteps = selectedTemplate.steps.filter(step => step.id !== stepId)
    const updatedTemplate = {
      ...selectedTemplate,
      steps: updatedSteps.map((step, index) => ({ ...step, operationIndex: index })),
      updatedAt: new Date().toISOString()
    }

    setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? updatedTemplate : t))
    setSelectedTemplate(updatedTemplate)
  }

  const handleMoveStep = (stepId: string, direction: 'up' | 'down') => {
    if (!selectedTemplate) return

    const stepIndex = selectedTemplate.steps.findIndex(step => step.id === stepId)
    if (stepIndex === -1) return

    const newSteps = [...selectedTemplate.steps]
    const targetIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1

    if (targetIndex >= 0 && targetIndex < newSteps.length) {
      [newSteps[stepIndex], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[stepIndex]]
      newSteps.forEach((step, index) => {
        step.operationIndex = index
      })

      const updatedTemplate = {
        ...selectedTemplate,
        steps: newSteps,
        updatedAt: new Date().toISOString()
      }

      setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? updatedTemplate : t))
      setSelectedTemplate(updatedTemplate)
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Process Step Templates</h1>
          <p className="text-muted-foreground">
            Create and manage reusable process step templates
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Template Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {isEditing ? "Edit Template" : "Create New Template"}
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="templateName">Template Name *</Label>
                <Input
                  id="templateName"
                  placeholder="e.g., Standard Steel Fabrication"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="templateCategory">Category *</Label>
                <Select value={templateForm.category} onValueChange={(value) => setTemplateForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== "all").map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="templateDescription">Description</Label>
              <Textarea
                id="templateDescription"
                placeholder="Describe what this template is used for"
                value={templateForm.description}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={templateForm.isDefault}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <Label htmlFor="isDefault">Set as default template for this category</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={isEditing ? handleUpdateTemplate : handleCreateTemplate}>
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? "Update Template" : "Create Template"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {template.name}
                    {template.isDefault && <Star className="w-4 h-4 text-yellow-500" />}
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </div>
                <Badge variant="outline">{template.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <div>Steps: {template.steps.length}</div>
                <div>Created by: {template.createdBy}</div>
                <div>Updated: {new Date(template.updatedAt).toLocaleDateString()}</div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTemplate(template)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyTemplate(template)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Steps Editor */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Edit Steps for "{selectedTemplate.name}"
              <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            </CardTitle>
            <CardDescription>
              Define the process steps for this template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Step Form */}
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Add New Step</h4>
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

              <Button onClick={handleAddStep} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Step to Template
              </Button>
            </div>

            {/* Steps List */}
            {selectedTemplate.steps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No steps defined yet</p>
                <p className="text-sm">Add steps using the form above</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
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
                  {selectedTemplate.steps.map((step, index) => (
                    <TableRow key={step.id}>
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
                              disabled={index === selectedTemplate.steps.length - 1}
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStep(step.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
