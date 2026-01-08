'use client'

import { use } from 'react'
import Link from 'next/link'
import { useQuery } from '@apollo/client/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { ListItemSkeleton } from '@/components/skeletons'
import { ArrowLeftIcon, CalendarIcon, MapPinIcon, UsersIcon, FolderIcon, FileTextIcon, DollarSignIcon, BeakerIcon, CheckSquareIcon } from 'lucide-react'
import {
  GetEventDocument,
  GetEventQuery,
  GetEventQueryVariables,
} from '@/generated/graphql/graphql'

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data, loading, error } = useQuery<GetEventQuery, GetEventQueryVariables>(GetEventDocument, {
    variables: { id },
  })

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Back button */}
        <Skeleton className="h-10 w-32" />
        
        {/* Event header */}
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          </CardContent>
        </Card>

        {/* Related content */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              {[1, 2, 3].map((i) => (
                <ListItemSkeleton key={i} />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              {[1, 2, 3].map((i) => (
                <ListItemSkeleton key={i} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !data?.event) {
    return (
      <div className="space-y-6">
        <Link href="/events">
          <Button variant="ghost" className="gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Events
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {error ? `Error loading event: ${error.message}` : 'Event not found'}
          </p>
        </div>
      </div>
    )
  }

  const eventData = data.event

  // Transform Hasura response to match expected format
  const transformedEvent = {
    ...eventData,
    attendees: eventData?.EventMembers?.map((em: any) => em.Member) || [],
    projects: eventData?.EventProjects?.map((ep: any) => ep.Project) || [],
    tasks: eventData?.NoteTasks || [],
    expenses: eventData?.Expense || [],
    equipments: eventData?.EventEquipments?.map((ee: any) => ee.Equipment) || [],
  }
  const eventDate = new Date(transformedEvent.date)
  const isPast = eventDate < new Date()
  const formattedDate = eventDate.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  })
  const formattedTime = eventDate.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })

  return (
    <div className="space-y-6">
      <Link href="/events">
        <Button variant="ghost" className="gap-2">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Events
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div>
                <CardTitle className="text-3xl">{transformedEvent.title}</CardTitle>
                {transformedEvent.description && (
                  <CardDescription className="text-base mt-2">
                    {transformedEvent.description}
                  </CardDescription>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={isPast ? 'secondary' : 'default'} className={isPast ? '' : 'bg-chart-2'}>
                  {isPast ? 'Past Event' : 'Upcoming'}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-3">
              <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Date & Time</p>
                <p className="text-sm text-muted-foreground">{formattedDate}</p>
                <p className="text-sm text-muted-foreground">{formattedTime}</p>
              </div>
            </div>
            {transformedEvent.location && (
              <div className="flex items-start gap-3">
                <MapPinIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{transformedEvent.location}</p>
                </div>
              </div>
            )}
            {transformedEvent.attendees.length > 0 && (
              <div className="flex items-start gap-3">
                <UsersIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Attendees</p>
                  <p className="text-sm text-muted-foreground">
                    {transformedEvent.attendees.length} {transformedEvent.attendees.length === 1 ? 'person' : 'people'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Attendees Section */}
      {transformedEvent.attendees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              Attendees ({transformedEvent.attendees.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {transformedEvent.attendees.map((attendee) => {
                const initials = attendee.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'A'
                return (
                  <Link key={attendee.id} href={`/members/${attendee.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={attendee.photoUrl || undefined} alt={attendee.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{attendee.name}</p>
                        {attendee.role && (
                          <p className="text-xs text-muted-foreground truncate">{attendee.role}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related Projects */}
      {transformedEvent.projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderIcon className="h-5 w-5" />
              Related Projects ({transformedEvent.projects.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transformedEvent.projects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <div className="p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                    <p className="font-medium">{project.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks */}
      {transformedEvent.tasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquareIcon className="h-5 w-5" />
              Tasks ({transformedEvent.tasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transformedEvent.tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className={`h-5 w-5 rounded border-2 flex items-center justify-center ${
                    task.completed ? 'bg-chart-2 border-chart-2' : 'border-muted-foreground'
                  }`}>
                    {task.completed && (
                      <CheckSquareIcon className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                      {task.title}
                    </p>
                    {task.dueDate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Due: {new Date(task.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses */}
      {transformedEvent.expenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSignIcon className="h-5 w-5" />
              Expenses ({transformedEvent.expenses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transformedEvent.expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">{expense.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(expense.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">${expense.amount.toLocaleString()}</p>
                </div>
              ))}
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Total</p>
                  <p className="text-lg font-bold">
                    ${transformedEvent.expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Equipment */}
      {transformedEvent.equipments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BeakerIcon className="h-5 w-5" />
              Equipment ({transformedEvent.equipments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {transformedEvent.equipments.map((equipment) => (
                <Link key={equipment.id} href={`/equipment/${equipment.id}`}>
                  <div className="p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                    <p className="text-sm font-medium">{equipment.name}</p>
                    <Badge 
                      variant="outline" 
                      className={`mt-2 text-xs ${
                        equipment.status === 'AVAILABLE' ? 'bg-chart-2/10 border-chart-2' :
                        equipment.status === 'IN_USE' ? 'bg-chart-4/10 border-chart-4' :
                        'bg-chart-5/10 border-chart-5'
                      }`}
                    >
                      {equipment.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}



