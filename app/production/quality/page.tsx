"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  TestTube,
  BarChart3,
  Factory,
  Users,
  Plus,
  Wrench,
  Star
} from "lucide-react"
import { useDatabaseContext } from "@/components/database-provider"

export default function QualityPage() {
  const {
    qualityInspections = [],
    qualityTests = [],
    qualityMetrics = [],
    productionWorkOrders: workOrders = [],
    workstations = [],
    operators = [],
    updateProductionWorkOrder,
    createQualityInspection,
    createQualityTest,
    updateQualityInspection,
    updateQualityTest,
    refreshProductionWorkOrders,
    refreshQualityInspections,
    refreshQualityTests
  } = useDatabaseContext()

  const [selectedInspection, setSelectedInspection] = useState<any>(null)
  const [showCreateInspection, setShowCreateInspection] = useState(false)
  const [showCreateTest, setShowCreateTest] = useState(false)
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null)

  // Function to update inspection status
  const updateInspectionStatus = (inspectionId: string, newStatus: string) => {
    try {
      const updated = updateQualityInspection(inspectionId, {
        status: newStatus as "Pending" | "In Progress" | "Passed" | "Failed" | "Rejected",
        completedDate: newStatus === "Passed" || newStatus === "Failed" ? new Date().toISOString() : undefined
      })

      if (updated) {
        refreshQualityInspections()
        alert(`Inspection ${inspectionId} status updated to ${newStatus}`)
      } else {
        alert("Failed to update inspection status")
      }
    } catch (error) {
      console.error("Error updating inspection status:", error)
      alert("Error updating inspection status")
    }
  }

  // Function to update test status
  const updateTestStatus = (testId: string, newStatus: string) => {
    try {
      const updated = updateQualityTest(testId, {
        status: newStatus as "Scheduled" | "In Progress" | "Completed" | "Failed",
        completedDate: newStatus === "Completed" || newStatus === "Failed" ? new Date().toISOString() : undefined
      })

      if (updated) {
        refreshQualityTests()
        alert(`Test ${testId} status updated to ${newStatus}`)
      } else {
        alert("Failed to update test status")
      }
    } catch (error) {
      console.error("Error updating test status:", error)
      alert("Error updating test status")
    }
  }

  // Function to create quality inspection for a work order
  const createInspectionForWorkOrder = async (workOrderId: string) => {
    try {
      const workOrder = workOrders.find(wo => wo.id === workOrderId)
      if (!workOrder) {
        alert("Work order not found")
        return
      }

      // Get first available workstation and operator
      const workstation = workstations[0]
      const operator = operators[0]

      if (!workstation || !operator) {
        alert("No workstations or operators available. Please set up workstations and operators first.")
        return
      }

      const inspectionData = {
        workOrderId: workOrderId,
        workstationId: workstation.id,
        operatorId: operator.id,
        inspectionType: "Final" as const,
        inspector: "Quality Inspector",
        status: "Pending" as const,
        scheduledDate: new Date().toISOString(),
        specifications: [
          {
            id: `spec_${Date.now()}_1`,
            parameter: "Dimensions",
            target: 100,
            tolerance: 0.5,
            unit: "mm",
            criticality: "Critical" as const,
            method: "Calipers"
          },
          {
            id: `spec_${Date.now()}_2`,
            parameter: "Surface Finish",
            target: 1.6,
            tolerance: 0.2,
            unit: "μm",
            criticality: "Major" as const,
            method: "Surface Roughness Tester"
          }
        ],
        results: [],
        notes: `Quality inspection scheduled for work order ${workOrder.workOrderNumber} - ${workOrder.productName}`
      }

      const newInspection = createQualityInspection(inspectionData)
      if (newInspection) {
        refreshQualityInspections()
        alert(`Quality inspection scheduled for work order ${workOrder.workOrderNumber}`)
      } else {
        alert("Failed to create quality inspection")
      }
    } catch (error) {
      console.error("Error creating quality inspection:", error)
      alert("Error creating quality inspection")
    }
  }

  // Function to create quality test for a work order
  const createTestForWorkOrder = async (workOrderId: string) => {
    try {
      const workOrder = workOrders.find(wo => wo.id === workOrderId)
      if (!workOrder) {
        alert("Work order not found")
        return
      }

      const testData = {
        workOrderId: workOrderId,
        name: `Material Test - ${workOrder.productName}`,
        type: "Material" as const,
        technician: "Lab Technician",
        equipment: "Testing Machine",
        status: "Scheduled" as const,
        scheduledDate: new Date().toISOString(),
        results: [],
        standards: ["ASTM A992", "AISC 360"],
        notes: `Material test scheduled for work order ${workOrder.workOrderNumber}`
      }

      const newTest = createQualityTest(testData)
      if (newTest) {
        refreshQualityTests()
        alert(`Quality test scheduled for work order ${workOrder.workOrderNumber}`)
      } else {
        alert("Failed to create quality test")
      }
    } catch (error) {
      console.error("Error creating quality test:", error)
      alert("Error creating quality test")
    }
  }

  // Function to update work order status based on quality results
  const updateWorkOrderQualityStatus = (workOrderId: string) => {
    try {
      const workOrder = workOrders.find(wo => wo.id === workOrderId)
      if (!workOrder) {
        alert("Work order not found")
        return
      }

      const workOrderInspections = qualityInspections.filter(qi => qi.workOrderId === workOrderId)
      const workOrderTests = qualityTests.filter(qt => qt.workOrderId === workOrderId)

      if (workOrderInspections.length === 0 && workOrderTests.length === 0) {
        alert("No quality inspections or tests found for this work order")
        return
      }

      let newStatus = workOrder.status
      let newProgress = workOrder.progress
      let statusMessage = ""

      if (workOrderInspections.length > 0 && workOrderTests.length > 0) {
        const allInspectionsPassed = workOrderInspections.every(qi => qi.status === "Passed")
        const allTestsCompleted = workOrderTests.every(qt => qt.status === "Completed")

        if (allInspectionsPassed && allTestsCompleted) {
          newStatus = "Quality Approved"
          newProgress = 95
          statusMessage = "All quality checks passed - work order approved"
        } else if (workOrderInspections.some(qi => qi.status === "Failed") || workOrderTests.some(qt => qt.status === "Failed")) {
          newStatus = "Quality Rejected"
          newProgress = 80
          statusMessage = "Quality issues detected - work order rejected"
        } else {
          newStatus = "In Progress"
          newProgress = Math.min(workOrder.progress + 10, 90)
          statusMessage = "Quality checks in progress"
        }
      } else if (workOrderInspections.length > 0) {
        const allInspectionsPassed = workOrderInspections.every(qi => qi.status === "Passed")
        if (allInspectionsPassed) {
          newStatus = "In Progress"
          newProgress = Math.min(workOrder.progress + 5, 90)
          statusMessage = "Inspections passed - awaiting tests"
        } else if (workOrderInspections.some(qi => qi.status === "Failed")) {
          newStatus = "Quality Rejected"
          newProgress = 80
          statusMessage = "Inspection failed - work order rejected"
        }
      } else if (workOrderTests.length > 0) {
        const allTestsCompleted = workOrderTests.every(qt => qt.status === "Completed")
        if (allTestsCompleted) {
          newStatus = "In Progress"
          newProgress = Math.min(workOrder.progress + 5, 90)
          statusMessage = "Tests completed - awaiting inspections"
        } else if (workOrderTests.some(qt => qt.status === "Failed")) {
          newStatus = "Quality Rejected"
          newProgress = 80
          statusMessage = "Test failed - work order rejected"
        }
      }

      const updated = updateProductionWorkOrder(workOrderId, {
        status: newStatus,
        progress: newProgress,
        notes: statusMessage
      })

      if (updated) {
        refreshProductionWorkOrders()
        alert(`Work order ${workOrder.workOrderNumber} status updated: ${statusMessage}`)
      } else {
        alert("Failed to update work order status")
      }
    } catch (error) {
      console.error("Error updating work order quality status:", error)
      alert("Error updating work order quality status")
    }
  }

  // Function to create comprehensive quality inspection
  const createComprehensiveInspection = async (workOrderId: string, inspectionType: string) => {
    try {
      const workOrder = workOrders.find(wo => wo.id === workOrderId)
      if (!workOrder) {
        alert("Work order not found")
        return
      }

      // Get first available workstation and operator
      const workstation = workstations[0]
      const operator = operators[0]

      if (!workstation || !operator) {
        alert("No workstations or operators available. Please set up workstations and operators first.")
        return
      }

      const inspectionData = {
        workOrderId: workOrderId,
        workstationId: workstation.id,
        operatorId: operator.id,
        inspectionType: inspectionType as "Incoming" | "In-Process" | "Final" | "First Article",
        inspector: "Quality Inspector",
        status: "Pending" as const,
        scheduledDate: new Date().toISOString(),
        specifications: [
          {
            id: `spec_${Date.now()}_1`,
            parameter: "Dimensions",
            target: 100,
            tolerance: 0.5,
            unit: "mm",
            criticality: "Critical" as const,
            method: "Calipers"
          },
          {
            id: `spec_${Date.now()}_2`,
            parameter: "Surface Finish",
            target: 1.6,
            tolerance: 0.2,
            unit: "μm",
            criticality: "Major" as const,
            method: "Surface Roughness Tester"
          },
          {
            id: `spec_${Date.now()}_3`,
            parameter: "Material Grade",
            target: 0,
            tolerance: 0,
            unit: "Grade",
            criticality: "Critical" as const,
            method: "Material Certificate"
          }
        ],
        results: [],
        notes: `${inspectionType} inspection scheduled for work order ${workOrder.workOrderNumber} - ${workOrder.productName}`
      }

      const newInspection = createQualityInspection(inspectionData)
      if (newInspection) {
        refreshQualityInspections()
        alert(`${inspectionType} inspection scheduled for work order ${workOrder.workOrderNumber}`)
      } else {
        alert("Failed to create inspection")
      }
    } catch (error) {
      console.error("Error creating comprehensive inspection:", error)
      alert("Error creating inspection")
    }
  }

  // Function to create comprehensive quality test
  const createComprehensiveTest = async (workOrderId: string, testType: string) => {
    try {
      const workOrder = workOrders.find(wo => wo.id === workOrderId)
      if (!workOrder) {
        alert("Work order not found")
        return
      }

      const testData = {
        workOrderId: workOrderId,
        name: `${testType} Test - ${workOrder.productName}`,
        type: testType as "Dimensional" | "Material" | "Welding" | "Coating" | "NDT",
        technician: "Lab Technician",
        equipment: "Testing Machine",
        status: "Scheduled" as const,
        scheduledDate: new Date().toISOString(),
        results: [],
        standards: ["ASTM A992", "AISC 360", "AWS D1.1"],
        notes: `${testType} test scheduled for work order ${workOrder.workOrderNumber}`
      }

      const newTest = createQualityTest(testData)
      if (newTest) {
        refreshQualityTests()
        alert(`${testType} test scheduled for work order ${workOrder.workOrderNumber}`)
      } else {
        alert("Failed to create test")
      }
    } catch (error) {
      console.error("Error creating comprehensive test:", error)
      alert("Error creating test")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Passed": return "bg-green-100 text-green-800"
      case "Failed": return "bg-red-100 text-red-800"
      case "In Progress": return "bg-blue-100 text-blue-800"
      case "Pending": return "bg-yellow-100 text-yellow-800"
      case "Rejected": return "bg-red-100 text-red-800"
      case "Completed": return "bg-green-100 text-green-800"
      case "Scheduled": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case "Critical": return "bg-red-100 text-red-800"
      case "Major": return "bg-yellow-100 text-yellow-800"
      case "Minor": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "Up": return <TrendingUp className="w-4 h-4 text-green-600" />
      case "Down": return <TrendingDown className="w-4 h-4 text-red-600" />
      case "Stable": return <Minus className="w-4 h-4 text-gray-600" />
      default: return <Minus className="w-4 h-4 text-gray-600" />
    }
  }

  const getTestTypeIcon = (type: string) => {
    switch (type) {
      case "Dimensional": return <FileText className="w-4 h-4" />
      case "Material": return <TestTube className="w-4 h-4" />
      case "Welding": return <CheckCircle className="w-4 h-4" />
      case "Coating": return <BarChart3 className="w-4 h-4" />
      case "NDT": return <AlertTriangle className="w-4 h-4" />
      default: return <TestTube className="w-4 h-4" />
    }
  }

  // Calculate real quality metrics from database
  const passedInspections = qualityInspections.filter(qi => qi.status === "Passed").length
  const totalInspections = qualityInspections.length
  const completedTests = qualityTests.filter(qt => qt.status === "Completed").length
  const totalTests = qualityTests.length

  // Calculate first pass yield from real data
  const totalWorkOrders = workOrders.length
  const qualityApprovedWorkOrders = workOrders.filter(wo => wo.status === "Quality Approved").length
  const firstPassYield = totalWorkOrders > 0 ? (qualityApprovedWorkOrders / totalWorkOrders) * 100 : 0

  // Calculate defect rate from failed inspections and tests
  const failedInspections = qualityInspections.filter(qi => qi.status === "Failed").length
  const failedTests = qualityTests.filter(qt => qt.status === "Failed").length
  const totalQualityChecks = totalInspections + totalTests
  const defectRate = totalQualityChecks > 0 ? ((failedInspections + failedTests) / totalQualityChecks) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Quality Management Overview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-800">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Quality Management System</span>
        </div>
        <p className="text-blue-700 text-sm mt-1">
          Real-time quality data from your production system. Schedule inspections and tests, track quality metrics, and manage work order quality status.
        </p>
      </div>

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
              const event = new CustomEvent('switchTab', { detail: 'shopfloor' })
              window.dispatchEvent(event)
            }}
          >
            <Users className="w-4 h-4" />
            View Shopfloor
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => {
              const event = new CustomEvent('switchTab', { detail: 'workstations' })
              window.dispatchEvent(event)
            }}
          >
            <Wrench className="w-4 h-4" />
            View Workstations
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            className="flex items-center gap-2"
            onClick={() => setShowCreateInspection(true)}
          >
            <CheckCircle className="w-4 h-4" />
            Schedule Inspection
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowCreateTest(true)}
          >
            <TestTube className="w-4 h-4" />
            Schedule Test
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inspection Pass Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalInspections > 0 ? Math.round((passedInspections / totalInspections) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {passedInspections}/{totalInspections} inspections passed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tests Completed</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTests}/{totalTests}</div>
            <p className="text-xs text-muted-foreground">
              {totalTests > 0 ? Math.round((completedTests / totalTests) * 100) : 0}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">First Pass Yield</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(firstPassYield)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {qualityApprovedWorkOrders}/{totalWorkOrders} work orders approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Defect Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(defectRate)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {failedInspections + failedTests}/{totalQualityChecks} quality checks failed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quality Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Metrics</CardTitle>
          <CardDescription>
            Key performance indicators for quality management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Current Value</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Department</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qualityMetrics.map((metric: any) => (
                <TableRow key={metric.id}>
                  <TableCell className="font-medium">{metric.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">{metric.value}</span>
                      <span className="text-sm text-gray-500">{metric.unit}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{metric.target}{metric.unit}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(metric.trend)}
                      <span className="text-sm capitalize">{metric.trend}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{metric.period}</Badge>
                  </TableCell>
                  <TableCell>{metric.department}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Work Order Quality Status */}
      <Card>
        <CardHeader>
          <CardTitle>Work Order Quality Status</CardTitle>
          <CardDescription>
            Quality status for all work orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Work Order</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Inspections</TableHead>
                <TableHead>Tests</TableHead>
                <TableHead>Quality Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workOrders.map((workOrder: any) => {
                const workOrderInspections = qualityInspections.filter((qi: any) => qi.workOrderId === workOrder.id)
                const workOrderTests = qualityTests.filter((qt: any) => qt.workOrderId === workOrder.id)
                const passedInspections = workOrderInspections.filter((qi: any) => qi.status === "Passed").length
                const completedTests = workOrderTests.filter((qt: any) => qt.status === "Completed").length

                let qualityStatus = "Pending"
                if (workOrderInspections.length > 0 && workOrderTests.length > 0) {
                  if (passedInspections === workOrderInspections.length && completedTests === workOrderTests.length) {
                    qualityStatus = "Passed"
                  } else if (workOrderInspections.some((qi: any) => qi.status === "Failed") || workOrderTests.some((qt: any) => qt.status === "Failed")) {
                    qualityStatus = "Failed"
                  } else {
                    qualityStatus = "In Progress"
                  }
                }

                return (
                  <TableRow key={workOrder.id}>
                    <TableCell className="font-medium">{workOrder.workOrderNumber}</TableCell>
                    <TableCell>{workOrder.productName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {passedInspections}/{workOrderInspections.length} Passed
                        </span>
                        {workOrderInspections.length > 0 && (
                          passedInspections === workOrderInspections.length ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {completedTests}/{workOrderTests.length} Completed
                        </span>
                        {workOrderTests.length > 0 && (
                          completedTests === workOrderTests.length ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-600" />
                          )
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(qualityStatus)}>
                        {qualityStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {workOrderInspections.length === 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => createInspectionForWorkOrder(workOrder.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Schedule Inspection
                          </Button>
                        )}
                        {workOrderTests.length === 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => createTestForWorkOrder(workOrder.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <TestTube className="w-3 h-3 mr-1" />
                            Schedule Test
                          </Button>
                        )}
                        {workOrderInspections.length > 0 && workOrderTests.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateWorkOrderQualityStatus(workOrder.id)}
                            className="text-purple-600 hover:text-purple-700"
                          >
                            <BarChart3 className="w-3 h-3 mr-1" />
                            Update Status
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedWorkOrder(workOrder)
                            setShowCreateInspection(true)
                          }}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Inspection
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedWorkOrder(workOrder)
                            setShowCreateTest(true)
                          }}
                          className="text-indigo-600 hover:text-indigo-700"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Test
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const event = new CustomEvent('switchTab', { detail: 'work-orders' })
                            window.dispatchEvent(event)
                          }}
                        >
                          View Work Order
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

      {/* Quality Inspections */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Inspections</CardTitle>
          <CardDescription>
            Current and recent quality inspections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Inspection ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Work Order</TableHead>
                <TableHead>Inspector</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qualityInspections.map((inspection: any) => {
                const workOrder = workOrders.find((wo: any) => wo.id === inspection.workOrderId)

                return (
                  <TableRow key={inspection.id}>
                    <TableCell className="font-mono text-sm">{inspection.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{inspection.inspectionType}</Badge>
                    </TableCell>
                    <TableCell>
                      {workOrder ? (
                        <span className="font-mono text-sm">{workOrder.workOrderNumber}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>{inspection.inspector}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(inspection.status)}>
                        {inspection.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(inspection.scheduledDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm">
                      {inspection.completedDate ?
                        new Date(inspection.completedDate).toLocaleDateString() :
                        "-"
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedInspection(inspection)}
                        >
                          View Details
                        </Button>
                        {inspection.status === "Pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateInspectionStatus(inspection.id, "In Progress")}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Start
                          </Button>
                        )}
                        {inspection.status === "In Progress" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateInspectionStatus(inspection.id, "Passed")}
                              className="text-green-600 hover:text-green-700"
                            >
                              Pass
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateInspectionStatus(inspection.id, "Failed")}
                              className="text-red-600 hover:text-red-700"
                            >
                              Fail
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quality Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Tests</CardTitle>
          <CardDescription>
            Laboratory and field quality tests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Work Order</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Results</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qualityTests.map((test: any) => {
                const workOrder = workOrders.find((wo: any) => wo.id === test.workOrderId)
                const passedResults = test.results.filter((r: any) => r.status === "Pass").length
                const totalResults = test.results.length

                return (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">{test.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTestTypeIcon(test.type)}
                        {test.type}
                      </div>
                    </TableCell>
                    <TableCell>
                      {workOrder ? (
                        <span className="font-mono text-sm">{workOrder.workOrderNumber}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>{test.technician}</TableCell>
                    <TableCell className="text-sm">{test.equipment}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(test.status)}>
                        {test.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(test.scheduledDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {totalResults > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {passedResults}/{totalResults} Pass
                          </span>
                          {passedResults === totalResults ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {test.status === "Scheduled" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateTestStatus(test.id, "In Progress")}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Start
                          </Button>
                        )}
                        {test.status === "In Progress" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateTestStatus(test.id, "Completed")}
                              className="text-green-600 hover:text-green-700"
                            >
                              Complete
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateTestStatus(test.id, "Failed")}
                              className="text-red-600 hover:text-red-700"
                            >
                              Fail
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Inspection Details Modal */}
      {selectedInspection && (
        <Card>
          <CardHeader>
            <CardTitle>Inspection Details - {selectedInspection.id}</CardTitle>
            <CardDescription>
              Detailed inspection results and specifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Specifications</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Parameter</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Tolerance</TableHead>
                        <TableHead>Criticality</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInspection.specifications.map((spec: any) => (
                        <TableRow key={spec.id}>
                          <TableCell>{spec.parameter}</TableCell>
                          <TableCell>{spec.target} {spec.unit}</TableCell>
                          <TableCell>±{spec.tolerance} {spec.unit}</TableCell>
                          <TableCell>
                            <Badge className={getCriticalityColor(spec.criticality)}>
                              {spec.criticality}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <h4 className="font-medium">Results</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Parameter</TableHead>
                        <TableHead>Measured</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInspection.results.map((result: any, index: number) => {
                        const spec = selectedInspection.specifications.find((s: any) => s.id === result.specificationId)
                        return (
                          <TableRow key={index}>
                            <TableCell>{spec?.parameter || "Unknown"}</TableCell>
                            <TableCell>{result.measuredValue} {spec?.unit || ""}</TableCell>
                            <TableCell>
                              <Badge className={result.status === "Pass" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                {result.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
              {selectedInspection.notes && (
                <div>
                  <h4 className="font-medium">Notes</h4>
                  <p className="text-sm text-gray-600">{selectedInspection.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Quality Actions */}
      {showCreateInspection && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule Quality Inspection</CardTitle>
            <CardDescription>
              Create a new quality inspection for {selectedWorkOrder ? `work order ${selectedWorkOrder.id}` : 'a work order'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => {
                    if (selectedWorkOrder) {
                      createComprehensiveInspection(selectedWorkOrder.id, "Incoming")
                    }
                    setShowCreateInspection(false)
                    setSelectedWorkOrder(null)
                  }}
                  className="w-full"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Incoming Inspection
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedWorkOrder) {
                      createComprehensiveInspection(selectedWorkOrder.id, "In-Process")
                    }
                    setShowCreateInspection(false)
                    setSelectedWorkOrder(null)
                  }}
                  className="w-full"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  In-Process Inspection
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedWorkOrder) {
                      createComprehensiveInspection(selectedWorkOrder.id, "Final")
                    }
                    setShowCreateInspection(false)
                    setSelectedWorkOrder(null)
                  }}
                  className="w-full"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Final Inspection
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedWorkOrder) {
                      createComprehensiveInspection(selectedWorkOrder.id, "First Article")
                    }
                    setShowCreateInspection(false)
                    setSelectedWorkOrder(null)
                  }}
                  className="w-full"
                >
                  <Star className="w-4 h-4 mr-2" />
                  First Article Inspection
                </Button>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateInspection(false)
                    setSelectedWorkOrder(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Quality Test Actions */}
      {showCreateTest && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule Quality Test</CardTitle>
            <CardDescription>
              Create a new quality test for {selectedWorkOrder ? `work order ${selectedWorkOrder.id}` : 'a work order'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => {
                    if (selectedWorkOrder) {
                      createComprehensiveTest(selectedWorkOrder.id, "Dimensional")
                    }
                    setShowCreateTest(false)
                    setSelectedWorkOrder(null)
                  }}
                  className="w-full"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Dimensional Test
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedWorkOrder) {
                      createComprehensiveTest(selectedWorkOrder.id, "Material")
                    }
                    setShowCreateTest(false)
                    setSelectedWorkOrder(null)
                  }}
                  className="w-full"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Material Test
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedWorkOrder) {
                      createComprehensiveTest(selectedWorkOrder.id, "Welding")
                    }
                    setShowCreateTest(false)
                    setSelectedWorkOrder(null)
                  }}
                  className="w-full"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Welding Test
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedWorkOrder) {
                      createComprehensiveTest(selectedWorkOrder.id, "NDT")
                    }
                    setShowCreateTest(false)
                    setSelectedWorkOrder(null)
                  }}
                  className="w-full"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  NDT Test
                </Button>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateTest(false)
                    setSelectedWorkOrder(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
