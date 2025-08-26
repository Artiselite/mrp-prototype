"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from 'lucide-react'
import Link from "next/link"
import { useRouter } from "next/navigation"

import { useDatabaseContext } from "@/components/database-provider"

export default function CreateEngineeringProjectPage() {
  const router = useRouter()
  const { useEngineeringProjects, useCustomers } = useDatabaseContext()
  const { createProject } = useEngineeringProjects()
  const { customers } = useCustomers()

  const [formData, setFormData] = useState({
    projectNumber: "",
    customerId: "",
    title: "",
    description: "",
    projectType: "Custom Design" as const,
    priority: "Medium" as const,
    estimatedHours: 0,
    estimatedCost: 0,
    startDate: "",
    dueDate: "",
    assignedEngineer: "",
    projectManager: "",
    customerRequirements: "",
    technicalSpecifications: "",
    constraints: [] as string[],
    risks: [] as string[],
    deliverables: [] as string[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const selectedCustomer = customers.find(c => c.id === formData.customerId)
      if (!selectedCustomer) {
        throw new Error("Customer not found")
      }

      const newProject = await createProject({
        ...formData,
        customerName: selectedCustomer.name,
        status: "Draft",
        actualHours: 0,
        actualCost: 0,
        revision: "Rev A",
      })
      
      router.push(`/engineering/${newProject.id}`)
    } catch (error) {
      console.error("Failed to create project:", error)
    }
  }



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <Link href="/engineering" className="text-sm text-blue-600 hover:text-blue-800 mb-2 block">
                <ArrowLeft className="w-4 h-4 inline mr-1" />
                Back to Engineering
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Create Project</h1>
              <p className="text-sm text-gray-600">Set up a new project</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Project identification and customer details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="projectNumber">Project Number</Label>
                  <Input
                    id="projectNumber"
                    value={formData.projectNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectNumber: e.target.value }))}
                    placeholder="PROJECT-2024-XXX"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerId">Customer</Label>
                  <Select value={formData.customerId} onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter project title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the custom product or solution to be engineered"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Requirements and specifications for the project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customerRequirements">Customer Requirements</Label>
                <Textarea
                  id="customerRequirements"
                  value={formData.customerRequirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerRequirements: e.target.value }))}
                  placeholder="Document customer requirements and functional specifications"
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="technicalSpecifications">Technical Specifications</Label>
                <Textarea
                  id="technicalSpecifications"
                  value={formData.technicalSpecifications}
                  onChange={(e) => setFormData(prev => ({ ...prev, technicalSpecifications: e.target.value }))}
                  placeholder="Technical specifications and design requirements"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assignedEngineer">Assigned Engineer</Label>
                  <Input
                    id="assignedEngineer"
                    value={formData.assignedEngineer}
                    onChange={(e) => setFormData(prev => ({ ...prev, assignedEngineer: e.target.value }))}
                    placeholder="Engineer name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="projectManager">Project Manager</Label>
                  <Input
                    id="projectManager"
                    value={formData.projectManager}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectManager: e.target.value }))}
                    placeholder="Manager name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="estimatedCost">Estimated Cost ($)</Label>
                  <Input
                    id="estimatedCost"
                    type="number"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedCost: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>



          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link href="/engineering">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Create Project
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
