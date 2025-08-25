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

// Database configuration
const DB_VERSION = "1.0.0"
const DB_PREFIX = "mrp_prototype_"

// Database keys
const DB_KEYS = {
  VERSION: `${DB_PREFIX}version`,
  CUSTOMERS: `${DB_PREFIX}customers`,
  SUPPLIERS: `${DB_PREFIX}suppliers`,
  QUOTATIONS: `${DB_PREFIX}quotations`,
  SALES_ORDERS: `${DB_PREFIX}sales_orders`,
  ENGINEERING_DRAWINGS: `${DB_PREFIX}engineering_drawings`,
  BILLS_OF_MATERIALS: `${DB_PREFIX}bills_of_materials`,
  PRODUCTION_WORK_ORDERS: `${DB_PREFIX}production_work_orders`,
  INVOICES: `${DB_PREFIX}invoices`,
  PURCHASE_ORDERS: `${DB_PREFIX}purchase_orders`,
} as const

// Database class
class LocalDatabase {
  private static instance: LocalDatabase
  private isInitialized = false

  private constructor() { }

  static getInstance(): LocalDatabase {
    if (!LocalDatabase.instance) {
      LocalDatabase.instance = new LocalDatabase()
    }
    return LocalDatabase.instance
  }

  // Initialize database with default data
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log("Initializing database...")
      const version = localStorage.getItem(DB_KEYS.VERSION)
      console.log("Current database version:", version, "Expected:", DB_VERSION)

      if (version !== DB_VERSION) {
        // Database version mismatch or first time setup
        console.log("Version mismatch, seeding database...")
        await this.seedDatabase()
        localStorage.setItem(DB_KEYS.VERSION, DB_VERSION)
        console.log("Database version updated to:", DB_VERSION)
      } else {
        console.log("Database version matches, skipping seeding")
      }

      this.isInitialized = true
      console.log("Local database initialized successfully")
    } catch (error) {
      console.error("Failed to initialize database:", error)
      throw error
    }
  }

  // Seed database with initial data
  private async seedDatabase(): Promise<void> {
    try {
      // Import data directly instead of dynamic import
      const { customers, suppliers, quotations, salesOrders, engineeringDrawings, billsOfMaterials, productionWorkOrders, invoices, purchaseOrders } = await import("./data")

      console.log("Seeding database with:", { customers: customers.length, suppliers: suppliers.length, quotations: quotations.length })

      // Seed customers
      this.setCustomers(customers)

      // Seed suppliers
      this.setSuppliers(suppliers)

      // Seed quotations
      this.setQuotations(quotations)

      // Seed sales orders
      this.setSalesOrders(salesOrders)

      // Seed engineering drawings
      this.setEngineeringDrawings(engineeringDrawings)

      // Seed bills of materials
      this.setBillsOfMaterials(billsOfMaterials)

      // Seed production work orders
      this.setProductionWorkOrders(productionWorkOrders)

      // Seed invoices
      this.setInvoices(invoices)

      // Seed purchase orders
      this.setPurchaseOrders(purchaseOrders)

      console.log("Database seeding completed successfully")
    } catch (error) {
      console.error("Error seeding database:", error)
      throw error
    }
  }

  // Generic CRUD operations
  private getItem<T>(key: string): T[] {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : []
    } catch (error) {
      console.error(`Error reading from ${key}:`, error)
      return []
    }
  }

  private setItem<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error(`Error writing to ${key}:`, error)
      throw error
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private updateTimestamps<T>(
    item: T,
    isNew: boolean = false
  ): T & { createdAt: string; updatedAt: string } {
    const now = new Date().toISOString()
    const result = { ...item } as T & { createdAt: string; updatedAt: string }
    if (isNew) {
      result.createdAt = now
    }
    result.updatedAt = now
    return result
  }

  // Customer operations
  getCustomers(): Customer[] {
    return this.getItem<Customer>(DB_KEYS.CUSTOMERS)
  }

  getCustomer(id: string): Customer | null {
    const customers = this.getCustomers()
    return customers.find(c => c.id === id) || null
  }

  setCustomers(customers: Customer[]): void {
    this.setItem(DB_KEYS.CUSTOMERS, customers)
  }

  createCustomer(customer: Omit<Customer, "id" | "createdAt" | "updatedAt">): Customer {
    const customers = this.getCustomers()
    const newCustomer = {
      ...customer,
      id: this.generateId(),
      totalOrders: 0,
    }

    const updatedCustomer = this.updateTimestamps(newCustomer, true)
    customers.push(updatedCustomer)
    this.setCustomers(customers)

    return updatedCustomer
  }

  updateCustomer(id: string, updates: Partial<Customer>): Customer | null {
    const customers = this.getCustomers()
    const index = customers.findIndex(c => c.id === id)

    if (index === -1) return null

    const updatedCustomer = this.updateTimestamps({
      ...customers[index],
      ...updates,
    })

    customers[index] = updatedCustomer
    this.setCustomers(customers)

    return updatedCustomer
  }

  deleteCustomer(id: string): boolean {
    const customers = this.getCustomers()
    const filtered = customers.filter(c => c.id !== id)

    if (filtered.length === customers.length) return false

    this.setCustomers(filtered)
    return true
  }

  // Supplier operations
  getSuppliers(): Supplier[] {
    return this.getItem<Supplier>(DB_KEYS.SUPPLIERS)
  }

  getSupplier(id: string): Supplier | null {
    const suppliers = this.getSuppliers()
    return suppliers.find(s => s.id === id) || null
  }

  setSuppliers(suppliers: Supplier[]): void {
    this.setItem(DB_KEYS.SUPPLIERS, suppliers)
  }

  createSupplier(supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt">): Supplier {
    const suppliers = this.getSuppliers()
    const newSupplier = {
      ...supplier,
      id: this.generateId(),
      totalOrders: 0,
    }

    const updatedSupplier = this.updateTimestamps(newSupplier, true)
    suppliers.push(updatedSupplier)
    this.setSuppliers(suppliers)

    return updatedSupplier
  }

  updateSupplier(id: string, updates: Partial<Supplier>): Supplier | null {
    const suppliers = this.getSuppliers()
    const index = suppliers.findIndex(s => s.id === id)

    if (index === -1) return null

    const updatedSupplier = this.updateTimestamps({
      ...suppliers[index],
      ...updates,
    })

    suppliers[index] = updatedSupplier
    this.setSuppliers(suppliers)

    return updatedSupplier
  }

  deleteSupplier(id: string): boolean {
    const suppliers = this.getSuppliers()
    const filtered = suppliers.filter(s => s.id !== id)

    if (filtered.length === suppliers.length) return false

    this.setSuppliers(filtered)
    return true
  }

  // Quotation operations
  getQuotations(): Quotation[] {
    return this.getItem<Quotation>(DB_KEYS.QUOTATIONS)
  }

  getQuotation(id: string): Quotation | null {
    const quotations = this.getQuotations()
    return quotations.find(q => q.id === id) || null
  }

  setQuotations(quotations: Quotation[]): void {
    this.setItem(DB_KEYS.QUOTATIONS, quotations)
  }

  createQuotation(quotation: Omit<Quotation, "id" | "createdAt" | "updatedAt">): Quotation {
    const quotations = this.getQuotations()
    const newQuotation = {
      ...quotation,
      id: this.generateId(),
    }

    const updatedQuotation = this.updateTimestamps(newQuotation, true)
    quotations.push(updatedQuotation)
    this.setQuotations(quotations)

    return updatedQuotation
  }

  updateQuotation(id: string, updates: Partial<Quotation>): Quotation | null {
    const quotations = this.getQuotations()
    const index = quotations.findIndex(q => q.id === id)

    if (index === -1) return null

    const updatedQuotation = this.updateTimestamps({
      ...quotations[index],
      ...updates,
    })

    quotations[index] = updatedQuotation
    this.setQuotations(quotations)

    return updatedQuotation
  }

  deleteQuotation(id: string): boolean {
    const quotations = this.getQuotations()
    const filtered = quotations.filter(q => q.id !== id)

    if (filtered.length === quotations.length) return false

    this.setQuotations(filtered)
    return true
  }

  // Sales Order operations
  getSalesOrders(): SalesOrder[] {
    return this.getItem<SalesOrder>(DB_KEYS.SALES_ORDERS)
  }

  getSalesOrder(id: string): SalesOrder | null {
    const salesOrders = this.getSalesOrders()
    return salesOrders.find(so => so.id === id) || null
  }

  setSalesOrders(salesOrders: SalesOrder[]): void {
    this.setItem(DB_KEYS.SALES_ORDERS, salesOrders)
  }

  createSalesOrder(salesOrder: Omit<SalesOrder, "id" | "createdAt" | "updatedAt">): SalesOrder {
    const salesOrders = this.getSalesOrders()
    const newSalesOrder = {
      ...salesOrder,
      id: this.generateId(),
    }

    const updatedSalesOrder = this.updateTimestamps(newSalesOrder, true)
    salesOrders.push(updatedSalesOrder)
    this.setSalesOrders(salesOrders)

    return updatedSalesOrder
  }

  updateSalesOrder(id: string, updates: Partial<SalesOrder>): SalesOrder | null {
    const salesOrders = this.getSalesOrders()
    const index = salesOrders.findIndex(so => so.id === id)

    if (index === -1) return null

    const updatedSalesOrder = this.updateTimestamps({
      ...salesOrders[index],
      ...updates,
    })

    salesOrders[index] = updatedSalesOrder
    this.setSalesOrders(salesOrders)

    return updatedSalesOrder
  }

  deleteSalesOrder(id: string): boolean {
    const salesOrders = this.getSalesOrders()
    const filtered = salesOrders.filter(so => so.id !== id)

    if (filtered.length === salesOrders.length) return false

    this.setSalesOrders(filtered)
    return true
  }

  // Engineering Drawing operations
  getEngineeringDrawings(): EngineeringDrawing[] {
    return this.getItem<EngineeringDrawing>(DB_KEYS.ENGINEERING_DRAWINGS)
  }

  getEngineeringDrawing(id: string): EngineeringDrawing | null {
    const drawings = this.getEngineeringDrawings()
    return drawings.find(d => d.id === id) || null
  }

  setEngineeringDrawings(drawings: EngineeringDrawing[]): void {
    this.setItem(DB_KEYS.ENGINEERING_DRAWINGS, drawings)
  }

  createEngineeringDrawing(drawing: Omit<EngineeringDrawing, "id" | "createdAt" | "updatedAt">): EngineeringDrawing {
    const drawings = this.getEngineeringDrawings()
    const newDrawing = {
      ...drawing,
      id: this.generateId(),
    }

    const updatedDrawing = this.updateTimestamps(newDrawing, true)
    drawings.push(updatedDrawing)
    this.setEngineeringDrawings(drawings)

    return updatedDrawing
  }

  updateEngineeringDrawing(id: string, updates: Partial<EngineeringDrawing>): EngineeringDrawing | null {
    const drawings = this.getEngineeringDrawings()
    const index = drawings.findIndex(d => d.id === id)

    if (index === -1) return null

    const updatedDrawing = this.updateTimestamps({
      ...drawings[index],
      ...updates,
    })

    drawings[index] = updatedDrawing
    this.setEngineeringDrawings(drawings)

    return updatedDrawing
  }

  deleteEngineeringDrawing(id: string): boolean {
    const drawings = this.getEngineeringDrawings()
    const filtered = drawings.filter(d => d.id !== id)

    if (filtered.length === drawings.length) return false

    this.setEngineeringDrawings(filtered)
    return true
  }

  // Bill of Materials operations
  getBillsOfMaterials(): BillOfMaterials[] {
    return this.getItem<BillOfMaterials>(DB_KEYS.BILLS_OF_MATERIALS)
  }

  getBillOfMaterials(id: string): BillOfMaterials | null {
    const boms = this.getBillsOfMaterials()
    return boms.find(b => b.id === id) || null
  }

  setBillsOfMaterials(boms: BillOfMaterials[]): void {
    this.setItem(DB_KEYS.BILLS_OF_MATERIALS, boms)
  }

  createBillOfMaterials(bom: Omit<BillOfMaterials, "id" | "createdAt" | "updatedAt">): BillOfMaterials {
    const boms = this.getBillsOfMaterials()
    const newBom = {
      ...bom,
      id: this.generateId(),
    }

    const updatedBom = this.updateTimestamps(newBom, true)
    boms.push(updatedBom)
    this.setBillsOfMaterials(boms)

    return updatedBom
  }

  updateBillOfMaterials(id: string, updates: Partial<BillOfMaterials>): BillOfMaterials | null {
    const boms = this.getBillsOfMaterials()
    const index = boms.findIndex(b => b.id === id)

    if (index === -1) return null

    const updatedBom = this.updateTimestamps({
      ...boms[index],
      ...updates,
    })

    boms[index] = updatedBom
    this.setBillsOfMaterials(boms)

    return updatedBom
  }

  deleteBillOfMaterials(id: string): boolean {
    const boms = this.getBillsOfMaterials()
    const filtered = boms.filter(b => b.id !== id)

    if (filtered.length === boms.length) return false

    this.setBillsOfMaterials(filtered)
    return true
  }

  // Production Work Order operations
  getProductionWorkOrders(): ProductionWorkOrder[] {
    return this.getItem<ProductionWorkOrder>(DB_KEYS.PRODUCTION_WORK_ORDERS)
  }

  getProductionWorkOrder(id: string): ProductionWorkOrder | null {
    const workOrders = this.getProductionWorkOrders()
    return workOrders.find(wo => wo.id === id) || null
  }

  setProductionWorkOrders(workOrders: ProductionWorkOrder[]): void {
    this.setItem(DB_KEYS.PRODUCTION_WORK_ORDERS, workOrders)
  }

  createProductionWorkOrder(workOrder: Omit<ProductionWorkOrder, "id" | "createdAt" | "updatedAt">): ProductionWorkOrder {
    const workOrders = this.getProductionWorkOrders()
    const newWorkOrder = {
      ...workOrder,
      id: this.generateId(),
    }

    const updatedWorkOrder = this.updateTimestamps(newWorkOrder, true)
    workOrders.push(updatedWorkOrder)
    this.setProductionWorkOrders(workOrders)

    return updatedWorkOrder
  }

  updateProductionWorkOrder(id: string, updates: Partial<ProductionWorkOrder>): ProductionWorkOrder | null {
    const workOrders = this.getProductionWorkOrders()
    const index = workOrders.findIndex(wo => wo.id === id)

    if (index === -1) return null

    const updatedWorkOrder = this.updateTimestamps({
      ...workOrders[index],
      ...updates,
    })

    workOrders[index] = updatedWorkOrder
    this.setProductionWorkOrders(workOrders)

    return updatedWorkOrder
  }

  deleteProductionWorkOrder(id: string): boolean {
    const workOrders = this.getProductionWorkOrders()
    const filtered = workOrders.filter(wo => wo.id !== id)

    if (filtered.length === workOrders.length) return false

    this.setProductionWorkOrders(filtered)
    return true
  }

  // Invoice operations
  getInvoices(): Invoice[] {
    return this.getItem<Invoice>(DB_KEYS.INVOICES)
  }

  getInvoice(id: string): Invoice | null {
    const invoices = this.getInvoices()
    return invoices.find(i => i.id === id) || null
  }

  setInvoices(invoices: Invoice[]): void {
    this.setItem(DB_KEYS.INVOICES, invoices)
  }

  createInvoice(invoice: Omit<Invoice, "id" | "createdAt" | "updatedAt">): Invoice {
    const invoices = this.getInvoices()
    const newInvoice = {
      ...invoice,
      id: this.generateId(),
    }

    const updatedInvoice = this.updateTimestamps(newInvoice, true)
    invoices.push(updatedInvoice)
    this.setInvoices(invoices)

    return updatedInvoice
  }

  updateInvoice(id: string, updates: Partial<Invoice>): Invoice | null {
    const invoices = this.getInvoices()
    const index = invoices.findIndex(i => i.id === id)

    if (index === -1) return null

    const updatedInvoice = this.updateTimestamps({
      ...invoices[index],
      ...updates,
    })

    invoices[index] = updatedInvoice
    this.setInvoices(invoices)

    return updatedInvoice
  }

  deleteInvoice(id: string): boolean {
    const invoices = this.getInvoices()
    const filtered = invoices.filter(i => i.id !== id)

    if (filtered.length === invoices.length) return false

    this.setInvoices(filtered)
    return true
  }

  // Purchase Order operations
  getPurchaseOrders(): PurchaseOrder[] {
    return this.getItem<PurchaseOrder>(DB_KEYS.PURCHASE_ORDERS)
  }

  getPurchaseOrder(id: string): PurchaseOrder | null {
    const purchaseOrders = this.getPurchaseOrders()
    return purchaseOrders.find(po => po.id === id) || null
  }

  setPurchaseOrders(purchaseOrders: PurchaseOrder[]): void {
    this.setItem(DB_KEYS.PURCHASE_ORDERS, purchaseOrders)
  }

  createPurchaseOrder(purchaseOrder: Omit<PurchaseOrder, "id" | "createdAt" | "updatedAt">): PurchaseOrder {
    const purchaseOrders = this.getPurchaseOrders()
    const newPurchaseOrder = {
      ...purchaseOrder,
      id: this.generateId(),
    }

    const updatedPurchaseOrder = this.updateTimestamps(newPurchaseOrder, true)
    purchaseOrders.push(updatedPurchaseOrder)
    this.setPurchaseOrders(purchaseOrders)

    return updatedPurchaseOrder
  }

  updatePurchaseOrder(id: string, updates: Partial<PurchaseOrder>): PurchaseOrder | null {
    const purchaseOrders = this.getPurchaseOrders()
    const index = purchaseOrders.findIndex(po => po.id === id)

    if (index === -1) return null

    const updatedPurchaseOrder = this.updateTimestamps({
      ...purchaseOrders[index],
      ...updates,
    })

    purchaseOrders[index] = updatedPurchaseOrder
    this.setPurchaseOrders(purchaseOrders)

    return updatedPurchaseOrder
  }

  deletePurchaseOrder(id: string): boolean {
    const purchaseOrders = this.getPurchaseOrders()
    const filtered = purchaseOrders.filter(po => po.id !== id)

    if (filtered.length === purchaseOrders.length) return false

    this.setPurchaseOrders(filtered)
    return true
  }

  // Utility methods
  clearDatabase(): void {
    Object.values(DB_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    localStorage.removeItem(DB_KEYS.VERSION)
    this.isInitialized = false
  }

  exportDatabase(): Record<string, any> {
    const exportData: Record<string, any> = {}
    Object.entries(DB_KEYS).forEach(([key, value]) => {
      exportData[key] = this.getItem(value)
    })
    return exportData
  }

  importDatabase(data: Record<string, any>): void {
    Object.entries(data).forEach(([key, value]) => {
      if (Object.values(DB_KEYS).includes(key as any)) {
        localStorage.setItem(key, JSON.stringify(value))
      }
    })
  }

  // Search and filter methods
  searchCustomers(query: string): Customer[] {
    const customers = this.getCustomers()
    const lowerQuery = query.toLowerCase()
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(lowerQuery) ||
      customer.contactPerson.toLowerCase().includes(lowerQuery) ||
      customer.email.toLowerCase().includes(lowerQuery)
    )
  }

  searchSuppliers(query: string): Supplier[] {
    const suppliers = this.getSuppliers()
    const lowerQuery = query.toLowerCase()
    return suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(lowerQuery) ||
      supplier.contactPerson.toLowerCase().includes(lowerQuery) ||
      supplier.email.toLowerCase().includes(lowerQuery)
    )
  }

  getCustomersByStatus(status: Customer["status"]): Customer[] {
    const customers = this.getCustomers()
    return customers.filter(customer => customer.status === status)
  }

  getSuppliersByStatus(status: Supplier["status"]): Supplier[] {
    const suppliers = this.getSuppliers()
    return suppliers.filter(supplier => supplier.status === status)
  }
}

// Export singleton instance
export const db = LocalDatabase.getInstance()

// Export types for convenience
export type { LocalDatabase }
