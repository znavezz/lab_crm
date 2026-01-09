'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/components/form-field'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeftIcon } from 'lucide-react'
import {
  GetMemberDocument,
  UpdateMemberDocument,
  GetMemberQuery,
  GetMemberQueryVariables,
  UpdateMemberMutation,
  Member_Set_Input,
} from '@/generated/graphql/graphql'

type FormEvent = React.FormEvent<HTMLFormElement>

export default function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    rank: '',
    role: '',
    status: '',
    scholarship: '',
  })

  const { data, loading, error } = useQuery<GetMemberQuery, GetMemberQueryVariables>(GetMemberDocument, {
    variables: { id },
  })

  const [updateMember, { loading: updating }] = useMutation<UpdateMemberMutation>(UpdateMemberDocument, {
    onCompleted: () => {
      toast.success('Member updated successfully')
      router.push(`/members/${id}`)
    },
    onError: (error) => {
      toast.error(`Failed to update member: ${error.message}`)
    },
  })

  // Initialize form data when member data is loaded
  const member = data?.Member
  useEffect(() => {
    if (member) {
      // Initialize form from fetched member data
      // This is a legitimate use case: syncing external data (GraphQL) to component state
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: member.name || '',
        rank: member.rank || '',
        role: member.role || '',
        status: member.status || '',
        scholarship: member.scholarship?.toString() || '',
      })
    }
  }, [member])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    updateMember({
      variables: {
        id,
        set: {
          name: formData.name || undefined,
          rank: formData.rank || undefined,
          role: formData.role || undefined,
          status: formData.status || undefined,
          scholarship: formData.scholarship ? parseInt(formData.scholarship, 10) : undefined,
        } as Member_Set_Input,
      },
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (error || !data?.Member) {
    return (
      <div className="space-y-6">
        <Link href={`/members/${id}`}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Member
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {error ? `Error loading member: ${error.message}` : 'Member not found'}
          </p>
        </div>
      </div>
    )
  }

  const rankOptions = [
    { value: 'PROFESSOR', label: 'Professor' },
    { value: 'PhD', label: 'PhD' },
    { value: 'POSTDOC', label: 'Postdoc' },
    { value: 'MSc', label: 'Master of Science' },
    { value: 'BSc', label: 'Bachelor of Science' },
    { value: 'Mr', label: 'Mr' },
    { value: 'Mrs', label: 'Mrs' },
  ]

  const roleOptions = [
    { value: 'PI', label: 'Principal Investigator' },
    { value: 'STUDENT', label: 'Student' },
    { value: 'LAB_MANAGER', label: 'Lab Manager' },
    { value: 'RESEARCHER', label: 'Researcher' },
    { value: 'ADVISOR', label: 'Advisor' },
    { value: 'INTERN', label: 'Intern' },
    { value: 'CONTRACTOR', label: 'Contractor' },
    { value: 'GUEST', label: 'Guest' },
    { value: 'ALUMNI', label: 'Alumni' },
    { value: 'OTHER', label: 'Other' },
  ]

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'ALUMNI', label: 'Alumni' },
  ]

  return (
    <div className="space-y-6">
      <Link href={`/members/${id}`}>
        <Button variant="ghost" className="gap-2">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Member
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Edit Member</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              label="Full Name"
              id="name"
              type="text"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              placeholder="Dr. Jane Smith"
              required
            />

            <FormField
              label="Rank"
              id="rank"
              type="select"
              value={formData.rank}
              onChange={(value) => setFormData({ ...formData, rank: value })}
              options={rankOptions}
              placeholder="Select rank"
            />

            <FormField
              label="Role"
              id="role"
              type="select"
              value={formData.role}
              onChange={(value) => setFormData({ ...formData, role: value })}
              options={roleOptions}
              placeholder="Select role"
            />

            <FormField
              label="Status"
              id="status"
              type="select"
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value })}
              options={statusOptions}
              placeholder="Select status"
            />

            <FormField
              label="Scholarship"
              id="scholarship"
              type="number"
              value={formData.scholarship}
              onChange={(value) => setFormData({ ...formData, scholarship: value })}
              placeholder="0"
              helperText="Enter scholarship amount in dollars"
            />

            <div className="flex gap-4">
              <Button type="submit" disabled={updating}>
                {updating ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/members/${id}`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
