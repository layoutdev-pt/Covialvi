import { Skeleton } from '@/components/ui/skeleton';

export default function PropertiesLoading() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 md:pt-12 pb-16">
        {/* Title skeleton */}
        <Skeleton className="h-10 w-72 mb-3" />
        <Skeleton className="h-5 w-96 max-w-full mb-8" />

        <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-8">
          {/* Filters skeleton */}
          <Skeleton className="h-14 w-full rounded-3xl lg:h-[620px]" />

          {/* Results skeleton */}
          <div>
            <div className="mb-5 flex items-center justify-between">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-10 w-[230px] rounded-full" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-3xl border border-border bg-card">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <div className="space-y-3 p-5">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="mt-4 h-4 w-40" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
