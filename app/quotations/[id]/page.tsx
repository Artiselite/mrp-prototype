"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Edit, Download, Send, FileText, Clock, User, MessageSquare, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import Link from "next/link"

export default function QuotationDetailPage({ params }: { params: { id: string } }) {
  const [quotation] = useState({
    id: "QUO-2024-001",
    customer: "ABC Steel Works",
    contactPerson: "John Anderson",
    email: "j.anderson@abcsteel.com",
    phone: "(555) 123-4567",
    project: "Industrial Warehouse Frame",
    description: "Design and fabrication of structural steel frame for 50,000 sq ft industrial warehouse facility. Includes main structural beams, columns, bracing, and connection details.",
    status: "Approved",
    value: "$125,000",
    dateCreated: "2024-01-10",
    dueDate: "2024-01-15",
    validUntil: "2024-02-15",
    steelType: "A36 Structural Steel",
    quantity: "50 tons",
    estimatedDuration: "6 weeks",
    priority: "High"
  })

  const [revisions] = useState([
    {
      revision: "Rev C",
      date: "2024-01-14",
      author: "Sales Team",
      changes: "Updated pricing based on current steel market rates",
      status: "Current"
    },
    {
      revision: "Rev B",
      date: "2024-01-12",
      author: "Engineering",
      changes: "Revised material specifications and quantities",
      status: "Superseded"
    },
    {
      revision: "Rev A",
      date: "2024-01-10",
      author: "Sales Team",
      changes: "Initial quotation created",
      status: "Superseded"
    }
  ])

  const [communications] = useState([
    {
      id: 1,
      type: "Email",
      from: "Sales Team",
      to: "John Anderson",
      subject: "Updated Quotation - Industrial Warehouse Frame",
      date: "2024-01-14 14:30",
      content: "Please find the updated quotation with revised pricing. All technical specifications remain the same."
    },
    {
      id: 2,
      type: "Phone Call",
      from: "John Anderson",
      to: "Sales Team",
      subject: "Technical Requirements Discussion",
      date: "2024-01-12 10:15",
      content: "Discussed load requirements and connection details. Customer confirmed specifications."
    },
    {
      id: 3,
      type: "Meeting",
      from: "Engineering Team",
      to: "Customer",
      subject: "Site Visit and Requirements Review",
      date: "2024-01-11 09:00",
      content: "On-site meeting to review project requirements and site conditions."
    }
  ])

  const [lineItems] = useState([
    { category: "Structural Steel", description: "W12x65 Beams", quantity: "8 pcs", unit: "20 ft", rate: "$2,450", amount: "$19,600" },
    { category: "Structural Steel", description: "W8x31 Columns", quantity: "12 pcs", unit: "16 ft", rate: "$1,280", amount: "$15,360" },
    { category: "Structural Steel", description: "Angle L4x4x1/2", quantity: "50 pcs", unit: "8 ft", rate: "$85", amount: "$4,250" },
    { category: "Fabrication", description: "Welding Services", quantity: "120 hrs", unit: "hour", rate: "$95", amount: "$11,400" },
    { category: "Services", description: "Engineering Design", quantity: "40 hrs", unit: "hour", rate: "$150", amount: "$6,000" },
    { category: "Services", description: "Project Management", quantity: "1", unit: "project", rate: "$2,500", amount: "$2,500" },
    { category: "Delivery", description: "Transportation & Setup", quantity: "1", unit: "project", rate: "$1,200", amount: "$1,200" }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-800"
      case "Pending": return "bg-yellow-100 text-yellow-800"
      case "Draft": return "bg-gray-100 text-gray-800"
      case "Rejected": return "bg-red-100 text-red-800"
      case "Current": return "bg-blue-100 text-blue-800"
      case "Superseded": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => {
      const amount = parseFloat(item.amount.replace('$', '').replace(',', ''))
      return sum + amount
    }, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.085
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/quotations">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Quotations
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{quotation.id}</h1>
                  <Badge className={getStatusColor(quotation.status)}>
                    {quotation.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{quotation.project} - {quotation.customer}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit Quotation
              </Button>
              {quotation.status === "Approved" && (
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Create Drawing
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
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Line Items</TabsTrigger>
                <TabsTrigger value="revisions">Revisions</TabsTrigger>
                <TabsTrigger value="communications">Communications</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Company</Label>
                          <p className="mt-1 font-medium">{quotation.customer}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Contact Person</Label>
                          <p className="mt-1">{quotation.contactPerson}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Email</Label>
                          <p className="mt-1">{quotation.email}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Phone</Label>
                          <p className="mt-1">{quotation.phone}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Priority Level</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span>{quotation.priority}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Project Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Project Name</Label>
                        <p className="mt-1 font-medium">{quotation.project}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Description</Label>
                        <p className="mt-1 text-gray-700">{quotation.description}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Steel Type</Label>
                          <p className="mt-1">{quotation.steelType}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Estimated Quantity</Label>
                          <p className="mt-1">{quotation.quantity}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Duration</Label>
                          <p className="mt-1">{quotation.estimatedDuration}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pricing Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-medium">${calculateSubtotal().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (8.5%):</span>
                        <span className="font-medium">${calculateTax().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-3">
                        <span>Total:</span>
                        <span>${calculateTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Line Items</CardTitle>
                    <CardDescription>Complete breakdown of materials, labor, and services</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Rate</TableHead>
                          <TableHead>Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lineItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Badge variant="outline">{item.category}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">{item.description}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.unit}</TableCell>
                            <TableCell>{item.rate}</TableCell>
                            <TableCell className="font-medium">{item.amount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="revisions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revision History</CardTitle>
                    <CardDescription>Complete history of quotation changes and updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {revisions.map((revision, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{revision.revision}</span>
                              <Badge className={getStatusColor(revision.status)}>
                                {revision.status}
                              </Badge>
                            </div>
                            <span className="text-sm text-gray-500">{revision.date}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">By: {revision.author}</p>
                          <p className="text-gray-700">{revision.changes}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="communications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Communications Log</CardTitle>
                        <CardDescription>All interactions with the customer</CardDescription>
                      </div>
                      <Button>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Add Communication
                      </Button>
                    </div>
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
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs font-medium text-gray-500">CREATED</Label>
                  <p className="text-sm">{quotation.dateCreated}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">DUE DATE</Label>
                  <p className="text-sm">{quotation.dueDate}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">VALID UNTIL</Label>
                  <p className="text-sm">{quotation.validUntil}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">TOTAL VALUE</Label>
                  <p className="text-lg font-bold">{quotation.value}</p>
                </div>
              </CardContent>
            </Card>

            {/* Status Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Send className="w-4 h-4 mr-2" />
                  Send to Customer
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Edit className="w-4 h-4 mr-2" />
                  Create Revision
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Contract
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export Documents
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
                  Engineering Drawings
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Bill of Materials
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Work Orders
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
