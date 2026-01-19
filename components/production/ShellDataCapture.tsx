"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, X } from "lucide-react"
import { DEFECT_TYPES, REWORK_REASON_CODES } from "@/lib/reason-codes"
import { ProcessStep } from "@/lib/types"

interface ShellDataCaptureProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  processStep: ProcessStep
  onSave: (data: ProcessStep["stageData"]) => void
  workstations?: Array<{ id: string; name: string }>
  operators?: Array<{ id: string; name: string }>
}

export function ShellDataCapture({
  open,
  onOpenChange,
  processStep,
  onSave,
  workstations = [],
  operators = []
}: ShellDataCaptureProps) {
  const existingData = processStep.stageData || {}
  
  const [outputByStation, setOutputByStation] = useState<Array<{
    stationId: string
    quantity: number
  }>>(
    existingData.outputByStation
      ? Object.entries(existingData.outputByStation).map(([stationId, data]) => ({
          stationId,
          quantity: data.quantity
        }))
      : []
  )

  const [defects, setDefects] = useState<Array<{
    id: string
    defectType: string
    quantity: number
    description: string
    operatorId: string
  }>>(existingData.defects || [])

  const [reworkTags, setReworkTags] = useState<Array<{
    id: string
    tag: string
    reason: string
    quantity: number
  }>>(existingData.reworkTags || [])

  const [bufferHandoff, setBufferHandoff] = useState<{
    toBuffer: string
    quantity: number
    operatorId: string
    notes?: string
  }>(existingData.bufferHandoff || {
    toBuffer: "",
    quantity: 0,
    operatorId: ""
  })

  const [newOutputStation, setNewOutputStation] = useState({
    stationId: "",
    quantity: 0
  })

  const [newDefect, setNewDefect] = useState({
    defectType: "",
    quantity: 0,
    description: "",
    operatorId: ""
  })

  const [newReworkTag, setNewReworkTag] = useState({
    tag: "",
    reason: "",
    quantity: 0
  })

  const handleAddOutputStation = () => {
    if (newOutputStation.stationId && newOutputStation.quantity > 0) {
      setOutputByStation([...outputByStation, { ...newOutputStation }])
      setNewOutputStation({ stationId: "", quantity: 0 })
    }
  }

  const handleRemoveOutputStation = (index: number) => {
    setOutputByStation(outputByStation.filter((_, i) => i !== index))
  }

  const handleAddDefect = () => {
    if (newDefect.defectType && newDefect.quantity > 0 && newDefect.operatorId) {
      setDefects([...defects, {
        ...newDefect,
        id: `defect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }])
      setNewDefect({ defectType: "", quantity: 0, description: "", operatorId: "" })
    }
  }

  const handleRemoveDefect = (id: string) => {
    setDefects(defects.filter(d => d.id !== id))
  }

  const handleAddReworkTag = () => {
    if (newReworkTag.tag && newReworkTag.reason && newReworkTag.quantity > 0) {
      setReworkTags([...reworkTags, {
        ...newReworkTag,
        id: `rework-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }])
      setNewReworkTag({ tag: "", reason: "", quantity: 0 })
    }
  }

  const handleRemoveReworkTag = (id: string) => {
    setReworkTags(reworkTags.filter(t => t.id !== id))
  }

  const handleSave = () => {
    const outputByStationRecord: Record<string, {
      stationId: string
      quantity: number
      timestamp: string
    }> = {}
    
    outputByStation.forEach(output => {
      outputByStationRecord[output.stationId] = {
        stationId: output.stationId,
        quantity: output.quantity,
        timestamp: new Date().toISOString()
      }
    })

    const defectsWithTimestamps = defects.map(defect => ({
      ...defect,
      timestamp: new Date().toISOString()
    }))

    const reworkTagsWithTimestamps = reworkTags.map(tag => ({
      ...tag,
      timestamp: new Date().toISOString()
    }))

    const bufferHandoffWithTimestamp = bufferHandoff.toBuffer ? {
      ...bufferHandoff,
      timestamp: new Date().toISOString()
    } : undefined

    const stageData: ProcessStep["stageData"] = {
      outputByStation: outputByStationRecord,
      defects: defectsWithTimestamps,
      reworkTags: reworkTagsWithTimestamps,
      bufferHandoff: bufferHandoffWithTimestamp
    }

    onSave(stageData)
    onOpenChange(false)
  }

  const getStationName = (stationId: string) => {
    return workstations.find(ws => ws.id === stationId)?.name || stationId
  }

  const getOperatorName = (operatorId: string) => {
    return operators.find(op => op.id === operatorId)?.name || operatorId
  }

  const totalOutput = outputByStation.reduce((sum, output) => sum + output.quantity, 0)
  const totalDefects = defects.reduce((sum, defect) => sum + defect.quantity, 0)
  const totalRework = reworkTags.reduce((sum, tag) => sum + tag.quantity, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Shell Processing Data Capture</DialogTitle>
          <DialogDescription>
            Record output by station, defects, rework tags, and buffer handoff for {processStep.stepName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Output by Station */}
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-semibold">Output by Station</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="outputStation">Station</Label>
                <Select value={newOutputStation.stationId} onValueChange={(value) => setNewOutputStation({ ...newOutputStation, stationId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select station" />
                  </SelectTrigger>
                  <SelectContent>
                    {workstations.map(ws => (
                      <SelectItem key={ws.id} value={ws.id}>{ws.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="outputQuantity">Quantity</Label>
                <Input
                  id="outputQuantity"
                  type="number"
                  min="0"
                  value={newOutputStation.quantity}
                  onChange={(e) => setNewOutputStation({ ...newOutputStation, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <Button type="button" onClick={handleAddOutputStation} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Station Output
            </Button>

            {outputByStation.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Station</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outputByStation.map((output, index) => (
                    <TableRow key={index}>
                      <TableCell>{getStationName(output.stationId)}</TableCell>
                      <TableCell>{output.quantity}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveOutputStation(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Defect Tagging */}
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-semibold">Defect Tagging</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defectType">Defect Type</Label>
                <Select value={newDefect.defectType} onValueChange={(value) => setNewDefect({ ...newDefect, defectType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select defect type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFECT_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="defectQuantity">Quantity</Label>
                <Input
                  id="defectQuantity"
                  type="number"
                  min="0"
                  value={newDefect.quantity}
                  onChange={(e) => setNewDefect({ ...newDefect, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defectDescription">Description</Label>
                <Textarea
                  id="defectDescription"
                  value={newDefect.description}
                  onChange={(e) => setNewDefect({ ...newDefect, description: e.target.value })}
                  placeholder="Describe the defect"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defectOperator">Operator</Label>
                <Select value={newDefect.operatorId} onValueChange={(value) => setNewDefect({ ...newDefect, operatorId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {operators.map(op => (
                      <SelectItem key={op.id} value={op.id}>{op.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="button" onClick={handleAddDefect} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Defect
            </Button>

            {defects.length > 0 && (
              <div className="space-y-2">
                {defects.map(defect => (
                  <div key={defect.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">{defect.defectType}</Badge>
                        <span className="font-medium">Qty: {defect.quantity}</span>
                        <span className="text-sm text-gray-500">by {getOperatorName(defect.operatorId)}</span>
                      </div>
                      {defect.description && (
                        <div className="text-sm text-gray-600 mt-1">{defect.description}</div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDefect(defect.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rework Tagging */}
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-semibold">Rework Tagging</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reworkTag">Tag</Label>
                <Input
                  id="reworkTag"
                  value={newReworkTag.tag}
                  onChange={(e) => setNewReworkTag({ ...newReworkTag, tag: e.target.value })}
                  placeholder="Rework tag identifier"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reworkReason">Reason</Label>
                <Select value={newReworkTag.reason} onValueChange={(value) => setNewReworkTag({ ...newReworkTag, reason: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {REWORK_REASON_CODES.map(reason => (
                      <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reworkQuantity">Quantity</Label>
                <Input
                  id="reworkQuantity"
                  type="number"
                  min="0"
                  value={newReworkTag.quantity}
                  onChange={(e) => setNewReworkTag({ ...newReworkTag, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <Button type="button" onClick={handleAddReworkTag} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Rework Tag
            </Button>

            {reworkTags.length > 0 && (
              <div className="space-y-2">
                {reworkTags.map(tag => (
                  <div key={tag.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">{tag.tag}</Badge>
                      <span className="font-medium">{tag.reason}</span>
                      <span className="text-sm text-gray-500">Qty: {tag.quantity}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveReworkTag(tag.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buffer Handoff */}
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-semibold">WIP Handoff to Surface Treatment Buffer</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bufferName">Buffer Name</Label>
                <Input
                  id="bufferName"
                  value={bufferHandoff.toBuffer}
                  onChange={(e) => setBufferHandoff({ ...bufferHandoff, toBuffer: e.target.value })}
                  placeholder="e.g., Surface Treatment Buffer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bufferQuantity">Quantity</Label>
                <Input
                  id="bufferQuantity"
                  type="number"
                  min="0"
                  value={bufferHandoff.quantity}
                  onChange={(e) => setBufferHandoff({ ...bufferHandoff, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bufferOperator">Operator</Label>
                <Select value={bufferHandoff.operatorId} onValueChange={(value) => setBufferHandoff({ ...bufferHandoff, operatorId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {operators.map(op => (
                      <SelectItem key={op.id} value={op.id}>{op.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bufferNotes">Notes</Label>
                <Textarea
                  id="bufferNotes"
                  value={bufferHandoff.notes || ""}
                  onChange={(e) => setBufferHandoff({ ...bufferHandoff, notes: e.target.value })}
                  placeholder="Additional notes"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Summary</h3>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Total Output</div>
                <div className="font-semibold">{totalOutput}</div>
              </div>
              <div>
                <div className="text-gray-500">Total Defects</div>
                <div className="font-semibold text-red-600">{totalDefects}</div>
              </div>
              <div>
                <div className="text-gray-500">Total Rework</div>
                <div className="font-semibold text-yellow-600">{totalRework}</div>
              </div>
              <div>
                <div className="text-gray-500">Buffer Handoff</div>
                <div className="font-semibold text-blue-600">{bufferHandoff.quantity || 0}</div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
