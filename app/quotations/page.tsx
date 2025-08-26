'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Search, Filter, Eye, Edit, FileText, Calculator, Settings, DollarSign, Clock } from 'lucide-react'
import { useDatabaseContext } from '@/components/database-provider'

function QuotationsContent() {
  const { useQuotations, useEngineeringProjects } = useDatabaseContext()
  const { quotations } = useQuotations()
  const { projects } = useEngineeringProjects()
  const [filteredQuotations, setFilteredQuotations] = useState(quotations)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    let filtered = quotations

    if (searchTerm) {
      filtered = filtered.filter(q =>
        q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(q => q.status === statusFilter)
    }

    setFilteredQuotations(filtered)
  }, [quotations, searchTerm, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800'
      case 'Under Review': return 'bg-yellow-100 text-yellow-800'
      case 'Sent': return 'bg-blue-100 text-blue-800'
      case 'Customer Review': return 'bg-purple-100 text-purple-800'
      case 'Negotiation': return 'bg-orange-100 text-orange-800'
      case 'Approved': return 'bg-green-100 text-green-800'
      case 'Rejected': return 'bg-red-100 text-red-800'
      case 'Expired': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEngineeringStatus = (quotation: any) => {
    if (quotation.engineeringReviewer && quotation.managementApprover) {
      return 'Fully Approved'
    } else if (quotation.engineeringReviewer) {
      return 'Engineering Approved'
    } else if (quotation.engineeringProjectId) {
      return 'Engineering In Progress'
    } else {
      return 'No Engineering'
    }
  }

  const getEngineeringStatusColor = (status: string) => {
    switch (status) {
      case 'Fully Approved': return 'bg-green-100 text-green-800'
      case 'Engineering Approved': return 'bg-blue-100 text-blue-800'
      case 'Engineering In Progress': return 'bg-yellow-100 text-yellow-800'
      case 'No Engineering': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const stats = {
    total: quotations.length,
    draft: quotations.filter(q => q.status === 'Draft').length,
    underReview: quotations.filter(q => q.status === 'Under Review').length,
    sent: quotations.filter(q => q.status === 'Sent').length,
    customerReview: quotations.filter(q => q.status === 'Customer Review').length,
    negotiation: quotations.filter(q => q.status === 'Negotiation').length,
    approved: quotations.filter(q => q.status === 'Approved').length,
    rejected: quotations.filter(q => q.status === 'Rejected').length,
    expired: quotations.filter(q => q.status === 'Expired').length,
    totalValue: quotations.reduce((sum, q) => sum + q.total, 0),
    engineeringProjects: quotations.filter(q => q.engineeringProjectId).length,
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
              <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
              <p className="text-sm text-gray-600">Manage customer quotations and ETO proposals</p>
            </div>
            <Link href="/quotations/create">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Quotation
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Quotations</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalValue.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Engineering Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.engineeringProjects}</p>
                </div>
                                        <div className="p-3 bg-purple-100 rounded-full">
                          <Settings className="w-6 h-6 text-purple-600" />
                        </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.underReview + stats.customerReview}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search quotations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Sent">Sent</SelectItem>
                  <SelectItem value="Customer Review">Customer Review</SelectItem>
                  <SelectItem value="Negotiation">Negotiation</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Quotations Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Quotations</CardTitle>
            <CardDescription>
              Customer quotations and ETO proposals with engineering integration
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quotation ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Engineering Status</TableHead>
                  <TableHead>Cost Breakdown</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotations.map((quotation) => (
                  <TableRow key={quotation.id}>
                    <TableCell className="font-medium">
                      {quotation.quotationNumber}
                    </TableCell>
                    <TableCell>{quotation.customerName}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{quotation.title}</p>
                        <p className="text-sm text-gray-500">{quotation.description}</p>
                        {quotation.engineeringProjectId && (
                          <Badge variant="outline" className="text-xs mt-1">
                            Engineering Project: {quotation.engineeringProjectId}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(quotation.status)}>
                        {quotation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getEngineeringStatusColor(getEngineeringStatus(quotation))}>
                        {getEngineeringStatus(quotation)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        {quotation.engineeringCost > 0 && (
                          <div className="flex items-center gap-1">
                            <Settings className="w-3 h-3 text-purple-600" />
                            <span>${quotation.engineeringCost.toLocaleString()}</span>
                          </div>
                        )}
                        {quotation.materialCost > 0 && (
                          <div className="flex items-center gap-1">
                            <Calculator className="w-3 h-3 text-blue-600" />
                            <span>${quotation.materialCost.toLocaleString()}</span>
                          </div>
                        )}
                        {quotation.laborCost > 0 && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-green-600" />
                            <span>${quotation.laborCost.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{quotation.createdAt}</TableCell>
                    <TableCell>{quotation.validUntil}</TableCell>
                    <TableCell className="font-medium">${quotation.total.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/quotations/${quotation.id}`}>
                          <Button variant="ghost" size="sm" title="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/quotations/${quotation.id}/edit`}>
                          <Button variant="ghost" size="sm" title="Edit Quotation">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" title="Download PDF">
                          <FileText className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredQuotations.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No quotations found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function QuotationsPage() {
  return (
    <Suspense fallback={<div>Loading quotations...</div>}>
      <QuotationsContent />
    </Suspense>
  )
}
