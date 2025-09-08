import { useState, useEffect, useCallback } from "react"
import { db } from "../database"
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
  DrawingApproval,
  DrawingComment,
} from "../types"

// Database hook for easy state management
export function useDatabase() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for all data
  const [customers, setCustomers] = useState<Customer[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])
  const [engineeringProjects, setEngineeringProjects] = useState<EngineeringProject[]>([])
  const [engineeringDrawings, setEngineeringDrawings] = useState<EngineeringDrawing[]>([])
  const [billsOfMaterials, setBillsOfMaterials] = useState<BillOfMaterials[]>([])
  const [billsOfQuantities, setBillsOfQuantities] = useState<BillOfQuantities[]>([])
  const [productionWorkOrders, setProductionWorkOrders] = useState<ProductionWorkOrder[]>([])
  const [workstations, setWorkstations] = useState<Workstation[]>([])
  const [operators, setOperators] = useState<Operator[]>([])
  const [shopfloorActivities, setShopfloorActivities] = useState<ShopfloorActivity[]>([])
  const [qualityInspections, setQualityInspections] = useState<QualityInspection[]>([])
  const [qualityTests, setQualityTests] = useState<QualityTest[]>([])
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetric[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [locations, setLocations] = useState<Location[]>([])

  // Initialize database
  useEffect(() => {
    const initDB = async () => {
      try {
        setIsLoading(true)
        await db.initialize()
        setIsInitialized(true)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize database")
      } finally {
        setIsLoading(false)
      }
    }

    initDB()
  }, [])

  // Refresh all data when database is initialized
  useEffect(() => {
    if (isInitialized) {
      setCustomers(db.getCustomers())
      setSuppliers(db.getSuppliers())
      setQuotations(db.getQuotations())
      setSalesOrders(db.getSalesOrders())
      setEngineeringProjects(db.getEngineeringProjects())
      setEngineeringDrawings(db.getEngineeringDrawings())
      setBillsOfMaterials(db.getBillsOfMaterials())
      setBillsOfQuantities(db.getBillsOfQuantities())
      setProductionWorkOrders(db.getProductionWorkOrders())
      setWorkstations(db.getWorkstations())
      setOperators(db.getOperators())
      setShopfloorActivities(db.getShopfloorActivities())
      setQualityInspections(db.getQualityInspections())
      setQualityTests(db.getQualityTests())
      setQualityMetrics(db.getQualityMetrics())
      setInvoices(db.getInvoices())
      setPurchaseOrders(db.getPurchaseOrders())
      setItems(db.getItems())
      setLocations(db.getLocations())
    }
  }, [isInitialized])

  // Customer functions
  const refreshCustomers = useCallback(() => {
      setCustomers(db.getCustomers())
    }, [])

    const createCustomer = useCallback((customer: Omit<Customer, "id" | "createdAt" | "updatedAt">) => {
      const newCustomer = db.createCustomer(customer)
      refreshCustomers()
      return newCustomer
    }, [refreshCustomers])

    const updateCustomer = useCallback((id: string, updates: Partial<Customer>) => {
      const updated = db.updateCustomer(id, updates)
      if (updated) refreshCustomers()
      return updated
    }, [refreshCustomers])

    const deleteCustomer = useCallback((id: string) => {
      const success = db.deleteCustomer(id)
      if (success) refreshCustomers()
      return success
    }, [refreshCustomers])

  // Supplier functions
    const refreshSuppliers = useCallback(() => {
      setSuppliers(db.getSuppliers())
    }, [])

    const createSupplier = useCallback((supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt">) => {
      const newSupplier = db.createSupplier(supplier)
      refreshSuppliers()
      return newSupplier
    }, [refreshSuppliers])

    const updateSupplier = useCallback((id: string, updates: Partial<Supplier>) => {
      const updated = db.updateSupplier(id, updates)
      if (updated) refreshSuppliers()
      return updated
    }, [refreshSuppliers])

    const deleteSupplier = useCallback((id: string) => {
      const success = db.deleteSupplier(id)
      if (success) refreshSuppliers()
      return success
    }, [refreshSuppliers])

  // Quotation functions
    const refreshQuotations = useCallback(() => {
      setQuotations(db.getQuotations())
    }, [])

    const createQuotation = useCallback((quotation: Omit<Quotation, "id" | "createdAt" | "updatedAt">) => {
      const newQuotation = db.createQuotation(quotation)
      refreshQuotations()
      return newQuotation
    }, [refreshQuotations])

    const updateQuotation = useCallback((id: string, updates: Partial<Quotation>) => {
      const updated = db.updateQuotation(id, updates)
      if (updated) refreshQuotations()
      return updated
    }, [refreshQuotations])

    const deleteQuotation = useCallback((id: string) => {
      const success = db.deleteQuotation(id)
      if (success) refreshQuotations()
      return success
    }, [refreshQuotations])

  // Sales Order functions
    const refreshSalesOrders = useCallback(() => {
      setSalesOrders(db.getSalesOrders())
    }, [])

    const createSalesOrder = useCallback((salesOrder: Omit<SalesOrder, "id" | "createdAt" | "updatedAt">) => {
      const newSalesOrder = db.createSalesOrder(salesOrder)
      refreshSalesOrders()
      return newSalesOrder
    }, [refreshSalesOrders])

    const updateSalesOrder = useCallback((id: string, updates: Partial<SalesOrder>) => {
      const updated = db.updateSalesOrder(id, updates)
      if (updated) refreshSalesOrders()
      return updated
    }, [refreshSalesOrders])

    const deleteSalesOrder = useCallback((id: string) => {
      const success = db.deleteSalesOrder(id)
      if (success) refreshSalesOrders()
      return success
    }, [refreshSalesOrders])

  // Engineering Projects functions
  const refreshEngineeringProjects = useCallback(() => {
    setEngineeringProjects(db.getEngineeringProjects())
  }, [])

  const createEngineeringProject = useCallback((project: Omit<EngineeringProject, "id" | "createdAt" | "updatedAt">) => {
    const newProject = db.createEngineeringProject(project)
    refreshEngineeringProjects()
    return newProject
  }, [refreshEngineeringProjects])

  const updateEngineeringProject = useCallback((id: string, updates: Partial<EngineeringProject>) => {
    const updated = db.updateEngineeringProject(id, updates)
    if (updated) refreshEngineeringProjects()
    return updated
  }, [refreshEngineeringProjects])

  const deleteEngineeringProject = useCallback((id: string) => {
    const success = db.deleteEngineeringProject(id)
    if (success) refreshEngineeringProjects()
    return success
  }, [refreshEngineeringProjects])

  // Engineering Drawing functions
  const refreshEngineeringDrawings = useCallback(() => {
    setEngineeringDrawings(db.getEngineeringDrawings())
    }, [])

  const createEngineeringDrawing = useCallback((drawing: Omit<EngineeringDrawing, "id" | "createdAt" | "updatedAt">) => {
      const newDrawing = db.createEngineeringDrawing(drawing)
    refreshEngineeringDrawings()
      return newDrawing
  }, [refreshEngineeringDrawings])

  const updateEngineeringDrawing = useCallback((id: string, updates: Partial<EngineeringDrawing>) => {
      const updated = db.updateEngineeringDrawing(id, updates)
    if (updated) refreshEngineeringDrawings()
      return updated
  }, [refreshEngineeringDrawings])

  const deleteEngineeringDrawing = useCallback((id: string) => {
      const success = db.deleteEngineeringDrawing(id)
    if (success) refreshEngineeringDrawings()
      return success
  }, [refreshEngineeringDrawings])

  // Bill of Materials functions
  const refreshBillsOfMaterials = useCallback(() => {
    setBillsOfMaterials(db.getBillsOfMaterials())
    }, [])

  const createBillOfMaterials = useCallback((bom: Omit<BillOfMaterials, "id" | "createdAt" | "updatedAt">) => {
      const newBom = db.createBillOfMaterials(bom)
    refreshBillsOfMaterials()
      return newBom
  }, [refreshBillsOfMaterials])

  const updateBillOfMaterials = useCallback((id: string, updates: Partial<BillOfMaterials>) => {
      const updated = db.updateBillOfMaterials(id, updates)
    if (updated) refreshBillsOfMaterials()
      return updated
  }, [refreshBillsOfMaterials])

  const deleteBillOfMaterials = useCallback((id: string) => {
      const success = db.deleteBillOfMaterials(id)
    if (success) refreshBillsOfMaterials()
      return success
  }, [refreshBillsOfMaterials])

  // Bill of Quantities functions
  const refreshBillsOfQuantities = useCallback(() => {
    setBillsOfQuantities(db.getBillsOfQuantities())
  }, [])

  const createBillOfQuantities = useCallback((boq: Omit<BillOfQuantities, "id" | "createdAt" | "updatedAt">) => {
    const newBoq = db.createBillOfQuantities(boq)
    refreshBillsOfQuantities()
    return newBoq
  }, [refreshBillsOfQuantities])

  const updateBillOfQuantities = useCallback((id: string, updates: Partial<BillOfQuantities>) => {
    const updated = db.updateBillOfQuantities(id, updates)
    if (updated) refreshBillsOfQuantities()
    return updated
  }, [refreshBillsOfQuantities])

  const deleteBillOfQuantities = useCallback((id: string) => {
    const success = db.deleteBillOfQuantities(id)
    if (success) refreshBillsOfQuantities()
    return success
  }, [refreshBillsOfQuantities])

  // Production Work Order functions
  const refreshProductionWorkOrders = useCallback(() => {
    setProductionWorkOrders(db.getProductionWorkOrders())
    }, [])

  const createProductionWorkOrder = useCallback((workOrder: Omit<ProductionWorkOrder, "id" | "createdAt" | "updatedAt">) => {
      const newWorkOrder = db.createProductionWorkOrder(workOrder)
    refreshProductionWorkOrders()
      return newWorkOrder
  }, [refreshProductionWorkOrders])

  const updateProductionWorkOrder = useCallback((id: string, updates: Partial<ProductionWorkOrder>) => {
      const updated = db.updateProductionWorkOrder(id, updates)
    if (updated) refreshProductionWorkOrders()
      return updated
  }, [refreshProductionWorkOrders])

  const deleteProductionWorkOrder = useCallback((id: string) => {
      const success = db.deleteProductionWorkOrder(id)
    if (success) refreshProductionWorkOrders()
      return success
  }, [refreshProductionWorkOrders])

  // Invoice functions
    const refreshInvoices = useCallback(() => {
      setInvoices(db.getInvoices())
    }, [])

    const createInvoice = useCallback((invoice: Omit<Invoice, "id" | "createdAt" | "updatedAt">) => {
      const newInvoice = db.createInvoice(invoice)
      refreshInvoices()
      return newInvoice
    }, [refreshInvoices])

    const updateInvoice = useCallback((id: string, updates: Partial<Invoice>) => {
      const updated = db.updateInvoice(id, updates)
      if (updated) refreshInvoices()
      return updated
    }, [refreshInvoices])

    const deleteInvoice = useCallback((id: string) => {
      const success = db.deleteInvoice(id)
      if (success) refreshInvoices()
      return success
    }, [refreshInvoices])

  // Purchase Order functions
    const refreshPurchaseOrders = useCallback(() => {
      setPurchaseOrders(db.getPurchaseOrders())
    }, [])

    const createPurchaseOrder = useCallback((purchaseOrder: Omit<PurchaseOrder, "id" | "createdAt" | "updatedAt">) => {
      const newPurchaseOrder = db.createPurchaseOrder(purchaseOrder)
      refreshPurchaseOrders()
      return newPurchaseOrder
    }, [refreshPurchaseOrders])

    const updatePurchaseOrder = useCallback((id: string, updates: Partial<PurchaseOrder>) => {
      const updated = db.updatePurchaseOrder(id, updates)
      if (updated) refreshPurchaseOrders()
      return updated
    }, [refreshPurchaseOrders])

    const deletePurchaseOrder = useCallback((id: string) => {
      const success = db.deletePurchaseOrder(id)
      if (success) refreshPurchaseOrders()
      return success
    }, [refreshPurchaseOrders])

  // Item functions
    const refreshItems = useCallback(() => {
      setItems(db.getItems())
    }, [])

    const createItem = useCallback((item: Omit<Item, "id" | "createdAt" | "updatedAt">) => {
      const newItem = db.createItem(item)
      refreshItems()
      return newItem
    }, [refreshItems])

    const updateItem = useCallback((id: string, updates: Partial<Item>) => {
      const updated = db.updateItem(id, updates)
      if (updated) refreshItems()
      return updated
    }, [refreshItems])

    const deleteItem = useCallback((id: string) => {
      const success = db.deleteItem(id)
      if (success) refreshItems()
      return success
    }, [refreshItems])

  // Location functions
    const refreshLocations = useCallback(() => {
      setLocations(db.getLocations())
    }, [])

    const createLocation = useCallback((location: Omit<Location, "id" | "createdAt" | "updatedAt">) => {
      const newLocation = db.createLocation(location)
      refreshLocations()
      return newLocation
    }, [refreshLocations])

    const updateLocation = useCallback((id: string, updates: Partial<Location>) => {
      const updated = db.updateLocation(id, updates)
      if (updated) refreshLocations()
      return updated
    }, [refreshLocations])

    const deleteLocation = useCallback((id: string) => {
      const success = db.deleteLocation(id)
      if (success) refreshLocations()
      return success
    }, [refreshLocations])

  // Workstation functions
  const refreshWorkstations = useCallback(() => {
    setWorkstations(db.getWorkstations())
  }, [])

  const createWorkstation = useCallback((workstation: Omit<Workstation, "id" | "createdAt" | "updatedAt">) => {
    const newWorkstation = db.createWorkstation(workstation)
    refreshWorkstations()
    return newWorkstation
  }, [refreshWorkstations])

  const updateWorkstation = useCallback((id: string, updates: Partial<Workstation>) => {
    const updated = db.updateWorkstation(id, updates)
    if (updated) refreshWorkstations()
    return updated
  }, [refreshWorkstations])

  const deleteWorkstation = useCallback((id: string) => {
    const success = db.deleteWorkstation(id)
    if (success) refreshWorkstations()
    return success
  }, [refreshWorkstations])

  // Operator functions
  const refreshOperators = useCallback(() => {
    setOperators(db.getOperators())
  }, [])

  const createOperator = useCallback((operator: Omit<Operator, "id" | "createdAt" | "updatedAt">) => {
    const newOperator = db.createOperator(operator)
    refreshOperators()
    return newOperator
  }, [refreshOperators])

  const updateOperator = useCallback((id: string, updates: Partial<Operator>) => {
    const updated = db.updateOperator(id, updates)
    if (updated) refreshOperators()
    return updated
  }, [refreshOperators])

  const deleteOperator = useCallback((id: string) => {
    const success = db.deleteOperator(id)
    if (success) refreshOperators()
    return success
  }, [refreshOperators])

  // Shopfloor Activity functions
  const refreshShopfloorActivities = useCallback(() => {
    setShopfloorActivities(db.getShopfloorActivities())
  }, [])

  const createShopfloorActivity = useCallback((activity: Omit<ShopfloorActivity, "id" | "createdAt" | "updatedAt">) => {
    const newActivity = db.createShopfloorActivity(activity)
    refreshShopfloorActivities()
    return newActivity
  }, [refreshShopfloorActivities])

  const updateShopfloorActivity = useCallback((id: string, updates: Partial<ShopfloorActivity>) => {
    const updated = db.updateShopfloorActivity(id, updates)
    if (updated) refreshShopfloorActivities()
    return updated
  }, [refreshShopfloorActivities])

  const deleteShopfloorActivity = useCallback((id: string) => {
    const success = db.deleteShopfloorActivity(id)
    if (success) refreshShopfloorActivities()
    return success
  }, [refreshShopfloorActivities])

  // Quality Inspection functions
  const refreshQualityInspections = useCallback(() => {
    setQualityInspections(db.getQualityInspections())
  }, [])

  const createQualityInspection = useCallback((inspection: Omit<QualityInspection, "id" | "createdAt" | "updatedAt">) => {
    const newInspection = db.createQualityInspection(inspection)
    refreshQualityInspections()
    return newInspection
  }, [refreshQualityInspections])

  const updateQualityInspection = useCallback((id: string, updates: Partial<QualityInspection>) => {
    const updated = db.updateQualityInspection(id, updates)
    if (updated) refreshQualityInspections()
    return updated
  }, [refreshQualityInspections])

  const deleteQualityInspection = useCallback((id: string) => {
    const success = db.deleteQualityInspection(id)
    if (success) refreshQualityInspections()
    return success
  }, [refreshQualityInspections])

  // Quality Test functions
  const refreshQualityTests = useCallback(() => {
    setQualityTests(db.getQualityTests())
  }, [])

  const createQualityTest = useCallback((test: Omit<QualityTest, "id" | "createdAt" | "updatedAt">) => {
    const newTest = db.createQualityTest(test)
    refreshQualityTests()
    return newTest
  }, [refreshQualityTests])

  const updateQualityTest = useCallback((id: string, updates: Partial<QualityTest>) => {
    const updated = db.updateQualityTest(id, updates)
    if (updated) refreshQualityTests()
    return updated
  }, [refreshQualityTests])

  const deleteQualityTest = useCallback((id: string) => {
    const success = db.deleteQualityTest(id)
    if (success) refreshQualityTests()
    return success
  }, [refreshQualityTests])

  return {
    // Database status
    isInitialized,
    isLoading,
    error,
    
    // Data
    customers,
    suppliers,
    quotations,
    salesOrders,
    engineeringProjects,
    engineeringDrawings,
    billsOfMaterials,
    billsOfQuantities,
    productionWorkOrders,
    workstations,
    operators,
    shopfloorActivities,
    qualityInspections,
    qualityTests,
    qualityMetrics,
    invoices,
    purchaseOrders,
    items,
    locations,
    
    // Functions
    refreshCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    
    refreshSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    
    refreshQuotations,
    createQuotation,
    updateQuotation,
    deleteQuotation,
    
    refreshSalesOrders,
    createSalesOrder,
    updateSalesOrder,
    deleteSalesOrder,
    
    refreshEngineeringProjects,
    createEngineeringProject,
    updateEngineeringProject,
    deleteEngineeringProject,
    
    refreshEngineeringDrawings,
    createEngineeringDrawing,
    updateEngineeringDrawing,
    deleteEngineeringDrawing,
    
    refreshBillsOfMaterials,
    createBillOfMaterials,
    updateBillOfMaterials,
    deleteBillOfMaterials,
    
    refreshBillsOfQuantities,
    createBillOfQuantities,
    updateBillOfQuantities,
    deleteBillOfQuantities,
    
    refreshProductionWorkOrders,
    createProductionWorkOrder,
    updateProductionWorkOrder,
    deleteProductionWorkOrder,
    
    refreshInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    
    refreshPurchaseOrders,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    
    refreshItems,
    createItem,
    updateItem,
    deleteItem,
    
    refreshLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    
    // Workstation functions
    refreshWorkstations,
    createWorkstation,
    updateWorkstation,
    deleteWorkstation,
    
    // Operator functions
    refreshOperators,
    createOperator,
    updateOperator,
    deleteOperator,
    
    // Shopfloor Activity functions
    refreshShopfloorActivities,
    createShopfloorActivity,
    updateShopfloorActivity,
    deleteShopfloorActivity,
    
    // Quality Inspection functions
    refreshQualityInspections,
    createQualityInspection,
    updateQualityInspection,
    deleteQualityInspection,
    
    // Quality Test functions
    refreshQualityTests,
    createQualityTest,
    updateQualityTest,
    deleteQualityTest,
  }
}
