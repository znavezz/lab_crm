'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { SearchIcon, PlusIcon, CalendarIcon, UsersIcon, Check, ChevronsUpDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Project } from '@/generated/graphql/resolvers-types'

// Type definitions for GraphQL query responses
interface ProjectQueryData {
  projects: Array<{
    id: string
    title: string
    description?: string | null
    startDate?: string | null
    endDate?: string | null
    members: Array<{
      id: string
      name: string
    }>
    grants: Array<{
      id: string
      name: string
    }>
    totalInvestment: number
    createdAt: string
  }>
}

interface GrantsQueryData {
  grants: Array<{
    id: string
    name: string
    budget: number
    totalSpent: number
    remainingBudget: number
  }>
}

interface CreateProjectMutationData {
  createProject: {
    id: string
    title: string
  }
}

const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id
      title
      description
      startDate
      endDate
      members {
        id
        name
      }
      grants {
        id
        name
      }
      totalInvestment
      createdAt
    }
  }
`

const GET_GRANTS = gql`
  query GetGrants {
    grants {
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
function getProjectStatus(project: { startDate?: string | null; endDate?: string | null }): 'PLANNING' | 'ACTIVE' | 'COMPLETED' {
  const now = new Date()
  const startDate = project.startDate ? new Date(project.startDate) : null
  const endDate = project.endDate ? new Date(project.endDate) : null

  if (!startDate) return 'PLANNING'
  if (endDate && endDate < now) return 'COMPLETED'
  if (startDate > now) return 'PLANNING'
  return 'ACTIVE'
}

// Helper function to calculate progress based on dates
function getProjectProgress(project: { startDate?: string | null; endDate?: string | null }): number {
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

const statusColors: Record<string, string> = {
  PLANNING: 'bg-muted text-muted-foreground',
  ACTIVE: 'bg-chart-2 text-white',
  COMPLETED: 'bg-chart-3 text-white',
}

const statusLabels: Record<string, string> = {
  PLANNING: 'Planning',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
}

export default function ProjectsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PLANNING' | 'COMPLETED'>('ACTIVE')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [grantPopoverOpen, setGrantPopoverOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    selectedGrants: [] as string[],
  })

  const { data, loading, error, refetch } = useQuery<ProjectQueryData>(GET_PROJECTS)
  const { data: grantsData } = useQuery<GrantsQueryData>(GET_GRANTS)
  const [createProject, { loading: creating }] = useMutation<CreateProjectMutationData>(CREATE_PROJECT, {
    onCompleted: (data) => {
      toast.success('Project created successfully')
      setIsDialogOpen(false)
      setFormData({ title: '', description: '', startDate: '', endDate: '', selectedGrants: [] })
      refetch()
      router.push(`/projects/${data.createProject.id}`)
    },
    onError: (error) => {
      toast.error(`Failed to create project: ${error.message}`)
    },
  })

  const projects = data?.projects || []
  const grants = grantsData?.grants || []

  // Calculate project status and progress for each project
  const projectsWithStatus = projects.map((project: any) => ({
    ...project,
    status: getProjectStatus(project),
    progress: getProjectProgress(project),
  }))

  const filteredProjects = projectsWithStatus.filter((project: any) => {
    const matchesSearch = 
      project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: projects.length,
    active: projectsWithStatus.filter((p: any) => p.status === 'ACTIVE').length,
    planning: projectsWithStatus.filter((p: any) => p.status === 'PLANNING').length,
    completed: projectsWithStatus.filter((p: any) => p.status === 'COMPLETED').length,
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
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                            {grants.map((grant: any) => {
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
                        const grant = grants.find((g: any) => g.id === grantId)
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
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Projects</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl text-chart-2">{stats.active}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Planning</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl text-muted-foreground">{stats.planning}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl text-chart-3">{stats.completed}</CardTitle>
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
            
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                <TabsTrigger value="ACTIVE">Active</TabsTrigger>
                <TabsTrigger value="PLANNING">Planning</TabsTrigger>
                <TabsTrigger value="COMPLETED">Done</TabsTrigger>
                <TabsTrigger value="ALL">All</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="overflow-visible">
          {filteredProjects.length > 0 ? (
            <Carousel gap="md">
              {filteredProjects.map((project: any) => {
                const statusColor = statusColors[project.status] || 'bg-muted text-muted-foreground'
                const progress = project.progress || 0
                const memberAvatars = project.members?.slice(0, 4) || []
                
                return (
                  <CarouselCard key={project.id} href={`/projects/${project.id}`}>
                    <div className="w-[300px] flex-shrink-0">
                      <div className="flex flex-col rounded-xl border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl bg-card hover:bg-accent/30 group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 relative z-10">
                        {/* Status Indicator Bar */}
                        <div className={cn(
                          "h-1.5 w-full rounded-t-xl",
                          project.status === 'ACTIVE' ? 'bg-chart-2' :
                          project.status === 'COMPLETED' ? 'bg-chart-3' :
                          'bg-muted'
                        )} />
                        
                        {/* Content */}
                        <div className="flex flex-col flex-1 p-5 space-y-4">
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
                          
                          {/* Description Preview */}
                          {project.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 group-hover:line-clamp-none transition-all">
                              {project.description}
                            </p>
                          )}
                          
                          {/* Member Avatars */}
                          {memberAvatars.length > 0 && (
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2">
                                {memberAvatars.map((member: any, idx: number) => {
                                  const initials = member.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'M'
                                  return (
                                    <Avatar 
                                      key={member.id} 
                                      className="h-8 w-8 border-2 border-background"
                                      title={member.name}
                                    >
                                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
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
                            </div>
                          )}
                          
                          {/* Grants */}
                          {project.grants && project.grants.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {project.grants.slice(0, 2).map((grant: any) => (
                                <Badge key={grant.id} variant="outline" className="text-xs">
                                  {grant.name}
                                </Badge>
                              ))}
                              {project.grants.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{project.grants.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          {/* Dates */}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t">
                            {project.startDate && (
                              <div className="flex items-center gap-1.5">
                                <CalendarIcon className="h-3.5 w-3.5" />
                                <span>{new Date(project.startDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            {project.endDate && (
                              <div className="flex items-center gap-1.5">
                                <span>→</span>
                                <span>{new Date(project.endDate).toLocaleDateString()}</span>
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
