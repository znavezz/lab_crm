'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ListItemSkeleton } from '@/components/skeletons'
import { AlertCircleIcon, ArrowLeftIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

const GET_ALL_ACTIVITIES = gql`
  query GetAllActivities {
    members {
      id
      name
      createdAt
    }
    projects {
      id
      title
      createdAt
    }
    publications {
      id
      title
      published
      createdAt
    }
    protocols {
      id
      title
      createdAt
    }
    equipments {
      id
      name
      createdAt
    }
  }
`

interface Member {
  id: string
  name: string
  createdAt: string
}

interface Project {
  id: string
  title: string
  createdAt: string
}

interface Publication {
  id: string
  title: string
  published: string | null
  createdAt: string
}

interface Protocol {
  id: string
  title: string
  createdAt: string
}

interface Equipment {
  id: string
  name: string
  createdAt: string
}

interface GetAllActivitiesData {
  members: Member[]
  projects: Project[]
  publications: Publication[]
  protocols: Protocol[]
  equipments: Equipment[]
}

interface RecentActivity {
  type: string
  message: string
  time: Date
  createdAt: string
  href?: string
}

export default function ActivitiesPage() {
  const { data, loading, error } = useQuery<GetAllActivitiesData>(GET_ALL_ACTIVITIES)

  const allActivities = useMemo(() => {
    if (!data) return []
    
    const activities: RecentActivity[] = []
    
    // Recent members
    data.members?.forEach((m: Member) => {
      activities.push({
        type: 'member',
        message: `New member joined: ${m.name || 'Unknown'}`,
        time: new Date(m.createdAt),
        createdAt: m.createdAt,
        href: `/members/${m.id}`,
      })
    })
    
    // Recent projects
    data.projects?.forEach((p: Project) => {
      activities.push({
        type: 'project',
        message: `Project created: ${p.title || 'Unknown'}`,
        time: new Date(p.createdAt),
        createdAt: p.createdAt,
        href: `/projects/${p.id}`,
      })
    })
    
    // Recent publications
    data.publications?.forEach((p: Publication) => {
      if (p.published) {
        activities.push({
          type: 'publication',
          message: `New publication: ${p.title || 'Unknown'}`,
          time: new Date(p.published),
          createdAt: p.published,
          href: `/publications/${p.id}`,
        })
      } else {
        activities.push({
          type: 'publication',
          message: `Publication added: ${p.title || 'Unknown'}`,
          time: new Date(p.createdAt),
          createdAt: p.createdAt,
          href: `/publications/${p.id}`,
        })
      }
    })
    
    // Recent protocols
    data.protocols?.forEach((p: Protocol) => {
      activities.push({
        type: 'protocol',
        message: `Protocol created: ${p.title || 'Unknown'}`,
        time: new Date(p.createdAt),
        createdAt: p.createdAt,
        href: `/protocols/${p.id}`,
      })
    })
    
    // Recent equipment
    data.equipments?.forEach((e: Equipment) => {
      activities.push({
        type: 'equipment',
        message: `Equipment added: ${e.name || 'Unknown'}`,
        time: new Date(e.createdAt),
        createdAt: e.createdAt,
        href: `/equipment/${e.id}`,
      })
    })
    
    return activities.sort((a, b) => b.time.getTime() - a.time.getTime())
  }, [data])

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Page header - Static title */}
        <div className="space-y-2">
          <Skeleton className="h-8 sm:h-9 w-32" /> {/* "Recent Activity" title */}
        </div>

        {/* Activity feed - Chronological list of recent lab activities */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Activity items - Each shows type icon, message, and relative time */}
              {/* Types: member, project, publication, protocol, equipment */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <ListItemSkeleton key={i} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <p className="text-destructive">Error loading activities: {error.message}</p>
      </div>
    )
  }

  const formatTime = (date: Date) => {
    const now = new Date().getTime()
    const timeDiff = now - date.getTime()
    const minutes = Math.floor(timeDiff / 60000)
    const hours = Math.floor(timeDiff / 3600000)
    const days = Math.floor(timeDiff / 86400000)
    const weeks = Math.floor(days / 7)
    const months = Math.floor(days / 30)
    
    if (minutes < 60) {
      return minutes <= 1 ? 'Just now' : `${minutes} minutes ago`
    } else if (hours < 24) {
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`
    } else if (days < 7) {
      return days === 1 ? '1 day ago' : `${days} days ago`
    } else if (weeks < 4) {
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
    } else if (months < 12) {
      return months === 1 ? '1 month ago' : `${months} months ago`
    } else {
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }
  }

  const typeColors: Record<string, string> = {
    member: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    project: 'bg-green-500/10 text-green-700 dark:text-green-400',
    publication: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
    protocol: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
    equipment: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Activities</h1>
          <p className="text-muted-foreground mt-2">
            Complete history of your lab&apos;s activities
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>{allActivities.length} total activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allActivities.length > 0 ? (
              allActivities.map((activity, index) => {
                const content = (
                  <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
                      <AlertCircleIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <Badge className={typeColors[activity.type] || 'bg-muted'} variant="secondary">
                          {activity.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{formatTime(activity.time)}</p>
                    </div>
                  </div>
                )

                return activity.href ? (
                  <Link key={index} href={activity.href}>
                    {content}
                  </Link>
                ) : (
                  <div key={index}>{content}</div>
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No activities found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

