"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Target, CheckCircle, Activity, BarChart3 } from "lucide-react"

interface SeniorManagementViewProps {
    formatters: {
        Currency: Intl.NumberFormat
        Integer: Intl.NumberFormat
        Percent: (v: number) => string
    }
    stats: {
        sales: {
            soValue: number
        }
    }
    projects: string[]
}

export default function SeniorManagementView({ formatters, stats, projects }: SeniorManagementViewProps) {
    return (
        <div className="space-y-8">
            {/* Strategic KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Revenue (30d)</p>
                                <p className="text-2xl font-bold text-green-600">{formatters.Currency.format(stats.sales.soValue)}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-600" />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">+12% vs last month</p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                                <p className="text-2xl font-bold text-blue-600">{projects.length}</p>
                            </div>
                            <Target className="h-8 w-8 text-blue-600" />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">On track: {Math.floor(projects.length * 0.8)}</p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Customer Satisfaction</p>
                                <p className="text-2xl font-bold text-purple-600">94.2%</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-purple-600" />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">+2.1% vs last quarter</p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Operational Efficiency</p>
                                <p className="text-2xl font-bold text-orange-600">87.5%</p>
                            </div>
                            <Activity className="h-8 w-8 text-orange-600" />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">+3.2% vs last month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Strategic Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <BarChart3 className="w-5 h-5" />
                            <span>Revenue Trends</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 relative">
                            <canvas id="revenueTrendsChart"></canvas>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Target className="w-5 h-5" />
                            <span>Project Portfolio</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                <span className="text-sm font-medium">Completed Projects</span>
                                <span className="text-lg font-bold text-green-600">12</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                <span className="text-sm font-medium">In Progress</span>
                                <span className="text-lg font-bold text-blue-600">8</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                                <span className="text-sm font-medium">Planning Phase</span>
                                <span className="text-lg font-bold text-yellow-600">5</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
