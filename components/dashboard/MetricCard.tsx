"use client"

import { Card, CardContent } from "@/components/ui/card"

interface MetricCardProps {
    icon: React.ReactNode
    label: string
    value: string
    sub?: string
}

export default function MetricCard({ icon, label, value, sub }: MetricCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">{icon}</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-600 leading-tight">{label}</p>
                        </div>
                    </div>
                    <div className="space-y-1 text-center">
                        <p className="text-xl font-bold text-gray-900 leading-tight break-words">{value}</p>
                        {sub && <p className="text-xs text-gray-500 leading-tight break-words">{sub}</p>}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
