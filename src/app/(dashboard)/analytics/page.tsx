'use client'

import { useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const GET_ANALYTICS_DATA = gql`
  query GetAnalyticsData {
    publications {
      id
      published
      createdAt
      members {
        id
        name
      }
      projects {
        id
        title
      }
    }
    projects {
      id
      title
      startDate
      endDate
      createdAt
      members {
        id
        name
      }
    }
    grants {
      id
      name
      budget
      deadline
      createdAt
      projects {
        id
        title
        members {
          id
          name
        }
      }
    }
    equipments {
      id
      name
      status
      member {
        id
        name
      }
      project {
        id
        title
      }
    }
    members {
      id
      name
      role
      status
    }
    protocols {
      id
      category
    }
  }
`

interface PublicationMember {
  id: string
  name: string
}

interface PublicationProject {
  id: string
  title: string
}

interface AnalyticsPublication {
  id: string
  published: string | null
  createdAt: string
  members: PublicationMember[]
  projects: PublicationProject[]
}

interface ProjectMember {
  id: string
  name: string
}

interface AnalyticsProject {
  id: string
  title: string
  startDate: string | null
  endDate: string | null
  createdAt: string
  members: ProjectMember[]
}

interface GrantProject {
  id: string
  title: string
  members: Array<{ id: string; name: string }>
}

interface AnalyticsGrant {
  id: string
  name: string
  budget: number | null
  deadline: string | null
  createdAt: string
  projects: GrantProject[]
}

interface EquipmentMember {
  id: string
  name: string
}

interface EquipmentProject {
  id: string
  title: string
}

interface AnalyticsEquipment {
  id: string
  name: string
  status: string
  member: EquipmentMember | null
  project: EquipmentProject | null
}

interface AnalyticsMember {
  id: string
  name: string
  role: string | null
  status: string | null
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

  // Publications per member (sorted by count)
  const publicationsPerMemberMap: Record<string, { name: string; count: number }> = {}
  publications.forEach((pub: AnalyticsPublication) => {
    pub.members.forEach((member) => {
      if (!publicationsPerMemberMap[member.id]) {
        publicationsPerMemberMap[member.id] = { name: member.name, count: 0 }
      }
      publicationsPerMemberMap[member.id].count++
    })
  })
  const publicationsPerMember = Object.values(publicationsPerMemberMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // Top 10

  // Publications per project (sorted by count)
  const publicationsPerProjectMap: Record<string, { title: string; count: number }> = {}
  publications.forEach((pub: AnalyticsPublication) => {
    pub.projects.forEach((project) => {
      if (!publicationsPerProjectMap[project.id]) {
        publicationsPerProjectMap[project.id] = { title: project.title, count: 0 }
      }
      publicationsPerProjectMap[project.id].count++
    })
  })
  const publicationsPerProject = Object.values(publicationsPerProjectMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // Top 10

  // Projects per member (sorted by count)
  const projectsPerMemberMap: Record<string, { name: string; count: number }> = {}
  projects.forEach((project: AnalyticsProject) => {
    project.members.forEach((member) => {
      if (!projectsPerMemberMap[member.id]) {
        projectsPerMemberMap[member.id] = { name: member.name, count: 0 }
      }
      projectsPerMemberMap[member.id].count++
    })
  })
  const projectsPerMember = Object.values(projectsPerMemberMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // Top 10

  // Grants with project counts and funding breakdown
  const grantsWithProjects = grants.map((grant: AnalyticsGrant) => ({
    id: grant.id,
    name: grant.name,
    budget: grant.budget || 0,
    projectCount: grant.projects.length,
    projects: grant.projects.map((project) => ({
      id: project.id,
      title: project.title,
      // Each project gets equal share of the grant budget
      funding: grant.projects.length > 0 ? (grant.budget || 0) / grant.projects.length : 0,
    })),
  })).sort((a, b) => b.budget - a.budget)

  // Grants by number of projects funded (sorted)
  const grantsByProjectCount = grantsWithProjects
    .map((grant) => ({
      name: grant.name,
      projectCount: grant.projectCount,
      budget: grant.budget,
    }))
    .sort((a, b) => b.projectCount - a.projectCount)
    .slice(0, 10) // Top 10

  // Projects with total funding from all grants
  const projectsFundingMap: Record<string, { title: string; grantCount: number; totalFunding: number; grants: string[] }> = {}
  grants.forEach((grant: AnalyticsGrant) => {
    const fundingPerProject = grant.projects.length > 0 ? (grant.budget || 0) / grant.projects.length : 0
    grant.projects.forEach((project) => {
      if (!projectsFundingMap[project.id]) {
        projectsFundingMap[project.id] = {
          title: project.title,
          grantCount: 0,
          totalFunding: 0,
          grants: [],
        }
      }
      projectsFundingMap[project.id].grantCount++
      projectsFundingMap[project.id].totalFunding += fundingPerProject
      projectsFundingMap[project.id].grants.push(grant.name)
    })
  })
  const projectsByFunding = Object.values(projectsFundingMap)
    .sort((a, b) => b.totalFunding - a.totalFunding)
    .slice(0, 10) // Top 10

  // Equipment per member (sorted by count)
  const equipmentPerMemberMap: Record<string, { name: string; count: number }> = {}
  equipments.forEach((eq: AnalyticsEquipment) => {
    if (eq.member) {
      if (!equipmentPerMemberMap[eq.member.id]) {
        equipmentPerMemberMap[eq.member.id] = { name: eq.member.name, count: 0 }
      }
      equipmentPerMemberMap[eq.member.id].count++
    }
  })
  const equipmentPerMember = Object.values(equipmentPerMemberMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // Top 10

  // Equipment per project (sorted by count)
  const equipmentPerProjectMap: Record<string, { title: string; count: number }> = {}
  equipments.forEach((eq: AnalyticsEquipment) => {
    if (eq.project) {
      if (!equipmentPerProjectMap[eq.project.id]) {
        equipmentPerProjectMap[eq.project.id] = { title: eq.project.title, count: 0 }
      }
      equipmentPerProjectMap[eq.project.id].count++
    }
  })
  const equipmentPerProject = Object.values(equipmentPerProjectMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // Top 10

  // Equipment status breakdown
  const equipmentStatusMap: Record<string, number> = {}
  equipments.forEach((eq: AnalyticsEquipment) => {
    const status = eq.status || 'UNKNOWN'
    equipmentStatusMap[status] = (equipmentStatusMap[status] || 0) + 1
  })
  const equipmentStatus = Object.keys(equipmentStatusMap).map(status => ({
    name: status.replace('_', ' '),
    value: equipmentStatusMap[status],
    color: status === 'AVAILABLE' ? 'hsl(var(--chart-2))' : 
           status === 'IN_USE' ? 'hsl(var(--chart-4))' : 
           'hsl(var(--chart-5))'
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
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="grants">Grants</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
          </TabsList>

          {/* Publications Tab */}
          <TabsContent value="publications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publications Over Time</CardTitle>
                <CardDescription>Annual publication count and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    publications: {
                      label: 'Publications',
                      color: 'hsl(var(--chart-1))',
                    },
                  }}
                  className="h-[400px]"
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

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Contributors</CardTitle>
                  <CardDescription>Members by publication count</CardDescription>
                </CardHeader>
                <CardContent>
                  {publicationsPerMember.length > 0 ? (
                    <ChartContainer
                      config={{
                        count: {
                          label: 'Publications',
                          color: 'hsl(var(--chart-1))',
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={publicationsPerMember} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={110} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" fill="var(--color-count)" name="Publications" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No publication data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Publications by Project</CardTitle>
                  <CardDescription>Top projects by publication count</CardDescription>
                </CardHeader>
                <CardContent>
                  {publicationsPerProject.length > 0 ? (
                    <ChartContainer
                      config={{
                        count: {
                          label: 'Publications',
                          color: 'hsl(var(--chart-2))',
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={publicationsPerProject} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="title" type="category" width={110} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" fill="var(--color-count)" name="Publications" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No publication data available
                    </div>
                  )}
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
                  <CardTitle>Top Project Contributors</CardTitle>
                  <CardDescription>Members by project count</CardDescription>
                </CardHeader>
                <CardContent>
                  {projectsPerMember.length > 0 ? (
                    <ChartContainer
                      config={{
                        count: {
                          label: 'Projects',
                          color: 'hsl(var(--chart-2))',
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={projectsPerMember} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={110} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" fill="var(--color-count)" name="Projects" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No project data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
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
                  className="h-[400px]"
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

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{members.length}</p>
                  <p className="text-sm text-muted-foreground mt-2">All lab members</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Active Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-chart-2">
                    {members.filter((m: AnalyticsMember) => m.status === 'ACTIVE').length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">Currently active</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Roles</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{membersByRole.length}</p>
                  <p className="text-sm text-muted-foreground mt-2">Unique roles</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Grants Tab */}
          <TabsContent value="grants" className="space-y-6">
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

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Grants by Project Count</CardTitle>
                  <CardDescription>Grants funding multiple projects</CardDescription>
                </CardHeader>
                <CardContent>
                  {grantsByProjectCount.length > 0 ? (
                    <ChartContainer
                      config={{
                        projectCount: {
                          label: 'Projects',
                          color: 'hsl(var(--chart-1))',
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={grantsByProjectCount} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={110} />
                          <ChartTooltip 
                            content={<ChartTooltipContent />}
                            formatter={(value: number, name: string) => {
                              if (name === 'projectCount') {
                                return [value, 'Projects']
                              }
                              return [`$${(value / 1000000).toFixed(2)}M`, 'Budget']
                            }}
                          />
                          <Bar dataKey="projectCount" fill="var(--color-projectCount)" name="Projects" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No grant data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Funded Projects</CardTitle>
                  <CardDescription>Projects by total grant funding</CardDescription>
                </CardHeader>
                <CardContent>
                  {projectsByFunding.length > 0 ? (
                    <ChartContainer
                      config={{
                        totalFunding: {
                          label: 'Funding',
                          color: 'hsl(var(--chart-2))',
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={projectsByFunding} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            type="number" 
                            tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                          />
                          <YAxis dataKey="title" type="category" width={110} />
                          <ChartTooltip 
                            content={<ChartTooltipContent />}
                            formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, 'Funding']}
                          />
                          <Bar dataKey="totalFunding" fill="var(--color-totalFunding)" name="Funding" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No grant data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Grant-Project Funding Breakdown</CardTitle>
                <CardDescription>Detailed view of grants and their project funding</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {grantsWithProjects.slice(0, 10).map((grant) => (
                    <div key={grant.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">{grant.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Total Budget: <span className="font-medium">${(grant.budget / 1000000).toFixed(2)}M</span>
                          </p>
                        </div>
                        <Badge variant="outline" className="ml-4">
                          {grant.projectCount} {grant.projectCount === 1 ? 'Project' : 'Projects'}
                        </Badge>
                      </div>
                      {grant.projects.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Funded Projects:</p>
                          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {grant.projects.map((project) => (
                              <div key={project.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                                <span className="truncate flex-1">{project.title}</span>
                                <span className="ml-2 font-medium text-primary">
                                  ${(project.funding / 1000000).toFixed(2)}M
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {grantsWithProjects.length === 0 && (
                    <div className="py-12 text-center text-muted-foreground">
                      No grant data available
                    </div>
                  )}
                </div>
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

          {/* Equipment Tab */}
          <TabsContent value="equipment" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Equipment Status</CardTitle>
                  <CardDescription>Distribution by status</CardDescription>
                </CardHeader>
                <CardContent>
                  {equipmentStatus.length > 0 ? (
                    <ChartContainer
                      config={{
                        available: {
                          label: 'Available',
                          color: 'hsl(var(--chart-2))',
                        },
                        inUse: {
                          label: 'In Use',
                          color: 'hsl(var(--chart-4))',
                        },
                        maintenance: {
                          label: 'Maintenance',
                          color: 'hsl(var(--chart-5))',
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={equipmentStatus}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                            outerRadius={80}
                            dataKey="value"
                          >
                            {equipmentStatus.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No equipment data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Equipment by Member</CardTitle>
                  <CardDescription>Top members by equipment count</CardDescription>
                </CardHeader>
                <CardContent>
                  {equipmentPerMember.length > 0 ? (
                    <ChartContainer
                      config={{
                        count: {
                          label: 'Equipment',
                          color: 'hsl(var(--chart-1))',
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={equipmentPerMember} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={110} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" fill="var(--color-count)" name="Equipment" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No equipment assignments available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Equipment by Project</CardTitle>
                <CardDescription>Top projects by equipment count</CardDescription>
              </CardHeader>
              <CardContent>
                {equipmentPerProject.length > 0 ? (
                  <ChartContainer
                    config={{
                      count: {
                        label: 'Equipment',
                        color: 'hsl(var(--chart-2))',
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={equipmentPerProject} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="title" type="category" width={110} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="var(--color-count)" name="Equipment" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No equipment assignments available
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle>Total Equipment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{equipments.length}</p>
                  <p className="text-sm text-muted-foreground mt-2">All equipment</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Available</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-chart-2">
                    {equipments.filter((e: AnalyticsEquipment) => e.status === 'AVAILABLE').length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">Ready to use</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>In Use</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-chart-4">
                    {equipments.filter((e: AnalyticsEquipment) => e.status === 'IN_USE').length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">Currently in use</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-chart-5">
                    {equipments.filter((e: AnalyticsEquipment) => e.status === 'MAINTENANCE').length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">Under maintenance</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
