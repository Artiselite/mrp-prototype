"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Users,
  ArrowLeft,
  Edit,
  Building,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Calendar,
  FileText,
  CreditCard,
} from "lucide-react"
import Link from "next/link"
import { customers, quotations, statusColors, formatCurrency } from "@/lib/data"
import { notFound } from "next/navigation"

interface CustomerDetailPageProps {
  params: {
    id: string
  }
}

export default function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const customer = customers.find((c) => c.id === params.id)

  if (!customer) {
    notFound()
  }

  // Get customer's quotations
  const customerQuotations = quotations.filter((q) => q.customerId === customer.id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link href="/customers">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Customers
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
                  <p className="text-sm text-gray-600">Customer Details</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={statusColors.customer[customer.status]}>{customer.status}</Badge>
              <Link href={`/customers/${customer.id}/edit`}>
                <Button>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Customer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Company</p>
                        <p className="font-medium">{customer.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <a href={`mailto:${customer.email}`} className="font-medium text-blue-600 hover:underline">
                          {customer.email}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <a href={`tel:${customer.phone}`} className="font-medium text-blue-600 hover:underline">
                          {customer.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Credit Limit</p>
                        <p className="font-bold text-lg">{formatCurrency(customer.creditLimit)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Payment Terms</p>
                        <p className="font-medium">{customer.paymentTerms}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Customer Since</p>
                        <p className="font-medium">{customer.dateCreated}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{customer.totalOrders}</p>
                    <p className="text-sm text-gray-500">Total Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{customerQuotations.length}</p>
                    <p className="text-sm text-gray-500">Active Quotations</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : "N/A"}
                    </p>
                    <p className="text-sm text-gray-500">Last Order</p>
                  </div>
                </div>

                {customer.notes && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Notes</p>
                        <p className="text-gray-700">{customer.notes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle>Address Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium">{customer.address}</p>
                    <p className="text-gray-600">
                      {customer.city}, {customer.state} {customer.zipCode}
                    </p>
                    <p className="text-gray-600">{customer.country}</p>
                    {customer.taxId && <p className="text-sm text-gray-500 mt-2">Tax ID: {customer.taxId}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Quotations */}
            {customerQuotations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Quotations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customerQuotations.slice(0, 5).map((quotation) => (
                      <div key={quotation.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{quotation.id}</h4>
                          <p className="text-sm text-gray-600">{quotation.projectName}</p>
                          <p className="text-xs text-gray-500">Created: {quotation.createdDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(quotation.totalAmount)}</p>
                          <Badge className={statusColors.quotation[quotation.status]}>{quotation.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  {customerQuotations.length > 5 && (
                    <div className="mt-4 text-center">
                      <Link href={`/quotations?customer=${customer.id}`}>
                        <Button variant="outline" size="sm">
                          View All Quotations
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Primary Contact</p>
                  <p className="font-medium">{customer.contactPerson}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline">
                    {customer.email}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <a href={`tel:${customer.phone}`} className="text-blue-600 hover:underline">
                    {customer.phone}
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/customers/${customer.id}/edit`} className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Customer
                  </Button>
                </Link>
                <Link href={`/quotations/create?customer=${customer.id}`} className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <FileText className="w-4 h-4 mr-2" />
                    Create Quotation
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Customer
                </Button>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Status:</span>
                    <Badge className={statusColors.customer[customer.status]}>{customer.status}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Credit Limit:</span>
                    <span className="font-medium">{formatCurrency(customer.creditLimit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Payment Terms:</span>
                    <span className="font-medium">{customer.paymentTerms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Orders:</span>
                    <span className="font-medium">{customer.totalOrders}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
