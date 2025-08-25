"use client"

import { useState, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShoppingCart, Plus, Search, Calendar, DollarSign, Truck, AlertTriangle, Eye, Edit, Download } from "lucide-react"
import Link from "next/link"
import { statusColors, formatCurrency } from "@/lib/data"
import { useSearchParams } from "next/navigation"
import { useDatabaseContext } from "@/components/database-provider"

function ProcurementContent() {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all")
  const { usePurchaseOrders } = useDatabaseContext()
  const { purchaseOrders } = usePurchaseOrders()

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
                      <Badge className={statusColors.purchaseOrder[order.status]}>
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
    <Suspense fallback={<div>Loading procurement...</div>}>
      <ProcurementContent />
    </Suspense>
  )
}
