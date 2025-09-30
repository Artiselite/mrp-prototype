import type {
  Customer,
  Supplier,
  Quotation,
  SalesOrder,
  EngineeringDrawing,
  EngineeringProject,
  EngineeringChange,
  BillOfMaterials,
  BillOfQuantities,
  ProductionWorkOrder,
  Workstation,
  Operator,
  ShopfloorActivity,
  QualityInspection,
  QualityTest,
  QualityMetric,
  Invoice,
  PurchaseOrder,
  Item,
  Location,
  ProcessStep,
  ProjectSubcontractor,
  SubcontractorWorkOrder,
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
  ENGINEERING_PROJECTS: `${DB_PREFIX}engineering_projects`,
  ENGINEERING_CHANGES: `${DB_PREFIX}engineering_changes`,
  BILLS_OF_MATERIALS: `${DB_PREFIX}bills_of_materials`,
  BILLS_OF_QUANTITIES: `${DB_PREFIX}bills_of_quantities`,
  PRODUCTION_WORK_ORDERS: `${DB_PREFIX}production_work_orders`,
  WORKSTATIONS: `${DB_PREFIX}workstations`,
  OPERATORS: `${DB_PREFIX}operators`,
  SHOPFLOOR_ACTIVITIES: `${DB_PREFIX}shopfloor_activities`,
  QUALITY_INSPECTIONS: `${DB_PREFIX}quality_inspections`,
  QUALITY_TESTS: `${DB_PREFIX}quality_tests`,
  QUALITY_METRICS: `${DB_PREFIX}quality_metrics`,
  INVOICES: `${DB_PREFIX}invoices`,
  PURCHASE_ORDERS: `${DB_PREFIX}purchase_orders`,
  ITEMS: `${DB_PREFIX}items`,
  LOCATIONS: `${DB_PREFIX}locations`,
  PROCESS_STEPS: `${DB_PREFIX}process_steps`,
  PROJECT_SUBCONTRACTORS: `${DB_PREFIX}project_subcontractors`,
  SUBCONTRACTOR_WORK_ORDERS: `${DB_PREFIX}subcontractor_work_orders`,
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
      const { customers, suppliers, quotations, salesOrders, engineeringDrawings, 
        engineeringProjects, engineeringChanges, billsOfMaterials, billsOfQuantities, 
        productionWorkOrders, workstations, operators, shopfloorActivities, 
        qualityInspections, qualityTests, qualityMetrics, invoices, purchaseOrders, items, locations,
        projectSubcontractors, subcontractorWorkOrders } = await import("./data")

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

      // Seed engineering projects
      this.setEngineeringProjects(engineeringProjects)

      // Seed engineering changes
      this.setEngineeringChanges(engineeringChanges)

      // Seed bills of materials
      this.setBillsOfMaterials(billsOfMaterials)

      // Seed bills of quantities
      this.setBillsOfQuantities(billsOfQuantities)

      // Seed production work orders
      this.setProductionWorkOrders(productionWorkOrders)

      // Seed workstations
      this.setWorkstations(workstations)

      // Seed operators
      this.setOperators(operators)

      // Seed shopfloor activities
      this.setShopfloorActivities(shopfloorActivities)

      // Seed quality inspections
      this.setQualityInspections(qualityInspections)

      // Seed quality tests
      this.setQualityTests(qualityTests)

      // Seed quality metrics
      this.setQualityMetrics(qualityMetrics)

      // Seed invoices
      this.setInvoices(invoices)

      // Seed purchase orders
      this.setPurchaseOrders(purchaseOrders)

      // Seed items
      this.setItems(items)

      // Seed locations
      this.setLocations(locations)

      // Seed project subcontractors
      this.setProjectSubcontractors(projectSubcontractors)

      // Seed subcontractor work orders
      this.setSubcontractorWorkOrders(subcontractorWorkOrders)

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

  // Bill of Quantities operations
  getBillsOfQuantities(): BillOfQuantities[] {
    return this.getItem<BillOfQuantities>(DB_KEYS.BILLS_OF_QUANTITIES)
  }

  getBillOfQuantities(id: string): BillOfQuantities | null {
    const boqs = this.getBillsOfQuantities()
    return boqs.find(b => b.id === id) || null
  }

  setBillsOfQuantities(boqs: BillOfQuantities[]): void {
    this.setItem(DB_KEYS.BILLS_OF_QUANTITIES, boqs)
  }

  createBillOfQuantities(boq: Omit<BillOfQuantities, "id" | "createdAt" | "updatedAt">): BillOfQuantities {
    const boqs = this.getBillsOfQuantities()
    const newBoq = {
      ...boq,
      id: this.generateId(),
    }

    const updatedBoq = this.updateTimestamps(newBoq, true)
    boqs.push(updatedBoq)
    this.setBillsOfQuantities(boqs)

    return updatedBoq
  }

  updateBillOfQuantities(id: string, updates: Partial<BillOfQuantities>): BillOfQuantities | null {
    const boqs = this.getBillsOfQuantities()
    const index = boqs.findIndex(b => b.id === id)

    if (index === -1) return null

    const updatedBoq = this.updateTimestamps({
      ...boqs[index],
      ...updates,
    })

    boqs[index] = updatedBoq
    this.setBillsOfQuantities(boqs)

    return updatedBoq
  }

  deleteBillOfQuantities(id: string): boolean {
    const boqs = this.getBillsOfQuantities()
    const filtered = boqs.filter(b => b.id !== id)

    if (filtered.length === boqs.length) return false

    this.setBillsOfQuantities(filtered)
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

  // Workstation operations
  getWorkstations(): Workstation[] {
    return this.getItem<Workstation>(DB_KEYS.WORKSTATIONS)
  }

  setWorkstations(workstations: Workstation[]): void {
    this.setItem(DB_KEYS.WORKSTATIONS, workstations)
  }

  createWorkstation(workstation: Omit<Workstation, "id" | "createdAt" | "updatedAt">): Workstation {
    const workstations = this.getWorkstations()
    const newWorkstation: Workstation = {
      ...workstation,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    workstations.push(newWorkstation)
    this.setWorkstations(workstations)
    return newWorkstation
  }

  updateWorkstation(id: string, updates: Partial<Workstation>): Workstation | null {
    const workstations = this.getWorkstations()
    const index = workstations.findIndex(ws => ws.id === id)
    
    if (index === -1) return null
    
    workstations[index] = {
      ...workstations[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    this.setWorkstations(workstations)
    return workstations[index]
  }

  deleteWorkstation(id: string): boolean {
    const workstations = this.getWorkstations()
    const filtered = workstations.filter(ws => ws.id !== id)
    
    if (filtered.length === workstations.length) return false
    
    this.setWorkstations(filtered)
    return true
  }

  // Process Steps operations
  getProcessSteps(): ProcessStep[] {
    return this.getItem<ProcessStep>(DB_KEYS.PROCESS_STEPS)
  }

  getProcessStepsByWorkOrder(workOrderId: string): ProcessStep[] {
    const processSteps = this.getProcessSteps()
    return processSteps.filter(step => step.workOrderId === workOrderId)
  }

  getProcessStep(id: string): ProcessStep | null {
    const processSteps = this.getProcessSteps()
    return processSteps.find(step => step.id === id) || null
  }

  setProcessSteps(processSteps: ProcessStep[]): void {
    this.setItem(DB_KEYS.PROCESS_STEPS, processSteps)
  }

  createProcessStep(processStep: Omit<ProcessStep, "id" | "createdAt" | "updatedAt">): ProcessStep {
    const processSteps = this.getProcessSteps()
    const newProcessStep: ProcessStep = {
      ...processStep,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    processSteps.push(newProcessStep)
    this.setProcessSteps(processSteps)
    return newProcessStep
  }

  updateProcessStep(id: string, updates: Partial<ProcessStep>): ProcessStep | null {
    const processSteps = this.getProcessSteps()
    const index = processSteps.findIndex(step => step.id === id)
    
    if (index === -1) return null
    
    processSteps[index] = {
      ...processSteps[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    this.setProcessSteps(processSteps)
    return processSteps[index]
  }

  deleteProcessStep(id: string): boolean {
    const processSteps = this.getProcessSteps()
    const filtered = processSteps.filter(step => step.id !== id)
    
    if (filtered.length === processSteps.length) return false
    
    this.setProcessSteps(filtered)
    return true
  }

  deleteProcessStepsByWorkOrder(workOrderId: string): boolean {
    const processSteps = this.getProcessSteps()
    const filtered = processSteps.filter(step => step.workOrderId !== workOrderId)
    
    if (filtered.length === processSteps.length) return false
    
    this.setProcessSteps(filtered)
    return true
  }

  // Operator operations
  getOperators(): Operator[] {
    return this.getItem<Operator>(DB_KEYS.OPERATORS)
  }

  setOperators(operators: Operator[]): void {
    this.setItem(DB_KEYS.OPERATORS, operators)
  }

  createOperator(operator: Omit<Operator, "id" | "createdAt" | "updatedAt">): Operator {
    const operators = this.getOperators()
    const newOperator: Operator = {
      ...operator,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    operators.push(newOperator)
    this.setOperators(operators)
    return newOperator
  }

  updateOperator(id: string, updates: Partial<Operator>): Operator | null {
    const operators = this.getOperators()
    const index = operators.findIndex(op => op.id === id)
    
    if (index === -1) return null
    
    operators[index] = {
      ...operators[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    this.setOperators(operators)
    return operators[index]
  }

  deleteOperator(id: string): boolean {
    const operators = this.getOperators()
    const filtered = operators.filter(op => op.id !== id)
    
    if (filtered.length === operators.length) return false
    
    this.setOperators(filtered)
    return true
  }

  // Shopfloor Activity operations
  getShopfloorActivities(): ShopfloorActivity[] {
    return this.getItem<ShopfloorActivity>(DB_KEYS.SHOPFLOOR_ACTIVITIES)
  }

  setShopfloorActivities(activities: ShopfloorActivity[]): void {
    this.setItem(DB_KEYS.SHOPFLOOR_ACTIVITIES, activities)
  }

  createShopfloorActivity(activity: Omit<ShopfloorActivity, "id">): ShopfloorActivity {
    const activities = this.getShopfloorActivities()
    const newActivity: ShopfloorActivity = {
      ...activity,
      id: this.generateId()
    }
    
    activities.push(newActivity)
    this.setShopfloorActivities(activities)
    return newActivity
  }

  updateShopfloorActivity(id: string, updates: Partial<ShopfloorActivity>): ShopfloorActivity | null {
    const activities = this.getShopfloorActivities()
    const index = activities.findIndex(activity => activity.id === id)
    
    if (index === -1) return null
    
    activities[index] = {
      ...activities[index],
      ...updates
    }
    
    this.setShopfloorActivities(activities)
    return activities[index]
  }

  deleteShopfloorActivity(id: string): boolean {
    const activities = this.getShopfloorActivities()
    const filtered = activities.filter(activity => activity.id !== id)
    
    if (filtered.length === activities.length) return false
    
    this.setShopfloorActivities(filtered)
    return true
  }

  // Quality Inspection operations
  getQualityInspections(): QualityInspection[] {
    return this.getItem<QualityInspection>(DB_KEYS.QUALITY_INSPECTIONS)
  }

  setQualityInspections(inspections: QualityInspection[]): void {
    this.setItem(DB_KEYS.QUALITY_INSPECTIONS, inspections)
  }

  createQualityInspection(inspection: Omit<QualityInspection, "id" | "createdAt" | "updatedAt">): QualityInspection {
    const inspections = this.getQualityInspections()
    const newInspection: QualityInspection = {
      ...inspection,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    inspections.push(newInspection)
    this.setQualityInspections(inspections)
    return newInspection
  }

  updateQualityInspection(id: string, updates: Partial<QualityInspection>): QualityInspection | null {
    const inspections = this.getQualityInspections()
    const index = inspections.findIndex(qi => qi.id === id)
    
    if (index === -1) return null
    
    inspections[index] = {
      ...inspections[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    this.setQualityInspections(inspections)
    return inspections[index]
  }

  deleteQualityInspection(id: string): boolean {
    const inspections = this.getQualityInspections()
    const filtered = inspections.filter(qi => qi.id !== id)
    
    if (filtered.length === inspections.length) return false
    
    this.setQualityInspections(filtered)
    return true
  }

  // Quality Test operations
  getQualityTests(): QualityTest[] {
    return this.getItem<QualityTest>(DB_KEYS.QUALITY_TESTS)
  }

  setQualityTests(tests: QualityTest[]): void {
    this.setItem(DB_KEYS.QUALITY_TESTS, tests)
  }

  createQualityTest(test: Omit<QualityTest, "id" | "createdAt" | "updatedAt">): QualityTest {
    const tests = this.getQualityTests()
    const newTest: QualityTest = {
      ...test,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    tests.push(newTest)
    this.setQualityTests(tests)
    return newTest
  }

  updateQualityTest(id: string, updates: Partial<QualityTest>): QualityTest | null {
    const tests = this.getQualityTests()
    const index = tests.findIndex(qt => qt.id === id)
    
    if (index === -1) return null
    
    tests[index] = {
      ...tests[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    this.setQualityTests(tests)
    return tests[index]
  }

  deleteQualityTest(id: string): boolean {
    const tests = this.getQualityTests()
    const filtered = tests.filter(qt => qt.id !== id)
    
    if (filtered.length === tests.length) return false
    
    this.setQualityTests(filtered)
    return true
  }

  // Quality Metric operations
  getQualityMetrics(): QualityMetric[] {
    return this.getItem<QualityMetric>(DB_KEYS.QUALITY_METRICS)
  }

  setQualityMetrics(metrics: QualityMetric[]): void {
    this.setItem(DB_KEYS.QUALITY_METRICS, metrics)
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

  // Item operations
  getItems(): Item[] {
    return this.getItem<Item>(DB_KEYS.ITEMS)
  }

  getItemById(id: string): Item | null {
    const items = this.getItems()
    return items.find(item => item.id === id) || null
  }

  setItems(items: Item[]): void {
    this.setItem(DB_KEYS.ITEMS, items)
  }

  createItem(item: Omit<Item, "id" | "createdAt" | "updatedAt">): Item {
    const items = this.getItems()
    const newItem = {
      ...item,
      id: this.generateId(),
    }

    const updatedItem = this.updateTimestamps(newItem, true)
    items.push(updatedItem)
    this.setItems(items)

    return updatedItem
  }

  updateItem(id: string, updates: Partial<Item>): Item | null {
    const items = this.getItems()
    const index = items.findIndex(item => item.id === id)

    if (index === -1) return null

    const updatedItem = this.updateTimestamps({
      ...items[index],
      ...updates,
    })

    items[index] = updatedItem
    this.setItems(items)

    return updatedItem
  }

  deleteItem(id: string): boolean {
    const items = this.getItems()
    const filtered = items.filter(item => item.id !== id)

    if (filtered.length === items.length) return false

    this.setItems(filtered)
    return true
  }

  // Location operations
  getLocations(): Location[] {
    return this.getItem<Location>(DB_KEYS.LOCATIONS)
  }

  getLocation(id: string): Location | null {
    const locations = this.getLocations()
    return locations.find(location => location.id === id) || null
  }

  setLocations(locations: Location[]): void {
    this.setItem(DB_KEYS.LOCATIONS, locations)
  }

  createLocation(location: Omit<Location, "id" | "createdAt" | "updatedAt">): Location {
    const locations = this.getLocations()
    const newLocation = {
      ...location,
      id: this.generateId(),
    }

    const updatedLocation = this.updateTimestamps(newLocation, true)
    locations.push(updatedLocation)
    this.setLocations(locations)

    return updatedLocation
  }

  updateLocation(id: string, updates: Partial<Location>): Location | null {
    const locations = this.getLocations()
    const index = locations.findIndex(location => location.id === id)

    if (index === -1) return null

    const updatedLocation = this.updateTimestamps({
      ...locations[index],
      ...updates,
    })

    locations[index] = updatedLocation
    this.setLocations(locations)

    return updatedLocation
  }

  deleteLocation(id: string): boolean {
    const locations = this.getLocations()
    const filtered = locations.filter(location => location.id !== id)

    if (filtered.length === locations.length) return false

    this.setLocations(filtered)
    return true
  }

  // Engineering Project operations
  getEngineeringProjects(): EngineeringProject[] {
    return this.getItem<EngineeringProject>(DB_KEYS.ENGINEERING_PROJECTS)
  }

  getEngineeringProjectById(id: string): EngineeringProject | null {
    const projects = this.getEngineeringProjects()
    return projects.find(project => project.id === id) || null
  }

  setEngineeringProjects(projects: EngineeringProject[]): void {
    this.setItem(DB_KEYS.ENGINEERING_PROJECTS, projects)
  }

  createEngineeringProject(project: Omit<EngineeringProject, "id" | "createdAt" | "updatedAt">): EngineeringProject {
    const projects = this.getEngineeringProjects()
    const newProject = {
      ...project,
      id: this.generateId(),
    }

    const updatedProject = this.updateTimestamps(newProject, true)
    projects.push(updatedProject)
    this.setEngineeringProjects(projects)

    return updatedProject
  }

  updateEngineeringProject(id: string, updates: Partial<EngineeringProject>): EngineeringProject | null {
    const projects = this.getEngineeringProjects()
    const index = projects.findIndex(project => project.id === id)

    if (index === -1) return null

    const updatedProject = this.updateTimestamps({
      ...projects[index],
      ...updates,
    })

    projects[index] = updatedProject
    this.setEngineeringProjects(projects)

    return updatedProject
  }

  deleteEngineeringProject(id: string): boolean {
    const projects = this.getEngineeringProjects()
    const filtered = projects.filter(project => project.id !== id)

    if (filtered.length === projects.length) return false

    this.setEngineeringProjects(filtered)
    return true
  }

  // Engineering Change operations
  getEngineeringChanges(): EngineeringChange[] {
    return this.getItem<EngineeringChange>(DB_KEYS.ENGINEERING_CHANGES)
  }

  getEngineeringChangeById(id: string): EngineeringChange | null {
    const changes = this.getEngineeringChanges()
    return changes.find(change => change.id === id) || null
  }

  setEngineeringChanges(changes: EngineeringChange[]): void {
    this.setItem(DB_KEYS.ENGINEERING_CHANGES, changes)
  }

  createEngineeringChange(change: Omit<EngineeringChange, "id" | "createdAt" | "updatedAt">): EngineeringChange {
    const changes = this.getEngineeringChanges()
    const newChange = {
      ...change,
      id: this.generateId(),
    }

    const updatedChange = this.updateTimestamps(newChange, true)
    changes.push(updatedChange)
    this.setEngineeringChanges(changes)

    return updatedChange
  }

  updateEngineeringChange(id: string, updates: Partial<EngineeringChange>): EngineeringChange | null {
    const changes = this.getEngineeringChanges()
    const index = changes.findIndex(change => change.id === id)

    if (index === -1) return null

    const updatedChange = this.updateTimestamps({
      ...changes[index],
      ...updates,
    })

    changes[index] = updatedChange
    this.setEngineeringChanges(changes)

    return updatedChange
  }

  deleteEngineeringChange(id: string): boolean {
    const changes = this.getEngineeringChanges()
    const filtered = changes.filter(change => change.id !== id)

    if (filtered.length === changes.length) return false

    this.setEngineeringChanges(filtered)
    return true
  }

  // Project Subcontractor operations
  getProjectSubcontractors(): ProjectSubcontractor[] {
    return this.getItem<ProjectSubcontractor>(DB_KEYS.PROJECT_SUBCONTRACTORS)
  }

  getProjectSubcontractorsByProject(projectId: string): ProjectSubcontractor[] {
    const projectSubcontractors = this.getProjectSubcontractors()
    return projectSubcontractors.filter(ps => ps.projectId === projectId)
  }

  getProjectSubcontractor(id: string): ProjectSubcontractor | null {
    const projectSubcontractors = this.getProjectSubcontractors()
    return projectSubcontractors.find(ps => ps.id === id) || null
  }

  setProjectSubcontractors(projectSubcontractors: ProjectSubcontractor[]): void {
    this.setItem(DB_KEYS.PROJECT_SUBCONTRACTORS, projectSubcontractors)
  }

  createProjectSubcontractor(projectSubcontractor: Omit<ProjectSubcontractor, "id" | "createdAt" | "updatedAt">): ProjectSubcontractor {
    const projectSubcontractors = this.getProjectSubcontractors()
    const newProjectSubcontractor = {
      ...projectSubcontractor,
      id: this.generateId(),
      progress: 0,
      actualCost: 0,
      actualDuration: 0,
    }

    const updatedProjectSubcontractor = this.updateTimestamps(newProjectSubcontractor, true)
    projectSubcontractors.push(updatedProjectSubcontractor)
    this.setProjectSubcontractors(projectSubcontractors)

    return updatedProjectSubcontractor
  }

  updateProjectSubcontractor(id: string, updates: Partial<ProjectSubcontractor>): ProjectSubcontractor | null {
    const projectSubcontractors = this.getProjectSubcontractors()
    const index = projectSubcontractors.findIndex(ps => ps.id === id)

    if (index === -1) return null

    const updatedProjectSubcontractor = this.updateTimestamps({
      ...projectSubcontractors[index],
      ...updates,
    })

    projectSubcontractors[index] = updatedProjectSubcontractor
    this.setProjectSubcontractors(projectSubcontractors)

    return updatedProjectSubcontractor
  }

  deleteProjectSubcontractor(id: string): boolean {
    const projectSubcontractors = this.getProjectSubcontractors()
    const filtered = projectSubcontractors.filter(ps => ps.id !== id)

    if (filtered.length === projectSubcontractors.length) return false

    this.setProjectSubcontractors(filtered)
    return true
  }

  // Subcontractor Work Order operations
  getSubcontractorWorkOrders(): SubcontractorWorkOrder[] {
    return this.getItem<SubcontractorWorkOrder>(DB_KEYS.SUBCONTRACTOR_WORK_ORDERS)
  }

  getSubcontractorWorkOrdersByProject(projectId: string): SubcontractorWorkOrder[] {
    const workOrders = this.getSubcontractorWorkOrders()
    return workOrders.filter(wo => wo.projectId === projectId)
  }

  getSubcontractorWorkOrder(id: string): SubcontractorWorkOrder | null {
    const workOrders = this.getSubcontractorWorkOrders()
    return workOrders.find(wo => wo.id === id) || null
  }

  setSubcontractorWorkOrders(workOrders: SubcontractorWorkOrder[]): void {
    this.setItem(DB_KEYS.SUBCONTRACTOR_WORK_ORDERS, workOrders)
  }

  createSubcontractorWorkOrder(workOrder: Omit<SubcontractorWorkOrder, "id" | "createdAt" | "updatedAt">): SubcontractorWorkOrder {
    const workOrders = this.getSubcontractorWorkOrders()
    const newWorkOrder = {
      ...workOrder,
      id: this.generateId(),
      progress: 0,
      actualCost: 0,
      actualDuration: 0,
    }

    const updatedWorkOrder = this.updateTimestamps(newWorkOrder, true)
    workOrders.push(updatedWorkOrder)
    this.setSubcontractorWorkOrders(workOrders)

    return updatedWorkOrder
  }

  updateSubcontractorWorkOrder(id: string, updates: Partial<SubcontractorWorkOrder>): SubcontractorWorkOrder | null {
    const workOrders = this.getSubcontractorWorkOrders()
    const index = workOrders.findIndex(wo => wo.id === id)

    if (index === -1) return null

    const updatedWorkOrder = this.updateTimestamps({
      ...workOrders[index],
      ...updates,
    })

    workOrders[index] = updatedWorkOrder
    this.setSubcontractorWorkOrders(workOrders)

    return updatedWorkOrder
  }

  deleteSubcontractorWorkOrder(id: string): boolean {
    const workOrders = this.getSubcontractorWorkOrders()
    const filtered = workOrders.filter(wo => wo.id !== id)

    if (filtered.length === workOrders.length) return false

    this.setSubcontractorWorkOrders(filtered)
    return true
  }
}

// Export singleton instance
export const db = LocalDatabase.getInstance()

// Export types for convenience
export type { LocalDatabase }
