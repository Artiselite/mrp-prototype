// Mock data and utility functions for the MRP system

import { Quotation, EngineeringDrawing, BillOfMaterials, WorkOrder, Invoice, JobTraceability } from './types'

// Steel grades and specifications
export const steelGrades = [
  { value: "a36", label: "A36 Structural Steel", description: "General construction, low carbon" },
  { value: "a992", label: "A992 Grade 50", description: "High strength structural beams" },
  { value: "a572", label: "A572 Grade 50", description: "High strength low alloy" },
  { value: "a514", label: "A514 High Strength", description: "Quenched and tempered alloy" },
  { value: "a588", label: "A588 Weathering Steel", description: "Atmospheric corrosion resistant" }
]

// Standard steel shapes and sizes
export const steelShapes = [
  { category: "Wide Flange Beams", items: ["W12x65", "W14x90", "W16x100", "W18x130"] },
  { category: "Columns", items: ["W8x31", "W10x49", "W12x65", "W14x90"] },
  { category: "Angles", items: ["L4x4x1/2", "L6x6x3/4", "L8x8x1"] },
  { category: "Plates", items: ["1/2x12x20", "3/4x16x24", "1x20x40"] },
  { category: "Channels", items: ["C12x20.7", "C15x33.9", "C18x42.7"] }
]

// Production teams and capabilities
export const productionTeams = [
  { id: "team-a", name: "Team A - Structural", specialization: "Heavy structural fabrication", supervisor: "Mike Johnson" },
  { id: "team-b", name: "Team B - Fabrication", specialization: "Custom fabrication and machining", supervisor: "Sarah Davis" },
  { id: "team-c", name: "Team C - Assembly", specialization: "Assembly and finishing", supervisor: "Tom Wilson" }
]

// Engineers and their specializations
export const engineers = [
  { id: "john", name: "John Smith", specialization: "Structural Design", experience: "15 years" },
  { id: "sarah", name: "Sarah Johnson", specialization: "Mechanical Design", experience: "12 years" },
  { id: "mike", name: "Mike Davis", specialization: "Fabrication Engineering", experience: "18 years" }
]

// Mock quotations data
export const quotations: Quotation[] = [
  {
    id: "QUO-2024-001",
    customerName: "ABC Steel Works",
    customerEmail: "contact@abcsteel.com",
    customerPhone: "(555) 123-4567",
    customerAddress: "123 Industrial Blvd, Steel City, SC 12345",
    projectName: "Industrial Warehouse Frame",
    projectDescription: "Complete structural steel frame for 50,000 sq ft warehouse facility",
    status: "sent",
    createdDate: "2024-01-10",
    validUntil: "2024-02-10",
    totalAmount: 125000,
    lineItems: [
      {
        id: "1",
        description: "W12x65 Wide Flange Beams",
        quantity: 20,
        unit: "pieces",
        unitPrice: 450,
        totalPrice: 9000
      },
      {
        id: "2", 
        description: "A36 Steel Plates 1/2\" x 12\" x 20'",
        quantity: 50,
        unit: "pieces",
        unitPrice: 280,
        totalPrice: 14000
      }
    ],
    notes: "Includes delivery and basic installation consultation"
  },
  {
    id: "QUO-2024-002",
    customerName: "Metro Construction",
    customerEmail: "orders@metroconstruction.com",
    customerPhone: "(555) 987-6543",
    customerAddress: "456 Builder Ave, Metro City, MC 67890",
    projectName: "Bridge Support Beams",
    projectDescription: "Custom fabricated support beams for highway overpass project",
    status: "approved",
    createdDate: "2024-01-08",
    validUntil: "2024-02-08",
    totalAmount: 89500,
    lineItems: [
      {
        id: "1",
        description: "A992 Grade 50 W18x130 Beams",
        quantity: 12,
        unit: "pieces",
        unitPrice: 650,
        totalPrice: 7800
      }
    ],
    notes: "Requires special coating for weather resistance"
  },
  {
    id: "QUO-2024-003",
    customerName: "Industrial Corp",
    customerEmail: "procurement@industrialcorp.com",
    customerPhone: "(555) 456-7890",
    customerAddress: "789 Factory Rd, Industrial Park, IP 13579",
    projectName: "Custom Fabricated Brackets",
    projectDescription: "Specialized mounting brackets for heavy machinery installation",
    status: "draft",
    createdDate: "2024-01-12",
    validUntil: "2024-02-12",
    totalAmount: 15750,
    lineItems: [
      {
        id: "1",
        description: "A572 Grade 50 Custom Brackets",
        quantity: 100,
        unit: "pieces",
        unitPrice: 125,
        totalPrice: 12500
      }
    ],
    notes: "Prototype approval required before full production"
  }
]

// Mock engineering drawings data
export const engineeringDrawings: EngineeringDrawing[] = [
  {
    id: "DWG-2024-001",
    quotationId: "QUO-2024-001",
    title: "Warehouse Frame Assembly",
    drawingType: "Assembly Drawing",
    revision: "Rev A",
    status: "approved",
    engineer: "John Smith",
    createdDate: "2024-01-15",
    lastModified: "2024-01-20",
    specifications: "AISC 360-16 compliant structural design",
    files: [
      { name: "warehouse-frame-assembly.dwg", size: "2.4 MB", type: "AutoCAD" },
      { name: "structural-details.pdf", size: "1.8 MB", type: "PDF" }
    ]
  },
  {
    id: "DWG-2024-002", 
    quotationId: "QUO-2024-002",
    title: "Bridge Support Beam Details",
    drawingType: "Detail Drawing",
    revision: "Rev B",
    status: "in-progress",
    engineer: "Sarah Johnson",
    createdDate: "2024-01-12",
    lastModified: "2024-01-18",
    specifications: "AASHTO LRFD Bridge Design Specifications",
    files: [
      { name: "bridge-beam-details.dwg", size: "3.1 MB", type: "AutoCAD" }
    ]
  }
]

// Mock BOM data
export const billsOfMaterials: BillOfMaterials[] = [
  {
    id: "BOM-2024-001",
    drawingId: "DWG-2024-001",
    title: "Warehouse Frame Materials",
    status: "approved",
    createdDate: "2024-01-22",
    totalCost: 45000,
    materials: [
      {
        id: "1",
        partNumber: "W12x65-20FT",
        description: "W12x65 Wide Flange Beam, 20ft length",
        quantity: 20,
        unit: "pieces",
        unitCost: 450,
        totalCost: 9000,
        supplier: "Steel Supply Co",
        steelGrade: "A992"
      },
      {
        id: "2",
        partNumber: "PL-0.5x12x20",
        description: "Steel Plate 1/2\" x 12\" x 20'",
        quantity: 50,
        unit: "pieces", 
        unitCost: 280,
        totalCost: 14000,
        supplier: "Metro Steel",
        steelGrade: "A36"
      }
    ]
  }
]

// Mock work orders data
export const workOrders: WorkOrder[] = [
  {
    id: "WO-2024-001",
    bomId: "BOM-2024-001",
    title: "Warehouse Frame Fabrication",
    status: "in-progress",
    priority: "high",
    assignedTeam: "Team A - Structural",
    supervisor: "Mike Johnson",
    startDate: "2024-01-25",
    dueDate: "2024-02-15",
    estimatedHours: 120,
    actualHours: 45,
    operations: [
      {
        id: "1",
        sequence: 1,
        operation: "Material Cutting",
        description: "Cut beams and plates to specified dimensions",
        estimatedDuration: 8,
        actualDuration: 6,
        status: "completed",
        assignedWorker: "Tom Wilson"
      },
      {
        id: "2",
        sequence: 2,
        operation: "Welding Assembly",
        description: "Weld frame components according to drawing specifications",
        estimatedDuration: 24,
        actualDuration: 0,
        status: "in-progress",
        assignedWorker: "Sarah Davis"
      }
    ]
  }
]

// Mock invoices data
export const invoices: Invoice[] = [
  {
    id: "INV-2024-001",
    workOrderId: "WO-2024-001",
    customerName: "ABC Steel Works",
    customerAddress: "123 Industrial Blvd, Steel City, SC 12345",
    status: "sent",
    issueDate: "2024-02-01",
    dueDate: "2024-03-01",
    subtotal: 125000,
    taxRate: 8.5,
    taxAmount: 10625,
    totalAmount: 135625,
    lineItems: [
      {
        id: "1",
        description: "Warehouse Frame Fabrication - Complete",
        quantity: 1,
        unit: "project",
        unitPrice: 125000,
        totalPrice: 125000
      }
    ],
    paymentTerms: "Net 30 days"
  }
]

// Utility function to generate job traceability
export const generateJobTrace = (quotationId: string): JobTraceability => {
  return {
    quotationId,
    drawingId: quotationId.replace('QUO', 'DWG'),
    bomId: quotationId.replace('QUO', 'BOM'),
    workOrderId: quotationId.replace('QUO', 'WO'),
    invoiceId: quotationId.replace('QUO', 'INV'),
    status: "Active",
    currentStage: "Quotation"
  }
}

// Utility function to calculate BOM total cost
export const calculateBOMTotal = (items: any[]) => {
  return items.reduce((total, item) => total + (item.quantity * item.unitCost), 0)
}

// Utility function to format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

// Utility function to calculate project timeline
export const calculateProjectTimeline = (operations: any[]) => {
  return operations.reduce((total, op) => total + op.estimatedDuration, 0)
}

// Status color mappings
export const statusColors = {
  quotation: {
    "draft": "bg-gray-100 text-gray-800",
    "sent": "bg-blue-100 text-blue-800", 
    "approved": "bg-green-100 text-green-800",
    "rejected": "bg-red-100 text-red-800"
  },
  engineering: {
    "draft": "bg-gray-100 text-gray-800",
    "in-progress": "bg-blue-100 text-blue-800",
    "review": "bg-yellow-100 text-yellow-800",
    "approved": "bg-green-100 text-green-800",
    "rejected": "bg-red-100 text-red-800"
  },
  production: {
    "planning": "bg-yellow-100 text-yellow-800",
    "in-progress": "bg-blue-100 text-blue-800",
    "completed": "bg-green-100 text-green-800",
    "on-hold": "bg-red-100 text-red-800"
  },
  invoice: {
    "draft": "bg-gray-100 text-gray-800",
    "sent": "bg-blue-100 text-blue-800",
    "paid": "bg-green-100 text-green-800",
    "overdue": "bg-red-100 text-red-800"
  }
}
