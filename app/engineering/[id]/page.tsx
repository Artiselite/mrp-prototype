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
import { ArrowLeft, Edit, Download, Upload, MessageSquare, Clock, User, FileText, CheckCircle, XCircle, AlertTriangle, Eye } from 'lucide-react'
import Link from "next/link"

export default function DrawingDetailPage({ params }: { params: { id: string } }) {
  const [drawing] = useState({
    id: "DWG-2024-001",
    quotationId: "QUO-2024-001",
    customer: "ABC Steel Works",
    project: "Industrial Warehouse Frame",
    drawingType: "Structural Assembly",
    revision: "Rev C",
    status: "In Progress",
    engineer: "John Smith",
    dateCreated: "2024-01-11",
    dueDate: "2024-01-16",
    specifications: "A36 Steel, Welded Connections, AISC Standards",
    priority: "High",
    progress: 75
  })

  const [revisionHistory] = useState([
    {
      revision: "Rev C",
      date: "2024-01-14",
      engineer: "John Smith",
      changes: "Updated connection details for beam-to-column joints",
      status: "Current",
      files: ["DWG-2024-001-RevC.dwg", "DWG-2024-001-RevC.pdf"]
    },
    {
      revision: "Rev B",
      date: "2024-01-13",
      engineer: "John Smith",
      changes: "Revised material specifications, added welding symbols",
      status: "Superseded",
      files: ["DWG-2024-001-RevB.dwg", "DWG-2024-001-RevB.pdf"]
    },
    {
      revision: "Rev A",
      date: "2024-01-11",
      engineer: "John Smith",
      changes: "Initial drawing creation",
      status: "Superseded",
      files: ["DWG-2024-001-RevA.dwg"]
    }
  ])

  const [comments] = useState([
    {
      id: 1,
      author: "Mike Johnson",
      role: "Production Supervisor",
      date: "2024-01-14 10:30",
      comment: "The beam connection detail in section A-A needs clarification for field welding access.",
      status: "Open",
      priority: "Medium"
    },
    {
      id: 2,
      author: "Sarah Davis",
      role: "Quality Engineer",
      date: "2024-01-13 14:15",
      comment: "Please add inspection points for critical welds as per AWS D1.1 requirements.",
      status: "Resolved",
      priority: "High"
    },
    {
      id: 3,
      author: "Tom Wilson",
      role: "Fabrication Manager",
      date: "2024-01-12 09:45",
      comment: "Material list looks good. Confirm delivery schedule with procurement.",
      status: "Resolved",
      priority: "Low"
    }
  ])

  const [approvals] = useState([
    {
      role: "Lead Engineer",
      approver: "John Smith",
      status: "Approved",
      date: "2024-01-14 16:00",
      comments: "Technical review complete"
    },
    {
      role: "Production Manager",
      approver: "Mike Johnson",
      status: "Pending",
      date: null,
      comments: "Awaiting production review"
    },
    {
      role: "Quality Manager",
      approver: "Sarah Davis",
      status: "Pending",
      date: null,
      comments: "Quality standards review pending"
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-800"
      case "In Progress": return "bg-blue-100 text-blue-800"
      case "Pending": return "bg-yellow-100 text-yellow-800"
      case "Rejected": return "bg-red-100 text-red-800"
      case "Current": return "bg-blue-100 text-blue-800"
      case "Superseded": return "bg-gray-100 text-gray-800"
      case "Open": return "bg-red-100 text-red-800"
      case "Resolved": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "High": return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "Medium": return <Clock className="w-4 h-4 text-yellow-500" />
      case "Low": return <CheckCircle className="w-4 h-4 text-green-500" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/engineering">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Engineering
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{drawing.id}</h1>
                  <Badge className={getStatusColor(drawing.status)}>
                    {drawing.status}
                  </Badge>
                  <Badge variant="outline">{drawing.revision}</Badge>
                </div>
                <p className="text-sm text-gray-600">{drawing.project} - {drawing.customer}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit Drawing
              </Button>
              <Button>
                <CheckCircle className="w-4 h-4 mr-2" />
                Submit for Approval
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="col-span-3">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="revisions">Revisions</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
                <TabsTrigger value="approvals">Approvals</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Drawing Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Drawing Preview</CardTitle>
                    <CardDescription>Current revision: {drawing.revision}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">Drawing Preview</p>
                        <p className="text-sm text-gray-400">{drawing.id} - {drawing.revision}</p>
                        <Button variant="outline" className="mt-4">
                          <Eye className="w-4 h-4 mr-2" />
                          Open in Viewer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Technical Specifications */}
                <Card>
                  <CardHeader>
                    <CardTitle>Technical Specifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Drawing Type</Label>
                          <p className="mt-1">{drawing.drawingType}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Material Specifications</Label>
                          <p className="mt-1">{drawing.specifications}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Assigned Engineer</Label>
                          <p className="mt-1">{drawing.engineer}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Priority Level</Label>
                          <div className="flex items-center gap-2 mt-1">
                            {getPriorityIcon(drawing.priority)}
                            <span>{drawing.priority}</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Due Date</Label>
                          <p className="mt-1">{drawing.dueDate}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Progress</Label>
                          <div className="mt-1">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${drawing.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{drawing.progress}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="revisions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revision History</CardTitle>
                    <CardDescription>Complete history of drawing revisions and changes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Revision</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Engineer</TableHead>
                          <TableHead>Changes</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Files</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {revisionHistory.map((revision, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{revision.revision}</TableCell>
                            <TableCell>{revision.date}</TableCell>
                            <TableCell>{revision.engineer}</TableCell>
                            <TableCell className="max-w-xs truncate">{revision.changes}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(revision.status)}>
                                {revision.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {revision.files.map((file, fileIndex) => (
                                  <Button key={fileIndex} variant="ghost" size="sm">
                                    <Download className="w-3 h-3" />
                                  </Button>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comments" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Comments & Reviews</CardTitle>
                        <CardDescription>Feedback and discussions from team members</CardDescription>
                      </div>
                      <Button>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Add Comment
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">{comment.author}</span>
                              <span className="text-sm text-gray-500">({comment.role})</span>
                              {getPriorityIcon(comment.priority)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(comment.status)}>
                                {comment.status}
                              </Badge>
                              <span className="text-sm text-gray-500">{comment.date}</span>
                            </div>
                          </div>
                          <p className="text-gray-700">{comment.comment}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="approvals" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Approval Workflow</CardTitle>
                    <CardDescription>Drawing approval status from different departments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {approvals.map((approval, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              {approval.status === "Approved" && <CheckCircle className="w-5 h-5 text-green-500" />}
                              {approval.status === "Pending" && <Clock className="w-5 h-5 text-yellow-500" />}
                              {approval.status === "Rejected" && <XCircle className="w-5 h-5 text-red-500" />}
                              <div>
                                <p className="font-medium">{approval.role}</p>
                                <p className="text-sm text-gray-500">{approval.approver}</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(approval.status)}>
                              {approval.status}
                            </Badge>
                            {approval.date && (
                              <p className="text-sm text-gray-500 mt-1">{approval.date}</p>
                            )}
                            {approval.comments && (
                              <p className="text-sm text-gray-600 mt-1">{approval.comments}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="files" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Drawing Files</CardTitle>
                        <CardDescription>All files associated with this drawing</CardDescription>
                      </div>
                      <Button>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload File
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { name: "DWG-2024-001-RevC.dwg", size: "2.4 MB", type: "CAD File", date: "2024-01-14" },
                        { name: "DWG-2024-001-RevC.pdf", size: "1.8 MB", type: "PDF", date: "2024-01-14" },
                        { name: "Material_Specs.pdf", size: "0.5 MB", type: "Specification", date: "2024-01-11" },
                        { name: "Welding_Details.dwg", size: "1.2 MB", type: "Detail Drawing", date: "2024-01-13" }
                      ].map((file, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <FileText className="w-5 h-5 text-gray-500" />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{file.name}</p>
                              <p className="text-xs text-gray-500">{file.type} • {file.size}</p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">{file.date}</span>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
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
                  <Label className="text-xs font-medium text-gray-500">QUOTATION</Label>
                  <p className="text-sm">{drawing.quotationId}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">CREATED</Label>
                  <p className="text-sm">{drawing.dateCreated}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">DUE DATE</Label>
                  <p className="text-sm">{drawing.dueDate}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">CURRENT REVISION</Label>
                  <p className="text-sm">{drawing.revision}</p>
                </div>
              </CardContent>
            </Card>

            {/* Related Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Related Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Source Quotation
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Material Specifications
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Welding Procedures
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Quality Standards
                </Button>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Edit className="w-4 h-4 mr-2" />
                  Create New Revision
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Request Review
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export Package
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Generate BOM
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
