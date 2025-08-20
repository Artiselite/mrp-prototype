"use client"

import { use } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Edit,
  FileText,
  Package,
  Factory,
  Receipt,
  Calendar,
  MapPin,
  CreditCard,
  AlertCircle,
} from "lucide-react"
import { salesOrders, statusColors, formatCurrency, formatDate } from "@/lib/data"

interface SalesOrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default function SalesOrderDetailPage({ params }: SalesOrderDetailPageProps) {
  const { id } = use(params)
  const order = salesOrders.find((o) => o.id === id)

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sales Order Not Found</h1>
          <Button asChild>
            <Link href="/sales-orders">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sales Orders
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" asChild>
              <Link href="/sales-orders">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sales Orders
              </Link>
            </Button>
          </div>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{order.id}</h1>
              <p className="text-xl text-gray-600 mt-2">{order.title}</p>
              <div className="flex items-center gap-4 mt-4">
                <Badge className={statusColors.salesOrder[order.status]}>{order.status}</Badge>
                <Badge
                  variant={
                    order.priority === "Critical" ? "destructive" : order.priority === "High" ? "default" : "secondary"
                  }
                >
                  {order.priority} Priority
                </Badge>
                <Badge variant="outline">Rev {order.revision}</Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/sales-orders/${order.id}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Order
                </Link>
              </Button>
              {order.engineeringId && (
                <Button variant="outline" asChild>
                  <Link href={`/engineering/${order.engineeringId}`}>
                    <FileText className="w-4 h-4 mr-2" />
                    Engineering
                  </Link>
                </Button>
              )}
              {order.bomId && (
                <Button variant="outline" asChild>
                  <Link href={`/bom/${order.bomId}`}>
                    <Package className="w-4 h-4 mr-2" />
                    BOM
                  </Link>
                </Button>
              )}
              {order.productionId && (
                <Button variant="outline" asChild>
                  <Link href={`/production/${order.productionId}`}>
                    <Factory className="w-4 h-4 mr-2" />
                    Production
                  </Link>
                </Button>
              )}
              {order.invoiceId && (
                <Button variant="outline" asChild>
                  <Link href={`/invoicing/${order.invoiceId}`}>
                    <Receipt className="w-4 h-4 mr-2" />
                    Invoice
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="items">Line Items</TabsTrigger>
            <TabsTrigger value="delivery">Delivery & Billing</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Summary */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600">{order.description}</p>
                  </div>

                  {order.notes && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                          <p className="text-yellow-800">{order.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Customer Information</h3>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-gray-600">Customer:</span> {order.customer}
                        </p>
                        <p>
                          <span className="text-gray-600">Customer PO:</span> {order.customerPO}
                        </p>
                        <p>
                          <span className="text-gray-600">Payment Terms:</span> {order.paymentTerms}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Order Details</h3>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-gray-600">Created By:</span> {order.createdBy}
                        </p>
                        <p>
                          <span className="text-gray-600">Approved By:</span> {order.approvedBy}
                        </p>
                        <p>
                          <span className="text-gray-600">Approved Date:</span>{" "}
                          {order.approvedDate ? formatDate(order.approvedDate) : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Dates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Key Dates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Order Date</p>
                    <p className="text-lg font-semibold">{formatDate(order.orderDate)}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Requested Delivery</p>
                    <p className="text-lg font-semibold">{formatDate(order.requestedDeliveryDate)}</p>
                  </div>
                  {order.confirmedDeliveryDate && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Confirmed Delivery</p>
                        <p className="text-lg font-semibold text-green-600">
                          {formatDate(order.confirmedDeliveryDate)}
                        </p>
                      </div>
                    </>
                  )}
                  {order.actualDeliveryDate && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Actual Delivery</p>
                        <p className="text-lg font-semibold text-blue-600">{formatDate(order.actualDeliveryDate)}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Financial Summary */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Subtotal</p>
                    <p className="text-2xl font-bold">{formatCurrency(order.subtotal)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Tax ({order.taxRate}%)</p>
                    <p className="text-2xl font-bold">{formatCurrency(order.taxAmount)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(order.totalAmount)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Payment Terms</p>
                    <p className="text-lg font-semibold">{order.paymentTerms}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="items">
            <Card>
              <CardHeader>
                <CardTitle>Line Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total Price</TableHead>
                        <TableHead>Steel Grade</TableHead>
                        <TableHead>Delivery Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.description}</p>
                              {item.specifications && <p className="text-sm text-gray-600">{item.specifications}</p>}
                            </div>
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell className="font-medium">{formatCurrency(item.totalPrice)}</TableCell>
                          <TableCell>{item.steelGrade || "N/A"}</TableCell>
                          <TableCell>{item.deliveryDate ? formatDate(item.deliveryDate) : "TBD"}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                item.status === "Delivered"
                                  ? "bg-green-100 text-green-800"
                                  : item.status === "Shipped"
                                    ? "bg-purple-100 text-purple-800"
                                    : item.status === "Ready"
                                      ? "bg-blue-100 text-blue-800"
                                      : item.status === "In Production"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                              }
                            >
                              {item.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delivery">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-line text-gray-700">{order.shippingAddress}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Billing Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-line text-gray-700">{order.billingAddress}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Order Approved</p>
                      <p className="text-sm text-gray-600">
                        Approved by {order.approvedBy} on {order.approvedDate ? formatDate(order.approvedDate) : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Order Created</p>
                      <p className="text-sm text-gray-600">
                        Created by {order.createdBy} on {formatDate(order.orderDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
