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
import { Plus, Search, Eye, Edit, FileText, Package, Calculator } from 'lucide-react'
import Link from "next/link"

export default function BOMPage() {
  const [boms] = useState([
    {
      id: "BOM-2024-001",
      drawingId: "DWG-2024-001",
      project: "Industrial Warehouse Frame",
      customer: "ABC Steel Works",
      status: "Approved",
      totalCost: "$89,450",
      materialCount: 15,
      dateCreated: "2024-01-12",
      dateApproved: "2024-01-15",
      engineer: "John Smith"
    },
    {
      id: "BOM-2024-002",
      drawingId: "DWG-2024-002",
      project: "Bridge Support Beams",
      customer: "Metro Construction",
      status: "Review",
      totalCost: "$67,200",
      materialCount: 12,
      dateCreated: "2024-01-10",
      dateApproved: null,
      engineer: "Sarah Johnson"
    },
    {
      id: "BOM-2024-003",
      drawingId: "DWG-2024-003",
      project: "Custom Fabricated Brackets",
      customer: "Industrial Corp",
      status: "Draft",
      totalCost: "$12,800",
      materialCount: 8,
      dateCreated: "2024-01-14",
      dateApproved: null,
      engineer: "Mike Davis"
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-800"
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
              <h1 className="text-2xl font-bold text-gray-900">Bill of Materials</h1>
              <p className="text-sm text-gray-600">Manage material requirements and costing</p>
            </div>
            <Link href="/bom/create">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New BOM
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
                  <Input placeholder="Search BOMs..." className="pl-10" />
                </div>
              </div>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by engineer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Engineers</SelectItem>
                  <SelectItem value="john">John Smith</SelectItem>
                  <SelectItem value="sarah">Sarah Johnson</SelectItem>
                  <SelectItem value="mike">Mike Davis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* BOMs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Bill of Materials</CardTitle>
            <CardDescription>
              Material requirements and cost analysis for all projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>BOM ID</TableHead>
                  <TableHead>Drawing</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Materials</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Engineer</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {boms.map((bom) => (
                  <TableRow key={bom.id}>
                    <TableCell className="font-medium">{bom.id}</TableCell>
                    <TableCell>{bom.drawingId}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{bom.project}</p>
                        <p className="text-sm text-gray-500">Created: {bom.dateCreated}</p>
                      </div>
                    </TableCell>
                    <TableCell>{bom.customer}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-500" />
                        {bom.materialCount} items
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{bom.totalCost}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(bom.status)}>
                        {bom.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{bom.engineer}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/bom/${bom.id}`}>
                          <Button variant="ghost" size="sm" title="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/bom/${bom.id}/edit`}>
                          <Button variant="ghost" size="sm" title="Edit BOM">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" title="Cost Analysis">
                          <Calculator className="w-4 h-4" />
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
