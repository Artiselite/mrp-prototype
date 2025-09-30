"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Download, Send, Receipt, CheckCircle, Clock, DollarSign, FileText, Loader2 } from 'lucide-react'
import Link from "next/link"
import { useDatabaseContext } from "@/components/database-provider"
import type { Invoice, Customer } from "@/lib/types"

interface InvoiceDetailsPageProps {
  params: Promise<{ id: string }>
}

export default function InvoiceDetailPage({ params }: InvoiceDetailsPageProps) {
  const { invoices, customers, isLoading } = useDatabaseContext()
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)

  // Resolve params
  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  // Find invoice and customer data
  useEffect(() => {
    if (resolvedParams && invoices.length > 0) {
      const foundInvoice = invoices.find(inv => inv.id === resolvedParams.id)
      if (foundInvoice) {
        setInvoice(foundInvoice)
        const foundCustomer = customers.find(cust => cust.id === foundInvoice.customerId)
        if (foundCustomer) {
          setCustomer(foundCustomer)
        }
      }
    }
  }, [resolvedParams, invoices, customers])

  // Mock data for demonstration - in a real app, this would come from the database
  const [paymentHistory] = useState([
    {
      date: invoice?.issueDate || "2024-01-30",
      amount: `$${invoice?.total.toLocaleString() || "18,750"}`,
      method: "Bank Transfer",
      reference: "TXN-789456123",
      status: invoice?.status === "Paid" ? "Completed" : "Pending"
    }
  ])

  const [communications] = useState([
    {
      id: 1,
      type: "Email",
      date: `${invoice?.issueDate || "2024-01-26"} 09:00`,
      subject: `Invoice ${invoice?.invoiceNumber || "INV-2024-001"} - ${invoice?.project || "Custom Fabricated Brackets"}`,
      from: "Accounts Receivable",
      to: customer?.contactPerson || "Customer",
      content: `Please find attached your invoice for the completed ${invoice?.project || "project"}.`
    },
    {
      id: 2,
      type: "Email",
      date: `${invoice?.issueDate || "2024-01-28"} 14:30`,
      subject: "Payment Confirmation Request",
      from: customer?.contactPerson || "Customer",
      to: "Accounts Receivable",
      content: "Invoice received. Payment will be processed according to terms."
    },
    {
      id: 3,
      type: "System",
      date: `${invoice?.issueDate || "2024-01-30"} 11:45`,
      subject: "Payment Received",
      from: "System",
      to: "Accounts Team",
      content: `Payment of $${invoice?.total.toLocaleString() || "18,750"} received via bank transfer. Invoice marked as paid.`
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-100 text-green-800"
      case "Sent": return "bg-blue-100 text-blue-800"
      case "Draft": return "bg-gray-100 text-gray-800"
      case "Overdue": return "bg-red-100 text-red-800"
      case "Completed": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Materials": return "bg-blue-100 text-blue-800"
      case "Labor": return "bg-green-100 text-green-800"
      case "Services": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  // Loading state
  if (isLoading || !resolvedParams) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading invoice details...</p>
        </div>
      </div>
    )
  }

  // Invoice not found
  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h1>
          <p className="text-gray-600 mb-4">The invoice you're looking for doesn't exist.</p>
          <Link href="/invoicing">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Invoicing
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/invoicing">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Invoicing
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{invoice.project || "Project"} - {invoice.customerName}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Link href={`/invoicing/${invoice.id}/edit`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Invoice
                </Button>
              </Link>
              {invoice.status === "Draft" && (
                <Button>
                  <Send className="w-4 h-4 mr-2" />
                  Send Invoice
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="col-span-3">
            <Tabs defaultValue="invoice" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="invoice">Invoice Details</TabsTrigger>
                <TabsTrigger value="payments">Payment History</TabsTrigger>
                <TabsTrigger value="communications">Communications</TabsTrigger>
                <TabsTrigger value="overview">Overview</TabsTrigger>
              </TabsList>

              <TabsContent value="invoice" className="space-y-6">
                {/* Invoice Header */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl">INVOICE</CardTitle>
                        <p className="text-lg font-medium mt-2">{invoice.invoiceNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Invoice Date</p>
                        <p className="font-medium">{invoice.dateIssued}</p>
                        <p className="text-sm text-gray-600 mt-2">Due Date</p>
                        <p className="font-medium">{invoice.dateDue}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
                        <div className="text-gray-700">
                          <p className="font-medium">{invoice.customerName}</p>
                          <p>{customer?.address || "Address not available"}</p>
                          <p className="mt-2">Attn: {customer?.contactPerson || "Contact Person"}</p>
                          <p>{customer?.email || "Email not available"}</p>
                          <p>{customer?.phone || "Phone not available"}</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Project Details:</h3>
                        <div className="text-gray-700">
                          <p><span className="font-medium">Project:</span> {invoice.project || "N/A"}</p>
                          <p><span className="font-medium">Sales Order:</span> {invoice.salesOrderId || "N/A"}</p>
                          <p><span className="font-medium">Revision:</span> {invoice.revision}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Line Items */}
                <Card>
                  <CardHeader>
                    <CardTitle>Invoice Line Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Rate</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoice.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.description}</TableCell>
                            <TableCell>
                              <Badge className="bg-blue-100 text-blue-800" variant="outline">
                                Item
                              </Badge>
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>${item.unitPrice.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-medium">${item.totalPrice.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {/* Invoice Totals */}
                    <div className="mt-6 flex justify-end">
                      <div className="w-80 space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span className="font-medium">${invoice.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span className="font-medium">${invoice.tax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                          <span>Total:</span>
                          <span>${invoice.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Terms and Notes */}
                    {invoice.notes && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Terms & Conditions</h4>
                        <p className="text-sm text-gray-700">{invoice.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payments" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>All payments received for this invoice</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {paymentHistory.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Reference</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paymentHistory.map((payment, index) => (
                            <TableRow key={index}>
                              <TableCell>{payment.date}</TableCell>
                              <TableCell className="font-medium">{payment.amount}</TableCell>
                              <TableCell>{payment.method}</TableCell>
                              <TableCell className="font-mono text-sm">{payment.reference}</TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(payment.status)}>
                                  {payment.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No payments received yet</p>
                      </div>
                    )}

                    {invoice.status === "Paid" && (
                      <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-green-800">
                            Invoice fully paid on {invoice.issueDate}
                          </span>
                        </div>
                        <p className="text-sm text-green-700 mt-1">
                          Payment method: Bank Transfer
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="communications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Communications Log</CardTitle>
                    <CardDescription>All communications related to this invoice</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {communications.map((comm) => (
                        <div key={comm.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{comm.type}</Badge>
                              <span className="font-medium">{comm.subject}</span>
                            </div>
                            <span className="text-sm text-gray-500">{comm.date}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            From: {comm.from} → To: {comm.to}
                          </p>
                          <p className="text-gray-700">{comm.content}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Invoice Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Invoice Number</label>
                          <p className="mt-1 font-medium">{invoice.invoiceNumber}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Sales Order</label>
                          <p className="mt-1">{invoice.salesOrderId || "N/A"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Customer</label>
                          <p className="mt-1">{invoice.customerName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Project</label>
                          <p className="mt-1">{invoice.project || "N/A"}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Date Issued</label>
                          <p className="mt-1">{invoice.issueDate}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Due Date</label>
                          <p className="mt-1">{invoice.dueDate}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Revision</label>
                          <p className="mt-1">{invoice.revision}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Total Amount</label>
                          <p className="mt-1 text-xl font-bold">${invoice.total.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">STATUS</label>
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">TOTAL AMOUNT</label>
                  <p className="text-xl font-bold">${invoice.total.toLocaleString()}</p>
                </div>
                {invoice.status === "Paid" && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">PAID ON</label>
                    <p className="text-sm font-medium">{invoice.issueDate}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Send className="w-4 h-4 mr-2" />
                  Email Customer
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Record Payment
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Edit className="w-4 h-4 mr-2" />
                  Create Credit Note
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
                  Source Work Order
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Project BOM
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Customer Contract
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
