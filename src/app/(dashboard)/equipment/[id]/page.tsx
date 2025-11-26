'use client'

import { use, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useQuery, useMutation } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeftIcon, BeakerIcon, HashIcon, UserIcon, CalendarIcon, AlertTriangleIcon } from 'lucide-react'
import type {
  Equipment,
  Booking,
  Member,
  Project,
  Event,
  BookingDataQuery,
  CreateBookingMutationData,
  UpdateEquipmentMutationData
} from '@/types/graphql-queries'

const GET_EQUIPMENT = gql`
  query GetEquipment($id: ID!) {
    equipment(id: $id) {
      id
      name
      description
      serialNumber
      status
      project {
        id
        title
      }
      member {
        id
        name
      }
      createdAt
    }
    bookings {
      id
      startTime
      endTime
      equipmentId
      member {
        id
        name
      }
    }
  }
`

const GET_BOOKING_DATA = gql`
  query GetBookingData {
    members {
      id
      name
    }
    projects {
      id
      title
    }
    events {
      id
      title
      date
    }
  }
`

const CREATE_BOOKING = gql`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      id
      startTime
      endTime
      purpose
    }
  }
`

const UPDATE_EQUIPMENT = gql`
  mutation UpdateEquipment($id: ID!, $input: UpdateEquipmentInput!) {
    updateEquipment(id: $id, input: $input) {
      id
      status
    }
  }
`

interface GetEquipmentData {
  equipment: Equipment
  bookings: Booking[]
}

interface GetEquipmentVariables {
  id: string
}

const statusColors: Record<string, string> = {
  AVAILABLE: 'bg-chart-2 text-white',
  IN_USE: 'bg-chart-4 text-white',
  MAINTENANCE: 'bg-chart-5 text-white',
}

interface BookingFormData {
  startTime: string
  endTime: string
  purpose: string
  memberId: string
  projectId: string
  eventId: string
}

export default function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data, loading, error } = useQuery<GetEquipmentData, GetEquipmentVariables>(GET_EQUIPMENT, {
    variables: { id },
  })

  const { data: bookingData } = useQuery<BookingDataQuery>(GET_BOOKING_DATA)
  const [createBooking] = useMutation<CreateBookingMutationData>(CREATE_BOOKING)
  const [updateEquipment] = useMutation<UpdateEquipmentMutationData>(UPDATE_EQUIPMENT)

  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Refs for booking form auto-focus functionality
  const startTimeRef = useRef<HTMLInputElement>(null)
  const endTimeRef = useRef<HTMLInputElement>(null)
  const purposeRef = useRef<HTMLTextAreaElement>(null)
  const memberSelectRef = useRef<HTMLButtonElement>(null)
  const projectSelectRef = useRef<HTMLButtonElement>(null)
  const eventSelectRef = useRef<HTMLButtonElement>(null)
  const [bookingForm, setBookingForm] = useState<BookingFormData>({
    startTime: '',
    endTime: '',
    purpose: '',
    memberId: '',
    projectId: '',
    eventId: '',
  })

  // Auto-focus effect when booking dialog opens
  useEffect(() => {
    if (isBookingDialogOpen && startTimeRef.current) {
      // Small delay to ensure the dialog is rendered
      setTimeout(() => {
        startTimeRef.current?.focus()
      }, 100)
    }
  }, [isBookingDialogOpen])

  // Auto-focus helper functions for booking form
  const focusNextField = (currentField: string, value: string) => {
    if (!value.trim()) return // Don't move focus if field is empty

    setTimeout(() => {
      switch (currentField) {
        case 'purpose':
          // For select fields, we focus the trigger button
          memberSelectRef.current?.focus()
          break
      }
    }, 100)
  }

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setBookingForm({ ...bookingForm, startTime: value })
  }

  const handleStartTimeBlur = () => {
    // When start time field loses focus (calendar closes), move to end time
    if (bookingForm.startTime) {
      setTimeout(() => {
        endTimeRef.current?.focus()
      }, 100)
    }
  }

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setBookingForm({ ...bookingForm, endTime: value })
  }

  const handleEndTimeBlur = () => {
    // When end time field loses focus (calendar closes), move to purpose
    if (bookingForm.endTime) {
      setTimeout(() => {
        purposeRef.current?.focus()
      }, 100)
    }
  }

  const handlePurposeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setBookingForm({ ...bookingForm, purpose: value })
    if (value.length >= 10) { // Move to next field when purpose has at least 10 characters
      focusNextField('purpose', value)
    }
  }

  const handleCreateBooking = async () => {
    try {
      const startTime = new Date(bookingForm.startTime)
      const endTime = new Date(bookingForm.endTime)
      const now = new Date()

      // Validation 1: Check if equipment has permanent assignment
      if (equipment.member || equipment.project) {
        setErrorMessage(`Cannot book equipment. It is permanently assigned to ${equipment.member?.name || equipment.project?.title}.`)
        setIsErrorDialogOpen(true)
        return
      }

      // Validation 2: Check for overlapping bookings
      const overlappingBookings = equipmentBookings.filter(booking => {
        const bookingStart = new Date(booking.startTime)
        const bookingEnd = new Date(booking.endTime)

        // Check if the requested time overlaps with existing booking
        // Two time periods overlap if: start1 < end2 AND start2 < end1
        return startTime < bookingEnd && bookingStart < endTime
      })

      if (overlappingBookings.length > 0) {
        const conflictBooking = overlappingBookings[0]
        const conflictMember = conflictBooking.member?.name || 'Unknown user'
        setErrorMessage(`Cannot book equipment. It conflicts with an existing booking by ${conflictMember} from ${new Date(conflictBooking.startTime).toLocaleString()} to ${new Date(conflictBooking.endTime).toLocaleString()}.`)
        setIsErrorDialogOpen(true)
        return
      }

      // Validation 3: Check if start time is in the past (only for immediate bookings)
      if (startTime < now && endTime > now) {
        // This is okay - user can book equipment that's currently available but will start immediately
      } else if (startTime < now) {
        setErrorMessage('Cannot book equipment for past time periods.')
        setIsErrorDialogOpen(true)
        return
      }

      // Create the booking record
      await createBooking({
        variables: {
          input: {
            ...bookingForm,
            equipmentId: id,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            projectId: bookingForm.projectId || undefined,
            eventId: bookingForm.eventId || undefined,
          },
        },
      })

      setIsBookingDialogOpen(false)
      setBookingForm({
        startTime: '',
        endTime: '',
        purpose: '',
        memberId: '',
        projectId: '',
        eventId: '',
      })
      // Refetch equipment data to show updated status
      window.location.reload()
    } catch (error) {
      console.error('Error creating booking:', error)
      setErrorMessage('Failed to create booking. Please try again.')
      setIsErrorDialogOpen(true)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (error || !data?.equipment) {
    return (
      <div className="space-y-6">
        <Link href="/equipment">
          <Button variant="ghost" className="gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Equipment
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {error ? `Error loading equipment: ${error.message}` : 'Equipment not found'}
          </p>
        </div>
      </div>
    )
  }

  const equipment = data.equipment

  // Compute effective status:
  // 1. If permanently assigned (member/project), equipment is IN_USE (unless MAINTENANCE)
  // 2. If has active booking (current time between start/end), equipment is IN_USE
  // 3. Otherwise use the stored status
  const now = new Date()
  const hasPermanentAssignment = (equipment.member || equipment.project) && equipment.status !== 'MAINTENANCE'

  // Filter bookings for this specific equipment and check for active bookings
  const equipmentBookings = data?.bookings?.filter(booking => booking.equipmentId === equipment.id) || []
  const hasActiveBooking = equipmentBookings.some(booking => {
    const startTime = new Date(booking.startTime)
    const endTime = new Date(booking.endTime)
    return startTime <= now && now <= endTime
  })

  const effectiveStatus = hasPermanentAssignment || hasActiveBooking
    ? 'IN_USE'
    : equipment.status

  return (
    <div className="space-y-6">
      <Link href="/equipment">
        <Button variant="ghost" className="gap-2">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Equipment
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-4">
              <BeakerIcon className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <CardTitle className="text-3xl">{equipment.name}</CardTitle>
                {equipment.description && (
                  <CardDescription className="text-base mt-1">
                    {equipment.description}
                  </CardDescription>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={statusColors[effectiveStatus] || 'bg-muted text-muted-foreground'}>
                  {effectiveStatus.replace('_', ' ')}
                </Badge>
                {equipment.member && (
                  <Link href={`/members/${equipment.member.id}`}>
                    <Badge variant="outline" className="bg-chart-4/10 border-chart-4 hover:bg-chart-4/20 cursor-pointer">
                      In Use By: {equipment.member.name}
                    </Badge>
                  </Link>
                )}
                {equipment.project && (
                  <Link href={`/projects/${equipment.project.id}`}>
                    <Badge variant="outline" className="hover:bg-accent cursor-pointer">
                    Project: {equipment.project.title}
                  </Badge>
                  </Link>
                )}
              </div>
            </div>
            {!equipment.member && !equipment.project && (
              <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg">Book Equipment</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Book Equipment</DialogTitle>
                    <DialogDescription>
                      Schedule a booking for {equipment.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        ref={startTimeRef}
                        id="startTime"
                        type="datetime-local"
                        value={bookingForm.startTime}
                        onInput={handleStartTimeChange}
                        onBlur={handleStartTimeBlur}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        ref={endTimeRef}
                        id="endTime"
                        type="datetime-local"
                        value={bookingForm.endTime}
                        onInput={handleEndTimeChange}
                        onBlur={handleEndTimeBlur}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="purpose">Purpose</Label>
                      <Textarea
                        ref={purposeRef}
                        id="purpose"
                        placeholder="Describe the purpose of this booking..."
                        value={bookingForm.purpose}
                        onChange={handlePurposeChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="memberId">Member</Label>
                      <Select
                        value={bookingForm.memberId}
                        onValueChange={(value) => {
                          setBookingForm({ ...bookingForm, memberId: value })
                          // Auto-focus to project select after member selection
                          if (value) {
                            setTimeout(() => projectSelectRef.current?.focus(), 100)
                          }
                        }}
                      >
                        <SelectTrigger ref={memberSelectRef}>
                          <SelectValue placeholder="Select a member" />
                        </SelectTrigger>
                        <SelectContent>
                          {bookingData?.members?.map((member: Member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name}
                            </SelectItem>
                          )) || []}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="projectId">Project (Optional)</Label>
                      <Select
                        value={bookingForm.projectId}
                        onValueChange={(value) => {
                          setBookingForm({ ...bookingForm, projectId: value === 'none' ? '' : value })
                          // Auto-focus to event select after project selection
                          if (value && value !== 'none') {
                            setTimeout(() => eventSelectRef.current?.focus(), 100)
                          }
                        }}
                      >
                        <SelectTrigger ref={projectSelectRef}>
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {(bookingData?.projects || []).map((project: Project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="eventId">Event (Optional)</Label>
                      <Select
                        value={bookingForm.eventId}
                        onValueChange={(value) => setBookingForm({ ...bookingForm, eventId: value === 'none' ? '' : value })}
                      >
                        <SelectTrigger ref={eventSelectRef}>
                          <SelectValue placeholder="Select an event" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {(bookingData?.events || []).map((event: Event) => (
                            <SelectItem key={event.id} value={event.id}>
                              {event.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateBooking}>
                      Book Equipment
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Error Dialog */}
            <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-destructive/10 p-2">
                      <AlertTriangleIcon className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <DialogTitle className="text-left">Booking Error</DialogTitle>
                      <DialogDescription className="text-left">
                        Unable to create booking
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {errorMessage}
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setIsErrorDialogOpen(false)}>
                    Try Again
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {equipment.serialNumber && (
              <div className="flex items-center gap-3">
                <HashIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Serial Number</p>
                  <p className="text-sm text-muted-foreground font-mono text-xs">{equipment.serialNumber}</p>
                </div>
              </div>
            )}
            {equipment.member && (
              <div className="flex items-center gap-3">
                <UserIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">In Use By</p>
                  <Link href={`/members/${equipment.member.id}`} className="text-sm text-primary hover:underline">
                    {equipment.member.name}
                  </Link>
                </div>
              </div>
            )}
            {equipment.project && (
              <div className="flex items-center gap-3">
                <BeakerIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Project</p>
                  <Link href={`/projects/${equipment.project.id}`} className="text-sm text-primary hover:underline">
                    {equipment.project.title}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
