'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign, 
  BarChart3,
  RefreshCw,
  Download,
  Save
} from 'lucide-react'
import { UnitEconomicsInput, SensitivityAnalysis, CopperLMEPrice } from '@/lib/types'

interface UnitEconomicsCalculatorProps {
  quotationId: string
  projectId?: string
  onSave?: (data: UnitEconomicsInput) => void
  initialData?: UnitEconomicsInput
}

export default function UnitEconomicsCalculator({ 
  quotationId, 
  projectId, 
  onSave, 
  initialData 
}: UnitEconomicsCalculatorProps) {
  const [formData, setFormData] = useState<UnitEconomicsInput>({
    id: initialData?.id || '',
    quotationId,
    projectId,
    baseMaterialCost: initialData?.baseMaterialCost || 0,
    copperWeight: initialData?.copperWeight || 0,
    copperLMEPrice: initialData?.copperLMEPrice || 0,
    laborCost: initialData?.laborCost || 0,
    overheadCost: initialData?.overheadCost || 0,
    profitMargin: initialData?.profitMargin || 0,
    quantity: initialData?.quantity || 1,
    currency: initialData?.currency || 'MYR',
    createdAt: initialData?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })

  const [copperLME, setCopperLME] = useState<CopperLMEPrice | null>(null)
  const [sensitivityAnalysis, setSensitivityAnalysis] = useState<SensitivityAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Mock copper LME data - in real implementation, this would come from an API
  const mockCopperLME: CopperLMEPrice = {
    id: 'lme_001',
    date: new Date().toISOString().split('T')[0],
    price: 40000, // RM per metric ton
    currency: 'MYR',
    source: 'LME',
    timestamp: new Date().toISOString(),
    change24h: 125,
    changePercent24h: 1.49
  }

  useEffect(() => {
    // Simulate fetching copper LME data
    setCopperLME(mockCopperLME)
    setFormData(prev => ({
      ...prev,
      copperLMEPrice: mockCopperLME.price
    }))
    setLastUpdated(new Date())
  }, [])

  const calculateUnitEconomics = () => {
    const copperCost = (formData.copperWeight / 1000) * formData.copperLMEPrice // Convert kg to tons
    const totalMaterialCost = formData.baseMaterialCost + copperCost
    const totalCost = totalMaterialCost + formData.laborCost + formData.overheadCost
    const profitAmount = totalCost * (formData.profitMargin / 100)
    const unitPrice = totalCost + profitAmount
    const totalPrice = unitPrice * formData.quantity

    return {
      copperCost,
      totalMaterialCost,
      totalCost,
      profitAmount,
      unitPrice,
      totalPrice,
      margin: (profitAmount / unitPrice) * 100
    }
  }

  const calculateSensitivityAnalysis = () => {
    const base = calculateUnitEconomics()
    const copperPriceVariation = 0.15 // 15% variation
    const materialCostVariation = 0.10 // 10% variation

    const copperPriceMin = formData.copperLMEPrice * (1 - copperPriceVariation)
    const copperPriceMax = formData.copperLMEPrice * (1 + copperPriceVariation)
    
    const copperCostMin = (formData.copperWeight / 1000) * copperPriceMin
    const copperCostMax = (formData.copperWeight / 1000) * copperPriceMax
    
    const materialCostMin = formData.baseMaterialCost * (1 - materialCostVariation) + copperCostMin
    const materialCostMax = formData.baseMaterialCost * (1 + materialCostVariation) + copperCostMax
    
    const totalCostMin = materialCostMin + formData.laborCost + formData.overheadCost
    const totalCostMax = materialCostMax + formData.laborCost + formData.overheadCost
    
    const profitMin = totalCostMin * (formData.profitMargin / 100)
    const profitMax = totalCostMax * (formData.profitMargin / 100)
    
    const unitPriceMin = totalCostMin + profitMin
    const unitPriceMax = totalCostMax + profitMax
    
    const marginMin = (profitMin / unitPriceMin) * 100
    const marginMax = (profitMax / unitPriceMax) * 100

    const riskLevel = marginMin < 5 ? 'Critical' : 
                     marginMin < 10 ? 'High' : 
                     marginMin < 15 ? 'Medium' : 'Low'

    const recommendations = []
    if (riskLevel === 'Critical' || riskLevel === 'High') {
      recommendations.push('Consider hedging copper price exposure')
      recommendations.push('Negotiate fixed-price contracts with suppliers')
      recommendations.push('Implement price adjustment clauses')
    }
    if (marginMin < 10) {
      recommendations.push('Review and optimize material costs')
      recommendations.push('Consider alternative materials or suppliers')
    }
    if (copperPriceVariation > 0.1) {
      recommendations.push('Monitor copper LME prices closely')
      recommendations.push('Set up price alerts for significant changes')
    }

    return {
      id: `sa_${quotationId}`,
      quotationId,
      baseScenario: formData,
      scenarios: {
        copperPriceMin,
        copperPriceMax,
        copperPriceCurrent: formData.copperLMEPrice,
        materialCostMin,
        materialCostMax,
        materialCostCurrent: base.totalMaterialCost,
        totalCostMin,
        totalCostMax,
        totalCostCurrent: base.totalCost,
        profitMin,
        profitMax,
        profitCurrent: base.profitAmount,
        marginMin,
        marginMax,
        marginCurrent: base.margin
      },
      riskLevel: riskLevel as "Low" | "Medium" | "High" | "Critical",
      recommendations,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  const handleInputChange = (field: keyof UnitEconomicsInput, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString()
    }))
  }

  const handleRefreshLME = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setCopperLME(mockCopperLME)
    setFormData(prev => ({
      ...prev,
      copperLMEPrice: mockCopperLME.price
    }))
    setLastUpdated(new Date())
    setIsLoading(false)
  }

  const handleCalculateSensitivity = () => {
    const analysis = calculateSensitivityAnalysis()
    setSensitivityAnalysis(analysis)
  }

  const handleSave = () => {
    if (onSave) {
      onSave(formData)
    }
  }

  const economics = calculateUnitEconomics()
  const analysis = sensitivityAnalysis || calculateSensitivityAnalysis()

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
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Unit Economics Calculator
              </CardTitle>
              <CardDescription>
                Calculate unit economics with copper LME volatility analysis
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshLME}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh LME
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Copper LME Price Display */}
      {copperLME && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Copper LME Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm text-gray-600">Current Price</Label>
                <div className="text-2xl font-bold">RM{copperLME.price.toLocaleString()}</div>
                <div className="text-sm text-gray-500">per metric ton</div>
              </div>
              <div>
                <Label className="text-sm text-gray-600">24h Change</Label>
                <div className={`text-lg font-semibold flex items-center gap-1 ${
                  copperLME.change24h && copperLME.change24h > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {copperLME.change24h && copperLME.change24h > 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  RM{Math.abs(copperLME.change24h || 0)}
                </div>
                <div className="text-sm text-gray-500">
                  {copperLME.changePercent24h && copperLME.changePercent24h > 0 ? '+' : ''}
                  {copperLME.changePercent24h?.toFixed(2)}%
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Last Updated</Label>
                <div className="text-sm font-medium">
                  {lastUpdated?.toLocaleTimeString()}
                </div>
                <div className="text-xs text-gray-500">
                  {lastUpdated?.toLocaleDateString()}
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Source</Label>
                <div className="text-sm font-medium">{copperLME.source}</div>
                <div className="text-xs text-gray-500">Real-time data</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="calculator" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="sensitivity">Sensitivity Analysis</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
        </TabsList>

        {/* Calculator Tab */}
        <TabsContent value="calculator" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle>Input Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="baseMaterialCost">Base Material Cost (RM)</Label>
                    <Input
                      id="baseMaterialCost"
                      type="number"
                      value={formData.baseMaterialCost}
                      onChange={(e) => handleInputChange('baseMaterialCost', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="copperWeight">Copper Weight (kg)</Label>
                    <Input
                      id="copperWeight"
                      type="number"
                      value={formData.copperWeight}
                      onChange={(e) => handleInputChange('copperWeight', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="laborCost">Labor Cost (RM)</Label>
                    <Input
                      id="laborCost"
                      type="number"
                      value={formData.laborCost}
                      onChange={(e) => handleInputChange('laborCost', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="overheadCost">Overhead Cost (RM)</Label>
                    <Input
                      id="overheadCost"
                      type="number"
                      value={formData.overheadCost}
                      onChange={(e) => handleInputChange('overheadCost', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="profitMargin">Profit Margin (%)</Label>
                    <Input
                      id="profitMargin"
                      type="number"
                      value={formData.profitMargin}
                      onChange={(e) => handleInputChange('profitMargin', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 1)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleInputChange('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MYR">MYR</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle>Unit Economics Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Copper Cost</Label>
                    <div className="text-lg font-semibold">RM{economics.copperCost.toFixed(2)}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Total Material Cost</Label>
                    <div className="text-lg font-semibold">RM{economics.totalMaterialCost.toFixed(2)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Total Cost</Label>
                    <div className="text-lg font-semibold">RM{economics.totalCost.toFixed(2)}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Profit Amount</Label>
                    <div className="text-lg font-semibold">RM{economics.profitAmount.toFixed(2)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Unit Price</Label>
                    <div className="text-xl font-bold">RM{economics.unitPrice.toFixed(2)}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Total Price</Label>
                    <div className="text-xl font-bold">RM{economics.totalPrice.toFixed(2)}</div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-gray-600">Profit Margin</Label>
                    <Badge className={`text-sm ${
                      economics.margin >= 20 ? 'bg-green-100 text-green-800' :
                      economics.margin >= 15 ? 'bg-yellow-100 text-yellow-800' :
                      economics.margin >= 10 ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {economics.margin.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sensitivity Analysis Tab */}
        <TabsContent value="sensitivity" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sensitivity Analysis</CardTitle>
                <Button onClick={handleCalculateSensitivity}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Calculate Analysis
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Risk Level */}
                <div className="flex items-center gap-4">
                  <Label className="text-sm font-medium">Risk Level:</Label>
                  <Badge className={getRiskColor(analysis.riskLevel)}>
                    {analysis.riskLevel}
                  </Badge>
                </div>

                {/* Scenarios Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Scenario</th>
                        <th className="text-right p-2">Min</th>
                        <th className="text-right p-2">Current</th>
                        <th className="text-right p-2">Max</th>
                        <th className="text-right p-2">Variation</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2 font-medium">Copper Price (RM/ton)</td>
                        <td className="text-right p-2">RM{analysis.scenarios.copperPriceMin.toFixed(0)}</td>
                        <td className="text-right p-2">RM{analysis.scenarios.copperPriceCurrent.toFixed(0)}</td>
                        <td className="text-right p-2">RM{analysis.scenarios.copperPriceMax.toFixed(0)}</td>
                        <td className="text-right p-2">±15%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-medium">Material Cost (RM)</td>
                        <td className="text-right p-2">RM{analysis.scenarios.materialCostMin.toFixed(2)}</td>
                        <td className="text-right p-2">RM{analysis.scenarios.materialCostCurrent.toFixed(2)}</td>
                        <td className="text-right p-2">RM{analysis.scenarios.materialCostMax.toFixed(2)}</td>
                        <td className="text-right p-2">±10%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-medium">Total Cost (RM)</td>
                        <td className="text-right p-2">RM{analysis.scenarios.totalCostMin.toFixed(2)}</td>
                        <td className="text-right p-2">RM{analysis.scenarios.totalCostCurrent.toFixed(2)}</td>
                        <td className="text-right p-2">RM{analysis.scenarios.totalCostMax.toFixed(2)}</td>
                        <td className="text-right p-2">±8%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-medium">Profit (RM)</td>
                        <td className="text-right p-2">RM{analysis.scenarios.profitMin.toFixed(2)}</td>
                        <td className="text-right p-2">RM{analysis.scenarios.profitCurrent.toFixed(2)}</td>
                        <td className="text-right p-2">RM{analysis.scenarios.profitMax.toFixed(2)}</td>
                        <td className="text-right p-2">±12%</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Margin (%)</td>
                        <td className="text-right p-2">{analysis.scenarios.marginMin.toFixed(1)}%</td>
                        <td className="text-right p-2">{analysis.scenarios.marginCurrent.toFixed(1)}%</td>
                        <td className="text-right p-2">{analysis.scenarios.marginMax.toFixed(1)}%</td>
                        <td className="text-right p-2">±3%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Recommendations */}
                {analysis.recommendations.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Recommendations</Label>
                    <div className="space-y-2">
                      {analysis.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                          <div className="text-sm text-yellow-800">{rec}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Planning</CardTitle>
              <CardDescription>
                Compare different scenarios based on copper price variations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-red-200">
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-sm text-red-600 font-medium">Worst Case</div>
                        <div className="text-2xl font-bold text-red-600">
                          RM{analysis.scenarios.totalCostMax.toFixed(0)}
                        </div>
                        <div className="text-sm text-gray-500">Total Cost</div>
                        <div className="text-sm text-red-600">
                          {analysis.scenarios.marginMin.toFixed(1)}% margin
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200">
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-sm text-blue-600 font-medium">Current</div>
                        <div className="text-2xl font-bold text-blue-600">
                          RM{analysis.scenarios.totalCostCurrent.toFixed(0)}
                        </div>
                        <div className="text-sm text-gray-500">Total Cost</div>
                        <div className="text-sm text-blue-600">
                          {analysis.scenarios.marginCurrent.toFixed(1)}% margin
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200">
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-sm text-green-600 font-medium">Best Case</div>
                        <div className="text-2xl font-bold text-green-600">
                          RM{analysis.scenarios.totalCostMin.toFixed(0)}
                        </div>
                        <div className="text-sm text-gray-500">Total Cost</div>
                        <div className="text-sm text-green-600">
                          {analysis.scenarios.marginMax.toFixed(1)}% margin
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
