'use client'

import { use } from 'react'
import Link from 'next/link'
import { useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeftIcon, BeakerIcon, HashIcon, UserIcon } from 'lucide-react'

const GET_EQUIPMENT = gql`
  query GetEquipment($id: ID!) {
    equipment(id: $id) {
      id
      name
      description
      serialNumber
      status
      project {
        id
        title
      }
      member {
        id
        name
      }
      createdAt
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

interface EquipmentDetail {
  id: string
  name: string
  description: string | null
  serialNumber: string | null
  status: string
  project: EquipmentProject | null
  member: EquipmentMember | null
  createdAt: string
}

interface GetEquipmentData {
  equipment: EquipmentDetail
}

interface GetEquipmentVariables {
  id: string
}

const statusColors: Record<string, string> = {
  AVAILABLE: 'bg-chart-2 text-white',
  IN_USE: 'bg-chart-4 text-white',
  MAINTENANCE: 'bg-chart-5 text-white',
}

export default function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data, loading, error } = useQuery<GetEquipmentData, GetEquipmentVariables>(GET_EQUIPMENT, {
    variables: { id },
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (error || !data?.equipment) {
    return (
      <div className="space-y-6">
        <Link href="/equipment">
          <Button variant="ghost" className="gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Equipment
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {error ? `Error loading equipment: ${error.message}` : 'Equipment not found'}
          </p>
        </div>
      </div>
    )
  }

  const equipment = data.equipment

  return (
    <div className="space-y-6">
      <Link href="/equipment">
        <Button variant="ghost" className="gap-2">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Equipment
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-4">
              <BeakerIcon className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <CardTitle className="text-3xl">{equipment.name}</CardTitle>
                {equipment.description && (
                  <CardDescription className="text-base mt-1">
                    {equipment.description}
                  </CardDescription>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={statusColors[equipment.status] || 'bg-muted text-muted-foreground'}>
                  {equipment.status.replace('_', ' ')}
                </Badge>
                {equipment.status === 'IN_USE' && equipment.member && (
                  <Badge variant="outline" className="bg-chart-4/10 border-chart-4">
                    In Use By: {equipment.member.name}
                  </Badge>
                )}
                {equipment.project && (
                  <Badge variant="outline">
                    Project: {equipment.project.title}
                  </Badge>
                )}
                {equipment.member && equipment.status !== 'IN_USE' && (
                  <Badge variant="outline">
                    Assigned: {equipment.member.name}
                  </Badge>
                )}
              </div>
            </div>
            {equipment.status === 'AVAILABLE' && (
              <Button size="lg">Book Equipment</Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {equipment.serialNumber && (
              <div className="flex items-center gap-3">
                <HashIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Serial Number</p>
                  <p className="text-sm text-muted-foreground font-mono text-xs">{equipment.serialNumber}</p>
                </div>
              </div>
            )}
            {equipment.member && (
              <div className="flex items-center gap-3">
                <UserIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {equipment.status === 'IN_USE' ? 'Currently Used By' : 'Assigned To'}
                  </p>
                  <Link href={`/members/${equipment.member.id}`} className="text-sm text-primary hover:underline">
                    {equipment.member.name}
                  </Link>
                </div>
              </div>
            )}
            {equipment.project && (
              <div className="flex items-center gap-3">
                <BeakerIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Project</p>
                  <Link href={`/projects/${equipment.project.id}`} className="text-sm text-primary hover:underline">
                    {equipment.project.title}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
