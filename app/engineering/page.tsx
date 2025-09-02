"use client"


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye, Edit, Download, Clock, FileText, Calculator } from 'lucide-react'
import Link from "next/link"

import { useDatabaseContext } from "@/components/database-provider"

export default function EngineeringPage() {
  const { useEngineeringDrawings, useBillsOfQuantities, useBillsOfMaterials } = useDatabaseContext()
  const { drawings } = useEngineeringDrawings()
  const { boqs } = useBillsOfQuantities()
  const { boms } = useBillsOfMaterials()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Released": return "bg-green-100 text-green-800"
      case "Approved": return "bg-blue-100 text-blue-800"
      case "Under Review": return "bg-yellow-100 text-yellow-800"
      case "Draft": return "bg-gray-100 text-gray-800"
      case "On Hold": return "bg-orange-100 text-orange-800"
      case "Completed": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const stats = {
    totalDrawings: drawings.length,
    releasedDrawings: drawings.filter(d => d.status === "Released").length,
    draftDrawings: drawings.filter(d => d.status === "Draft").length,
    linkedBOMs: boqs.filter(b => b.engineeringDrawingId).length,
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
              <p className="text-sm text-gray-600">Technical drawings and documentation for manufacturing</p>
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
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Drawings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDrawings}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Released</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.releasedDrawings}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Draft</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.draftDrawings}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Linked BOMs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.linkedBOMs}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Calculator className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Engineering Drawings */}
        <Card>
          <CardHeader>
            <CardTitle>Engineering Drawings</CardTitle>
            <CardDescription>
              Technical drawings and documentation with linked BOMs and BOQs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Drawing Number</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Drawn By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Linked BOMs</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drawings.map((drawing) => {
                  const linkedBOMs = boms.filter(bom => bom.engineeringDrawingId === drawing.id)
                  const linkedBOQs = boqs.filter(boq => boq.engineeringDrawingId === drawing.id)

                  return (
                    <TableRow key={drawing.id}>
                      <TableCell className="font-medium">{drawing.drawingNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{drawing.title}</p>
                          <p className="text-sm text-gray-500">{drawing.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>{drawing.version}</TableCell>
                      <TableCell>{drawing.drawnBy}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(drawing.status)}>
                          {drawing.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {linkedBOMs.length > 0 ? (
                            linkedBOMs.map(bom => (
                              <Link key={bom.id} href={`/bom/${bom.id}`}>
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 hover:bg-green-100">
                                  {bom.bomNumber}
                                </Badge>
                              </Link>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400">No BOMs</span>
                          )}
                          {linkedBOQs.length > 0 && (
                            <div className="text-xs text-blue-600">
                              {linkedBOQs.length} BOQ{linkedBOQs.length > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </TableCell>
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
                          <Link href={`/boq/create?drawingId=${drawing.id}`}>
                            <Button variant="ghost" size="sm" title="Create BOQ">
                              <Calculator className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" title="Download Drawing">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
