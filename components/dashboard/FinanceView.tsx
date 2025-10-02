"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DollarSign, Receipt, ShoppingCart, TrendingUp, Calculator, BarChart3,
    TrendingDown, Target, AlertTriangle, CheckCircle, Clock, Eye, RefreshCw,
    Settings, Calendar, PieChart, Activity, Zap, Shield, Brain
} from "lucide-react"
import MetricCard from "@/components/dashboard/MetricCard"
import SectionCard from "@/components/dashboard/SectionCard"
import { useEffect } from "react"

// Chart.js type declarations for CDN usage
declare global {
    interface Window {
        Chart: any
    }
}

interface FinanceViewProps {
    formatters: {
        Currency: Intl.NumberFormat
        Integer: Intl.NumberFormat
        Percent: (v: number) => string
    }
    stats: {
        sales: {
            soValue: number
        }
        fin: {
            invoiceValue: number
            poValue: number
            posActive: number
        }
    }
}

export default function FinanceView({ formatters, stats }: FinanceViewProps) {
    // Initialize Chart.js charts
    useEffect(() => {
        const initializeCharts = () => {
            if (typeof window !== 'undefined' && window.Chart && typeof window.Chart === 'function') {
                // Revenue Trend Line Chart
                const revenueCtx = document.getElementById('revenueTrendChart') as HTMLCanvasElement
                const revenueLoading = document.getElementById('revenueTrendLoading')
                if (revenueCtx) {
                    const existingChart = window.Chart.getChart(revenueCtx)
                    if (existingChart) {
                        existingChart.destroy()
                    }

                    if (revenueLoading) {
                        revenueLoading.style.display = 'none'
                    }

                    new window.Chart(revenueCtx, {
                        type: 'line',
                        data: {
                            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                            datasets: [{
                                label: 'Revenue',
                                data: [850000, 920000, 1100000, 980000, 1250000, 1180000, 1350000, 1420000, 1380000, 1500000, 1450000, 1600000],
                                borderColor: 'rgb(59, 130, 246)',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                borderWidth: 3,
                                fill: true,
                                tension: 0.4,
                                pointRadius: 4,
                                pointHoverRadius: 6,
                                pointBackgroundColor: 'rgb(59, 130, 246)',
                                pointBorderColor: '#fff',
                                pointBorderWidth: 2
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
                                        label: function (context: any) {
                                            return 'Revenue: ' + formatters.Currency.format(context.parsed.y);
                                        }
                                    }
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        callback: function (value: any) {
                                            return 'RM' + (value / 1000) + 'K';
                                        }
                                    }
                                }
                            }
                        }
                    })
                }

                // Cost Breakdown Pie Chart
                const costCtx = document.getElementById('costBreakdownChart') as HTMLCanvasElement
                const costLoading = document.getElementById('costBreakdownLoading')
                if (costCtx) {
                    const existingChart = window.Chart.getChart(costCtx)
                    if (existingChart) {
                        existingChart.destroy()
                    }

                    if (costLoading) {
                        costLoading.style.display = 'none'
                    }

                    new window.Chart(costCtx, {
                        type: 'doughnut',
                        data: {
                            labels: ['Materials', 'Labor', 'Equipment', 'Overhead', 'Marketing', 'Other'],
                            datasets: [{
                                data: [450000, 320000, 180000, 150000, 80000, 100000],
                                backgroundColor: [
                                    'rgba(239, 68, 68, 0.8)',
                                    'rgba(59, 130, 246, 0.8)',
                                    'rgba(34, 197, 94, 0.8)',
                                    'rgba(251, 191, 36, 0.8)',
                                    'rgba(147, 51, 234, 0.8)',
                                    'rgba(107, 114, 128, 0.8)'
                                ],
                                borderColor: [
                                    'rgba(239, 68, 68, 1)',
                                    'rgba(59, 130, 246, 1)',
                                    'rgba(34, 197, 94, 1)',
                                    'rgba(251, 191, 36, 1)',
                                    'rgba(147, 51, 234, 1)',
                                    'rgba(107, 114, 128, 1)'
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
                                        usePointStyle: true,
                                        padding: 15,
                                        font: {
                                            size: 10
                                        }
                                    }
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function (context: any) {
                                            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                                            return context.label + ': ' + formatters.Currency.format(context.parsed) + ' (' + percentage + '%)';
                                        }
                                    }
                                }
                            }
                        }
                    })
                }

                // Budget vs Actual Bar Chart
                const budgetCtx = document.getElementById('budgetVsActualChart') as HTMLCanvasElement
                const budgetLoading = document.getElementById('budgetVsActualLoading')
                if (budgetCtx) {
                    const existingChart = window.Chart.getChart(budgetCtx)
                    if (existingChart) {
                        existingChart.destroy()
                    }

                    if (budgetLoading) {
                        budgetLoading.style.display = 'none'
                    }

                    new window.Chart(budgetCtx, {
                        type: 'bar',
                        data: {
                            labels: ['Revenue', 'Materials', 'Labor', 'Overhead', 'Marketing'],
                            datasets: [{
                                label: 'Budget',
                                data: [1500000, 525000, 375000, 180000, 100000],
                                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                                borderColor: 'rgba(59, 130, 246, 1)',
                                borderWidth: 1
                            }, {
                                label: 'Actual',
                                data: [1600000, 450000, 320000, 150000, 80000],
                                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                                borderColor: 'rgba(34, 197, 94, 1)',
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    display: true,
                                    position: 'top',
                                    labels: {
                                        font: {
                                            size: 10
                                        },
                                        usePointStyle: true,
                                        padding: 10
                                    }
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function (context: any) {
                                            return context.dataset.label + ': ' + formatters.Currency.format(context.parsed.y);
                                        }
                                    }
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        callback: function (value: any) {
                                            return 'RM' + (value / 1000) + 'K';
                                        }
                                    }
                                },
                                x: {
                                    ticks: {
                                        font: {
                                            size: 9
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
        const timeoutId = setTimeout(initializeCharts, 1000)

        return () => {
            clearTimeout(timeoutId)
        }
    }, [formatters])

    // Financial data for charts and visualizations
    const financialData = {
        // Revenue trends over 12 months
        revenueTrend: [
            { month: "Jan", revenue: 850000, costs: 680000, profit: 170000 },
            { month: "Feb", revenue: 920000, costs: 736000, profit: 184000 },
            { month: "Mar", revenue: 1100000, costs: 880000, profit: 220000 },
            { month: "Apr", revenue: 980000, costs: 784000, profit: 196000 },
            { month: "May", revenue: 1250000, costs: 1000000, profit: 250000 },
            { month: "Jun", revenue: 1180000, costs: 944000, profit: 236000 },
            { month: "Jul", revenue: 1350000, costs: 1080000, profit: 270000 },
            { month: "Aug", revenue: 1420000, costs: 1136000, profit: 284000 },
            { month: "Sep", revenue: 1380000, costs: 1104000, profit: 276000 },
            { month: "Oct", revenue: 1500000, costs: 1200000, profit: 300000 },
            { month: "Nov", revenue: 1450000, costs: 1160000, profit: 290000 },
            { month: "Dec", revenue: 1600000, costs: 1280000, profit: 320000 }
        ],

        // Cost breakdown by category
        costBreakdown: [
            { category: "Materials", amount: 450000, percentage: 35, color: "bg-red-500" },
            { category: "Labor", amount: 320000, percentage: 25, color: "bg-blue-500" },
            { category: "Equipment", amount: 180000, percentage: 14, color: "bg-green-500" },
            { category: "Overhead", amount: 150000, percentage: 12, color: "bg-yellow-500" },
            { category: "Marketing", amount: 80000, percentage: 6, color: "bg-purple-500" },
            { category: "Other", amount: 100000, percentage: 8, color: "bg-gray-500" }
        ],

        // Cash flow analysis
        cashFlow: [
            { period: "Q1", inflow: 2850000, outflow: 2200000, net: 650000 },
            { period: "Q2", inflow: 3430000, outflow: 2728000, net: 702000 },
            { period: "Q3", inflow: 4150000, outflow: 3320000, net: 830000 },
            { period: "Q4", inflow: 4550000, outflow: 3640000, net: 910000 }
        ],

        // Key financial ratios
        ratios: [
            { name: "Current Ratio", value: 2.4, target: 2.0, status: "good" },
            { name: "Quick Ratio", value: 1.8, target: 1.5, status: "good" },
            { name: "Debt-to-Equity", value: 0.6, target: 1.0, status: "excellent" },
            { name: "ROI", value: 18.5, target: 15.0, status: "excellent" },
            { name: "Gross Margin", value: 32.5, target: 30.0, status: "good" },
            { name: "Net Margin", value: 20.0, target: 18.0, status: "good" }
        ],

        // Budget vs Actual
        budgetVsActual: [
            { category: "Revenue", budget: 1500000, actual: 1600000, variance: 6.7 },
            { category: "Materials", budget: 525000, actual: 450000, variance: -14.3 },
            { category: "Labor", budget: 375000, actual: 320000, variance: -14.7 },
            { category: "Overhead", budget: 180000, actual: 150000, variance: -16.7 },
            { category: "Marketing", budget: 100000, actual: 80000, variance: -20.0 }
        ]
    }

    return (
        <div className="space-y-6">
            {/* Financial KPI Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    icon={<DollarSign className="w-5 h-5" />}
                    label="Total Revenue"
                    value={formatters.Currency.format(stats.sales.soValue)}
                    sub="+12% vs last month"
                />
                <MetricCard
                    icon={<Receipt className="w-5 h-5" />}
                    label="Outstanding AR"
                    value={formatters.Currency.format(stats.fin.invoiceValue)}
                    sub="Avg. 28 days"
                />
                <MetricCard
                    icon={<ShoppingCart className="w-5 h-5" />}
                    label="Purchase Orders"
                    value={formatters.Currency.format(stats.fin.poValue)}
                    sub={`${stats.fin.posActive} active`}
                />
                <MetricCard
                    icon={<TrendingUp className="w-5 h-5" />}
                    label="Gross Margin"
                    value="32.5%"
                    sub="+1.2% vs last month"
                />
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Revenue Trend Chart */}
                <SectionCard title="📈 Revenue Trend" icon={<TrendingUp className="w-5 h-5" />}>
                    <div className="h-48 relative">
                        <canvas id="revenueTrendChart"></canvas>
                        <div id="revenueTrendLoading" className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">
                            Loading chart...
                        </div>
                    </div>
                </SectionCard>

                {/* Cost Breakdown Pie Chart */}
                <SectionCard title="🥧 Cost Breakdown" icon={<PieChart className="w-5 h-5" />}>
                    <div className="h-48 relative">
                        <canvas id="costBreakdownChart"></canvas>
                        <div id="costBreakdownLoading" className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">
                            Loading chart...
                        </div>
                    </div>
                </SectionCard>

                 {/* Budget vs Actual Analysis */}
                 <SectionCard title="💰 Budget vs Actual" icon={<Calculator className="w-5 h-5" />}>
                     <div className="h-48 relative">
                         <canvas id="budgetVsActualChart"></canvas>
                         <div id="budgetVsActualLoading" className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">
                             Loading chart...
                         </div>
                     </div>
                     <div className="mt-4 grid grid-cols-2 gap-4">
                         <div className="text-center p-3 bg-green-50 rounded-lg">
                             <div className="text-sm text-green-600 font-medium">Under Budget</div>
                             <div className="text-lg font-bold text-green-800">4 Categories</div>
                         </div>
                         <div className="text-center p-3 bg-blue-50 rounded-lg">
                             <div className="text-sm text-blue-600 font-medium">Over Budget</div>
                             <div className="text-lg font-bold text-blue-800">1 Category</div>
                         </div>
                     </div>
                 </SectionCard>
            </div>



            {/* Cash Flow Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SectionCard title="💸 Cash Flow" icon={<Activity className="w-5 h-5" />}>
                    <div className="space-y-4">
                        {financialData.cashFlow.map((quarter, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="font-medium text-gray-800">{quarter.period}</div>
                                    <div className={`font-bold ${quarter.net >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {formatters.Currency.format(quarter.net)}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="text-gray-600">Inflow</div>
                                        <div className="font-medium text-green-600">
                                            {formatters.Currency.format(quarter.inflow)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600">Outflow</div>
                                        <div className="font-medium text-red-600">
                                            {formatters.Currency.format(quarter.outflow)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>

                <SectionCard title="📋 Financial Health" icon={<Shield className="w-5 h-5" />}>
                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between mb-2">
                                <div className="font-medium text-green-800">Overall Health Score</div>
                                <Badge variant="secondary" className="bg-green-100 text-green-700">Excellent</Badge>
                            </div>
                            <div className="text-2xl font-bold text-green-800 mb-2">87/100</div>
                            <div className="text-sm text-green-700">
                                Strong financial position with healthy cash flow and low debt
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div className="font-medium text-blue-800 text-sm">Liquidity</div>
                                <div className="text-blue-600 font-bold">Strong</div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div className="font-medium text-green-800 text-sm">Profitability</div>
                                <div className="text-green-600 font-bold">Excellent</div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                <div className="font-medium text-yellow-800 text-sm">Efficiency</div>
                                <div className="text-yellow-600 font-bold">Good</div>
                            </div>
                        </div>
                    </div>
                </SectionCard>
            </div>

            {/* AI Financial Insights */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                            <Brain className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">AI Financial Insights</h2>
                            <p className="text-sm text-gray-600">Intelligent financial analysis and recommendations</p>
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Cost Optimization */}
                    <Card className="border-green-200 bg-white shadow-lg">
                        <CardHeader className="pb-3 bg-white border-b border-green-200">
                            <CardTitle className="text-lg text-green-800 flex items-center space-x-2">
                                <Zap className="w-5 h-5" />
                                <span>Cost Optimization</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="bg-white">
                            <div className="space-y-4">
                                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-semibold text-green-800 text-sm">Potential Savings</div>
                                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                            RM125K
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-green-700 space-y-1">
                                        <div>• Reduce material waste by 8%</div>
                                        <div>• Optimize supplier contracts</div>
                                        <div>• Implement energy efficiency measures</div>
                                    </div>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="font-semibold text-blue-800 text-sm mb-2">Recommendations</div>
                                    <div className="text-xs text-blue-700 space-y-1">
                                        <div>• Negotiate bulk pricing with top 3 suppliers</div>
                                        <div>• Implement predictive maintenance</div>
                                        <div>• Review utility contracts quarterly</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Revenue Growth */}
                    <Card className="border-blue-200 bg-white shadow-lg">
                        <CardHeader className="pb-3 bg-white border-b border-blue-200">
                            <CardTitle className="text-lg text-blue-800 flex items-center space-x-2">
                                <TrendingUp className="w-5 h-5" />
                                <span>Revenue Growth</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="bg-white">
                            <div className="space-y-4">
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-semibold text-blue-800 text-sm">Growth Potential</div>
                                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                            +15%
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-blue-700 space-y-1">
                                        <div>• Expand into new markets</div>
                                        <div>• Launch premium product line</div>
                                        <div>• Increase customer retention</div>
                                    </div>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                    <div className="font-semibold text-purple-800 text-sm mb-2">Market Opportunities</div>
                                    <div className="text-xs text-purple-700 space-y-1">
                                        <div>• Southeast Asia expansion</div>
                                        <div>• Digital transformation services</div>
                                        <div>• Sustainable manufacturing</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">⚡ Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button className="h-20 flex flex-col items-center justify-center space-y-2">
                        <Receipt className="w-6 h-6" />
                        <span className="text-sm">Generate Invoice</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                        <Calculator className="w-6 h-6" />
                        <span className="text-sm">Financial Report</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                        <BarChart3 className="w-6 h-6" />
                        <span className="text-sm">Budget Planning</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                        <TrendingUp className="w-6 h-6" />
                        <span className="text-sm">Forecast</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}
