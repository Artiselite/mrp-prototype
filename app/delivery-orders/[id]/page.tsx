"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Truck, Package, FileText, Receipt, MapPin, User, Phone, Mail, ArrowRight, Clock } from "lucide-react"
import Link from "next/link"
import { useDatabaseContext } from "@/components/database-provider"

export default function DeliveryOrderDetailPage() {
  const params = useParams()
  const doId = params.id as string
  const { shipments = [], invoices = [] } = useDatabaseContext()

  const deliveryOrder = shipments.find((s: any) => s.id === doId)

  if (!deliveryOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold">Delivery Order Not Found</h2>
            <p className="text-sm text-gray-500 mt-2">DO ID: {doId}</p>
            <Link href="/delivery-orders">
              <Button className="mt-4" variant="outline">← Back to Delivery Orders</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const linkedInvoice = deliveryOrder.invoiceId
    ? invoices.find((inv: any) => inv.id === deliveryOrder.invoiceId)
    : null

  const totalValue = deliveryOrder.items.reduce((sum: number, item: any) => sum + item.totalPrice, 0)

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <Link href="/delivery-orders" className="text-sm text-blue-600 hover:text-blue-800 mb-2 block">
                ← Back to Delivery Orders
              </Link>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{deliveryOrder.shipmentNumber}</h1>
                <Badge className={getStatusColor(deliveryOrder.status)}>{deliveryOrder.status}</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">Delivery Order for {deliveryOrder.customerName}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Linked Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Linked Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 flex-wrap text-sm">
              {deliveryOrder.salesOrderId && (
                <>
                  <Link href={`/sales-orders/${deliveryOrder.salesOrderId}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors">
                    <FileText className="h-4 w-4" />
                    SO: {deliveryOrder.orderNumber}
                  </Link>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </>
              )}
              {deliveryOrder.workOrderId && (
                <>
                  <Link href="/production/work-orders" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 transition-colors">
                    <Package className="h-4 w-4" />
                    WO: {deliveryOrder.workOrderId}
                  </Link>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </>
              )}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-700 font-semibold">
                <Truck className="h-4 w-4" />
                DO: {deliveryOrder.shipmentNumber}
              </div>
              {linkedInvoice && (
                <>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <Link href={`/invoicing/${linkedInvoice.id}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors">
                    <Receipt className="h-4 w-4" />
                    INV: {linkedInvoice.invoiceNumber}
                  </Link>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Delivery Details */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">DO Number</p>
                  <p className="font-medium">{deliveryOrder.shipmentNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <Badge className={getStatusColor(deliveryOrder.status)}>{deliveryOrder.status}</Badge>
                </div>
                <div>
                  <p className="text-gray-500">Carrier</p>
                  <p className="font-medium">{deliveryOrder.carrier}</p>
                </div>
                <div>
                  <p className="text-gray-500">Shipping Method</p>
                  <p className="font-medium">{deliveryOrder.shippingMethod}</p>
                </div>
                <div>
                  <p className="text-gray-500">Scheduled Date</p>
                  <p className="font-medium flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(deliveryOrder.scheduledDate).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                {deliveryOrder.trackingNumber && (
                  <div>
                    <p className="text-gray-500">Tracking Number</p>
                    <p className="font-medium font-mono">{deliveryOrder.trackingNumber}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ship To */}
          <Card>
            <CardHeader>
              <CardTitle>Ship To</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-semibold">{deliveryOrder.customerName}</p>
                  {deliveryOrder.shippingAddress.contactPerson && (
                    <p className="text-gray-500">Attn: {deliveryOrder.shippingAddress.contactPerson}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p>{deliveryOrder.shippingAddress.street}</p>
                  <p>{deliveryOrder.shippingAddress.city}, {deliveryOrder.shippingAddress.state} {deliveryOrder.shippingAddress.zipCode}</p>
                  <p>{deliveryOrder.shippingAddress.country}</p>
                </div>
              </div>
              {deliveryOrder.shippingAddress.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <p>{deliveryOrder.shippingAddress.phone}</p>
                </div>
              )}
              {deliveryOrder.shippingAddress.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p>{deliveryOrder.shippingAddress.email}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Part Number</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Qty Ordered</TableHead>
                  <TableHead className="text-right">Qty Packed</TableHead>
                  <TableHead className="text-right">Qty Shipped</TableHead>
                  <TableHead className="text-right">Unit Price (RM)</TableHead>
                  <TableHead className="text-right">Total (RM)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveryOrder.items.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono">{item.partNumber}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{item.packedQuantity}</TableCell>
                    <TableCell className="text-right">{item.shippedQuantity}</TableCell>
                    <TableCell className="text-right font-mono">RM{item.unitPrice.toLocaleString("en-MY", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right font-mono font-medium">RM{item.totalPrice.toLocaleString("en-MY", { minimumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-end mt-4 pt-4 border-t">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Delivery Value</p>
                <p className="text-2xl font-bold">RM{totalValue.toLocaleString("en-MY", { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Proof of Delivery */}
        {deliveryOrder.proofOfDelivery && (
          <Card>
            <CardHeader>
              <CardTitle>Proof of Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Delivered By</p>
                  <p className="font-medium">{deliveryOrder.proofOfDelivery.deliveredBy}</p>
                </div>
                <div>
                  <p className="text-gray-500">Received By</p>
                  <p className="font-medium">{deliveryOrder.proofOfDelivery.receivedBy}</p>
                </div>
                <div>
                  <p className="text-gray-500">Delivery Date</p>
                  <p className="font-medium">
                    {new Date(deliveryOrder.proofOfDelivery.deliveryDate).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Condition</p>
                  <Badge className={deliveryOrder.proofOfDelivery.condition === "Good" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {deliveryOrder.proofOfDelivery.condition}
                  </Badge>
                </div>
              </div>
              {deliveryOrder.proofOfDelivery.notes && (
                <p className="text-sm text-gray-600 mt-3 p-3 bg-gray-50 rounded-md">{deliveryOrder.proofOfDelivery.notes}</p>
              )}
            </CardContent>
          </Card>
        )}

        {deliveryOrder.specialInstructions && (
          <Card>
            <CardHeader>
              <CardTitle>Special Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">{deliveryOrder.specialInstructions}</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
