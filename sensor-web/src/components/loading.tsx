import { Skeleton } from "@/components/ui/skeleton";

export const Loading = () => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-center">
        <Skeleton className="h-10 w-64" />
      </div>

      {/* Map Area */}
      <div className="relative">
        <Skeleton className="w-full aspect-video rounded-lg" />
        {/* Coordinates overlay */}
        <div className="absolute top-4 left-4">
          <Skeleton className="h-6 w-96" />
        </div>
      </div>

      {/* Info Cards Grid */}

      {/* Gyroscope Data Section */}
      <div className="p-6 rounded-lg bg-white shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-32" />
        </div>
        {/* Graph Placeholder */}
        <Skeleton className="w-full aspect-[3/1]" />
      </div>
    </div>
  );
};
