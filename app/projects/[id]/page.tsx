"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  User, 
  Clock, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Pause,
  FolderOpen,
  FileText,
  Wrench,
  Factory,
  Plus,
  Eye,
  Trash2
} from "lucide-react"
import Link from "next/link"
import { useDatabaseContext } from "@/components/database-provider"
import { formatDate, formatCurrency } from "@/lib/data"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [projectId, setProjectId] = useState<string | null>(null)
  const { 
    engineeringProjects: projects = [], 
    productionWorkOrders: workOrders = [],
    suppliers = [],
    projectSubcontractors = [],
    subcontractorWorkOrders = [],
    getProjectSubcontractorsByProject,
    getSubcontractorWorkOrdersByProject,
    createProjectSubcontractor,
    updateProjectSubcontractor,
    deleteProjectSubcontractor,
    createSubcontractorWorkOrder,
    updateSubcontractorWorkOrder,
    deleteSubcontractorWorkOrder,
    isInitialized
  } = useDatabaseContext()

  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSubconDialogOpen, setIsSubconDialogOpen] = useState(false)
  const [editingSubcon, setEditingSubcon] = useState<any>(null)
  const [subconFormData, setSubconFormData] = useState({
    supplierId: "",
    workDescription: "",
    workType: "Fabrication" as "Fabrication" | "Assembly" | "Welding" | "Machining" | "Coating" | "Testing" | "Installation" | "Other",
    priority: "Medium" as "Low" | "Medium" | "High" | "Critical",
    estimatedCost: "",
    estimatedDuration: "",
    startDate: "",
    dueDate: "",
    specifications: "",
    deliverables: "",
    qualityRequirements: "",
    safetyRequirements: "",
    notes: ""
  })

  // Resolve the async params
  useEffect(() => {
    params.then(({ id }) => {
      setProjectId(id)
    })
  }, [params])

  useEffect(() => {
    if (isInitialized && projects && projectId) {
      const foundProject = projects.find((p: any) => p.id === projectId)
      setProject(foundProject || null)
      setLoading(false)
    }
  }, [isInitialized, projects, projectId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Draft": return "bg-gray-100 text-gray-800"
      case "Under Review": return "bg-yellow-100 text-yellow-800"
      case "Approved": return "bg-blue-100 text-blue-800"
      case "In Progress": return "bg-green-100 text-green-800"
      case "On Hold": return "bg-orange-100 text-orange-800"
      case "Completed": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "text-red-600"
      case "High": return "text-orange-600"
      case "Medium": return "text-yellow-600"
      case "Low": return "text-green-600"
      default: return "text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Draft": return <FolderOpen className="w-4 h-4" />
      case "Under Review": return <AlertTriangle className="w-4 h-4" />
      case "Approved": return <CheckCircle className="w-4 h-4" />
      case "In Progress": return <Clock className="w-4 h-4" />
      case "On Hold": return <Pause className="w-4 h-4" />
      case "Completed": return <CheckCircle className="w-4 h-4" />
      default: return <FolderOpen className="w-4 h-4" />
    }
  }

  // Get related work orders for this project
  const relatedWorkOrders = workOrders.filter((wo: any) => wo.projectId === projectId)
  
  // Get related subcontractors for this project
  const relatedProjectSubcontractors = projectId ? getProjectSubcontractorsByProject(projectId) : []
  const relatedSubcontractorWorkOrders = projectId ? getSubcontractorWorkOrdersByProject(projectId) : []

  // Subcontractor management functions
  const openSubconDialog = () => {
    setEditingSubcon(null)
    setSubconFormData({
      supplierId: "",
      workDescription: "",
      workType: "Fabrication",
      priority: "Medium",
      estimatedCost: "",
      estimatedDuration: "",
      startDate: new Date().toISOString().split('T')[0],
      dueDate: "",
      specifications: "",
      deliverables: "",
      qualityRequirements: "",
      safetyRequirements: "",
      notes: ""
    })
    setIsSubconDialogOpen(true)
  }

  const openEditSubconDialog = (subcon: any) => {
    setEditingSubcon(subcon)
    setSubconFormData({
      supplierId: subcon.supplierId || "",
      workDescription: subcon.workDescription || "",
      workType: subcon.workType || "Fabrication",
      priority: subcon.priority || "Medium",
      estimatedCost: subcon.estimatedCost?.toString() || "",
      estimatedDuration: subcon.estimatedDuration?.toString() || "",
      startDate: subcon.startDate || "",
      dueDate: subcon.dueDate || "",
      specifications: subcon.specifications || "",
      deliverables: subcon.deliverables?.join(', ') || "",
      qualityRequirements: subcon.qualityRequirements?.join(', ') || "",
      safetyRequirements: subcon.safetyRequirements?.join(', ') || "",
      notes: subcon.notes || ""
    })
    setIsSubconDialogOpen(true)
  }

  const handleCreateSubcon = async () => {
    if (!projectId || !subconFormData.supplierId || !subconFormData.workDescription) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const selectedSupplier = suppliers.find(s => s.id === subconFormData.supplierId)
      if (!selectedSupplier) {
        alert("Selected supplier not found")
        return
      }

      const newProjectSubcon = {
        projectId,
        supplierId: subconFormData.supplierId,
        supplierName: selectedSupplier.name,
        workDescription: subconFormData.workDescription,
        workType: subconFormData.workType,
        status: "Pending" as const,
        priority: subconFormData.priority,
        estimatedCost: parseFloat(subconFormData.estimatedCost) || 0,
        actualCost: 0,
        estimatedDuration: parseInt(subconFormData.estimatedDuration) || 0,
        actualDuration: 0,
        startDate: subconFormData.startDate,
        dueDate: subconFormData.dueDate,
        progress: 0,
        assignedBy: "Current User", // In a real app, this would be the logged-in user
        assignedAt: new Date().toISOString(),
        specifications: subconFormData.specifications,
        deliverables: subconFormData.deliverables.split(',').map(d => d.trim()).filter(d => d),
        qualityRequirements: subconFormData.qualityRequirements.split(',').map(q => q.trim()).filter(q => q),
        safetyRequirements: subconFormData.safetyRequirements.split(',').map(s => s.trim()).filter(s => s),
        notes: subconFormData.notes
      }

      await createProjectSubcontractor(newProjectSubcon)
      setIsSubconDialogOpen(false)
      setEditingSubcon(null)
      alert("Subcontractor assigned successfully!")
    } catch (error) {
      console.error("Error creating project subcontractor:", error)
      alert("Failed to assign subcontractor")
    }
  }

  const handleUpdateSubcon = async () => {
    if (!editingSubcon || !subconFormData.supplierId || !subconFormData.workDescription) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const selectedSupplier = suppliers.find(s => s.id === subconFormData.supplierId)
      if (!selectedSupplier) {
        alert("Selected supplier not found")
        return
      }

      const updatedProjectSubcon = {
        ...editingSubcon,
        supplierId: subconFormData.supplierId,
        supplierName: selectedSupplier.name,
        workDescription: subconFormData.workDescription,
        workType: subconFormData.workType,
        priority: subconFormData.priority,
        estimatedCost: parseFloat(subconFormData.estimatedCost) || 0,
        estimatedDuration: parseInt(subconFormData.estimatedDuration) || 0,
        startDate: subconFormData.startDate,
        dueDate: subconFormData.dueDate,
        specifications: subconFormData.specifications,
        deliverables: subconFormData.deliverables.split(',').map(d => d.trim()).filter(d => d),
        qualityRequirements: subconFormData.qualityRequirements.split(',').map(q => q.trim()).filter(q => q),
        safetyRequirements: subconFormData.safetyRequirements.split(',').map(s => s.trim()).filter(s => s),
        notes: subconFormData.notes
      }

      await updateProjectSubcontractor(editingSubcon.id, updatedProjectSubcon)
      setIsSubconDialogOpen(false)
      setEditingSubcon(null)
      alert("Subcontractor updated successfully!")
    } catch (error) {
      console.error("Error updating project subcontractor:", error)
      alert("Failed to update subcontractor")
    }
  }

  const handleDeleteSubcon = async (subconId: string) => {
    if (confirm("Are you sure you want to remove this subcontractor from the project?")) {
      try {
        await deleteProjectSubcontractor(subconId)
        alert("Subcontractor removed successfully!")
      } catch (error) {
        console.error("Error deleting project subcontractor:", error)
        alert("Failed to remove subcontractor")
      }
    }
  }

  if (loading || !projectId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Loading project...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <Link href="/projects">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
              <p className="text-gray-500">The project you're looking for doesn't exist or has been deleted.</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const progress = project.actualHours > 0 ? Math.min((project.actualHours / project.estimatedHours) * 100, 100) : 0
  const isOverdue = new Date(project.dueDate) < new Date() && project.status !== "Completed"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/projects">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Projects
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                  {isOverdue && (
                    <Badge variant="destructive">
                      Overdue
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{project.projectNumber} • {project.customerName}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit Project
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="col-span-3">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="workorders">Work Orders</TabsTrigger>
                <TabsTrigger value="subcontractors">Subcontractors</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Project Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Project Overview</CardTitle>
                    <CardDescription>Key project information and progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Project Type</label>
                          <p className="mt-1">{project.projectType}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Priority</label>
                          <p className="mt-1" style={{ color: getPriorityColor(project.priority) }}>
                            {project.priority}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Assigned Engineer</label>
                          <p className="mt-1">{project.assignedEngineer || "Unassigned"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Project Manager</label>
                          <p className="mt-1">{project.projectManager || "Unassigned"}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Estimated Cost</label>
                          <p className="mt-1 text-lg font-semibold">{formatCurrency(project.estimatedCost)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Estimated Hours</label>
                          <p className="mt-1">{project.estimatedHours} hours</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Actual Hours</label>
                          <p className="mt-1">{project.actualHours} hours</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Progress</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={progress} className="flex-1 h-2" />
                            <span className="text-sm">{Math.round(progress)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{project.description}</p>
                  </CardContent>
                </Card>

                {/* Technical Specifications */}
                <Card>
                  <CardHeader>
                    <CardTitle>Technical Specifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{project.technicalSpecifications}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="workorders" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Related Work Orders</CardTitle>
                    <CardDescription>Work orders created from this project</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {relatedWorkOrders.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Work Order</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Progress</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {relatedWorkOrders.map((workOrder: any) => (
                            <TableRow key={workOrder.id}>
                              <TableCell className="font-medium">{workOrder.workOrderNumber}</TableCell>
                              <TableCell>{workOrder.productName}</TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(workOrder.status)}>
                                  {workOrder.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Progress value={workOrder.progress} className="w-16 h-2" />
                                  <span className="text-sm">{workOrder.progress}%</span>
                                </div>
                              </TableCell>
                              <TableCell>{formatDate(workOrder.dueDate)}</TableCell>
                              <TableCell>
                                <Link href={`/production/work-orders`}>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="w-3 h-3 mr-1" />
                                    View
                                  </Button>
                                </Link>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8">
                        <Factory className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Work Orders</h3>
                        <p className="text-gray-500 mb-4">No work orders have been created from this project yet.</p>
                        <Link href="/production/work-orders">
                          <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Work Order
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="subcontractors" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Project Subcontractors</CardTitle>
                        <CardDescription>Manage subcontractors assigned to this project</CardDescription>
                      </div>
                      <Button onClick={openSubconDialog}>
                        <Plus className="w-4 h-4 mr-2" />
                        Assign Subcontractor
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {relatedProjectSubcontractors.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Supplier (Subcontractor)</TableHead>
                            <TableHead>Work Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Cost</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {relatedProjectSubcontractors.map((subcon: any) => (
                            <TableRow key={subcon.id}>
                              <TableCell className="font-medium">{subcon.supplierName}</TableCell>
                              <TableCell>{subcon.workType}</TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(subcon.status)}>
                                  {subcon.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <span style={{ color: getPriorityColor(subcon.priority) }}>
                                  {subcon.priority}
                                </span>
                              </TableCell>
                              <TableCell>{formatCurrency(subcon.estimatedCost)}</TableCell>
                              <TableCell>{formatDate(subcon.dueDate)}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditSubconDialog(subcon)}
                                  >
                                    <Edit className="w-3 h-3 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteSubcon(subcon.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8">
                        <Factory className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Subcontractors</h3>
                        <p className="text-gray-500 mb-4">No subcontractors have been assigned to this project yet.</p>
                        <Button onClick={openSubconDialog}>
                          <Plus className="w-4 h-4 mr-2" />
                          Assign Subcontractor
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Subcontractor Work Orders */}
                {relatedSubcontractorWorkOrders.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Subcontractor Work Orders</CardTitle>
                      <CardDescription>Work orders created for subcontractors</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Work Order</TableHead>
                            <TableHead>Supplier (Subcontractor)</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Progress</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {relatedSubcontractorWorkOrders.map((workOrder: any) => (
                            <TableRow key={workOrder.id}>
                              <TableCell className="font-medium">{workOrder.workOrderNumber}</TableCell>
                              <TableCell>{workOrder.supplierName}</TableCell>
                              <TableCell>{workOrder.workDescription}</TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(workOrder.status)}>
                                  {workOrder.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Progress value={workOrder.progress} className="w-16 h-2" />
                                  <span className="text-sm">{workOrder.progress}%</span>
                                </div>
                              </TableCell>
                              <TableCell>{formatDate(workOrder.dueDate)}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-3 h-3 mr-1" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="requirements" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{project.customerRequirements}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Constraints</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {project.constraints?.map((constraint: string, index: number) => (
                        <li key={index} className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          <span>{constraint}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Risks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {project.risks?.map((risk: string, index: number) => (
                        <li key={index} className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Deliverables</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {project.deliverables?.map((deliverable: string, index: number) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{deliverable}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Project Start</p>
                          <p className="text-sm text-gray-500">{formatDate(project.startDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Clock className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium">Due Date</p>
                          <p className="text-sm text-gray-500">{formatDate(project.dueDate)}</p>
                        </div>
                      </div>
                      {project.completionDate && (
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">Completion Date</p>
                            <p className="text-sm text-gray-500">{formatDate(project.completionDate)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {project.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{project.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">PROJECT NUMBER</label>
                  <p className="text-sm">{project.projectNumber}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">STATUS</label>
                  <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">PRIORITY</label>
                  <p className="text-sm" style={{ color: getPriorityColor(project.priority) }}>
                    {project.priority}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">CUSTOMER</label>
                  <p className="text-sm">{project.customerName}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">ESTIMATED COST</label>
                  <p className="text-sm font-semibold">{formatCurrency(project.estimatedCost)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">PROGRESS</label>
                  <div className="flex items-center gap-2">
                    <Progress value={progress} className="flex-1 h-2" />
                    <span className="text-sm">{Math.round(progress)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Project
                </Button>
                <Link href="/production/work-orders">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Factory className="w-4 h-4 mr-2" />
                    Create Work Order
                  </Button>
                </Link>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Subcontractor Assignment Dialog */}
      <Dialog open={isSubconDialogOpen} onOpenChange={setIsSubconDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSubcon ? "Edit Subcontractor Assignment" : "Assign Subcontractor to Project"}
            </DialogTitle>
            <DialogDescription>
              {editingSubcon ? "Update subcontractor assignment details" : "Assign a subcontractor to work on this project"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
             <div>
               <Label htmlFor="supplier">Supplier (Subcontractor) *</Label>
               <Select
                 value={subconFormData.supplierId}
                 onValueChange={(value) => setSubconFormData(prev => ({ ...prev, supplierId: value }))}
               >
                 <SelectTrigger>
                   <SelectValue placeholder="Select supplier as subcontractor" />
                 </SelectTrigger>
                 <SelectContent>
                   {suppliers.map((supplier) => (
                     <SelectItem key={supplier.id} value={supplier.id}>
                       {supplier.name} - {supplier.specialties.join(', ')}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
            
            <div>
              <Label htmlFor="workDescription">Work Description *</Label>
              <Textarea
                id="workDescription"
                value={subconFormData.workDescription}
                onChange={(e) => setSubconFormData(prev => ({ ...prev, workDescription: e.target.value }))}
                placeholder="Describe the work to be performed"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workType">Work Type</Label>
                <Select 
                  value={subconFormData.workType} 
                  onValueChange={(value: any) => setSubconFormData(prev => ({ ...prev, workType: value }))}
                >
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
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={subconFormData.priority} 
                  onValueChange={(value: any) => setSubconFormData(prev => ({ ...prev, priority: value }))}
                >
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estimatedCost">Estimated Cost</Label>
                <Input
                  id="estimatedCost"
                  type="number"
                  value={subconFormData.estimatedCost}
                  onChange={(e) => setSubconFormData(prev => ({ ...prev, estimatedCost: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="estimatedDuration">Estimated Duration (days)</Label>
                <Input
                  id="estimatedDuration"
                  type="number"
                  value={subconFormData.estimatedDuration}
                  onChange={(e) => setSubconFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={subconFormData.startDate}
                  onChange={(e) => setSubconFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={subconFormData.dueDate}
                  onChange={(e) => setSubconFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="specifications">Specifications</Label>
              <Textarea
                id="specifications"
                value={subconFormData.specifications}
                onChange={(e) => setSubconFormData(prev => ({ ...prev, specifications: e.target.value }))}
                placeholder="Technical specifications and requirements"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="deliverables">Deliverables (comma-separated)</Label>
              <Input
                id="deliverables"
                value={subconFormData.deliverables}
                onChange={(e) => setSubconFormData(prev => ({ ...prev, deliverables: e.target.value }))}
                placeholder="Drawing, Report, Sample, etc."
              />
            </div>

            <div>
              <Label htmlFor="qualityRequirements">Quality Requirements (comma-separated)</Label>
              <Input
                id="qualityRequirements"
                value={subconFormData.qualityRequirements}
                onChange={(e) => setSubconFormData(prev => ({ ...prev, qualityRequirements: e.target.value }))}
                placeholder="ISO 9001, ASME, etc."
              />
            </div>

            <div>
              <Label htmlFor="safetyRequirements">Safety Requirements (comma-separated)</Label>
              <Input
                id="safetyRequirements"
                value={subconFormData.safetyRequirements}
                onChange={(e) => setSubconFormData(prev => ({ ...prev, safetyRequirements: e.target.value }))}
                placeholder="OSHA, PPE, etc."
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={subconFormData.notes}
                onChange={(e) => setSubconFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes or special instructions"
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsSubconDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={editingSubcon ? handleUpdateSubcon : handleCreateSubcon}>
                {editingSubcon ? "Update" : "Assign"} Subcontractor
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
