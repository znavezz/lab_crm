'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Carousel, CarouselCard } from '@/components/ui/carousel'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchIcon, PlusIcon, CalendarIcon, Check, ChevronsUpDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { 
  Project, 
  Grant, 
  Member,
  ProjectStatus,
  StatusFilter,
  ProjectsQueryData,
  GrantsQueryData,
  CreateProjectMutationData,
  ProjectWithStatus
} from '@/types/graphql-queries'

const GET_PROJECTS = gql`
  query GetProjects {
    Project {
      id
      title
      description
      startDate
      endDate
      ProjectMembers {
        Member {
          id
          name
        }
      }
      totalInvestment
      createdAt
    }
  }
`

const GET_GRANTS = gql`
  query GetGrants {
    Grant {
      id
      name
      budget
      totalSpent
      remainingBudget
    }
  }
`

const CREATE_PROJECT = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      title
    }
  }
`

// Helper function to calculate project status based on dates
function getProjectStatus(project: Project): ProjectStatus {
  const now = new Date()
  const startDate = project.startDate ? new Date(project.startDate) : null
  const endDate = project.endDate ? new Date(project.endDate) : null

  if (!startDate) return 'PLANNING'
  if (endDate && endDate < now) return 'COMPLETED'
  if (startDate > now) return 'PLANNING'
  return 'ACTIVE'
}

// Helper function to calculate progress based on dates
function getProjectProgress(project: Project): number {
  const startDate = project.startDate ? new Date(project.startDate) : null
  const endDate = project.endDate ? new Date(project.endDate) : null
  const now = new Date()

  if (!startDate) return 0
  if (!endDate) {
    // If no end date, show 50% if started
    return startDate <= now ? 50 : 0
  }
  if (endDate < now) return 100
  if (startDate > now) return 0

  const total = endDate.getTime() - startDate.getTime()
  const elapsed = now.getTime() - startDate.getTime()
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
}

const statusColors: Record<ProjectStatus, string> = {
  PLANNING: 'bg-muted text-muted-foreground',
  ACTIVE: 'bg-chart-2 text-white',
  COMPLETED: 'bg-chart-3 text-white',
}

const statusLabels: Record<ProjectStatus, string> = {
  PLANNING: 'Planning',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
}

export default function ProjectsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ACTIVE')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [grantPopoverOpen, setGrantPopoverOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    selectedGrants: [] as string[],
    status: 'ACTIVE',
    progress: '0',
  })

  const { data, loading, error, refetch } = useQuery<ProjectsQueryData>(GET_PROJECTS)
  const { data: grantsData } = useQuery<GrantsQueryData>(GET_GRANTS)
  const [createProject, { loading: creating }] = useMutation<CreateProjectMutationData>(CREATE_PROJECT, {
    onCompleted: (data) => {
      toast.success('Project created successfully')
      setIsDialogOpen(false)
      setFormData({ title: '', description: '', startDate: '', endDate: '', selectedGrants: [], status: 'ACTIVE', progress: '0' })
      refetch()
      router.push(`/projects/${data.createProject.id}`)
    },
    onError: (error) => {
      toast.error(`Failed to create project: ${error.message}`)
    },
  })

  // Transform Hasura response to match expected format
  const projects = (data?.Project || []).map((project: any) => ({
    ...project,
    members: project.ProjectMembers?.map((pm: any) => pm.Member) || [],
  }))
  const grants = grantsData?.grants || []

  // Calculate project status and progress for each project
  const projectsWithStatus: ProjectWithStatus[] = projects.map((project: Project) => ({
    ...project,
    status: getProjectStatus(project),
    progress: getProjectProgress(project),
  }))

  const filteredProjects = projectsWithStatus.filter((project: ProjectWithStatus) => {
    const matchesSearch = 
      project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: projects.length,
    active: projectsWithStatus.filter((p: ProjectWithStatus) => p.status === 'ACTIVE').length,
    planning: projectsWithStatus.filter((p: ProjectWithStatus) => p.status === 'PLANNING').length,
    completed: projectsWithStatus.filter((p: ProjectWithStatus) => p.status === 'COMPLETED').length,
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createProject({
        variables: {
          input: {
            title: formData.title,
            description: formData.description || undefined,
            startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
            endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
          },
        },
      })
      // Note: Grant associations would need to be done via a separate mutation
      // since CreateProjectInput doesn't include grantIds
    } catch (error) {
      // Error handled by onError callback
    }
  }

  const handleGrantToggle = (grantId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedGrants: prev.selectedGrants.includes(grantId)
        ? prev.selectedGrants.filter(id => id !== grantId)
        : [...prev.selectedGrants, grantId]
    }))
  }

  const handleRemoveGrant = (grantId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedGrants: prev.selectedGrants.filter(id => id !== grantId)
    }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Page header - Static title, description, and fully functional "New Project" button */}
        <div className="page-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Research Projects</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage ongoing research initiatives
            </p>
          </div>
          {/* "New Project" dialog - Fully functional during loading */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PlusIcon className="h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Add a new research project to the lab.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Project Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Cancer Genomics Analysis Pipeline"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of the research project..."
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="endDate">End Date (Optional)</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-3">
                    <Label>Funding Source (Optional)</Label>
                    <Popover open={grantPopoverOpen} onOpenChange={setGrantPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={grantPopoverOpen}
                          className="justify-between"
                        >
                          {formData.selectedGrants.length > 0
                            ? `${formData.selectedGrants.length} grant(s) selected`
                            : "Select grants..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[500px] p-0">
                        <Command>
                          <CommandInput placeholder="Search grants..." />
                          <CommandList>
                            <CommandEmpty>No grants found.</CommandEmpty>
                            <CommandGroup>
                              {grants.map((grant: Grant) => {
                                const isSelected = formData.selectedGrants.includes(grant.id)
                                return (
                                  <CommandItem
                                    key={grant.id}
                                    value={grant.name}
                                    onSelect={() => {
                                      handleGrantToggle(grant.id)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        isSelected ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {grant.name}
                                  </CommandItem>
                                )
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {formData.selectedGrants.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.selectedGrants.map((grantId) => {
                          const grant = grants.find((g: Grant) => g.id === grantId)
                          if (!grant) return null
                          return (
                            <Badge key={grantId} variant="secondary" className="gap-1">
                              {grant.name}
                              <button
                                type="button"
                                onClick={() => handleGrantToggle(grantId)}
                                className="ml-1 rounded-full hover:bg-secondary-foreground/20"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Project Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="PLANNING">Planning</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="progress">Initial Progress (%)</Label>
                    <Input
                      id="progress"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.progress}
                      onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating}>
                    {creating ? 'Creating...' : 'Create Project'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats cards - Static labels with dynamic counts */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Projects</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl">
                <Skeleton className="h-8 w-12" />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl text-chart-2">
                <Skeleton className="h-8 w-12" />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Planning</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl text-muted-foreground">
                <Skeleton className="h-8 w-12" />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl text-chart-3">
                <Skeleton className="h-8 w-12" />
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Main content - Project carousel with functional search and filter tabs */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Search input - Fully functional during loading */}
              <div className="relative flex-1 max-w-sm">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              {/* Status filter tabs - Fully interactive during loading */}
              <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                  <TabsTrigger value="ACTIVE">Active</TabsTrigger>
                  <TabsTrigger value="PLANNING">Planning</TabsTrigger>
                  <TabsTrigger value="COMPLETED">Done</TabsTrigger>
                  <TabsTrigger value="ALL">All</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="overflow-visible -mx-2 mt-2">
            {/* Project carousel skeleton - Horizontal scrolling cards (300px wide, 360px tall) */}
            <div className="flex gap-4 overflow-x-auto px-1 py-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-[300px] flex-shrink-0">
                  <div className="flex flex-col rounded-xl border-2 border-border h-[360px] overflow-hidden">
                    {/* Color-coded status indicator bar (green=Active, blue=Completed, gray=Planning) */}
                    <Skeleton className="h-1.5 w-full" />
                    
                    {/* Card content - Flexbox with space-between to push dates to bottom */}
                    <div className="flex flex-col flex-1 p-5 justify-between">
                      {/* Top section - All project details */}
                      <div className="space-y-2">
                        {/* Project title and status badge */}
                        <div className="space-y-2">
                          <Skeleton className="h-6 w-5/6" /> {/* Project title (line-clamp-2) */}
                          <Skeleton className="h-5 w-16" /> {/* Status badge (Active/Planning/Completed) */}
                        </div>
                        
                        {/* Progress bar with label and percentage */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-3 w-16" /> {/* "Progress" label */}
                            <Skeleton className="h-3 w-8" /> {/* Percentage "XX%" */}
                          </div>
                          <Skeleton className="h-2 w-full" /> {/* Progress bar */}
                        </div>
                        
                        {/* Project description - 2 lines with line-clamp */}
                        <div className="space-y-1.5">
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-4/5" />
                        </div>
                        
                        {/* Team member avatars - Overlapping circles with count */}
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                          </div>
                          <Skeleton className="h-3 w-20 ml-auto" /> {/* "X members" count */}
                        </div>
                        
                        {/* Associated grants - Up to 3 badges shown, then +N indicator */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex gap-1.5">
                            <Skeleton className="h-5 w-16" /> {/* Grant badge 1 */}
                            <Skeleton className="h-5 w-16" /> {/* Grant badge 2 */}
                          </div>
                          <Skeleton className="h-5 w-24" /> {/* Grant badge 3 */}
                          <Skeleton className="h-5 w-28" /> {/* "+N more" or Grant badge 4 */}
                        </div>
                      </div>
                      
                      {/* Bottom section - Start/End dates (fixed at bottom with border separator) */}
                      <div className="flex items-center gap-3 pt-2 border-t mt-auto">
                        <Skeleton className="h-4 w-48" /> {/* "DD/MM/YYYY → DD/MM/YYYY" date range */}
                      </div>
                    </div>
                  </div>
                </div>
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
        <p className="text-destructive">Error loading projects: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="page-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Research Projects</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage ongoing research initiatives
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <PlusIcon className="h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Add a new research project to the lab.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Cancer Genomics Analysis Pipeline"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the research project..."
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">End Date (Optional)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-3">
                  <Label>Funding Source (Optional)</Label>
                  <Popover open={grantPopoverOpen} onOpenChange={setGrantPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={grantPopoverOpen}
                        className="justify-between"
                      >
                        {formData.selectedGrants.length > 0
                          ? `${formData.selectedGrants.length} grant(s) selected`
                          : "Select grants..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[500px] p-0">
                      <Command>
                        <CommandInput placeholder="Search grants..." />
                        <CommandList>
                          <CommandEmpty>No grants found.</CommandEmpty>
                          <CommandGroup>
                            {grants.map((grant: Grant) => {
                              const isSelected = formData.selectedGrants.includes(grant.id)
                              return (
                                <CommandItem
                                  key={grant.id}
                                  value={grant.name}
                                  onSelect={() => {
                                    handleGrantToggle(grant.id)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      isSelected ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex-1">
                                    <div className="font-medium">{grant.name}</div>
                                    {grant.remainingBudget !== undefined && (
                                      <div className="text-xs text-muted-foreground">
                                        Remaining: ${grant.remainingBudget.toLocaleString()}
                                      </div>
                                    )}
                                  </div>
                                </CommandItem>
                              )
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {formData.selectedGrants.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.selectedGrants.map((grantId) => {
                        const grant = grants.find((g: Grant) => g.id === grantId)
                        if (!grant) return null
                        return (
                          <Badge key={grantId} variant="secondary" className="gap-1">
                            {grant.name}
                            <button
                              type="button"
                              onClick={() => handleRemoveGrant(grantId)}
                              className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Project'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="stat-card-primary">
          <CardHeader className="pb-3">
            <CardDescription>Total Projects</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="stat-card-success">
          <CardHeader className="pb-3">
            <CardDescription>Active</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl">{stats.active}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="stat-card-warning">
          <CardHeader className="pb-3">
            <CardDescription>Planning</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl">{stats.planning}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="stat-card-primary">
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl">{stats.completed}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-sm">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                <TabsTrigger value="ACTIVE">Active</TabsTrigger>
                <TabsTrigger value="PLANNING">Planning</TabsTrigger>
                <TabsTrigger value="COMPLETED">Done</TabsTrigger>
                <TabsTrigger value="ALL">All</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="overflow-visible -mx-2 mt-2">
          {filteredProjects.length > 0 ? (
            <Carousel gap="md">
              {filteredProjects.map((project: ProjectWithStatus) => {
                const statusColor = statusColors[project.status] || 'bg-muted text-muted-foreground'
                const progress = project.progress || 0
                const memberAvatars = project.members?.slice(0, 4) || []
                
                return (
                  <CarouselCard key={project.id} href={`/projects/${project.id}`}>
                    <div className="w-[300px] flex-shrink-0">
                      <div className="flex flex-col rounded-xl border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl bg-card group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 relative z-10 h-[360px] overflow-hidden">
                        {/* Status Indicator Bar - stays fixed on hover */}
                        <div className={cn(
                          "h-1.5 w-full",
                          project.status === 'ACTIVE' ? 'bg-chart-2' :
                          project.status === 'COMPLETED' ? 'bg-chart-3' :
                          'bg-muted'
                        )} />
                        
                        {/* Content - flex-1 to push dates to bottom, with hover effect */}
                        <div className="flex flex-col flex-1 p-5 justify-between group-hover:bg-accent/30 transition-colors duration-300">
                          {/* Top section - all content except dates */}
                          <div className="space-y-2">
                            {/* Title and Status */}
                            <div className="space-y-2">
                              <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                {project.title}
                              </h3>
                              <Badge className={cn(statusColor, 'text-xs')}>
                                {statusLabels[project.status] || project.status}
                              </Badge>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Progress</span>
                                <span className="font-medium">{progress}%</span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>
                            
                            {/* Description Preview - always show space */}
                            <p className="text-sm text-muted-foreground line-clamp-2 group-hover:line-clamp-none transition-all min-h-[40px]">
                              {project.description || '\u00A0'}
                            </p>
                            
                            {/* Member Avatars - always show space */}
                            <div className="flex items-center gap-2 min-h-[32px]">
                              {memberAvatars.length > 0 ? (
                                <>
                                  <div className="flex -space-x-2">
                                    {memberAvatars.map((member: Member) => {
                                      const initials = member.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'M'
                                      return (
                                        <Avatar
                                          key={member.id}
                                          className="h-8 w-8 border-2 border-background"
                                          title={member.name}
                                        >
                                          <AvatarFallback className="bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground text-xs transition-colors">
                                            {initials}
                                          </AvatarFallback>
                                        </Avatar>
                                      )
                                    })}
                                  </div>
                                  {project.members && project.members.length > 4 && (
                                    <span className="text-xs text-muted-foreground ml-1">
                                      +{project.members.length - 4}
                                    </span>
                                  )}
                                  <span className="text-xs text-muted-foreground ml-auto">
                                    {project.members?.length || 0} member{(project.members?.length || 0) !== 1 ? 's' : ''}
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs text-muted-foreground">No members assigned</span>
                              )}
                            </div>
                            
                            {/* Grants - show up to 3 grants, then +N if more */}
                            <div className="flex flex-wrap gap-1.5 min-h-[20px]">
                              {project.grants && project.grants.length > 0 ? (
                                <>
                                  {project.grants.slice(0, 3).map((grant: Grant) => (
                                    <Badge key={grant.id} variant="outline" className="text-xs">
                                      {grant.name}
                                    </Badge>
                                  ))}
                                  {project.grants.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{project.grants.length - 3}
                                    </Badge>
                                  )}
                                </>
                              ) : (
                                <span className="text-xs text-muted-foreground">No funding sources</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Bottom section - Dates fixed at bottom */}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t mt-auto">
                            {project.startDate ? (
                              <div className="flex items-center gap-1.5">
                                <CalendarIcon className="h-3.5 w-3.5" />
                                <span>{new Date(project.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                              </div>
                            ) : (
                              <span>No start date</span>
                            )}
                            {project.endDate && (
                              <div className="flex items-center gap-1.5">
                                <span>→</span>
                                <span>{new Date(project.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselCard>
                )
              })}
            </Carousel>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No projects found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
