"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    ArrowLeft,
    Save,
    Plus,
    X,
    Calculator,
    Wrench,
    FileText,
    ArrowRight,
    CheckCircle,
    Package
} from 'lucide-react'
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import { useDatabaseContext } from "@/components/database-provider"
import type { BillOfMaterials, BOMItem, BillOfQuantities, BOQItem, Item } from "@/lib/types"
import BOMCreateLoading from "./loading"

function CreateBOMContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const {
        billsOfMaterials: boms = [],
        engineeringProjects: projects = [],
        engineeringDrawings: drawings = [],
        billsOfQuantities: boqs = [],
        items: masterItems = [],
        createBillOfMaterials: createBom,
        updateBillOfQuantities: updateBoq,
        isInitialized
    } = useDatabaseContext()

    const [formData, setFormData] = useState({
        bomNumber: "",
        productName: "",
        version: "1.0",
        revision: "A",
        status: "Draft",
        bomType: "",
        createdBy: "",
        engineeringProjectId: "none",
        engineeringDrawingId: "none",
        boqId: "none",
        notes: "",
    })

    const [items, setItems] = useState<Omit<BOMItem, "id">[]>([])
    const [sourceBoq, setSourceBoq] = useState<BillOfQuantities | null>(null)
    const [newItem, setNewItem] = useState<Omit<BOMItem, "id">>({
        itemNumber: "",
        description: "",
        partNumber: "",
        quantity: 1,
        unit: "EA",
        unitCost: 0,
        totalCost: 0,
        materialGrade: "",
        specifications: "",
        supplier: "",
        leadTime: 0,
        category: "Raw Material",
        boqItemId: "",
    })
    const [selectedMasterItemId, setSelectedMasterItemId] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    // Initialize form based on URL parameters or BOQ data
    useEffect(() => {
        if (!isInitialized) return

        const boqId = searchParams.get('boqId')
        const drawingId = searchParams.get('drawingId')
        const projectId = searchParams.get('projectId')

        if (boqId) {
            console.log("BOQ ID from URL:", boqId)
            console.log("Available BOQs:", boqs.map((b: BillOfQuantities) => ({ id: b.id, number: b.boqNumber })))
            const boq = boqs.find((b: BillOfQuantities) => b.id === boqId)
            if (boq) {
                console.log("Found BOQ:", boq)
                setSourceBoq(boq)
                setFormData(prev => ({
                    ...prev,
                    boqId: boqId,
                    productName: `BOM for ${boq.projectName}`,
                    bomNumber: `BOM-${boq.boqNumber.replace('BOQ-', '')}`,
                    engineeringProjectId: boq.engineeringProjectId || "none",
                    engineeringDrawingId: boq.engineeringDrawingId || "none",
                }))
            } else {
                console.warn("BOQ not found with ID:", boqId)
            }
        }

        if (drawingId && !boqId) {
            setFormData(prev => ({ ...prev, engineeringDrawingId: drawingId }))
        }

        if (projectId && !boqId && !drawingId) {
            setFormData(prev => ({ ...prev, engineeringProjectId: projectId }))
        }
    }, [isInitialized, searchParams, boqs])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setSubmitError(null)

        try {
            // Validation
            if (!formData.bomNumber.trim()) {
                throw new Error("BOM Number is required")
            }
            if (!formData.productName.trim()) {
                throw new Error("Product Name is required")
            }
            if (items.length === 0) {
                throw new Error("At least one item is required")
            }

            // Validate each item
            for (const item of items) {
                if (!item.description.trim()) {
                    throw new Error("All items must have a description")
                }
                if (item.quantity <= 0) {
                    throw new Error("All items must have a positive quantity")
                }
                if (item.unitCost < 0) {
                    throw new Error("Unit cost cannot be negative")
                }
            }

            const bomData: Omit<BillOfMaterials, "id" | "createdAt" | "updatedAt"> = {
                ...formData,
                status: formData.status as BillOfMaterials["status"],
                bomType: formData.bomType as BillOfMaterials["bomType"],
                bomNumber: formData.bomNumber.trim(),
                productName: formData.productName.trim(),
                engineeringProjectId: formData.engineeringProjectId === "none" ? undefined : formData.engineeringProjectId,
                engineeringDrawingId: formData.engineeringDrawingId === "none" ? undefined : formData.engineeringDrawingId,
                boqId: formData.boqId === "none" ? undefined : formData.boqId,
                items: items.map((item, index) => ({
                    ...item,
                    id: `${formData.bomNumber.trim()}-I${index + 1}`,
                    totalCost: item.quantity * item.unitCost,
                })),
                totalCost: items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0),
                itemCount: items.length,
                revision: "A",
            }

            const newBom = await createBom(bomData)

            // Update BOQ with generated BOM reference if this was created from a BOQ
            if (sourceBoq && formData.boqId !== "none") {
                const updatedBoq: BillOfQuantities = {
                    ...sourceBoq,
                    generatedBOMs: [...(sourceBoq.generatedBOMs || []), newBom.id],
                    etoStatus: "BOM Generation",
                    engineeringProgress: Math.max(sourceBoq.engineeringProgress || 0, 75),
                    updatedAt: new Date().toISOString(),
                }

                // Update BOQ items to reflect BOM generation
                updatedBoq.items = sourceBoq.items.map(item => ({
                    ...item,
                    engineeringStatus: "BOM Generated" as BOQItem["engineeringStatus"],
                    bomId: newBom.id,
                }))

                updateBoq(updatedBoq.id, updatedBoq)
            }

            router.push(`/bom/${newBom.id}`)
        } catch (error) {
            console.error("Error creating BOM:", error)
            setSubmitError(error instanceof Error ? error.message : "Failed to create BOM")
        } finally {
            setIsSubmitting(false)
        }
    }

    const getNextItemNumber = () => {
        if (items.length === 0) return "1.0"
        const maxItemNumber = Math.max(
            ...items.map(item => {
                const num = parseFloat(item.itemNumber.split('.')[0]) || 0
                return num
            })
        )
        return `${maxItemNumber + 1}.0`
    }

    const handleMasterItemSelect = (itemId: string) => {
        if (itemId === "none") {
            setSelectedMasterItemId("")
            setNewItem(prev => ({
                ...prev,
                description: "",
                partNumber: "",
                unitCost: 0,
                unit: "EA",
                specifications: "",
                supplier: "",
                leadTime: 0,
                category: "Raw Material",
            }))
            return
        }

        const masterItem = masterItems.find((item: Item) => item.id === itemId)
        if (masterItem) {
            setSelectedMasterItemId(itemId)
            setNewItem(prev => ({
                ...prev,
                description: masterItem.name,
                partNumber: masterItem.partNumber,
                unitCost: masterItem.unitCost,
                unit: masterItem.unit,
                specifications: masterItem.specifications,
                supplier: masterItem.supplier,
                leadTime: masterItem.leadTime,
                category: masterItem.category as BOMItem["category"],
                materialGrade: extractMaterialGrade(masterItem.specifications),
            }))
        }
    }

    const addItem = () => {
        if (!newItem.description.trim()) return

        const itemToAdd = {
            ...newItem,
            itemNumber: getNextItemNumber(),
            totalCost: newItem.quantity * newItem.unitCost,
        }

        setItems([...items, itemToAdd])
        setNewItem({
            itemNumber: "",
            description: "",
            partNumber: "",
            quantity: 1,
            unit: "EA",
            unitCost: 0,
            totalCost: 0,
            materialGrade: "",
            specifications: "",
            supplier: "",
            leadTime: 0,
            category: "Raw Material",
            boqItemId: "",
        })
        setSelectedMasterItemId("")
    }

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const convertBoqItemToBom = (boqItem: BOQItem) => {
        try {
            console.log("Converting BOQ item:", boqItem)
            console.log("Available master items:", masterItems.length)

            // Find matching items from the item master based on BOQ item description and category
            const matchedItems = findMatchingMasterItems(boqItem)

            if (matchedItems.length === 0) {
                console.warn("No matching items found for BOQ item:", boqItem.description)
                // Create a placeholder BOM item if no matches found
                return [{
                    itemNumber: `${boqItem.itemNumber}.1`,
                    description: `${boqItem.description} (No Master Item Match)`,
                    partNumber: `PLACEHOLDER-${boqItem.id}`,
                    quantity: boqItem.quantity,
                    unit: boqItem.unit,
                    unitCost: boqItem.unitRate,
                    totalCost: 0,
                    materialGrade: "",
                    specifications: boqItem.specifications || "TBD - No master item found",
                    supplier: "TBD",
                    leadTime: 14,
                    category: "Raw Material" as BOMItem["category"],
                    boqItemId: boqItem.id,
                }]
            }

            // Convert matched master items to BOM items with calculated quantities
            const bomItems = matchedItems.map((matchItem, index) => {
                const calculatedQuantity = calculateQuantityForItem(boqItem, matchItem.masterItem)

                return {
                    itemNumber: `${boqItem.itemNumber}.${index + 1}`,
                    description: matchItem.masterItem.name,
                    partNumber: matchItem.masterItem.partNumber,
                    quantity: calculatedQuantity,
                    unit: matchItem.masterItem.unit,
                    unitCost: matchItem.masterItem.unitCost,
                    totalCost: 0, // Will be calculated later
                    materialGrade: extractMaterialGrade(matchItem.masterItem.specifications),
                    specifications: matchItem.masterItem.specifications,
                    supplier: matchItem.masterItem.supplier,
                    leadTime: matchItem.masterItem.leadTime,
                    category: matchItem.masterItem.category as BOMItem["category"],
                    boqItemId: boqItem.id,
                }
            })

            console.log(`Converted BOQ item ${boqItem.itemNumber} to ${bomItems.length} BOM items`)
            return bomItems

        } catch (error) {
            console.error("Error converting BOQ item:", error)
            // Return a fallback item to prevent crashes
            return [{
                itemNumber: `${boqItem.itemNumber}.1`,
                description: `Error Converting - ${boqItem.description}`,
                partNumber: `ERROR-${boqItem.id}`,
                quantity: boqItem.quantity,
                unit: boqItem.unit,
                unitCost: boqItem.unitRate,
                totalCost: 0,
                materialGrade: "",
                specifications: "Error occurred during conversion",
                supplier: "TBD",
                leadTime: 14,
                category: "Raw Material" as BOMItem["category"],
                boqItemId: boqItem.id,
            }]
        }
    }

    // Helper function to find matching master items for a BOQ item
    const findMatchingMasterItems = (boqItem: BOQItem) => {
        const matches: Array<{ masterItem: Item; matchScore: number }> = []

        masterItems.forEach((masterItem: Item) => {
            const score = calculateMatchScore(boqItem, masterItem)
            if (score > 0) {
                matches.push({ masterItem, matchScore: score })
            }
        })

        // Sort by match score (highest first) and return top matches
        return matches
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 3) // Return top 3 matches maximum
    }

    // Helper function to calculate how well a master item matches a BOQ item
    const calculateMatchScore = (boqItem: BOQItem, masterItem: Item): number => {
        let score = 0

        const boqDesc = boqItem.description.toLowerCase()
        const boqSpecs = (boqItem.specifications || "").toLowerCase()
        const itemName = masterItem.name.toLowerCase()
        const itemDesc = masterItem.description.toLowerCase()
        const itemSpecs = masterItem.specifications.toLowerCase()

        // Direct keyword matching
        const keywords = [
            'steel', 'aluminum', 'pipe', 'bolt', 'plate', 'beam', 'channel',
            'weld', 'finish', 'fastener', 'material', 'raw'
        ]

        keywords.forEach(keyword => {
            if (boqDesc.includes(keyword) && (itemName.includes(keyword) || itemDesc.includes(keyword))) {
                score += 20
            }
        })

        // Category matching
        if (boqItem.category === "Material" && masterItem.category === "Raw Material") {
            score += 30
        }
        if (boqItem.category === "Labor" && masterItem.category === "Consumables") {
            score += 15
        }

        // Specification matching
        if (boqSpecs && itemSpecs) {
            const specKeywords = ['a36', 'a992', 'grade', 'astm', '6061', 'schedule']
            specKeywords.forEach(keyword => {
                if (boqSpecs.includes(keyword) && itemSpecs.includes(keyword)) {
                    score += 25
                }
            })
        }

        // Size/dimension matching (basic)
        const sizePattern = /\d+["']\s*x\s*\d+["']|\d+["']|\d+\s*mm|\d+\s*inch/g
        const boqSizes = boqDesc.match(sizePattern) || []
        const itemSizes = itemName.match(sizePattern) || []

        if (boqSizes.length > 0 && itemSizes.length > 0) {
            boqSizes.forEach(boqSize => {
                if (itemSizes.some(itemSize => itemSize === boqSize)) {
                    score += 15
                }
            })
        }

        return score
    }

    // Helper function to calculate quantity needed from master item for BOQ requirement
    const calculateQuantityForItem = (boqItem: BOQItem, masterItem: Item): number => {
        // Base quantity calculation - can be enhanced with more sophisticated logic
        let baseQuantity = boqItem.quantity

        // Unit conversion logic
        if (boqItem.unit === "MT" && masterItem.unit === "EA") {
            // Convert metric tons to pieces (rough estimation)
            baseQuantity = Math.ceil(boqItem.quantity * 40) // Assume ~25kg per piece average
        } else if (boqItem.unit === "M" && masterItem.unit === "FT") {
            // Convert meters to feet
            baseQuantity = Math.ceil(boqItem.quantity * 3.28084)
        } else if (boqItem.unit === "M2" && masterItem.unit === "EA") {
            // Convert square meters to pieces (plates/sheets)
            baseQuantity = Math.ceil(boqItem.quantity / 4) // Assume 4 sq meters per piece
        }

        // Apply multipliers based on item type
        if (masterItem.category === "Fasteners") {
            baseQuantity = Math.ceil(baseQuantity * 10) // More fasteners needed
        } else if (masterItem.category === "Consumables") {
            baseQuantity = Math.ceil(baseQuantity * 1.5) // Add waste factor
        }

        return Math.max(1, baseQuantity) // Ensure at least 1
    }

    // Helper function to extract material grade from specifications
    const extractMaterialGrade = (specifications: string): string => {
        const gradeMatches = specifications.match(/A\d+|Grade\s+\d+|\d{4}-T\d+/i)
        return gradeMatches ? gradeMatches[0] : ""
    }

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "Raw Material": return "bg-blue-100 text-blue-800"
            case "Fasteners": return "bg-green-100 text-green-800"
            case "Consumables": return "bg-yellow-100 text-yellow-800"
            case "Finishing": return "bg-purple-100 text-purple-800"
            default: return "bg-gray-100 text-gray-800"
        }
    }

    if (!isInitialized) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/bom">
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="w-4 h-4" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Create Bill of Materials</h1>
                                <p className="text-gray-600">
                                    {sourceBoq ? `Converting BOQ ${sourceBoq.boqNumber} to detailed BOM` : "Create new BOM - standalone or from BOQ"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {sourceBoq && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                    <Wrench className="w-4 h-4 mr-1" />
                                    ETO Conversion
                                </Badge>
                            )}
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || items.length === 0 || !formData.bomNumber.trim() || !formData.productName.trim()}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Create BOM
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Error Alert */}
                {submitError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <X className="h-5 w-5 text-red-400" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error Creating BOM</h3>
                                <div className="mt-2 text-sm text-red-700">{submitError}</div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 text-red-600 hover:text-red-700"
                            onClick={() => setSubmitError(null)}
                        >
                            Dismiss
                        </Button>
                    </div>
                )}

                <Tabs defaultValue={sourceBoq ? "boq-conversion" : "standalone"} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="standalone" className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Standalone BOM
                        </TabsTrigger>
                        <TabsTrigger value="boq-conversion" className="flex items-center gap-2">
                            <Calculator className="w-4 h-4" />
                            BOQ to BOM Conversion
                        </TabsTrigger>
                    </TabsList>

                    {/* Standalone BOM Creation */}
                    <TabsContent value="standalone" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>Define the core BOM details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="bomNumber">BOM Number *</Label>
                                        <Input
                                            id="bomNumber"
                                            value={formData.bomNumber}
                                            onChange={(e) => setFormData(prev => ({ ...prev, bomNumber: e.target.value }))}
                                            placeholder="e.g., BOM-2024-001"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="productName">Product Name *</Label>
                                        <Input
                                            id="productName"
                                            value={formData.productName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                                            placeholder="e.g., Steel Frame Assembly"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="version">Version</Label>
                                        <Input
                                            id="version"
                                            value={formData.version}
                                            onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="revision">Revision</Label>
                                        <Input
                                            id="revision"
                                            value={formData.revision}
                                            onChange={(e) => setFormData(prev => ({ ...prev, revision: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="bomType">BOM Type</Label>
                                        <Select value={formData.bomType} onValueChange={(value) => setFormData(prev => ({ ...prev, bomType: value }))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="EBOM">Engineering BOM</SelectItem>
                                                <SelectItem value="MBOM">Manufacturing BOM</SelectItem>
                                                <SelectItem value="PBOM">Production BOM</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="engineeringProjectId">Engineering Project</Label>
                                        <Select value={formData.engineeringProjectId} onValueChange={(value) => setFormData(prev => ({ ...prev, engineeringProjectId: value }))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select project" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                {projects.map((project: any) => (
                                                    <SelectItem key={project.id} value={project.id}>
                                                        {project.projectNumber} - {project.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="engineeringDrawingId">Engineering Drawing</Label>
                                        <Select value={formData.engineeringDrawingId} onValueChange={(value) => setFormData(prev => ({ ...prev, engineeringDrawingId: value }))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select drawing" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                {drawings.map((drawing: any) => (
                                                    <SelectItem key={drawing.id} value={drawing.id}>
                                                        {drawing.drawingNumber} - {drawing.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="createdBy">Created By</Label>
                                    <Input
                                        id="createdBy"
                                        value={formData.createdBy}
                                        onChange={(e) => setFormData(prev => ({ ...prev, createdBy: e.target.value }))}
                                        placeholder="Enter creator name"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                        placeholder="Additional notes or comments"
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Add Items Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Add BOM Items</CardTitle>
                                <CardDescription>Select items from the master catalog to add to this BOM</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="masterItem">Select Item from Master Catalog</Label>
                                    <Select value={selectedMasterItemId} onValueChange={handleMasterItemSelect}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose an item from master catalog" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Manual Entry (No Master Item)</SelectItem>
                                            {masterItems.map((item: Item) => (
                                                <SelectItem key={item.id} value={item.id}>
                                                    {item.partNumber} - {item.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Item Details Preview */}
                                {selectedMasterItemId && (
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <h4 className="font-medium text-blue-900 mb-2">Master Item Details:</h4>
                                        {(() => {
                                            const item = masterItems.find((i: Item) => i.id === selectedMasterItemId)
                                            return item ? (
                                                <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
                                                    <div><span className="font-medium">Part Number:</span> {item.partNumber}</div>
                                                    <div><span className="font-medium">Category:</span> {item.category}</div>
                                                    <div><span className="font-medium">Unit Cost:</span> ${item.unitCost.toFixed(2)}</div>
                                                    <div><span className="font-medium">Supplier:</span> {item.supplier}</div>
                                                    <div className="col-span-2"><span className="font-medium">Description:</span> {item.description}</div>
                                                </div>
                                            ) : null
                                        })()}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="itemDescription">Description *</Label>
                                        <Input
                                            id="itemDescription"
                                            value={newItem.description}
                                            onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Item description"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="itemPartNumber">Part Number</Label>
                                        <Input
                                            id="itemPartNumber"
                                            value={newItem.partNumber}
                                            onChange={(e) => setNewItem(prev => ({ ...prev, partNumber: e.target.value }))}
                                            placeholder="Part number"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    <div>
                                        <Label htmlFor="itemQuantity">Quantity *</Label>
                                        <Input
                                            id="itemQuantity"
                                            type="number"
                                            min="1"
                                            value={newItem.quantity}
                                            onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="itemUnit">Unit</Label>
                                        <Select value={newItem.unit} onValueChange={(value) => setNewItem(prev => ({ ...prev, unit: value }))}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="EA">Each</SelectItem>
                                                <SelectItem value="FT">Feet</SelectItem>
                                                <SelectItem value="LB">Pounds</SelectItem>
                                                <SelectItem value="GAL">Gallons</SelectItem>
                                                <SelectItem value="M">Meters</SelectItem>
                                                <SelectItem value="KG">Kilograms</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="itemUnitCost">Unit Cost</Label>
                                        <Input
                                            id="itemUnitCost"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={newItem.unitCost}
                                            onChange={(e) => setNewItem(prev => ({ ...prev, unitCost: parseFloat(e.target.value) || 0 }))}
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <Button onClick={addItem} disabled={!newItem.description.trim()} className="w-full">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Item
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* BOQ to BOM Conversion */}
                    <TabsContent value="boq-conversion" className="space-y-6">
                        {sourceBoq ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-blue-600" />
                                        Converting BOQ: {sourceBoq.boqNumber}
                                    </CardTitle>
                                    <CardDescription>{sourceBoq.title} - {sourceBoq.projectName}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-blue-50 rounded-lg">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <span className="font-medium text-blue-900">Items Available:</span>
                                                    <p className="text-blue-700">{sourceBoq.items.length}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-blue-900">Engineering Progress:</span>
                                                    <p className="text-blue-700">{sourceBoq.engineeringProgress || 0}%</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-blue-900">ETO Status:</span>
                                                    <p className="text-blue-700">{sourceBoq.etoStatus || "BOQ Submitted"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="font-medium">BOQ Items for Conversion:</h4>
                                                <Button
                                                    onClick={() => {
                                                        sourceBoq.items.forEach(item => {
                                                            const convertedItems = convertBoqItemToBom(item)
                                                            setItems(prev => [...prev, ...convertedItems])
                                                        })
                                                    }}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <ArrowRight className="w-4 h-4 mr-1" />
                                                    Convert All Items
                                                </Button>
                                            </div>
                                            <div className="space-y-2">
                                                {sourceBoq.items.map((item) => (
                                                    <div key={item.id} className="p-3 border rounded-lg hover:bg-gray-50">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1">
                                                                <p className="font-medium">{item.itemNumber}: {item.description}</p>
                                                                <p className="text-sm text-gray-600">{item.quantity} {item.unit} @ ${item.unitRate.toFixed(2)}</p>
                                                                <p className="text-sm text-gray-500">{item.specifications}</p>
                                                                <div className="flex gap-2 mt-1">
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {item.category}
                                                                    </Badge>
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {item.engineeringStatus || "Pending"}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                onClick={() => {
                                                                    const convertedItems = convertBoqItemToBom(item)
                                                                    setItems(prev => [...prev, ...convertedItems])
                                                                }}
                                                                size="sm"
                                                                variant="outline"
                                                                disabled={item.engineeringStatus === "BOM Generated"}
                                                            >
                                                                <ArrowRight className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Select BOQ for Conversion</CardTitle>
                                    <CardDescription>Choose a BOQ to convert into a detailed BOM</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <div>
                                                <Label htmlFor="boqId">Select BOQ to Convert</Label>
                                                <Select value={formData.boqId} onValueChange={(value) => {
                                                    setFormData(prev => ({ ...prev, boqId: value }))
                                                    if (value !== "none") {
                                                        const boq = boqs.find((b: BillOfQuantities) => b.id === value)
                                                        if (boq) {
                                                            setSourceBoq(boq)
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                boqId: boq.id,
                                                                productName: `BOM for ${boq.projectName}`,
                                                                bomNumber: `BOM-${boq.boqNumber.replace('BOQ-', '')}`,
                                                                engineeringProjectId: boq.engineeringProjectId || "none",
                                                                engineeringDrawingId: boq.engineeringDrawingId || "none",
                                                            }))
                                                        }
                                                    } else {
                                                        setSourceBoq(null)
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            boqId: "none",
                                                            productName: "",
                                                            bomNumber: "",
                                                        }))
                                                    }
                                                }}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select BOQ" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">None</SelectItem>
                                                        {boqs.map((boq: BillOfQuantities) => (
                                                            <SelectItem key={boq.id} value={boq.id}>
                                                                {boq.boqNumber} - {boq.title}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <p className="text-sm text-gray-500">Or switch to "Standalone BOM" tab to create a BOM from scratch</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Generated Items (shared between both tabs) */}
                    {items.length > 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>BOM Items ({items.length})</CardTitle>
                                <CardDescription>
                                    Review and modify the items that will be included in the BOM
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-20">Item #</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead>Part Number</TableHead>
                                                <TableHead className="w-20">Qty</TableHead>
                                                <TableHead className="w-16">Unit</TableHead>
                                                <TableHead className="w-24">Unit Cost</TableHead>
                                                <TableHead className="w-24">Total Cost</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead className="w-16">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{item.itemNumber}</TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{item.description}</p>
                                                            {item.specifications && (
                                                                <p className="text-sm text-gray-500">{item.specifications}</p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{item.partNumber}</TableCell>
                                                    <TableCell>{item.quantity}</TableCell>
                                                    <TableCell>{item.unit}</TableCell>
                                                    <TableCell>${item.unitCost.toFixed(2)}</TableCell>
                                                    <TableCell>${(item.quantity * item.unitCost).toFixed(2)}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={getCategoryColor(item.category)}>
                                                            {item.category}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeItem(index)}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <div className="mt-4 flex justify-between items-center">
                                    <div className="text-sm text-gray-500">
                                        Total Items: {items.length}
                                    </div>
                                    <div className="text-lg font-semibold">
                                        Total Cost: ${items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0).toFixed(2)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="py-8">
                                <div className="text-center text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No items added yet. Add items manually or convert from BOQ above.</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </Tabs>
            </div>
        </div>
    )
}

export default function CreateBOMPage() {
    return (
        <Suspense fallback={<BOMCreateLoading />}>
            <CreateBOMContent />
        </Suspense>
    )
}
