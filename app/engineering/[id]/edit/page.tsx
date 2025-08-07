"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Upload, FileText, CheckCircle } from 'lucide-react'
import Link from "next/link"

export default function EditDrawingPage({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState({
    quotationId: "QUO-2024-001",
    drawingType: "assembly",
    specifications: "A36 Steel, Welded Connections, AISC Standards",
    engineer: "john",
    dueDate: "2024-01-16",
    priority: "high",
    status: "in-progress",
    notes: "Updated connection details for beam-to-column joints based on structural review."
  })

  const [revisionNotes, setRevisionNotes] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState([
    { name: "DWG-2024-001-RevC.dwg", size: "2.4 MB", type: "CAD File", date: "2024-01-14" },
    { name: "DWG-2024-001-RevC.pdf", size: "1.8 MB", type: "PDF", date: "2024-01-14" }
  ])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const newFiles = files.map(file => ({
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.type.includes('dwg') ? 'CAD File' : 'Document',
      date: new Date().toISOString().split('T')[0]
    }))
    setUploadedFiles([...uploadedFiles, ...newFiles])
  }

  const handleSave = (action: "draft" | "review" | "approve") => {
    console.log("Saving drawing:", { ...formData, revisionNotes, action })
    // Handle save logic here
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-progress": return "bg-blue-100 text-blue-800"
      case "review": return "bg-yellow-100 text-yellow-800"
      case "approved": return "bg-green-100 text-green-800"
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
              <Link href={`/engineering/${params.id}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Drawing
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Drawing - DWG-2024-001</h1>
                <p className="text-sm text-gray-600">Update drawing specifications and create new revision</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleSave("draft")}>
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
              <Button variant="outline" onClick={() => handleSave("review")}>
                <Save className="w-4 h-4 mr-2" />
                Submit for Review
              </Button>
              <Button onClick={() => handleSave("approve")}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Drawing
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="col-span-2 space-y-6">
            {/* Source Information */}
            <Card>
              <CardHeader>
                <CardTitle>Source Information</CardTitle>
                <CardDescription>Drawing source and basic information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quotation">Source Quotation</Label>
                    <Select value={formData.quotationId} onValueChange={(value) => handleInputChange("quotationId", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="QUO-2024-001">QUO-2024-001 - Industrial Warehouse Frame</SelectItem>
                        <SelectItem value="QUO-2024-002">QUO-2024-002 - Bridge Support Beams</SelectItem>
                        <SelectItem value="QUO-2024-003">QUO-2024-003 - Custom Fabricated Brackets</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Drawing Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="review">Under Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Drawing Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Drawing Specifications</CardTitle>
                <CardDescription>Technical details and requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="drawingType">Drawing Type *</Label>
                    <Select value={formData.drawingType} onValueChange={(value) => handleInputChange("drawingType", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="assembly">Structural Assembly Drawing</SelectItem>
                        <SelectItem value="detail">Detail Drawing</SelectItem>
                        <SelectItem value="shop">Shop Drawing</SelectItem>
                        <SelectItem value="fabrication">Fabrication Drawing</SelectItem>
                        <SelectItem value="erection">Erection Drawing</SelectItem>
                        <SelectItem value="connection">Connection Detail</SelectItem>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specifications">Technical Specifications *</Label>
                  <Textarea 
                    id="specifications" 
                    placeholder="Steel grades, connection types, tolerances, welding specifications, surface treatments, etc."
                    rows={4}
                    value={formData.specifications}
                    onChange={(e) => handleInputChange("specifications", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="engineer">Assigned Engineer *</Label>
                    <Select value={formData.engineer} onValueChange={(value) => handleInputChange("engineer", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="john">John Smith - Structural Design</SelectItem>
                        <SelectItem value="sarah">Sarah Johnson - Mechanical Design</SelectItem>
                        <SelectItem value="mike">Mike Davis - Fabrication Engineering</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Target Completion Date *</Label>
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

            {/* File Management */}
            <Card>
              <CardHeader>
                <CardTitle>Drawing Files</CardTitle>
                <CardDescription>Upload and manage drawing files</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span>Upload New Files</span>
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept=".dwg,.dxf,.pdf,.jpg,.png,.step,.iges"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                    <p className="mt-2 text-sm text-gray-500">
                      Supported formats: DWG, DXF, PDF, JPG, PNG, STEP, IGES
                    </p>
                  </div>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Current Files</Label>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-gray-500">{file.type} • {file.size} • {file.date}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">View</Button>
                          <Button variant="ghost" size="sm">Remove</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Revision Information */}
            <Card>
              <CardHeader>
                <CardTitle>Revision Information</CardTitle>
                <CardDescription>Document changes made in this revision</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="revisionNotes">Revision Notes *</Label>
                  <Textarea 
                    id="revisionNotes" 
                    placeholder="Describe the changes made in this revision..."
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
                <CardDescription>Special instructions and notes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="notes">Engineering Notes</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Special requirements, design considerations, review instructions, etc."
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
                    {formData.status.charAt(0).toUpperCase() + formData.status.slice(1).replace('-', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">CURRENT REVISION</Label>
                  <p className="text-sm font-medium">Rev C</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">LAST UPDATED</Label>
                  <p className="text-sm">2024-01-14</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">PROGRESS</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <span className="text-sm font-medium">75%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Drawing Standards */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Applicable Standards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "AISC Steel Construction Manual", version: "15th Edition" },
                    { name: "AWS D1.1 Structural Welding Code", version: "2020" },
                    { name: "ASTM A36 Standard Specification", version: "Current" },
                    { name: "Company Drawing Standards", version: "v2.1" }
                  ].map((standard, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{standard.name}</p>
                        <p className="text-xs text-gray-500">{standard.version}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Validation Checklist */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Validation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Drawing type specified</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Engineer assigned</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Files uploaded</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Revision notes required</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  View Source Quotation
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Check Material Availability
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Upload className="w-4 h-4 mr-2" />
                  Import CAD Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
