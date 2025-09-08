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
  Eye
} from "lucide-react"
import Link from "next/link"
import { useDatabaseContext } from "@/components/database-provider"
import { formatDate, formatCurrency } from "@/lib/data"

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [projectId, setProjectId] = useState<string | null>(null)
  const { 
    engineeringProjects: projects = [], 
    productionWorkOrders: workOrders = [],
    isInitialized
  } = useDatabaseContext()

  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="workorders">Work Orders</TabsTrigger>
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
    </div>
  )
}
