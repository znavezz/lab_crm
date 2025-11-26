'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { StatsCardSkeleton, SearchBarSkeleton, TabsSkeleton, ProtocolCardSkeleton } from '@/components/skeletons'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SearchIcon, PlusIcon, BookOpenIcon, DownloadIcon, ClockIcon, UserIcon } from 'lucide-react'

const GET_PROTOCOLS = gql`
  query GetProtocols {
    protocols {
      id
      title
      description
      category
      version
      estimatedTime
      difficulty
      tags
      downloads
      author {
        id
        name
      }
      project {
        id
        title
      }
      createdAt
      updatedAt
    }
  }
`

const GET_MEMBERS = gql`
  query GetMembers {
    members {
      id
      name
    }
  }
`

type ProtocolAuthor = {
  id: string
  name: string
}

type ProtocolProject = {
  id: string
  title: string
}

type ProtocolCategory = 'WET_LAB' | 'COMPUTATIONAL' | 'SAFETY' | 'GENERAL'
type ProtocolDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

type Protocol = {
  id: string
  title: string
  description?: string | null
  category: ProtocolCategory
  version: string
  estimatedTime?: string | null
  difficulty: ProtocolDifficulty
  tags?: string | null
  downloads: number
  author?: ProtocolAuthor | null
  project?: ProtocolProject | null
  createdAt: string
  updatedAt: string
}

type Member = {
  id: string
  name: string
}

type GetProtocolsQueryResult = {
  protocols: Protocol[]
}

type GetMembersQueryResult = {
  members: Member[]
}

const CREATE_PROTOCOL = gql`
  mutation CreateProtocol($input: CreateProtocolInput!) {
    createProtocol(input: $input) {
      id
      title
    }
  }
`

const categoryColors: Record<ProtocolCategory, string> = {
  WET_LAB: 'bg-primary text-primary-foreground',
  COMPUTATIONAL: 'bg-accent text-accent-foreground',
  SAFETY: 'bg-chart-5 text-white',
  GENERAL: 'bg-muted text-muted-foreground',
}

const categoryLabels: Record<ProtocolCategory, string> = {
  WET_LAB: 'Wet Lab',
  COMPUTATIONAL: 'Computational',
  SAFETY: 'Safety',
  GENERAL: 'General',
}

const difficultyColors: Record<ProtocolDifficulty, string> = {
  BEGINNER: 'bg-chart-2 text-white',
  INTERMEDIATE: 'bg-chart-4 text-white',
  ADVANCED: 'bg-chart-5 text-white',
}

export default function ProtocolsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setcategoryFilter] = useState<'ALL' | 'WET_LAB' | 'COMPUTATIONAL' | 'SAFETY' | 'GENERAL'>('ALL')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<{
    title: string
    category: ProtocolCategory
    version: string
    description: string
    estimatedTime: string
    difficulty: ProtocolDifficulty
    tags: string
    authorId: string
  }>({
    title: '',
    category: 'GENERAL',
    version: '1.0',
    description: '',
    estimatedTime: '',
    difficulty: 'INTERMEDIATE',
    tags: '',
    authorId: '',
  })

  const { data, loading, error, refetch } = useQuery<GetProtocolsQueryResult>(GET_PROTOCOLS)
  const { data: membersData } = useQuery<GetMembersQueryResult>(GET_MEMBERS)
  const [createProtocol, { loading: creating }] = useMutation(CREATE_PROTOCOL, {
    onCompleted: () => {
      toast.success('Protocol created successfully')
      setIsDialogOpen(false)
      setFormData({
        title: '',
        category: 'GENERAL',
        version: '1.0',
        description: '',
        estimatedTime: '',
        difficulty: 'INTERMEDIATE',
        tags: '',
        authorId: '',
      })
      refetch()
    },
    onError: (error) => {
      toast.error(`Failed to create protocol: ${error.message}`)
    },
  })

  const members = membersData?.members || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createProtocol({
      variables: {
        input: {
          title: formData.title,
          description: formData.description || undefined,
          category: formData.category,
          version: formData.version,
          estimatedTime: formData.estimatedTime || undefined,
          difficulty: formData.difficulty,
          tags: formData.tags || undefined,
          authorId: formData.authorId || undefined,
        },
      },
    })
  }

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Page header - Static title, description, and fully functional "New Protocol" button */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Lab Protocols</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base truncate">
              Standard operating procedures and experimental protocols
            </p>
          </div>
          {/* "New Protocol" dialog - Fully functional during loading */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shrink-0">
                <PlusIcon className="h-4 w-4" />
                <span className="hidden sm:inline">New Protocol</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Add New Protocol</DialogTitle>
                  <DialogDescription>
                    Create a new lab protocol or SOP.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Protocol Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="RNA Extraction Protocol"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value as ProtocolCategory })}
                      >
                        <SelectTrigger id="category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WET_LAB">Wet Lab</SelectItem>
                          <SelectItem value="COMPUTATIONAL">Computational</SelectItem>
                          <SelectItem value="SAFETY">Safety</SelectItem>
                          <SelectItem value="GENERAL">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="version">Version</Label>
                      <Input
                        id="version"
                        value={formData.version}
                        onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                        placeholder="1.0"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of the protocol..."
                      rows={4}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="estimatedTime">Estimated Time</Label>
                      <Input
                        id="estimatedTime"
                        value={formData.estimatedTime}
                        onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                        placeholder="2-3 hours"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select
                        value={formData.difficulty}
                        onValueChange={(value) => setFormData({ ...formData, difficulty: value as ProtocolDifficulty })}
                      >
                        <SelectTrigger id="difficulty">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BEGINNER">Beginner</SelectItem>
                          <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                          <SelectItem value="ADVANCED">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="RNA, Extraction, PCR"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="authorId">Author (Optional)</Label>
                    <Select
                      value={formData.authorId || "none"}
                      onValueChange={(value) => setFormData({ ...formData, authorId: value === "none" ? "" : value })}
                    >
                      <SelectTrigger id="authorId">
                        <SelectValue placeholder="Select author" />
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
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating}>
                    {creating ? 'Creating...' : 'Create Protocol'}
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
              <CardDescription>Total Protocols</CardDescription>
              <CardTitle className="text-3xl">
                <Skeleton className="h-9 w-12" />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Wet Lab</CardDescription>
              <CardTitle className="text-3xl text-primary">
                <Skeleton className="h-9 w-12" />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Computational</CardDescription>
              <CardTitle className="text-3xl text-accent">
                <Skeleton className="h-9 w-12" />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Downloads</CardDescription>
              <CardTitle className="text-3xl">
                <Skeleton className="h-9 w-12" />
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Main content - Protocol list with functional search and category tabs */}
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Search input - Fully functional during loading */}
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search protocols..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
        </div>

              {/* Category filter tabs - Fully interactive during loading */}
              <Tabs value={categoryFilter} onValueChange={(v) => setcategoryFilter(v as typeof categoryFilter)} className="w-full">
                <TabsList className="w-full grid grid-cols-4 h-auto">
                  <TabsTrigger value="ALL" className="text-xs sm:text-sm px-2">All</TabsTrigger>
                  <TabsTrigger value="WET_LAB" className="text-xs sm:text-sm px-2">Wet Lab</TabsTrigger>
                  <TabsTrigger value="COMPUTATIONAL" className="text-xs sm:text-sm px-2">Comp.</TabsTrigger>
                  <TabsTrigger value="SAFETY" className="text-xs sm:text-sm px-2">Safety</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            {/* Protocol list skeletons - Vertical list layout */}
            <div className="space-y-3 sm:space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ProtocolCardSkeleton key={i} />
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
        <div className="text-destructive">Error loading protocols: {error.message}</div>
      </div>
    )
  }

  const protocols = data?.protocols || []

  const filteredProtocols = protocols.filter((protocol: Protocol) => {
    const matchesSearch = protocol.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      protocol.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      protocol.author?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (protocol.tags && protocol.tags.toLowerCase().includes(searchQuery.toLowerCase())) || false
    
    const matchesCategory = categoryFilter === 'ALL' || protocol.category === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  const stats = {
    total: protocols.length,
    wetLab: protocols.filter((p: Protocol) => p.category === 'WET_LAB').length,
    computational: protocols.filter((p: Protocol) => p.category === 'COMPUTATIONAL').length,
    totalDownloads: protocols.reduce((sum: number, p: Protocol) => sum + (p.downloads || 0), 0),
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Lab Protocols</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base truncate">
            Standard operating procedures and experimental protocols
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shrink-0">
              <PlusIcon className="h-4 w-4" />
              <span className="hidden sm:inline">New Protocol</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add New Protocol</DialogTitle>
                <DialogDescription>
                  Create a new lab protocol or SOP.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Protocol Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="RNA Extraction Protocol"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value as ProtocolCategory })}
                    >
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WET_LAB">Wet Lab</SelectItem>
                        <SelectItem value="COMPUTATIONAL">Computational</SelectItem>
                        <SelectItem value="SAFETY">Safety</SelectItem>
                        <SelectItem value="GENERAL">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      placeholder="1.0"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the protocol..."
                    rows={4}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="estimatedTime">Estimated Time</Label>
                    <Input
                      id="estimatedTime"
                      value={formData.estimatedTime}
                      onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                      placeholder="2-3 hours"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value) => setFormData({ ...formData, difficulty: value as ProtocolDifficulty })}
                    >
                      <SelectTrigger id="difficulty">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="RNA, Extraction, PCR"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="authorId">Author (Optional)</Label>
                  <Select
                    value={formData.authorId || "none"}
                    onValueChange={(value) => setFormData({ ...formData, authorId: value === "none" ? "" : value })}
                  >
                    <SelectTrigger id="authorId">
                      <SelectValue placeholder="Select author" />
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
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? 'Creating...' : 'Add Protocol'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Protocols</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Wet Lab</CardDescription>
            <CardTitle className="text-3xl text-primary">{stats.wetLab}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Computational</CardDescription>
            <CardTitle className="text-3xl text-accent">{stats.computational}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Downloads</CardDescription>
            <CardTitle className="text-3xl">{stats.totalDownloads}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search protocols..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Tabs value={categoryFilter} onValueChange={(v) => setcategoryFilter(v as typeof categoryFilter)} className="w-full">
              <TabsList className="w-full grid grid-cols-4 h-auto">
                <TabsTrigger value="ALL" className="text-xs sm:text-sm px-2">All</TabsTrigger>
                <TabsTrigger value="WET_LAB" className="text-xs sm:text-sm px-2">Wet Lab</TabsTrigger>
                <TabsTrigger value="COMPUTATIONAL" className="text-xs sm:text-sm px-2">Comp.</TabsTrigger>
                <TabsTrigger value="SAFETY" className="text-xs sm:text-sm px-2">Safety</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {filteredProtocols.map((protocol: Protocol) => (
              <Link key={protocol.id} href={`/protocols/${protocol.id}`}>
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <BookOpenIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <CardTitle className="text-lg">{protocol.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge className={categoryColors[protocol.category]}>
                                {categoryLabels[protocol.category]}
                              </Badge>
                              <Badge className={difficultyColors[protocol.difficulty]} variant="outline">
                                {protocol.difficulty}
                              </Badge>
                              <span className="text-xs text-muted-foreground font-mono">
                                v{protocol.version}
                              </span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="gap-2 flex-shrink-0">
                            <DownloadIcon className="h-3.5 w-3.5" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {protocol.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <ClockIcon className="h-3.5 w-3.5" />
                        <span>{protocol.estimatedTime}</span>
                      </div>
                      {protocol.author && (
                        <div className="flex items-center gap-1.5">
                          <UserIcon className="h-3.5 w-3.5" />
                          <span>{protocol.author.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <DownloadIcon className="h-3.5 w-3.5" />
                        <span>{protocol.downloads || 0} downloads</span>
                      </div>
                    </div>
                    
                    {protocol.updatedAt && (
                      <div className="text-xs text-muted-foreground">
                        Last updated: {new Date(protocol.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </div>
                    )}
                    
                    {protocol.tags && (
                      <div className="flex flex-wrap gap-1.5">
                        {protocol.tags.split(',').map((tag: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
            
            {filteredProtocols.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No protocols found matching your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
