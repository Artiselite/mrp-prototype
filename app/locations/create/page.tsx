"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useDatabaseContext } from "@/components/database-provider"

interface LocationFormData {
  code: string
  name: string
  type: "Warehouse" | "Rack" | "Bin" | "Office" | "Outdoor" | "Specialized"
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  contactPerson: string
  phone: string
  email: string
  capacity: number
  temperature: string
  humidity: string
  securityLevel: "Low" | "Medium" | "High" | "Restricted"
  status: "Active" | "Inactive" | "Maintenance" | "Closed"
  notes?: string
}

interface FormErrors {
  code?: string
  name?: string
  type?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  contactPerson?: string
  phone?: string
  email?: string
  capacity?: string
  temperature?: string
  humidity?: string
  securityLevel?: string
  status?: string
  notes?: string
}

export default function CreateLocationPage() {
  const router = useRouter()
  const { createLocation } = useDatabaseContext()
  const [formData, setFormData] = useState<LocationFormData>({
    code: "",
    name: "",
    type: "Warehouse",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "USA",
    contactPerson: "",
    phone: "",
    email: "",
    capacity: 0,
    temperature: "Ambient",
    humidity: "Standard",
    securityLevel: "Medium",
    status: "Active",
    notes: ""
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const handleInputChange = (field: keyof LocationFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage("")
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.code.trim()) {
      newErrors.code = "Location code is required"
    }
    if (!formData.name.trim()) {
      newErrors.name = "Location name is required"
    }
    if (!formData.type) {
      newErrors.type = "Location type is required"
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required"
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required"
    }
    if (!formData.state.trim()) {
      newErrors.state = "State is required"
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "ZIP code is required"
    }
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = "Contact person is required"
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    if (formData.capacity <= 0) {
      newErrors.capacity = "Capacity must be a positive number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Create the location using the database context
      const newLocation = await createLocation({
        code: formData.code,
        name: formData.name,
        type: formData.type,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        email: formData.email,
        capacity: formData.capacity,
        currentUtilization: 0, // New locations start with 0 utilization
        temperature: formData.temperature,
        humidity: formData.humidity,
        securityLevel: formData.securityLevel,
        status: formData.status,
        items: 0, // New locations start with 0 items
        value: 0, // New locations start with 0 value
        notes: formData.notes || undefined
      })

      console.log("Location created successfully:", newLocation)
      setSuccessMessage("Location created successfully! Redirecting...")

      // Redirect to locations list after a short delay
      setTimeout(() => {
        router.push("/locations")
      }, 1500)
    } catch (error) {
      console.error("Error creating location:", error)
      setErrorMessage("Failed to create location. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <Link href="/locations" className="text-sm text-blue-600 hover:text-blue-800 mb-2 block">
                ← Back to Locations
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Create New Location</h1>
              <p className="text-sm text-gray-600">Add a new warehouse, storage area, or location</p>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">{successMessage}</p>
            </div>
          )}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{errorMessage}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Location Code *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => handleInputChange("code", e.target.value)}
                      className={errors.code ? "border-red-500" : ""}
                      placeholder="e.g., WH-A-01, RACK-01"
                    />
                    {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                  </div>
                  <div>
                    <Label htmlFor="name">Location Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={errors.name ? "border-red-500" : ""}
                      placeholder="e.g., Warehouse A - Main Storage"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Location Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                      <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select location type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Warehouse">Warehouse</SelectItem>
                        <SelectItem value="Rack">Rack</SelectItem>
                        <SelectItem value="Bin">Bin</SelectItem>
                        <SelectItem value="Office">Office</SelectItem>
                        <SelectItem value="Outdoor">Outdoor</SelectItem>
                        <SelectItem value="Specialized">Specialized</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
                  </div>
                  <div>
                    <Label htmlFor="capacity">Capacity *</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => handleInputChange("capacity", parseInt(e.target.value) || 0)}
                      className={errors.capacity ? "border-red-500" : ""}
                      placeholder="e.g., 50000"
                    />
                    {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>}
                  </div>
                  <div>
                    <Label htmlFor="currentUtilization">Current Utilization</Label>
                    <Input
                      id="currentUtilization"
                      type="number"
                      value="0"
                      disabled
                      className="bg-gray-100"
                      placeholder="0 (new locations start empty)"
                    />
                    <p className="text-xs text-gray-500 mt-1">New locations start with 0% utilization</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle>Address Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className={errors.address ? "border-red-500" : ""}
                    placeholder="e.g., 123 Industrial Blvd, Manufacturing District"
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className={errors.city ? "border-red-500" : ""}
                      placeholder="e.g., Springfield"
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <Label htmlFor="state">State/Province *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      className={errors.state ? "border-red-500" : ""}
                      placeholder="e.g., IL"
                    />
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      className={errors.zipCode ? "border-red-500" : ""}
                      placeholder="e.g., 62701"
                    />
                    {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USA">United States</SelectItem>
                      <SelectItem value="CAN">Canada</SelectItem>
                      <SelectItem value="MEX">Mexico</SelectItem>
                      <SelectItem value="GBR">United Kingdom</SelectItem>
                      <SelectItem value="DEU">Germany</SelectItem>
                      <SelectItem value="FRA">France</SelectItem>
                      <SelectItem value="JPN">Japan</SelectItem>
                      <SelectItem value="CHN">China</SelectItem>
                      <SelectItem value="IND">India</SelectItem>
                      <SelectItem value="BRA">Brazil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactPerson">Contact Person *</Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                      className={errors.contactPerson ? "border-red-500" : ""}
                      placeholder="e.g., John Smith"
                    />
                    {errors.contactPerson && <p className="text-red-500 text-sm mt-1">{errors.contactPerson}</p>}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className={errors.phone ? "border-red-500" : ""}
                      placeholder="e.g., +1-555-0123"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={errors.email ? "border-red-500" : ""}
                    placeholder="e.g., warehouse@company.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Environmental & Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Environmental & Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="temperature">Temperature</Label>
                    <Select value={formData.temperature} onValueChange={(value) => handleInputChange("temperature", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ambient">Ambient</SelectItem>
                        <SelectItem value="Climate Controlled">Climate Controlled</SelectItem>
                        <SelectItem value="2-8°C">2-8°C (Cold)</SelectItem>
                        <SelectItem value="-20°C">-20°C (Freezer)</SelectItem>
                        <SelectItem value="Heated">Heated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="humidity">Humidity</Label>
                    <Select value={formData.humidity} onValueChange={(value) => handleInputChange("humidity", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Controlled">Controlled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="securityLevel">Security Level</Label>
                    <Select value={formData.securityLevel} onValueChange={(value) => handleInputChange("securityLevel", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Restricted">Restricted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="items">Current Items</Label>
                    <Input
                      id="items"
                      type="number"
                      value="0"
                      disabled
                      className="bg-gray-100"
                      placeholder="0 (new locations start empty)"
                    />
                    <p className="text-xs text-gray-500 mt-1">New locations start with 0 items</p>
                  </div>
                  <div>
                    <Label htmlFor="value">Current Value</Label>
                    <Input
                      id="value"
                      type="number"
                      value="0"
                      disabled
                      className="bg-gray-100"
                      placeholder="$0.00 (new locations start empty)"
                    />
                    <p className="text-xs text-gray-500 mt-1">New locations start with $0.00 value</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Add any additional notes, special requirements, or instructions for this location..."
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end gap-4">
              <Link href="/locations">
                <Button type="button" variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? "Creating..." : "Create Location"}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
