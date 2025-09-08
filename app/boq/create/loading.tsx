import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function BOQCreateLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ETO Workflow Context Skeleton */}
        <Card className="mb-6 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-32" />
            </CardTitle>
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Skeleton className="w-3 h-3 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-4" />
              <div className="flex items-center gap-2">
                <Skeleton className="w-3 h-3 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-4" />
              <div className="flex items-center gap-2">
                <Skeleton className="w-3 h-3 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-4 w-4" />
              <div className="flex items-center gap-2">
                <Skeleton className="w-3 h-3 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information Skeleton */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-32" />
            </CardTitle>
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div>
              <Skeleton className="h-4 w-12 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-20 w-full" />
            </div>
            
            {/* Source Selection Skeleton */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Skeleton className="h-6 w-32 mb-3" />
              <Skeleton className="h-4 w-64 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-28 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
            
            <div>
              <Skeleton className="h-4 w-36 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* BOQ Items Skeleton */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-20" />
            </CardTitle>
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add New Item Form Skeleton */}
            <div className="p-4 border rounded-lg bg-gray-50">
              <Skeleton className="h-6 w-24 mb-4" />
              
              {/* Item Master Selection Skeleton */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Skeleton className="h-4 w-40 mb-2" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-3 w-48 mt-1" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="md:col-span-2">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-12 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>

            {/* Items List Skeleton */}
            <div>
              <div className="border rounded-lg">
                <div className="border-b p-4">
                  <div className="grid grid-cols-8 gap-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border-b p-4 last:border-b-0">
                    <div className="grid grid-cols-8 gap-4">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ETO Workflow Actions Skeleton */}
        <Card className="bg-blue-50 border-blue-200 mb-6">
          <CardHeader>
            <CardTitle className="text-blue-900">
              <Skeleton className="h-6 w-48" />
            </CardTitle>
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded border">
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="p-3 bg-white rounded border">
                <Skeleton className="h-5 w-28 mb-2" />
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions Skeleton */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </main>
    </div>
  )
}
