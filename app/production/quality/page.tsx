"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  TestTube,
  BarChart3,
  Factory,
  Users,
  Plus,
  Wrench,
  Star,
  ArrowRight,
  Target,
  Shield,
  Zap,
  Eye,
  Settings
} from "lucide-react"
import { useDatabaseContext } from "@/components/database-provider"

export default function QualityPage() {
  const router = useRouter()
  const {
    qualityInspections = [],
    qualityTests = [],
    qualityMetrics = [],
    productionWorkOrders: workOrders = [],
    workstations = [],
    operators = [],
    createQualityInspection,
    createQualityTest,
    updateQualityInspection,
    updateQualityTest,
    updateProductionWorkOrder,
    refreshProductionWorkOrders,
    refreshQualityInspections,
    refreshQualityTests
  } = useDatabaseContext()

  const [selectedInspection, setSelectedInspection] = useState<any>(null)
  const [showCreateInspection, setShowCreateInspection] = useState(false)
  const [showCreateTest, setShowCreateTest] = useState(false)
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null)

  // Function to update quality metrics
  const updateQualityMetrics = (workOrderId: string, type: 'inspection' | 'test', status: string) => {
    try {
      // This would typically update quality metrics in the database
      // For now, we'll just log the metric update
      console.log(`Quality metric updated: Work Order ${workOrderId}, ${type} ${status}`)
    } catch (error) {
      console.error("Error updating quality metrics:", error)
    }
  }

  // Function to handle comprehensive work order status updates
  const handleWorkOrderStatusUpdate = (workOrderId: string) => {
    try {
      const workOrder = workOrders.find(wo => wo.id === workOrderId)
      if (!workOrder) {
        alert("Work order not found")
        return
      }

      const workOrderInspections = qualityInspections.filter((qi: any) => qi.workOrderId === workOrderId)
      const workOrderTests = qualityTests.filter((qt: any) => qt.workOrderId === workOrderId)
      
      let newStatus = workOrder.status
      let newProgress = workOrder.progress
      let statusMessage = ""

      // Handle different current statuses
      switch (workOrder.status) {
        case "Quality Rejected":
          // Show options for rejected work orders
          const action = confirm("Work order is rejected. Do you want to send it for rework? (OK = Rework, Cancel = Keep Rejected)")
          if (action) {
            newStatus = "In Progress"
            newProgress = 10
            statusMessage = "Work order sent for rework - quality issues to be corrected"
          } else {
            return // Keep as rejected
          }
          break

        case "In Progress":
          // Check if work order is ready for quality approval
          if (workOrder.progress >= 90) {
            const allInspectionsPassed = workOrderInspections.length > 0 ? 
              workOrderInspections.every(qi => qi.status === "Passed") : true
            const allTestsCompleted = workOrderTests.length > 0 ? 
              workOrderTests.every(qt => qt.status === "Completed") : true

            if (allInspectionsPassed && allTestsCompleted) {
              const approve = confirm("Work order is ready for quality approval. Approve it? (OK = Approve, Cancel = Keep In Progress)")
              if (approve) {
                newStatus = "Quality Approved"
                newProgress = 95
                statusMessage = "Work order approved for quality - ready for completion"
              } else {
                return // Keep as in progress
              }
            } else {
              alert("Work order needs all quality checks to be completed before approval")
              return
            }
          } else {
            alert("Work order needs to be at least 90% complete before quality approval")
            return
          }
          break

        case "Quality Approved":
          // Complete the work order
          const complete = confirm("Work order is quality approved. Mark as completed? (OK = Complete, Cancel = Keep Approved)")
          if (complete) {
            newStatus = "Completed"
            newProgress = 100
            statusMessage = "Work order completed successfully"
          } else {
            return // Keep as approved
          }
          break

        case "Completed":
          alert("Work order is already completed")
          return

        case "Cancelled":
          alert("Work order is cancelled and cannot be updated")
          return

        case "On Hold":
          const resume = confirm("Work order is on hold. Resume production? (OK = Resume, Cancel = Keep On Hold)")
          if (resume) {
            newStatus = "In Progress"
            newProgress = Math.max(workOrder.progress, 20)
            statusMessage = "Work order resumed from hold"
          } else {
            return // Keep on hold
          }
          break

        default:
          // For other statuses, run the standard quality evaluation
          updateWorkOrderQualityStatus(workOrderId)
          return
      }

      // Update the work order
      const updated = updateProductionWorkOrder(workOrderId, {
        status: newStatus as "Planned" | "In Progress" | "On Hold" | "Completed" | "Cancelled" | "Quality Approved" | "Quality Rejected",
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
      console.error("Error updating work order status:", error)
      alert("Error updating work order status")
    }
  }

  // Function to update inspection status
  const updateInspectionStatus = (inspectionId: string, newStatus: string) => {
    try {
      const updated = updateQualityInspection(inspectionId, {
        status: newStatus as "Pending" | "In Progress" | "Passed" | "Failed" | "Rejected",
        completedDate: newStatus === "Passed" || newStatus === "Failed" ? new Date().toISOString() : undefined
      })

      if (updated) {
        refreshQualityInspections()
        
        // Find the inspection to get work order ID
        const inspection = qualityInspections.find((i: any) => i.id === inspectionId)
        if (inspection) {
          // Update work order status based on inspection results
          updateWorkOrderQualityStatus(inspection.workOrderId)
          
          // Update quality metrics
          updateQualityMetrics(inspection.workOrderId, 'inspection', newStatus)
        }
        
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
        
        // Find the test to get work order ID
        const test = qualityTests.find((t: any) => t.id === testId)
        if (test) {
          // Update work order status based on test results
          updateWorkOrderQualityStatus(test.workOrderId)
          
          // Update quality metrics
          updateQualityMetrics(test.workOrderId, 'test', newStatus)
        }
        
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

  // Function to handle rework actions
  const handleReworkAction = (workOrderId: string, action: string) => {
    try {
      const workOrder = workOrders.find(wo => wo.id === workOrderId)
      if (!workOrder) {
        alert("Work order not found")
        return
      }

      let newStatus = workOrder.status
      let newProgress = workOrder.progress
      let statusMessage = ""

      switch (action) {
        case 'continue':
          newProgress = Math.min(workOrder.progress + 20, 90)
          statusMessage = "Rework progress updated - continue with corrections"
          break
        case 'retest':
          // Create new quality tests for rework
          createTestForWorkOrder(workOrderId)
          statusMessage = "New quality tests scheduled for rework verification"
          break
        case 'complete':
          newStatus = "In Progress"
          newProgress = 85
          statusMessage = "Rework completed - work order returned to production flow"
          break
        default:
          alert("Invalid rework action")
          return
      }

      const updated = updateProductionWorkOrder(workOrderId, {
        status: newStatus as "Planned" | "In Progress" | "On Hold" | "Completed" | "Cancelled" | "Quality Approved" | "Quality Rejected",
        progress: newProgress
      })

      if (updated) {
        refreshProductionWorkOrders()
        alert(`${statusMessage}`)
      } else {
        alert("Failed to update work order status")
      }
    } catch (error) {
      console.error("Error handling rework action:", error)
      alert("Error handling rework action")
    }
  }

  // Function to handle rejection actions
  const handleRejectionAction = (workOrderId: string, action: string) => {
    try {
      const workOrder = workOrders.find(wo => wo.id === workOrderId)
      if (!workOrder) {
        alert("Work order not found")
        return
      }

      let newStatus = workOrder.status
      let newProgress = workOrder.progress
      let statusMessage = ""

      switch (action) {
        case 'rework':
          newStatus = "In Progress" // Using existing status for rework
          newProgress = 10
          statusMessage = "Work order sent for rework - quality issues to be corrected"
          break
        case 'scrap':
          newStatus = "Cancelled" // Using existing status for scrap
          newProgress = 0
          statusMessage = "Work order scrapped - material cannot be salvaged"
          break
        case 'return':
          newStatus = "On Hold" // Using existing status for return
          newProgress = 0
          statusMessage = "Work order returned to supplier - quality issues to be resolved"
          break
        default:
          alert("Invalid rejection action")
          return
      }

      const updated = updateProductionWorkOrder(workOrderId, {
        status: newStatus as "Planned" | "In Progress" | "On Hold" | "Completed" | "Cancelled" | "Quality Approved" | "Quality Rejected",
        progress: newProgress
      })

      if (updated) {
        refreshProductionWorkOrders()
        alert(`${statusMessage}`)
      } else {
        alert("Failed to update work order status")
      }
    } catch (error) {
      console.error("Error handling rejection action:", error)
      alert("Error handling rejection action")
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
            onClick={() => router.push('/production/work-orders')}
          >
            <Factory className="w-4 h-4" />
            View Work Orders
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => router.push('/production/shopfloor')}
          >
            <Users className="w-4 h-4" />
            View Shopfloor
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => router.push('/production/workstations')}
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


      {/* Comprehensive Quality Process */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Comprehensive Quality Process
          </CardTitle>
          <CardDescription>
            End-to-end quality workflow integrated with production and shopfloor execution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Quality Process Flow */}
            <div className="relative">
              <div className="flex items-center justify-between">
                {/* Incoming Quality */}
                <div className="flex flex-col items-center space-y-2 p-4 bg-blue-50 rounded-lg border-2 border-blue-200 min-w-[200px]">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-blue-800">Incoming Quality</h3>
                  <p className="text-sm text-blue-600 text-center">Material & Component Inspection</p>
                  <div className="flex flex-col items-center space-y-1">
                    <Badge variant="outline" className="text-xs">
                      {qualityInspections.filter(qi => qi.inspectionType === "Incoming").length} Scheduled
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {qualityInspections.filter(qi => qi.inspectionType === "Incoming" && qi.status === "Passed").length} Passed
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const event = new CustomEvent('switchTab', { detail: 'work-orders' })
                      window.dispatchEvent(event)
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View Details
                  </Button>
                </div>

                <ArrowRight className="w-6 h-6 text-gray-400" />

                {/* In-Process Quality */}
                <div className="flex flex-col items-center space-y-2 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200 min-w-[200px]">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-yellow-800">In-Process Quality</h3>
                  <p className="text-sm text-yellow-600 text-center">Real-time Production Monitoring</p>
                  <div className="flex flex-col items-center space-y-1">
                    <Badge variant="outline" className="text-xs">
                      {qualityInspections.filter(qi => qi.inspectionType === "In-Process").length} Active
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {workstations.filter(ws => ws.status === "Active").length} Workstations
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const event = new CustomEvent('switchTab', { detail: 'shopfloor' })
                      window.dispatchEvent(event)
                    }}
                    className="text-yellow-600 hover:text-yellow-700"
                  >
                    <Factory className="w-3 h-3 mr-1" />
                    Shopfloor View
                  </Button>
                </div>

                <ArrowRight className="w-6 h-6 text-gray-400" />

                {/* Final Quality */}
                <div className="flex flex-col items-center space-y-2 p-4 bg-green-50 rounded-lg border-2 border-green-200 min-w-[200px]">
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-green-800">Final Quality</h3>
                  <p className="text-sm text-green-600 text-center">Product Release & Approval</p>
                  <div className="flex flex-col items-center space-y-1">
                    <Badge variant="outline" className="text-xs">
                      {qualityInspections.filter(qi => qi.inspectionType === "Final").length} Completed
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {workOrders.filter(wo => wo.status === "Quality Approved").length} Approved
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const event = new CustomEvent('switchTab', { detail: 'work-orders' })
                      window.dispatchEvent(event)
                    }}
                    className="text-green-600 hover:text-green-700"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    View Approved
                  </Button>
                </div>
              </div>
            </div>

            {/* Quality Process Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Step 1: Material Receipt & Inspection */}
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Step 1: Material Receipt
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Incoming Inspections</span>
                      <span className="font-medium">
                        {qualityInspections.filter(qi => qi.inspectionType === "Incoming").length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Pass Rate</span>
                      <span className="font-medium">
                        {qualityInspections.filter(qi => qi.inspectionType === "Incoming").length > 0 
                          ? Math.round((qualityInspections.filter(qi => qi.inspectionType === "Incoming" && qi.status === "Passed").length / qualityInspections.filter(qi => qi.inspectionType === "Incoming").length) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const event = new CustomEvent('switchTab', { detail: 'work-orders' })
                        window.dispatchEvent(event)
                      }}
                      className="flex-1"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Materials
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setShowCreateInspection(true)}
                      className="flex-1"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Production Quality Control */}
              <Card className="border-l-4 border-l-yellow-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Factory className="w-5 h-5 text-yellow-600" />
                    Step 2: Production Control
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Active Workstations</span>
                      <span className="font-medium">
                        {workstations.filter(ws => ws.status === "Active").length}/{workstations.length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>In-Process Inspections</span>
                      <span className="font-medium">
                        {qualityInspections.filter(qi => qi.inspectionType === "In-Process").length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg Efficiency</span>
                      <span className="font-medium">
                        {workstations.length > 0 
                          ? Math.round(workstations.reduce((acc, ws) => acc + ws.efficiency, 0) / workstations.length)
                          : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const event = new CustomEvent('switchTab', { detail: 'shopfloor' })
                        window.dispatchEvent(event)
                      }}
                      className="flex-1"
                    >
                      <Factory className="w-3 h-3 mr-1" />
                      Shopfloor
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setShowCreateInspection(true)}
                      className="flex-1"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Monitor
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Step 3: Final Inspection & Release */}
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Step 3: Final Release
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Final Inspections</span>
                      <span className="font-medium">
                        {qualityInspections.filter(qi => qi.inspectionType === "Final").length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Quality Approved</span>
                      <span className="font-medium">
                        {workOrders.filter(wo => wo.status === "Quality Approved").length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>First Pass Yield</span>
                      <span className="font-medium">
                        {Math.round(firstPassYield)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const event = new CustomEvent('switchTab', { detail: 'work-orders' })
                        window.dispatchEvent(event)
                      }}
                      className="flex-1"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Orders
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setShowCreateInspection(true)}
                      className="flex-1"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Final Check
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Work Order Status Management */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Work Order Status Management
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="bg-white p-3 rounded-lg border">
                  <h4 className="font-medium text-sm text-gray-800 mb-2">Quality Rejected</h4>
                  <p className="text-xs text-gray-600 mb-2">Work order failed quality checks</p>
                  <div className="text-xs text-blue-600">
                    → Can be sent for rework
                  </div>
                </div>
                
                <div className="bg-white p-3 rounded-lg border">
                  <h4 className="font-medium text-sm text-gray-800 mb-2">In Progress</h4>
                  <p className="text-xs text-gray-600 mb-2">Work order in production</p>
                  <div className="text-xs text-blue-600">
                    → Can be approved when 90%+ complete
                  </div>
                </div>
                
                <div className="bg-white p-3 rounded-lg border">
                  <h4 className="font-medium text-sm text-gray-800 mb-2">Quality Approved</h4>
                  <p className="text-xs text-gray-600 mb-2">Work order passed quality checks</p>
                  <div className="text-xs text-blue-600">
                    → Can be marked as completed
                  </div>
                </div>
                
                <div className="bg-white p-3 rounded-lg border">
                  <h4 className="font-medium text-sm text-gray-800 mb-2">On Hold</h4>
                  <p className="text-xs text-gray-600 mb-2">Work order paused</p>
                  <div className="text-xs text-blue-600">
                    → Can be resumed
                  </div>
                </div>
              </div>
            </div>

            {/* Quality Process Controls */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Quality Process Controls
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={() => {
                    const event = new CustomEvent('switchTab', { detail: 'work-orders' })
                    window.dispatchEvent(event)
                  }}
                >
                  <FileText className="w-6 h-6 text-blue-600" />
                  <span className="font-medium">Work Order Quality</span>
                  <span className="text-xs text-gray-500">Manage work order quality status</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={() => {
                    const event = new CustomEvent('switchTab', { detail: 'shopfloor' })
                    window.dispatchEvent(event)
                  }}
                >
                  <Factory className="w-6 h-6 text-yellow-600" />
                  <span className="font-medium">Shopfloor Quality</span>
                  <span className="text-xs text-gray-500">Monitor production quality</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={() => setShowCreateInspection(true)}
                >
                  <Plus className="w-6 h-6 text-green-600" />
                  <span className="font-medium">Schedule Inspection</span>
                  <span className="text-xs text-gray-500">Create new quality inspection</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={() => setShowCreateTest(true)}
                >
                  <TestTube className="w-6 h-6 text-purple-600" />
                  <span className="font-medium">Schedule Test</span>
                  <span className="text-xs text-gray-500">Create new quality test</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Real-Time Quality Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Real-Time Quality Monitoring
          </CardTitle>
          <CardDescription>
            Live quality data from shopfloor execution and work order progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Live Quality Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800">Active Inspections</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {qualityInspections.filter(qi => qi.status === "In Progress").length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  {qualityInspections.filter(qi => qi.inspectionType === "In-Process").length} in-process
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">Quality Approved</p>
                    <p className="text-2xl font-bold text-green-900">
                      {workOrders.filter(wo => wo.status === "Quality Approved").length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-xs text-green-600 mt-1">
                  {Math.round(firstPassYield)}% first pass yield
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Pending Quality</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {workOrders.filter(wo => wo.status === "Completed").length}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                </div>
                <p className="text-xs text-yellow-600 mt-1">
                  Awaiting quality approval
                </p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-800">Quality Issues</p>
                    <p className="text-2xl font-bold text-red-900">
                      {qualityInspections.filter(qi => qi.status === "Failed").length + qualityTests.filter(qt => qt.status === "Failed").length}
                    </p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-xs text-red-600 mt-1">
                  {Math.round(defectRate)}% defect rate
                </p>
              </div>
            </div>

            {/* Shopfloor Quality Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Factory className="w-4 h-4" />
                Shopfloor Quality Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workstations.map((workstation: any) => {
                  const workstationInspections = qualityInspections.filter((qi: any) => qi.workstationId === workstation.id)
                  const activeInspections = workstationInspections.filter((qi: any) => qi.status === "In Progress").length
                  const passedInspections = workstationInspections.filter((qi: any) => qi.status === "Passed").length
                  const totalInspections = workstationInspections.length
                  
                  return (
                    <div key={workstation.id} className="bg-white p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{workstation.name}</h4>
                        <Badge className={workstation.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {workstation.status}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="font-medium">{workstation.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Inspections:</span>
                          <span className="font-medium">{passedInspections}/{totalInspections} passed</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Active:</span>
                          <span className="font-medium">{activeInspections} in progress</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Efficiency:</span>
                          <span className="font-medium">{workstation.efficiency}%</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => {
                          const event = new CustomEvent('switchTab', { detail: 'shopfloor' })
                          window.dispatchEvent(event)
                        }}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Active Quality Inspections Management */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Active Quality Inspections Management
              </h3>
              <div className="space-y-3">
                {qualityInspections.filter((inspection: any) => inspection.status === "Pending" || inspection.status === "In Progress").map((inspection: any) => {
                  const workOrder = workOrders.find((wo: any) => wo.id === inspection.workOrderId)
                  const workstation = workstations.find((ws: any) => ws.id === inspection.workstationId)
                  return (
                    <div key={inspection.id} className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{inspection.inspectionType} Inspection</h4>
                          <p className="text-sm text-gray-600">
                            Work Order: {workOrder?.workOrderNumber || 'Unknown'} | 
                            Inspector: {inspection.inspector} |
                            Workstation: {workstation?.name || 'Unknown'}
                          </p>
                        </div>
                        <Badge className={getStatusColor(inspection.status)}>
                          {inspection.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <p>Scheduled: {new Date(inspection.scheduledDate).toLocaleDateString()}</p>
                          <p>Specifications: {inspection.specifications?.length || 0} parameters</p>
                        </div>
                        <div className="flex gap-2">
                          {inspection.status === "Pending" && (
                            <Button
                              size="sm"
                              onClick={() => updateInspectionStatus(inspection.id, "In Progress")}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Start Inspection
                            </Button>
                          )}
                          {inspection.status === "In Progress" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => updateInspectionStatus(inspection.id, "Passed")}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Pass Inspection
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateInspectionStatus(inspection.id, "Failed")}
                                className="border-red-600 text-red-600 hover:bg-red-50"
                              >
                                Fail Inspection
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                
                {qualityInspections.filter((inspection: any) => inspection.status === "Pending" || inspection.status === "In Progress").length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No active quality inspections</p>
                    <p className="text-sm">Create inspections for work orders to see them here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Active Quality Tests Management */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TestTube className="w-4 h-4" />
                Active Quality Tests Management
              </h3>
              <div className="space-y-3">
                {qualityTests.filter((test: any) => test.status === "Scheduled" || test.status === "In Progress").map((test: any) => {
                  const workOrder = workOrders.find((wo: any) => wo.id === test.workOrderId)
                  return (
                    <div key={test.id} className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{test.name}</h4>
                          <p className="text-sm text-gray-600">
                            Work Order: {workOrder?.workOrderNumber || 'Unknown'} | 
                            Type: {test.type} | 
                            Technician: {test.technician}
                          </p>
                        </div>
                        <Badge className={getStatusColor(test.status)}>
                          {test.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <p>Equipment: {test.equipment}</p>
                          <p>Standards: {test.standards.join(", ")}</p>
                        </div>
                        <div className="flex gap-2">
                          {test.status === "Scheduled" && (
                            <Button
                              size="sm"
                              onClick={() => updateTestStatus(test.id, "In Progress")}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Start Test
                            </Button>
                          )}
                          {test.status === "In Progress" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => updateTestStatus(test.id, "Completed")}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Pass Test
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateTestStatus(test.id, "Failed")}
                                className="border-red-600 text-red-600 hover:bg-red-50"
                              >
                                Fail Test
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                
                {qualityTests.filter((test: any) => test.status === "Scheduled" || test.status === "In Progress").length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <TestTube className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No active quality tests</p>
                    <p className="text-sm">Create tests for work orders to see them here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quality Alerts */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-orange-800">
                <AlertTriangle className="w-4 h-4" />
                Quality Alerts & Issues
              </h3>
              <div className="space-y-2">
                {qualityInspections.filter(qi => qi.status === "Failed").length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-red-700">
                    <XCircle className="w-4 h-4" />
                    <span>{qualityInspections.filter(qi => qi.status === "Failed").length} failed inspections require attention</span>
                  </div>
                )}
                {qualityTests.filter(qt => qt.status === "Failed").length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-red-700">
                    <TestTube className="w-4 h-4" />
                    <span>{qualityTests.filter(qt => qt.status === "Failed").length} failed tests require investigation</span>
                  </div>
                )}
                {workOrders.filter(wo => wo.status === "Quality Rejected").length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-red-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{workOrders.filter(wo => wo.status === "Quality Rejected").length} work orders rejected due to quality issues</span>
                  </div>
                )}
                {qualityInspections.filter(qi => qi.status === "Failed").length === 0 && 
                 qualityTests.filter(qt => qt.status === "Failed").length === 0 && 
                 workOrders.filter(wo => wo.status === "Quality Rejected").length === 0 && (
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span>No quality issues detected - all systems operating normally</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Rejection Process */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            Quality Rejection Process
          </CardTitle>
          <CardDescription>
            Handle rejected work orders and quality issues with proper disposition and corrective actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Rejected Work Orders */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Rejected Work Orders ({workOrders.filter(wo => wo.status === "Quality Rejected").length})
              </h3>
              
              {workOrders.filter(wo => wo.status === "Quality Rejected").length > 0 ? (
                <div className="space-y-3">
                  {workOrders.filter(wo => wo.status === "Quality Rejected").map((workOrder: any) => {
                    const workOrderInspections = qualityInspections.filter((qi: any) => qi.workOrderId === workOrder.id)
                    const workOrderTests = qualityTests.filter((qt: any) => qt.workOrderId === workOrder.id)
                    const failedInspections = workOrderInspections.filter((qi: any) => qi.status === "Failed")
                    const failedTests = workOrderTests.filter((qt: any) => qt.status === "Failed")
                    
                    return (
                      <div key={workOrder.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-red-800">{workOrder.productName}</h4>
                            <p className="text-sm text-red-600">Work Order: {workOrder.workOrderNumber}</p>
                            <p className="text-sm text-red-600">Rejected: {new Date(workOrder.updatedAt || workOrder.createdAt).toLocaleDateString()}</p>
                          </div>
                          <Badge className="bg-red-100 text-red-800">
                            Quality Rejected
                          </Badge>
                        </div>
                        
                        {/* Rejection Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h5 className="font-medium text-red-800 mb-2">Failed Inspections ({failedInspections.length})</h5>
                            <div className="space-y-1">
                              {failedInspections.map((inspection: any) => (
                                <div key={inspection.id} className="text-sm text-red-700 bg-red-100 p-2 rounded">
                                  <span className="font-medium">{inspection.inspectionType}</span> - {inspection.inspector}
                                  <br />
                                  <span className="text-xs">Completed: {new Date(inspection.completedDate || inspection.scheduledDate).toLocaleDateString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-red-800 mb-2">Failed Tests ({failedTests.length})</h5>
                            <div className="space-y-1">
                              {failedTests.map((test: any) => (
                                <div key={test.id} className="text-sm text-red-700 bg-red-100 p-2 rounded">
                                  <span className="font-medium">{test.name}</span> - {test.technician}
                                  <br />
                                  <span className="text-xs">Completed: {new Date(test.completedDate || test.scheduledDate).toLocaleDateString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Rejection Actions */}
                        <div className="border-t border-red-200 pt-4">
                          <h5 className="font-medium text-red-800 mb-3">Disposition Actions</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Button
                              onClick={() => handleRejectionAction(workOrder.id, 'rework')}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white"
                            >
                              <Wrench className="w-4 h-4 mr-2" />
                              Send for Rework
                            </Button>
                            <Button
                              onClick={() => handleRejectionAction(workOrder.id, 'scrap')}
                              variant="outline"
                              className="border-red-600 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Scrap Material
                            </Button>
                            <Button
                              onClick={() => handleRejectionAction(workOrder.id, 'return')}
                              variant="outline"
                              className="border-blue-600 text-blue-600 hover:bg-blue-50"
                            >
                              <ArrowRight className="w-4 h-4 mr-2" />
                              Return to Supplier
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-300" />
                  <p>No rejected work orders</p>
                  <p className="text-sm">All quality checks are passing</p>
                </div>
              )}
            </div>

            {/* Rejection Process Flow */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Rejection Process Flow
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <h4 className="font-medium text-sm">1. Quality Rejection</h4>
                  <p className="text-xs text-gray-600 mt-1">Work order fails quality checks</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h4 className="font-medium text-sm">2. Root Cause Analysis</h4>
                  <p className="text-xs text-gray-600 mt-1">Investigate failure reasons</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Settings className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-sm">3. Disposition Decision</h4>
                  <p className="text-xs text-gray-600 mt-1">Choose corrective action</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-medium text-sm">4. Corrective Action</h4>
                  <p className="text-xs text-gray-600 mt-1">Execute chosen solution</p>
                </div>
              </div>
            </div>

            {/* Rejection Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-800">Total Rejections</p>
                    <p className="text-2xl font-bold text-red-900">
                      {workOrders.filter(wo => wo.status === "Quality Rejected").length}
                    </p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-xs text-red-600 mt-1">
                  {Math.round((workOrders.filter(wo => wo.status === "Quality Rejected").length / workOrders.length) * 100)}% rejection rate
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Pending Disposition</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {workOrders.filter(wo => wo.status === "Quality Rejected").length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
                <p className="text-xs text-yellow-600 mt-1">
                  Awaiting disposition decision
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800">Rework Orders</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {workOrders.filter(wo => wo.status === "In Progress" && wo.progress < 90).length}
                    </p>
                  </div>
                  <Wrench className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Currently in rework
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rework Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-yellow-600" />
            Rework Tracking
          </CardTitle>
          <CardDescription>
            Monitor work orders currently in rework and track rework progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workOrders.filter(wo => wo.status === "In Progress" && wo.progress < 90).length > 0 ? (
              <div className="space-y-3">
                {workOrders.filter(wo => wo.status === "In Progress" && wo.progress < 90).map((workOrder: any) => {
                  const workOrderInspections = qualityInspections.filter((qi: any) => qi.workOrderId === workOrder.id)
                  const workOrderTests = qualityTests.filter((qt: any) => qt.workOrderId === workOrder.id)
                  
                  return (
                    <div key={workOrder.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-yellow-800">{workOrder.productName}</h4>
                          <p className="text-sm text-yellow-600">Work Order: {workOrder.workOrderNumber}</p>
                          <p className="text-sm text-yellow-600">Rework Started: {new Date(workOrder.updatedAt || workOrder.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-yellow-100 text-yellow-800">
                            In Rework
                          </Badge>
                          <div className="text-sm text-yellow-600">
                            Progress: {workOrder.progress}%
                          </div>
                        </div>
                      </div>
                      
                      {/* Rework Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-yellow-700 mb-1">
                          <span>Rework Progress</span>
                          <span>{workOrder.progress}%</span>
                        </div>
                        <div className="w-full bg-yellow-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${workOrder.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Rework Actions */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleReworkAction(workOrder.id, 'continue')}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Wrench className="w-4 h-4 mr-2" />
                          Continue Rework
                        </Button>
                        <Button
                          onClick={() => handleReworkAction(workOrder.id, 'retest')}
                          variant="outline"
                          className="border-green-600 text-green-600 hover:bg-green-50"
                        >
                          <TestTube className="w-4 h-4 mr-2" />
                          Retest Quality
                        </Button>
                        <Button
                          onClick={() => handleReworkAction(workOrder.id, 'complete')}
                          variant="outline"
                          className="border-purple-600 text-purple-600 hover:bg-purple-50"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Complete Rework
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Wrench className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No work orders in rework</p>
                <p className="text-sm">All quality issues have been resolved</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quality Process Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Quality Process Workflow
          </CardTitle>
          <CardDescription>
            Complete quality journey for work orders from material receipt to final approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Work Order Quality Journey */}
            {workOrders.slice(0, 3).map((workOrder: any) => {
              const workOrderInspections = qualityInspections.filter((qi: any) => qi.workOrderId === workOrder.id)
              const workOrderTests = qualityTests.filter((qt: any) => qt.workOrderId === workOrder.id)
              const incomingInspections = workOrderInspections.filter((qi: any) => qi.inspectionType === "Incoming")
              const inProcessInspections = workOrderInspections.filter((qi: any) => qi.inspectionType === "In-Process")
              const finalInspections = workOrderInspections.filter((qi: any) => qi.inspectionType === "Final")
              
              return (
                <div key={workOrder.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{workOrder.productName}</h3>
                      <p className="text-sm text-gray-600">Work Order: {workOrder.workOrderNumber}</p>
                    </div>
                    <Badge className={getStatusColor(workOrder.status)}>
                      {workOrder.status}
                    </Badge>
                  </div>
                  
                  {/* Quality Process Steps */}
                  <div className="flex items-center justify-between">
                    {/* Step 1: Incoming Quality */}
                    <div className="flex flex-col items-center space-y-2 min-w-[120px]">
                      <div className={`p-3 rounded-full ${incomingInspections.length > 0 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <FileText className={`w-6 h-6 ${incomingInspections.length > 0 ? 'text-blue-600' : 'text-gray-400'}`} />
                      </div>
                      <h4 className="font-medium text-sm">Incoming</h4>
                      <div className="text-center">
                        <div className="text-xs text-gray-600">
                          {incomingInspections.length} inspections
                        </div>
                        <div className="text-xs">
                          {incomingInspections.filter(qi => qi.status === "Passed").length}/{incomingInspections.length} passed
                        </div>
                        {incomingInspections.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {incomingInspections.map((inspection: any) => (
                              <div key={inspection.id} className="flex items-center gap-1">
                                <span className="text-xs text-gray-500 truncate max-w-[80px]">{inspection.inspectionType}</span>
                                <Badge className={`text-xs ${getStatusColor(inspection.status)}`}>
                                  {inspection.status}
                                </Badge>
                                {inspection.status === "Pending" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateInspectionStatus(inspection.id, "In Progress")}
                                    className="h-4 px-1 text-xs"
                                  >
                                    Start
                                  </Button>
                                )}
                                {inspection.status === "In Progress" && (
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateInspectionStatus(inspection.id, "Passed")}
                                      className="h-4 px-1 text-xs text-green-600"
                                    >
                                      Pass
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateInspectionStatus(inspection.id, "Failed")}
                                      className="h-4 px-1 text-xs text-red-600"
                                    >
                                      Fail
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-gray-400" />

                    {/* Step 2: In-Process Quality */}
                    <div className="flex flex-col items-center space-y-2 min-w-[120px]">
                      <div className={`p-3 rounded-full ${inProcessInspections.length > 0 ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                        <Clock className={`w-6 h-6 ${inProcessInspections.length > 0 ? 'text-yellow-600' : 'text-gray-400'}`} />
                      </div>
                      <h4 className="font-medium text-sm">In-Process</h4>
                      <div className="text-center">
                        <div className="text-xs text-gray-600">
                          {inProcessInspections.length} inspections
                        </div>
                        <div className="text-xs">
                          {inProcessInspections.filter(qi => qi.status === "Passed").length}/{inProcessInspections.length} passed
                        </div>
                        {inProcessInspections.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {inProcessInspections.map((inspection: any) => (
                              <div key={inspection.id} className="flex items-center gap-1">
                                <span className="text-xs text-gray-500 truncate max-w-[80px]">{inspection.inspectionType}</span>
                                <Badge className={`text-xs ${getStatusColor(inspection.status)}`}>
                                  {inspection.status}
                                </Badge>
                                {inspection.status === "Pending" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateInspectionStatus(inspection.id, "In Progress")}
                                    className="h-4 px-1 text-xs"
                                  >
                                    Start
                                  </Button>
                                )}
                                {inspection.status === "In Progress" && (
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateInspectionStatus(inspection.id, "Passed")}
                                      className="h-4 px-1 text-xs text-green-600"
                                    >
                                      Pass
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateInspectionStatus(inspection.id, "Failed")}
                                      className="h-4 px-1 text-xs text-red-600"
                                    >
                                      Fail
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-gray-400" />

                    {/* Step 3: Final Quality */}
                    <div className="flex flex-col items-center space-y-2 min-w-[120px]">
                      <div className={`p-3 rounded-full ${finalInspections.length > 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <CheckCircle className={`w-6 h-6 ${finalInspections.length > 0 ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                      <h4 className="font-medium text-sm">Final</h4>
                      <div className="text-center">
                        <div className="text-xs text-gray-600">
                          {finalInspections.length} inspections
                        </div>
                        <div className="text-xs">
                          {finalInspections.filter(qi => qi.status === "Passed").length}/{finalInspections.length} passed
                        </div>
                        {finalInspections.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {finalInspections.map((inspection: any) => (
                              <div key={inspection.id} className="flex items-center gap-1">
                                <span className="text-xs text-gray-500 truncate max-w-[80px]">{inspection.inspectionType}</span>
                                <Badge className={`text-xs ${getStatusColor(inspection.status)}`}>
                                  {inspection.status}
                                </Badge>
                                {inspection.status === "Pending" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateInspectionStatus(inspection.id, "In Progress")}
                                    className="h-4 px-1 text-xs"
                                  >
                                    Start
                                  </Button>
                                )}
                                {inspection.status === "In Progress" && (
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateInspectionStatus(inspection.id, "Passed")}
                                      className="h-4 px-1 text-xs text-green-600"
                                    >
                                      Pass
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateInspectionStatus(inspection.id, "Failed")}
                                      className="h-4 px-1 text-xs text-red-600"
                                    >
                                      Fail
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-gray-400" />

                    {/* Step 4: Quality Tests */}
                    <div className="flex flex-col items-center space-y-2 min-w-[120px]">
                      <div className={`p-3 rounded-full ${workOrderTests.length > 0 ? 'bg-purple-100' : 'bg-gray-100'}`}>
                        <TestTube className={`w-6 h-6 ${workOrderTests.length > 0 ? 'text-purple-600' : 'text-gray-400'}`} />
                      </div>
                      <h4 className="font-medium text-sm">Tests</h4>
                      <div className="text-center">
                        <div className="text-xs text-gray-600">
                          {workOrderTests.length} tests
                        </div>
                        <div className="text-xs">
                          {workOrderTests.filter(qt => qt.status === "Completed").length}/{workOrderTests.length} completed
                        </div>
                        {workOrderTests.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {workOrderTests.map((test: any) => (
                              <div key={test.id} className="flex items-center gap-1">
                                <span className="text-xs text-gray-500 truncate max-w-[80px]">{test.name}</span>
                                <Badge className={`text-xs ${getStatusColor(test.status)}`}>
                                  {test.status}
                                </Badge>
                                {test.status === "Scheduled" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateTestStatus(test.id, "In Progress")}
                                    className="h-4 px-1 text-xs"
                                  >
                                    Start
                                  </Button>
                                )}
                                {test.status === "In Progress" && (
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateTestStatus(test.id, "Completed")}
                                      className="h-4 px-1 text-xs text-green-600"
                                    >
                                      Pass
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateTestStatus(test.id, "Failed")}
                                      className="h-4 px-1 text-xs text-red-600"
                                    >
                                      Fail
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-gray-400" />

                    {/* Step 5: Final Approval */}
                    <div className="flex flex-col items-center space-y-2 min-w-[120px]">
                      <div className={`p-3 rounded-full ${workOrder.status === "Quality Approved" ? 'bg-green-100' : workOrder.status === "Quality Rejected" ? 'bg-red-100' : 'bg-gray-100'}`}>
                        <Shield className={`w-6 h-6 ${workOrder.status === "Quality Approved" ? 'text-green-600' : workOrder.status === "Quality Rejected" ? 'text-red-600' : 'text-gray-400'}`} />
                      </div>
                      <h4 className="font-medium text-sm">Approval</h4>
                      <div className="text-center">
                        <div className="text-xs">
                          {workOrder.status === "Quality Approved" ? "Approved" : 
                           workOrder.status === "Quality Rejected" ? "Rejected" : "Pending"}
                        </div>
                        <div className="text-xs text-gray-600">
                          {workOrder.progress}% complete
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quality Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const event = new CustomEvent('switchTab', { detail: 'work-orders' })
                        window.dispatchEvent(event)
                      }}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Work Order
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedWorkOrder(workOrder)
                        setShowCreateInspection(true)
                      }}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Inspection
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedWorkOrder(workOrder)
                        setShowCreateTest(true)
                      }}
                    >
                      <TestTube className="w-3 h-3 mr-1" />
                      Add Test
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleWorkOrderStatusUpdate(workOrder.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <BarChart3 className="w-3 h-3 mr-1" />
                      Update Status
                    </Button>
                  </div>
                </div>
              )
            })}

            {workOrders.length === 0 && (
              <div className="text-center py-8">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Work Orders</h3>
                <p className="text-gray-500 mb-4">
                  Create work orders to see their quality process workflow
                </p>
                <Button
                  onClick={() => {
                    const event = new CustomEvent('switchTab', { detail: 'work-orders' })
                    window.dispatchEvent(event)
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Work Order
                </Button>
              </div>
            )}
          </div>
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
