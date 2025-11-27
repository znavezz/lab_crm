# Improve Skeleton Loading States

## Overview

Create accurate, reusable skeleton components that match the actual UI structure of each page, use CSS variables for proper theming, and ensure loading states provide a true preview of the content.

## Strategy

### Approach: Component-Based Skeleton System

Create specialized skeleton components for common patterns:

- Stat cards skeleton
- Search bar skeleton  
- Data card skeleton (for lists of items)
- Table skeleton
- Chart skeleton

This provides:

1. **Accuracy**: Skeletons match actual UI
2. **Reusability**: Same patterns across pages
3. **Maintainability**: Update skeleton when UI changes
4. **Theming**: Use CSS variables

## Implementation

### Phase 1: Update Base Skeleton Component

**File: [src/components/ui/skeleton.tsx](src/components/ui/skeleton.tsx)**

Current:

```tsx
className="bg-accent animate-pulse rounded-md"
```

Update to use CSS variables:

```tsx
className="bg-muted animate-pulse rounded-md"
```

This ensures proper theming with `--muted` variable.

### Phase 2: Create Skeleton Component Library

**File: [src/components/skeletons/index.tsx](src/components/skeletons/index.tsx)** (NEW)

Create reusable skeleton patterns:

1. **StatsCardSkeleton** - Matches stat cards with description + title
2. **SearchBarSkeleton** - Matches search input
3. **TabsSkeleton** - Matches tab navigation
4. **ListCardSkeleton** - Matches card items in lists (grants, projects, equipment)
5. **CarouselSkeleton** - Matches project carousel cards
6. **ChartSkeleton** - Matches chart placeholders
7. **TableRowSkeleton** - Matches table rows

### Phase 3: Update Dashboard Pages

Update loading states in all pages to use new skeleton components:

#### 1. **[src/app/(dashboard)/grants/page.tsx](src/app/(dashboard)/grants/page.tsx)**

Current skeleton (lines 207-219):

- Generic: 1 title bar + 3 boxes + 1 big box

Should be:

- Page title + description
- 4 stats cards (Total, Active, Funding, Pending)
- Search bar
- Tabs
- 3-4 grant card skeletons with:
  - Title + badges
  - Progress bar
  - Spent/Remaining text
  - Date range

#### 2. **[src/app/(dashboard)/projects/page.tsx](src/app/(dashboard)/projects/page.tsx)**

Current skeleton (lines 241-253):

- Generic: 1 title bar + 4 boxes + 1 big box

Should be:

- Page title + description + button
- 4 stats cards
- Search bar + tabs
- 3-4 project carousel card skeletons with:
  - Status bar
  - Title + badge
  - Progress bar
  - Description lines
  - Member avatars
  - Grant badges
  - Date info

#### 3. **[src/app/(dashboard)/equipment/page.tsx](src/app/(dashboard)/equipment/page.tsx)**

Should match equipment grid with:

- Title + button
- 4 stats cards
- Search bar + tabs
- Grid of equipment card skeletons

#### 4. **[src/app/(dashboard)/analytics/page.tsx](src/app/(dashboard)/analytics/page.tsx)**

Should match:

- Title
- Tabs
- Multiple chart skeletons
- Stats grids

#### 5. Other Dashboard Pages

- **members/page.tsx** - Member cards with avatars
- **events/page.tsx** - Event cards
- **publications/page.tsx** - Publication cards
- **protocols/page.tsx** - Protocol cards
- **dashboard/page.tsx** - Dashboard widgets
- **activities/page.tsx** - Activity feed
- **Detail pages** ([id]/page.tsx) - Detail view skeletons

### Phase 4: Create Page-Specific Loading Components

**Pattern:**

```tsx
// In each page file, create a loading component
function GrantsPageSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" /> {/* Title */}
          <Skeleton className="h-4 w-96" /> {/* Description */}
        </div>
        <Skeleton className="h-10 w-32" /> {/* Button */}
      </div>
      
      {/* Stats cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Main content card */}
      <Card>
        <CardHeader>
          <SearchBarSkeleton />
          <TabsSkeleton count={4} />
        </CardHeader>
        <CardContent>
          {[1, 2, 3].map((i) => (
            <GrantCardSkeleton key={i} />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
```

### Phase 5: Add CSS Variable Support

Update skeleton to respect theme colors:

- Use `--muted` for background
- Use `--muted-foreground` for subtle elements
- Ensure pulse animation works in dark mode

## File Changes Summary

### New Files:

1. `src/components/skeletons/index.tsx` - Reusable skeleton components
2. `src/components/skeletons/stats-card.tsx` - Stats card skeleton
3. `src/components/skeletons/search-bar.tsx` - Search bar skeleton
4. `src/components/skeletons/list-card.tsx` - List card skeleton
5. `src/components/skeletons/carousel-card.tsx` - Carousel card skeleton
6. `src/components/skeletons/chart.tsx` - Chart skeleton

### Modified Files:

1. `src/components/ui/skeleton.tsx` - Update to use CSS variables
2. `src/app/(dashboard)/grants/page.tsx` - Improved skeleton
3. `src/app/(dashboard)/projects/page.tsx` - Improved skeleton
4. `src/app/(dashboard)/equipment/page.tsx` - Improved skeleton
5. `src/app/(dashboard)/analytics/page.tsx` - Improved skeleton
6. `src/app/(dashboard)/members/page.tsx` - Improved skeleton
7. `src/app/(dashboard)/events/page.tsx` - Improved skeleton
8. `src/app/(dashboard)/publications/page.tsx` - Improved skeleton
9. `src/app/(dashboard)/protocols/page.tsx` - Improved skeleton
10. `src/app/(dashboard)/dashboard/page.tsx` - Improved skeleton
11. `src/app/(dashboard)/activities/page.tsx` - Improved skeleton
12. All detail pages `[id]/page.tsx` - Improved skeletons

## Benefits

1. **Better UX**: Users see a preview of what's loading
2. **Professional**: Matches modern app standards
3. **Reusable**: Common patterns used across pages
4. **Maintainable**: Update skeleton when UI changes
5. **Themed**: Works with light/dark mode
6. **Performance**: No layout shift when content loads

## Success Criteria

- Skeleton layouts accurately reflect actual page structure
- All pages use appropriate skeleton components
- CSS variables used for theming
- No layout shift when loading completes
- Works in both light and dark modes

## TODO List

- [ ] 1. Update Skeleton component to use CSS variables
- [ ] 2. Create reusable skeleton components library
- [ ] 3. Update grants page skeleton to match UI
- [ ] 4. Update projects page skeleton to match UI
- [ ] 5. Update equipment page skeleton to match UI
- [ ] 6. Update analytics page skeleton to match UI
- [ ] 7. Update members page skeleton to match UI
- [ ] 8. Update remaining dashboard pages skeletons
- [ ] 9. Update detail [id] pages skeletons
- [ ] 10. Test all pages loading states in light and dark mode

