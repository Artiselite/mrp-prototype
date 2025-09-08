"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Factory, 
  Users, 
  Settings, 
  Target,
  Wrench,
  Clock,
  MapPin,
  User,
  Plus,
  X,
  Copy,
  Star
} from "lucide-react"
import { useDatabaseContext } from "@/components/database-provider"

// Journey Templates
const journeyTemplates = [
  {
    id: "standard",
    name: "Standard Production",
    description: "Standard manufacturing workflow for regular orders",
    icon: <Factory className="w-6 h-6" />,
    color: "bg-blue-100 text-blue-800",
    steps: [
      { name: "Setup", description: "Configure workstations and operators", required: true },
      { name: "Planning", description: "Create work orders and assign resources", required: true },
      { name: "Production", description: "Execute production workflow", required: true },
      { name: "Quality", description: "Perform quality inspections", required: true },
      { name: "Completion", description: "Finalize and deliver", required: true }
    ],
    estimatedDuration: "2-4 weeks",
    complexity: "Medium",
    workstations: ["Cutting", "Welding", "Assembly", "Quality Control"],
    operators: 3
  },
  {
    id: "rush",
    name: "Rush Order",
    description: "Expedited production workflow for urgent orders",
    icon: <Clock className="w-6 h-6" />,
    color: "bg-red-100 text-red-800",
    steps: [
      { name: "Setup", description: "Configure workstations and operators", required: true },
      { name: "Planning", description: "Create work orders and assign resources", required: true },
      { name: "Production", description: "Execute production workflow", required: true },
      { name: "Quality", description: "Perform quality inspections", required: true },
      { name: "Completion", description: "Finalize and deliver", required: true }
    ],
    estimatedDuration: "3-7 days",
    complexity: "High",
    workstations: ["Cutting", "Welding", "Assembly"],
    operators: 2
  },
  {
    id: "quality",
    name: "Quality Focus",
    description: "Quality-focused production workflow with enhanced inspections",
    icon: <CheckCircle className="w-6 h-6" />,
    color: "bg-green-100 text-green-800",
    steps: [
      { name: "Setup", description: "Configure workstations and operators", required: true },
      { name: "Planning", description: "Create work orders and assign resources", required: true },
      { name: "Production", description: "Execute production workflow", required: true },
      { name: "Quality", description: "Perform enhanced quality inspections", required: true },
      { name: "Review", description: "Quality review and approval", required: true },
      { name: "Completion", description: "Finalize and deliver", required: true }
    ],
    estimatedDuration: "3-5 weeks",
    complexity: "High",
    workstations: ["Cutting", "Welding", "Assembly", "Quality Control", "Packaging"],
    operators: 4
  },
  {
    id: "bulk",
    name: "Bulk Production",
    description: "High-volume production workflow for large orders",
    icon: <Target className="w-6 h-6" />,
    color: "bg-purple-100 text-purple-800",
    steps: [
      { name: "Setup", description: "Configure workstations and operators", required: true },
      { name: "Planning", description: "Create work orders and assign resources", required: true },
      { name: "Production", description: "Execute production workflow", required: true },
      { name: "Quality", description: "Perform quality inspections", required: true },
      { name: "Packaging", description: "Package and prepare for delivery", required: true },
      { name: "Completion", description: "Finalize and deliver", required: true }
    ],
    estimatedDuration: "4-8 weeks",
    complexity: "Medium",
    workstations: ["Cutting", "Welding", "Assembly", "Packaging"],
    operators: 5
  },
  {
    id: "custom",
    name: "Custom Workflow",
    description: "Create a custom production workflow from scratch",
    icon: <Settings className="w-6 h-6" />,
    color: "bg-gray-100 text-gray-800",
    steps: [],
    estimatedDuration: "Variable",
    complexity: "Variable",
    workstations: [],
    operators: 0
  }
]

export default function CreateJourneyPage() {
  const { 
    workstations = [], 
    operators = [], 
    productionWorkOrders: workOrders = [],
    createWorkstation,
    createOperator,
    refreshWorkstations,
    refreshOperators
  } = useDatabaseContext()

  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [journeyData, setJourneyData] = useState({
    name: "",
    description: "",
    type: "",
    priority: "Medium",
    startDate: "",
    endDate: "",
    customSteps: [] as any[]
  })
  const [selectedWorkstations, setSelectedWorkstations] = useState<string[]>([])
  const [selectedOperators, setSelectedOperators] = useState<string[]>([])
  const [newWorkstation, setNewWorkstation] = useState({
    name: "",
    type: "",
    location: "",
    capacity: 10
  })
  const [newOperator, setNewOperator] = useState({
    name: "",
    employeeId: "",
    position: "",
    shift: "Day"
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const steps = [
    { id: 1, title: "Template", description: "Choose a journey template" },
    { id: 2, title: "Details", description: "Configure journey details" },
    { id: 3, title: "Workstations", description: "Select or create workstations" },
    { id: 4, title: "Operators", description: "Assign operators" },
    { id: 5, title: "Review", description: "Review and create journey" }
  ]

  const progress = (currentStep / steps.length) * 100

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template)
    setJourneyData(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      type: template.name
    }))
    
    // Pre-select workstations based on template
    const templateWorkstations = workstations.filter(ws => 
      template.workstations.includes(ws.type)
    ).map(ws => ws.id)
    setSelectedWorkstations(templateWorkstations)
    
    // Pre-select operators based on template
    const availableOperators = operators.slice(0, template.operators).map(op => op.id)
    setSelectedOperators(availableOperators)
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const addCustomStep = () => {
    const newStep = {
      id: Date.now(),
      name: "",
      description: "",
      required: true
    }
    setJourneyData(prev => ({
      ...prev,
      customSteps: [...prev.customSteps, newStep]
    }))
  }

  const updateCustomStep = (index: number, field: string, value: string) => {
    setJourneyData(prev => ({
      ...prev,
      customSteps: prev.customSteps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }))
  }

  const removeCustomStep = (index: number) => {
    setJourneyData(prev => ({
      ...prev,
      customSteps: prev.customSteps.filter((_, i) => i !== index)
    }))
  }

  const addWorkstation = async () => {
    if (!newWorkstation.name || !newWorkstation.type || !newWorkstation.location) {
      alert("Please fill in all workstation fields")
      return
    }

    try {
      const workstationData = {
        name: newWorkstation.name,
        type: newWorkstation.type as "Cutting" | "Welding" | "Assembly" | "Quality Control" | "Packaging",
        location: newWorkstation.location,
        status: "Active" as const,
        efficiency: 85,
        lastMaintenance: new Date().toISOString().split('T')[0],
        nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        capacity: newWorkstation.capacity,
        utilization: 0
      }

      const createdWorkstation = createWorkstation(workstationData)
      setSelectedWorkstations(prev => [...prev, createdWorkstation.id])
      setNewWorkstation({ name: "", type: "", location: "", capacity: 10 })
      refreshWorkstations()
    } catch (error) {
      console.error("Error creating workstation:", error)
      alert("Failed to create workstation")
    }
  }

  const addOperator = async () => {
    if (!newOperator.name || !newOperator.employeeId || !newOperator.position) {
      alert("Please fill in all operator fields")
      return
    }

    try {
      const operatorData = {
        name: newOperator.name,
        employeeId: newOperator.employeeId,
        department: "Production",
        position: newOperator.position,
        skills: [],
        certifications: [],
        shift: newOperator.shift as "Day" | "Evening" | "Night",
        status: "Active" as const,
        efficiency: 90,
        totalHours: 0
      }

      const createdOperator = createOperator(operatorData)
      setSelectedOperators(prev => [...prev, createdOperator.id])
      setNewOperator({ name: "", employeeId: "", position: "", shift: "Day" })
      refreshOperators()
    } catch (error) {
      console.error("Error creating operator:", error)
      alert("Failed to create operator")
    }
  }

  const createJourney = async () => {
    if (!selectedTemplate || !journeyData.name || !journeyData.description) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      // Create the journey with all configured data
      const journey = {
        id: `J${String(Date.now()).slice(-3)}`,
        name: journeyData.name,
        description: journeyData.description,
        type: journeyData.type,
        status: "Planning",
        priority: journeyData.priority,
        progress: 0,
        totalWorkOrders: 0,
        completedWorkOrders: 0,
        startDate: journeyData.startDate || new Date().toISOString().split('T')[0],
        endDate: journeyData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdBy: "Current User",
        lastUpdated: new Date().toISOString(),
        steps: selectedTemplate.id === "custom" ? journeyData.customSteps : selectedTemplate.steps,
        metrics: {
          efficiency: 0,
          quality: 0,
          onTimeDelivery: 0
        },
        assignedWorkstations: selectedWorkstations,
        assignedOperators: selectedOperators
      }

      // In a real app, this would save to the database
      console.log("Created journey:", journey)
      
      alert("Journey created successfully!")
      const event = new CustomEvent('closeCreateJourney')
      window.dispatchEvent(event)
    } catch (error) {
      console.error("Error creating journey:", error)
      alert("Failed to create journey")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => {
            const event = new CustomEvent('closeCreateJourney')
            window.dispatchEvent(event)
          }}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Journeys
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Journey</h1>
            <p className="text-sm text-gray-600">Set up a new production workflow</p>
          </div>
        </div>
      </div>

      <div>
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Setup Progress</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps */}
        <div className="flex justify-center mb-8">
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
              {currentStep === 1 && <Target className="w-5 h-5" />}
              {currentStep === 2 && <Settings className="w-5 h-5" />}
              {currentStep === 3 && <Factory className="w-5 h-5" />}
              {currentStep === 4 && <Users className="w-5 h-5" />}
              {currentStep === 5 && <CheckCircle className="w-5 h-5" />}
              Step {currentStep}: {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Template Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">Choose a Journey Template</h3>
                  <p className="text-gray-600">Select a template that best fits your production needs</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {journeyTemplates.map((template) => (
                    <Card 
                      key={template.id} 
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {template.icon}
                            <div>
                              <CardTitle className="text-lg">{template.name}</CardTitle>
                              <Badge className={template.color}>{template.complexity}</Badge>
                            </div>
                          </div>
                          {selectedTemplate?.id === template.id && (
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Duration:</span>
                            <span>{template.estimatedDuration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Workstations:</span>
                            <span>{template.workstations.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Operators:</span>
                            <span>{template.operators}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Journey Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Journey Name *</Label>
                      <Input
                        id="name"
                        value={journeyData.name}
                        onChange={(e) => setJourneyData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter journey name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={journeyData.description}
                        onChange={(e) => setJourneyData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe the journey purpose and goals"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={journeyData.priority} onValueChange={(value) => setJourneyData(prev => ({ ...prev, priority: value }))}>
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
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={journeyData.startDate}
                        onChange={(e) => setJourneyData(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={journeyData.endDate}
                        onChange={(e) => setJourneyData(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                    {selectedTemplate && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">Template Information</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>Type: {selectedTemplate.name}</div>
                          <div>Duration: {selectedTemplate.estimatedDuration}</div>
                          <div>Complexity: {selectedTemplate.complexity}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom Steps for Custom Template */}
                {selectedTemplate?.id === "custom" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Custom Steps</h4>
                      <Button variant="outline" size="sm" onClick={addCustomStep}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Step
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {journeyData.customSteps.map((step, index) => (
                        <div key={step.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <Input
                              placeholder="Step name"
                              value={step.name}
                              onChange={(e) => updateCustomStep(index, "name", e.target.value)}
                            />
                            <Input
                              placeholder="Step description"
                              value={step.description}
                              onChange={(e) => updateCustomStep(index, "description", e.target.value)}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCustomStep(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Workstations */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Existing Workstations */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Select Existing Workstations</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {workstations.map((workstation: any) => (
                        <div key={workstation.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <input
                            type="checkbox"
                            id={workstation.id}
                            checked={selectedWorkstations.includes(workstation.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedWorkstations(prev => [...prev, workstation.id])
                              } else {
                                setSelectedWorkstations(prev => prev.filter(id => id !== workstation.id))
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <div className="flex-1">
                            <div className="font-medium">{workstation.name}</div>
                            <div className="text-sm text-gray-600 flex items-center gap-2">
                              <Badge variant="outline">{workstation.type}</Badge>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {workstation.location}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Create New Workstation */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Create New Workstation</h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="ws-name">Name</Label>
                        <Input
                          id="ws-name"
                          value={newWorkstation.name}
                          onChange={(e) => setNewWorkstation(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Workstation name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ws-type">Type</Label>
                        <Select value={newWorkstation.type} onValueChange={(value) => setNewWorkstation(prev => ({ ...prev, type: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cutting">Cutting</SelectItem>
                            <SelectItem value="Welding">Welding</SelectItem>
                            <SelectItem value="Assembly">Assembly</SelectItem>
                            <SelectItem value="Quality Control">Quality Control</SelectItem>
                            <SelectItem value="Packaging">Packaging</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="ws-location">Location</Label>
                        <Input
                          id="ws-location"
                          value={newWorkstation.location}
                          onChange={(e) => setNewWorkstation(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="Location"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ws-capacity">Capacity</Label>
                        <Input
                          id="ws-capacity"
                          type="number"
                          value={newWorkstation.capacity}
                          onChange={(e) => setNewWorkstation(prev => ({ ...prev, capacity: parseInt(e.target.value) || 10 }))}
                        />
                      </div>
                      <Button onClick={addWorkstation} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Workstation
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Operators */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Existing Operators */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Select Existing Operators</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {operators.map((operator: any) => (
                        <div key={operator.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <input
                            type="checkbox"
                            id={operator.id}
                            checked={selectedOperators.includes(operator.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedOperators(prev => [...prev, operator.id])
                              } else {
                                setSelectedOperators(prev => prev.filter(id => id !== operator.id))
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <div className="flex-1">
                            <div className="font-medium">{operator.name}</div>
                            <div className="text-sm text-gray-600 flex items-center gap-2">
                              <span>{operator.position}</span>
                              <Badge variant="outline">{operator.shift}</Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Create New Operator */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Create New Operator</h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="op-name">Name</Label>
                        <Input
                          id="op-name"
                          value={newOperator.name}
                          onChange={(e) => setNewOperator(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Operator name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="op-id">Employee ID</Label>
                        <Input
                          id="op-id"
                          value={newOperator.employeeId}
                          onChange={(e) => setNewOperator(prev => ({ ...prev, employeeId: e.target.value }))}
                          placeholder="Employee ID"
                        />
                      </div>
                      <div>
                        <Label htmlFor="op-position">Position</Label>
                        <Input
                          id="op-position"
                          value={newOperator.position}
                          onChange={(e) => setNewOperator(prev => ({ ...prev, position: e.target.value }))}
                          placeholder="Position"
                        />
                      </div>
                      <div>
                        <Label htmlFor="op-shift">Shift</Label>
                        <Select value={newOperator.shift} onValueChange={(value) => setNewOperator(prev => ({ ...prev, shift: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Day">Day</SelectItem>
                            <SelectItem value="Evening">Evening</SelectItem>
                            <SelectItem value="Night">Night</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={addOperator} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Operator
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Journey Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="text-sm font-medium">Name:</span>
                        <p className="text-sm text-gray-600">{journeyData.name}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Description:</span>
                        <p className="text-sm text-gray-600">{journeyData.description}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Type:</span>
                        <p className="text-sm text-gray-600">{journeyData.type}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Priority:</span>
                        <Badge variant="outline">{journeyData.priority}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Selected Resources</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="text-sm font-medium">Workstations ({selectedWorkstations.length}):</span>
                        <div className="text-sm text-gray-600">
                          {selectedWorkstations.map(id => {
                            const ws = workstations.find((w: any) => w.id === id)
                            return ws ? `${ws.name} (${ws.type})` : id
                          }).join(", ")}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Operators ({selectedOperators.length}):</span>
                        <div className="text-sm text-gray-600">
                          {selectedOperators.map(id => {
                            const op = operators.find((o: any) => o.id === id)
                            return op ? `${op.name} (${op.position})` : id
                          }).join(", ")}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {selectedTemplate && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Journey Steps</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {(selectedTemplate.id === "custom" ? journeyData.customSteps : selectedTemplate.steps).map((step: any, index: number) => (
                          <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{step.name}</div>
                              <div className="text-sm text-gray-600">{step.description}</div>
                            </div>
                            {step.required && (
                              <Badge variant="outline">Required</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          {currentStep < steps.length ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={createJourney} disabled={isSubmitting}>
              <CheckCircle className="w-4 h-4 mr-2" />
              {isSubmitting ? "Creating..." : "Create Journey"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
