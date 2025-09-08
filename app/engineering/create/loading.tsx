import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function EngineeringCreateLoading() {
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
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
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
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
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
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Drawing Details Skeleton */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-28" />
            </CardTitle>
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Specifications Skeleton */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-40" />
            </CardTitle>
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* File Upload Skeleton */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-24" />
            </CardTitle>
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Skeleton className="h-12 w-12 mx-auto mb-4" />
              <Skeleton className="h-6 w-32 mx-auto mb-2" />
              <Skeleton className="h-4 w-48 mx-auto" />
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
