export const ServiceCardSkeleton = () => (
  <div className="bg-card rounded-lg border shadow-sm overflow-hidden animate-pulse">
    <div className="h-32 w-full bg-gray-200" />
    <div className="p-5 space-y-3">
      <div className="h-4 w-20 bg-gray-200 rounded" />
      <div className="h-5 w-3/4 bg-gray-200 rounded" />
      <div className="h-4 w-full bg-gray-200 rounded" />
      <div className="h-4 w-5/6 bg-gray-200 rounded" />
      <div className="flex justify-between pt-2">
        <div className="h-4 w-20 bg-gray-200 rounded" />
        <div className="h-5 w-16 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

export const ServiceDetailsSkeletons = () => (
  <div className="grid gap-8 lg:grid-cols-3 animate-pulse">
    <div className="lg:col-span-2 space-y-6">
      <div className="h-64 w-full bg-gray-200 rounded-lg" />
      <div className="space-y-3">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-8 w-2/3 bg-gray-200 rounded" />
        <div className="h-4 w-1/3 bg-gray-200 rounded" />
        <div className="h-4 w-1/2 bg-gray-200 rounded mt-4" />
      </div>
      <div className="space-y-4">
        <div className="h-6 w-24 bg-gray-200 rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4 space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-48 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
    <div className="lg:col-span-1">
      <div className="sticky top-8 rounded-lg border bg-card p-6 space-y-4 animate-pulse">
        <div className="h-8 w-20 bg-gray-200 rounded" />
        <div className="h-10 w-full bg-gray-200 rounded" />
        <div className="h-10 w-full bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

export const ListingPageSkeleton = () => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <ServiceCardSkeleton key={i} />
    ))}
  </div>
);
