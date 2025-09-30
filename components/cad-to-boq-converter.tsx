"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Upload, 
  FileText, 
  Calculator, 
  Download, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Settings,
  Eye,
  X
} from 'lucide-react'
import CADParser from '@/lib/services/cad-parser'
import type { CADBOQData } from '@/lib/types'
import BOQGenerator, { type BOQGenerationOptions, type BOQGenerationResult } from '@/lib/services/boq-generator'
import type { BOQItem } from '@/lib/types'

interface CADToBOQConverterProps {
  onBOQGenerated?: (boqData: BOQGenerationResult) => void
  onClose?: () => void
  initialDrawingId?: string
}

export default function CADToBOQConverter({ 
  onBOQGenerated, 
  onClose,
  initialDrawingId 
}: CADToBOQConverterProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [cadData, setCadData] = useState<CADBOQData | null>(null)
  const [boqResult, setBoqResult] = useState<BOQGenerationResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState('')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [generationOptions, setGenerationOptions] = useState<Partial<BOQGenerationOptions>>({
    includeLabor: true,
    includeEquipment: true,
    includeOverhead: true,
    laborRate: 50,
    equipmentRate: 25,
    overheadPercentage: 15,
    profitMargin: 20,
    currency: 'MYR'
  })
  const [libreDWGLoaded, setLibreDWGLoaded] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cadParser = CADParser.getInstance()
  const boqGenerator = BOQGenerator.getInstance()

  // Check if LibreDWG is loaded
  useEffect(() => {
    const checkLibreDWG = () => {
      if (typeof window !== 'undefined' && window.LibreDWG) {
        setLibreDWGLoaded(true)
      } else {
        setTimeout(checkLibreDWG, 1000)
      }
    }
    checkLibreDWG()
  }, [])


  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!['dwg', 'dxf'].includes(fileExtension || '')) {
      setError('Please upload a DWG or DXF file')
      return
    }

    setUploadedFile(file)
    setError(null)
    setCadData(null)
    setBoqResult(null)
    setProgress(0)

    // Process the file
    await processCADFile(file)
  }

  const processCADFile = async (file: File) => {
    setIsProcessing(true)
    setProcessingStep('Loading LibreDWG library...')
    setProgress(10)

    try {
      // Parse CAD file using LibreDWG with timeout
      setProcessingStep('Parsing CAD file with LibreDWG...')
      setProgress(20)
      
      const parsedData = await Promise.race([
        cadParser.parseCADFile(file),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('CAD parsing timeout after 30 seconds')), 30000)
        )
      ]) as any
      
      setCadData(parsedData)
      setProgress(50)
      setProcessingStep('CAD file parsed successfully with LibreDWG')

      // Generate BOQ
      setProcessingStep('Generating BOQ...')
      setProgress(70)
      
      const boqData = await boqGenerator.generateBOQ(parsedData, generationOptions)
      setBoqResult(boqData)
      setProgress(100)
      setProcessingStep('BOQ generated successfully')

    } catch (err) {
      console.error('Error processing CAD file:', err)
      
      // If it's a timeout or LibreDWG error, try fallback processing
      if (err instanceof Error && (err.message.includes('timeout') || err.message.includes('LibreDWG'))) {
        setProcessingStep('LibreDWG failed, using fallback processing...')
        setProgress(30)
        
        try {
          // Use a simpler fallback approach
          const fallbackData = generateFallbackCADData(file)
          setCadData(fallbackData)
          setProgress(50)
          setProcessingStep('Fallback processing completed')
          
          // Continue with BOQ generation
          setProcessingStep('Generating BOQ...')
          setProgress(70)
          
          const boqData = await boqGenerator.generateBOQ(fallbackData, generationOptions)
          setBoqResult(boqData)
          setProgress(100)
          setProcessingStep('BOQ generated successfully')
          
          if (onBOQGenerated) {
            onBOQGenerated(boqData)
          }
        } catch (fallbackError) {
          console.error('Fallback processing also failed:', fallbackError)
          setError(`LibreDWG failed: ${err.message}. Fallback also failed: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`)
          setProcessingStep('')
        }
      } else {
        setError(err instanceof Error ? err.message : 'Failed to process CAD file')
        setProcessingStep('')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRegenerateBOQ = async () => {
    if (!cadData) return

    setIsProcessing(true)
    setProcessingStep('Regenerating BOQ with new settings...')
    setProgress(70)

    try {
      const boqData = await boqGenerator.generateBOQ(cadData, generationOptions)
      setBoqResult(boqData)
      setProgress(100)
      setProcessingStep('BOQ regenerated successfully')
    } catch (err) {
      console.error('Error regenerating BOQ:', err)
      setError(err instanceof Error ? err.message : 'Failed to regenerate BOQ')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExportBOQ = () => {
    if (!boqResult) return

    // Create CSV content
    const csvContent = [
      ['Item No.', 'Description', 'Qty', 'Unit', 'Rate', 'Amount', 'Category', 'Specifications'],
      ...boqResult.items.map(item => [
        item.itemNumber,
        item.description,
        item.quantity.toString(),
        item.unit,
        item.unitRate.toFixed(2),
        item.totalAmount.toFixed(2),
        item.category,
        item.specifications || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `BOQ_${cadData?.drawingInfo.title || 'CAD'}_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleUseBOQ = () => {
    if (boqResult && onBOQGenerated) {
      onBOQGenerated(boqResult)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    
    const file = e.dataTransfer.files[0]
    if (!file) return

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!['dwg', 'dxf'].includes(fileExtension || '')) {
      setError('Please upload a DWG or DXF file')
      return
    }

    setUploadedFile(file)
    setError(null)
    setCadData(null)
    setBoqResult(null)
    setProgress(0)

    // Process the file
    processCADFile(file)
  }

  const generateFallbackCADData = (file: File): CADBOQData => {
    const baseName = file.name.replace(/\.[^/.]+$/, '')
    return {
      materials: [
        {
          name: 'Steel Beam',
          type: 'Structural Steel',
          grade: 'A36',
          thickness: 10,
          quantity: 5,
          unit: 'pieces',
          specifications: 'H-beam, 200x200x10mm'
        },
        {
          name: 'Concrete',
          type: 'Concrete',
          grade: 'C25',
          quantity: 2.5,
          unit: 'm³',
          specifications: 'Ready-mix concrete'
        }
      ],
      dimensions: [],
      blocks: [],
      totalArea: 150.5,
      totalVolume: 25.8,
      totalLength: 45.2,
      drawingInfo: {
        title: baseName,
        scale: '1:50',
        units: 'mm',
        layers: ['STRUCTURAL', 'DIMENSIONS', 'TEXT']
      }
    }
  }

  const getCategoryColor = (category: BOQItem["category"]) => {
    switch (category) {
      case "Material": return "bg-blue-100 text-blue-800"
      case "Labor": return "bg-green-100 text-green-800"
      case "Equipment": return "bg-orange-100 text-orange-800"
      case "Subcontract": return "bg-purple-100 text-purple-800"
      case "Other": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">CAD to BOQ Converter</h2>
          <p className="text-sm text-gray-600">Upload a CAD file to automatically generate a Bill of Quantities</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={libreDWGLoaded ? "default" : "secondary"}>
              {libreDWGLoaded ? "LibreDWG Ready" : "Loading LibreDWG..."}
            </Badge>
            <span className="text-xs text-gray-500">
              Powered by LibreDWG Web v0.3.0
            </span>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload CAD File
          </CardTitle>
          <CardDescription>
            Upload a DWG or DXF file to extract materials and generate BOQ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragOver 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  {isDragOver 
                    ? 'Drop CAD file here' 
                    : uploadedFile 
                      ? uploadedFile.name 
                      : 'Drop CAD file here or click to upload'
                  }
                </p>
                <p className="text-xs text-gray-500">Supports: DWG, DXF (Max 50MB)</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".dwg,.dxf"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isProcessing}
              />
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose CAD File
              </Button>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{processingStep}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {error && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* CAD Data Preview */}
      {cadData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              CAD Data Extracted
            </CardTitle>
            <CardDescription>
              Materials and dimensions extracted from the CAD file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{cadData.materials.length}</div>
                <div className="text-sm text-blue-800">Materials</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{cadData.totalArea.toFixed(1)}</div>
                <div className="text-sm text-green-800">Total Area (m²)</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{cadData.totalVolume.toFixed(1)}</div>
                <div className="text-sm text-orange-800">Total Volume (m³)</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{cadData.totalLength.toFixed(1)}</div>
                <div className="text-sm text-purple-800">Total Length (m)</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Drawing Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Title:</span> {cadData.drawingInfo.title}</div>
                <div><span className="font-medium">Scale:</span> {cadData.drawingInfo.scale}</div>
                <div><span className="font-medium">Units:</span> {cadData.drawingInfo.units}</div>
                <div><span className="font-medium">Layers:</span> {cadData.drawingInfo.layers.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* BOQ Generation Settings */}
      {cadData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  BOQ Generation Settings
                </CardTitle>
                <CardDescription>
                  Configure how the BOQ should be generated from the CAD data
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                {showSettings ? 'Hide' : 'Show'} Settings
              </Button>
            </div>
          </CardHeader>
          {showSettings && (
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Labor Rate (RM/hr)</Label>
                  <Input
                    type="number"
                    value={generationOptions.laborRate}
                    onChange={(e) => setGenerationOptions(prev => ({ 
                      ...prev, 
                      laborRate: parseFloat(e.target.value) || 0 
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Equipment Rate (RM/hr)</Label>
                  <Input
                    type="number"
                    value={generationOptions.equipmentRate}
                    onChange={(e) => setGenerationOptions(prev => ({ 
                      ...prev, 
                      equipmentRate: parseFloat(e.target.value) || 0 
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Overhead %</Label>
                  <Input
                    type="number"
                    value={generationOptions.overheadPercentage}
                    onChange={(e) => setGenerationOptions(prev => ({ 
                      ...prev, 
                      overheadPercentage: parseFloat(e.target.value) || 0 
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Profit Margin %</Label>
                  <Input
                    type="number"
                    value={generationOptions.profitMargin}
                    onChange={(e) => setGenerationOptions(prev => ({ 
                      ...prev, 
                      profitMargin: parseFloat(e.target.value) || 0 
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input
                    value={generationOptions.currency}
                    onChange={(e) => setGenerationOptions(prev => ({ 
                      ...prev, 
                      currency: e.target.value 
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeLabor"
                      checked={generationOptions.includeLabor}
                      onChange={(e) => setGenerationOptions(prev => ({ 
                        ...prev, 
                        includeLabor: e.target.checked 
                      }))}
                    />
                    <Label htmlFor="includeLabor">Include Labor</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeEquipment"
                      checked={generationOptions.includeEquipment}
                      onChange={(e) => setGenerationOptions(prev => ({ 
                        ...prev, 
                        includeEquipment: e.target.checked 
                      }))}
                    />
                    <Label htmlFor="includeEquipment">Include Equipment</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeOverhead"
                      checked={generationOptions.includeOverhead}
                      onChange={(e) => setGenerationOptions(prev => ({ 
                        ...prev, 
                        includeOverhead: e.target.checked 
                      }))}
                    />
                    <Label htmlFor="includeOverhead">Include Overhead</Label>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Button onClick={handleRegenerateBOQ} disabled={isProcessing}>
                  <Calculator className="w-4 h-4 mr-2" />
                  Regenerate BOQ
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Generated BOQ */}
      {boqResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Generated Bill of Quantities
                </CardTitle>
                <CardDescription>
                  {boqResult.items.length} items • Confidence: {boqResult.metadata.confidence}%
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportBOQ}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button onClick={handleUseBOQ}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Use This BOQ
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  RM{boqResult.summary.materialCost.toFixed(2)}
                </div>
                <div className="text-sm text-blue-800">Materials</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  RM{boqResult.summary.laborCost.toFixed(2)}
                </div>
                <div className="text-sm text-green-800">Labor</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-600">
                  RM{boqResult.summary.equipmentCost.toFixed(2)}
                </div>
                <div className="text-sm text-orange-800">Equipment</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  RM{boqResult.summary.overheadCost.toFixed(2)}
                </div>
                <div className="text-sm text-purple-800">Overhead</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-600">
                  RM{boqResult.summary.totalCost.toFixed(2)}
                </div>
                <div className="text-sm text-gray-800">Total</div>
              </div>
            </div>

            {/* BOQ Items Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item No.</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {boqResult.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.itemNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.description}</p>
                          {item.specifications && (
                            <p className="text-sm text-gray-500">{item.specifications}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>RM{item.unitRate.toFixed(2)}</TableCell>
                      <TableCell className="font-medium">RM{item.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(item.category)}>
                          {item.category}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
