// Customer types
export interface Customer {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  status: "Active" | "Inactive" | "Suspended"
  creditLimit: number
  paymentTerms: string
  totalOrders: number
  engineeringStandards?: string[]
  qualityRequirements?: string[]
  createdAt: string
  updatedAt: string
}

// Supplier types
export interface Supplier {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  status: "Active" | "Inactive" | "Suspended"
  paymentTerms: string
  leadTime: number
  qualityRating: number
  rating: number
  totalOrders: number
  specialties: string[]
  createdAt: string
  updatedAt: string
  notes?: string
}

// Quotation types
export interface QuotationItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  deliveryDate: string
  specifications: string
  isNewItem?: boolean
  engineeringHours?: number
  engineeringRate?: number
  engineeringCost?: number
  materialCost?: number
  laborCost?: number
  overheadCost?: number
  profitMargin?: number
  bomId?: string
  drawingId?: string
}

export interface Quotation {
  id: string
  customerId: string
  customerName: string
  quotationNumber: string
  title: string
  description: string
  status: "Draft" | "Under Review" | "Sent" | "Customer Review" | "Negotiation" | "Approved" | "Rejected" | "Expired"
  items: QuotationItem[]
  subtotal: number
  engineeringCost: number
  materialCost: number
  laborCost: number
  overheadCost: number
  profitMargin: number
  tax: number
  total: number
  validUntil: string
  createdAt: string
  updatedAt: string
  revision: string
  engineeringProjectId?: string
  salesPerson: string
  engineeringReviewer?: string
  managementApprover?: string
  customerRequirements: string
  technicalSpecifications: string
  deliveryTerms: string
  paymentTerms: string
  warrantyTerms: string
  notes?: string
  changeHistory: QuotationChange[]
}

// Quotation Change Management
export interface QuotationChange {
  id: string
  changeNumber: string
  quotationId: string
  changeType: "Scope" | "Pricing" | "Timeline" | "Specifications" | "Terms"
  reason: string
  description: string
  impact: string
  costImpact: number
  scheduleImpact: number
  requestedBy: string
  reviewedBy?: string
  approvedBy?: string
  customerApproved?: boolean
  createdAt: string
  updatedAt: string
  notes?: string
}

// Sales Order types
export interface SalesOrderItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  deliveryDate: string
  specifications: string
  status: "Pending" | "Ready" | "In Production" | "Completed" | "Shipped"
  bomId?: string
  workOrderId?: string
}

export interface SalesOrder {
  id: string
  customerId: string
  customerName: string
  quotationId?: string
  salesOrderNumber: string
  customerPO: string
  title: string
  description: string
  status: "Draft" | "Confirmed" | "In Production" | "Shipped" | "Delivered" | "Cancelled"
  items: SalesOrderItem[]
  subtotal: number
  tax: number
  total: number
  orderDate: string
  requestedDeliveryDate: string
  confirmedDeliveryDate?: string
  shippingAddress: string
  billingAddress: string
  paymentTerms: string
  createdAt: string
  updatedAt: string
  revision: string
  notes?: string
}

// Engineering types
export interface EngineeringDrawing {
  id: string
  projectId: string
  projectNumber: string
  drawingNumber: string
  title: string
  description: string
  status: "Draft" | "Under Review" | "Approved" | "Released" | "Obsolete"
  version: string
  drawnBy: string
  checkedBy: string
  approvedBy: string
  createdAt: string
  updatedAt: string
  revision: string
  fileUrl?: string
  specifications: string
  materials: string[]
  dimensions?: {
    length: number
    width: number
    height: number
    weight: number
  }
  tolerances?: string
  surfaceFinish?: string
  weldingSpecs?: string
  qualityStandards: string[]
  inspectionPoints: string[]
  notes?: string
  changeHistory: EngineeringChange[]
}

// Engineering Change Management
export interface EngineeringChange {
  id: string
  changeNumber: string
  drawingId: string
  changeType: "Design" | "Material" | "Process" | "Specification" | "Documentation"
  priority: "Low" | "Medium" | "High" | "Critical"
  status: "Proposed" | "Under Review" | "Approved" | "Rejected" | "Implemented"
  reason: string
  description: string
  impact: string
  costImpact: number
  scheduleImpact: number
  proposedBy: string
  reviewedBy?: string
  approvedBy?: string
  implementationDate?: string
  createdAt: string
  updatedAt: string
  notes?: string
}

// Bill of Materials types
export interface BOMItem {
  id: string
  itemNumber: string
  partNumber: string
  description: string
  quantity: number
  unit: string
  unitCost: number
  totalCost: number
  supplier: string
  leadTime: number
  category: "Raw Material" | "Structural Steel" | "Steel Plate" | "Piping" | "Pipe Fittings" | "Fabricated" | "Hardware" | "General"
  materialGrade?: string
  specifications?: string
  boqItemId?: string
}

export interface BillOfMaterials {
  id: string
  bomNumber: string
  productName: string
  description?: string
  status: "Draft" | "Under Review" | "Approved" | "Released" | "Obsolete"
  version: string
  bomType: "EBOM" | "MBOM" | "PBOM"
  items: BOMItem[]
  totalCost: number
  itemCount: number
  createdBy: string
  approvedBy?: string
  createdAt: string
  updatedAt: string
  revision: string
  engineeringProjectId?: string
  engineeringDrawingId?: string
  boqId?: string
  notes?: string
}

// Bill of Quantities (BOQ) types
export interface BOQItem {
  id: string
  itemNumber: string
  description: string
  quantity: number
  unit: string
  unitRate: number
  totalAmount: number
  category: "Material" | "Labor" | "Equipment" | "Subcontract" | "Other"
  specifications?: string
  remarks?: string
  bomItemId?: string
  // ETO-specific fields
  workPackage?: string // High-level work description
  engineeringStatus?: "Pending" | "In Design" | "Design Complete" | "BOM Generated"
  bomId?: string // Generated BOM reference
  designComplexity?: "Low" | "Medium" | "High" | "Critical"
  requiredDrawings?: string[] // Required engineering drawings
}

export interface BillOfQuantities {
  id: string
  boqNumber: string
  title: string
  projectName: string
  description: string
  status: "Draft" | "Under Review" | "Approved" | "Final" | "Revised"
  version: string
  items: BOQItem[]
  materialCost: number
  laborCost: number
  equipmentCost: number
  subcontractCost: number
  otherCost: number
  totalCost: number
  createdBy: string
  approvedBy?: string
  createdAt: string
  updatedAt: string
  revision: string
  engineeringProjectId?: string
  engineeringDrawingId?: string
  bomId?: string
  notes?: string
  // ETO-specific fields
  etoStatus?: "BOQ Submitted" | "Engineering Design" | "BOM Generation" | "Manufacturing Ready"
  engineeringProgress?: number // 0-100 percentage
  generatedBOMs?: string[] // Array of BOM IDs generated from this BOQ
  contractReference?: string // Client contract reference
  workPackages?: string[] // High-level work packages
}

// Production Work Order types
export interface ProductionWorkOrder {
  id: string
  workOrderNumber: string
  salesOrderId?: string
  bomId: string
  productName: string
  description: string
  quantity: number
  status: "Planned" | "In Progress" | "On Hold" | "Completed" | "Cancelled"
  priority: "Low" | "Medium" | "High" | "Critical"
  startDate: string
  dueDate: string
  assignedTo: string
  progress: number
  estimatedHours: number
  actualHours: number
  createdAt: string
  updatedAt: string
  revision: string
  notes?: string
}

// Invoice types
export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  salesOrderId?: string
  status: "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled"
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  issueDate: string
  dueDate: string
  createdAt: string
  updatedAt: string
  revision: string
  notes?: string
}

// Purchase Order types
export interface PurchaseOrderItem {
  id: string
  partNumber: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
  steelGrade: string
  urgency: "Low" | "Medium" | "High" | "Critical"
  requestedDate: string
  specifications?: string
  notes?: string
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  supplierId: string
  supplierName: string
  bomId?: string
  priority?: "Low" | "Medium" | "High" | "Critical"
  status: "Draft" | "Sent" | "Acknowledged" | "Shipped" | "Received" | "Cancelled"
  items: PurchaseOrderItem[]
  subtotal: number
  tax: number
  total: number
  orderDate: string
  requestedDeliveryDate: string
  actualDeliveryDate?: string
  shippingAddress?: string
  paymentTerms: string
  createdAt: string
  updatedAt: string
  revision: string
  notes?: string
}

// Procurement types
export interface ProcurementItem {
  id: string
  description: string
  partNumber: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
  steelGrade: string
  specifications: string
  urgency: "Low" | "Medium" | "High" | "Critical"
  requestedDate: string
  notes: string
}

// Item types
export interface Item {
  id: string
  partNumber: string
  name: string
  category: string
  description: string
  unit: string
  unitCost: number
  minStock: number
  maxStock: number
  currentStock: number
  leadTime: number
  supplier: string
  location: string
  status: "Active" | "Inactive" | "Discontinued"
  specifications: string
  createdAt: string
  updatedAt: string
  notes?: string
}

// Location types
export interface Location {
  id: string
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
  currentUtilization: number
  temperature: string
  humidity: string
  securityLevel: "Low" | "Medium" | "High" | "Restricted"
  status: "Active" | "Inactive" | "Maintenance" | "Closed"
  createdAt: string
  updatedAt: string
  items: number
  value: number
  notes?: string
}

// Engineering Project types - Simplified for ETO workflow
export interface EngineeringProject {
  id: string
  projectNumber: string
  customerId: string
  customerName: string
  title: string
  description: string
  status: "Draft" | "Under Review" | "Approved" | "In Progress" | "On Hold" | "Completed"
  priority: "Low" | "Medium" | "High" | "Critical"
  projectType: "Custom Design" | "Modification" | "Standard Product" | "Prototype"
  estimatedHours: number
  actualHours: number
  estimatedCost: number
  actualCost: number
  startDate: string
  dueDate: string
  completionDate?: string
  assignedEngineer: string
  projectManager: string
  customerRequirements: string
  technicalSpecifications: string
  constraints: string[]
  risks: string[]
  deliverables: string[]
  createdAt: string
  updatedAt: string
  revision: string
  notes?: string
}
