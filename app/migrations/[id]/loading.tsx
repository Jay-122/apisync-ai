import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 px-6 py-10">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-[480px] w-full" />
    </div>
  );
}
