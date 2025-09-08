"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

import { 
  Factory, 
  Users, 
  CheckCircle, 
  BarChart3,
  Settings,
  FileText,
  Target,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Wrench,
  Play,
  Pause,
  Square,
  MapPin,
  Calendar,
  User,
  Building,
  Zap,
  Shield,
  Eye,
  Edit,
  Plus,
  Filter,
  Search,
  RefreshCw
} from "lucide-react"
import { useDatabaseContext } from "@/components/database-provider"
import Link from "next/link"

export default function ProductionDashboard() {
  const { 
    workstations = [], 
    operators = [], 
    productionWorkOrders: workOrders = [],
    qualityInspections = [],
    qualityTests = [],
    shopfloorActivities = []
  } = useDatabaseContext()

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Update last updated time when data changes
  useEffect(() => {
    setLastUpdated(new Date())
  }, [workstations, operators, workOrders, qualityInspections, qualityTests, shopfloorActivities])

  // Calculate key metrics
  const totalWorkstations = workstations.length
  const activeWorkstations = workstations.filter(ws => ws.status === "Active").length
  const totalOperators = operators.length
  const activeOperators = operators.filter(op => op.status === "Active").length
  const totalWorkOrders = workOrders.length
  const activeWorkOrders = workOrders.filter(wo => wo.status === "In Progress").length
  const completedWorkOrders = workOrders.filter(wo => wo.status === "Completed" || wo.status === "Quality Approved").length
  const totalInspections = qualityInspections.length
  const passedInspections = qualityInspections.filter(qi => qi.status === "Passed").length
  const totalTests = qualityTests.length
  const completedTests = qualityTests.filter(qt => qt.status === "Completed").length

  // Calculate efficiency metrics
  const avgEfficiency = workstations.length > 0 ? 
    Math.round(workstations.reduce((acc, ws) => acc + ws.efficiency, 0) / workstations.length) : 0
  const avgUtilization = workstations.length > 0 ? 
    Math.round(workstations.reduce((acc, ws) => acc + ws.utilization, 0) / workstations.length) : 0
  const qualityPassRate = totalInspections > 0 ? 
    Math.round((passedInspections / totalInspections) * 100) : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800"
      case "In Progress": return "bg-blue-100 text-blue-800"
      case "Completed": return "bg-green-100 text-green-800"
      case "Quality Approved": return "bg-purple-100 text-purple-800"
      case "Planned": return "bg-yellow-100 text-yellow-800"
      case "On Hold": return "bg-red-100 text-red-800"
      case "Maintenance": return "bg-orange-100 text-orange-800"
      case "Idle": return "bg-gray-100 text-gray-800"
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

  return (
    <div className="space-y-6">
      {/* Live Data Indicator */}
      <div className="flex items-center justify-end gap-2 text-sm text-gray-500">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Live data • Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Loading...'}</span>
      </div>

      {/* Overview Content */}
      <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Production</CardTitle>
                  <Factory className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeWorkOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    {totalWorkOrders} total work orders
                  </p>
                  <div className="mt-2">
                    <Progress value={(activeWorkOrders / Math.max(totalWorkOrders, 1)) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Shopfloor Efficiency</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{avgEfficiency}%</div>
                  <p className="text-xs text-muted-foreground">
                    {activeWorkstations}/{totalWorkstations} workstations active
                  </p>
                  <div className="mt-2">
                    <Progress value={avgEfficiency} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quality Pass Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{qualityPassRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    {passedInspections}/{totalInspections} inspections passed
                  </p>
                  <div className="mt-2">
                    <Progress value={qualityPassRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Resource Utilization</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{avgUtilization}%</div>
                  <p className="text-xs text-muted-foreground">
                    {activeOperators}/{totalOperators} operators on duty
                  </p>
                  <div className="mt-2">
                    <Progress value={avgUtilization} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Production Status Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Work Order Status Distribution</CardTitle>
                  <CardDescription>Current status of all work orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["Planned", "In Progress", "Completed", "Quality Approved", "On Hold"].map((status) => {
                      const count = workOrders.filter(wo => wo.status === status).length
                      const percentage = totalWorkOrders > 0 ? (count / totalWorkOrders) * 100 : 0
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(status)}>
                              {status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{count}</span>
                            <div className="w-20">
                              <Progress value={percentage} className="h-2" />
                            </div>
                            <span className="text-xs text-gray-500 w-8">{Math.round(percentage)}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>Latest shopfloor activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {shopfloorActivities.slice(0, 5).map((activity: any) => {
                      const workstation = workstations.find(ws => ws.id === activity.workstationId)
                      const operator = operators.find(op => op.id === activity.operatorId)
                      const workOrder = workOrders.find(wo => wo.id === activity.workOrderId)
                      
                      return (
                        <div key={activity.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                          <div className="p-1 bg-blue-100 rounded">
                            <Activity className="w-3 h-3 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {activity.activityType} - {workOrder?.productName || "Unknown Product"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {workstation?.name} • {operator?.name} • {new Date(activity.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    {shopfloorActivities.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No recent activities</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common production management tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/production/setup">
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2">
                      <Settings className="w-6 h-6" />
                      <span className="text-sm">Setup Shopfloor</span>
                    </Button>
                  </Link>
                  <Link href="/production/create-wizard">
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2">
                      <Plus className="w-6 h-6" />
                      <span className="text-sm">Create Work Order</span>
                    </Button>
                  </Link>
                  <Link href="/production/quality-setup">
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2">
                      <Shield className="w-6 h-6" />
                      <span className="text-sm">Quality Setup</span>
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2">
                    <BarChart3 className="w-6 h-6" />
                    <span className="text-sm">View Analytics</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
      </div>
    </div>
  )
}
