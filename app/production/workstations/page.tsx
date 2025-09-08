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
import { 
  Wrench, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Settings, 
  MapPin, 
  User, 
  FileText, 
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  RefreshCw,
  Play,
  Pause,
  Square
} from "lucide-react"
import { useDatabaseContext } from "@/components/database-provider"

export default function WorkstationManagement() {
  const { 
    workstations = [], 
    operators = [], 
    productionWorkOrders: workOrders = [],
    createWorkstation,
    updateWorkstation,
    deleteWorkstation,
    refreshWorkstations
  } = useDatabaseContext()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedWorkstation, setSelectedWorkstation] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingWorkstation, setEditingWorkstation] = useState<any>(null)

  // Filter workstations based on search and filters
  const filteredWorkstations = workstations.filter((workstation: any) => {
    const matchesSearch = workstation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workstation.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workstation.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || workstation.status === statusFilter
    const matchesType = typeFilter === "all" || workstation.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800"
      case "Idle": return "bg-gray-100 text-gray-800"
      case "Maintenance": return "bg-orange-100 text-orange-800"
      case "Offline": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return "text-green-600"
    if (efficiency >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const handleStatusChange = async (workstationId: string, newStatus: string) => {
    try {
      const workstation = workstations.find((ws: any) => ws.id === workstationId)
      if (!workstation) return

      await updateWorkstation(workstationId, {
        ...workstation,
        status: newStatus as "Active" | "Maintenance" | "Idle" | "Offline"
      })
      
      refreshWorkstations()
    } catch (error) {
      console.error("Error updating workstation status:", error)
    }
  }

  const handleDeleteWorkstation = async (workstationId: string) => {
    if (confirm("Are you sure you want to delete this workstation?")) {
      try {
        await deleteWorkstation(workstationId)
        refreshWorkstations()
      } catch (error) {
        console.error("Error deleting workstation:", error)
      }
    }
  }

  const openEditDialog = (workstation: any) => {
    setEditingWorkstation(workstation)
    setIsEditDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingWorkstation(null)
    setIsCreateDialogOpen(true)
  }

  const handleCreateWorkstation = async () => {
    // Get form data from the dialog
    const name = (document.getElementById('name') as HTMLInputElement)?.value
    const type = (document.getElementById('type') as HTMLSelectElement)?.value
    const location = (document.getElementById('location') as HTMLInputElement)?.value
    const capacity = (document.getElementById('capacity') as HTMLInputElement)?.value
    const status = (document.getElementById('status') as HTMLSelectElement)?.value

    if (!name || !type || !location || !capacity) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const newWorkstation = {
        name,
        type: type as "Cutting" | "Welding" | "Assembly" | "Quality Control" | "Packaging",
        location,
        status: status as "Active" | "Idle" | "Maintenance" | "Offline",
        currentOperator: undefined,
        currentWorkOrder: undefined,
        efficiency: 85,
        lastMaintenance: new Date().toISOString().split('T')[0],
        nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        capacity: parseInt(capacity),
        utilization: 0
      }

      await createWorkstation(newWorkstation)
      await refreshWorkstations()
      
      // Close dialog
      setIsCreateDialogOpen(false)
      setIsEditDialogOpen(false)
      setEditingWorkstation(null)
      
      alert("Workstation created successfully!")
    } catch (error) {
      console.error("Error creating workstation:", error)
      alert("Failed to create workstation. Please try again.")
    }
  }

  // Calculate statistics
  const totalWorkstations = workstations.length
  const activeWorkstations = workstations.filter((ws: any) => ws.status === "Active").length
  const avgEfficiency = workstations.length > 0 ? 
    Math.round(workstations.reduce((acc: number, ws: any) => acc + ws.efficiency, 0) / workstations.length) : 0
  const avgUtilization = workstations.length > 0 ? 
    Math.round(workstations.reduce((acc: number, ws: any) => acc + ws.utilization, 0) / workstations.length) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workstation Management</h1>
          <p className="text-gray-600">Configure and monitor production workstations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refreshWorkstations()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Workstation
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workstations</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkstations}</div>
            <p className="text-xs text-muted-foreground">
              {activeWorkstations} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workstations</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeWorkstations}</div>
            <p className="text-xs text-muted-foreground">
              {totalWorkstations > 0 ? Math.round((activeWorkstations / totalWorkstations) * 100) : 0}% utilization
            </p>
            <div className="mt-2">
              <Progress value={totalWorkstations > 0 ? (activeWorkstations / totalWorkstations) * 100 : 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEfficiency}%</div>
            <p className="text-xs text-muted-foreground">
              Across all workstations
            </p>
            <div className="mt-2">
              <Progress value={avgEfficiency} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Utilization</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgUtilization}%</div>
            <p className="text-xs text-muted-foreground">
              Resource utilization
            </p>
            <div className="mt-2">
              <Progress value={avgUtilization} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search workstations..."
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
                  <SelectItem value="Idle">Idle</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Offline">Offline</SelectItem>
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
                  <SelectItem value="Cutting">Cutting</SelectItem>
                  <SelectItem value="Welding">Welding</SelectItem>
                  <SelectItem value="Assembly">Assembly</SelectItem>
                  <SelectItem value="Quality Control">Quality Control</SelectItem>
                  <SelectItem value="Packaging">Packaging</SelectItem>
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

      {/* Workstations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkstations.map((workstation: any) => {
          const operator = operators.find((op: any) => op.id === workstation.currentOperator)
          const workOrder = workOrders.find((wo: any) => wo.id === workstation.currentWorkOrder)
          
          return (
            <Card key={workstation.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{workstation.name}</CardTitle>
                  <Badge className={getStatusColor(workstation.status)}>
                    {workstation.status}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {workstation.location}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <span className="ml-1 font-medium">{workstation.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Capacity:</span>
                    <span className="ml-1 font-medium">{workstation.capacity}/hr</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Efficiency</span>
                    <span className={getEfficiencyColor(workstation.efficiency)}>
                      {workstation.efficiency}%
                    </span>
                  </div>
                  <Progress value={workstation.efficiency} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Utilization</span>
                    <span>{workstation.utilization}%</span>
                  </div>
                  <Progress value={workstation.utilization} className="h-2" />
                </div>

                {operator && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                    <User className="w-4 h-4 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{operator.name}</p>
                      <p className="text-xs text-gray-500">{operator.position}</p>
                    </div>
                  </div>
                )}

                {workOrder && (
                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                    <FileText className="w-4 h-4 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{workOrder.productName}</p>
                      <p className="text-xs text-gray-500">WO: {workOrder.id}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setSelectedWorkstation(workstation)}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => openEditDialog(workstation)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeleteWorkstation(workstation.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                {/* Quick Status Actions */}
                <div className="flex gap-1">
                  {workstation.status === "Active" && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleStatusChange(workstation.id, "Idle")}
                      className="flex-1 text-yellow-600 hover:text-yellow-700"
                    >
                      <Pause className="w-3 h-3 mr-1" />
                      Pause
                    </Button>
                  )}
                  {workstation.status === "Idle" && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleStatusChange(workstation.id, "Active")}
                      className="flex-1 text-green-600 hover:text-green-700"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Start
                    </Button>
                  )}
                  {workstation.status === "Maintenance" && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleStatusChange(workstation.id, "Active")}
                      className="flex-1 text-green-600 hover:text-green-700"
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

      {filteredWorkstations.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Wrench className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No workstations found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all" 
                ? "Try adjusting your filters to see more results."
                : "Get started by adding your first workstation."
              }
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Workstation
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Workstation Detail Dialog */}
      <Dialog open={!!selectedWorkstation} onOpenChange={() => setSelectedWorkstation(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedWorkstation?.name}</DialogTitle>
            <DialogDescription>
              Detailed information about this workstation
            </DialogDescription>
          </DialogHeader>
          {selectedWorkstation && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusColor(selectedWorkstation.status)}>
                    {selectedWorkstation.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm">{selectedWorkstation.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <p className="text-sm">{selectedWorkstation.location}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Capacity</Label>
                  <p className="text-sm">{selectedWorkstation.capacity} units/hour</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Efficiency</span>
                    <span className={getEfficiencyColor(selectedWorkstation.efficiency)}>
                      {selectedWorkstation.efficiency}%
                    </span>
                  </div>
                  <Progress value={selectedWorkstation.efficiency} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Utilization</span>
                    <span>{selectedWorkstation.utilization}%</span>
                  </div>
                  <Progress value={selectedWorkstation.utilization} className="h-2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Last Maintenance</Label>
                  <p className="text-sm">{selectedWorkstation.lastMaintenance}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Next Maintenance</Label>
                  <p className="text-sm">{selectedWorkstation.nextMaintenance}</p>
                </div>
              </div>

              {selectedWorkstation.currentOperator && (
                <div>
                  <Label className="text-sm font-medium">Current Operator</Label>
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg mt-1">
                    <User className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">
                        {operators.find((op: any) => op.id === selectedWorkstation.currentOperator)?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {operators.find((op: any) => op.id === selectedWorkstation.currentOperator)?.position}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedWorkstation.currentWorkOrder && (
                <div>
                  <Label className="text-sm font-medium">Current Work Order</Label>
                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg mt-1">
                    <FileText className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">
                        {workOrders.find((wo: any) => wo.id === selectedWorkstation.currentWorkOrder)?.productName}
                      </p>
                      <p className="text-xs text-gray-500">
                        WO: {selectedWorkstation.currentWorkOrder}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Workstation Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        setIsCreateDialogOpen(open)
        setIsEditDialogOpen(open)
        if (!open) setEditingWorkstation(null)
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingWorkstation ? "Edit Workstation" : "Add New Workstation"}
            </DialogTitle>
            <DialogDescription>
              {editingWorkstation ? "Update workstation information" : "Configure a new production workstation"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  defaultValue={editingWorkstation?.name || ""}
                  placeholder="Workstation name"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select defaultValue={editingWorkstation?.type || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cutting">Cutting</SelectItem>
                    <SelectItem value="Welding">Welding</SelectItem>
                    <SelectItem value="Assembly">Assembly</SelectItem>
                    <SelectItem value="Quality Control">Quality Control</SelectItem>
                    <SelectItem value="Packaging">Packaging</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                defaultValue={editingWorkstation?.location || ""}
                placeholder="Shop Floor A - Bay 1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity">Capacity (units/hour)</Label>
                <Input 
                  id="capacity" 
                  type="number"
                  defaultValue={editingWorkstation?.capacity || ""}
                  placeholder="10"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select defaultValue={editingWorkstation?.status || "Idle"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Idle">Idle</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => {
                setIsCreateDialogOpen(false)
                setIsEditDialogOpen(false)
                setEditingWorkstation(null)
              }}>
                Cancel
              </Button>
              <Button onClick={handleCreateWorkstation}>
                {editingWorkstation ? "Update" : "Create"} Workstation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
