import type { 
  Quotation, 
  BillOfMaterials, 
  ProductionWorkOrder,
  ProcessStep,
  EngineeringProject,
  EngineeringDrawing,
  BOQItem,
  BillOfQuantities
} from '../types'
import { costCalculationService, type CostBreakdown } from './cost-calculation'

export interface IntegratedQuotationData {
  quotation: Quotation
  bom?: BillOfMaterials
  workOrder?: ProductionWorkOrder
  processSteps?: ProcessStep[]
  engineeringProject?: EngineeringProject
  engineeringDrawing?: EngineeringDrawing
  boq?: BillOfQuantities
  costBreakdown: CostBreakdown
  unitEconomics: {
    baseMaterialCost: number
    copperWeight: number
    copperLMEPrice: number
    laborCost: number
    overheadCost: number
    engineeringCost: number
    profitMargin: number
    quantity: number
    unitCost: number
    unitPrice: number
  }
}

export class DataIntegrationService {
  private static instance: DataIntegrationService
  private quotations: Quotation[] = []
  private boms: BillOfMaterials[] = []
  private workOrders: ProductionWorkOrder[] = []
  private processSteps: ProcessStep[] = []
  private engineeringProjects: EngineeringProject[] = []
  private engineeringDrawings: EngineeringDrawing[] = []
  private boqs: BillOfQuantities[] = []

  static getInstance(): DataIntegrationService {
    if (!DataIntegrationService.instance) {
      DataIntegrationService.instance = new DataIntegrationService()
    }
    return DataIntegrationService.instance
  }

  /**
   * Initialize with data from database context
   */
  initialize(data: {
    quotations: Quotation[]
    boms?: BillOfMaterials[]
    workOrders?: ProductionWorkOrder[]
    processSteps?: ProcessStep[]
    engineeringProjects?: EngineeringProject[]
    engineeringDrawings?: EngineeringDrawing[]
    boqs?: BillOfQuantities[]
  }) {
    this.quotations = data.quotations
    this.boms = data.boms || []
    this.workOrders = data.workOrders || []
    this.processSteps = data.processSteps || []
    this.engineeringProjects = data.engineeringProjects || []
    this.engineeringDrawings = data.engineeringDrawings || []
    this.boqs = data.boqs || []
  }

  /**
   * Get integrated data for a quotation
   */
  getIntegratedQuotationData(quotationId: string): IntegratedQuotationData | null {
    const quotation = this.quotations.find(q => q.id === quotationId)
    if (!quotation) return null

    // Find related BOM
    const bom = this.boms.find(b => 
      b.engineeringProjectId === quotation.engineeringProjectId ||
      b.boqId === quotation.id
    )

    // Find related work order
    const workOrder = this.workOrders.find(wo => 
      wo.salesOrderId === quotation.id ||
      wo.projectId === quotation.engineeringProjectId
    )

    // Find process steps for work order
    const relatedProcessSteps = workOrder ? 
      this.processSteps.filter(ps => ps.workOrderId === workOrder.id) : []

    // Find engineering project
    const engineeringProject = quotation.engineeringProjectId ? 
      this.engineeringProjects.find(ep => ep.id === quotation.engineeringProjectId) : undefined

    // Find engineering drawing
    const engineeringDrawing = engineeringProject ?
      this.engineeringDrawings.find(ed => ed.projectId === engineeringProject.id) : undefined

    // Find BOQ
    const boq = this.boqs.find(b => b.quotationId === quotationId)

    // Calculate costs using integrated data
    const costBreakdown = costCalculationService.calculateQuotationCosts(
      quotation,
      bom,
      workOrder,
      relatedProcessSteps,
      engineeringProject
    )

    // Calculate unit economics
    const quantity = quotation.items.reduce((sum, item) => sum + item.quantity, 0)
    const copperWeight = costCalculationService.getCopperWeight(bom)
    const copperLMEPrice = costCalculationService.getCopperLMEPrice()

    const unitEconomics = {
      baseMaterialCost: costBreakdown.materialCost,
      copperWeight,
      copperLMEPrice,
      laborCost: costBreakdown.laborCost,
      overheadCost: costBreakdown.overheadCost,
      engineeringCost: costBreakdown.engineeringCost,
      profitMargin: costBreakdown.profitMargin / quantity, // Per unit profit
      quantity,
      unitCost: costBreakdown.unitCost,
      unitPrice: costBreakdown.unitPrice
    }

    return {
      quotation,
      bom,
      workOrder,
      processSteps: relatedProcessSteps,
      engineeringProject,
      engineeringDrawing,
      boq,
      costBreakdown,
      unitEconomics
    }
  }

  /**
   * Update quotation with integrated cost data
   */
  updateQuotationWithIntegratedData(quotationId: string): Quotation | null {
    const integratedData = this.getIntegratedQuotationData(quotationId)
    if (!integratedData) return null

    const updatedQuotation = {
      ...integratedData.quotation,
      ...costCalculationService.updateQuotationWithCosts(
        integratedData.quotation, 
        integratedData.costBreakdown
      )
    }

    // Update local data
    const index = this.quotations.findIndex(q => q.id === quotationId)
    if (index !== -1) {
      this.quotations[index] = updatedQuotation
    }

    return updatedQuotation
  }

  /**
   * Get BOM data for a quotation
   */
  getBOMForQuotation(quotationId: string): BillOfMaterials | null {
    const quotation = this.quotations.find(q => q.id === quotationId)
    if (!quotation) return null

    return this.boms.find(b => 
      b.engineeringProjectId === quotation.engineeringProjectId ||
      b.boqId === quotationId
    ) || null
  }

  /**
   * Get work order data for a quotation
   */
  getWorkOrderForQuotation(quotationId: string): ProductionWorkOrder | null {
    const quotation = this.quotations.find(q => q.id === quotationId)
    if (!quotation) return null

    return this.workOrders.find(wo => 
      wo.salesOrderId === quotation.id ||
      wo.projectId === quotation.engineeringProjectId
    ) || null
  }

  /**
   * Get engineering project data for a quotation
   */
  getEngineeringProjectForQuotation(quotationId: string): EngineeringProject | null {
    const quotation = this.quotations.find(q => q.id === quotationId)
    if (!quotation || !quotation.engineeringProjectId) return null

    return this.engineeringProjects.find(ep => ep.id === quotation.engineeringProjectId) || null
  }

  /**
   * Get BOQ data for a quotation
   */
  getBOQForQuotation(quotationId: string): BillOfQuantities | null {
    return this.boqs.find(b => b.quotationId === quotationId) || null
  }

  /**
   * Create BOM from quotation items
   */
  createBOMFromQuotation(quotation: Quotation): BillOfMaterials {
    const bomItems = quotation.items.map((item, index) => ({
      id: `bom-item-${quotation.id}-${index}`,
      itemNumber: `ITEM-${String(index + 1).padStart(3, '0')}`,
      partNumber: item.description.split(' ')[0] || `PART-${index + 1}`,
      description: item.description,
      quantity: item.quantity,
      unit: 'pcs',
      unitCost: item.unitPrice * 0.6, // Estimate 60% material cost
      totalCost: item.quantity * item.unitPrice * 0.6,
      supplier: 'Default Supplier',
      leadTime: 14,
      category: 'Structural Steel' as const,
      materialGrade: 'ASTM A992',
      specifications: item.specifications,
      boqItemId: item.id
    }))

    const totalCost = bomItems.reduce((sum, item) => sum + item.totalCost, 0)

    return {
      id: `bom-${quotation.id}`,
      bomNumber: `BOM-${quotation.quotationNumber}`,
      productName: quotation.title,
      description: quotation.description,
      status: 'Draft' as const,
      version: '1.0',
      bomType: 'EBOM' as const,
      items: bomItems,
      totalCost,
      itemCount: bomItems.length,
      createdBy: quotation.salesPerson,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      revision: '1.0',
      engineeringProjectId: quotation.engineeringProjectId,
      boqId: quotation.id,
      notes: `Generated from quotation ${quotation.quotationNumber}`
    }
  }

  /**
   * Create work order from quotation
   */
  createWorkOrderFromQuotation(quotation: Quotation): ProductionWorkOrder {
    const quantity = quotation.items.reduce((sum, item) => sum + item.quantity, 0)
    const estimatedHours = quantity * 8 // Estimate 8 hours per unit

    return {
      id: `wo-${quotation.id}`,
      workOrderNumber: `WO-${quotation.quotationNumber}`,
      projectId: quotation.engineeringProjectId,
      bomId: `bom-${quotation.id}`,
      productName: quotation.title,
      description: quotation.description,
      quantity,
      status: 'Planned' as const,
      priority: 'Medium' as const,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: quotation.items[0]?.deliveryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignedTo: 'Production Team',
      progress: 0,
      estimatedHours,
      actualHours: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      revision: '1.0',
      notes: `Generated from quotation ${quotation.quotationNumber}`
    }
  }

  /**
   * Create process steps for work order
   */
  createProcessStepsForWorkOrder(workOrder: ProductionWorkOrder): ProcessStep[] {
    const baseSteps = [
      { name: 'Material Preparation', duration: 2, rate: 45 },
      { name: 'Cutting', duration: 3, rate: 50 },
      { name: 'Welding', duration: 4, rate: 60 },
      { name: 'Assembly', duration: 2, rate: 45 },
      { name: 'Quality Control', duration: 1, rate: 55 },
      { name: 'Packaging', duration: 0.5, rate: 40 }
    ]

    return baseSteps.map((step, index) => ({
      id: `step-${workOrder.id}-${index}`,
      workOrderId: workOrder.id,
      name: step.name,
      description: `${step.name} for ${workOrder.productName}`,
      sequence: index + 1,
      estimatedDuration: step.duration,
      actualDuration: 0,
      laborRate: step.rate,
      status: 'Pending' as const,
      workstationId: `ws-${index + 1}`,
      assignedOperator: '',
      startTime: '',
      endTime: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))
  }
}

export const dataIntegrationService = DataIntegrationService.getInstance()
