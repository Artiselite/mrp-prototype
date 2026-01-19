"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, X } from "lucide-react"
import { SCRAP_REASON_CODES, REWORK_REASON_CODES } from "@/lib/reason-codes"
import { ProcessStep } from "@/lib/types"

interface ConductorDataCaptureProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  processStep: ProcessStep
  onSave: (data: ProcessStep["stageData"]) => void
  workstations?: Array<{ id: string; name: string }>
}

export function ConductorDataCapture({
  open,
  onOpenChange,
  processStep,
  onSave,
  workstations = []
}: ConductorDataCaptureProps) {
  const existingData = processStep.stageData || {}
  
  const [outputQuantity, setOutputQuantity] = useState<number>(existingData.outputQuantity || 0)
  const [scrapQuantity, setScrapQuantity] = useState<number>(existingData.scrapQuantity || 0)
  const [scrapReasonCodes, setScrapReasonCodes] = useState<string[]>(existingData.scrapReasonCodes || [])
  const [reworkQuantity, setReworkQuantity] = useState<number>(existingData.reworkQuantity || 0)
  const [reworkReasonCodes, setReworkReasonCodes] = useState<string[]>(existingData.reworkReasonCodes || [])
  const [wipStations, setWipStations] = useState<Array<{
    stationId: string
    quantity: number
    status: "In Queue" | "In Process" | "Completed" | "On Hold"
  }>>(
    existingData.wipStatusByStation 
      ? Object.values(existingData.wipStatusByStation)
      : []
  )

  const [newWipStation, setNewWipStation] = useState({
    stationId: "",
    quantity: 0,
    status: "In Queue" as "In Queue" | "In Process" | "Completed" | "On Hold"
  })

  const [newScrapReason, setNewScrapReason] = useState("")
  const [newReworkReason, setNewReworkReason] = useState("")

  const handleAddScrapReason = () => {
    if (newScrapReason && !scrapReasonCodes.includes(newScrapReason)) {
      setScrapReasonCodes([...scrapReasonCodes, newScrapReason])
      setNewScrapReason("")
    }
  }

  const handleRemoveScrapReason = (reason: string) => {
    setScrapReasonCodes(scrapReasonCodes.filter(r => r !== reason))
  }

  const handleAddReworkReason = () => {
    if (newReworkReason && !reworkReasonCodes.includes(newReworkReason)) {
      setReworkReasonCodes([...reworkReasonCodes, newReworkReason])
      setNewReworkReason("")
    }
  }

  const handleRemoveReworkReason = (reason: string) => {
    setReworkReasonCodes(reworkReasonCodes.filter(r => r !== reason))
  }

  const handleAddWipStation = () => {
    if (newWipStation.stationId && newWipStation.quantity > 0) {
      setWipStations([...wipStations, { ...newWipStation }])
      setNewWipStation({ stationId: "", quantity: 0, status: "In Queue" })
    }
  }

  const handleRemoveWipStation = (index: number) => {
    setWipStations(wipStations.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    // Validation
    if (scrapQuantity + reworkQuantity > outputQuantity) {
      alert("Scrap + Rework cannot exceed output quantity")
      return
    }

    const wipStatusByStation: Record<string, {
      stationId: string
      quantity: number
      status: "In Queue" | "In Process" | "Completed" | "On Hold"
      timestamp: string
    }> = {}
    
    wipStations.forEach(wip => {
      wipStatusByStation[wip.stationId] = {
        ...wip,
        timestamp: new Date().toISOString()
      }
    })

    const stageData: ProcessStep["stageData"] = {
      outputQuantity,
      scrapQuantity,
      scrapReasonCodes,
      reworkQuantity,
      reworkReasonCodes,
      wipStatusByStation
    }

    onSave(stageData)
    onOpenChange(false)
  }

  const getStationName = (stationId: string) => {
    return workstations.find(ws => ws.id === stationId)?.name || stationId
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Conductor Processing Data Capture</DialogTitle>
          <DialogDescription>
            Record output quantities, scrap/rework, and WIP status for {processStep.stepName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Output Quantity */}
          <div className="space-y-2">
            <Label htmlFor="outputQuantity">Output Quantity *</Label>
            <Input
              id="outputQuantity"
              type="number"
              min="0"
              value={outputQuantity}
              onChange={(e) => setOutputQuantity(parseInt(e.target.value) || 0)}
            />
          </div>

          {/* Scrap Section */}
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-semibold">Scrap Tracking</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scrapQuantity">Scrap Quantity</Label>
                <Input
                  id="scrapQuantity"
                  type="number"
                  min="0"
                  max={outputQuantity}
                  value={scrapQuantity}
                  onChange={(e) => setScrapQuantity(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scrapReason">Scrap Reason Code</Label>
                <div className="flex gap-2">
                  <Select value={newScrapReason} onValueChange={setNewScrapReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {SCRAP_REASON_CODES.map(reason => (
                        <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={handleAddScrapReason} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            {scrapReasonCodes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {scrapReasonCodes.map(reason => (
                  <Badge key={reason} variant="destructive" className="flex items-center gap-1">
                    {reason}
                    <button
                      type="button"
                      onClick={() => handleRemoveScrapReason(reason)}
                      className="ml-1 hover:bg-red-700 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Rework Section */}
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-semibold">Rework Tracking</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reworkQuantity">Rework Quantity</Label>
                <Input
                  id="reworkQuantity"
                  type="number"
                  min="0"
                  max={outputQuantity}
                  value={reworkQuantity}
                  onChange={(e) => setReworkQuantity(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reworkReason">Rework Reason Code</Label>
                <div className="flex gap-2">
                  <Select value={newReworkReason} onValueChange={setNewReworkReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {REWORK_REASON_CODES.map(reason => (
                        <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={handleAddReworkReason} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            {reworkReasonCodes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {reworkReasonCodes.map(reason => (
                  <Badge key={reason} variant="outline" className="flex items-center gap-1 bg-yellow-100 text-yellow-800">
                    {reason}
                    <button
                      type="button"
                      onClick={() => handleRemoveReworkReason(reason)}
                      className="ml-1 hover:bg-yellow-200 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* WIP Status by Station */}
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-semibold">WIP Status by Station</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wipStation">Station</Label>
                <Select value={newWipStation.stationId} onValueChange={(value) => setNewWipStation({ ...newWipStation, stationId: value })}>
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
                <Label htmlFor="wipQuantity">Quantity</Label>
                <Input
                  id="wipQuantity"
                  type="number"
                  min="0"
                  value={newWipStation.quantity}
                  onChange={(e) => setNewWipStation({ ...newWipStation, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wipStatus">Status</Label>
                <Select value={newWipStation.status} onValueChange={(value) => setNewWipStation({ ...newWipStation, status: value as typeof newWipStation.status })}>
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
            </div>
            <Button type="button" onClick={handleAddWipStation} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Station
            </Button>

            {wipStations.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Station</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wipStations.map((wip, index) => (
                    <TableRow key={index}>
                      <TableCell>{getStationName(wip.stationId)}</TableCell>
                      <TableCell>{wip.quantity}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{wip.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveWipStation(index)}
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
                <div className="text-gray-500">Output</div>
                <div className="font-semibold">{outputQuantity}</div>
              </div>
              <div>
                <div className="text-gray-500">Scrap</div>
                <div className="font-semibold text-red-600">{scrapQuantity}</div>
              </div>
              <div>
                <div className="text-gray-500">Rework</div>
                <div className="font-semibold text-yellow-600">{reworkQuantity}</div>
              </div>
              <div>
                <div className="text-gray-500">Good Output</div>
                <div className="font-semibold text-green-600">
                  {outputQuantity - scrapQuantity - reworkQuantity}
                </div>
              </div>
            </div>
            {scrapQuantity + reworkQuantity > outputQuantity && (
              <div className="mt-2 text-sm text-red-600">
                Warning: Scrap + Rework exceeds output quantity
              </div>
            )}
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
