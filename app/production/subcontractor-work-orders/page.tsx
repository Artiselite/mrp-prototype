"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  AlertTriangle,
  CheckCircle,
  Clock,
  AlertCircle,
  Target,
  Shield,
  Settings,
  Building,
  Calendar,
  DollarSign,
} from "lucide-react"
import Link from "next/link"
import { useDatabaseContext } from "@/components/database-provider"
import { formatCurrency } from "@/lib/data"

export default function SubcontractorWorkOrdersPage() {
  const { 
    subcontractorWorkOrders = [], 
    suppliers = [],
    engineeringProjects = [],
    isInitialized,
    isLoading
  } = useDatabaseContext()


  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [workTypeFilter, setWorkTypeFilter] = useState("all")
  const [projectFilter, setProjectFilter] = useState("all")

  // Filter work orders based on search and filters
  const filteredWorkOrders = subcontractorWorkOrders.filter((workOrder: any) => {
    if (!workOrder) return false
    
    const matchesSearch = (workOrder.workOrderNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (workOrder.workDescription || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (workOrder.supplierName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (workOrder.assignedTo || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || workOrder.status === statusFilter
    const matchesPriority = priorityFilter === "all" || workOrder.priority === priorityFilter
    const matchesWorkType = workTypeFilter === "all" || workOrder.workType === workTypeFilter
    const matchesProject = projectFilter === "all" || workOrder.projectId === projectFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesWorkType && matchesProject
  })


  // Show loading state if data is not yet initialized
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subcontractor work orders...</p>
        </div>
      </div>
    )
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

  const getWorkTypeIcon = (workType: string) => {
    switch (workType) {
      case "Fabrication":
        return <Wrench className="w-4 h-4 text-blue-500" />
      case "Assembly":
        return <Settings className="w-4 h-4 text-green-500" />
      case "Welding":
        return <Wrench className="w-4 h-4 text-orange-500" />
      case "Machining":
        return <Wrench className="w-4 h-4 text-purple-500" />
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "In Progress":
        return <Clock className="w-4 h-4 text-blue-500" />
      case "On Hold":
        return <AlertCircle className="w-4 h-4 text-orange-500" />
      case "Cancelled":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Subcontractor Work Orders</h1>
              <p className="text-sm text-gray-600">Manage subcontractor work orders and track progress</p>
            </div>
            <Link href="/production/subcontractor-work-orders/create">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Work Order
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search work orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Sent">Sent</SelectItem>
                  <SelectItem value="Acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={workTypeFilter} onValueChange={setWorkTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Work Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Work Types</SelectItem>
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

              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {engineeringProjects.map((project: any) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Work Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Subcontractor Work Orders ({filteredWorkOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Work Order</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Subcontractor</TableHead>
                    <TableHead>Work Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkOrders.map((workOrder: any) => {
                    if (!workOrder) return null
                    const project = engineeringProjects.find((p: any) => p.id === workOrder.projectId)
                    return (
                      <TableRow key={workOrder.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getWorkTypeIcon(workOrder.workType || "Other")}
                            <div>
                              <p className="font-medium">{workOrder.workOrderNumber || "N/A"}</p>
                              <p className="text-sm text-gray-600 truncate max-w-[200px]">
                                {workOrder.workDescription || "No description"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{project?.title || "Unknown Project"}</p>
                            <p className="text-sm text-gray-600">{workOrder.projectId}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="font-medium">{workOrder.supplierName || "Unknown Supplier"}</p>
                              <p className="text-sm text-gray-600">{workOrder.supplierId || "N/A"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getWorkTypeIcon(workOrder.workType || "Other")}
                            <span>{workOrder.workType || "Other"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(workOrder.status || "Draft")}
                            <Badge className={getStatusColor(workOrder.status || "Draft")}>
                              {workOrder.status || "Draft"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPriorityIcon(workOrder.priority || "Medium")}
                            <span className="text-sm">{workOrder.priority || "Medium"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">{workOrder.progress || 0}%</span>
                            </div>
                            <Progress value={workOrder.progress || 0} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{formatCurrency(workOrder.estimatedCost || 0)}</p>
                            {(workOrder.actualCost || 0) > 0 && (
                              <p className="text-sm text-gray-600">
                                Actual: {formatCurrency(workOrder.actualCost || 0)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{workOrder.dueDate || "N/A"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{workOrder.assignedTo || "Unassigned"}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Link 
                              href={`/production/subcontractor-work-orders/${workOrder.id}`} 
                              className="inline-block"
                            >
                              <Button variant="ghost" size="sm" title="View Details">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link 
                              href={`/production/subcontractor-work-orders/${workOrder.id}/edit`} 
                              className="inline-block"
                            >
                              <Button variant="ghost" size="sm" title="Edit Work Order">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {filteredWorkOrders.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No work orders found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== "all" || priorityFilter !== "all" || workTypeFilter !== "all" || projectFilter !== "all"
                  ? "Try adjusting your search criteria or filters."
                  : "Get started by creating your first subcontractor work order."}
              </p>
              <Link href="/production/subcontractor-work-orders/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Work Order
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
