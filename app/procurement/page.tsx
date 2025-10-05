"use client"

import { useState, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShoppingCart, Plus, Search, Calendar, DollarSign, Truck, AlertTriangle, Eye, Edit, Download, User, Factory, FileText, Wrench, Users } from "lucide-react"
import Link from "next/link"
import { statusColors, formatCurrency } from "@/lib/data"
import { useSearchParams } from "next/navigation"
import { useDatabaseContext } from "@/components/database-provider"

function ProcurementContent() {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all")
  const { 
    suppliers = [],
    purchaseOrders = [], 
    projectSubcontractors = [],
    subcontractorWorkOrders = []
  } = useDatabaseContext()


  const filteredOrders = purchaseOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "Critical":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "High":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case "Medium":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "Low":
        return <AlertTriangle className="w-4 h-4 text-green-500" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 mb-2 block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Procurement</h1>
              <p className="text-sm text-gray-600">Manage purchase orders and supplier relationships</p>
            </div>
            <Link href="/procurement/create">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Purchase Order
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subcontractor Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{suppliers.length}</div>
              <p className="text-xs text-muted-foreground">
                {suppliers.filter(s => s.status === "Active").length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Factory className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectSubcontractors.length}</div>
              <p className="text-xs text-muted-foreground">
                {projectSubcontractors.filter(ps => ps.status === "In Progress").length} in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Work Orders</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subcontractorWorkOrders.length}</div>
              <p className="text-xs text-muted-foreground">
                {subcontractorWorkOrders.filter(wo => wo.status === "In Progress").length} in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(projectSubcontractors.reduce((sum, ps) => sum + ps.estimatedCost, 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                Subcontractor work value
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by PO number or supplier..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Sent">Sent</SelectItem>
                    <SelectItem value="Acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="Shipped">Shipped</SelectItem>
                    <SelectItem value="Received">Received</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subcontractor Work Orders */}
        {subcontractorWorkOrders.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Subcontractor Work Orders</CardTitle>
              <CardDescription>
                Work orders assigned to subcontractors across all projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Work Order</TableHead>
                    <TableHead>Subcontractor</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Work Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subcontractorWorkOrders.slice(0, 5).map((workOrder: any) => (
                    <TableRow key={workOrder.id}>
                      <TableCell className="font-medium">{workOrder.workOrderNumber}</TableCell>
                      <TableCell>{workOrder.supplierName || "Unknown Supplier"}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">Project {workOrder.projectId}</p>
                          <p className="text-sm text-gray-500">{workOrder.workDescription}</p>
                        </div>
                      </TableCell>
                      <TableCell>{workOrder.workType}</TableCell>
                      <TableCell>
                        <Badge className="bg-gray-100 text-gray-800">
                          {workOrder.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${workOrder.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{workOrder.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{workOrder.dueDate}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/production/subcontractor-work-orders/${workOrder.id}`}>
                            <Button variant="ghost" size="sm" title="View Details">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/production/subcontractor-work-orders/${workOrder.id}/edit`}>
                            <Button variant="ghost" size="sm" title="Edit Work Order">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/procurement/create?workOrderId=${workOrder.id}`}>
                            <Button variant="ghost" size="sm" title="Create Purchase Order">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Purchase Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Orders</CardTitle>
            <CardDescription>
              Purchase orders and supplier management for all projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Delivery Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.supplierName}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.bomId || "N/A"}</p>
                        <p className="text-sm text-gray-500">{order.shippingAddress || "No address"}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {order.priority && getPriorityIcon(order.priority)}
                        <span>{order.priority || "Not set"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{order.orderDate}</TableCell>
                    <TableCell>{order.requestedDeliveryDate}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                    <TableCell>
                      <Badge className="bg-gray-100 text-gray-800">
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/procurement/${order.id}`}>
                          <Button variant="ghost" size="sm" title="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/procurement/${order.id}/edit`}>
                          <Button variant="ghost" size="sm" title="Edit Order">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" title="Download PO">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Subcontractor Work Orders Integration */}
        {subcontractorWorkOrders.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Related Subcontractor Work Orders
              </CardTitle>
              <CardDescription>
                Work orders that may require purchase orders for materials or services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Work Order</TableHead>
                      <TableHead>Subcontractor</TableHead>
                      <TableHead>Work Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Estimated Cost</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subcontractorWorkOrders.slice(0, 5).map((workOrder) => (
                      <TableRow key={workOrder.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Wrench className="w-4 h-4 text-blue-500" />
                            <div>
                              <p className="font-medium">{workOrder.workOrderNumber}</p>
                              <p className="text-sm text-gray-600 truncate max-w-[200px]">
                                {workOrder.workDescription}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Factory className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{workOrder.supplierName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{workOrder.workType}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-gray-100 text-gray-800">
                            {workOrder.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPriorityIcon(workOrder.priority)}
                            <span className="text-sm">{workOrder.priority}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{formatCurrency(workOrder.estimatedCost)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{workOrder.dueDate}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Link href={`/production/subcontractor-work-orders/${workOrder.id}`}>
                              <Button variant="ghost" size="sm" title="View Details">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link href={`/procurement/create?workOrderId=${workOrder.id}`}>
                              <Button variant="ghost" size="sm" title="Create Purchase Order">
                                <Plus className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {subcontractorWorkOrders.length > 5 && (
                <div className="mt-4 text-center">
                  <Link href="/production/subcontractor-work-orders">
                    <Button variant="outline">
                      View All Subcontractor Work Orders ({subcontractorWorkOrders.length})
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {filteredOrders.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No purchase orders found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search criteria or filters."
                  : "Get started by creating your first purchase order."}
              </p>
              <Link href="/procurement/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Purchase Order
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

export default function ProcurementPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading procurement...</p>
        </div>
      </div>
    }>
      <ProcurementContent />
    </Suspense>
  )
}
