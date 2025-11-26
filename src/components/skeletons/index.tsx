import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

/**
 * StatsCardSkeleton - Matches the stat cards with description + title
 * Used in: grants, projects, equipment, analytics pages
 */
export function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-4 w-24 mb-2" /> {/* Description */}
        <Skeleton className="h-8 w-16" /> {/* Title/Number */}
      </CardHeader>
    </Card>
  )
}

/**
 * SearchBarSkeleton - Matches the search input
 * Used in: Most list pages
 */
export function SearchBarSkeleton() {
  return (
    <div className="relative flex-1">
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  )
}

/**
 * TabsSkeleton - Matches tab navigation
 * @param count - Number of tabs to display
 */
export function TabsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="w-full">
      <div className="w-full grid h-auto gap-1" style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}>
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    </div>
  )
}

/**
 * GrantCardSkeleton - Matches grant list cards
 * Used in: grants page
 */
export function GrantCardSkeleton() {
  return (
    <Card className="mb-3 sm:mb-4">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-3/4" /> {/* Title */}
            <div className="flex items-center gap-2 flex-wrap">
              <Skeleton className="h-5 w-20" /> {/* Status badge */}
              <Skeleton className="h-5 w-24" /> {/* Budget */}
              <Skeleton className="h-5 w-20" /> {/* Projects count */}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-2 w-full" /> {/* Progress bar */}
          <div className="flex justify-between text-xs">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        
        {/* Date section */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-48" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * ProjectCardSkeleton - Matches project carousel cards
 * Used in: projects page
 */
export function ProjectCardSkeleton() {
  return (
    <Card className="mb-3 sm:mb-4">
      <CardHeader>
        {/* Status bar */}
        <Skeleton className="h-1 w-full mb-4" />
        
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-3/4" /> {/* Title */}
              <Skeleton className="h-5 w-16" /> {/* Badge */}
            </div>
            <Skeleton className="h-4 w-full" /> {/* Description line 1 */}
            <Skeleton className="h-4 w-5/6" /> {/* Description line 2 */}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
        
        {/* Members */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        
        {/* Grants and dates */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * EquipmentCardSkeleton - Matches equipment grid cards
 * Used in: equipment page
 * Layout: 2-column grid (md:grid-cols-2)
 * 
 * Card structure:
 * - Header: Equipment name, description, status badge, and optional "In Use By" badge
 * - Content: Serial number on left, "Book" button on right
 */
export function EquipmentCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          {/* No icon - removed to avoid redundancy (all equipment showed same icon) */}
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-3/4" /> {/* Equipment name */}
                <Skeleton className="h-4 w-5/6" /> {/* Equipment description */}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Skeleton className="h-5 w-20" /> {/* Status badge (Available/In Use/Maintenance) */}
              <Skeleton className="h-5 w-32" /> {/* Optional: "In Use By [member]" badge */}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Bottom row: Serial number and action button */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-40" /> {/* Serial number */}
          <Skeleton className="h-8 w-20" /> {/* "Book" button (navigates to booking page) */}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * MemberCardSkeleton - Matches member cards with avatars
 * Used in: members page
 */
export function MemberCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" /> {/* Avatar */}
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-3/4" /> {/* Name */}
            <Skeleton className="h-4 w-1/2" /> {/* Rank */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16" /> {/* Status badge */}
              <Skeleton className="h-5 w-20" /> {/* Role badge */}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * ChartSkeleton - Matches chart placeholders
 * Used in: analytics, dashboard pages
 */
export function ChartSkeleton({ height = 'h-64' }: { height?: string }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" /> {/* Chart title */}
      </CardHeader>
      <CardContent>
        <Skeleton className={`w-full ${height} rounded-md`} />
      </CardContent>
    </Card>
  )
}

/**
 * TableRowSkeleton - Matches table rows
 * Used in: Detail pages with tables
 */
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  )
}

/**
 * EventCardSkeleton - Matches event cards
 * Used in: events page
 */
export function EventCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-3/4" /> {/* Title */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-32" /> {/* Date */}
              <Skeleton className="h-4 w-24" /> {/* Time */}
            </div>
            <Skeleton className="h-5 w-20" /> {/* Type badge */}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * PublicationCardSkeleton - Matches publication cards
 * Used in: publications page
 */
export function PublicationCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" /> {/* Title */}
          <Skeleton className="h-4 w-3/4" /> {/* Authors */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-32" /> {/* Journal */}
            <Skeleton className="h-4 w-24" /> {/* Date */}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16" /> {/* Status */}
          <Skeleton className="h-5 w-20" /> {/* Badge */}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * ProtocolCardSkeleton - Matches protocol cards
 * Used in: protocols page
 */
export function ProtocolCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" /> {/* Title */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-20" /> {/* Category badge */}
            <Skeleton className="h-5 w-24" /> {/* Difficulty badge */}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * ListItemSkeleton - Generic list item skeleton
 * Used in: Various list pages
 */
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3 border-b">
      <Skeleton className="h-10 w-10 rounded-md flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  )
}

