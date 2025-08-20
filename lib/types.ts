export interface Quotation {
  id: string
  customerId: string
  customer: string
  title: string
  description: string
  status: "Draft" | "Sent" | "Under Review" | "Approved" | "Rejected"
  priority: "Low" | "Medium" | "High" | "Critical"
  createdDate: string
  validUntil: string
  totalAmount: number
  items: QuotationItem[]
  notes?: string
  engineeringId?: string
  bomId?: string
  productionId?: string
  invoiceId?: string
}

export interface QuotationItem {
  id: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
  steelGrade?: string
  specifications?: string
}

export interface Engineering {
  id: string
  quotationId?: string
  title: string
  description: string
  status: "Planning" | "In Progress" | "Review" | "Approved" | "On Hold"
  priority: "Low" | "Medium" | "High" | "Critical"
  assignedEngineer: string
  startDate: string
  targetDate: string
  completionDate?: string
  drawings: Drawing[]
  specifications: string
  materials: string[]
  notes?: string
  bomId?: string
  productionId?: string
}

export interface Drawing {
  id: string
  name: string
  version: string
  type: "Assembly" | "Detail" | "Fabrication" | "Shop"
  status: "Draft" | "Review" | "Approved" | "Superseded"
  createdDate: string
  modifiedDate: string
  engineer: string
  fileUrl?: string
}

export interface BillOfMaterials {
  id: string
  engineeringId?: string
  title: string
  description: string
  status: "Draft" | "Active" | "Revision" | "Obsolete"
  version: string
  createdDate: string
  modifiedDate: string
  createdBy: string
  items: BOMItem[]
  totalCost: number
  notes?: string
  productionId?: string
}

export interface BOMItem {
  id: string
  partNumber: string
  description: string
  quantity: number
  unit: string
  unitCost: number
  totalCost: number
  supplier?: string
  leadTime?: number
  steelGrade?: string
  specifications?: string
  category: "Raw Material" | "Fabricated Part" | "Hardware" | "Consumable"
}

export interface Production {
  id: string
  bomId?: string
  workOrder: string
  title: string
  description: string
  status: "Planned" | "In Progress" | "Quality Check" | "Completed" | "On Hold"
  priority: "Low" | "Medium" | "High" | "Critical"
  scheduledStart: string
  scheduledEnd: string
  actualStart?: string
  actualEnd?: string
  assignedTeam: string
  operations: ProductionOperation[]
  materials: ProductionMaterial[]
  qualityChecks: QualityCheck[]
  notes?: string
  invoiceId?: string
}

export interface ProductionOperation {
  id: string
  sequence: number
  operation: string
  description: string
  estimatedHours: number
  actualHours?: number
  status: "Pending" | "In Progress" | "Completed" | "On Hold"
  assignedWorker?: string
  startTime?: string
  endTime?: string
  notes?: string
}

export interface ProductionMaterial {
  id: string
  partNumber: string
  description: string
  requiredQuantity: number
  allocatedQuantity: number
  unit: string
  status: "Required" | "Allocated" | "Consumed"
}

export interface QualityCheck {
  id: string
  checkPoint: string
  description: string
  status: "Pending" | "Passed" | "Failed" | "N/A"
  inspector?: string
  checkDate?: string
  notes?: string
}

export interface Invoice {
  id: string
  quotationId?: string
  productionId?: string
  customerId: string
  customer: string
  title: string
  description: string
  status: "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled"
  invoiceDate: string
  dueDate: string
  paidDate?: string
  subtotal: number
  taxRate: number
  taxAmount: number
  totalAmount: number
  items: InvoiceItem[]
  paymentTerms: string
  notes?: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
}

export interface Customer {
  id: string
  name: string
  type: "Individual" | "Corporation" | "Government" | "Non-Profit"
  status: "Active" | "Inactive" | "Prospect" | "Former"
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  industry: string
  creditLimit: number
  paymentTerms: string
  taxId?: string
  notes?: string
  createdDate: string
  lastContact?: string
}

export interface PurchaseOrder {
  id: string
  supplierId: string
  supplier: string
  bomId?: string
  status: "Draft" | "Sent" | "Acknowledged" | "Shipped" | "Received" | "Cancelled"
  priority: "Low" | "Medium" | "High" | "Critical"
  orderDate: string
  requestedDeliveryDate: string
  actualDeliveryDate?: string
  subtotal: number
  taxRate: number
  taxAmount: number
  shippingCost: number
  totalAmount: number
  items: ProcurementItem[]
  shippingAddress: string
  paymentTerms: string
  notes?: string
}

export interface ProcurementItem {
  id: string
  description: string
  partNumber: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
  steelGrade?: string
  specifications?: string
  urgency: "Low" | "Medium" | "High" | "Critical"
  requestedDate?: string
  notes?: string
}

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
  specialties: string[]
  rating: number
  paymentTerms: string
  leadTime: number
  notes?: string
  status: "Active" | "Inactive" | "Preferred" | "Blacklisted"
}
