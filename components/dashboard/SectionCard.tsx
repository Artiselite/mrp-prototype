"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SectionCardProps {
    title: string
    icon?: React.ReactNode
    subtitle?: React.ReactNode
    children: React.ReactNode
    footer?: React.ReactNode
}

export default function SectionCard({ title, icon, subtitle, children, footer }: SectionCardProps) {
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
