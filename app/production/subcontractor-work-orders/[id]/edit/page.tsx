"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
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
  Tool,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { useDatabaseContext } from "@/components/database-provider"
import { useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import { use } from "react"

interface EditSubcontractorWorkOrderPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditSubcontractorWorkOrderPage({ params }: EditSubcontractorWorkOrderPageProps) {
  const unwrappedParams = use(params) as { id: string }
  const router = useRouter()
  const { 
    subcontractorWorkOrders = [],
    suppliers = [],
    engineeringProjects = [],
    updateSubcontractorWorkOrder 
  } = useDatabaseContext()

  const workOrder = subcontractorWorkOrders.find((wo) => wo.id === unwrappedParams.id)

  if (!workOrder) {
    notFound()
  }

  const [formData, setFormData] = useState({
    workOrderNumber: workOrder.workOrderNumber,
    workDescription: workOrder.workDescription,
    workType: workOrder.workType,
    priority: workOrder.priority,
    status: workOrder.status,
    estimatedCost: workOrder.estimatedCost.toString(),
    actualCost: workOrder.actualCost.toString(),
    estimatedDuration: workOrder.estimatedDuration.toString(),
    actualDuration: workOrder.actualDuration.toString(),
    startDate: workOrder.startDate,
    dueDate: workOrder.dueDate,
    completionDate: workOrder.completionDate || "",
    progress: workOrder.progress.toString(),
    specifications: workOrder.specifications,
    deliverables: workOrder.deliverables,
    qualityRequirements: workOrder.qualityRequirements,
    safetyRequirements: workOrder.safetyRequirements,
    materialsProvided: workOrder.materialsProvided,
    materialsRequired: workOrder.materialsRequired,
    toolsRequired: workOrder.toolsRequired,
    specialInstructions: workOrder.specialInstructions,
    assignedTo: workOrder.assignedTo,
    notes: workOrder.notes || ""
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
      const updateData = {
        ...formData,
        estimatedCost: parseFloat(formData.estimatedCost) || 0,
        actualCost: parseFloat(formData.actualCost) || 0,
        estimatedDuration: parseInt(formData.estimatedDuration) || 0,
        actualDuration: parseInt(formData.actualDuration) || 0,
        progress: parseInt(formData.progress) || 0,
        updatedAt: new Date().toISOString()
      }

      const updatedWorkOrder = updateSubcontractorWorkOrder(workOrder.id, updateData)
      
      if (updatedWorkOrder) {
        router.push(`/production/subcontractor-work-orders/${workOrder.id}`)
      }
    } catch (error) {
      console.error("Error updating work order:", error)
    }
  }

  const handleStatusUpdate = (newStatus: string) => {
    const updateData = {
      status: newStatus as any,
      updatedAt: new Date().toISOString()
    }

    if (newStatus === "Completed") {
      updateData.completionDate = new Date().toISOString().split('T')[0]
      updateData.progress = "100"
    }

    updateSubcontractorWorkOrder(workOrder.id, updateData)
    setFormData(prev => ({ ...prev, ...updateData }))
  }

  const handleProgressUpdate = (newProgress: number) => {
    const updateData = {
      progress: newProgress.toString(),
      updatedAt: new Date().toISOString()
    }

    if (newProgress === 100) {
      updateData.status = "Completed"
      updateData.completionDate = new Date().toISOString().split('T')[0]
    }

    updateSubcontractorWorkOrder(workOrder.id, updateData)
    setFormData(prev => ({ ...prev, ...updateData }))
  }

  const selectedProject = engineeringProjects.find((p: any) => p.id === workOrder.projectId)
  const selectedSupplier = suppliers.find(s => s.id === workOrder.supplierId)

  const getStatusColor = (status: string) => {
    const colors = {
      Draft: "bg-gray-100 text-gray-800",
      Sent: "bg-blue-100 text-blue-800",
      Acknowledged: "bg-yellow-100 text-yellow-800",
      "In Progress": "bg-purple-100 text-purple-800",
      Completed: "bg-green-100 text-green-800",
      "On Hold": "bg-orange-100 text-orange-800",
      Cancelled: "bg-red-100 text-red-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link href={`/production/subcontractor-work-orders/${workOrder.id}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Work Order
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Wrench className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Edit Work Order</h1>
                  <p className="text-sm text-gray-600">{workOrder.workOrderNumber}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(formData.status)}>{formData.status}</Badge>
              <Button onClick={handleSubmit} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status and Progress Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Status & Progress Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Sent">Sent</SelectItem>
                          <SelectItem value="Acknowledged">Acknowledged</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="On Hold">On Hold</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="progress">Progress (%)</Label>
                      <Input
                        id="progress"
                        type="number"
                        value={formData.progress}
                        onChange={(e) => handleInputChange("progress", e.target.value)}
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Progress Bar</span>
                      <span className="text-sm font-medium">{formData.progress}%</span>
                    </div>
                    <Progress value={parseInt(formData.progress)} className="h-3" />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => handleProgressUpdate(Math.max(0, parseInt(formData.progress) - 10))}
                    >
                      -10%
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => handleProgressUpdate(Math.min(100, parseInt(formData.progress) + 10))}
                    >
                      +10%
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => handleProgressUpdate(100)}
                    >
                      Complete
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStatusUpdate("Sent")}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Send to Subcontractor
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStatusUpdate("In Progress")}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Mark In Progress
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStatusUpdate("On Hold")}
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Put On Hold
                    </Button>
                  </div>
                </CardContent>
              </Card>

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
                      />
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
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <Label htmlFor="actualCost">Actual Cost</Label>
                      <Input
                        id="actualCost"
                        type="number"
                        value={formData.actualCost}
                        onChange={(e) => handleInputChange("actualCost", e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="estimatedDuration">Estimated Duration (days)</Label>
                      <Input
                        id="estimatedDuration"
                        type="number"
                        value={formData.estimatedDuration}
                        onChange={(e) => handleInputChange("estimatedDuration", e.target.value)}
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="actualDuration">Actual Duration (days)</Label>
                      <Input
                        id="actualDuration"
                        type="number"
                        value={formData.actualDuration}
                        onChange={(e) => handleInputChange("actualDuration", e.target.value)}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <div>
                      <Label htmlFor="completionDate">Completion Date</Label>
                      <Input
                        id="completionDate"
                        type="date"
                        value={formData.completionDate}
                        onChange={(e) => handleInputChange("completionDate", e.target.value)}
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
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="specialInstructions">Special Instructions</Label>
                    <Textarea
                      id="specialInstructions"
                      value={formData.specialInstructions}
                      onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
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
                      <p className="font-medium">{selectedProject.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Customer</p>
                      <p className="font-medium">{selectedProject.customer}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Project ID</p>
                      <p className="font-mono text-sm">{selectedProject.id}</p>
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

              {/* Cost Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Cost Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Estimated</p>
                      <p className="font-medium">${formData.estimatedCost || "0"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Actual</p>
                      <p className="font-medium">${formData.actualCost || "0"}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="text-sm">
                    <p className="text-gray-500">Variance</p>
                    <p className={`font-medium ${parseFloat(formData.actualCost) <= parseFloat(formData.estimatedCost) ? 'text-green-600' : 'text-red-600'}`}>
                      ${(parseFloat(formData.actualCost) - parseFloat(formData.estimatedCost)).toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="text-sm">
                    <p className="text-gray-500">Progress</p>
                    <p className="font-medium">{formData.progress}%</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleStatusUpdate("Completed")}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Completed
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleProgressUpdate(100)}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Set 100% Progress
                  </Button>
                  <Link href={`/production/subcontractor-work-orders/${workOrder.id}`} className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
