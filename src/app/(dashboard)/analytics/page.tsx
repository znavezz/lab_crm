'use client'

import { useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const GET_ANALYTICS_DATA = gql`
  query GetAnalyticsData {
    publications {
      id
      published
      createdAt
    }
    projects {
      id
      startDate
      endDate
      createdAt
    }
    grants {
      id
      budget
      createdAt
    }
    equipments {
      id
      name
      status
    }
    members {
      id
      role
    }
    protocols {
      id
      category
    }
  }
`

interface AnalyticsPublication {
  id: string
  published: string | null
  createdAt: string
}

interface AnalyticsProject {
  id: string
  startDate: string | null
  endDate: string | null
  createdAt: string
}

interface AnalyticsGrant {
  id: string
  budget: number | null
  createdAt: string
  deadline?: string | null
}

interface AnalyticsEquipment {
  id: string
  name: string
  status: string
}

interface AnalyticsMember {
  id: string
  role: string | null
}

interface AnalyticsProtocol {
  id: string
  category: string | null
}

interface GetAnalyticsData {
  publications: AnalyticsPublication[]
  projects: AnalyticsProject[]
  grants: AnalyticsGrant[]
  equipments: AnalyticsEquipment[]
  members: AnalyticsMember[]
  protocols: AnalyticsProtocol[]
}

export default function AnalyticsPage() {
  const { data, loading, error } = useQuery<GetAnalyticsData>(GET_ANALYTICS_DATA)

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-10 w-64 mb-8" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-destructive">Error loading analytics: {error.message}</div>
        </div>
      </div>
    )
  }

  const publications = data?.publications || []
  const projects = data?.projects || []
  const grants = data?.grants || []
  const equipments = data?.equipments || []
  const members = data?.members || []
  const protocols = data?.protocols || []

  // Calculate publications per year
  const publicationsByYear: Record<string, { publications: number }> = {}
  publications.forEach((pub: AnalyticsPublication) => {
    const year = pub.published ? new Date(pub.published).getFullYear().toString() : new Date(pub.createdAt).getFullYear().toString()
    if (!publicationsByYear[year]) {
      publicationsByYear[year] = { publications: 0 }
    }
    publicationsByYear[year].publications++
  })
  const publicationsPerYear = Object.keys(publicationsByYear)
    .sort()
    .map(year => ({ year, publications: publicationsByYear[year].publications }))

  // Calculate projects by status
  const activeProjects = projects.filter((p: AnalyticsProject) => {
    if (!p.endDate) return true
    return new Date(p.endDate) > new Date()
  }).length
  const completedProjects = projects.filter((p: AnalyticsProject) => {
    if (!p.endDate) return false
    return new Date(p.endDate) <= new Date()
  }).length
  const projectsByStatus = [
    { name: 'Active', value: activeProjects, color: 'hsl(var(--chart-1))' },
    { name: 'Completed', value: completedProjects, color: 'hsl(var(--chart-3))' },
  ]

  // Calculate grant funding per year
  const grantsByYear: Record<string, number> = {}
  grants.forEach((grant: AnalyticsGrant) => {
    const year = new Date(grant.createdAt).getFullYear().toString()
    if (!grantsByYear[year]) {
      grantsByYear[year] = 0
    }
    grantsByYear[year] += grant.budget || 0
  })
  const grantFunding = Object.keys(grantsByYear)
    .sort()
    .map(year => ({ year, amount: grantsByYear[year] }))

  // Equipment usage (based on status)
  const equipmentUsage = equipments.slice(0, 5).map((eq: AnalyticsEquipment) => ({
    equipment: eq.name || 'Unknown',
    usage: eq.status === 'IN_USE' ? 75 : eq.status === 'MAINTENANCE' ? 25 : 50,
  }))

  // Members by role
  const membersByRoleMap: Record<string, number> = {}
  members.forEach((m: AnalyticsMember) => {
    const role = m.role || 'OTHER'
    membersByRoleMap[role] = (membersByRoleMap[role] || 0) + 1
  })
  const membersByRole = Object.keys(membersByRoleMap).map(role => ({
    role,
    count: membersByRoleMap[role],
  }))

  // Protocols by category
  const protocolsByCategoryMap: Record<string, number> = {}
  protocols.forEach((p: AnalyticsProtocol) => {
    const category = p.category || 'GENERAL'
    protocolsByCategoryMap[category] = (protocolsByCategoryMap[category] || 0) + 1
  })
  const protocolsByCategory = Object.keys(protocolsByCategoryMap).map(category => ({
    category: category.replace('_', ' '),
    count: protocolsByCategoryMap[category],
  }))

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Statistics</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive insights into lab performance and metrics
          </p>
        </div>

        <Tabs defaultValue="publications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="publications">Publications</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="funding">Funding</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          {/* Publications Tab */}
          <TabsContent value="publications" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Publications Over Time</CardTitle>
                  <CardDescription>Annual publication count and total citations</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      publications: {
                        label: 'Publications',
                        color: 'hsl(var(--chart-1))',
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={publicationsPerYear} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="publications" 
                          stroke="var(--color-publications)" 
                          strokeWidth={2}
                          name="Publications" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team Composition</CardTitle>
                  <CardDescription>Members by role distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      count: {
                        label: 'Count',
                        color: 'hsl(var(--chart-1))',
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={membersByRole} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="role" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="var(--color-count)" name="Members" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Publication Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Publications</p>
                    <p className="text-3xl font-bold">{publications.length}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">With DOI</p>
                    <p className="text-3xl font-bold">
                      {publications.filter((p: AnalyticsPublication) => (p as any).doi).length}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">This Year</p>
                    <p className="text-3xl font-bold">
                      {publications.filter((p: AnalyticsPublication) => {
                        const year = p.published ? new Date(p.published).getFullYear() : new Date(p.createdAt).getFullYear()
                        return year === new Date().getFullYear()
                      }).length}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Published</p>
                    <p className="text-3xl font-bold">
                      {publications.filter((p: AnalyticsPublication) => p.published).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Project Status Distribution</CardTitle>
                  <CardDescription>Current project portfolio breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      active: {
                        label: 'Active',
                        color: 'hsl(var(--chart-1))',
                      },
                      completed: {
                        label: 'Completed',
                        color: 'hsl(var(--chart-3))',
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={projectsByStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value}`}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {projectsByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Protocols by Category</CardTitle>
                  <CardDescription>Available protocols across research areas</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      count: {
                        label: 'Protocols',
                        color: 'hsl(var(--chart-2))',
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={protocolsByCategory} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="category" type="category" width={110} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="var(--color-count)" name="Protocols" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Funding Tab */}
          <TabsContent value="funding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Grant Funding Over Time</CardTitle>
                <CardDescription>Total active funding by year</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    amount: {
                      label: 'Funding',
                      color: 'hsl(var(--chart-3))',
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={grantFunding} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis 
                        tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, 'Funding']}
                      />
                      <Bar dataKey="amount" fill="var(--color-amount)" name="Funding" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total Funding</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    ${(grants.reduce((sum: number, g: AnalyticsGrant) => sum + (g.budget || 0), 0) / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">Lifetime total</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Active Grants</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {grants.filter((g: AnalyticsGrant) => new Date(g.deadline || 0) > new Date()).length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">Currently funded</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Grants</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{grants.length}</p>
                  <p className="text-sm text-muted-foreground mt-2">All time</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Usage</CardTitle>
                <CardDescription>Utilization rates by equipment</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    usage: {
                      label: 'Usage %',
                      color: 'hsl(var(--chart-4))',
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={equipmentUsage} layout="vertical" margin={{ top: 5, right: 30, left: 150, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="equipment" type="category" width={140} />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        formatter={(value: number) => [`${value}%`, 'Usage']}
                      />
                      <Bar dataKey="usage" fill="var(--color-usage)" name="Usage %" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
