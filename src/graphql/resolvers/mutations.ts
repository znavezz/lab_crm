import type { GraphQLContext } from '../context';
import type { Prisma } from '@/generated/prisma';
import type {
  MutationCreateMemberArgs,
  MutationUpdateMemberArgs,
  MutationDeleteMemberArgs,
  MutationCreateProjectArgs,
  MutationUpdateProjectArgs,
  MutationDeleteProjectArgs,
  MutationCreateEquipmentArgs,
  MutationUpdateEquipmentArgs,
  MutationDeleteEquipmentArgs,
  MutationCreateBookingArgs,
  MutationUpdateBookingArgs,
  MutationDeleteBookingArgs,
  MutationCreateEventArgs,
  MutationUpdateEventArgs,
  MutationDeleteEventArgs,
  MutationCreateGrantArgs,
  MutationUpdateGrantArgs,
  MutationDeleteGrantArgs,
  MutationCreatePublicationArgs,
  MutationUpdatePublicationArgs,
  MutationDeletePublicationArgs,
  MutationCreateCollaboratorArgs,
  MutationUpdateCollaboratorArgs,
  MutationDeleteCollaboratorArgs,
  MutationCreateDocumentArgs,
  MutationUpdateDocumentArgs,
  MutationDeleteDocumentArgs,
  MutationCreateExpenseArgs,
  MutationUpdateExpenseArgs,
  MutationDeleteExpenseArgs,
  MutationCreateNoteTaskArgs,
  MutationUpdateNoteTaskArgs,
  MutationDeleteNoteTaskArgs,
  MutationCreateAcademicInfoArgs,
  MutationUpdateAcademicInfoArgs,
  MutationDeleteAcademicInfoArgs,
  MutationUpdateUserArgs,
  MutationAssignEquipmentToMemberArgs,
  MutationUnassignEquipmentFromMemberArgs,
  MutationAddMemberToProjectArgs,
  MutationRemoveMemberFromProjectArgs,
  MutationAddMemberToPublicationArgs,
  MutationRemoveMemberFromPublicationArgs,
  MutationAddProjectToPublicationArgs,
  MutationRemoveProjectFromPublicationArgs,
  MutationAddMemberToEventArgs,
  MutationRemoveMemberFromEventArgs,
  CreateMemberInput,
  UpdateMemberInput,
  CreateNoteTaskInput,
  MutationAddProjectToEventArgs,
  MutationRemoveProjectFromEventArgs,
  MutationAddProjectToGrantArgs,
  MutationRemoveProjectFromGrantArgs,
  MutationAddCollaboratorToProjectArgs,
  MutationRemoveCollaboratorFromProjectArgs,
  MutationAddEquipmentToEventArgs,
  MutationRemoveEquipmentFromEventArgs,
} from '@/generated/graphql/resolvers-types';

// Type extensions for missing fields in generated types
type ExtendedCreateMemberInput = CreateMemberInput & {
  photoUrl?: string | null;
  joinedDate?: string | null;
};

type ExtendedUpdateMemberInput = UpdateMemberInput & {
  photoUrl?: string | null;
  joinedDate?: string | null;
};

type ExtendedCreateNoteTaskInput = CreateNoteTaskInput & {
  protocolId?: string | null;
};

// Protocol input types (not generated, so we define them based on schema)
type CreateProtocolInput = {
  title: string;
  description?: string | null;
  category?: 'WET_LAB' | 'COMPUTATIONAL' | 'SAFETY' | 'GENERAL' | null;
  version?: string | null;
  estimatedTime?: string | null;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null;
  tags?: string | null;
  authorId?: string | null;
  projectId?: string | null;
  documentId?: string | null;
  materials?: string | null;
  equipment?: string | null;
  steps?: string | null;
  safetyNotes?: string | null;
  versionHistory?: string | null;
};

type UpdateProtocolInput = {
  title?: string | null;
  description?: string | null;
  category?: 'WET_LAB' | 'COMPUTATIONAL' | 'SAFETY' | 'GENERAL' | null;
  version?: string | null;
  estimatedTime?: string | null;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null;
  tags?: string | null;
  authorId?: string | null;
  projectId?: string | null;
  documentId?: string | null;
  materials?: string | null;
  equipment?: string | null;
  steps?: string | null;
  safetyNotes?: string | null;
  versionHistory?: string | null;
};

type ExtendedCreateProtocolInput = CreateProtocolInput;
type ExtendedUpdateProtocolInput = UpdateProtocolInput;

// Protocol mutation args types (not generated, so we define them)
type MutationCreateProtocolArgs = {
  input: ExtendedCreateProtocolInput;
};

type MutationUpdateProtocolArgs = {
  id: string;
  input: ExtendedUpdateProtocolInput;
};

type MutationDeleteProtocolArgs = {
  id: string;
};

// Extended mutation args with proper types
type ExtendedMutationCreateMemberArgs = Omit<MutationCreateMemberArgs, 'input'> & {
  input: ExtendedCreateMemberInput;
};

type ExtendedMutationUpdateMemberArgs = Omit<MutationUpdateMemberArgs, 'input'> & {
  input: ExtendedUpdateMemberInput;
};

type ExtendedMutationCreateNoteTaskArgs = Omit<MutationCreateNoteTaskArgs, 'input'> & {
  input: ExtendedCreateNoteTaskInput;
};

export const mutations = {
  // Member mutations
  createMember: async (
    _: unknown,
    args: ExtendedMutationCreateMemberArgs,
    context: GraphQLContext
  ) => {
    const now = new Date();
    return await context.prisma.member.create({
      data: {
        name: args.input.name,
        rank: args.input.rank ?? undefined,
        status: args.input.status ?? undefined,
        role: args.input.role ?? undefined,
        scholarship: args.input.scholarship ?? undefined,
        photoUrl: args.input.photoUrl ?? undefined,
        joinedDate: args.input.joinedDate ? new Date(args.input.joinedDate) : now, // Default to current date if not provided
      },
    });
  },
  
  updateMember: async (
    _: unknown,
    args: ExtendedMutationUpdateMemberArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.member.update({
      where: { id: args.id },
      data: {
        ...(args.input.name && { name: args.input.name }),
        ...(args.input.rank !== undefined && { rank: args.input.rank ?? undefined }),
        ...(args.input.status !== undefined && { status: args.input.status ?? undefined }),
        ...(args.input.role !== undefined && { role: args.input.role ?? undefined }),
        ...(args.input.scholarship !== undefined && { scholarship: args.input.scholarship }),
        ...(args.input.photoUrl !== undefined && { photoUrl: args.input.photoUrl === null ? null : (args.input.photoUrl || undefined) }),
        ...(args.input.joinedDate !== undefined && { joinedDate: args.input.joinedDate ? new Date(args.input.joinedDate) : undefined }),
      },
    });
  },
  
  deleteMember: async (
    _: unknown,
    args: MutationDeleteMemberArgs,
    context: GraphQLContext
  ) => {
    await context.prisma.member.delete({
      where: { id: args.id },
    });
    return true;
  },
  
  // Project mutations
  createProject: async (
    _: unknown,
    args: MutationCreateProjectArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.project.create({
      data: {
        title: args.input.title,
        description: args.input.description ?? undefined,
        startDate: args.input.startDate ?? undefined,
        endDate: args.input.endDate ?? undefined,
      },
    });
  },
  
  updateProject: async (
    _: unknown,
    args: MutationUpdateProjectArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.project.update({
      where: { id: args.id },
      data: {
        ...(args.input.title && { title: args.input.title }),
        ...(args.input.description !== undefined && { description: args.input.description }),
        ...(args.input.startDate && { startDate: args.input.startDate }),
        ...(args.input.endDate && { endDate: args.input.endDate }),
      },
    });
  },
  
  deleteProject: async (
    _: unknown,
    args: MutationDeleteProjectArgs,
    context: GraphQLContext
  ) => {
    await context.prisma.project.delete({
      where: { id: args.id },
    });
    return true;
  },
  
  // Equipment mutations
  createEquipment: async (
    _: unknown,
    args: MutationCreateEquipmentArgs,
    context: GraphQLContext
  ) => {
    // Validate: Cannot have both member and project assigned
    if (args.input.memberId && args.input.projectId) {
      throw new Error('Equipment cannot be assigned to both a member and a project. Please assign to either a member OR a project, not both.');
    }
    
    // Validate: Equipment in MAINTENANCE cannot be assigned to a member or project
    if (args.input.status === 'MAINTENANCE' && (args.input.memberId || args.input.projectId)) {
      throw new Error('Equipment in MAINTENANCE status cannot be assigned to a member or project. Please remove the assignment or change the status.');
    }

    // Determine status automatically:
    // - If status is explicitly set to MAINTENANCE → use MAINTENANCE
    // - If member OR project is assigned → status is IN_USE
    // - Otherwise → status is AVAILABLE
    let finalStatus: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
    
    if (args.input.status === 'MAINTENANCE') {
      finalStatus = 'MAINTENANCE';
    } else if (args.input.memberId || args.input.projectId) {
      finalStatus = 'IN_USE';
    } else {
      finalStatus = 'AVAILABLE';
    }

    // If status was provided but conflicts with assignment, ignore it (status is auto-derived)
    // Only allow explicit MAINTENANCE status
    
    return await context.prisma.equipment.create({
      data: {
        name: args.input.name,
        description: args.input.description ?? undefined,
        serialNumber: args.input.serialNumber ?? undefined,
        status: finalStatus,
        projectId: args.input.projectId ?? undefined,
        memberId: args.input.memberId ?? undefined,
      },
    });
  },
  
  updateEquipment: async (
    _: unknown,
    args: MutationUpdateEquipmentArgs,
    context: GraphQLContext
  ) => {
    // Get current equipment to check existing assignments
    const currentEquipment = await context.prisma.equipment.findUnique({
      where: { id: args.id },
      select: { memberId: true, projectId: true, status: true },
    });

    if (!currentEquipment) {
      throw new Error('Equipment not found');
    }

    const updateData: Prisma.EquipmentUpdateInput = {
      ...(args.input.name && { name: args.input.name }),
      ...(args.input.description !== undefined && { description: args.input.description }),
      ...(args.input.serialNumber !== undefined && { serialNumber: args.input.serialNumber }),
    };

    // Determine what the final state will be after the update
    const willHaveMember = args.input.memberId !== undefined 
      ? args.input.memberId !== null 
      : currentEquipment.memberId !== null;
    const willHaveProject = args.input.projectId !== undefined 
      ? args.input.projectId !== null 
      : currentEquipment.projectId !== null;
    const willBeMaintenance = args.input.status === 'MAINTENANCE';

    // Validate: Cannot have both member and project assigned
    if (willHaveMember && willHaveProject) {
      throw new Error('Equipment cannot be assigned to both a member and a project. Please assign to either a member OR a project, not both.');
    }

    // Validate: Equipment in MAINTENANCE cannot be assigned to a member or project
    if (willBeMaintenance && (willHaveMember || willHaveProject)) {
      throw new Error('Equipment in MAINTENANCE status cannot be assigned to a member or project. Please remove the assignment first.');
    }

    // Validate: Cannot set status to MAINTENANCE if member or project is assigned
    if (willBeMaintenance && (currentEquipment.memberId || currentEquipment.projectId)) {
      throw new Error('Cannot set equipment to MAINTENANCE status while assigned to a member or project. Please remove the assignment first.');
    }

    // Handle projectId using relation syntax
    if (args.input.projectId !== undefined) {
      if (args.input.projectId === null) {
        updateData.project = { disconnect: true };
      } else {
        // If assigning to project, remove member assignment if exists
        if (currentEquipment.memberId) {
          updateData.member = { disconnect: true };
        }
        updateData.project = { connect: { id: args.input.projectId } };
      }
    }

    // Handle memberId using relation syntax
    if (args.input.memberId !== undefined) {
      if (args.input.memberId === null) {
        updateData.member = { disconnect: true };
      } else {
        // If assigning to member, remove project assignment if exists
        if (currentEquipment.projectId) {
          updateData.project = { disconnect: true };
        }
        // Only allow member assignment if not going to MAINTENANCE
        if (!willBeMaintenance) {
        updateData.member = { connect: { id: args.input.memberId } };
        } else {
          throw new Error('Cannot assign member to equipment that is in MAINTENANCE status.');
        }
      }
    }

    // If setting status to MAINTENANCE, automatically remove member and project assignments
    if (willBeMaintenance) {
      if (currentEquipment.memberId) {
        updateData.member = { disconnect: true };
      }
      if (currentEquipment.projectId) {
        updateData.project = { disconnect: true };
      }
    }

    // Determine final status automatically:
    // - If status is explicitly set to MAINTENANCE → use MAINTENANCE
    // - If member OR project will be assigned → status is IN_USE
    // - Otherwise → status is AVAILABLE
    let finalStatus: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
    
    if (willBeMaintenance) {
      finalStatus = 'MAINTENANCE';
    } else if (willHaveMember || willHaveProject) {
      finalStatus = 'IN_USE';
    } else {
      finalStatus = 'AVAILABLE';
    }

    // Only set status if it's explicitly MAINTENANCE or if it needs to change
    // Status is automatically derived from member/project assignment
    if (args.input.status === 'MAINTENANCE' || finalStatus !== currentEquipment.status) {
      updateData.status = finalStatus;
    }

    return await context.prisma.equipment.update({
      where: { id: args.id },
      data: updateData,
    });
  },
  
  deleteEquipment: async (
    _: unknown,
    args: MutationDeleteEquipmentArgs,
    context: GraphQLContext
  ) => {
    await context.prisma.equipment.delete({
      where: { id: args.id },
    });
    return true;
  },
  
  // Booking mutations
  createBooking: async (
    _: unknown,
    args: MutationCreateBookingArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.booking.create({
      data: {
        startTime: args.input.startTime,
        endTime: args.input.endTime,
        purpose: args.input.purpose ?? undefined,
        equipmentId: args.input.equipmentId,
        memberId: args.input.memberId,
        projectId: args.input.projectId ?? undefined,
        eventId: args.input.eventId ?? undefined,
      },
    });
  },
  
  updateBooking: async (
    _: unknown,
    args: MutationUpdateBookingArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.booking.update({
      where: { id: args.id },
      data: {
        ...(args.input.startTime && { startTime: args.input.startTime }),
        ...(args.input.endTime && { endTime: args.input.endTime }),
        ...(args.input.purpose !== undefined && { purpose: args.input.purpose }),
        ...(args.input.equipmentId && { equipmentId: args.input.equipmentId }),
        ...(args.input.memberId && { memberId: args.input.memberId }),
        ...(args.input.projectId !== undefined && { projectId: args.input.projectId }),
        ...(args.input.eventId !== undefined && { eventId: args.input.eventId }),
      },
    });
  },
  
  deleteBooking: async (
    _: unknown,
    args: MutationDeleteBookingArgs,
    context: GraphQLContext
  ) => {
    await context.prisma.booking.delete({
      where: { id: args.id },
    });
    return true;
  },
  
  // Event mutations
  createEvent: async (
    _: unknown,
    args: MutationCreateEventArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.event.create({
      data: {
        title: args.input.title,
        description: args.input.description ?? undefined,
        date: args.input.date,
        location: args.input.location ?? undefined,
      },
    });
  },
  
  updateEvent: async (
    _: unknown,
    args: MutationUpdateEventArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.event.update({
      where: { id: args.id },
      data: {
        ...(args.input.title && { title: args.input.title }),
        ...(args.input.description !== undefined && { description: args.input.description }),
        ...(args.input.date && { date: args.input.date }),
        ...(args.input.location !== undefined && { location: args.input.location }),
      },
    });
  },
  
  deleteEvent: async (
    _: unknown,
    args: MutationDeleteEventArgs,
    context: GraphQLContext
  ) => {
    await context.prisma.event.delete({
      where: { id: args.id },
    });
    return true;
  },
  
  // Grant mutations
  createGrant: async (
    _: unknown,
    args: MutationCreateGrantArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.grant.create({
      data: {
        name: args.input.name,
        budget: args.input.budget,
        deadline: args.input.deadline,
      },
    });
  },
  
  updateGrant: async (
    _: unknown,
    args: MutationUpdateGrantArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.grant.update({
      where: { id: args.id },
      data: {
        ...(args.input.name && { name: args.input.name }),
        ...(args.input.budget !== undefined && { budget: args.input.budget }),
        ...(args.input.deadline && { deadline: args.input.deadline }),
      },
    });
  },
  
  deleteGrant: async (
    _: unknown,
    args: MutationDeleteGrantArgs,
    context: GraphQLContext
  ) => {
    await context.prisma.grant.delete({
      where: { id: args.id },
    });
    return true;
  },
  
  // Publication mutations
  createPublication: async (
    _: unknown,
    args: MutationCreatePublicationArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.publication.create({
      data: {
        title: args.input.title,
        published: args.input.published ?? undefined,
        doi: args.input.doi ?? undefined,
        url: args.input.url ?? undefined,
      },
    });
  },
  
  updatePublication: async (
    _: unknown,
    args: MutationUpdatePublicationArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.publication.update({
      where: { id: args.id },
      data: {
        ...(args.input.title && { title: args.input.title }),
        ...(args.input.published !== undefined && { published: args.input.published }),
        ...(args.input.doi !== undefined && { doi: args.input.doi }),
        ...(args.input.url !== undefined && { url: args.input.url }),
      },
    });
  },
  
  deletePublication: async (
    _: unknown,
    args: MutationDeletePublicationArgs,
    context: GraphQLContext
  ) => {
    await context.prisma.publication.delete({
      where: { id: args.id },
    });
    return true;
  },
  
  // Collaborator mutations
  createCollaborator: async (
    _: unknown,
    args: MutationCreateCollaboratorArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.collaborator.create({
      data: {
        name: args.input.name,
        organization: args.input.organization ?? undefined,
      },
    });
  },
  
  updateCollaborator: async (
    _: unknown,
    args: MutationUpdateCollaboratorArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.collaborator.update({
      where: { id: args.id },
      data: {
        ...(args.input.name && { name: args.input.name }),
        ...(args.input.organization !== undefined && { organization: args.input.organization }),
      },
    });
  },
  
  deleteCollaborator: async (
    _: unknown,
    args: MutationDeleteCollaboratorArgs,
    context: GraphQLContext
  ) => {
    await context.prisma.collaborator.delete({
      where: { id: args.id },
    });
    return true;
  },
  
  // Document mutations
  createDocument: async (
    _: unknown,
    args: MutationCreateDocumentArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.document.create({
      data: {
        filename: args.input.filename,
        url: args.input.url,
        projectId: args.input.projectId ?? undefined,
        memberId: args.input.memberId ?? undefined,
      },
    });
  },
  
  updateDocument: async (
    _: unknown,
    args: MutationUpdateDocumentArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.document.update({
      where: { id: args.id },
      data: {
        ...(args.input.filename && { filename: args.input.filename }),
        ...(args.input.url && { url: args.input.url }),
        ...(args.input.projectId !== undefined && { projectId: args.input.projectId }),
        ...(args.input.memberId !== undefined && { memberId: args.input.memberId }),
      },
    });
  },
  
  deleteDocument: async (
    _: unknown,
    args: MutationDeleteDocumentArgs,
    context: GraphQLContext
  ) => {
    await context.prisma.document.delete({
      where: { id: args.id },
    });
    return true;
  },
  
  // Protocol mutations
  createProtocol: async (
    _: unknown,
    args: MutationCreateProtocolArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.protocol.create({
      data: {
        title: args.input.title,
        description: args.input.description ?? undefined,
        category: args.input.category ?? 'GENERAL',
        version: args.input.version ?? '1.0',
        estimatedTime: args.input.estimatedTime ?? undefined,
        difficulty: args.input.difficulty ?? 'INTERMEDIATE',
        tags: args.input.tags ?? undefined,
        authorId: args.input.authorId ?? undefined,
        projectId: args.input.projectId ?? undefined,
        documentId: args.input.documentId ?? undefined,
        materials: args.input.materials ?? undefined,
        equipment: args.input.equipment ?? undefined,
        steps: args.input.steps ?? undefined,
        safetyNotes: args.input.safetyNotes ?? undefined,
        versionHistory: args.input.versionHistory ?? undefined,
      },
    });
  },
  
  updateProtocol: async (
    _: unknown,
    args: MutationUpdateProtocolArgs,
    context: GraphQLContext
  ) => {
    const updateData: Prisma.ProtocolUpdateInput = {};
    
    if (args.input.title !== undefined && args.input.title !== null) updateData.title = args.input.title;
    if (args.input.description !== undefined) updateData.description = args.input.description;
    if (args.input.category !== undefined && args.input.category !== null) updateData.category = args.input.category;
    if (args.input.version !== undefined && args.input.version !== null) updateData.version = args.input.version;
    if (args.input.estimatedTime !== undefined) updateData.estimatedTime = args.input.estimatedTime;
    if (args.input.difficulty !== undefined && args.input.difficulty !== null) updateData.difficulty = args.input.difficulty;
    if (args.input.tags !== undefined) updateData.tags = args.input.tags;
    if (args.input.materials !== undefined) updateData.materials = args.input.materials;
    if (args.input.equipment !== undefined) updateData.equipment = args.input.equipment;
    if (args.input.steps !== undefined) updateData.steps = args.input.steps;
    if (args.input.safetyNotes !== undefined) updateData.safetyNotes = args.input.safetyNotes;
    if (args.input.versionHistory !== undefined) updateData.versionHistory = args.input.versionHistory;
    
    // Handle authorId using relation syntax
    if (args.input.authorId !== undefined) {
      if (args.input.authorId === null) {
        updateData.author = { disconnect: true };
      } else {
        updateData.author = { connect: { id: args.input.authorId } };
      }
    }
    
    // Handle projectId using relation syntax
    if (args.input.projectId !== undefined) {
      if (args.input.projectId === null) {
        updateData.project = { disconnect: true };
      } else {
        updateData.project = { connect: { id: args.input.projectId } };
      }
    }
    
    // Handle documentId using relation syntax
    if (args.input.documentId !== undefined) {
      if (args.input.documentId === null) {
        updateData.document = { disconnect: true };
      } else {
        updateData.document = { connect: { id: args.input.documentId } };
      }
    }
    
    return await context.prisma.protocol.update({
      where: { id: args.id },
      data: updateData,
    });
  },
  
  deleteProtocol: async (
    _: unknown,
    args: MutationDeleteProtocolArgs,
    context: GraphQLContext
  ) => {
    await context.prisma.protocol.delete({
      where: { id: args.id },
    });
    return true;
  },
  
  // Expense mutations
  createExpense: async (
    _: unknown,
    args: MutationCreateExpenseArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.expense.create({
      data: {
        description: args.input.description,
        amount: args.input.amount,
        date: args.input.date ?? new Date(),
        projectId: args.input.projectId ?? undefined,
        grantId: args.input.grantId ?? undefined,
        eventId: args.input.eventId ?? undefined,
      },
    });
  },
  
  updateExpense: async (
    _: unknown,
    args: MutationUpdateExpenseArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.expense.update({
      where: { id: args.id },
      data: {
        ...(args.input.description && { description: args.input.description }),
        ...(args.input.amount !== undefined && { amount: args.input.amount }),
        ...(args.input.date && { date: args.input.date }),
        ...(args.input.projectId !== undefined && { projectId: args.input.projectId }),
        ...(args.input.grantId !== undefined && { grantId: args.input.grantId }),
        ...(args.input.eventId !== undefined && { eventId: args.input.eventId }),
      },
    });
  },
  
  deleteExpense: async (
    _: unknown,
    args: MutationDeleteExpenseArgs,
    context: GraphQLContext
  ) => {
    await context.prisma.expense.delete({
      where: { id: args.id },
    });
    return true;
  },
  
  // NoteTask mutations
  createNoteTask: async (
    _: unknown,
    args: ExtendedMutationCreateNoteTaskArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.noteTask.create({
      data: {
        title: args.input.title ?? undefined,
        content: args.input.content,
        completed: args.input.completed ?? false,
        dueDate: args.input.dueDate ?? undefined,
        memberId: args.input.memberId ?? undefined,
        projectId: args.input.projectId ?? undefined,
        grantId: args.input.grantId ?? undefined,
        eventId: args.input.eventId ?? undefined,
        publicationId: args.input.publicationId ?? undefined,
        documentId: args.input.documentId ?? undefined,
        equipmentId: args.input.equipmentId ?? undefined,
        collaboratorId: args.input.collaboratorId ?? undefined,
        expenseId: args.input.expenseId ?? undefined,
        protocolId: args.input.protocolId ?? undefined,
      },
    });
  },
  
  updateNoteTask: async (
    _: unknown,
    args: MutationUpdateNoteTaskArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.noteTask.update({
      where: { id: args.id },
      data: {
        ...(args.input.title !== undefined && { title: args.input.title }),
        ...(args.input.content && { content: args.input.content }),
        ...(args.input.completed !== undefined && args.input.completed !== null && { completed: args.input.completed }),
        ...(args.input.dueDate !== undefined && { dueDate: args.input.dueDate }),
      },
    });
  },
  
  deleteNoteTask: async (
    _: unknown,
    args: MutationDeleteNoteTaskArgs,
    context: GraphQLContext
  ) => {
    await context.prisma.noteTask.delete({
      where: { id: args.id },
    });
    return true;
  },
  
  // AcademicInfo mutations
  createAcademicInfo: async (
    _: unknown,
    args: MutationCreateAcademicInfoArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.academicInfo.create({
      data: {
        degree: args.input.degree,
        field: args.input.field ?? undefined,
        institution: args.input.institution ?? undefined,
        graduationYear: args.input.graduationYear ?? undefined,
        memberId: args.input.memberId,
      },
    });
  },
  
  updateAcademicInfo: async (
    _: unknown,
    args: MutationUpdateAcademicInfoArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.academicInfo.update({
      where: { id: args.id },
      data: {
        ...(args.input.degree && { degree: args.input.degree }),
        ...(args.input.field !== undefined && { field: args.input.field }),
        ...(args.input.institution !== undefined && { institution: args.input.institution }),
        ...(args.input.graduationYear !== undefined && { graduationYear: args.input.graduationYear }),
      },
    });
  },
  
  deleteAcademicInfo: async (
    _: unknown,
    args: MutationDeleteAcademicInfoArgs,
    context: GraphQLContext
  ) => {
    await context.prisma.academicInfo.delete({
      where: { id: args.id },
    });
    return true;
  },
  
  // User mutations
  // Note: createUser and deleteUser should be handled by NextAuth
  // Only allow updating profile information (name, image)
  updateUser: async (
    _: unknown,
    args: MutationUpdateUserArgs,
    context: GraphQLContext
  ) => {
    // TODO: Add authorization check - users should only be able to update their own profile
    // if (context.user?.id !== args.id) {
    //   throw new Error('Unauthorized: You can only update your own profile');
    // }
    
    return await context.prisma.user.update({
      where: { id: args.id },
      data: {
        ...(args.input.name && { name: args.input.name }),
        ...(args.input.image !== undefined && { image: args.input.image }),
      },
    });
  },
  
  // Equipment assignment mutations (convenience methods)
  assignEquipmentToMember: async (
    _: unknown,
    args: MutationAssignEquipmentToMemberArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.equipment.update({
      where: { id: args.equipmentId },
      data: { memberId: args.memberId },
    });
  },
  
  unassignEquipmentFromMember: async (
    _: unknown,
    args: MutationUnassignEquipmentFromMemberArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.equipment.update({
      where: { id: args.equipmentId },
      data: { memberId: null },
    });
  },
  
  // Project-Member relationship mutations (M:N convenience methods)
  addMemberToProject: async (
    _: unknown,
    args: MutationAddMemberToProjectArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.project.update({
      where: { id: args.projectId },
      data: {
        members: {
          connect: { id: args.memberId },
        },
      },
    });
  },
  
  removeMemberFromProject: async (
    _: unknown,
    args: MutationRemoveMemberFromProjectArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.project.update({
      where: { id: args.projectId },
      data: {
        members: {
          disconnect: { id: args.memberId },
        },
      },
    });
  },
  
  // Publication-Member relationship mutations (M:N)
  addMemberToPublication: async (
    _: unknown,
    args: MutationAddMemberToPublicationArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.publication.update({
      where: { id: args.publicationId },
      data: {
        members: {
          connect: { id: args.memberId },
        },
      },
    });
  },
  
  removeMemberFromPublication: async (
    _: unknown,
    args: MutationRemoveMemberFromPublicationArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.publication.update({
      where: { id: args.publicationId },
      data: {
        members: {
          disconnect: { id: args.memberId },
        },
      },
    });
  },
  
  // Publication-Project relationship mutations (M:N)
  addProjectToPublication: async (
    _: unknown,
    args: MutationAddProjectToPublicationArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.publication.update({
      where: { id: args.publicationId },
      data: {
        projects: {
          connect: { id: args.projectId },
        },
      },
    });
  },
  
  removeProjectFromPublication: async (
    _: unknown,
    args: MutationRemoveProjectFromPublicationArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.publication.update({
      where: { id: args.publicationId },
      data: {
        projects: {
          disconnect: { id: args.projectId },
        },
      },
    });
  },
  
  // Event-Member relationship mutations (M:N)
  addMemberToEvent: async (
    _: unknown,
    args: MutationAddMemberToEventArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.event.update({
      where: { id: args.eventId },
      data: {
        attendees: {
          connect: { id: args.memberId },
        },
      },
    });
  },
  
  removeMemberFromEvent: async (
    _: unknown,
    args: MutationRemoveMemberFromEventArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.event.update({
      where: { id: args.eventId },
      data: {
        attendees: {
          disconnect: { id: args.memberId },
        },
      },
    });
  },
  
  // Event-Project relationship mutations (M:N)
  addProjectToEvent: async (
    _: unknown,
    args: MutationAddProjectToEventArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.event.update({
      where: { id: args.eventId },
      data: {
        projects: {
          connect: { id: args.projectId },
        },
      },
    });
  },
  
  removeProjectFromEvent: async (
    _: unknown,
    args: MutationRemoveProjectFromEventArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.event.update({
      where: { id: args.eventId },
      data: {
        projects: {
          disconnect: { id: args.projectId },
        },
      },
    });
  },
  
  // Grant-Project relationship mutations (M:N)
  addProjectToGrant: async (
    _: unknown,
    args: MutationAddProjectToGrantArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.grant.update({
      where: { id: args.grantId },
      data: {
        projects: {
          connect: { id: args.projectId },
        },
      },
    });
  },
  
  removeProjectFromGrant: async (
    _: unknown,
    args: MutationRemoveProjectFromGrantArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.grant.update({
      where: { id: args.grantId },
      data: {
        projects: {
          disconnect: { id: args.projectId },
        },
      },
    });
  },
  
  // Collaborator-Project relationship mutations (M:N)
  addCollaboratorToProject: async (
    _: unknown,
    args: MutationAddCollaboratorToProjectArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.project.update({
      where: { id: args.projectId },
      data: {
        collaborators: {
          connect: { id: args.collaboratorId },
        },
      },
    });
  },
  
  removeCollaboratorFromProject: async (
    _: unknown,
    args: MutationRemoveCollaboratorFromProjectArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.project.update({
      where: { id: args.projectId },
      data: {
        collaborators: {
          disconnect: { id: args.collaboratorId },
        },
      },
    });
  },
  
  // Event-Equipment relationship mutations (M:N)
  addEquipmentToEvent: async (
    _: unknown,
    args: MutationAddEquipmentToEventArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.event.update({
      where: { id: args.eventId },
      data: {
        equipments: {
          connect: { id: args.equipmentId },
        },
      },
    });
  },
  
  removeEquipmentFromEvent: async (
    _: unknown,
    args: MutationRemoveEquipmentFromEventArgs,
    context: GraphQLContext
  ) => {
    return await context.prisma.event.update({
      where: { id: args.eventId },
      data: {
        equipments: {
          disconnect: { id: args.equipmentId },
        },
      },
    });
  },
};

