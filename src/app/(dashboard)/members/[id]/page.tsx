'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
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
import { Input } from '@/components/ui/input'
import { ArrowLeftIcon, CalendarIcon, GraduationCapIcon, DollarSignIcon, BookIcon, CameraIcon, FolderIcon, MicroscopeIcon } from 'lucide-react'
import {
  GetMemberDocument,
  UpdateMemberPhotoDocument,
  GetMemberQuery,
  GetMemberQueryVariables,
  UpdateMemberPhotoMutation,
} from '@/generated/graphql/graphql'

const roleColors: Record<string, string> = {
  PI: 'bg-primary text-primary-foreground',
  STUDENT: 'bg-chart-2 text-white',
  RESEARCHER: 'bg-chart-3 text-white',
  LAB_MANAGER: 'bg-chart-4 text-white',
  ADVISOR: 'bg-accent text-accent-foreground',
  INTERN: 'bg-secondary text-secondary-foreground',
  CONTRACTOR: 'bg-muted text-muted-foreground',
  GUEST: 'bg-muted text-muted-foreground',
  ALUMNI: 'bg-muted text-muted-foreground',
  OTHER: 'bg-muted text-muted-foreground',
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-500 text-white',
  INACTIVE: 'bg-muted text-muted-foreground',
  ALUMNI: 'bg-secondary text-secondary-foreground',
}

// Type aliases from generated types
type MemberType = NonNullable<GetMemberQuery['Member']>
type ProjectMember = MemberType['ProjectMembers'][number]
type PublicationMember = MemberType['PublicationMembers'][number]
type AcademicInfo = MemberType['AcademicInfos'][number]
type Project = ProjectMember['Project']
type Publication = PublicationMember['Publication']
type Equipment = MemberType['Equipment'][number]

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  
  const { data, loading, error, refetch } = useQuery<GetMemberQuery, GetMemberQueryVariables>(GetMemberDocument, {
    variables: { id },
  })

  const [updateMemberPhoto, { loading: updatingPhoto }] = useMutation<UpdateMemberPhotoMutation>(UpdateMemberPhotoDocument, {
    onCompleted: () => {
      toast.success('Profile photo updated successfully')
      setIsPhotoDialogOpen(false)
      setSelectedFile(null)
      setPreview(null)
      refetch()
    },
    onError: (error) => {
      toast.error(`Failed to update photo: ${error.message}`)
      setUploading(false)
    },
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }
      setSelectedFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      // If no file selected and no current photo, do nothing
      if (!transformedMember.photoUrl) {
        setIsPhotoDialogOpen(false)
        return
      }
      // If no file selected but there's a current photo, remove it
      updateMemberPhoto({
        variables: {
          id,
          photoUrl: null,
        },
      })
      return
    }

    setUploading(true)
    try {
      // Upload file
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload file')
      }

      const result = await response.json()
      
      // Update member with new photo URL
      updateMemberPhoto({
        variables: {
          id,
          photoUrl: result.url,
        },
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload photo')
      setUploading(false)
    }
  }

  const handleRemovePhoto = () => {
    setSelectedFile(null)
    setPreview(null)
    updateMemberPhoto({
      variables: {
        id,
        input: {
          photoUrl: null,
        },
      },
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Link href="/members">
          <Button variant="ghost" className="gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Members
          </Button>
        </Link>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <Skeleton className="h-32 w-32 mx-auto mb-4 rounded-full" />
              <Skeleton className="h-8 w-48 mx-auto mb-2" />
              <Skeleton className="h-6 w-32 mx-auto" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link href="/members">
          <Button variant="ghost" className="gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Members
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Error loading member: {error.message}
          </p>
        </div>
      </div>
    )
  }

  if (!data || !data.Member) {
    return (
      <div className="space-y-6">
        <Link href="/members">
          <Button variant="ghost" className="gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Members
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Member not found</p>
        </div>
      </div>
    )
  }

  const member = data.Member
  
  // Transform Hasura response to match expected format
  const transformedMember = {
    ...member,
    projects: member?.ProjectMembers?.map((pm: ProjectMember) => pm.Project) || [],
    publications: member?.PublicationMembers?.map((mp: PublicationMember) => mp.Publication) || [],
    academicInfo: member?.AcademicInfos || [],
  }

  return (
    <div className="space-y-6">
      <Link href="/members">
        <Button variant="ghost" className="gap-2">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Members
        </Button>
      </Link>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="relative inline-block">
              <Avatar className="h-32 w-32 mx-auto mb-4">
                <AvatarImage src={transformedMember.photoUrl || "/placeholder.svg"} alt={transformedMember.name || 'Member'} />
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                  {transformedMember.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'M'}
                </AvatarFallback>
              </Avatar>
              <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full h-10 w-10 shadow-lg"
                    onClick={() => {
                      setSelectedFile(null)
                      setPreview(null)
                    }}
                  >
                    <CameraIcon className="h-4 w-4" />
                    <span className="sr-only">Edit photo</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handlePhotoSubmit}>
                    <DialogHeader>
                      <DialogTitle>Edit Profile Photo</DialogTitle>
                      <DialogDescription>
                        Upload a profile photo. Supported formats: JPG, PNG, GIF, WebP (max 5MB)
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="photoFile">Select Photo</Label>
                        <Input
                          id="photoFile"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={handleFileSelect}
                          className="cursor-pointer"
                        />
                        <p className="text-xs text-muted-foreground">
                          Select an image file from your computer. Maximum file size: 5MB
                        </p>
                      </div>
                      
                      {(preview || transformedMember.photoUrl) && (
                        <div className="grid gap-2">
                          <Label>{preview ? 'Preview' : 'Current Photo'}</Label>
                          <div className="flex items-center gap-4">
                            <Avatar className="h-24 w-24">
                              <AvatarImage src={preview || transformedMember.photoUrl || undefined} alt="Photo preview" />
                              <AvatarFallback>Photo</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              {preview && (
                                <p className="text-sm font-medium text-green-600">New photo selected</p>
                              )}
                              {transformedMember.photoUrl && !preview && (
                                <div className="text-sm text-muted-foreground">
                                  <p className="font-medium">Current photo</p>
                                  <p className="break-all text-xs">{transformedMember.photoUrl}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                      {transformedMember.photoUrl && (
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={handleRemovePhoto}
                          disabled={uploading || updatingPhoto}
                          className="w-full sm:w-auto"
                        >
                          Remove Photo
                        </Button>
                      )}
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsPhotoDialogOpen(false)
                            setSelectedFile(null)
                            setPreview(null)
                          }}
                          disabled={uploading || updatingPhoto}
                          className="flex-1 sm:flex-initial"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={uploading || updatingPhoto || !selectedFile}
                          className="flex-1 sm:flex-initial"
                        >
                          {uploading || updatingPhoto ? 'Uploading...' : selectedFile ? 'Upload Photo' : 'Update'}
                        </Button>
                      </div>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <CardTitle className="text-2xl">{transformedMember.name}</CardTitle>
            <div className="flex justify-center gap-2 mt-2">
              {transformedMember.role && (
                <Badge className={roleColors[transformedMember.role] || 'bg-muted text-muted-foreground'}>
                  {transformedMember.role}
                </Badge>
              )}
              {transformedMember.status && (
                <Badge className={statusColors[transformedMember.status] || 'bg-muted text-muted-foreground'}>
                  {transformedMember.status}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {transformedMember.rank && (
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCapIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{transformedMember.rank}</span>
                </div>
              )}
              {transformedMember.scholarship && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                  <span>Scholarship: ${transformedMember.scholarship.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>Joined {new Date(transformedMember.joinedDate || transformedMember.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
              </div>
              {transformedMember.publications && transformedMember.publications.length >= 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <BookIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{transformedMember.publications.length} Publication{transformedMember.publications.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCapIcon className="h-5 w-5" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transformedMember.academicInfo && transformedMember.academicInfo.length > 0 ? (
                <ul className="space-y-2">
                  {transformedMember.academicInfo.map((edu: AcademicInfo) => (
                    <li key={edu.id} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>
                        {edu.degree}
                        {edu.field && ` in ${edu.field}`}
                        {edu.institution && ` - ${edu.institution}`}
                        {edu.graduationYear && ` (${edu.graduationYear})`}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No education information available.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderIcon className="h-5 w-5" />
                Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transformedMember.projects && transformedMember.projects.length > 0 ? (
                <ul className="space-y-2">
                  {transformedMember.projects.map((project: Project) => (
                    <li key={project.id} className="text-sm">
                      <Link href={`/projects/${project.id}`} className="font-medium text-primary hover:underline">
                        {project.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No projects assigned.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookIcon className="h-5 w-5" />
                Publications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transformedMember.publications && transformedMember.publications.length > 0 ? (
                <ul className="space-y-2">
                  {transformedMember.publications.map((publication: Publication) => (
                    <li key={publication.id} className="text-sm">
                      <Link href={`/publications/${publication.id}`} className="font-medium text-primary hover:underline">
                        {publication.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No publications available.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MicroscopeIcon className="h-5 w-5" />
                Equipment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transformedMember.Equipment && transformedMember.Equipment.length > 0 ? (
                <ul className="space-y-3">
                  {transformedMember.Equipment.map((equipment: Equipment) => (
                    <li key={equipment.id} className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <Link href={`/equipment/${equipment.id}`} className="font-medium text-primary hover:underline">
                          {equipment.name}
                        </Link>
                        {equipment.status && (
                          <Badge 
                            variant="outline" 
                            className="text-xs"
                          >
                            {equipment.status.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                      {equipment.description && (
                        <p className="text-xs text-muted-foreground">{equipment.description}</p>
                      )}
                      {equipment.serialNumber && (
                        <p className="text-xs text-muted-foreground">Serial: {equipment.serialNumber}</p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No equipment assigned.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
