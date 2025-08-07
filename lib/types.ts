// Core data types for the MRP system

export interface Customer {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
}

export interface Quotation {
  id: string
  customerId: string
  customer: string
  projectName: string
  description: string
  steelType: string
  estimatedQuantity: string
  estimatedValue: number
  status: "Draft" | "Pending" | "Approved" | "Rejected"
  dateCreated: string
  dueDate: string
  validUntil: string
  notes?: string
}

export interface EngineeringDrawing {
  id: string
  quotationId: string
  drawingType: "Structural Assembly" | "Detail Drawing" | "Shop Drawing" | "Fabrication Drawing"
  revision: string
  status: "Draft" | "In Progress" | "Review" | "Approved" | "Rejected"
  engineerId: string
  engineer: string
  dateCreated: string
  dueDate: string
  specifications: string
  filePath?: string
  notes?: string
}

export interface BOMItem {
  id: string
  itemDescription: string
  quantity: number
  unit: string
  steelGrade: string
  unitCost: number
  totalCost: number
  supplier?: string
  leadTime?: number
}

export interface BillOfMaterials {
  id: string
  drawingId: string
  status: "Draft" | "Review" | "Approved" | "Rejected"
  totalCost: number
  dateCreated: string
  items: BOMItem[]
  notes?: string
}

export interface WorkOrderOperation {
  id: string
  stepName: string
  status: "Pending" | "In Progress" | "Completed" | "On Hold"
  estimatedDuration: number
  actualDuration?: number
  assignedWorker?: string
  notes?: string
}

export interface WorkOrder {
  id: string
  bomId: string
  status: "Planning" | "In Progress" | "Completed" | "On Hold"
  priority: "Low" | "Medium" | "High"
  progress: number
  startDate: string
  dueDate: string
  assignedTeam: string
  supervisorId: string
  supervisor: string
  operations: WorkOrderOperation[]
  notes?: string
}

export interface InvoiceLineItem {
  id: string
  description: string
  quantity: string
  rate: string
  amount: string
}

export interface Invoice {
  id: string
  workOrderId: string
  customerId: string
  customer: string
  projectName: string
  status: "Draft" | "Sent" | "Paid" | "Overdue"
  subtotal: number
  tax: number
  totalAmount: number
  dateIssued?: string
  dateDue?: string
  datePaid?: string
  lineItems: InvoiceLineItem[]
  notes?: string
}

// Utility types for job traceability
export interface JobTraceability {
  quotationId: string
  drawingId: string
  bomId: string
  workOrderId: string
  invoiceId: string
  status: string
  currentStage: "Quotation" | "Engineering" | "BOM" | "Production" | "Invoicing" | "Completed"
}
