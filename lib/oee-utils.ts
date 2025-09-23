import type { OEEMetrics, DowntimeReason, QualityIssue, ProductionLine, OEEAlert, OEETrend } from "./types"

/**
 * OEE Calculation Utilities
 * 
 * OEE (Overall Equipment Effectiveness) = Availability × Performance × Quality
 * 
 * Availability = (Actual Production Time / Planned Production Time) × 100
 * Performance = (Actual Output / Ideal Output) × 100
 * Quality = (Good Units / Total Units) × 100
 */

export class OEECalculator {
  /**
   * Calculate availability percentage
   */
  static calculateAvailability(plannedProductionTime: number, downtime: number): number {
    if (plannedProductionTime === 0) return 0
    const actualProductionTime = plannedProductionTime - downtime
    return (actualProductionTime / plannedProductionTime) * 100
  }

  /**
   * Calculate performance percentage
   */
  static calculatePerformance(actualProductionTime: number, idealCycleTime: number, totalUnitsProduced: number): number {
    if (actualProductionTime === 0 || idealCycleTime === 0) return 0
    const idealRunTime = totalUnitsProduced * idealCycleTime
    return (idealRunTime / actualProductionTime) * 100
  }

  /**
   * Calculate quality percentage
   */
  static calculateQuality(totalUnitsProduced: number, goodUnitsProduced: number): number {
    if (totalUnitsProduced === 0) return 0
    return (goodUnitsProduced / totalUnitsProduced) * 100
  }

  /**
   * Calculate overall OEE
   */
  static calculateOEE(availability: number, performance: number, quality: number): number {
    return (availability / 100) * (performance / 100) * (quality / 100) * 100
  }

  /**
   * Calculate OEE metrics for a workstation
   */
  static calculateWorkstationOEE(data: {
    plannedProductionTime: number // minutes
    actualProductionTime: number // minutes
    downtime: number // minutes
    idealCycleTime: number // minutes per unit
    actualCycleTime: number // minutes per unit
    totalUnitsProduced: number
    goodUnitsProduced: number
    defectiveUnits: number
  }): {
    availability: number
    performance: number
    quality: number
    oee: number
    throughput: number
    efficiency: number
    utilization: number
  } {
    const { 
      plannedProductionTime, 
      actualProductionTime, 
      downtime, 
      idealCycleTime, 
      actualCycleTime, 
      totalUnitsProduced, 
      goodUnitsProduced, 
      defectiveUnits 
    } = data

    // Availability calculation
    const availability = plannedProductionTime > 0 
      ? (actualProductionTime / plannedProductionTime) * 100 
      : 0

    // Performance calculation
    const idealOutput = actualProductionTime / idealCycleTime
    const performance = idealOutput > 0 
      ? (totalUnitsProduced / idealOutput) * 100 
      : 0

    // Quality calculation
    const quality = totalUnitsProduced > 0 
      ? (goodUnitsProduced / totalUnitsProduced) * 100 
      : 0

    // Overall OEE
    const oee = (availability * performance * quality) / 10000

    // Additional metrics
    const throughput = actualProductionTime > 0 
      ? (totalUnitsProduced / actualProductionTime) * 60 
      : 0 // units per hour

    const efficiency = actualCycleTime > 0 
      ? (idealCycleTime / actualCycleTime) * 100 
      : 0

    const utilization = plannedProductionTime > 0 
      ? (actualProductionTime / plannedProductionTime) * 100 
      : 0

    return {
      availability: Math.round(availability * 100) / 100,
      performance: Math.round(performance * 100) / 100,
      quality: Math.round(quality * 100) / 100,
      oee: Math.round(oee * 100) / 100,
      throughput: Math.round(throughput * 100) / 100,
      efficiency: Math.round(efficiency * 100) / 100,
      utilization: Math.round(utilization * 100) / 100
    }
  }

  /**
   * Calculate OEE for a production line (weighted by production time)
   */
  static calculateProductionLineOEE(workstationOEEs: OEEMetrics[]): {
    availability: number
    performance: number
    quality: number
    oee: number
    throughput: number
    downtime: number
    defectiveUnits: number
  } {
    if (workstationOEEs.length === 0) {
      return {
        availability: 0,
        performance: 0,
        quality: 0,
        oee: 0,
        throughput: 0,
        downtime: 0,
        defectiveUnits: 0
      }
    }

    // Aggregate all metrics across workstations
    const totalPlannedProductionTime = workstationOEEs.reduce((sum, m) => sum + m.plannedProductionTime, 0)
    const totalDowntime = workstationOEEs.reduce((sum, m) => sum + m.downtime, 0)
    const totalActualProductionTime = totalPlannedProductionTime - totalDowntime
    const totalIdealRunTime = workstationOEEs.reduce((sum, m) => sum + (m.totalUnitsProduced * m.idealCycleTime), 0)
    const totalGoodUnitsProduced = workstationOEEs.reduce((sum, m) => sum + m.goodUnitsProduced, 0)
    const totalUnitsProduced = workstationOEEs.reduce((sum, m) => sum + m.totalUnitsProduced, 0)
    const totalDefectiveUnits = workstationOEEs.reduce((sum, m) => sum + m.defectiveUnits, 0)

    // Calculate weighted OEE metrics
    const availability = OEECalculator.calculateAvailability(totalPlannedProductionTime, totalDowntime)
    const performance = OEECalculator.calculatePerformance(totalActualProductionTime, totalIdealRunTime / totalUnitsProduced, totalUnitsProduced)
    const quality = OEECalculator.calculateQuality(totalUnitsProduced, totalGoodUnitsProduced)
    const oee = OEECalculator.calculateOEE(availability, performance, quality)

    const throughput = totalActualProductionTime > 0 ? (totalUnitsProduced / totalActualProductionTime) * 60 : 0 // units per hour

    return {
      availability: parseFloat(availability.toFixed(1)),
      performance: parseFloat(performance.toFixed(1)),
      quality: parseFloat(quality.toFixed(1)),
      oee: parseFloat(oee.toFixed(1)),
      throughput: parseFloat(throughput.toFixed(1)),
      downtime: totalDowntime,
      defectiveUnits: totalDefectiveUnits
    }
  }

  /**
   * Calculate real-time OEE for a workstation
   */
  static calculateRealTimeOEE(workstationId: string, currentData: {
    plannedProductionTime: number
    actualProductionTime: number
    downtime: number
    idealCycleTime: number
    actualCycleTime: number
    totalUnitsProduced: number
    goodUnitsProduced: number
    defectiveUnits: number
  }): {
    availability: number
    performance: number
    quality: number
    oee: number
    throughput: number
  } {
    const availability = OEECalculator.calculateAvailability(currentData.plannedProductionTime, currentData.downtime)
    const performance = OEECalculator.calculatePerformance(currentData.actualProductionTime, currentData.idealCycleTime, currentData.totalUnitsProduced)
    const quality = OEECalculator.calculateQuality(currentData.totalUnitsProduced, currentData.goodUnitsProduced)
    const oee = OEECalculator.calculateOEE(availability, performance, quality)
    const throughput = currentData.actualProductionTime > 0 ? (currentData.totalUnitsProduced / currentData.actualProductionTime) * 60 : 0

    return {
      availability: parseFloat(availability.toFixed(1)),
      performance: parseFloat(performance.toFixed(1)),
      quality: parseFloat(quality.toFixed(1)),
      oee: parseFloat(oee.toFixed(1)),
      throughput: parseFloat(throughput.toFixed(1))
    }
  }

  /**
   * Calculate OEE trends over time
   */
  static calculateOEETrends(metrics: OEEMetrics[], period: "Hourly" | "Daily" | "Weekly" | "Monthly"): {
    period: string
    oee: number
    availability: number
    performance: number
    quality: number
    throughput: number
  }[] {
    const groupedMetrics = this.groupMetricsByPeriod(metrics, period)
    
    return Object.entries(groupedMetrics).map(([periodKey, periodMetrics]) => {
      const lineOEE = OEECalculator.calculateProductionLineOEE(periodMetrics)
      return {
        period: periodKey,
        oee: lineOEE.oee,
        availability: lineOEE.availability,
        performance: lineOEE.performance,
        quality: lineOEE.quality,
        throughput: lineOEE.throughput
      }
    }).sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime())
  }

  /**
   * Group metrics by time period
   */
  private static groupMetricsByPeriod(metrics: OEEMetrics[], period: "Hourly" | "Daily" | "Weekly" | "Monthly"): { [key: string]: OEEMetrics[] } {
    const grouped: { [key: string]: OEEMetrics[] } = {}
    
    metrics.forEach(metric => {
      const date = new Date(metric.date)
      let key: string
      
      switch (period) {
        case "Hourly":
          key = date.toISOString().slice(0, 13) // YYYY-MM-DDTHH
          break
        case "Daily":
          key = date.toISOString().slice(0, 10) // YYYY-MM-DD
          break
        case "Weekly":
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          key = weekStart.toISOString().slice(0, 10)
          break
        case "Monthly":
          key = date.toISOString().slice(0, 7) // YYYY-MM
          break
        default:
          key = date.toISOString().slice(0, 10)
      }
      
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(metric)
    })
    
    return grouped
  }

  /**
   * Generate OEE alerts based on thresholds
   */
  static generateAlerts(oeeMetrics: OEEMetrics[], thresholds: {
    minOEE: number
    maxDowntime: number
    maxDefectRate: number
    minPerformance: number
  }): OEEAlert[] {
    const alerts: OEEAlert[] = []
    const now = new Date().toISOString()

    oeeMetrics.forEach(metrics => {
      // Low OEE alert
      if (metrics.oee < thresholds.minOEE) {
        alerts.push({
          id: `alert-${metrics.workstationId}-oee-${Date.now()}`,
          workstationId: metrics.workstationId,
          productionLineId: metrics.productionLineId,
          type: "Low OEE",
          severity: metrics.oee < thresholds.minOEE * 0.5 ? "Critical" : "High",
          message: `OEE is ${metrics.oee}%, below threshold of ${thresholds.minOEE}%`,
          value: metrics.oee,
          threshold: thresholds.minOEE,
          unit: "%",
          status: "Active",
          createdAt: now,
          updatedAt: now
        })
      }

      // High downtime alert
      if (metrics.downtime > thresholds.maxDowntime) {
        alerts.push({
          id: `alert-${metrics.workstationId}-downtime-${Date.now()}`,
          workstationId: metrics.workstationId,
          productionLineId: metrics.productionLineId,
          type: "High Downtime",
          severity: metrics.downtime > thresholds.maxDowntime * 2 ? "Critical" : "High",
          message: `Downtime is ${metrics.downtime} minutes, above threshold of ${thresholds.maxDowntime} minutes`,
          value: metrics.downtime,
          threshold: thresholds.maxDowntime,
          unit: "minutes",
          status: "Active",
          createdAt: now,
          updatedAt: now
        })
      }

      // Quality issue alert
      const defectRate = metrics.defectiveUnits / metrics.totalUnitsProduced * 100
      if (defectRate > thresholds.maxDefectRate) {
        alerts.push({
          id: `alert-${metrics.workstationId}-quality-${Date.now()}`,
          workstationId: metrics.workstationId,
          productionLineId: metrics.productionLineId,
          type: "Quality Issue",
          severity: defectRate > thresholds.maxDefectRate * 2 ? "Critical" : "High",
          message: `Defect rate is ${defectRate.toFixed(2)}%, above threshold of ${thresholds.maxDefectRate}%`,
          value: defectRate,
          threshold: thresholds.maxDefectRate,
          unit: "%",
          status: "Active",
          createdAt: now,
          updatedAt: now
        })
      }

      // Performance drop alert
      if (metrics.performance < thresholds.minPerformance) {
        alerts.push({
          id: `alert-${metrics.workstationId}-performance-${Date.now()}`,
          workstationId: metrics.workstationId,
          productionLineId: metrics.productionLineId,
          type: "Performance Drop",
          severity: metrics.performance < thresholds.minPerformance * 0.7 ? "Critical" : "Medium",
          message: `Performance is ${metrics.performance}%, below threshold of ${thresholds.minPerformance}%`,
          value: metrics.performance,
          threshold: thresholds.minPerformance,
          unit: "%",
          status: "Active",
          createdAt: now,
          updatedAt: now
        })
      }
    })

    return alerts
  }

  /**
   * Calculate OEE trends over time
   */
  static calculateTrends(oeeMetrics: OEEMetrics[], period: "Hourly" | "Daily" | "Weekly" | "Monthly"): OEETrend[] {
    const trends: OEETrend[] = []
    const groupedData = this.groupMetricsByPeriod(oeeMetrics, period)

    Object.entries(groupedData).forEach(([date, metrics]) => {
      const lineOEE = this.calculateProductionLineOEE(metrics)
      
      trends.push({
        id: `trend-${date}-${period}`,
        workstationId: metrics[0]?.workstationId || "",
        productionLineId: metrics[0]?.productionLineId,
        period,
        date,
        oee: lineOEE.oee,
        availability: lineOEE.availability,
        performance: lineOEE.performance,
        quality: lineOEE.quality,
        throughput: lineOEE.throughput,
        downtime: metrics.reduce((sum, m) => sum + m.downtime, 0),
        defects: metrics.reduce((sum, m) => sum + m.defectiveUnits, 0)
      })
    })

    return trends.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }


  /**
   * Get OEE performance rating
   */
  static getOEERating(oee: number): {
    rating: "Excellent" | "Good" | "Average" | "Poor" | "Critical"
    color: string
    description: string
  } {
    if (oee >= 90) {
      return {
        rating: "Excellent",
        color: "text-green-600",
        description: "World-class performance"
      }
    } else if (oee >= 80) {
      return {
        rating: "Good",
        color: "text-blue-600",
        description: "Above average performance"
      }
    } else if (oee >= 70) {
      return {
        rating: "Average",
        color: "text-yellow-600",
        description: "Acceptable performance"
      }
    } else if (oee >= 50) {
      return {
        rating: "Poor",
        color: "text-orange-600",
        description: "Below average performance"
      }
    } else {
      return {
        rating: "Critical",
        color: "text-red-600",
        description: "Critical performance issues"
      }
    }
  }

  /**
   * Calculate production line utilization
   */
  static calculateProductionLineUtilization(productionLine: ProductionLine, workstationOEEs: OEEMetrics[]): number {
    if (workstationOEEs.length === 0) return 0

    const totalActualTime = workstationOEEs.reduce((sum, oee) => sum + oee.actualProductionTime, 0)
    const totalPlannedTime = workstationOEEs.reduce((sum, oee) => sum + oee.plannedProductionTime, 0)

    return totalPlannedTime > 0 ? (totalActualTime / totalPlannedTime) * 100 : 0
  }

  /**
   * Get downtime analysis
   */
  static analyzeDowntime(downtimeReasons: DowntimeReason[]): {
    totalDowntime: number
    categories: Record<string, { duration: number; count: number; percentage: number }>
    topIssues: Array<{ category: string; duration: number; percentage: number }>
  } {
    const totalDowntime = downtimeReasons.reduce((sum, reason) => sum + reason.duration, 0)
    const categories: Record<string, { duration: number; count: number; percentage: number }> = {}

    downtimeReasons.forEach(reason => {
      if (!categories[reason.category]) {
        categories[reason.category] = { duration: 0, count: 0, percentage: 0 }
      }
      categories[reason.category].duration += reason.duration
      categories[reason.category].count += 1
    })

    // Calculate percentages
    Object.keys(categories).forEach(category => {
      categories[category].percentage = totalDowntime > 0 
        ? (categories[category].duration / totalDowntime) * 100 
        : 0
    })

    // Get top issues
    const topIssues = Object.entries(categories)
      .map(([category, data]) => ({
        category,
        duration: data.duration,
        percentage: data.percentage
      }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)

    return {
      totalDowntime,
      categories,
      topIssues
    }
  }
}

/**
 * OEE Constants and Defaults
 */
export const OEE_CONSTANTS = {
  DEFAULT_THRESHOLDS: {
    minOEE: 75,
    maxDowntime: 60, // minutes
    maxDefectRate: 2, // percentage
    minPerformance: 80
  },
  WORLD_CLASS_OEE: 90,
  GOOD_OEE: 80,
  AVERAGE_OEE: 70,
  POOR_OEE: 50,
  SHIFT_DURATION: 480, // 8 hours in minutes
  BREAK_DURATION: 30, // 30 minutes
  LUNCH_DURATION: 60 // 60 minutes
}

/**
 * OEE Helper Functions
 */
export const formatOEEValue = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`
}

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

export const formatThroughput = (throughput: number): string => {
  return `${throughput.toFixed(1)} units/hr`
}

export const getOEEStatusColor = (oee: number): string => {
  if (oee >= 90) return "text-green-600 bg-green-50"
  if (oee >= 80) return "text-blue-600 bg-blue-50"
  if (oee >= 70) return "text-yellow-600 bg-yellow-50"
  if (oee >= 50) return "text-orange-600 bg-orange-50"
  return "text-red-600 bg-red-50"
}

export const getAlertSeverityColor = (severity: "Low" | "Medium" | "High" | "Critical"): string => {
  switch (severity) {
    case "Low": return "text-blue-600 bg-blue-50"
    case "Medium": return "text-yellow-600 bg-yellow-50"
    case "High": return "text-orange-600 bg-orange-50"
    case "Critical": return "text-red-600 bg-red-50"
    default: return "text-gray-600 bg-gray-50"
  }
}
