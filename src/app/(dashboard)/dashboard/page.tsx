'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UsersIcon, FolderIcon, FileTextIcon, BanknoteIcon, BeakerIcon, TrendingUpIcon, AlertCircleIcon, CalendarIcon, ArrowRightIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    members {
      id
      name
      status
      createdAt
    }
    projects {
      id
      title
      startDate
      endDate
      createdAt
    }
    publications {
      id
      title
      published
      createdAt
    }
    grants {
      id
      name
      deadline
      createdAt
    }
    events {
      id
      date
      title
    }
    protocols {
      id
      title
      createdAt
      updatedAt
    }
    equipments {
      id
      name
      createdAt
    }
  }
`

// Type definitions
interface Member {
  status?: string
  name?: string
  createdAt: string
}

interface Project {
  endDate?: string | null
  title?: string
  createdAt: string
}

interface Publication {
  published?: string | null
  title?: string
  createdAt: string
}

interface Grant {
  deadline: string
  name?: string
}

interface Protocol {
  title?: string
  createdAt: string
}

interface Equipment {
  name?: string
  createdAt: string
}

interface Event {
  date: string
  title?: string
}

interface RecentActivity {
  type: string
  message: string
  time: Date
  createdAt: string
}

interface DashboardData {
  members?: Member[]
  projects?: Project[]
  publications?: Publication[]
  grants?: Grant[]
  events?: Event[]
  protocols?: Protocol[]
  equipments?: Equipment[]
}

export default function DashboardPage() {
  const { data, loading, error } = useQuery<DashboardData>(GET_DASHBOARD_STATS)

  // Extract data with proper typing - use useMemo to prevent unnecessary re-renders
  const members = useMemo(() => (data?.members || []) as Member[], [data?.members])
  const projects = useMemo(() => (data?.projects || []) as Project[], [data?.projects])
  const publications = useMemo(() => (data?.publications || []) as Publication[], [data?.publications])
  const grants = useMemo(() => (data?.grants || []) as Grant[], [data?.grants])
  const events = useMemo(() => (data?.events || []) as Event[], [data?.events])
  const protocols = useMemo(() => (data?.protocols || []) as Protocol[], [data?.protocols])
  const equipments = useMemo(() => (data?.equipments || []) as Equipment[], [data?.equipments])

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
      })
    })
    
    // Recent projects
    projects.forEach((p) => {
      activities.push({
        type: 'project',
        message: `Project created: ${p.title || 'Unknown'}`,
        time: new Date(p.createdAt),
        createdAt: p.createdAt,
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
        })
      } else {
        activities.push({
          type: 'publication',
          message: `Publication added: ${p.title || 'Unknown'}`,
          time: new Date(p.createdAt),
          createdAt: p.createdAt,
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
      })
    })
    
    // Recent equipment
    equipments.forEach((e) => {
      activities.push({
        type: 'equipment',
        message: `Equipment added: ${e.name || 'Unknown'}`,
        time: new Date(e.createdAt),
        createdAt: e.createdAt,
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
        }
      })
  }, [allRecentActivities])

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
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
  const activeGrants = grants.filter((g) => new Date(g.deadline) > new Date()).length

  // Get upcoming events
  const upcomingEvents = [...events]
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)
    .map((e) => ({
      title: e.title || 'Untitled Event',
      date: new Date(e.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      type: 'event',
    }))

  // Get upcoming grant deadlines
  const upcomingGrantDeadlines = [...grants]
    .filter((g) => new Date(g.deadline) >= new Date())
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3 - upcomingEvents.length)
    .map((g) => ({
      title: g.name || 'Untitled Grant',
      date: new Date(g.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      type: 'deadline',
    }))

  const allUpcoming = [...upcomingEvents, ...upcomingGrantDeadlines].slice(0, 3)

  const stats = [
    {
      title: 'Active Members',
      value: activeMembers.toString(),
      change: `${members.length} total`,
      icon: UsersIcon,
      href: '/members',
    },
    {
      title: 'Active Projects',
      value: activeProjects.toString(),
      change: `${projects.length} total`,
      icon: FolderIcon,
      href: '/projects',
    },
    {
      title: 'Publications',
      value: publishedCount.toString(),
      change: `${publications.length} total`,
      icon: FileTextIcon,
      href: '/publications',
    },
    {
      title: 'Active Grants',
      value: activeGrants.toString(),
      change: `${grants.length} total`,
      icon: BanknoteIcon,
      href: '/grants',
    },
  ]


  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
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
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest updates from your lab</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity: { type: string; message: string; time: string }, index: number) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <AlertCircleIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
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
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Scheduled activities and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allUpcoming.length > 0 ? (
                allUpcoming.map((event, index) => (
                  <div key={index} className="flex items-start gap-4">
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
            <Button variant="outline" className="h-auto flex-col py-4" asChild>
              <Link href="/members">
                <UsersIcon className="mb-2 h-6 w-6" />
                <span>Manage Members</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4" asChild>
              <Link href="/projects">
                <FolderIcon className="mb-2 h-6 w-6" />
                <span>View Projects</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4" asChild>
              <Link href="/equipment">
                <BeakerIcon className="mb-2 h-6 w-6" />
                <span>Equipment</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4" asChild>
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
