"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { FileText, ClipboardList, Wrench, Package, Factory, Receipt, Users, Building2, ShoppingCart, Menu, X, User, LogOut, Home, Database } from "lucide-react"
import { useState } from "react"
import { DatabaseStatus } from "./database-provider"

const navigation = [
  // { name: "Dashboard", href: "/", icon: Home },
  { name: "Quotations", href: "/quotations", icon: FileText },
  { name: "Sales Orders", href: "/sales-orders", icon: ClipboardList },
  { name: "Engineering", href: "/engineering", icon: Wrench },
  { name: "BOM", href: "/bom", icon: Package },
  { name: "Production", href: "/production", icon: Factory },
  { name: "Invoicing", href: "/invoicing", icon: Receipt },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Suppliers", href: "/suppliers", icon: Building2 },
  { name: "Procurement", href: "/procurement", icon: ShoppingCart },
  { name: "Database", href: "/demo", icon: Database },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <DatabaseStatus />
      <nav className="bg-white shadow-sm border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-gray-900">
                  MRP
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                        pathname === item.href
                          ? "border-blue-500 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                      )}
                    >
                      {Icon && <Icon className="w-4 h-4 mr-2" />}
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* User Section */}
              <div className="hidden sm:flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>John Doe</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-500">Admin</span>
                </div>
                <button
                  onClick={() => {
                    // Handle logout logic here
                    console.log('Logout clicked')
                  }}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>

              {/* Mobile Menu Button */}
              <div className="-mr-2 flex items-center sm:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  {mobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "block pl-3 pr-4 py-2 border-l-4 text-base font-medium",
                      pathname === item.href
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700",
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      {Icon && <Icon className="w-4 h-4 mr-3" />}
                      {item.name}
                    </div>
                  </Link>
                )
              })}

              {/* Mobile User Section */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="px-3 py-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-700 mb-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>John Doe</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-500">Admin</span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      // Handle logout logic here
                      console.log('Logout clicked')
                    }}
                    className="w-full inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
