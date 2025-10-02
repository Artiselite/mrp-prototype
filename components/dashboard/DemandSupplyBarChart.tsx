"use client"

interface DemandSupplyBarChartProps {
    data: Array<{
        category: string
        demand?: number
        supply?: number
        gap?: number
        turnover?: number
        target?: number
    }>
    title: string
    type: "demand" | "turnover"
}

export default function DemandSupplyBarChart({ data, title, type }: DemandSupplyBarChartProps) {
    return (
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
                                    <span className={`ml-1 ${(item.gap || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        ({(item.gap || 0) >= 0 ? '+' : ''}{item.gap}%)
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
                                    ((item.gap || 0) >= 0 ? 'bg-green-500' : 'bg-red-500') :
                                    ((item.turnover || 0) >= (item.target || 0) ? 'bg-green-500' : 'bg-yellow-500')
                                    }`}
                                style={{ 
                                    width: `${type === "demand" ? 
                                        Math.max(item.demand || 0, item.supply || 0) : 
                                        ((item.turnover || 0) / 5) * 100
                                    }%` 
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
