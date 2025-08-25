"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Download, Send, FileText } from 'lucide-react'
import Link from "next/link"

export default function QuotationDetailPage() {
  const [quotation] = useState({
    id: "QUO-2024-001",
    customerId: "CUST-001",
    customer: "ABC Steel Works",
    title: "Industrial Warehouse Frame",
    description: "Design and fabrication of structural steel frame for 50,000 sq ft industrial warehouse facility. Includes main structural beams, columns, bracing, and connection details.",
    status: "Approved",
    priority: "High",
    createdDate: "2024-01-10",
    validUntil: "2024-02-15",
    totalAmount: 125000,
    items: [
      {
        id: "1",
        description: "W12x65 Beams",
        quantity: 8,
        unit: "pieces",
        unitPrice: 2450,
        totalPrice: 19600,
        steelGrade: "A36",
        specifications: "20 ft length, structural steel"
      },
      {
        id: "2",
        description: "W8x31 Columns",
        quantity: 12,
        unit: "pieces",
        unitPrice: 1280,
        totalPrice: 15360,
        steelGrade: "A36",
        specifications: "16 ft length, structural steel"
      }
    ],
    notes: "Rush order - customer needs by end of month"
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
      case 'Draft': return 'bg-gray-100 text-gray-800'
      case 'Sent': return 'bg-blue-100 text-blue-800'
      case 'Under Review': return 'bg-yellow-100 text-yellow-800'
      case 'Approved': return 'bg-green-100 text-green-800'
      case 'Rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/quotations">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Quotations
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{quotation.title}</h1>
              <p className="text-gray-600">Quotation {quotation.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(quotation.status)}>
              {quotation.status}
            </Badge>
            <Link href={`/quotations/${quotation.id}/edit`}>
              <Button>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-gray-500">CUSTOMER</Label>
                    <p className="text-sm font-medium">{quotation.customer}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-500">PROJECT</Label>
                    <p className="text-sm font-medium">{quotation.title}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-500">PRIORITY</Label>
                    <p className="text-sm font-medium">{quotation.priority}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-500">STATUS</Label>
                    <Badge className={getStatusColor(quotation.status)}>
                      {quotation.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">DESCRIPTION</Label>
                  <p className="text-sm text-gray-700 mt-1">{quotation.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader>
                <CardTitle>Line Items</CardTitle>
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
                        <TableCell className="font-medium">{item.category}</TableCell>
                        <TableCell>{item.description}</TableCell>
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

            {/* Tabs */}
            <Tabs defaultValue="revisions" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="revisions">Revisions</TabsTrigger>
                <TabsTrigger value="communications">Communications</TabsTrigger>
                <TabsTrigger value="attachments">Attachments</TabsTrigger>
              </TabsList>
              
              <TabsContent value="revisions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Revision History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {revisions.map((rev) => (
                        <div key={rev.revision} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{rev.revision}</Badge>
                              <span className="font-medium">{rev.status}</span>
                            </div>
                            <span className="text-sm text-gray-500">{rev.date}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">Author: {rev.author}</p>
                          <p className="text-gray-700">{rev.changes}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="communications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Communication History</CardTitle>
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

              <TabsContent value="attachments" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Attachments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No attachments uploaded yet</p>
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
                  <p className="text-sm">{quotation.createdDate}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">VALID UNTIL</Label>
                  <p className="text-sm">{quotation.validUntil}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">TOTAL VALUE</Label>
                  <p className="text-lg font-bold">${quotation.totalAmount.toLocaleString()}</p>
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
