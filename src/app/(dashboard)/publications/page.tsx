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
import { StatsCardSkeleton, SearchBarSkeleton, PublicationCardSkeleton } from '@/components/skeletons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import { SearchIcon, PlusIcon, FileTextIcon, Check, ChevronsUpDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Carousel, CarouselCard } from '@/components/ui/carousel'

const GET_PUBLICATIONS = gql`
  query GetPublications {
    publications {
      id
      title
      published
      doi
      url
      members {
        id
        name
      }
      projects {
        id
        title
      }
      createdAt
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

const CREATE_PUBLICATION = gql`
  mutation CreatePublication($input: CreatePublicationInput!) {
    createPublication(input: $input) {
      id
      title
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

interface Publication {
  id: string
  title: string
  published: string | null
  doi: string | null
  url: string | null
  members: PublicationMember[]
  projects: PublicationProject[]
  createdAt: string
}

interface GetPublicationsData {
  publications: Publication[]
}

interface Member {
  id: string
  name: string
}

interface GetMembersData {
  members: Member[]
}

export default function PublicationsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [authorPopoverOpen, setAuthorPopoverOpen] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: '',
    published: '',
    doi: '',
    url: '',
  })

  const { data, loading, error, refetch } = useQuery<GetPublicationsData>(GET_PUBLICATIONS)
  const { data: membersData } = useQuery<GetMembersData>(GET_MEMBERS)
  const [createPublication, { loading: creating }] = useMutation(CREATE_PUBLICATION, {
    onCompleted: () => {
      toast.success('Publication created successfully')
      setIsDialogOpen(false)
      setSelectedMembers([])
      setFormData({ title: '', published: '', doi: '', url: '' })
      refetch()
    },
    onError: (error) => {
      toast.error(`Failed to create publication: ${error.message}`)
    },
  })

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-8 sm:h-9 w-64" /> {/* Title */}
            <Skeleton className="h-4 w-80" /> {/* Description */}
          </div>
          <Skeleton className="h-10 w-32 shrink-0" /> {/* "Add Publication" button */}
        </div>

        {/* Stats cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        {/* Search bar and carousel */}
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Skeleton className="h-10 w-full" /> {/* Search input */}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 overflow-visible -mx-2 mt-2">
            {/* Carousel skeleton - horizontal scrolling publication cards */}
            <div className="flex gap-4 overflow-x-auto px-1 py-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-[280px] flex-shrink-0">
                  <div className="flex flex-col rounded-xl border-2 border-border overflow-hidden h-[380px]">
                    {/* Visual Header - Fixed height */}
                    <Skeleton className="h-32 w-full shrink-0" />
                    
                    {/* Content - Fills remaining space */}
                    <div className="flex flex-col h-[248px] p-5">
                      {/* Top section - grows to fill space */}
                      <div className="flex-1 overflow-hidden">
                        <div className="space-y-2.5">
                          {/* Title */}
                          <div className="space-y-1.5">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-4/5" />
                          </div>
                          
                          {/* Authors section */}
                          <div className="space-y-1.5">
                            <Skeleton className="h-3 w-20" />
                            <div className="flex flex-wrap gap-1.5">
                              <Skeleton className="h-5 w-16" />
                              <Skeleton className="h-5 w-20" />
                              <Skeleton className="h-5 w-14" />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bottom section - Metadata (fixed at bottom) */}
                      <div className="space-y-2 pt-3 border-t">
                        <Skeleton className="h-3 w-40" /> {/* Publication date */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Skeleton className="h-5 w-12" />
                          <Skeleton className="h-3 w-16" />
                        </div>
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
        <div className="text-destructive">Error loading publications: {error.message}</div>
      </div>
    )
  }

  const publications = data?.publications || []
  const members = membersData?.members || []

  const filteredPublications = publications.filter((pub: Publication) => {
    const matchesSearch = pub.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pub.members?.some((m: PublicationMember) => m.name?.toLowerCase().includes(searchQuery.toLowerCase())) || false
    
    return matchesSearch
  })

  const stats = {
    total: publications.length,
    published: publications.filter((p: Publication) => p.published).length,
    thisYear: publications.filter((p: Publication) => {
      if (!p.published) return false
      const year = new Date(p.published).getFullYear()
      return year === new Date().getFullYear()
    }).length,
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createPublication({
      variables: {
        input: {
          title: formData.title,
          published: formData.published ? new Date(formData.published).toISOString() : undefined,
          doi: formData.doi || undefined,
          url: formData.url || undefined,
        },
      },
    })
  }

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    )
  }

  const handleRemoveMember = (memberId: string) => {
    setSelectedMembers(prev => prev.filter(id => id !== memberId))
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Publications</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base truncate">
            Lab research outputs and scholarly articles
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shrink-0">
              <PlusIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Add Publication</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add New Publication</DialogTitle>
                <DialogDescription>
                  Add a new publication to the lab&apos;s research output.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter publication title"
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <Label>Authors (Optional)</Label>
                  <Popover open={authorPopoverOpen} onOpenChange={setAuthorPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={authorPopoverOpen}
                        className="justify-between"
                      >
                        {selectedMembers.length > 0
                          ? `${selectedMembers.length} author(s) selected`
                          : "Select authors..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Search lab members..." />
                        <CommandList>
                          <CommandEmpty>No lab members found.</CommandEmpty>
                          <CommandGroup>
                            {members.map((member: Member) => {
                              const isSelected = selectedMembers.includes(member.id)
                              return (
                                <CommandItem
                                  key={member.id}
                                  value={member.name}
                                  onSelect={() => {
                                    toggleMemberSelection(member.id)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      isSelected ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {member.name}
                                </CommandItem>
                              )
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {selectedMembers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedMembers.map((memberId) => {
                        const member = members.find((m: Member) => m.id === memberId)
                        if (!member) return null
                        return (
                          <Badge key={memberId} variant="secondary" className="gap-1">
                            {member.name}
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(memberId)}
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
                <div className="grid gap-2">
                  <Label htmlFor="published">Published Date (Optional)</Label>
                  <Input
                    id="published"
                    type="date"
                    value={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="doi">DOI (Optional)</Label>
                  <Input
                    id="doi"
                    value={formData.doi}
                    onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                    placeholder="10.1038/nbt.2024.001"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="url">URL (Optional)</Label>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? 'Adding...' : 'Add Publication'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Publications</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Published</CardDescription>
            <CardTitle className="text-3xl text-chart-2">{stats.published}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>With DOI</CardDescription>
            <CardTitle className="text-3xl text-accent">{publications.filter((p: Publication) => p.doi).length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>This Year</CardDescription>
            <CardTitle className="text-3xl">{stats.thisYear}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search publications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 overflow-visible -mx-2 mt-2">
          {filteredPublications.length > 0 ? (
            <Carousel gap="md">
              {filteredPublications.map((pub: Publication) => {
                const publishedYear = pub.published ? new Date(pub.published).getFullYear() : null
                return (
                  <CarouselCard key={pub.id} href={`/publications/${pub.id}`}>
                    <div className="flex flex-col rounded-xl border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl bg-card hover:bg-accent/30 w-[280px] h-[380px] group cursor-pointer overflow-hidden transform hover:scale-105 hover:-translate-y-2 relative z-10">
                      {/* Visual Header - Fixed height */}
                      <div className="relative h-32 shrink-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center">
                        <FileTextIcon className="h-16 w-16 text-primary/30 group-hover:text-primary/50 transition-colors" />
                        {publishedYear && (
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-chart-2 text-white text-xs">
                              {publishedYear}
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      {/* Content - Fills remaining space */}
                      <div className="flex flex-col h-[248px] p-5">
                        {/* Top section - grows to fill space */}
                        <div className="flex-1 overflow-hidden">
                          <div className="space-y-2.5">
                            <h3 className="font-semibold text-base leading-tight line-clamp-3 group-hover:text-primary transition-colors">
                              {pub.title}
                            </h3>
                            
                            {/* Authors */}
                            {pub.members && pub.members.length > 0 && (
                              <div className="space-y-1.5">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                  Authors ({pub.members.length})
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {pub.members.slice(0, 3).map((m: PublicationMember) => (
                                    <Badge 
                                      key={m.id}
                                      variant="secondary" 
                                      className="text-xs hover:bg-secondary/80 transition-colors"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        window.location.href = `/members/${m.id}`
                                      }}
                                    >
                                      {m.name}
                                    </Badge>
                                  ))}
                                  {pub.members.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{pub.members.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Bottom section - Metadata (fixed at bottom) */}
                        <div className="space-y-2 pt-3 border-t">
                          {pub.published && (
                            <div className="text-xs text-muted-foreground">
                              Published: {new Date(pub.published).toLocaleDateString('en-GB', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </div>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            {pub.doi && (
                              <Badge variant="outline" className="text-xs font-mono">
                                DOI
                              </Badge>
                            )}
                            {pub.projects && pub.projects.length > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {pub.projects.length} project{pub.projects.length !== 1 ? 's' : ''}
                              </span>
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
              <p className="text-muted-foreground">No publications found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
