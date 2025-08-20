import type {
  Quotation,
  Engineering,
  BillOfMaterials,
  Production,
  Invoice,
  Customer,
  PurchaseOrder,
  Supplier,
} from "./types"

// Mock data for quotations
export const quotations: Quotation[] = [
  {
    id: "QUO-2024-001",
    customerId: "CUST-001",
    customer: "ABC Manufacturing Corp",
    title: "Steel Frame Assembly",
    description: "Custom steel frame assembly for industrial equipment",
    status: "Approved",
    priority: "High",
    createdDate: "2024-01-15",
    validUntil: "2024-02-15",
    totalAmount: 45000,
    items: [
      {
        id: "1",
        description: "Steel Frame - Main Structure",
        quantity: 2,
        unit: "pieces",
        unitPrice: 15000,
        totalPrice: 30000,
        steelGrade: "A992",
        specifications: "Welded construction, painted finish",
      },
      {
        id: "2",
        description: "Support Brackets",
        quantity: 8,
        unit: "pieces",
        unitPrice: 1875,
        totalPrice: 15000,
        steelGrade: "A36",
        specifications: "Bolted connections, galvanized",
      },
    ],
    notes: "Rush order - customer needs by end of month",
    engineeringId: "ENG-2024-001",
    bomId: "BOM-2024-001",
  },
]

// Mock data for engineering
export const engineeringProjects: Engineering[] = [
  {
    id: "ENG-2024-001",
    quotationId: "QUO-2024-001",
    title: "Steel Frame Assembly Design",
    description: "Engineering design for custom steel frame assembly",
    status: "Approved",
    priority: "High",
    assignedEngineer: "John Smith",
    startDate: "2024-01-20",
    targetDate: "2024-02-05",
    completionDate: "2024-02-03",
    drawings: [
      {
        id: "DWG-001",
        name: "Main Frame Assembly",
        version: "Rev A",
        type: "Assembly",
        status: "Approved",
        createdDate: "2024-01-25",
        modifiedDate: "2024-02-01",
        engineer: "John Smith",
      },
    ],
    specifications: "AISC standards, AWS welding procedures",
    materials: ["A992 Steel", "A36 Steel", "Welding consumables"],
    bomId: "BOM-2024-001",
  },
]

// Mock data for bills of materials
export const billsOfMaterials: BillOfMaterials[] = [
  {
    id: "BOM-2024-001",
    engineeringId: "ENG-2024-001",
    title: "Steel Frame Assembly BOM",
    description: "Bill of materials for steel frame assembly project",
    status: "Active",
    version: "1.0",
    createdDate: "2024-02-01",
    modifiedDate: "2024-02-03",
    createdBy: "John Smith",
    totalCost: 32500,
    items: [
      {
        id: "1",
        partNumber: "SF-MAIN-001",
        description: "Main Frame Steel - W12x65",
        quantity: 40,
        unit: "feet",
        unitCost: 125,
        totalCost: 5000,
        supplier: "Steel Supply Co",
        leadTime: 7,
        steelGrade: "A992",
        category: "Raw Material",
      },
    ],
  },
]

// Mock data for production
export const productionOrders: Production[] = [
  {
    id: "PROD-2024-001",
    bomId: "BOM-2024-001",
    workOrder: "WO-2024-001",
    title: "Steel Frame Assembly Production",
    description: "Production of steel frame assembly per approved drawings",
    status: "In Progress",
    priority: "High",
    scheduledStart: "2024-02-10",
    scheduledEnd: "2024-02-25",
    actualStart: "2024-02-10",
    assignedTeam: "Team A - Fabrication",
    operations: [
      {
        id: "1",
        sequence: 1,
        operation: "Material Cutting",
        description: "Cut steel members to length",
        estimatedHours: 8,
        actualHours: 7.5,
        status: "Completed",
        assignedWorker: "Mike Johnson",
      },
    ],
    materials: [
      {
        id: "1",
        partNumber: "SF-MAIN-001",
        description: "Main Frame Steel - W12x65",
        requiredQuantity: 40,
        allocatedQuantity: 40,
        unit: "feet",
        status: "Allocated",
      },
    ],
    qualityChecks: [
      {
        id: "1",
        checkPoint: "Material Inspection",
        description: "Verify material certifications and dimensions",
        status: "Passed",
        inspector: "QC Inspector 1",
      },
    ],
  },
]

// Mock data for invoices
export const invoices: Invoice[] = [
  {
    id: "INV-2024-001",
    quotationId: "QUO-2024-001",
    customerId: "CUST-001",
    customer: "ABC Manufacturing Corp",
    title: "Steel Frame Assembly",
    description: "Invoice for completed steel frame assembly",
    status: "Sent",
    invoiceDate: "2024-02-26",
    dueDate: "2024-03-28",
    subtotal: 45000,
    taxRate: 8.5,
    taxAmount: 3825,
    totalAmount: 48825,
    paymentTerms: "Net 30",
    items: [
      {
        id: "1",
        description: "Steel Frame Assembly - Complete",
        quantity: 1,
        unit: "lot",
        unitPrice: 45000,
        totalPrice: 45000,
      },
    ],
  },
]

// Mock data for customers
export const customers: Customer[] = [
  {
    id: "CUST-001",
    name: "ABC Manufacturing Corp",
    type: "Corporation",
    status: "Active",
    contactPerson: "Sarah Johnson",
    email: "sarah.johnson@abcmfg.com",
    phone: "(555) 123-4567",
    address: "123 Industrial Blvd",
    city: "Manufacturing City",
    state: "TX",
    zipCode: "75001",
    industry: "Industrial Equipment",
    creditLimit: 100000,
    paymentTerms: "Net 30",
    taxId: "12-3456789",
    createdDate: "2023-06-15",
    lastContact: "2024-01-15",
  },
  {
    id: "CUST-002",
    name: "XYZ Construction LLC",
    type: "Corporation",
    status: "Active",
    contactPerson: "Mike Davis",
    email: "mike.davis@xyzconstruction.com",
    phone: "(555) 987-6543",
    address: "456 Builder Ave",
    city: "Construction Town",
    state: "TX",
    zipCode: "75002",
    industry: "Construction",
    creditLimit: 75000,
    paymentTerms: "Net 15",
    createdDate: "2023-08-22",
    lastContact: "2024-01-10",
  },
]

// Mock data for suppliers
export const suppliers: Supplier[] = [
  {
    id: "SUPP-001",
    name: "Steel Supply Co",
    contactPerson: "Robert Wilson",
    email: "robert.wilson@steelsupply.com",
    phone: "(555) 111-2222",
    address: "789 Steel Mill Rd",
    city: "Steel City",
    state: "TX",
    zipCode: "75003",
    specialties: ["Structural Steel", "Plate Steel", "Pipe & Tube"],
    rating: 4.8,
    paymentTerms: "Net 30",
    leadTime: 7,
    status: "Preferred",
  },
  {
    id: "SUPP-002",
    name: "Industrial Hardware Inc",
    contactPerson: "Lisa Chen",
    email: "lisa.chen@industrialhardware.com",
    phone: "(555) 333-4444",
    address: "321 Hardware St",
    city: "Industrial Park",
    state: "TX",
    zipCode: "75004",
    specialties: ["Bolts & Fasteners", "Welding Supplies", "Safety Equipment"],
    rating: 4.5,
    paymentTerms: "Net 15",
    leadTime: 3,
    status: "Active",
  },
  {
    id: "SUPP-003",
    name: "Precision Metals LLC",
    contactPerson: "David Brown",
    email: "david.brown@precisionmetals.com",
    phone: "(555) 555-6666",
    address: "654 Precision Way",
    city: "Metal Works",
    state: "TX",
    zipCode: "75005",
    specialties: ["Aluminum", "Stainless Steel", "Exotic Alloys"],
    rating: 4.9,
    paymentTerms: "Net 45",
    leadTime: 14,
    status: "Preferred",
  },
]

// Mock data for purchase orders
export const purchaseOrders: PurchaseOrder[] = [
  {
    id: "PO-2024-001",
    supplierId: "SUPP-001",
    supplier: "Steel Supply Co",
    bomId: "BOM-2024-001",
    status: "Received",
    priority: "High",
    orderDate: "2024-02-05",
    requestedDeliveryDate: "2024-02-12",
    actualDeliveryDate: "2024-02-11",
    subtotal: 5000,
    taxRate: 8.5,
    taxAmount: 425,
    shippingCost: 500,
    totalAmount: 5925,
    shippingAddress: "123 Factory St, Production City, PC 12345",
    paymentTerms: "Net 30",
    items: [
      {
        id: "1",
        description: "Main Frame Steel - W12x65",
        partNumber: "SF-MAIN-001",
        quantity: 40,
        unit: "feet",
        unitPrice: 125,
        totalPrice: 5000,
        steelGrade: "A992",
        specifications: "ASTM A992 Grade 50",
        urgency: "High",
        requestedDate: "2024-02-12",
      },
    ],
  },
  {
    id: "PO-2024-002",
    supplierId: "SUPP-002",
    supplier: "Industrial Hardware Inc",
    status: "Shipped",
    priority: "Medium",
    orderDate: "2024-02-08",
    requestedDeliveryDate: "2024-02-15",
    subtotal: 1250,
    taxRate: 8.5,
    taxAmount: 106.25,
    shippingCost: 150,
    totalAmount: 1506.25,
    shippingAddress: "123 Factory St, Production City, PC 12345",
    paymentTerms: "Net 15",
    items: [
      {
        id: "1",
        description: "High Strength Bolts - A325",
        partNumber: "BOLT-A325-1",
        quantity: 100,
        unit: "pieces",
        unitPrice: 8.5,
        totalPrice: 850,
        specifications: '1" diameter, Grade A325',
        urgency: "Medium",
      },
      {
        id: "2",
        description: "Welding Electrodes - E7018",
        partNumber: "ELEC-E7018",
        quantity: 20,
        unit: "pounds",
        unitPrice: 20,
        totalPrice: 400,
        specifications: '3/32" diameter',
        urgency: "Low",
      },
    ],
  },
]

// Status color mappings
export const statusColors = {
  quotation: {
    Draft: "bg-gray-100 text-gray-800",
    Sent: "bg-blue-100 text-blue-800",
    "Under Review": "bg-yellow-100 text-yellow-800",
    Approved: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
  },
  engineering: {
    Planning: "bg-gray-100 text-gray-800",
    "In Progress": "bg-blue-100 text-blue-800",
    Review: "bg-yellow-100 text-yellow-800",
    Approved: "bg-green-100 text-green-800",
    "On Hold": "bg-red-100 text-red-800",
  },
  bom: {
    Draft: "bg-gray-100 text-gray-800",
    Active: "bg-green-100 text-green-800",
    Revision: "bg-yellow-100 text-yellow-800",
    Obsolete: "bg-red-100 text-red-800",
  },
  production: {
    Planned: "bg-gray-100 text-gray-800",
    "In Progress": "bg-blue-100 text-blue-800",
    "Quality Check": "bg-yellow-100 text-yellow-800",
    Completed: "bg-green-100 text-green-800",
    "On Hold": "bg-red-100 text-red-800",
  },
  invoice: {
    Draft: "bg-gray-100 text-gray-800",
    Sent: "bg-blue-100 text-blue-800",
    Paid: "bg-green-100 text-green-800",
    Overdue: "bg-red-100 text-red-800",
    Cancelled: "bg-gray-100 text-gray-800",
  },
  customer: {
    Active: "bg-green-100 text-green-800",
    Inactive: "bg-gray-100 text-gray-800",
    Prospect: "bg-blue-100 text-blue-800",
    Former: "bg-red-100 text-red-800",
  },
  procurement: {
    Draft: "bg-gray-100 text-gray-800",
    Sent: "bg-blue-100 text-blue-800",
    Acknowledged: "bg-yellow-100 text-yellow-800",
    Shipped: "bg-purple-100 text-purple-800",
    Received: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800",
  },
}

// Utility functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
