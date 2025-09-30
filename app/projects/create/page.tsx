"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Calendar, 
  User, 
  Clock, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  FileText,
  Wrench,
  Settings,
  Target,
  Shield,
  Zap,
  Building2,
  Users,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Upload,
  Download,
  Eye,
  Edit
} from "lucide-react"
import Link from "next/link"
import { useDatabaseContext } from "@/components/database-provider"
import type { EngineeringProject, Customer, Supplier } from "@/lib/types"
import { dataIntegrationService } from "@/lib/services/data-integration"

export default function CreateProjectPage() {
  const { 
    customers = [], 
    suppliers = [],
    createEngineeringProject,
    isInitialized 
  } = useDatabaseContext()

  const [formData, setFormData] = useState({
    // Basic Information
    projectNumber: "",
    customerId: "",
    customerName: "",
    title: "",
    description: "",
    
    // Project Details
    status: "Draft" as const,
    priority: "Medium" as const,
    projectType: "Custom Design" as const,
    
    // Timeline & Resources
    estimatedHours: 0,
    estimatedCost: 0,
    startDate: "",
    dueDate: "",
    assignedEngineer: "",
    projectManager: "",
    
    // Requirements & Specifications
    customerRequirements: "",
    technicalSpecifications: "",
    constraints: [] as string[],
    risks: [] as string[],
    deliverables: [] as string[],
    
    // Additional
    notes: "",
    revision: "1.0"
  })

  const [constraintInput, setConstraintInput] = useState("")
  const [riskInput, setRiskInput] = useState("")
  const [deliverableInput, setDeliverableInput] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [projectComplexity, setProjectComplexity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium')
  const [estimatedDuration, setEstimatedDuration] = useState(0)

  // Calculate project complexity based on various factors
  const calculateProjectComplexity = () => {
    let score = 0
    
    // Project type complexity
    switch (formData.projectType) {
      case 'Prototype': score += 3; break
      case 'Custom Design': score += 2; break
      case 'Modification': score += 1; break
      case 'Standard Product': score += 0; break
    }
    
    // Priority impact
    switch (formData.priority) {
      case 'Critical': score += 2; break
      case 'High': score += 1; break
      case 'Medium': score += 0; break
      case 'Low': score -= 1; break
    }
    
    // Requirements complexity
    if (formData.customerRequirements.length > 500) score += 1
    if (formData.technicalSpecifications.length > 500) score += 1
    if (formData.constraints.length > 3) score += 1
    if (formData.risks.length > 2) score += 1
    
    // Estimated hours impact
    if (formData.estimatedHours > 200) score += 2
    else if (formData.estimatedHours > 100) score += 1
    
    if (score <= 2) return 'Low'
    if (score <= 4) return 'Medium'
    if (score <= 6) return 'High'
    return 'Critical'
  }

  // Calculate estimated duration based on complexity and hours
  const calculateEstimatedDuration = () => {
    const baseDays = Math.ceil(formData.estimatedHours / 8) // 8 hours per day
    const complexityMultiplier = {
      'Low': 1.0,
      'Medium': 1.2,
      'High': 1.5,
      'Critical': 2.0
    }
    
    return Math.ceil(baseDays * complexityMultiplier[projectComplexity])
  }

  // Auto-generate project number
  const generateProjectNumber = () => {
    const timestamp = Date.now().toString().slice(-6)
    const prefix = formData.projectType === 'Prototype' ? 'PROT' : 
                  formData.projectType === 'Custom Design' ? 'CUST' :
                  formData.projectType === 'Modification' ? 'MOD' : 'STD'
    return `${prefix}-${timestamp}`
  }

  // Handle customer selection
  const handleCustomerSelection = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId)
    if (customer) {
      setSelectedCustomer(customer)
      setFormData(prev => ({
        ...prev,
        customerId: customer.id,
        customerName: customer.name
      }))
    }
  }

  // Add constraint
  const addConstraint = () => {
    if (constraintInput.trim()) {
      setFormData(prev => ({
        ...prev,
        constraints: [...prev.constraints, constraintInput.trim()]
      }))
      setConstraintInput("")
    }
  }

  // Remove constraint
  const removeConstraint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      constraints: prev.constraints.filter((_, i) => i !== index)
    }))
  }

  // Add risk
  const addRisk = () => {
    if (riskInput.trim()) {
      setFormData(prev => ({
        ...prev,
        risks: [...prev.risks, riskInput.trim()]
      }))
      setRiskInput("")
    }
  }

  // Remove risk
  const removeRisk = (index: number) => {
    setFormData(prev => ({
      ...prev,
      risks: prev.risks.filter((_, i) => i !== index)
    }))
  }

  // Add deliverable
  const addDeliverable = () => {
    if (deliverableInput.trim()) {
      setFormData(prev => ({
        ...prev,
        deliverables: [...prev.deliverables, deliverableInput.trim()]
      }))
      setDeliverableInput("")
    }
  }

  // Remove deliverable
  const removeDeliverable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index)
    }))
  }

  // Update form data
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Validation
  const validateProject = () => {
    const errors: string[] = []
    
    if (!formData.customerId) errors.push('Customer selection is required')
    if (!formData.title.trim()) errors.push('Project title is required')
    if (!formData.description.trim()) errors.push('Project description is required')
    if (!formData.startDate) errors.push('Start date is required')
    if (!formData.dueDate) errors.push('Due date is required')
    if (formData.estimatedHours <= 0) errors.push('Estimated hours must be greater than 0')
    if (!formData.assignedEngineer) errors.push('Assigned engineer is required')
    if (!formData.projectManager) errors.push('Project manager is required')
    
    return errors
  }

  // Save project
  const handleSave = async (action: "draft" | "create") => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      const errors = validateProject()
      if (errors.length > 0) {
        setSaveMessage({ type: 'error', message: `Validation failed: ${errors.join(', ')}` })
        setIsSaving(false)
        return
      }

      // Generate project number if not set
      if (!formData.projectNumber) {
        formData.projectNumber = generateProjectNumber()
      }

      // Calculate complexity and duration
      const complexity = calculateProjectComplexity()
      const duration = calculateEstimatedDuration()

      const projectData: Omit<EngineeringProject, 'id' | 'createdAt' | 'updatedAt'> = {
        ...formData,
        status: action === 'draft' ? 'Draft' : 'Under Review',
        estimatedCost: formData.estimatedCost || formData.estimatedHours * 600, // Default RM600/hour
        actualHours: 0,
        actualCost: 0,
        completionDate: undefined
      }

      const savedProject = createEngineeringProject(projectData)

      if (savedProject) {
        setSaveMessage({ 
          type: 'success', 
          message: `Project ${action === 'draft' ? 'saved as draft' : 'created'} successfully!` 
        })
        
        // Auto-hide success message
        setTimeout(() => setSaveMessage(null), 3000)
      } else {
        setSaveMessage({ type: 'error', message: 'Failed to save project. Please try again.' })
      }
    } catch (error) {
      console.error('Error saving project:', error)
      setSaveMessage({ type: 'error', message: 'An error occurred while saving. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  // Update complexity when form data changes
  useEffect(() => {
    setProjectComplexity(calculateProjectComplexity())
    setEstimatedDuration(calculateEstimatedDuration())
  }, [formData.projectType, formData.priority, formData.estimatedHours, formData.customerRequirements, formData.technicalSpecifications, formData.constraints.length, formData.risks.length])

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/projects">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Projects
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
                <p className="text-sm text-gray-600">Set up a new engineering project</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleSave("draft")} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save as Draft"}
              </Button>
              <Button onClick={() => handleSave("create")} disabled={isSaving}>
                <Plus className="w-4 h-4 mr-2" />
                {isSaving ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Message */}
        {saveMessage && (
          <div className={`mb-6 p-4 rounded-md ${saveMessage.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
            <div className="flex items-center">
              {saveMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertTriangle className="w-5 h-5 mr-2" />
              )}
              {saveMessage.message}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Form - Left Side */}
          <div className="lg:col-span-3 space-y-6">
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="details">Project Details</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Essential project details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="projectNumber">Project Number</Label>
                        <Input
                          id="projectNumber"
                          placeholder="Auto-generated"
                          value={formData.projectNumber}
                          onChange={(e) => handleInputChange("projectNumber", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customer">Customer *</Label>
                        <Select value={formData.customerId} onValueChange={handleCustomerSelection}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select customer..." />
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
                    
                    <div className="space-y-2">
                      <Label htmlFor="title">Project Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Industrial Warehouse Frame Design"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Project Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Detailed description of the project..."
                        rows={4}
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Information */}
                {selectedCustomer && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        Customer Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium">{selectedCustomer.name}</p>
                          <p className="text-sm text-gray-600">{selectedCustomer.contactPerson}</p>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {selectedCustomer.email}
                          </p>
                          <p className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {selectedCustomer.phone}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Project Details Tab */}
              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                    <CardDescription>Project classification and timeline</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="projectType">Project Type</Label>
                        <Select value={formData.projectType} onValueChange={(value) => handleInputChange("projectType", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Custom Design">Custom Design</SelectItem>
                            <SelectItem value="Modification">Modification</SelectItem>
                            <SelectItem value="Standard Product">Standard Product</SelectItem>
                            <SelectItem value="Prototype">Prototype</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange("startDate", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dueDate">Due Date *</Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => handleInputChange("dueDate", e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Project Complexity Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Project Complexity Analysis
                    </CardTitle>
                    <CardDescription>Automated complexity assessment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Complexity Level</p>
                        <Badge className={`mt-2 ${
                          projectComplexity === 'Low' ? 'bg-green-100 text-green-800' :
                          projectComplexity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          projectComplexity === 'High' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {projectComplexity}
                        </Badge>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Estimated Duration</p>
                        <p className="text-lg font-bold">{estimatedDuration} days</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Estimated Hours</p>
                        <p className="text-lg font-bold">{formData.estimatedHours}h</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Requirements Tab */}
              <TabsContent value="requirements" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Requirements</CardTitle>
                    <CardDescription>Detailed project requirements and specifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerRequirements">Customer Requirements</Label>
                      <Textarea
                        id="customerRequirements"
                        placeholder="Detailed customer requirements and expectations..."
                        rows={4}
                        value={formData.customerRequirements}
                        onChange={(e) => handleInputChange("customerRequirements", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="technicalSpecifications">Technical Specifications</Label>
                      <Textarea
                        id="technicalSpecifications"
                        placeholder="Technical specifications, standards, and constraints..."
                        rows={4}
                        value={formData.technicalSpecifications}
                        onChange={(e) => handleInputChange("technicalSpecifications", e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Constraints */}
                <Card>
                  <CardHeader>
                    <CardTitle>Project Constraints</CardTitle>
                    <CardDescription>Limitations and constraints that may affect the project</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add constraint..."
                        value={constraintInput}
                        onChange={(e) => setConstraintInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addConstraint()}
                      />
                      <Button onClick={addConstraint} variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.constraints.map((constraint, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{constraint}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeConstraint(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Risks */}
                <Card>
                  <CardHeader>
                    <CardTitle>Project Risks</CardTitle>
                    <CardDescription>Potential risks and mitigation strategies</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add risk..."
                        value={riskInput}
                        onChange={(e) => setRiskInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addRisk()}
                      />
                      <Button onClick={addRisk} variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.risks.map((risk, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                          <span className="text-sm">{risk}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRisk(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Deliverables */}
                <Card>
                  <CardHeader>
                    <CardTitle>Project Deliverables</CardTitle>
                    <CardDescription>Expected project outputs and deliverables</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add deliverable..."
                        value={deliverableInput}
                        onChange={(e) => setDeliverableInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addDeliverable()}
                      />
                      <Button onClick={addDeliverable} variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.deliverables.map((deliverable, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <span className="text-sm">{deliverable}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDeliverable(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Resources Tab */}
              <TabsContent value="resources" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Resource Allocation</CardTitle>
                    <CardDescription>Assign team members and estimate resources</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="assignedEngineer">Assigned Engineer *</Label>
                        <Select value={formData.assignedEngineer} onValueChange={(value) => handleInputChange("assignedEngineer", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select engineer..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="jane-engineer">Jane Engineer</SelectItem>
                            <SelectItem value="john-smith">John Smith</SelectItem>
                            <SelectItem value="mike-design">Mike Design</SelectItem>
                            <SelectItem value="sarah-cad">Sarah CAD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="projectManager">Project Manager *</Label>
                        <Select value={formData.projectManager} onValueChange={(value) => handleInputChange("projectManager", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select manager..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="alice-manager">Alice Manager</SelectItem>
                            <SelectItem value="bob-lead">Bob Lead</SelectItem>
                            <SelectItem value="carol-director">Carol Director</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="estimatedHours">Estimated Hours *</Label>
                        <Input
                          id="estimatedHours"
                          type="number"
                          placeholder="40"
                          value={formData.estimatedHours}
                          onChange={(e) => handleInputChange("estimatedHours", parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estimatedCost">Estimated Cost ($)</Label>
                        <Input
                          id="estimatedCost"
                          type="number"
                          placeholder="5000"
                          value={formData.estimatedCost}
                          onChange={(e) => handleInputChange("estimatedCost", parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Resource Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Resource Summary</CardTitle>
                    <CardDescription>Project resource overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                        <p className="text-sm text-gray-600">Estimated Hours</p>
                        <p className="text-xl font-bold">{formData.estimatedHours}h</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
                        <p className="text-sm text-gray-600">Estimated Cost</p>
                        <p className="text-xl font-bold">${formData.estimatedCost.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="text-xl font-bold">{estimatedDuration} days</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Settings</CardTitle>
                    <CardDescription>Additional project configuration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="revision">Revision</Label>
                      <Input
                        id="revision"
                        placeholder="1.0"
                        value={formData.revision}
                        onChange={(e) => handleInputChange("revision", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any additional notes or comments..."
                        rows={4}
                        value={formData.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Project Summary - Right Side */}
          <div className="lg:col-span-1 space-y-6">
            {/* Project Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{formData.status}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={
                    formData.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                    formData.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                    formData.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }>
                    {formData.priority} Priority
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{formData.projectType}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Validation Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Validation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${formData.customerId ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span>Customer {formData.customerId ? 'selected' : 'required'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${formData.title ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span>Title {formData.title ? 'entered' : 'required'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${formData.description ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span>Description {formData.description ? 'entered' : 'required'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${formData.assignedEngineer ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span>Engineer {formData.assignedEngineer ? 'assigned' : 'required'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${formData.projectManager ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span>Manager {formData.projectManager ? 'assigned' : 'required'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Project Charter
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Wrench className="w-4 h-4 mr-2" />
                  Create Work Breakdown
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Set Milestones
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Assign Team
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
