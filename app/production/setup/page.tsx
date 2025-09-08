"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Factory,
  Users,
  Settings,
  Plus,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Wrench,
  CheckSquare
} from "lucide-react"
import { useDatabaseContext } from "@/components/database-provider"
import { useRouter } from "next/navigation"

export default function ShopfloorSetupPage() {
  const {
    workstations = [],
    operators = [],
    createWorkstation,
    createOperator,
    refreshWorkstations,
    refreshOperators
  } = useDatabaseContext()
  const router = useRouter()

  const [currentStep, setCurrentStep] = useState(1)
  const [setupData, setSetupData] = useState<{
    workstations: any[]
    operators: any[]
  }>({
    workstations: [],
    operators: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const workstationTypes = [
    { value: "Cutting", label: "Cutting Station", icon: <Wrench className="w-4 h-4" /> },
    { value: "Welding", label: "Welding Station", icon: <Factory className="w-4 h-4" /> },
    { value: "Assembly", label: "Assembly Line", icon: <Users className="w-4 h-4" /> },
    { value: "Quality Control", label: "Quality Control", icon: <CheckSquare className="w-4 h-4" /> },
    { value: "Packaging", label: "Packaging Station", icon: <Factory className="w-4 h-4" /> }
  ]

  const steps = [
    { id: 1, title: "Workstations", description: "Configure production workstations" },
    { id: 2, title: "Operators", description: "Set up operator profiles and skills" },
    { id: 3, title: "Review", description: "Review and finalize setup" }
  ]

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
    skills: [],
    shift: "Day"
  })

  const addWorkstation = async () => {
    // Clear previous errors
    setErrors({})

    // Validate form
    const newErrors: { [key: string]: string } = {}
    if (!newWorkstation.name.trim()) newErrors.name = "Workstation name is required"
    if (!newWorkstation.type) newErrors.type = "Workstation type is required"
    if (!newWorkstation.location.trim()) newErrors.location = "Location is required"
    if (newWorkstation.capacity <= 0) newErrors.capacity = "Capacity must be greater than 0"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
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

      setSetupData(prev => ({
        ...prev,
        workstations: [...prev.workstations, createdWorkstation]
      }))

      setNewWorkstation({ name: "", type: "", location: "", capacity: 10 })

      // Refresh the workstations list
      refreshWorkstations()
    } catch (error) {
      console.error("Error creating workstation:", error)
      alert("Failed to create workstation. Please try again.")
    }
  }

  const addOperator = async () => {
    // Clear previous errors
    setErrors({})

    // Validate form
    const newErrors: { [key: string]: string } = {}
    if (!newOperator.name.trim()) newErrors.operatorName = "Operator name is required"
    if (!newOperator.employeeId.trim()) newErrors.employeeId = "Employee ID is required"
    if (!newOperator.position.trim()) newErrors.position = "Position is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      const operatorData = {
        name: newOperator.name,
        employeeId: newOperator.employeeId,
        department: "Production",
        position: newOperator.position,
        skills: newOperator.skills,
        certifications: [],
        shift: newOperator.shift as "Day" | "Evening" | "Night",
        status: "Active" as const,
        efficiency: 90,
        totalHours: 0
      }

      const createdOperator = createOperator(operatorData)

      setSetupData(prev => ({
        ...prev,
        operators: [...prev.operators, createdOperator]
      }))

      setNewOperator({ name: "", employeeId: "", position: "", skills: [], shift: "Day" })

      // Refresh the operators list
      refreshOperators()
    } catch (error) {
      console.error("Error creating operator:", error)
      alert("Failed to create operator. Please try again.")
    }
  }

  const completeSetup = async () => {
    setIsSubmitting(true)
    try {
      // Save all workstations to database
      for (const workstation of setupData.workstations) {
        await createWorkstation(workstation)
      }
      
      // Save all operators to database
      for (const operator of setupData.operators) {
        await createOperator(operator)
      }
      
      // Refresh the data
      await refreshWorkstations()
      await refreshOperators()
      
      alert("Shopfloor setup completed successfully!")
      router.push('/production/journeys')
    } catch (error) {
      console.error("Error completing setup:", error)
      alert("Failed to complete setup. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = (currentStep / steps.length) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Shopfloor Setup</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Configure your production workstations and operators for optimal efficiency
        </p>

        {/* Progress */}
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Setup Progress</span>
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
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                {currentStep > step.id ? <CheckCircle className="w-4 h-4" /> : step.id}
              </div>
              <div className="ml-2">
                <div className={`text-sm font-medium ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-600'
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Add New Workstation</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="workstation-name">Workstation Name</Label>
                      <Input
                        id="workstation-name"
                        placeholder="e.g., CNC Plasma Cutter #1"
                        value={newWorkstation.name}
                        onChange={(e) => setNewWorkstation(prev => ({ ...prev, name: e.target.value }))}
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <Label htmlFor="workstation-type">Type</Label>
                      <Select value={newWorkstation.type} onValueChange={(value) => setNewWorkstation(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select workstation type" />
                        </SelectTrigger>
                        <SelectContent>
                          {workstationTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                {type.icon}
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
                    </div>
                    <div>
                      <Label htmlFor="workstation-location">Location</Label>
                      <Input
                        id="workstation-location"
                        placeholder="e.g., Shop Floor A - Bay 1"
                        value={newWorkstation.location}
                        onChange={(e) => setNewWorkstation(prev => ({ ...prev, location: e.target.value }))}
                        className={errors.location ? "border-red-500" : ""}
                      />
                      {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                    </div>
                    <div>
                      <Label htmlFor="workstation-capacity">Capacity (units/hour)</Label>
                      <Input
                        id="workstation-capacity"
                        type="number"
                        value={newWorkstation.capacity}
                        onChange={(e) => setNewWorkstation(prev => ({ ...prev, capacity: parseInt(e.target.value) || 10 }))}
                        className={errors.capacity ? "border-red-500" : ""}
                      />
                      {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>}
                    </div>
                    <Button onClick={addWorkstation} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Workstation
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Configured Workstations</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {setupData.workstations.map((workstation, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{workstation.name}</div>
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {workstation.location}
                            </div>
                          </div>
                          <Badge variant="outline">{workstation.type}</Badge>
                        </div>
                      </div>
                    ))}
                    {setupData.workstations.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No workstations configured yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Operators */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Add New Operator</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="operator-name">Operator Name</Label>
                      <Input
                        id="operator-name"
                        placeholder="e.g., Mike Johnson"
                        value={newOperator.name}
                        onChange={(e) => setNewOperator(prev => ({ ...prev, name: e.target.value }))}
                        className={errors.operatorName ? "border-red-500" : ""}
                      />
                      {errors.operatorName && <p className="text-red-500 text-sm mt-1">{errors.operatorName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="operator-id">Employee ID</Label>
                      <Input
                        id="operator-id"
                        placeholder="e.g., EMP001"
                        value={newOperator.employeeId}
                        onChange={(e) => setNewOperator(prev => ({ ...prev, employeeId: e.target.value }))}
                        className={errors.employeeId ? "border-red-500" : ""}
                      />
                      {errors.employeeId && <p className="text-red-500 text-sm mt-1">{errors.employeeId}</p>}
                    </div>
                    <div>
                      <Label htmlFor="operator-position">Position</Label>
                      <Input
                        id="operator-position"
                        placeholder="e.g., CNC Operator"
                        value={newOperator.position}
                        onChange={(e) => setNewOperator(prev => ({ ...prev, position: e.target.value }))}
                        className={errors.position ? "border-red-500" : ""}
                      />
                      {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
                    </div>
                    <div>
                      <Label htmlFor="operator-shift">Shift</Label>
                      <Select value={newOperator.shift} onValueChange={(value) => setNewOperator(prev => ({ ...prev, shift: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Day">Day Shift</SelectItem>
                          <SelectItem value="Evening">Evening Shift</SelectItem>
                          <SelectItem value="Night">Night Shift</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={addOperator} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Operator
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Configured Operators</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {setupData.operators.map((operator, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{operator.name}</div>
                            <div className="text-sm text-gray-600">
                              {operator.position} • {operator.employeeId}
                            </div>
                          </div>
                          <Badge variant="outline">{operator.shift}</Badge>
                        </div>
                      </div>
                    ))}
                    {setupData.operators.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No operators configured yet
                      </div>
                    )}
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
                    <CardTitle className="flex items-center gap-2">
                      <Factory className="w-5 h-5" />
                      Workstations ({setupData.workstations.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {setupData.workstations.map((workstation, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="font-medium">{workstation.name}</span>
                          <Badge variant="outline">{workstation.type}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Operators ({setupData.operators.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {setupData.operators.map((operator, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="font-medium">{operator.name}</span>
                          <Badge variant="outline">{operator.shift}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold">Ready to Start Production?</h3>
                <p className="text-gray-600">
                  Your shopfloor is configured with {setupData.workstations.length} workstations and {setupData.operators.length} operators.
                </p>
                <Button
                  size="lg"
                  className="w-full max-w-md"
                  onClick={completeSetup}
                  disabled={isSubmitting}
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {isSubmitting ? "Completing Setup..." : "Complete Setup & Start Production"}
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
