"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Factory, Users, CheckCircle, BarChart3, Target, Wrench, FileText, Shield, Settings, Copy } from "lucide-react"
import Link from "next/link"
import ShopfloorPage from "./shopfloor/page"
import QualityPage from "./quality/page"
import DashboardPage from "./dashboard/page"
import WorkstationPage from "./workstations/page"
import JourneysPage from "./journeys/page"
import CreateJourneyPage from "./journeys/create"
import WorkOrderPage from "./work-orders/page"
import ProcessStepsPage from "./process-steps/page"
import ProcessStepTemplatesPage from "./process-step-templates/page"

export default function ProductionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showCreateJourney, setShowCreateJourney] = useState(false)

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
            <DashboardPage />
          </TabsContent>

          <TabsContent value="journey" className="space-y-6">
            {showCreateJourney ? (
              <CreateJourneyPage />
            ) : (
              <JourneysPage />
            )}
          </TabsContent>

          <TabsContent value="shopfloor" className="space-y-6">
            <ShopfloorPage />
          </TabsContent>

          <TabsContent value="workstations" className="space-y-6">
            <WorkstationPage />
          </TabsContent>

          <TabsContent value="work-orders" className="space-y-6">
            <WorkOrderPage />
          </TabsContent>

          <TabsContent value="process-steps" className="space-y-6">
            <ProcessStepsPage />
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <ProcessStepTemplatesPage />
          </TabsContent>

          <TabsContent value="quality" className="space-y-6">
            <QualityPage />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
