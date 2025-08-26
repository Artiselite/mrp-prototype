"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Building2, 
  FileText, 
  ShoppingCart, 
  Wrench, 
  ClipboardList, 
  Calculator,
  Factory, 
  Receipt, 
  TrendingUp,
  Box,
  MapPin,
  Package
} from "lucide-react"
import { useDatabaseContext } from "@/components/database-provider"

export default function DashboardPage() {
  const { 
    useCustomers, 
    useSuppliers, 
    useQuotations, 
    useSalesOrders, 
    useEngineeringDrawings, 
    useBillsOfMaterials,
    useBillsOfQuantities,
    useProductionWorkOrders, 
    useInvoices, 
    usePurchaseOrders 
  } = useDatabaseContext()

  const { customers } = useCustomers()
  const { suppliers } = useSuppliers()
  const { quotations } = useQuotations()
  const { salesOrders } = useSalesOrders()
  const { drawings: engineeringDrawings } = useEngineeringDrawings()
  const { boms: billsOfMaterials } = useBillsOfMaterials()
  const { boqs: billsOfQuantities } = useBillsOfQuantities()
  const { workOrders: productionWorkOrders } = useProductionWorkOrders()
  const { invoices } = useInvoices()
  const { purchaseOrders } = usePurchaseOrders()

  const stats = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.status === "Active").length,
    totalSuppliers: suppliers.length,
    activeSuppliers: suppliers.filter(s => s.status === "Active").length,
    totalQuotations: quotations.length,
    pendingQuotations: quotations.filter(q => q.status === "Sent").length,
    totalSalesOrders: salesOrders.length,
    activeSalesOrders: salesOrders.filter(so => so.status === "In Production").length,
    totalEngineeringDrawings: engineeringDrawings.length,
    totalBillsOfMaterials: billsOfMaterials.length,
    totalBillsOfQuantities: billsOfQuantities.length,
    totalProductionWorkOrders: productionWorkOrders.length,
    activeProductionWorkOrders: productionWorkOrders.filter(pwo => pwo.status === "In Progress").length,
    totalInvoices: invoices.length,
    pendingInvoices: invoices.filter(i => i.status === "Sent").length,
    totalPurchaseOrders: purchaseOrders.length,
    activePurchaseOrders: purchaseOrders.filter(po => po.status === "Sent").length
  }

  const modules = [
    {
      name: "Customers",
      description: "Manage customer relationships and information",
      icon: Users,
      href: "/customers",
      count: stats.totalCustomers,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      name: "Suppliers",
      description: "Manage supplier relationships and procurement",
      icon: Building2,
      href: "/suppliers",
      count: stats.totalSuppliers,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      name: "Items",
      description: "Manage inventory items and materials",
      icon: Box,
      href: "/items",
      count: 0, // TODO: Implement useItems hook
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      name: "Locations",
      description: "Manage warehouse locations and storage areas",
      icon: MapPin,
      href: "/locations",
      count: 5, // TODO: Implement useLocations hook
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      name: "Inventory",
      description: "Manage inventory movements and bulk operations",
      icon: Package,
      href: "/inventory",
      count: 0, // TODO: Implement useItems hook for total count
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      name: "Quotations",
      description: "Create and manage customer quotations",
      icon: FileText,
      href: "/quotations",
      count: stats.totalQuotations,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      name: "Sales Orders",
      description: "Process and track customer sales orders",
      icon: ShoppingCart,
      href: "/sales-orders",
      count: stats.totalSalesOrders,
      color: "text-pink-600",
      bgColor: "bg-pink-50"
    },
    {
      name: "Engineering",
      description: "Manage engineering drawings and specifications",
      icon: Wrench,
      href: "/engineering",
      count: stats.totalEngineeringDrawings,
      color: "text-gray-600",
      bgColor: "bg-gray-50"
    },
    {
      name: "Bills of Materials",
      description: "Create and manage product BOMs",
      icon: ClipboardList,
      href: "/bom",
      count: stats.totalBillsOfMaterials,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50"
    },
    {
      name: "Bill of Quantities",
      description: "Cost estimation and quantity takeoffs",
      icon: Calculator,
      href: "/boq",
      count: stats.totalBillsOfQuantities,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      name: "Production",
      description: "Manage production work orders and scheduling",
      icon: Factory,
      href: "/production",
      count: stats.totalProductionWorkOrders,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      name: "Invoicing",
      description: "Generate and track customer invoices",
      icon: Receipt,
      href: "/invoicing",
      count: stats.totalInvoices,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      name: "Procurement",
      description: "Manage purchase orders and procurement",
      icon: TrendingUp,
      href: "/procurement",
      count: stats.totalPurchaseOrders,
      color: "text-rose-600",
      bgColor: "bg-rose-50"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">MRP System Dashboard</h1>
          <p className="text-gray-600 mt-2">Manufacturing Resource Planning and Management</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Building2 className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSuppliers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Box className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">5</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Locations</p>
                  <p className="text-2xl font-bold text-gray-900">5</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const IconComponent = module.icon
            return (
              <Card key={module.name} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${module.bgColor}`}>
                      <IconComponent className={`w-6 h-6 ${module.color}`} />
                    </div>
                    <Badge variant="secondary">{module.count}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold text-lg mb-2">{module.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{module.description}</p>
                  <a
                    href={module.href}
                    className={`inline-flex items-center text-sm font-medium ${module.color} hover:underline`}
                  >
                    View {module.name}
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
