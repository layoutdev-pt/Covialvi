export function HeroSkeleton() {
  return (
    <div className="relative min-h-[600px] md:min-h-[700px] bg-gray-200 animate-pulse rounded-3xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-300/60 via-gray-300/30 to-transparent" />
      <div className="relative z-10 h-full flex flex-col justify-center p-8 md:p-12 lg:p-16 min-h-[600px] md:min-h-[700px]">
        <div className="max-w-2xl space-y-6">
          <div className="space-y-3">
            <div className="h-12 md:h-16 bg-gray-300 rounded-lg w-3/4" />
            <div className="h-12 md:h-16 bg-gray-300 rounded-lg w-2/3" />
            <div className="h-12 md:h-16 bg-gray-300 rounded-lg w-1/2" />
          </div>
          <div className="h-6 bg-gray-300 rounded w-full max-w-xl" />
          <div className="h-14 bg-white/50 rounded-full w-full max-w-3xl" />
        </div>
      </div>
    </div>
  );
}
