"use client"

import { ProcessStep } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Factory, CheckCircle, Clock, AlertTriangle } from "lucide-react"

interface ProcessStageGroupProps {
  stageName: string
  steps: ProcessStep[]
  parallelTrack?: "A" | "B" | "C"
  isConverged?: boolean
}

export function ProcessStageGroup({ stageName, steps, parallelTrack, isConverged }: ProcessStageGroupProps) {
  const completedSteps = steps.filter(s => s.status === "Completed").length
  const inProgressSteps = steps.filter(s => s.status === "In Progress").length
  const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0

  const getTrackColor = () => {
    switch (parallelTrack) {
      case "A":
        return "bg-orange-100 text-orange-800 border-orange-300"
      case "B":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "C":
        return "bg-blue-100 text-blue-800 border-blue-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "In Progress":
        return "bg-blue-100 text-blue-800"
      case "Paused":
        return "bg-yellow-100 text-yellow-800"
      case "Pending":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className={`${isConverged ? 'border-2 border-blue-500' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Factory className="w-5 h-5 text-gray-600" />
            <div>
              <CardTitle className="text-lg">{stageName}</CardTitle>
              <CardDescription>
                {steps.length} steps • {completedSteps} completed • {inProgressSteps} in progress
              </CardDescription>
            </div>
          </div>
          {parallelTrack && (
            <Badge className={getTrackColor()}>
              Track {parallelTrack}
            </Badge>
          )}
          {isConverged && (
            <Badge className="bg-blue-100 text-blue-800">
              Converged
            </Badge>
          )}
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                step.status === "Completed"
                  ? "bg-green-50 border-green-200"
                  : step.status === "In Progress"
                  ? "bg-blue-50 border-blue-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-300 font-semibold text-sm">
                  {step.stageOrder || index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{step.stepName}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getStatusColor(step.status)}>
                      {step.status}
                    </Badge>
                    {step.qualityCheckRequired && (
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Quality Check
                      </Badge>
                    )}
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {Math.floor(step.estimatedDuration / 60)}h {step.estimatedDuration % 60}m
                    </div>
                  </div>
                </div>
              </div>
              {step.dependsOn && step.dependsOn.length > 0 && (
                <div className="ml-2">
                  <Badge variant="outline" className="text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Depends on {step.dependsOn.length} step{step.dependsOn.length > 1 ? 's' : ''}
                  </Badge>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
