"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ProductionPage() {
    const router = useRouter()

    useEffect(() => {
        // Redirect to the dashboard tab by default
        // This ensures users land on the dashboard when they visit /production
        const event = new CustomEvent('switchTab', { detail: 'dashboard' })
        window.dispatchEvent(event)
    }, [])

    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading Production Dashboard...</p>
            </div>
        </div>
    )
}
