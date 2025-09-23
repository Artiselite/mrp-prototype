"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QrCode, Download, Copy, Check } from "lucide-react"

// Declare QRCode type for the library
declare global {
  interface Window {
    QRCode: any
  }
}

interface QRCodeGeneratorProps {
  data: string
  type: "Start" | "Stop" | "Pause" | "Resume" | "Quality Check"
  processStepId: string
  workOrderId: string
  workstationId: string
  operatorId: string
  expiresAt: string
  isUsed?: boolean
  onGenerate?: (qrData: string) => void
}

export function QRCodeGenerator({
  data,
  type,
  processStepId,
  workOrderId,
  workstationId,
  operatorId,
  expiresAt,
  isUsed = false,
  onGenerate
}: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [libraryLoaded, setLibraryLoaded] = useState(false)
  const qrCodeRef = useRef<HTMLDivElement>(null)
  const qrCodeInstance = useRef<any>(null)

  // Load QRCode.js library
  useEffect(() => {
    const loadQRCodeLibrary = () => {
      if (window.QRCode) {
        setLibraryLoaded(true)
        generateQRCode()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
      script.onload = () => {
        setLibraryLoaded(true)
        generateQRCode()
      }
      script.onerror = () => {
        console.error('Failed to load QRCode.js library')
        setIsGenerating(false)
        setLibraryLoaded(false)
      }
      document.head.appendChild(script)
    }

    loadQRCodeLibrary()

    // Cleanup function
    return () => {
      if (qrCodeInstance.current && qrCodeRef.current) {
        qrCodeRef.current.innerHTML = ''
        qrCodeInstance.current = null
      }
    }
  }, [data, type, processStepId, workOrderId, workstationId, operatorId])

  const generateQRCode = () => {
    if (!window.QRCode || !qrCodeRef.current) {
      console.warn('QRCode library not loaded or ref not available')
      setIsGenerating(false)
      return
    }

    setIsGenerating(true)
    try {
      // Clear previous QR code
      if (qrCodeInstance.current) {
        qrCodeRef.current.innerHTML = ''
        qrCodeInstance.current = null
      }

      // Create QR code data
      const qrData = {
        type,
        processStepId,
        workOrderId,
        workstationId,
        operatorId,
        data,
        expiresAt,
        timestamp: new Date().toISOString()
      }
      
      const qrString = JSON.stringify(qrData)
      
      // Generate QR code using QRCode.js
      qrCodeInstance.current = new window.QRCode(qrCodeRef.current, {
        text: qrString,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: window.QRCode.CorrectLevel.H
      })

      // Convert to data URL for download
      setTimeout(() => {
        const canvas = qrCodeRef.current?.querySelector('canvas')
        if (canvas) {
          const dataUrl = canvas.toDataURL('image/png')
          setQrCodeUrl(dataUrl)
        } else {
          console.warn('Canvas not found in QR code container')
        }
        onGenerate?.(qrString)
        setIsGenerating(false)
      }, 100)

    } catch (error) {
      console.error("Error generating QR code:", error)
      // Show fallback content
      if (qrCodeRef.current) {
        qrCodeRef.current.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #666; font-size: 12px; text-align: center;">
            <div style="margin-bottom: 8px;">QR Code</div>
            <div style="font-size: 10px;">${type}</div>
            <div style="font-size: 8px; margin-top: 4px;">${processStepId}</div>
          </div>
        `
      }
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(data)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const downloadQRCode = () => {
    const canvas = qrCodeRef.current?.querySelector('canvas')
    if (canvas) {
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = `qr-${type.toLowerCase()}-${processStepId}-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Start": return "bg-green-100 text-green-800"
      case "Stop": return "bg-red-100 text-red-800"
      case "Pause": return "bg-yellow-100 text-yellow-800"
      case "Resume": return "bg-blue-100 text-blue-800"
      case "Quality Check": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const isExpired = new Date(expiresAt) < new Date()

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            QR Code - {type}
          </CardTitle>
          <Badge className={getTypeColor(type)}>
            {type}
          </Badge>
        </div>
        <CardDescription>
          Process Step: {processStepId} | Work Order: {workOrderId}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="text-center">
            {!libraryLoaded || isGenerating ? (
              <div className="flex items-center justify-center h-[200px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">
                    {!libraryLoaded ? 'Loading QR Code Library...' : 'Generating QR Code...'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div
                  ref={qrCodeRef}
                  className="border rounded-lg p-2 bg-white"
                  style={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                />
              </div>
            )}
          </div>
            
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Status:</span>
              <Badge className={isUsed ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                {isUsed ? "Used" : "Available"}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Expires:</span>
              <span className={isExpired ? "text-red-600" : "text-gray-900"}>
                {new Date(expiresAt).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyToClipboard}
              className="flex-1"
            >
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? "Copied!" : "Copy Data"}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadQRCode}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <strong>QR Data:</strong> {data}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
