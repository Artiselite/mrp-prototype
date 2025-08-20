"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Wrench,
  Package,
  Factory,
  Receipt,
  Users,
  ShoppingCart,
  Plus,
} from "lucide-react"

interface NavbarProps {
  stats: {
    activeQuotations: number
    activeProjects: number
    activeBOMs: number
    activeProduction: number
    pendingInvoices: number
    activeCustomers: number
    pendingPOs: number
  }
}

export function Navbar({ stats }: NavbarProps) {
  const navItems = [
    {
      title: "Quotations",
      href: "/quotations",
      icon: FileText,
      count: stats.activeQuotations,
      status: "Active Quotes",
    },
    {
      title: "Engineering",
      href: "/engineering",
      icon: Wrench,
      count: stats.activeProjects,
      status: "Active Projects",
    },
    {
      title: "Bill of Materials",
      href: "/bom",
      icon: Package,
      count: stats.activeBOMs,
      status: "Active BOMs",
    },
    {
      title: "Production",
      href: "/production",
      icon: Factory,
      count: stats.activeProduction,
      status: "In Progress",
    },
    {
      title: "Invoicing",
      href: "/invoicing",
      icon: Receipt,
      count: stats.pendingInvoices,
      status: "Pending Payment",
    },
    {
      title: "Customers",
      href: "/customers",
      icon: Users,
      count: stats.activeCustomers,
      status: "Active Customers",
    },
    {
      title: "Procurement",
      href: "/procurement",
      icon: ShoppingCart,
      count: stats.pendingPOs,
      status: "Pending Orders",
    },
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-start items-center py-4">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-900">Steel MRP System</h1>
            </Link>

            <div className="flex items-center space-x-3 overflow-x-auto scrollbar-hide">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors whitespace-nowrap flex-shrink-0"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden py-4 border-t">
          <div className="grid grid-cols-2 gap-4">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="flex items-center space-x-3 p-3 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-gray-500">
                      {item.count} {item.status}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
