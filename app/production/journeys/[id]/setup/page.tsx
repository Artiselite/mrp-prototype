"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
// import { Checkbox } from "@/components/ui/checkbox"
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
  Play,
  AlertTriangle
} from "lucide-react"
import { useDatabaseContext } from "@/components/database-provider"
import { useRouter } from "next/navigation"

export default function JourneySetupPage({ params }: { params: Promise<{ id: string }> }) {
  const { 
    workstations = [], 
    operators = [], 
    productionWorkOrders: workOrders = [],
    createWorkstation,
    createOperator,
    refreshWorkstations,
    refreshOperators
  } = useDatabaseContext()
  const router = useRouter()

  const [journeyId, setJourneyId] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [journey, setJourney] = useState<any>(null)
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

  // Resolve the async params
  useEffect(() => {
    params.then(({ id }) => {
      setJourneyId(id)
    })
  }, [params])

  // Mock journey data - in a real app, this would come from the database
  useEffect(() => {
    if (journeyId) {
      // Mock journey data
      const mockJourney = {
        id: journeyId,
        name: "Standard Production",
        description: "Standard manufacturing workflow for regular orders",
        type: "Standard",
        status: "Planning",
        priority: "Medium",
        progress: 0,
        totalWorkOrders: 0,
        completedWorkOrders: 0,
        startDate: "2024-01-15",
        endDate: "2024-02-15",
        createdBy: "John Smith",
        lastUpdated: "2024-01-20T10:30:00Z",
        steps: [
          { id: 1, name: "Setup", status: "in-progress", description: "Configure workstations and operators" },
          { id: 2, name: "Planning", status: "pending", description: "Create work orders and assign resources" },
          { id: 3, name: "Production", status: "pending", description: "Execute production workflow" },
          { id: 4, name: "Quality", status: "pending", description: "Perform quality inspections" },
          { id: 5, name: "Completion", status: "pending", description: "Finalize and deliver" }
        ],
        metrics: {
          efficiency: 0,
          quality: 0,
          onTimeDelivery: 0
        }
      }
      setJourney(mockJourney)
    }
  }, [journeyId])

  const steps = [
    { id: 1, title: "Workstations", description: "Configure production workstations" },
    { id: 2, title: "Operators", description: "Assign operators to the journey" },
    { id: 3, title: "Review", description: "Review setup and start journey" }
  ]

  const progress = (currentStep / steps.length) * 100

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

  const completeSetup = async () => {
    if (selectedWorkstations.length === 0 || selectedOperators.length === 0) {
      alert("Please select at least one workstation and one operator")
      return
    }

    setIsSubmitting(true)
    try {
      // Update journey with selected resources
      const updatedJourney = {
        ...journey,
        assignedWorkstations: selectedWorkstations,
        assignedOperators: selectedOperators,
        status: "Active",
        steps: journey.steps.map((step: any) => 
          step.name === "Setup" ? { ...step, status: "completed" } : step
        )
      }

      // In a real app, this would update the database
      console.log("Updated journey:", updatedJourney)
      
      alert("Journey setup completed successfully!")
      router.push('/production/journeys')
    } catch (error) {
      console.error("Error completing setup:", error)
      alert("Failed to complete setup")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!journey) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Loading journey...</p>
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
              <Button variant="ghost" size="sm" onClick={() => router.push('/production/journeys')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Journeys
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Setup Journey</h1>
                <p className="text-sm text-gray-600">{journey.name}</p>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-800">{journey.status}</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Journey Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Journey Overview</CardTitle>
            <CardDescription>{journey.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Type</span>
                <p className="text-sm">{journey.type}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Priority</span>
                <Badge variant="outline">{journey.priority}</Badge>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Start Date</span>
                <p className="text-sm">{journey.startDate}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">End Date</span>
                <p className="text-sm">{journey.endDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

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
              {currentStep === 1 && <Factory className="w-5 h-5" />}
              {currentStep === 2 && <Users className="w-5 h-5" />}
              {currentStep === 3 && <CheckCircle className="w-5 h-5" />}
              Step {currentStep}: {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Workstations */}
            {currentStep === 1 && (
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

            {/* Step 2: Operators */}
            {currentStep === 2 && (
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

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Selected Workstations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedWorkstations.length > 0 ? (
                        <div className="space-y-2">
                          {selectedWorkstations.map(id => {
                            const ws = workstations.find((w: any) => w.id === id)
                            return ws ? (
                              <div key={id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                <Factory className="w-4 h-4 text-gray-500" />
                                <div>
                                  <div className="font-medium">{ws.name}</div>
                                  <div className="text-sm text-gray-600">{ws.type} • {ws.location}</div>
                                </div>
                              </div>
                            ) : null
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                          <p>No workstations selected</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Selected Operators</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedOperators.length > 0 ? (
                        <div className="space-y-2">
                          {selectedOperators.map(id => {
                            const op = operators.find((o: any) => o.id === id)
                            return op ? (
                              <div key={id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                <User className="w-4 h-4 text-gray-500" />
                                <div>
                                  <div className="font-medium">{op.name}</div>
                                  <div className="text-sm text-gray-600">{op.position} • {op.shift}</div>
                                </div>
                              </div>
                            ) : null
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                          <p>No operators selected</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Journey Steps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {journey.steps.map((step: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                            step.status === "completed" ? "bg-green-100 text-green-600" :
                            step.status === "in-progress" ? "bg-blue-100 text-blue-600" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {step.status === "completed" ? <CheckCircle className="w-4 h-4" /> : index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{step.name}</div>
                            <div className="text-sm text-gray-600">{step.description}</div>
                          </div>
                          <Badge className={
                            step.status === "completed" ? "bg-green-100 text-green-800" :
                            step.status === "in-progress" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                          }>
                            {step.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
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
            <Button onClick={completeSetup} disabled={isSubmitting}>
              <Play className="w-4 h-4 mr-2" />
              {isSubmitting ? "Completing Setup..." : "Complete Setup & Start Journey"}
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}
