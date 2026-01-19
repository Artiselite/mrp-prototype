"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Factory, Package } from "lucide-react"
import { ProcessStep } from "@/lib/types"

interface WIPStatusIndicatorProps {
  processStep: ProcessStep
  workstations?: Array<{ id: string; name: string }>
}

export function WIPStatusIndicator({ processStep, workstations = [] }: WIPStatusIndicatorProps) {
  const stageData = processStep.stageData
  if (!stageData) return null

  const getStationName = (stationId: string) => {
    return workstations.find(ws => ws.id === stationId)?.name || stationId
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800"
      case "In Process": return "bg-blue-100 text-blue-800"
      case "In Queue": return "bg-gray-100 text-gray-800"
      case "On Hold": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  // Conductor Processing WIP
  const conductorWIP = processStep.stage === "Conductor Processing" && stageData.wipStatusByStation && (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Factory className="w-4 h-4" />
        WIP by Station
      </div>
      <div className="grid grid-cols-2 gap-2">
        {Object.values(stageData.wipStatusByStation).map((wip, idx) => (
          <Card key={idx} className="p-2">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">{getStationName(wip.stationId)}</div>
                  <div className="font-semibold">{wip.quantity}</div>
                </div>
                <Badge className={getStatusColor(wip.status)}>{wip.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  // Assembly WIP by Variant
  const assemblyWIP = processStep.stage === "Product Assembly" && stageData.wipByVariant && (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Package className="w-4 h-4" />
        WIP by Product Variant
      </div>
      <div className="grid grid-cols-2 gap-2">
        {Object.values(stageData.wipByVariant).map(variant => (
          <Card key={variant.variantId} className="p-2">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">{variant.variantName}</div>
                  <div className="font-semibold text-xs">{variant.variantId}</div>
                  <div className="font-semibold mt-1">{variant.quantity}</div>
                  {variant.currentStation && (
                    <div className="text-xs text-gray-500 mt-1">
                      @ {getStationName(variant.currentStation)}
                    </div>
                  )}
                </div>
                <Badge className={getStatusColor(variant.status)}>{variant.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  if (!conductorWIP && !assemblyWIP) return null

  return (
    <div className="mt-2">
      {conductorWIP}
      {assemblyWIP}
    </div>
  )
}
