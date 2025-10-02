"use client"

interface DemandSupplyPieChartProps {
    data: Array<{
        level: string
        count: number
        percentage: number
        color: string
    }>
    title: string
}

export default function DemandSupplyPieChart({ data, title }: DemandSupplyPieChartProps) {
    return (
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
}
