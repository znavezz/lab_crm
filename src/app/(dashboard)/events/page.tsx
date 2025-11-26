'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { EventCardSkeleton, SearchBarSkeleton } from '@/components/skeletons'
import { ArrowLeftIcon, CalendarIcon, MapPinIcon, UsersIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const GET_EVENTS = gql`
  query GetEvents {
    events {
      id
      title
      description
      date
      location
      attendees {
        id
        name
      }
      projects {
        id
        title
      }
    }
  }
`

interface Event {
  id: string
  title: string
  description: string | null
  date: string
  location: string | null
  attendees: Array<{ id: string; name: string }>
  projects: Array<{ id: string; title: string }>
}

interface GetEventsData {
  events: Event[]
}

export default function EventsPage() {
  const { data, loading, error } = useQuery<GetEventsData>(GET_EVENTS)
  const { theme, resolvedTheme } = useTheme()
  const [googleCalendarInput, setGoogleCalendarInput] = useState('')
  const [googleCalendarId, setGoogleCalendarId] = useState('')
  const [showGoogleCalendar, setShowGoogleCalendar] = useState(false)

  const events = data?.events || []
  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  const pastEvents = events
    .filter((e) => new Date(e.date) < new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const extractCalendarId = (input: string): string | null => {
    // If it's an email address, return it directly
    if (input.includes('@') && !input.includes('http')) {
      return input.trim()
    }
    
    // If it's an embed URL, extract the src parameter
    const embedUrlMatch = input.match(/src=([^&]+)/)
    if (embedUrlMatch) {
      return decodeURIComponent(embedUrlMatch[1])
    }
    
    // If it's an iframe embed code, extract the src
    const iframeMatch = input.match(/src=["']([^"']+)["']/)
    if (iframeMatch) {
      const url = iframeMatch[1]
      const srcMatch = url.match(/src=([^&]+)/)
      if (srcMatch) {
        return decodeURIComponent(srcMatch[1])
      }
    }
    
    // If it's a full URL, try to extract from it
    if (input.includes('calendar.google.com')) {
      const urlMatch = input.match(/src=([^&]+)/)
      if (urlMatch) {
        return decodeURIComponent(urlMatch[1])
      }
    }
    
    // Otherwise, assume it's the calendar ID itself
    return input.trim() || null
  }

  const handleGoogleCalendarSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (googleCalendarInput.trim()) {
      const extractedId = extractCalendarId(googleCalendarInput)
      if (extractedId) {
        setGoogleCalendarId(extractedId)
        setShowGoogleCalendar(true)
      }
    }
  }

  const getGoogleCalendarEmbedUrl = (calendarId: string) => {
    // Google Calendar public embed URL format
    // Note: Google Calendar embed doesn't support colorScheme parameter
    // We'll use CSS filters instead to darken it in dark mode
    const encodedId = encodeURIComponent(calendarId)
    return `https://calendar.google.com/calendar/embed?src=${encodedId}&ctz=UTC`
  }

  const isDarkMode = resolvedTheme === 'dark' || theme === 'dark'

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Page header */}
        <div className="space-y-2">
          <Skeleton className="h-8 sm:h-9 w-32" /> {/* Title */}
        </div>

        {/* Search bar */}
        <SearchBarSkeleton />

        {/* Event cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard">
          <Button variant="ghost" className="gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <p className="text-destructive">Error loading events: {error.message}</p>
      </div>
    )
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
          <h1 className="text-3xl font-bold tracking-tight">Events & Calendar</h1>
          <p className="text-muted-foreground mt-2">
            Manage lab events and view calendar
          </p>
        </div>
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Lab Events</TabsTrigger>
          <TabsTrigger value="calendar">Google Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>{upcomingEvents.length} scheduled</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event) => (
                      <Link key={event.id} href={`/events/${event.id}`}>
                        <div className="p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold">{event.title}</h3>
                              {event.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {event.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                  <CalendarIcon className="h-3.5 w-3.5" />
                                  <span>{new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                                  <span>{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                {event.location && (
                                  <div className="flex items-center gap-1.5">
                                    <MapPinIcon className="h-3.5 w-3.5" />
                                    <span>{event.location}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                {event.attendees.length > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    <UsersIcon className="h-3 w-3 mr-1" />
                                    {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                                  </Badge>
                                )}
                                {event.projects.length > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    {event.projects.length} project{event.projects.length !== 1 ? 's' : ''}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No upcoming events</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Past Events</CardTitle>
                <CardDescription>{pastEvents.length} completed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pastEvents.length > 0 ? (
                    pastEvents.slice(0, 5).map((event) => (
                      <Link key={event.id} href={`/events/${event.id}`}>
                        <div className="p-4 rounded-lg border hover:bg-accent/50 transition-colors opacity-75">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold">{event.title}</h3>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                  <CalendarIcon className="h-3.5 w-3.5" />
                                  <span>{new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No past events</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Google Calendar Integration</CardTitle>
              <CardDescription>
                Embed a public Google Calendar to view external events alongside lab events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showGoogleCalendar ? (
                <form onSubmit={handleGoogleCalendarSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="calendarInput">Google Calendar ID or Embed URL</Label>
                    <Input
                      id="calendarInput"
                      placeholder="example@gmail.com or paste the embed URL/code"
                      value={googleCalendarInput}
                      onChange={(e) => setGoogleCalendarInput(e.target.value)}
                    />
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p className="font-medium">How to find it:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Go to Google Calendar → Settings → Calendar</li>
                        <li>Click on the calendar you want to embed</li>
                        <li>Scroll to &quot;Integrate calendar&quot;</li>
                        <li>Copy either:
                          <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                            <li>The <strong>Calendar ID</strong> (e.g., example@gmail.com), OR</li>
                            <li>The <strong>Public URL</strong> from the &quot;Public URL for this Calendar&quot; field, OR</li>
                            <li>The <strong>Embed Code</strong> from the &quot;Embed Code&quot; field</li>
                          </ul>
                        </li>
                        <li>Paste it here - we&apos;ll extract the Calendar ID automatically</li>
                      </ol>
                      <p className="mt-2 text-amber-600 dark:text-amber-400">
                        ⚠️ Make sure your calendar is set to &quot;Make available to public&quot; for the embed to work.
                      </p>
                    </div>
                  </div>
                  <Button type="submit" disabled={!googleCalendarInput.trim()}>
                    Load Calendar
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Calendar loaded</p>
                      <p className="text-xs text-muted-foreground">
                        Calendar ID: {googleCalendarId}
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => {
                      setShowGoogleCalendar(false)
                      setGoogleCalendarInput('')
                      setGoogleCalendarId('')
                    }}>
                      Change Calendar
                    </Button>
                  </div>
                  <div 
                    className="w-full rounded-lg border overflow-hidden" 
                    style={{ 
                      height: '600px',
                    }}
                  >
                    <iframe
                      key={`calendar-${resolvedTheme || theme}-${googleCalendarId}`}
                      src={getGoogleCalendarEmbedUrl(googleCalendarId)}
                      className={isDarkMode ? 'dark-calendar-filter' : ''}
                      style={{
                        border: 0,
                        width: '100%',
                        height: '100%',
                        filter: isDarkMode ? 'invert(1) hue-rotate(180deg)' : 'none',
                      }}
                      frameBorder="0"
                      scrolling="no"
                      title="Google Calendar"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

