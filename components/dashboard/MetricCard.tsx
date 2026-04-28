"use client"

import { cn } from "@/lib/utils"

interface MetricCardProps {
    icon: React.ReactNode
    label: string
    value: string
    sub?: string
    accent?: "green" | "blue" | "amber" | "red"
}

export default function MetricCard({ icon, label, value, sub, accent = "green" }: MetricCardProps) {
    return (
        <div className="group relative bg-card rounded-lg p-4 transition-all">
            <div className="flex items-start justify-between mb-3">
                <div className={cn(
                    "p-1.5 rounded-md",
                    accent === "green" && "bg-emerald-50 text-emerald-600",
                    accent === "blue" && "bg-blue-50 text-blue-600",
                    accent === "amber" && "bg-amber-50 text-amber-600",
                    accent === "red" && "bg-red-50 text-red-600",
                )}>
                    {icon}
                </div>
                <div className={cn("metric-dot mt-1.5", `metric-dot-${accent}`)} />
            </div>
            <div>
                <p className="text-2xl font-semibold text-foreground tracking-tight leading-none">{value}</p>
                <p className="text-xs font-medium text-muted-foreground mt-1.5">{label}</p>
                {sub && <p className="text-xs text-muted-foreground/70 mt-0.5">{sub}</p>}
            </div>
        </div>
    )
}
