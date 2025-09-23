"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, Square, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface ProcessTimerProps {
  processStepId: string
  workOrderId: string
  stepName: string
  estimatedDuration: number // minutes
  actualDuration: number // minutes
  status: "Pending" | "In Progress" | "Completed" | "Paused"
  startTime?: string
  endTime?: string
  operatorId?: string
  workstationId?: string
  qualityCheckRequired: boolean
  qualityStatus?: "Pending" | "Passed" | "Failed"
  onStart: (processStepId: string) => void
  onPause: (processStepId: string) => void
  onResume: (processStepId: string) => void
  onStop: (processStepId: string) => void
  onComplete: (processStepId: string) => void
}

export function ProcessTimer({
  processStepId,
  workOrderId,
  stepName,
  estimatedDuration,
  actualDuration,
  status,
  startTime,
  endTime,
  operatorId,
  workstationId,
  qualityCheckRequired,
  qualityStatus,
  onStart,
  onPause,
  onResume,
  onStop,
  onComplete
}: ProcessTimerProps) {
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [isRunning, setIsRunning] = useState<boolean>(status === "In Progress")

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && startTime && status === "In Progress") {
      interval = setInterval(() => {
        const start = new Date(startTime).getTime()
        const now = new Date().getTime()
        const elapsed = Math.floor((now - start) / 1000 / 60) // minutes
        setCurrentTime(elapsed)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, startTime, status])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800"
      case "In Progress": return "bg-blue-100 text-blue-800"
      case "Paused": return "bg-yellow-100 text-yellow-800"
      case "Pending": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getQualityStatusColor = (qualityStatus: string) => {
    switch (qualityStatus) {
      case "Passed": return "bg-green-100 text-green-800"
      case "Failed": return "bg-red-100 text-red-800"
      case "Pending": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const progressPercentage = estimatedDuration > 0 ? Math.min((currentTime / estimatedDuration) * 100, 100) : 0
  const isOverdue = currentTime > estimatedDuration && status === "In Progress"

  const handleStart = () => {
    setIsRunning(true)
    onStart(processStepId)
  }

  const handlePause = () => {
    setIsRunning(false)
    onPause(processStepId)
  }

  const handleResume = () => {
    setIsRunning(true)
    onResume(processStepId)
  }

  const handleStop = () => {
    setIsRunning(false)
    onStop(processStepId)
  }

  const handleComplete = () => {
    setIsRunning(false)
    onComplete(processStepId)
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{stepName}</CardTitle>
          <Badge className={getStatusColor(status)}>
            {status}
          </Badge>
        </div>
        <CardDescription>
          Work Order: {workOrderId} | Process Step: {processStepId}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timer Display */}
        <div className="text-center">
          <div className="text-3xl font-mono font-bold mb-2">
            {formatDuration(currentTime)}
          </div>
          <div className="text-sm text-gray-500">
            Estimated: {formatDuration(estimatedDuration)}
          </div>
          {isOverdue && (
            <div className="flex items-center justify-center gap-1 text-red-600 text-sm mt-1">
              <AlertCircle className="w-4 h-4" />
              Overdue by {formatDuration(currentTime - estimatedDuration)}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className={`h-2 ${isOverdue ? 'bg-red-100' : ''}`}
          />
        </div>

        {/* Quality Check Status */}
        {qualityCheckRequired && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Quality Check Required</span>
            </div>
            {qualityStatus && (
              <Badge className={getQualityStatusColor(qualityStatus)}>
                {qualityStatus}
              </Badge>
            )}
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2">
          {status === "Pending" && (
            <Button onClick={handleStart} className="flex-1">
              <Play className="w-4 h-4 mr-1" />
              Start
            </Button>
          )}
          
          {status === "In Progress" && (
            <>
              <Button onClick={handlePause} variant="outline" className="flex-1">
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </Button>
              <Button onClick={handleStop} variant="outline" className="flex-1">
                <Square className="w-4 h-4 mr-1" />
                Stop
              </Button>
            </>
          )}
          
          {status === "Paused" && (
            <>
              <Button onClick={handleResume} className="flex-1">
                <Play className="w-4 h-4 mr-1" />
                Resume
              </Button>
              <Button onClick={handleStop} variant="outline" className="flex-1">
                <Square className="w-4 h-4 mr-1" />
                Stop
              </Button>
            </>
          )}
          
          {status === "In Progress" && !qualityCheckRequired && (
            <Button onClick={handleComplete} className="flex-1">
              <CheckCircle className="w-4 h-4 mr-1" />
              Complete
            </Button>
          )}
        </div>

        {/* Time Information */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Start Time</div>
            <div className="font-mono">
              {startTime ? new Date(startTime).toLocaleTimeString() : "Not started"}
            </div>
          </div>
          <div>
            <div className="text-gray-500">End Time</div>
            <div className="font-mono">
              {endTime ? new Date(endTime).toLocaleTimeString() : "In progress"}
            </div>
          </div>
        </div>

        {/* Resource Information */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Operator</div>
            <div className="font-medium">{operatorId || "Unassigned"}</div>
          </div>
          <div>
            <div className="text-gray-500">Workstation</div>
            <div className="font-medium">{workstationId || "Unassigned"}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
