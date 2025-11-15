import { MemberRank } from '@/generated/prisma';
import { MemberStatus } from '@/generated/prisma';
import { MemberRole } from '@/generated/prisma';
import { EquipmentStatus } from '@/generated/prisma';
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { Member, Project, Equipment, Booking, Event, Grant, Publication, Collaborator, Document, Expense, NoteTask, AcademicInfo, User } from '@/generated/prisma';
import { GraphQLContext } from '@/graphql/context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type EnumResolverSignature<T, AllowedValues = any> = { [key in keyof T]?: AllowedValues };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
};

export type AcademicInfo = {
  __typename?: 'AcademicInfo';
  createdAt: Scalars['DateTime']['output'];
  degree: Scalars['String']['output'];
  field?: Maybe<Scalars['String']['output']>;
  graduationYear?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  institution?: Maybe<Scalars['String']['output']>;
  member: Member;
  memberId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Booking = {
  __typename?: 'Booking';
  createdAt: Scalars['DateTime']['output'];
  endTime: Scalars['DateTime']['output'];
  equipment: Equipment;
  equipmentId: Scalars['String']['output'];
  event?: Maybe<Event>;
  eventId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  member: Member;
  memberId: Scalars['String']['output'];
  project?: Maybe<Project>;
  projectId?: Maybe<Scalars['String']['output']>;
  purpose?: Maybe<Scalars['String']['output']>;
  startTime: Scalars['DateTime']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Collaborator = {
  __typename?: 'Collaborator';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  noteTasks: Array<NoteTask>;
  organization?: Maybe<Scalars['String']['output']>;
  projects: Array<Project>;
  updatedAt: Scalars['DateTime']['output'];
};

export type CreateAcademicInfoInput = {
  degree: Scalars['String']['input'];
  field?: InputMaybe<Scalars['String']['input']>;
  graduationYear?: InputMaybe<Scalars['Int']['input']>;
  institution?: InputMaybe<Scalars['String']['input']>;
  memberId: Scalars['String']['input'];
};

export type CreateBookingInput = {
  endTime: Scalars['DateTime']['input'];
  equipmentId: Scalars['String']['input'];
  eventId?: InputMaybe<Scalars['String']['input']>;
  memberId: Scalars['String']['input'];
  projectId?: InputMaybe<Scalars['String']['input']>;
  purpose?: InputMaybe<Scalars['String']['input']>;
  startTime: Scalars['DateTime']['input'];
};

export type CreateCollaboratorInput = {
  name: Scalars['String']['input'];
  organization?: InputMaybe<Scalars['String']['input']>;
};

export type CreateDocumentInput = {
  filename: Scalars['String']['input'];
  memberId?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['String']['input']>;
  url: Scalars['String']['input'];
};

export type CreateEquipmentInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  memberId?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  projectId?: InputMaybe<Scalars['String']['input']>;
  serialNumber?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<EquipmentStatus>;
};

export type CreateEventInput = {
  date: Scalars['DateTime']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type CreateExpenseInput = {
  amount: Scalars['Float']['input'];
  date?: InputMaybe<Scalars['DateTime']['input']>;
  description: Scalars['String']['input'];
  eventId?: InputMaybe<Scalars['String']['input']>;
  grantId?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['String']['input']>;
};

export type CreateGrantInput = {
  budget: Scalars['Float']['input'];
  deadline: Scalars['DateTime']['input'];
  name: Scalars['String']['input'];
};

export type CreateMemberInput = {
  name: Scalars['String']['input'];
  rank?: InputMaybe<MemberRank>;
  role?: InputMaybe<MemberRole>;
  scholarship?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<MemberStatus>;
};

export type CreateNoteTaskInput = {
  collaboratorId?: InputMaybe<Scalars['String']['input']>;
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  content: Scalars['String']['input'];
  documentId?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['DateTime']['input']>;
  equipmentId?: InputMaybe<Scalars['String']['input']>;
  eventId?: InputMaybe<Scalars['String']['input']>;
  expenseId?: InputMaybe<Scalars['String']['input']>;
  grantId?: InputMaybe<Scalars['String']['input']>;
  memberId?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['String']['input']>;
  publicationId?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type CreateProjectInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  title: Scalars['String']['input'];
};

export type CreatePublicationInput = {
  doi?: InputMaybe<Scalars['String']['input']>;
  published?: InputMaybe<Scalars['DateTime']['input']>;
  title: Scalars['String']['input'];
  url?: InputMaybe<Scalars['String']['input']>;
};

export type Document = {
  __typename?: 'Document';
  createdAt: Scalars['DateTime']['output'];
  filename: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  member?: Maybe<Member>;
  memberId?: Maybe<Scalars['String']['output']>;
  noteTasks: Array<NoteTask>;
  project?: Maybe<Project>;
  projectId?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  url: Scalars['String']['output'];
};

export type Equipment = {
  __typename?: 'Equipment';
  bookings: Array<Booking>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  events: Array<Event>;
  id: Scalars['ID']['output'];
  member?: Maybe<Member>;
  memberId?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  noteTasks: Array<NoteTask>;
  project?: Maybe<Project>;
  projectId?: Maybe<Scalars['String']['output']>;
  serialNumber?: Maybe<Scalars['String']['output']>;
  status: EquipmentStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export { EquipmentStatus };

export type Event = {
  __typename?: 'Event';
  attendees: Array<Member>;
  bookings: Array<Booking>;
  createdAt: Scalars['DateTime']['output'];
  date: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  equipments: Array<Equipment>;
  expenses: Array<Expense>;
  id: Scalars['ID']['output'];
  location?: Maybe<Scalars['String']['output']>;
  projects: Array<Project>;
  tasks: Array<NoteTask>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Expense = {
  __typename?: 'Expense';
  amount: Scalars['Float']['output'];
  date: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  event?: Maybe<Event>;
  eventId?: Maybe<Scalars['String']['output']>;
  grant?: Maybe<Grant>;
  grantId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  noteTasks: Array<NoteTask>;
  project?: Maybe<Project>;
  projectId?: Maybe<Scalars['String']['output']>;
};

export type Grant = {
  __typename?: 'Grant';
  budget: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  deadline: Scalars['DateTime']['output'];
  expenses: Array<Expense>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  noteTasks: Array<NoteTask>;
  projects: Array<Project>;
  remainingBudget: Scalars['Float']['output'];
  totalSpent: Scalars['Float']['output'];
};

export type Member = {
  __typename?: 'Member';
  academicInfo: Array<AcademicInfo>;
  bookings: Array<Booking>;
  createdAt: Scalars['DateTime']['output'];
  documents: Array<Document>;
  equipments: Array<Equipment>;
  events: Array<Event>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  noteTasks: Array<NoteTask>;
  projects: Array<Project>;
  publications: Array<Publication>;
  rank?: Maybe<MemberRank>;
  role?: Maybe<MemberRole>;
  scholarship?: Maybe<Scalars['Int']['output']>;
  status?: Maybe<MemberStatus>;
  updatedAt: Scalars['DateTime']['output'];
  user?: Maybe<User>;
};

export { MemberRank };

export { MemberRole };

export { MemberStatus };

export type Mutation = {
  __typename?: 'Mutation';
  addCollaboratorToProject: Project;
  addEquipmentToEvent: Event;
  addMemberToEvent: Event;
  addMemberToProject: Project;
  addMemberToPublication: Publication;
  addProjectToEvent: Event;
  addProjectToGrant: Grant;
  addProjectToPublication: Publication;
  assignEquipmentToMember: Equipment;
  createAcademicInfo: AcademicInfo;
  createBooking: Booking;
  createCollaborator: Collaborator;
  createDocument: Document;
  createEquipment: Equipment;
  createEvent: Event;
  createExpense: Expense;
  createGrant: Grant;
  createMember: Member;
  createNoteTask: NoteTask;
  createProject: Project;
  createPublication: Publication;
  deleteAcademicInfo: Scalars['Boolean']['output'];
  deleteBooking: Scalars['Boolean']['output'];
  deleteCollaborator: Scalars['Boolean']['output'];
  deleteDocument: Scalars['Boolean']['output'];
  deleteEquipment: Scalars['Boolean']['output'];
  deleteEvent: Scalars['Boolean']['output'];
  deleteExpense: Scalars['Boolean']['output'];
  deleteGrant: Scalars['Boolean']['output'];
  deleteMember: Scalars['Boolean']['output'];
  deleteNoteTask: Scalars['Boolean']['output'];
  deleteProject: Scalars['Boolean']['output'];
  deletePublication: Scalars['Boolean']['output'];
  removeCollaboratorFromProject: Project;
  removeEquipmentFromEvent: Event;
  removeMemberFromEvent: Event;
  removeMemberFromProject: Project;
  removeMemberFromPublication: Publication;
  removeProjectFromEvent: Event;
  removeProjectFromGrant: Grant;
  removeProjectFromPublication: Publication;
  unassignEquipmentFromMember: Equipment;
  updateAcademicInfo: AcademicInfo;
  updateBooking: Booking;
  updateCollaborator: Collaborator;
  updateDocument: Document;
  updateEquipment: Equipment;
  updateEvent: Event;
  updateExpense: Expense;
  updateGrant: Grant;
  updateMember: Member;
  updateNoteTask: NoteTask;
  updateProject: Project;
  updatePublication: Publication;
  updateUser: User;
};


export type MutationAddCollaboratorToProjectArgs = {
  collaboratorId: Scalars['ID']['input'];
  projectId: Scalars['ID']['input'];
};


export type MutationAddEquipmentToEventArgs = {
  equipmentId: Scalars['ID']['input'];
  eventId: Scalars['ID']['input'];
};


export type MutationAddMemberToEventArgs = {
  eventId: Scalars['ID']['input'];
  memberId: Scalars['ID']['input'];
};


export type MutationAddMemberToProjectArgs = {
  memberId: Scalars['ID']['input'];
  projectId: Scalars['ID']['input'];
};


export type MutationAddMemberToPublicationArgs = {
  memberId: Scalars['ID']['input'];
  publicationId: Scalars['ID']['input'];
};


export type MutationAddProjectToEventArgs = {
  eventId: Scalars['ID']['input'];
  projectId: Scalars['ID']['input'];
};


export type MutationAddProjectToGrantArgs = {
  grantId: Scalars['ID']['input'];
  projectId: Scalars['ID']['input'];
};


export type MutationAddProjectToPublicationArgs = {
  projectId: Scalars['ID']['input'];
  publicationId: Scalars['ID']['input'];
};


export type MutationAssignEquipmentToMemberArgs = {
  equipmentId: Scalars['ID']['input'];
  memberId: Scalars['ID']['input'];
};


export type MutationCreateAcademicInfoArgs = {
  input: CreateAcademicInfoInput;
};


export type MutationCreateBookingArgs = {
  input: CreateBookingInput;
};


export type MutationCreateCollaboratorArgs = {
  input: CreateCollaboratorInput;
};


export type MutationCreateDocumentArgs = {
  input: CreateDocumentInput;
};


export type MutationCreateEquipmentArgs = {
  input: CreateEquipmentInput;
};


export type MutationCreateEventArgs = {
  input: CreateEventInput;
};


export type MutationCreateExpenseArgs = {
  input: CreateExpenseInput;
};


export type MutationCreateGrantArgs = {
  input: CreateGrantInput;
};


export type MutationCreateMemberArgs = {
  input: CreateMemberInput;
};


export type MutationCreateNoteTaskArgs = {
  input: CreateNoteTaskInput;
};


export type MutationCreateProjectArgs = {
  input: CreateProjectInput;
};


export type MutationCreatePublicationArgs = {
  input: CreatePublicationInput;
};


export type MutationDeleteAcademicInfoArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteBookingArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteCollaboratorArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteDocumentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteEquipmentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteEventArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteExpenseArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteGrantArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteMemberArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteNoteTaskArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteProjectArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeletePublicationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRemoveCollaboratorFromProjectArgs = {
  collaboratorId: Scalars['ID']['input'];
  projectId: Scalars['ID']['input'];
};


export type MutationRemoveEquipmentFromEventArgs = {
  equipmentId: Scalars['ID']['input'];
  eventId: Scalars['ID']['input'];
};


export type MutationRemoveMemberFromEventArgs = {
  eventId: Scalars['ID']['input'];
  memberId: Scalars['ID']['input'];
};


export type MutationRemoveMemberFromProjectArgs = {
  memberId: Scalars['ID']['input'];
  projectId: Scalars['ID']['input'];
};


export type MutationRemoveMemberFromPublicationArgs = {
  memberId: Scalars['ID']['input'];
  publicationId: Scalars['ID']['input'];
};


export type MutationRemoveProjectFromEventArgs = {
  eventId: Scalars['ID']['input'];
  projectId: Scalars['ID']['input'];
};


export type MutationRemoveProjectFromGrantArgs = {
  grantId: Scalars['ID']['input'];
  projectId: Scalars['ID']['input'];
};


export type MutationRemoveProjectFromPublicationArgs = {
  projectId: Scalars['ID']['input'];
  publicationId: Scalars['ID']['input'];
};


export type MutationUnassignEquipmentFromMemberArgs = {
  equipmentId: Scalars['ID']['input'];
};


export type MutationUpdateAcademicInfoArgs = {
  id: Scalars['ID']['input'];
  input: UpdateAcademicInfoInput;
};


export type MutationUpdateBookingArgs = {
  id: Scalars['ID']['input'];
  input: UpdateBookingInput;
};


export type MutationUpdateCollaboratorArgs = {
  id: Scalars['ID']['input'];
  input: UpdateCollaboratorInput;
};


export type MutationUpdateDocumentArgs = {
  id: Scalars['ID']['input'];
  input: UpdateDocumentInput;
};


export type MutationUpdateEquipmentArgs = {
  id: Scalars['ID']['input'];
  input: UpdateEquipmentInput;
};


export type MutationUpdateEventArgs = {
  id: Scalars['ID']['input'];
  input: UpdateEventInput;
};


export type MutationUpdateExpenseArgs = {
  id: Scalars['ID']['input'];
  input: UpdateExpenseInput;
};


export type MutationUpdateGrantArgs = {
  id: Scalars['ID']['input'];
  input: UpdateGrantInput;
};


export type MutationUpdateMemberArgs = {
  id: Scalars['ID']['input'];
  input: UpdateMemberInput;
};


export type MutationUpdateNoteTaskArgs = {
  id: Scalars['ID']['input'];
  input: UpdateNoteTaskInput;
};


export type MutationUpdateProjectArgs = {
  id: Scalars['ID']['input'];
  input: UpdateProjectInput;
};


export type MutationUpdatePublicationArgs = {
  id: Scalars['ID']['input'];
  input: UpdatePublicationInput;
};


export type MutationUpdateUserArgs = {
  id: Scalars['ID']['input'];
  input: UpdateUserInput;
};

export type NoteTask = {
  __typename?: 'NoteTask';
  collaborator?: Maybe<Collaborator>;
  collaboratorId?: Maybe<Scalars['String']['output']>;
  completed: Scalars['Boolean']['output'];
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  document?: Maybe<Document>;
  documentId?: Maybe<Scalars['String']['output']>;
  dueDate?: Maybe<Scalars['DateTime']['output']>;
  equipment?: Maybe<Equipment>;
  equipmentId?: Maybe<Scalars['String']['output']>;
  event?: Maybe<Event>;
  eventId?: Maybe<Scalars['String']['output']>;
  expense?: Maybe<Expense>;
  expenseId?: Maybe<Scalars['String']['output']>;
  grant?: Maybe<Grant>;
  grantId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  member?: Maybe<Member>;
  memberId?: Maybe<Scalars['String']['output']>;
  project?: Maybe<Project>;
  projectId?: Maybe<Scalars['String']['output']>;
  publication?: Maybe<Publication>;
  publicationId?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type Project = {
  __typename?: 'Project';
  bookings: Array<Booking>;
  collaborators: Array<Collaborator>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  documents: Array<Document>;
  endDate?: Maybe<Scalars['DateTime']['output']>;
  equipments: Array<Equipment>;
  events: Array<Event>;
  expenses: Array<Expense>;
  grants: Array<Grant>;
  id: Scalars['ID']['output'];
  members: Array<Member>;
  noteTasks: Array<NoteTask>;
  publications: Array<Publication>;
  startDate?: Maybe<Scalars['DateTime']['output']>;
  title: Scalars['String']['output'];
  totalInvestment: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Publication = {
  __typename?: 'Publication';
  createdAt: Scalars['DateTime']['output'];
  doi?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  members: Array<Member>;
  noteTasks: Array<NoteTask>;
  projects: Array<Project>;
  published?: Maybe<Scalars['DateTime']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  url?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  academicInfo?: Maybe<AcademicInfo>;
  academicInfos: Array<AcademicInfo>;
  booking?: Maybe<Booking>;
  bookings: Array<Booking>;
  collaborator?: Maybe<Collaborator>;
  collaborators: Array<Collaborator>;
  currentUser?: Maybe<User>;
  document?: Maybe<Document>;
  documents: Array<Document>;
  equipment?: Maybe<Equipment>;
  equipments: Array<Equipment>;
  event?: Maybe<Event>;
  events: Array<Event>;
  expense?: Maybe<Expense>;
  expenses: Array<Expense>;
  grant?: Maybe<Grant>;
  grants: Array<Grant>;
  member?: Maybe<Member>;
  members: Array<Member>;
  noteTask?: Maybe<NoteTask>;
  noteTasks: Array<NoteTask>;
  project?: Maybe<Project>;
  projects: Array<Project>;
  publication?: Maybe<Publication>;
  publications: Array<Publication>;
  user?: Maybe<User>;
  users: Array<User>;
};


export type QueryAcademicInfoArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBookingArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCollaboratorArgs = {
  id: Scalars['ID']['input'];
};


export type QueryDocumentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryEquipmentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryEventArgs = {
  id: Scalars['ID']['input'];
};


export type QueryExpenseArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGrantArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMemberArgs = {
  id: Scalars['ID']['input'];
};


export type QueryNoteTaskArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProjectArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPublicationArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};

export type UpdateAcademicInfoInput = {
  degree?: InputMaybe<Scalars['String']['input']>;
  field?: InputMaybe<Scalars['String']['input']>;
  graduationYear?: InputMaybe<Scalars['Int']['input']>;
  institution?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateBookingInput = {
  endTime?: InputMaybe<Scalars['DateTime']['input']>;
  equipmentId?: InputMaybe<Scalars['String']['input']>;
  eventId?: InputMaybe<Scalars['String']['input']>;
  memberId?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['String']['input']>;
  purpose?: InputMaybe<Scalars['String']['input']>;
  startTime?: InputMaybe<Scalars['DateTime']['input']>;
};

export type UpdateCollaboratorInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  organization?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateDocumentInput = {
  filename?: InputMaybe<Scalars['String']['input']>;
  memberId?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateEquipmentInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  memberId?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['String']['input']>;
  serialNumber?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<EquipmentStatus>;
};

export type UpdateEventInput = {
  date?: InputMaybe<Scalars['DateTime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateExpenseInput = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  date?: InputMaybe<Scalars['DateTime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  eventId?: InputMaybe<Scalars['String']['input']>;
  grantId?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateGrantInput = {
  budget?: InputMaybe<Scalars['Float']['input']>;
  deadline?: InputMaybe<Scalars['DateTime']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateMemberInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  rank?: InputMaybe<MemberRank>;
  role?: InputMaybe<MemberRole>;
  scholarship?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<MemberStatus>;
};

export type UpdateNoteTaskInput = {
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  content?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['DateTime']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProjectInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePublicationInput = {
  doi?: InputMaybe<Scalars['String']['input']>;
  published?: InputMaybe<Scalars['DateTime']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserInput = {
  image?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  emailVerified?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  member: Member;
  memberId: Scalars['String']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;





/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  AcademicInfo: ResolverTypeWrapper<AcademicInfo>;
  Booking: ResolverTypeWrapper<Booking>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Collaborator: ResolverTypeWrapper<Collaborator>;
  CreateAcademicInfoInput: CreateAcademicInfoInput;
  CreateBookingInput: CreateBookingInput;
  CreateCollaboratorInput: CreateCollaboratorInput;
  CreateDocumentInput: CreateDocumentInput;
  CreateEquipmentInput: CreateEquipmentInput;
  CreateEventInput: CreateEventInput;
  CreateExpenseInput: CreateExpenseInput;
  CreateGrantInput: CreateGrantInput;
  CreateMemberInput: CreateMemberInput;
  CreateNoteTaskInput: CreateNoteTaskInput;
  CreateProjectInput: CreateProjectInput;
  CreatePublicationInput: CreatePublicationInput;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  Document: ResolverTypeWrapper<Document>;
  Equipment: ResolverTypeWrapper<Equipment>;
  EquipmentStatus: EquipmentStatus;
  Event: ResolverTypeWrapper<Event>;
  Expense: ResolverTypeWrapper<Expense>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  Grant: ResolverTypeWrapper<Grant>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Member: ResolverTypeWrapper<Member>;
  MemberRank: MemberRank;
  MemberRole: MemberRole;
  MemberStatus: MemberStatus;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  NoteTask: ResolverTypeWrapper<NoteTask>;
  Project: ResolverTypeWrapper<Project>;
  Publication: ResolverTypeWrapper<Publication>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  UpdateAcademicInfoInput: UpdateAcademicInfoInput;
  UpdateBookingInput: UpdateBookingInput;
  UpdateCollaboratorInput: UpdateCollaboratorInput;
  UpdateDocumentInput: UpdateDocumentInput;
  UpdateEquipmentInput: UpdateEquipmentInput;
  UpdateEventInput: UpdateEventInput;
  UpdateExpenseInput: UpdateExpenseInput;
  UpdateGrantInput: UpdateGrantInput;
  UpdateMemberInput: UpdateMemberInput;
  UpdateNoteTaskInput: UpdateNoteTaskInput;
  UpdateProjectInput: UpdateProjectInput;
  UpdatePublicationInput: UpdatePublicationInput;
  UpdateUserInput: UpdateUserInput;
  User: ResolverTypeWrapper<User>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  AcademicInfo: AcademicInfo;
  Booking: Booking;
  Boolean: Scalars['Boolean']['output'];
  Collaborator: Collaborator;
  CreateAcademicInfoInput: CreateAcademicInfoInput;
  CreateBookingInput: CreateBookingInput;
  CreateCollaboratorInput: CreateCollaboratorInput;
  CreateDocumentInput: CreateDocumentInput;
  CreateEquipmentInput: CreateEquipmentInput;
  CreateEventInput: CreateEventInput;
  CreateExpenseInput: CreateExpenseInput;
  CreateGrantInput: CreateGrantInput;
  CreateMemberInput: CreateMemberInput;
  CreateNoteTaskInput: CreateNoteTaskInput;
  CreateProjectInput: CreateProjectInput;
  CreatePublicationInput: CreatePublicationInput;
  DateTime: Scalars['DateTime']['output'];
  Document: Document;
  Equipment: Equipment;
  Event: Event;
  Expense: Expense;
  Float: Scalars['Float']['output'];
  Grant: Grant;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Member: Member;
  Mutation: Record<PropertyKey, never>;
  NoteTask: NoteTask;
  Project: Project;
  Publication: Publication;
  Query: Record<PropertyKey, never>;
  String: Scalars['String']['output'];
  UpdateAcademicInfoInput: UpdateAcademicInfoInput;
  UpdateBookingInput: UpdateBookingInput;
  UpdateCollaboratorInput: UpdateCollaboratorInput;
  UpdateDocumentInput: UpdateDocumentInput;
  UpdateEquipmentInput: UpdateEquipmentInput;
  UpdateEventInput: UpdateEventInput;
  UpdateExpenseInput: UpdateExpenseInput;
  UpdateGrantInput: UpdateGrantInput;
  UpdateMemberInput: UpdateMemberInput;
  UpdateNoteTaskInput: UpdateNoteTaskInput;
  UpdateProjectInput: UpdateProjectInput;
  UpdatePublicationInput: UpdatePublicationInput;
  UpdateUserInput: UpdateUserInput;
  User: User;
}>;

export type AcademicInfoResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AcademicInfo'] = ResolversParentTypes['AcademicInfo']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  degree?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  field?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  graduationYear?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  institution?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  member?: Resolver<ResolversTypes['Member'], ParentType, ContextType>;
  memberId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
}>;

export type BookingResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Booking'] = ResolversParentTypes['Booking']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  endTime?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  equipment?: Resolver<ResolversTypes['Equipment'], ParentType, ContextType>;
  equipmentId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  event?: Resolver<Maybe<ResolversTypes['Event']>, ParentType, ContextType>;
  eventId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  member?: Resolver<ResolversTypes['Member'], ParentType, ContextType>;
  memberId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType>;
  projectId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  purpose?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  startTime?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
}>;

export type CollaboratorResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Collaborator'] = ResolversParentTypes['Collaborator']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  noteTasks?: Resolver<Array<ResolversTypes['NoteTask']>, ParentType, ContextType>;
  organization?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  projects?: Resolver<Array<ResolversTypes['Project']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
}>;

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type DocumentResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Document'] = ResolversParentTypes['Document']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  filename?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  member?: Resolver<Maybe<ResolversTypes['Member']>, ParentType, ContextType>;
  memberId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  noteTasks?: Resolver<Array<ResolversTypes['NoteTask']>, ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType>;
  projectId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type EquipmentResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Equipment'] = ResolversParentTypes['Equipment']> = ResolversObject<{
  bookings?: Resolver<Array<ResolversTypes['Booking']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  events?: Resolver<Array<ResolversTypes['Event']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  member?: Resolver<Maybe<ResolversTypes['Member']>, ParentType, ContextType>;
  memberId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  noteTasks?: Resolver<Array<ResolversTypes['NoteTask']>, ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType>;
  projectId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  serialNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['EquipmentStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
}>;

export type EquipmentStatusResolvers = EnumResolverSignature<{ AVAILABLE?: any, IN_USE?: any, MAINTENANCE?: any }, ResolversTypes['EquipmentStatus']>;

export type EventResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Event'] = ResolversParentTypes['Event']> = ResolversObject<{
  attendees?: Resolver<Array<ResolversTypes['Member']>, ParentType, ContextType>;
  bookings?: Resolver<Array<ResolversTypes['Booking']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  equipments?: Resolver<Array<ResolversTypes['Equipment']>, ParentType, ContextType>;
  expenses?: Resolver<Array<ResolversTypes['Expense']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  location?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  projects?: Resolver<Array<ResolversTypes['Project']>, ParentType, ContextType>;
  tasks?: Resolver<Array<ResolversTypes['NoteTask']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
}>;

export type ExpenseResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Expense'] = ResolversParentTypes['Expense']> = ResolversObject<{
  amount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  event?: Resolver<Maybe<ResolversTypes['Event']>, ParentType, ContextType>;
  eventId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  grant?: Resolver<Maybe<ResolversTypes['Grant']>, ParentType, ContextType>;
  grantId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  noteTasks?: Resolver<Array<ResolversTypes['NoteTask']>, ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType>;
  projectId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type GrantResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Grant'] = ResolversParentTypes['Grant']> = ResolversObject<{
  budget?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  deadline?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  expenses?: Resolver<Array<ResolversTypes['Expense']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  noteTasks?: Resolver<Array<ResolversTypes['NoteTask']>, ParentType, ContextType>;
  projects?: Resolver<Array<ResolversTypes['Project']>, ParentType, ContextType>;
  remainingBudget?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  totalSpent?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
}>;

export type MemberResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Member'] = ResolversParentTypes['Member']> = ResolversObject<{
  academicInfo?: Resolver<Array<ResolversTypes['AcademicInfo']>, ParentType, ContextType>;
  bookings?: Resolver<Array<ResolversTypes['Booking']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  documents?: Resolver<Array<ResolversTypes['Document']>, ParentType, ContextType>;
  equipments?: Resolver<Array<ResolversTypes['Equipment']>, ParentType, ContextType>;
  events?: Resolver<Array<ResolversTypes['Event']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  noteTasks?: Resolver<Array<ResolversTypes['NoteTask']>, ParentType, ContextType>;
  projects?: Resolver<Array<ResolversTypes['Project']>, ParentType, ContextType>;
  publications?: Resolver<Array<ResolversTypes['Publication']>, ParentType, ContextType>;
  rank?: Resolver<Maybe<ResolversTypes['MemberRank']>, ParentType, ContextType>;
  role?: Resolver<Maybe<ResolversTypes['MemberRole']>, ParentType, ContextType>;
  scholarship?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['MemberStatus']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
}>;

export type MemberRankResolvers = EnumResolverSignature<{ BSc?: any, DOCTOR?: any, MSc?: any, Mr?: any, Mrs?: any, POSTDOC?: any, PROFESSOR?: any }, ResolversTypes['MemberRank']>;

export type MemberRoleResolvers = EnumResolverSignature<{ ADVISOR?: any, ALUMNI?: any, CONTRACTOR?: any, GUEST?: any, INTERN?: any, LAB_MANAGER?: any, OTHER?: any, PI?: any, RESEARCHER?: any, STUDENT?: any }, ResolversTypes['MemberRole']>;

export type MemberStatusResolvers = EnumResolverSignature<{ ACTIVE?: any, ALUMNI?: any, INACTIVE?: any }, ResolversTypes['MemberStatus']>;

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  addCollaboratorToProject?: Resolver<ResolversTypes['Project'], ParentType, ContextType, RequireFields<MutationAddCollaboratorToProjectArgs, 'collaboratorId' | 'projectId'>>;
  addEquipmentToEvent?: Resolver<ResolversTypes['Event'], ParentType, ContextType, RequireFields<MutationAddEquipmentToEventArgs, 'equipmentId' | 'eventId'>>;
  addMemberToEvent?: Resolver<ResolversTypes['Event'], ParentType, ContextType, RequireFields<MutationAddMemberToEventArgs, 'eventId' | 'memberId'>>;
  addMemberToProject?: Resolver<ResolversTypes['Project'], ParentType, ContextType, RequireFields<MutationAddMemberToProjectArgs, 'memberId' | 'projectId'>>;
  addMemberToPublication?: Resolver<ResolversTypes['Publication'], ParentType, ContextType, RequireFields<MutationAddMemberToPublicationArgs, 'memberId' | 'publicationId'>>;
  addProjectToEvent?: Resolver<ResolversTypes['Event'], ParentType, ContextType, RequireFields<MutationAddProjectToEventArgs, 'eventId' | 'projectId'>>;
  addProjectToGrant?: Resolver<ResolversTypes['Grant'], ParentType, ContextType, RequireFields<MutationAddProjectToGrantArgs, 'grantId' | 'projectId'>>;
  addProjectToPublication?: Resolver<ResolversTypes['Publication'], ParentType, ContextType, RequireFields<MutationAddProjectToPublicationArgs, 'projectId' | 'publicationId'>>;
  assignEquipmentToMember?: Resolver<ResolversTypes['Equipment'], ParentType, ContextType, RequireFields<MutationAssignEquipmentToMemberArgs, 'equipmentId' | 'memberId'>>;
  createAcademicInfo?: Resolver<ResolversTypes['AcademicInfo'], ParentType, ContextType, RequireFields<MutationCreateAcademicInfoArgs, 'input'>>;
  createBooking?: Resolver<ResolversTypes['Booking'], ParentType, ContextType, RequireFields<MutationCreateBookingArgs, 'input'>>;
  createCollaborator?: Resolver<ResolversTypes['Collaborator'], ParentType, ContextType, RequireFields<MutationCreateCollaboratorArgs, 'input'>>;
  createDocument?: Resolver<ResolversTypes['Document'], ParentType, ContextType, RequireFields<MutationCreateDocumentArgs, 'input'>>;
  createEquipment?: Resolver<ResolversTypes['Equipment'], ParentType, ContextType, RequireFields<MutationCreateEquipmentArgs, 'input'>>;
  createEvent?: Resolver<ResolversTypes['Event'], ParentType, ContextType, RequireFields<MutationCreateEventArgs, 'input'>>;
  createExpense?: Resolver<ResolversTypes['Expense'], ParentType, ContextType, RequireFields<MutationCreateExpenseArgs, 'input'>>;
  createGrant?: Resolver<ResolversTypes['Grant'], ParentType, ContextType, RequireFields<MutationCreateGrantArgs, 'input'>>;
  createMember?: Resolver<ResolversTypes['Member'], ParentType, ContextType, RequireFields<MutationCreateMemberArgs, 'input'>>;
  createNoteTask?: Resolver<ResolversTypes['NoteTask'], ParentType, ContextType, RequireFields<MutationCreateNoteTaskArgs, 'input'>>;
  createProject?: Resolver<ResolversTypes['Project'], ParentType, ContextType, RequireFields<MutationCreateProjectArgs, 'input'>>;
  createPublication?: Resolver<ResolversTypes['Publication'], ParentType, ContextType, RequireFields<MutationCreatePublicationArgs, 'input'>>;
  deleteAcademicInfo?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteAcademicInfoArgs, 'id'>>;
  deleteBooking?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteBookingArgs, 'id'>>;
  deleteCollaborator?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteCollaboratorArgs, 'id'>>;
  deleteDocument?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteDocumentArgs, 'id'>>;
  deleteEquipment?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteEquipmentArgs, 'id'>>;
  deleteEvent?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteEventArgs, 'id'>>;
  deleteExpense?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteExpenseArgs, 'id'>>;
  deleteGrant?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteGrantArgs, 'id'>>;
  deleteMember?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteMemberArgs, 'id'>>;
  deleteNoteTask?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteNoteTaskArgs, 'id'>>;
  deleteProject?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteProjectArgs, 'id'>>;
  deletePublication?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeletePublicationArgs, 'id'>>;
  removeCollaboratorFromProject?: Resolver<ResolversTypes['Project'], ParentType, ContextType, RequireFields<MutationRemoveCollaboratorFromProjectArgs, 'collaboratorId' | 'projectId'>>;
  removeEquipmentFromEvent?: Resolver<ResolversTypes['Event'], ParentType, ContextType, RequireFields<MutationRemoveEquipmentFromEventArgs, 'equipmentId' | 'eventId'>>;
  removeMemberFromEvent?: Resolver<ResolversTypes['Event'], ParentType, ContextType, RequireFields<MutationRemoveMemberFromEventArgs, 'eventId' | 'memberId'>>;
  removeMemberFromProject?: Resolver<ResolversTypes['Project'], ParentType, ContextType, RequireFields<MutationRemoveMemberFromProjectArgs, 'memberId' | 'projectId'>>;
  removeMemberFromPublication?: Resolver<ResolversTypes['Publication'], ParentType, ContextType, RequireFields<MutationRemoveMemberFromPublicationArgs, 'memberId' | 'publicationId'>>;
  removeProjectFromEvent?: Resolver<ResolversTypes['Event'], ParentType, ContextType, RequireFields<MutationRemoveProjectFromEventArgs, 'eventId' | 'projectId'>>;
  removeProjectFromGrant?: Resolver<ResolversTypes['Grant'], ParentType, ContextType, RequireFields<MutationRemoveProjectFromGrantArgs, 'grantId' | 'projectId'>>;
  removeProjectFromPublication?: Resolver<ResolversTypes['Publication'], ParentType, ContextType, RequireFields<MutationRemoveProjectFromPublicationArgs, 'projectId' | 'publicationId'>>;
  unassignEquipmentFromMember?: Resolver<ResolversTypes['Equipment'], ParentType, ContextType, RequireFields<MutationUnassignEquipmentFromMemberArgs, 'equipmentId'>>;
  updateAcademicInfo?: Resolver<ResolversTypes['AcademicInfo'], ParentType, ContextType, RequireFields<MutationUpdateAcademicInfoArgs, 'id' | 'input'>>;
  updateBooking?: Resolver<ResolversTypes['Booking'], ParentType, ContextType, RequireFields<MutationUpdateBookingArgs, 'id' | 'input'>>;
  updateCollaborator?: Resolver<ResolversTypes['Collaborator'], ParentType, ContextType, RequireFields<MutationUpdateCollaboratorArgs, 'id' | 'input'>>;
  updateDocument?: Resolver<ResolversTypes['Document'], ParentType, ContextType, RequireFields<MutationUpdateDocumentArgs, 'id' | 'input'>>;
  updateEquipment?: Resolver<ResolversTypes['Equipment'], ParentType, ContextType, RequireFields<MutationUpdateEquipmentArgs, 'id' | 'input'>>;
  updateEvent?: Resolver<ResolversTypes['Event'], ParentType, ContextType, RequireFields<MutationUpdateEventArgs, 'id' | 'input'>>;
  updateExpense?: Resolver<ResolversTypes['Expense'], ParentType, ContextType, RequireFields<MutationUpdateExpenseArgs, 'id' | 'input'>>;
  updateGrant?: Resolver<ResolversTypes['Grant'], ParentType, ContextType, RequireFields<MutationUpdateGrantArgs, 'id' | 'input'>>;
  updateMember?: Resolver<ResolversTypes['Member'], ParentType, ContextType, RequireFields<MutationUpdateMemberArgs, 'id' | 'input'>>;
  updateNoteTask?: Resolver<ResolversTypes['NoteTask'], ParentType, ContextType, RequireFields<MutationUpdateNoteTaskArgs, 'id' | 'input'>>;
  updateProject?: Resolver<ResolversTypes['Project'], ParentType, ContextType, RequireFields<MutationUpdateProjectArgs, 'id' | 'input'>>;
  updatePublication?: Resolver<ResolversTypes['Publication'], ParentType, ContextType, RequireFields<MutationUpdatePublicationArgs, 'id' | 'input'>>;
  updateUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationUpdateUserArgs, 'id' | 'input'>>;
}>;

export type NoteTaskResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['NoteTask'] = ResolversParentTypes['NoteTask']> = ResolversObject<{
  collaborator?: Resolver<Maybe<ResolversTypes['Collaborator']>, ParentType, ContextType>;
  collaboratorId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  completed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  document?: Resolver<Maybe<ResolversTypes['Document']>, ParentType, ContextType>;
  documentId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dueDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  equipment?: Resolver<Maybe<ResolversTypes['Equipment']>, ParentType, ContextType>;
  equipmentId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  event?: Resolver<Maybe<ResolversTypes['Event']>, ParentType, ContextType>;
  eventId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  expense?: Resolver<Maybe<ResolversTypes['Expense']>, ParentType, ContextType>;
  expenseId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  grant?: Resolver<Maybe<ResolversTypes['Grant']>, ParentType, ContextType>;
  grantId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  member?: Resolver<Maybe<ResolversTypes['Member']>, ParentType, ContextType>;
  memberId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType>;
  projectId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  publication?: Resolver<Maybe<ResolversTypes['Publication']>, ParentType, ContextType>;
  publicationId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
}>;

export type ProjectResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Project'] = ResolversParentTypes['Project']> = ResolversObject<{
  bookings?: Resolver<Array<ResolversTypes['Booking']>, ParentType, ContextType>;
  collaborators?: Resolver<Array<ResolversTypes['Collaborator']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  documents?: Resolver<Array<ResolversTypes['Document']>, ParentType, ContextType>;
  endDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  equipments?: Resolver<Array<ResolversTypes['Equipment']>, ParentType, ContextType>;
  events?: Resolver<Array<ResolversTypes['Event']>, ParentType, ContextType>;
  expenses?: Resolver<Array<ResolversTypes['Expense']>, ParentType, ContextType>;
  grants?: Resolver<Array<ResolversTypes['Grant']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  members?: Resolver<Array<ResolversTypes['Member']>, ParentType, ContextType>;
  noteTasks?: Resolver<Array<ResolversTypes['NoteTask']>, ParentType, ContextType>;
  publications?: Resolver<Array<ResolversTypes['Publication']>, ParentType, ContextType>;
  startDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  totalInvestment?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
}>;

export type PublicationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Publication'] = ResolversParentTypes['Publication']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  doi?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  members?: Resolver<Array<ResolversTypes['Member']>, ParentType, ContextType>;
  noteTasks?: Resolver<Array<ResolversTypes['NoteTask']>, ParentType, ContextType>;
  projects?: Resolver<Array<ResolversTypes['Project']>, ParentType, ContextType>;
  published?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  academicInfo?: Resolver<Maybe<ResolversTypes['AcademicInfo']>, ParentType, ContextType, RequireFields<QueryAcademicInfoArgs, 'id'>>;
  academicInfos?: Resolver<Array<ResolversTypes['AcademicInfo']>, ParentType, ContextType>;
  booking?: Resolver<Maybe<ResolversTypes['Booking']>, ParentType, ContextType, RequireFields<QueryBookingArgs, 'id'>>;
  bookings?: Resolver<Array<ResolversTypes['Booking']>, ParentType, ContextType>;
  collaborator?: Resolver<Maybe<ResolversTypes['Collaborator']>, ParentType, ContextType, RequireFields<QueryCollaboratorArgs, 'id'>>;
  collaborators?: Resolver<Array<ResolversTypes['Collaborator']>, ParentType, ContextType>;
  currentUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  document?: Resolver<Maybe<ResolversTypes['Document']>, ParentType, ContextType, RequireFields<QueryDocumentArgs, 'id'>>;
  documents?: Resolver<Array<ResolversTypes['Document']>, ParentType, ContextType>;
  equipment?: Resolver<Maybe<ResolversTypes['Equipment']>, ParentType, ContextType, RequireFields<QueryEquipmentArgs, 'id'>>;
  equipments?: Resolver<Array<ResolversTypes['Equipment']>, ParentType, ContextType>;
  event?: Resolver<Maybe<ResolversTypes['Event']>, ParentType, ContextType, RequireFields<QueryEventArgs, 'id'>>;
  events?: Resolver<Array<ResolversTypes['Event']>, ParentType, ContextType>;
  expense?: Resolver<Maybe<ResolversTypes['Expense']>, ParentType, ContextType, RequireFields<QueryExpenseArgs, 'id'>>;
  expenses?: Resolver<Array<ResolversTypes['Expense']>, ParentType, ContextType>;
  grant?: Resolver<Maybe<ResolversTypes['Grant']>, ParentType, ContextType, RequireFields<QueryGrantArgs, 'id'>>;
  grants?: Resolver<Array<ResolversTypes['Grant']>, ParentType, ContextType>;
  member?: Resolver<Maybe<ResolversTypes['Member']>, ParentType, ContextType, RequireFields<QueryMemberArgs, 'id'>>;
  members?: Resolver<Array<ResolversTypes['Member']>, ParentType, ContextType>;
  noteTask?: Resolver<Maybe<ResolversTypes['NoteTask']>, ParentType, ContextType, RequireFields<QueryNoteTaskArgs, 'id'>>;
  noteTasks?: Resolver<Array<ResolversTypes['NoteTask']>, ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<QueryProjectArgs, 'id'>>;
  projects?: Resolver<Array<ResolversTypes['Project']>, ParentType, ContextType>;
  publication?: Resolver<Maybe<ResolversTypes['Publication']>, ParentType, ContextType, RequireFields<QueryPublicationArgs, 'id'>>;
  publications?: Resolver<Array<ResolversTypes['Publication']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
  users?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  emailVerified?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  member?: Resolver<ResolversTypes['Member'], ParentType, ContextType>;
  memberId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
}>;

export type Resolvers<ContextType = GraphQLContext> = ResolversObject<{
  AcademicInfo?: AcademicInfoResolvers<ContextType>;
  Booking?: BookingResolvers<ContextType>;
  Collaborator?: CollaboratorResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  Document?: DocumentResolvers<ContextType>;
  Equipment?: EquipmentResolvers<ContextType>;
  EquipmentStatus?: EquipmentStatusResolvers;
  Event?: EventResolvers<ContextType>;
  Expense?: ExpenseResolvers<ContextType>;
  Grant?: GrantResolvers<ContextType>;
  Member?: MemberResolvers<ContextType>;
  MemberRank?: MemberRankResolvers;
  MemberRole?: MemberRoleResolvers;
  MemberStatus?: MemberStatusResolvers;
  Mutation?: MutationResolvers<ContextType>;
  NoteTask?: NoteTaskResolvers<ContextType>;
  Project?: ProjectResolvers<ContextType>;
  Publication?: PublicationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
}>;

