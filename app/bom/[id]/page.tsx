"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Download, Package, Calculator, FileText, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import Link from "next/link"
import { useRouter } from "next/navigation"

import { useDatabaseContext } from "@/components/database-provider"
import type { BillOfMaterials, BOMItem } from "@/lib/types"

interface BOMDetailsPageProps {
  params: Promise<{ id: string }>
}

export default function BOMDetailPage({ params }: BOMDetailsPageProps) {
  const router = useRouter()
  const { 
    billsOfMaterials: boms = [],
    engineeringDrawings: drawings = [],
    billsOfQuantities: boqs = [],
    isInitialized 
  } = useDatabaseContext()
  
  const [bom, setBom] = useState<BillOfMaterials | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load BOM data
  useEffect(() => {
    const loadBom = async () => {
      try {
        if (!isInitialized) return
        
        const resolvedParams = await params
        const bomId = resolvedParams.id
        
        const foundBom = boms.find((b: BillOfMaterials) => b.id === bomId)
        
        if (!foundBom) {
          setError("BOM not found")
          setLoading(false)
          return
        }
        
        setBom(foundBom)
        setError(null)
      } catch (err) {
        console.error("Error loading BOM:", err)
        setError("Failed to load BOM")
      } finally {
        setLoading(false)
      }
    }

    loadBom()
  }, [isInitialized, params, boms])

  // Get related data
  const relatedDrawing = bom?.engineeringDrawingId ? drawings.find((d: any) => d.id === bom.engineeringDrawingId) : null
  const relatedBoq = bom?.boqId ? boqs.find((q: any) => q.id === bom.boqId) : null

  // Calculate cost breakdown by category
  const getCostBreakdown = () => {
    if (!bom?.items) return []
    
    const breakdown = bom.items.reduce((acc, item) => {
      const category = item.category || 'Miscellaneous'
      const total = item.totalCost || (item.quantity * item.unitCost)
      
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category] += total
      return acc
    }, {} as Record<string, number>)

    const totalCost = Object.values(breakdown).reduce((sum, cost) => sum + cost, 0)
    
    return Object.entries(breakdown).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalCost > 0 ? (amount / totalCost) * 100 : 0
    })).sort((a, b) => b.amount - a.amount)
  }

  // Get supplier breakdown
  const getSupplierBreakdown = () => {
    if (!bom?.items) return []
    
    const suppliers = bom.items.reduce((acc, item) => {
      const supplier = item.supplier || 'Unknown Supplier'
      if (!acc[supplier]) {
        acc[supplier] = { items: 0, totalValue: 0 }
      }
      acc[supplier].items += 1
      acc[supplier].totalValue += item.totalCost || (item.quantity * item.unitCost)
      return acc
    }, {} as Record<string, { items: number; totalValue: number }>)

    return Object.entries(suppliers).map(([supplier, data]) => ({
      supplier,
      items: data.items,
      totalValue: data.totalValue,
      status: "Pending", // Default status since we don't track procurement status yet
      orderDate: null
    })).sort((a, b) => b.totalValue - a.totalValue)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading BOM details...</span>
        </div>
      </div>
    )
  }

  if (error || !bom) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">BOM Not Found</h2>
          <p className="text-gray-600 mb-4">{error || "The requested BOM could not be found."}</p>
          <Button onClick={() => router.push('/bom')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to BOMs
          </Button>
        </div>
      </div>
    )
  }

  const costBreakdown = getCostBreakdown()
  const supplierBreakdown = getSupplierBreakdown()

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
                  <h1 className="text-2xl font-bold text-gray-900">{bom.bomNumber}</h1>
                  <Badge className={getStatusColor(bom.status || "Draft")}>
                    {bom.status || "Draft"}
                  </Badge>
                  {bom.bomType && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {bom.bomType.toUpperCase()}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {bom.productName}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export BOM
              </Button>
              <Link href={`/bom/${bom.id}/edit`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit BOM
                </Button>
              </Link>
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
                          <TableHead>Category</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bom.items?.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.description}</p>
                                {item.partNumber && (
                                  <p className="text-xs text-gray-500">{item.partNumber}</p>
                                )}
                                {item.itemNumber && (
                                  <p className="text-xs text-gray-500">Item: {item.itemNumber}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.unit}</TableCell>
                            <TableCell>
                              {item.materialGrade ? (
                                <Badge variant="outline">{item.materialGrade}</Badge>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>${item.unitCost.toLocaleString()}</TableCell>
                            <TableCell className="font-medium">
                              ${(item.totalCost || (item.quantity * item.unitCost)).toLocaleString()}
                            </TableCell>
                            <TableCell>{item.supplier || '-'}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(item.category)}>
                                {item.category}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )) || (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                              No items found in this BOM
                            </TableCell>
                          </TableRow>
                        )}
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
                          <span className="font-medium">${bom.totalCost?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Items Count:</span>
                          <span className="font-medium">{bom.itemCount || bom.items?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Version:</span>
                          <span className="font-medium">{bom.version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Revision:</span>
                          <span className="font-medium">{bom.revision}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t pt-4">
                          <span>Total BOM Cost:</span>
                          <span>${bom.totalCost?.toLocaleString() || '0'}</span>
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
                        {supplierBreakdown.map((supplier, index) => (
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
                          <label className="text-sm font-medium text-gray-500">BOM Number</label>
                          <p className="mt-1 font-medium">{bom.bomNumber}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Product Name</label>
                          <p className="mt-1">{bom.productName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">BOM Type</label>
                          <p className="mt-1">
                            {bom.bomType ? (
                              <Badge variant="outline">{bom.bomType.toUpperCase()}</Badge>
                            ) : (
                              <span className="text-gray-400">Not specified</span>
                            )}
                          </p>
                        </div>

                        {relatedDrawing && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Source Drawing</label>
                            <p className="mt-1">
                              <Link href={`/engineering/${relatedDrawing.projectId}`} className="text-blue-600 hover:underline">
                                {relatedDrawing.drawingNumber} - {relatedDrawing.title}
                              </Link>
                            </p>
                          </div>
                        )}
                        {relatedBoq && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Source BOQ</label>
                            <p className="mt-1">
                              <Link href={`/boq/${relatedBoq.id}`} className="text-blue-600 hover:underline">
                                {relatedBoq.boqNumber} - {relatedBoq.title}
                              </Link>
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Date Created</label>
                          <p className="mt-1">{new Date(bom.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Last Updated</label>
                          <p className="mt-1">{new Date(bom.updatedAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Version</label>
                          <p className="mt-1">{bom.version}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Revision</label>
                          <p className="mt-1">{bom.revision}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Created By</label>
                          <p className="mt-1">{bom.createdBy || 'Unknown'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <label className="text-sm font-medium text-gray-500">Notes</label>
                      <p className="mt-1 text-gray-700">{bom.notes || 'No notes provided'}</p>
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
                  <label className="text-xs font-medium text-gray-500">TOTAL ITEMS</label>
                  <p className="text-lg font-bold">{bom.itemCount || bom.items?.length || 0}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">TOTAL COST</label>
                  <p className="text-lg font-bold">${bom.totalCost?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">STATUS</label>
                  <Badge className={getStatusColor(bom.status || "Draft")}>
                    {bom.status || "Draft"}
                  </Badge>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">VERSION</label>
                  <p className="text-lg font-bold">{bom.version} (Rev. {bom.revision})</p>
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
