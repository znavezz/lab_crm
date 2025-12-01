'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EquipmentCardSkeleton } from '@/components/skeletons'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SearchIcon, PlusIcon } from 'lucide-react'
import type { 
  Equipment, 
  Booking, 
  Member, 
  Project,
  EquipmentsQueryData,
  MembersQueryData,
  ProjectsQueryData,
  CreateEquipmentMutationData
} from '@/types/graphql-queries'

const GET_EQUIPMENTS = gql`
  query GetEquipments {
    equipments {
      id
      name
      description
      serialNumber
      status
      projectId
      Project {
        id
        title
      }
      memberId
      Member {
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
      Member {
        id
        name
      }
    }
  }
`

const GET_MEMBERS = gql`
  query GetMembers {
    Member {
      id
      name
    }
  }
`

const GET_PROJECTS = gql`
  query GetProjects {
    Project {
      id
      title
    }
  }
`

const CREATE_EQUIPMENT = gql`
  mutation CreateEquipment($input: CreateEquipmentInput!) {
    createEquipment(input: $input) {
      id
      name
      status
    }
  }
`

const statusColors: Record<string, string> = {
  AVAILABLE: 'bg-chart-2 text-white',
  IN_USE: 'bg-chart-4 text-white',
  MAINTENANCE: 'bg-chart-5 text-white',
}

const statusLabels: Record<string, string> = {
  AVAILABLE: 'Available',
  IN_USE: 'In Use',
  MAINTENANCE: 'Maintenance',
}

export default function EquipmentPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE'>('ALL')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Refs for auto-focus functionality
  const nameRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const serialNumberRef = useRef<HTMLInputElement>(null)
  const memberSelectRef = useRef<HTMLButtonElement>(null)
  const projectSelectRef = useRef<HTMLButtonElement>(null)
  const statusSelectRef = useRef<HTMLButtonElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    serialNumber: '',
    status: undefined as 'MAINTENANCE' | undefined,
    memberId: undefined as string | undefined,
    projectId: undefined as string | undefined,
  })

  const { data, loading, error, refetch } = useQuery<EquipmentsQueryData>(GET_EQUIPMENTS)
  const { data: membersData } = useQuery<MembersQueryData>(GET_MEMBERS)
  const { data: projectsData } = useQuery<ProjectsQueryData>(GET_PROJECTS)
  const [createEquipment, { loading: creating }] = useMutation<CreateEquipmentMutationData>(CREATE_EQUIPMENT, {
    onCompleted: () => {
      toast.success('Equipment created successfully')
      setIsDialogOpen(false)
      setFormData({ name: '', description: '', serialNumber: '', status: undefined, memberId: undefined, projectId: undefined })
      refetch()
    },
    onError: (error) => {
      toast.error(`Failed to create equipment: ${error.message}`)
    },
  })

  // Auto-focus effect when dialog opens
  useEffect(() => {
    if (isDialogOpen && nameRef.current) {
      // Small delay to ensure the dialog is rendered
      setTimeout(() => {
        nameRef.current?.focus()
      }, 100)
    }
  }, [isDialogOpen])

  // Auto-focus helper functions
  const focusNextField = (currentField: string, value: string) => {
    if (!value.trim()) return // Don't move focus if field is empty

    setTimeout(() => {
      switch (currentField) {
        case 'name':
          descriptionRef.current?.focus()
          break
        case 'description':
          serialNumberRef.current?.focus()
          break
        case 'serialNumber':
          // For select fields, we focus the trigger button
          memberSelectRef.current?.focus()
          break
      }
    }, 100)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData({ ...formData, name: value })
    if (value.length >= 3) { // Move to next field when name has at least 3 characters
      focusNextField('name', value)
    }
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setFormData({ ...formData, description: value })
    if (value.length >= 10) { // Move to next field when description has at least 10 characters
      focusNextField('description', value)
    }
  }

  const handleSerialNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData({ ...formData, serialNumber: value })
    if (value.length >= 5) { // Move to next field when serial number has at least 5 characters
      focusNextField('serialNumber', value)
    }
  }

  const members = membersData?.members || []
  const projects = projectsData?.projects || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate: Cannot have both member and project
    if (formData.memberId && formData.projectId) {
      toast.error('Equipment cannot be assigned to both a member and a project. Please select either a member OR a project.')
      return
    }

    createEquipment({
      variables: {
        input: {
          name: formData.name,
          description: formData.description || undefined,
          serialNumber: formData.serialNumber || undefined,
          status: formData.status || undefined,
          memberId: formData.memberId || undefined,
          projectId: formData.projectId || undefined,
        },
      },
    })
  }

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Page header - Static title, description, and fully functional "Add Equipment" button */}
        <div className="page-header flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Lab Equipment</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base truncate">
              Track and manage laboratory instruments and devices
            </p>
          </div>
          {/* "Add Equipment" dialog - Fully functional during loading */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shrink-0">
                <PlusIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Add Equipment</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Add New Equipment</DialogTitle>
                  <DialogDescription>
                    Add new equipment to the lab inventory.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Equipment Name</Label>
                    <Input
                      ref={nameRef}
                      id="name"
                      value={formData.name}
                      onChange={handleNameChange}
                      placeholder="PCR Machine"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      ref={descriptionRef}
                      id="description"
                      value={formData.description}
                      onChange={handleDescriptionChange}
                      placeholder="Thermal cycler for DNA amplification"
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="serialNumber">Serial Number (Optional)</Label>
                    <Input
                      ref={serialNumberRef}
                      id="serialNumber"
                      value={formData.serialNumber}
                      onChange={handleSerialNumberChange}
                      placeholder="SN-2024-001"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="memberId">Assign to Member (Optional)</Label>
                    <Select
                      value={formData.memberId || ''}
                      onValueChange={(value) => {
                        setFormData({
                          ...formData,
                          memberId: value === 'none' ? undefined : value || undefined,
                          projectId: value && value !== 'none' ? undefined : formData.projectId, // Clear project if member selected
                        })
                        // Auto-focus to project select after member selection
                        if (value && value !== 'none') {
                          setTimeout(() => projectSelectRef.current?.focus(), 100)
                        }
                      }}
                    >
                      <SelectTrigger ref={memberSelectRef} id="memberId">
                        <SelectValue placeholder="Select a member (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {members.map((member: Member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Assigning a member will automatically set status to &quot;In Use&quot;
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="projectId">Assign to Project (Optional)</Label>
                    <Select
                      value={formData.projectId || ''}
                      onValueChange={(value) => {
                        setFormData({
                          ...formData,
                          projectId: value === 'none' ? undefined : value || undefined,
                          memberId: value && value !== 'none' ? undefined : formData.memberId, // Clear member if project selected
                        })
                        // Auto-focus to status select after project selection
                        if (value && value !== 'none') {
                          setTimeout(() => statusSelectRef.current?.focus(), 100)
                        }
                      }}
                    >
                      <SelectTrigger ref={projectSelectRef} id="projectId">
                        <SelectValue placeholder="Select a project (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {projects.map((project: Project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Assigning a project will automatically set status to &quot;In Use&quot;
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Set to Maintenance (Optional)</Label>
                    <Select
                      value={formData.status || ''}
                      onValueChange={(value) => {
                        setFormData({
                          ...formData,
                          status: value === 'MAINTENANCE' ? 'MAINTENANCE' : undefined,
                          memberId: value === 'MAINTENANCE' ? undefined : formData.memberId, // Clear assignments if maintenance
                          projectId: value === 'MAINTENANCE' ? undefined : formData.projectId,
                        })
                      }}
                    >
                      <SelectTrigger ref={statusSelectRef} id="status">
                        <SelectValue placeholder="Normal operation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">Normal Operation</SelectItem>
                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Setting to maintenance will remove any member/project assignments
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating}>
                    {creating ? 'Adding...' : 'Add Equipment'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats cards - Static labels with dynamic counts */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Equipment</CardDescription>
              <CardTitle className="text-3xl">
                <Skeleton className="h-9 w-12" />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Available</CardDescription>
              <CardTitle className="text-3xl text-chart-2">
                <Skeleton className="h-9 w-12" />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>In Use</CardDescription>
              <CardTitle className="text-3xl text-chart-4">
                <Skeleton className="h-9 w-12" />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Maintenance</CardDescription>
              <CardTitle className="text-3xl text-chart-5">
                <Skeleton className="h-9 w-12" />
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Main content - Equipment grid with functional search and filter tabs */}
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Search input - Fully functional during loading */}
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search equipment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              {/* Status filter tabs - Fully interactive during loading */}
              <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'ALL' | 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE')} className="w-full">
                <TabsList className="w-full grid grid-cols-4 h-auto">
                  <TabsTrigger value="ALL" className="text-xs sm:text-sm px-2">All</TabsTrigger>
                  <TabsTrigger value="AVAILABLE" className="text-xs sm:text-sm px-2">Available</TabsTrigger>
                  <TabsTrigger value="IN_USE" className="text-xs sm:text-sm px-2">In Use</TabsTrigger>
                  <TabsTrigger value="MAINTENANCE" className="text-xs sm:text-sm px-2">Maint.</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            {/* Equipment grid - 2 columns max (md:grid-cols-2) to match actual UI */}
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <EquipmentCardSkeleton key={i} />
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
        <div className="text-destructive">Error loading equipment: {error.message}</div>
      </div>
    )
  }

  // Transform Hasura response to match expected format
  const equipments = (data?.equipments || []).map((equipment: any) => ({
    ...equipment,
    project: equipment.Project || null,
    member: equipment.Member || null,
  }))

  const filteredEquipment = equipments.filter((item: Equipment) => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || false

    // Calculate effective status for filtering
    const now = new Date()
    const hasPermanentAssignment = (item.member || item.project) && item.status !== 'MAINTENANCE'
    // Filter bookings for this equipment
    const equipmentBookings = data?.bookings?.filter((booking: Booking) => booking.equipmentId === item.id) || []
    const hasActiveBooking = equipmentBookings.some(booking => {
      const startTime = new Date(booking.startTime)
      const endTime = new Date(booking.endTime)
      return startTime <= now && now <= endTime
    })
    const effectiveStatus = hasPermanentAssignment || hasActiveBooking ? 'IN_USE' : item.status

    const matchesStatus = statusFilter === 'ALL' || effectiveStatus === statusFilter

    return matchesSearch && matchesStatus
  })

  const stats = equipments.reduce((acc, e: Equipment) => {
    // Calculate effective status for each equipment
    const now = new Date()
    const hasPermanentAssignment = (e.member || e.project) && e.status !== 'MAINTENANCE'
    // Filter bookings for this equipment
    const equipmentBookings = data?.bookings?.filter((booking: Booking) => booking.equipmentId === e.id) || []
    const hasActiveBooking = equipmentBookings.some(booking => {
      const startTime = new Date(booking.startTime)
      const endTime = new Date(booking.endTime)
      return startTime <= now && now <= endTime
    })
    const effectiveStatus = hasPermanentAssignment || hasActiveBooking ? 'IN_USE' : e.status

    acc.total++
    if (effectiveStatus === 'AVAILABLE') acc.available++
    else if (effectiveStatus === 'IN_USE') acc.inUse++
    else if (effectiveStatus === 'MAINTENANCE') acc.maintenance++

    return acc
  }, { total: 0, available: 0, inUse: 0, maintenance: 0 })

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Lab Equipment</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base truncate">
            Track and manage laboratory instruments and devices
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shrink-0">
              <PlusIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Add Equipment</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add New Equipment</DialogTitle>
                <DialogDescription>
                  Add new equipment to the lab inventory.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Equipment Name</Label>
                  <Input
                    ref={nameRef}
                    id="name"
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="PCR Machine"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    ref={descriptionRef}
                    id="description"
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    placeholder="Thermal cycler for DNA amplification"
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="serialNumber">Serial Number (Optional)</Label>
                  <Input
                    ref={serialNumberRef}
                    id="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleSerialNumberChange}
                    placeholder="SN-2024-001"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="memberId">Assign to Member (Optional)</Label>
                  <Select
                    value={formData.memberId || ''}
                    onValueChange={(value) => {
                      setFormData({
                        ...formData,
                        memberId: value === 'none' ? undefined : value || undefined,
                        projectId: value && value !== 'none' ? undefined : formData.projectId, // Clear project if member selected
                      })
                      // Auto-focus to project select after member selection
                      if (value && value !== 'none') {
                        setTimeout(() => projectSelectRef.current?.focus(), 100)
                      }
                    }}
                  >
                    <SelectTrigger ref={memberSelectRef} id="memberId">
                      <SelectValue placeholder="Select a member (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {members.map((member: Member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Assigning a member will automatically set status to &quot;In Use&quot;
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="projectId">Assign to Project (Optional)</Label>
                  <Select
                    value={formData.projectId || ''}
                    onValueChange={(value) => {
                      setFormData({
                        ...formData,
                        projectId: value === 'none' ? undefined : value || undefined,
                        memberId: value && value !== 'none' ? undefined : formData.memberId, // Clear member if project selected
                      })
                      // Auto-focus to status select after project selection
                      if (value && value !== 'none') {
                        setTimeout(() => statusSelectRef.current?.focus(), 100)
                      }
                    }}
                  >
                    <SelectTrigger ref={projectSelectRef} id="projectId">
                      <SelectValue placeholder="Select a project (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {projects.map((project: Project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Assigning a project will automatically set status to &quot;In Use&quot;
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Set to Maintenance (Optional)</Label>
                  <Select
                    value={formData.status || ''}
                    onValueChange={(value) => {
                      setFormData({
                        ...formData,
                        status: value === 'MAINTENANCE' ? 'MAINTENANCE' : undefined,
                        memberId: value === 'MAINTENANCE' ? undefined : formData.memberId, // Clear assignments if maintenance
                        projectId: value === 'MAINTENANCE' ? undefined : formData.projectId,
                      })
                    }}
                  >
                    <SelectTrigger ref={statusSelectRef} id="status">
                      <SelectValue placeholder="Normal operation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Normal Operation</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Setting to maintenance will remove any member/project assignments
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? 'Adding...' : 'Add Equipment'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card-primary">
          <CardHeader className="pb-3">
            <CardDescription>Total Equipment</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="stat-card-success">
          <CardHeader className="pb-3">
            <CardDescription>Available</CardDescription>
            <CardTitle className="text-3xl">{stats.available}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="stat-card-warning">
          <CardHeader className="pb-3">
            <CardDescription>In Use</CardDescription>
            <CardTitle className="text-3xl">{stats.inUse}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="stat-card-danger">
          <CardHeader className="pb-3">
            <CardDescription>Maintenance</CardDescription>
            <CardTitle className="text-3xl">{stats.maintenance}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'ALL' | 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE')} className="w-full">
              <TabsList className="w-full grid grid-cols-4 h-auto">
                <TabsTrigger value="ALL" className="text-xs sm:text-sm px-2">All</TabsTrigger>
                <TabsTrigger value="AVAILABLE" className="text-xs sm:text-sm px-2">Available</TabsTrigger>
                <TabsTrigger value="IN_USE" className="text-xs sm:text-sm px-2">In Use</TabsTrigger>
                <TabsTrigger value="MAINTENANCE" className="text-xs sm:text-sm px-2">Maint.</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredEquipment.map((item: Equipment) => {
              // Compute effective status:
              // 1. If permanently assigned (member/project), equipment is IN_USE (unless MAINTENANCE)
              // 2. If has active booking (current time between start/end), equipment is IN_USE
              // 3. Otherwise use the stored status
              const now = new Date()
              const hasPermanentAssignment = (item.member || item.project) && item.status !== 'MAINTENANCE'
              // Filter bookings for this equipment
              const equipmentBookings = data?.bookings?.filter((booking: Booking) => booking.equipmentId === item.id) || []
              const hasActiveBooking = equipmentBookings.some(booking => {
                const startTime = new Date(booking.startTime)
                const endTime = new Date(booking.endTime)
                return startTime <= now && now <= endTime
              })

              const effectiveStatus = hasPermanentAssignment || hasActiveBooking
                ? 'IN_USE'
                : item.status
              
              return (
              <Card 
                key={item.id}
                className="hover:bg-accent/50 transition-colors cursor-pointer h-full"
                onClick={() => router.push(`/equipment/${item.id}`)}
              >
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <CardTitle className="text-lg">{item.name}</CardTitle>
                            {item.description && (
                              <p className="text-sm text-muted-foreground">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={statusColors[effectiveStatus] || 'bg-muted text-muted-foreground'}>
                            {statusLabels[effectiveStatus] || effectiveStatus}
                          </Badge>
                          {item.member && (
                            <Badge 
                              variant="outline" 
                              className="text-xs bg-chart-4/10 border-chart-4 hover:bg-chart-4/20 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (item.member) {
                                  router.push(`/members/${item.member.id}`)
                                }
                              }}
                            >
                              In Use By: {item.member.name}
                            </Badge>
                          )}
                          {item.project && (
                            <Badge 
                              variant="outline" 
                              className="text-xs hover:bg-accent cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (item.project) {
                                  router.push(`/projects/${item.project.id}`)
                                }
                              }}
                            >
                              {item.project.title}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between pt-2">
                      {item.serialNumber ? (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-mono text-xs">Serial: {item.serialNumber}</span>
                      </div>
                      ) : (
                        <div />
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                      >
                        <Link href={`/equipment/${item.id}`}>
                          Book
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            
            {filteredEquipment.length === 0 && (
              <div className="col-span-2 py-12 text-center">
                <p className="text-muted-foreground">No equipment found matching your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
