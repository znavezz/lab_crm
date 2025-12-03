'use client'

import { use } from 'react'
import Link from 'next/link'
import { useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ListItemSkeleton } from '@/components/skeletons'
import { ArrowLeftIcon, BookOpenIcon, DownloadIcon, ClockIcon, UserIcon, HistoryIcon, FileTextIcon } from 'lucide-react'

const GET_PROTOCOL = gql`
  query GetProtocol($id: String!) {
    protocol(id: $id) {
      id
      title
      description
      category
      version
      estimatedTime
      difficulty
      tags
      downloads
      Member {
        id
        name
      }
      Project {
        id
        title
      }
      Document {
        id
        filename
        url
      }
      materials
      equipment
      steps
      safetyNotes
      versionHistory
      createdAt
      updatedAt
    }
  }
`

interface ProtocolAuthor {
  id: string
  name: string
}

interface ProtocolProject {
  id: string
  title: string
}

interface ProtocolDocument {
  id: string
  filename: string
  url: string
}

interface ProtocolDetail {
  id: string
  title: string
  description: string | null
  category: string
  version: string
  estimatedTime: string | null
  difficulty: string
  tags: string | null
  downloads: number
  author: ProtocolAuthor | null
  project: ProtocolProject | null
  document: ProtocolDocument | null
  materials: string | null
  equipment: string | null
  steps: string | null
  safetyNotes: string | null
  versionHistory: string | null
  createdAt: string
  updatedAt: string | null
}

interface GetProtocolData {
  protocol: ProtocolDetail
}

interface GetProtocolVariables {
  id: string
}

const categoryColors: Record<string, string> = {
  WET_LAB: 'bg-primary text-primary-foreground',
  COMPUTATIONAL: 'bg-accent text-accent-foreground',
  SAFETY: 'bg-chart-5 text-white',
  GENERAL: 'bg-muted text-muted-foreground',
}

const difficultyColors: Record<string, string> = {
  BEGINNER: 'bg-chart-2 text-white',
  INTERMEDIATE: 'bg-chart-4 text-white',
  ADVANCED: 'bg-chart-5 text-white',
}

export default function ProtocolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data, loading, error } = useQuery<GetProtocolData, GetProtocolVariables>(GET_PROTOCOL, {
    variables: { id },
  })

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Back button */}
        <Skeleton className="h-10 w-32" />
        
        {/* Protocol header */}
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <div className="grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          </CardContent>
        </Card>

        {/* Steps and materials */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              {[1, 2, 3, 4].map((i) => (
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

  if (error || !data?.protocol) {
    return (
      <div className="space-y-6">
        <Link href="/protocols">
          <Button variant="ghost" className="gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Protocols
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {error ? `Error loading protocol: ${error.message}` : 'Protocol not found'}
          </p>
        </div>
      </div>
    )
  }

  const protocol = data.protocol
  
  // Parse JSON fields
  const materials = protocol.materials ? (() => {
    try {
      const parsed = JSON.parse(protocol.materials)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return protocol.materials.split(',').map((s: string) => s.trim()).filter(Boolean)
    }
  })() : []
  
  const equipment = protocol.equipment ? (() => {
    try {
      const parsed = JSON.parse(protocol.equipment)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return protocol.equipment.split(',').map((s: string) => s.trim()).filter(Boolean)
    }
  })() : []
  
  const steps = protocol.steps ? (() => {
    try {
      return JSON.parse(protocol.steps)
    } catch {
      return []
    }
  })() : []
  
  const safetyNotes = protocol.safetyNotes ? (() => {
    try {
      const parsed = JSON.parse(protocol.safetyNotes)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return protocol.safetyNotes.split(',').map((s: string) => s.trim()).filter(Boolean)
    }
  })() : []
  
  const versionHistory = protocol.versionHistory ? (() => {
    try {
      return JSON.parse(protocol.versionHistory)
    } catch {
      return []
    }
  })() : []
  
  const tags = protocol.tags ? protocol.tags.split(',').map((s: string) => s.trim()).filter(Boolean) : []

  return (
    <div className="space-y-6">
      <Link href="/protocols">
        <Button variant="ghost" className="gap-2">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Protocols
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-4">
              <BookOpenIcon className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-3xl">{protocol.title}</CardTitle>
                  <CardDescription className="text-base mt-2">{protocol.description}</CardDescription>
                </div>
                {protocol.document ? (
                  <Button size="lg" className="gap-2 flex-shrink-0" asChild>
                    <a href={protocol.document.url} target="_blank" rel="noopener noreferrer">
                      <DownloadIcon className="h-4 w-4" />
                      Download PDF
                    </a>
                  </Button>
                ) : (
                  <Button size="lg" className="gap-2 flex-shrink-0" disabled>
                    <DownloadIcon className="h-4 w-4" />
                    No Document
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={categoryColors[protocol.category] || 'bg-muted text-muted-foreground'}>
                  {protocol.category.replace('_', ' ')}
                </Badge>
                <Badge className={difficultyColors[protocol.difficulty] || 'bg-muted text-muted-foreground'} variant="outline">
                  {protocol.difficulty}
                </Badge>
                <Badge variant="outline" className="font-mono">v{protocol.version}</Badge>
                {tags.map((tag: string, idx: number) => (
                  <Badge key={idx} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-3">
              <ClockIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p className="text-sm text-muted-foreground">{protocol.estimatedTime}</p>
              </div>
            </div>
            {protocol.author && (
              <div className="flex items-center gap-3">
                <UserIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Author</p>
                  <Link href={`/members/${protocol.author.id}`} className="text-sm text-primary hover:underline">
                    {protocol.author.name}
                  </Link>
                </div>
              </div>
            )}
            {protocol.updatedAt && (
              <div className="flex items-center gap-3">
                <HistoryIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">{new Date(protocol.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <DownloadIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Downloads</p>
                <p className="text-sm text-muted-foreground">{protocol.downloads}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Materials Required</CardTitle>
          </CardHeader>
          <CardContent>
            {materials.length > 0 ? (
              <ul className="space-y-2">
                {materials.map((material: string, index: number) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{material}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No materials specified</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equipment Needed</CardTitle>
          </CardHeader>
          <CardContent>
            {equipment.length > 0 ? (
              <ul className="space-y-2">
                {equipment.map((item: string, index: number) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No equipment specified</p>
            )}
          </CardContent>
        </Card>
      </div>

      {steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Step-by-Step Procedure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {steps.map((step: { step?: number; instruction?: string; time?: string } | string, index: number) => {
                const stepObj = typeof step === 'string' ? { instruction: step } : step
                return (
                <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                      {stepObj.step || index + 1}
                  </div>
                  <div className="flex-1">
                      <p className="text-sm mb-1">{stepObj.instruction || (typeof step === 'string' ? step : '')}</p>
                      {stepObj.time && (
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{stepObj.time}</span>
                      </div>
                    )}
                  </div>
                </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {safetyNotes.length > 0 && (
        <Card className="border-chart-5">
          <CardHeader>
            <CardTitle className="text-chart-5">Safety Precautions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {safetyNotes.map((note: string, index: number) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="text-chart-5 mt-1 font-bold">⚠</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {versionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileTextIcon className="h-5 w-5" />
              Version History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {versionHistory.map((version: { version: string; date: string; changes: string }, index: number) => (
                <div key={index} className="flex items-start gap-4 pb-3 border-b last:border-0">
                  <Badge variant="outline" className="font-mono flex-shrink-0">
                    v{version.version}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{new Date(version.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                    <p className="text-sm text-muted-foreground mt-1">{version.changes}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
