"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProcessStep } from "@/lib/types"
import { Factory, Package, AlertTriangle, RotateCcw, ArrowRight } from "lucide-react"

interface StageDataSummaryProps {
  processStep: ProcessStep
  workstations?: Array<{ id: string; name: string }>
  operators?: Array<{ id: string; name: string }>
}

export function StageDataSummary({ processStep, workstations = [], operators = [] }: StageDataSummaryProps) {
  const stageData = processStep.stageData
  if (!stageData) return null

  const getStationName = (stationId: string) => {
    return workstations.find(ws => ws.id === stationId)?.name || stationId
  }

  const getOperatorName = (operatorId: string) => {
    return operators.find(op => op.id === operatorId)?.name || operatorId
  }

  // Conductor Processing Summary
  const conductorSummary = processStep.stage === "Conductor Processing" && (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stageData.outputQuantity || 0}</div>
          <div className="text-sm text-gray-600">Output</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{stageData.scrapQuantity || 0}</div>
          <div className="text-sm text-gray-600">Scrap</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{stageData.reworkQuantity || 0}</div>
          <div className="text-sm text-gray-600">Rework</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {(stageData.outputQuantity || 0) - (stageData.scrapQuantity || 0) - (stageData.reworkQuantity || 0)}
          </div>
          <div className="text-sm text-gray-600">Good Output</div>
        </div>
      </div>

      {stageData.scrapReasonCodes && stageData.scrapReasonCodes.length > 0 && (
        <div>
          <div className="text-sm font-medium mb-2">Scrap Reasons:</div>
          <div className="flex flex-wrap gap-2">
            {stageData.scrapReasonCodes.map((reason, idx) => (
              <Badge key={idx} variant="destructive">{reason}</Badge>
            ))}
          </div>
        </div>
      )}

      {stageData.reworkReasonCodes && stageData.reworkReasonCodes.length > 0 && (
        <div>
          <div className="text-sm font-medium mb-2">Rework Reasons:</div>
          <div className="flex flex-wrap gap-2">
            {stageData.reworkReasonCodes.map((reason, idx) => (
              <Badge key={idx} variant="outline" className="bg-yellow-100 text-yellow-800">{reason}</Badge>
            ))}
          </div>
        </div>
      )}

      {stageData.wipStatusByStation && Object.keys(stageData.wipStatusByStation).length > 0 && (
        <div>
          <div className="text-sm font-medium mb-2 flex items-center gap-2">
            <Factory className="w-4 h-4" />
            WIP Status by Station:
          </div>
          <div className="space-y-2">
            {Object.values(stageData.wipStatusByStation).map((wip, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">{getStationName(wip.stationId)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{wip.quantity}</span>
                  <Badge variant="outline">{wip.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  // Shell Processing Summary
  const shellSummary = processStep.stage === "Shell Processing" && (
    <div className="space-y-4">
      {stageData.outputByStation && Object.keys(stageData.outputByStation).length > 0 && (
        <div>
          <div className="text-sm font-medium mb-2 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Output by Station:
          </div>
          <div className="space-y-2">
            {Object.values(stageData.outputByStation).map((output, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                <span className="text-sm">{getStationName(output.stationId)}</span>
                <span className="text-sm font-medium">{output.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stageData.defects && stageData.defects.length > 0 && (
        <div>
          <div className="text-sm font-medium mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            Defects ({stageData.defects.reduce((sum, d) => sum + d.quantity, 0)}):
          </div>
          <div className="space-y-2">
            {stageData.defects.map(defect => (
              <div key={defect.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">{defect.defectType}</Badge>
                  <span className="text-sm">{defect.description}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Qty: {defect.quantity}</span>
                  <span className="text-xs text-gray-500">by {getOperatorName(defect.operatorId)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stageData.reworkTags && stageData.reworkTags.length > 0 && (
        <div>
          <div className="text-sm font-medium mb-2 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-yellow-600" />
            Rework Tags ({stageData.reworkTags.reduce((sum, t) => sum + t.quantity, 0)}):
          </div>
          <div className="space-y-2">
            {stageData.reworkTags.map(tag => (
              <div key={tag.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">{tag.tag}</Badge>
                  <span className="text-sm">{tag.reason}</span>
                </div>
                <span className="text-sm font-medium">Qty: {tag.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stageData.bufferHandoff && (
        <div>
          <div className="text-sm font-medium mb-2 flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-blue-600" />
            Buffer Handoff:
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{stageData.bufferHandoff.toBuffer}</div>
                {stageData.bufferHandoff.notes && (
                  <div className="text-sm text-gray-600 mt-1">{stageData.bufferHandoff.notes}</div>
                )}
              </div>
              <div className="text-right">
                <div className="font-bold text-blue-600">{stageData.bufferHandoff.quantity}</div>
                <div className="text-xs text-gray-500">by {getOperatorName(stageData.bufferHandoff.operatorId)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // Assembly Summary
  const assemblySummary = processStep.stage === "Product Assembly" && (
    <div className="space-y-4">
      {stageData.assemblyTimeByStation && Object.keys(stageData.assemblyTimeByStation).length > 0 && (
        <div>
          <div className="text-sm font-medium mb-2">Assembly Time by Station:</div>
          <div className="space-y-2">
            {Object.values(stageData.assemblyTimeByStation).map((time, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                <span className="text-sm">{getStationName(time.stationId)}</span>
                <span className="text-sm font-medium">{time.timeSpent} min</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stageData.reworkRecords && stageData.reworkRecords.length > 0 && (
        <div>
          <div className="text-sm font-medium mb-2 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-yellow-600" />
            Rework Records ({stageData.reworkRecords.reduce((sum, r) => sum + r.quantity, 0)}):
          </div>
          <div className="space-y-2">
            {stageData.reworkRecords.map(record => (
              <div key={record.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">{record.reason}</Badge>
                  <span className="text-sm">Qty: {record.quantity}</span>
                  <span className="text-xs text-gray-500">by {getOperatorName(record.operatorId)}</span>
                  {record.corrected && (
                    <Badge variant="outline" className="bg-green-100 text-green-800">Corrected</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stageData.deviationRecords && stageData.deviationRecords.length > 0 && (
        <div>
          <div className="text-sm font-medium mb-2">Deviation Records:</div>
          <div className="space-y-2">
            {stageData.deviationRecords.map(record => (
              <div key={record.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{record.deviationType}</Badge>
                  <span className="text-sm">{record.description}</span>
                  {record.approved && (
                    <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>
                  )}
                  {record.approvedBy && (
                    <span className="text-xs text-gray-500">by {record.approvedBy}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stageData.wipByVariant && Object.keys(stageData.wipByVariant).length > 0 && (
        <div>
          <div className="text-sm font-medium mb-2">WIP by Product Variant:</div>
          <div className="space-y-2">
            {Object.values(stageData.wipByVariant).map(variant => (
              <div key={variant.variantId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium text-sm">{variant.variantName} ({variant.variantId})</div>
                  {variant.currentStation && (
                    <div className="text-xs text-gray-500">Station: {getStationName(variant.currentStation)}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{variant.quantity}</span>
                  <Badge variant="outline">{variant.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  if (!conductorSummary && !shellSummary && !assemblySummary) return null

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Captured Data Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {conductorSummary}
        {shellSummary}
        {assemblySummary}
      </CardContent>
    </Card>
  )
}
