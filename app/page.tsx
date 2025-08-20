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
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import {
  quotations,
  engineeringProjects,
  billsOfMaterials,
  productionOrders,
  invoices,
  customers,
  purchaseOrders,
  formatCurrency,
} from "@/lib/data"

export default function Dashboard() {
  // Calculate summary statistics
  const stats = {
    activeQuotations: quotations.filter((q) => q.status !== "Rejected").length,
    activeProjects: engineeringProjects.filter((e) => e.status === "In Progress").length,
    activeBOMs: billsOfMaterials.filter((b) => b.status === "Active").length,
    activeProduction: productionOrders.filter((p) => p.status === "In Progress").length,
    pendingInvoices: invoices.filter((i) => i.status === "Sent").length,
    activeCustomers: customers.filter((c) => c.status === "Active").length,
    pendingPOs: purchaseOrders.filter((po) => po.status === "Sent" || po.status === "Acknowledged").length,
    totalRevenue: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
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
      title: "Engineering",
      description: "Project design and documentation",
      icon: Wrench,
      href: "/engineering",
      color: "text-green-600",
      bgColor: "bg-green-50",
      count: stats.activeProjects,
      status: "Active Projects",
    },
    {
      title: "Bill of Materials",
      description: "Material requirements and specifications",
      icon: Package,
      href: "/bom",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      count: stats.activeBOMs,
      status: "Active BOMs",
    },
    {
      title: "Production",
      description: "Manufacturing and work orders",
      icon: Factory,
      href: "/production",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      count: stats.activeProduction,
      status: "In Progress",
    },
    {
      title: "Invoicing",
      description: "Billing and payment tracking",
      icon: Receipt,
      href: "/invoicing",
      color: "text-red-600",
      bgColor: "bg-red-50",
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
      title: "Procurement",
      description: "Purchase orders and supplier management",
      icon: ShoppingCart,
      href: "/procurement",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      count: stats.pendingPOs,
      status: "Pending Orders",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Steel MRP System</h1>
              <p className="text-gray-600">Material Requirements Planning Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-green-700 border-green-200">
                <CheckCircle className="w-4 h-4 mr-1" />
                System Online
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
                </div>
                <Factory className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Invoices</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingInvoices}</p>
                </div>
                <Receipt className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeCustomers}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const Icon = module.icon
            return (
              <Card key={module.title} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${module.bgColor}`}>
                      <Icon className={`w-6 h-6 ${module.color}`} />
                    </div>
                    <Badge variant="secondary">
                      {module.count} {module.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{module.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{module.description}</p>
                  <Link href={module.href}>
                    <Button className="w-full">Access Module</Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                Recent Activity & Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium">PO-2024-002 shipped</p>
                    <p className="text-sm text-gray-600">Industrial Hardware Inc - Expected delivery Feb 15</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Shipping</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">Production WO-2024-001 in progress</p>
                    <p className="text-sm text-gray-600">Steel Frame Assembly - Team A Fabrication</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">Invoice INV-2024-001 sent</p>
                    <p className="text-sm text-gray-600">ABC Manufacturing Corp - Due March 28</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Pending</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
