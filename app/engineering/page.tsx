"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Eye, Edit, Download, Clock, FileText, Wrench, Calculator } from 'lucide-react'
import Link from "next/link"

import { useDatabaseContext } from "@/components/database-provider"

export default function EngineeringPage() {
  const { useEngineeringDrawings, useEngineeringProjects, useBillsOfQuantities } = useDatabaseContext()
  const { drawings } = useEngineeringDrawings()
  const { projects } = useEngineeringProjects()
  const { boqs } = useBillsOfQuantities()

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-100 text-red-800"
      case "High": return "bg-orange-100 text-orange-800"
      case "Medium": return "bg-yellow-100 text-yellow-800"
      case "Low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getProjectTypeColor = (type: string) => {
    switch (type) {
      case "Custom Design": return "bg-blue-100 text-blue-800"
      case "Modification": return "bg-purple-100 text-purple-800"
      case "Standard Product": return "bg-green-100 text-green-800"
      case "Prototype": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const stats = {
    activeProjects: projects.filter(p => p.status === "Under Review" || p.status === "Approved").length,
    completedProjects: projects.filter(p => p.status === "Completed").length,
    releasedDrawings: drawings.filter(d => d.status === "Released").length,
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
              <h1 className="text-2xl font-bold text-gray-900">Engineering</h1>
              <p className="text-sm text-gray-600">Engineering related projects and technical drawings</p>
            </div>
            <Link href="/engineering/create">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Project
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Wrench className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Released Drawings</p>
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
                  <p className="text-sm font-medium text-gray-600">Completed Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedProjects}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="drawings">Engineering Drawings</TabsTrigger>
          </TabsList>

          {/* Engineering Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
                <CardDescription>
                  Engineering projects for manufacturing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Number</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Engineer</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.projectNumber}</TableCell>
                        <TableCell>{project.customerName}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{project.title}</p>
                            <p className="text-sm text-gray-500">{project.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{project.assignedEngineer}</TableCell>
                        <TableCell className="text-sm">{new Date(project.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${project.estimatedHours > 0 ? Math.min((project.actualHours / project.estimatedHours) * 100, 100) : 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">
                              {project.actualHours}/{project.estimatedHours}h
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Link href={`/engineering/${project.id}`}>
                              <Button variant="ghost" size="sm" title="View Details">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link href={`/engineering/${project.id}/edit`}>
                              <Button variant="ghost" size="sm" title="Edit Project">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Engineering Drawings Tab */}
          <TabsContent value="drawings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Engineering Drawings</CardTitle>
                <CardDescription>
                  Technical drawings and specifications for projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Drawing Number</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Drawn By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drawings.map((drawing) => (
                      <TableRow key={drawing.id}>
                        <TableCell className="font-medium">{drawing.drawingNumber}</TableCell>
                        <TableCell>{drawing.projectNumber}</TableCell>
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
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
