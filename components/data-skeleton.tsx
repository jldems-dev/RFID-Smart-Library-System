import { Skeleton } from '@/components/ui/skeleton'

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-border">
      <td className="py-3 px-4">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-4 w-40" />
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-4 w-32" />
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-8 w-8 rounded-full" />
      </td>
    </tr>
  )
}

export function TableSkeletonLoader({ rowCount = 5 }: { rowCount?: number }) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
    </>
  )
}

export function DataLoadingError() {
  return (
    <div className="p-8 text-center">
      <p className="text-red-600 font-medium mb-4">Failed to load data</p>
      <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
    </div>
  )
}
