"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Factory, Users, BarChart3, Target, Wrench, FileText, Shield, Settings, Copy } from "lucide-react"
import Link from "next/link"

export default function ProductionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showCreateJourney, setShowCreateJourney] = useState(false)

  // Check if we're on a detail page or sub-route
  const isDetailPage = pathname.includes('/subcontractor-work-orders/') && 
    (pathname.includes('/edit') || pathname.match(/\/subcontractor-work-orders\/[^\/]+$/))
  
  // If we're on a detail page, just render the children without the tab system
  if (isDetailPage) {
    return <>{children}</>
  }

  // Set active tab based on pathname
  useEffect(() => {
    if (pathname.includes('/subcontractor-work-orders')) {
      setActiveTab('subcontractor-work-orders')
    } else if (pathname.includes('/work-orders')) {
      setActiveTab('work-orders')
    } else if (pathname.includes('/workstations')) {
      setActiveTab('workstations')
    } else if (pathname.includes('/shopfloor')) {
      setActiveTab('shopfloor')
    } else if (pathname.includes('/journeys')) {
      setActiveTab('journey')
    } else if (pathname.includes('/process-steps')) {
      setActiveTab('process-steps')
    } else if (pathname.includes('/process-step-templates')) {
      setActiveTab('templates')
    } else if (pathname.includes('/quality')) {
      setActiveTab('quality')
    } else {
      setActiveTab('dashboard')
    }
  }, [pathname])

  useEffect(() => {
    const handleTabSwitch = (event: CustomEvent) => {
      setActiveTab(event.detail)
    }

    const handleCreateJourney = () => {
      setShowCreateJourney(true)
    }

    const handleCloseCreateJourney = () => {
      setShowCreateJourney(false)
    }

    window.addEventListener('switchTab', handleTabSwitch as EventListener)
    window.addEventListener('createJourney', handleCreateJourney as EventListener)
    window.addEventListener('closeCreateJourney', handleCloseCreateJourney as EventListener)
    
    return () => {
      window.removeEventListener('switchTab', handleTabSwitch as EventListener)
      window.removeEventListener('createJourney', handleCreateJourney as EventListener)
      window.removeEventListener('closeCreateJourney', handleCloseCreateJourney as EventListener)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 mb-2 block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Production Management</h1>
              <p className="text-sm text-gray-600">Comprehensive production monitoring and control</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-1">
            <TabsTrigger value="dashboard" className="flex items-center justify-center gap-2 text-xs md:text-sm">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="journey" className="flex items-center justify-center gap-2 text-xs md:text-sm">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Journeys</span>
            </TabsTrigger>
            <TabsTrigger value="shopfloor" className="flex items-center justify-center gap-2 text-xs md:text-sm">
              <Factory className="w-4 h-4" />
              <span className="hidden sm:inline">Shopfloor</span>
            </TabsTrigger>
            <TabsTrigger value="workstations" className="flex items-center justify-center gap-2 text-xs md:text-sm">
              <Wrench className="w-4 h-4" />
              <span className="hidden sm:inline">Workstations</span>
            </TabsTrigger>
            <TabsTrigger value="work-orders" className="flex items-center justify-center gap-2 text-xs md:text-sm">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Work Orders</span>
            </TabsTrigger>
            <TabsTrigger value="subcontractor-work-orders" className="flex items-center justify-center gap-2 text-xs md:text-sm">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Subcontractor</span>
            </TabsTrigger>
            <TabsTrigger value="process-steps" className="flex items-center justify-center gap-2 text-xs md:text-sm">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Process Steps</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center justify-center gap-2 text-xs md:text-sm">
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="quality" className="flex items-center justify-center gap-2 text-xs md:text-sm">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Quality</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {children}
          </TabsContent>

          <TabsContent value="journey" className="space-y-6">
            {children}
          </TabsContent>

          <TabsContent value="shopfloor" className="space-y-6">
            {children}
          </TabsContent>

          <TabsContent value="workstations" className="space-y-6">
            {children}
          </TabsContent>

          <TabsContent value="work-orders" className="space-y-6">
            {children}
          </TabsContent>

          <TabsContent value="subcontractor-work-orders" className="space-y-6">
            {children}
          </TabsContent>

          <TabsContent value="process-steps" className="space-y-6">
            {children}
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            {children}
          </TabsContent>

          <TabsContent value="quality" className="space-y-6">
            {children}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
