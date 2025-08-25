"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useDatabaseContext } from "./database-provider"
import { Download, Upload, Trash2, Database } from "lucide-react"

export function DatabaseManager() {
  const { isInitialized, isLoading, error, clearDatabase, exportDatabase, importDatabase } = useDatabaseContext()
  const [importData, setImportData] = useState<string>("")

  const handleExport = () => {
    const data = exportDatabase()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mrp-database-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    try {
      const data = JSON.parse(importData)
      importDatabase(data)
      setImportData("")
      alert("Database imported successfully! Please refresh the page.")
    } catch (error) {
      alert("Invalid JSON data. Please check your import file.")
    }
  }

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      clearDatabase()
      alert("Database cleared successfully! Please refresh the page.")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Database Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium">Status:</span>
          <span className={`text-sm px-2 py-1 rounded-full ${
            isLoading ? "bg-blue-100 text-blue-800" :
            error ? "bg-red-100 text-red-800" :
            isInitialized ? "bg-green-100 text-green-800" :
            "bg-gray-100 text-gray-800"
          }`}>
            {isLoading ? "Initializing..." : error ? "Error" : isInitialized ? "Ready" : "Not Ready"}
          </span>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleExport} disabled={!isInitialized} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
          
          <Button 
            onClick={handleClear} 
            disabled={!isInitialized} 
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear Data
          </Button>
        </div>

        {/* Import */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Import Database (JSON):</label>
          <textarea
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            placeholder="Paste JSON data here..."
            className="w-full p-2 border border-gray-300 rounded-md text-sm font-mono"
            rows={4}
          />
          <Button 
            onClick={handleImport} 
            disabled={!importData.trim() || !isInitialized}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import Data
          </Button>
        </div>

        {/* Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Data is stored locally in your browser using localStorage</p>
          <p>• Export your data before clearing to avoid data loss</p>
          <p>• Import will replace all existing data</p>
        </div>
      </CardContent>
    </Card>
  )
}
