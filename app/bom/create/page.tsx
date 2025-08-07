"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Save, Plus, Calculator, Trash2 } from 'lucide-react'
import Link from "next/link"

export default function CreateBOMPage() {
  const [formData, setFormData] = useState({
    drawingId: "",
    bomType: "production",
    notes: ""
  })

  const [bomItems, setBomItems] = useState([
    { id: 1, description: "", quantity: "", unit: "pcs", steelGrade: "", unitCost: "", totalCost: 0 }
  ])

  const drawings = [
    { id: "DWG-2024-001", project: "Industrial Warehouse Frame", customer: "ABC Steel Works", status: "Approved" },
    { id: "DWG-2024-002", project: "Bridge Support Beams", customer: "Metro Construction", status: "Approved" },
    { id: "DWG-2024-003", project: "Custom Fabricated Brackets", customer: "Industrial Corp", status: "Approved" }
  ]

  const addBomItem = () => {
    const newItem = {
      id: Date.now(),
      description: "",
      quantity: "",
      unit: "pcs",
      steelGrade: "",
      unitCost: "",
      totalCost: 0
    }
    setBomItems([...bomItems, newItem])
  }

  const removeBomItem = (id: number) => {
    setBomItems(bomItems.filter(item => item.id !== id))
  }

  const updateBomItem = (id: number, field: string, value: string) => {
    setBomItems(bomItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        if (field === 'quantity' || field === 'unitCost') {
          const quantity = parseFloat(updatedItem.quantity) || 0
          const unitCost = parseFloat(updatedItem.unitCost) || 0
          updatedItem.totalCost = quantity * unitCost
        }
        return updatedItem
      }
      return item
    }))
  }

  const calculateTotal = () => {
    return bomItems.reduce((total, item) => total + item.totalCost, 0)
  }

  const selectedDrawing = drawings.find(d => d.id === formData.drawingId)

  const handleSave = (action: "draft" | "submit") => {
    console.log("Saving BOM:", { ...formData, bomItems, action })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/bom">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to BOM
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create Bill of Materials</h1>
                <p className="text-sm text-gray-600">Generate material requirements from engineering drawing</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleSave("draft")}>
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
              <Button onClick={() => handleSave("submit")}>
                Create BOM
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Source Drawing */}
          <Card>
            <CardHeader>
              <CardTitle>Source Information</CardTitle>
              <CardDescription>Select the approved drawing for BOM generation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="drawing">Source Drawing *</Label>
                  <Select value={formData.drawingId} onValueChange={(value) => setFormData(prev => ({ ...prev, drawingId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select approved drawing" />
                    </SelectTrigger>
                    <SelectContent>
                      {drawings.map((drawing) => (
                        <SelectItem key={drawing.id} value={drawing.id}>
                          {drawing.id} - {drawing.project}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bomType">BOM Type</Label>
                  <Select value={formData.bomType} onValueChange={(value) => setFormData(prev => ({ ...prev, bomType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Production BOM</SelectItem>
                      <SelectItem value="procurement">Procurement BOM</SelectItem>
                      <SelectItem value="costing">Costing BOM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedDrawing && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">{selectedDrawing.project}</h4>
                  <p className="text-sm text-blue-700">Customer: {selectedDrawing.customer}</p>
                  <p className="text-sm text-blue-700">Status: {selectedDrawing.status}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Material Items */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Material Items</CardTitle>
                  <CardDescription>Define all materials required for this project</CardDescription>
                </div>
                <Button onClick={addBomItem} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Material
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Description</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Steel Grade</TableHead>
                    <TableHead>Unit Cost ($)</TableHead>
                    <TableHead>Total Cost ($)</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bomItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Input
                          placeholder="e.g., W12x65 Beam"
                          value={item.description}
                          onChange={(e) => updateBomItem(item.id, 'description', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="8"
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateBomItem(item.id, 'quantity', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Select value={item.unit} onValueChange={(value) => updateBomItem(item.id, 'unit', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pcs">Pieces</SelectItem>
                            <SelectItem value="ft">Feet</SelectItem>
                            <SelectItem value="lbs">Pounds</SelectItem>
                            <SelectItem value="tons">Tons</SelectItem>
                            <SelectItem value="each">Each</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select value={item.steelGrade} onValueChange={(value) => updateBomItem(item.id, 'steelGrade', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Grade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="a36">A36</SelectItem>
                            <SelectItem value="a992">A992</SelectItem>
                            <SelectItem value="a572">A572</SelectItem>
                            <SelectItem value="a514">A514</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="2450"
                          type="number"
                          value={item.unitCost}
                          onChange={(e) => updateBomItem(item.id, 'unitCost', e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        ${item.totalCost.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Calculator className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeBomItem(item.id)}
                            disabled={bomItems.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Total */}
              <div className="flex justify-end mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Material Cost</p>
                  <p className="text-2xl font-bold">${calculateTotal().toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Notes and special requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">BOM Notes</Label>
                <textarea 
                  id="notes" 
                  className="w-full p-3 border rounded-md"
                  placeholder="Special requirements, procurement notes, quality standards, etc."
                  rows={3}
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
