'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useQuery, useMutation } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { GrantCardSkeleton } from '@/components/skeletons'
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
import { SearchIcon, PlusIcon, DollarSignIcon, CalendarIcon } from 'lucide-react'

// Type definitions for GraphQL query responses
interface Grant {
  id: string
  name: string
  budget: number
  startDate: string
  endDate: string
  totalSpent: number
  remainingBudget: number
  projects: Array<{
    id: string
    title: string
  }>
  createdAt: string
}

interface GrantsQueryData {
  grants: Grant[]
}

interface CreateGrantMutationData {
  createGrant: {
    id: string
    name: string
    budget: number
  }
}

const GET_GRANTS = gql`
  query GetGrants {
    grants {
      id
      name
      budget
      startDate
      endDate
      totalSpent
      remainingBudget
      projects {
        id
        title
      }
      createdAt
    }
  }
`

const CREATE_GRANT = gql`
  mutation CreateGrant($input: CreateGrantInput!) {
    createGrant(input: $input) {
      id
      name
      budget
    }
  }
`

type GrantStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED'

function getGrantStatus(grant: Grant): GrantStatus {
  const now = new Date()
  const startDate = new Date(grant.startDate)
  const endDate = new Date(grant.endDate)
  const budgetUsed = grant.budget - grant.remainingBudget
  const budgetPercentage = grant.budget > 0 ? (budgetUsed / grant.budget) * 100 : 0

  // Grant hasn't started yet
  if (startDate > now) return 'PENDING'
  
  // Grant has ended or budget is fully spent
  if (endDate < now || budgetPercentage >= 100) return 'COMPLETED'
  
  // Grant is currently active
  return 'ACTIVE'
}

function getGrantProgress(grant: Grant): number {
  const budgetUsed = grant.budget - grant.remainingBudget
  return grant.budget > 0 ? Math.min(100, Math.round((budgetUsed / grant.budget) * 100)) : 0
}

const statusColors: Record<GrantStatus, string> = {
  PENDING: 'bg-yellow-500 text-white',
  ACTIVE: 'bg-chart-2 text-white',
  COMPLETED: 'bg-chart-3 text-white',
}

type StatusFilter = 'ALL' | GrantStatus

export default function GrantsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Refs for auto-focus functionality
  const nameRef = useRef<HTMLInputElement>(null)
  const budgetRef = useRef<HTMLInputElement>(null)
  const startDateRef = useRef<HTMLInputElement>(null)
  const endDateRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    budget: '',
    startDate: '',
    endDate: '',
  })

  const { data, loading, error, refetch } = useQuery<GrantsQueryData>(GET_GRANTS)
  const [createGrant, { loading: creating }] = useMutation<CreateGrantMutationData>(CREATE_GRANT, {
    onCompleted: () => {
      toast.success('Grant created successfully')
      setIsDialogOpen(false)
      setFormData({ name: '', budget: '', startDate: '', endDate: '' })
      refetch()
    },
    onError: (error) => {
      toast.error(`Failed to create grant: ${error.message}`)
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
          budgetRef.current?.focus()
          break
        case 'budget':
          startDateRef.current?.focus()
          break
        case 'startDate':
          endDateRef.current?.focus()
          break
      }
    }, 100)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData({ ...formData, name: value })
    if (value.length >= 5) { // Move to next field when name has at least 5 characters
      focusNextField('name', value)
    }
  }

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData({ ...formData, budget: value })
    if (value.length >= 3) { // Move to next field when budget has at least 3 digits
      focusNextField('budget', value)
    }
  }

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData({ ...formData, startDate: value })
    if (value) { // Move to next field when date is selected
      focusNextField('startDate', value)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createGrant({
      variables: {
        input: {
          name: formData.name,
          budget: parseFloat(formData.budget),
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
        },
      },
    })
  }

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Page header - Static title, description, and fully functional "Add Grant" button */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Grants & Funding</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base truncate">
              Track research funding and grant applications
            </p>
          </div>
          {/* "Add Grant" dialog - Fully functional during loading */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shrink-0">
                <PlusIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Add Grant</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Add New Grant</DialogTitle>
                  <DialogDescription>
                    Add a new grant or funding application to track.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Grant Name</Label>
                    <Input
                      ref={nameRef}
                      id="name"
                      value={formData.name}
                      onChange={handleNameChange}
                      placeholder="NSF Research Grant 2024"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="budget">Budget ($)</Label>
                      <Input
                        ref={budgetRef}
                        id="budget"
                        type="number"
                        value={formData.budget}
                        onChange={handleBudgetChange}
                        placeholder="250000"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        ref={startDateRef}
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleStartDateChange}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        ref={endDateRef}
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating}>
                    {creating ? 'Adding...' : 'Add Grant'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats cards - Static labels with dynamic values */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Grants</CardDescription>
              <CardTitle className="text-3xl">
                <Skeleton className="h-9 w-12" />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Grants</CardDescription>
              <CardTitle className="text-3xl text-chart-2">
                <Skeleton className="h-9 w-12" />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Funding</CardDescription>
              <CardTitle className="text-2xl text-accent">
                <Skeleton className="h-7 w-24" />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending</CardDescription>
              <CardTitle className="text-3xl text-chart-4">
                <Skeleton className="h-9 w-12" />
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Main content - Grant list with functional search and filter tabs */}
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Search input - Fully functional during loading */}
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search grants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              {/* Status filter tabs - Fully interactive during loading */}
              <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)} className="w-full">
                <TabsList className="w-full grid grid-cols-4 h-auto">
                  <TabsTrigger value="PENDING" className="text-xs sm:text-sm px-2">Pending</TabsTrigger>
                  <TabsTrigger value="ACTIVE" className="text-xs sm:text-sm px-2">Active</TabsTrigger>
                  <TabsTrigger value="COMPLETED" className="text-xs sm:text-sm px-2">Completed</TabsTrigger>
                  <TabsTrigger value="ALL" className="text-xs sm:text-sm px-2">All</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {/* Grant card skeletons - Vertical list layout */}
              {/* Each card shows: title, status, budget, progress bar, date range, associated projects */}
              {[1, 2, 3].map((i) => (
                <GrantCardSkeleton key={i} />
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
        <div className="text-destructive">Error loading grants: {error.message}</div>
      </div>
    )
  }

  const grants = data?.grants || []

  const filteredGrants = grants.filter((grant: Grant) => {
    const matchesSearch = grant.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false
    const status = getGrantStatus(grant)
    const matchesStatus = statusFilter === 'ALL' || status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: grants.length,
    pending: grants.filter((g: Grant) => getGrantStatus(g) === 'PENDING').length,
    active: grants.filter((g: Grant) => getGrantStatus(g) === 'ACTIVE').length,
    completed: grants.filter((g: Grant) => getGrantStatus(g) === 'COMPLETED').length,
    totalFunding: grants.reduce((sum: number, g: Grant) => sum + (g.budget || 0), 0),
  }

  return (
      <div className="space-y-4 sm:space-y-6">
        <div className="page-header flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Grants & Funding</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base truncate">
              Track research funding and grant applications
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shrink-0">
              <PlusIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Add Grant</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add New Grant</DialogTitle>
                <DialogDescription>
                  Add a new grant or funding application to track.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Grant Name</Label>
                  <Input
                    ref={nameRef}
                    id="name"
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="NSF Research Grant 2024"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="budget">Budget ($)</Label>
                    <Input
                      ref={budgetRef}
                      id="budget"
                      type="number"
                      value={formData.budget}
                      onChange={handleBudgetChange}
                      placeholder="250000"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      ref={startDateRef}
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleStartDateChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      ref={endDateRef}
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? 'Adding...' : 'Add Grant'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card-primary">
          <CardHeader className="pb-3">
            <CardDescription>Total Grants</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="stat-card-success">
          <CardHeader className="pb-3">
            <CardDescription>Active Grants</CardDescription>
            <CardTitle className="text-3xl">{stats.active}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="stat-card-success">
          <CardHeader className="pb-3">
            <CardDescription>Active Funding</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(stats.totalFunding)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="stat-card-warning">
          <CardHeader className="pb-3">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search grants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)} className="w-full">
              <TabsList className="w-full grid grid-cols-4 h-auto">
                <TabsTrigger value="PENDING" className="text-xs sm:text-sm px-2">Pending</TabsTrigger>
                <TabsTrigger value="ACTIVE" className="text-xs sm:text-sm px-2">Active</TabsTrigger>
                <TabsTrigger value="COMPLETED" className="text-xs sm:text-sm px-2">Completed</TabsTrigger>
                <TabsTrigger value="ALL" className="text-xs sm:text-sm px-2">All</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {filteredGrants.map((grant: Grant) => {
              const status = getGrantStatus(grant)
              const progress = getGrantProgress(grant)
              
              return (
                <Link key={grant.id} href={`/grants/${grant.id}`}>
                  <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <CardTitle className="text-lg">{grant.name}</CardTitle>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={statusColors[status] || 'bg-muted text-muted-foreground'}>
                              {status}
                            </Badge>
                            <span className="text-sm font-semibold text-accent">
                              {formatCurrency(grant.budget)}
                            </span>
                            {grant.projects && grant.projects.length > 0 && (
                              <span className="text-sm text-muted-foreground">
                                {grant.projects.length} project{grant.projects.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Budget Utilization</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Spent: {formatCurrency(grant.totalSpent || 0)}</span>
                          <span>Remaining: {formatCurrency(grant.remainingBudget || 0)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          <span>{new Date(grant.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} - {new Date(grant.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
            
            {filteredGrants.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No grants found matching your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
