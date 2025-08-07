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
import { ArrowLeft, Save, Plus, Trash2, Calculator, CheckCircle } from 'lucide-react'
import Link from "next/link"

export default function EditBOMPage({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState({
    drawingId: "DWG-2024-001",
    bomType: "production",
    status: "approved",
    notes: "All materials meet AISC specifications. Lead times confirmed with suppliers."
  })

  const [materials, setMaterials] = useState([
    { 
      id: 1, 
      item: "W12x65 Beam", 
      quantity: "8", 
      unit: "20 ft", 
      steelGrade: "A992", 
      unitCost: "2450", 
      totalCost: 19600,
      supplier: "Steel Supply Co.",
      leadTime: "2",
      notes: ""
    },
    { 
      id: 2, 
      item: "W8x31 Column", 
      quantity: "12", 
      unit: "16 ft", 
      steelGrade: "A992", 
      unitCost: "1280", 
      totalCost: 15360,
      supplier: "Metro Steel",
      leadTime: "3",
      notes: ""
    },
    { 
      id: 3, 
      item: "Angle L4x4x1/2", 
      quantity: "50", 
      unit: "8 ft", 
      steelGrade: "A36", 
      unitCost: "85", 
      totalCost: 4250,
      supplier: "Steel Supply Co.",
      leadTime: "1",
      notes: ""
    }
  ])

  const [revisionNotes, setRevisionNotes] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addMaterial = () => {
    const newMaterial = {
      id: Date.now(),
      item: "",
      quantity: "",
      unit: "pcs",
      steelGrade: "A36",
      unitCost: "",
      totalCost: 0,
      supplier: "",
      leadTime: "",
      notes: ""
    }
    setMaterials([...materials, newMaterial])
  }

  const removeMaterial = (id: number) => {
    setMaterials(materials.filter(material => material.id !== id))
  }

  const updateMaterial = (id: number, field: string, value: string) => {
    setMaterials(materials.map(material => {
      if (material.id === id) {
        const updatedMaterial = { ...material, [field]: value }
        if (field === 'quantity' || field === 'unitCost') {
          const quantity = parseFloat(updatedMaterial.quantity) || 0
          const unitCost = parseFloat(updatedMaterial.unitCost) || 0
          updatedMaterial.totalCost = quantity * unitCost
        }
        return updatedMaterial
      }
      return material
    }))
  }

  const calculateTotal = () => {
    return materials.reduce((total, material) => total + material.totalCost, 0)
  }

  const calculateWithOverheads = () => {
    const subtotal = calculateTotal()
    const handling = subtotal * 0.05
    const waste = subtotal * 0.03
    const contingency = subtotal * 0.06
    return subtotal + handling + waste + contingency
  }

  const handleSave = (action: "draft" | "update" | "approve") => {
    console.log("Saving BOM:", { ...formData, materials, revisionNotes, action })
    // Handle save logic here
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800"
      case "review": return "bg-yellow-100 text-yellow-800"
      case "draft": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href={`/bom/${params.id}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to BOM
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit BOM - BOM-2024-001</h1>
                <p className="text-sm text-gray-600">Update material requirements and specifications</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleSave("draft")}>
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
              <Button variant="outline" onClick={() => handleSave("update")}>
                <Save className="w-4 h-4 mr-2" />
                Update BOM
              </Button>
              <Button onClick={() => handleSave("approve")}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve BOM
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
                <CardTitle>Source Information</CardTitle>
                <CardDescription>BOM source and configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="drawing">Source Drawing</Label>
                    <Select value={formData.drawingId} onValueChange={(value) => handleInputChange("drawingId", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DWG-2024-001">DWG-2024-001 - Industrial Warehouse Frame</SelectItem>
                        <SelectItem value="DWG-2024-002">DWG-2024-002 - Bridge Support Beams</SelectItem>
                        <SelectItem value="DWG-2024-003">DWG-2024-003 - Custom Fabricated Brackets</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bomType">BOM Type</Label>
                    <Select value={formData.bomType} onValueChange={(value) => handleInputChange("bomType", value)}>
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
                  <div className="space-y-2">
                    <Label htmlFor="status">BOM Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="review">Under Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Material Items */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Material Items</CardTitle>
                    <CardDescription>Update all materials required for this project</CardDescription>
                  </div>
                  <Button onClick={addMaterial} variant="outline">
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
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Unit Cost ($)</TableHead>
                      <TableHead>Total ($)</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Lead Time</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell>
                          <Input
                            placeholder="e.g., W12x65 Beam"
                            value={material.item}
                            onChange={(e) => updateMaterial(material.id, 'item', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="8"
                            type="number"
                            value={material.quantity}
                            onChange={(e) => updateMaterial(material.id, 'quantity', e.target.value)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="20 ft"
                            value={material.unit}
                            onChange={(e) => updateMaterial(material.id, 'unit', e.target.value)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Select value={material.steelGrade} onValueChange={(value) => updateMaterial(material.id, 'steelGrade', value)}>
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A36">A36</SelectItem>
                              <SelectItem value="A992">A992</SelectItem>
                              <SelectItem value="A572">A572</SelectItem>
                              <SelectItem value="A514">A514</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="2450"
                            type="number"
                            value={material.unitCost}
                            onChange={(e) => updateMaterial(material.id, 'unitCost', e.target.value)}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          ${material.totalCost.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Supplier"
                            value={material.supplier}
                            onChange={(e) => updateMaterial(material.id, 'supplier', e.target.value)}
                            className="w-32"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="2"
                            value={material.leadTime}
                            onChange={(e) => updateMaterial(material.id, 'leadTime', e.target.value)}
                            className="w-16"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Calculator className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeMaterial(material.id)}
                              disabled={materials.length === 1}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Cost Summary */}
                <div className="mt-6 flex justify-end">
                  <div className="w-80 space-y-2">
                    <div className="flex justify-between">
                      <span>Material Cost:</span>
                      <span className="font-medium">${calculateTotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Handling (5%):</span>
                      <span className="font-medium">${(calculateTotal() * 0.05).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Waste Allowance (3%):</span>
                      <span className="font-medium">${(calculateTotal() * 0.03).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contingency (6%):</span>
                      <span className="font-medium">${(calculateTotal() * 0.06).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total BOM Cost:</span>
                      <span>${calculateWithOverheads().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revision Information */}
            <Card>
              <CardHeader>
                <CardTitle>Revision Information</CardTitle>
                <CardDescription>Document changes made to this BOM</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="revisionNotes">Revision Notes *</Label>
                  <Textarea 
                    id="revisionNotes" 
                    placeholder="Describe the changes made to the BOM..."
                    rows={3}
                    value={revisionNotes}
                    onChange={(e) => setRevisionNotes(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>Special requirements and notes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="notes">BOM Notes</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Special requirements, procurement notes, quality standards, etc."
                    rows={3}
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
                    {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">TOTAL MATERIALS</Label>
                  <p className="text-lg font-bold">{materials.length}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">TOTAL COST</Label>
                  <p className="text-lg font-bold">${calculateWithOverheads().toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Materials:</span>
                  <span className="text-sm font-medium">${calculateTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Overheads:</span>
                  <span className="text-sm font-medium">${(calculateWithOverheads() - calculateTotal()).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${calculateWithOverheads().toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Material Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Material Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {['A36', 'A992', 'A572', 'A514'].map(grade => {
                  const gradeItems = materials.filter(material => material.steelGrade === grade)
                  const gradeTotal = gradeItems.reduce((sum, material) => sum + material.totalCost, 0)
                  
                  if (gradeItems.length === 0) return null
                  
                  return (
                    <div key={grade} className="flex justify-between items-center">
                      <Badge variant="outline">
                        {grade} ({gradeItems.length})
                      </Badge>
                      <span className="text-sm font-medium">${gradeTotal.toLocaleString()}</span>
                    </div>
                  )
                })}
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
                  <span>Source drawing linked</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Materials specified</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Costs calculated</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Revision notes required</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
