"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useDatabaseContext } from "@/components/database-provider"
import { Trash2, Edit, Save, X } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Customer, Supplier, Quotation, SalesOrder, EngineeringDrawing, BillOfMaterials, ProductionWorkOrder, Invoice, PurchaseOrder, Item, Location } from "@/lib/types"

export default function DemoPage() {
  const {
    useCustomers,
    useSuppliers,
    useQuotations,
    useSalesOrders,
    useEngineeringDrawings,
    useBillsOfMaterials,
    useProductionWorkOrders,
    useInvoices,
    usePurchaseOrders,
    useItems,
    useLocations
  } = useDatabaseContext()

  const { customers, createCustomer, updateCustomer, deleteCustomer } = useCustomers()
  const { suppliers, createSupplier, updateSupplier, deleteSupplier } = useSuppliers()
  const { quotations, createQuotation, updateQuotation, deleteQuotation } = useQuotations()
  const { salesOrders, createSalesOrder, updateSalesOrder, deleteSalesOrder } = useSalesOrders()
  const { drawings, createDrawing, updateDrawing, deleteDrawing } = useEngineeringDrawings()
  const { boms, createBom, updateBom, deleteBom } = useBillsOfMaterials()
  const { workOrders, createWorkOrder, updateWorkOrder, deleteWorkOrder } = useProductionWorkOrders()
  const { invoices, createInvoice, updateInvoice, deleteInvoice } = useInvoices()
  const { purchaseOrders, createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder } = usePurchaseOrders()
  const { items, createItem, updateItem, deleteItem } = useItems()
  const { locations, createLocation, updateLocation, deleteLocation } = useLocations()

  const [editingCustomer, setEditingCustomer] = useState<string | null>(null)
  const [editingSupplier, setEditingSupplier] = useState<string | null>(null)
  const [editingQuotation, setEditingQuotation] = useState<string | null>(null)
  const [editingSalesOrder, setEditingSalesOrder] = useState<string | null>(null)
  const [editingDrawing, setEditingDrawing] = useState<string | null>(null)
  const [editingBom, setEditingBom] = useState<string | null>(null)
  const [editingWorkOrder, setEditingWorkOrder] = useState<string | null>(null)
  const [editingInvoice, setEditingInvoice] = useState<string | null>(null)
  const [editingPurchaseOrder, setEditingPurchaseOrder] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editingLocation, setEditingLocation] = useState<string | null>(null)

  // Helper function to render edit form for customers
  const renderCustomerEditForm = (customer: Customer) => {
    if (editingCustomer !== customer.id) return null

    return (
      <TableRow key={`edit-${customer.id}`} className="bg-blue-50">
        <TableCell colSpan={8}>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <Input
                  defaultValue={customer.name}
                  id={`customer-name-${customer.id}`}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <Input
                  defaultValue={customer.contactPerson}
                  id={`customer-contact-${customer.id}`}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  defaultValue={customer.email}
                  id={`customer-email-${customer.id}`}
                  className="w-full"
                  type="email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <Input
                  defaultValue={customer.phone}
                  id={`customer-phone-${customer.id}`}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <Input
                  defaultValue={customer.address}
                  id={`customer-address-${customer.id}`}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <Input
                  defaultValue={customer.city}
                  id={`customer-city-${customer.id}`}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <Input
                  defaultValue={customer.state}
                  id={`customer-state-${customer.id}`}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                <Input
                  defaultValue={customer.zipCode}
                  id={`customer-zip-${customer.id}`}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <Input
                  defaultValue={customer.country}
                  id={`customer-country-${customer.id}`}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  defaultValue={customer.status}
                  id={`customer-status-${customer.id}`}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit</label>
                <Input
                  defaultValue={customer.creditLimit}
                  id={`customer-credit-${customer.id}`}
                  className="w-full"
                  type="number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                <Input
                  defaultValue={customer.paymentTerms}
                  id={`customer-payment-${customer.id}`}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Orders</label>
                <Input
                  defaultValue={customer.totalOrders}
                  id={`customer-orders-${customer.id}`}
                  className="w-full"
                  type="number"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  const updatedCustomer: Partial<Customer> = {
                    name: (document.getElementById(`customer-name-${customer.id}`) as HTMLInputElement).value,
                    contactPerson: (document.getElementById(`customer-contact-${customer.id}`) as HTMLInputElement).value,
                    email: (document.getElementById(`customer-email-${customer.id}`) as HTMLInputElement).value,
                    phone: (document.getElementById(`customer-phone-${customer.id}`) as HTMLInputElement).value,
                    address: (document.getElementById(`customer-address-${customer.id}`) as HTMLInputElement).value,
                    city: (document.getElementById(`customer-city-${customer.id}`) as HTMLInputElement).value,
                    state: (document.getElementById(`customer-state-${customer.id}`) as HTMLInputElement).value,
                    zipCode: (document.getElementById(`customer-zip-${customer.id}`) as HTMLInputElement).value,
                    country: (document.getElementById(`customer-country-${customer.id}`) as HTMLInputElement).value,
                    status: (document.getElementById(`customer-status-${customer.id}`) as HTMLSelectElement).value as "Active" | "Inactive" | "Suspended",
                    creditLimit: parseFloat((document.getElementById(`customer-credit-${customer.id}`) as HTMLInputElement).value),
                    paymentTerms: (document.getElementById(`customer-payment-${customer.id}`) as HTMLInputElement).value,
                    totalOrders: parseInt((document.getElementById(`customer-orders-${customer.id}`) as HTMLInputElement).value),
                    updatedAt: new Date().toISOString()
                  }
                  updateCustomer(customer.id, updatedCustomer)
                  setEditingCustomer(null)
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingCustomer(null)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </TableCell>
      </TableRow>
    )
  }

  // Helper function to render edit form for suppliers
  const renderSupplierEditForm = (supplier: Supplier) => {
    if (editingSupplier !== supplier.id) return null

    return (
      <TableRow key={`edit-${supplier.id}`} className="bg-green-50">
        <TableCell colSpan={8}>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <Input
                  defaultValue={supplier.name}
                  id={`supplier-name-${supplier.id}`}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <Input
                  defaultValue={supplier.contactPerson}
                  id={`supplier-contact-${supplier.id}`}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  defaultValue={supplier.email}
                  id={`supplier-email-${supplier.id}`}
                  className="w-full"
                  type="email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <Input
                  defaultValue={supplier.phone}
                  id={`supplier-phone-${supplier.id}`}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <Input
                  defaultValue={supplier.address}
                  id={`supplier-address-${supplier.id}`}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <Input
                  defaultValue={supplier.city}
                  id={`supplier-city-${supplier.id}`}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <Input
                  defaultValue={supplier.state}
                  id={`supplier-state-${supplier.id}`}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                <Input
                  defaultValue={supplier.zipCode}
                  id={`supplier-zip-${supplier.id}`}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <Input
                  defaultValue={supplier.country}
                  id={`supplier-country-${supplier.id}`}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  defaultValue={supplier.status}
                  id={`supplier-status-${supplier.id}`}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                <Input
                  defaultValue={supplier.paymentTerms}
                  id={`supplier-payment-${supplier.id}`}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lead Time (days)</label>
                <Input
                  defaultValue={supplier.leadTime}
                  id={`supplier-lead-${supplier.id}`}
                  className="w-full"
                  type="number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quality Rating</label>
                <Input
                  defaultValue={supplier.qualityRating}
                  id={`supplier-quality-${supplier.id}`}
                  className="w-full"
                  type="number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <select
                  defaultValue={supplier.rating}
                  id={`supplier-rating-${supplier.id}`}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Orders</label>
                <Input
                  defaultValue={supplier.totalOrders}
                  id={`supplier-orders-${supplier.id}`}
                  className="w-full"
                  type="number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialties</label>
                <Input
                  defaultValue={supplier.specialties.join(', ')}
                  id={`supplier-specialties-${supplier.id}`}
                  className="w-full"
                  placeholder="Comma separated values"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <Input
                  defaultValue={supplier.notes || ''}
                  id={`supplier-notes-${supplier.id}`}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  const updatedSupplier: Partial<Supplier> = {
                    name: (document.getElementById(`supplier-name-${supplier.id}`) as HTMLInputElement).value,
                    contactPerson: (document.getElementById(`supplier-contact-${supplier.id}`) as HTMLInputElement).value,
                    email: (document.getElementById(`supplier-email-${supplier.id}`) as HTMLInputElement).value,
                    phone: (document.getElementById(`supplier-phone-${supplier.id}`) as HTMLInputElement).value,
                    address: (document.getElementById(`supplier-address-${supplier.id}`) as HTMLInputElement).value,
                    city: (document.getElementById(`supplier-city-${supplier.id}`) as HTMLInputElement).value,
                    state: (document.getElementById(`supplier-state-${supplier.id}`) as HTMLInputElement).value,
                    zipCode: (document.getElementById(`supplier-zip-${supplier.id}`) as HTMLInputElement).value,
                    country: (document.getElementById(`supplier-country-${supplier.id}`) as HTMLInputElement).value,
                    status: (document.getElementById(`supplier-status-${supplier.id}`) as HTMLSelectElement).value as "Active" | "Inactive" | "Suspended",
                    paymentTerms: (document.getElementById(`supplier-payment-${supplier.id}`) as HTMLInputElement).value,
                    leadTime: parseInt((document.getElementById(`supplier-lead-${supplier.id}`) as HTMLInputElement).value),
                    qualityRating: parseFloat((document.getElementById(`supplier-quality-${supplier.id}`) as HTMLInputElement).value),
                    rating: parseInt((document.getElementById(`supplier-rating-${supplier.id}`) as HTMLSelectElement).value),
                    totalOrders: parseInt((document.getElementById(`supplier-orders-${supplier.id}`) as HTMLInputElement).value),
                    specialties: (document.getElementById(`supplier-specialties-${supplier.id}`) as HTMLInputElement).value.split(',').map(s => s.trim()).filter(s => s),
                    notes: (document.getElementById(`supplier-notes-${supplier.id}`) as HTMLInputElement).value || undefined,
                    updatedAt: new Date().toISOString()
                  }
                  updateSupplier(supplier.id, updatedSupplier)
                  setEditingSupplier(null)
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingSupplier(null)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </TableCell>
      </TableRow>
    )
  }

    // Helper function to render edit form for quotations
  const renderQuotationEditForm = (quotation: Quotation) => {
    if (editingQuotation !== quotation.id) return null
    
    return (
      <TableRow key={`edit-${quotation.id}`} className="bg-purple-50">
        <TableCell colSpan={8}>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quotation Number</label>
                <Input
                  defaultValue={quotation.quotationNumber}
                  id={`quotation-number-${quotation.id}`}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <Input
                  defaultValue={quotation.title}
                  id={`quotation-title-${quotation.id}`}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <Input
                  defaultValue={quotation.customerName}
                  id={`quotation-customer-${quotation.id}`}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  defaultValue={quotation.status}
                  id={`quotation-status-${quotation.id}`}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                <Input
                  defaultValue={quotation.total}
                  id={`quotation-total-${quotation.id}`}
                  className="w-full"
                  type="number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                <Input
                  defaultValue={quotation.validUntil}
                  id={`quotation-valid-${quotation.id}`}
                  className="w-full"
                  type="date"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  const updatedQuotation: Partial<Quotation> = {
                    quotationNumber: (document.getElementById(`quotation-number-${quotation.id}`) as HTMLInputElement).value,
                    title: (document.getElementById(`quotation-title-${quotation.id}`) as HTMLInputElement).value,
                    customerName: (document.getElementById(`quotation-customer-${quotation.id}`) as HTMLInputElement).value,
                    status: (document.getElementById(`quotation-status-${quotation.id}`) as HTMLSelectElement).value as "Draft" | "Sent" | "Approved" | "Rejected" | "Expired",
                    total: parseFloat((document.getElementById(`quotation-total-${quotation.id}`) as HTMLInputElement).value),
                    validUntil: (document.getElementById(`quotation-valid-${quotation.id}`) as HTMLInputElement).value,
                    updatedAt: new Date().toISOString()
                  }
                  updateQuotation(quotation.id, updatedQuotation)
                  setEditingQuotation(null)
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingQuotation(null)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </TableCell>
      </TableRow>
    )
  }

  // Helper function to render edit form for locations
  const renderLocationEditForm = (location: Location) => {
    if (editingLocation !== location.id) return null
    
    return (
      <TableRow key={`edit-${location.id}`} className="bg-emerald-50">
        <TableCell colSpan={13}>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <Input
                  defaultValue={location.code}
                  id={`location-code-${location.id}`}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <Input
                  defaultValue={location.name}
                  id={`location-name-${location.id}`}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  defaultValue={location.type}
                  id={`location-type-${location.id}`}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="Warehouse">Warehouse</option>
                  <option value="Rack">Rack</option>
                  <option value="Bin">Bin</option>
                  <option value="Office">Office</option>
                  <option value="Outdoor">Outdoor</option>
                  <option value="Specialized">Specialized</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  defaultValue={location.status}
                  id={`location-status-${location.id}`}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <Input
                  defaultValue={location.capacity}
                  id={`location-capacity-${location.id}`}
                  className="w-full"
                  type="number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Utilization</label>
                <Input
                  defaultValue={location.currentUtilization}
                  id={`location-utilization-${location.id}`}
                  className="w-full"
                  type="number"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  const updatedLocation: Partial<Location> = {
                    code: (document.getElementById(`location-code-${location.id}`) as HTMLInputElement).value,
                    name: (document.getElementById(`location-name-${location.id}`) as HTMLInputElement).value,
                    type: (document.getElementById(`location-type-${location.id}`) as HTMLSelectElement).value as "Warehouse" | "Rack" | "Bin" | "Office" | "Outdoor" | "Specialized",
                    status: (document.getElementById(`location-status-${location.id}`) as HTMLSelectElement).value as "Active" | "Inactive" | "Maintenance" | "Closed",
                    capacity: parseInt((document.getElementById(`location-capacity-${location.id}`) as HTMLInputElement).value),
                    currentUtilization: parseInt((document.getElementById(`location-utilization-${location.id}`) as HTMLInputElement).value),
                    updatedAt: new Date().toISOString()
                  }
                  updateLocation(location.id, updatedLocation)
                  setEditingLocation(null)
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingLocation(null)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </TableCell>
      </TableRow>
    )
  }

  // Helper function to render edit form for items
  const renderItemEditForm = (item: Item) => {
    if (editingItem !== item.id) return null
    
    return (
      <TableRow key={`edit-${item.id}`} className="bg-cyan-50">
        <TableCell colSpan={8}>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Part Number</label>
                <Input
                  defaultValue={item.partNumber}
                  id={`item-part-${item.id}`}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <Input
                  defaultValue={item.name}
                  id={`item-name-${item.id}`}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  defaultValue={item.category}
                  id={`item-category-${item.id}`}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="Raw Materials">Raw Materials</option>
                  <option value="Components">Components</option>
                  <option value="Finished Goods">Finished Goods</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Tools">Tools</option>
                  <option value="Supplies">Supplies</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  defaultValue={item.status}
                  id={`item-status-${item.id}`}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Discontinued">Discontinued</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost</label>
                <Input
                  defaultValue={item.unitCost}
                  id={`item-cost-${item.id}`}
                  className="w-full"
                  type="number"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
                <Input
                  defaultValue={item.currentStock}
                  id={`item-stock-${item.id}`}
                  className="w-full"
                  type="number"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  const updatedItem: Partial<Item> = {
                    partNumber: (document.getElementById(`item-part-${item.id}`) as HTMLInputElement).value,
                    name: (document.getElementById(`item-name-${item.id}`) as HTMLInputElement).value,
                    category: (document.getElementById(`item-category-${item.id}`) as HTMLSelectElement).value as "Raw Materials" | "Components" | "Finished Goods" | "Packaging" | "Tools" | "Supplies",
                    status: (document.getElementById(`item-status-${item.id}`) as HTMLSelectElement).value as "Active" | "Inactive" | "Discontinued",
                    unitCost: parseFloat((document.getElementById(`item-cost-${item.id}`) as HTMLInputElement).value),
                    currentStock: parseInt((document.getElementById(`item-stock-${item.id}`) as HTMLInputElement).value),
                    updatedAt: new Date().toISOString()
                  }
                  updateItem(item.id, updatedItem)
                  setEditingItem(null)
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingItem(null)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Database</h1>
          <p className="text-gray-600 mt-2">Manage and view all data in the local database system</p>
        </div>

        {/* Database Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Database Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{customers.length}</div>
                <div className="text-sm text-blue-800">Customers</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{suppliers.length}</div>
                <div className="text-sm text-green-800">Suppliers</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{quotations.length}</div>
                <div className="text-sm text-purple-800">Quotations</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{salesOrders.length}</div>
                <div className="text-sm text-orange-800">Sales Orders</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{drawings.length}</div>
                <div className="text-sm text-red-800">Engineering Drawings</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{boms.length}</div>
                <div className="text-sm text-yellow-800">Bills of Materials</div>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">{workOrders.length}</div>
                <div className="text-sm text-indigo-800">Production Orders</div>
              </div>
              <div className="text-center p-4 bg-pink-50 rounded-lg">
                <div className="text-2xl font-bold text-pink-600">{invoices.length}</div>
                <div className="text-sm text-pink-800">Invoices</div>
              </div>
              <div className="text-center p-4 bg-teal-50 rounded-lg">
                <div className="text-2xl font-bold text-teal-600">{purchaseOrders.length}</div>
                <div className="text-sm text-teal-800">Purchase Orders</div>
              </div>
              <div className="text-center p-4 bg-cyan-50 rounded-lg">
                <div className="text-2xl font-bold text-cyan-600">{items.length}</div>
                <div className="text-sm text-cyan-800">Items</div>
              </div>
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">{locations.length}</div>
                <div className="text-sm text-emerald-800">Locations</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Management */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
              Database Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Ready
              </span>
            </div>

            {/* Debug Info */}
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Database Version: {localStorage.getItem('mrp_prototype_version') || 'Not set'}</p>
              <p>• Customers in DB: {customers.length}</p>
              <p>• Suppliers in DB: {suppliers.length}</p>
              <p>• Quotations in DB: {quotations.length}</p>
              <p>• Items in DB: {items.length}</p>
              <p>• Locations in DB: {locations.length}</p>
              <p>• All localStorage keys: {Object.keys(localStorage).filter(key => key.startsWith('mrp_prototype_')).join(', ')}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={() => {
                const data = {
                  customers,
                  suppliers,
                  quotations,
                  salesOrders,
                  drawings,
                  boms,
                  workOrders,
                  invoices,
                  purchaseOrders,
                  items,
                  locations
                }
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'mrp-database-export.json'
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
              }}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Data
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                    // Clear all data
                    customers.forEach(customer => deleteCustomer(customer.id))
                    suppliers.forEach(supplier => deleteSupplier(supplier.id))
                    quotations.forEach(quotation => deleteQuotation(quotation.id))
                    salesOrders.forEach(order => deleteSalesOrder(order.id))
                    drawings.forEach(drawing => deleteDrawing(drawing.id))
                    boms.forEach(bom => deleteBom(bom.id))
                    workOrders.forEach(workOrder => deleteWorkOrder(workOrder.id))
                    invoices.forEach(invoice => deleteInvoice(invoice.id))
                    purchaseOrders.forEach(po => deletePurchaseOrder(po.id))
                    items.forEach(item => deleteItem(item.id))
                    locations.forEach(location => deleteLocation(location.id))
                  }
                }}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Data
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (confirm('This will reset the database to initial seed data. Continue?')) {
                    // Clear localStorage and reload to trigger re-seeding
                    localStorage.clear()
                    window.location.reload()
                  }
                }}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Database
              </Button>
            </div>

            {/* Import */}
            <div className="space-y-2">
              <label htmlFor="import-data" className="text-sm font-medium">Import Database (JSON):</label>
              <textarea
                id="import-data"
                className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Paste JSON data here..."
                onChange={(e) => {
                  try {
                    const data = JSON.parse(e.target.value)
                    if (data.customers) data.customers.forEach((customer: Customer) => createCustomer(customer))
                    if (data.suppliers) data.suppliers.forEach((supplier: Supplier) => createSupplier(supplier))
                    if (data.quotations) data.quotations.forEach((quotation: Quotation) => createQuotation(quotation))
                    if (data.salesOrders) data.salesOrders.forEach((order: SalesOrder) => createSalesOrder(order))
                    if (data.drawings) data.drawings.forEach((drawing: EngineeringDrawing) => createDrawing(drawing))
                    if (data.boms) data.boms.forEach((bom: BillOfMaterials) => createBom(bom))
                    if (data.workOrders) data.workOrders.forEach((workOrder: ProductionWorkOrder) => createWorkOrder(workOrder))
                    if (data.invoices) data.invoices.forEach((invoice: Invoice) => createInvoice(invoice))
                    if (data.purchaseOrders) data.purchaseOrders.forEach((po: PurchaseOrder) => createPurchaseOrder(po))
                    if (data.items) data.items.forEach((item: any) => {
                      const { id, createdAt, updatedAt, ...itemData } = item
                      createItem(itemData)
                    })
                    if (data.locations) data.locations.forEach((location: any) => {
                      const { id, createdAt, updatedAt, ...locationData } = location
                      createLocation(locationData)
                    })
                    e.target.value = ''
                    alert('Data imported successfully!')
                  } catch (error) {
                    // Handle invalid JSON silently
                  }
                }}
              />
              <Button
                variant="outline"
                onClick={() => {
                  const textarea = document.getElementById('import-data') as HTMLTextAreaElement
                  if (textarea && textarea.value.trim()) {
                    try {
                      const data = JSON.parse(textarea.value)
                      if (data.customers) data.customers.forEach((customer: Customer) => createCustomer(customer))
                      if (data.suppliers) data.suppliers.forEach((supplier: Supplier) => createSupplier(supplier))
                      if (data.quotations) data.quotations.forEach((quotation: Quotation) => createQuotation(quotation))
                      if (data.salesOrders) data.salesOrders.forEach((order: SalesOrder) => createSalesOrder(order))
                      if (data.drawings) data.drawings.forEach((drawing: EngineeringDrawing) => createDrawing(drawing))
                      if (data.boms) data.boms.forEach((bom: BillOfMaterials) => createBom(bom))
                      if (data.workOrders) data.workOrders.forEach((workOrder: ProductionWorkOrder) => createWorkOrder(workOrder))
                      if (data.invoices) data.invoices.forEach((invoice: Invoice) => createInvoice(invoice))
                      if (data.purchaseOrders) data.purchaseOrders.forEach((po: PurchaseOrder) => createPurchaseOrder(po))
                      if (data.items) data.items.forEach((item: any) => {
                        const { id, createdAt, updatedAt, ...itemData } = item
                        createItem(itemData)
                      })
                      if (data.locations) data.locations.forEach((location: any) => {
                        const { id, createdAt, updatedAt, ...locationData } = location
                        createLocation(locationData)
                      })
                      textarea.value = ''
                      alert('Data imported successfully!')
                    } catch (error) {
                      alert('Invalid JSON data. Please check your input.')
                    }
                  }
                }}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Import Data
              </Button>
            </div>

            {/* Info */}
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Data is stored locally in your browser using localStorage</p>
              <p>• Export your data before clearing to avoid data loss</p>
              <p>• Import will replace all existing data</p>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Data Tables */}
        <Tabs defaultValue="customers" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="engineering">Engineering</TabsTrigger>
            <TabsTrigger value="production">Production</TabsTrigger>
          </TabsList>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle>Customers ({customers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Credit Limit</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-mono text-sm text-gray-500">{customer.id}</TableCell>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.contactPerson}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{customer.status}</TableCell>
                        <TableCell>${customer.creditLimit.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingCustomer(customer.id)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteCustomer(customer.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {editingCustomer && customers.find(c => c.id === editingCustomer) && renderCustomerEditForm(customers.find(c => c.id === editingCustomer)!)}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers">
            <Card>
              <CardHeader>
                <CardTitle>Suppliers ({suppliers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Lead Time</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-mono text-sm text-gray-500">{supplier.id}</TableCell>
                        <TableCell className="font-medium">{supplier.name}</TableCell>
                        <TableCell>{supplier.contactPerson}</TableCell>
                        <TableCell>{supplier.email}</TableCell>
                        <TableCell>{supplier.phone}</TableCell>
                        <TableCell>{supplier.rating}/5</TableCell>
                        <TableCell>{supplier.leadTime} days</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingSupplier(supplier.id)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteSupplier(supplier.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {editingSupplier && suppliers.find(s => s.id === editingSupplier) && renderSupplierEditForm(suppliers.find(s => s.id === editingSupplier)!)}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Items Tab */}
          <TabsContent value="items">
            <Card>
              <CardHeader>
                <CardTitle>Items ({items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Part Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.flatMap((item) => [
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-sm text-gray-500">{item.id}</TableCell>
                        <TableCell className="font-medium">{item.partNumber}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>${item.unitCost.toFixed(2)}</TableCell>
                        <TableCell>{item.currentStock}</TableCell>
                        <TableCell>{item.status}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingItem(item.id)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>,
                      renderItemEditForm(item)
                    ])}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Locations Tab */}
          <TabsContent value="locations">
            <Card>
              <CardHeader>
                <CardTitle>Locations ({locations.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Utilization</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations.flatMap((location) => [
                      <TableRow key={location.id}>
                        <TableCell className="font-mono text-sm text-gray-500">{location.id}</TableCell>
                        <TableCell className="font-medium">{location.code}</TableCell>
                        <TableCell>{location.name}</TableCell>
                        <TableCell>{location.type}</TableCell>
                        <TableCell>{location.city}</TableCell>
                        <TableCell>{location.currentUtilization}%</TableCell>
                        <TableCell>{location.status}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingLocation(location.id)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteLocation(location.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>,
                      renderLocationEditForm(location)
                    ])}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales">
            <div className="space-y-6">
              {/* Quotations */}
              <Card>
                <CardHeader>
                  <CardTitle>Quotations ({quotations.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Number</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Valid Until</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quotations.map((quotation) => (
                        <TableRow key={quotation.id}>
                          <TableCell className="font-mono text-sm text-gray-500">{quotation.id}</TableCell>
                          <TableCell className="font-medium">{quotation.quotationNumber}</TableCell>
                          <TableCell>{quotation.customerName}</TableCell>
                          <TableCell>{quotation.title}</TableCell>
                          <TableCell>{quotation.status}</TableCell>
                          <TableCell>${quotation.total.toLocaleString()}</TableCell>
                          <TableCell>{quotation.validUntil}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingQuotation(quotation.id)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteQuotation(quotation.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {editingQuotation && quotations.find(q => q.id === editingQuotation) && renderQuotationEditForm(quotations.find(q => q.id === editingQuotation)!)}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Sales Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales Orders ({salesOrders.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Order Number</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Order Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm text-gray-500">{order.id}</TableCell>
                          <TableCell className="font-medium">{order.salesOrderNumber}</TableCell>
                          <TableCell>{order.customerName}</TableCell>
                          <TableCell>{order.title}</TableCell>
                          <TableCell>{order.status}</TableCell>
                          <TableCell>${order.total.toLocaleString()}</TableCell>
                          <TableCell>{order.orderDate}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingSalesOrder(order.id)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteSalesOrder(order.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Invoices */}
              <Card>
                <CardHeader>
                  <CardTitle>Invoices ({invoices.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Invoice Number</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Issue Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-mono text-sm text-gray-500">{invoice.id}</TableCell>
                          <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                          <TableCell>{invoice.customerName}</TableCell>
                          <TableCell>{invoice.status}</TableCell>
                          <TableCell>${invoice.total.toLocaleString()}</TableCell>
                          <TableCell>{invoice.issueDate}</TableCell>
                          <TableCell>{invoice.dueDate}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingInvoice(invoice.id)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteInvoice(invoice.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Purchase Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Purchase Orders ({purchaseOrders.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>PO Number</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Order Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchaseOrders.map((po) => (
                        <TableRow key={po.id}>
                          <TableCell className="font-mono text-sm text-gray-500">{po.id}</TableCell>
                          <TableCell className="font-medium">{po.poNumber}</TableCell>
                          <TableCell>{po.supplierName}</TableCell>
                          <TableCell>{po.status}</TableCell>
                          <TableCell>{po.priority || "Not set"}</TableCell>
                          <TableCell>${po.total.toLocaleString()}</TableCell>
                          <TableCell>{po.orderDate}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingPurchaseOrder(po.id)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deletePurchaseOrder(po.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Engineering Tab */}
          <TabsContent value="engineering">
            <div className="space-y-6">
              {/* Engineering Drawings */}
              <Card>
                <CardHeader>
                  <CardTitle>Engineering Drawings ({drawings.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Drawing Number</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Drawn By</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {drawings.map((drawing) => (
                        <TableRow key={drawing.id}>
                          <TableCell className="font-mono text-sm text-gray-500">{drawing.id}</TableCell>
                          <TableCell className="font-medium">{drawing.drawingNumber}</TableCell>
                          <TableCell>{drawing.title}</TableCell>
                          <TableCell>{drawing.status}</TableCell>
                          <TableCell>{drawing.drawnBy}</TableCell>
                          <TableCell>{drawing.version}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingDrawing(drawing.id)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteDrawing(drawing.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Bills of Materials */}
              <Card>
                <CardHeader>
                  <CardTitle>Bills of Materials ({boms.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>BOM Number</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total Cost</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {boms.map((bom) => (
                        <TableRow key={bom.id}>
                          <TableCell className="font-mono text-sm text-gray-500">{bom.id}</TableCell>
                          <TableCell className="font-medium">{bom.bomNumber}</TableCell>
                          <TableCell>{bom.title}</TableCell>
                          <TableCell>{bom.status}</TableCell>
                          <TableCell>${bom.totalCost.toLocaleString()}</TableCell>
                          <TableCell>{bom.createdBy}</TableCell>
                          <TableCell>{bom.version}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingBom(bom.id)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteBom(bom.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Production Tab */}
          <TabsContent value="production">
            <Card>
              <CardHeader>
                <CardTitle>Production Work Orders ({workOrders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Work Order Number</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workOrders.map((workOrder) => (
                      <TableRow key={workOrder.id}>
                        <TableCell className="font-mono text-sm text-gray-500">{workOrder.id}</TableCell>
                        <TableCell className="font-medium">{workOrder.workOrderNumber}</TableCell>
                        <TableCell>{workOrder.productName}</TableCell>
                        <TableCell>{workOrder.status}</TableCell>
                        <TableCell>{workOrder.priority}</TableCell>
                        <TableCell>{workOrder.progress}%</TableCell>
                        <TableCell>{workOrder.dueDate}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingWorkOrder(workOrder.id)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteWorkOrder(workOrder.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Use This Database</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• <strong>View Data:</strong> All database entities are displayed in organized tabs above</p>
              <p>• <strong>Edit Data:</strong> Click the edit button to modify existing records inline (currently available for Customers, Suppliers, and Quotations)</p>
              <p>• <strong>Delete Data:</strong> Click the trash button to remove records</p>
              <p>• <strong>Export Data:</strong> Use the Export Data button to download all data as JSON</p>
              <p>• <strong>Import Data:</strong> Paste JSON data to restore or load new data</p>
              <p>• <strong>Clear Data:</strong> Use the Clear Data button to remove all data (use with caution)</p>
              <p>• <strong>Persistent Storage:</strong> All data is automatically saved to localStorage</p>
              <p>• <strong>Data Overview:</strong> The overview above shows the total count of all entities in the database</p>
              <p>• <strong>New Entities:</strong> Items (inventory) and Locations (storage) are now fully integrated into the database system</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
