"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
    Users, FileText, ShoppingCart, TrendingUp, DollarSign, 
    Target, Calendar, CheckCircle, AlertTriangle, BarChart3,
    TrendingDown, Clock, Eye, RefreshCw, Settings, Building2,
    Wrench, Factory
} from "lucide-react"
import MetricCard from "@/components/dashboard/MetricCard"
import SectionCard from "@/components/dashboard/SectionCard"
import EngineeringPieChart from "@/components/dashboard/EngineeringPieChart"
import EngineeringBarChart from "@/components/dashboard/EngineeringBarChart"
import DemandSupplyPieChart from "@/components/dashboard/DemandSupplyPieChart"
import DemandSupplyBarChart from "@/components/dashboard/DemandSupplyBarChart"
import ProductionPieChart from "@/components/dashboard/ProductionPieChart"

interface SalesManagerViewProps {
    formatters: {
        Currency: Intl.NumberFormat
        Integer: Intl.NumberFormat
        Percent: (v: number) => string
    }
    stats: {
        sales: {
            quotes: number
            soTotal: number
            soActive: number
            soConfirmed: number
            soDraft: number
            soValue: number
            quoteValue: number
        }
        eng: {
            drawings: number
            drawingsReleased: number
            drawingsReview: number
            boms: number
            bomsApproved: number
            bomsDraft: number
            boqs: number
            boqsApproved: number
            boqsDraft: number
        }
        prod: {
            wos: number
            wosActive: number
            wosPlanned: number
            wosDone: number
        }
        actives: {
            customersActive: number
            customersInactive: number
            customersSuspended: number
        }
    }
    projects: string[]
}

export default function SalesManagerView({ formatters, stats, projects }: SalesManagerViewProps) {
    // Sales-specific data
    const salesData = {
        // Sales Performance Metrics
        salesPerformance: [
            { metric: "Monthly Revenue", current: 1250000, target: 1200000, trend: "up", change: 4.2 },
            { metric: "Quotation Conversion", current: 68, target: 65, trend: "up", change: 4.6 },
            { metric: "Average Deal Size", current: 45000, target: 40000, trend: "up", change: 12.5 },
            { metric: "Sales Cycle (Days)", current: 28, target: 30, trend: "down", change: -6.7 },
            { metric: "Customer Retention", current: 92, target: 90, trend: "up", change: 2.2 },
            { metric: "New Customer Acquisition", current: 15, target: 12, trend: "up", change: 25.0 }
        ],

        // Pipeline Status
        pipelineStatus: [
            { stage: "Lead", count: 45, value: 67500000, color: "bg-blue-500" },
            { stage: "Qualified", count: 32, value: 96000000, color: "bg-yellow-500" },
            { stage: "Proposal", count: 18, value: 72000000, color: "bg-orange-500" },
            { stage: "Negotiation", count: 12, value: 54000000, color: "bg-purple-500" },
            { stage: "Closed Won", count: 8, value: 36000000, color: "bg-green-500" }
        ],

        // Top Customers
        topCustomers: [
            { name: "Petronas Carigali Sdn Bhd", revenue: 18000000, orders: 12, growth: 15.2 },
            { name: "Tenaga Nasional Berhad", revenue: 16500000, orders: 8, growth: 8.7 },
            { name: "YTL Power International", revenue: 14200000, orders: 15, growth: 22.1 },
            { name: "Industrial Power Solutions Sdn Bhd", revenue: 12800000, orders: 6, growth: -3.2 },
            { name: "Sarawak Energy Berhad", revenue: 11500000, orders: 9, growth: 12.8 }
        ],

        // Product Performance
        productPerformance: [
            { product: "Compact Bus Duct", revenue: 45000000, units: 125, margin: 18.5 },
            { product: "Sandwich Bus Duct", revenue: 32000000, units: 45, margin: 22.3 },
            { product: "Rising Main Bus Duct", revenue: 18000000, units: 2500, margin: 15.7 },
            { product: "Tap-Off Units & Accessories", revenue: 15000000, units: 800, margin: 20.1 },
            { product: "Custom Bus Duct Systems", revenue: 12000000, units: 200, margin: 16.8 }
        ],

        // Regional Performance
        regionalPerformance: [
            { region: "Klang Valley", revenue: 42000000, growth: 12.5, customers: 25 },
            { region: "Penang", revenue: 38000000, growth: 8.3, customers: 18 },
            { region: "Johor", revenue: 32000000, growth: 15.7, customers: 22 },
            { region: "East Malaysia", revenue: 28000000, growth: 5.2, customers: 15 },
            { region: "East Coast", revenue: 25000000, growth: 18.9, customers: 12 }
        ]
    }

    return (
        <div className="space-y-8">
            {/* Sales KPI Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard 
                    icon={<FileText className="w-5 h-5" />} 
                    label="Total Quotations" 
                    value={formatters.Integer.format(stats.sales.quotes)} 
                    sub={formatters.Currency.format(stats.sales.quoteValue)} 
                />
                <MetricCard 
                    icon={<ShoppingCart className="w-5 h-5" />} 
                    label="Sales Orders" 
                    value={formatters.Integer.format(stats.sales.soTotal)} 
                    sub={`${stats.sales.soActive} active`} 
                />
                <MetricCard 
                    icon={<Building2 className="w-5 h-5" />} 
                    label="Active Projects" 
                    value={formatters.Integer.format(projects.length)} 
                    sub={`${stats.prod.wosActive} work orders`} 
                />
                <MetricCard 
                    icon={<Users className="w-5 h-5" />} 
                    label="Active Customers" 
                    value={formatters.Integer.format(stats.actives.customersActive)} 
                    sub={`${stats.actives.customersSuspended} suspended`} 
                />
            </div>

            {/* Secondary KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard 
                    icon={<DollarSign className="w-5 h-5" />} 
                    label="Total Revenue" 
                    value={formatters.Currency.format(stats.sales.soValue)} 
                    sub="+12% vs last month" 
                />
                <MetricCard 
                    icon={<Target className="w-5 h-5" />} 
                    label="Conversion Rate" 
                    value={`${Math.round((stats.sales.soTotal / stats.sales.quotes) * 100)}%`} 
                    sub="Quote to Order" 
                />
                <MetricCard 
                    icon={<CheckCircle className="w-5 h-5" />} 
                    label="Confirmed Orders" 
                    value={formatters.Integer.format(stats.sales.soConfirmed)} 
                    sub={`${Math.round((stats.sales.soConfirmed / stats.sales.soTotal) * 100)}% of total`} 
                />
                <MetricCard 
                    icon={<Wrench className="w-5 h-5" />} 
                    label="Engineering Drawings" 
                    value={formatters.Integer.format(stats.eng.drawings)} 
                    sub={`${stats.eng.drawingsReleased} released`} 
                />
            </div>

            {/* Project & Engineering Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <SectionCard title="🏗️ Engineering Status" icon={<Wrench className="w-5 h-5" />}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{stats.eng.drawings}</div>
                                <div className="text-sm text-muted-foreground">Total Drawings</div>
                                <div className="text-xs text-muted-foreground">{stats.eng.drawingsReleased} Released</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{stats.eng.boms}</div>
                                <div className="text-sm text-muted-foreground">BOMs</div>
                                <div className="text-xs text-muted-foreground">{stats.eng.bomsApproved} Approved</div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Drawings Under Review</span>
                                <span className="font-medium">{stats.eng.drawingsReview}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>BOQs Approved</span>
                                <span className="font-medium">{stats.eng.boqsApproved}</span>
                            </div>
                        </div>
                    </div>
                </SectionCard>

                <SectionCard title="📋 Project Pipeline" icon={<Building2 className="w-5 h-5" />}>
                    <div className="space-y-4">
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-3xl font-bold text-purple-600">{projects.length}</div>
                            <div className="text-sm text-muted-foreground">Active Projects</div>
                        </div>
                        <div className="space-y-2">
                            {projects.slice(0, 3).map((project, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                                    <span className="text-sm font-medium truncate">{project}</span>
                                    <Badge variant="secondary" className="text-xs">Active</Badge>
                                </div>
                            ))}
                            {projects.length > 3 && (
                                <div className="text-center text-xs text-muted-foreground">
                                    +{projects.length - 3} more projects
                                </div>
                            )}
                        </div>
                    </div>
                </SectionCard>

                <SectionCard title="🏭 Production Status" icon={<Factory className="w-5 h-5" />}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-orange-50 rounded-lg">
                                <div className="text-2xl font-bold text-orange-600">{stats.prod.wosActive}</div>
                                <div className="text-sm text-muted-foreground">Active WOs</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{stats.prod.wosDone}</div>
                                <div className="text-sm text-muted-foreground">Completed</div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Total Work Orders</span>
                                <span className="font-medium">{stats.prod.wos}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Planned</span>
                                <span className="font-medium">{stats.prod.wosPlanned}</span>
                            </div>
                        </div>
                    </div>
                </SectionCard>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Pipeline */}
                <SectionCard title="📊 Sales Pipeline" icon={<BarChart3 className="w-5 h-5" />}>
                    <div className="space-y-3">
                        {salesData.pipelineStatus.map((stage, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                                    <div>
                                        <div className="font-medium text-sm">{stage.stage}</div>
                                        <div className="text-xs text-muted-foreground">{stage.count} deals</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium text-sm">{formatters.Currency.format(stage.value)}</div>
                                    <div className="text-xs text-muted-foreground">{stage.count} deals</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>

                {/* Top Customers */}
                <SectionCard title="🏆 Top Customers" icon={<Users className="w-5 h-5" />}>
                    <div className="space-y-3">
                        {salesData.topCustomers.map((customer, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div>
                                    <div className="font-medium text-sm">{customer.name}</div>
                                    <div className="text-xs text-muted-foreground">{customer.orders} orders</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium text-sm">{formatters.Currency.format(customer.revenue)}</div>
                                    <div className={`text-xs ${customer.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {customer.growth >= 0 ? '+' : ''}{customer.growth}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>

                {/* Product Performance */}
                <SectionCard title="📦 Product Performance" icon={<ShoppingCart className="w-5 h-5" />}>
                    <div className="space-y-3">
                        {salesData.productPerformance.map((product, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div>
                                    <div className="font-medium text-sm">{product.product}</div>
                                    <div className="text-xs text-muted-foreground">{product.units} units</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium text-sm">{formatters.Currency.format(product.revenue)}</div>
                                    <div className="text-xs text-muted-foreground">{product.margin}% margin</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </div>

            {/* Sales Performance Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionCard title="📊 Sales Performance" icon={<BarChart3 className="w-5 h-5" />}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                    {Math.round((stats.sales.soTotal / stats.sales.quotes) * 100)}%
                                </div>
                                <div className="text-sm text-muted-foreground">Quote Conversion</div>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                    {formatters.Currency.format(stats.sales.soValue / stats.sales.soTotal)}
                                </div>
                                <div className="text-sm text-muted-foreground">Avg Order Value</div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Total Quote Value</span>
                                <span className="font-medium">{formatters.Currency.format(stats.sales.quoteValue)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Confirmed Orders</span>
                                <span className="font-medium">{stats.sales.soConfirmed}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Draft Orders</span>
                                <span className="font-medium">{stats.sales.soDraft}</span>
                            </div>
                        </div>
                    </div>
                </SectionCard>

                <SectionCard title="🗺️ Regional Performance" icon={<TrendingUp className="w-5 h-5" />}>
                    <div className="h-64">
                        <EngineeringBarChart 
                            data={salesData.regionalPerformance.map(region => ({
                                category: region.region,
                                count: region.revenue,
                                percentage: (region.revenue / 165000000) * 100
                            }))} 
                            title="Revenue by Region" 
                            yAxisLabel="Revenue (RM)"
                        />
                    </div>
                </SectionCard>
            </div>

            {/* Sales Analytics Insights */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">Sales Analytics Insights</h2>
                            <p className="text-sm text-muted-foreground">AI-powered sales recommendations</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="text-xs">
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Last Analysis: {new Date().toLocaleTimeString()}
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                            <Settings className="w-3 h-3 mr-1" />
                            Settings
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sales Forecast */}
                    <Card className="border-blue-200 bg-card shadow-lg">
                        <CardHeader className="pb-3 bg-card border-b border-blue-200">
                            <CardTitle className="text-lg text-blue-800 flex items-center space-x-2">
                                <TrendingUp className="w-5 h-5" />
                                <span>Q4 Sales Forecast</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="bg-card">
                            <div className="space-y-4">
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-semibold text-blue-800 text-sm">Projected Revenue</div>
                                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                            +18%
                                        </Badge>
                                    </div>
                                    <div className="text-2xl font-bold text-blue-800 mb-1">
                                        {formatters.Currency.format(1475000)}
                                    </div>
                                    <div className="text-xs text-blue-600">
                                        Based on current pipeline and historical trends
                                    </div>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                    <div className="font-semibold text-green-800 text-sm mb-2">Key Opportunities</div>
                                    <div className="text-xs text-green-700 space-y-1">
                                        <div>• 3 large deals in negotiation phase</div>
                                        <div>• Strong pipeline in North region</div>
                                        <div>• New product launch expected to boost sales</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Insights */}
                    <Card className="border-green-200 bg-card shadow-lg">
                        <CardHeader className="pb-3 bg-card border-b border-green-200">
                            <CardTitle className="text-lg text-green-800 flex items-center space-x-2">
                                <Users className="w-5 h-5" />
                                <span>Customer Insights</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="bg-card">
                            <div className="space-y-4">
                                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-semibold text-green-800 text-sm">Customer Health Score</div>
                                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                            87/100
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-green-700 space-y-1">
                                        <div>• 92% retention rate (excellent)</div>
                                        <div>• 15% growth in average deal size</div>
                                        <div>• 2.3x increase in repeat orders</div>
                                    </div>
                                </div>
                                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <div className="font-semibold text-yellow-800 text-sm mb-2">At-Risk Customers</div>
                                    <div className="text-xs text-yellow-700 space-y-1">
                                        <div>• 3 customers with declining orders</div>
                                        <div>• 2 customers with payment delays</div>
                                        <div>• Immediate follow-up recommended</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4">⚡ Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button className="h-20 flex flex-col items-center justify-center space-y-2">
                        <FileText className="w-6 h-6" />
                        <span className="text-sm">New Quotation</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                        <Users className="w-6 h-6" />
                        <span className="text-sm">Add Customer</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                        <Calendar className="w-6 h-6" />
                        <span className="text-sm">Schedule Meeting</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                        <BarChart3 className="w-6 h-6" />
                        <span className="text-sm">Sales Report</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}

