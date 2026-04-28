import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Navbar from "@/components/navbar"
import { DatabaseProvider } from "@/components/database-provider"
import DemoJourneyBar from "@/components/demo/DemoJourneyBar"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MRP",
  description: "Material Requirements Planning",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      </head>
      <body className={inter.className}>
        <DatabaseProvider>
          <Navbar />
          <div className="pb-16">
            {children}
          </div>
          <DemoJourneyBar />
        </DatabaseProvider>
      </body>
    </html>
  )
}
