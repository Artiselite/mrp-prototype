"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, Search, MapPin, Building, DollarSign, TrendingUp, AlertTriangle, Download, Upload, FileText, Plus } from "lucide-react"
import Link from "next/link"
import { useDatabaseContext } from "@/components/database-provider"
import type { Location, Item } from "@/lib/types"

export default function InventoryPage() {
    const { locations } = useDatabaseContext().useLocations()
    const { items, createItem, updateItem, refreshItems } = useDatabaseContext().useItems()
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadMessage, setUploadMessage] = useState("")
    const [selectedImportType, setSelectedImportType] = useState("inbound")
    const [selectedExportType, setSelectedExportType] = useState("full-inventory")

    // Calculate inventory data for each location
    const locationInventory = locations.map(location => {
        const locationItems = items.filter(item => item.location === location.id)
        const totalUnits = locationItems.reduce((sum, item) => sum + item.currentStock, 0)
        const totalValue = locationItems.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0)
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
    const filteredLocations = locationInventory.filter(location =>
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.city.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Calculate overall inventory statistics
    const totalItems = items.length
    const totalUnits = items.reduce((sum, item) => sum + item.currentStock, 0)
    const totalValue = items.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0)
    const activeLocations = locations.filter(loc => loc.status === "Active").length

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

    const downloadTemplate = (type: 'inbound' | 'outbound' | 'transfer' | 'stock-update') => {
        let csvContent = ''
        let filename = ''

        switch (type) {
            case 'inbound':
                filename = 'inbound-template.csv'
                csvContent = `partNumber,quantity,location,supplier,poNumber,receivedDate,notes,qualityCheck,inspector
STEEL-001,500,WH-A-01,ABC Steel,PO-2024-001,2024-01-15,Received in good condition,Pass,John Smith
STEEL-002,300,WH-A-02,XYZ Metals,PO-2024-002,2024-01-15,Minor packaging damage,Fail,Jane Doe
STEEL-003,750,WH-B-01,Metro Supply,PO-2024-003,2024-01-16,Standard delivery,Pass,Mike Johnson`
                break

            case 'outbound':
                filename = 'outbound-template.csv'
                csvContent = `partNumber,quantity,fromLocation,customer,soNumber,shippedDate,carrier,trackingNumber,notes
STEEL-001,200,WH-A-01,Acme Corp,SO-2024-001,2024-01-15,FedEx,123456789,Express shipping requested
STEEL-002,150,WH-A-02,Global Inc,SO-2024-002,2024-01-15,UPS,987654321,Standard shipping
STEEL-003,300,WH-B-01,Tech Solutions,SO-2024-003,2024-01-16,DHL,456789123,Priority delivery`
                break

            case 'transfer':
                filename = 'transfer-template.csv'
                csvContent = `partNumber,quantity,fromLocation,toLocation,transferDate,reason,notes
STEEL-001,100,WH-A-01,WH-B-02,2024-01-15,Reorganization,Moving to better storage area
STEEL-002,50,WH-A-02,WH-C-01,2024-01-16,Space optimization,Consolidating inventory
STEEL-003,200,WH-B-01,WH-A-01,2024-01-17,Production needs,Moving closer to production line`
                break

            case 'stock-update':
                filename = 'stock-update-template.csv'
                csvContent = `partNumber,location,newStock,updateDate,reason,notes
STEEL-001,WH-A-01,750,2024-01-15,Physical count adjustment,Found additional units
STEEL-002,WH-A-02,250,2024-01-16,Inventory correction,Corrected counting error
STEEL-003,WH-B-01,800,2024-01-17,Production completion,New batch completed`
                break
        }

        // Create and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', filename)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // Export functionality
    const exportInventoryData = (exportType: string, format: string) => {
        let data: any[] = []
        let filename = ''
        let content = ''

        switch (exportType) {
            case 'full-inventory':
                data = items.map(item => ({
                    partNumber: item.partNumber,
                    name: item.name,
                    category: item.category,
                    description: item.description,
                    location: item.location,
                    currentStock: item.currentStock,
                    minStock: item.minStock,
                    maxStock: item.maxStock,
                    unitCost: item.unitCost,
                    totalValue: item.currentStock * item.unitCost,
                    unit: item.unit,
                    supplier: item.supplier,
                    status: item.status,
                    leadTime: item.leadTime,
                    specifications: item.specifications
                }))
                filename = 'full-inventory-report'
                break

            case 'by-location':
                data = locationInventory.map(loc => ({
                    locationCode: loc.code,
                    locationName: loc.name,
                    locationType: loc.type,
                    city: loc.city,
                    itemCount: loc.itemCount,
                    totalUnits: loc.totalUnits,
                    totalValue: loc.totalValue,
                    utilizationPercentage: loc.utilizationPercentage,
                    capacity: loc.capacity,
                    status: loc.status
                }))
                filename = 'inventory-by-location'
                break

            case 'low-stock':
                data = items
                    .filter(item => item.currentStock <= item.minStock)
                    .map(item => ({
                        partNumber: item.partNumber,
                        name: item.name,
                        category: item.category,
                        location: item.location,
                        currentStock: item.currentStock,
                        minStock: item.minStock,
                        maxStock: item.maxStock,
                        unitCost: item.unitCost,
                        totalValue: item.currentStock * item.unitCost,
                        status: item.status,
                        urgency: item.currentStock === 0 ? 'Critical' : 'Low'
                    }))
                filename = 'low-stock-items'
                break

            case 'value-report':
                data = items
                    .sort((a, b) => (b.currentStock * b.unitCost) - (a.currentStock * a.unitCost))
                    .map(item => ({
                        partNumber: item.partNumber,
                        name: item.name,
                        category: item.category,
                        location: item.location,
                        currentStock: item.currentStock,
                        unitCost: item.unitCost,
                        totalValue: item.currentStock * item.unitCost,
                        percentageOfTotal: ((item.currentStock * item.unitCost) / totalValue * 100).toFixed(2) + '%'
                    }))
                filename = 'inventory-value-report'
                break

            case 'movement-history':
                // This would typically come from a separate movements table
                // For now, we'll create a sample based on current data
                data = items.map(item => ({
                    partNumber: item.partNumber,
                    name: item.name,
                    location: item.location,
                    lastUpdated: item.updatedAt,
                    currentStock: item.currentStock,
                    previousStock: Math.max(0, item.currentStock - Math.floor(Math.random() * 100)), // Mock data
                    change: item.currentStock - Math.max(0, item.currentStock - Math.floor(Math.random() * 100)), // Mock data
                    changeType: Math.random() > 0.5 ? 'Inbound' : 'Outbound'
                }))
                filename = 'movement-history'
                break

            default:
                data = items
                filename = 'inventory-report'
        }

        if (format === 'csv') {
            if (data.length === 0) {
                alert('No data to export')
                return
            }

            const headers = Object.keys(data[0])
            const csvContent = [
                headers.join(','),
                ...data.map(row => headers.map(header => {
                    const value = row[header]
                    // Escape commas and quotes in CSV
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        return `"${value.replace(/"/g, '""')}"`
                    }
                    return value
                }).join(','))
            ].join('\n')

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')
            const url = URL.createObjectURL(blob)
            link.setAttribute('href', url)
            link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } else if (format === 'excel') {
            // For Excel, we'll create a CSV file with .xlsx extension
            // In a real implementation, you'd use a library like xlsx
            alert('Excel export would require additional libraries. For now, please use CSV format.')
        } else if (format === 'pdf') {
            // For PDF, we'll create a CSV file with .pdf extension
            // In a real implementation, you'd use a library like jsPDF
            alert('PDF export would require additional libraries. For now, please use CSV format.')
        }
    }

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            // Check file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                setUploadMessage("File size too large. Maximum size is 10MB.")
                return
            }

            // Check file type
            if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
                setUploadMessage("Please select a CSV or Excel file (.csv, .xlsx, .xls)")
                return
            }

            setSelectedFile(file)
            setUploadMessage("")
        }
    }

    const handleFileUpload = async () => {
        if (!selectedFile) {
            setUploadMessage("Please select a file first")
            return
        }

        setIsUploading(true)
        setUploadMessage("")

        try {
            const fileContent = await readFileContent(selectedFile)
            const parsedData = parseCSV(fileContent)

            if (parsedData.length === 0) {
                throw new Error("No data found in file")
            }

            // Validate and process data based on import type
            const validationResult = validateImportData(parsedData, selectedImportType)

                    if (!validationResult.isValid) {
            const requiredColumns = getRequiredColumns(selectedImportType)
            const errorMessage = `Validation failed for ${selectedImportType} import. 
            
Required columns: ${requiredColumns.join(', ')}

Errors: ${validationResult.errors.join(', ')}

Please ensure your file has the correct headers for ${selectedImportType} operations.`
            throw new Error(errorMessage)
        }

            // Process the data based on import type
            await processImportData(parsedData, selectedImportType)

            // Force a refresh to ensure UI updates
            refreshItems()

                        // Debug: Log the current items to see if they were updated
            console.log('After processing, items count:', items.length)
            console.log('Items:', items)
            
            // Show available part numbers for reference
            const availablePartNumbers = items.map(item => item.partNumber).join(', ')
            console.log('Available part numbers:', availablePartNumbers)
            
            setUploadMessage(`Successfully processed ${selectedFile.name} - ${parsedData.length} records imported`)
            setSelectedFile(null)

            // Reset the file input
            const fileInput = document.getElementById('file-upload') as HTMLInputElement
            if (fileInput) fileInput.value = ''

        } catch (error) {
            setUploadMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`)
        } finally {
            setIsUploading(false)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const files = e.dataTransfer.files
        if (files.length > 0) {
            const file = files[0]
            if (file.type === 'text/csv' ||
                file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.type === 'application/vnd.ms-excel' ||
                file.name.endsWith('.csv') ||
                file.name.endsWith('.xlsx') ||
                file.name.endsWith('.xls')) {
                setSelectedFile(file)
                setUploadMessage("")
            } else {
                setUploadMessage("Please select a CSV or Excel file (.csv, .xlsx, .xls)")
            }
        }
    }

    // File processing helper functions
    const readFileContent = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                const content = e.target?.result as string
                resolve(content)
            }
            reader.onerror = () => reject(new Error('Failed to read file'))
            reader.readAsText(file)
        })
    }

    const parseCSV = (csvContent: string): Record<string, string>[] => {
        const lines = csvContent.trim().split('\n')
        if (lines.length < 2) return []

        const headers = lines[0].split(',').map(h => h.trim())
        const data: Record<string, string>[] = []

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim())
            if (values.length === headers.length) {
                const row: Record<string, string> = {}
                headers.forEach((header, index) => {
                    row[header] = values[index] || ''
                })
                data.push(row)
            }
        }

        return data
    }

    const validateImportData = (data: Record<string, string>[], importType: string): { isValid: boolean; errors: string[] } => {
        const errors: string[] = []

        if (data.length === 0) {
            errors.push("No data rows found")
            return { isValid: false, errors }
        }

        // Check required columns based on import type
        const requiredColumns = getRequiredColumns(importType)
        const firstRow = data[0]
        
        console.log(`Validating ${importType} import with required columns:`, requiredColumns)
        console.log(`File headers found:`, Object.keys(firstRow))

        for (const column of requiredColumns) {
            if (!(column in firstRow)) {
                errors.push(`Missing required column: ${column}`)
            }
        }

        // Validate data rows
        data.forEach((row, index) => {
            const rowNumber = index + 2 // +2 because index 0 is headers, and we start counting from 1

            // Check for empty required fields
            for (const column of requiredColumns) {
                if (!row[column] || row[column].trim() === '') {
                    errors.push(`Row ${rowNumber}: ${column} is required`)
                }
            }

            // Validate quantities
            if (row.quantity && isNaN(Number(row.quantity))) {
                errors.push(`Row ${rowNumber}: quantity must be a number`)
            }

            // Validate dates
            if (row.receivedDate || row.shippedDate || row.transferDate || row.updateDate) {
                const dateField = row.receivedDate || row.shippedDate || row.transferDate || row.updateDate
                if (!isValidDate(dateField)) {
                    errors.push(`Row ${rowNumber}: invalid date format (use YYYY-MM-DD)`)
                }
            }
        })

        return { isValid: errors.length === 0, errors }
    }

    const getRequiredColumns = (importType: string): string[] => {
        switch (importType) {
            case 'inbound':
                return ['partNumber', 'quantity', 'location', 'supplier', 'poNumber', 'receivedDate']
            case 'outbound':
                return ['partNumber', 'quantity', 'fromLocation', 'customer', 'soNumber', 'shippedDate']
            case 'transfer':
                return ['partNumber', 'quantity', 'fromLocation', 'toLocation', 'transferDate']
            case 'stock-update':
                return ['partNumber', 'location', 'newStock', 'updateDate']
            default:
                return []
        }
    }

    const isValidDate = (dateString: string): boolean => {
        const date = new Date(dateString)
        return date instanceof Date && !isNaN(date.getTime())
    }

    const processImportData = async (data: Record<string, string>[], importType: string): Promise<void> => {
        for (const row of data) {
            try {
                switch (importType) {
                    case 'inbound':
                        await processInboundRow(row)
                        break
                    case 'outbound':
                        await processOutboundRow(row)
                        break
                    case 'transfer':
                        await processTransferRow(row)
                        break
                    case 'stock-update':
                        await processStockUpdateRow(row)
                        break
                }
            } catch (error) {
                console.error(`Error processing row:`, row, error)
                throw new Error(`Failed to process row: ${JSON.stringify(row)}`)
            }
        }
    }

    const processInboundRow = async (row: Record<string, string>): Promise<void> => {
        console.log('Processing inbound row:', row)

        // Find existing item or create new one
        const existingItem = items.find(item => item.partNumber === row.partNumber)

        if (existingItem) {
            // Update existing item stock
            const newStock = existingItem.currentStock + parseInt(row.quantity)
            console.log(`Updating existing item ${row.partNumber}: ${existingItem.currentStock} + ${row.quantity} = ${newStock}`)
            const updatedItem = updateItem(existingItem.id, { currentStock: newStock })
            console.log(`Updated item ${row.partNumber} stock to ${newStock}`, updatedItem)
        } else {
            // Create new item
            const newItem = {
                partNumber: row.partNumber,
                name: row.partNumber, // Use part number as name if not provided
                category: 'Raw Material',
                description: `Imported item: ${row.partNumber}`,
                unit: 'pcs',
                unitCost: 0, // Default cost
                minStock: 0,
                maxStock: 1000,
                currentStock: parseInt(row.quantity),
                leadTime: 7,
                supplier: row.supplier || 'Unknown',
                location: row.location || 'Default',
                status: 'Active' as const,
                specifications: row.notes || ''
            }
            console.log(`Creating new item:`, newItem)
            const createdItem = createItem(newItem)
            console.log(`Created new item: ${row.partNumber}`, createdItem)
        }
    }

        const processOutboundRow = async (row: Record<string, string>): Promise<void> => {
        const existingItem = items.find(item => item.partNumber === row.partNumber)
        
        if (existingItem) {
            const newStock = Math.max(0, existingItem.currentStock - parseInt(row.quantity))
            updateItem(existingItem.id, { currentStock: newStock })
            console.log(`Updated item ${row.partNumber} stock to ${newStock}`)
        } else {
            // Instead of throwing an error, log a warning and skip the row
            console.warn(`Item ${row.partNumber} not found for outbound - skipping row`)
            // Optionally, you could create a placeholder item or just continue
            // For now, we'll skip problematic rows to avoid failing the entire import
        }
    }

        const processTransferRow = async (row: Record<string, string>): Promise<void> => {
        const existingItem = items.find(item => item.partNumber === row.partNumber)
        
        if (existingItem) {
            // Update item location
            updateItem(existingItem.id, { location: row.toLocation })
            console.log(`Transferred item ${row.partNumber} to ${row.toLocation}`)
        } else {
            console.warn(`Item ${row.partNumber} not found for transfer - skipping row`)
        }
    }

        const processStockUpdateRow = async (row: Record<string, string>): Promise<void> => {
        const existingItem = items.find(item => item.partNumber === row.partNumber)
        
        if (existingItem) {
            const newStock = parseInt(row.newStock)
            updateItem(existingItem.id, { currentStock: newStock })
            console.log(`Updated item ${row.partNumber} stock to ${newStock}`)
        } else {
            console.warn(`Item ${row.partNumber} not found for stock update - skipping row`)
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
                            <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
                            <p className="text-sm text-gray-600">Monitor inventory levels, track movements, and perform bulk operations</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline">
                                <Package className="w-4 h-4 mr-2" />
                                Inbound
                            </Button>
                            <Button variant="outline">
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Outbound
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
                {/* Overall Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Units</p>
                                    <p className="text-2xl font-bold text-gray-900">{totalUnits.toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <DollarSign className="w-6 h-6 text-purple-600" />
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
                                <div className="p-3 bg-orange-100 rounded-lg">
                                    <Building className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Locations</p>
                                    <p className="text-2xl font-bold text-gray-900">{activeLocations}</p>
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
                                        placeholder="Search items by part number, name, or category..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="text-sm text-gray-600 flex items-center">
                                Showing {items.filter(item =>
                                    item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    item.category.toLowerCase().includes(searchTerm.toLowerCase())
                                ).length} of {items.length} items
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bulk Operations */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Bulk Operations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Bulk Import */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Upload className="w-5 h-5 text-blue-600" />
                                    <h3 className="text-lg font-medium">Bulk Import</h3>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Import inventory data from CSV/Excel files. Update stock levels, add new items, or modify existing records.
                                </p>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Import Type</label>
                                        <select
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            value={selectedImportType}
                                            onChange={(e) => setSelectedImportType(e.target.value)}
                                        >
                                            <option value="inbound">Inbound (Receiving)</option>
                                            <option value="outbound">Outbound (Shipping)</option>
                                            <option value="stock-update">Stock Level Update</option>
                                            <option value="transfer">Location Transfer</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => downloadTemplate('inbound')}
                                        >
                                            <Download className="w-4 h-4 mr-1" />
                                            Inbound
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => downloadTemplate('outbound')}
                                        >
                                            <Download className="w-4 h-4 mr-1" />
                                            Outbound
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => downloadTemplate('transfer')}
                                        >
                                            <Download className="w-4 h-4 mr-1" />
                                            Transfer
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => downloadTemplate('stock-update')}
                                        >
                                            <Download className="w-4 h-4 mr-1" />
                                            Stock Update
                                        </Button>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">File Upload</label>
                                        <div
                                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
                                            onDragOver={handleDragOver}
                                            onDrop={handleDrop}
                                        >
                                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-600">
                                                {selectedFile ? selectedFile.name : "Drag and drop CSV/Excel file here, or click to browse"}
                                            </p>
                                            <input
                                                id="file-upload"
                                                type="file"
                                                accept=".csv,.xlsx,.xls"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />
                                            <Button
                                                variant="outline"
                                                className="mt-2"
                                                onClick={() => document.getElementById('file-upload')?.click()}
                                            >
                                                Choose File
                                            </Button>
                                        </div>
                                        {selectedFile && (
                                            <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                                                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                                            </div>
                                        )}
                                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                                            <strong>Available Part Numbers:</strong> {items.length > 0 ? items.map(item => item.partNumber).join(', ') : 'None'}
                                        </div>
                                    </div>
                                    {uploadMessage && (
                                        <div className={`p-2 rounded text-sm ${uploadMessage.startsWith('Success')
                                            ? 'bg-green-50 text-green-800'
                                            : 'bg-red-50 text-red-800'
                                            }`}>
                                            {uploadMessage}
                                        </div>
                                    )}
                                    <Button
                                        className="w-full"
                                        onClick={handleFileUpload}
                                        disabled={!selectedFile || isUploading}
                                    >
                                        {isUploading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4 mr-2" />
                                                Import Data
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Bulk Export */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Download className="w-5 h-5 text-green-600" />
                                    <h3 className="text-lg font-medium">Bulk Export</h3>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Export inventory data to various formats for reporting, analysis, or backup purposes.
                                </p>
                                <div className="text-xs text-gray-500 space-y-1">
                                    <div><strong>Full Inventory:</strong> All items with complete details</div>
                                    <div><strong>By Location:</strong> Summary by location with utilization</div>
                                    <div><strong>Low Stock:</strong> Items below minimum stock levels</div>
                                    <div><strong>Value Report:</strong> Items sorted by total value</div>
                                    <div><strong>Movement History:</strong> Recent stock changes</div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Export Type</label>
                                        <select 
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            value={selectedExportType}
                                            onChange={(e) => setSelectedExportType(e.target.value)}
                                        >
                                            <option value="full-inventory">Full Inventory Report</option>
                                            <option value="by-location">Inventory by Location</option>
                                            <option value="low-stock">Low Stock Items</option>
                                            <option value="value-report">Inventory Value Report</option>
                                            <option value="movement-history">Movement History</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                                        <div className="flex gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="flex-1"
                                                onClick={() => exportInventoryData(selectedExportType, 'csv')}
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                CSV
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="flex-1"
                                                onClick={() => exportInventoryData(selectedExportType, 'excel')}
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                Excel
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="flex-1"
                                                onClick={() => exportInventoryData(selectedExportType, 'pdf')}
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                PDF
                                            </Button>
                                        </div>
                                    </div>
                                    <Button 
                                        className="w-full" 
                                        variant="outline"
                                        onClick={() => exportInventoryData(selectedExportType, 'csv')}
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Export Data
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Format Guide */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Upload Format Guide
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Inbound Format */}
                            <div className="space-y-3">
                                <h4 className="font-medium text-blue-600">📥 Inbound (Receiving) Format</h4>
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-sm text-blue-800 mb-2">
                                        <strong>Required Columns:</strong>
                                    </p>
                                    <ul className="text-xs text-blue-700 space-y-1">
                                        <li>• <code>partNumber</code> - Item part number</li>
                                        <li>• <code>quantity</code> - Quantity received</li>
                                        <li>• <code>location</code> - Location code (e.g., WH-A-01)</li>
                                        <li>• <code>supplier</code> - Supplier name</li>
                                        <li>• <code>poNumber</code> - Purchase order number</li>
                                        <li>• <code>receivedDate</code> - Date received (YYYY-MM-DD)</li>
                                    </ul>
                                    <p className="text-sm text-blue-800 mt-2">
                                        <strong>Optional Columns:</strong>
                                    </p>
                                    <ul className="text-xs text-blue-700 space-y-1">
                                        <li>• <code>notes</code> - Additional notes</li>
                                        <li>• <code>qualityCheck</code> - Pass/Fail</li>
                                        <li>• <code>inspector</code> - Inspector name</li>
                                    </ul>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => downloadTemplate('inbound')}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Inbound Template
                                </Button>
                            </div>

                            {/* Outbound Format */}
                            <div className="space-y-3">
                                <h4 className="font-medium text-green-600">📤 Outbound (Shipping) Format</h4>
                                <div className="bg-green-50 p-3 rounded-lg">
                                    <p className="text-sm text-green-800 mb-2">
                                        <strong>Required Columns:</strong>
                                    </p>
                                    <ul className="text-xs text-green-700 space-y-1">
                                        <li>• <code>partNumber</code> - Item part number</li>
                                        <li>• <code>quantity</code> - Quantity shipped</li>
                                        <li>• <code>fromLocation</code> - Source location code</li>
                                        <li>• <code>customer</code> - Customer name</li>
                                        <li>• <code>soNumber</code> - Sales order number</li>
                                        <li>• <code>shippedDate</code> - Date shipped (YYYY-MM-DD)</li>
                                    </ul>
                                    <p className="text-sm text-green-800 mt-2">
                                        <strong>Optional Columns:</strong>
                                    </p>
                                    <ul className="text-xs text-green-700 space-y-1">
                                        <li>• <code>carrier</code> - Shipping carrier</li>
                                        <li>• <code>trackingNumber</code> - Tracking number</li>
                                        <li>• <code>notes</code> - Additional notes</li>
                                    </ul>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => downloadTemplate('outbound')}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Outbound Template
                                </Button>
                            </div>
                        </div>

                        {/* Example Data */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <h5 className="font-medium mb-3">📋 Example CSV Format:</h5>
                            <div className="bg-white p-3 rounded border font-mono text-xs overflow-x-auto">
                                <div className="text-gray-600 mb-2">Inbound Example:</div>
                                <div>partNumber,quantity,location,supplier,poNumber,receivedDate,notes</div>
                                <div>STEEL-001,500,WH-A-01,ABC Steel,PO-2024-001,2024-01-15,Received in good condition</div>
                                <div>STEEL-002,300,WH-A-02,XYZ Metals,PO-2024-002,2024-01-15,Minor packaging damage</div>
                                <div className="text-gray-600 mt-3 mb-2">Outbound Example:</div>
                                <div>partNumber,quantity,fromLocation,customer,soNumber,shippedDate,carrier,trackingNumber</div>
                                <div>STEEL-001,200,WH-A-01,Acme Corp,SO-2024-001,2024-01-15,FedEx,123456789</div>
                                <div>STEEL-002,150,WH-A-02,Global Inc,SO-2024-002,2024-01-15,UPS,987654321</div>
                            </div>
                        </div>

                        {/* Validation Rules */}
                        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                            <h5 className="font-medium text-yellow-800 mb-2">⚠️ Important Validation Rules:</h5>
                            <ul className="text-sm text-yellow-700 space-y-1">
                                <li>• <strong>Part Numbers:</strong> Must exist in the system</li>
                                <li>• <strong>Locations:</strong> Must be valid location codes</li>
                                <li>• <strong>Quantities:</strong> Must be positive numbers</li>
                                <li>• <strong>Dates:</strong> Must be in YYYY-MM-DD format</li>
                                <li>• <strong>File Size:</strong> Maximum 10MB</li>
                                <li>• <strong>File Format:</strong> CSV or Excel (.xlsx)</li>
                                <li>• <strong>Encoding:</strong> UTF-8 recommended</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Movements */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Recent Inventory Movements
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <div>
                                        <div className="font-medium">Inbound: Steel Plates</div>
                                        <div className="text-sm text-gray-600">500 units received at Warehouse A</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-500">2 hours ago</div>
                                    <div className="text-sm font-medium text-blue-600">+500 units</div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <div>
                                        <div className="font-medium">Outbound: Finished Goods</div>
                                        <div className="text-sm text-gray-600">200 units shipped from Production Area</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-500">4 hours ago</div>
                                    <div className="text-sm font-medium text-green-600">-200 units</div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <div>
                                        <div className="font-medium">Transfer: Raw Materials</div>
                                        <div className="text-sm text-gray-600">150 units moved from Rack 1 to Rack 2</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-500">6 hours ago</div>
                                    <div className="text-sm font-medium text-purple-600">Transfer</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 text-center">
                            <Button variant="outline" size="sm">
                                View All Movements
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Locations Inventory Table */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Entire Inventory List
                                </CardTitle>
                                <div className="text-sm text-gray-600">
                                    Showing all {items.length} items across {locations.length} locations
                                </div>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => exportInventoryData('full-inventory', 'csv')}
                            >
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
                                    {items.filter(item =>
                                        item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        item.category.toLowerCase().includes(searchTerm.toLowerCase())
                                    ).length > 0 ? (
                                        items.filter(item =>
                                            item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            item.category.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).map((item) => (
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
                                                        <Button size="sm" variant="outline" onClick={() => downloadTemplate('inbound')}>
                                                            <Download className="w-4 h-4 mr-2" />
                                                            Download Template
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Empty state is now handled in the table body */}
                    </CardContent>
                </Card>

                {/* Low Stock Alerts */}
                {items.some(item => item.currentStock <= item.minStock) && (
                    <Card className="mt-6">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="flex items-center gap-2 text-red-600">
                                    <AlertTriangle className="w-5 h-5" />
                                    Low Stock Alerts
                                </CardTitle>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => exportInventoryData('low-stock', 'csv')}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Export Alerts
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {items
                                    .filter(item => item.currentStock <= item.minStock)
                                    .map(item => (
                                        <div key={item.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                                            <div>
                                                <div className="font-medium">{item.name}</div>
                                                <div className="text-sm text-gray-600">
                                                    {item.partNumber} • {item.category}
                                                </div>
                                                <div className="text-sm text-red-600">
                                                    Current: {item.currentStock} {item.unit} • Min: {item.minStock} {item.unit}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link href={`/items/${item.id}/edit`}>
                                                    <Button size="sm" variant="outline">
                                                        Update Stock
                                                    </Button>
                                                </Link>
                                                <Link href={`/locations/${item.location}`}>
                                                    <Button size="sm" variant="outline">
                                                        View Location
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    )
}
