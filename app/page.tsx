import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Wrench, Package, Factory, Receipt, TrendingUp, Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import Link from "next/link"

export default function Dashboard() {
  const stats = [
    { title: "Active Quotations", value: "12", icon: FileText, color: "text-blue-600" },
    { title: "Pending Drawings", value: "8", icon: Wrench, color: "text-orange-600" },
    { title: "BOMs in Review", value: "5", icon: Package, color: "text-purple-600" },
    { title: "Active Jobs", value: "15", icon: Factory, color: "text-green-600" },
  ]

  const recentJobs = [
    { id: "JOB-2024-001", customer: "ABC Steel Works", status: "Engineering", priority: "High", dueDate: "2024-01-15" },
    { id: "JOB-2024-002", customer: "Metro Construction", status: "Production", priority: "Medium", dueDate: "2024-01-20" },
    { id: "JOB-2024-003", customer: "Industrial Corp", status: "BOM Review", priority: "Low", dueDate: "2024-01-25" },
    { id: "JOB-2024-004", customer: "Steel Dynamics", status: "Quotation", priority: "High", dueDate: "2024-01-18" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Quotation": return "bg-blue-100 text-blue-800"
      case "Engineering": return "bg-orange-100 text-orange-800"
      case "BOM Review": return "bg-purple-100 text-purple-800"
      case "Production": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "High": return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "Medium": return <Clock className="w-4 h-4 text-yellow-500" />
      case "Low": return <CheckCircle className="w-4 h-4 text-green-500" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Steel MRP System</h1>
              <p className="text-sm text-gray-600">Material Requirements Planning Dashboard</p>
            </div>
            <nav className="flex space-x-4">
              <Link href="/quotations">
                <Button variant="ghost" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Quotations
                </Button>
              </Link>
              <Link href="/engineering">
                <Button variant="ghost" className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Engineering
                </Button>
              </Link>
              <Link href="/bom">
                <Button variant="ghost" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  BOM
                </Button>
              </Link>
              <Link href="/production">
                <Button variant="ghost" className="flex items-center gap-2">
                  <Factory className="w-4 h-4" />
                  Production
                </Button>
              </Link>
              <Link href="/invoicing">
                <Button variant="ghost" className="flex items-center gap-2">
                  <Receipt className="w-4 h-4" />
                  Invoicing
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  +2 from last week
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
            <CardDescription>
              Overview of current jobs in the system with their status and priority
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(job.priority)}
                      <div>
                        <p className="font-medium">{job.id}</p>
                        <p className="text-sm text-gray-600">{job.customer}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm font-medium">Due: {job.dueDate}</p>
                      <p className="text-xs text-gray-500">Priority: {job.priority}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
