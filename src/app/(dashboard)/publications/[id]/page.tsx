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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeftIcon, ExternalLinkIcon, FileTextIcon, UsersIcon } from 'lucide-react'

const GET_PUBLICATION = gql`
  query GetPublication($id: String!) {
    publication(id: $id) {
      id
      title
      published
      doi
      url
      PublicationMembers {
        Member {
          id
          name
          photoUrl
          role
        }
      }
      PublicationProjects {
        Project {
          id
          title
        }
      }
      createdAt
    }
  }
`

interface PublicationMember {
  id: string
  name: string
  photoUrl: string | null
  role: string | null
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
        {/* Back button */}
        <Skeleton className="h-10 w-32" />
        
        {/* Publication header */}
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-5 w-3/4 mt-2" />
            <div className="flex gap-2 mt-3">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>

        {/* Authors and projects */}
        <div className="grid gap-6 md:grid-cols-2">
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
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              {[1, 2].map((i) => (
                <ListItemSkeleton key={i} />
              ))}
            </CardContent>
          </Card>
        </div>
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
                <p className="text-sm text-muted-foreground">{new Date(pub.published).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
              </div>
            )}
            {pub.createdAt && (
              <div>
                <p className="text-sm font-medium mb-1">Added to System</p>
                <p className="text-sm text-muted-foreground">{new Date(pub.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
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
              <FileTextIcon className="h-5 w-5" />
              Related Projects ({pub.projects.length})
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

      {pub.members && pub.members.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <UsersIcon className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Authors</h2>
            <Badge variant="secondary" className="ml-2">{pub.members.length}</Badge>
          </div>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 py-6">
            {pub.members.map((member: PublicationMember, index: number) => {
              const initials = member.name
                ?.split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) || 'M'
              
              return (
                <Link
                  key={member.id}
                  href={`/members/${member.id}`}
                  className="group relative"
                >
                  <div className="flex flex-col items-center gap-4 p-6 rounded-2xl border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl bg-card hover:bg-accent/30 min-w-[160px] sm:min-w-[180px] transform hover:scale-105 hover:-translate-y-2">
                    <div className="relative">
                      <Avatar className="h-28 w-28 sm:h-32 sm:w-32 ring-4 ring-background ring-offset-2 ring-offset-background group-hover:ring-primary/50 transition-all duration-300 group-hover:scale-110">
                        <AvatarImage 
                          src={member.photoUrl || "/placeholder.svg"} 
                          alt={member.name || 'Author'} 
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl sm:text-3xl font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full border-2 border-background flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <UsersIcon className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="font-semibold text-base sm:text-lg group-hover:text-primary transition-colors">
                        {member.name}
                      </p>
                      {member.role && (
                        <Badge variant="secondary" className="text-xs sm:text-sm">
                          {member.role}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
