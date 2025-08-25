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
}

export interface Quotation {
  id: string
  customerId: string
  customerName: string
  quotationNumber: string
  title: string
  description: string
  status: "Draft" | "Sent" | "Approved" | "Rejected" | "Expired"
  items: QuotationItem[]
  subtotal: number
  tax: number
  total: number
  validUntil: string
  createdAt: string
  updatedAt: string
  revision: string
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
  notes?: string
}

// Bill of Materials types
export interface BOMItem {
  id: string
  partNumber: string
  description: string
  quantity: number
  unit: string
  unitCost: number
  totalCost: number
  supplier: string
  leadTime: number
  category: string
  specifications?: string
}

export interface BillOfMaterials {
  id: string
  bomNumber: string
  title: string
  productName: string
  description: string
  status: "Draft" | "Under Review" | "Approved" | "Released" | "Obsolete"
  version: string
  items: BOMItem[]
  totalCost: number
  createdBy: string
  approvedBy: string
  createdAt: string
  updatedAt: string
  revision: string
  engineeringDrawingId?: string
  notes?: string
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
