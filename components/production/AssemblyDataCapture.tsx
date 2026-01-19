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
import { Plus, Trash2, CheckCircle, XCircle } from "lucide-react"
import { REWORK_REASON_CODES, DEVIATION_TYPES } from "@/lib/reason-codes"
import { ProcessStep } from "@/lib/types"

interface AssemblyDataCaptureProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  processStep: ProcessStep
  onSave: (data: ProcessStep["stageData"]) => void
  workstations?: Array<{ id: string; name: string }>
  operators?: Array<{ id: string; name: string }>
}

export function AssemblyDataCapture({
  open,
  onOpenChange,
  processStep,
  onSave,
  workstations = [],
  operators = []
}: AssemblyDataCaptureProps) {
  const existingData = processStep.stageData || {}
  
  const [assemblyTimeByStation, setAssemblyTimeByStation] = useState<Array<{
    stationId: string
    timeSpent: number
    startTime: string
    endTime: string
  }>>(
    existingData.assemblyTimeByStation
      ? Object.values(existingData.assemblyTimeByStation)
      : []
  )

  const [reworkRecords, setReworkRecords] = useState<Array<{
    id: string
    reason: string
    quantity: number
    operatorId: string
    corrected: boolean
  }>>(existingData.reworkRecords || [])

  const [deviationRecords, setDeviationRecords] = useState<Array<{
    id: string
    deviationType: string
    description: string
    approved: boolean
    approvedBy?: string
  }>>(existingData.deviationRecords || [])

  const [wipByVariant, setWipByVariant] = useState<Array<{
    variantId: string
    variantName: string
    quantity: number
    status: "In Queue" | "In Process" | "Completed" | "On Hold"
    currentStation?: string
  }>>(
    existingData.wipByVariant
      ? Object.values(existingData.wipByVariant)
      : []
  )

  const [newAssemblyTime, setNewAssemblyTime] = useState({
    stationId: "",
    timeSpent: 0,
    startTime: "",
    endTime: ""
  })

  const [newReworkRecord, setNewReworkRecord] = useState({
    reason: "",
    quantity: 0,
    operatorId: "",
    corrected: false
  })

  const [newDeviationRecord, setNewDeviationRecord] = useState({
    deviationType: "",
    description: "",
    approved: false,
    approvedBy: ""
  })

  const [newWipVariant, setNewWipVariant] = useState({
    variantId: "",
    variantName: "",
    quantity: 0,
    status: "In Queue" as "In Queue" | "In Process" | "Completed" | "On Hold",
    currentStation: ""
  })

  const handleAddAssemblyTime = () => {
    if (newAssemblyTime.stationId && newAssemblyTime.timeSpent > 0) {
      setAssemblyTimeByStation([...assemblyTimeByStation, { ...newAssemblyTime }])
      setNewAssemblyTime({ stationId: "", timeSpent: 0, startTime: "", endTime: "" })
    }
  }

  const handleRemoveAssemblyTime = (index: number) => {
    setAssemblyTimeByStation(assemblyTimeByStation.filter((_, i) => i !== index))
  }

  const handleAddReworkRecord = () => {
    if (newReworkRecord.reason && newReworkRecord.quantity > 0 && newReworkRecord.operatorId) {
      setReworkRecords([...reworkRecords, {
        ...newReworkRecord,
        id: `rework-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }])
      setNewReworkRecord({ reason: "", quantity: 0, operatorId: "", corrected: false })
    }
  }

  const handleRemoveReworkRecord = (id: string) => {
    setReworkRecords(reworkRecords.filter(r => r.id !== id))
  }

  const handleToggleReworkCorrected = (id: string) => {
    setReworkRecords(reworkRecords.map(r => 
      r.id === id ? { ...r, corrected: !r.corrected } : r
    ))
  }

  const handleAddDeviationRecord = () => {
    if (newDeviationRecord.deviationType && newDeviationRecord.description) {
      setDeviationRecords([...deviationRecords, {
        ...newDeviationRecord,
        id: `deviation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }])
      setNewDeviationRecord({ deviationType: "", description: "", approved: false, approvedBy: "" })
    }
  }

  const handleRemoveDeviationRecord = (id: string) => {
    setDeviationRecords(deviationRecords.filter(d => d.id !== id))
  }

  const handleToggleDeviationApproval = (id: string) => {
    setDeviationRecords(deviationRecords.map(d => 
      d.id === id ? { ...d, approved: !d.approved } : d
    ))
  }

  const handleAddWipVariant = () => {
    if (newWipVariant.variantId && newWipVariant.variantName && newWipVariant.quantity > 0) {
      setWipByVariant([...wipByVariant, { ...newWipVariant }])
      setNewWipVariant({ variantId: "", variantName: "", quantity: 0, status: "In Queue", currentStation: "" })
    }
  }

  const handleRemoveWipVariant = (variantId: string) => {
    setWipByVariant(wipByVariant.filter(v => v.variantId !== variantId))
  }

  const handleSave = () => {
    const assemblyTimeByStationRecord: Record<string, {
      stationId: string
      timeSpent: number
      startTime: string
      endTime: string
    }> = {}
    
    assemblyTimeByStation.forEach(time => {
      assemblyTimeByStationRecord[time.stationId] = time
    })

    const reworkRecordsWithTimestamps = reworkRecords.map(record => ({
      ...record,
      timestamp: new Date().toISOString()
    }))

    const deviationRecordsWithTimestamps = deviationRecords.map(record => ({
      ...record,
      timestamp: new Date().toISOString()
    }))

    const wipByVariantRecord: Record<string, {
      variantId: string
      variantName: string
      quantity: number
      status: "In Queue" | "In Process" | "Completed" | "On Hold"
      currentStation?: string
    }> = {}
    
    wipByVariant.forEach(variant => {
      wipByVariantRecord[variant.variantId] = variant
    })

    const stageData: ProcessStep["stageData"] = {
      assemblyTimeByStation: assemblyTimeByStationRecord,
      reworkRecords: reworkRecordsWithTimestamps,
      deviationRecords: deviationRecordsWithTimestamps,
      wipByVariant: wipByVariantRecord
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

  const totalRework = reworkRecords.reduce((sum, record) => sum + record.quantity, 0)
  const correctedRework = reworkRecords.filter(r => r.corrected).reduce((sum, record) => sum + record.quantity, 0)
  const pendingRework = totalRework - correctedRework
  const approvedDeviations = deviationRecords.filter(d => d.approved).length
  const pendingDeviations = deviationRecords.filter(d => !d.approved).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assembly Data Capture</DialogTitle>
          <DialogDescription>
            Record assembly time, rework records, deviations, and WIP by product variant for {processStep.stepName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assembly Time by Station */}
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-semibold">Assembly Time by Station</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assemblyStation">Station</Label>
                <Select value={newAssemblyTime.stationId} onValueChange={(value) => setNewAssemblyTime({ ...newAssemblyTime, stationId: value })}>
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
                <Label htmlFor="assemblyTimeSpent">Time Spent (minutes)</Label>
                <Input
                  id="assemblyTimeSpent"
                  type="number"
                  min="0"
                  value={newAssemblyTime.timeSpent}
                  onChange={(e) => setNewAssemblyTime({ ...newAssemblyTime, timeSpent: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assemblyStartTime">Start Time</Label>
                <Input
                  id="assemblyStartTime"
                  type="datetime-local"
                  value={newAssemblyTime.startTime}
                  onChange={(e) => setNewAssemblyTime({ ...newAssemblyTime, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assemblyEndTime">End Time</Label>
                <Input
                  id="assemblyEndTime"
                  type="datetime-local"
                  value={newAssemblyTime.endTime}
                  onChange={(e) => setNewAssemblyTime({ ...newAssemblyTime, endTime: e.target.value })}
                />
              </div>
            </div>
            <Button type="button" onClick={handleAddAssemblyTime} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Station Time
            </Button>

            {assemblyTimeByStation.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Station</TableHead>
                    <TableHead>Time Spent</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assemblyTimeByStation.map((time, index) => (
                    <TableRow key={index}>
                      <TableCell>{getStationName(time.stationId)}</TableCell>
                      <TableCell>{time.timeSpent} min</TableCell>
                      <TableCell>{time.startTime ? new Date(time.startTime).toLocaleString() : "-"}</TableCell>
                      <TableCell>{time.endTime ? new Date(time.endTime).toLocaleString() : "-"}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAssemblyTime(index)}
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

          {/* Rework Records */}
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-semibold">Rework Records</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reworkReason">Reason</Label>
                <Select value={newReworkRecord.reason} onValueChange={(value) => setNewReworkRecord({ ...newReworkRecord, reason: value })}>
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
                  value={newReworkRecord.quantity}
                  onChange={(e) => setNewReworkRecord({ ...newReworkRecord, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reworkOperator">Operator</Label>
                <Select value={newReworkRecord.operatorId} onValueChange={(value) => setNewReworkRecord({ ...newReworkRecord, operatorId: value })}>
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
                <Label htmlFor="reworkCorrected">Corrected</Label>
                <Select value={newReworkRecord.corrected.toString()} onValueChange={(value) => setNewReworkRecord({ ...newReworkRecord, corrected: value === "true" })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="button" onClick={handleAddReworkRecord} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Rework Record
            </Button>

            {reworkRecords.length > 0 && (
              <div className="space-y-2">
                {reworkRecords.map(record => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">{record.reason}</Badge>
                        <span className="font-medium">Qty: {record.quantity}</span>
                        <span className="text-sm text-gray-500">by {getOperatorName(record.operatorId)}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleReworkCorrected(record.id)}
                          className={`ml-2 ${record.corrected ? 'text-green-600' : 'text-gray-400'}`}
                        >
                          {record.corrected ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        </button>
                        {record.corrected && <span className="text-sm text-green-600">Corrected</span>}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveReworkRecord(record.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deviation Records */}
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-semibold">Deviation Records</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deviationType">Deviation Type</Label>
                <Select value={newDeviationRecord.deviationType} onValueChange={(value) => setNewDeviationRecord({ ...newDeviationRecord, deviationType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select deviation type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEVIATION_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deviationApprovedBy">Approved By</Label>
                <Input
                  id="deviationApprovedBy"
                  value={newDeviationRecord.approvedBy}
                  onChange={(e) => setNewDeviationRecord({ ...newDeviationRecord, approvedBy: e.target.value })}
                  placeholder="Approver name"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="deviationDescription">Description</Label>
                <Textarea
                  id="deviationDescription"
                  value={newDeviationRecord.description}
                  onChange={(e) => setNewDeviationRecord({ ...newDeviationRecord, description: e.target.value })}
                  placeholder="Describe the deviation"
                />
              </div>
            </div>
            <Button type="button" onClick={handleAddDeviationRecord} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Deviation Record
            </Button>

            {deviationRecords.length > 0 && (
              <div className="space-y-2">
                {deviationRecords.map(record => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{record.deviationType}</Badge>
                        <span className="text-sm">{record.description}</span>
                        {record.approvedBy && (
                          <span className="text-sm text-gray-500">by {record.approvedBy}</span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleToggleDeviationApproval(record.id)}
                          className={`ml-2 ${record.approved ? 'text-green-600' : 'text-gray-400'}`}
                        >
                          {record.approved ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        </button>
                        {record.approved && <span className="text-sm text-green-600">Approved</span>}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDeviationRecord(record.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* WIP by Product Variant */}
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-semibold">WIP Status by Product Variant</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="variantId">Variant ID</Label>
                <Input
                  id="variantId"
                  value={newWipVariant.variantId}
                  onChange={(e) => setNewWipVariant({ ...newWipVariant, variantId: e.target.value })}
                  placeholder="e.g., VAR-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="variantName">Variant Name</Label>
                <Input
                  id="variantName"
                  value={newWipVariant.variantName}
                  onChange={(e) => setNewWipVariant({ ...newWipVariant, variantName: e.target.value })}
                  placeholder="e.g., Standard"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="variantQuantity">Quantity</Label>
                <Input
                  id="variantQuantity"
                  type="number"
                  min="0"
                  value={newWipVariant.quantity}
                  onChange={(e) => setNewWipVariant({ ...newWipVariant, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="variantStatus">Status</Label>
                <Select value={newWipVariant.status} onValueChange={(value) => setNewWipVariant({ ...newWipVariant, status: value as typeof newWipVariant.status })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In Queue">In Queue</SelectItem>
                    <SelectItem value="In Process">In Process</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="variantStation">Current Station</Label>
                <Select value={newWipVariant.currentStation} onValueChange={(value) => setNewWipVariant({ ...newWipVariant, currentStation: value })}>
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
            </div>
            <Button type="button" onClick={handleAddWipVariant} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Variant
            </Button>

            {wipByVariant.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Variant ID</TableHead>
                    <TableHead>Variant Name</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Current Station</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wipByVariant.map(variant => (
                    <TableRow key={variant.variantId}>
                      <TableCell>{variant.variantId}</TableCell>
                      <TableCell>{variant.variantName}</TableCell>
                      <TableCell>{variant.quantity}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{variant.status}</Badge>
                      </TableCell>
                      <TableCell>{variant.currentStation ? getStationName(variant.currentStation) : "-"}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveWipVariant(variant.variantId)}
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

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Summary</h3>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Total Rework</div>
                <div className="font-semibold text-yellow-600">{totalRework}</div>
                <div className="text-xs text-gray-500">Corrected: {correctedRework} | Pending: {pendingRework}</div>
              </div>
              <div>
                <div className="text-gray-500">Deviations</div>
                <div className="font-semibold text-blue-600">{deviationRecords.length}</div>
                <div className="text-xs text-gray-500">Approved: {approvedDeviations} | Pending: {pendingDeviations}</div>
              </div>
              <div>
                <div className="text-gray-500">WIP Variants</div>
                <div className="font-semibold">{wipByVariant.length}</div>
              </div>
              <div>
                <div className="text-gray-500">Total Stations</div>
                <div className="font-semibold">{assemblyTimeByStation.length}</div>
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
