"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Edit, Play, Pause, CheckCircle, Clock, Users, AlertTriangle, FileText, Camera } from 'lucide-react'
import Link from "next/link"

export default function WorkOrderDetailPage({ params }: { params: { id: string } }) {
  const [workOrder] = useState({
    id: "WO-2024-001",
    bomId: "BOM-2024-001",
    project: "Industrial Warehouse Frame",
    customer: "ABC Steel Works",
    status: "In Progress",
    priority: "High",
    progress: 65,
    startDate: "2024-01-15",
    dueDate: "2024-02-15",
    assignedTeam: "Team A",
    supervisor: "Mike Johnson",
    estimatedHours: 240,
    actualHours: 156,
    notes: "High priority project. Customer requires completion by end of February for construction schedule."
  })

  const [operations] = useState([
    { 
      id: 1,
      step: "Material Cutting", 
      status: "Completed", 
      estimatedDuration: 2, 
      actualDuration: 1.8,
      startDate: "2024-01-15",
      endDate: "2024-01-16",
      assignedWorker: "Tom Wilson",
      notes: "All cuts completed to specification",
      progress: 100
    },
    { 
      id: 2,
      step: "Welding", 
      status: "In Progress", 
      estimatedDuration: 5, 
      actualDuration: 3.2,
      startDate: "2024-01-17",
      endDate: null,
      assignedWorker: "Sarah Davis",
      notes: "60% complete, on schedule",
      progress: 60
    },
    { 
      id: 3,
      step: "Assembly", 
      status: "Pending", 
      estimatedDuration: 3, 
      actualDuration: null,
      startDate: null,
      endDate: null,
      assignedWorker: "Mike Johnson",
      notes: "Waiting for welding completion",
      progress: 0
    },
    { 
      id: 4,
      step: "Quality Check", 
      status: "Pending", 
      estimatedDuration: 1, 
      actualDuration: null,
      startDate: null,
      endDate: null,
      assignedWorker: "Quality Team",
      notes: "Final inspection and testing",
      progress: 0
    }
  ])

  const [qualityChecks] = useState([
    {
      checkpoint: "Material Inspection",
      status: "Passed",
      inspector: "Quality Team",
      date: "2024-01-15",
      notes: "All materials meet specifications"
    },
    {
      checkpoint: "Weld Quality Check",
      status: "In Progress",
      inspector: "Sarah Davis",
      date: "2024-01-18",
      notes: "Visual inspection ongoing"
    },
    {
      checkpoint: "Dimensional Check",
      status: "Pending",
      inspector: "Quality Team",
      date: null,
      notes: "Scheduled after assembly"
    },
    {
      checkpoint: "Final Inspection",
      status: "Pending",
      inspector: "Quality Team",
      date: null,
      notes: "Complete system verification"
    }
  ])

  const [timeTracking] = useState([
    { date: "2024-01-15", worker: "Tom Wilson", operation: "Material Cutting", hours: 8, notes: "Cut all beams and plates" },
    { date: "2024-01-16", worker: "Tom Wilson", operation: "Material Cutting", hours: 6, notes: "Finished cutting angles" },
    { date: "2024-01-17", worker: "Sarah Davis", operation: "Welding", hours: 8, notes: "Started beam welding" },
    { date: "2024-01-18", worker: "Sarah Davis", operation: "Welding", hours: 8, notes: "Continued welding operations" },
    { date: "2024-01-19", worker: "Sarah Davis", operation: "Welding", hours: 7.5, notes: "Column welding in progress" }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800"
      case "In Progress": return "bg-blue-100 text-blue-800"
      case "Pending": return "bg-gray-100 text-gray-800"
      case "On Hold": return "bg-red-100 text-red-800"
      case "Passed": return "bg-green-100 text-green-800"
      case "Failed": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "High": return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "Medium": return <Clock className="w-4 h-4 text-yellow-500" />
      case "Low": return <CheckCircle className="w-4 h-4 text-green-500" />
      default: return null
    }
  }

  const getOperationIcon = (status: string) => {
    switch (status) {
      case "Completed": return <CheckCircle className="w-4 h-4 text-green-500" />
      case "In Progress": return <Play className="w-4 h-4 text-blue-500" />
      case "Pending": return <Pause className="w-4 h-4 text-gray-500" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/production">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Production
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{workOrder.id}</h1>
                  <Badge className={getStatusColor(workOrder.status)}>
                    {workOrder.status}
                  </Badge>
                  {getPriorityIcon(workOrder.priority)}
                </div>
                <p className="text-sm text-gray-600">{workOrder.project} - {workOrder.customer}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Camera className="w-4 h-4 mr-2" />
                Add Photos
              </Button>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Update Status
              </Button>
              <Button>
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Order
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="col-span-3">
            <Tabs defaultValue="operations" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="operations">Operations</TabsTrigger>
                <TabsTrigger value="quality">Quality</TabsTrigger>
                <TabsTrigger value="time">Time Tracking</TabsTrigger>
                <TabsTrigger value="overview">Overview</TabsTrigger>
              </TabsList>

              <TabsContent value="operations" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Production Operations</CardTitle>
                    <CardDescription>Current status of all production steps</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {operations.map((operation) => (
                        <div key={operation.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              {getOperationIcon(operation.status)}
                              <div>
                                <h3 className="font-medium">{operation.step}</h3>
                                <p className="text-sm text-gray-600">Assigned to: {operation.assignedWorker}</p>
                              </div>
                            </div>
                            <Badge className={getStatusColor(operation.status)}>
                              {operation.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-4 mb-3">
                            <div>
                              <label className="text-xs font-medium text-gray-500">ESTIMATED</label>
                              <p className="text-sm">{operation.estimatedDuration} days</p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-500">ACTUAL</label>
                              <p className="text-sm">{operation.actualDuration || "—"} days</p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-500">START DATE</label>
                              <p className="text-sm">{operation.startDate || "—"}</p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-500">END DATE</label>
                              <p className="text-sm">{operation.endDate || "—"}</p>
                            </div>
                          </div>

                          <div className="mb-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">Progress</span>
                              <span className="text-sm text-gray-600">{operation.progress}%</span>
                            </div>
                            <Progress value={operation.progress} className="h-2" />
                          </div>

                          {operation.notes && (
                            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                              {operation.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="quality" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quality Control Checkpoints</CardTitle>
                    <CardDescription>Quality assurance throughout production</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Checkpoint</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Inspector</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {qualityChecks.map((check, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{check.checkpoint}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(check.status)}>
                                {check.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{check.inspector}</TableCell>
                            <TableCell>{check.date || "—"}</TableCell>
                            <TableCell className="max-w-xs truncate">{check.notes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="time" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Time Tracking</CardTitle>
                    <CardDescription>Detailed time log for all operations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Worker</TableHead>
                          <TableHead>Operation</TableHead>
                          <TableHead>Hours</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {timeTracking.map((entry, index) => (
                          <TableRow key={index}>
                            <TableCell>{entry.date}</TableCell>
                            <TableCell className="font-medium">{entry.worker}</TableCell>
                            <TableCell>{entry.operation}</TableCell>
                            <TableCell className="font-medium">{entry.hours}h</TableCell>
                            <TableCell className="max-w-xs truncate">{entry.notes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Estimated Hours</p>
                          <p className="text-xl font-bold">{workOrder.estimatedHours}h</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Actual Hours</p>
                          <p className="text-xl font-bold">{workOrder.actualHours}h</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Efficiency</p>
                          <p className="text-xl font-bold">
                            {((workOrder.estimatedHours / workOrder.actualHours) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Work Order Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Source BOM</label>
                          <p className="mt-1 font-medium">{workOrder.bomId}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Project</label>
                          <p className="mt-1">{workOrder.project}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Customer</label>
                          <p className="mt-1">{workOrder.customer}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Assigned Team</label>
                          <p className="mt-1">{workOrder.assignedTeam}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Supervisor</label>
                          <p className="mt-1">{workOrder.supervisor}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Start Date</label>
                          <p className="mt-1">{workOrder.startDate}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Due Date</label>
                          <p className="mt-1">{workOrder.dueDate}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Priority</label>
                          <div className="flex items-center gap-2 mt-1">
                            {getPriorityIcon(workOrder.priority)}
                            <span>{workOrder.priority}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <label className="text-sm font-medium text-gray-500">Notes</label>
                      <p className="mt-1 text-gray-700">{workOrder.notes}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progress Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm font-bold">{workOrder.progress}%</span>
                  </div>
                  <Progress value={workOrder.progress} className="h-3" />
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-2 bg-blue-50 rounded">
                    <p className="text-xs text-blue-600">DAYS ELAPSED</p>
                    <p className="font-bold">12</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded">
                    <p className="text-xs text-green-600">DAYS REMAINING</p>
                    <p className="font-bold">19</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Team Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">SUPERVISOR</label>
                  <p className="text-sm font-medium">{workOrder.supervisor}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">TEAM</label>
                  <p className="text-sm">{workOrder.assignedTeam}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">ACTIVE WORKERS</label>
                  <p className="text-sm">3 workers</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Play className="w-4 h-4 mr-2" />
                  Start Next Operation
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Clock className="w-4 h-4 mr-2" />
                  Log Time
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Quality Check
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Camera className="w-4 h-4 mr-2" />
                  Add Progress Photos
                </Button>
              </CardContent>
            </Card>

            {/* Related Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Related Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Source BOM
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Engineering Drawing
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Quality Reports
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
