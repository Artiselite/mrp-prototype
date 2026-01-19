"use client"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"

interface StageProgressBarProps {
  stageName: string
  completed: number
  total: number
  inProgress?: number
  status?: "completed" | "in-progress" | "pending" | "blocked"
}

export function StageProgressBar({
  stageName,
  completed,
  total,
  inProgress = 0,
  status = "pending"
}: StageProgressBarProps) {
  const progress = total > 0 ? (completed / total) * 100 : 0

  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "in-progress":
        return <Clock className="w-4 h-4 text-blue-600" />
      case "blocked":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "in-progress":
        return "bg-blue-500"
      case "blocked":
        return "bg-yellow-500"
      default:
        return "bg-gray-300"
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="font-medium text-sm">{stageName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {completed}/{total} completed
          </span>
          {inProgress > 0 && (
            <Badge variant="outline" className="text-xs">
              {inProgress} in progress
            </Badge>
          )}
        </div>
      </div>
      <Progress value={progress} className={`h-2 ${getStatusColor()}`} />
      <div className="text-xs text-gray-500 text-right">
        {Math.round(progress)}% complete
      </div>
    </div>
  )
}
