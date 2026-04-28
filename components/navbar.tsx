"use client"

import { useState, useRef, useEffect } from "react"
import {
  Home,
  Database,
  Menu,
  LogOut,
  Users,
  Building2,
  FileText,
  ShoppingCart,
  Wrench,
  ClipboardList,
  Factory,
  Receipt,
  TrendingUp,
  Box,
  MapPin,
  Package,
  User,
  Calculator,
  FolderOpen,
  Truck,
  X,
  ChevronDown
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navGroups = [
  {
    label: "Sales",
    items: [
      { name: "Customers", href: "/customers", icon: Users },
      { name: "Quotations", href: "/quotations", icon: FileText },
      { name: "Sales Orders", href: "/sales-orders", icon: ShoppingCart },
    ],
  },
  {
    label: "Engineering",
    items: [
      { name: "Items", href: "/items", icon: Box },
      { name: "Engineering", href: "/engineering", icon: Wrench },
      { name: "BOM", href: "/bom", icon: ClipboardList },
      { name: "BOQ", href: "/boq", icon: Calculator },
    ],
  },
  {
    label: "Operations",
    items: [
      { name: "Locations", href: "/locations", icon: MapPin },
      { name: "Inventory", href: "/inventory", icon: Package },
      { name: "Production", href: "/production", icon: Factory },
      { name: "Delivery Orders", href: "/delivery-orders", icon: Truck },
    ],
  },
  {
    label: "Finance",
    items: [
      { name: "Suppliers", href: "/suppliers", icon: Building2 },
      { name: "Procurement", href: "/procurement", icon: TrendingUp },
      { name: "Invoicing", href: "/invoicing", icon: Receipt },
    ],
  },
  {
    label: "Projects",
    items: [
      { name: "Projects", href: "/projects", icon: FolderOpen },
    ],
  },
]

const allNavItems = navGroups.flatMap(g => g.items)

function NavDropdown({
  group,
  pathname,
}: {
  group: typeof navGroups[number]
  pathname: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const isGroupActive = group.items.some(item => pathname === item.href)

  // Single-item groups render as a direct link
  if (group.items.length === 1) {
    const item = group.items[0]
    const Icon = item.icon
    return (
      <Link
        href={item.href}
        className={cn(
          "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
          pathname === item.href
            ? "text-primary bg-accent"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <Icon className="w-4 h-4 mr-1.5" />
        {item.name}
      </Link>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
          isGroupActive
            ? "text-primary bg-accent"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        {group.label}
        <ChevronDown className={cn("w-3.5 h-3.5 ml-1 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-52 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
          {group.items.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center px-3 py-2 text-sm transition-colors",
                  pathname === item.href
                    ? "text-primary bg-accent font-medium"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-4 h-4 mr-2.5 text-muted-foreground" />
                {item.name}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <nav className="bg-card border-b border-border">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 mr-6">
                <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-primary-foreground text-xs font-bold">M</span>
                </div>
                <span className="text-base font-semibold text-foreground tracking-tight">MRP</span>
              </Link>

              <div className="hidden xl:flex items-center space-x-1">
                <Link
                  href="/"
                  className={cn(
                    "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    pathname === "/"
                      ? "text-primary bg-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Home className="w-4 h-4 mr-1.5" />
                  Dashboard
                </Link>

                {navGroups.map((group) => (
                  <NavDropdown key={group.label} group={group} pathname={pathname} />
                ))}

                <Link
                  href="/demo"
                  className={cn(
                    "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    pathname === "/demo"
                      ? "text-primary bg-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Database className="w-4 h-4 mr-1.5" />
                  Database
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground leading-tight">John Doe</span>
                    <span className="text-xs text-muted-foreground leading-tight">Admin</span>
                  </div>
                </div>
                <div className="w-px h-6 bg-border" />
                <button
                  onClick={() => console.log('Logout clicked')}
                  className="inline-flex items-center px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              <div className="-mr-2 flex items-center xl:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                >
                  {mobileMenuOpen ? <X className="block h-5 w-5" /> : <Menu className="block h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-border">
            <div className="py-2 px-2 space-y-1">
              <Link
                href="/"
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  pathname === "/"
                    ? "text-primary bg-accent"
                    : "text-muted-foreground hover:bg-muted"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="w-4 h-4 mr-3" />
                Dashboard
              </Link>

              {navGroups.map((group) => (
                <div key={group.label} className="pt-2">
                  <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {group.label}
                  </div>
                  {group.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "flex items-center px-3 py-2 text-sm rounded-md ml-2",
                          pathname === item.href
                            ? "text-primary bg-accent font-medium"
                            : "text-foreground hover:bg-muted"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon className="w-4 h-4 mr-3 text-muted-foreground" />
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              ))}

              <Link
                href="/demo"
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  pathname === "/demo"
                    ? "text-primary bg-accent"
                    : "text-muted-foreground hover:bg-muted"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Database className="w-4 h-4 mr-3" />
                Database
              </Link>

              <div className="border-t border-border pt-3 mt-3">
                <div className="px-3 py-2">
                  <div className="flex items-center space-x-2 text-sm text-foreground mb-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">John Doe</span>
                    <span className="text-muted-foreground text-xs">Admin</span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      console.log('Logout clicked')
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors cursor-pointer"
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
