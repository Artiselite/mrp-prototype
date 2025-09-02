"use client"

import * as React from "react"
import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
    Users, Building2, FileText, ShoppingCart, Wrench, ClipboardList, Calculator,
    Factory, Receipt, CheckCircle, Clock, TrendingUp, Box, MapPin, Package,
    DollarSign, BarChart3, TrendingDown, Target, Activity, AlertTriangle, Check, Settings,
    Brain, Calendar, Eye, RefreshCw, Shield, Zap
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useDatabaseContext } from "@/components/database-provider"
import Link from "next/link"


// Module-specific Chart Data (defined outside component to prevent recreation)
const moduleCharts = {
    // 1. Engineering Designs & Shop Drawings
    engineering: {
        // Drawing Status Distribution (Pie Chart)
        drawingStatus: [
            { status: "Released", count: 45, percentage: 45, color: "bg-green-500" },
            { status: "Under Review", count: 25, percentage: 25, color: "bg-yellow-500" },
            { status: "Draft", count: 20, percentage: 20, color: "bg-blue-500" },
            { status: "Obsolete", count: 10, percentage: 10, color: "bg-gray-500" }
        ],

        // Drawing Types by Category (Bar Chart)
        drawingTypes: [
            { category: "Structural", count: 35, percentage: 35 },
            { category: "Mechanical", count: 25, percentage: 25 },
            { category: "Electrical", count: 20, percentage: 20 },
            { category: "Piping", count: 15, percentage: 15 },
            { category: "Instrumentation", count: 5, percentage: 5 }
        ],

        // BOM Status Distribution (Pie Chart)
        bomStatus: [
            { status: "Approved", count: 60, percentage: 60, color: "bg-green-500" },
            { status: "Under Review", count: 25, percentage: 25, color: "bg-yellow-500" },
            { status: "Draft", count: 15, percentage: 15, color: "bg-blue-500" }
        ],

        // BOQ Cost Breakdown (Bar Chart)
        boqCostBreakdown: [
            { category: "Materials", cost: 450000, percentage: 45 },
            { category: "Labor", cost: 350000, percentage: 35 },
            { category: "Equipment", cost: 150000, percentage: 15 },
            { category: "Overhead", cost: 50000, percentage: 5 }
        ]
    },

    // 2. Demand & Supply Management
    demandSupply: {
        // Stock Level Distribution (Pie Chart)
        stockLevels: [
            { level: "Optimal", count: 45, percentage: 45, color: "bg-green-500" },
            { level: "Low Stock", count: 30, percentage: 30, color: "bg-yellow-500" },
            { level: "Critical", count: 15, percentage: 15, color: "bg-red-500" },
            { level: "Overstocked", count: 10, percentage: 10, color: "bg-blue-500" }
        ],

        // Demand vs Supply by Category (Bar Chart)
        demandVsSupply: [
            { category: "Structural Steel", demand: 85, supply: 78, gap: -7 },
            { category: "Steel Plates", demand: 62, supply: 65, gap: 3 },
            { category: "Fasteners", demand: 45, supply: 42, gap: -3 },
            { category: "Welding Supplies", demand: 38, supply: 40, gap: 2 },
            { category: "Coatings", demand: 28, supply: 25, gap: -3 },
            { category: "Aluminum", demand: 22, supply: 20, gap: -2 }
        ],

        // Inventory Turnover by Category (Bar Chart)
        inventoryTurnover: [
            { category: "Fasteners", turnover: 4.2, target: 3.0 },
            { category: "Welding Supplies", turnover: 3.8, target: 3.0 },
            { category: "Structural Steel", turnover: 3.1, target: 3.0 },
            { category: "Steel Plates", turnover: 2.9, target: 3.0 },
            { category: "Coatings", turnover: 2.5, target: 3.0 },
            { category: "Aluminum", turnover: 2.2, target: 3.0 }
        ]
    },

    // 3. Production Shopfloor Management
    production: {
        // Work Order Status Distribution (Pie Chart)
        workOrderStatus: [
            { status: "Completed", count: 40, percentage: 40, color: "bg-green-500" },
            { status: "In Progress", count: 35, percentage: 35, color: "bg-blue-500" },
            { status: "Planned", count: 20, percentage: 20, color: "bg-yellow-500" },
            { status: "On Hold", count: 5, percentage: 5, color: "bg-red-500" }
        ],

        // Production Efficiency by Line (Bar Chart)
        productionEfficiency: [
            { line: "Cutting Line", efficiency: 92, target: 90 },
            { line: "Welding Line 1", efficiency: 88, target: 90 },
            { line: "Welding Line 2", efficiency: 95, target: 90 },
            { line: "Assembly Line", efficiency: 89, target: 90 },
            { line: "Paint Line", efficiency: 84, target: 90 },
            { line: "Quality Check", efficiency: 78, target: 90 }
        ],

        // Quality Metrics by Process (Bar Chart)
        qualityMetrics: [
            { process: "Cutting", firstPass: 96, rework: 3, scrap: 1 },
            { process: "Welding", firstPass: 94, rework: 5, scrap: 1 },
            { process: "Assembly", firstPass: 98, rework: 2, scrap: 0 },
            { process: "Painting", firstPass: 92, rework: 6, scrap: 2 },
            { process: "Testing", firstPass: 97, rework: 3, scrap: 0 }
        ]
    },

    // 4. Testing & Recording (QA)
    qualityAssurance: {
        // Test Results Distribution (Pie Chart)
        testResults: [
            { result: "Passed", count: 85, percentage: 85, color: "bg-green-500" },
            { result: "Minor Issues", count: 10, percentage: 10, color: "bg-yellow-500" },
            { result: "Failed", count: 5, percentage: 5, color: "bg-red-500" }
        ],

        // Quality Metrics by Product Type (Bar Chart)
        qualityMetrics: [
            { product: "Bridge Components", passRate: 92, defectRate: 8 },
            { product: "Steel Structures", passRate: 88, defectRate: 12 },
            { product: "Pressure Vessels", passRate: 95, defectRate: 5 },
            { product: "Piping Systems", passRate: 90, defectRate: 10 },
            { product: "Equipment Mounts", passRate: 87, defectRate: 13 }
        ],

        // Inspection Types Distribution (Pie Chart)
        inspectionTypes: [
            { type: "Visual", count: 40, percentage: 40, color: "bg-blue-500" },
            { type: "Dimensional", count: 30, percentage: 30, color: "bg-green-500" },
            { type: "NDT Testing", count: 20, percentage: 20, color: "bg-yellow-500" },
            { type: "Material Testing", count: 10, percentage: 10, color: "bg-purple-500" }
        ]
    },

    // 5. Packaging & Logistics
    logistics: {
        // Shipment Status Distribution (Pie Chart)
        shipmentStatus: [
            { status: "Delivered", count: 70, percentage: 70, color: "bg-green-500" },
            { status: "In Transit", count: 20, percentage: 20, color: "bg-blue-500" },
            { status: "Delayed", count: 8, percentage: 8, color: "bg-yellow-500" },
            { status: "Lost/Damaged", count: 2, percentage: 2, color: "bg-red-500" }
        ],

        // Shipping Methods Distribution (Pie Chart)
        shippingMethods: [
            { method: "Truck", count: 50, percentage: 50, color: "bg-blue-500" },
            { method: "Rail", count: 30, percentage: 30, color: "bg-green-500" },
            { method: "Sea", count: 15, percentage: 15, color: "bg-yellow-500" },
            { method: "Air", count: 5, percentage: 5, color: "bg-purple-500" }
        ],

        // Delivery Performance by Region (Bar Chart)
        deliveryPerformance: [
            { region: "Northeast", onTime: 92, delayed: 8 },
            { region: "Southeast", onTime: 88, delayed: 12 },
            { region: "Midwest", onTime: 95, delayed: 5 },
            { region: "Southwest", onTime: 90, delayed: 10 },
            { region: "West Coast", onTime: 87, delayed: 13 }
        ]
    },

    // 6. Project Closeout Reports
    projectCloseout: {
        // Project Status Distribution (Pie Chart)
        projectStatus: [
            { status: "Completed", count: 60, percentage: 60, color: "bg-green-500" },
            { status: "In Progress", count: 25, percentage: 25, color: "bg-blue-500" },
            { status: "On Hold", count: 10, percentage: 10, color: "bg-yellow-500" },
            { status: "Cancelled", count: 5, percentage: 5, color: "bg-red-500" }
        ],

        // Project Performance by Type (Bar Chart)
        projectPerformance: [
            { type: "Bridge Construction", onTime: 85, onBudget: 90, quality: 95 },
            { type: "Steel Structures", onTime: 92, onBudget: 88, quality: 92 },
            { type: "Industrial Equipment", onTime: 78, onBudget: 85, quality: 88 },
            { type: "Pipeline Systems", onTime: 88, onBudget: 92, quality: 90 },
            { type: "Mining Equipment", onTime: 82, onBudget: 87, quality: 85 }
        ],

        // Customer Satisfaction Distribution (Pie Chart)
        customerSatisfaction: [
            { rating: "Very Satisfied", count: 45, percentage: 45, color: "bg-green-500" },
            { rating: "Satisfied", count: 40, percentage: 40, color: "bg-blue-500" },
            { rating: "Neutral", count: 12, percentage: 12, color: "bg-yellow-500" },
            { rating: "Dissatisfied", count: 3, percentage: 3, color: "bg-red-500" }
        ]
    },

    // 7. Production Planning & Control
    productionPlanning: {
        plannedVsReleased: {
            planned: 45,
            released: 38,
            releaseRate: 84
        },
        capacityUtilization: [
            { resource: "Cutting Line", utilization: 92, available: 160, required: 147 },
            { resource: "Welding Station 1", utilization: 88, available: 160, required: 141 },
            { resource: "Welding Station 2", utilization: 95, available: 160, required: 152 },
            { resource: "Assembly Line", utilization: 78, available: 160, required: 125 },
            { resource: "Paint Line", utilization: 85, available: 160, required: 136 }
        ],
        bottleneckAnalysis: [
            { resource: "Assembly Line", severity: "High", waitTime: 8, impact: "Production Delay", action: "Add Labor" },
            { resource: "Paint Line", severity: "Medium", waitTime: 4, impact: "Minor Delay", action: "Optimize Process" },
            { resource: "Quality Check", severity: "Low", waitTime: 2, impact: "No Impact", action: "Monitor" }
        ],
        scrapRework: {
            scrap: 3.2,
            rework: 5.8,
            totalLoss: 9.0
        }
    },

    // 8. Material Shortages & Supply Chain
    materialShortages: {
        criticalShortages: [
            { item: "W12x26 I-Beam", currentStock: 15, requiredStock: 45, daysUntilShortage: 2, impact: "Line Stoppage" },
            { item: "E7018 Welding Rod", currentStock: 50, requiredStock: 120, daysUntilShortage: 3, impact: "Production Slowdown" },
            { item: "Steel Plates 1/2\"", currentStock: 8, requiredStock: 35, daysUntilShortage: 1, impact: "Critical Delay" }
        ],
        shortageRecommendations: [
            { item: "W12x26 I-Beam", priority: "High", action: "Expedite Order", eta: "3 days", cost: 2500 },
            { item: "E7018 Welding Rod", priority: "Medium", action: "Reschedule Production", eta: "5 days", cost: 800 },
            { item: "Steel Plates 1/2\"", priority: "High", action: "Substitute Material", eta: "1 day", cost: 1200 }
        ],
        peggingAnalysis: [
            { item: "W12x26 I-Beam", shortageQty: 30, affectedQty: 45, affectedOrders: 3, orders: ["WO-001", "WO-003", "WO-005"] },
            { item: "E7018 Welding Rod", shortageQty: 70, affectedQty: 70, affectedOrders: 2, orders: ["WO-002", "WO-004"] },
            { item: "Steel Plates 1/2\"", shortageQty: 27, affectedQty: 35, affectedOrders: 1, orders: ["WO-006"] }
        ]
    },

    // 9. Exception Management
    exceptionManagement: {
        capacityOverloads: [
            { resource: "Cutting Line", load: 95, status: "Near Capacity" },
            { resource: "Welding Station 2", load: 105, status: "Overloaded" },
            { resource: "Assembly Line", load: 88, status: "Normal" }
        ]
    }
}

/** ---------------------------
 *  Small UI helpers (primitives)
 *  --------------------------*/
const Currency = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 })
const Integer = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 })
const Percent = (v: number) => `${Math.round(v)}%`

function metricTrendIcon(trend: "up" | "down" | "stable") {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-emerald-500" />
    if (trend === "down") return <TrendingDown className="w-4 h-4 text-rose-500" />
    return <BarChart3 className="w-4 h-4 text-gray-400" />
}

function Pill({
    label, tone = "neutral",
}: { label: React.ReactNode; tone?: "success" | "warn" | "danger" | "neutral" }) {
    const tones = {
        success: "bg-emerald-100 text-emerald-700",
        warn: "bg-amber-100 text-amber-800",
        danger: "bg-rose-100 text-rose-700",
        neutral: "bg-gray-100 text-gray-700",
    }
    return <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", tones[tone])}>{label}</span>
}

function Meter({
    value, max = 100, good = 90, warn = 80, showLabel = true, className,
}: { value: number; max?: number; good?: number; warn?: number; showLabel?: boolean; className?: string }) {
    const pct = Math.max(0, Math.min(100, (value / max) * 100))
    const tone =
        value >= good ? "bg-emerald-500" :
            value >= warn ? "bg-amber-500" :
                "bg-rose-500"
    return (
        <div className={cn("flex items-center space-x-2", className)}>
            <div className="flex-1 bg-gray-200/70 rounded-full h-2">
                <div className={cn("h-2 rounded-full", tone)} style={{ width: `${pct}%` }} />
            </div>
            {showLabel && <span className="text-xs text-gray-600 w-10 text-right">{Percent(pct)}</span>}
        </div>
    )
}

function SectionCard({ title, icon, subtitle, children, footer }: {
    title: string
    icon?: React.ReactNode
    subtitle?: React.ReactNode
    children: React.ReactNode
    footer?: React.ReactNode
}) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                    {icon}
                    <span>{title}</span>
                </CardTitle>
                {subtitle && <div className="text-sm text-gray-600">{subtitle}</div>}
            </CardHeader>
            <CardContent>
                {children}
                {footer && <div className="mt-4 pt-4 border-t border-gray-200">{footer}</div>}
            </CardContent>
        </Card>
    )
}

function MetricCard({ icon, label, value, sub }: {
    icon: React.ReactNode
    label: string
    value: string
    sub?: string
}) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center">
                    <div className="p-2 bg-gray-100 rounded-lg">{icon}</div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">{label}</p>
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                        {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// Chart Components
const EngineeringPieChart = ({ data, title }: { data: any[], title: string }) => (
    <div className="space-y-4">
        <h4 className="font-medium text-sm text-gray-900 text-center">{title}</h4>
        <div className="space-y-2">
            {data.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 text-xs">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-gray-600">{item.status}:</span>
                    <span className="font-medium">{item.count} ({item.percentage}%)</span>
                </div>
            ))}
        </div>
    </div>
)

const EngineeringBarChart = ({ data, title, yAxisLabel }: { data: any[], title: string, yAxisLabel: string }) => (
    <div className="space-y-4">
        <h4 className="font-medium text-sm text-gray-900 text-center">{title}</h4>
        <div className="space-y-3">
            {data.map((item, index) => (
                <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{item.category}</span>
                        <span className="font-medium">{yAxisLabel === "Cost" ? `$${item.cost.toLocaleString()}` : `${item.count} (${item.percentage}%)`}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="h-2 rounded-full bg-blue-500"
                            style={{ width: `${item.percentage}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    </div>
)

const DemandSupplyPieChart = ({ data, title }: { data: any[], title: string }) => (
    <div className="space-y-4">
        <h4 className="font-medium text-sm text-gray-900 text-center">{title}</h4>
        <div className="space-y-2">
            {data.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 text-xs">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-gray-600">{item.level}:</span>
                    <span className="font-medium">{item.count} ({item.percentage}%)</span>
                </div>
            ))}
        </div>
    </div>
)

const DemandSupplyBarChart = ({ data, title, type }: { data: any[], title: string, type: "demand" | "turnover" }) => (
    <div className="space-y-4">
        <h4 className="font-medium text-sm text-gray-900 text-center">{title}</h4>
        <div className="space-y-3">
            {data.map((item, index) => (
                <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{item.category}</span>
                        {type === "demand" ? (
                            <span className="font-medium">
                                {item.demand}% / {item.supply}%
                                <span className={`ml-1 ${item.gap >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ({item.gap >= 0 ? '+' : ''}{item.gap}%)
                                </span>
                            </span>
                        ) : (
                            <span className="font-medium">
                                {item.turnover}x (Target: {item.target}x)
                            </span>
                        )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full ${type === "demand" ?
                                (item.gap >= 0 ? 'bg-green-500' : 'bg-red-500') :
                                (item.turnover >= item.target ? 'bg-green-500' : 'bg-yellow-500')
                                }`}
                            style={{ width: `${type === "demand" ? Math.max(item.demand, item.supply) : (item.turnover / 5) * 100}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    </div>
)

const ProductionPieChart = ({ data, title }: { data: any[], title: string }) => (
    <div className="space-y-4">
        <h4 className="font-medium text-sm text-gray-900 text-center">{title}</h4>
        <div className="space-y-2">
            {data.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 text-xs">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-gray-600">{item.status}:</span>
                    <span className="font-medium">{item.count} ({item.percentage}%)</span>
                </div>
            ))}
        </div>
    </div>
)

const ProductionBarChart = ({ data, title, type }: { data: any[], title: string, type: "efficiency" | "quality" }) => (
    <div className="space-y-4">
        <h4 className="font-medium text-sm text-gray-900 text-center">{title}</h4>
        <div className="space-y-3">
            {data.map((item, index) => (
                <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{type === "efficiency" ? item.line : item.process}</span>
                        {type === "efficiency" ? (
                            <span className="font-medium">
                                {item.efficiency}% (Target: {item.target}%)
                            </span>
                        ) : (
                            <span className="font-medium">
                                {item.firstPass}% | {item.rework}% | {item.scrap}%
                            </span>
                        )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full ${type === "efficiency" ?
                                (item.efficiency >= item.target ? 'bg-green-500' : 'bg-yellow-500') :
                                (item.firstPass >= 95 ? 'bg-green-500' : item.firstPass >= 90 ? 'bg-yellow-500' : 'bg-red-500')
                                }`}
                            style={{ width: `${type === "efficiency" ? item.efficiency : item.firstPass}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    </div>
)

/** ---------------------------
 *  Page
 *  --------------------------*/
export default function DashboardPage() {
    const {
        customers = [], suppliers = [], quotations = [], salesOrders = [], engineeringDrawings = [],
        billsOfMaterials = [], billsOfQuantities = [], productionWorkOrders = [], invoices = [],
        purchaseOrders = [], items = [], locations = [], isInitialized, isLoading
    } = useDatabaseContext()

    // Formatting utilities (memoized to prevent hydration issues)
    const formatters = useMemo(() => ({
        Currency: new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }),
        Integer: new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }),
        Percent: (v: number) => `${Math.round(v)}%`
    }), [])

    // demo toggles (hide deep-dive bits for execs)
    const showQuality = false
    const showPlannerDetails = false

    // Modal state management
    const [openModal, setOpenModal] = React.useState<string | null>(null);

    /** ---------------------------
     *  Derived Stats (memoized)
     *  --------------------------*/
    const stats = useMemo(() => {
        // Ensure all arrays are defined before processing
        if (!customers || !suppliers || !quotations || !salesOrders || !engineeringDrawings ||
            !billsOfMaterials || !billsOfQuantities || !productionWorkOrders || !invoices ||
            !purchaseOrders || !items || !locations) {
            return {
                actives: { customersActive: 0, customersInactive: 0, customersSuspended: 0, suppliersActive: 0, suppliersSuspended: 0 },
                inv: { totalItems: 0, low: 0, out: 0, value: 0 },
                loc: { total: 0, utilization: 0 },
                sales: { quotes: 0, soTotal: 0, soActive: 0, soConfirmed: 0, soDraft: 0, soValue: 0, quoteValue: 0 },
                eng: { drawings: 0, drawingsReleased: 0, drawingsReview: 0, boms: 0, bomsApproved: 0, bomsDraft: 0, boqs: 0, boqsApproved: 0, boqsDraft: 0 },
                prod: { wos: 0, wosActive: 0, wosPlanned: 0, wosDone: 0, estHours: 0 },
                fin: { invoices: 0, invoicesPending: 0, invoicesDraft: 0, invoiceValue: 0, pos: 0, posActive: 0, posAck: 0, poValue: 0 },
                kpis: { customerRetention: 0, supplierQualityScore: 0, inventoryTurnoverRate: 0, quotationToOrder: 0, productionEfficiency: 0, cashFlowRatio: 0 }
            }
        }

        const safeDiv = (a: number, b: number) => (b > 0 ? a / b : 0)
        const actives = {
            customersActive: customers.filter(c => c.status === "Active").length,
            customersInactive: customers.filter(c => c.status === "Inactive").length,
            customersSuspended: customers.filter(c => c.status === "Suspended").length,
            suppliersActive: suppliers.filter(s => s.status === "Active").length,
            suppliersSuspended: suppliers.filter(s => s.status === "Suspended").length,
        }

        const inv = {
            totalItems: items.length,
            low: items.filter(i => (i?.currentStock ?? 0) <= (i?.minStock ?? 0)).length,
            out: items.filter(i => (i?.currentStock ?? 0) === 0).length,
            value: items.reduce((sum, i) => sum + (Number(i?.currentStock ?? 0) * Number(i?.unitCost ?? 0)), 0),
        }

        const loc = {
            total: locations.length,
            utilization: locations.length
                ? locations.reduce((sum, l) => sum + Number(l?.currentUtilization ?? 0), 0) / locations.length
                : 0,
        }

        const sales = {
            quotes: quotations.length,
            soTotal: salesOrders.length,
            soActive: salesOrders.filter(so => so.status === "In Production").length,
            soConfirmed: salesOrders.filter(so => so.status === "Confirmed").length,
            soDraft: salesOrders.filter(so => so.status === "Draft").length,
            soValue: salesOrders.reduce((sum, so) => sum + (so?.total ?? 0), 0),
            quoteValue: quotations.reduce((sum, q) => sum + (q?.total ?? 0), 0),
        }

        const eng = {
            drawings: engineeringDrawings.length,
            drawingsReleased: engineeringDrawings.filter(d => d.status === "Released").length,
            drawingsReview: engineeringDrawings.filter(d => d.status === "Under Review").length,
            boms: billsOfMaterials.length,
            bomsApproved: billsOfMaterials.filter(b => b.status === "Approved").length,
            bomsDraft: billsOfMaterials.filter(b => b.status === "Draft").length,
            boqs: billsOfQuantities.length,
            boqsApproved: billsOfQuantities.filter(b => b.status === "Approved").length,
            boqsDraft: billsOfQuantities.filter(b => b.status === "Draft").length,
        }

        const prod = {
            wos: productionWorkOrders.length,
            wosActive: productionWorkOrders.filter(wo => wo.status === "In Progress").length,
            wosPlanned: productionWorkOrders.filter(wo => wo.status === "Planned").length,
            wosDone: productionWorkOrders.filter(wo => wo.status === "Completed").length,
            estHours: productionWorkOrders.reduce((sum, wo) => sum + (wo?.estimatedHours ?? 0), 0),
        }

        const fin = {
            invoices: invoices.length,
            invoicesPending: invoices.filter(i => i.status === "Sent").length,
            invoicesDraft: invoices.filter(i => i.status === "Draft").length,
            invoiceValue: invoices.reduce((sum, i) => sum + (i?.total ?? 0), 0),
            pos: purchaseOrders.length,
            posActive: purchaseOrders.filter(po => po.status === "Sent").length,
            posAck: purchaseOrders.filter(po => po.status === "Acknowledged").length,
            poValue: purchaseOrders.reduce((sum, po) => sum + (po?.total ?? 0), 0),
        }

        // Calculate KPIs
        const kpis = {
            customerRetention: actives.customersActive > 0 ? safeDiv(actives.customersActive, actives.customersActive + actives.customersInactive) * 100 : 0,
            supplierQualityScore: suppliers.length > 0 ? suppliers.reduce((sum, s) => sum + (s?.qualityRating ?? 0), 0) / suppliers.length : 0,
            inventoryTurnoverRate: inv.totalItems > 0 ? safeDiv(prod.wos, inv.totalItems) * 12 : 0,
            quotationToOrder: sales.quotes > 0 ? safeDiv(sales.soTotal, sales.quotes) * 100 : 0,
            productionEfficiency: prod.wos > 0 ? safeDiv(prod.wosDone, prod.wos) * 100 : 0,
            cashFlowRatio: fin.invoiceValue > 0 ? safeDiv(fin.invoiceValue, fin.poValue) : 0,
        }

        return { actives, inv, loc, sales, eng, prod, fin, kpis }
    }, [customers, suppliers, quotations, salesOrders, engineeringDrawings, billsOfMaterials, billsOfQuantities, productionWorkOrders, invoices, purchaseOrders, items, locations])

    // Modal Components for AI Insights
    const DemandForecastModal = () => (
        <Dialog open={openModal === 'demand-forecast'} onOpenChange={() => setOpenModal(null)}>
            <DialogContent className="w-full !max-w-[1200px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2 text-blue-800">
                        <TrendingUp className="w-6 h-6" />
                        <span>Q4 Demand Forecast - Detailed Analysis</span>
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-blue-800 mb-3">AI Prediction Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="font-medium text-blue-700">Overall Demand Increase:</div>
                                <div className="text-2xl font-bold text-blue-800">+23%</div>
                                <div className="text-blue-600">vs. Q3 2024</div>
                            </div>
                            <div>
                                <div className="font-medium text-blue-700">AI Confidence Level:</div>
                                <div className="text-2xl font-bold text-blue-800">89%</div>
                                <div className="text-blue-600">Based on 12 months data</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-3">Product-Specific Forecasts</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                                <div>
                                    <div className="font-medium text-green-800">Product A - Structural Steel</div>
                                    <div className="text-sm text-green-600">Primary construction material</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-green-800">+45%</div>
                                    <div className="text-sm text-green-600">Demand increase</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
                                <div>
                                    <div className="font-medium text-blue-800">Product B - Welding Equipment</div>
                                    <div className="text-sm text-blue-600">Industrial welding systems</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-blue-800">+18%</div>
                                    <div className="text-sm text-blue-600">Demand increase</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-3">AI Recommendations</h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                                <div className="font-medium text-yellow-800">Immediate Actions (Week 1-2)</div>
                                <div className="text-sm text-yellow-700 mt-1">
                                    • Increase production capacity by 30%<br />
                                    • Pre-order critical materials (6-8 week lead time)<br />
                                    • Schedule overtime for welding lines
                                </div>
                            </div>
                            <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                                <div className="font-medium text-blue-800">Short-term Planning (Week 3-4)</div>
                                <div className="text-sm text-blue-700 mt-1">
                                    • Adjust inventory levels for high-demand items<br />
                                    • Coordinate with suppliers for increased volumes<br />
                                    • Review workforce capacity and training needs
                                </div>
                            </div>
                            <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                                <div className="font-medium text-green-800">Long-term Strategy (Month 2-3)</div>
                                <div className="text-sm text-green-700 mt-1">
                                    • Evaluate permanent capacity expansion<br />
                                    • Develop supplier partnerships for scalability<br />
                                    • Implement demand forecasting automation
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-3">Risk Assessment</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-red-50 rounded border border-red-200">
                                <div className="text-red-600 font-medium">High Risk</div>
                                <div className="text-sm text-red-600">Material shortages</div>
                                <div className="text-xs text-red-500 mt-1">Probability: 35%</div>
                            </div>
                            <div className="text-center p-3 bg-yellow-50 rounded border border-yellow-200">
                                <div className="text-yellow-600 font-medium">Medium Risk</div>
                                <div className="text-sm text-yellow-600">Capacity constraints</div>
                                <div className="text-xs text-yellow-500 mt-1">Probability: 45%</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded border border-green-200">
                                <div className="text-green-600 font-medium">Low Risk</div>
                                <div className="text-sm text-green-600">Quality issues</div>
                                <div className="text-xs text-green-500 mt-1">Probability: 20%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );

    const SupplyChainRiskModal = () => (
        <Dialog open={openModal === 'supply-chain-risk'} onOpenChange={() => setOpenModal(null)}>
            <DialogContent className="w-[90vw] !max-w-[1200px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2 text-orange-800">
                        <AlertTriangle className="w-6 h-6" />
                        <span>Supply Chain Risk Analysis - Detailed Report</span>
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <h3 className="font-semibold text-orange-800 mb-3">Risk Assessment Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="font-medium text-orange-700">Overall Risk Level:</div>
                                <div className="text-2xl font-bold text-orange-800">67%</div>
                                <div className="text-orange-600">MEDIUM RISK</div>
                            </div>
                            <div>
                                <div className="font-medium text-orange-700">Potential Impact:</div>
                                <div className="text-2xl font-bold text-orange-800">$125K</div>
                                <div className="text-orange-600">Cost increase</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-3">Supplier Risk Analysis</h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-red-50 rounded border border-red-200">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="font-medium text-red-800">Supplier X - Critical Components</div>
                                    <Badge variant="destructive" className="text-xs">HIGH RISK</Badge>
                                </div>
                                <div className="text-sm text-red-700 space-y-1">
                                    <div>• Delivery delay risk: 23% (3-week delays)</div>
                                    <div>• Historical performance: 78% on-time delivery</div>
                                    <div>• Impact: $67K potential cost increase</div>
                                    <div>• Root cause: Transportation bottlenecks</div>
                                </div>
                            </div>
                            <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="font-medium text-yellow-800">Component Y - Raw Materials</div>
                                    <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">MEDIUM RISK</Badge>
                                </div>
                                <div className="text-sm text-yellow-700 space-y-1">
                                    <div>• Price increase risk: 15% (8% volatility)</div>
                                    <div>• Market trend: Upward pressure</div>
                                    <div>• Impact: $58K potential cost increase</div>
                                    <div>• Root cause: Global supply constraints</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-3">Mitigation Strategy</h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                                <div className="font-medium text-blue-800">Immediate Actions (Week 1-2)</div>
                                <div className="text-sm text-blue-700 mt-1">
                                    • Source 2 alternative suppliers within 2 weeks<br />
                                    • Negotiate price locks for 6-month contracts<br />
                                    • Increase safety stock by 20% for critical items
                                </div>
                            </div>
                            <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                                <div className="font-medium text-green-800">Strategic Initiatives (Month 1-3)</div>
                                <div className="text-sm text-green-700 mt-1">
                                    • Develop supplier diversification program<br />
                                    • Implement supplier performance monitoring<br />
                                    • Establish backup supply chain routes
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-3">Cost-Benefit Analysis</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-red-50 rounded border border-red-200">
                                <div className="font-medium text-red-800 text-center">Risk Cost</div>
                                <div className="text-2xl font-bold text-red-800 text-center">$125K</div>
                                <div className="text-sm text-red-600 text-center">Potential loss</div>
                            </div>
                            <div className="p-3 bg-green-50 rounded border border-green-200">
                                <div className="font-medium text-green-800 text-center">Mitigation Cost</div>
                                <div className="text-2xl font-bold text-green-800 text-center">$45K</div>
                                <div className="text-sm text-green-600 text-center">Prevention cost</div>
                            </div>
                        </div>
                        <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                            <div className="font-medium text-blue-800 text-center">Net Savings</div>
                            <div className="text-2xl font-bold text-blue-800 text-center">$80K</div>
                            <div className="text-sm text-blue-600 text-center">Risk mitigation value</div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );

    const ProductionOptimizationModal = () => (
        <Dialog open={openModal === 'production-optimization'} onOpenChange={() => setOpenModal(null)}>
            <DialogContent className="w-[90vw] !max-w-[1200px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2 text-green-800">
                        <Zap className="w-6 h-6" />
                        <span>Production Line Optimization - Detailed Analysis</span>
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h3 className="font-semibold text-green-800 mb-3">Optimization Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <div className="font-medium text-green-700">Potential Improvement:</div>
                                <div className="text-2xl font-bold text-green-800">+18%</div>
                                <div className="text-green-600">Throughput increase</div>
                            </div>
                            <div>
                                <div className="font-medium text-green-700">AI Confidence:</div>
                                <div className="text-2xl font-bold text-green-800">94%</div>
                                <div className="text-green-600">High confidence</div>
                            </div>
                            <div>
                                <div className="font-medium text-green-700">Annual Savings:</div>
                                <div className="text-2xl font-bold text-green-800">$89K</div>
                                <div className="text-green-600">Operational costs</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-3">Optimization Details</h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-green-50 rounded border border-green-200">
                                <div className="font-medium text-green-800 mb-2">Setup Time Reduction</div>
                                <div className="text-sm text-green-700">
                                    <div>• Current setup: 45 minutes → Target: 34 minutes</div>
                                    <div>• Time savings: 11 minutes per batch</div>
                                    <div>• Impact: 25% reduction in setup time</div>
                                </div>
                            </div>
                            <div className="p-3 bg-blue-50 rounded border border-blue-200">
                                <div className="font-medium text-blue-800 mb-2">Batch Efficiency</div>
                                <div className="text-sm text-blue-700">
                                    <div>• Current efficiency: 87% → Target: 94%</div>
                                    <div>• Improvement: 7% efficiency gain</div>
                                    <div>• Batch size optimization: 150 → 200 units</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-3">Implementation Plan</h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                                <div className="font-medium text-yellow-800">Week 1-2: Operator Training</div>
                                <div className="text-sm text-yellow-700 mt-1">
                                    • Train operators on new procedures<br />
                                    • Implement new setup protocols<br />
                                    • Conduct safety reviews
                                </div>
                            </div>
                            <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                                <div className="font-medium text-blue-800">Week 3-4: Pilot Implementation</div>
                                <div className="text-sm text-blue-700 mt-1">
                                    • Test new procedures on Line 2<br />
                                    • Monitor performance metrics<br />
                                    • Collect feedback and adjust
                                </div>
                            </div>
                            <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                                <div className="font-medium text-green-800">Week 5-6: Full Rollout</div>
                                <div className="text-sm text-green-700 mt-1">
                                    • Implement across all production lines<br />
                                    • Continuous monitoring and support<br />
                                    • Performance validation
                                </div>
                            </div>
                            <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-400">
                                <div className="font-medium text-purple-800">Week 7-8: Validation & Adjustments</div>
                                <div className="text-sm text-purple-700 mt-1">
                                    • Final performance assessment<br />
                                    • Process refinement<br />
                                    • Documentation and training updates
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );

    const InventoryOptimizationModal = () => (
        <Dialog open={openModal === 'inventory-optimization'} onOpenChange={() => setOpenModal(null)}>
            <DialogContent className="w-[90vw] !max-w-[1200px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2 text-blue-800">
                        <DollarSign className="w-6 h-6" />
                        <span>Inventory Optimization - Detailed Analysis</span>
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-blue-800 mb-3">Savings Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <div className="font-medium text-blue-700">Projected Savings:</div>
                                <div className="text-2xl font-bold text-blue-800">$67K</div>
                                <div className="text-blue-600">Annual savings</div>
                            </div>
                            <div>
                                <div className="font-medium text-blue-700">AI Confidence:</div>
                                <div className="text-2xl font-bold text-blue-800">91%</div>
                                <div className="text-blue-600">High confidence</div>
                            </div>
                            <div>
                                <div className="font-medium text-blue-700">Safety Stock Reduction:</div>
                                <div className="text-2xl font-bold text-blue-800">15%</div>
                                <div className="text-blue-600">Current levels</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-3">Savings Breakdown</h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-blue-50 rounded border border-blue-200">
                                <div className="font-medium text-blue-800 mb-2">Safety Stock Reduction</div>
                                <div className="text-sm text-blue-700">
                                    <div>• Savings: $28K (40% of total)</div>
                                    <div>• Items affected: 45 high-value items</div>
                                    <div>• Risk assessment: Low impact</div>
                                </div>
                            </div>
                            <div className="p-3 bg-green-50 rounded border border-green-200">
                                <div className="font-medium text-green-800 mb-2">JIT Implementation</div>
                                <div className="text-sm text-green-700">
                                    <div>• Savings: $23K (33% of total)</div>
                                    <div>• Items affected: 23 items</div>
                                    <div>• Lead time optimization</div>
                                </div>
                            </div>
                            <div className="p-3 bg-purple-50 rounded border border-purple-200">
                                <div className="font-medium text-purple-800 mb-2">Carrying Costs</div>
                                <div className="text-sm text-purple-700">
                                    <div>• Savings: $16K (24% of total)</div>
                                    <div>• Reduced storage costs</div>
                                    <div>• Lower insurance costs</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-3">Implementation Timeline</h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                                <div className="font-medium text-yellow-800">Phase 1 (Month 1): High-Value Items</div>
                                <div className="text-sm text-yellow-700 mt-1">
                                    • 8 high-value items ($18K savings)<br />
                                    • Immediate impact items<br />
                                    • Low-risk implementation
                                </div>
                            </div>
                            <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                                <div className="font-medium text-blue-800">Phase 2 (Month 2): Fast-Moving Items</div>
                                <div className="text-sm text-blue-700 mt-1">
                                    • 12 fast-moving items ($12K savings)<br />
                                    • High turnover items<br />
                                    • Moderate risk assessment
                                </div>
                            </div>
                            <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                                <div className="font-medium text-green-800">Phase 3 (Month 3): Long-Lead Items</div>
                                <div className="text-sm text-green-700 mt-1">
                                    • 3 long-lead items ($8K savings)<br />
                                    • Strategic items<br />
                                    • Careful risk management
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );

    const QualityIntelligenceModal = () => (
        <Dialog open={openModal === 'quality-intelligence'} onOpenChange={() => setOpenModal(null)}>
            <DialogContent className="w-[90vw] !max-w-[1200px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2 text-purple-800">
                        <Shield className="w-6 h-6" />
                        <span>Quality Intelligence - Detailed Analysis</span>
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h3 className="font-semibold text-purple-800 mb-3">Model Performance</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="font-medium text-purple-700">Training Data:</div>
                                <div className="text-2xl font-bold text-purple-800">12 months</div>
                                <div className="text-purple-600">Production history</div>
                            </div>
                            <div>
                                <div className="font-medium text-purple-700">Features:</div>
                                <div className="text-2xl font-bold text-purple-800">47</div>
                                <div className="text-purple-600">Parameters monitored</div>
                            </div>
                            <div>
                                <div className="font-medium text-purple-700">Validation Accuracy:</div>
                                <div className="text-2xl font-bold text-purple-800">96.8%</div>
                                <div className="text-purple-600">Cross-validation</div>
                            </div>
                            <div>
                                <div className="font-medium text-purple-700">False Positive Rate:</div>
                                <div className="text-2xl font-bold text-purple-800">2.1%</div>
                                <div className="text-purple-600">Minimal false alarms</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-3">Prediction Confidence</h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-green-50 rounded border border-green-200">
                                <div className="font-medium text-green-800 mb-2">High Confidence (90%+)</div>
                                <div className="text-sm text-green-700">
                                    <div>• Percentage: 78% of predictions</div>
                                    <div>• Reliability: Very high</div>
                                    <div>• Action: Immediate implementation</div>
                                </div>
                            </div>
                            <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                                <div className="font-medium text-yellow-800 mb-2">Medium Confidence (70-90%)</div>
                                <div className="text-sm text-yellow-700">
                                    <div>• Percentage: 18% of predictions</div>
                                    <div>• Reliability: Moderate</div>
                                    <div>• Action: Review and validate</div>
                                </div>
                            </div>
                            <div className="p-3 bg-red-50 rounded border border-red-200">
                                <div className="font-medium text-red-800 mb-2">Low Confidence (&lt;70%)</div>
                                <div className="text-sm text-red-700">
                                    <div>• Percentage: 4% of predictions</div>
                                    <div>• Reliability: Low</div>
                                    <div>• Action: Manual review required</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-3">Alert Thresholds</h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-red-50 rounded border-l-4 border-red-400">
                                <div className="font-medium text-red-800">Critical: &gt;2% Defect Rate</div>
                                <div className="text-sm text-red-700 mt-1">
                                    • Immediate action required<br />
                                    • Production line shutdown<br />
                                    • Quality team notification
                                </div>
                            </div>
                            <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                                <div className="font-medium text-yellow-800">Warning: 1-2% Defect Rate</div>
                                <div className="text-sm text-yellow-700 mt-1">
                                    • Monitor closely<br />
                                    • Adjust parameters<br />
                                    • Increase inspection frequency
                                </div>
                            </div>
                            <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                                <div className="font-medium text-green-800">Normal: &lt;1% Defect Rate</div>
                                <div className="text-sm text-green-700 mt-1">
                                    • Standard operation<br />
                                    • Regular monitoring<br />
                                    • No action required
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );

    const ProcessImprovementModal = () => (
        <Dialog open={openModal === 'process-improvement'} onOpenChange={() => setOpenModal(null)}>
            <DialogContent className="w-[90vw] !max-w-[1200px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2 text-green-800">
                        <BarChart3 className="w-6 h-6" />
                        <span>Process Improvement - Detailed Analysis</span>
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h3 className="font-semibold text-green-800 mb-3">Improvement Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <div className="font-medium text-green-700">Current Yield:</div>
                                <div className="text-2xl font-bold text-green-800">96.8%</div>
                                <div className="text-green-600">Baseline</div>
                            </div>
                            <div>
                                <div className="font-medium text-green-700">Target Yield:</div>
                                <div className="text-2xl font-bold text-green-800">97.6%</div>
                                <div className="text-green-600">+0.8% improvement</div>
                            </div>
                            <div>
                                <div className="font-medium text-green-700">Annual Savings:</div>
                                <div className="text-2xl font-bold text-green-800">$34K</div>
                                <div className="text-green-600">Material costs</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-3">Parameter Optimization</h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-green-50 rounded border border-green-200">
                                <div className="font-medium text-green-800 mb-2">Temperature Optimization</div>
                                <div className="text-sm text-green-700">
                                    <div>• Current: 185°C → Target: 192°C</div>
                                    <div>• Change: +7°C</div>
                                    <div>• Expected improvement: +2.1%</div>
                                </div>
                            </div>
                            <div className="p-3 bg-blue-50 rounded border border-blue-200">
                                <div className="font-medium text-blue-800 mb-2">Pressure Control</div>
                                <div className="text-sm text-blue-700">
                                    <div>• Current: 2.8 bar → Target: 3.1 bar</div>
                                    <div>• Change: +0.3 bar</div>
                                    <div>• Expected improvement: +1.8%</div>
                                </div>
                            </div>
                            <div className="p-3 bg-purple-50 rounded border border-purple-200">
                                <div className="font-medium text-purple-800 mb-2">Speed & Feed Optimization</div>
                                <div className="text-sm text-purple-700">
                                    <div>• Speed: 45 → 42 m/min (-3 m/min)</div>
                                    <div>• Feed rate: 0.8 → 0.75 mm/rev</div>
                                    <div>• Quality improvement focus</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-3">Implementation Steps</h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                                <div className="font-medium text-yellow-800">Step 1: Temperature Adjustment</div>
                                <div className="text-sm text-yellow-700 mt-1">
                                    • Adjust temperature gradually (2°C increments)<br />
                                    • Monitor quality metrics<br />
                                    • Validate improvements
                                </div>
                            </div>
                            <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                                <div className="font-medium text-blue-800">Step 2: Pressure Fine-tuning</div>
                                <div className="text-sm text-blue-700 mt-1">
                                    • Fine-tune pressure settings<br />
                                    • Ensure stability<br />
                                    • Document changes
                                </div>
                            </div>
                            <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                                <div className="font-medium text-green-800">Step 3: Speed & Feed Optimization</div>
                                <div className="text-sm text-green-700 mt-1">
                                    • Optimize speed and feed rates<br />
                                    • Balance quality vs. productivity<br />
                                    • Monitor performance
                                </div>
                            </div>
                            <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-400">
                                <div className="font-medium text-purple-800">Step 4: Validation & Monitoring</div>
                                <div className="text-sm text-purple-700 mt-1">
                                    • Monitor quality metrics for 48 hours<br />
                                    • Validate improvements<br />
                                    • Document final parameters
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );

    // Show loading state if not initialized
    if (isLoading || !isInitialized) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <h1 className="text-3xl font-bold text-gray-900">MRP Dashboard</h1>
                        <p className="text-gray-600 mt-2">Manufacturing Resource Planning Overview</p>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* KPI Overview - Compact Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                    <MetricCard icon={<Users className="w-5 h-5" />} label="Customers" value={formatters.Integer.format(stats.actives.customersActive)} sub={`${stats.actives.customersSuspended} suspended`} />
                    <MetricCard icon={<Building2 className="w-5 h-5" />} label="Suppliers" value={formatters.Integer.format(stats.actives.suppliersActive)} sub={`${stats.actives.suppliersSuspended} suspended`} />
                    <MetricCard icon={<FileText className="w-5 h-5" />} label="Quotations" value={formatters.Integer.format(stats.sales.quotes)} sub={formatters.Currency.format(stats.sales.quoteValue)} />
                    <MetricCard icon={<ShoppingCart className="w-5 h-5" />} label="Sales Orders" value={formatters.Integer.format(stats.sales.soTotal)} sub={formatters.Currency.format(stats.sales.soValue)} />
                    <MetricCard icon={<Factory className="w-5 h-5" />} label="Work Orders" value={formatters.Integer.format(stats.prod.wos)} sub={`${stats.prod.wosActive} active`} />
                    <MetricCard icon={<Receipt className="w-5 h-5" />} label="Invoices" value={formatters.Integer.format(stats.fin.invoices)} sub={formatters.Currency.format(stats.fin.invoiceValue)} />
                </div>

                {/* Main Dashboard Grid - 3 Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                    {/* Left Column - Engineering & Quality */}
                    <div className="space-y-6">
                        {/* Engineering Status */}
                        <SectionCard title="🏗️ Engineering Status" icon={<Wrench className="w-5 h-5" />}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{stats.eng.drawings}</div>
                                    <div className="text-sm text-gray-600">Total Drawings</div>
                                    <div className="text-xs text-gray-500">{stats.eng.drawingsReleased} Released</div>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">{stats.eng.boms}</div>
                                    <div className="text-sm text-gray-600">BOMs</div>
                                    <div className="text-xs text-gray-500">{stats.eng.bomsApproved} Approved</div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <EngineeringPieChart data={moduleCharts.engineering.drawingStatus} title="Drawing Status" />
                            </div>
                        </SectionCard>

                        {/* Quality Metrics */}
                        <SectionCard title="🔍 Quality Overview" icon={<CheckCircle className="w-5 h-5" />}>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <span className="text-sm">First Pass Yield</span>
                                    <span className="font-medium text-green-600">94.2%</span>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <span className="text-sm">Rework Rate</span>
                                    <span className="font-medium text-yellow-600">4.8%</span>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <span className="text-sm">Scrap Rate</span>
                                    <span className="font-medium text-red-600">1.0%</span>
                                </div>
                            </div>
                        </SectionCard>
                    </div>

                    {/* Center Column - Production & Inventory */}
                    <div className="space-y-6">
                        {/* Production Status */}
                        <SectionCard title="🏭 Production Status" icon={<Factory className="w-5 h-5" />}>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="text-center p-3 bg-orange-50 rounded-lg">
                                    <div className="text-2xl font-bold text-orange-600">{stats.prod.wosActive}</div>
                                    <div className="text-sm text-gray-600">Active WOs</div>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">{stats.prod.wosDone}</div>
                                    <div className="text-sm text-gray-600">Completed</div>
                                </div>
                            </div>
                            <ProductionPieChart data={moduleCharts.production.workOrderStatus} title="Work Order Status" />
                        </SectionCard>

                        {/* Inventory Status */}
                        <SectionCard title="📦 Inventory Status" icon={<Box className="w-5 h-5" />}>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="text-center p-3 bg-red-50 rounded-lg">
                                    <div className="text-2xl font-bold text-red-600">{stats.inv.low}</div>
                                    <div className="text-sm text-gray-600">Low Stock</div>
                                </div>
                                <div className="text-center p-3 bg-amber-50 rounded-lg">
                                    <div className="text-2xl font-bold text-amber-600">{stats.inv.out}</div>
                                    <div className="text-sm text-gray-600">Out of Stock</div>
                                </div>
                            </div>
                            <DemandSupplyPieChart data={moduleCharts.demandSupply.stockLevels} title="Stock Levels" />
                        </SectionCard>
                    </div>

                    {/* Right Column - Financial & Supply Chain */}
                    <div className="space-y-6">
                        {/* Financial Overview */}
                        <SectionCard title="💰 Financial Overview" icon={<DollarSign className="w-5 h-5" />}>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                                    <span className="text-sm">Revenue (30d)</span>
                                    <span className="font-medium text-green-600">{formatters.Currency.format(stats.sales.soValue)}</span>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                                    <span className="text-sm">Outstanding</span>
                                    <span className="font-medium text-blue-600">{formatters.Currency.format(stats.fin.invoiceValue)}</span>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-amber-50 rounded">
                                    <span className="text-sm">PO Value</span>
                                    <span className="font-medium text-amber-600">{formatters.Currency.format(stats.fin.poValue)}</span>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Supply Chain */}
                        <SectionCard title="🚚 Supply Chain" icon={<Package className="w-5 h-5" />}>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <span className="text-sm">Active POs</span>
                                    <span className="font-medium">{stats.fin.posActive}</span>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <span className="text-sm">Suppliers</span>
                                    <span className="font-medium">{stats.actives.suppliersActive}</span>
                                </div>
                            </div>
                            <div className="mt-4">
                                <DemandSupplyBarChart data={moduleCharts.demandSupply.demandVsSupply} title="Demand vs Supply" type="demand" />
                            </div>
                        </SectionCard>
                    </div>
                </div>

                {/* Bottom Row - Detailed Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                    {/* Production Efficiency */}
                    <SectionCard title="📊 Production Efficiency" icon={<Activity className="w-5 h-5" />}>
                        <ProductionBarChart data={moduleCharts.production.productionEfficiency} title="Line Efficiency" type="efficiency" />
                    </SectionCard>

                    {/* Cost Breakdown */}
                    <SectionCard title="💵 Cost Breakdown" icon={<Calculator className="w-5 h-5" />}>
                        <EngineeringBarChart data={moduleCharts.engineering.boqCostBreakdown} title="Project Costs" yAxisLabel="Cost" />
                    </SectionCard>
                </div>

                {/* AI Analytics Insights */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-full">
                                <Brain className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">AI Analytics Insights</h2>
                                <p className="text-sm text-gray-600">Intelligent recommendations powered by AI</p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="text-xs">
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Last Analysis: {new Date().toLocaleTimeString()}
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs">
                                <Settings className="w-3 h-3 mr-1" />
                                AI Settings
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Predictive Analytics */}
                        <Card className="border-blue-200 bg-white shadow-lg">
                            <CardHeader className="pb-3 bg-white border-b border-blue-200">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg text-blue-800 flex items-center space-x-2">
                                        <TrendingUp className="w-5 h-5" />
                                        <span>Predictive Analytics</span>
                                    </CardTitle>
                                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                        95% Accuracy
                                    </Badge>
                                </div>
                                <p className="text-sm text-blue-600">AI-powered demand forecasting</p>
                            </CardHeader>
                            <CardContent className="bg-white">
                                <div className="space-y-4">
                                    {/* Demand Forecast */}
                                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="font-semibold text-blue-800 text-sm">Q4 Demand Surge</div>
                                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                                +23%
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-blue-600 mb-2">
                                            <div className="flex items-center space-x-1 mb-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>Expected: Oct-Dec 2024</span>
                                            </div>
                                            <div>• Product A: +45% increase predicted</div>
                                            <div>• Product B: +18% increase predicted</div>
                                            <div>• Seasonal trend analysis: 89% confidence</div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-xs h-6 px-2 border-blue-300 text-blue-700"
                                                onClick={() => setOpenModal('demand-forecast')}
                                            >
                                                View Details
                                            </Button>
                                            <Button size="sm" variant="outline" className="text-xs h-6 px-2 border-blue-300 text-blue-700">
                                                Adjust Planning
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Supply Chain Risk */}
                                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="font-semibold text-orange-800 text-sm">Supply Chain Risk</div>
                                            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                                                MEDIUM
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-orange-600 mb-2">
                                            <div className="flex items-center space-x-1 mb-1">
                                                <AlertTriangle className="w-3 h-3" />
                                                <span>Risk Level: 67%</span>
                                            </div>
                                            <div>• Supplier X: 23% delivery delay risk</div>
                                            <div>• Component Y: 15% price increase risk</div>
                                            <div>• AI recommendation: Diversify suppliers</div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-xs h-6 px-2 border-orange-300 text-orange-700"
                                                onClick={() => setOpenModal('supply-chain-risk')}
                                            >
                                                View Details
                                            </Button>
                                            <Button size="sm" variant="outline" className="text-xs h-6 px-2 border-orange-300 text-orange-700">
                                                Mitigate Risk
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Performance Optimization */}
                        <Card className="border-green-200 bg-white shadow-lg">
                            <CardHeader className="pb-3 bg-white border-b border-green-200">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg text-green-800 flex items-center space-x-2">
                                        <Zap className="w-5 h-5" />
                                        <span>Performance Optimization</span>
                                    </CardTitle>
                                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                        +12% Efficiency
                                    </Badge>
                                </div>
                                <p className="text-sm text-green-600">AI-identified improvement opportunities</p>
                            </CardHeader>
                            <CardContent className="bg-white">
                                <div className="space-y-4">
                                    {/* Production Optimization */}
                                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="font-semibold text-green-800 text-sm">Production Line 2</div>
                                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                                OPTIMIZED
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-green-600 mb-2">
                                            <div className="flex items-center space-x-1 mb-1">
                                                <Target className="w-3 h-3" />
                                                <span>Potential: +18% throughput</span>
                                            </div>
                                            <div>• Reduce setup time by 25%</div>
                                            <div>• Optimize batch sizes: 150 → 200 units</div>
                                            <div>• AI confidence: 94%</div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-xs h-6 px-2 border-green-300 text-green-700"
                                                onClick={() => setOpenModal('production-optimization')}
                                            >
                                                View Details
                                            </Button>
                                            <Button size="sm" variant="outline" className="text-xs h-6 px-2 border-green-300 text-green-700">
                                                Simulate
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Inventory Optimization */}
                                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="font-semibold text-blue-800 text-sm">Inventory Reduction</div>
                                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                                $45K Savings
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-blue-600 mb-2">
                                            <div className="flex items-center space-x-1 mb-1">
                                                <DollarSign className="w-3 h-3" />
                                                <span>Projected: $67K annual savings</span>
                                            </div>
                                            <div>• Reduce safety stock by 15%</div>
                                            <div>• Implement JIT for 23 items</div>
                                            <div>• AI confidence: 91%</div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-xs h-6 px-2 border-blue-300 text-blue-700"
                                                onClick={() => setOpenModal('inventory-optimization')}
                                            >
                                                View Details
                                            </Button>
                                            <Button size="sm" variant="outline" className="text-xs h-6 px-2 border-blue-300 text-blue-700">
                                                Execute Plan
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quality Intelligence */}
                        <Card className="border-purple-200 bg-white shadow-lg">
                            <CardHeader className="pb-3 bg-white border-b border-purple-200">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg text-purple-800 flex items-center space-x-2">
                                        <Shield className="w-5 h-5" />
                                        <span>Quality Intelligence</span>
                                    </CardTitle>
                                    <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                                        99.2% Quality
                                    </Badge>
                                </div>
                                <p className="text-sm text-purple-600">AI-powered quality monitoring</p>
                            </CardHeader>
                            <CardContent className="bg-white">
                                <div className="space-y-4">
                                    {/* Defect Prediction */}
                                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="font-semibold text-purple-800 text-sm">Defect Prediction</div>
                                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                                ACCURATE
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-purple-600 mb-2">
                                            <div className="flex items-center space-x-1 mb-1">
                                                <Eye className="w-3 h-3" />
                                                <span>Next 24h: 0.3% defect rate</span>
                                            </div>
                                            <div>• Machine learning model: 97% accuracy</div>
                                            <div>• Real-time monitoring active</div>
                                            <div>• Auto-alerts configured</div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-xs h-6 px-2 border-purple-300 text-purple-700"
                                                onClick={() => setOpenModal('quality-intelligence')}
                                            >
                                                View Details
                                            </Button>
                                            <Button size="sm" variant="outline" className="text-xs h-6 px-2 border-purple-300 text-purple-700">
                                                Settings
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Process Improvement */}
                                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="font-semibold text-green-800 text-sm">Process Improvement</div>
                                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                                +8% Yield
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-green-600 mb-2">
                                            <div className="flex items-center space-x-1 mb-1">
                                                <BarChart3 className="w-3 h-3" />
                                                <span>Current yield: 96.8%</span>
                                            </div>
                                            <div>• Temperature optimization: +2.1%</div>
                                            <div>• Pressure control: +1.8%</div>
                                            <div>• AI recommendation: Adjust parameter Z</div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-xs h-6 px-2 border-green-300 text-green-700"
                                                onClick={() => setOpenModal('process-improvement')}
                                            >
                                                View Details
                                            </Button>
                                            <Button size="sm" variant="outline" className="text-xs h-6 px-2 border-green-300 text-green-700">
                                                Monitor Results
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Enhanced Critical Alerts */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-red-100 rounded-full">
                                    <AlertTriangle className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Critical Alerts</h2>
                                    <p className="text-sm text-gray-600">Immediate attention required</p>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <Button variant="outline" size="sm" className="text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Last Updated: {new Date().toLocaleTimeString()}
                                </Button>
                                <Button variant="outline" size="sm" className="text-xs">
                                    <Settings className="w-3 h-3 mr-1" />
                                    Alert Settings
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Material Shortages - Enhanced */}
                        <Card className="border-red-200 bg-white shadow-lg">
                            <CardHeader className="pb-3 bg-white border-b border-red-200">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg text-red-800 flex items-center space-x-2">
                                        <AlertTriangle className="w-5 h-5" />
                                        <span>Material Shortages</span>
                                    </CardTitle>
                                    <Badge variant="destructive" className="text-xs">
                                        {moduleCharts.materialShortages.criticalShortages.length} Critical
                                    </Badge>
                                </div>
                                <p className="text-sm text-red-600">Items requiring immediate action</p>
                            </CardHeader>
                            <CardContent className="bg-white">
                                <div className="space-y-3">
                                    {moduleCharts.materialShortages.criticalShortages.map((shortage, index) => (
                                        <div key={index} className="p-3 bg-white rounded-lg border border-red-200 shadow-sm">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="font-semibold text-red-800 text-sm">{shortage.item}</div>
                                                <Badge
                                                    variant={shortage.daysUntilShortage <= 1 ? "destructive" : "secondary"}
                                                    className="text-xs"
                                                >
                                                    {shortage.daysUntilShortage <= 1 ? "URGENT" : `${shortage.daysUntilShortage}d`}
                                                </Badge>
                                            </div>

                                            {/* Stock Level Bar */}
                                            <div className="mb-2">
                                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                    <span>Current: {shortage.currentStock}</span>
                                                    <span>Required: {shortage.requiredStock}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="h-2 rounded-full bg-red-500 transition-all duration-300"
                                                        style={{ width: `${(shortage.currentStock / shortage.requiredStock) * 100}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="text-xs text-red-600 mb-2">
                                                <div className="flex items-center space-x-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{shortage.daysUntilShortage} days until shortage</span>
                                                </div>
                                                <div className="mt-1">
                                                    <span className="font-medium">Impact:</span> {shortage.impact}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex space-x-2">
                                                <Button size="sm" variant="destructive" className="text-xs h-6 px-2">
                                                    Expedite
                                                </Button>
                                                <Button size="sm" variant="outline" className="text-xs h-6 px-2">
                                                    Substitute
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 pt-3 border-t border-red-200">
                                    <Button variant="outline" size="sm" className="w-full text-red-700 border-red-300 hover:bg-red-50">
                                        <TrendingUp className="w-3 h-3 mr-1" />
                                        View All Shortages
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Capacity Issues - Enhanced */}
                        <Card className="border-orange-200 bg-white shadow-lg">
                            <CardHeader className="pb-3 bg-white border-b border-orange-200">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg text-orange-800 flex items-center space-x-2">
                                        <Activity className="w-5 h-5" />
                                        <span>Capacity Issues</span>
                                    </CardTitle>
                                    <Badge variant="secondary" className="text-xs bg-orange-200 text-orange-800">
                                        {moduleCharts.exceptionManagement.capacityOverloads.filter(o => o.load > 90).length} Overloaded
                                    </Badge>
                                </div>
                                <p className="text-sm text-orange-600">Production line bottlenecks</p>
                            </CardHeader>
                            <CardContent className="bg-white">
                                <div className="space-y-3">
                                    {moduleCharts.exceptionManagement.capacityOverloads.map((overload, index) => (
                                        <div key={index} className="p-3 bg-white rounded-lg border border-orange-200 shadow-sm">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="font-semibold text-orange-800 text-sm">{overload.resource}</div>
                                                <Badge
                                                    variant={overload.load > 100 ? "destructive" : "secondary"}
                                                    className="text-xs"
                                                >
                                                    {overload.load > 100 ? "OVERLOADED" : "HIGH"}
                                                </Badge>
                                            </div>

                                            {/* Capacity Meter */}
                                            <div className="mb-3">
                                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                    <span>Load: {overload.load}%</span>
                                                    <span>Status: {overload.status}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-3">
                                                    <div
                                                        className={`h-3 rounded-full transition-all duration-300 ${overload.load > 100 ? 'bg-red-500' :
                                                            overload.load > 90 ? 'bg-orange-500' : 'bg-green-500'
                                                            }`}
                                                        style={{ width: `${Math.min(overload.load, 100)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Recommendations */}
                                            <div className="text-xs text-orange-600 mb-2">
                                                <div className="font-medium mb-1">Recommendations:</div>
                                                {overload.load > 100 && (
                                                    <div className="text-red-600">• Add overtime or additional shifts</div>
                                                )}
                                                {overload.load > 90 && overload.load <= 100 && (
                                                    <div>• Monitor closely, consider reallocation</div>
                                                )}
                                                {overload.load <= 90 && (
                                                    <div>• Normal operation</div>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex space-x-2">
                                                <Button size="sm" variant="outline" className="text-xs h-6 px-2 border-orange-300 text-orange-700">
                                                    Reallocate
                                                </Button>
                                                <Button size="sm" variant="outline" className="text-xs h-6 px-2 border-orange-300 text-orange-700">
                                                    Schedule
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 pt-3 border-t border-orange-200">
                                    <Button variant="outline" size="sm" className="w-full text-orange-700 border-orange-300 hover:bg-orange-50">
                                        <BarChart3 className="w-3 h-3 mr-1" />
                                        Capacity Planning
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quality Issues - Enhanced */}
                        <Card className="border-yellow-200 bg-white shadow-lg">
                            <CardHeader className="pb-3 bg-white border-b border-yellow-200">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg text-yellow-800 flex items-center space-x-2">
                                        <AlertTriangle className="w-5 h-5" />
                                        <span>Quality Issues</span>
                                    </CardTitle>
                                    <Badge variant="secondary" className="text-xs bg-yellow-200 text-yellow-800">
                                        2 Active Issues
                                    </Badge>
                                </div>
                                <p className="text-sm text-yellow-600">Quality metrics requiring attention</p>
                            </CardHeader>
                            <CardContent className="bg-white">
                                <div className="space-y-3">
                                    {/* Rework Rate Issue */}
                                    <div className="p-3 bg-white rounded-lg border border-yellow-200 shadow-sm">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="font-semibold text-yellow-800 text-sm">High Rework Rate</div>
                                            <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
                                                CRITICAL
                                            </Badge>
                                        </div>

                                        <div className="mb-3">
                                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                <span>Line 3: 8.2%</span>
                                                <span>Target: &lt;5%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className="h-3 rounded-full bg-red-500 transition-all duration-300"
                                                    style={{ width: `${(8.2 / 10) * 100}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="text-xs text-yellow-600 mb-2">
                                            <div className="font-medium mb-1">Root Causes:</div>
                                            <div>• Operator training needed</div>
                                            <div>• Process parameters out of spec</div>
                                        </div>

                                        <div className="flex space-x-2">
                                            <Button size="sm" variant="outline" className="text-xs h-6 px-2 border-yellow-300 text-yellow-700">
                                                Investigate
                                            </Button>
                                            <Button size="sm" variant="outline" className="text-xs h-6 px-2 border-yellow-300 text-yellow-700">
                                                Retrain
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Scrap Rate Issue */}
                                    <div className="p-3 bg-white rounded-lg border border-yellow-200 shadow-sm">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="font-semibold text-yellow-800 text-sm">Scrap Rate Increase</div>
                                            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">
                                                WARNING
                                            </Badge>
                                        </div>

                                        <div className="mb-3">
                                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                <span>Current: +2.1%</span>
                                                <span>Target: &lt;1%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className="h-3 rounded-full bg-yellow-500 transition-all duration-300"
                                                    style={{ width: `${(2.1 / 5) * 100}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="text-xs text-yellow-600 mb-2">
                                            <div className="font-medium mb-1">Trend:</div>
                                            <div>• 3-week upward trend</div>
                                            <div>• Affecting 2 product lines</div>
                                        </div>

                                        <div className="flex space-x-2">
                                            <Button size="sm" variant="outline" className="text-xs h-6 px-2 border-yellow-300 text-yellow-700">
                                                Analyze
                                            </Button>
                                            <Button size="sm" variant="outline" className="text-xs h-6 px-2 border-yellow-300 text-yellow-700">
                                                Optimize
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-yellow-200">
                                    <Button variant="outline" size="sm" className="w-full text-yellow-700 border-yellow-300 hover:bg-yellow-50">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Quality Dashboard
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">⚡ Quick Actions</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link href="/quotations/create">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4 text-center">
                                    <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                    <div className="text-sm font-medium">New Quotation</div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/production/create">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4 text-center">
                                    <Factory className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                    <div className="text-sm font-medium">New Work Order</div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/procurement/create">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4 text-center">
                                    <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                                    <div className="text-sm font-medium">New PO</div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/engineering/create">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4 text-center">
                                    <Wrench className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                    <div className="text-sm font-medium">New Drawing</div>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </div>
            </main>

            {/* AI Insights Modals */}
            <DemandForecastModal />
            <SupplyChainRiskModal />
            <ProductionOptimizationModal />
            <InventoryOptimizationModal />
            <QualityIntelligenceModal />
            <ProcessImprovementModal />
        </div>
    )
}
