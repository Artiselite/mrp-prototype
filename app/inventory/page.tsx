"use client"

import { useState, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Package, Search, MapPin, Building, DollarSign, TrendingUp, AlertTriangle, 
  Download, Upload, FileText, Plus, Truck, Box, ClipboardCheck, BarChart3,
  Navigation, RotateCcw, Calculator, Clock, Users, Target, Zap, Shield,
  Camera, MapPin as LocationIcon, CheckCircle, XCircle, AlertCircle
} from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useDatabaseContext } from "@/components/database-provider"
import type { 
  Location, Item, WarehouseOperation, PutawayTask, PickTask, PackTask, 
  Shipment, CycleCount, StagingArea, DispatchPlan, Return, InventoryValuation, 
  StockAgeing, WarehouseAnalytics, WarehouseAlert 
} from "@/lib/types"
import InventoryLoading from "./loading"

function InventoryContent() {
  const searchParams = useSearchParams()
  const { 
    locations = [], items = [], createItem, updateItem, refreshItems,
    warehouseOperations = [], putawayTasks = [], pickTasks = [], packTasks = [],
    shipments = [], cycleCounts = [], stagingAreas = [], dispatchPlans = [],
    returns = [], inventoryValuations = [], stockAgeing = [], warehouseAnalytics = [],
    warehouseAlerts = [], createWarehouseOperation, createPutawayTask, createPickTask,
    createPackTask, createShipment, createCycleCount, createStagingArea,
    createDispatchPlan, createReturn, createInventoryValuation, createStockAgeing,
    createWarehouseAlert
  } = useDatabaseContext()
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState("")
  const [selectedImportType, setSelectedImportType] = useState("inbound")
  const [selectedExportType, setSelectedExportType] = useState("full-inventory")
  const [activeTab, setActiveTab] = useState("overview")

  // Handler functions for warehouse operations
  const handleCreatePutawayTask = () => {
    // Create a new putaway task
    const newTask = {
      operationId: `OP-${Date.now()}`,
      itemId: items[0]?.id || "1", // Use first available item
      partNumber: items[0]?.partNumber || "STL-001",
      quantity: 10,
      receivedLocation: "Receiving Dock",
      suggestedLocation: "Rack-1-Bin-1",
      status: "Pending" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    createPutawayTask(newTask)
    alert("Putaway task created successfully!")
  }

  const handleStartPickList = () => {
    // Create a new pick task
    const newTask = {
      operationId: `OP-${Date.now()}`,
      itemId: items[0]?.id || "1",
      partNumber: items[0]?.partNumber || "STL-001",
      description: items[0]?.description || "Steel Plate",
      quantity: 5,
      unit: "EA",
      location: "Rack-1-Bin-1",
      binLocation: "Bin-1",
      pickedQuantity: 0,
      status: "Pending" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    createPickTask(newTask)
    alert("Pick list started successfully!")
  }

  const handleScheduleCycleCount = () => {
    // Create a new cycle count
    const newCount = {
      countNumber: `CC-${Date.now()}`,
      location: "Rack-1",
      countType: "Random" as const,
      status: "Scheduled" as const,
      scheduledDate: new Date().toISOString(),
      countedBy: "System",
      items: items.slice(0, 3).map(item => ({
        id: `item-${item.id}`,
        itemId: item.id,
        partNumber: item.partNumber,
        description: item.description,
        expectedQuantity: item.currentStock,
        countedQuantity: 0,
        variance: 0,
        varianceValue: 0,
        status: "Pending" as const
      })),
      varianceThreshold: 5,
      totalVariance: 0,
      varianceValue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    createCycleCount(newCount)
    alert("Cycle count scheduled successfully!")
  }

  const handleCreateShipment = () => {
    // Create a new shipment
    const newShipment = {
      shipmentNumber: `SH-${Date.now()}`,
      orderId: "SO-001",
      orderNumber: "SO-2024-001",
      customerId: "CUST-001",
      customerName: "Sample Customer",
      carrier: "FedEx",
      trackingNumber: `TRK${Date.now()}`,
      shippingMethod: "Standard",
      status: "Pending" as const,
      scheduledDate: new Date().toISOString(),
      shippingAddress: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA",
        contactPerson: "John Doe",
        phone: "555-0123",
        email: "john@example.com"
      },
      billingAddress: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA"
      },
      items: items.slice(0, 2).map(item => ({
        id: `shipment-item-${item.id}`,
        itemId: item.id,
        partNumber: item.partNumber,
        description: item.description,
        quantity: 1,
        unit: "EA",
        unitPrice: item.unitCost,
        totalPrice: item.unitCost,
        packedQuantity: 0,
        shippedQuantity: 0
      })),
      weight: 10.5,
      dimensions: { length: 12, width: 8, height: 6 },
      shippingCost: 25.00,
      insuranceValue: 1000.00,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    createShipment(newShipment)
    alert("Shipment created successfully!")
  }

  const handleViewLocation = (locationId: string) => {
    // Find the location and show details
    const location = locations.find(loc => loc.id === locationId)
    if (location) {
      alert(`Location: ${location.name}\nAddress: ${location.address}\nStatus: ${location.status}`)
    } else {
      alert("Location not found")
    }
  }

  const handleViewRoutes = (planId: string) => {
    // Find the dispatch plan and show route details
    const plan = dispatchPlans.find(p => p.id === planId)
    if (plan) {
      const routeInfo = plan.routes.map(route => 
        `Route ${route.routeNumber}: ${route.startLocation} → ${route.endLocation} (${route.shipments.length} shipments)`
      ).join('\n')
      alert(`Dispatch Plan: ${plan.planNumber}\n\nRoutes:\n${routeInfo}`)
    } else {
      alert("Dispatch plan not found")
    }
  }

  // Calculate inventory data for each location
  const locationInventory = locations.map((location: Location) => {
    const locationItems = items.filter((item: Item) => item.location === location.id)
    const totalUnits = locationItems.reduce((sum: number, item: Item) => sum + item.currentStock, 0)
    const totalValue = locationItems.reduce((sum: number, item: Item) => sum + (item.currentStock * item.unitCost), 0)
    const utilizationPercentage = location.capacity > 0 ? Math.round((totalUnits / location.capacity) * 100) : 0

    return {
      ...location,
      itemCount: locationItems.length,
      totalUnits,
      totalValue,
      utilizationPercentage,
      items: locationItems
    }
  })

  // Filter locations based on search term
  const filteredLocations = locationInventory.filter((location: any) =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate overall inventory statistics
  const totalItems = items.length
  const totalUnits = items.reduce((sum: number, item: Item) => sum + item.currentStock, 0)
  const totalValue = items.reduce((sum: number, item: Item) => sum + (item.currentStock * item.unitCost), 0)
  const activeLocations = locations.filter((loc: Location) => loc.status === "Active").length

  // Warehouse operations statistics
  const pendingPutawayTasks = putawayTasks.filter(task => task.status === "Pending").length
  const pendingPickTasks = pickTasks.filter(task => task.status === "Pending").length
  const pendingPackTasks = packTasks.filter(task => task.status === "Pending").length
  const inTransitShipments = shipments.filter(shipment => shipment.status === "In Transit").length
  const activeCycleCounts = cycleCounts.filter(count => count.status === "In Progress").length

  // Calculate warehouse efficiency metrics
  const completedOperations = warehouseOperations.filter(op => op.status === "Completed").length
  const totalOperations = warehouseOperations.length
  const efficiencyRate = totalOperations > 0 ? Math.round((completedOperations / totalOperations) * 100) : 0

  // Get recent alerts
  const recentAlerts = warehouseAlerts
    .filter(alert => alert.status === "Active")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const getUtilizationStatus = (percentage: number) => {
    if (percentage >= 90) return { status: "Critical", color: "bg-red-100 text-red-800" }
    if (percentage >= 80) return { status: "High", color: "bg-yellow-100 text-yellow-800" }
    if (percentage >= 60) return { status: "Moderate", color: "bg-blue-100 text-blue-800" }
    return { status: "Low", color: "bg-green-100 text-green-800" }
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      "Warehouse": "bg-blue-100 text-blue-800",
      "Rack": "bg-green-100 text-green-800",
      "Bin": "bg-purple-100 text-purple-800",
      "Office": "bg-orange-100 text-orange-800",
      "Outdoor": "bg-red-100 text-red-800",
      "Specialized": "bg-indigo-100 text-indigo-800"
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "Low Stock": return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "Overstock": return <Package className="w-4 h-4 text-yellow-500" />
      case "Aging Stock": return <Clock className="w-4 h-4 text-orange-500" />
      case "Cycle Count Due": return <ClipboardCheck className="w-4 h-4 text-blue-500" />
      case "Putaway Pending": return <Box className="w-4 h-4 text-purple-500" />
      case "Pick Pending": return <Target className="w-4 h-4 text-green-500" />
      case "Shipment Delayed": return <Truck className="w-4 h-4 text-red-500" />
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "Critical": return "bg-red-50 border-red-200"
      case "High": return "bg-orange-50 border-orange-200"
      case "Medium": return "bg-yellow-50 border-yellow-200"
      case "Low": return "bg-blue-50 border-blue-200"
      default: return "bg-gray-50 border-gray-200"
    }
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
              <h1 className="text-2xl font-bold text-gray-900">Advanced Warehouse Management</h1>
              <p className="text-sm text-gray-600">Comprehensive inventory and warehouse operations management</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Package className="w-4 h-4 mr-2" />
                Operations
              </Button>
              <Button variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">{totalItems.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">${totalValue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Efficiency Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{efficiencyRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">{recentAlerts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Warehouse Operations Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Putaway Tasks</p>
                  <p className="text-xl font-bold text-blue-600">{pendingPutawayTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Pick Tasks</p>
                  <p className="text-xl font-bold text-green-600">{pendingPickTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Pack Tasks</p>
                  <p className="text-xl font-bold text-purple-600">{pendingPackTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">In Transit</p>
                  <p className="text-xl font-bold text-orange-600">{inTransitShipments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-indigo-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Cycle Counts</p>
                  <p className="text-xl font-bold text-indigo-600">{activeCycleCounts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="staging">Staging & Dispatch</TabsTrigger>
            <TabsTrigger value="delivery">Proof of Delivery</TabsTrigger>
            <TabsTrigger value="returns">Returns & Routes</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Recent Alerts */}
            {recentAlerts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Recent Warehouse Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentAlerts.map((alert) => (
                      <div key={alert.id} className={`p-3 rounded-lg border ${getAlertColor(alert.severity)}`}>
                        <div className="flex items-center gap-3">
                          {getAlertIcon(alert.type)}
                          <div className="flex-1">
                            <div className="font-medium">{alert.message}</div>
                            <div className="text-sm text-gray-600">
                              {alert.location && `Location: ${alert.location}`}
                              {alert.value && ` • Value: ${alert.value}`}
                            </div>
                          </div>
                          <Badge variant={alert.severity === "Critical" ? "destructive" : "secondary"}>
                            {alert.severity}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Inventory Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Inventory Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">By Location</h4>
                    <div className="space-y-2">
                      {locationInventory.slice(0, 5).map((location: any) => (
                        <div key={location.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium">{location.name}</div>
                            <div className="text-sm text-gray-600">{location.code}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{location.itemCount} items</div>
                            <div className="text-sm text-gray-600">${location.totalValue.toFixed(2)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Recent Operations</h4>
                    <div className="space-y-2">
                      {warehouseOperations.slice(0, 5).map((operation) => (
                        <div key={operation.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium">{operation.operationType}</div>
                            <div className="text-sm text-gray-600">{operation.workOrderNumber}</div>
                          </div>
                          <Badge variant={operation.status === "Completed" ? "default" : "secondary"}>
                            {operation.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                    <div className="space-y-2">
                      <Link href="/inventory/putaway/create" className="w-full">
                        <Button className="w-full justify-start" variant="outline">
                          <Box className="w-4 h-4 mr-2" />
                          Create Putaway Task
                        </Button>
                      </Link>
                      <Link href="/inventory/pick/create" className="w-full">
                        <Button className="w-full justify-start" variant="outline">
                          <Target className="w-4 h-4 mr-2" />
                          Start Pick List
                        </Button>
                      </Link>
                      <Link href="/inventory/pack/create" className="w-full">
                        <Button className="w-full justify-start" variant="outline">
                          <ClipboardCheck className="w-4 h-4 mr-2" />
                          Create Pack Task
                        </Button>
                      </Link>
                      <Link href="/inventory/shipment/create" className="w-full">
                        <Button className="w-full justify-start" variant="outline">
                          <Truck className="w-4 h-4 mr-2" />
                          Create Shipment
                        </Button>
                      </Link>
                      <Link href="/inventory/cycle-count/create" className="w-full">
                        <Button className="w-full justify-start" variant="outline">
                          <ClipboardCheck className="w-4 h-4 mr-2" />
                          Schedule Cycle Count
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Operations Tab */}
          <TabsContent value="operations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Putaway Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Box className="w-5 h-5 text-blue-600" />
                    Putaway Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {putawayTasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{task.partNumber}</div>
                            <div className="text-sm text-gray-600">Qty: {task.quantity}</div>
                            <div className="text-sm text-gray-600">From: {task.receivedLocation}</div>
                          </div>
                          <Badge variant={task.status === "Completed" ? "default" : "secondary"}>
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pick Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    Pick Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pickTasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{task.partNumber}</div>
                            <div className="text-sm text-gray-600">{task.description}</div>
                            <div className="text-sm text-gray-600">Location: {task.location}</div>
                          </div>
                          <Badge variant={task.status === "Completed" ? "default" : "secondary"}>
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pack Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-purple-600" />
                    Pack Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {packTasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{task.orderNumber}</div>
                            <div className="text-sm text-gray-600">Customer: {task.customerName}</div>
                            <div className="text-sm text-gray-600">Items: {task.items.length}</div>
                          </div>
                          <Badge variant={task.status === "Completed" ? "default" : "secondary"}>
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Cycle Counts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-indigo-600" />
                    Cycle Counts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cycleCounts.slice(0, 5).map((count) => (
                      <div key={count.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{count.countNumber}</div>
                            <div className="text-sm text-gray-600">Location: {count.location}</div>
                            <div className="text-sm text-gray-600">Type: {count.countType}</div>
                          </div>
                          <Badge variant={count.status === "Completed" ? "default" : "secondary"}>
                            {count.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Staging & Dispatch Tab */}
          <TabsContent value="staging" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Staging Areas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    Staging Areas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stagingAreas.map((area) => (
                      <div key={area.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{area.name}</div>
                            <div className="text-sm text-gray-600">Location: {area.location}</div>
                            <div className="text-sm text-gray-600">
                              Utilization: {area.currentUtilization}/{area.capacity} ({Math.round((area.currentUtilization / area.capacity) * 100)}%)
                            </div>
                          </div>
                          <Badge variant={area.status === "Active" ? "default" : "secondary"}>
                            {area.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Dispatch Plans */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-green-600" />
                    Dispatch Plans
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dispatchPlans.slice(0, 5).map((plan) => (
                      <div key={plan.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{plan.planNumber}</div>
                            <div className="text-sm text-gray-600">Date: {plan.date}</div>
                            <div className="text-sm text-gray-600">Routes: {plan.routes.length}</div>
                          </div>
                          <Badge variant={plan.status === "Completed" ? "default" : "secondary"}>
                            {plan.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Proof of Delivery Tab */}
          <TabsContent value="delivery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-600" />
                  Digital Proof of Delivery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shipments.filter(s => s.proofOfDelivery).map((shipment) => (
                    <div key={shipment.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{shipment.shipmentNumber}</div>
                          <div className="text-sm text-gray-600">Customer: {shipment.customerName}</div>
                          <div className="text-sm text-gray-600">
                            Delivered: {shipment.proofOfDelivery?.deliveryDate}
                          </div>
                          <div className="text-sm text-gray-600">
                            Location: {shipment.proofOfDelivery?.geolocation.address}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="default">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Delivered
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewLocation(shipment.shippingAddress.city)}
                          >
                            <LocationIcon className="w-4 h-4 mr-1" />
                            View Location
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Returns & Routes Tab */}
          <TabsContent value="returns" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Returns */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RotateCcw className="w-5 h-5 text-red-600" />
                    Returns Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {returns.slice(0, 5).map((returnItem) => (
                      <div key={returnItem.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{returnItem.returnNumber}</div>
                            <div className="text-sm text-gray-600">Customer: {returnItem.customerName}</div>
                            <div className="text-sm text-gray-600">Type: {returnItem.returnType}</div>
                          </div>
                          <Badge variant={returnItem.status === "Completed" ? "default" : "secondary"}>
                            {returnItem.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Route Planning */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-green-600" />
                    Route Planning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dispatchPlans.map((plan) => (
                      <div key={plan.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{plan.planNumber}</div>
                            <div className="text-sm text-gray-600">Routes: {plan.routes.length}</div>
                            <div className="text-sm text-gray-600">Shipments: {plan.totalShipments}</div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewRoutes(plan.id)}
                          >
                            <Navigation className="w-4 h-4 mr-1" />
                            View Routes
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Inventory Valuation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-blue-600" />
                    Inventory Valuation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {inventoryValuations.slice(0, 5).map((valuation) => (
                      <div key={valuation.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{valuation.valuationDate}</div>
                            <div className="text-sm text-gray-600">Method: {valuation.method}</div>
                            <div className="text-sm text-gray-600">Items: {valuation.itemCount}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${valuation.totalValue.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Stock Ageing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    Stock Ageing Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stockAgeing.slice(0, 5).map((ageing) => (
                      <div key={ageing.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{ageing.partNumber}</div>
                            <div className="text-sm text-gray-600">Avg Age: {ageing.averageAge} days</div>
                            <div className="text-sm text-gray-600">Status: {ageing.status}</div>
                          </div>
                          <Badge variant={ageing.status === "Fresh" ? "default" : "secondary"}>
                            {ageing.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Search and Filters */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search items by part number, name, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="text-sm text-gray-600 flex items-center">
                Showing {items.filter((item: Item) =>
                  item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.category.toLowerCase().includes(searchTerm.toLowerCase())
                ).length} of {items.length} items
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Complete Inventory List
                </CardTitle>
                <div className="text-sm text-gray-600">
                  Showing all {items.length} items across {locations.length} locations
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Table
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part Number</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.filter((item: Item) =>
                    item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.category.toLowerCase().includes(searchTerm.toLowerCase())
                  ).length > 0 ? (
                    items.filter((item: Item) =>
                      item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      item.category.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((item: Item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono font-medium">
                          {item.partNumber}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">
                              {item.location || 'No Location'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-center">
                          <span className={`font-medium ${item.currentStock <= item.minStock ? 'text-red-600' :
                            item.currentStock <= item.minStock * 1.5 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                            {item.currentStock.toLocaleString()}
                          </span>
                          <div className="text-xs text-gray-500">
                            Min: {item.minStock} | Max: {item.maxStock}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
                          ${item.unitCost.toFixed(2)}
                        </TableCell>
                        <TableCell className="font-mono font-medium">
                          ${(item.currentStock * item.unitCost).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.status === "Active" ? "default" : "secondary"}>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Link href={`/items/${item.id}`}>
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                            </Link>
                            <Link href={`/items/${item.id}/edit`}>
                              <Button size="sm" variant="outline">
                                Edit
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {searchTerm ? "No items match your search" : "No inventory items found"}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          {searchTerm ? "Try adjusting your search terms" : "Start by adding items through inbound operations or create them manually"}
                        </p>
                        {!searchTerm && (
                          <div className="flex gap-2 justify-center">
                            <Link href="/items/create">
                              <Button size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Add First Item
                              </Button>
                            </Link>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<InventoryLoading />}>
      <InventoryContent />
    </Suspense>
  )
}