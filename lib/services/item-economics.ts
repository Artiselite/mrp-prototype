import type { Item, PurchaseOrderItem } from '@/lib/types'

export interface ItemEconomics {
  itemId: string
  partNumber: string
  name: string
  baseCost: number
  copperCost: number
  totalCost: number
  copperWeight: number
  copperPercentage: number
  marginImpact: number
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'
  recommendations: string[]
}

export interface EconomicsSummary {
  totalBaseCost: number
  totalCopperCost: number
  totalCost: number
  averageMargin: number
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'
  copperExposure: number
  recommendations: string[]
}

// Mock copper LME price - in real implementation, this would come from an API
const COPPER_LME_PRICE = 40000 // MYR per metric ton

export function calculateItemEconomics(item: Item, quantity: number): ItemEconomics {
  // Extract copper weight from item specifications or description
  const copperWeight = extractCopperWeight(item)
  const copperCost = (copperWeight / 1000) * COPPER_LME_PRICE * quantity // Convert kg to tons
  const baseCost = item.unitCost * quantity
  const totalCost = baseCost + copperCost
  const copperPercentage = copperWeight > 0 ? (copperCost / totalCost) * 100 : 0
  
  // Calculate margin impact (assuming 15% target margin)
  const targetMargin = 15
  const actualMargin = ((totalCost * 1.15) - totalCost) / (totalCost * 1.15) * 100
  const marginImpact = actualMargin - targetMargin
  
  // Determine risk level
  let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low'
  const recommendations: string[] = []
  
  if (copperPercentage > 30) {
    riskLevel = 'High'
    recommendations.push('Contact Finance team to set up copper futures contract')
    recommendations.push('Negotiate fixed-price agreement with supplier')
  }
  
  if (marginImpact < -5) {
    riskLevel = riskLevel === 'High' ? 'Critical' : 'Medium'
    recommendations.push('Increase selling price by 5-10% to meet margin target')
    recommendations.push('Request supplier discount or find alternative supplier')
  }
  
  if (copperWeight > 100) {
    recommendations.push('Set up LME price alerts for daily monitoring')
    recommendations.push('Consider splitting order into smaller batches')
  }
  
  if (riskLevel === 'Critical') {
    recommendations.push('Escalate to Procurement Manager for approval')
    recommendations.push('Find non-copper alternative materials')
    recommendations.push('Postpone order until copper prices stabilize')
  }
  
  return {
    itemId: item.id,
    partNumber: item.partNumber,
    name: item.name,
    baseCost,
    copperCost,
    totalCost,
    copperWeight,
    copperPercentage,
    marginImpact,
    riskLevel,
    recommendations
  }
}

export function calculateOrderEconomics(items: PurchaseOrderItem[]): EconomicsSummary {
  let totalBaseCost = 0
  let totalCopperCost = 0
  let totalCopperWeight = 0
  
  items.forEach(item => {
    // Estimate copper content based on item description and specifications
    const estimatedCopperWeight = estimateCopperWeightFromPOItem(item)
    const copperCost = (estimatedCopperWeight / 1000) * COPPER_LME_PRICE * item.quantity
    const baseCost = item.unitPrice * item.quantity
    
    totalBaseCost += baseCost
    totalCopperCost += copperCost
    totalCopperWeight += estimatedCopperWeight * item.quantity
  })
  
  const totalCost = totalBaseCost + totalCopperCost
  const averageMargin = totalCost > 0 ? ((totalCost * 1.15) - totalCost) / (totalCost * 1.15) * 100 : 0
  const copperExposure = totalCost > 0 ? (totalCopperCost / totalCost) * 100 : 0
  
  // Determine overall risk level
  let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low'
  const recommendations: string[] = []
  
  if (copperExposure > 25) {
    riskLevel = 'High'
    recommendations.push('Contact Finance team to hedge copper exposure')
    recommendations.push('Negotiate fixed-price contracts with suppliers')
    recommendations.push('Consider copper price adjustment clauses in contracts')
  }
  
  if (averageMargin < 10) {
    riskLevel = riskLevel === 'High' ? 'Critical' : 'Medium'
    recommendations.push('Review and increase selling prices by 8-12%')
    recommendations.push('Request volume discounts from suppliers')
    recommendations.push('Find alternative suppliers with better pricing')
  }
  
  if (totalCopperWeight > 500) {
    recommendations.push('Set up automated LME price monitoring system')
    recommendations.push('Split large orders into monthly deliveries')
    recommendations.push('Establish copper price ceiling for purchases')
  }
  
  if (riskLevel === 'Critical') {
    recommendations.push('STOP: Get Procurement Manager approval before proceeding')
    recommendations.push('Prepare alternative material specifications')
    recommendations.push('Delay order until market conditions improve')
  }
  
  return {
    totalBaseCost,
    totalCopperCost,
    totalCost,
    averageMargin,
    riskLevel,
    copperExposure,
    recommendations
  }
}

function extractCopperWeight(item: Item): number {
  // Try to extract copper weight from specifications or description
  const text = `${item.specifications || ''} ${item.description || ''} ${item.name || ''}`.toLowerCase()
  
  // Look for copper weight patterns
  const copperPatterns = [
    /copper[:\s]*(\d+(?:\.\d+)?)\s*kg/i,
    /cu[:\s]*(\d+(?:\.\d+)?)\s*kg/i,
    /(\d+(?:\.\d+)?)\s*kg[:\s]*copper/i,
    /(\d+(?:\.\d+)?)\s*kg[:\s]*cu/i
  ]
  
  for (const pattern of copperPatterns) {
    const match = text.match(pattern)
    if (match) {
      return parseFloat(match[1])
    }
  }
  
  // If no specific copper weight found, estimate based on category and name
  return estimateCopperWeight(item)
}

function estimateCopperWeight(item: Item): number {
  // Estimate copper weight based on item characteristics
  const name = (item.name || '').toLowerCase()
  const category = (item.category || '').toLowerCase()
  
  // Steel items typically have minimal copper
  if (category.includes('steel') || name.includes('steel')) {
    return 0
  }
  
  // Electrical items might have copper
  if (name.includes('wire') || name.includes('cable') || name.includes('electrical')) {
    return 5 // Estimate 5kg copper per unit
  }
  
  // Piping might have copper
  if (name.includes('pipe') || name.includes('tube')) {
    return 2 // Estimate 2kg copper per unit
  }
  
  // Fasteners typically minimal copper
  if (category.includes('fastener') || name.includes('bolt') || name.includes('screw')) {
    return 0.1
  }
  
  // Default estimate
  return 1
}

function estimateCopperWeightFromPOItem(item: PurchaseOrderItem): number {
  // Try to extract copper weight from specifications or description first
  const text = `${item.specifications || ''} ${item.description || ''}`.toLowerCase()
  
  // Look for copper weight patterns
  const copperPatterns = [
    /copper[:\s]*(\d+(?:\.\d+)?)\s*kg/i,
    /cu[:\s]*(\d+(?:\.\d+)?)\s*kg/i,
    /(\d+(?:\.\d+)?)\s*kg[:\s]*copper/i,
    /(\d+(?:\.\d+)?)\s*kg[:\s]*cu/i
  ]
  
  for (const pattern of copperPatterns) {
    const match = text.match(pattern)
    if (match) {
      return parseFloat(match[1])
    }
  }
  
  // Estimate based on description and part number
  const description = (item.description || '').toLowerCase()
  const partNumber = (item.partNumber || '').toLowerCase()
  
  // Steel items typically have minimal copper
  if (description.includes('steel') || partNumber.includes('steel')) {
    return 0
  }
  
  // Electrical items might have copper
  if (description.includes('wire') || description.includes('cable') || description.includes('electrical')) {
    return 5 // Estimate 5kg copper per unit
  }
  
  // Piping might have copper
  if (description.includes('pipe') || description.includes('tube')) {
    return 2 // Estimate 2kg copper per unit
  }
  
  // Fasteners typically minimal copper
  if (description.includes('bolt') || description.includes('screw') || description.includes('fastener')) {
    return 0.1
  }
  
  // Default estimate
  return 1
}
