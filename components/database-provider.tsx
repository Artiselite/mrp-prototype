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
