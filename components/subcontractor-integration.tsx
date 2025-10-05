"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import {
  Wrench,
  ShoppingCart,
  Link as LinkIcon,
  Plus,
  Eye,
  Edit,
  AlertTriangle,
  CheckCircle,
  Clock,
  AlertCircle,
  Target,
  Shield,
  Settings,
  Building,
  Calendar,
  DollarSign,
  Users,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { useDatabaseContext } from "@/components/database-provider"
import { formatCurrency } from "@/lib/data"

interface SubcontractorIntegrationProps {
  purchaseOrderId?: string
  workOrderId?: string
  showCreateActions?: boolean
}

export default function SubcontractorIntegration({ 
  purchaseOrderId, 
  workOrderId, 
  showCreateActions = true 
}: SubcontractorIntegrationProps) {
  const { 
    purchaseOrders = [],
    subcontractorWorkOrders = [],
    suppliers = [],
    engineeringProjects = []
  } = useDatabaseContext()

  const [activeTab, setActiveTab] = useState<"related" | "create">("related")

  // Find related work orders for a purchase order
  const getRelatedWorkOrders = (poId: string) => {
    const purchaseOrder = purchaseOrders.find((po: any) => po.id === poId)
    if (!purchaseOrder) return []

    return subcontractorWorkOrders.filter((wo: any) => 
      wo.supplierId === purchaseOrder.supplierId
    )
  }

  // Find related purchase orders for a work order
  const getRelatedPurchaseOrders = (woId: string) => {
    const workOrder = subcontractorWorkOrders.find((wo: any) => wo.id === woId)
    if (!workOrder) return []

    return purchaseOrders.filter((po: any) => 
      po.supplierId === workOrder.supplierId
    )
  }

  const getStatusColor = (status: string) => {
    const colors = {
      Draft: "bg-gray-100 text-gray-800",
      Sent: "bg-blue-100 text-blue-800",
      Acknowledged: "bg-yellow-100 text-yellow-800",
      "In Progress": "bg-purple-100 text-purple-800",
      Completed: "bg-green-100 text-green-800",
      "On Hold": "bg-orange-100 text-orange-800",
      Cancelled: "bg-red-100 text-red-800",
      Shipped: "bg-purple-100 text-purple-800",
      Received: "bg-green-100 text-green-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

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

  const getWorkTypeIcon = (workType: string) => {
    switch (workType) {
      case "Fabrication":
        return <Wrench className="w-4 h-4 text-blue-500" />
      case "Assembly":
        return <Settings className="w-4 h-4 text-green-500" />
      case "Welding":
        return <Wrench className="w-4 h-4 text-orange-500" />
      case "Machining":
        return <Wrench className="w-4 h-4 text-purple-500" />
      case "Coating":
        return <Shield className="w-4 h-4 text-cyan-500" />
      case "Testing":
        return <CheckCircle className="w-4 h-4 text-indigo-500" />
      case "Installation":
        return <Target className="w-4 h-4 text-pink-500" />
      default:
        return <Wrench className="w-4 h-4 text-gray-500" />
    }
  }

  const relatedWorkOrders = purchaseOrderId ? getRelatedWorkOrders(purchaseOrderId) : []
  const relatedPurchaseOrders = workOrderId ? getRelatedPurchaseOrders(workOrderId) : []

  if (!purchaseOrderId && !workOrderId) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Integration Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Purchase Order & Work Order Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Purchase Orders</p>
                  <p className="font-medium">{relatedPurchaseOrders.length} related</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Work Orders</p>
                  <p className="font-medium">{relatedWorkOrders.length} related</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">Shared Suppliers</p>
                  <p className="font-medium">
                    {new Set([
                      ...relatedPurchaseOrders.map((po: any) => po.supplierId),
                      ...relatedWorkOrders.map((wo: any) => wo.supplierId)
                    ]).size}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-500">Total Value</p>
                  <p className="font-medium">
                    {formatCurrency(
                      relatedPurchaseOrders.reduce((sum: number, po: any) => sum + po.total, 0) +
                      relatedWorkOrders.reduce((sum: number, wo: any) => sum + wo.estimatedCost, 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Related Work Orders */}
      {relatedWorkOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Related Subcontractor Work Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Work Order</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Work Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relatedWorkOrders.map((workOrder: any) => {
                    const project = engineeringProjects.find((p: any) => p.id === workOrder.projectId)
                    return (
                      <TableRow key={workOrder.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getWorkTypeIcon(workOrder.workType)}
                            <div>
                              <p className="font-medium">{workOrder.workOrderNumber}</p>
                              <p className="text-sm text-gray-600 truncate max-w-[200px]">
                                {workOrder.workDescription}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{project?.title || "Unknown Project"}</p>
                            <p className="text-sm text-gray-600">{workOrder.projectId}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{workOrder.workType}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(workOrder.status)}>
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
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">{workOrder.progress}%</span>
                            </div>
                            <Progress value={workOrder.progress} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{formatCurrency(workOrder.estimatedCost)}</p>
                            {workOrder.actualCost > 0 && (
                              <p className="text-sm text-gray-600">
                                Actual: {formatCurrency(workOrder.actualCost)}
                              </p>
                            )}
                          </div>
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
                            <Link href={`/production/subcontractor-work-orders/${workOrder.id}/edit`}>
                              <Button variant="ghost" size="sm" title="Edit Work Order">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related Purchase Orders */}
      {relatedPurchaseOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Related Purchase Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Purchase Order</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Delivery Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relatedPurchaseOrders.map((purchaseOrder: any) => (
                    <TableRow key={purchaseOrder.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="font-medium">{purchaseOrder.poNumber}</p>
                            <p className="text-sm text-gray-600">{purchaseOrder.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{purchaseOrder.supplierName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(purchaseOrder.status)}>
                          {purchaseOrder.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPriorityIcon(purchaseOrder.priority || "Medium")}
                          <span className="text-sm">{purchaseOrder.priority || "Medium"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{formatCurrency(purchaseOrder.total)}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{purchaseOrder.orderDate}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{purchaseOrder.requestedDeliveryDate}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/procurement/${purchaseOrder.id}`}>
                            <Button variant="ghost" size="sm" title="View Details">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/procurement/${purchaseOrder.id}/edit`}>
                            <Button variant="ghost" size="sm" title="Edit Purchase Order">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {showCreateActions && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/procurement/create" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Purchase Order
                </Button>
              </Link>
              <Link href="/production/subcontractor-work-orders/create" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Work Order
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
