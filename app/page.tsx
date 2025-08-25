"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Wrench,
  Package,
  Factory,
  Receipt,
  Users,
  ShoppingCart,
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  Building2,
} from "lucide-react"
import { useDatabaseContext } from "@/components/database-provider"
import { DatabaseManager } from "@/components/database-manager"

export default function Dashboard() {
  const {
    useQuotations,
    useSalesOrders,
    useEngineeringDrawings,
    useBillsOfMaterials,
    useProductionWorkOrders,
    useInvoices,
    useCustomers,
    useSuppliers,
    usePurchaseOrders
  } = useDatabaseContext()

  const { quotations } = useQuotations()
  const { salesOrders } = useSalesOrders()
  const { drawings: engineeringProjects } = useEngineeringDrawings()
  const { boms: billsOfMaterials } = useBillsOfMaterials()
  const { workOrders: productionOrders } = useProductionWorkOrders()
  const { invoices } = useInvoices()
  const { customers } = useCustomers()
  const { suppliers } = useSuppliers()
  const { purchaseOrders } = usePurchaseOrders()

  // Calculate summary statistics
  const stats = {
    activeQuotations: quotations.filter((q) => q.status !== "Rejected").length,
    activeSalesOrders: salesOrders.filter((so) => so.status !== "Cancelled" && so.status !== "Delivered").length,
    activeProduction: productionOrders.filter((p) => p.status === "In Progress").length,
    pendingInvoices: invoices.filter((i) => i.status === "Sent").length,
    activeCustomers: customers.filter((c) => c.status === "Active").length,
    activeSuppliers: suppliers.filter((s) => s.status === "Active").length,
    pendingPOs: purchaseOrders.filter((po) => po.status === "Sent" || po.status === "Acknowledged").length,
  }

  const modules = [
    {
      title: "Quotations",
      description: "Manage customer quotes and proposals",
      icon: FileText,
      href: "/quotations",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      count: stats.activeQuotations,
      status: "Active Quotes",
    },
    {
      title: "Sales Orders",
      description: "Customer orders and delivery tracking",
      icon: ClipboardList,
      href: "/sales-orders",
      color: "text-green-600",
      bgColor: "bg-green-50",
      count: stats.activeSalesOrders,
      status: "Active Orders",
    },
    {
      title: "Engineering",
      description: "Project design and documentation",
      icon: Wrench,
      href: "/engineering",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      status: "Active Projects",
    },
    {
      title: "Bill of Materials",
      description: "Material requirements and specifications",
      icon: Package,
      href: "/bom",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      status: "Active BOMs",
    },
    {
      title: "Production",
      description: "Manufacturing and work orders",
      icon: Factory,
      href: "/production",
      color: "text-red-600",
      bgColor: "bg-red-50",
      count: stats.activeProduction,
      status: "In Progress",
    },
    {
      title: "Invoicing",
      description: "Billing and payment tracking",
      icon: Receipt,
      href: "/invoicing",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      count: stats.pendingInvoices,
      status: "Pending Payment",
    },
    {
      title: "Customers",
      description: "Customer relationship management",
      icon: Users,
      href: "/customers",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      count: stats.activeCustomers,
      status: "Active Customers",
    },
    {
      title: "Suppliers",
      description: "Supplier relationship and procurement management",
      icon: Building2,
      href: "/suppliers",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      count: stats.activeSuppliers,
      status: "Active Suppliers",
    },
    {
      title: "Procurement",
      description: "Purchase orders and supplier management",
      icon: ShoppingCart,
      href: "/procurement",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      count: stats.pendingPOs,
      status: "Pending Orders",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Steel MRP Dashboard</h1>
          <p className="text-gray-600 mt-2">Manufacturing Resource Planning System</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sales Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <ClipboardList className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <Factory className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Customers</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                Recent Activity & Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">Sales Order SO-2024-001 in production</p>
                    <p className="text-sm text-gray-600">ABC Manufacturing Corp - Steel Frame Assembly</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">In Progress</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium">PO-2024-002 shipped</p>
                    <p className="text-sm text-gray-600">Industrial Hardware Inc - Expected delivery Feb 15</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Shipping</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">Sales Order SO-2024-002 confirmed</p>
                    <p className="text-sm text-gray-600">XYZ Construction LLC - Structural Beams</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Confirmed</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <p className="font-medium">Invoice INV-2024-001 sent</p>
                    <p className="text-sm text-gray-600">ABC Manufacturing Corp - Due March 28</p>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">Pending</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  )
}
