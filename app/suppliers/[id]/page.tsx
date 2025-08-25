"use client"

import { useState, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Building2, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  Clock, 
  DollarSign,
  Package,
  FileText,
  Calendar,
  User
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { statusColors, formatCurrency } from "@/lib/data"
import { useDatabaseContext } from "@/components/database-provider"

function SupplierDetailContent() {
  const params = useParams()
  const router = useRouter()
  const { useSuppliers, usePurchaseOrders } = useDatabaseContext()
  const { suppliers, deleteSupplier } = useSuppliers()
  const { purchaseOrders } = usePurchaseOrders()
  
  const supplier = suppliers.find(s => s.id === params.id)
  const supplierPurchaseOrders = purchaseOrders.filter(po => po.supplierId === params.id)

  const [isDeleting, setIsDeleting] = useState(false)

  if (!supplier) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Supplier not found</h2>
          <p className="text-gray-600 mb-4">The supplier you're looking for doesn't exist.</p>
          <Link href="/suppliers">
            <Button>Back to Suppliers</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this supplier? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)
    try {
      const success = deleteSupplier(supplier.id)
      if (success) {
        router.push("/suppliers")
      }
    } catch (error) {
      console.error("Error deleting supplier:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600"
    if (rating >= 3) return "text-yellow-600"
    return "text-red-600"
  }

  const getStatusColor = (status: string) => {
    return statusColors.supplier[status as keyof typeof statusColors.supplier] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <Link href="/suppliers" className="text-sm text-blue-600 hover:text-blue-800 mb-2 block">
                <ArrowLeft className="w-4 h-4 inline mr-1" />
                Back to Suppliers
              </Link>
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8 text-green-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{supplier.name}</h1>
                  <p className="text-sm text-gray-600">Supplier Details</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/suppliers/${supplier.id}/edit`}>
                <Button variant="outline" className="flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              </Link>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Company Name</label>
                    <p className="text-lg font-semibold">{supplier.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Contact Person</label>
                    <p className="text-lg">{supplier.contactPerson}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <Badge className={getStatusColor(supplier.status)}>{supplier.status}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Orders</label>
                    <p className="text-lg font-semibold">{supplier.totalOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-lg">{supplier.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-lg">{supplier.phone}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-lg">{supplier.address}</p>
                  <p className="text-lg">{supplier.city}, {supplier.state} {supplier.zipCode}</p>
                  <p className="text-lg">{supplier.country}</p>
                </div>
              </CardContent>
            </Card>

            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Terms</label>
                    <p className="text-lg">{supplier.paymentTerms}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Lead Time</label>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-lg">{supplier.leadTime} days</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Quality Rating</label>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-gray-400" />
                      <span className={`text-lg font-semibold ${getRatingColor(supplier.qualityRating)}`}>
                        {supplier.qualityRating}/5
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Overall Rating</label>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-gray-400" />
                      <span className={`text-lg font-semibold ${getRatingColor(supplier.rating)}`}>
                        {supplier.rating}/5
                      </span>
                    </div>
                  </div>
                </div>
                
                {supplier.specialties.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Specialties</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {supplier.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {supplier.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Notes</label>
                    <p className="text-lg mt-2">{supplier.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Purchase Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Purchase Orders ({supplierPurchaseOrders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {supplierPurchaseOrders.length > 0 ? (
                  <div className="space-y-3">
                    {supplierPurchaseOrders.slice(0, 5).map((po) => (
                      <div key={po.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{po.poNumber}</p>
                            <p className="text-sm text-gray-600">{po.status}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(po.total)}</p>
                          <p className="text-sm text-gray-600">{po.orderDate}</p>
                        </div>
                      </div>
                    ))}
                    {supplierPurchaseOrders.length > 5 && (
                      <p className="text-sm text-gray-600 text-center">
                        Showing 5 of {supplierPurchaseOrders.length} purchase orders
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No purchase orders found for this supplier</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{supplier.totalOrders}</div>
                  <div className="text-sm text-green-800">Total Orders</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{supplier.leadTime}</div>
                  <div className="text-sm text-blue-800">Lead Time (days)</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{supplier.rating}/5</div>
                  <div className="text-sm text-yellow-800">Rating</div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Created: {new Date(supplier.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Updated: {new Date(supplier.updatedAt).toLocaleDateString()}</span>
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

export default function SupplierDetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SupplierDetailContent />
    </Suspense>
  )
}
