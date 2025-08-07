"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import Link from "next/link"

export default function CreateDrawingPage() {
  const [formData, setFormData] = useState({
    quotationId: "",
    drawingType: "",
    specifications: "",
    engineer: "",
    dueDate: "",
    priority: "medium",
    notes: ""
  })

  const [uploadedFiles, setUploadedFiles] = useState([])

  const quotations = [
    { id: "QUO-2024-001", customer: "ABC Steel Works", project: "Industrial Warehouse Frame", status: "Approved" },
    { id: "QUO-2024-002", customer: "Metro Construction", project: "Bridge Support Beams", status: "Approved" },
    { id: "QUO-2024-003", customer: "Industrial Corp", project: "Custom Fabricated Brackets", status: "Approved" }
  ]

  const drawingStandards = [
    { name: "AISC Steel Construction Manual", version: "15th Edition" },
    { name: "AWS D1.1 Structural Welding Code", version: "2020" },
    { name: "ASTM A36 Standard Specification", version: "Current" },
    { name: "Company Drawing Standards", version: "v2.1" }
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles(prev => [...prev, ...files.map(file => ({ name: file.name, size: file.size, type: file.type }))])
  }

  const selectedQuotation = quotations.find(q => q.id === formData.quotationId)

  const handleSave = (action: "draft" | "review" | "submit") => {
    console.log("Saving drawing:", { ...formData, uploadedFiles, action })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/engineering">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Engineering
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create Engineering Drawing</h1>
                <p className="text-sm text-gray-600">Create technical drawings from approved quotations</p>
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
              <Button onClick={() => handleSave("submit")}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Create Drawing
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="col-span-2 space-y-6">
            {/* Source Quotation */}
            <Card>
              <CardHeader>
                <CardTitle>Source Quotation</CardTitle>
                <CardDescription>Select the approved quotation for this drawing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quotation">Approved Quotation *</Label>
                  <Select value={formData.quotationId} onValueChange={(value) => handleInputChange("quotationId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select approved quotation" />
                    </SelectTrigger>
                    <SelectContent>
                      {quotations.map((quotation) => (
                        <SelectItem key={quotation.id} value={quotation.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{quotation.id} - {quotation.customer}</span>
                            <Badge className="ml-2 bg-green-100 text-green-800">{quotation.status}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedQuotation && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900">{selectedQuotation.project}</h4>
                    <p className="text-sm text-blue-700">Customer: {selectedQuotation.customer}</p>
                    <p className="text-sm text-blue-700">Status: {selectedQuotation.status}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Drawing Details */}
            <Card>
              <CardHeader>
                <CardTitle>Drawing Specifications</CardTitle>
                <CardDescription>Technical details and drawing requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="drawingType">Drawing Type *</Label>
                    <Select value={formData.drawingType} onValueChange={(value) => handleInputChange("drawingType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select drawing type" />
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
                        <SelectValue placeholder="Select engineer" />
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

            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Drawing Files</CardTitle>
                <CardDescription>Upload CAD files, sketches, and reference documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span>Choose Files</span>
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
                    <Label>Uploaded Files</Label>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    ))}
                  </div>
                )}
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
            {/* Drawing Standards */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Applicable Standards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {drawingStandards.map((standard, index) => (
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

            {/* Drawing Checklist */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Drawing Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    "Title block completed",
                    "Dimensions and tolerances specified",
                    "Material specifications noted",
                    "Welding symbols applied",
                    "Surface finish requirements",
                    "Assembly sequence defined",
                    "Quality control points marked"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
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
                  View Quotation Details
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <AlertCircle className="w-4 h-4 mr-2" />
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
