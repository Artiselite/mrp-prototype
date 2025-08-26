"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Upload, Download, Settings, Wrench, Calculator } from 'lucide-react'
import Link from "next/link"
import { useRouter } from "next/navigation"

import { useDatabaseContext } from "@/components/database-provider"
import type { BillOfQuantities } from "@/lib/types"

interface BOQEditPageProps {
  params: Promise<{
    id: string
  }>
}

export default function BOQEditPage({ params }: BOQEditPageProps) {
  const router = useRouter()
  const { useBillsOfQuantities, useEngineeringProjects, useEngineeringDrawings, useBillsOfMaterials } = useDatabaseContext()
  const { boqs, updateBoq } = useBillsOfQuantities()
  const { projects } = useEngineeringProjects()
  const { drawings } = useEngineeringDrawings()
  const { boms } = useBillsOfMaterials()

  const [boq, setBOQ] = useState<BillOfQuantities | null>(null)
  const [formData, setFormData] = useState<Partial<BillOfQuantities>>({})
  const [workPackages, setWorkPackages] = useState<string[]>([])
  const [newWorkPackage, setNewWorkPackage] = useState("")

  // Load BOQ data
  useEffect(() => {
    const loadBOQ = async () => {
      const resolvedParams = await params
      const foundBOQ = boqs.find(b => b.id === resolvedParams.id)
      if (foundBOQ) {
        setBOQ(foundBOQ)
        setFormData(foundBOQ)
        setWorkPackages(foundBOQ.workPackages || [])
      }
    }
    loadBOQ()
  }, [boqs, params])

  const handleSave = async () => {
    if (!boq) return

    try {
      const updatedBOQ: BillOfQuantities = {
        ...boq,
        ...formData,
        workPackages,
        updatedAt: new Date().toISOString(),
      }

      await updateBoq(updatedBOQ)
      const resolvedParams = await params
      router.push(`/boq/${resolvedParams.id}`)
    } catch (error) {
      console.error("Error updating BOQ:", error)
    }
  }

  const addWorkPackage = () => {
    if (newWorkPackage.trim() && !workPackages.includes(newWorkPackage.trim())) {
      setWorkPackages([...workPackages, newWorkPackage.trim()])
      setNewWorkPackage("")
    }
  }

  const removeWorkPackage = (index: number) => {
    setWorkPackages(workPackages.filter((_, i) => i !== index))
  }

  if (!boq) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading BOQ details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/boq/${boq.id}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to BOQ
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit BOQ - {boq.boqNumber}</h1>
                <p className="text-gray-600">Advanced editing and configuration</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="eto">ETO Configuration</TabsTrigger>
            <TabsTrigger value="links">Linked Records</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>Basic BOQ details and project information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="boqNumber">BOQ Number</Label>
                    <Input
                      id="boqNumber"
                      value={formData.boqNumber || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, boqNumber: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      value={formData.version || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    value={formData.projectName || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as BillOfQuantities["status"] }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Under Review">Under Review</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Final">Final</SelectItem>
                        <SelectItem value="Revised">Revised</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="createdBy">Created By</Label>
                    <Input
                      id="createdBy"
                      value={formData.createdBy || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, createdBy: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="approvedBy">Approved By</Label>
                    <Input
                      id="approvedBy"
                      value={formData.approvedBy || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, approvedBy: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="revision">Revision</Label>
                    <Input
                      id="revision"
                      value={formData.revision || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, revision: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contractReference">Contract Reference</Label>
                    <Input
                      id="contractReference"
                      value={formData.contractReference || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, contractReference: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="eto">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="w-5 h-5" />
                    ETO Configuration
                  </CardTitle>
                  <CardDescription>Engineering-to-Order specific settings and workflow configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="etoStatus">ETO Status</Label>
                      <Select value={formData.etoStatus || "BOQ Submitted"} onValueChange={(value) => setFormData(prev => ({ ...prev, etoStatus: value as BillOfQuantities["etoStatus"] }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BOQ Submitted">BOQ Submitted</SelectItem>
                          <SelectItem value="Engineering Design">Engineering Design</SelectItem>
                          <SelectItem value="BOM Generation">BOM Generation</SelectItem>
                          <SelectItem value="Manufacturing Ready">Manufacturing Ready</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="engineeringProgress">Engineering Progress (%)</Label>
                      <Input
                        id="engineeringProgress"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.engineeringProgress || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, engineeringProgress: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Work Packages</CardTitle>
                  <CardDescription>High-level work packages for this BOQ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter work package name"
                      value={newWorkPackage}
                      onChange={(e) => setNewWorkPackage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addWorkPackage()}
                    />
                    <Button onClick={addWorkPackage}>Add</Button>
                  </div>
                  
                  {workPackages.length > 0 && (
                    <div className="space-y-2">
                      <Label>Current Work Packages</Label>
                      <div className="flex flex-wrap gap-2">
                        {workPackages.map((pkg, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-2">
                            {pkg}
                            <button
                              onClick={() => removeWorkPackage(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="links">
            <Card>
              <CardHeader>
                <CardTitle>Linked Records</CardTitle>
                <CardDescription>Configure relationships with other system records</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="engineeringProjectId">Engineering Project</Label>
                    <Select value={formData.engineeringProjectId || "none"} onValueChange={(value) => setFormData(prev => ({ ...prev, engineeringProjectId: value === "none" ? undefined : value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {projects && Array.isArray(projects) && projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.projectName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="engineeringDrawingId">Engineering Drawing</Label>
                    <Select value={formData.engineeringDrawingId || "none"} onValueChange={(value) => setFormData(prev => ({ ...prev, engineeringDrawingId: value === "none" ? undefined : value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select drawing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {drawings && Array.isArray(drawings) && drawings.map((drawing) => (
                          <SelectItem key={drawing.id} value={drawing.id}>
                            {drawing.drawingNumber} - {drawing.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="bomId">Bill of Materials</Label>
                    <Select value={formData.bomId || "none"} onValueChange={(value) => setFormData(prev => ({ ...prev, bomId: value === "none" ? undefined : value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select BOM" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {boms && Array.isArray(boms) && boms.map((bom) => (
                          <SelectItem key={bom.id} value={bom.id}>
                            {bom.bomNumber} - {bom.productName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.generatedBOMs && formData.generatedBOMs.length > 0 && (
                  <div>
                    <Label>Generated BOMs</Label>
                    <div className="mt-2 space-y-2">
                      {formData.generatedBOMs.map((bomId, index) => {
                        const bom = boms.find(b => b.id === bomId)
                        return (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span>{bom?.bomNumber || bomId}</span>
                            <Link href={`/bom/${bomId}`}>
                              <Button variant="ghost" size="sm">View</Button>
                            </Link>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    BOQ Settings
                  </CardTitle>
                  <CardDescription>Advanced configuration and data management</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Data Import/Export</h4>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                          <Upload className="w-4 h-4 mr-2" />
                          Import BOQ Items from CSV
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Download className="w-4 h-4 mr-2" />
                          Export BOQ to Excel
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Download className="w-4 h-4 mr-2" />
                          Export BOQ to PDF
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Cost Calculations</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Material Cost</span>
                          <span className="font-medium">${boq.materialCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Labor Cost</span>
                          <span className="font-medium">${boq.laborCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Equipment Cost</span>
                          <span className="font-medium">${boq.equipmentCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Subcontract Cost</span>
                          <span className="font-medium">${boq.subcontractCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Other Cost</span>
                          <span className="font-medium">${boq.otherCost.toLocaleString()}</span>
                        </div>
                        <hr />
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total Cost</span>
                          <span>${boq.totalCost.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">BOQ Statistics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-2xl font-bold text-blue-600">{boq.items.length}</div>
                        <div className="text-sm text-gray-600">Total Items</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-2xl font-bold text-green-600">
                          {boq.items.filter(i => i.engineeringStatus === "BOM Generated").length}
                        </div>
                        <div className="text-sm text-gray-600">BOM Generated</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-2xl font-bold text-yellow-600">
                          {boq.items.filter(i => i.engineeringStatus === "In Design").length}
                        </div>
                        <div className="text-sm text-gray-600">In Design</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-2xl font-bold text-gray-600">
                          {boq.items.filter(i => i.engineeringStatus === "Pending").length}
                        </div>
                        <div className="text-sm text-gray-600">Pending</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
