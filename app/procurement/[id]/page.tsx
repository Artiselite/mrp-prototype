"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ShoppingCart,
  ArrowLeft,
  Edit,
  Calendar,
  DollarSign,
  Truck,
  AlertTriangle,
  Building,
  Phone,
  Mail,
  MapPin,
  FileText,
  Package,
  Calculator,
} from "lucide-react"
import Link from "next/link"
import { purchaseOrders, suppliers, formatCurrency } from "@/lib/data"
import { notFound } from "next/navigation"
import { use } from "react"
import UnitEconomicsCalculator from "@/components/unit-economics-calculator"
import SubcontractorIntegration from "@/components/subcontractor-integration"

interface PurchaseOrderDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function PurchaseOrderDetailPage({ params }: PurchaseOrderDetailPageProps) {
  const unwrappedParams = use(params) as { id: string }
  const order = purchaseOrders.find((po) => po.id === unwrappedParams.id)

  if (!order) {
    notFound()
  }

  const supplier = order ? suppliers.find((s) => s.id === order.supplierId) : null
  const [showUnitEconomics, setShowUnitEconomics] = useState(false)



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

  const getStatusColor = (status: string) => {
    const colors = {
      Draft: "bg-gray-100 text-gray-800",
      Sent: "bg-blue-100 text-blue-800",
      Acknowledged: "bg-yellow-100 text-yellow-800",
      Shipped: "bg-purple-100 text-purple-800",
      Received: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "Critical":
        return "border-red-500 text-red-700 bg-red-50"
      case "High":
        return "border-orange-500 text-orange-700 bg-orange-50"
      case "Medium":
        return "border-yellow-500 text-yellow-700 bg-yellow-50"
      case "Low":
        return "border-green-500 text-green-700 bg-green-50"
      default:
        return "border-gray-500 text-gray-700 bg-gray-50"
    }
  }

  // Safety check - this should never happen due to notFound() above
  if (!order) {
    return <div>Order not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link href="/procurement">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Procurement
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-8 h-8 text-purple-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{order.id}</h1>
                  <p className="text-sm text-gray-600">Purchase Order Details</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
              <Button 
                variant="outline" 
                onClick={() => setShowUnitEconomics(!showUnitEconomics)}
              >
                <Calculator className="w-4 h-4 mr-2" />
                {showUnitEconomics ? 'Hide' : 'Show'} Unit Economics
              </Button>
              <Link href={`/procurement/${order.id}/edit`}>
                <Button>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Order
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Unit Economics Calculator Section */}
        {showUnitEconomics && (
          <div className="mb-8">
            <UnitEconomicsCalculator 
              quotationId={order.id}
              onSave={(data) => {
                console.log('Unit economics saved:', data)
                // In a real app, this would save to the database
              }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Order Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {order.priority && getPriorityIcon(order.priority)}
                      <div>
                        <p className="text-sm text-gray-500">Priority</p>
                        <p className="font-medium">{order.priority || "Not set"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Order Date</p>
                        <p className="font-medium">{order.orderDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Requested Delivery</p>
                        <p className="font-medium">{order.requestedDeliveryDate}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="font-bold text-lg">{formatCurrency(order.total)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Items</p>
                        <p className="font-medium">{order.items.length}</p>
                      </div>
                    </div>
                    {order.actualDeliveryDate && (
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-500">Actual Delivery</p>
                          <p className="font-medium text-green-600">{order.actualDeliveryDate}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {order.notes && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Notes</p>
                        <p className="text-gray-700">{order.notes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Line Items Table */}
            <Card>
              <CardHeader>
                <CardTitle>Line Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead className="min-w-[200px]">Description</TableHead>
                        <TableHead className="min-w-[120px]">Part Number</TableHead>
                        <TableHead className="w-[80px]">Qty</TableHead>
                        <TableHead className="w-[80px]">Unit</TableHead>
                        <TableHead className="w-[100px]">Unit Price</TableHead>
                        <TableHead className="w-[100px]">Total</TableHead>
                        <TableHead className="w-[100px]">Steel Grade</TableHead>
                        <TableHead className="w-[80px]">Urgency</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.description}</p>
                              {item.specifications && (
                                <p className="text-sm text-gray-600 mt-1">{item.specifications}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{item.partNumber}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-sm">{item.unit}</TableCell>
                          <TableCell className="font-medium">{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell className="font-bold">{formatCurrency(item.totalPrice)}</TableCell>
                          <TableCell>
                            {item.steelGrade && (
                              <Badge variant="outline" className="text-xs">
                                {item.steelGrade}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs ${getUrgencyColor(item.urgency)}`}>
                              {item.urgency}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Additional Item Details */}
                <div className="mt-6 space-y-4">
                  <h4 className="font-medium">Additional Item Details</h4>
                  {order.items.map((item, index) => {
                    const hasAdditionalInfo = item.requestedDate || item.notes
                    if (!hasAdditionalInfo) return null

                    return (
                      <div key={`details-${item.id}`} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Item {index + 1}:</span>
                          <span className="text-sm text-gray-600">{item.description}</span>
                        </div>

                        {item.requestedDate && (
                          <div>
                            <span className="text-sm text-gray-500">Requested Date: </span>
                            <span className="text-sm font-medium">{item.requestedDate}</span>
                          </div>
                        )}

                        {item.notes && (
                          <div>
                            <p className="text-sm text-gray-500">Notes:</p>
                            <p className="text-sm text-gray-700">{item.notes}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Order Totals */}
                <div className="mt-6 pt-6 border-t">
                  <div className="space-y-2 max-w-sm ml-auto">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>{formatCurrency(order.tax)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Delivery Address</p>
                    <p className="text-gray-700">{order.shippingAddress}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Payment Terms</p>
                  <p className="font-medium">{order.paymentTerms}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Supplier Information */}
            {supplier && (
              <Card>
                <CardHeader>
                  <CardTitle>Supplier Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-medium">{supplier.name}</p>
                      <p className="text-sm text-gray-600">{supplier.contactPerson}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a href={`mailto:${supplier.email}`} className="text-sm text-blue-600 hover:underline">
                        {supplier.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${supplier.phone}`} className="text-sm text-blue-600 hover:underline">
                        {supplier.phone}
                      </a>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                      <div className="text-sm text-gray-600">
                        <p>{supplier.address}</p>
                        <p>
                          {supplier.city}, {supplier.state} {supplier.zipCode}
                        </p>
                        <p>{supplier.country}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Badge className="bg-green-100 text-green-800">Rating: {supplier.rating}/5</Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Specialties:</p>
                    <div className="flex flex-wrap gap-1">
                      {supplier.specialties.map((specialty) => (
                        <Badge key={specialty} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {supplier.notes && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-gray-500">Notes:</p>
                      <p className="text-sm text-gray-700">{supplier.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/procurement/${order.id}/edit`} className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Order
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <FileText className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Supplier
                </Button>
                {order.status === "Sent" && (
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Package className="w-4 h-4 mr-2" />
                    Mark as Received
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Related Information */}
            {order.bomId && (
              <Card>
                <CardHeader>
                  <CardTitle>Related Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href={`/bom/${order.bomId}`} className="block">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <FileText className="w-4 h-4 mr-2" />
                      View Related BOM
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Subcontractor Integration */}
        <div className="mt-8">
          <SubcontractorIntegration 
            purchaseOrderId={order.id}
            showCreateActions={true}
          />
        </div>
      </main>
    </div>
  )
}
