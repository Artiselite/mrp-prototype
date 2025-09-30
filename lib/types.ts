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
  status: "Draft" | "Under Review" | "Sent" | "Customer Review" | "Negotiation" | "Approved" | "Completed" | "Rejected" | "Expired"
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
  
  // ETO Workflow fields
  workflowStage?: "Draft" | "Engineering" | "BOQ Pending" | "Ready to Send" | "Customer Review" | "PO Received" | "Completed"
  assignedEngineer?: string
  estimatedEngineeringHours?: number
  engineeringStatus?: "Not Started" | "In Progress" | "Drawing Complete" | "Review Required" | "Approved"
  drawingRevision?: string
  drawingNotes?: string
  engineeringDrawingCreated?: boolean
  boqGenerated?: boolean
  boqId?: string
  sentToCustomer?: boolean
  customerFeedbackReceived?: boolean
  poReceived?: boolean
  convertedToSO?: boolean
  soId?: string
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

// Unit Economics Calculator Types
export interface CopperLMEPrice {
  id: string
  date: string
  price: number // RM per metric ton
  currency: string
  source: string
  timestamp: string
  change24h?: number
  changePercent24h?: number
}

export interface UnitEconomicsInput {
  id: string
  quotationId: string
  projectId?: string
  baseMaterialCost: number
  copperWeight: number // in kg
  copperLMEPrice: number // current LME price
  laborCost: number
  overheadCost: number
  profitMargin: number
  quantity: number
  currency: string
  createdAt: string
  updatedAt: string
}

export interface SensitivityAnalysis {
  id: string
  quotationId: string
  baseScenario: UnitEconomicsInput
  scenarios: {
    copperPriceMin: number
    copperPriceMax: number
    copperPriceCurrent: number
    materialCostMin: number
    materialCostMax: number
    materialCostCurrent: number
    totalCostMin: number
    totalCostMax: number
    totalCostCurrent: number
    profitMin: number
    profitMax: number
    profitCurrent: number
    marginMin: number
    marginMax: number
    marginCurrent: number
  }
  riskLevel: "Low" | "Medium" | "High" | "Critical"
  recommendations: string[]
  createdAt: string
  updatedAt: string
}

export interface MarketData {
  id: string
  commodity: string
  price: number
  currency: string
  unit: string
  source: string
  lastUpdated: string
  change24h: number
  changePercent24h: number
  volatility: number
  trend: "Up" | "Down" | "Stable"
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
  projectId?: string
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

// Engineering Approval types
export interface DrawingApproval {
  id: string
  drawingId: string
  role: "Lead Engineer" | "Production Manager" | "Quality Manager" | "Engineering Manager" | "Customer"
  approverName: string
  approverEmail?: string
  status: "Pending" | "Approved" | "Rejected" | "Withdrawn"
  approvedAt?: string
  rejectedAt?: string
  comments?: string
  signature?: string
  requiredForRelease: boolean
  order: number // Approval sequence order
  createdAt: string
  updatedAt: string
}

export interface DrawingComment {
  id: string
  drawingId: string
  authorName: string
  authorRole: string
  commentType: "General" | "Technical Review" | "Quality Review" | "Production Review" | "Customer Feedback"
  content: string
  priority: "Low" | "Medium" | "High" | "Critical"
  status: "Open" | "Resolved" | "Closed"
  relatedApprovalId?: string
  attachments?: string[]
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  resolvedBy?: string
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
  // Approval workflow fields
  approvals?: DrawingApproval[]
  comments?: DrawingComment[]
  submittedForApprovalAt?: string
  submittedBy?: string
  approvalWorkflowStage?: "Not Submitted" | "Under Review" | "Awaiting Customer" | "Approved" | "Rejected"
  finalApprovalAt?: string
  finalApprovalBy?: string
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
  projectId?: string
  bomId: string
  productName: string
  description: string
  quantity: number
  status: "Planned" | "In Progress" | "On Hold" | "Completed" | "Cancelled" | "Quality Approved" | "Quality Rejected"
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
  // Additional properties for table display
  project?: string
  customer?: string
  assignedTeam?: string
  supervisor?: string
  operations?: Array<{
    step: string
    status: "Pending" | "In Progress" | "Completed"
    duration: string
  }>
}

// Shopfloor Management types
export interface Workstation {
  id: string
  name: string
  type: "Cutting" | "Welding" | "Assembly" | "Quality Control" | "Packaging"
  location: string
  status: "Active" | "Maintenance" | "Idle" | "Offline"
  currentOperator?: string
  currentWorkOrder?: string
  efficiency: number // percentage
  lastMaintenance: string
  nextMaintenance: string
  capacity: number // units per hour
  utilization: number // percentage
  createdAt: string
  updatedAt: string
}

export interface Operator {
  id: string
  name: string
  employeeId: string
  department: string
  position: string
  skills: string[]
  certifications: string[]
  currentWorkstation?: string
  currentWorkOrder?: string
  shift: "Day" | "Evening" | "Night"
  status: "Active" | "On Break" | "Off Duty"
  efficiency: number // percentage
  totalHours: number
  createdAt: string
  updatedAt: string
}

export interface ShopfloorActivity {
  id: string
  workstationId: string
  operatorId: string
  workOrderId: string
  activityType: "Start" | "Pause" | "Resume" | "Complete" | "Issue"
  timestamp: string
  notes?: string
  qualityIssues?: string[]
  efficiency?: number
}

// Process Tracking types
export interface ProcessStep {
  id: string
  workOrderId: string
  operationIndex: number
  stepName: string
  status: "Pending" | "In Progress" | "Completed" | "Paused"
  estimatedDuration: number // minutes
  actualDuration: number // minutes
  startTime?: string
  endTime?: string
  operatorId?: string
  workstationId?: string
  qualityCheckRequired: boolean
  qualityStatus?: "Pending" | "Passed" | "Failed"
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface ProcessTimer {
  id: string
  processStepId: string
  workOrderId: string
  operatorId: string
  workstationId: string
  startTime: string
  endTime?: string
  duration: number // minutes
  status: "Running" | "Stopped" | "Paused"
  pauseStartTime?: string
  totalPauseDuration: number // minutes
  createdAt: string
  updatedAt: string
}

export interface QRCode {
  id: string
  type: "Start" | "Stop" | "Pause" | "Resume" | "Quality Check"
  processStepId: string
  workOrderId: string
  workstationId: string
  operatorId: string
  data: string // QR code data payload
  expiresAt: string
  isUsed: boolean
  usedAt?: string
  usedBy?: string
  createdAt: string
  updatedAt: string
}

// Quality Management types
export interface QualityInspection {
  id: string
  workOrderId: string
  workstationId: string
  operatorId: string
  inspectionType: "Incoming" | "In-Process" | "Final" | "First Article"
  status: "Pending" | "In Progress" | "Passed" | "Failed" | "Rejected"
  scheduledDate: string
  completedDate?: string
  inspector: string
  specifications: QualitySpecification[]
  results: QualityResult[]
  notes?: string
  correctiveActions?: string[]
  createdAt: string
  updatedAt: string
}

export interface QualitySpecification {
  id: string
  parameter: string
  target: number
  tolerance: number
  unit: string
  criticality: "Critical" | "Major" | "Minor"
  method: string
}

export interface QualityResult {
  specificationId: string
  measuredValue: number
  status: "Pass" | "Fail"
  notes?: string
  timestamp: string
}

export interface QualityTest {
  id: string
  name: string
  type: "Dimensional" | "Material" | "Welding" | "Coating" | "NDT"
  workOrderId: string
  status: "Scheduled" | "In Progress" | "Completed" | "Failed"
  scheduledDate: string
  completedDate?: string
  technician: string
  equipment: string
  results: QualityTestResult[]
  standards: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface QualityTestResult {
  parameter: string
  value: number
  unit: string
  specification: string
  status: "Pass" | "Fail"
  notes?: string
}

export interface QualityMetric {
  id: string
  name: string
  type: "First Pass Yield" | "Defect Rate" | "Rework Rate" | "Customer Returns"
  value: number
  target: number
  unit: string
  period: "Daily" | "Weekly" | "Monthly"
  date: string
  department: string
  trend: "Up" | "Down" | "Stable"
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
  projectId?: string
  project?: string
  status: "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled"
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  amount?: string
  issueDate: string
  dueDate: string
  dateIssued?: string
  dateDue?: string
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

// OEE (Overall Equipment Effectiveness) types
export interface OEEMetrics {
  id: string
  workstationId: string
  productionLineId?: string
  date: string
  shift: "Day" | "Evening" | "Night"
  
  // Availability metrics
  plannedProductionTime: number // minutes
  actualProductionTime: number // minutes
  downtime: number // minutes
  availability: number // percentage
  
  // Performance metrics
  idealCycleTime: number // minutes per unit
  actualCycleTime: number // minutes per unit
  totalUnitsProduced: number
  performance: number // percentage
  
  // Quality metrics
  goodUnitsProduced: number
  defectiveUnits: number
  quality: number // percentage
  
  // Overall OEE
  oee: number // percentage
  
  // Breakdown details
  downtimeReasons: DowntimeReason[]
  qualityIssues: QualityIssue[]
  
  // Calculated metrics
  throughput: number // units per hour
  efficiency: number // percentage
  utilization: number // percentage
  
  createdAt: string
  updatedAt: string
}

export interface DowntimeReason {
  id: string
  category: "Planned Maintenance" | "Unplanned Maintenance" | "Setup/Changeover" | "Material Shortage" | "Quality Issues" | "Operator Issues" | "Equipment Failure" | "Other"
  description: string
  duration: number // minutes
  startTime: string
  endTime: string
  responsiblePerson?: string
  notes?: string
}

export interface QualityIssue {
  id: string
  type: "Dimensional" | "Surface Finish" | "Welding Defect" | "Material Defect" | "Assembly Error" | "Other"
  description: string
  quantity: number
  severity: "Low" | "Medium" | "High" | "Critical"
  rootCause?: string
  correctiveAction?: string
  responsiblePerson?: string
  resolved: boolean
  resolvedAt?: string
}

export interface ProductionLine {
  id: string
  name: string
  description: string
  workstations: string[] // workstation IDs
  status: "Active" | "Maintenance" | "Idle" | "Offline"
  targetOEE: number // percentage
  currentOEE: number // percentage
  averageOEE: number // percentage (last 30 days)
  throughput: number // units per hour
  capacity: number // units per hour
  utilization: number // percentage
  createdAt: string
  updatedAt: string
}

export interface OEEAlert {
  id: string
  workstationId: string
  productionLineId?: string
  type: "Low OEE" | "High Downtime" | "Quality Issue" | "Performance Drop" | "Maintenance Due"
  severity: "Low" | "Medium" | "High" | "Critical"
  message: string
  value: number
  threshold: number
  unit: string
  status: "Active" | "Acknowledged" | "Resolved"
  acknowledgedBy?: string
  acknowledgedAt?: string
  resolvedBy?: string
  resolvedAt?: string
  createdAt: string
  updatedAt: string
}

export interface OEETrend {
  id: string
  workstationId: string
  productionLineId?: string
  period: "Hourly" | "Daily" | "Weekly" | "Monthly"
  date: string
  oee: number
  availability: number
  performance: number
  quality: number
  throughput: number
  downtime: number
  defects: number
}

// Project Subcontractor types (using suppliers as subcontractors)
export interface ProjectSubcontractor {
  id: string
  projectId: string
  supplierId: string // References supplier from supplier master
  supplierName: string
  workDescription: string
  workType: "Fabrication" | "Assembly" | "Welding" | "Machining" | "Coating" | "Testing" | "Installation" | "Other"
  status: "Pending" | "Assigned" | "In Progress" | "Completed" | "On Hold" | "Cancelled"
  priority: "Low" | "Medium" | "High" | "Critical"
  estimatedCost: number
  actualCost: number
  estimatedDuration: number // days
  actualDuration: number // days
  startDate: string
  dueDate: string
  completionDate?: string
  progress: number // percentage
  assignedBy: string
  assignedAt: string
  specifications: string
  deliverables: string[]
  qualityRequirements: string[]
  safetyRequirements: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface SubcontractorWorkOrder {
  id: string
  projectId: string
  projectSubcontractorId: string
  supplierId: string // References supplier from supplier master
  supplierName: string
  workOrderNumber: string
  workDescription: string
  workType: "Fabrication" | "Assembly" | "Welding" | "Machining" | "Coating" | "Testing" | "Installation" | "Other"
  status: "Draft" | "Sent" | "Acknowledged" | "In Progress" | "Completed" | "On Hold" | "Cancelled"
  priority: "Low" | "Medium" | "High" | "Critical"
  estimatedCost: number
  actualCost: number
  estimatedDuration: number // days
  actualDuration: number // days
  startDate: string
  dueDate: string
  completionDate?: string
  progress: number // percentage
  specifications: string
  deliverables: string[]
  qualityRequirements: string[]
  safetyRequirements: string[]
  materialsProvided: string[]
  materialsRequired: string[]
  toolsRequired: string[]
  specialInstructions: string
  createdBy: string
  assignedTo: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// CAD Parser types
export interface CADMaterial {
  name: string
  type: string
  grade?: string
  thickness?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  quantity: number
  unit: string
  specifications?: string
}

export interface CADDimension {
  type: 'linear' | 'angular' | 'radial' | 'diameter'
  value: number
  unit: string
  startPoint: { x: number; y: number; z: number }
  endPoint: { x: number; y: number; z: number }
  text: string
  layer: string
}

export interface CADBlock {
  name: string
  entities: any[]
  attributes: Record<string, string>
  insertPoint: { x: number; y: number; z: number }
  scale: { x: number; y: number; z: number }
  rotation: number
}

export interface CADBOQData {
  materials: CADMaterial[]
  dimensions: CADDimension[]
  blocks: CADBlock[]
  totalArea: number
  totalVolume: number
  totalLength: number
  drawingInfo: {
    title: string
    scale: string
    units: string
    layers: string[]
  }
}
