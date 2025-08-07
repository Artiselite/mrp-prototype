"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Download, Package, Calculator, FileText, AlertTriangle, CheckCircle } from 'lucide-react'
import Link from "next/link"

export default function BOMDetailPage({ params }: { params: { id: string } }) {
  const [bom] = useState({
    id: "BOM-2024-001",
    drawingId: "DWG-2024-001",
    project: "Industrial Warehouse Frame",
    customer: "ABC Steel Works",
    status: "Approved",
    totalCost: "$89,450",
    materialCount: 15,
    dateCreated: "2024-01-12",
    dateApproved: "2024-01-15",
    approvedBy: "John Smith",
    notes: "All materials meet AISC specifications. Lead times confirmed with suppliers."
  })

  const [materials] = useState([
    { 
      id: 1, 
      item: "W12x65 Beam", 
      quantity: 8, 
      unit: "20 ft", 
      steelGrade: "A992", 
      unitCost: 2450, 
      totalCost: 19600,
      supplier: "Steel Supply Co.",
      leadTime: "2 weeks",
      availability: "In Stock"
    },
    { 
      id: 2, 
      item: "W8x31 Column", 
      quantity: 12, 
      unit: "16 ft", 
      steelGrade: "A992", 
      unitCost: 1280, 
      totalCost: 15360,
      supplier: "Metro Steel",
      leadTime: "3 weeks",
      availability: "Order Required"
    },
    { 
      id: 3, 
      item: "Angle L4x4x1/2", 
      quantity: 50, 
      unit: "8 ft", 
      steelGrade: "A36", 
      unitCost: 85, 
      totalCost: 4250,
      supplier: "Steel Supply Co.",
      leadTime: "1 week",
      availability: "In Stock"
    },
    { 
      id: 4, 
      item: "Plate 1/2x12x20", 
      quantity: 8, 
      unit: "each", 
      steelGrade: "A572", 
      unitCost: 450, 
      totalCost: 3600,
      supplier: "Industrial Metals",
      leadTime: "2 weeks",
      availability: "Limited Stock"
    },
    { 
      id: 5, 
      item: "Bolts 3/4x6 A325", 
      quantity: 200, 
      unit: "each", 
      steelGrade: "A325", 
      unitCost: 12, 
      totalCost: 2400,
      supplier: "Fastener World",
      leadTime: "1 week",
      availability: "In Stock"
    }
  ])

  const [costBreakdown] = useState([
    { category: "Structural Steel", amount: 42810, percentage: 47.8 },
    { category: "Plates & Sheets", amount: 15600, percentage: 17.4 },
    { category: "Fasteners", amount: 8900, percentage: 9.9 },
    { category: "Welding Materials", amount: 6750, percentage: 7.5 },
    { category: "Hardware", amount: 4200, percentage: 4.7 },
    { category: "Miscellaneous", amount: 11190, percentage: 12.5 }
  ])

  const [procurementStatus] = useState([
    { supplier: "Steel Supply Co.", items: 8, totalValue: 28450, status: "Ordered", orderDate: "2024-01-16" },
    { supplier: "Metro Steel", items: 3, totalValue: 22100, status: "Quote Requested", orderDate: null },
    { supplier: "Industrial Metals", items: 2, totalValue: 18900, status: "In Review", orderDate: null },
    { supplier: "Fastener World", items: 2, totalValue: 3200, status: "Ready to Order", orderDate: null }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-800"
      case "Draft": return "bg-gray-100 text-gray-800"
      case "Review": return "bg-yellow-100 text-yellow-800"
      case "Rejected": return "bg-red-100 text-red-800"
      case "In Stock": return "bg-green-100 text-green-800"
      case "Order Required": return "bg-red-100 text-red-800"
      case "Limited Stock": return "bg-yellow-100 text-yellow-800"
      case "Ordered": return "bg-blue-100 text-blue-800"
      case "Quote Requested": return "bg-yellow-100 text-yellow-800"
      case "In Review": return "bg-orange-100 text-orange-800"
      case "Ready to Order": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case "In Stock": return <CheckCircle className="w-4 h-4 text-green-500" />
      case "Order Required": return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "Limited Stock": return <AlertTriangle className="w-4 h-4 text-yellow-500" />
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
              <Link href="/bom">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to BOM
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{bom.id}</h1>
                  <Badge className={getStatusColor(bom.status)}>
                    {bom.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{bom.project} - {bom.customer}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export BOM
              </Button>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit BOM
              </Button>
              <Button>
                <Package className="w-4 h-4 mr-2" />
                Create Work Order
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="col-span-3">
            <Tabs defaultValue="materials" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="materials">Materials</TabsTrigger>
                <TabsTrigger value="costing">Cost Analysis</TabsTrigger>
                <TabsTrigger value="procurement">Procurement</TabsTrigger>
                <TabsTrigger value="overview">Overview</TabsTrigger>
              </TabsList>

              <TabsContent value="materials" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Material List</CardTitle>
                    <CardDescription>Complete list of materials required for this project</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item Description</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead>Unit Cost</TableHead>
                          <TableHead>Total Cost</TableHead>
                          <TableHead>Supplier</TableHead>
                          <TableHead>Availability</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {materials.map((material) => (
                          <TableRow key={material.id}>
                            <TableCell className="font-medium">{material.item}</TableCell>
                            <TableCell>{material.quantity}</TableCell>
                            <TableCell>{material.unit}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{material.steelGrade}</Badge>
                            </TableCell>
                            <TableCell>${material.unitCost.toLocaleString()}</TableCell>
                            <TableCell className="font-medium">${material.totalCost.toLocaleString()}</TableCell>
                            <TableCell>{material.supplier}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getAvailabilityIcon(material.availability)}
                                <Badge className={getStatusColor(material.availability)}>
                                  {material.availability}
                                </Badge>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="costing" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Cost Breakdown by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {costBreakdown.map((category, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">{category.category}</span>
                              <span className="text-sm font-bold">${category.amount.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${category.percentage}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500">{category.percentage}% of total</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Cost Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Material Cost:</span>
                          <span className="font-medium">$78,450</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Handling (5%):</span>
                          <span className="font-medium">$3,923</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Waste Allowance (3%):</span>
                          <span className="font-medium">$2,354</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Contingency (6%):</span>
                          <span className="font-medium">$4,723</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t pt-4">
                          <span>Total BOM Cost:</span>
                          <span>{bom.totalCost}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="procurement" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Procurement Status by Supplier</CardTitle>
                    <CardDescription>Current status of material procurement</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Supplier</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Total Value</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Order Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {procurementStatus.map((supplier, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{supplier.supplier}</TableCell>
                            <TableCell>{supplier.items} items</TableCell>
                            <TableCell className="font-medium">${supplier.totalValue.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(supplier.status)}>
                                {supplier.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{supplier.orderDate || "—"}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <FileText className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>BOM Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Source Drawing</label>
                          <p className="mt-1 font-medium">{bom.drawingId}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Project</label>
                          <p className="mt-1">{bom.project}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Customer</label>
                          <p className="mt-1">{bom.customer}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Date Created</label>
                          <p className="mt-1">{bom.dateCreated}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Approved By</label>
                          <p className="mt-1">{bom.approvedBy}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Date Approved</label>
                          <p className="mt-1">{bom.dateApproved}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <label className="text-sm font-medium text-gray-500">Notes</label>
                      <p className="mt-1 text-gray-700">{bom.notes}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">TOTAL MATERIALS</label>
                  <p className="text-lg font-bold">{bom.materialCount}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">TOTAL COST</label>
                  <p className="text-lg font-bold">{bom.totalCost}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">STATUS</label>
                  <Badge className={getStatusColor(bom.status)}>
                    {bom.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calculator className="w-4 h-4 mr-2" />
                  Recalculate Costs
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Package className="w-4 h-4 mr-2" />
                  Check Availability
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate PO
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export to Excel
                </Button>
              </CardContent>
            </Card>

            {/* Related Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Related Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Source Drawing
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Work Orders
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Purchase Orders
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
