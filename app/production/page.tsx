"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, Dialog, } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Plus, Search, Eye, Edit, Factory, Clock, Users, AlertTriangle } from 'lucide-react'
import Link from "next/link"

import { useDatabaseContext } from "@/components/database-provider"

export default function ProductionPage() {
  const { useProductionWorkOrders } = useDatabaseContext()
  const { workOrders } = useProductionWorkOrders()

  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800"
      case "In Progress": return "bg-blue-100 text-blue-800"
      case "Planning": return "bg-yellow-100 text-yellow-800"
      case "On Hold": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "text-red-600"
      case "Medium": return "text-yellow-600"
      case "Low": return "text-green-600"
      default: return "text-gray-600"
    }
  }

  const getOperationStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800"
      case "In Progress": return "bg-blue-100 text-blue-800"
      case "Pending": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const handleViewDetails = (workOrder) => {
    setSelectedWorkOrder(workOrder)
    setIsDetailDialogOpen(true)
  }

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
              <p className="text-sm text-gray-600">Work orders and production scheduling</p>
            </div>
            <Link href="/production/create">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Work Order
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input placeholder="Search work orders..." className="pl-10" />
                </div>
              </div>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  <SelectItem value="team-a">Team A</SelectItem>
                  <SelectItem value="team-b">Team B</SelectItem>
                  <SelectItem value="team-c">Team C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Work Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Work Orders</CardTitle>
            <CardDescription>
              Production jobs and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Work Order</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.project}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        {order.assignedTeam}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-2 ${getPriorityColor(order.priority)}`}>
                        {order.priority === "High" && <AlertTriangle className="w-4 h-4" />}
                        {order.priority === "Medium" && <Clock className="w-4 h-4" />}
                        {order.priority}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Progress value={order.progress} className="w-20" />
                        <span className="text-xs text-gray-500">{order.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.dueDate}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/production/${order.id}`}>
                          <Button variant="ghost" size="sm" title="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/production/${order.id}/edit`}>
                          <Button variant="ghost" size="sm" title="Edit Work Order">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Work Order Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Work Order Details - {selectedWorkOrder?.id}</DialogTitle>
              <DialogDescription>
                Production details and operation status for {selectedWorkOrder?.project}
              </DialogDescription>
            </DialogHeader>
            {selectedWorkOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Project</Label>
                    <p>{selectedWorkOrder.project}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Customer</Label>
                    <p>{selectedWorkOrder.customer}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Supervisor</Label>
                    <p>{selectedWorkOrder.supervisor}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Progress</Label>
                    <div className="flex items-center gap-2">
                      <Progress value={selectedWorkOrder.progress} className="w-16" />
                      <span className="text-sm font-medium">{selectedWorkOrder.progress}%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Production Operations</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Operation Step</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Progress</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedWorkOrder.operations.map((operation, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{operation.step}</TableCell>
                          <TableCell>
                            <Badge className={getOperationStatusColor(operation.status)}>
                              {operation.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{operation.duration}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Factory className="w-4 h-4 text-gray-500" />
                              {operation.status === "Completed" ? "100%" : 
                               operation.status === "In Progress" ? "50%" : "0%"}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
