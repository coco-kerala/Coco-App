import { cn } from "@/lib/utils";

export function LoadingState({ className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-20", className)}>
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-[3px] border-coco-border" />
        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-coco-green animate-spin" />
      </div>
      <p className="mt-4 text-sm font-medium text-coco-muted animate-pulse">Loading...</p>
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cn("animate-pulse rounded-xl bg-coco-border/60", className)} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-coco-border bg-white p-4 space-y-3">
      <div className="flex gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}
