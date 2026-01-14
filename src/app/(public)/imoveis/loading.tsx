import { Skeleton } from '@/components/ui/skeleton';

export default function PropertiesLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="py-12 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-10 w-48 mb-4" />
          <Skeleton className="h-5 w-72" />
        </div>
      </div>

      {/* Filters skeleton */}
      <div className="px-6 md:px-12 lg:px-20 pb-8">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-4">
          <Skeleton className="h-10 w-40 rounded-full" />
          <Skeleton className="h-10 w-32 rounded-full" />
          <Skeleton className="h-10 w-36 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
      </div>

      {/* Properties grid skeleton */}
      <div className="px-6 md:px-12 lg:px-20 pb-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-6 w-28 mt-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
