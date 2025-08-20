"use client"

import { useState, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Plus, Search, Filter, Calendar, DollarSign, Truck, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { purchaseOrders, statusColors, formatCurrency } from "@/lib/data"
import { useSearchParams } from "next/navigation"

function ProcurementContent() {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all")

  const filteredOrders = purchaseOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier.toLowerCase().includes(searchTerm.toLowerCase())
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
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Procurement</h1>
                <p className="text-sm text-gray-600">Manage purchase orders and supplier relationships</p>
              </div>
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
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by PO number or supplier..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
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

        {/* Purchase Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(order.priority)}
                      <div>
                        <h3 className="font-semibold text-lg">{order.id}</h3>
                        <p className="text-sm text-gray-600">{order.supplier}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Order Date</p>
                      <p className="font-medium">{order.orderDate}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Delivery Date</p>
                      <p className="font-medium">{order.requestedDeliveryDate}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="font-bold text-lg">{formatCurrency(order.totalAmount)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors.procurement[order.status]}>{order.status}</Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Priority: {order.priority}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>Items: {order.items.length}</span>
                      </div>
                      {order.actualDeliveryDate && (
                        <div className="flex items-center gap-1">
                          <Truck className="w-4 h-4" />
                          <span>Delivered: {order.actualDeliveryDate}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/procurement/${order.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/procurement/${order.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
