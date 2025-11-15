import type { GraphQLContext } from '../context';

export const types = {
  // AcademicInfo resolvers
  AcademicInfo: {
    member: async (parent: { memberId: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.member.findUnique({
        where: { id: parent.memberId },
      });
    },
  },
  
  // Member resolvers
  Member: {
    academicInfo: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.academicInfo.findMany({
        where: { memberId: parent.id },
      });
    },
    user: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.user.findUnique({
        where: { memberId: parent.id },
      });
    },
    equipments: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.equipment.findMany({
        where: { memberId: parent.id },
      });
    },
    bookings: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.booking.findMany({
        where: { memberId: parent.id },
      });
    },
    projects: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.member.findUnique({
        where: { id: parent.id },
      }).projects();
    },
    publications: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.member.findUnique({
        where: { id: parent.id },
      }).publications();
    },
    events: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.member.findUnique({
        where: { id: parent.id },
      }).events();
    },
    documents: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.document.findMany({
        where: { memberId: parent.id },
      });
    },
    noteTasks: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.noteTask.findMany({
        where: { memberId: parent.id },
      });
    },
  },
  
  // Project resolvers
  Project: {
    equipments: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.equipment.findMany({
        where: { projectId: parent.id },
      });
    },
    bookings: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.booking.findMany({
        where: { projectId: parent.id },
      });
    },
    members: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.project.findUnique({
        where: { id: parent.id },
      }).members();
    },
    grants: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.project.findUnique({
        where: { id: parent.id },
      }).grants();
    },
    publications: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.project.findUnique({
        where: { id: parent.id },
      }).publications();
    },
    collaborators: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.project.findUnique({
        where: { id: parent.id },
      }).collaborators();
    },
    documents: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.document.findMany({
        where: { projectId: parent.id },
      });
    },
    events: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.project.findUnique({
        where: { id: parent.id },
      }).events();
    },
    expenses: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.expense.findMany({
        where: { projectId: parent.id },
      });
    },
    noteTasks: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.noteTask.findMany({
        where: { projectId: parent.id },
      });
    },
    totalInvestment: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      const expenses = await context.prisma.expense.findMany({
        where: { projectId: parent.id },
        select: { amount: true },
      });
      return expenses.reduce((sum, expense) => sum + expense.amount, 0);
    },
  },
  
  // Equipment resolvers
  Equipment: {
    project: async (parent: { projectId: string | null }, _: unknown, context: GraphQLContext) => {
      if (!parent.projectId) return null;
      return await context.prisma.project.findUnique({
        where: { id: parent.projectId },
      });
    },
    member: async (parent: { memberId: string | null }, _: unknown, context: GraphQLContext) => {
      if (!parent.memberId) return null;
      return await context.prisma.member.findUnique({
        where: { id: parent.memberId },
      });
    },
    bookings: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.booking.findMany({
        where: { equipmentId: parent.id },
      });
    },
    events: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.equipment.findUnique({
        where: { id: parent.id },
      }).events();
    },
    noteTasks: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.noteTask.findMany({
        where: { equipmentId: parent.id },
      });
    },
  },
  
  // Booking resolvers
  Booking: {
    equipment: async (parent: { equipmentId: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.equipment.findUnique({
        where: { id: parent.equipmentId },
      });
    },
    member: async (parent: { memberId: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.member.findUnique({
        where: { id: parent.memberId },
      });
    },
    project: async (parent: { projectId: string | null }, _: unknown, context: GraphQLContext) => {
      if (!parent.projectId) return null;
      return await context.prisma.project.findUnique({
        where: { id: parent.projectId },
      });
    },
    event: async (parent: { eventId: string | null }, _: unknown, context: GraphQLContext) => {
      if (!parent.eventId) return null;
      return await context.prisma.event.findUnique({
        where: { id: parent.eventId },
      });
    },
  },
  
  // Event resolvers
  Event: {
    attendees: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.event.findUnique({
        where: { id: parent.id },
      }).attendees();
    },
    projects: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.event.findUnique({
        where: { id: parent.id },
      }).projects();
    },
    tasks: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.noteTask.findMany({
        where: { eventId: parent.id },
      });
    },
    expenses: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.expense.findMany({
        where: { eventId: parent.id },
      });
    },
    equipments: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.event.findUnique({
        where: { id: parent.id },
      }).equipments();
    },
    bookings: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.booking.findMany({
        where: { eventId: parent.id },
      });
    },
  },
  
  // Grant resolvers
  Grant: {
    projects: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.grant.findUnique({
        where: { id: parent.id },
      }).projects();
    },
    expenses: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.expense.findMany({
        where: { grantId: parent.id },
      });
    },
    noteTasks: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.noteTask.findMany({
        where: { grantId: parent.id },
      });
    },
    totalSpent: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      const expenses = await context.prisma.expense.findMany({
        where: { grantId: parent.id },
        select: { amount: true },
      });
      return expenses.reduce((sum, expense) => sum + expense.amount, 0);
    },
    remainingBudget: async (parent: { id: string; budget: number }, _: unknown, context: GraphQLContext) => {
      const expenses = await context.prisma.expense.findMany({
        where: { grantId: parent.id },
        select: { amount: true },
      });
      const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      return parent.budget - totalSpent;
    },
  },
  
  // Publication resolvers
  Publication: {
    members: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.publication.findUnique({
        where: { id: parent.id },
      }).members();
    },
    projects: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.publication.findUnique({
        where: { id: parent.id },
      }).projects();
    },
    noteTasks: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.noteTask.findMany({
        where: { publicationId: parent.id },
      });
    },
  },
  
  // Collaborator resolvers
  Collaborator: {
    projects: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.collaborator.findUnique({
        where: { id: parent.id },
      }).projects();
    },
    noteTasks: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.noteTask.findMany({
        where: { collaboratorId: parent.id },
      });
    },
  },
  
  // Document resolvers
  Document: {
    project: async (parent: { projectId: string | null }, _: unknown, context: GraphQLContext) => {
      if (!parent.projectId) return null;
      return await context.prisma.project.findUnique({
        where: { id: parent.projectId },
      });
    },
    member: async (parent: { memberId: string | null }, _: unknown, context: GraphQLContext) => {
      if (!parent.memberId) return null;
      return await context.prisma.member.findUnique({
        where: { id: parent.memberId },
      });
    },
    noteTasks: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.noteTask.findMany({
        where: { documentId: parent.id },
      });
    },
  },
  
  // Expense resolvers
  Expense: {
    project: async (parent: { projectId: string | null }, _: unknown, context: GraphQLContext) => {
      if (!parent.projectId) return null;
      return await context.prisma.project.findUnique({
        where: { id: parent.projectId },
      });
    },
    grant: async (parent: { grantId: string | null }, _: unknown, context: GraphQLContext) => {
      if (!parent.grantId) return null;
      return await context.prisma.grant.findUnique({
        where: { id: parent.grantId },
      });
    },
    event: async (parent: { eventId: string | null }, _: unknown, context: GraphQLContext) => {
      if (!parent.eventId) return null;
      return await context.prisma.event.findUnique({
        where: { id: parent.eventId },
      });
    },
    noteTasks: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.noteTask.findMany({
        where: { expenseId: parent.id },
      });
    },
  },
  
  // NoteTask resolvers
  NoteTask: {
    member: async (parent: { memberId: string | null }, _: unknown, context: GraphQLContext) => {
      if (!parent.memberId) return null;
      return await context.prisma.member.findUnique({
        where: { id: parent.memberId },
      });
    },
    project: async (parent: { projectId: string | null }, _: unknown, context: GraphQLContext) => {
      if (!parent.projectId) return null;
      return await context.prisma.project.findUnique({
        where: { id: parent.projectId },
      });
    },
    grant: async (parent: { grantId: string | null }, _: unknown, context: GraphQLContext) => {
      if (!parent.grantId) return null;
      return await context.prisma.grant.findUnique({
        where: { id: parent.grantId },
      });
    },
    event: async (parent: { eventId: string | null }, _: unknown, context: GraphQLContext) => {
      if (!parent.eventId) return null;
      return await context.prisma.event.findUnique({
        where: { id: parent.eventId },
      });
    },
    publication: async (parent: { publicationId: string | null }, _: unknown, context: GraphQLContext) => {
      if (!parent.publicationId) return null;
      return await context.prisma.publication.findUnique({
        where: { id: parent.publicationId },
      });
    },
    document: async (parent: { documentId: string | null }, _: unknown, context: GraphQLContext) => {
      if (!parent.documentId) return null;
      return await context.prisma.document.findUnique({
        where: { id: parent.documentId },
      });
    },
    equipment: async (parent: { equipmentId: string | null }, _: unknown, context: GraphQLContext) => {
      if (!parent.equipmentId) return null;
      return await context.prisma.equipment.findUnique({
        where: { id: parent.equipmentId },
      });
    },
    collaborator: async (parent: { collaboratorId: string | null }, _: unknown, context: GraphQLContext) => {
      if (!parent.collaboratorId) return null;
      return await context.prisma.collaborator.findUnique({
        where: { id: parent.collaboratorId },
      });
    },
    expense: async (parent: { expenseId: string | null }, _: unknown, context: GraphQLContext) => {
      if (!parent.expenseId) return null;
      return await context.prisma.expense.findUnique({
        where: { id: parent.expenseId },
      });
    },
  },
  
  // User resolvers
  User: {
    member: async (parent: { memberId: string }, _: unknown, context: GraphQLContext) => {
      return await context.prisma.member.findUnique({
        where: { id: parent.memberId },
      });
    },
  },
};

