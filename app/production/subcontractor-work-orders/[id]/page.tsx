"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import {
  Wrench,
  ArrowLeft,
  Edit,
  Calendar,
  DollarSign,
  Truck,
  AlertTriangle,
  Building,
  Phone,
  Mail,
  MapPin,
  FileText,
  Package,
  Calculator,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  Shield,
  Settings,
  Download,
  Send,
  Eye,
  Plus,
} from "lucide-react"
import Link from "next/link"
import { useDatabaseContext } from "@/components/database-provider"
import { formatCurrency } from "@/lib/data"
import { notFound } from "next/navigation"
import { use } from "react"
import SubcontractorIntegration from "@/components/subcontractor-integration"

interface SubcontractorWorkOrderDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function SubcontractorWorkOrderDetailPage({ params }: SubcontractorWorkOrderDetailPageProps) {
  const unwrappedParams = use(params) as { id: string }
  const { 
    subcontractorWorkOrders, 
    suppliers, 
    engineeringProjects,
    projectSubcontractors,
    updateSubcontractorWorkOrder 
  } = useDatabaseContext()
  
  const workOrder = subcontractorWorkOrders.find((wo) => wo.id === unwrappedParams.id)

  if (!workOrder) {
    notFound()
  }

  const supplier = suppliers.find((s) => s.id === workOrder.supplierId)
  const project = engineeringProjects.find((p) => p.id === workOrder.projectId)
  const projectSubcontractor = projectSubcontractors.find((ps) => ps.id === workOrder.projectSubcontractorId)
  
  const [showUnitEconomics, setShowUnitEconomics] = useState(false)

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "Critical":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "High":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case "Medium":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "Low":
        return <AlertTriangle className="w-4 h-4 text-green-500" />
      default:
        return null
    }
  }

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

  const getWorkTypeIcon = (workType: string) => {
    switch (workType) {
      case "Fabrication":
        return <Wrench className="w-4 h-4 text-blue-500" />
      case "Assembly":
        return <Settings className="w-4 h-4 text-green-500" />
      case "Welding":
        return <Wrench className="w-4 h-4 text-orange-500" />
      case "Machining":
        return <Settings className="w-4 h-4 text-purple-500" />
      case "Coating":
        return <Shield className="w-4 h-4 text-cyan-500" />
      case "Testing":
        return <CheckCircle className="w-4 h-4 text-indigo-500" />
      case "Installation":
        return <Target className="w-4 h-4 text-pink-500" />
      default:
        return <Wrench className="w-4 h-4 text-gray-500" />
    }
  }

  const handleStatusUpdate = (newStatus: string) => {
    updateSubcontractorWorkOrder(workOrder.id, { 
      status: newStatus as any,
      updatedAt: new Date().toISOString()
    })
  }

  const handleProgressUpdate = (newProgress: number) => {
    updateSubcontractorWorkOrder(workOrder.id, { 
      progress: newProgress,
      updatedAt: new Date().toISOString()
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link href="/production/work-orders">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Work Orders
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                {getWorkTypeIcon(workOrder.workType)}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{workOrder.workOrderNumber}</h1>
                  <p className="text-sm text-gray-600">Subcontractor Work Order Details</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(workOrder.status)}>{workOrder.status}</Badge>
              <Button 
                variant="outline" 
                onClick={() => setShowUnitEconomics(!showUnitEconomics)}
              >
                <Calculator className="w-4 h-4 mr-2" />
                {showUnitEconomics ? 'Hide' : 'Show'} Unit Economics
              </Button>
              <Link href={`/production/subcontractor-work-orders/${workOrder.id}/edit`}>
                <Button>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Work Order
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Unit Economics Calculator Section */}
        {showUnitEconomics && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Unit Economics Calculator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estimated Cost</label>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(workOrder.estimatedCost)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Actual Cost</label>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(workOrder.actualCost)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cost Variance</label>
                    <div className={`text-2xl font-bold ${workOrder.actualCost <= workOrder.estimatedCost ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(workOrder.actualCost - workOrder.estimatedCost)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Work Order Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Work Order Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(workOrder.priority)}
                      <div>
                        <p className="text-sm text-gray-500">Priority</p>
                        <p className="font-medium">{workOrder.priority}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getWorkTypeIcon(workOrder.workType)}
                      <div>
                        <p className="text-sm text-gray-500">Work Type</p>
                        <p className="font-medium">{workOrder.workType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Start Date</p>
                        <p className="font-medium">{workOrder.startDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Due Date</p>
                        <p className="font-medium">{workOrder.dueDate}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Estimated Cost</p>
                        <p className="font-bold text-lg">{formatCurrency(workOrder.estimatedCost)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Estimated Duration</p>
                        <p className="font-medium">{workOrder.estimatedDuration} days</p>
                      </div>
                    </div>
                    {workOrder.completionDate && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-500">Completion Date</p>
                          <p className="font-medium text-green-600">{workOrder.completionDate}</p>
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Progress</span>
                        <span className="text-sm font-medium">{workOrder.progress}%</span>
                      </div>
                      <Progress value={workOrder.progress} className="h-2" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Work Description</p>
                      <p className="text-gray-700">{workOrder.workDescription}</p>
                    </div>
                  </div>
                </div>

                {workOrder.notes && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Notes</p>
                        <p className="text-gray-700">{workOrder.notes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Specifications and Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Specifications & Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Specifications</h4>
                  <p className="text-gray-700">{workOrder.specifications}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Deliverables</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {workOrder.deliverables.map((deliverable, index) => (
                      <li key={index} className="text-gray-700">{deliverable}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Quality Requirements</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {workOrder.qualityRequirements.map((req, index) => (
                        <li key={index} className="text-gray-700">{req}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Safety Requirements</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {workOrder.safetyRequirements.map((req, index) => (
                        <li key={index} className="text-gray-700">{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {workOrder.specialInstructions && (
                  <div>
                    <h4 className="font-medium mb-2">Special Instructions</h4>
                    <p className="text-gray-700">{workOrder.specialInstructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Materials and Tools */}
            <Card>
              <CardHeader>
                <CardTitle>Materials & Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Materials Provided</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {workOrder.materialsProvided.map((material, index) => (
                        <li key={index} className="text-gray-700">{material}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Materials Required</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {workOrder.materialsRequired.map((material, index) => (
                        <li key={index} className="text-gray-700">{material}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-2">Tools Required</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {workOrder.toolsRequired.map((tool, index) => (
                      <li key={index} className="text-gray-700">{tool}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Progress Tracking */}
            <Card>
              <CardHeader>
                <CardTitle>Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm font-medium">{workOrder.progress}%</span>
                  </div>
                  <Progress value={workOrder.progress} className="h-3" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Estimated Duration</label>
                      <p className="font-medium">{workOrder.estimatedDuration} days</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Actual Duration</label>
                      <p className="font-medium">{workOrder.actualDuration} days</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleProgressUpdate(Math.max(0, workOrder.progress - 10))}
                    >
                      -10%
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleProgressUpdate(Math.min(100, workOrder.progress + 10))}
                    >
                      +10%
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleProgressUpdate(100)}
                    >
                      Complete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Supplier Information */}
            {supplier && (
              <Card>
                <CardHeader>
                  <CardTitle>Subcontractor Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-medium">{supplier.name}</p>
                      <p className="text-sm text-gray-600">{supplier.contactPerson}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a href={`mailto:${supplier.email}`} className="text-sm text-blue-600 hover:underline">
                        {supplier.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${supplier.phone}`} className="text-sm text-blue-600 hover:underline">
                        {supplier.phone}
                      </a>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                      <div className="text-sm text-gray-600">
                        <p>{supplier.address}</p>
                        <p>
                          {supplier.city}, {supplier.state} {supplier.zipCode}
                        </p>
                        <p>{supplier.country}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Badge className="bg-green-100 text-green-800">Rating: {supplier.rating}/5</Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Specialties:</p>
                    <div className="flex flex-wrap gap-1">
                      {supplier.specialties.map((specialty) => (
                        <Badge key={specialty} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Project Information */}
            {project && (
              <Card>
                <CardHeader>
                  <CardTitle>Project Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Project Name</p>
                    <p className="font-medium">{project.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Project ID</p>
                    <p className="font-mono text-sm">{project.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-medium">{project.customerName}</p>
                  </div>
                  <Link href={`/projects/${project.id}`}>
                    <Button variant="outline" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View Project Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Status Management */}
            <Card>
              <CardHeader>
                <CardTitle>Status Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleStatusUpdate("Sent")}
                  disabled={workOrder.status === "Sent"}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send to Subcontractor
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleStatusUpdate("In Progress")}
                  disabled={workOrder.status === "In Progress"}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Mark as In Progress
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleStatusUpdate("On Hold")}
                  disabled={workOrder.status === "On Hold"}
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Put On Hold
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleStatusUpdate("Completed")}
                  disabled={workOrder.status === "Completed"}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Completed
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/production/subcontractor-work-orders/${workOrder.id}/edit`} className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Work Order
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <FileText className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Subcontractor
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Purchase Order
                </Button>
              </CardContent>
            </Card>

            {/* Assignment Information */}
            <Card>
              <CardHeader>
                <CardTitle>Assignment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Created By</p>
                  <p className="font-medium">{workOrder.createdBy}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Assigned To</p>
                  <p className="font-medium">{workOrder.assignedTo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium">{new Date(workOrder.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">{new Date(workOrder.updatedAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Purchase Order Integration */}
        <div className="mt-8">
          <SubcontractorIntegration 
            workOrderId={workOrder.id}
            showCreateActions={true}
          />
        </div>
      </main>
    </div>
  )
}
