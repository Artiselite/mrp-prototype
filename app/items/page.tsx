"use client"

import { useState, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Plus, Search, Tag, DollarSign, Box, AlertTriangle, Hash } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useDatabaseContext } from "@/components/database-provider"

// Items data now comes from the database context

function ItemsContent() {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all")

  // Use real database context
  const { items } = useDatabaseContext()

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStockStatus = (current: number, min: number, max: number, category: string) => {
    // Special handling for finish goods
    if (category === "Finish Goods") {
      if (current === 0) return { status: "Out of Stock", color: "bg-red-100 text-red-800" }
      if (current <= 2) return { status: "Low Stock", color: "bg-orange-100 text-orange-800" }
      return { status: "Ready for Shipment", color: "bg-green-100 text-green-800" }
    }

    // Standard stock status for other items
    if (current <= min) return { status: "Low Stock", color: "bg-red-100 text-red-800" }
    if (current >= max * 0.8) return { status: "High Stock", color: "bg-yellow-100 text-yellow-800" }
    return { status: "Normal", color: "bg-green-100 text-green-800" }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Raw Material": "bg-blue-100 text-blue-800",
      "Fasteners": "bg-green-100 text-green-800",
      "Consumables": "bg-purple-100 text-purple-800",
      "Finishing": "bg-orange-100 text-orange-800",
      "Finish Goods": "bg-emerald-100 text-emerald-800",
      "Structural Steel": "bg-slate-100 text-slate-800",
      "Steel Plate": "bg-gray-100 text-gray-800"
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  const categories = ["All", "Raw Material", "Fasteners", "Consumables", "Finishing", "Finish Goods", "Structural Steel", "Steel Plate"]

  const getItemsByCategory = (category: string) => {
    if (category === "All") return filteredItems
    return filteredItems.filter(item => item.category === category)
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
              <h1 className="text-2xl font-bold text-gray-900">Item Master</h1>
              <p className="text-sm text-gray-600">Manage inventory items, parts, and materials</p>
            </div>
            <Link href="/items/create">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Item
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by part number, name, description, or supplier..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Table with Category Tabs */}
        <Tabs defaultValue="All" className="w-full">
          <TabsList className="grid w-full grid-cols-9">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    {category === "All" ? "All Items" : `${category} Items`} ({getItemsByCategory(category).length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getItemsByCategory(category).length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Part Number</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Unit Cost</TableHead>
                          <TableHead>Current Stock</TableHead>
                          <TableHead>Min/Max</TableHead>
                          <TableHead>Stock Status</TableHead>
                          <TableHead>Lead Time</TableHead>
                          <TableHead>Supplier</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getItemsByCategory(category).map((item) => {
                          const stockStatus = getStockStatus(item.currentStock, item.minStock, item.maxStock, item.category)
                          return (
                            <TableRow key={item.id}>
                              <TableCell className="font-mono font-medium">{item.partNumber}</TableCell>
                              <TableCell className="font-medium">{item.name}</TableCell>
                              <TableCell>
                                <Badge className={getCategoryColor(item.category)}>
                                  {item.category}
                                </Badge>
                              </TableCell>
                              <TableCell className="max-w-xs truncate" title={item.description}>
                                {item.description}
                              </TableCell>
                              <TableCell>{item.unit}</TableCell>
                              <TableCell className="font-mono">${item.unitCost.toFixed(2)}</TableCell>
                              <TableCell className="font-mono">{item.currentStock}</TableCell>
                              <TableCell className="font-mono text-sm">
                                {item.minStock} / {item.maxStock}
                              </TableCell>
                              <TableCell>
                                <Badge className={stockStatus.color}>
                                  {stockStatus.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{item.leadTime} days</TableCell>
                              <TableCell className="max-w-xs truncate" title={item.supplier}>
                                {item.supplier}
                              </TableCell>
                              <TableCell className="max-w-xs truncate" title={item.location}>
                                {item.location}
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
                          )
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                      <p className="text-gray-600 mb-4">
                        {searchTerm || statusFilter !== "all"
                          ? "Try adjusting your search or filters"
                          : `No ${category === "All" ? "" : category.toLowerCase()} items found`}
                      </p>
                      {!searchTerm && statusFilter === "all" && (
                        <Link href="/items/create">
                          <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add First Item
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Summary Stats */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Summary Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{filteredItems.length}</div>
                <div className="text-sm text-blue-800">Total Items</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {filteredItems.filter(item => item.status === "Active").length}
                </div>
                <div className="text-sm text-green-800">Active Items</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {filteredItems.filter(item =>
                    item.currentStock <= item.minStock
                  ).length}
                </div>
                <div className="text-sm text-red-800">Low Stock Items</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  ${filteredItems.reduce((sum, item) => sum + (item.unitCost * item.currentStock), 0).toFixed(2)}
                </div>
                <div className="text-sm text-yellow-800">Total Inventory Value</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function ItemsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ItemsContent />
    </Suspense>
  )
}
