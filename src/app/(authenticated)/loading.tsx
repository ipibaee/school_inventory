import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="p-8 space-y-8 w-full">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-[200px]" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-[100px]" />
                    <Skeleton className="h-10 w-[100px]" />
                </div>
            </div>

            {/* Top Cards skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={`card-${i}-key`} className="rounded-xl border bg-card text-card-foreground shadow">
                        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-4" />
                        </div>
                        <div className="p-6 pt-0">
                            <Skeleton className="h-8 w-1/3 mb-1" />
                            <Skeleton className="h-3 w-3/4" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Content skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border bg-card px-6 py-6 shadow">
                    <Skeleton className="h-6 w-[150px] mb-6" />
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={`row1-${i}-key`} className="flex items-center space-x-4">
                                <Skeleton className="h-12 w-full" />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="col-span-3 rounded-xl border bg-card px-6 py-6 shadow">
                    <Skeleton className="h-6 w-[150px] mb-6" />
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={`row2-${i}-key`} className="flex flex-col space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-px w-full my-2" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
