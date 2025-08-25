import { useState, useEffect, useCallback } from "react"
import { db } from "../database"
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
} from "../types"

// Database hook for easy state management
export function useDatabase() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  // Customer hooks
  const useCustomers = () => {
    const [customers, setCustomers] = useState<Customer[]>([])

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

    useEffect(() => {
      if (isInitialized) {
        refreshCustomers()
      }
    }, [isInitialized, refreshCustomers])

    return {
      customers,
      refreshCustomers,
      createCustomer,
      updateCustomer,
      deleteCustomer,
    }
  }

  // Supplier hooks
  const useSuppliers = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([])

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

    useEffect(() => {
      if (isInitialized) {
        refreshSuppliers()
      }
    }, [isInitialized, refreshSuppliers])

    return {
      suppliers,
      refreshSuppliers,
      createSupplier,
      updateSupplier,
      deleteSupplier,
    }
  }

  // Quotation hooks
  const useQuotations = () => {
    const [quotations, setQuotations] = useState<Quotation[]>([])

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

    useEffect(() => {
      if (isInitialized) {
        refreshQuotations()
      }
    }, [isInitialized, refreshQuotations])

    return {
      quotations,
      refreshQuotations,
      createQuotation,
      updateQuotation,
      deleteQuotation,
    }
  }

  // Sales Order hooks
  const useSalesOrders = () => {
    const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])

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

    useEffect(() => {
      if (isInitialized) {
        refreshSalesOrders()
      }
    }, [isInitialized, refreshSalesOrders])

    return {
      salesOrders,
      refreshSalesOrders,
      createSalesOrder,
      updateSalesOrder,
      deleteSalesOrder,
    }
  }

  // Engineering Drawing hooks
  const useEngineeringDrawings = () => {
    const [drawings, setDrawings] = useState<EngineeringDrawing[]>([])

    const refreshDrawings = useCallback(() => {
      setDrawings(db.getEngineeringDrawings())
    }, [])

    const createDrawing = useCallback((drawing: Omit<EngineeringDrawing, "id" | "createdAt" | "updatedAt">) => {
      const newDrawing = db.createEngineeringDrawing(drawing)
      refreshDrawings()
      return newDrawing
    }, [refreshDrawings])

    const updateDrawing = useCallback((id: string, updates: Partial<EngineeringDrawing>) => {
      const updated = db.updateEngineeringDrawing(id, updates)
      if (updated) refreshDrawings()
      return updated
    }, [refreshDrawings])

    const deleteDrawing = useCallback((id: string) => {
      const success = db.deleteEngineeringDrawing(id)
      if (success) refreshDrawings()
      return success
    }, [refreshDrawings])

    useEffect(() => {
      if (isInitialized) {
        refreshDrawings()
      }
    }, [isInitialized, refreshDrawings])

    return {
      drawings,
      refreshDrawings,
      createDrawing,
      updateDrawing,
      deleteDrawing,
    }
  }

  // Bill of Materials hooks
  const useBillsOfMaterials = () => {
    const [boms, setBoms] = useState<BillOfMaterials[]>([])

    const refreshBoms = useCallback(() => {
      setBoms(db.getBillsOfMaterials())
    }, [])

    const createBom = useCallback((bom: Omit<BillOfMaterials, "id" | "createdAt" | "updatedAt">) => {
      const newBom = db.createBillOfMaterials(bom)
      refreshBoms()
      return newBom
    }, [refreshBoms])

    const updateBom = useCallback((id: string, updates: Partial<BillOfMaterials>) => {
      const updated = db.updateBillOfMaterials(id, updates)
      if (updated) refreshBoms()
      return updated
    }, [refreshBoms])

    const deleteBom = useCallback((id: string) => {
      const success = db.deleteBillOfMaterials(id)
      if (success) refreshBoms()
      return success
    }, [refreshBoms])

    useEffect(() => {
      if (isInitialized) {
        refreshBoms()
      }
    }, [isInitialized, refreshBoms])

    return {
      boms,
      refreshBoms,
      createBom,
      updateBom,
      deleteBom,
    }
  }

  // Production Work Order hooks
  const useProductionWorkOrders = () => {
    const [workOrders, setWorkOrders] = useState<ProductionWorkOrder[]>([])

    const refreshWorkOrders = useCallback(() => {
      setWorkOrders(db.getProductionWorkOrders())
    }, [])

    const createWorkOrder = useCallback((workOrder: Omit<ProductionWorkOrder, "id" | "createdAt" | "updatedAt">) => {
      const newWorkOrder = db.createProductionWorkOrder(workOrder)
      refreshWorkOrders()
      return newWorkOrder
    }, [refreshWorkOrders])

    const updateWorkOrder = useCallback((id: string, updates: Partial<ProductionWorkOrder>) => {
      const updated = db.updateProductionWorkOrder(id, updates)
      if (updated) refreshWorkOrders()
      return updated
    }, [refreshWorkOrders])

    const deleteWorkOrder = useCallback((id: string) => {
      const success = db.deleteProductionWorkOrder(id)
      if (success) refreshWorkOrders()
      return success
    }, [refreshWorkOrders])

    useEffect(() => {
      if (isInitialized) {
        refreshWorkOrders()
      }
    }, [isInitialized, refreshWorkOrders])

    return {
      workOrders,
      refreshWorkOrders,
      createWorkOrder,
      updateWorkOrder,
      deleteWorkOrder,
    }
  }

  // Invoice hooks
  const useInvoices = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([])

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

    useEffect(() => {
      if (isInitialized) {
        refreshInvoices()
      }
    }, [isInitialized, refreshInvoices])

    return {
      invoices,
      refreshInvoices,
      createInvoice,
      updateInvoice,
      deleteInvoice,
    }
  }

  // Purchase Order hooks
  const usePurchaseOrders = () => {
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])

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

    useEffect(() => {
      if (isInitialized) {
        refreshPurchaseOrders()
      }
    }, [isInitialized, refreshPurchaseOrders])

    return {
      purchaseOrders,
      refreshPurchaseOrders,
      createPurchaseOrder,
      updatePurchaseOrder,
      deletePurchaseOrder,
    }
  }

  // Utility functions
  const clearDatabase = useCallback(() => {
    db.clearDatabase()
    setIsInitialized(false)
  }, [])

  const exportDatabase = useCallback(() => {
    return db.exportDatabase()
  }, [])

  const importDatabase = useCallback((data: Record<string, any>) => {
    db.importDatabase(data)
    setIsInitialized(false)
  }, [])

  return {
    // State
    isInitialized,
    isLoading,
    error,
    
    // Hooks
    useCustomers,
    useSuppliers,
    useQuotations,
    useSalesOrders,
    useEngineeringDrawings,
    useBillsOfMaterials,
    useProductionWorkOrders,
    useInvoices,
    usePurchaseOrders,
    
    // Utilities
    clearDatabase,
    exportDatabase,
    importDatabase,
  }
}
