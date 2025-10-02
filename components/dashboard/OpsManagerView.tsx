"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
    Factory, Clock, CheckCircle, Box, Activity, TrendingUp, AlertTriangle,
    Users, Wrench, Target, BarChart3, Settings, RefreshCw, Zap, Shield,
    Calendar, Eye, Brain, Package, MapPin, DollarSign
} from "lucide-react"
import MetricCard from "./MetricCard"
import SectionCard from "./SectionCard"
import { useEffect } from "react"

// Chart.js type declarations for CDN usage
declare global {
    interface Window {
        Chart: any
    }
}

interface OpsManagerViewProps {
    formatters: {
        Currency: Intl.NumberFormat
        Integer: Intl.NumberFormat
        Percent: (v: number) => string
    }
    stats: {
        prod: {
            wos: number
            wosActive: number
            wosPlanned: number
            wosDone: number
            estHours: number
        }
        inv: {
            totalItems: number
            low: number
            out: number
            value: number
        }
        eng: {
            drawings: number
            drawingsReleased: number
            drawingsReview: number
            boms: number
            bomsApproved: number
            bomsDraft: number
        }
        actives: {
            customersActive: number
            suppliersActive: number
        }
        sales: {
            soTotal: number
            soActive: number
            soValue: number
        }
    }
    moduleCharts: {
        production: {
            workOrderStatus: any[]
            productionEfficiency: any[]
            qualityMetrics: any[]
        }
        demandSupply: {
            stockLevels: any[]
            demandVsSupply: any[]
            inventoryTurnover: any[]
        }
        materialShortages: {
            criticalShortages: any[]
        }
        exceptionManagement: {
            capacityOverloads: any[]
        }
    }
}

export default function OpsManagerView({ formatters, stats, moduleCharts }: OpsManagerViewProps) {
    // Mock operational data
    const operationalData = {
        efficiency: {
            oee: 87.5,
            utilization: 92.3,
            availability: 94.8,
            quality: 96.2
        },
        production: {
            cycleTime: 4.2,
            targetCycleTime: 3.5,
            throughput: 1250,
            targetThroughput: 1400
        },
        quality: {
            firstPassYield: 94.2,
            defectRate: 2.1,
            reworkRate: 3.7,
            customerReturns: 0.8
        },
        maintenance: {
            planned: 85,
            unplanned: 12,
            preventive: 78,
            breakdowns: 3
        },
        workstations: [
            { name: "Assembly Line 1", efficiency: 92, status: "Running", utilization: 88 },
            { name: "Machining Center", efficiency: 89, status: "Running", utilization: 95 },
            { name: "Welding Station", efficiency: 94, status: "Running", utilization: 82 },
            { name: "Quality Control", efficiency: 96, status: "Running", utilization: 90 },
            { name: "Packaging Line", efficiency: 91, status: "Maintenance", utilization: 0 }
        ],
        alerts: [
            { type: "warning", message: "Low stock: Steel Rods (Qty: 15)", priority: "high" },
            { type: "info", message: "Work Order #WO-2024-001 delayed by 2 hours", priority: "medium" },
            { type: "success", message: "Quality check passed for Batch #QC-2024-045", priority: "low" },
            { type: "warning", message: "Machine calibration due in 3 days", priority: "medium" }
        ]
    }

    // Initialize charts
    useEffect(() => {
        const initializeCharts = () => {
            if (typeof window !== 'undefined' && window.Chart && typeof window.Chart === 'function') {
                // Production Efficiency Chart
                const efficiencyCtx = document.getElementById('productionEfficiencyChart') as HTMLCanvasElement
                if (efficiencyCtx) {
                    const existingChart = window.Chart.getChart(efficiencyCtx)
                    if (existingChart) {
                        existingChart.destroy()
                    }

                    new window.Chart(efficiencyCtx, {
                        type: 'bar',
                        data: {
                            labels: operationalData.workstations.map(ws => ws.name),
                            datasets: [{
                                label: 'Efficiency %',
                                data: operationalData.workstations.map(ws => ws.efficiency),
                                backgroundColor: operationalData.workstations.map(ws => 
                                    ws.status === 'Running' ? 'rgba(34, 197, 94, 0.8)' : 'rgba(251, 146, 60, 0.8)'
                                ),
                                borderColor: operationalData.workstations.map(ws => 
                                    ws.status === 'Running' ? 'rgba(34, 197, 94, 1)' : 'rgba(251, 146, 60, 1)'
                                ),
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    display: false
                                },
                                tooltip: {
                                    callbacks: {
                                        afterLabel: function(context: any) {
                                            const ws = operationalData.workstations[context.dataIndex]
                                            return `Status: ${ws.status}\nUtilization: ${ws.utilization}%`
                                        }
                                    }
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    max: 100,
                                    ticks: {
                                        callback: function(value: any) {
                                            return value + '%'
                                        }
                                    }
                                }
                            }
                        }
                    })
                }

                // Production Status Doughnut Chart
                const productionCtx = document.getElementById('productionStatusChart') as HTMLCanvasElement
                const productionLoading = document.getElementById('productionStatusLoading')
                if (productionCtx) {
                    const existingChart = window.Chart.getChart(productionCtx)
                    if (existingChart) {
                        existingChart.destroy()
                    }

                    if (productionLoading) {
                        productionLoading.style.display = 'none'
                    }

                    new window.Chart(productionCtx, {
                        type: 'doughnut',
                        data: {
                            labels: ['Active', 'Completed', 'Planned', 'On Hold'],
                            datasets: [{
                                data: [stats.prod.wosActive, stats.prod.wosDone, stats.prod.wosPlanned, 5],
                                backgroundColor: [
                                    'rgba(59, 130, 246, 0.8)',
                                    'rgba(34, 197, 94, 0.8)',
                                    'rgba(251, 146, 60, 0.8)',
                                    'rgba(239, 68, 68, 0.8)'
                                ],
                                borderColor: [
                                    'rgba(59, 130, 246, 1)',
                                    'rgba(34, 197, 94, 1)',
                                    'rgba(251, 146, 60, 1)',
                                    'rgba(239, 68, 68, 1)'
                                ],
                                borderWidth: 2
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: {
                                        font: {
                                            size: 10
                                        },
                                        usePointStyle: true,
                                        padding: 15
                                    }
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function(context: any) {
                                            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
                                            const percentage = ((context.parsed / total) * 100).toFixed(1)
                                            return context.label + ': ' + context.parsed + ' (' + percentage + '%)'
                                        }
                                    }
                                }
                            }
                        }
                    })
                }

                // Inventory Levels Doughnut Chart
                const inventoryCtx = document.getElementById('inventoryLevelsChart') as HTMLCanvasElement
                const inventoryLoading = document.getElementById('inventoryLevelsLoading')
                if (inventoryCtx) {
                    const existingChart = window.Chart.getChart(inventoryCtx)
                    if (existingChart) {
                        existingChart.destroy()
                    }

                    if (inventoryLoading) {
                        inventoryLoading.style.display = 'none'
                    }

                    new window.Chart(inventoryCtx, {
                        type: 'doughnut',
                        data: {
                            labels: ['In Stock', 'Low Stock', 'Out of Stock', 'Reserved'],
                            datasets: [{
                                data: [
                                    stats.inv.totalItems - stats.inv.low - stats.inv.out - 10,
                                    stats.inv.low,
                                    stats.inv.out,
                                    10
                                ],
                                backgroundColor: [
                                    'rgba(34, 197, 94, 0.8)',
                                    'rgba(251, 146, 60, 0.8)',
                                    'rgba(239, 68, 68, 0.8)',
                                    'rgba(147, 51, 234, 0.8)'
                                ],
                                borderColor: [
                                    'rgba(34, 197, 94, 1)',
                                    'rgba(251, 146, 60, 1)',
                                    'rgba(239, 68, 68, 1)',
                                    'rgba(147, 51, 234, 1)'
                                ],
                                borderWidth: 2
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: {
                                        font: {
                                            size: 10
                                        },
                                        usePointStyle: true,
                                        padding: 15
                                    }
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function(context: any) {
                                            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
                                            const percentage = ((context.parsed / total) * 100).toFixed(1)
                                            return context.label + ': ' + context.parsed + ' (' + percentage + '%)'
                                        }
                                    }
                                }
                            }
                        }
                    })
                }
            } else {
                setTimeout(initializeCharts, 200)
            }
        }

        initializeCharts()
    }, [stats])

    return (
        <div className="space-y-8">
            {/* Primary Operational KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard 
                    icon={<Factory className="w-5 h-5" />} 
                    label="Active Work Orders" 
                    value={formatters.Integer.format(stats.prod.wosActive)} 
                    sub={`${stats.prod.wosDone} completed`} 
                />
                <MetricCard 
                    icon={<Clock className="w-5 h-5" />} 
                    label="Avg. Cycle Time" 
                    value={`${operationalData.production.cycleTime} days`} 
                    sub={`Target: ${operationalData.production.targetCycleTime} days`} 
                />
                <MetricCard 
                    icon={<CheckCircle className="w-5 h-5" />} 
                    label="Quality Rate" 
                    value={`${operationalData.quality.firstPassYield}%`} 
                    sub={`+2.1% vs last month`} 
                />
                <MetricCard 
                    icon={<Box className="w-5 h-5" />} 
                    label="Inventory Value" 
                    value={formatters.Currency.format(stats.inv.value)} 
                    sub={`${stats.inv.low} low stock items`} 
                />
            </div>

            {/* Secondary KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard 
                    icon={<Zap className="w-5 h-5" />} 
                    label="OEE" 
                    value={`${operationalData.efficiency.oee}%`} 
                    sub="Overall Equipment Effectiveness" 
                />
                <MetricCard 
                    icon={<Target className="w-5 h-5" />} 
                    label="Throughput" 
                    value={formatters.Integer.format(operationalData.production.throughput)} 
                    sub={`Target: ${operationalData.production.targetThroughput} units`} 
                />
                <MetricCard 
                    icon={<Wrench className="w-5 h-5" />} 
                    label="Maintenance" 
                    value={`${operationalData.maintenance.planned}%`} 
                    sub="Planned vs Unplanned" 
                />
                <MetricCard 
                    icon={<AlertTriangle className="w-5 h-5" />} 
                    label="Defect Rate" 
                    value={`${operationalData.quality.defectRate}%`} 
                    sub="Quality Issues" 
                />
            </div>

            {/* Production & Quality Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <SectionCard title="🏭 Production Status" icon={<Factory className="w-5 h-5" />}>
                    <div className="h-48 relative">
                        <canvas id="productionStatusChart"></canvas>
                        <div id="productionStatusLoading" className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">
                            Loading chart...
                        </div>
                    </div>
                </SectionCard>
                
                <SectionCard title="📦 Inventory Levels" icon={<Box className="w-5 h-5" />}>
                    <div className="h-48 relative">
                        <canvas id="inventoryLevelsChart"></canvas>
                        <div id="inventoryLevelsLoading" className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">
                            Loading chart...
                        </div>
                    </div>
                </SectionCard>
                
                <SectionCard title="⚡ Efficiency Metrics" icon={<Activity className="w-5 h-5" />}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{operationalData.efficiency.oee}%</div>
                                <div className="text-sm text-gray-600">OEE</div>
                            </div>
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{operationalData.efficiency.utilization}%</div>
                                <div className="text-sm text-gray-600">Utilization</div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Availability</span>
                                <span className="font-medium">{operationalData.efficiency.availability}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Quality Rate</span>
                                <span className="font-medium">{operationalData.efficiency.quality}%</span>
                            </div>
                        </div>
                    </div>
                </SectionCard>
            </div>

            {/* Workstation Performance */}
            <SectionCard title="🏭 Workstation Performance" icon={<BarChart3 className="w-5 h-5" />}>
                <div className="h-64 relative">
                    <canvas id="productionEfficiencyChart"></canvas>
                </div>
            </SectionCard>

            {/* Quality & Maintenance Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionCard title="🔍 Quality Metrics" icon={<Shield className="w-5 h-5" />}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{operationalData.quality.firstPassYield}%</div>
                                <div className="text-sm text-gray-600">First Pass Yield</div>
                            </div>
                            <div className="text-center p-3 bg-red-50 rounded-lg">
                                <div className="text-2xl font-bold text-red-600">{operationalData.quality.defectRate}%</div>
                                <div className="text-sm text-gray-600">Defect Rate</div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Rework Rate</span>
                                <span className="font-medium">{operationalData.quality.reworkRate}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Customer Returns</span>
                                <span className="font-medium">{operationalData.quality.customerReturns}%</span>
                            </div>
                        </div>
                    </div>
                </SectionCard>

                <SectionCard title="🔧 Maintenance Status" icon={<Wrench className="w-5 h-5" />}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{operationalData.maintenance.planned}%</div>
                                <div className="text-sm text-gray-600">Planned</div>
                            </div>
                            <div className="text-center p-3 bg-orange-50 rounded-lg">
                                <div className="text-2xl font-bold text-orange-600">{operationalData.maintenance.unplanned}%</div>
                                <div className="text-sm text-gray-600">Unplanned</div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Preventive Maintenance</span>
                                <span className="font-medium">{operationalData.maintenance.preventive}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Breakdowns</span>
                                <span className="font-medium">{operationalData.maintenance.breakdowns}</span>
                            </div>
                        </div>
                    </div>
                </SectionCard>
            </div>

            {/* Real-time Alerts & Notifications */}
            <SectionCard title="🚨 Operational Alerts" icon={<AlertTriangle className="w-5 h-5" />}>
                <div className="space-y-3">
                    {operationalData.alerts.map((alert, index) => (
                        <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                            alert.type === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-400' :
                            alert.type === 'info' ? 'bg-blue-50 border-l-4 border-blue-400' :
                            alert.type === 'success' ? 'bg-green-50 border-l-4 border-green-400' :
                            'bg-gray-50 border-l-4 border-gray-400'
                        }`}>
                            <div className="flex items-center space-x-3">
                                <div className={`w-2 h-2 rounded-full ${
                                    alert.priority === 'high' ? 'bg-red-500' :
                                    alert.priority === 'medium' ? 'bg-yellow-500' :
                                    'bg-green-500'
                                }`}></div>
                                <span className="text-sm font-medium">{alert.message}</span>
                            </div>
                            <Badge variant={alert.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                                {alert.priority}
                            </Badge>
                        </div>
                    ))}
                </div>
            </SectionCard>

            {/* Quick Actions */}
            <SectionCard title="⚡ Quick Actions" icon={<Settings className="w-5 h-5" />}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-20 flex flex-col space-y-2">
                        <RefreshCw className="w-6 h-6" />
                        <span className="text-sm">Refresh Data</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col space-y-2">
                        <Wrench className="w-6 h-6" />
                        <span className="text-sm">Schedule Maintenance</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col space-y-2">
                        <Package className="w-6 h-6" />
                        <span className="text-sm">Update Inventory</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col space-y-2">
                        <Eye className="w-6 h-6" />
                        <span className="text-sm">View Reports</span>
                    </Button>
                </div>
            </SectionCard>
        </div>
    )
}
