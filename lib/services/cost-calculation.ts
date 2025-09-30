import type { 
  Quotation, 
  QuotationItem, 
  BillOfMaterials, 
  BOMItem, 
  ProductionWorkOrder,
  ProcessStep,
  Workstation,
  EngineeringProject
} from '../types'

export interface CostBreakdown {
  materialCost: number
  laborCost: number
  overheadCost: number
  engineeringCost: number
  totalCost: number
  unitCost: number
  profitMargin: number
  unitPrice: number
}

export interface BOMCostData {
  bomId: string
  totalMaterialCost: number
  copperWeight: number
  materialBreakdown: {
    steel: number
    copper: number
    hardware: number
    other: number
  }
}

export interface LaborCostData {
  workOrderId: string
  totalLaborHours: number
  laborRate: number
  totalLaborCost: number
  processSteps: Array<{
    stepName: string
    hours: number
    rate: number
    cost: number
  }>
}

export interface OverheadCostData {
  overheadRate: number // percentage of labor cost
  totalOverheadCost: number
  breakdown: {
    facility: number
    equipment: number
    management: number
    utilities: number
  }
}

export class CostCalculationService {
  private static instance: CostCalculationService
  private copperLMEPrice: number = 8500 // USD per metric ton
  private overheadRate: number = 0.15 // 15% of labor cost
  private engineeringRate: number = 125 // USD per hour

  static getInstance(): CostCalculationService {
    if (!CostCalculationService.instance) {
      CostCalculationService.instance = new CostCalculationService()
    }
    return CostCalculationService.instance
  }

  /**
   * Calculate costs from BOM data
   */
  calculateBOMCosts(bom: BillOfMaterials): BOMCostData {
    let totalMaterialCost = 0
    let copperWeight = 0
    const materialBreakdown = {
      steel: 0,
      copper: 0,
      hardware: 0,
      other: 0
    }

    bom.items.forEach(item => {
      const itemCost = item.quantity * item.unitCost
      totalMaterialCost += itemCost

      // Categorize materials for detailed analysis
      switch (item.category) {
        case 'Structural Steel':
        case 'Steel Plate':
          materialBreakdown.steel += itemCost
          break
        case 'Raw Material':
          if (item.materialGrade?.toLowerCase().includes('copper')) {
            materialBreakdown.copper += itemCost
            copperWeight += item.quantity
          } else {
            materialBreakdown.other += itemCost
          }
          break
        case 'Hardware':
          materialBreakdown.hardware += itemCost
          break
        default:
          materialBreakdown.other += itemCost
      }
    })

    return {
      bomId: bom.id,
      totalMaterialCost,
      copperWeight,
      materialBreakdown
    }
  }

  /**
   * Calculate labor costs from work order and process steps
   */
  calculateLaborCosts(workOrder: ProductionWorkOrder, processSteps: ProcessStep[]): LaborCostData {
    let totalLaborHours = 0
    let totalLaborCost = 0
    const processBreakdown: Array<{
      stepName: string
      hours: number
      rate: number
      cost: number
    }> = []

    processSteps.forEach(step => {
      const stepHours = (step.estimatedDuration || 0) / 60 // Convert minutes to hours
      const stepRate = 50 // Default rate per hour
      const stepCost = stepHours * stepRate * workOrder.quantity

      totalLaborHours += stepHours
      totalLaborCost += stepCost

      processBreakdown.push({
        stepName: step.stepName,
        hours: stepHours,
        rate: stepRate,
        cost: stepCost
      })
    })

    return {
      workOrderId: workOrder.id,
      totalLaborHours,
      laborRate: totalLaborHours > 0 ? totalLaborCost / totalLaborHours : 0,
      totalLaborCost,
      processSteps: processBreakdown
    }
  }

  /**
   * Calculate overhead costs
   */
  calculateOverheadCosts(laborCost: number): OverheadCostData {
    const totalOverheadCost = laborCost * this.overheadRate

    return {
      overheadRate: this.overheadRate * 100,
      totalOverheadCost,
      breakdown: {
        facility: totalOverheadCost * 0.4,      // 40% facility
        equipment: totalOverheadCost * 0.3,     // 30% equipment
        management: totalOverheadCost * 0.2,    // 20% management
        utilities: totalOverheadCost * 0.1      // 10% utilities
      }
    }
  }

  /**
   * Calculate engineering costs
   */
  calculateEngineeringCosts(project: EngineeringProject): number {
    const totalHours = project.estimatedHours || 0
    return totalHours * this.engineeringRate
  }

  /**
   * Calculate complete cost breakdown for a quotation
   */
  calculateQuotationCosts(
    quotation: Quotation,
    bom?: BillOfMaterials,
    workOrder?: ProductionWorkOrder,
    processSteps?: ProcessStep[],
    engineeringProject?: EngineeringProject
  ): CostBreakdown {
    let materialCost = 0
    let laborCost = 0
    let overheadCost = 0
    let engineeringCost = 0

    // Calculate material costs from BOM if available
    if (bom) {
      const bomCosts = this.calculateBOMCosts(bom)
      materialCost = bomCosts.totalMaterialCost
    } else {
      // Fallback to quotation data or estimate
      materialCost = quotation.materialCost || quotation.subtotal * 0.6
    }

    // Calculate labor costs from work order if available
    if (workOrder && processSteps) {
      const laborCosts = this.calculateLaborCosts(workOrder, processSteps)
      laborCost = laborCosts.totalLaborCost
    } else {
      // Fallback to quotation data or estimate
      laborCost = quotation.laborCost || quotation.subtotal * 0.3
    }

    // Calculate overhead costs
    const overheadData = this.calculateOverheadCosts(laborCost)
    overheadCost = overheadData.totalOverheadCost

    // Calculate engineering costs
    if (engineeringProject) {
      engineeringCost = this.calculateEngineeringCosts(engineeringProject)
    } else {
      engineeringCost = quotation.engineeringCost || 0
    }

    const totalCost = materialCost + laborCost + overheadCost + engineeringCost
    const quantity = quotation.items.reduce((sum, item) => sum + item.quantity, 0)
    const unitCost = quantity > 0 ? totalCost / quantity : 0

    // Calculate profit margin
    const profitMargin = quotation.profitMargin || (quotation.subtotal * 0.15) // 15% default
    const unitPrice = unitCost + (profitMargin / quantity)

    return {
      materialCost,
      laborCost,
      overheadCost,
      engineeringCost,
      totalCost,
      unitCost,
      profitMargin,
      unitPrice
    }
  }

  /**
   * Update quotation with calculated costs
   */
  updateQuotationWithCosts(quotation: Quotation, costBreakdown: CostBreakdown): Partial<Quotation> {
    return {
      materialCost: costBreakdown.materialCost,
      laborCost: costBreakdown.laborCost,
      overheadCost: costBreakdown.overheadCost,
      engineeringCost: costBreakdown.engineeringCost,
      profitMargin: costBreakdown.profitMargin,
      total: quotation.subtotal + costBreakdown.engineeringCost + quotation.tax
    }
  }

  /**
   * Get copper weight for unit economics
   */
  getCopperWeight(bom?: BillOfMaterials): number {
    if (!bom) return 0
    
    const bomCosts = this.calculateBOMCosts(bom)
    return bomCosts.copperWeight
  }

  /**
   * Get current copper LME price
   */
  getCopperLMEPrice(): number {
    return this.copperLMEPrice
  }

  /**
   * Update copper LME price
   */
  updateCopperLMEPrice(price: number): void {
    this.copperLMEPrice = price
  }
}

export const costCalculationService = CostCalculationService.getInstance()
