import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Navbar } from "@/components/navbar"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Steel MRP System",
  description: "Material Requirements Planning for Steel Manufacturing",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar stats={{
          activeQuotations: 1,
          activeProjects: 0,
          activeBOMs: 1,
          activeProduction: 1,
          pendingInvoices: 1,
          activeCustomers: 2,
          pendingPOs: 0,
        }} />
        {children}
      </body>
    </html>
  )
}
