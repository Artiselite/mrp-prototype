"use client"

import { createContext, useContext, ReactNode } from "react"
import { useDatabase } from "@/lib/hooks/useDatabase"

// Create database context
const DatabaseContext = createContext<ReturnType<typeof useDatabase> | null>(null)

// Database provider component
export function DatabaseProvider({ children }: { children: ReactNode }) {
  const database = useDatabase()

  return (
    <DatabaseContext.Provider value={database}>
      {children}
    </DatabaseContext.Provider>
  )
}

// Hook to use database context
export function useDatabaseContext() {
  const context = useContext(DatabaseContext)
  if (!context) {
    throw new Error("useDatabaseContext must be used within a DatabaseProvider")
  }
  
  // Return context with safe defaults if database is not initialized
  if (!context.isInitialized && !context.isLoading) {
    return {
      ...context,
      customers: [],
      suppliers: [],
      quotations: [],
      salesOrders: [],
      engineeringProjects: [],
      engineeringDrawings: [],
      billsOfMaterials: [],
      billsOfQuantities: [],
      productionWorkOrders: [],
      workstations: [],
      operators: [],
      shopfloorActivities: [],
      qualityInspections: [],
      qualityTests: [],
      qualityMetrics: [],
      invoices: [],
      purchaseOrders: [],
      items: [],
      locations: [],
      processSteps: [],
      // Add empty functions to prevent errors
      refreshCustomers: () => {},
      createCustomer: () => ({} as any),
      updateCustomer: () => ({} as any),
      deleteCustomer: () => false,
      refreshSuppliers: () => {},
      createSupplier: () => ({} as any),
      updateSupplier: () => ({} as any),
      deleteSupplier: () => false,
      refreshQuotations: () => {},
      createQuotation: () => ({} as any),
      updateQuotation: () => ({} as any),
      deleteQuotation: () => false,
      refreshSalesOrders: () => {},
      createSalesOrder: () => ({} as any),
      updateSalesOrder: () => ({} as any),
      deleteSalesOrder: () => false,
      refreshEngineeringProjects: () => {},
      createEngineeringProject: () => ({} as any),
      updateEngineeringProject: () => ({} as any),
      deleteEngineeringProject: () => false,
      refreshEngineeringDrawings: () => {},
      createEngineeringDrawing: () => ({} as any),
      updateEngineeringDrawing: () => ({} as any),
      deleteEngineeringDrawing: () => false,
      refreshBillsOfMaterials: () => {},
      createBillOfMaterials: () => ({} as any),
      updateBillOfMaterials: () => ({} as any),
      deleteBillOfMaterials: () => false,
      refreshBillsOfQuantities: () => {},
      createBillOfQuantities: () => ({} as any),
      updateBillOfQuantities: () => ({} as any),
      deleteBillOfQuantities: () => false,
      refreshProductionWorkOrders: () => {},
      createProductionWorkOrder: () => ({} as any),
      updateProductionWorkOrder: () => ({} as any),
      deleteProductionWorkOrder: () => false,
      refreshWorkstations: () => {},
      createWorkstation: () => ({} as any),
      updateWorkstation: () => ({} as any),
      deleteWorkstation: () => false,
      refreshOperators: () => {},
      createOperator: () => ({} as any),
      updateOperator: () => ({} as any),
      deleteOperator: () => false,
      refreshQualityInspections: () => {},
      createQualityInspection: () => ({} as any),
      updateQualityInspection: () => ({} as any),
      deleteQualityInspection: () => false,
      refreshQualityTests: () => {},
      createQualityTest: () => ({} as any),
      updateQualityTest: () => ({} as any),
      deleteQualityTest: () => false,
      refreshInvoices: () => {},
      createInvoice: () => ({} as any),
      updateInvoice: () => ({} as any),
      deleteInvoice: () => false,
      refreshPurchaseOrders: () => {},
      createPurchaseOrder: () => ({} as any),
      updatePurchaseOrder: () => ({} as any),
      deletePurchaseOrder: () => false,
      refreshItems: () => {},
      createItem: () => ({} as any),
      updateItem: () => ({} as any),
      deleteItem: () => false,
      refreshLocations: () => {},
      createLocation: () => ({} as any),
      updateLocation: () => ({} as any),
      deleteLocation: () => false,
    }
  }
  
  return context
}

// Database status component
export function DatabaseStatus() {
  const { isInitialized, isLoading, error } = useDatabaseContext()

  if (isLoading) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-100 text-blue-800 px-3 py-2 rounded-md text-sm font-medium">
        Initializing database...
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium">
        Database error: {error}
      </div>
    )
  }

  if (isInitialized) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 px-3 py-2 rounded-md text-sm font-medium">
        Database ready
      </div>
    )
  }

  return null
}
