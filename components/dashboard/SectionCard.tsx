"use client"

import { cn } from "@/lib/utils"

interface SectionCardProps {
    title: string
    icon?: React.ReactNode
    subtitle?: React.ReactNode
    children: React.ReactNode
    footer?: React.ReactNode
    accent?: "primary" | "blue" | "amber" | "red" | "purple"
    className?: string
}

export default function SectionCard({ title, icon, subtitle, children, footer, accent = "primary", className }: SectionCardProps) {
    return (
        <div className={cn(
            "card-accent bg-card rounded-lg",
            accent === "blue" && "card-accent-blue",
            accent === "amber" && "card-accent-amber",
            accent === "red" && "card-accent-red",
            accent === "purple" && "card-accent-purple",
            className
        )}>
            <div className="px-5 pt-5 pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        {icon && <span className="text-muted-foreground">{icon}</span>}
                        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                    </div>
                </div>
                {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
            </div>
            <div className="px-5 pb-5">
                {children}
            </div>
            {footer && (
                <div className="px-5 py-3 border-t border-border/30">
                    {footer}
                </div>
            )}
        </div>
    )
}
