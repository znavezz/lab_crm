'use client'

import { use } from 'react'
import Link from 'next/link'
import { useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { StatsCardSkeleton, ListItemSkeleton } from '@/components/skeletons'
import { ArrowLeftIcon, CalendarIcon, DollarSignIcon, FolderIcon } from 'lucide-react'

// Type definitions for GraphQL query response
interface GrantQueryData {
  grant: {
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
      description?: string | null
      startDate?: string | null
      endDate?: string | null
    }>
    createdAt: string
  } | null
}

const GET_GRANT = gql`
  query GetGrant($id: ID!) {
    grant(id: $id) {
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
        description
        startDate
        endDate
      }
      createdAt
    }
  }
`

export default function GrantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data, loading, error } = useQuery<GrantQueryData>(GET_GRANT, {
    variables: { id },
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Back button */}
        <Skeleton className="h-10 w-32" />
        
        {/* Grant header card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" /> {/* Title */}
            <Skeleton className="h-6 w-24 mt-2" /> {/* Status badge */}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </div>
            <Skeleton className="h-2 w-full" /> {/* Progress bar */}
          </CardContent>
        </Card>

        {/* Details grid */}
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

  if (error || !data?.grant) {
    return (
      <div className="space-y-6">
        <Link href="/grants">
          <Button variant="ghost" className="gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Grants
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {error ? `Error loading grant: ${error.message}` : 'Grant not found'}
          </p>
        </div>
      </div>
    )
  }

  const grant = data.grant
  // Calculate progress as percentage of budget spent
  const budgetSpent = grant.totalSpent || 0
  const totalBudget = grant.budget || 0
  const progress = totalBudget > 0 ? Math.min(100, Math.round((budgetSpent / totalBudget) * 100)) : 0

  return (
    <div className="space-y-6">
      <Link href="/grants">
        <Button variant="ghost" className="gap-2">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Grants
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <CardTitle className="text-3xl">{grant.name}</CardTitle>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-accent">{formatCurrency(grant.budget)}</div>
                <p className="text-sm text-muted-foreground mt-1">Total Budget</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <DollarSignIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Spent</p>
                <p className="text-sm text-muted-foreground">{formatCurrency(budgetSpent)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSignIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Remaining Budget</p>
                <p className="text-sm text-muted-foreground">{formatCurrency(grant.remainingBudget || 0)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(grant.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} - {new Date(grant.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Budget Utilization</span>
              <span className="text-muted-foreground">{progress}% spent</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Spent: {formatCurrency(budgetSpent)}</span>
              <span>Remaining: {formatCurrency(grant.remainingBudget || 0)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {grant.projects && grant.projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderIcon className="h-5 w-5" />
              Funded Projects ({grant.projects.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {grant.projects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <div className="p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                    <p className="font-medium">{project.title}</p>
                    {project.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                    )}
                    {project.startDate && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(project.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}`}
                      </p>
                    )}
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
