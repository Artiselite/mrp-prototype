"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Save, Plus, Clock, Trash2 } from 'lucide-react'
import Link from "next/link"

export default function CreateWorkOrderPage() {
  const [formData, setFormData] = useState({
    bomId: "",
    priority: "medium",
    team: "",
    supervisor: "",
    startDate: "",
    dueDate: "",
    notes: ""
  })

  const [operations, setOperations] = useState([
    { id: 1, step: "Material Preparation", duration: "1", sequence: 1 },
    { id: 2, step: "Cutting", duration: "2", sequence: 2 },
    { id: 3, step: "Welding", duration: "5", sequence: 3 },
    { id: 4, step: "Assembly", duration: "3", sequence: 4 },
    { id: 5, step: "Quality Check", duration: "1", sequence: 5 }
  ])

  const boms = [
    { id: "BOM-2024-001", project: "Industrial Warehouse Frame", customer: "ABC Steel Works", status: "Approved" },
    { id: "BOM-2024-002", project: "Bridge Support Beams", customer: "Metro Construction", status: "Approved" },
    { id: "BOM-2024-003", project: "Custom Fabricated Brackets", customer: "Industrial Corp", status: "Approved" }
  ]

  const addOperation = () => {
    const newOperation = {
      id: Date.now(),
      step: "",
      duration: "",
      sequence: operations.length + 1
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
    return operations.reduce((total, op) => total + (parseFloat(op.duration) || 0), 0)
  }

  const selectedBOM = boms.find(b => b.id === formData.bomId)

  const handleSave = (action: "draft" | "submit") => {
    console.log("Saving work order:", { ...formData, operations, action })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/production">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Production
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create Work Order</h1>
                <p className="text-sm text-gray-600">Schedule production from approved BOM</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleSave("draft")}>
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
              <Button onClick={() => handleSave("submit")}>
                Create Work Order
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Source BOM */}
          <Card>
            <CardHeader>
              <CardTitle>Source Information</CardTitle>
              <CardDescription>Select approved BOM and set work order parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bom">Source BOM *</Label>
                  <Select value={formData.bomId} onValueChange={(value) => setFormData(prev => ({ ...prev, bomId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select approved BOM" />
                    </SelectTrigger>
                    <SelectContent>
                      {boms.map((bom) => (
                        <SelectItem key={bom.id} value={bom.id}>
                          {bom.id} - {bom.project}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
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
              </div>

              {selectedBOM && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">{selectedBOM.project}</h4>
                  <p className="text-sm text-blue-700">Customer: {selectedBOM.customer}</p>
                  <p className="text-sm text-blue-700">Status: {selectedBOM.status}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="team">Assigned Team *</Label>
                  <Select value={formData.team} onValueChange={(value) => setFormData(prev => ({ ...prev, team: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select production team" />
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
                  <Select value={formData.supervisor} onValueChange={(value) => setFormData(prev => ({ ...prev, supervisor: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supervisor" />
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
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input 
                    id="dueDate" 
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
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
                  <CardDescription>Define the sequence of operations for this work order</CardDescription>
                </div>
                <Button onClick={addOperation} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Operation
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sequence</TableHead>
                    <TableHead>Operation Step</TableHead>
                    <TableHead>Duration (Days)</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operations.map((operation) => (
                    <TableRow key={operation.id}>
                      <TableCell>
                        <Input
                          type="number"
                          value={operation.sequence}
                          onChange={(e) => updateOperation(operation.id, 'sequence', e.target.value)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="e.g., Material Cutting"
                          value={operation.step}
                          onChange={(e) => updateOperation(operation.id, 'step', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="2"
                          value={operation.duration}
                          onChange={(e) => updateOperation(operation.id, 'duration', e.target.value)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Clock className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeOperation(operation.id)}
                            disabled={operations.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Total Duration */}
              <div className="flex justify-end mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Duration</p>
                  <p className="text-xl font-bold">{calculateTotalDuration()} days</p>
                </div>
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
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
