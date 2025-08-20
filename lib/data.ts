import type {
  Customer,
  Supplier,
  Quotation,
  SalesOrder,
  EngineeringDrawing,
  BillOfMaterials,
  ProductionWorkOrder,
  Invoice,
  PurchaseOrder,
} from "./types"

export const customers: Customer[] = [
  {
    id: "1",
    name: "Acme Construction Corp",
    contactPerson: "John Smith",
    email: "john.smith@acmeconstruction.com",
    phone: "+1 (555) 123-4567",
    address: "123 Industrial Blvd",
    city: "Chicago",
    state: "IL",
    zipCode: "60601",
    country: "USA",
    status: "Active",
    creditLimit: 500000,
    paymentTerms: "Net 30",
    totalOrders: 15,
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
  },
  {
    id: "2",
    name: "Metro Steel Works",
    contactPerson: "Sarah Johnson",
    email: "sarah.johnson@metrosteel.com",
    phone: "+1 (555) 987-6543",
    address: "456 Manufacturing Ave",
    city: "Detroit",
    state: "MI",
    zipCode: "48201",
    country: "USA",
    status: "Active",
    creditLimit: 750000,
    paymentTerms: "Net 45",
    totalOrders: 8,
    createdAt: "2024-02-01T09:15:00Z",
    updatedAt: "2024-02-10T16:45:00Z",
  },
]

export const suppliers: Supplier[] = [
  {
    id: "1",
    name: "Steel Supply Co",
    contactPerson: "Mike Wilson",
    email: "mike.wilson@steelsupply.com",
    phone: "+1 (555) 234-5678",
    address: "789 Steel Mill Rd",
    city: "Pittsburgh",
    state: "PA",
    zipCode: "15201",
    country: "USA",
    status: "Active",
    paymentTerms: "Net 30",
    leadTime: 14,
    qualityRating: 4.8,
    totalOrders: 45,
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-25T11:20:00Z",
  },
]

export const quotations: Quotation[] = [
  {
    id: "1",
    customerId: "1",
    customerName: "Acme Construction Corp",
    quotationNumber: "Q-2024-001",
    title: "Custom Steel Beams for Building Project",
    description: "Fabrication of custom I-beams for commercial building construction",
    status: "Approved",
    items: [
      {
        id: "1",
        description: "W12x26 Steel I-Beam, 20ft length",
        quantity: 10,
        unitPrice: 450.0,
        totalPrice: 4500.0,
        deliveryDate: "2024-03-15",
        specifications: "ASTM A992 Grade 50 steel",
        isNewItem: false,
      },
      {
        id: "2",
        description: "Custom connection plates",
        quantity: 20,
        unitPrice: 75.0,
        totalPrice: 1500.0,
        deliveryDate: "2024-03-15",
        specifications: "1/2 inch thick A36 steel plate",
        isNewItem: true,
      },
    ],
    subtotal: 6000.0,
    tax: 480.0,
    total: 6480.0,
    validUntil: "2024-03-01",
    createdAt: "2024-01-20T09:00:00Z",
    updatedAt: "2024-01-25T14:30:00Z",
    revision: "Rev A",
    notes: "Customer requested expedited delivery",
  },
]

export const salesOrders: SalesOrder[] = [
  {
    id: "1",
    customerId: "1",
    customerName: "Acme Construction Corp",
    quotationId: "1",
    salesOrderNumber: "SO-2024-001",
    customerPO: "PO-ACM-2024-0156",
    title: "Custom Steel Beams for Building Project",
    description: "Fabrication of custom I-beams for commercial building construction",
    status: "In Production",
    items: [
      {
        id: "1",
        description: "W12x26 Steel I-Beam, 20ft length",
        quantity: 10,
        unitPrice: 450.0,
        totalPrice: 4500.0,
        deliveryDate: "2024-03-15",
        specifications: "ASTM A992 Grade 50 steel",
        status: "In Production",
        bomId: "1",
        workOrderId: "1",
      },
      {
        id: "2",
        description: "Custom connection plates",
        quantity: 20,
        unitPrice: 75.0,
        totalPrice: 1500.0,
        deliveryDate: "2024-03-15",
        specifications: "1/2 inch thick A36 steel plate",
        status: "Ready",
      },
    ],
    subtotal: 6000.0,
    tax: 480.0,
    total: 6480.0,
    orderDate: "2024-02-01",
    requestedDeliveryDate: "2024-03-15",
    confirmedDeliveryDate: "2024-03-15",
    shippingAddress: "123 Industrial Blvd, Chicago, IL 60601",
    billingAddress: "123 Industrial Blvd, Chicago, IL 60601",
    paymentTerms: "Net 30",
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-02-15T16:30:00Z",
    revision: "Rev B",
    notes: "Engineering approved Rev B for production",
  },
  {
    id: "2",
    customerId: "2",
    customerName: "Metro Steel Works",
    salesOrderNumber: "SO-2024-002",
    customerPO: "PO-MSW-2024-0089",
    title: "Structural Steel Components",
    description: "Various structural steel components for warehouse expansion",
    status: "Confirmed",
    items: [
      {
        id: "3",
        description: "W14x30 Steel Column, 12ft length",
        quantity: 8,
        unitPrice: 520.0,
        totalPrice: 4160.0,
        deliveryDate: "2024-04-01",
        specifications: "ASTM A992 Grade 50 steel",
        status: "Pending",
      },
    ],
    subtotal: 4160.0,
    tax: 332.8,
    total: 4492.8,
    orderDate: "2024-02-10",
    requestedDeliveryDate: "2024-04-01",
    shippingAddress: "456 Manufacturing Ave, Detroit, MI 48201",
    billingAddress: "456 Manufacturing Ave, Detroit, MI 48201",
    paymentTerms: "Net 45",
    createdAt: "2024-02-10T11:00:00Z",
    updatedAt: "2024-02-12T09:15:00Z",
    revision: "Rev A",
    notes: "Awaiting engineering review",
  },
]

// Export as engineeringProjects to match the import in dashboard
export const engineeringProjects: EngineeringDrawing[] = [
  {
    id: "1",
    projectId: "PROJ-001",
    drawingNumber: "DWG-2024-001",
    title: "W12x26 I-Beam Assembly",
    description: "Detailed drawing for custom I-beam fabrication",
    status: "Released",
    version: "1.0",
    drawnBy: "Jane Engineer",
    checkedBy: "Bob Senior",
    approvedBy: "Alice Manager",
    createdAt: "2024-01-25T08:00:00Z",
    updatedAt: "2024-02-01T14:00:00Z",
    revision: "Rev B",
    fileUrl: "/drawings/DWG-2024-001.pdf",
    specifications: "ASTM A992 Grade 50 steel, welded connections",
    materials: ["A992 Grade 50 Steel", "E70XX Welding Rod"],
    dimensions: {
      length: 240, // 20 feet in inches
      width: 12,
      height: 12.22,
      weight: 520, // pounds per beam
    },
    notes: "Updated for production release",
  },
]

// Also export as engineeringDrawings for consistency
export const engineeringDrawings = engineeringProjects

// Export as billsOfMaterials to match the import in dashboard
export const billsOfMaterials: BillOfMaterials[] = [
  {
    id: "1",
    bomNumber: "BOM-2024-001",
    productName: "W12x26 Steel I-Beam Assembly",
    description: "Complete BOM for custom I-beam fabrication",
    status: "Released",
    version: "1.0",
    items: [
      {
        id: "1",
        partNumber: "STL-W12x26-20",
        description: "W12x26 Steel Beam, 20ft raw",
        quantity: 1,
        unit: "EA",
        unitCost: 380.0,
        totalCost: 380.0,
        supplier: "Steel Supply Co",
        leadTime: 14,
        category: "Raw Material",
        specifications: "ASTM A992 Grade 50",
      },
      {
        id: "2",
        partNumber: "WLD-E70XX",
        description: "E70XX Welding Rod",
        quantity: 2,
        unit: "LB",
        unitCost: 8.5,
        totalCost: 17.0,
        supplier: "Welding Supply Inc",
        leadTime: 3,
        category: "Raw Material",
      },
    ],
    totalCost: 397.0,
    createdBy: "Jane Engineer",
    approvedBy: "Alice Manager",
    createdAt: "2024-01-28T09:00:00Z",
    updatedAt: "2024-02-01T15:00:00Z",
    revision: "Rev B",
    engineeringDrawingId: "1",
    notes: "Released for production",
  },
]

// Export as productionOrders to match the import in dashboard
export const productionOrders: ProductionWorkOrder[] = [
  {
    id: "1",
    workOrderNumber: "WO-2024-001",
    salesOrderId: "1",
    bomId: "1",
    productName: "W12x26 Steel I-Beam Assembly",
    description: "Fabricate 10 custom I-beams per specifications",
    quantity: 10,
    status: "In Progress",
    priority: "High",
    startDate: "2024-02-05",
    dueDate: "2024-03-10",
    assignedTo: "Production Team A",
    progress: 65,
    estimatedHours: 80,
    actualHours: 52,
    createdAt: "2024-02-02T08:00:00Z",
    updatedAt: "2024-02-15T16:00:00Z",
    revision: "Rev B",
    notes: "On schedule, quality checks passed",
  },
]

// Also export as productionWorkOrders for consistency
export const productionWorkOrders = productionOrders

export const invoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-001",
    customerId: "1",
    customerName: "Acme Construction Corp",
    salesOrderId: "1",
    status: "Sent",
    items: [
      {
        id: "1",
        description: "W12x26 Steel I-Beam, 20ft length",
        quantity: 10,
        unitPrice: 450.0,
        totalPrice: 4500.0,
      },
      {
        id: "2",
        description: "Custom connection plates",
        quantity: 20,
        unitPrice: 75.0,
        totalPrice: 1500.0,
      },
    ],
    subtotal: 6000.0,
    tax: 480.0,
    total: 6480.0,
    issueDate: "2024-02-20",
    dueDate: "2024-03-21",
    createdAt: "2024-02-20T10:00:00Z",
    updatedAt: "2024-02-20T10:00:00Z",
    revision: "Rev A",
    notes: "Payment due within 30 days",
  },
]

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: "1",
    poNumber: "PO-2024-001",
    supplierId: "1",
    supplierName: "Steel Supply Co",
    status: "Sent",
    items: [
      {
        id: "1",
        partNumber: "STL-W12x26-20",
        description: "W12x26 Steel Beam, 20ft raw",
        quantity: 12,
        unitPrice: 380.0,
        totalPrice: 4560.0,
        requestedDate: "2024-02-15",
        specifications: "ASTM A992 Grade 50",
      },
    ],
    subtotal: 4560.0,
    tax: 364.8,
    total: 4924.8,
    orderDate: "2024-02-01",
    requestedDeliveryDate: "2024-02-15",
    paymentTerms: "Net 30",
    createdAt: "2024-02-01T11:00:00Z",
    updatedAt: "2024-02-01T11:00:00Z",
    revision: "Rev A",
    notes: "Rush order for production schedule",
  },
]

export const statusColors = {
  quotation: {
    Draft: "bg-gray-100 text-gray-800",
    Sent: "bg-blue-100 text-blue-800",
    Approved: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
    Expired: "bg-yellow-100 text-yellow-800",
  },
  salesOrder: {
    Draft: "bg-gray-100 text-gray-800",
    Confirmed: "bg-blue-100 text-blue-800",
    "In Production": "bg-yellow-100 text-yellow-800",
    Shipped: "bg-purple-100 text-purple-800",
    Delivered: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800",
  },
  engineering: {
    Draft: "bg-gray-100 text-gray-800",
    "Under Review": "bg-yellow-100 text-yellow-800",
    Approved: "bg-green-100 text-green-800",
    Released: "bg-blue-100 text-blue-800",
    Obsolete: "bg-red-100 text-red-800",
  },
  bom: {
    Draft: "bg-gray-100 text-gray-800",
    "Under Review": "bg-yellow-100 text-yellow-800",
    Approved: "bg-green-100 text-green-800",
    Released: "bg-blue-100 text-blue-800",
    Obsolete: "bg-red-100 text-red-800",
  },
  production: {
    Planned: "bg-gray-100 text-gray-800",
    "In Progress": "bg-blue-100 text-blue-800",
    "On Hold": "bg-yellow-100 text-yellow-800",
    Completed: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800",
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
    Suspended: "bg-red-100 text-red-800",
  },
  supplier: {
    Active: "bg-green-100 text-green-800",
    Inactive: "bg-gray-100 text-gray-800",
    Suspended: "bg-red-100 text-red-800",
  },
  purchaseOrder: {
    Draft: "bg-gray-100 text-gray-800",
    Sent: "bg-blue-100 text-blue-800",
    Acknowledged: "bg-yellow-100 text-yellow-800",
    Shipped: "bg-purple-100 text-purple-800",
    Received: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800",
  },
}

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
