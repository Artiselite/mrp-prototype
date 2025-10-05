"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Wrench,
  ArrowLeft,
  Save,
  Plus,
  X,
  Calendar,
  DollarSign,
  Users,
  Building,
  FileText,
  Target,
  Shield,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { useDatabaseContext } from "@/components/database-provider"
import { useRouter } from "next/navigation"

export default function CreateSubcontractorWorkOrderPage() {
  const router = useRouter()
  const { 
    suppliers = [],
    engineeringProjects = [],
    projectSubcontractors = [],
    createSubcontractorWorkOrder 
  } = useDatabaseContext()

  const [formData, setFormData] = useState({
    projectId: "",
    projectSubcontractorId: "",
    supplierId: "",
    workOrderNumber: "",
    workDescription: "",
    workType: "Fabrication" as const,
    priority: "Medium" as const,
    estimatedCost: "",
    estimatedDuration: "",
    startDate: "",
    dueDate: "",
    specifications: "",
    deliverables: [] as string[],
    qualityRequirements: [] as string[],
    safetyRequirements: [] as string[],
    materialsProvided: [] as string[],
    materialsRequired: [] as string[],
    toolsRequired: [] as string[],
    specialInstructions: "",
    assignedTo: "",
    notes: ""
  })

  const [newDeliverable, setNewDeliverable] = useState("")
  const [newQualityReq, setNewQualityReq] = useState("")
  const [newSafetyReq, setNewSafetyReq] = useState("")
  const [newMaterialProvided, setNewMaterialProvided] = useState("")
  const [newMaterialRequired, setNewMaterialRequired] = useState("")
  const [newToolRequired, setNewToolRequired] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addToList = (listField: string, value: string, setter: (value: string) => void) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [listField]: [...prev[listField as keyof typeof prev] as string[], value.trim()]
      }))
      setter("")
    }
  }

  const removeFromList = (listField: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [listField]: (prev[listField as keyof typeof prev] as string[]).filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const workOrderData = {
        ...formData,
        estimatedCost: parseFloat(formData.estimatedCost) || 0,
        estimatedDuration: parseInt(formData.estimatedDuration) || 0,
        actualCost: 0,
        actualDuration: 0,
        progress: 0,
        status: "Draft" as const,
        createdBy: "Current User", // In a real app, this would come from auth context
        assignedTo: formData.assignedTo || "Unassigned",
        supplierName: selectedSupplier?.name || "Unknown Supplier"
      }

      const newWorkOrder = createSubcontractorWorkOrder(workOrderData)
      
      if (newWorkOrder) {
        router.push(`/production/subcontractor-work-orders/${newWorkOrder.id}`)
      }
    } catch (error) {
      console.error("Error creating work order:", error)
    }
  }

  const selectedProject = engineeringProjects.find((p: any) => p.id === formData.projectId)
  const selectedSupplier = suppliers.find((s: any) => s.id === formData.supplierId)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link href="/production/subcontractor-work-orders">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Work Orders
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Wrench className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Create Subcontractor Work Order</h1>
                  <p className="text-sm text-gray-600">Create a new work order for subcontractor services</p>
                </div>
              </div>
            </div>
            <Button onClick={handleSubmit} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Create Work Order
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="workOrderNumber">Work Order Number</Label>
                      <Input
                        id="workOrderNumber"
                        value={formData.workOrderNumber}
                        onChange={(e) => handleInputChange("workOrderNumber", e.target.value)}
                        placeholder="WO-SUB-001"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="workType">Work Type</Label>
                      <Select value={formData.workType} onValueChange={(value) => handleInputChange("workType", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fabrication">Fabrication</SelectItem>
                          <SelectItem value="Assembly">Assembly</SelectItem>
                          <SelectItem value="Welding">Welding</SelectItem>
                          <SelectItem value="Machining">Machining</SelectItem>
                          <SelectItem value="Coating">Coating</SelectItem>
                          <SelectItem value="Testing">Testing</SelectItem>
                          <SelectItem value="Installation">Installation</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="workDescription">Work Description</Label>
                    <Textarea
                      id="workDescription"
                      value={formData.workDescription}
                      onChange={(e) => handleInputChange("workDescription", e.target.value)}
                      placeholder="Describe the work to be performed..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
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
                      <Label htmlFor="assignedTo">Assigned To</Label>
                      <Input
                        id="assignedTo"
                        value={formData.assignedTo}
                        onChange={(e) => handleInputChange("assignedTo", e.target.value)}
                        placeholder="Project Manager Name"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Project and Supplier Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Project & Supplier</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="projectId">Project</Label>
                      <Select value={formData.projectId} onValueChange={(value) => handleInputChange("projectId", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                        <SelectContent>
                          {engineeringProjects.map((project: any) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="supplierId">Subcontractor</Label>
                      <Select value={formData.supplierId} onValueChange={(value) => handleInputChange("supplierId", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subcontractor" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((supplier: any) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cost and Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle>Cost & Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="estimatedCost">Estimated Cost</Label>
                      <Input
                        id="estimatedCost"
                        type="number"
                        value={formData.estimatedCost}
                        onChange={(e) => handleInputChange("estimatedCost", e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <Label htmlFor="estimatedDuration">Estimated Duration (days)</Label>
                      <Input
                        id="estimatedDuration"
                        type="number"
                        value={formData.estimatedDuration}
                        onChange={(e) => handleInputChange("estimatedDuration", e.target.value)}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange("startDate", e.target.value)}
                      />
                    </div>
                    <div>
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

              {/* Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Specifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="specifications">Technical Specifications</Label>
                    <Textarea
                      id="specifications"
                      value={formData.specifications}
                      onChange={(e) => handleInputChange("specifications", e.target.value)}
                      placeholder="Detailed technical specifications..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="specialInstructions">Special Instructions</Label>
                    <Textarea
                      id="specialInstructions"
                      value={formData.specialInstructions}
                      onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
                      placeholder="Any special instructions or requirements..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Deliverables */}
              <Card>
                <CardHeader>
                  <CardTitle>Deliverables</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newDeliverable}
                      onChange={(e) => setNewDeliverable(e.target.value)}
                      placeholder="Add deliverable..."
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addToList("deliverables", newDeliverable, setNewDeliverable))}
                    />
                    <Button
                      type="button"
                      onClick={() => addToList("deliverables", newDeliverable, setNewDeliverable)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.deliverables.map((deliverable, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {deliverable}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeFromList("deliverables", index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Quality Requirements */}
                  <div>
                    <Label>Quality Requirements</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={newQualityReq}
                        onChange={(e) => setNewQualityReq(e.target.value)}
                        placeholder="Add quality requirement..."
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addToList("qualityRequirements", newQualityReq, setNewQualityReq))}
                      />
                      <Button
                        type="button"
                        onClick={() => addToList("qualityRequirements", newQualityReq, setNewQualityReq)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.qualityRequirements.map((req, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {req}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => removeFromList("qualityRequirements", index)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Safety Requirements */}
                  <div>
                    <Label>Safety Requirements</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={newSafetyReq}
                        onChange={(e) => setNewSafetyReq(e.target.value)}
                        placeholder="Add safety requirement..."
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addToList("safetyRequirements", newSafetyReq, setNewSafetyReq))}
                      />
                      <Button
                        type="button"
                        onClick={() => addToList("safetyRequirements", newSafetyReq, setNewSafetyReq)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.safetyRequirements.map((req, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {req}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => removeFromList("safetyRequirements", index)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Materials and Tools */}
              <Card>
                <CardHeader>
                  <CardTitle>Materials & Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Materials Provided */}
                  <div>
                    <Label>Materials Provided</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={newMaterialProvided}
                        onChange={(e) => setNewMaterialProvided(e.target.value)}
                        placeholder="Add material provided..."
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addToList("materialsProvided", newMaterialProvided, setNewMaterialProvided))}
                      />
                      <Button
                        type="button"
                        onClick={() => addToList("materialsProvided", newMaterialProvided, setNewMaterialProvided)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.materialsProvided.map((material, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {material}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => removeFromList("materialsProvided", index)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Materials Required */}
                  <div>
                    <Label>Materials Required</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={newMaterialRequired}
                        onChange={(e) => setNewMaterialRequired(e.target.value)}
                        placeholder="Add material required..."
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addToList("materialsRequired", newMaterialRequired, setNewMaterialRequired))}
                      />
                      <Button
                        type="button"
                        onClick={() => addToList("materialsRequired", newMaterialRequired, setNewMaterialRequired)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.materialsRequired.map((material, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {material}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => removeFromList("materialsRequired", index)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Tools Required */}
                  <div>
                    <Label>Tools Required</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={newToolRequired}
                        onChange={(e) => setNewToolRequired(e.target.value)}
                        placeholder="Add tool required..."
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addToList("toolsRequired", newToolRequired, setNewToolRequired))}
                      />
                      <Button
                        type="button"
                        onClick={() => addToList("toolsRequired", newToolRequired, setNewToolRequired)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.toolsRequired.map((tool, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {tool}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => removeFromList("toolsRequired", index)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Any additional notes or comments..."
                    rows={3}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Summary */}
              {selectedProject && (
                <Card>
                  <CardHeader>
                    <CardTitle>Project Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Project Name</p>
                      <p className="font-medium">{selectedProject?.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Customer</p>
                      <p className="font-medium">{selectedProject?.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Project ID</p>
                      <p className="font-mono text-sm">{selectedProject?.id}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Supplier Summary */}
              {selectedSupplier && (
                <Card>
                  <CardHeader>
                    <CardTitle>Subcontractor Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Company Name</p>
                      <p className="font-medium">{selectedSupplier.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact Person</p>
                      <p className="font-medium">{selectedSupplier.contactPerson}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedSupplier.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{selectedSupplier.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Rating</p>
                      <Badge className="bg-green-100 text-green-800">
                        {selectedSupplier.rating}/5
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Form Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Form Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Work Type</p>
                      <p className="font-medium">{formData.workType}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Priority</p>
                      <p className="font-medium">{formData.priority}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Estimated Cost</p>
                      <p className="font-medium">${formData.estimatedCost || "0"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Duration</p>
                      <p className="font-medium">{formData.estimatedDuration || "0"} days</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="text-sm">
                    <p className="text-gray-500">Deliverables</p>
                    <p className="font-medium">{formData.deliverables.length} items</p>
                  </div>
                  
                  <div className="text-sm">
                    <p className="text-gray-500">Requirements</p>
                    <p className="font-medium">
                      {formData.qualityRequirements.length + formData.safetyRequirements.length} items
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
