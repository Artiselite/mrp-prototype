"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Eye, Edit } from "lucide-react"
import { statusColors, formatCurrency, formatDate } from "@/lib/data"
import { useDatabaseContext } from "@/components/database-provider"

export default function SalesOrdersPage() {
  const { useSalesOrders } = useDatabaseContext()
  const { salesOrders } = useSalesOrders()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [customerFilter, setCustomerFilter] = useState("all")

  const filteredOrders = salesOrders.filter((order) => {
    const matchesSearch =
      order.salesOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPO.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesCustomer = customerFilter === "all" || order.customerId === customerFilter

    return matchesSearch && matchesStatus && matchesCustomer
  })

  const uniqueCustomers = Array.from(new Set(salesOrders.map((order) => order.customerId)))
    .map((id) => salesOrders.find((order) => order.customerId === id))
    .filter(Boolean)

  const stats = {
    total: salesOrders.length,
    confirmed: salesOrders.filter((o) => o.status === "Confirmed").length,
    inProduction: salesOrders.filter((o) => o.status === "In Production").length,
    shipped: salesOrders.filter((o) => o.status === "Shipped").length,
    totalValue: salesOrders.reduce((sum, order) => sum + order.total, 0),
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
              <h1 className="text-2xl font-bold text-gray-900">Sales Orders</h1>
              <p className="text-sm text-gray-600">Manage customer orders and delivery tracking</p>
            </div>
            <Link href="/sales-orders/create">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Sales Order
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
                <p className="text-sm text-gray-600">Confirmed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.inProduction}</p>
                <p className="text-sm text-gray-600">In Production</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
                <p className="text-sm text-gray-600">Shipped</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalValue)}</p>
                <p className="text-sm text-gray-600">Total Value</p>
              </div>
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
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="In Production">In Production</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={customerFilter} onValueChange={setCustomerFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {uniqueCustomers.map((customer) => (
                    <SelectItem key={customer!.customerId} value={customer!.customerId}>
                      {customer!.customerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sales Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Orders</CardTitle>
            <CardDescription>
              Customer orders and delivery tracking for all projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Delivery Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Revision</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.salesOrderNumber}
                    </TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.title}</p>
                        <p className="text-sm text-gray-500">{order.customerPO}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors.salesOrder[order.status]}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(order.orderDate)}</TableCell>
                    <TableCell>
                      {order.confirmedDeliveryDate
                        ? formatDate(order.confirmedDeliveryDate)
                        : formatDate(order.requestedDeliveryDate)}
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                    <TableCell>{order.revision}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/sales-orders/${order.id}`}>
                          <Button variant="ghost" size="sm" title="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/sales-orders/${order.id}/edit`}>
                          <Button variant="ghost" size="sm" title="Edit Order">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredOrders.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No sales orders found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
