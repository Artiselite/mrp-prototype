"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Truck, Package, FileText, Receipt, ArrowRight, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useDatabaseContext } from "@/components/database-provider"

export default function DeliveryOrdersPage() {
  const { shipments = [], invoices = [] } = useDatabaseContext()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered": return "bg-green-100 text-green-800"
      case "In Transit": return "bg-blue-100 text-blue-800"
      case "Pending": return "bg-amber-100 text-amber-800"
      case "Picked Up": return "bg-indigo-100 text-indigo-800"
      case "Exception": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getLinkedInvoice = (shipment: any) => {
    if (shipment.invoiceId) {
      return invoices.find((inv: any) => inv.id === shipment.invoiceId)
    }
    return null
  }

  const totalValue = shipments.reduce((sum: number, s: any) =>
    sum + s.items.reduce((itemSum: number, item: any) => itemSum + item.totalPrice, 0), 0
  )

  const pendingCount = shipments.filter((s: any) => s.status === "Pending").length
  const deliveredCount = shipments.filter((s: any) => s.status === "Delivered").length
  const inTransitCount = shipments.filter((s: any) => s.status === "In Transit" || s.status === "Picked Up").length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 mb-2 block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Delivery Orders</h1>
              <p className="text-sm text-gray-500 mt-1">Manage delivery orders generated from completed production</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total DOs</p>
                  <p className="text-2xl font-bold">{shipments.length}</p>
                </div>
                <Truck className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Dispatch</p>
                  <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
                </div>
                <Package className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Transit</p>
                  <p className="text-2xl font-bold text-blue-600">{inTransitCount}</p>
                </div>
                <Truck className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-green-600">{deliveredCount}</p>
                </div>
                <Package className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Total Value */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Delivery Value</p>
                <p className="text-3xl font-bold text-gray-900">RM{totalValue.toLocaleString("en-MY", { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>{pendingCount} pending dispatch</p>
                <p>{deliveredCount} completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>DO Number</TableHead>
                  <TableHead>Sales Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Value (RM)</TableHead>
                  <TableHead>Carrier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipments.map((shipment: any) => {
                  const linkedInvoice = getLinkedInvoice(shipment)
                  const doValue = shipment.items.reduce((sum: number, item: any) => sum + item.totalPrice, 0)
                  return (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-medium">{shipment.shipmentNumber}</TableCell>
                      <TableCell>
                        {shipment.salesOrderId ? (
                          <Link href={`/sales-orders/${shipment.salesOrderId}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                            {shipment.orderNumber}
                          </Link>
                        ) : (
                          shipment.orderNumber
                        )}
                      </TableCell>
                      <TableCell>{shipment.customerName}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {shipment.items.map((item: any) => (
                            <div key={item.id} className="text-sm">
                              {item.description} <span className="text-gray-500">× {item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">RM{doValue.toLocaleString("en-MY", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-sm">{shipment.carrier}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(shipment.status)}>{shipment.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {linkedInvoice ? (
                          <Link href={`/invoicing/${linkedInvoice.id}`} className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 text-sm">
                            <Receipt className="h-3.5 w-3.5" />
                            {linkedInvoice.invoiceNumber}
                          </Link>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link href={`/delivery-orders/${shipment.id}`}>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-3.5 w-3.5 mr-1" /> View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Order-to-Cash Flow Diagram */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Order-to-Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-2 flex-wrap text-sm">
              {[
                { label: "Sales Order", icon: FileText, color: "text-blue-600" },
                { label: "Work Order", icon: Package, color: "text-purple-600" },
                { label: "Production", icon: Package, color: "text-orange-600" },
                { label: "Delivery Order", icon: Truck, color: "text-emerald-600" },
                { label: "Invoice", icon: Receipt, color: "text-red-600" },
              ].map((step, i) => (
                <div key={step.label} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-50 border ${step.label === "Delivery Order" ? "border-emerald-300 bg-emerald-50 font-semibold" : "border-gray-200"}`}>
                    <step.icon className={`h-4 w-4 ${step.color}`} />
                    {step.label}
                  </div>
                  {i < 4 && <ArrowRight className="h-4 w-4 text-gray-400" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
