"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, FileText, User, Calendar, Upload, X, Link as LinkIcon } from 'lucide-react'
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import { useDatabaseContext } from "@/components/database-provider"

export default function CreateEngineeringDrawingPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { engineeringDrawings, customers, quotations, createEngineeringDrawing, updateQuotation } = useDatabaseContext()

    // Get quotation context from URL parameters
    const quotationId = searchParams.get('quotationId')
    const source = searchParams.get('source')
    const fromQuotation = source === 'quotation'

    const [formData, setFormData] = useState({
        drawingNumber: "",
        customerId: searchParams.get('customerId') || "none",
        title: searchParams.get('project') || "",
        description: searchParams.get('description') || "",
        version: "1.0",
        revision: "A",
        drawnBy: searchParams.get('engineer') || "",
        checkedBy: "",
        approvedBy: "",
        scale: "1:1",
        material: "",
        dimensions: "",
        tolerances: "±0.5mm unless otherwise specified",
        notes: "",
        specifications: searchParams.get('specifications') || "",
        // Additional quotation-specific fields
        quotationId: quotationId || "",
        projectType: "custom_fabrication",
        drawingType: "assembly"
    })

    // Track selected quotation for auto-population
    const [selectedQuotation, setSelectedQuotation] = useState<any>(null)

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [uploadedFiles, setUploadedFiles] = useState<Array<{
        name: string;
        size: string;
        type: string;
        file?: File;
        url?: string;
    }>>([])
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})

    // Auto-populate form when coming from quotation
    useEffect(() => {
        if (fromQuotation && quotationId) {
            // Generate drawing number based on quotation
            const drawingNumber = `DWG-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`
            setFormData(prev => ({
                ...prev,
                drawingNumber,
                title: `${searchParams.get('project')} - Engineering Drawing`,
                description: `Engineering drawing for ${searchParams.get('project')}. ${searchParams.get('description')}`,
                notes: `Generated from quotation ${quotationId}. Customer requirements integrated.`
            }))
        }
    }, [fromQuotation, quotationId, searchParams])

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleQuotationSelection = (quotationId: string) => {
        if (!quotationId || quotationId === "none") {
            setSelectedQuotation(null)
            setFormData(prev => ({
                ...prev,
                quotationId: "",
                customerId: "none",
                title: "",
                description: "",
                specifications: "",
                drawnBy: "",
                notes: ""
            }))
            return
        }

        const quotation = quotations?.find(q => q.id === quotationId)
        if (quotation) {
            setSelectedQuotation(quotation)

            // Find customer data
            const customer = customers?.find(c => c.id === quotation.customerId)

            // Generate drawing number
            const drawingNumber = `DWG-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`

            setFormData(prev => ({
                ...prev,
                quotationId: quotation.id,
                customerId: quotation.customerId || "none",
                title: `${quotation.title} - Engineering Drawing`,
                description: `Engineering drawing for ${quotation.title}. ${quotation.description}`,
                specifications: quotation.technicalSpecifications || "",
                drawnBy: quotation.assignedEngineer || "",
                notes: `Generated from quotation ${quotation.quotationNumber}. Customer requirements integrated.`,
                drawingNumber: drawingNumber
            }))
        }
    }

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || [])

        files.forEach(file => {
            const fileId = `${file.name}-${Date.now()}`
            const newFile = {
                name: file.name,
                size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                type: getFileType(file.name),
                file: file,
                url: URL.createObjectURL(file)
            }

            setUploadedFiles(prev => [...prev, newFile])

            // Simulate upload progress
            setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))
            const interval = setInterval(() => {
                setUploadProgress(prev => {
                    const currentProgress = prev[fileId] || 0
                    if (currentProgress >= 100) {
                        clearInterval(interval)
                        return prev
                    }
                    return { ...prev, [fileId]: currentProgress + 10 }
                })
            }, 100)
        })

        // Clear the input
        event.target.value = ''
    }

    const getFileType = (fileName: string): string => {
        const extension = fileName.split('.').pop()?.toLowerCase()
        switch (extension) {
            case 'dwg':
            case 'dxf':
                return 'CAD File'
            case 'pdf':
                return 'PDF Document'
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return 'Image'
            case 'doc':
            case 'docx':
                return 'Word Document'
            case 'xls':
            case 'xlsx':
                return 'Excel File'
            default:
                return 'Document'
        }
    }

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const selectedCustomer = formData.customerId !== "none" ? customers.find(c => c.id === formData.customerId) : null
            const customerName = selectedCustomer ? selectedCustomer.name : ""

            const newDrawing = await createEngineeringDrawing({
                drawingNumber: formData.drawingNumber,
                title: formData.title,
                description: formData.description,
                version: formData.version,
                revision: formData.revision,
                drawnBy: formData.drawnBy,
                checkedBy: formData.checkedBy,
                approvedBy: formData.approvedBy,
                specifications: formData.specifications,
                notes: formData.notes,
                tolerances: formData.tolerances,
                status: "Draft" as const,
                projectId: formData.quotationId || "", // Link to quotation
                projectNumber: formData.quotationId || "", // Link to quotation
                materials: formData.material ? [formData.material] : [],
                qualityStandards: [],
                inspectionPoints: [],
                changeHistory: [],
                // Additional fields for quotation integration
                // customerId: formData.customerId !== "none" ? formData.customerId : undefined, // Not part of EngineeringDrawing type
                // customerName: customerName, // Not part of EngineeringDrawing type
                // drawingType: formData.drawingType || "assembly", // Not part of EngineeringDrawing type
            })

            // Note: File uploads would be handled here in a real implementation
            // For now, we're just storing the file metadata with the drawing

            // If this drawing was created from a quotation (either from URL or manually selected), update the quotation
            const linkedQuotationId = formData.quotationId
            if (linkedQuotationId && quotations) {
                const quotation = quotations.find(q => q.id === linkedQuotationId)
                if (quotation) {
                    await updateQuotation(linkedQuotationId, {
                        ...quotation,
                        engineeringProjectId: newDrawing.id,
                        engineeringDrawingCreated: true,
                        engineeringStatus: "Drawing Complete",
                        workflowStage: "Engineering",
                        updatedAt: new Date().toISOString()
                    })
                }
            }

            // Navigate to the drawing details or back to quotation
            if (fromQuotation && quotationId) {
                router.push(`/quotations/${quotationId}?tab=engineering&drawingId=${newDrawing.id}`)
            } else if (linkedQuotationId) {
                router.push(`/quotations/${linkedQuotationId}?tab=engineering&drawingId=${newDrawing.id}`)
            } else {
                router.push(`/engineering/${newDrawing.id}`)
            }
        } catch (error) {
            console.error("Failed to create drawing:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <Link href={fromQuotation && quotationId ? `/quotations/${quotationId}` : "/engineering"} className="text-sm text-blue-600 hover:text-blue-800 mb-2 block">
                                ← {fromQuotation ? "Back to Quotation" : "Back to Engineering"}
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900">Create Engineering Drawing</h1>
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-gray-600">Create technical drawings and specifications</p>
                                {fromQuotation && (
                                    <Badge variant="outline" className="text-xs">
                                        <FileText className="w-3 h-3 mr-1" />
                                        From Quotation {quotationId}
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <Button
                            type="submit"
                            form="drawing-form"
                            disabled={isSubmitting || !formData.drawingNumber.trim() || !formData.title.trim()}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Create Drawing
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form id="drawing-form" onSubmit={handleSubmit} className="space-y-6">
                    {/* Quotation Context */}
                    {(fromQuotation || selectedQuotation) && (
                        <Card className="bg-blue-50 border-blue-200">
                            <CardHeader>
                                <CardTitle className="text-blue-900 flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Quotation Context
                                </CardTitle>
                                <CardDescription className="text-blue-700">
                                    Creating engineering drawing from quotation requirements
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs font-medium text-blue-600">QUOTATION ID</Label>
                                        <p className="text-sm font-medium text-blue-900">
                                            {fromQuotation ? quotationId : selectedQuotation?.quotationNumber}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-xs font-medium text-blue-600">PROJECT</Label>
                                        <p className="text-sm font-medium text-blue-900">
                                            {fromQuotation ? (searchParams.get('project') || 'N/A') : selectedQuotation?.title}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-xs font-medium text-blue-600">CUSTOMER</Label>
                                        <p className="text-sm font-medium text-blue-900">
                                            {fromQuotation ? (searchParams.get('customer') || 'N/A') : selectedQuotation?.customerName}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-xs font-medium text-blue-600">ASSIGNED ENGINEER</Label>
                                        <p className="text-sm font-medium text-blue-900">
                                            {fromQuotation ? (searchParams.get('engineer') || 'Not assigned') : (selectedQuotation?.assignedEngineer || 'Not assigned')}
                                        </p>
                                    </div>
                                </div>
                                {((fromQuotation && searchParams.get('specifications')) || selectedQuotation?.technicalSpecifications) && (
                                    <div className="mt-4">
                                        <Label className="text-xs font-medium text-blue-600">TECHNICAL SPECIFICATIONS</Label>
                                        <p className="text-sm text-blue-800">
                                            {fromQuotation ? searchParams.get('specifications') : selectedQuotation?.technicalSpecifications}
                                        </p>
                                    </div>
                                )}
                                {selectedQuotation && (
                                    <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm text-blue-800">
                                                <LinkIcon className="w-4 h-4" />
                                                <span>Linked to {selectedQuotation.quotationNumber}</span>
                                            </div>
                                            <Link href={`/quotations/${selectedQuotation.id}`}>
                                                <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-200">
                                                    View Quotation
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>Core drawing identification and metadata</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Quotation Selection */}
                            <div>
                                <Label htmlFor="quotationId">Link to Quotation (Optional)</Label>
                                <Select value={formData.quotationId} onValueChange={handleQuotationSelection}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select quotation to link..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No Quotation</SelectItem>
                                        {quotations?.filter(q => q.status !== 'Rejected' && q.status !== 'Expired').map((quotation) => (
                                            <SelectItem key={quotation.id} value={quotation.id}>
                                                {quotation.quotationNumber} - {quotation.title} ({quotation.customerName})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Selecting a quotation will auto-populate drawing details from the quotation requirements
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="drawingNumber">Drawing Number *</Label>
                                    <Input
                                        id="drawingNumber"
                                        value={formData.drawingNumber}
                                        onChange={(e) => handleInputChange("drawingNumber", e.target.value)}
                                        placeholder="e.g., DWG-2024-001"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="customerId">Customer</Label>
                                    <Select value={formData.customerId} onValueChange={(value) => handleInputChange("customerId", value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select customer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No Customer</SelectItem>
                                            {customers?.map((customer) => (
                                                <SelectItem key={customer.id} value={customer.id}>
                                                    {customer.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange("title", e.target.value)}
                                    placeholder="e.g., Steel Frame Assembly Drawing"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange("description", e.target.value)}
                                    placeholder="Detailed description of the drawing"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="version">Version</Label>
                                    <Input
                                        id="version"
                                        value={formData.version}
                                        onChange={(e) => handleInputChange("version", e.target.value)}
                                        placeholder="1.0"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="revision">Revision</Label>
                                    <Input
                                        id="revision"
                                        value={formData.revision}
                                        onChange={(e) => handleInputChange("revision", e.target.value)}
                                        placeholder="A"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="scale">Scale</Label>
                                    <Input
                                        id="scale"
                                        value={formData.scale}
                                        onChange={(e) => handleInputChange("scale", e.target.value)}
                                        placeholder="e.g., 1:100"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ETO Workflow Details */}
                    {fromQuotation && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    ETO Workflow Details
                                </CardTitle>
                                <CardDescription>Engineer-to-Order specific requirements and assignments</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="drawingType">Drawing Type</Label>
                                        <Select value={formData.drawingType} onValueChange={(value) => handleInputChange("drawingType", value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select drawing type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="assembly">Assembly Drawing</SelectItem>
                                                <SelectItem value="detail">Detail Drawing</SelectItem>
                                                <SelectItem value="fabrication">Fabrication Drawing</SelectItem>
                                                <SelectItem value="installation">Installation Drawing</SelectItem>
                                                <SelectItem value="schematic">Schematic Drawing</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="projectType">Project Type</Label>
                                        <Select value={formData.projectType} onValueChange={(value) => handleInputChange("projectType", value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select project type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="custom_fabrication">Custom Fabrication</SelectItem>
                                                <SelectItem value="steel_structure">Steel Structure</SelectItem>
                                                <SelectItem value="mechanical_assembly">Mechanical Assembly</SelectItem>
                                                <SelectItem value="piping_system">Piping System</SelectItem>
                                                <SelectItem value="equipment_design">Equipment Design</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="drawnBy">Drawn By</Label>
                                        <Input
                                            id="drawnBy"
                                            value={formData.drawnBy}
                                            onChange={(e) => handleInputChange("drawnBy", e.target.value)}
                                            placeholder="Engineer name"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="checkedBy">Checked By</Label>
                                        <Input
                                            id="checkedBy"
                                            value={formData.checkedBy}
                                            onChange={(e) => handleInputChange("checkedBy", e.target.value)}
                                            placeholder="Reviewer name"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="approvedBy">Approved By</Label>
                                        <Input
                                            id="approvedBy"
                                            value={formData.approvedBy}
                                            onChange={(e) => handleInputChange("approvedBy", e.target.value)}
                                            placeholder="Approver name"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Drawing Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Drawing Details</CardTitle>
                            <CardDescription>Technical specifications and drawing details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="material">Primary Material</Label>
                                    <Input
                                        id="material"
                                        value={formData.material}
                                        onChange={(e) => handleInputChange("material", e.target.value)}
                                        placeholder="e.g., A36 Steel"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="dimensions">Overall Dimensions</Label>
                                    <Input
                                        id="dimensions"
                                        value={formData.dimensions}
                                        onChange={(e) => handleInputChange("dimensions", e.target.value)}
                                        placeholder="e.g., 1000 x 500 x 200 mm"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="tolerances">Tolerances</Label>
                                <Input
                                    id="tolerances"
                                    value={formData.tolerances}
                                    onChange={(e) => handleInputChange("tolerances", e.target.value)}
                                    placeholder="e.g., ±0.1 mm unless otherwise specified"
                                />
                            </div>

                            <div>
                                <Label htmlFor="specifications">Technical Specifications</Label>
                                <Textarea
                                    id="specifications"
                                    value={formData.specifications}
                                    onChange={(e) => handleInputChange("specifications", e.target.value)}
                                    placeholder="Technical requirements, standards, and specifications"
                                    rows={4}
                                />
                            </div>

                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => handleInputChange("notes", e.target.value)}
                                    placeholder="Additional notes and comments"
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Approval Chain */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Approval Information</CardTitle>
                            <CardDescription>Drawing creation and approval workflow</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="drawnBy">Drawn By</Label>
                                    <Input
                                        id="drawnBy"
                                        value={formData.drawnBy}
                                        onChange={(e) => handleInputChange("drawnBy", e.target.value)}
                                        placeholder="Engineer name"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="checkedBy">Checked By</Label>
                                    <Input
                                        id="checkedBy"
                                        value={formData.checkedBy}
                                        onChange={(e) => handleInputChange("checkedBy", e.target.value)}
                                        placeholder="Checker name"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="approvedBy">Approved By</Label>
                                    <Input
                                        id="approvedBy"
                                        value={formData.approvedBy}
                                        onChange={(e) => handleInputChange("approvedBy", e.target.value)}
                                        placeholder="Approver name"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* File Upload */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Upload className="w-5 h-5" />
                                Drawing Files & Attachments
                            </CardTitle>
                            <CardDescription>Upload CAD files, PDFs, specifications, and related documents</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Upload Area */}
                            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-900">Drop files here or click to upload</p>
                                    <p className="text-xs text-gray-500">Supports: DWG, DXF, PDF, DOC, XLS, Images (Max 10MB each)</p>
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    accept=".dwg,.dxf,.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>

                            {/* Uploaded Files */}
                            {uploadedFiles.length > 0 && (
                                <div>
                                    <Label>Uploaded Files ({uploadedFiles.length})</Label>
                                    <div className="mt-2 space-y-2">
                                        {uploadedFiles.map((file, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                                                <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <span>{file.type}</span>
                                                        <span>•</span>
                                                        <span>{file.size}</span>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeFile(index)}
                                                    className="text-gray-400 hover:text-red-500"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quotation Link */}
                    {(fromQuotation && quotationId) || (selectedQuotation && formData.quotationId) ? (
                        <Card className="bg-green-50 border-green-200">
                            <CardHeader>
                                <CardTitle className="text-green-900 flex items-center gap-2">
                                    <LinkIcon className="w-5 h-5" />
                                    Linked Quotation
                                </CardTitle>
                                <CardDescription className="text-green-700">
                                    This drawing will be linked to the selected quotation
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-green-900">
                                            Quotation: {fromQuotation ? quotationId : selectedQuotation?.quotationNumber}
                                        </p>
                                        <p className="text-sm text-green-700">
                                            Project: {fromQuotation ? searchParams.get('project') : selectedQuotation?.title}
                                        </p>
                                        <p className="text-sm text-green-700">
                                            Customer: {fromQuotation ? searchParams.get('customer') : selectedQuotation?.customerName}
                                        </p>
                                    </div>
                                    <Link href={`/quotations/${fromQuotation ? quotationId : selectedQuotation?.id}`}>
                                        <Button variant="outline" size="sm" className="border-green-300 text-green-700 hover:bg-green-100">
                                            <FileText className="w-4 h-4 mr-2" />
                                            View Quotation
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ) : null}
                </form>
            </main>
        </div>
    )
}
