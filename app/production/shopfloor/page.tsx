"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Factory,
  Clock,
  BarChart3,
  Play,
  Pause,
  Square,
  CheckCircle,
  AlertTriangle,
  Users,
  FileText,
  Activity
} from "lucide-react"
import { useDatabaseContext } from "@/components/database-provider"
import { ProcessTimer as ProcessTimerComponent } from "@/components/process-timer"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import { OEECalculator, formatOEEValue, formatDuration, formatThroughput, getOEEStatusColor, getAlertSeverityColor } from "@/lib/oee-utils"
import { productionLines, oeeMetrics, oeeAlerts, oeeTrends, processTimers, qrCodes } from "@/lib/data"
import type { ProcessStep, ProcessTimer, QRCode } from "@/lib/types"
import { ParallelWorkflowView } from "@/components/production/ParallelWorkflowView"
import { StageProgressBar } from "@/components/production/StageProgressBar"
import { ConvergenceIndicator } from "@/components/production/ConvergenceIndicator"
import { ConductorDataCapture } from "@/components/production/ConductorDataCapture"
import { ShellDataCapture } from "@/components/production/ShellDataCapture"
import { AssemblyDataCapture } from "@/components/production/AssemblyDataCapture"
import { StageDataSummary } from "@/components/production/StageDataSummary"
import { WIPStatusIndicator } from "@/components/production/WIPStatusIndicator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ShopfloorPage() {
  const { 
    workstations = [], 
    operators = [],
    productionWorkOrders: workOrders = [],
    shopfloorActivities = [],
    getProcessStepsByWorkOrder,
    updateProcessStep,
    createShopfloorActivity
  } = useDatabaseContext()

  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null)
  const [activeProcessSteps, setActiveProcessSteps] = useState<ProcessStep[]>([])
  const [activeTimers, setActiveTimers] = useState<ProcessTimer[]>([])
  const [activeQRCodes, setActiveQRCodes] = useState<QRCode[]>([])
  const [viewMode, setViewMode] = useState<"sequential" | "parallel">("sequential")
  const [stageFilter, setStageFilter] = useState<string>("all")
  const [dataCaptureStepId, setDataCaptureStepId] = useState<string | null>(null)

  // Load process steps for selected work order
  useEffect(() => {
    if (selectedWorkOrder) {
      const workOrderSteps = getProcessStepsByWorkOrder(selectedWorkOrder.id)
      setActiveProcessSteps(workOrderSteps)
      
      const workOrderTimers = processTimers.filter(pt => pt.workOrderId === selectedWorkOrder.id)
      setActiveTimers(workOrderTimers)
      
      // Generate QR codes for all process steps
      const allQRCodes = workOrderSteps.flatMap(step => generateQRCodesForStep(step))
      setActiveQRCodes(allQRCodes)
      
      // Auto-detect if this is a parallel workflow (has stage information)
      const hasStages = workOrderSteps.some(s => s.stage)
      if (hasStages) {
        setViewMode("parallel")
      } else {
        setViewMode("sequential")
      }
    }
  }, [selectedWorkOrder, getProcessStepsByWorkOrder])

  // Generate QR codes for a process step
  const generateQRCodesForStep = (step: ProcessStep): QRCode[] => {
    const qrCodesForStep: QRCode[] = [
      {
        id: `QR_${step.id}_START`,
        type: "Start",
        processStepId: step.id,
        workOrderId: step.workOrderId,
        workstationId: step.workstationId || "",
        operatorId: step.operatorId || "",
        data: `START:${step.id}:${step.workOrderId}:${step.workstationId || ""}:${step.operatorId || ""}:${new Date().toISOString()}`,
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours
        isUsed: step.status === "In Progress" || step.status === "Completed",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `QR_${step.id}_STOP`,
        type: "Stop",
        processStepId: step.id,
        workOrderId: step.workOrderId,
        workstationId: step.workstationId || "",
        operatorId: step.operatorId || "",
        data: `STOP:${step.id}:${step.workOrderId}:${step.workstationId || ""}:${step.operatorId || ""}:${new Date().toISOString()}`,
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        isUsed: step.status === "Completed",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `QR_${step.id}_PAUSE`,
        type: "Pause",
        processStepId: step.id,
        workOrderId: step.workOrderId,
        workstationId: step.workstationId || "",
        operatorId: step.operatorId || "",
        data: `PAUSE:${step.id}:${step.workOrderId}:${step.workstationId || ""}:${step.operatorId || ""}:${new Date().toISOString()}`,
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        isUsed: step.status === "Paused",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `QR_${step.id}_RESUME`,
        type: "Resume",
        processStepId: step.id,
        workOrderId: step.workOrderId,
        workstationId: step.workstationId || "",
        operatorId: step.operatorId || "",
        data: `RESUME:${step.id}:${step.workOrderId}:${step.workstationId || ""}:${step.operatorId || ""}:${new Date().toISOString()}`,
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        isUsed: step.status === "In Progress",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    if (step.qualityCheckRequired) {
      qrCodesForStep.push({
        id: `QR_${step.id}_QUALITY`,
        type: "Quality Check",
        processStepId: step.id,
        workOrderId: step.workOrderId,
        workstationId: step.workstationId || "",
        operatorId: step.operatorId || "",
        data: `QUALITY:${step.id}:${step.workOrderId}:${step.workstationId || ""}:${step.operatorId || ""}:${new Date().toISOString()}`,
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        isUsed: step.qualityStatus === "Passed" || step.qualityStatus === "Failed",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }

    return qrCodesForStep
  }

  // Process control functions
  const handleProcessStart = (processStepId: string) => {
    const processStep = activeProcessSteps.find(ps => ps.id === processStepId)
    if (!processStep) return

    // Update process step in database
    updateProcessStep(processStepId, {
      status: "In Progress",
      startTime: new Date().toISOString()
    })

    // Update local state
    setActiveProcessSteps(prev => 
      prev.map(ps => ps.id === processStepId 
        ? { ...ps, status: "In Progress", startTime: new Date().toISOString() }
        : ps
      )
    )

    // Create shopfloor activity
    createShopfloorActivity({
      workstationId: processStep.workstationId || "",
      operatorId: processStep.operatorId || "",
      workOrderId: processStep.workOrderId,
      activityType: "Start",
      timestamp: new Date().toISOString(),
      notes: `Started process: ${processStep.stepName}`
    })

    refreshQRCodes()
  }

  const handleProcessPause = (processStepId: string) => {
    const processStep = activeProcessSteps.find(ps => ps.id === processStepId)
    if (!processStep) return

    updateProcessStep(processStepId, { status: "Paused" })

    setActiveProcessSteps(prev => 
      prev.map(ps => ps.id === processStepId 
        ? { ...ps, status: "Paused" }
        : ps
      )
    )

    createShopfloorActivity({
      workstationId: processStep.workstationId || "",
      operatorId: processStep.operatorId || "",
      workOrderId: processStep.workOrderId,
      activityType: "Pause",
      timestamp: new Date().toISOString(),
      notes: `Paused process: ${processStep.stepName}`
    })

    refreshQRCodes()
  }

  const handleProcessResume = (processStepId: string) => {
    const processStep = activeProcessSteps.find(ps => ps.id === processStepId)
    if (!processStep) return

    updateProcessStep(processStepId, { status: "In Progress" })

    setActiveProcessSteps(prev => 
      prev.map(ps => ps.id === processStepId 
        ? { ...ps, status: "In Progress" }
        : ps
      )
    )

    createShopfloorActivity({
      workstationId: processStep.workstationId || "",
      operatorId: processStep.operatorId || "",
      workOrderId: processStep.workOrderId,
      activityType: "Resume",
      timestamp: new Date().toISOString(),
      notes: `Resumed process: ${processStep.stepName}`
    })

    refreshQRCodes()
  }

  const handleProcessStop = (processStepId: string) => {
    const processStep = activeProcessSteps.find(ps => ps.id === processStepId)
    if (!processStep) return

    updateProcessStep(processStepId, {
      status: "Completed",
      endTime: new Date().toISOString()
    })

    setActiveProcessSteps(prev => 
      prev.map(ps => ps.id === processStepId 
        ? { ...ps, status: "Completed", endTime: new Date().toISOString() }
        : ps
      )
    )

    createShopfloorActivity({
      workstationId: processStep.workstationId || "",
      operatorId: processStep.operatorId || "",
      workOrderId: processStep.workOrderId,
      activityType: "Complete",
      timestamp: new Date().toISOString(),
      notes: `Completed process: ${processStep.stepName}`
    })

    refreshQRCodes()
  }

  const handleProcessComplete = (processStepId: string) => {
    // Open data capture modal based on stage
    const processStep = activeProcessSteps.find(ps => ps.id === processStepId)
    if (processStep?.stage) {
      setDataCaptureStepId(processStepId)
    } else {
      // If no stage, just complete normally
      handleProcessStop(processStepId)
    }
  }

  const handleSaveStageData = (processStepId: string, stageData: ProcessStep["stageData"]) => {
    updateProcessStep(processStepId, { stageData })
    
    // Update local state
    setActiveProcessSteps(prev => 
      prev.map(ps => ps.id === processStepId 
        ? { ...ps, stageData }
        : ps
      )
    )

    // Complete the step if not already completed
    const processStep = activeProcessSteps.find(ps => ps.id === processStepId)
    if (processStep && processStep.status !== "Completed") {
      handleProcessStop(processStepId)
    }

    setDataCaptureStepId(null)
  }

  const handleCancelDataCapture = () => {
    setDataCaptureStepId(null)
  }

  const refreshQRCodes = () => {
    const allQRCodes = activeProcessSteps.flatMap(step => generateQRCodesForStep(step))
    setActiveQRCodes(allQRCodes)
  }

  // OEE calculations
  const currentOEE = oeeMetrics.length > 0 ? oeeMetrics[0].oee : 0
  const averageOEE = oeeMetrics.reduce((acc, metric) => acc + metric.oee, 0) / oeeMetrics.length
  const activeAlerts = oeeAlerts.filter(alert => alert.status === "Active")

  // Helper functions
  const getWorkOrderStatusColor = (status: string) => {
    switch (status) {
      case "In Progress": return "bg-blue-100 text-blue-800"
      case "Planned": return "bg-yellow-100 text-yellow-800"
      case "Completed": return "bg-green-100 text-green-800"
      case "On Hold": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800"
      case "In Progress": return "bg-blue-100 text-blue-800"
      case "Paused": return "bg-yellow-100 text-yellow-800"
      case "Pending": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getWorkstationTypeIcon = (type: string) => {
    return <Factory className="w-4 h-4" />
  }

  const getWorkstationName = (workstationId: string) => {
    const workstation = workstations.find(ws => ws.id === workstationId)
    return workstation ? workstation.name : `WS-${workstationId}`
  }

  const getOperatorName = (operatorId: string) => {
    const operator = operators.find(op => op.id === operatorId)
    return operator ? operator.name : "Unassigned"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shopfloor Control</h1>
          <p className="text-gray-600">Execute and monitor production processes in real-time</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            View Activities
          </Button>
          <Button>
            <CheckCircle className="w-4 h-4 mr-2" />
            View Quality
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="processes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="processes" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Process Execution
          </TabsTrigger>
          <TabsTrigger value="oee" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Performance Monitoring
          </TabsTrigger>
        </TabsList>

        {/* Process Execution Tab */}
        <TabsContent value="processes" className="space-y-6">
          {/* Work Order Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Work Order for Process Execution</CardTitle>
              <CardDescription>
                Choose a work order to execute its manufacturing processes with real-time timers and QR codes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workOrders.filter(wo => wo.status === "In Progress" || wo.status === "Planned").map((workOrder: any) => (
                  <Card 
                    key={workOrder.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedWorkOrder?.id === workOrder.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedWorkOrder(workOrder)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{workOrder.productName}</h3>
                        <Badge className={getWorkOrderStatusColor(workOrder.status)}>
                          {workOrder.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{workOrder.description}</p>
                      <div className="text-xs text-gray-500">
                        <div>Work Order: {workOrder.workOrderNumber}</div>
                        <div>Customer: {workOrder.customer}</div>
                        <div>Progress: {workOrder.progress}%</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Process Steps and QR Codes */}
          {selectedWorkOrder && (
            <div className="space-y-6">
              {/* Stage Progress Overview - Only show for parallel workflows */}
              {activeProcessSteps.some(s => s.stage) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Stage Progress Overview</CardTitle>
                    <CardDescription>
                      Track progress across all manufacturing stages
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(() => {
                      const conductorSteps = activeProcessSteps.filter(s => s.stage === "Conductor Processing")
                      const shellSteps = activeProcessSteps.filter(s => s.stage === "Shell Processing")
                      const assemblySteps = activeProcessSteps.filter(s => s.stage === "Product Assembly")
                      
                      const conductorCompleted = conductorSteps.filter(s => s.status === "Completed").length
                      const shellCompleted = shellSteps.filter(s => s.status === "Completed").length
                      const assemblyCompleted = assemblySteps.filter(s => s.status === "Completed").length
                      
                      const conductorInProgress = conductorSteps.filter(s => s.status === "In Progress").length
                      const shellInProgress = shellSteps.filter(s => s.status === "In Progress").length
                      const assemblyInProgress = assemblySteps.filter(s => s.status === "In Progress").length
                      
                      const conductorComplete = conductorSteps.length > 0 && conductorSteps.every(s => s.status === "Completed")
                      const shellComplete = shellSteps.length > 0 && shellSteps.every(s => s.status === "Completed")
                      
                      return (
                        <>
                          <StageProgressBar
                            stageName="Conductor Processing"
                            completed={conductorCompleted}
                            total={conductorSteps.length}
                            inProgress={conductorInProgress}
                            status={conductorComplete ? "completed" : conductorInProgress > 0 ? "in-progress" : "pending"}
                          />
                          <StageProgressBar
                            stageName="Shell Processing"
                            completed={shellCompleted}
                            total={shellSteps.length}
                            inProgress={shellInProgress}
                            status={shellComplete ? "completed" : shellInProgress > 0 ? "in-progress" : "pending"}
                          />
                          <ConvergenceIndicator
                            conductorComplete={conductorComplete}
                            shellComplete={shellComplete}
                            conductorProgress={conductorSteps.length > 0 ? (conductorCompleted / conductorSteps.length) * 100 : 0}
                            shellProgress={shellSteps.length > 0 ? (shellCompleted / shellSteps.length) * 100 : 0}
                          />
                          <StageProgressBar
                            stageName="Product Assembly"
                            completed={assemblyCompleted}
                            total={assemblySteps.length}
                            inProgress={assemblyInProgress}
                            status={assemblySteps.length > 0 && assemblySteps.every(s => s.status === "Completed") ? "completed" : (conductorComplete && shellComplete) ? "in-progress" : "blocked"}
                          />
                        </>
                      )
                    })()}
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Process Steps - {selectedWorkOrder.productName}</CardTitle>
                      <CardDescription>
                        Execute each manufacturing step with real-time timers and QR code controls
                      </CardDescription>
                    </div>
                    {activeProcessSteps.some(s => s.stage) && (
                      <div className="flex items-center gap-4">
                        <Select value={stageFilter} onValueChange={setStageFilter}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by stage" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Stages</SelectItem>
                            <SelectItem value="Conductor Processing">Conductor Processing</SelectItem>
                            <SelectItem value="Shell Processing">Shell Processing</SelectItem>
                            <SelectItem value="Product Assembly">Product Assembly</SelectItem>
                          </SelectContent>
                        </Select>
                        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "sequential" | "parallel")}>
                          <TabsList>
                            <TabsTrigger value="sequential">Sequential</TabsTrigger>
                            <TabsTrigger value="parallel">Parallel</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Parallel Workflow View */}
                  {viewMode === "parallel" && activeProcessSteps.some(s => s.stage) ? (
                    <ParallelWorkflowView steps={activeProcessSteps.filter(s => stageFilter === "all" || s.stage === stageFilter)} />
                  ) : (
                    /* Sequential View */
                    activeProcessSteps
                      .filter(s => stageFilter === "all" || !s.stage || s.stage === stageFilter)
                      .map((step, index) => {
                    const stepQRCodes = activeQRCodes.filter(qr => qr.processStepId === step.id)
                    
                    return (
                      <div key={step.id} className="space-y-6">
                        {/* Process Step Timer */}
                        <div className="border rounded-lg p-6 bg-white shadow-sm">
                          <ProcessTimerComponent
                            processStepId={step.id}
                            workOrderId={step.workOrderId}
                            stepName={step.stepName}
                            estimatedDuration={step.estimatedDuration}
                            actualDuration={step.actualDuration}
                            status={step.status}
                            startTime={step.startTime}
                            endTime={step.endTime}
                            operatorId={step.operatorId}
                            workstationId={step.workstationId}
                            qualityCheckRequired={step.qualityCheckRequired}
                            qualityStatus={step.qualityStatus}
                            onStart={handleProcessStart}
                            onPause={handleProcessPause}
                            onResume={handleProcessResume}
                            onStop={handleProcessStop}
                            onComplete={handleProcessComplete}
                          />
                        </div>

                        {/* Stage Data Summary */}
                        {step.stageData && (
                          <StageDataSummary
                            processStep={step}
                            workstations={workstations}
                            operators={operators}
                          />
                        )}

                        {/* WIP Status Indicator */}
                        {step.stage && (
                          <WIPStatusIndicator
                            processStep={step}
                            workstations={workstations}
                          />
                        )}

                        {/* Capture Data Button */}
                        {step.stage && (step.status === "In Progress" || step.status === "Completed") && (
                          <div className="flex justify-end">
                            <Button
                              onClick={() => setDataCaptureStepId(step.id)}
                              variant="outline"
                            >
                              {step.stageData ? "Update Data" : "Capture Data"}
                            </Button>
                          </div>
                        )}

                        {/* QR Codes for this step */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-semibold flex items-center gap-2">
                              <Factory className="w-5 h-5" />
                              QR Code Controls - {step.stepName}
                            </h4>
                            <Badge className={getStatusColor(step.status)}>
                              {step.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {stepQRCodes.map((qrCode) => (
                              <div key={qrCode.id} className="border rounded-lg p-4 bg-gray-50">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm font-medium text-gray-700">{qrCode.type} QR</span>
                                  <Badge 
                                    className={qrCode.isUsed ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                                  >
                                    {qrCode.isUsed ? "Used" : "Available"}
                                  </Badge>
                                </div>
                                <QRCodeGenerator
                                  data={qrCode.data}
                                  type={qrCode.type}
                                  processStepId={qrCode.processStepId}
                                  workOrderId={qrCode.workOrderId}
                                  workstationId={qrCode.workstationId}
                                  operatorId={qrCode.operatorId}
                                  expiresAt={qrCode.expiresAt}
                                  isUsed={qrCode.isUsed}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Separator between steps */}
                        {index < activeProcessSteps.filter(s => stageFilter === "all" || !s.stage || s.stage === stageFilter).length - 1 && (
                          <div className="border-t border-gray-200 my-6"></div>
                        )}
                      </div>
                    )
                  })
                  )}
                </CardContent>
              </Card>

              {/* Process Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Process Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{activeProcessSteps.length}</div>
                      <div className="text-sm text-gray-500">Total Steps</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {activeProcessSteps.filter(s => s.status === "Completed").length}
                      </div>
                      <div className="text-sm text-gray-500">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {activeProcessSteps.filter(s => s.status === "In Progress" || s.status === "Paused").length}
                      </div>
                      <div className="text-sm text-gray-500">In Progress</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">
                        {activeProcessSteps.filter(s => s.status === "Pending").length}
                      </div>
                      <div className="text-sm text-gray-500">Pending</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Performance Monitoring Tab */}
        <TabsContent value="oee" className="space-y-6">
          {/* OEE Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current OEE</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getOEEStatusColor(currentOEE)}`}>
                  {formatOEEValue(currentOEE)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Real-time performance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average OEE</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getOEEStatusColor(averageOEE)}`}>
                  {formatOEEValue(averageOEE)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last 24 hours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{activeAlerts.length}</div>
                <p className="text-xs text-muted-foreground">
                  Requires attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Production Lines</CardTitle>
                <Factory className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{productionLines.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active lines
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Production Lines OEE */}
          <Card>
            <CardHeader>
              <CardTitle>Production Lines Performance</CardTitle>
              <CardDescription>
                OEE metrics for each production line
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productionLines.map((line) => {
                  const lineOEE = OEECalculator.calculateProductionLineOEE(
                    oeeMetrics.filter(m => m.productionLineId === line.id)
                  )
                  
                  return (
                    <div key={line.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-medium">{line.name}</h3>
                          <p className="text-sm text-gray-500">{line.description}</p>
                        </div>
                        <Badge variant="outline">{line.status}</Badge>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className={`text-lg font-bold ${getOEEStatusColor(lineOEE.oee)}`}>
                            {formatOEEValue(lineOEE.oee)}
                          </div>
                          <div className="text-xs text-gray-500">OEE</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium">{formatDuration(lineOEE.downtime)}</div>
                          <div className="text-xs text-gray-500">Downtime</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium">{lineOEE.defectiveUnits}</div>
                          <div className="text-xs text-gray-500">Defects</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Data Capture Modals */}
      {dataCaptureStepId && (() => {
        const step = activeProcessSteps.find(s => s.id === dataCaptureStepId)
        if (!step) return null

        if (step.stage === "Conductor Processing") {
          return (
            <ConductorDataCapture
              open={true}
              onOpenChange={(open) => !open && handleCancelDataCapture()}
              processStep={step}
              onSave={(data) => handleSaveStageData(step.id, data)}
              workstations={workstations}
            />
          )
        }

        if (step.stage === "Shell Processing") {
          return (
            <ShellDataCapture
              open={true}
              onOpenChange={(open) => !open && handleCancelDataCapture()}
              processStep={step}
              onSave={(data) => handleSaveStageData(step.id, data)}
              workstations={workstations}
              operators={operators}
            />
          )
        }

        if (step.stage === "Product Assembly") {
          return (
            <AssemblyDataCapture
              open={true}
              onOpenChange={(open) => !open && handleCancelDataCapture()}
              processStep={step}
              onSave={(data) => handleSaveStageData(step.id, data)}
              workstations={workstations}
              operators={operators}
            />
          )
        }

        return null
      })()}
    </div>
  )
}
