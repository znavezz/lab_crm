import type { GraphQLContext } from '../context';

export const queries = {
  // Member queries
  members: async (_: unknown, __: unknown, context: GraphQLContext) => {
    return await context.prisma.member.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },
  
  member: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
    return await context.prisma.member.findUnique({
      where: { id },
    });
  },
  
  // Project queries
  projects: async (_: unknown, __: unknown, context: GraphQLContext) => {
    return await context.prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },
  
  project: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
    return await context.prisma.project.findUnique({
      where: { id },
    });
  },
  
  // Equipment queries
  equipments: async (_: unknown, __: unknown, context: GraphQLContext) => {
    return await context.prisma.equipment.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },
  
  equipment: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
    return await context.prisma.equipment.findUnique({
      where: { id },
    });
  },
  
  // Booking queries
  bookings: async (_: unknown, __: unknown, context: GraphQLContext) => {
    return await context.prisma.booking.findMany({
      orderBy: { startTime: 'asc' },
    });
  },
  
  booking: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
    return await context.prisma.booking.findUnique({
      where: { id },
    });
  },
  
  // Event queries
  events: async (_: unknown, __: unknown, context: GraphQLContext) => {
    return await context.prisma.event.findMany({
      orderBy: { date: 'asc' },
    });
  },
  
  event: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
    return await context.prisma.event.findUnique({
      where: { id },
    });
  },
  
  // Grant queries
  grants: async (_: unknown, __: unknown, context: GraphQLContext) => {
    return await context.prisma.grant.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },
  
  grant: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
    return await context.prisma.grant.findUnique({
      where: { id },
    });
  },
  
  // Publication queries
  publications: async (_: unknown, __: unknown, context: GraphQLContext) => {
    return await context.prisma.publication.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },
  
  publication: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
    return await context.prisma.publication.findUnique({
      where: { id },
    });
  },
  
  // Collaborator queries
  collaborators: async (_: unknown, __: unknown, context: GraphQLContext) => {
    return await context.prisma.collaborator.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },
  
  collaborator: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
    return await context.prisma.collaborator.findUnique({
      where: { id },
    });
  },
  
  // Document queries
  documents: async (_: unknown, __: unknown, context: GraphQLContext) => {
    return await context.prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },
  
  document: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
    return await context.prisma.document.findUnique({
      where: { id },
    });
  },
  
  // Expense queries
  expenses: async (_: unknown, __: unknown, context: GraphQLContext) => {
    return await context.prisma.expense.findMany({
      orderBy: { date: 'desc' },
    });
  },
  
  expense: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
    return await context.prisma.expense.findUnique({
      where: { id },
    });
  },
  
  // NoteTask queries
  noteTasks: async (_: unknown, __: unknown, context: GraphQLContext) => {
    return await context.prisma.noteTask.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },
  
  noteTask: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
    return await context.prisma.noteTask.findUnique({
      where: { id },
    });
  },
  
  // AcademicInfo queries
  academicInfos: async (_: unknown, __: unknown, context: GraphQLContext) => {
    return await context.prisma.academicInfo.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },
  
  academicInfo: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
    return await context.prisma.academicInfo.findUnique({
      where: { id },
    });
  },
  
  // User queries
  users: async (_: unknown, __: unknown, context: GraphQLContext) => {
    return await context.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },
  
  user: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
    return await context.prisma.user.findUnique({
      where: { id },
    });
  },
  
  currentUser: async (_: unknown, __: unknown, context: GraphQLContext) => {
    // Return current user from context (when auth is set up)
    if (!context.user) {
      return null;
    }
    return await context.prisma.user.findUnique({
      where: { id: context.user.id },
    });
  },
};

