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
import { Plus, Search, Filter, Eye, Edit, FileText, Calculator, Settings, DollarSign, Clock, CheckCircle, AlertCircle, BarChart3, TrendingUp } from 'lucide-react'
import { useDatabaseContext } from '@/components/database-provider'
import MarketDataDashboard from '@/components/market-data-dashboard'

function QuotationsContent() {
  const { quotations, engineeringDrawings, isInitialized } = useDatabaseContext()
  const [filteredQuotations, setFilteredQuotations] = useState(quotations || [])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    let filtered = quotations

    if (searchTerm) {
      filtered = filtered.filter(q =>
        q?.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q?.id?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(q => getWorkflowStage(q) === statusFilter)
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
    if (quotation?.engineeringReviewer && quotation?.managementApprover) {
      return 'Fully Approved'
    } else if (quotation?.engineeringReviewer) {
      return 'Engineering Approved'
    } else if (quotation?.engineeringProjectId) {
      return 'Engineering In Progress'
    } else {
      return 'No Engineering'
    }
  }

  const getBOQStatus = (quotation: any) => {
    if (quotation?.boqGenerated) {
      return 'BOQ Generated'
    } else if (quotation?.engineeringDrawingCreated) {
      return 'Drawing Complete'
    } else if (quotation?.engineeringProjectId) {
      return 'Engineering In Progress'
    } else {
      return 'Not Started'
    }
  }

  const getBOQStatusColor = (status: string) => {
    switch (status) {
      case 'BOQ Generated': return 'bg-green-100 text-green-800'
      case 'Drawing Complete': return 'bg-blue-100 text-blue-800'
      case 'Engineering In Progress': return 'bg-yellow-100 text-yellow-800'
      case 'Not Started': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getWorkflowStage = (quotation: any) => {
    if (quotation?.status === 'Approved' && quotation?.poReceived) {
      return 'PO Received'
    } else if (quotation?.sentToCustomer) {
      return 'Customer Review'
    } else if (quotation?.boqGenerated) {
      return 'Ready to Send'
    } else if (quotation?.engineeringDrawingCreated) {
      return 'BOQ Pending'
    } else if (quotation?.engineeringProjectId) {
      return 'Engineering'
    } else {
      return 'Draft'
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
    total: quotations?.length || 0,
    draft: quotations?.filter(q => getWorkflowStage(q) === 'Draft').length || 0,
    engineering: quotations?.filter(q => getWorkflowStage(q) === 'Engineering').length || 0,
    boqPending: quotations?.filter(q => getWorkflowStage(q) === 'BOQ Pending').length || 0,
    readyToSend: quotations?.filter(q => getWorkflowStage(q) === 'Ready to Send').length || 0,
    customerReview: quotations?.filter(q => getWorkflowStage(q) === 'Customer Review').length || 0,
    poReceived: quotations?.filter(q => getWorkflowStage(q) === 'PO Received').length || 0,
    approved: quotations?.filter(q => q?.status === 'Approved').length || 0,
    rejected: quotations?.filter(q => q?.status === 'Rejected').length || 0,
    totalValue: quotations?.reduce((sum, q) => sum + (q?.total || 0), 0) || 0,
    engineeringProjects: quotations?.filter(q => q?.engineeringProjectId).length || 0,
    boqGenerated: quotations?.filter(q => getBOQStatus(q) === 'BOQ Generated').length || 0,
  }

  // Show loading state if not initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quotations...</p>
        </div>
      </div>
    )
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
                  <p className="text-2xl font-bold text-gray-900">RM{stats.totalValue.toLocaleString()}</p>
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
                  <p className="text-sm font-medium text-gray-600">BOQ Generated</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.boqGenerated}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Calculator className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Engineering</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.engineering + stats.boqPending}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Settings className="w-6 h-6 text-yellow-600" />
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
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="BOQ Pending">BOQ Pending</SelectItem>
                  <SelectItem value="Ready to Send">Ready to Send</SelectItem>
                  <SelectItem value="Customer Review">Customer Review</SelectItem>
                  <SelectItem value="PO Received">PO Received</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="quotations" className="space-y-6">
          <TabsList>
            <TabsTrigger value="quotations">Quotations</TabsTrigger>
            <TabsTrigger value="unit-economics">Unit Economics</TabsTrigger>
            <TabsTrigger value="market-data">Market Data</TabsTrigger>
          </TabsList>

          {/* Quotations Tab */}
          <TabsContent value="quotations">
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
                  <TableHead>Workflow Stage</TableHead>
                  <TableHead>Engineering Status</TableHead>
                  <TableHead>BOQ Status</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotations?.map((quotation) => (
                  <TableRow key={quotation.id}>
                    <TableCell className="font-medium">
                      {quotation?.quotationNumber}
                    </TableCell>
                    <TableCell>{quotation?.customerName}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{quotation?.title}</p>
                        <p className="text-sm text-gray-500">{quotation?.description}</p>
                        {quotation?.engineeringProjectId && (
                          <Badge variant="outline" className="text-xs mt-1">
                            Engineering Project: {quotation.engineeringProjectId}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(getWorkflowStage(quotation))}>
                        {getWorkflowStage(quotation)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getEngineeringStatusColor(getEngineeringStatus(quotation))}>
                        {getEngineeringStatus(quotation)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getBOQStatusColor(getBOQStatus(quotation))}>
                        {getBOQStatus(quotation)}
                      </Badge>
                    </TableCell>
                    <TableCell>{quotation?.createdAt}</TableCell>
                    <TableCell>{quotation?.validUntil}</TableCell>
                    <TableCell className="font-medium">RM{quotation?.total?.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/quotations/${quotation?.id}`}>
                          <Button variant="ghost" size="sm" title="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/quotations/${quotation?.id}/edit`}>
                          <Button variant="ghost" size="sm" title="Edit Quotation">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        {getBOQStatus(quotation) === 'BOQ Generated' && (
                          <Button variant="ghost" size="sm" title="View BOQ">
                            <Calculator className="w-4 h-4" />
                          </Button>
                        )}
                        <Link href={`/quotations/${quotation?.id}/unit-economics`}>
                          <Button variant="ghost" size="sm" title="Unit Economics">
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                        </Link>
                        {getWorkflowStage(quotation) === 'PO Received' && (
                          <Button variant="ghost" size="sm" title="Convert to Sales Order">
                            <Settings className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" title="Download PDF">
                          <FileText className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {(!filteredQuotations || filteredQuotations.length === 0) && (
              <div className="text-center py-8">
                <p className="text-gray-500">No quotations found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>

          {/* Unit Economics Tab */}
          <TabsContent value="unit-economics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Unit Economics Calculator
                </CardTitle>
                <CardDescription>
                  Calculate unit economics with copper LME volatility analysis for quotations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Unit Economics Calculator</h3>
                  <p className="text-gray-600 mb-4">
                    Select a quotation to calculate unit economics with copper LME volatility analysis
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">
                      • Real-time copper LME price integration
                    </p>
                    <p className="text-sm text-gray-500">
                      • Sensitivity analysis with min/max scenarios
                    </p>
                    <p className="text-sm text-gray-500">
                      • Risk assessment and recommendations
                    </p>
                    <p className="text-sm text-gray-500">
                      • Scenario planning for volatile markets
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market Data Tab */}
          <TabsContent value="market-data">
            <MarketDataDashboard />
          </TabsContent>
        </Tabs>
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
