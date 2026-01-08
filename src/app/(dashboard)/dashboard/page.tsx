'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useQuery } from '@apollo/client/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UsersIcon, FolderIcon, FileTextIcon, BanknoteIcon, BeakerIcon, TrendingUpIcon, AlertCircleIcon, CalendarIcon, ArrowRightIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { StatsCardSkeleton, ChartSkeleton, ListItemSkeleton } from '@/components/skeletons'
import { cn } from '@/lib/utils'
import { GetDashboardStatsDocument, GetDashboardStatsQuery } from '@/generated/graphql/graphql'

// Type aliases from generated types
type Member = GetDashboardStatsQuery['Members'][number]
type Project = GetDashboardStatsQuery['projects'][number]
type Publication = GetDashboardStatsQuery['publications'][number]
type Grant = GetDashboardStatsQuery['grants'][number]
type EventType = GetDashboardStatsQuery['events'][number]
type Protocol = GetDashboardStatsQuery['protocols'][number]
type Equipment = GetDashboardStatsQuery['equipments'][number]

interface RecentActivity {
  type: string
  message: string
  time: Date
  createdAt: string
  id: string
  href: string
}

export default function DashboardPage() {
  const { data, loading, error } = useQuery<GetDashboardStatsQuery>(GetDashboardStatsDocument)

  // Extract data with proper typing - use useMemo to prevent unnecessary re-renders
  const members = useMemo(() => data?.Members || [], [data?.Members])
  const projects = useMemo(() => data?.projects || [], [data?.projects])
  const publications = useMemo(() => data?.publications || [], [data?.publications])
  const grants = useMemo(() => data?.grants || [], [data?.grants])
  const events = useMemo(() => data?.events || [], [data?.events])
  const protocols = useMemo(() => data?.protocols || [], [data?.protocols])
  const equipments = useMemo(() => data?.equipments || [], [data?.equipments])

  // Get recent items - combine all recent activities
  const allRecentActivities = useMemo(() => {
    const activities: RecentActivity[] = []
    
    // Recent members
    members.forEach((m) => {
      activities.push({
        type: 'member',
        message: `New member joined: ${m.name || 'Unknown'}`,
        time: new Date(m.createdAt),
        createdAt: m.createdAt,
        id: m.id,
        href: `/members/${m.id}`,
      })
    })
    
    // Recent projects
    projects.forEach((p) => {
      activities.push({
        type: 'project',
        message: `Project created: ${p.title || 'Unknown'}`,
        time: new Date(p.createdAt),
        createdAt: p.createdAt,
        id: p.id,
        href: `/projects/${p.id}`,
      })
    })
    
    // Recent publications
    publications.forEach((p) => {
      if (p.published) {
        activities.push({
          type: 'publication',
          message: `New publication: ${p.title || 'Unknown'}`,
          time: new Date(p.published),
          createdAt: p.published,
          id: p.id,
          href: `/publications/${p.id}`,
        })
      } else {
        activities.push({
          type: 'publication',
          message: `Publication added: ${p.title || 'Unknown'}`,
          time: new Date(p.createdAt),
          createdAt: p.createdAt,
          id: p.id,
          href: `/publications/${p.id}`,
        })
      }
    })
    
    // Recent protocols
    protocols.forEach((p) => {
      activities.push({
        type: 'protocol',
        message: `Protocol created: ${p.title || 'Unknown'}`,
        time: new Date(p.createdAt),
        createdAt: p.createdAt,
        id: p.id,
        href: `/protocols/${p.id}`,
      })
    })
    
    // Recent equipment
    equipments.forEach((e) => {
      activities.push({
        type: 'equipment',
        message: `Equipment added: ${e.name || 'Unknown'}`,
        time: new Date(e.createdAt),
        createdAt: e.createdAt,
        id: e.id,
        href: `/equipment/${e.id}`,
      })
    })
    
    return activities
  }, [members, projects, publications, protocols, equipments])
  
  // Sort by time and take most recent
  const recentActivities = useMemo(() => {
    const now = new Date().getTime()
    return allRecentActivities
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 6)
      .map((activity) => {
        const timeDiff = now - activity.time.getTime()
        const minutes = Math.floor(timeDiff / 60000)
        const hours = Math.floor(timeDiff / 3600000)
        const days = Math.floor(timeDiff / 86400000)
        
        let timeStr = 'Recently'
        if (minutes < 60) {
          timeStr = minutes <= 1 ? 'Just now' : `${minutes} minutes ago`
        } else if (hours < 24) {
          timeStr = hours === 1 ? '1 hour ago' : `${hours} hours ago`
        } else if (days < 7) {
          timeStr = days === 1 ? '1 day ago' : `${days} days ago`
        } else {
          timeStr = activity.time.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
        }
        
        return {
          type: activity.type,
          message: activity.message,
          time: timeStr,
          id: activity.id,
          href: activity.href,
        }
      })
  }, [allRecentActivities])

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Page header - Static title and description */}
        <div className="page-header">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Overview of your lab&apos;s activities and resources
          </p>
        </div>

        {/* Stats cards - Static labels and icons, dynamic values */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Active Members', icon: UsersIcon, href: '/members', colorClass: 'stat-card-primary' },
            { title: 'Active Projects', icon: FolderIcon, href: '/projects', colorClass: 'stat-card-primary' },
            { title: 'Publications', icon: FileTextIcon, href: '/publications', colorClass: 'stat-card-primary' },
            { title: 'Active Grants', icon: BanknoteIcon, href: '/grants', colorClass: 'stat-card-primary' },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <Link key={stat.title} href={stat.href}>
                <Card className={`${stat.colorClass} cursor-pointer`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-12" /> {/* Dynamic count */}
                    <Skeleton className="h-3 w-20 mt-1" /> {/* Dynamic "X total" subtext */}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Main Content Grid - Recent Activities (4 cols) & Upcoming Events (3 cols) in 7-column layout */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Recent Activities - Static structure with dynamic content */}
          <Card className="col-span-4 flex flex-col">
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest updates from your lab</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-4 flex-1">
                {/* Activity items - Dynamic list of recent lab updates */}
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-4 p-2">
                    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" /> {/* Activity type icon */}
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" /> {/* Activity message */}
                      <Skeleton className="h-3 w-24" /> {/* Relative timestamp */}
                    </div>
                  </div>
                ))}
              </div>
              {/* Static, functional button during loading */}
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/activities">
                  View All Activities
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Events - Static structure with dynamic content */}
          <Card className="col-span-3 flex flex-col">
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Scheduled activities and deadlines</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-4 flex-1">
                {/* Event items - Dynamic list of upcoming events and grant deadlines */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-4 p-2">
                    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" /> {/* Calendar icon */}
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" /> {/* Event/deadline title */}
                      <Skeleton className="h-3 w-24" /> {/* Event date */}
                      <Skeleton className="h-5 w-16 mt-1" /> {/* Type badge (event/deadline) */}
                    </div>
                  </div>
                ))}
              </div>
              {/* Static, functional button during loading */}
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/events">
                  View Calendar
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Fully static and functional navigation buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and navigation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="action-button-glow h-auto flex-col py-4" asChild>
                <Link href="/members">
                  <UsersIcon className="mb-2 h-6 w-6" />
                  <span>Manage Members</span>
                </Link>
              </Button>
              <Button variant="outline" className="action-button-glow h-auto flex-col py-4" asChild>
                <Link href="/projects">
                  <FolderIcon className="mb-2 h-6 w-6" />
                  <span>View Projects</span>
                </Link>
              </Button>
              <Button variant="outline" className="action-button-glow h-auto flex-col py-4" asChild>
                <Link href="/equipment">
                  <BeakerIcon className="mb-2 h-6 w-6" />
                  <span>Equipment</span>
                </Link>
              </Button>
              <Button variant="outline" className="action-button-glow h-auto flex-col py-4" asChild>
                <Link href="/analytics">
                  <TrendingUpIcon className="mb-2 h-6 w-6" />
                  <span>Analytics</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <p className="text-destructive">Error loading dashboard: {error.message}</p>
      </div>
    )
  }

  // Calculate stats
  const activeMembers = members.filter((m) => m.status === 'ACTIVE').length
  const activeProjects = projects.filter((p) => {
    if (!p.endDate) return true
    return new Date(p.endDate) > new Date()
  }).length
  const publishedCount = publications.filter((p) => p.published).length
  const activeGrants = grants.filter((g) => new Date(g.endDate) > new Date()).length

  // Get upcoming events
  const upcomingEvents = [...events]
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)
    .map((e) => ({
      id: e.id,
      title: e.title || 'Untitled Event',
      date: new Date(e.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      type: 'event',
      href: `/events/${e.id}`,
    }))

  // Get upcoming grant end dates
  const upcomingGrantDeadlines = [...grants]
    .filter((g) => new Date(g.endDate) >= new Date())
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 3 - upcomingEvents.length)
    .map((g) => ({
      id: g.id,
      title: g.name || 'Untitled Grant',
      date: new Date(g.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      type: 'deadline',
      href: `/grants/${g.id}`,
    }))

  const allUpcoming = [...upcomingEvents, ...upcomingGrantDeadlines].slice(0, 3)

  const stats = [
    {
      title: 'Active Members',
      value: activeMembers.toString(),
      change: `${members.length} total`,
      icon: UsersIcon,
      href: '/members',
      colorClass: 'stat-card-primary',
    },
    {
      title: 'Active Projects',
      value: activeProjects.toString(),
      change: `${projects.length} total`,
      icon: FolderIcon,
      href: '/projects',
      colorClass: 'stat-card-primary',
    },
    {
      title: 'Publications',
      value: publishedCount.toString(),
      change: `${publications.length} total`,
      icon: FileTextIcon,
      href: '/publications',
      colorClass: 'stat-card-primary',
    },
    {
      title: 'Active Grants',
      value: activeGrants.toString(),
      change: `${grants.length} total`,
      icon: BanknoteIcon,
      href: '/grants',
      colorClass: 'stat-card-primary',
    },
  ]


  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your lab&apos;s activities and resources
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className={`${stat.colorClass} cursor-pointer`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activities */}
        <Card className="col-span-4 flex flex-col">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest updates from your lab</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="space-y-4 flex-1">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity: { type: string; message: string; time: string; href: string; id: string }, index: number) => (
                  <Link key={activity.id || index} href={activity.href}>
                    <div className="flex items-start gap-4 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                      <div className="rounded-full bg-primary/10 p-2">
                        <AlertCircleIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent activities</p>
              )}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/activities">
                View All Activities
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="col-span-3 flex flex-col">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Scheduled activities and deadlines</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="space-y-4 flex-1">
              {allUpcoming.length > 0 ? (
                allUpcoming.map((event) => (
                  <Link key={event.id} href={event.href}>
                    <div className="flex items-start gap-4 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                      <div className="rounded-full bg-secondary p-2">
                        <CalendarIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{event.date}</p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {event.type}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming events or deadlines</p>
              )}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/events">
                View Calendar
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and navigation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="action-button-glow h-auto flex-col py-4" asChild>
              <Link href="/members">
                <UsersIcon className="mb-2 h-6 w-6" />
                <span>Manage Members</span>
              </Link>
            </Button>
            <Button variant="outline" className="action-button-glow h-auto flex-col py-4" asChild>
              <Link href="/projects">
                <FolderIcon className="mb-2 h-6 w-6" />
                <span>View Projects</span>
              </Link>
            </Button>
            <Button variant="outline" className="action-button-glow h-auto flex-col py-4" asChild>
              <Link href="/equipment">
                <BeakerIcon className="mb-2 h-6 w-6" />
                <span>Equipment</span>
              </Link>
            </Button>
            <Button variant="outline" className="action-button-glow h-auto flex-col py-4" asChild>
              <Link href="/analytics">
                <TrendingUpIcon className="mb-2 h-6 w-6" />
                <span>Analytics</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
