"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, Dialog, DialogHeader as DialogHeaderAlias } from "@/components/ui/dialog"
import { Plus, Search, Eye, Edit, Receipt, Download, Send } from 'lucide-react'
import Link from "next/link"

import { useDatabaseContext } from "@/components/database-provider"

export default function InvoicingPage() {
  const { invoices = [] } = useDatabaseContext()

  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-100 text-green-800"
      case "Sent": return "bg-blue-100 text-blue-800"
      case "Draft": return "bg-gray-100 text-gray-800"
      case "Overdue": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const handleViewDetails = (invoice: any) => {
    setSelectedInvoice(invoice)
    setIsDetailDialogOpen(true)
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
              <h1 className="text-2xl font-bold text-gray-900">Invoicing</h1>
              <p className="text-sm text-gray-600">Generate and manage customer invoices</p>
            </div>
            <Link href="/invoicing/create">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Invoice
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
                  <Input placeholder="Search invoices..." className="pl-10" />
                </div>
              </div>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>
              Customer invoices and payment tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Issued</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice: any) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.customerName}</TableCell>
                    <TableCell>{invoice.project || "—"}</TableCell>
                    <TableCell className="font-medium">${invoice.total.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{invoice.issueDate || "—"}</TableCell>
                    <TableCell>{invoice.dueDate || "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/invoicing/${invoice.id}`}>
                          <Button variant="ghost" size="sm" title="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/invoicing/${invoice.id}/edit`}>
                          <Button variant="ghost" size="sm" title="Edit Invoice">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" title="Download PDF">
                          <Download className="w-4 h-4" />
                        </Button>
                        {invoice.status === "Draft" && (
                          <Button variant="ghost" size="sm" title="Send Invoice">
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Invoice Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Invoice Details - {selectedInvoice?.id}</DialogTitle>
              <DialogDescription>
                Detailed invoice breakdown for {selectedInvoice?.project}
              </DialogDescription>
            </DialogHeader>
            {selectedInvoice && (
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Customer</Label>
                    <p>{selectedInvoice.customerName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Project</Label>
                    <p>{selectedInvoice.project || "—"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge className={getStatusColor(selectedInvoice.status)}>
                      {selectedInvoice.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Total Amount</Label>
                    <p className="font-bold text-lg">${selectedInvoice.total.toLocaleString()}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Line Items</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.items.map((item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.description}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>${item.unitPrice.toLocaleString()}</TableCell>
                          <TableCell className="font-medium">${item.totalPrice.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="border-t-2">
                        <TableCell colSpan={3} className="text-right font-semibold">
                          Subtotal:
                        </TableCell>
                        <TableCell className="font-bold">
                          ${selectedInvoice.subtotal.toLocaleString()}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-semibold">
                          Tax:
                        </TableCell>
                        <TableCell className="font-bold">
                          ${selectedInvoice.tax.toLocaleString()}
                        </TableCell>
                      </TableRow>
                      <TableRow className="border-t">
                        <TableCell colSpan={3} className="text-right font-bold text-lg">
                          Total:
                        </TableCell>
                        <TableCell className="font-bold text-lg">
                          ${selectedInvoice.total.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {selectedInvoice.status === "Paid" && selectedInvoice.issueDate && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-green-800 font-medium">
                      ✓ Payment received on {selectedInvoice.issueDate}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
