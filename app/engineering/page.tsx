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
import { Plus, Search, Eye, Edit, FileText, Upload, Download } from 'lucide-react'
import Link from "next/link"

export default function EngineeringPage() {
  const [drawings] = useState([
    {
      id: "DWG-2024-001",
      quotationId: "QUO-2024-001",
      customer: "ABC Steel Works",
      project: "Industrial Warehouse Frame",
      drawingType: "Structural Assembly",
      revision: "Rev A",
      status: "In Progress",
      engineer: "John Smith",
      dateCreated: "2024-01-11",
      dueDate: "2024-01-16",
      specifications: "A36 Steel, Welded Connections"
    },
    {
      id: "DWG-2024-002",
      quotationId: "QUO-2024-002",
      customer: "Metro Construction",
      project: "Bridge Support Beams",
      drawingType: "Detail Drawing",
      revision: "Rev B",
      status: "Approved",
      engineer: "Sarah Johnson",
      dateCreated: "2024-01-09",
      dueDate: "2024-01-14",
      specifications: "A992 Grade 50, Bolted Connections"
    },
    {
      id: "DWG-2024-003",
      quotationId: "QUO-2024-003",
      customer: "Industrial Corp",
      project: "Custom Fabricated Brackets",
      drawingType: "Shop Drawing",
      revision: "Rev A",
      status: "Review",
      engineer: "Mike Davis",
      dateCreated: "2024-01-13",
      dueDate: "2024-01-19",
      specifications: "A572 Grade 50, Custom Machining"
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-800"
      case "In Progress": return "bg-blue-100 text-blue-800"
      case "Review": return "bg-yellow-100 text-yellow-800"
      case "Draft": return "bg-gray-100 text-gray-800"
      case "Rejected": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
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
              <h1 className="text-2xl font-bold text-gray-900">Engineering Drawings</h1>
              <p className="text-sm text-gray-600">Manage technical drawings and specifications</p>
            </div>
            <Link href="/engineering/create">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Drawing
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
                  <Input placeholder="Search drawings..." className="pl-10" />
                </div>
              </div>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="assembly">Assembly</SelectItem>
                  <SelectItem value="detail">Detail</SelectItem>
                  <SelectItem value="shop">Shop</SelectItem>
                  <SelectItem value="fabrication">Fabrication</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Drawings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Engineering Drawings</CardTitle>
            <CardDescription>
              Technical drawings and specifications for all projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Drawing ID</TableHead>
                  <TableHead>Quotation</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Revision</TableHead>
                  <TableHead>Engineer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drawings.map((drawing) => (
                  <TableRow key={drawing.id}>
                    <TableCell className="font-medium">{drawing.id}</TableCell>
                    <TableCell>{drawing.quotationId}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{drawing.project}</p>
                        <p className="text-sm text-gray-500">{drawing.customer}</p>
                      </div>
                    </TableCell>
                    <TableCell>{drawing.drawingType}</TableCell>
                    <TableCell>{drawing.revision}</TableCell>
                    <TableCell>{drawing.engineer}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(drawing.status)}>
                        {drawing.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{drawing.dueDate}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/engineering/${drawing.id}`}>
                          <Button variant="ghost" size="sm" title="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/engineering/${drawing.id}/edit`}>
                          <Button variant="ghost" size="sm" title="Edit Drawing">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" title="Download Files">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
