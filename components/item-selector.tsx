'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Plus, Package, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react'
import { useDatabaseContext } from '@/components/database-provider'
import type { Item } from '@/lib/types'
import { calculateItemEconomics } from '@/lib/services/item-economics'

interface ItemSelectorProps {
  onItemSelect: (item: Item, quantity: number) => void
  selectedItems?: string[] // Array of already selected item IDs
  showSearch?: boolean
}

export default function ItemSelector({ onItemSelect, selectedItems = [], showSearch = true }: ItemSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  
  const { items } = useDatabaseContext()

  const categories = ['all', 'Raw Material', 'Fasteners', 'Consumables', 'Finishing', 'Structural Steel', 'Steel Plate']

  const filteredItems = items.filter((item) => {
    const matchesSearch = 
      (item.partNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.supplier || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    const isNotSelected = !selectedItems.includes(item.id)
    const isActive = item.status === 'Active'
    
    return matchesSearch && matchesCategory && isNotSelected && isActive
  })

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Raw Material': 'bg-blue-100 text-blue-800',
      'Fasteners': 'bg-green-100 text-green-800',
      'Consumables': 'bg-purple-100 text-purple-800',
      'Finishing': 'bg-orange-100 text-orange-800',
      'Structural Steel': 'bg-slate-100 text-slate-800',
      'Steel Plate': 'bg-gray-100 text-gray-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getStockStatus = (current: number, min: number) => {
    if (current <= min) return { status: 'Low Stock', color: 'bg-red-100 text-red-800' }
    if (current <= min * 1.5) return { status: 'Medium Stock', color: 'bg-yellow-100 text-yellow-800' }
    return { status: 'Good Stock', color: 'bg-green-100 text-green-800' }
  }

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: quantity
    }))
  }

  const handleAddItem = (item: Item) => {
    const quantity = quantities[item.id] || 1
    if (quantity > 0) {
      onItemSelect(item, quantity)
      // Clear the quantity for this item after adding
      setQuantities(prev => {
        const newQuantities = { ...prev }
        delete newQuantities[item.id]
        return newQuantities
      })
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'High': return 'bg-orange-100 text-orange-800'
      case 'Critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      {showSearch && (
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="border rounded-lg max-h-96 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Part Number</TableHead>
              <TableHead className="w-48">Name</TableHead>
              <TableHead className="w-32">Category</TableHead>
              <TableHead className="w-64">Description</TableHead>
              <TableHead className="w-20">Unit</TableHead>
              <TableHead className="w-24">Unit Cost</TableHead>
              <TableHead className="w-24">Stock</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-32">Qty</TableHead>
              <TableHead className="w-40">Economics</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => {
              const stockStatus = getStockStatus(item.currentStock, item.minStock)
              const quantity = quantities[item.id] || 1
              const totalCost = item.unitCost * quantity
              const itemEconomics = calculateItemEconomics(item, quantity)
              
              return (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  <TableCell className="font-mono font-medium text-sm">{item.partNumber || 'N/A'}</TableCell>
                  <TableCell className="font-medium text-sm">{item.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge className={`${getCategoryColor(item.category)} text-xs`}>
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm" title={item.description || ''}>
                    <div className="max-w-60 truncate">
                      {item.description || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{item.unit || 'N/A'}</TableCell>
                  <TableCell className="font-mono text-sm">MYR{(item.unitCost || 0).toFixed(2)}</TableCell>
                  <TableCell className="font-mono text-sm">{item.currentStock || 0}</TableCell>
                  <TableCell>
                    <Badge className={`${stockStatus.color} text-xs`}>
                      {stockStatus.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(item.id, Number.parseInt(e.target.value) || 1)}
                      className="w-24 h-8 text-sm"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-green-600" />
                        <span className="text-xs font-medium">MYR{totalCost.toFixed(2)}</span>
                      </div>
                      {itemEconomics.copperCost > 0 && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-orange-600" />
                          <span className="text-xs text-orange-600">+MYR{itemEconomics.copperCost.toFixed(2)} Cu</span>
                        </div>
                      )}
                      <Badge className={`${getRiskColor(itemEconomics.riskLevel)} text-xs`}>
                        {itemEconomics.riskLevel}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => handleAddItem(item)}
                      className={`text-xs ${
                        itemEconomics.riskLevel === 'Critical' 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : itemEconomics.riskLevel === 'High'
                          ? 'bg-orange-600 hover:bg-orange-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || categoryFilter !== 'all'
              ? 'Try adjusting your search or filters to find items'
              : 'No active items available in the selected category'}
          </p>
          {(searchTerm || categoryFilter !== 'all') && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setCategoryFilter('all')
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
