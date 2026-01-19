"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowDown, CheckCircle, Clock } from "lucide-react"

interface ConvergenceIndicatorProps {
  conductorComplete: boolean
  shellComplete: boolean
  conductorProgress: number
  shellProgress: number
}

export function ConvergenceIndicator({
  conductorComplete,
  shellComplete,
  conductorProgress,
  shellProgress
}: ConvergenceIndicatorProps) {
  const readyForAssembly = conductorComplete && shellComplete

  return (
    <div className="flex items-center justify-center py-4">
      <div className="flex items-center gap-4 w-full max-w-2xl">
        {/* Conductor Track Line */}
        <div className="flex-1 relative">
          <div className={`h-1 ${conductorComplete ? 'bg-green-500' : 'bg-gray-300'}`} />
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <Badge className={conductorComplete ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {conductorProgress}%
            </Badge>
          </div>
        </div>

        {/* Convergence Point */}
        <Card className={`px-6 py-3 ${readyForAssembly ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}`}>
          <CardContent className="p-0">
            <div className="flex flex-col items-center gap-2">
              {readyForAssembly ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <Badge className="bg-green-100 text-green-800">
                    Ready for Assembly
                  </Badge>
                </>
              ) : (
                <>
                  <Clock className="w-6 h-6 text-gray-400" />
                  <Badge className="bg-gray-100 text-gray-800">
                    Waiting
                  </Badge>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Shell Track Line */}
        <div className="flex-1 relative">
          <div className={`h-1 ${shellComplete ? 'bg-green-500' : 'bg-gray-300'}`} />
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <Badge className={shellComplete ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {shellProgress}%
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
