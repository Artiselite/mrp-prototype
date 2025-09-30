/**
 * BOQ Generator Service
 * Converts CAD data to Bill of Quantities items
 */

import type { BOQItem } from '@/lib/types'
import type { CADBOQData, CADMaterial } from '@/lib/types'

export interface BOQGenerationOptions {
  includeLabor: boolean
  includeEquipment: boolean
  includeOverhead: boolean
  laborRate: number // per hour
  equipmentRate: number // per hour
  overheadPercentage: number // percentage
  profitMargin: number // percentage
  currency: string
}

export interface BOQGenerationResult {
  items: BOQItem[]
  summary: {
    materialCost: number
    laborCost: number
    equipmentCost: number
    overheadCost: number
    totalCost: number
    itemCount: number
  }
  metadata: {
    sourceFile: string
    generatedAt: string
    processingTime: number
    confidence: number // 0-100
  }
}

export class BOQGenerator {
  private static instance: BOQGenerator

  public static getInstance(): BOQGenerator {
    if (!BOQGenerator.instance) {
      BOQGenerator.instance = new BOQGenerator()
    }
    return BOQGenerator.instance
  }

  /**
   * Generate BOQ from CAD data
   */
  async generateBOQ(
    cadData: CADBOQData,
    options: Partial<BOQGenerationOptions> = {}
  ): Promise<BOQGenerationResult> {
    const startTime = Date.now()
    
    const defaultOptions: BOQGenerationOptions = {
      includeLabor: true,
      includeEquipment: true,
      includeOverhead: true,
      laborRate: 50, // $50/hour
      equipmentRate: 25, // $25/hour
      overheadPercentage: 15, // 15%
      profitMargin: 20, // 20%
      currency: 'USD'
    }

    const finalOptions = { ...defaultOptions, ...options }
    
    const items: BOQItem[] = []
    let itemCounter = 1

    // Generate material items from CAD materials
    for (const material of cadData.materials) {
      const materialItem = this.createMaterialItem(material, itemCounter++, finalOptions)
      items.push(materialItem)
    }

    // Generate labor items if requested
    if (finalOptions.includeLabor) {
      const laborItems = this.generateLaborItems(cadData, itemCounter, finalOptions)
      items.push(...laborItems)
      itemCounter += laborItems.length
    }

    // Generate equipment items if requested
    if (finalOptions.includeEquipment) {
      const equipmentItems = this.generateEquipmentItems(cadData, itemCounter, finalOptions)
      items.push(...equipmentItems)
      itemCounter += equipmentItems.length
    }

    // Calculate costs
    const materialCost = items
      .filter(item => item.category === 'Material')
      .reduce((sum, item) => sum + item.totalAmount, 0)

    const laborCost = items
      .filter(item => item.category === 'Labor')
      .reduce((sum, item) => sum + item.totalAmount, 0)

    const equipmentCost = items
      .filter(item => item.category === 'Equipment')
      .reduce((sum, item) => sum + item.totalAmount, 0)

    const overheadCost = finalOptions.includeOverhead 
      ? (materialCost + laborCost + equipmentCost) * (finalOptions.overheadPercentage / 100)
      : 0

    const totalCost = materialCost + laborCost + equipmentCost + overheadCost

    // Add overhead item if enabled
    if (finalOptions.includeOverhead && overheadCost > 0) {
      items.push({
        id: `item-${itemCounter}`,
        itemNumber: `${itemCounter}.0`,
        description: 'Overhead and Administrative Costs',
        quantity: 1,
        unit: 'LS',
        unitRate: overheadCost,
        totalAmount: overheadCost,
        category: 'Other',
        specifications: `${finalOptions.overheadPercentage}% of direct costs`,
        remarks: 'Calculated overhead'
      })
    }

    const processingTime = Date.now() - startTime
    const confidence = this.calculateConfidence(cadData, items)

    return {
      items,
      summary: {
        materialCost,
        laborCost,
        equipmentCost,
        overheadCost,
        totalCost,
        itemCount: items.length
      },
      metadata: {
        sourceFile: cadData.drawingInfo.title,
        generatedAt: new Date().toISOString(),
        processingTime,
        confidence
      }
    }
  }

  /**
   * Create material item from CAD material
   */
  private createMaterialItem(
    material: CADMaterial,
    itemNumber: number,
    options: BOQGenerationOptions
  ): BOQItem {
    const unitRate = this.calculateMaterialRate(material, options.currency)
    const totalAmount = material.quantity * unitRate

    return {
      id: `item-${itemNumber}`,
      itemNumber: `${itemNumber}.0`,
      description: this.generateMaterialDescription(material),
      quantity: material.quantity,
      unit: material.unit,
      unitRate,
      totalAmount,
      category: 'Material',
      specifications: material.specifications || this.generateMaterialSpecifications(material),
      remarks: `Generated from CAD layer: ${material.name}`
    }
  }

  /**
   * Generate labor items based on CAD complexity
   */
  private generateLaborItems(
    cadData: CADBOQData,
    startItemNumber: number,
    options: BOQGenerationOptions
  ): BOQItem[] {
    const items: BOQItem[] = []
    let itemCounter = startItemNumber

    // Calculate labor hours based on complexity
    const complexity = this.assessComplexity(cadData)
    const baseHours = this.calculateBaseLaborHours(cadData, complexity)

    // Fabrication labor
    const fabricationHours = baseHours * 0.6
    if (fabricationHours > 0) {
      items.push({
        id: `item-${itemCounter}`,
        itemNumber: `${itemCounter}.0`,
        description: 'Fabrication Labor',
        quantity: fabricationHours,
        unit: 'HR',
        unitRate: options.laborRate,
        totalAmount: fabricationHours * options.laborRate,
        category: 'Labor',
        specifications: 'Skilled fabrication work',
        remarks: `Based on ${complexity} complexity assessment`
      })
      itemCounter++
    }

    // Welding labor
    const weldingHours = baseHours * 0.3
    if (weldingHours > 0) {
      items.push({
        id: `item-${itemCounter}`,
        itemNumber: `${itemCounter}.0`,
        description: 'Welding Labor',
        quantity: weldingHours,
        unit: 'HR',
        unitRate: options.laborRate * 1.2, // Welding is more skilled
        totalAmount: weldingHours * options.laborRate * 1.2,
        category: 'Labor',
        specifications: 'Certified welding work',
        remarks: 'Includes preparation and finishing'
      })
      itemCounter++
    }

    // Assembly labor
    const assemblyHours = baseHours * 0.1
    if (assemblyHours > 0) {
      items.push({
        id: `item-${itemCounter}`,
        itemNumber: `${itemCounter}.0`,
        description: 'Assembly Labor',
        quantity: assemblyHours,
        unit: 'HR',
        unitRate: options.laborRate,
        totalAmount: assemblyHours * options.laborRate,
        category: 'Labor',
        specifications: 'Assembly and installation work',
        remarks: 'Final assembly and quality control'
      })
    }

    return items
  }

  /**
   * Generate equipment items
   */
  private generateEquipmentItems(
    cadData: CADBOQData,
    startItemNumber: number,
    options: BOQGenerationOptions
  ): BOQItem[] {
    const items: BOQItem[] = []
    let itemCounter = startItemNumber

    const complexity = this.assessComplexity(cadData)
    const baseHours = this.calculateBaseLaborHours(cadData, complexity)

    // Cutting equipment
    const cuttingHours = baseHours * 0.4
    if (cuttingHours > 0) {
      items.push({
        id: `item-${itemCounter}`,
        itemNumber: `${itemCounter}.0`,
        description: 'Cutting Equipment Usage',
        quantity: cuttingHours,
        unit: 'HR',
        unitRate: options.equipmentRate,
        totalAmount: cuttingHours * options.equipmentRate,
        category: 'Equipment',
        specifications: 'Plasma cutting, saw cutting, etc.',
        remarks: 'Equipment rental and operation'
      })
      itemCounter++
    }

    // Welding equipment
    const weldingHours = baseHours * 0.3
    if (weldingHours > 0) {
      items.push({
        id: `item-${itemCounter}`,
        itemNumber: `${itemCounter}.0`,
        description: 'Welding Equipment Usage',
        quantity: weldingHours,
        unit: 'HR',
        unitRate: options.equipmentRate * 1.5, // Welding equipment is more expensive
        totalAmount: weldingHours * options.equipmentRate * 1.5,
        category: 'Equipment',
        specifications: 'Welding machines, gas, consumables',
        remarks: 'Includes consumables and gas'
      })
      itemCounter++
    }

    // Lifting equipment
    const liftingHours = baseHours * 0.1
    if (liftingHours > 0) {
      items.push({
        id: `item-${itemCounter}`,
        itemNumber: `${itemCounter}.0`,
        description: 'Lifting Equipment Usage',
        quantity: liftingHours,
        unit: 'HR',
        unitRate: options.equipmentRate * 2, // Lifting equipment is expensive
        totalAmount: liftingHours * options.equipmentRate * 2,
        category: 'Equipment',
        specifications: 'Cranes, hoists, lifting accessories',
        remarks: 'For material handling and assembly'
      })
    }

    return items
  }

  /**
   * Calculate material rate based on material type and current market prices
   */
  private calculateMaterialRate(material: CADMaterial, currency: string): number {
    // More realistic base rates per unit (USD)
    const baseRates: Record<string, Record<string, number>> = {
      steel: {
        'ea': 150, // $150 per piece for structural elements
        'm': 25, // $25 per meter for linear elements
        'kg': 2.5, // $2.5 per kg for welding materials
        'l': 15, // $15 per liter for paint
        'mm': 0.08, // $0.08 per mm for linear
        'mm²': 0.00015, // $0.00015 per mm² for area
        'mm³': 0.00008 // $0.00008 per mm³ for volume
      },
      aluminum: {
        'ea': 200,
        'm': 35,
        'kg': 4.5,
        'l': 20,
        'mm': 0.12,
        'mm²': 0.00025,
        'mm³': 0.00012
      },
      copper: {
        'ea': 300,
        'm': 50,
        'kg': 8.5,
        'l': 25,
        'mm': 0.18,
        'mm²': 0.00035,
        'mm³': 0.00018
      },
      concrete: {
        'ea': 100,
        'm': 15,
        'kg': 0.8,
        'l': 12,
        'mm³': 0.00008
      },
      other: {
        'ea': 50,
        'm': 10,
        'kg': 3.0,
        'l': 12,
        'mm': 0.05,
        'mm²': 0.0001,
        'mm³': 0.00005
      }
    }

    const materialType = material.type.toLowerCase()
    const unit = material.unit.toLowerCase()
    
    let baseRate = baseRates[materialType]?.[unit] || baseRates['other']?.[unit] || 1
    
    // Apply grade multiplier
    if (material.grade) {
      const gradeMultiplier = this.getGradeMultiplier(material.grade)
      baseRate *= gradeMultiplier
    }

    // Apply thickness multiplier for steel
    if (material.type === 'steel' && material.thickness) {
      const thicknessMultiplier = Math.max(1, material.thickness / 8) // Thicker = more expensive
      baseRate *= thicknessMultiplier
    }

    // Apply size multiplier for structural elements
    if (material.dimensions && material.unit === 'EA') {
      const { length, width, height } = material.dimensions
      const volume = (length * width * height) / 1000000 // Convert to m³
      if (volume > 0.1) { // Large structural elements
        baseRate *= Math.max(1, Math.sqrt(volume) * 2)
      }
    }

    // Apply quantity discount for bulk materials
    if (material.quantity > 10) {
      baseRate *= 0.9 // 10% discount for bulk
    } else if (material.quantity > 5) {
      baseRate *= 0.95 // 5% discount for medium quantity
    }

    return Math.round(baseRate * 100) / 100 // Round to 2 decimal places
  }

  /**
   * Get grade multiplier for material pricing
   */
  private getGradeMultiplier(grade: string): number {
    const gradeMultipliers: Record<string, number> = {
      // Steel grades
      'A36': 1.0, // Basic structural steel
      'A572': 1.15, // High strength low alloy
      'A992': 1.25, // High strength structural steel
      'A500': 1.1, // Structural tubing
      'A106': 1.3, // Seamless carbon steel pipe
      'A234': 1.4, // Wrought carbon steel fittings
      'A516': 1.2, // Pressure vessel steel
      'A387': 1.5, // Chromium-molybdenum steel
      'A514': 1.6, // High strength steel
      
      // Welding electrodes
      'E7018': 1.0, // Basic low hydrogen electrode
      'E6013': 0.8, // Basic rutile electrode
      'E7016': 1.1, // Low hydrogen electrode
      'E308L': 1.3, // Stainless steel electrode
      'E309L': 1.4, // Stainless steel electrode
      
      // Concrete grades
      'C25': 1.0, // Standard concrete
      'C30': 1.1, // High strength concrete
      'C35': 1.2, // Very high strength concrete
      'C40': 1.3, // Ultra high strength concrete
      
      // Aluminum grades
      '6061-T6': 1.8, // Heat treated aluminum
      '6063-T6': 1.6, // Architectural aluminum
      '5052': 1.4, // Marine grade aluminum
      '3003': 1.2, // General purpose aluminum
      
      // Copper grades
      'C110': 2.5, // Electrolytic tough pitch copper
      'C101': 2.8, // Oxygen-free copper
      'C122': 2.3, // Phosphorus deoxidized copper
      
      // Paint types
      'PRIMER': 1.0, // Basic primer
      'ENAMEL': 1.2, // Alkyd enamel
      'EPOXY': 1.5, // Epoxy coating
      'POLYURETHANE': 1.8, // Polyurethane coating
      'ZINC_RICH': 1.3 // Zinc-rich primer
    }
    
    return gradeMultipliers[grade] || 1.0
  }

  /**
   * Generate material description
   */
  private generateMaterialDescription(material: CADMaterial): string {
    let description = material.name
    
    if (material.grade) {
      description += ` (${material.grade})`
    }
    
    if (material.dimensions) {
      const { length, width, height } = material.dimensions
      description += ` - ${length}x${width}x${height}mm`
    }
    
    if (material.thickness) {
      description += ` - ${material.thickness}mm thick`
    }
    
    return description
  }

  /**
   * Generate material specifications
   */
  private generateMaterialSpecifications(material: CADMaterial): string {
    const specs: string[] = []
    
    if (material.grade) {
      specs.push(`Grade: ${material.grade}`)
    }
    
    if (material.specifications) {
      specs.push(material.specifications)
    }
    
    if (material.dimensions) {
      const { length, width, height } = material.dimensions
      specs.push(`Dimensions: ${length}x${width}x${height}mm`)
    }
    
    if (material.thickness) {
      specs.push(`Thickness: ${material.thickness}mm`)
    }
    
    return specs.join(', ')
  }

  /**
   * Assess complexity of CAD data
   */
  private assessComplexity(cadData: CADBOQData): 'Low' | 'Medium' | 'High' | 'Critical' {
    let complexityScore = 0
    
    // Material count factor
    complexityScore += cadData.materials.length * 2
    
    // Area factor
    if (cadData.totalArea > 50) complexityScore += 3
    else if (cadData.totalArea > 20) complexityScore += 2
    else if (cadData.totalArea > 5) complexityScore += 1
    
    // Volume factor
    if (cadData.totalVolume > 10) complexityScore += 3
    else if (cadData.totalVolume > 5) complexityScore += 2
    else if (cadData.totalVolume > 1) complexityScore += 1
    
    // Block count factor
    complexityScore += cadData.blocks.length
    
    if (complexityScore >= 15) return 'Critical'
    if (complexityScore >= 10) return 'High'
    if (complexityScore >= 5) return 'Medium'
    return 'Low'
  }

  /**
   * Calculate base labor hours based on complexity
   */
  private calculateBaseLaborHours(cadData: CADBOQData, complexity: string): number {
    const baseHours = cadData.totalArea * 0.5 // 0.5 hours per m² base
    
    const complexityMultipliers: Record<string, number> = {
      'Low': 1.0,
      'Medium': 1.5,
      'High': 2.0,
      'Critical': 3.0
    }
    
    return baseHours * (complexityMultipliers[complexity] || 1.0)
  }

  /**
   * Calculate confidence score for generated BOQ
   */
  private calculateConfidence(cadData: CADBOQData, items: BOQItem[]): number {
    let confidence = 50 // Base confidence
    
    // More materials = higher confidence
    if (cadData.materials.length > 0) confidence += 20
    
    // More detailed drawing info = higher confidence
    if (cadData.drawingInfo.layers.length > 3) confidence += 10
    
    // More dimensions = higher confidence
    if (cadData.dimensions.length > 0) confidence += 10
    
    // More items generated = higher confidence
    if (items.length > 5) confidence += 10
    
    return Math.min(100, confidence)
  }
}

export default BOQGenerator
