"use client"

interface EngineeringBarChartProps {
    data: Array<{
        category: string
        count?: number
        cost?: number
        percentage: number
    }>
    title: string
    yAxisLabel: string
}

export default function EngineeringBarChart({ data, title, yAxisLabel }: EngineeringBarChartProps) {
    return (
        <div className="space-y-4">
            <h4 className="font-medium text-sm text-gray-900 text-center">{title}</h4>
            <div className="space-y-3">
                {data.map((item, index) => (
                    <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">{item.category}</span>
                            <span className="font-medium">
                                {yAxisLabel === "Cost" ? `RM${item.cost?.toLocaleString()}` : `${item.count} (${item.percentage}%)`}
                            </span>
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
}
