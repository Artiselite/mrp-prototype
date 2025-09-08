"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { 
  Factory, 
  Users, 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Wrench,
  Play,
  Pause,
  Square
} from "lucide-react"
import { useDatabaseContext } from "@/components/database-provider"

export default function ShopfloorPage() {
  const { 
    workstations = [], 
    operators = [], 
    shopfloorActivities = [],
    productionWorkOrders: workOrders = [],
    updateProductionWorkOrder,
    createShopfloorActivity,
    refreshProductionWorkOrders
  } = useDatabaseContext()

  const [selectedWorkstation, setSelectedWorkstation] = useState<any>(null)

  // Function to update work order status and create activity
  const updateWorkOrderStatus = async (workOrderId: string, newStatus: "Planned" | "In Progress" | "Completed" | "Quality Approved" | "Quality Rejected", activityType: "Start" | "Pause" | "Resume" | "Complete" | "Issue", notes?: string) => {
    try {
      const workOrder = workOrders.find(wo => wo.id === workOrderId)
      if (!workOrder) return

      // Update work order status and progress
      let progress = workOrder.progress
      if (newStatus === "In Progress" && workOrder.status === "Planned") {
        progress = 10
      } else if (newStatus === "Completed") {
        progress = 100
      } else if (newStatus === "In Progress") {
        progress = Math.min(progress + 20, 90) // Increment progress
      }

      updateProductionWorkOrder(workOrderId, {
        ...workOrder,
        status: newStatus,
        progress: progress
      })

      // Create shopfloor activity
      const workstation = workstations.find(ws => ws.currentWorkOrder === workOrderId)
      const operator = operators.find(op => op.currentWorkOrder === workOrderId)
      
      if (workstation && operator) {
        createShopfloorActivity({
          workstationId: workstation.id,
          operatorId: operator.id,
          workOrderId: workOrderId,
          activityType: activityType,
          timestamp: new Date().toISOString(),
          notes: notes || `${activityType} for work order ${workOrderId}`
        })
      }

      // Refresh data
      refreshProductionWorkOrders()
    } catch (error) {
      console.error("Error updating work order status:", error)
    }
  }

  const getWorkstationStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800"
      case "Maintenance": return "bg-yellow-100 text-yellow-800"
      case "Idle": return "bg-gray-100 text-gray-800"
      case "Offline": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getOperatorStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800"
      case "On Break": return "bg-yellow-100 text-yellow-800"
      case "Off Duty": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getWorkOrderStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800"
      case "In Progress": return "bg-blue-100 text-blue-800"
      case "Planning": return "bg-yellow-100 text-yellow-800"
      case "On Hold": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getWorkstationTypeIcon = (type: string) => {
    switch (type) {
      case "Cutting": return <Factory className="w-4 h-4" />
      case "Welding": return <Wrench className="w-4 h-4" />
      case "Assembly": return <Users className="w-4 h-4" />
      case "Quality Control": return <CheckCircle className="w-4 h-4" />
      case "Packaging": return <Square className="w-4 h-4" />
      default: return <Factory className="w-4 h-4" />
    }
  }

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case "Start": return <Play className="w-4 h-4 text-green-600" />
      case "Pause": return <Pause className="w-4 h-4 text-yellow-600" />
      case "Resume": return <Play className="w-4 h-4 text-green-600" />
      case "Complete": return <CheckCircle className="w-4 h-4 text-blue-600" />
      case "Issue": return <AlertTriangle className="w-4 h-4 text-red-600" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const activeWorkstations = workstations.filter(ws => ws.status === "Active").length
  const totalWorkstations = workstations.length
  const activeOperators = operators.filter(op => op.status === "Active").length
  const totalOperators = operators.length

  return (
    <div className="space-y-6">
      {/* Shopfloor Status Notice */}
      {workstations.length === 0 ? (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Shopfloor Not Configured</span>
          </div>
          <p className="text-orange-700 text-sm mt-1">
            No workstations or operators have been set up yet. Complete the shopfloor setup process to start production.
          </p>
          <div className="mt-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const event = new CustomEvent('switchTab', { detail: 'journeys' })
                window.dispatchEvent(event)
              }}
              className="text-orange-700 border-orange-300 hover:bg-orange-100"
            >
              <Wrench className="w-4 h-4 mr-2" />
              Setup Shopfloor
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Shopfloor Configured</span>
          </div>
          <p className="text-green-700 text-sm mt-1">
            Your shopfloor is ready with {workstations.length} workstations and {operators.length} operators.
          </p>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => {
              const event = new CustomEvent('switchTab', { detail: 'work-orders' })
              window.dispatchEvent(event)
            }}
          >
            <Factory className="w-4 h-4" />
            View Work Orders
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => {
              const event = new CustomEvent('switchTab', { detail: 'quality' })
              window.dispatchEvent(event)
            }}
          >
            <CheckCircle className="w-4 h-4" />
            View Quality
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workstations</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeWorkstations}/{totalWorkstations}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((activeWorkstations / totalWorkstations) * 100)}% utilization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Operators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOperators}/{totalOperators}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((activeOperators / totalOperators) * 100)}% on duty
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Efficiency</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(workstations.reduce((acc, ws) => acc + ws.efficiency, 0) / workstations.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all workstations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Work Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workOrders.filter(wo => wo.status === "In Progress").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently in production
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Workstations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Workstations</CardTitle>
          <CardDescription>
            Real-time status of production workstations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workstation</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Work Order</TableHead>
                <TableHead>Efficiency</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workstations.map((workstation: any) => {
                const operator = operators.find((op: any) => op.id === workstation.currentOperator)
                const workOrder = workOrders.find((wo: any) => wo.id === workstation.currentWorkOrder)
                
                return (
                  <TableRow key={workstation.id}>
                    <TableCell className="font-medium">{workstation.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getWorkstationTypeIcon(workstation.type)}
                        {workstation.type}
                      </div>
                    </TableCell>
                    <TableCell>{workstation.location}</TableCell>
                    <TableCell>
                      <Badge className={getWorkstationStatusColor(workstation.status)}>
                        {workstation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {operator ? (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          {operator.name}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {workOrder ? (
                        <span className="font-mono text-sm">{workOrder.id}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={workstation.efficiency} className="w-16" />
                        <span className="text-sm">{workstation.efficiency}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={workstation.utilization} className="w-16" />
                        <span className="text-sm">{workstation.utilization}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {workOrder && (
                          <>
                            {workOrder.status === "Planned" && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updateWorkOrderStatus(workOrder.id, "In Progress", "Start", "Work order started")}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Play className="w-3 h-3 mr-1" />
                                Start
                              </Button>
                            )}
                            {workOrder.status === "In Progress" && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => updateWorkOrderStatus(workOrder.id, "In Progress", "Pause", "Work order paused")}
                                  className="text-yellow-600 hover:text-yellow-700"
                                >
                                  <Pause className="w-3 h-3 mr-1" />
                                  Pause
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => updateWorkOrderStatus(workOrder.id, "Completed", "Complete", "Work order completed")}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Complete
                                </Button>
                              </>
                            )}
                          </>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedWorkstation(workstation)}
                        >
                          Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Operators Table */}
      <Card>
        <CardHeader>
          <CardTitle>Operators</CardTitle>
          <CardDescription>
            Current status and assignments of production operators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Operator</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Workstation</TableHead>
                <TableHead>Work Order</TableHead>
                <TableHead>Efficiency</TableHead>
                <TableHead>Total Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operators.map((operator: any) => {
                const workstation = workstations.find((ws: any) => ws.id === operator.currentWorkstation)
                const workOrder = workOrders.find((wo: any) => wo.id === operator.currentWorkOrder)
                
                return (
                  <TableRow key={operator.id}>
                    <TableCell className="font-medium">{operator.name}</TableCell>
                    <TableCell className="font-mono text-sm">{operator.employeeId}</TableCell>
                    <TableCell>{operator.position}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{operator.shift}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getOperatorStatusColor(operator.status)}>
                        {operator.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {workstation ? (
                        <div className="flex items-center gap-2">
                          {getWorkstationTypeIcon(workstation.type)}
                          {workstation.name}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {workOrder ? (
                        <span className="font-mono text-sm">{workOrder.id}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={operator.efficiency} className="w-16" />
                        <span className="text-sm">{operator.efficiency}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{operator.totalHours}h</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Active Work Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Active Work Orders</CardTitle>
          <CardDescription>
            Work orders currently in production on the shopfloor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Work Order</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Workstation</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workOrders.filter((wo: any) => wo.status === "In Progress").map((workOrder: any) => {
                const workstation = workstations.find((ws: any) => ws.currentWorkOrder === workOrder.id)
                const operator = operators.find((op: any) => op.currentWorkOrder === workOrder.id)
                
                return (
                  <TableRow key={workOrder.id}>
                    <TableCell className="font-medium">{workOrder.id}</TableCell>
                    <TableCell>{workOrder.productName}</TableCell>
                    <TableCell>
                      {workstation ? (
                        <div className="flex items-center gap-2">
                          {getWorkstationTypeIcon(workstation.type)}
                          {workstation.name}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {operator ? (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          {operator.name}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={workOrder.progress} className="w-16" />
                        <span className="text-sm">{workOrder.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getWorkOrderStatusColor(workOrder.status)}>
                        {workOrder.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{workOrder.dueDate}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateWorkOrderStatus(workOrder.id, "In Progress", "Resume", "Work order resumed")}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Resume
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateWorkOrderStatus(workOrder.id, "Completed", "Complete", "Work order completed")}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Complete
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const event = new CustomEvent('switchTab', { detail: 'work-orders' })
                            window.dispatchEvent(event)
                          }}
                        >
                          Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>
            Latest shopfloor activities and status changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Workstation</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Work Order</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shopfloorActivities.slice(0, 10).map((activity: any) => {
                const workstation = workstations.find((ws: any) => ws.id === activity.workstationId)
                const operator = operators.find((op: any) => op.id === activity.operatorId)
                const workOrder = workOrders.find((wo: any) => wo.id === activity.workOrderId)
                
                return (
                  <TableRow key={activity.id}>
                    <TableCell className="font-mono text-sm">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActivityIcon(activity.activityType)}
                        {activity.activityType}
                      </div>
                    </TableCell>
                    <TableCell>{workstation?.name || activity.workstationId}</TableCell>
                    <TableCell>{operator?.name || activity.operatorId}</TableCell>
                    <TableCell>
                      {workOrder ? (
                        <span className="font-mono text-sm">{workOrder.id}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {activity.notes || "-"}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
