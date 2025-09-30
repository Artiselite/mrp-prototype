"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Edit, Download, Upload, MessageSquare, Clock, User, FileText, CheckCircle, XCircle, AlertTriangle, Eye, Link as LinkIcon } from 'lucide-react'
import Link from "next/link"
import { useDatabaseContext } from '@/components/database-provider'
import CADToBOQConverter from '@/components/cad-to-boq-converter'
import type { EngineeringDrawing, Quotation } from '@/lib/types'

export default function DrawingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [drawingId, setDrawingId] = useState<string | null>(null)
  const { 
    engineeringDrawings: drawings = [], 
    quotations = [], 
    isInitialized,
    updateQuotation
  } = useDatabaseContext()

  const [drawing, setDrawing] = useState<EngineeringDrawing | null>(null)
  const [quotation, setQuotation] = useState<Quotation | null>(null)
  const [loading, setLoading] = useState(true)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [showCommentDialog, setShowCommentDialog] = useState(false)
  const [selectedApproval, setSelectedApproval] = useState<any>(null)
  const [showCADConverter, setShowCADConverter] = useState(false)

  // Resolve the async params
  useEffect(() => {
    params.then(({ id }) => {
      setDrawingId(id)
    })
  }, [params])

  useEffect(() => {
    if (isInitialized && drawings && quotations && drawingId) {
      const foundDrawing = drawings.find((d: any) => d.id === drawingId)
      setDrawing(foundDrawing || null)

      if (foundDrawing && foundDrawing.projectId) {
        // The projectId stores the quotation ID (from our create page implementation)
        const foundQuotation = quotations.find((q: any) => q.id === foundDrawing.projectId)
        setQuotation(foundQuotation || null)
      }

      setLoading(false)
    }
  }, [isInitialized, drawings, quotations, drawingId])

  // Approval workflow handlers
  const handleSubmitForApproval = () => {
    if (drawing) {
      // Placeholder function - in real app, this would call the database function
      console.log("Submit for approval:", drawing.id, "Current User")
    }
  }

  const handleApproval = (approvalId: string, approved: boolean, comments?: string) => {
    if (drawing) {
      if (approved) {
        // Placeholder function - in real app, this would call the database function
        console.log("Approve drawing:", drawing.id, approvalId, "Current User", comments)
        
        // Check if this approval completes all approvals
        const currentApproval = drawing.approvals?.find(a => a.id === approvalId)
        if (currentApproval) {
          const updatedApprovals = drawing.approvals?.map(a => 
            a.id === approvalId ? { ...a, status: "Approved" as const } : a
          ) || []
          
          // Check if all approvals are now complete
          const allApproved = updatedApprovals.every(a => a.status === "Approved")
          
          if (allApproved && drawing.projectId) {
            // Update the quotation's engineering status to "Drawing Complete"
            updateQuotation(drawing.projectId, {
              engineeringStatus: "Drawing Complete",
              updatedAt: new Date().toISOString()
            })
          }
        }
      } else {
        // Placeholder function - in real app, this would call the database function
        console.log("Reject drawing:", drawing.id, approvalId, "Current User", comments || "Rejected")
      }
    }
    setShowApprovalDialog(false)
    setSelectedApproval(null)
  }

  const handleAddComment = (content: string, priority: "Low" | "Medium" | "High" | "Critical", commentType: string) => {
    if (drawing) {
      // Placeholder function - in real app, this would call the database function
      console.log("Add comment:", drawing.id, {
        authorName: "Current User", // In real app, get from auth context
        authorRole: "Engineer",
        commentType: commentType as any,
        content,
        priority,
        status: "Open",
      })
    }
    setShowCommentDialog(false)
  }

  const handleResolveComment = (commentId: string) => {
    if (drawing) {
      // Placeholder function - in real app, this would call the database function
      console.log("Resolve comment:", drawing.id, commentId, "Current User")
    }
  }

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

  if (loading || !drawingId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Loading drawing...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!drawing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <Link href="/engineering">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Engineering
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Drawing Not Found</h2>
              <p className="text-gray-500">The drawing you're looking for doesn't exist or has been deleted.</p>
            </div>
          </div>
        </main>
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
              <Link href="/engineering">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Engineering
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{drawing.drawingNumber}</h1>
                  <Badge className={getStatusColor(drawing.status)}>
                    {drawing.status}
                  </Badge>
                  <Badge variant="outline">{drawing.revision}</Badge>
                  {quotation && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      <LinkIcon className="w-3 h-3 mr-1" />
                      Linked to {quotation.quotationNumber}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{drawing.title}</p>
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
              {drawing?.approvalWorkflowStage === "Not Submitted" || drawing?.status === "Draft" ? (
                <Button onClick={handleSubmitForApproval}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit for Approval
                </Button>
              ) : drawing?.approvalWorkflowStage === "Under Review" ? (
                <Button variant="outline" disabled>
                  <Clock className="w-4 h-4 mr-2" />
                  Under Review
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {drawing?.approvalWorkflowStage}
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
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="revisions">Revisions</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
                <TabsTrigger value="approvals">Approvals</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Quotation Link */}
                {quotation && (
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-green-900 flex items-center gap-2">
                        <LinkIcon className="w-5 h-5" />
                        Source Quotation
                      </CardTitle>
                      <CardDescription className="text-green-700">
                        This drawing was created from the following quotation
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs font-medium text-green-600">QUOTATION NUMBER</Label>
                          <p className="text-sm font-medium text-green-900">{quotation.quotationNumber}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-green-600">STATUS</Label>
                          <Badge className="bg-green-100 text-green-800">{quotation.status}</Badge>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-green-600">CUSTOMER</Label>
                          <p className="text-sm font-medium text-green-900">{quotation.customerName}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-green-600">PROJECT</Label>
                          <p className="text-sm font-medium text-green-900">{quotation.title}</p>
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs font-medium text-green-600">DESCRIPTION</Label>
                          <p className="text-sm text-green-800">{quotation.description}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-green-600">TOTAL VALUE</Label>
                          <p className="text-lg font-bold text-green-900">RM{quotation.total.toLocaleString()}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-green-600">CREATED</Label>
                          <p className="text-sm text-green-800">{new Date(quotation.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Link href={`/quotations/${quotation.id}`}>
                          <Button variant="outline" size="sm" className="border-green-300 text-green-700 hover:bg-green-100">
                            <FileText className="w-4 h-4 mr-2" />
                            View Quotation Details
                          </Button>
                        </Link>
                        <Link href={`/quotations/${quotation.id}/edit`}>
                          <Button variant="outline" size="sm" className="border-green-300 text-green-700 hover:bg-green-100">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Quotation
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )}

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
                          <p className="mt-1">Technical Drawing</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Material Specifications</Label>
                          <p className="mt-1">{drawing.specifications || 'Not specified'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Assigned Engineer</Label>
                          <p className="mt-1">{drawing.drawnBy || 'Not assigned'}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Priority Level</Label>
                          <div className="flex items-center gap-2 mt-1">
                            {getPriorityIcon("Medium")}
                            <span>Medium</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Created Date</Label>
                          <p className="mt-1">{new Date(drawing.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Status</Label>
                          <div className="mt-1">
                            <Badge className={getStatusColor(drawing.status)}>
                              {drawing.status}
                            </Badge>
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
                    <div className="space-y-4">
                      {drawing?.changeHistory && drawing.changeHistory.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Change #</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Proposed By</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Impact</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {drawing.changeHistory.map((change) => (
                              <TableRow key={change.id}>
                                <TableCell className="font-medium">{change.changeNumber}</TableCell>
                                <TableCell>{new Date(change.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>{change.proposedBy}</TableCell>
                                <TableCell className="max-w-xs truncate">{change.description}</TableCell>
                                <TableCell>
                                  <Badge className={getStatusColor(change.status)}>
                                    {change.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="max-w-xs truncate">{change.impact}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No revision history</p>
                          <p className="text-sm">This is the initial version of the drawing</p>
                        </div>
                      )}

                      {/* Current Revision Info */}
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-blue-900">Current Revision</h4>
                              <p className="text-sm text-blue-700">
                                {drawing?.revision} • Last updated {drawing ? new Date(drawing.updatedAt).toLocaleDateString() : ''}
                              </p>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
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
                      <Button onClick={() => setShowCommentDialog(true)}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Add Comment
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {drawing?.comments?.map((comment) => (
                        <div key={comment.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">{comment.authorName}</span>
                              <span className="text-sm text-gray-500">({comment.authorRole})</span>
                              {getPriorityIcon(comment.priority)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(comment.status)}>
                                {comment.status}
                              </Badge>
                              {comment.status === "Open" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleResolveComment(comment.id)}
                                >
                                  Resolve
                                </Button>
                              )}
                              <span className="text-sm text-gray-500">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
                          {comment.resolvedAt && comment.resolvedBy && (
                            <p className="text-sm text-green-600 mt-2">
                              Resolved by {comment.resolvedBy} on {new Date(comment.resolvedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                      {(!drawing?.comments || drawing.comments.length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No comments yet</p>
                          <p className="text-sm">Add comments to start discussions about this drawing</p>
                        </div>
                      )}
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
                      {drawing?.approvals?.map((approval) => (
                        <div key={approval.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              {approval.status === "Approved" && <CheckCircle className="w-5 h-5 text-green-500" />}
                              {approval.status === "Pending" && <Clock className="w-5 h-5 text-yellow-500" />}
                              {approval.status === "Rejected" && <XCircle className="w-5 h-5 text-red-500" />}
                              <div>
                                <p className="font-medium">{approval.role}</p>
                                <p className="text-sm text-gray-500">{approval.approverName}</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(approval.status)}>
                                {approval.status}
                              </Badge>
                              {approval.status === "Pending" && (
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedApproval(approval)
                                      setShowApprovalDialog(true)
                                    }}
                                  >
                                    Review
                                  </Button>
                                </div>
                              )}
                            </div>
                            {(approval.approvedAt || approval.rejectedAt) && (
                              <p className="text-sm text-gray-500 mt-1">
                                {new Date(approval.approvedAt || approval.rejectedAt || "").toLocaleDateString()}
                              </p>
                            )}
                            {approval.comments && (
                              <p className="text-sm text-gray-600 mt-1">{approval.comments}</p>
                            )}
                          </div>
                        </div>
                      ))}
                      {(!drawing?.approvals || drawing.approvals.length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No approval workflow started</p>
                          <p className="text-sm">Submit drawing for approval to begin the review process</p>
                        </div>
                      )}
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
                {quotation && (
                  <div>
                    <Label className="text-xs font-medium text-gray-500">LINKED QUOTATION</Label>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{quotation.quotationNumber}</p>
                      <Link href={`/quotations/${quotation.id}`}>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-green-600 hover:text-green-800">
                          <LinkIcon className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
                <div>
                  <Label className="text-xs font-medium text-gray-500">DRAWING NUMBER</Label>
                  <p className="text-sm">{drawing.drawingNumber}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">CREATED</Label>
                  <p className="text-sm">{new Date(drawing.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">UPDATED</Label>
                  <p className="text-sm">{new Date(drawing.updatedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">CURRENT REVISION</Label>
                  <p className="text-sm">{drawing.revision}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">STATUS</Label>
                  <Badge className={getStatusColor(drawing.status)}>{drawing.status}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Related Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Related Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quotation && (
                  <Link href={`/quotations/${quotation.id}`}>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-green-600 hover:text-green-800 hover:bg-green-50">
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Quotation ({quotation.quotationNumber})
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Technical Specifications
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Material Requirements
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Quality Standards
                </Button>
                {quotation && quotation.boqId && (
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Bill of Quantities
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Request Review
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export Package
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => setShowCADConverter(true)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Generate BOQ from CAD
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Drawing</DialogTitle>
            <DialogDescription>
              Review and approve or reject this drawing for {selectedApproval?.role}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Drawing: {drawing?.drawingNumber}</Label>
              <p className="text-sm text-gray-600">{drawing?.title}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Approval Role: {selectedApproval?.role}</Label>
            </div>
            <div>
              <Label htmlFor="approval-comments">Comments</Label>
              <Textarea
                id="approval-comments"
                placeholder="Add your review comments..."
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  const comments = (document.getElementById('approval-comments') as HTMLTextAreaElement)?.value
                  handleApproval(selectedApproval?.id, false, comments)
                }}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => {
                  const comments = (document.getElementById('approval-comments') as HTMLTextAreaElement)?.value
                  handleApproval(selectedApproval?.id, true, comments)
                }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comment Dialog */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
            <DialogDescription>
              Add a comment or review feedback for this drawing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="comment-content">Comment</Label>
              <Textarea
                id="comment-content"
                placeholder="Enter your comment..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="comment-priority">Priority</Label>
                <select id="comment-priority" className="w-full p-2 border rounded">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <Label htmlFor="comment-type">Comment Type</Label>
                <select id="comment-type" className="w-full p-2 border rounded">
                  <option value="General">General</option>
                  <option value="Technical Review">Technical Review</option>
                  <option value="Quality Review">Quality Review</option>
                  <option value="Production Review">Production Review</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCommentDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const content = (document.getElementById('comment-content') as HTMLTextAreaElement)?.value
                  const priority = (document.getElementById('comment-priority') as HTMLSelectElement)?.value as "Low" | "Medium" | "High" | "Critical"
                  const commentType = (document.getElementById('comment-type') as HTMLSelectElement)?.value
                  if (content) {
                    handleAddComment(content, priority, commentType)
                  }
                }}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Add Comment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CAD to BOQ Converter Modal */}
      {showCADConverter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <CADToBOQConverter
                onBOQGenerated={(boqData) => {
                  console.log('BOQ generated:', boqData)
                  setShowCADConverter(false)
                  // You could navigate to BOQ creation page here
                }}
                onClose={() => setShowCADConverter(false)}
                initialDrawingId={drawingId || undefined}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
