'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchIcon, PlusIcon, MailIcon, PhoneIcon } from 'lucide-react'
import type { Member } from '@/generated/graphql/resolvers-types'

interface MemberWithPhoto extends Member {
  photoUrl?: string | null
}

interface GetMembersData {
  members: MemberWithPhoto[]
}

interface CreateMemberData {
  createMember: {
    id: string
    name: string
    rank?: string | null
    role?: string | null
    status?: string | null
  }
}

const GET_MEMBERS = gql`
  query GetMembers {
    members {
      id
      name
      rank
      role
      status
      scholarship
      photoUrl
      createdAt
    }
  }
`

const CREATE_MEMBER = gql`
  mutation CreateMember($input: CreateMemberInput!) {
    createMember(input: $input) {
      id
      name
      rank
      role
      status
    }
  }
`

const roleColors: Record<string, string> = {
  PI: 'bg-primary text-primary-foreground',
  POSTDOC: 'bg-accent text-accent-foreground',
  STUDENT: 'bg-chart-2 text-white',
  RESEARCHER: 'bg-chart-3 text-white',
  LAB_MANAGER: 'bg-chart-4 text-white',
  INTERN: 'bg-secondary text-secondary-foreground',
  CONTRACTOR: 'bg-muted text-muted-foreground',
  GUEST: 'bg-muted text-muted-foreground',
  OTHER: 'bg-muted text-muted-foreground',
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-500 text-white',
  INACTIVE: 'bg-muted text-muted-foreground',
  ALUMNI: 'bg-secondary text-secondary-foreground',
}

export default function MembersPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'ALUMNI'>('ACTIVE')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    rank: '',
    role: '',
    status: 'ACTIVE',
    scholarship: '',
    joinedDate: '',
  })

  const { data, loading, error, refetch } = useQuery<GetMembersData>(GET_MEMBERS)
  const [createMember, { loading: creating }] = useMutation<CreateMemberData>(CREATE_MEMBER, {
    onCompleted: (data) => {
      toast.success('Member created successfully')
      setIsDialogOpen(false)
      setFormData({ name: '', rank: '', role: '', status: 'ACTIVE', scholarship: '', joinedDate: '' })
      refetch()
      router.push(`/members/${data.createMember.id}`)
    },
    onError: (error) => {
      toast.error(`Failed to create member: ${error.message}`)
    },
  })

  const members = data?.members || []
  
  const filteredMembers = members.filter((member: MemberWithPhoto) => {
    const matchesSearch = member.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false
    const matchesStatus = statusFilter === 'ALL' || member.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: members.length,
    active: members.filter((m: MemberWithPhoto) => m.status === 'ACTIVE').length,
    alumni: members.filter((m: MemberWithPhoto) => m.status === 'ALUMNI').length,
  }

  type FormEvent = React.FormEvent<HTMLFormElement>

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    createMember({
      variables: {
        input: {
          name: formData.name,
          rank: formData.rank || undefined,
          role: formData.role || undefined,
          status: formData.status || undefined,
          scholarship: formData.scholarship ? parseInt(formData.scholarship) : undefined,
          joinedDate: formData.joinedDate ? new Date(formData.joinedDate).toISOString() : undefined,
        },
      },
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-destructive">Error loading members: {error.message}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lab Members</h1>
          <p className="text-muted-foreground mt-1">
            Manage your research team and collaborators
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <PlusIcon className="h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
                <DialogDescription>
                  Add a new team member to the lab. Fill in their details below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Dr. Jane Smith"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rank">Rank (Optional)</Label>
                  <Select
                    value={formData.rank}
                    onValueChange={(value) => setFormData({ ...formData, rank: value })}
                  >
                    <SelectTrigger id="rank">
                      <SelectValue placeholder="Select rank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PROFESSOR">Professor</SelectItem>
                      <SelectItem value="DOCTOR">Doctor</SelectItem>
                      <SelectItem value="POSTDOC">Postdoc</SelectItem>
                      <SelectItem value="MSc">Master of Science</SelectItem>
                      <SelectItem value="BSc">Bachelor of Science</SelectItem>
                      <SelectItem value="Mr">Mr</SelectItem>
                      <SelectItem value="Mrs">Mrs</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    For MSc Student: Select Role = "Student" and Rank = "MSc"
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PI">Principal Investigator</SelectItem>
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="RESEARCHER">Research Scientist</SelectItem>
                      <SelectItem value="LAB_MANAGER">Lab Manager</SelectItem>
                      <SelectItem value="ADVISOR">Advisor</SelectItem>
                      <SelectItem value="INTERN">Intern</SelectItem>
                      <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                      <SelectItem value="GUEST">Guest</SelectItem>
                      <SelectItem value="ALUMNI">Alumni</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="ALUMNI">Alumni</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="scholarship">Scholarship (Optional)</Label>
                  <Input
                    id="scholarship"
                    type="number"
                    value={formData.scholarship}
                    onChange={(e) => setFormData({ ...formData, scholarship: e.target.value })}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="joinedDate">Joined Date (Optional)</Label>
                  <Input
                    id="joinedDate"
                    type="date"
                    value={formData.joinedDate}
                    onChange={(e) => setFormData({ ...formData, joinedDate: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to use today's date as the joined date.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? 'Adding...' : 'Add Member'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Members</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Members</CardDescription>
            <CardTitle className="text-3xl text-chart-2">{stats.active}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Alumni</CardDescription>
            <CardTitle className="text-3xl text-muted-foreground">{stats.alumni}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-sm">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'ALL' | 'ACTIVE' | 'INACTIVE' | 'ALUMNI')}>
              <TabsList>
                <TabsTrigger value="ACTIVE">Active</TabsTrigger>
                <TabsTrigger value="ALUMNI">Alumni</TabsTrigger>
                <TabsTrigger value="ALL">All</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredMembers.map((member: MemberWithPhoto) => (
              <Link key={member.id} href={`/members/${member.id}`}>
                <div className="flex items-start gap-3 sm:gap-4 rounded-lg border border-border p-3 sm:p-4 transition-colors hover:bg-accent/50 cursor-pointer">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                    <AvatarImage src={member.photoUrl || "/placeholder.svg"} alt={member.name || 'Member'} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                      {member.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'M'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2 sm:gap-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg truncate">{member.name}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {member.role && (
                            <Badge className={roleColors[member.role] || 'bg-muted'} variant="secondary">
                              {member.role}
                            </Badge>
                          )}
                          {member.status && (
                            <Badge 
                              className={statusColors[member.status] || 'bg-muted'} 
                              variant={member.status === 'ACTIVE' ? 'default' : 'outline'}
                            >
                              {member.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      {member.rank && (
                        <div className="flex items-center gap-2">
                          <span>{member.rank}</span>
                        </div>
                      )}
                      {member.scholarship && (
                        <div className="flex items-center gap-2">
                          <span>Scholarship: ${member.scholarship}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            
            {filteredMembers.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No members found matching your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
