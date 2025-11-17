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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SearchIcon, PlusIcon, BeakerIcon } from 'lucide-react'

const GET_EQUIPMENTS = gql`
  query GetEquipments {
    equipments {
      id
      name
      description
      serialNumber
      status
      projectId
      project {
        id
        title
      }
      memberId
      member {
        id
        name
      }
      createdAt
    }
  }
`

const CREATE_EQUIPMENT = gql`
  mutation CreateEquipment($input: CreateEquipmentInput!) {
    createEquipment(input: $input) {
      id
      name
      status
    }
  }
`

interface EquipmentProject {
  id: string
  title: string
}

interface EquipmentMember {
  id: string
  name: string
}

interface Equipment {
  id: string
  name: string
  description: string | null
  serialNumber: string | null
  status: string
  projectId: string | null
  project: EquipmentProject | null
  memberId: string | null
  member: EquipmentMember | null
  createdAt: string
}

interface GetEquipmentsData {
  equipments: Equipment[]
}

const statusColors: Record<string, string> = {
  AVAILABLE: 'bg-chart-2 text-white',
  IN_USE: 'bg-chart-4 text-white',
  MAINTENANCE: 'bg-chart-5 text-white',
}

const statusLabels: Record<string, string> = {
  AVAILABLE: 'Available',
  IN_USE: 'In Use',
  MAINTENANCE: 'Maintenance',
}

export default function EquipmentPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE'>('ALL')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    serialNumber: '',
    status: 'AVAILABLE' as 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE',
  })

  const { data, loading, error, refetch } = useQuery<GetEquipmentsData>(GET_EQUIPMENTS)
  const [createEquipment, { loading: creating }] = useMutation(CREATE_EQUIPMENT, {
    onCompleted: () => {
      toast.success('Equipment created successfully')
      setIsDialogOpen(false)
      setFormData({ name: '', description: '', serialNumber: '', status: 'AVAILABLE' })
      refetch()
    },
    onError: (error) => {
      toast.error(`Failed to create equipment: ${error.message}`)
    },
  })

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
        <div className="text-destructive">Error loading equipment: {error.message}</div>
      </div>
    )
  }

  const equipments = data?.equipments || []

  const filteredEquipment = equipments.filter((item: Equipment) => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || false
    
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: equipments.length,
    available: equipments.filter((e: Equipment) => e.status === 'AVAILABLE').length,
    inUse: equipments.filter((e: Equipment) => e.status === 'IN_USE').length,
    maintenance: equipments.filter((e: Equipment) => e.status === 'MAINTENANCE').length,
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createEquipment({
      variables: {
        input: {
          name: formData.name,
          description: formData.description || undefined,
          serialNumber: formData.serialNumber || undefined,
          status: formData.status,
        },
      },
    })
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Lab Equipment</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base truncate">
            Track and manage laboratory instruments and devices
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shrink-0">
              <PlusIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Add Equipment</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add New Equipment</DialogTitle>
                <DialogDescription>
                  Add new equipment to the lab inventory.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Equipment Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="PCR Machine"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Thermal cycler for DNA amplification"
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="serialNumber">Serial Number (Optional)</Label>
                  <Input
                    id="serialNumber"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    placeholder="SN-2024-001"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Available</SelectItem>
                      <SelectItem value="IN_USE">In Use</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? 'Adding...' : 'Add Equipment'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Equipment</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Available</CardDescription>
            <CardTitle className="text-3xl text-chart-2">{stats.available}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>In Use</CardDescription>
            <CardTitle className="text-3xl text-chart-4">{stats.inUse}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Maintenance</CardDescription>
            <CardTitle className="text-3xl text-chart-5">{stats.maintenance}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'ALL' | 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE')} className="w-full">
              <TabsList className="w-full grid grid-cols-4 h-auto">
                <TabsTrigger value="ALL" className="text-xs sm:text-sm px-2">All</TabsTrigger>
                <TabsTrigger value="AVAILABLE" className="text-xs sm:text-sm px-2">Available</TabsTrigger>
                <TabsTrigger value="IN_USE" className="text-xs sm:text-sm px-2">In Use</TabsTrigger>
                <TabsTrigger value="MAINTENANCE" className="text-xs sm:text-sm px-2">Maint.</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredEquipment.map((item: Equipment) => (
              <Link key={item.id} href={`/equipment/${item.id}`}>
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <BeakerIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <CardTitle className="text-lg">{item.name}</CardTitle>
                            {item.description && (
                              <p className="text-sm text-muted-foreground">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={statusColors[item.status] || 'bg-muted text-muted-foreground'}>
                            {statusLabels[item.status] || item.status}
                          </Badge>
                          {item.status === 'IN_USE' && item.member && (
                            <Badge variant="outline" className="text-xs bg-chart-4/10 border-chart-4">
                              In Use By: {item.member.name}
                            </Badge>
                          )}
                          {item.project && (
                            <Badge variant="outline" className="text-xs">
                              {item.project.title}
                            </Badge>
                          )}
                          {item.member && item.status !== 'IN_USE' && (
                            <Badge variant="outline" className="text-xs">
                              {item.member.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {item.serialNumber && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-mono text-xs">Serial: {item.serialNumber}</span>
                      </div>
                    )}
                    {item.project && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Project: </span>
                        <Link href={`/projects/${item.project.id}`} className="font-medium text-primary hover:underline">
                          {item.project.title}
                        </Link>
                      </div>
                    )}
                    {item.member && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          {item.status === 'IN_USE' ? 'Currently used by: ' : 'Assigned to: '}
                        </span>
                        <Link href={`/members/${item.member.id}`} className="font-medium text-primary hover:underline">
                          {item.member.name}
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
            
            {filteredEquipment.length === 0 && (
              <div className="col-span-2 py-12 text-center">
                <p className="text-muted-foreground">No equipment found matching your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
