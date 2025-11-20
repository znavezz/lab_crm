'use client'

import { use } from 'react'
import Link from 'next/link'
import { useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeftIcon, CalendarIcon, UsersIcon, DollarSignIcon } from 'lucide-react'

const GET_PROJECT = gql`
  query GetProject($id: ID!) {
    project(id: $id) {
      id
      title
      description
      startDate
      endDate
      members {
        id
        name
        role
      }
      grants {
        id
        name
        budget
        remainingBudget
        expenses {
          id
          amount
          projectId
        }
      }
      totalInvestment
      createdAt
    }
  }
`

type ProjectMember = {
  id: string
  name: string
  role?: string | null
}

type ProjectExpense = {
  id: string
  amount: number
  projectId?: string | null
}

type ProjectGrant = {
  id: string
  name: string
  budget: number
  remainingBudget: number
  expenses?: ProjectExpense[] | null
}

type ProjectData = {
  id: string
  title: string
  description?: string | null
  startDate?: string | null
  endDate?: string | null
  members?: ProjectMember[] | null
  grants?: ProjectGrant[] | null
  totalInvestment?: number | null
  createdAt: string
}

type GetProjectQueryResult = {
  project?: ProjectData | null
}

const statusColors: Record<string, string> = {
  PLANNING: 'bg-muted text-muted-foreground',
  ACTIVE: 'bg-chart-2 text-white',
  COMPLETED: 'bg-chart-3 text-white',
}

function getProjectStatus(project: { startDate?: string | null; endDate?: string | null }): 'PLANNING' | 'ACTIVE' | 'COMPLETED' {
  const now = new Date()
  const startDate = project.startDate ? new Date(project.startDate) : null
  const endDate = project.endDate ? new Date(project.endDate) : null

  if (!startDate) return 'PLANNING'
  if (endDate && endDate < now) return 'COMPLETED'
  if (startDate > now) return 'PLANNING'
  return 'ACTIVE'
}

function getProjectProgress(project: { startDate?: string | null; endDate?: string | null }): number {
  const startDate = project.startDate ? new Date(project.startDate) : null
  const endDate = project.endDate ? new Date(project.endDate) : null
  const now = new Date()

  if (!startDate) return 0
  if (!endDate) return startDate <= now ? 50 : 0
  if (endDate < now) return 100
  if (startDate > now) return 0

  const total = endDate.getTime() - startDate.getTime()
  const elapsed = now.getTime() - startDate.getTime()
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data, loading, error } = useQuery<GetProjectQueryResult>(GET_PROJECT, {
    variables: { id },
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (error || !data?.project) {
    return (
      <div className="space-y-6">
        <Link href="/projects">
          <Button variant="ghost" className="gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {error ? `Error loading project: ${error.message}` : 'Project not found'}
          </p>
        </div>
      </div>
    )
  }

  const project = data.project
  const status = getProjectStatus(project)
  const progress = getProjectProgress(project)

  return (
    <div className="space-y-6">
      <Link href="/projects">
        <Button variant="ghost" className="gap-2">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Projects
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <CardTitle className="text-3xl">{project.title}</CardTitle>
              {project.description && (
                <CardDescription className="text-base">{project.description}</CardDescription>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={statusColors[status] || 'bg-muted text-muted-foreground'}>
                  {status}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {project.startDate && (
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Timeline</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(project.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}`}
                  </p>
                </div>
              </div>
            )}
            {project.members && project.members.length > 0 && (
              <div className="flex items-center gap-3">
                <UsersIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Team Size</p>
                  <p className="text-sm text-muted-foreground">{project.members.length} member{project.members.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
            )}
            {project.grants && project.grants.length > 0 && (
              <div className="flex items-center gap-3">
                <DollarSignIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Funding</p>
                  <p className="text-sm text-muted-foreground">
                    {project.grants.map((g: ProjectGrant) => g.name).join(', ')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {project.startDate && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Overall Progress</span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {project.members && project.members.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.members.map((member: ProjectMember) => (
                <Link key={member.id} href={`/members/${member.id}`}>
                  <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {member.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'M'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      {member.role && (
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        {project.grants && project.grants.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Funding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.grants.map((grant: ProjectGrant) => {
                // Calculate budget allocated to this project from this grant
                const allocatedBudget = grant.expenses
                  ?.filter((expense: ProjectExpense) => expense.projectId === project.id)
                  .reduce((sum: number, expense: ProjectExpense) => sum + (expense.amount || 0), 0) || 0
                
                return (
                  <Link key={grant.id} href={`/grants/${grant.id}`}>
                    <div className="p-3 rounded-lg border space-y-2 hover:bg-accent/50 transition-colors cursor-pointer">
                      <p className="font-medium">{grant.name}</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Allocated to this project:</span>
                          <span className="font-medium">${allocatedBudget.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Remaining grant budget:</span>
                          <span className="font-medium">${(grant.remainingBudget || 0).toLocaleString()}</span>
                        </div>
                        <div className="pt-1 border-t text-xs text-muted-foreground">
                          Total grant budget: ${(grant.budget || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
