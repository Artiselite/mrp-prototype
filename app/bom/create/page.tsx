"use client"

import { useState, useEffect } from "react"
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

export default function CreateBOMPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const {
        useBillsOfMaterials,
        useEngineeringProjects,
        useEngineeringDrawings,
        useBillsOfQuantities,
        useItems,
        isInitialized
    } = useDatabaseContext()

    const { boms, createBom } = useBillsOfMaterials()
    const { projects = [] } = useEngineeringProjects()
    const { drawings = [] } = useEngineeringDrawings()
    const { boqs = [], updateBoq } = useBillsOfQuantities()
    const { items: masterItems = [] } = useItems()

    const [formData, setFormData] = useState({
        bomNumber: "",
        productName: "",
        version: "1.0",
        bomType: "EBOM" as BillOfMaterials["bomType"],
        status: "Draft" as BillOfMaterials["status"],
        engineeringProjectId: "none",
        engineeringDrawingId: "none",
        boqId: "none",
        createdBy: "",
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
        category: "Raw Material" as BOMItem["category"],
        boqItemId: "",
    })

    const [selectedMasterItemId, setSelectedMasterItemId] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    // Pre-populate from URL parameters
    useEffect(() => {
        if (!isInitialized) return

        const boqId = searchParams.get('boqId')
        const drawingId = searchParams.get('drawingId')
        const projectId = searchParams.get('projectId')

        if (boqId) {
            const boq = boqs.find(b => b.id === boqId)
            if (boq) {
                setSourceBoq(boq)
                setFormData(prev => ({
                    ...prev,
                    boqId: boqId,
                    productName: `BOM for ${boq.projectName}`,
                    bomNumber: `BOM-${boq.boqNumber.replace('BOQ-', '')}`,
                    engineeringProjectId: boq.engineeringProjectId || "none",
                    engineeringDrawingId: boq.engineeringDrawingId || "none",
                }))
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
                    throw new Error("All items must have a quantity greater than 0")
                }
                if (item.unitCost < 0) {
                    throw new Error("Unit cost cannot be negative")
                }
            }

            const bomData: Omit<BillOfMaterials, "id" | "createdAt" | "updatedAt"> = {
                ...formData,
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

                await updateBoq(updatedBoq)
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
        const masterItem = masterItems.find(item => item.id === itemId)
        if (masterItem) {
            setNewItem({
                itemNumber: getNextItemNumber(),
                description: masterItem.name,
                partNumber: masterItem.partNumber,
                quantity: 1,
                unit: masterItem.unit,
                unitCost: masterItem.unitCost,
                totalCost: masterItem.unitCost,
                materialGrade: "",
                specifications: masterItem.specifications,
                supplier: masterItem.supplier,
                leadTime: masterItem.leadTime,
                category: masterItem.category as BOMItem["category"],
                boqItemId: "",
            })
            setSelectedMasterItemId(itemId)
        }
    }

    const addItem = () => {
        if (!newItem.description || newItem.quantity <= 0) return

        const totalCost = newItem.quantity * newItem.unitCost
        setItems([...items, { ...newItem, totalCost }])

        // Reset form
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
            category: "Raw Material" as BOMItem["category"],
            boqItemId: "",
        })
        setSelectedMasterItemId("")
    }

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const convertBoqItemToBom = (boqItem: BOQItem) => {
        try {
            // ETO Conversion Logic: High-level BOQ item → Detailed BOM components
            const baseComponents = []

            // Example conversion logic based on BOQ item description and work package
            if (boqItem.workPackage?.toLowerCase().includes('structural steel') ||
                boqItem.description.toLowerCase().includes('steel')) {

                // Convert "20 MT structural steel" into detailed components
                if (boqItem.description.toLowerCase().includes('beam')) {
                    baseComponents.push({
                        itemNumber: `${boqItem.itemNumber}.1`,
                        description: `W12x26 Steel I-Beam`,
                        partNumber: `STL-W12x26`,
                        quantity: Math.ceil(boqItem.quantity * 2.5), // Estimate based on tonnage
                        unit: "EA",
                        unitCost: 245.00,
                        totalCost: 0,
                        materialGrade: "A992",
                        specifications: "ASTM A992/A992M Grade 50",
                        supplier: "Steel Supply Co.",
                        leadTime: 14,
                        category: "Structural Steel" as BOMItem["category"],
                        boqItemId: boqItem.id,
                    })

                    baseComponents.push({
                        itemNumber: `${boqItem.itemNumber}.2`,
                        description: `Steel Channel C12x20.7`,
                        partNumber: `STL-C12x20.7`,
                        quantity: Math.ceil(boqItem.quantity * 6),
                        unit: "EA",
                        unitCost: 180.00,
                        totalCost: 0,
                        materialGrade: "A36",
                        specifications: "ASTM A36/A36M",
                        supplier: "Steel Supply Co.",
                        leadTime: 14,
                        category: "Structural Steel" as BOMItem["category"],
                        boqItemId: boqItem.id,
                    })

                    baseComponents.push({
                        itemNumber: `${boqItem.itemNumber}.3`,
                        description: `Steel Plate 1/2" x 12" x 20"`,
                        partNumber: `STL-PLT-0.5x12x20`,
                        quantity: Math.ceil(boqItem.quantity * 15),
                        unit: "EA",
                        unitCost: 85.00,
                        totalCost: 0,
                        materialGrade: "A36",
                        specifications: "ASTM A36/A36M Hot Rolled",
                        supplier: "Steel Supply Co.",
                        leadTime: 10,
                        category: "Steel Plate" as BOMItem["category"],
                        boqItemId: boqItem.id,
                    })
                }

            } else if (boqItem.workPackage?.toLowerCase().includes('piping') ||
                boqItem.description.toLowerCase().includes('pipe')) {

                // Convert piping BOQ item into detailed pipe components
                baseComponents.push({
                    itemNumber: `${boqItem.itemNumber}.1`,
                    description: `6" CS Pipe ASTM A106 Grade B`,
                    partNumber: `PIPE-6-A106-B`,
                    quantity: Math.ceil(boqItem.quantity * 1.1), // 10% extra for waste
                    unit: "FT",
                    unitCost: 45.00,
                    totalCost: 0,
                    materialGrade: "A106 Grade B",
                    specifications: "ASTM A106 Grade B Seamless",
                    supplier: "Pipe & Valve Supply",
                    leadTime: 21,
                    category: "Piping" as BOMItem["category"],
                    boqItemId: boqItem.id,
                })

                baseComponents.push({
                    itemNumber: `${boqItem.itemNumber}.2`,
                    description: `6" 90° Elbow ASTM A234 WPB`,
                    partNumber: `ELB-6-90-WPB`,
                    quantity: Math.ceil(boqItem.quantity / 25), // Estimate elbows per length
                    unit: "EA",
                    unitCost: 120.00,
                    totalCost: 0,
                    materialGrade: "A234 WPB",
                    specifications: "ASTM A234 WPB Butt Weld",
                    supplier: "Pipe & Valve Supply",
                    leadTime: 28,
                    category: "Pipe Fittings" as BOMItem["category"],
                    boqItemId: boqItem.id,
                })

                baseComponents.push({
                    itemNumber: `${boqItem.itemNumber}.3`,
                    description: `6" ANSI B16.5 Flange`,
                    partNumber: `FLG-6-B16.5`,
                    quantity: Math.ceil(boqItem.quantity / 20),
                    unit: "EA",
                    unitCost: 95.00,
                    totalCost: 0,
                    materialGrade: "A105",
                    specifications: "ANSI B16.5 Slip-On Flange",
                    supplier: "Pipe & Valve Supply",
                    leadTime: 21,
                    category: "Pipe Fittings" as BOMItem["category"],
                    boqItemId: boqItem.id,
                })
            } else {
                // Generic conversion for other items
                baseComponents.push({
                    itemNumber: `${boqItem.itemNumber}.1`,
                    description: boqItem.description,
                    partNumber: `GEN-${boqItem.itemNumber.replace('.', '-')}`,
                    quantity: boqItem.quantity,
                    unit: boqItem.unit,
                    unitCost: boqItem.unitRate * 0.7, // Assume 70% material cost
                    totalCost: 0,
                    materialGrade: "",
                    specifications: boqItem.specifications || "",
                    supplier: "To Be Determined",
                    leadTime: 30,
                    category: "General" as BOMItem["category"],
                    boqItemId: boqItem.id,
                })
            }

            return baseComponents.map(comp => ({ ...comp, totalCost: comp.quantity * comp.unitCost }))
        } catch (error) {
            console.error("Error converting BOQ item to BOM:", error)
            // Return a default fallback item
            return [{
                itemNumber: `${boqItem.itemNumber || 'X'}.1`,
                description: `${boqItem.description} (Raw)`,
                partNumber: `${boqItem.itemNumber || 'X'}-RAW`,
                quantity: boqItem.quantity,
                unit: boqItem.unit,
                unitCost: boqItem.unitRate,
                totalCost: boqItem.quantity * boqItem.unitRate,
                materialGrade: "",
                specifications: boqItem.specifications || "",
                supplier: "",
                leadTime: 14,
                category: "General" as BOMItem["category"],
                boqItemId: boqItem.id,
            }]
        }
    }

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "Structural Steel": return "bg-blue-100 text-blue-800"
            case "Steel Plate": return "bg-indigo-100 text-indigo-800"
            case "Piping": return "bg-green-100 text-green-800"
            case "Pipe Fittings": return "bg-emerald-100 text-emerald-800"
            case "Raw Material": return "bg-gray-100 text-gray-800"
            case "Fabricated": return "bg-orange-100 text-orange-800"
            case "Hardware": return "bg-purple-100 text-purple-800"
            default: return "bg-gray-100 text-gray-800"
        }
    }

    if (!isInitialized) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    const totalCost = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/bom">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to BOMs
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
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {submitError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center">
                            <X className="w-5 h-5 text-red-500 mr-2" />
                            <p className="text-red-700 font-medium">Error</p>
                        </div>
                        <p className="mt-1 text-sm text-red-600">{submitError}</p>
                        <Button
                            onClick={() => setSubmitError(null)}
                            variant="outline"
                            size="sm"
                            className="mt-2 text-red-600 border-red-300 hover:bg-red-50"
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
                            <Wrench className="w-4 h-4" />
                            BOQ to BOM Conversion
                        </TabsTrigger>
                    </TabsList>

                    {/* Standalone BOM Creation */}
                    <TabsContent value="standalone" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Create Standalone BOM
                                </CardTitle>
                                <CardDescription>Create a new BOM from scratch without BOQ conversion</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <Label htmlFor="bomNumber">BOM Number</Label>
                                        <Input
                                            id="bomNumber"
                                            value={formData.bomNumber}
                                            onChange={(e) => setFormData(prev => ({ ...prev, bomNumber: e.target.value }))}
                                            placeholder="BOM-2024-001"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="productName">Product Name</Label>
                                        <Input
                                            id="productName"
                                            value={formData.productName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                                            placeholder="Custom Steel Assembly"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <Label htmlFor="version">Version</Label>
                                        <Input
                                            id="version"
                                            value={formData.version}
                                            onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                                            placeholder="1.0"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="bomType">BOM Type</Label>
                                        <Select value={formData.bomType} onValueChange={(value) => setFormData(prev => ({ ...prev, bomType: value as BillOfMaterials["bomType"] }))}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="EBOM">Engineering BOM</SelectItem>
                                                <SelectItem value="MBOM">Manufacturing BOM</SelectItem>
                                                <SelectItem value="PBOM">Production BOM</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="createdBy">Created By</Label>
                                        <Input
                                            id="createdBy"
                                            value={formData.createdBy}
                                            onChange={(e) => setFormData(prev => ({ ...prev, createdBy: e.target.value }))}
                                            placeholder="Engineer Name"
                                        />
                                    </div>
                                </div>

                                {/* Optional Links */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="engineeringProjectId">Engineering Project (Optional)</Label>
                                        <Select value={formData.engineeringProjectId} onValueChange={(value) => setFormData(prev => ({ ...prev, engineeringProjectId: value }))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select project" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                {projects.map((project) => (
                                                    <SelectItem key={project.id} value={project.id}>
                                                        {project.projectNumber}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="engineeringDrawingId">Engineering Drawing (Optional)</Label>
                                        <Select value={formData.engineeringDrawingId} onValueChange={(value) => setFormData(prev => ({ ...prev, engineeringDrawingId: value }))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select drawing" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                {drawings.map((drawing) => (
                                                    <SelectItem key={drawing.id} value={drawing.id}>
                                                        {drawing.drawingNumber} - {drawing.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Item Master Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Add BOM Items</CardTitle>
                                <CardDescription>Select items from the item master and specify quantities</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                    <h4 className="font-medium">Select Item from Master</h4>

                                    <div>
                                        <Label htmlFor="masterItem">Item Master</Label>
                                        <Select value={selectedMasterItemId} onValueChange={handleMasterItemSelect}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an item from master" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {masterItems.filter(item => item.status === "Active").map((item) => (
                                                    <SelectItem key={item.id} value={item.id}>
                                                        <div className="flex justify-between items-center w-full">
                                                            <span className="font-medium">{item.partNumber} - {item.name}</span>
                                                            <span className="text-sm text-gray-500 ml-2">{item.category}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {selectedMasterItemId && (
                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <h5 className="font-medium text-blue-900 mb-2">Selected Item Details</h5>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="font-medium">Part Number:</span> {newItem.partNumber}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Description:</span> {newItem.description}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Category:</span> {newItem.category}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Unit:</span> {newItem.unit}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Unit Cost:</span> ${newItem.unitCost.toFixed(2)}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Supplier:</span> {newItem.supplier}
                                                </div>
                                            </div>
                                            {newItem.specifications && (
                                                <div className="mt-2">
                                                    <span className="font-medium">Specifications:</span> {newItem.specifications}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {selectedMasterItemId && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <Label htmlFor="quantity">Quantity Required</Label>
                                                    <Input
                                                        id="quantity"
                                                        type="number"
                                                        value={newItem.quantity}
                                                        onChange={(e) => setNewItem(prev => ({
                                                            ...prev,
                                                            quantity: parseFloat(e.target.value) || 0,
                                                            totalCost: (parseFloat(e.target.value) || 0) * prev.unitCost
                                                        }))}
                                                        min="0"
                                                        step="0.01"
                                                        placeholder="10"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="unitCostOverride">Unit Cost Override (Optional)</Label>
                                                    <Input
                                                        id="unitCostOverride"
                                                        type="number"
                                                        value={newItem.unitCost}
                                                        onChange={(e) => setNewItem(prev => ({
                                                            ...prev,
                                                            unitCost: parseFloat(e.target.value) || 0,
                                                            totalCost: prev.quantity * (parseFloat(e.target.value) || 0)
                                                        }))}
                                                        min="0"
                                                        step="0.01"
                                                        placeholder="Use master cost"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="materialGrade">Material Grade (Optional)</Label>
                                                    <Input
                                                        id="materialGrade"
                                                        value={newItem.materialGrade}
                                                        onChange={(e) => setNewItem(prev => ({ ...prev, materialGrade: e.target.value }))}
                                                        placeholder="A992"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center pt-2">
                                                <div className="text-sm text-gray-600">
                                                    Total Cost: <span className="font-medium">${(newItem.quantity * newItem.unitCost).toFixed(2)}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => {
                                                            setSelectedMasterItemId("")
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
                                                                category: "Raw Material" as BOMItem["category"],
                                                                boqItemId: "",
                                                            })
                                                        }}
                                                        variant="outline"
                                                    >
                                                        Clear
                                                    </Button>
                                                    <Button onClick={addItem} disabled={!selectedMasterItemId || newItem.quantity <= 0}>
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Add to BOM
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {masterItems.length === 0 && (
                                        <div className="text-center py-8">
                                            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500 mb-2">No items found in master</p>
                                            <p className="text-sm text-gray-400">Add items to the item master first</p>
                                        </div>
                                    )}
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
                                                                <div className="flex gap-2 mt-1">
                                                                    {item.workPackage && (
                                                                        <Badge variant="outline" className="text-xs">{item.workPackage}</Badge>
                                                                    )}
                                                                    <Badge
                                                                        className={`text-xs ${item.engineeringStatus === "BOM Generated" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                                                                    >
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
                                                                <ArrowRight className="w-4 h-4 mr-1" />
                                                                Convert
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
                                    <CardDescription>Choose a BOQ to convert to BOM or create a standalone BOM</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-8">
                                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600 mb-4">No BOQ selected for conversion</p>
                                        <div className="space-y-2">
                                            <div>
                                                <Label htmlFor="boqId">Select BOQ to Convert</Label>
                                                <Select value={formData.boqId} onValueChange={(value) => {
                                                    setFormData(prev => ({ ...prev, boqId: value }))
                                                    if (value !== "none") {
                                                        const boq = boqs.find(b => b.id === value)
                                                        if (boq) {
                                                            setSourceBoq(boq)
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                productName: `BOM for ${boq.projectName}`,
                                                                bomNumber: `BOM-${boq.boqNumber.replace('BOQ-', '')}`,
                                                                engineeringProjectId: boq.engineeringProjectId || "none",
                                                                engineeringDrawingId: boq.engineeringDrawingId || "none",
                                                            }))
                                                        }
                                                    }
                                                }}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select BOQ" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">None</SelectItem>
                                                        {boqs.map((boq) => (
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
                                    {sourceBoq ? "Items converted from BOQ" : "Manually added items"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Item</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Qty</TableHead>
                                            <TableHead>Unit Cost</TableHead>
                                            <TableHead>Total</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{item.itemNumber}</p>
                                                        {item.partNumber && (
                                                            <p className="text-xs text-gray-500">{item.partNumber}</p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{item.description}</p>
                                                        {item.materialGrade && (
                                                            <p className="text-xs text-gray-500">Grade: {item.materialGrade}</p>
                                                        )}
                                                        {item.specifications && (
                                                            <p className="text-xs text-gray-500">{item.specifications}</p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{item.quantity} {item.unit}</TableCell>
                                                <TableCell>${item.unitCost.toFixed(2)}</TableCell>
                                                <TableCell className="font-medium">${(item.quantity * item.unitCost).toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <Badge className={getCategoryColor(item.category)}>
                                                        {item.category}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeItem(index)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total BOM Cost:</span>
                                        <span>${totalCost.toLocaleString()}</span>
                                    </div>
                                    {items.length > 0 && (
                                        <div className="mt-2 text-sm text-gray-600">
                                            <span>Items: {items.length} | </span>
                                            <span>Categories: {new Set(items.map(i => i.category)).size}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>BOM Items</CardTitle>
                                <CardDescription>Items to be included in this BOM</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-12">
                                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No items added yet</h3>
                                    <p className="text-gray-500 mb-4">
                                        Add items from the item master or convert from a BOQ to build your BOM
                                    </p>
                                    <div className="text-sm text-gray-400">
                                        Use the tabs above to select your preferred method
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Notes Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes & Specifications</CardTitle>
                            <CardDescription>Additional information and requirements</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <Label htmlFor="notes">BOM Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Special requirements, procurement notes, quality standards, etc."
                                    rows={4}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </Tabs>
            </main>
        </div>
    )
}
