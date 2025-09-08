"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Target, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Settings, 
  Play, 
  Pause, 
  Square,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  Factory,
  FileText,
  Shield,
  BarChart3,
  Filter,
  Search,
  RefreshCw,
  Copy,
  Archive,
  Star,
  TrendingUp,
  Calendar,
  User,
  Wrench
} from "lucide-react"
import { useDatabaseContext } from "@/components/database-provider"
import { useRouter } from "next/navigation"

export default function JourneyManagement() {
  const { 
    productionWorkOrders: workOrders = [],
    workstations = [],
    operators = [],
    qualityInspections = [],
    qualityTests = []
  } = useDatabaseContext()
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedJourney, setSelectedJourney] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingJourney, setEditingJourney] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("active")
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    priority: "Medium",
    status: "Planning",
    startDate: "",
    endDate: ""
  })

  // Mock journey data - in a real app, this would come from the database
  const [journeys, setJourneys] = useState([
    {
      id: "J001",
      name: "Standard Production",
      description: "Standard manufacturing workflow for regular orders",
      type: "Standard",
      status: "Active",
      priority: "Medium",
      progress: 75,
      totalWorkOrders: 12,
      completedWorkOrders: 9,
      startDate: "2024-01-15",
      endDate: "2024-02-15",
      createdBy: "John Smith",
      lastUpdated: "2024-01-20T10:30:00Z",
      steps: [
        { id: 1, name: "Setup", status: "completed", description: "Configure workstations and operators" },
        { id: 2, name: "Planning", status: "completed", description: "Create work orders and assign resources" },
        { id: 3, name: "Production", status: "in-progress", description: "Execute production workflow" },
        { id: 4, name: "Quality", status: "pending", description: "Perform quality inspections" },
        { id: 5, name: "Completion", status: "pending", description: "Finalize and deliver" }
      ],
      metrics: {
        efficiency: 88,
        quality: 94,
        onTimeDelivery: 92
      }
    },
    {
      id: "J002",
      name: "Rush Order",
      description: "Expedited production workflow for urgent orders",
      type: "Rush",
      status: "Active",
      priority: "Critical",
      progress: 45,
      totalWorkOrders: 3,
      completedWorkOrders: 1,
      startDate: "2024-01-18",
      endDate: "2024-01-25",
      createdBy: "Sarah Johnson",
      lastUpdated: "2024-01-20T14:15:00Z",
      steps: [
        { id: 1, name: "Setup", status: "completed", description: "Configure workstations and operators" },
        { id: 2, name: "Planning", status: "completed", description: "Create work orders and assign resources" },
        { id: 3, name: "Production", status: "in-progress", description: "Execute production workflow" },
        { id: 4, name: "Quality", status: "pending", description: "Perform quality inspections" },
        { id: 5, name: "Completion", status: "pending", description: "Finalize and deliver" }
      ],
      metrics: {
        efficiency: 95,
        quality: 98,
        onTimeDelivery: 100
      }
    },
    {
      id: "J003",
      name: "Quality Focus",
      description: "Quality-focused production workflow with enhanced inspections",
      type: "Quality",
      status: "Planning",
      priority: "High",
      progress: 20,
      totalWorkOrders: 8,
      completedWorkOrders: 0,
      startDate: "2024-01-22",
      endDate: "2024-02-22",
      createdBy: "Mike Wilson",
      lastUpdated: "2024-01-20T09:45:00Z",
      steps: [
        { id: 1, name: "Setup", status: "completed", description: "Configure workstations and operators" },
        { id: 2, name: "Planning", status: "in-progress", description: "Create work orders and assign resources" },
        { id: 3, name: "Production", status: "pending", description: "Execute production workflow" },
        { id: 4, name: "Quality", status: "pending", description: "Perform quality inspections" },
               { id: 5, name: "Completion", status: "pending", description: "Finalize and deliver" }
      ],
      metrics: {
        efficiency: 85,
        quality: 99,
        onTimeDelivery: 88
      }
    },
    {
      id: "J004",
      name: "Bulk Production",
      description: "High-volume production workflow for large orders",
      type: "Bulk",
      status: "Completed",
      priority: "Medium",
      progress: 100,
      totalWorkOrders: 25,
      completedWorkOrders: 25,
      startDate: "2024-01-01",
      endDate: "2024-01-15",
      createdBy: "Lisa Brown",
      lastUpdated: "2024-01-15T16:00:00Z",
      steps: [
        { id: 1, name: "Setup", status: "completed", description: "Configure workstations and operators" },
        { id: 2, name: "Planning", status: "completed", description: "Create work orders and assign resources" },
        { id: 3, name: "Production", status: "completed", description: "Execute production workflow" },
        { id: 4, name: "Quality", status: "completed", description: "Perform quality inspections" },
        { id: 5, name: "Completion", status: "completed", description: "Finalize and deliver" }
      ],
      metrics: {
        efficiency: 92,
        quality: 96,
        onTimeDelivery: 100
      }
    }
  ])

  // Filter journeys based on search and filters
  const filteredJourneys = journeys.filter((journey) => {
    const matchesSearch = journey.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         journey.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         journey.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || journey.status === statusFilter
    const matchesType = typeFilter === "all" || journey.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  // Filter by active tab
  const getFilteredJourneysByTab = () => {
    switch (activeTab) {
      case "active":
        return filteredJourneys.filter(j => j.status === "Active")
      case "planning":
        return filteredJourneys.filter(j => j.status === "Planning")
      case "completed":
        return filteredJourneys.filter(j => j.status === "Completed")
      case "all":
        return filteredJourneys
      default:
        return filteredJourneys
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800"
      case "Planning": return "bg-blue-100 text-blue-800"
      case "Completed": return "bg-gray-100 text-gray-800"
      case "Paused": return "bg-yellow-100 text-yellow-800"
      case "Cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "text-red-600"
      case "High": return "text-orange-600"
      case "Medium": return "text-yellow-600"
      case "Low": return "text-green-600"
      default: return "text-gray-600"
    }
  }

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800"
      case "in-progress": return "bg-blue-100 text-blue-800"
      case "pending": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const handleStatusChange = (journeyId: string, newStatus: string) => {
    setJourneys(prev => prev.map(journey => 
      journey.id === journeyId 
        ? { ...journey, status: newStatus, lastUpdated: new Date().toISOString() }
        : journey
    ))
  }

  const handleDeleteJourney = (journeyId: string) => {
    if (confirm("Are you sure you want to delete this journey?")) {
      setJourneys(prev => prev.filter(journey => journey.id !== journeyId))
    }
  }

  const handleDuplicateJourney = (journey: any) => {
    const newJourney = {
      ...journey,
      id: `J${String(journeys.length + 1).padStart(3, '0')}`,
      name: `${journey.name} (Copy)`,
      status: "Planning",
      progress: 0,
      completedWorkOrders: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdBy: "Current User",
      lastUpdated: new Date().toISOString(),
      steps: journey.steps.map((step: any) => ({ ...step, status: "pending" }))
    }
    setJourneys(prev => [...prev, newJourney])
  }

  const handleSetupShopfloor = () => {
    router.push('/production/setup')
  }

  // Update existing journeys to reflect shopfloor status
  const updateJourneySteps = (journey: any) => {
    const isShopfloorConfigured = workstations.length > 0 && operators.length > 0
    const updatedSteps = journey.steps.map((step: any) => {
      if (step.name === "Setup") {
        return { ...step, status: isShopfloorConfigured ? "completed" : "pending" }
      }
      return step
    })
    return { ...journey, steps: updatedSteps }
  }

  const openEditDialog = (journey: any) => {
    setEditingJourney(journey)
    setFormData({
      name: journey.name || "",
      type: journey.type || "",
      description: journey.description || "",
      priority: journey.priority || "Medium",
      status: journey.status || "Planning",
      startDate: journey.startDate || "",
      endDate: journey.endDate || ""
    })
    setIsDialogOpen(true)
  }

  const openCreateDialog = () => {
    console.log("Opening create dialog...")
    setEditingJourney(null)
    setFormData({
      name: "",
      type: "",
      description: "",
      priority: "Medium",
      status: "Planning",
      startDate: "",
      endDate: ""
    })
    setIsDialogOpen(true)
    console.log("Dialog state set to true")
  }

  const handleCreateJourney = () => {
    if (!formData.name || !formData.type || !formData.description) {
      alert("Please fill in all required fields")
      return
    }

    // Check if shopfloor is configured
    const isShopfloorConfigured = workstations.length > 0 && operators.length > 0

    const newJourney = {
      id: `J${String(journeys.length + 1).padStart(3, '0')}`,
      name: formData.name,
      description: formData.description,
      type: formData.type,
      status: formData.status,
      priority: formData.priority,
      progress: 0,
      totalWorkOrders: 0,
      completedWorkOrders: 0,
      startDate: formData.startDate || new Date().toISOString().split('T')[0],
      endDate: formData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdBy: "Current User",
      lastUpdated: new Date().toISOString(),
      steps: [
        { id: 1, name: "Setup", status: isShopfloorConfigured ? "completed" : "pending", description: "Configure workstations and operators" },
        { id: 2, name: "Planning", status: "pending", description: "Create work orders and assign resources" },
        { id: 3, name: "Production", status: "pending", description: "Execute production workflow" },
        { id: 4, name: "Quality", status: "pending", description: "Perform quality inspections" },
        { id: 5, name: "Completion", status: "pending", description: "Finalize and deliver" }
      ],
      metrics: {
        efficiency: 0,
        quality: 0,
        onTimeDelivery: 0
      }
    }

    setJourneys(prev => [...prev, newJourney])
    
    // Close dialog
    setIsDialogOpen(false)
    setEditingJourney(null)
    
    alert("Journey created successfully!")
  }

  // Calculate statistics
  const totalJourneys = journeys.length
  const activeJourneys = journeys.filter(j => j.status === "Active").length
  const completedJourneys = journeys.filter(j => j.status === "Completed").length
  const avgProgress = journeys.length > 0 ? 
    Math.round(journeys.reduce((acc, j) => acc + j.progress, 0) / journeys.length) : 0

  console.log("Current dialog state:", isDialogOpen)
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Journey Management</h1>
          <p className="text-gray-600">Create, manage, and track production workflows</p>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2 text-sm">
              <Factory className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Workstations: {workstations.length}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Operators: {operators.length}</span>
            </div>
            {workstations.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-orange-600">
                <AlertTriangle className="w-4 h-4" />
                <span>Shopfloor not configured</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.reload()
            }
          }}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {workstations.length === 0 && (
            <Button variant="outline" onClick={handleSetupShopfloor}>
              <Wrench className="w-4 h-4 mr-2" />
              Setup Shopfloor
            </Button>
          )}
          <Button onClick={() => {
            const event = new CustomEvent('createJourney')
            window.dispatchEvent(event)
          }}>
            <Plus className="w-4 h-4 mr-2" />
            New Journey
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Journeys</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJourneys}</div>
            <p className="text-xs text-muted-foreground">
              {activeJourneys} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Journeys</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJourneys}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
            <div className="mt-2">
              <Progress value={totalJourneys > 0 ? (activeJourneys / totalJourneys) * 100 : 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedJourneys}</div>
            <p className="text-xs text-muted-foreground">
              Successfully finished
            </p>
            <div className="mt-2">
              <Progress value={totalJourneys > 0 ? (completedJourneys / totalJourneys) * 100 : 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProgress}%</div>
            <p className="text-xs text-muted-foreground">
              Across all journeys
            </p>
            <div className="mt-2">
              <Progress value={avgProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Tabs */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Journeys</CardTitle>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="planning">Planning</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search journeys..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type-filter">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Rush">Rush</SelectItem>
                  <SelectItem value="Quality">Quality</SelectItem>
                  <SelectItem value="Bulk">Bulk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setTypeFilter("all")
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Journeys Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredJourneysByTab().map((journey) => {
          const updatedJourney = updateJourneySteps(journey)
          return (
          <Card key={updatedJourney.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{updatedJourney.name}</CardTitle>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(updatedJourney.status)}>
                    {updatedJourney.status}
                  </Badge>
                  <Badge variant="outline" style={{color: getPriorityColor(updatedJourney.priority)}}>
                    {updatedJourney.priority}
                  </Badge>
                </div>
              </div>
              <CardDescription>{updatedJourney.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{updatedJourney.progress}%</span>
                </div>
                <Progress value={updatedJourney.progress} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Work Orders:</span>
                  <span className="ml-1 font-medium">{updatedJourney.totalWorkOrders}</span>
                </div>
                <div>
                  <span className="text-gray-500">Completed:</span>
                  <span className="ml-1 font-medium">{updatedJourney.completedWorkOrders}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-green-50 rounded-lg">
                  <div className="text-sm font-medium text-green-600">{updatedJourney.metrics.efficiency}%</div>
                  <div className="text-xs text-gray-500">Efficiency</div>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-600">{updatedJourney.metrics.quality}%</div>
                  <div className="text-xs text-gray-500">Quality</div>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <div className="text-sm font-medium text-purple-600">{updatedJourney.metrics.onTimeDelivery}%</div>
                  <div className="text-xs text-gray-500">On-Time</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Created by {updatedJourney.createdBy}</span>
                <span>{new Date(updatedJourney.lastUpdated).toLocaleDateString()}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setSelectedJourney(updatedJourney)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
                {updatedJourney.status === "Planning" && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 text-green-600 hover:text-green-700"
                    onClick={() => {
                      alert("Setup functionality will be implemented soon!")
                    }}
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Setup
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => openEditDialog(updatedJourney)}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDuplicateJourney(updatedJourney)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDeleteJourney(updatedJourney.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-1">
                {updatedJourney.status === "Active" && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleStatusChange(updatedJourney.id, "Paused")}
                    className="flex-1 text-yellow-600 hover:text-yellow-700"
                  >
                    <Pause className="w-3 h-3 mr-1" />
                    Pause
                  </Button>
                )}
                {updatedJourney.status === "Paused" && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleStatusChange(updatedJourney.id, "Active")}
                    className="flex-1 text-green-600 hover:text-green-700"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Resume
                  </Button>
                )}
                {updatedJourney.status === "Planning" && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleStatusChange(updatedJourney.id, "Active")}
                    className="flex-1 text-green-600 hover:text-green-700"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Start
                  </Button>
                )}
                {updatedJourney.status === "Active" && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleStatusChange(updatedJourney.id, "Completed")}
                    className="flex-1 text-blue-600 hover:text-blue-700"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Complete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          )
        })}
      </div>

      {getFilteredJourneysByTab().length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No journeys found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all" 
                ? "Try adjusting your filters to see more results."
                : "Get started by creating your first production journey."
              }
            </p>
            <Button onClick={() => {
              const event = new CustomEvent('createJourney')
              window.dispatchEvent(event)
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Journey
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Journey Detail Dialog */}
      <Dialog open={!!selectedJourney} onOpenChange={() => setSelectedJourney(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedJourney?.name}</DialogTitle>
            <DialogDescription>
              {selectedJourney?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedJourney && (
            <div className="space-y-6">
              {/* Journey Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusColor(selectedJourney.status)}>
                    {selectedJourney.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <p className="text-sm" style={{color: getPriorityColor(selectedJourney.priority)}}>
                    {selectedJourney.priority}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm">{selectedJourney.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Progress</Label>
                  <div className="flex items-center gap-2">
                    <Progress value={selectedJourney.progress} className="flex-1 h-2" />
                    <span className="text-sm">{selectedJourney.progress}%</span>
                  </div>
                </div>
              </div>

              {/* Journey Steps */}
              <div>
                <Label className="text-sm font-medium">Journey Steps</Label>
                <div className="space-y-2 mt-2">
                  {selectedJourney.steps.map((step: any) => (
                    <div key={step.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="p-1 bg-blue-100 rounded">
                        <Target className="w-3 h-3 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{step.name}</p>
                        <p className="text-xs text-gray-500">{step.description}</p>
                      </div>
                      <Badge className={getStepStatusColor(step.status)}>
                        {step.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metrics */}
              <div>
                <Label className="text-sm font-medium">Performance Metrics</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{selectedJourney.metrics.efficiency}%</div>
                    <div className="text-xs text-gray-500">Efficiency</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">{selectedJourney.metrics.quality}%</div>
                    <div className="text-xs text-gray-500">Quality</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">{selectedJourney.metrics.onTimeDelivery}%</div>
                    <div className="text-xs text-gray-500">On-Time Delivery</div>
                  </div>
                </div>
              </div>

              {/* Work Orders */}
              <div>
                <Label className="text-sm font-medium">Work Orders</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold">{selectedJourney.totalWorkOrders}</div>
                    <div className="text-xs text-gray-500">Total Work Orders</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold">{selectedJourney.completedWorkOrders}</div>
                    <div className="text-xs text-gray-500">Completed</div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <Label className="text-sm font-medium">Timeline</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="text-sm font-medium">{selectedJourney.startDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="text-sm font-medium">{selectedJourney.endDate}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Journey Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        console.log("Dialog onOpenChange called with:", open)
        setIsDialogOpen(open)
        if (!open) setEditingJourney(null)
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingJourney ? "Edit Journey" : "Create New Journey"}
            </DialogTitle>
            <DialogDescription>
              {editingJourney ? "Update journey configuration" : "Set up a new production workflow"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Journey name"
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Rush">Rush</SelectItem>
                  <SelectItem value="Quality">Quality</SelectItem>
                  <SelectItem value="Bulk">Bulk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Journey description"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => {
                setIsDialogOpen(false)
                setEditingJourney(null)
              }}>
                Cancel
              </Button>
              <Button onClick={handleCreateJourney}>
                {editingJourney ? "Update" : "Create"} Journey
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
