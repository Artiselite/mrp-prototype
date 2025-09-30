"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  User, 
  Clock, 
  DollarSign,
  FolderOpen,
  AlertTriangle,
  CheckCircle,
  Pause
} from "lucide-react"
import { useDatabaseContext } from "@/components/database-provider"
import { formatDate, formatCurrency } from "@/lib/data"

export default function ProjectManagementPage() {
  const { 
    engineeringProjects = [], 
    productionWorkOrders = [],
    createEngineeringProject,
    updateEngineeringProject,
    deleteEngineeringProject,
    refreshEngineeringProjects
  } = useDatabaseContext()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)
  const [formData, setFormData] = useState({
    projectNumber: "",
    customerId: "",
    customerName: "",
    title: "",
    description: "",
    status: "Draft" as "Draft" | "Under Review" | "Approved" | "In Progress" | "On Hold" | "Completed",
    priority: "Medium" as "Low" | "Medium" | "High" | "Critical",
    projectType: "Custom Design" as "Custom Design" | "Modification" | "Standard Product" | "Prototype",
    estimatedHours: "",
    estimatedCost: "",
    startDate: "",
    dueDate: "",
    assignedEngineer: "",
    projectManager: "",
    customerRequirements: "",
    technicalSpecifications: "",
    notes: ""
  })

  // Filter projects based on search and filters
  const filteredProjects = engineeringProjects.filter((project) => {
    const matchesSearch = 
      project.projectNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    const matchesPriority = priorityFilter === "all" || project.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

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

  const handleDeleteProject = async (projectId: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteEngineeringProject(projectId)
        await refreshEngineeringProjects()
        alert("Project deleted successfully!")
      } catch (error) {
        console.error("Error deleting project:", error)
        alert("Failed to delete project")
      }
    }
  }

  const openCreateDialog = () => {
    setEditingProject(null)
    setFormData({
      projectNumber: `EP-${Date.now()}`,
      customerId: "",
      customerName: "",
      title: "",
      description: "",
      status: "Draft",
      priority: "Medium",
      projectType: "Custom Design",
      estimatedHours: "",
      estimatedCost: "",
      startDate: new Date().toISOString().split('T')[0],
      dueDate: "",
      assignedEngineer: "",
      projectManager: "",
      customerRequirements: "",
      technicalSpecifications: "",
      notes: ""
    })
    setIsCreateDialogOpen(true)
  }

  const openEditDialog = (project: any) => {
    setEditingProject(project)
    setFormData({
      projectNumber: project.projectNumber || "",
      customerId: project.customerId || "",
      customerName: project.customerName || "",
      title: project.title || "",
      description: project.description || "",
      status: project.status || "Draft",
      priority: project.priority || "Medium",
      projectType: project.projectType || "Custom Design",
      estimatedHours: project.estimatedHours?.toString() || "",
      estimatedCost: project.estimatedCost?.toString() || "",
      startDate: project.startDate || "",
      dueDate: project.dueDate || "",
      assignedEngineer: project.assignedEngineer || "",
      projectManager: project.projectManager || "",
      customerRequirements: project.customerRequirements || "",
      technicalSpecifications: project.technicalSpecifications || "",
      notes: project.notes || ""
    })
    setIsEditDialogOpen(true)
  }

  const handleCreateProject = async () => {
    if (!formData.title || !formData.customerName) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const newProject = {
        projectNumber: formData.projectNumber,
        customerId: formData.customerId,
        customerName: formData.customerName,
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        projectType: formData.projectType,
        estimatedHours: parseInt(formData.estimatedHours) || 0,
        actualHours: 0,
        estimatedCost: parseFloat(formData.estimatedCost) || 0,
        actualCost: 0,
        startDate: formData.startDate,
        dueDate: formData.dueDate,
        assignedEngineer: formData.assignedEngineer,
        projectManager: formData.projectManager,
        customerRequirements: formData.customerRequirements,
        technicalSpecifications: formData.technicalSpecifications,
        constraints: ["Delivery timeline", "Customer specifications"],
        risks: ["Technical complexity", "Material availability"],
        deliverables: ["Engineering drawings", "BOM", "Production instructions"],
        revision: "1.0",
        notes: formData.notes
      }

      await createEngineeringProject(newProject)
      await refreshEngineeringProjects()

      setIsCreateDialogOpen(false)
      setEditingProject(null)

      alert("Project created successfully!")
    } catch (error) {
      console.error("Error creating project:", error)
      alert("Failed to create project")
    }
  }

  const handleUpdateProject = async () => {
    if (!editingProject || !formData.title || !formData.customerName) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const updatedProject = {
        ...editingProject,
        projectNumber: formData.projectNumber,
        customerId: formData.customerId,
        customerName: formData.customerName,
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        projectType: formData.projectType,
        estimatedHours: parseInt(formData.estimatedHours) || 0,
        estimatedCost: parseFloat(formData.estimatedCost) || 0,
        startDate: formData.startDate,
        dueDate: formData.dueDate,
        assignedEngineer: formData.assignedEngineer,
        projectManager: formData.projectManager,
        customerRequirements: formData.customerRequirements,
        technicalSpecifications: formData.technicalSpecifications,
        notes: formData.notes
      }

      await updateEngineeringProject(editingProject.id, updatedProject)
      await refreshEngineeringProjects()

      setIsEditDialogOpen(false)
      setEditingProject(null)

      alert("Project updated successfully!")
    } catch (error) {
      console.error("Error updating project:", error)
      alert("Failed to update project")
    }
  }

  // Calculate statistics
  const totalProjects = engineeringProjects.length
  const activeProjects = engineeringProjects.filter(p => p.status === "In Progress").length
  const completedProjects = engineeringProjects.filter(p => p.status === "Completed").length
  const onHoldProjects = engineeringProjects.filter(p => p.status === "On Hold").length
  const totalValue = engineeringProjects.reduce((sum, p) => sum + p.estimatedCost, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
              <p className="text-gray-600 mt-2">Manage engineering projects and track progress</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refreshEngineeringProjects()}>
                <Search className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Link href="/projects/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </Link>
              <Button variant="outline" onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Quick Create
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                {activeProjects} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProjects}</div>
              <p className="text-xs text-muted-foreground">
                Currently running
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedProjects}</div>
              <p className="text-xs text-muted-foreground">
                Successfully finished
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
              <p className="text-xs text-muted-foreground">
                Estimated project value
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search projects..."
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
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
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
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                    setPriorityFilter("all")
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Projects</CardTitle>
            <CardDescription>Complete list of engineering projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredProjects.map((project: any) => {
                const progress = project.actualHours > 0 ? Math.min((project.actualHours / project.estimatedHours) * 100, 100) : 0
                const isOverdue = new Date(project.dueDate) < new Date() && project.status !== "Completed"

                return (
                  <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getStatusIcon(project.status)}
                      </div>
                      <div>
                        <h3 className="font-medium">{project.title}</h3>
                        <p className="text-sm text-gray-500">{project.projectNumber} • {project.customerName}</p>
                        <p className="text-xs text-gray-400">{project.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm font-medium">{Math.round(progress)}%</p>
                        <p className="text-xs text-gray-500">Progress</p>
                        <div className="w-16 mt-1">
                          <Progress value={progress} className="h-1" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium" style={{ color: getPriorityColor(project.priority) }}>
                          {project.priority}
                        </p>
                        <p className="text-xs text-gray-500">Priority</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{formatCurrency(project.estimatedCost)}</p>
                        <p className="text-xs text-gray-500">Est. Cost</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{project.assignedEngineer || "Unassigned"}</p>
                        <p className="text-xs text-gray-500">Engineer</p>
                      </div>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                      {isOverdue && (
                        <Badge variant="destructive">
                          Overdue
                        </Badge>
                      )}
                      <div className="flex gap-2">
                        <Link href={`/projects/${project.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(project)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}

              {filteredProjects.length === 0 && (
                <div className="text-center py-8">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                      ? "Try adjusting your filters to see more results."
                      : "Get started by creating your first project."
                    }
                  </p>
                  <Button onClick={openCreateDialog}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Project Detail Dialog */}
        <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedProject?.title}</DialogTitle>
              <DialogDescription>
                Project: {selectedProject?.projectNumber}
              </DialogDescription>
            </DialogHeader>
            {selectedProject && (
              <div className="space-y-6">
                {/* Project Overview */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge className={getStatusColor(selectedProject.status)}>
                      {selectedProject.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Priority</Label>
                    <p className="text-sm" style={{ color: getPriorityColor(selectedProject.priority) }}>
                      {selectedProject.priority}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Customer</Label>
                    <p className="text-sm">{selectedProject.customerName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Project Type</Label>
                    <p className="text-sm">{selectedProject.projectType}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Assigned Engineer</Label>
                    <p className="text-sm">{selectedProject.assignedEngineer || "Unassigned"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Project Manager</Label>
                    <p className="text-sm">{selectedProject.projectManager || "Unassigned"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Estimated Cost</Label>
                    <p className="text-sm">{formatCurrency(selectedProject.estimatedCost)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Due Date</Label>
                    <p className="text-sm">{formatDate(selectedProject.dueDate)}</p>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <Label className="text-sm font-medium">Progress</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Progress value={Math.min((selectedProject.actualHours / selectedProject.estimatedHours) * 100, 100)} className="flex-1 h-2" />
                    <span className="text-sm">{selectedProject.actualHours}/{selectedProject.estimatedHours} hours</span>
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <Label className="text-sm font-medium">Customer Requirements</Label>
                  <p className="text-sm text-gray-700 mt-1">{selectedProject.customerRequirements}</p>
                </div>

                {/* Technical Specifications */}
                <div>
                  <Label className="text-sm font-medium">Technical Specifications</Label>
                  <p className="text-sm text-gray-700 mt-1">{selectedProject.technicalSpecifications}</p>
                </div>

                {/* Notes */}
                {selectedProject.notes && (
                  <div>
                    <Label className="text-sm font-medium">Notes</Label>
                    <p className="text-sm text-gray-700 mt-1">{selectedProject.notes}</p>
                  </div>
                )}

                {/* Work Orders Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Related Work Orders</Label>
                    <Link href="/production/work-orders">
                      <Button
                        size="sm"
                        variant="outline"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Create Work Order
                      </Button>
                    </Link>
                  </div>
                  <div className="mt-2 space-y-2">
                    {productionWorkOrders
                      .filter((wo: any) => wo.projectId === selectedProject.id)
                      .map((workOrder: any) => (
                        <div key={workOrder.id} className="p-3 border rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{workOrder.productName}</p>
                              <p className="text-xs text-gray-500">WO: {workOrder.workOrderNumber}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(workOrder.status)}>
                                {workOrder.status}
                              </Badge>
                              <span className="text-xs text-gray-500">{workOrder.progress}%</span>
                              <Link href="/production/work-orders">
                                <Button size="sm" variant="outline" className="text-xs">
                                  <Eye className="w-3 h-3 mr-1" />
                                  View
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    {productionWorkOrders.filter((wo: any) => wo.projectId === selectedProject.id).length === 0 && (
                      <p className="text-sm text-gray-500 italic">No work orders created for this project yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create/Edit Project Dialog */}
        <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open)
          setIsEditDialogOpen(open)
          if (!open) setEditingProject(null)
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? "Edit Project" : "Create New Project"}
              </DialogTitle>
              <DialogDescription>
                {editingProject ? "Update project details" : "Set up a new engineering project"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="projectNumber">Project Number *</Label>
                  <Input
                    id="projectNumber"
                    value={formData.projectNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectNumber: e.target.value }))}
                    placeholder="Project number"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Project title"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Customer name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Project description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: "Draft" | "Under Review" | "Approved" | "In Progress" | "On Hold" | "Completed") => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Under Review">Under Review</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: "Low" | "Medium" | "High" | "Critical") => setFormData(prev => ({ ...prev, priority: value }))}>
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
                  <Label htmlFor="projectType">Project Type</Label>
                  <Select value={formData.projectType} onValueChange={(value: "Custom Design" | "Modification" | "Standard Product" | "Prototype") => setFormData(prev => ({ ...prev, projectType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Custom Design">Custom Design</SelectItem>
                      <SelectItem value="Modification">Modification</SelectItem>
                      <SelectItem value="Standard Product">Standard Product</SelectItem>
                      <SelectItem value="Prototype">Prototype</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                    placeholder="Estimated hours"
                  />
                </div>
                <div>
                  <Label htmlFor="estimatedCost">Estimated Cost</Label>
                  <Input
                    id="estimatedCost"
                    type="number"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedCost: e.target.value }))}
                    placeholder="Estimated cost"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
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
                  <Label htmlFor="assignedEngineer">Assigned Engineer</Label>
                  <Input
                    id="assignedEngineer"
                    value={formData.assignedEngineer}
                    onChange={(e) => setFormData(prev => ({ ...prev, assignedEngineer: e.target.value }))}
                    placeholder="Engineer name"
                  />
                </div>
                <div>
                  <Label htmlFor="projectManager">Project Manager</Label>
                  <Input
                    id="projectManager"
                    value={formData.projectManager}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectManager: e.target.value }))}
                    placeholder="Project manager name"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="customerRequirements">Customer Requirements</Label>
                <Textarea
                  id="customerRequirements"
                  value={formData.customerRequirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerRequirements: e.target.value }))}
                  placeholder="Customer requirements"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="technicalSpecifications">Technical Specifications</Label>
                <Textarea
                  id="technicalSpecifications"
                  value={formData.technicalSpecifications}
                  onChange={(e) => setFormData(prev => ({ ...prev, technicalSpecifications: e.target.value }))}
                  placeholder="Technical specifications"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setIsCreateDialogOpen(false)
                  setIsEditDialogOpen(false)
                  setEditingProject(null)
                }}>
                  Cancel
                </Button>
                <Button onClick={editingProject ? handleUpdateProject : handleCreateProject}>
                  {editingProject ? "Update" : "Create"} Project
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
