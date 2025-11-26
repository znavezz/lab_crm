/**
 * Centralized GraphQL Query Types
 * 
 * This file contains type definitions for GraphQL query responses.
 * These types are the single source of truth for frontend components.
 * 
 * Import enums from generated Prisma types to maintain consistency.
 */

import { MemberRank, MemberStatus, MemberRole, EquipmentStatus } from '@/generated/prisma'

// Re-export enums for convenience
export { MemberRank, MemberStatus, MemberRole, EquipmentStatus }

// ============================================================================
// Base Entity Types (matching GraphQL schema)
// ============================================================================

export interface Member {
  id: string
  name: string
  rank?: MemberRank | null
  status?: MemberStatus | null
  role?: MemberRole | null
  scholarship?: number | null
  photoUrl?: string | null
  joinedDate?: string | null
}

export interface Project {
  id: string
  title: string
  description?: string | null
  startDate?: string | null
  endDate?: string | null
  totalInvestment?: number
  createdAt?: string
  members?: Member[]
  grants?: Grant[]
  expenses?: Expense[]
  equipments?: Equipment[]
  publications?: Publication[]
  collaborators?: Collaborator[]
  documents?: Document[]
  protocols?: Protocol[]
  events?: Event[]
}

export interface Equipment {
  id: string
  name: string
  description?: string | null
  serialNumber?: string | null
  status: EquipmentStatus
  projectId?: string | null
  project?: Project | null
  memberId?: string | null
  member?: Member | null
  createdAt?: string
  bookings?: Booking[]
  events?: Event[]
}

export interface Booking {
  id: string
  startTime: string
  endTime: string
  purpose?: string | null
  equipmentId: string
  equipment?: Equipment
  memberId: string
  member: Member
  projectId?: string | null
  project?: Project | null
  eventId?: string | null
  event?: Event | null
  createdAt?: string
}

export interface Event {
  id: string
  title: string
  description?: string | null
  date: string
  location?: string | null
  attendees?: Member[]
  projects?: Project[]
  equipments?: Equipment[]
  bookings?: Booking[]
  expenses?: Expense[]
  createdAt?: string
}

export interface Grant {
  id: string
  name: string
  budget: number
  startDate: string
  endDate: string
  totalSpent: number
  remainingBudget: number
  projects?: Project[]
  expenses?: Expense[]
  createdAt?: string
}

export interface Publication {
  id: string
  title: string
  published?: string | null
  doi?: string | null
  url?: string | null
  members?: Member[]
  projects?: Project[]
  createdAt?: string
}

export interface Collaborator {
  id: string
  name: string
  organization?: string | null
  projects?: Project[]
  createdAt?: string
}

export interface Document {
  id: string
  filename: string
  url: string
  projectId?: string | null
  project?: Project | null
  memberId?: string | null
  member?: Member | null
  createdAt?: string
}

export interface Protocol {
  id: string
  title: string
  description?: string | null
  category: ProtocolCategory
  version: string
  estimatedTime?: string | null
  difficulty: ProtocolDifficulty
  tags?: string | null
  downloads: number
  authorId?: string | null
  author?: Member | null
  projectId?: string | null
  project?: Project | null
  documentId?: string | null
  document?: Document | null
  materials?: string | null
  equipment?: string | null
  steps?: string | null
  safetyNotes?: string | null
  versionHistory?: string | null
  createdAt?: string
}

export interface Expense {
  id: string
  description: string
  amount: number
  date: string
  projectId?: string | null
  project?: Project | null
  grantId?: string | null
  grant?: Grant | null
  eventId?: string | null
  event?: Event | null
}

export interface AcademicInfo {
  id: string
  degree: string
  field?: string | null
  institution?: string | null
  graduationYear?: number | null
  memberId: string
  member: Member
  createdAt?: string
}

export interface User {
  id: string
  name: string
  email: string
  emailVerified?: string | null
  image?: string | null
  memberId?: string | null
  member?: Member | null
  createdAt?: string
}

// ============================================================================
// Enums
// ============================================================================

export enum ProtocolCategory {
  WET_LAB = 'WET_LAB',
  COMPUTATIONAL = 'COMPUTATIONAL',
  SAFETY = 'SAFETY',
  GENERAL = 'GENERAL',
}

export enum ProtocolDifficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

// ============================================================================
// Utility Status Types
// ============================================================================

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED'
export type GrantStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED'
export type StatusFilter = 'ALL' | ProjectStatus | GrantStatus

// ============================================================================
// Query Response Types
// ============================================================================

export interface MembersQueryData {
  members: Member[]
}

export interface MemberQueryData {
  member: Member | null
}

export interface ProjectsQueryData {
  projects: Project[]
}

export interface ProjectQueryData {
  project: Project | null
}

export interface EquipmentsQueryData {
  equipments: Equipment[]
  bookings?: Booking[]
}

export interface EquipmentQueryData {
  equipment: Equipment | null
}

export interface BookingsQueryData {
  bookings: Booking[]
}

export interface BookingQueryData {
  booking: Booking | null
}

export interface EventsQueryData {
  events: Event[]
}

export interface EventQueryData {
  event: Event | null
}

export interface GrantsQueryData {
  grants: Grant[]
}

export interface GrantQueryData {
  grant: Grant | null
}

export interface PublicationsQueryData {
  publications: Publication[]
}

export interface PublicationQueryData {
  publication: Publication | null
}

export interface CollaboratorsQueryData {
  collaborators: Collaborator[]
}

export interface CollaboratorQueryData {
  collaborator: Collaborator | null
}

export interface DocumentsQueryData {
  documents: Document[]
}

export interface DocumentQueryData {
  document: Document | null
}

export interface ProtocolsQueryData {
  protocols: Protocol[]
}

export interface ProtocolQueryData {
  protocol: Protocol | null
}

export interface ExpensesQueryData {
  expenses: Expense[]
}

export interface ExpenseQueryData {
  expense: Expense | null
}

// ============================================================================
// Specialized Query Types (for specific pages/components)
// ============================================================================

/**
 * Booking data query - used for creating bookings with dropdowns
 */
export interface BookingDataQuery {
  members?: Member[]
  projects?: Project[]
  events?: Event[]
}

/**
 * Analytics query data - comprehensive data for analytics dashboard
 */
export interface AnalyticsQueryData {
  publications: Publication[]
  projects: Project[]
  grants: Grant[]
  equipments: Equipment[]
  members: Member[]
  protocols: Protocol[]
}

/**
 * Project with computed status
 */
export interface ProjectWithStatus extends Project {
  status: ProjectStatus
  progress: number
}

/**
 * Grant with computed status
 */
export interface GrantWithStatus extends Grant {
  status: GrantStatus
  progress: number
}

// ============================================================================
// Mutation Response Types
// ============================================================================

export interface CreateMemberMutationData {
  createMember: Member
}

export interface UpdateMemberMutationData {
  updateMember: Member
}

export interface DeleteMemberMutationData {
  deleteMember: boolean
}

export interface CreateProjectMutationData {
  createProject: Project
}

export interface UpdateProjectMutationData {
  updateProject: Project
}

export interface DeleteProjectMutationData {
  deleteProject: boolean
}

export interface CreateEquipmentMutationData {
  createEquipment: Equipment
}

export interface UpdateEquipmentMutationData {
  updateEquipment: Equipment
}

export interface DeleteEquipmentMutationData {
  deleteEquipment: boolean
}

export interface CreateBookingMutationData {
  createBooking: Booking
}

export interface UpdateBookingMutationData {
  updateBooking: Booking
}

export interface DeleteBookingMutationData {
  deleteBooking: boolean
}

export interface CreateEventMutationData {
  createEvent: Event
}

export interface UpdateEventMutationData {
  updateEvent: Event
}

export interface DeleteEventMutationData {
  deleteEvent: boolean
}

export interface CreateGrantMutationData {
  createGrant: Grant
}

export interface UpdateGrantMutationData {
  updateGrant: Grant
}

export interface DeleteGrantMutationData {
  deleteGrant: boolean
}

export interface CreatePublicationMutationData {
  createPublication: Publication
}

export interface UpdatePublicationMutationData {
  updatePublication: Publication
}

export interface DeletePublicationMutationData {
  deletePublication: boolean
}

export interface CreateProtocolMutationData {
  createProtocol: Protocol
}

export interface UpdateProtocolMutationData {
  updateProtocol: Protocol
}

export interface DeleteProtocolMutationData {
  deleteProtocol: boolean
}

