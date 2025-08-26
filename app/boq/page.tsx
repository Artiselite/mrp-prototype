"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye, Edit, FileText, Calculator, DollarSign, Wrench, TrendingUp } from 'lucide-react'
import Link from "next/link"

import { useDatabaseContext } from "@/components/database-provider"

export default function BOQPage() {
  const { useBillsOfQuantities } = useDatabaseContext()
  const { boqs } = useBillsOfQuantities()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Final": return "bg-green-100 text-green-800"
      case "Approved": return "bg-blue-100 text-blue-800"
      case "Under Review": return "bg-yellow-100 text-yellow-800"
      case "Draft": return "bg-gray-100 text-gray-800"
      case "Revised": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getETOStatusColor = (status: string) => {
    switch (status) {
      case "BOQ Submitted": return "bg-gray-100 text-gray-800"
      case "Engineering Design": return "bg-yellow-100 text-yellow-800"
      case "BOM Generation": return "bg-blue-100 text-blue-800"
      case "Manufacturing Ready": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const stats = {
    totalBoqs: boqs.length,
    approvedBoqs: boqs.filter(b => b.status === "Approved" || b.status === "Final").length,
    draftBoqs: boqs.filter(b => b.status === "Draft").length,
    totalValue: boqs.reduce((sum, boq) => sum + boq.totalCost, 0),
    engineeringInProgress: boqs.filter(b => b.etoStatus === "Engineering Design").length,
    avgEngineeringProgress: boqs.length > 0 ? Math.round(boqs.reduce((sum, boq) => sum + (boq.engineeringProgress || 0), 0) / boqs.length) : 0,
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
              <h1 className="text-2xl font-bold text-gray-900">Bill of Quantities</h1>
              <p className="text-sm text-gray-600">Cost estimation and quantity management for projects</p>
            </div>
            <Link href="/boq/create">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New BOQ
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total BOQs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBoqs}</p>
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
                  <p className="text-sm font-medium text-gray-600">Approved BOQs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approvedBoqs}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Calculator className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Draft BOQs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.draftBoqs}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Edit className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalValue.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Engineering</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.engineeringInProgress}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Wrench className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgEngineeringProgress}%</p>
                </div>
                <div className="p-3 bg-teal-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* BOQ List */}
        <Card>
          <CardHeader>
            <CardTitle>Bills of Quantities</CardTitle>
            <CardDescription>
              Manage cost estimates and quantity breakdowns for projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>BOQ Number</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>ETO Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {boqs.map((boq) => (
                  <TableRow key={boq.id}>
                    <TableCell className="font-medium">{boq.boqNumber}</TableCell>
                    <TableCell>{boq.projectName}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{boq.title}</p>
                        <p className="text-sm text-gray-500">{boq.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(boq.status)}>
                        {boq.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getETOStatusColor(boq.etoStatus || "BOQ Submitted")}
                      >
                        {boq.etoStatus || "BOQ Submitted"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${boq.engineeringProgress || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {boq.engineeringProgress || 0}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${boq.totalCost.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/boq/${boq.id}`}>
                          <Button variant="ghost" size="sm" title="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/boq/${boq.id}/edit`}>
                          <Button variant="ghost" size="sm" title="Edit BOQ">
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
      </main>
    </div>
  )
}
