'use client'

import { use } from 'react'
import Link from 'next/link'
import { useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeftIcon, ExternalLinkIcon, FileTextIcon, UsersIcon } from 'lucide-react'

const GET_PUBLICATION = gql`
  query GetPublication($id: ID!) {
    publication(id: $id) {
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

interface PublicationMember {
  id: string
  name: string
}

interface PublicationProject {
  id: string
  title: string
}

interface PublicationDetail {
  id: string
  title: string
  published: string | null
  doi: string | null
  url: string | null
  members: PublicationMember[]
  projects: PublicationProject[]
  createdAt: string
}

interface GetPublicationData {
  publication: PublicationDetail
}

interface GetPublicationVariables {
  id: string
}

export default function PublicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data, loading, error } = useQuery<GetPublicationData, GetPublicationVariables>(GET_PUBLICATION, {
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

  if (error || !data?.publication) {
    return (
      <div className="space-y-6">
        <Link href="/publications">
          <Button variant="ghost" className="gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Publications
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {error ? `Error loading publication: ${error.message}` : 'Publication not found'}
          </p>
        </div>
      </div>
    )
  }

  const pub = data.publication

  return (
    <div className="space-y-6">
      <Link href="/publications">
        <Button variant="ghost" className="gap-2">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Publications
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <FileTextIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <CardTitle className="text-3xl leading-tight">{pub.title}</CardTitle>
                  {pub.members && pub.members.length > 0 && (
                    <p className="text-muted-foreground mt-2">
                      {pub.members.map((m: PublicationMember) => m.name).join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {pub.published && (
                    <Badge className="bg-chart-2 text-white">
                      Published {new Date(pub.published).getFullYear()}
                    </Badge>
                  )}
                  {pub.doi && (
                    <Badge variant="outline" className="font-mono text-xs">
                      DOI: {pub.doi}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {pub.published && (
              <div>
                <p className="text-sm font-medium mb-1">Published Date</p>
                <p className="text-sm text-muted-foreground">{new Date(pub.published).toLocaleDateString()}</p>
              </div>
            )}
            {pub.createdAt && (
              <div>
                <p className="text-sm font-medium mb-1">Added to System</p>
                <p className="text-sm text-muted-foreground">{new Date(pub.createdAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 pt-2">
            {pub.url && (
              <Button className="gap-2" asChild>
                <a href={pub.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLinkIcon className="h-4 w-4" />
                  View Full Text
                </a>
              </Button>
            )}
            {pub.doi && (
              <Button variant="outline" className="gap-2" asChild>
                <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLinkIcon className="h-4 w-4" />
                  View via DOI
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {pub.projects && pub.projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              Related Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pub.projects.map((project: PublicationProject) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <div className="p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                    <p className="font-medium">{project.title}</p>
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
