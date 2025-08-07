"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Save, Plus, Trash2, Clock, CheckCircle, Play, Pause } from 'lucide-react'
import Link from "next/link"

export default function EditWorkOrderPage({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState({
    bomId: "BOM-2024-001",
    priority: "high",
    team: "team-a",
    supervisor: "mike",
    startDate: "2024-01-15",
    dueDate: "2024-02-15",
    status: "in-progress",
    notes: "High priority project. Customer requires completion by end of February for construction schedule."
  })

  const [operations, setOperations] = useState([
    { 
      id: 1,
      step: "Material Cutting", 
      status: "completed", 
      estimatedDuration: "2", 
      actualDuration: "1.8",
      assignedWorker: "tom",
      sequence: 1,
      notes: "All cuts completed to specification"
    },
    { 
      id: 2,
      step: "Welding", 
      status: "in-progress", 
      estimatedDuration: "5", 
      actualDuration: "3.2",
      assignedWorker: "sarah",
      sequence: 2,
      notes: "60% complete, on schedule"
    },
    { 
      id: 3,
      step: "Assembly", 
      status: "pending", 
      estimatedDuration: "3", 
      actualDuration: "",
      assignedWorker: "mike",
      sequence: 3,
      notes: "Waiting for welding completion"
    }
  ])

  const [revisionNotes, setRevisionNotes] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addOperation = () => {
    const newOperation = {
      id: Date.now(),
      step: "",
      status: "pending",
      estimatedDuration: "",
      actualDuration: "",
      assignedWorker: "",
      sequence: operations.length + 1,
      notes: ""
    }
    setOperations([...operations, newOperation])
  }

  const removeOperation = (id: number) => {
    setOperations(operations.filter(op => op.id !== id))
  }

  const updateOperation = (id: number, field: string, value: string) => {
    setOperations(operations.map(op => 
      op.id === id ? { ...op, [field]: value } : op
    ))
  }

  const calculateTotalDuration = () => {
    return operations.reduce((total, op) => total + (parseFloat(op.estimatedDuration) || 0), 0)
  }

  const calculateProgress = () => {
    const completedOps = operations.filter(op => op.status === "completed").length
    return operations.length > 0 ? Math.round((completedOps / operations.length) * 100) : 0
  }

  const handleSave = (action: "draft" | "update" | "complete") => {
    console.log("Saving work order:", { ...formData, operations, revisionNotes, action })
    // Handle save logic here
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800"
      case "in-progress": return "bg-blue-100 text-blue-800"
      case "pending": return "bg-gray-100 text-gray-800"
      case "on-hold": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getOperationIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4 text-green-500" />
      case "in-progress": return <Play className="w-4 h-4 text-blue-500" />
      case "pending": return <Pause className="w-4 h-4 text-gray-500" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href={`/production/${params.id}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Work Order
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Work Order - WO-2024-001</h1>
                <p className="text-sm text-gray-600">Update production schedule and operations</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleSave("draft")}>
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
              <Button variant="outline" onClick={() => handleSave("update")}>
                <Save className="w-4 h-4 mr-2" />
                Update Work Order
              </Button>
              <Button onClick={() => handleSave("complete")}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Order
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-4 gap-6">
          {/* Main Form */}
          <div className="col-span-3 space-y-6">
            {/* Source Information */}
            <Card>
              <CardHeader>
                <CardTitle>Work Order Information</CardTitle>
                <CardDescription>Update work order details and assignments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bom">Source BOM</Label>
                    <Select value={formData.bomId} onValueChange={(value) => handleInputChange("bomId", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BOM-2024-001">BOM-2024-001 - Industrial Warehouse Frame</SelectItem>
                        <SelectItem value="BOM-2024-002">BOM-2024-002 - Bridge Support Beams</SelectItem>
                        <SelectItem value="BOM-2024-003">BOM-2024-003 - Custom Fabricated Brackets</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority Level</Label>
                    <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Work Order Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="team">Assigned Team *</Label>
                    <Select value={formData.team} onValueChange={(value) => handleInputChange("team", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="team-a">Team A - Structural Fabrication</SelectItem>
                        <SelectItem value="team-b">Team B - Custom Fabrication</SelectItem>
                        <SelectItem value="team-c">Team C - Assembly & Finishing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supervisor">Supervisor *</Label>
                    <Select value={formData.supervisor} onValueChange={(value) => handleInputChange("supervisor", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mike">Mike Johnson</SelectItem>
                        <SelectItem value="sarah">Sarah Davis</SelectItem>
                        <SelectItem value="tom">Tom Wilson</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input 
                      id="startDate" 
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange("startDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date *</Label>
                    <Input 
                      id="dueDate" 
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => handleInputChange("dueDate", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Production Operations */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Production Operations</CardTitle>
                    <CardDescription>Update the sequence of operations for this work order</CardDescription>
                  </div>
                  <Button onClick={addOperation} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Operation
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {operations.map((operation) => (
                    <div key={operation.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-6 gap-4 mb-3">
                        <div className="space-y-2">
                          <Label>Sequence</Label>
                          <Input
                            type="number"
                            value={operation.sequence}
                            onChange={(e) => updateOperation(operation.id, 'sequence', e.target.value)}
                            className="w-20"
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label>Operation Step</Label>
                          <Input
                            placeholder="e.g., Material Cutting"
                            value={operation.step}
                            onChange={(e) => updateOperation(operation.id, 'step', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select value={operation.status} onValueChange={(value) => updateOperation(operation.id, 'status', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="on-hold">On Hold</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Est. Duration (Days)</Label>
                          <Input
                            type="number"
                            step="0.5"
                            placeholder="2"
                            value={operation.estimatedDuration}
                            onChange={(e) => updateOperation(operation.id, 'estimatedDuration', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Actual Duration</Label>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="1.8"
                            value={operation.actualDuration}
                            onChange={(e) => updateOperation(operation.id, 'actualDuration', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="space-y-2">
                          <Label>Assigned Worker</Label>
                          <Select value={operation.assignedWorker} onValueChange={(value) => updateOperation(operation.id, 'assignedWorker', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select worker" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tom">Tom Wilson</SelectItem>
                              <SelectItem value="sarah">Sarah Davis</SelectItem>
                              <SelectItem value="mike">Mike Johnson</SelectItem>
                              <SelectItem value="quality">Quality Team</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeOperation(operation.id)}
                            disabled={operations.length === 1}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Operation Notes</Label>
                        <Textarea
                          placeholder="Notes about this operation..."
                          value={operation.notes}
                          onChange={(e) => updateOperation(operation.id, 'notes', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Total Duration */}
                <div className="flex justify-end mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Estimated Duration</p>
                    <p className="text-xl font-bold">{calculateTotalDuration()} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revision Information */}
            <Card>
              <CardHeader>
                <CardTitle>Update Information</CardTitle>
                <CardDescription>Document changes made to this work order</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="revisionNotes">Update Notes *</Label>
                  <Textarea 
                    id="revisionNotes" 
                    placeholder="Describe the changes made to the work order..."
                    rows={3}
                    value={revisionNotes}
                    onChange={(e) => setRevisionNotes(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>Special instructions and notes for production</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="notes">Production Notes</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Special requirements, safety considerations, quality standards, delivery instructions, etc."
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs font-medium text-gray-500">STATUS</Label>
                  <Badge className={getStatusColor(formData.status)}>
                    {formData.status.charAt(0).toUpperCase() + formData.status.slice(1).replace('-', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">PROGRESS</Label>
                  <div className="flex items-center gap-2">
                    <Progress value={calculateProgress()} className="flex-1" />
                    <span className="text-sm font-medium">{calculateProgress()}%</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">OPERATIONS</Label>
                  <p className="text-lg font-bold">{operations.length}</p>
                </div>
              </CardContent>
            </Card>

            {/* Operation Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Operation Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {['completed', 'in-progress', 'pending', 'on-hold'].map(status => {
                  const statusOps = operations.filter(op => op.status === status)
                  
                  if (statusOps.length === 0) return null
                  
                  return (
                    <div key={status} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {getOperationIcon(status)}
                        <Badge className={getStatusColor(status)} variant="outline">
                          {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                        </Badge>
                      </div>
                      <span className="text-sm font-medium">{statusOps.length}</span>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Time Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Time Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs font-medium text-gray-500">ESTIMATED DURATION</Label>
                  <p className="text-lg font-bold">{calculateTotalDuration()} days</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">ACTUAL DURATION</Label>
                  <p className="text-sm">
                    {operations.reduce((total, op) => total + (parseFloat(op.actualDuration) || 0), 0)} days
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Validation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Validation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Team assigned</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Operations defined</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Schedule set</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Update notes required</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
