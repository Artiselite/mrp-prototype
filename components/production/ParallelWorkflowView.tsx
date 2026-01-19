"use client"

import { ProcessStep } from "@/lib/types"
import { ProcessStageGroup } from "./ProcessStageGroup"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowDown, ArrowRight } from "lucide-react"

interface ParallelWorkflowViewProps {
  steps: ProcessStep[]
}

export function ParallelWorkflowView({ steps }: ParallelWorkflowViewProps) {
  // Group steps by stage
  const conductorSteps = steps.filter(s => s.stage === "Conductor Processing")
  const shellSteps = steps.filter(s => s.stage === "Shell Processing")
  const assemblySteps = steps.filter(s => s.stage === "Product Assembly")

  // Check if both parallel tracks are complete
  const conductorComplete = conductorSteps.length > 0 && conductorSteps.every(s => s.status === "Completed")
  const shellComplete = shellSteps.length > 0 && shellSteps.every(s => s.status === "Completed")
  const readyForAssembly = conductorComplete && shellComplete

  return (
    <div className="space-y-6">
      {/* Parallel Tracks Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conductor Processing Track */}
        <div className="space-y-4">
          <ProcessStageGroup
            stageName="Conductor Processing"
            steps={conductorSteps}
            parallelTrack="A"
          />
        </div>

        {/* Shell Processing Track */}
        <div className="space-y-4">
          <ProcessStageGroup
            stageName="Shell Processing"
            steps={shellSteps}
            parallelTrack="B"
          />
        </div>
      </div>

      {/* Convergence Indicator */}
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center gap-4">
          <div className={`flex-1 h-0.5 ${conductorComplete ? 'bg-green-500' : 'bg-gray-300'}`} />
          <Card className={`px-6 py-3 ${readyForAssembly ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}`}>
            <CardContent className="p-0">
              <div className="flex items-center gap-2">
                <ArrowDown className={`w-5 h-5 ${readyForAssembly ? 'text-green-600' : 'text-gray-400'}`} />
                <Badge className={readyForAssembly ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {readyForAssembly ? 'Ready for Assembly' : 'Waiting for Parallel Tracks'}
                </Badge>
                <ArrowDown className={`w-5 h-5 ${readyForAssembly ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
            </CardContent>
          </Card>
          <div className={`flex-1 h-0.5 ${shellComplete ? 'bg-green-500' : 'bg-gray-300'}`} />
        </div>
      </div>

      {/* Assembly Stage */}
      <div className="space-y-4">
        <ProcessStageGroup
          stageName="Product Assembly"
          steps={assemblySteps}
          parallelTrack="C"
          isConverged={true}
        />
        {!readyForAssembly && assemblySteps.length > 0 && (
          <Card className="border-yellow-300 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-yellow-800">
                <ArrowRight className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Assembly cannot start until both Conductor Processing and Shell Processing are complete
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
