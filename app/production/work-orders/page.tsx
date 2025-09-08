"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  FileText,
  Plus,
  Edit,
  Eye,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  User,
  Factory,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  Square,
  FolderOpen
} from "lucide-react"
import { useDatabaseContext } from "@/components/database-provider"
import Link from "next/link"

export default function WorkOrderManagement() {
  const {
    productionWorkOrders: workOrders = [],
    workstations = [],
    operators = [],
    engineeringProjects = [],
    createProductionWorkOrder,
    updateProductionWorkOrder,
    deleteProductionWorkOrder,
    refreshProductionWorkOrders
  } = useDatabaseContext()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [projectFilter, setProjectFilter] = useState("all")
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingWorkOrder, setEditingWorkOrder] = useState<any>(null)
  const [formData, setFormData] = useState({
    projectId: "",
    productName: "",
    description: "",
    quantity: "",
    customer: "",
    project: "",
    priority: "Medium",
    dueDate: "",
    assignedOperator: "",
    assignedWorkstation: ""
  })

  // Filter work orders based on search and filters
  const filteredWorkOrders = workOrders.filter((workOrder) => {
    const matchesSearch = workOrder.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workOrder.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workOrder.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workOrder.project?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || workOrder.status === statusFilter
    const matchesPriority = priorityFilter === "all" || workOrder.priority === priorityFilter
    const matchesProject = projectFilter === "all" || workOrder.projectId === projectFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesProject
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Planned": return "bg-yellow-100 text-yellow-800"
      case "In Progress": return "bg-blue-100 text-blue-800"
      case "Completed": return "bg-green-100 text-green-800"
      case "Quality Approved": return "bg-purple-100 text-purple-800"
      case "On Hold": return "bg-red-100 text-red-800"
      case "Cancelled": return "bg-gray-100 text-gray-800"
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

  const handleStatusChange = async (workOrderId: string, newStatus: string) => {
    try {
      const workOrder = workOrders.find(wo => wo.id === workOrderId)
      if (workOrder) {
        // Calculate progress based on status change
        let newProgress = workOrder.progress
        if (newStatus === "In Progress" && workOrder.status === "Planned") {
          newProgress = 10
        } else if (newStatus === "Completed") {
          newProgress = 90
        } else if (newStatus === "Quality Approved") {
          newProgress = 100
        }

        const updatedWorkOrder = {
          ...workOrder,
          status: newStatus as "Planned" | "In Progress" | "Completed" | "Quality Approved" | "On Hold" | "Cancelled",
          progress: newProgress,
          updatedAt: new Date().toISOString()
        }
        await updateProductionWorkOrder(workOrderId, updatedWorkOrder)
        await refreshProductionWorkOrders()
        
        // Update selected work order if it's the same one
        if (selectedWorkOrder && selectedWorkOrder.id === workOrderId) {
          setSelectedWorkOrder(updatedWorkOrder)
        }
      }
    } catch (error) {
      console.error("Error updating work order status:", error)
      alert("Failed to update work order status")
    }
  }

  const handleProgressUpdate = async (workOrderId: string, newProgress: number) => {
    try {
      const workOrder = workOrders.find(wo => wo.id === workOrderId)
      if (workOrder) {
        const updatedWorkOrder = {
          ...workOrder,
          progress: Math.min(100, Math.max(0, newProgress)),
          updatedAt: new Date().toISOString()
        }
        await updateProductionWorkOrder(workOrderId, updatedWorkOrder)
        await refreshProductionWorkOrders()
        
        // Update selected work order if it's the same one
        if (selectedWorkOrder && selectedWorkOrder.id === workOrderId) {
          setSelectedWorkOrder(updatedWorkOrder)
        }
      }
    } catch (error) {
      console.error("Error updating work order progress:", error)
      alert("Failed to update work order progress")
    }
  }

  const handleDeleteWorkOrder = async (workOrderId: string) => {
    if (confirm("Are you sure you want to delete this work order?")) {
      try {
        await deleteProductionWorkOrder(workOrderId)
        await refreshProductionWorkOrders()
        alert("Work order deleted successfully!")
      } catch (error) {
        console.error("Error deleting work order:", error)
        alert("Failed to delete work order")
      }
    }
  }

  const handleProjectChange = (projectId: string) => {
    if (projectId === "none") {
      setFormData(prev => ({
        ...prev,
        projectId: "",
        productName: "",
        description: "",
        quantity: "",
        customer: "",
        project: "",
        priority: "Medium",
        dueDate: ""
      }))
      return
    }

    const project = engineeringProjects.find((p: any) => p.id === projectId)
    if (project) {
      setFormData(prev => ({
        ...prev,
        projectId,
        productName: project.title || "",
        description: project.description || "",
        quantity: "1", // Default quantity
        customer: project.customerName || "",
        project: project.title || "",
        priority: project.priority || "Medium",
        dueDate: project.dueDate || ""
      }))
    }
  }

  const openCreateDialog = () => {
    setEditingWorkOrder(null)
    setFormData({
      projectId: "",
      productName: "",
      description: "",
      quantity: "",
      customer: "",
      project: "",
      priority: "Medium",
      dueDate: "",
      assignedOperator: "",
      assignedWorkstation: ""
    })
    setIsCreateDialogOpen(true)
  }

  const openEditDialog = (workOrder: any) => {
    setEditingWorkOrder(workOrder)
    setFormData({
      projectId: workOrder.projectId || "",
      productName: workOrder.productName || "",
      description: workOrder.description || "",
      quantity: workOrder.quantity?.toString() || "",
      customer: workOrder.customer || "",
      project: workOrder.project || "",
      priority: workOrder.priority || "Medium",
      dueDate: workOrder.dueDate || "",
      assignedOperator: workOrder.assignedTo || "",
      assignedWorkstation: workOrder.assignedWorkstation || ""
    })
    setIsEditDialogOpen(true)
  }

  const handleCreateWorkOrder = async () => {
    if (!formData.productName || !formData.quantity || !formData.customer) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const newWorkOrder = {
        productName: formData.productName,
        description: formData.description,
        quantity: parseInt(formData.quantity),
        customer: formData.customer,
        project: formData.project,
        projectId: formData.projectId || undefined,
        priority: formData.priority as "Low" | "Medium" | "High" | "Critical",
        dueDate: formData.dueDate,
        status: "Planned" as const,
        progress: 0,
        assignedTeam: "Production Team A",
        supervisor: "Mike Johnson",
        operations: [
          { step: "Setup", duration: "2 hours", status: "Pending" as const },
          { step: "Production", duration: "8 hours", status: "Pending" as const },
          { step: "Quality Check", duration: "1 hour", status: "Pending" as const }
        ],
        revision: "1.0",
        bomId: "",
        workOrderNumber: `WO${String(workOrders.length + 1).padStart(3, '0')}`,
        startDate: new Date().toISOString().split('T')[0],
        assignedTo: formData.assignedOperator || "Unassigned",
        estimatedHours: 40,
        actualHours: 0,
        notes: formData.projectId ? `Created from project: ${engineeringProjects.find((p: any) => p.id === formData.projectId)?.projectNumber}` : ""
      }

      await createProductionWorkOrder(newWorkOrder)
      await refreshProductionWorkOrders()

      setIsCreateDialogOpen(false)
      setEditingWorkOrder(null)

      alert("Work order created successfully!")
    } catch (error) {
      console.error("Error creating work order:", error)
      alert("Failed to create work order")
    }
  }

  const handleUpdateWorkOrder = async () => {
    if (!editingWorkOrder || !formData.productName || !formData.quantity || !formData.customer) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const updatedWorkOrder = {
        ...editingWorkOrder,
        productName: formData.productName,
        description: formData.description,
        quantity: parseInt(formData.quantity),
        customer: formData.customer,
        project: formData.project,
        priority: formData.priority as "Low" | "Medium" | "High" | "Critical",
        dueDate: formData.dueDate,
        assignedTo: formData.assignedOperator,
        assignedWorkstation: formData.assignedWorkstation
      }

      await updateProductionWorkOrder(editingWorkOrder.id, updatedWorkOrder)
      await refreshProductionWorkOrders()

      setIsEditDialogOpen(false)
      setEditingWorkOrder(null)

      alert("Work order updated successfully!")
    } catch (error) {
      console.error("Error updating work order:", error)
      alert("Failed to update work order")
    }
  }

  // Calculate statistics
  const totalWorkOrders = workOrders.length
  const activeWorkOrders = workOrders.filter(wo => wo.status === "In Progress").length
  const completedWorkOrders = workOrders.filter(wo => wo.status === "Completed" || wo.status === "Quality Approved").length
  const onHoldWorkOrders = workOrders.filter(wo => wo.status === "On Hold").length
  const avgProgress = workOrders.length > 0 ?
    Math.round(workOrders.reduce((acc, wo) => acc + wo.progress, 0) / workOrders.length) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Work Order Management</h1>
          <p className="text-gray-600">Create, track, and manage production work orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refreshProductionWorkOrders()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            New Work Order
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Work Orders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkOrders}</div>
            <p className="text-xs text-muted-foreground">
              {activeWorkOrders} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeWorkOrders}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
            <div className="mt-2">
              <Progress value={totalWorkOrders > 0 ? (activeWorkOrders / totalWorkOrders) * 100 : 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedWorkOrders}</div>
            <p className="text-xs text-muted-foreground">
              Successfully finished
            </p>
            <div className="mt-2">
              <Progress value={totalWorkOrders > 0 ? (completedWorkOrders / totalWorkOrders) * 100 : 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProgress}%</div>
            <p className="text-xs text-muted-foreground">
              Across all work orders
            </p>
            <div className="mt-2">
              <Progress value={avgProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search work orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={(value: string) => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Planned">Planned</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Quality Approved">Quality Approved</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority-filter">Priority</Label>
              <Select value={priorityFilter} onValueChange={(value: string) => setPriorityFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="project-filter">Project</Label>
              <Select value={projectFilter} onValueChange={(value: string) => setProjectFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {engineeringProjects.map((project: any) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.projectNumber} - {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setPriorityFilter("all")
                  setProjectFilter("all")
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Work Orders</CardTitle>
          <CardDescription>Complete list of production work orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredWorkOrders.map((workOrder: any) => {
              const workstation = workstations.find((ws: any) => ws.currentWorkOrder === workOrder.id)
              const operator = operators.find((op: any) => op.currentWorkOrder === workOrder.id)

              return (
                <div key={workOrder.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{workOrder.productName}</h3>
                      <p className="text-sm text-gray-500">WO: {workOrder.id} • {workOrder.customer}</p>
                      {workOrder.projectId && (
                        <p className="text-sm text-blue-600">
                          Project: {engineeringProjects.find((p: any) => p.id === workOrder.projectId)?.projectNumber || workOrder.project}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">{workOrder.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm font-medium">{workOrder.progress}%</p>
                      <p className="text-xs text-gray-500">Progress</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{workOrder.quantity}</p>
                      <p className="text-xs text-gray-500">Quantity</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium" style={{ color: getPriorityColor(workOrder.priority) }}>
                        {workOrder.priority}
                      </p>
                      <p className="text-xs text-gray-500">Priority</p>
                    </div>
                    <Badge className={getStatusColor(workOrder.status)}>
                      {workOrder.status}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedWorkOrder(workOrder)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      {workOrder.projectId && (
                        <Link href="/projects">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <FolderOpen className="w-3 h-3 mr-1" />
                            Project
                          </Button>
                        </Link>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(workOrder)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteWorkOrder(workOrder.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}

            {filteredWorkOrders.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No work orders found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                    ? "Try adjusting your filters to see more results."
                    : "Get started by creating your first work order."
                  }
                </p>
                <Button onClick={openCreateDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Work Order
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Work Order Detail Dialog */}
      <Dialog open={!!selectedWorkOrder} onOpenChange={() => setSelectedWorkOrder(null)}>
        <DialogContent className="!max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {selectedWorkOrder?.productName}
            </DialogTitle>
            <DialogDescription>
              Work Order: {selectedWorkOrder?.workOrderNumber || selectedWorkOrder?.id}
              {selectedWorkOrder?.projectId && (
                <span className="ml-2 text-blue-600">
                  • Project: {engineeringProjects.find((p: any) => p.id === selectedWorkOrder.projectId)?.projectNumber || selectedWorkOrder.project}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedWorkOrder && (
            <div className="space-y-6">
              {/* Header Actions */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Badge className={getStatusColor(selectedWorkOrder.status)}>
                    {selectedWorkOrder.status}
                  </Badge>
                  <Badge variant="outline" style={{ color: getPriorityColor(selectedWorkOrder.priority) }}>
                    {selectedWorkOrder.priority} Priority
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Progress value={selectedWorkOrder.progress} className="w-24 h-2" />
                    <span className="text-sm font-medium">{selectedWorkOrder.progress}%</span>
                    {selectedWorkOrder.status === "In Progress" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newProgress = prompt("Enter new progress (0-100):", selectedWorkOrder.progress.toString())
                          if (newProgress !== null) {
                            const progress = parseInt(newProgress)
                            if (!isNaN(progress) && progress >= 0 && progress <= 100) {
                              handleProgressUpdate(selectedWorkOrder.id, progress)
                            } else {
                              alert("Please enter a valid progress value between 0 and 100")
                            }
                          }
                        }}
                        className="ml-2"
                      >
                        Update
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => openEditDialog(selectedWorkOrder)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  {selectedWorkOrder.projectId && (
                    <Link href="/projects">
                      <Button
                        variant="outline"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <FolderOpen className="w-4 h-4 mr-2" />
                        View Project
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Main Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Product Name</Label>
                      <p className="text-sm font-medium">{selectedWorkOrder.productName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Description</Label>
                      <p className="text-sm">{selectedWorkOrder.description || "No description provided"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Customer</Label>
                      <p className="text-sm">{selectedWorkOrder.customer}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Quantity</Label>
                      <p className="text-sm font-medium">{selectedWorkOrder.quantity} units</p>
                    </div>
                    {selectedWorkOrder.projectId && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Project</Label>
                        <p className="text-sm text-blue-600">
                          {engineeringProjects.find((p: any) => p.id === selectedWorkOrder.projectId)?.projectNumber || selectedWorkOrder.project}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Timeline & Dates */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Start Date</Label>
                      <p className="text-sm">{selectedWorkOrder.startDate || "Not started"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Due Date</Label>
                      <p className="text-sm">{selectedWorkOrder.dueDate}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Created</Label>
                      <p className="text-sm">{new Date(selectedWorkOrder.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Last Updated</Label>
                      <p className="text-sm">{new Date(selectedWorkOrder.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Revision</Label>
                      <p className="text-sm">{selectedWorkOrder.revision || "1.0"}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Resources & Assignment */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Assigned To</Label>
                      <p className="text-sm">{selectedWorkOrder.assignedTo || "Unassigned"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Assigned Team</Label>
                      <p className="text-sm">{selectedWorkOrder.assignedTeam || "Not assigned"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Supervisor</Label>
                      <p className="text-sm">{selectedWorkOrder.supervisor || "Not assigned"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Estimated Hours</Label>
                      <p className="text-sm">{selectedWorkOrder.estimatedHours || 0} hours</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Actual Hours</Label>
                      <p className="text-sm">{selectedWorkOrder.actualHours || 0} hours</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Operations Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Operations Timeline</CardTitle>
                  <CardDescription>Production steps and their current status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedWorkOrder.operations?.map((operation: any, index: number) => (
                      <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="flex-shrink-0">
                          <div className={`p-2 rounded-full ${
                            operation.status === "Completed" ? "bg-green-100" :
                            operation.status === "In Progress" ? "bg-blue-100" :
                            "bg-gray-100"
                          }`}>
                            <Factory className={`w-4 h-4 ${
                              operation.status === "Completed" ? "text-green-600" :
                              operation.status === "In Progress" ? "text-blue-600" :
                              "text-gray-400"
                            }`} />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{operation.step}</p>
                              <p className="text-sm text-gray-500">Duration: {operation.duration}</p>
                            </div>
                            <Badge className={getStatusColor(operation.status)}>
                              {operation.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!selectedWorkOrder.operations || selectedWorkOrder.operations.length === 0) && (
                      <p className="text-sm text-gray-500 italic">No operations defined for this work order.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Notes & Additional Information */}
              {selectedWorkOrder.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">{selectedWorkOrder.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                  <CardDescription>Update work order status and progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedWorkOrder.status === "Planned" && (
                      <Button onClick={() => handleStatusChange(selectedWorkOrder.id, "In Progress")}>
                        <Play className="w-4 h-4 mr-2" />
                        Start Production
                      </Button>
                    )}
                    {selectedWorkOrder.status === "In Progress" && (
                      <>
                        <Button variant="outline" onClick={() => handleStatusChange(selectedWorkOrder.id, "On Hold")}>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </Button>
                        <Button onClick={() => handleStatusChange(selectedWorkOrder.id, "Completed")}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Complete
                        </Button>
                      </>
                    )}
                    {selectedWorkOrder.status === "Completed" && (
                      <Button onClick={() => handleStatusChange(selectedWorkOrder.id, "Quality Approved")}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Quality
                      </Button>
                    )}
                    {selectedWorkOrder.status === "On Hold" && (
                      <Button onClick={() => handleStatusChange(selectedWorkOrder.id, "In Progress")}>
                        <Play className="w-4 h-4 mr-2" />
                        Resume
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => openEditDialog(selectedWorkOrder)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Details
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleDeleteWorkOrder(selectedWorkOrder.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Work Order Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        setIsCreateDialogOpen(open)
        setIsEditDialogOpen(open)
        if (!open) setEditingWorkOrder(null)
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingWorkOrder ? "Edit Work Order" : "Create New Work Order"}
            </DialogTitle>
            <DialogDescription>
              {editingWorkOrder ? "Update work order details" : "Set up a new production work order"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="projectId">Source Project (Optional)</Label>
              <Select value={formData.projectId} onValueChange={handleProjectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project to create work order from" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No project (manual entry)</SelectItem>
                  {engineeringProjects
                    .filter((p: any) => p.status === "Approved" || p.status === "In Progress")
                    .map((project: any) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.projectNumber} - {project.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productName">Product Name *</Label>
                <Input
                  id="productName"
                  value={formData.productName}
                  onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                  placeholder="Product name"
                />
              </div>
              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="Quantity"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Work order description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer">Customer *</Label>
                <Input
                  id="customer"
                  value={formData.customer}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer: e.target.value }))}
                  placeholder="Customer name"
                />
              </div>
              <div>
                <Label htmlFor="project">Project</Label>
                <Input
                  id="project"
                  value={formData.project}
                  onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
                  placeholder="Project name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value: "Low" | "Medium" | "High" | "Critical") => setFormData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
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
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assignedOperator">Assigned Operator</Label>
                <Select value={formData.assignedOperator} onValueChange={(value: string) => setFormData(prev => ({ ...prev, assignedOperator: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {operators.map((operator: any) => (
                      <SelectItem key={operator.id} value={operator.id}>
                        {operator.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="assignedWorkstation">Assigned Workstation</Label>
                <Select value={formData.assignedWorkstation} onValueChange={(value: string) => setFormData(prev => ({ ...prev, assignedWorkstation: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select workstation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {workstations.map((workstation: any) => (
                      <SelectItem key={workstation.id} value={workstation.id}>
                        {workstation.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => {
                setIsCreateDialogOpen(false)
                setIsEditDialogOpen(false)
                setEditingWorkOrder(null)
              }}>
                Cancel
              </Button>
              <Button onClick={editingWorkOrder ? handleUpdateWorkOrder : handleCreateWorkOrder}>
                {editingWorkOrder ? "Update" : "Create"} Work Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
