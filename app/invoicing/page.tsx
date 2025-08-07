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

export default function InvoicingPage() {
  const [invoices] = useState([
    {
      id: "INV-2024-001",
      workOrderId: "WO-2024-003",
      project: "Custom Fabricated Brackets",
      customer: "Industrial Corp",
      status: "Paid",
      amount: "$18,750",
      dateIssued: "2024-01-26",
      dateDue: "2024-02-25",
      datePaid: "2024-01-30",
      lineItems: [
        { description: "Material Cost (A572 Grade 50)", quantity: "8 tons", rate: "$1,200", amount: "$9,600" },
        { description: "Fabrication Labor", quantity: "40 hrs", rate: "$85", amount: "$3,400" },
        { description: "Machining Services", quantity: "16 hrs", rate: "$120", amount: "$1,920" },
        { description: "Quality Inspection", quantity: "1", rate: "$500", amount: "$500" },
        { description: "Delivery & Setup", quantity: "1", rate: "$750", amount: "$750" }
      ]
    },
    {
      id: "INV-2024-002",
      workOrderId: "WO-2024-001",
      project: "Industrial Warehouse Frame",
      customer: "ABC Steel Works",
      status: "Sent",
      amount: "$142,500",
      dateIssued: "2024-01-28",
      dateDue: "2024-02-27",
      datePaid: null,
      lineItems: [
        { description: "Structural Steel Materials", quantity: "50 tons", rate: "$1,800", amount: "$90,000" },
        { description: "Welding & Assembly", quantity: "120 hrs", rate: "$95", amount: "$11,400" },
        { description: "Engineering Services", quantity: "40 hrs", rate: "$150", amount: "$6,000" },
        { description: "Project Management", quantity: "1", rate: "$2,500", amount: "$2,500" }
      ]
    },
    {
      id: "INV-2024-003",
      workOrderId: "WO-2024-002",
      project: "Bridge Support Beams",
      customer: "Metro Construction",
      status: "Draft",
      amount: "$95,800",
      dateIssued: null,
      dateDue: null,
      datePaid: null,
      lineItems: [
        { description: "High-Grade Steel (A992)", quantity: "35 tons", rate: "$2,100", amount: "$73,500" },
        { description: "Precision Machining", quantity: "60 hrs", rate: "$140", amount: "$8,400" },
        { description: "Quality Testing", quantity: "1", rate: "$1,200", amount: "$1,200" }
      ]
    }
  ])

  const [selectedInvoice, setSelectedInvoice] = useState(null)
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

  const handleViewDetails = (invoice) => {
    setSelectedInvoice(invoice)
    setIsDetailDialogOpen(true)
  }

  const calculateSubtotal = (lineItems) => {
    return lineItems.reduce((sum, item) => {
      const amount = parseFloat(item.amount.replace('$', '').replace(',', ''))
      return sum + amount
    }, 0)
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
                  <TableHead>Work Order</TableHead>
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
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.workOrderId}</TableCell>
                    <TableCell>{invoice.customer}</TableCell>
                    <TableCell>{invoice.project}</TableCell>
                    <TableCell className="font-medium">{invoice.amount}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{invoice.dateIssued || "—"}</TableCell>
                    <TableCell>{invoice.dateDue || "—"}</TableCell>
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
                    <p>{selectedInvoice.customer}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Project</Label>
                    <p>{selectedInvoice.project}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge className={getStatusColor(selectedInvoice.status)}>
                      {selectedInvoice.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Total Amount</Label>
                    <p className="font-bold text-lg">{selectedInvoice.amount}</p>
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
                      {selectedInvoice.lineItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.description}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.rate}</TableCell>
                          <TableCell className="font-medium">{item.amount}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="border-t-2">
                        <TableCell colSpan={3} className="text-right font-semibold">
                          Subtotal:
                        </TableCell>
                        <TableCell className="font-bold">
                          ${calculateSubtotal(selectedInvoice.lineItems).toLocaleString()}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-semibold">
                          Tax (8.5%):
                        </TableCell>
                        <TableCell className="font-bold">
                          ${(calculateSubtotal(selectedInvoice.lineItems) * 0.085).toLocaleString()}
                        </TableCell>
                      </TableRow>
                      <TableRow className="border-t">
                        <TableCell colSpan={3} className="text-right font-bold text-lg">
                          Total:
                        </TableCell>
                        <TableCell className="font-bold text-lg">
                          {selectedInvoice.amount}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {selectedInvoice.status === "Paid" && selectedInvoice.datePaid && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-green-800 font-medium">
                      ✓ Payment received on {selectedInvoice.datePaid}
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
