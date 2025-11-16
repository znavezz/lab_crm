// tests/graphql.test.ts
// GraphQL resolver integration tests

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { testPrisma, setupTestDatabase, teardownTestDatabase, cleanTestDatabase } from './setup';
import { testFactory, createTestContext } from './helpers';
import { queries } from '../src/graphql/resolvers/queries';
import { mutations } from '../src/graphql/resolvers/mutations';
import { types } from '../src/graphql/resolvers/types';

describe('GraphQL Resolvers', () => {
  const context = createTestContext();

  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await cleanTestDatabase();
  });

  describe('Query Resolvers', () => {
    describe('Member Queries', () => {
      it('should query all members', async () => {
        const member1 = await testFactory.createMember({ name: 'Member 1' });
        const member2 = await testFactory.createMember({ name: 'Member 2' });

        const result = await queries.members(undefined, undefined, context);
        expect(result.length).toBeGreaterThanOrEqual(2);
        expect(result.some(m => m.id === member1.id)).toBe(true);
        expect(result.some(m => m.id === member2.id)).toBe(true);
        expect(result[0].name).toBeTruthy();
      });

      it('should query member by id', async () => {
        const member = await testFactory.createMember({ name: 'Test Member' });

        const result = await queries.member(undefined, { id: member.id }, context);
        expect(result).toBeDefined();
        expect(result?.name).toBe('Test Member');
      });

      it('should return null when querying non-existent member', async () => {
        const result = await queries.member(undefined, { id: 'non-existent-id' }, context);
        expect(result).toBeNull();
      });
    });

    describe('Project Queries', () => {
      it('should query all projects', async () => {
        await testFactory.createProject({ title: 'Project 1' });
        await testFactory.createProject({ title: 'Project 2' });

        const result = await queries.projects(undefined, undefined, context);
        expect(result).toHaveLength(2);
      });

      it('should query project by id', async () => {
        const project = await testFactory.createProject({ title: 'Test Project' });

        const result = await queries.project(undefined, { id: project.id }, context);
        expect(result).toBeDefined();
        expect(result?.title).toBe('Test Project');
      });

      it('should return null when querying non-existent project', async () => {
        const result = await queries.project(undefined, { id: 'non-existent-id' }, context);
        expect(result).toBeNull();
      });
    });

    describe('Equipment Queries', () => {
      it('should query all equipments', async () => {
        await testFactory.createEquipment({ name: 'Equipment 1' });
        await testFactory.createEquipment({ name: 'Equipment 2' });

        const result = await queries.equipments(undefined, undefined, context);
        expect(result.length).toBeGreaterThanOrEqual(2);
      });

      it('should query equipment by id', async () => {
        const equipment = await testFactory.createEquipment({ name: 'Test Equipment' });

        const result = await queries.equipment(undefined, { id: equipment.id }, context);
        expect(result).toBeDefined();
        expect(result?.name).toBe('Test Equipment');
      });

      it('should return null when querying non-existent equipment', async () => {
        const result = await queries.equipment(undefined, { id: 'non-existent-id' }, context);
        expect(result).toBeNull();
      });
    });

    describe('Booking Queries', () => {
      it('should query all bookings', async () => {
        const { booking1, booking2 } = await testPrisma.$transaction(async (tx) => {
          const member = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const equipment = await tx.equipment.create({
            data: { name: 'Test Equipment', status: 'AVAILABLE' },
          });
          const startTime1 = new Date();
          const endTime1 = new Date(startTime1.getTime() + 60 * 60 * 1000);
          const startTime2 = new Date(startTime1.getTime() + 2 * 60 * 60 * 1000);
          const endTime2 = new Date(startTime2.getTime() + 60 * 60 * 1000);
          const b1 = await tx.booking.create({
            data: { startTime: startTime1, endTime: endTime1, equipmentId: equipment.id, memberId: member.id },
          });
          const b2 = await tx.booking.create({
            data: { startTime: startTime2, endTime: endTime2, equipmentId: equipment.id, memberId: member.id },
          });
          return { booking1: b1, booking2: b2 };
        });

        const result = await queries.bookings(undefined, undefined, context);
        expect(result.length).toBeGreaterThanOrEqual(2);
        expect(result.some(b => b.id === booking1.id)).toBe(true);
        expect(result.some(b => b.id === booking2.id)).toBe(true);
      });

      it('should query booking by id', async () => {
        const { booking } = await testPrisma.$transaction(async (tx) => {
          const member = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const equipment = await tx.equipment.create({
            data: { name: 'Test Equipment', status: 'AVAILABLE' },
          });
          const startTime = new Date();
          const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
          const b = await tx.booking.create({
            data: { startTime, endTime, equipmentId: equipment.id, memberId: member.id },
          });
          return { booking: b };
        });

        const result = await queries.booking(undefined, { id: booking.id }, context);
        expect(result).toBeDefined();
        expect(result?.id).toBe(booking.id);
      });
    });

    describe('Event Queries', () => {
      it('should query all events', async () => {
        await testFactory.createEvent({ title: 'Event 1', date: new Date() });
        await testFactory.createEvent({ title: 'Event 2', date: new Date() });

        const result = await queries.events(undefined, undefined, context);
        expect(result.length).toBeGreaterThanOrEqual(2);
      });

      it('should query event by id', async () => {
        const event = await testFactory.createEvent({ title: 'Test Event', date: new Date() });

        const result = await queries.event(undefined, { id: event.id }, context);
        expect(result).toBeDefined();
        expect(result?.title).toBe('Test Event');
      });
    });

    describe('Grant Queries', () => {
      it('should query all grants', async () => {
        const grant1 = await testFactory.createGrant({ name: 'Grant 1' });
        const grant2 = await testFactory.createGrant({ name: 'Grant 2' });

        const result = await queries.grants(undefined, undefined, context);
        expect(result.length).toBeGreaterThanOrEqual(2);
        expect(result.some(g => g.id === grant1.id)).toBe(true);
        expect(result.some(g => g.id === grant2.id)).toBe(true);
      });

      it('should query grant by id', async () => {
        const grant = await testFactory.createGrant({ name: 'Test Grant' });

        const result = await queries.grant(undefined, { id: grant.id }, context);
        expect(result).toBeDefined();
        expect(result?.name).toBe('Test Grant');
      });
    });

    describe('Publication Queries', () => {
      it('should query all publications', async () => {
        await testFactory.createPublication({ title: 'Publication 1' });
        await testFactory.createPublication({ title: 'Publication 2' });

        const result = await queries.publications(undefined, undefined, context);
        expect(result.length).toBeGreaterThanOrEqual(2);
      });

      it('should query publication by id', async () => {
        const publication = await testFactory.createPublication({ title: 'Test Publication' });

        const result = await queries.publication(undefined, { id: publication.id }, context);
        expect(result).toBeDefined();
        expect(result?.title).toBe('Test Publication');
      });
    });

    describe('Collaborator Queries', () => {
      it('should query all collaborators', async () => {
        await testFactory.createCollaborator({ name: 'Collaborator 1' });
        await testFactory.createCollaborator({ name: 'Collaborator 2' });

        const result = await queries.collaborators(undefined, undefined, context);
        expect(result.length).toBeGreaterThanOrEqual(2);
      });

      it('should query collaborator by id', async () => {
        const collaborator = await testFactory.createCollaborator({ name: 'Test Collaborator' });

        const result = await queries.collaborator(undefined, { id: collaborator.id }, context);
        expect(result).toBeDefined();
        expect(result?.name).toBe('Test Collaborator');
      });
    });

    describe('Document Queries', () => {
      it('should query all documents', async () => {
        await testFactory.createDocument({ filename: 'doc1.pdf', url: 'https://example.com/doc1.pdf' });
        await testFactory.createDocument({ filename: 'doc2.pdf', url: 'https://example.com/doc2.pdf' });

        const result = await queries.documents(undefined, undefined, context);
        expect(result.length).toBeGreaterThanOrEqual(2);
      });

      it('should query document by id', async () => {
        const document = await testFactory.createDocument({ filename: 'test.pdf', url: 'https://example.com/test.pdf' });

        const result = await queries.document(undefined, { id: document.id }, context);
        expect(result).toBeDefined();
        expect(result?.filename).toBe('test.pdf');
      });
    });

    describe('Expense Queries', () => {
      it('should query all expenses', async () => {
        const { expense1, expense2 } = await testPrisma.$transaction(async (tx) => {
          const project = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const e1 = await tx.expense.create({
            data: { description: 'Expense 1', amount: 100, date: new Date(), projectId: project.id },
          });
          const e2 = await tx.expense.create({
            data: { description: 'Expense 2', amount: 200, date: new Date(), projectId: project.id },
          });
          return { expense1: e1, expense2: e2 };
        });

        const result = await queries.expenses(undefined, undefined, context);
        expect(result.length).toBeGreaterThanOrEqual(2);
        expect(result.some(e => e.id === expense1.id)).toBe(true);
        expect(result.some(e => e.id === expense2.id)).toBe(true);
      });

      it('should query expense by id', async () => {
        const { expense } = await testPrisma.$transaction(async (tx) => {
          const project = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const e = await tx.expense.create({
            data: { description: 'Test Expense', amount: 1000, date: new Date(), projectId: project.id },
          });
          return { expense: e };
        });

        const result = await queries.expense(undefined, { id: expense.id }, context);
        expect(result).toBeDefined();
        expect(result?.description).toBe('Test Expense');
      });
    });

    describe('NoteTask Queries', () => {
      it('should query all noteTasks', async () => {
        await testFactory.createNoteTask({ title: 'Task 1', content: 'Content 1' });
        await testFactory.createNoteTask({ title: 'Task 2', content: 'Content 2' });

        const result = await queries.noteTasks(undefined, undefined, context);
        expect(result.length).toBeGreaterThanOrEqual(2);
      });

      it('should query noteTask by id', async () => {
        const noteTask = await testFactory.createNoteTask({ title: 'Test Task', content: 'Test Content' });

        const result = await queries.noteTask(undefined, { id: noteTask.id }, context);
        expect(result).toBeDefined();
        expect(result?.title).toBe('Test Task');
      });
    });

    describe('AcademicInfo Queries', () => {
      it('should query all academicInfos', async () => {
        const { academicInfo1, academicInfo2 } = await testPrisma.$transaction(async (tx) => {
          const member = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const ai1 = await tx.academicInfo.create({
            data: { degree: 'BSc', memberId: member.id },
          });
          const ai2 = await tx.academicInfo.create({
            data: { degree: 'MSc', memberId: member.id },
          });
          return { academicInfo1: ai1, academicInfo2: ai2 };
        });

        const result = await queries.academicInfos(undefined, undefined, context);
        expect(result.length).toBeGreaterThanOrEqual(2);
        expect(result.some(ai => ai.id === academicInfo1.id)).toBe(true);
        expect(result.some(ai => ai.id === academicInfo2.id)).toBe(true);
      });

      it('should query academicInfo by id', async () => {
        const { academicInfo } = await testPrisma.$transaction(async (tx) => {
          const member = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const ai = await tx.academicInfo.create({
            data: { degree: 'PhD', memberId: member.id },
          });
          return { academicInfo: ai };
        });

        const result = await queries.academicInfo(undefined, { id: academicInfo.id }, context);
        expect(result).toBeDefined();
        expect(result?.degree).toBe('PhD');
      });
    });

    describe('User Queries', () => {
      it('should query all users', async () => {
        const { user1, user2 } = await testPrisma.$transaction(async (tx) => {
          const u1 = await tx.user.create({
            data: { email: 'user1@example.com', name: 'User 1' },
          });
          const u2 = await tx.user.create({
            data: { email: 'user2@example.com', name: 'User 2' },
          });
          return { user1: u1, user2: u2 };
        });

        const result = await queries.users(undefined, undefined, context);
        expect(result.length).toBeGreaterThanOrEqual(2);
        expect(result.some(u => u.id === user1.id)).toBe(true);
        expect(result.some(u => u.id === user2.id)).toBe(true);
      });

      it('should query user by id', async () => {
        const { user } = await testPrisma.$transaction(async (tx) => {
          const u = await tx.user.create({
            data: { email: 'test@example.com', name: 'Test User' },
          });
          return { user: u };
        });

        const result = await queries.user(undefined, { id: user.id }, context);
        expect(result).toBeDefined();
        expect(result?.email).toBe('test@example.com');
      });

      it('should return null for currentUser when not authenticated', async () => {
        const result = await queries.currentUser(undefined, undefined, context);
        expect(result).toBeNull();
      });

      it('should return current user when authenticated', async () => {
        const { user } = await testPrisma.$transaction(async (tx) => {
          const u = await tx.user.create({
            data: { email: 'authenticated@example.com', name: 'Authenticated User' },
          });
          return { user: u };
        });

        const authenticatedContext = {
          prisma: testPrisma,
          user: { id: user.id, email: user.email, name: user.name, memberId: null },
        };

        const result = await queries.currentUser(undefined, undefined, authenticatedContext);
        expect(result).toBeDefined();
        expect(result?.id).toBe(user.id);
        expect(result?.email).toBe('authenticated@example.com');
      });
    });
  });

  describe('Mutation Resolvers', () => {
    describe('Member Mutations', () => {
      it('should create member via mutation', async () => {
        const result = await mutations.createMember(
          undefined,
          {
            input: {
              name: 'New Member',
              rank: 'MSc',
              status: 'ACTIVE',
              role: 'STUDENT',
            },
          },
          context
        );

        expect(result.name).toBe('New Member');
        expect(result.rank).toBe('MSc');
        expect(result.status).toBe('ACTIVE');
      });

      it('should update member via mutation', async () => {
        const member = await testFactory.createMember({ name: 'Original Name' });

        const result = await mutations.updateMember(
          undefined,
          {
            id: member.id,
            input: { name: 'Updated Name' },
          },
          context
        );

        expect(result.name).toBe('Updated Name');
      });

      it('should update member with falsy name (should not update)', async () => {
        const member = await testFactory.createMember({ name: 'Original Name' });

        const result = await mutations.updateMember(
          undefined,
          {
            id: member.id,
            input: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              name: null as any, // Falsy value should not update
            },
          },
          context
        );

        // When name is falsy, it should not be updated
        expect(result.name).toBe('Original Name');
      });

      it('should delete member via mutation', async () => {
        const member = await testFactory.createMember();

        const result = await mutations.deleteMember(
          undefined,
          { id: member.id },
          context
        );

        expect(result).toBe(true);

        const deleted = await testPrisma.member.findUnique({
          where: { id: member.id },
        });
        expect(deleted).toBeNull();
      });
    });

    describe('Project Mutations', () => {
      it('should create project via mutation', async () => {
        const result = await mutations.createProject(
          undefined,
          {
            input: {
              title: 'New Project',
              description: 'Project description',
            },
          },
          context
        );

        expect(result.title).toBe('New Project');
        expect(result.description).toBe('Project description');
      });

      it('should update project via mutation', async () => {
        const project = await testFactory.createProject({ title: 'Original Title' });

        const result = await mutations.updateProject(
          undefined,
          {
            id: project.id,
            input: { title: 'Updated Title' },
          },
          context
        );

        expect(result.title).toBe('Updated Title');
      });

      it('should update project with undefined optional fields', async () => {
        const project = await testFactory.createProject({
          title: 'Original Title',
          description: 'Original Description',
          startDate: new Date('2020-01-01'),
          endDate: new Date('2021-01-01'),
        });

        const result = await mutations.updateProject(
          undefined,
          {
            id: project.id,
            input: {
              description: undefined,
              startDate: undefined,
              endDate: undefined,
            },
          },
          context
        );

        // When fields are undefined, they should not be updated
        expect(result.description).toBe('Original Description');
        expect(result.startDate).toEqual(new Date('2020-01-01'));
        expect(result.endDate).toEqual(new Date('2021-01-01'));
      });

      it('should update project with falsy title (should not update)', async () => {
        const project = await testFactory.createProject({
          title: 'Original Title',
        });

        const result = await mutations.updateProject(
          undefined,
          {
            id: project.id,
            input: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              title: null as any, // Falsy value should not update
            },
          },
          context
        );

        // When title is falsy, it should not be updated
        expect(result.title).toBe('Original Title');
      });

      it('should update project with falsy startDate and endDate (should not update)', async () => {
        const project = await testFactory.createProject({
          title: 'Original Title',
          startDate: new Date('2020-01-01'),
          endDate: new Date('2021-01-01'),
        });

        const result = await mutations.updateProject(
          undefined,
          {
            id: project.id,
            input: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              startDate: null as any, // Falsy value should not update
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              endDate: null as any, // Falsy value should not update
            },
          },
          context
        );

        // When startDate/endDate are falsy, they should not be updated
        expect(result.startDate).toEqual(new Date('2020-01-01'));
        expect(result.endDate).toEqual(new Date('2021-01-01'));
      });

      it('should delete project via mutation', async () => {
        const project = await testFactory.createProject();

        const result = await mutations.deleteProject(
          undefined,
          { id: project.id },
          context
        );

        expect(result).toBe(true);

        const deleted = await testPrisma.project.findUnique({
          where: { id: project.id },
        });
        expect(deleted).toBeNull();
      });
    });

    describe('Booking Mutations', () => {
      it('should create booking via mutation', async () => {
        const member = await testFactory.createMember();
        const equipment = await testFactory.createEquipment();
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000);

        const result = await mutations.createBooking(
          undefined,
          {
            input: {
              startTime,
              endTime,
              purpose: 'Test booking',
              equipmentId: equipment.id,
              memberId: member.id,
            },
          },
          context
        );

        expect(result.equipmentId).toBe(equipment.id);
        expect(result.memberId).toBe(member.id);
        expect(result.purpose).toBe('Test booking');
      });

      it('should update booking via mutation', async () => {
        const { booking } = await testPrisma.$transaction(async (tx) => {
          const member = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const equipment = await tx.equipment.create({
            data: { name: 'Test Equipment', status: 'AVAILABLE' },
          });
          const startTime = new Date();
          const endTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000);
          const b = await tx.booking.create({
            data: {
              startTime,
              endTime,
              purpose: 'Original Purpose',
              equipmentId: equipment.id,
              memberId: member.id,
            },
          });
          return { booking: b };
        });

        const newEndTime = new Date(booking.endTime.getTime() + 2 * 60 * 60 * 1000);
        const result = await mutations.updateBooking(
          undefined,
          {
            id: booking.id,
            input: {
              purpose: 'Updated Purpose',
              endTime: newEndTime,
            },
          },
          context
        );

        expect(result.purpose).toBe('Updated Purpose');
        expect(result.endTime.getTime()).toBe(newEndTime.getTime());
      });

      it('should update booking with undefined optional fields', async () => {
        const { booking, project, event } = await testPrisma.$transaction(async (tx) => {
          const member = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const equipment = await tx.equipment.create({
            data: { name: 'Test Equipment', status: 'AVAILABLE' },
          });
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const e = await tx.event.create({
            data: { title: 'Test Event', date: new Date() },
          });
          const startTime = new Date();
          const endTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000);
          const b = await tx.booking.create({
            data: {
              startTime,
              endTime,
              purpose: 'Original Purpose',
              equipmentId: equipment.id,
              memberId: member.id,
              projectId: p.id,
              eventId: e.id,
            },
          });
          return { booking: b, project: p, event: e };
        });

        const result = await mutations.updateBooking(
          undefined,
          {
            id: booking.id,
            input: {
              purpose: undefined,
              projectId: undefined,
              eventId: undefined,
            },
          },
          context
        );

        // When fields are undefined, they should not be updated
        expect(result.purpose).toBe('Original Purpose');
        expect(result.projectId).toBe(project.id);
        expect(result.eventId).toBe(event.id);
      });

      it('should update booking with falsy startTime and endTime (should not update)', async () => {
        const { booking } = await testPrisma.$transaction(async (tx) => {
          const member = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const equipment = await tx.equipment.create({
            data: { name: 'Test Equipment', status: 'AVAILABLE' },
          });
          const originalStartTime = new Date('2020-01-01T10:00:00');
          const originalEndTime = new Date('2020-01-01T12:00:00');
          const b = await tx.booking.create({
            data: {
              startTime: originalStartTime,
              endTime: originalEndTime,
              purpose: 'Original Purpose',
              equipmentId: equipment.id,
              memberId: member.id,
            },
          });
          return { booking: b };
        });

        const result = await mutations.updateBooking(
          undefined,
          {
            id: booking.id,
            input: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              startTime: null as any, // Falsy value should not update
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              endTime: null as any, // Falsy value should not update
            },
          },
          context
        );

        // When startTime/endTime are falsy, they should not be updated
        expect(result.startTime).toEqual(new Date('2020-01-01T10:00:00'));
        expect(result.endTime).toEqual(new Date('2020-01-01T12:00:00'));
      });

      it('should update booking with falsy equipmentId and memberId (should not update)', async () => {
        const { booking } = await testPrisma.$transaction(async (tx) => {
          const member = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const equipment = await tx.equipment.create({
            data: { name: 'Test Equipment', status: 'AVAILABLE' },
          });
          const startTime = new Date();
          const endTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000);
          const b = await tx.booking.create({
            data: {
              startTime,
              endTime,
              purpose: 'Original Purpose',
              equipmentId: equipment.id,
              memberId: member.id,
            },
          });
          return { booking: b };
        });

        const result = await mutations.updateBooking(
          undefined,
          {
            id: booking.id,
            input: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              equipmentId: null as any, // Falsy value should not update
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              memberId: null as any, // Falsy value should not update
            },
          },
          context
        );

        // When equipmentId/memberId are falsy, they should not be updated
        expect(result.equipmentId).toBe(booking.equipmentId);
        expect(result.memberId).toBe(booking.memberId);
      });

      it('should delete booking via mutation', async () => {
        const { booking } = await testPrisma.$transaction(async (tx) => {
          const member = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const equipment = await tx.equipment.create({
            data: { name: 'Test Equipment', status: 'AVAILABLE' },
          });
          const startTime = new Date();
          const endTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000);
          const b = await tx.booking.create({
            data: {
              startTime,
              endTime,
              purpose: 'Test booking',
              equipmentId: equipment.id,
              memberId: member.id,
            },
          });
          return { booking: b };
        });

        const result = await mutations.deleteBooking(
          undefined,
          { id: booking.id },
          context
        );

        expect(result).toBe(true);

        const deleted = await testPrisma.booking.findUnique({
          where: { id: booking.id },
        });
        expect(deleted).toBeNull();
      });
    });

    describe('Grant Mutations', () => {
      it('should create grant via mutation', async () => {
        const deadline = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        const result = await mutations.createGrant(
          undefined,
          {
            input: {
              name: 'New Grant',
              budget: 100000,
              deadline,
            },
          },
          context
        );

        expect(result.name).toBe('New Grant');
        expect(result.budget).toBe(100000);
      });

      it('should update grant via mutation', async () => {
        const deadline = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        const grant = await testFactory.createGrant({
          name: 'Original Grant',
          budget: 50000,
          deadline,
        });

        const newDeadline = new Date(Date.now() + 730 * 24 * 60 * 60 * 1000);
        const result = await mutations.updateGrant(
          undefined,
          {
            id: grant.id,
            input: {
              name: 'Updated Grant',
              budget: 150000,
              deadline: newDeadline,
            },
          },
          context
        );

        expect(result.name).toBe('Updated Grant');
        expect(result.budget).toBe(150000);
      });

      it('should update grant with falsy name (should not update)', async () => {
        const deadline = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        const grant = await testFactory.createGrant({
          name: 'Original Grant',
          budget: 50000,
          deadline,
        });

        const result = await mutations.updateGrant(
          undefined,
          {
            id: grant.id,
            input: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              name: null as any, // Falsy value should not update
            },
          },
          context
        );

        // When name is falsy, it should not be updated
        expect(result.name).toBe('Original Grant');
      });

      it('should delete grant via mutation', async () => {
        const deadline = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        const grant = await testFactory.createGrant({
          name: 'Test Grant',
          budget: 100000,
          deadline,
        });

        const result = await mutations.deleteGrant(
          undefined,
          { id: grant.id },
          context
        );

        expect(result).toBe(true);

        const deleted = await testPrisma.grant.findUnique({
          where: { id: grant.id },
        });
        expect(deleted).toBeNull();
      });
    });

    describe('Equipment Mutations', () => {
      it('should create equipment via mutation', async () => {
        const result = await mutations.createEquipment(
          undefined,
          {
            input: {
              name: 'New Equipment',
              description: 'Equipment description',
              serialNumber: 'SN123456',
              status: 'AVAILABLE',
            },
          },
          context
        );

        expect(result.name).toBe('New Equipment');
        expect(result.description).toBe('Equipment description');
        expect(result.serialNumber).toBe('SN123456');
        expect(result.status).toBe('AVAILABLE');
      });

      it('should update equipment via mutation', async () => {
        const equipment = await testFactory.createEquipment({
          name: 'Original Equipment',
          status: 'AVAILABLE',
        });

        const result = await mutations.updateEquipment(
          undefined,
          {
            id: equipment.id,
            input: {
              name: 'Updated Equipment',
              status: 'IN_USE',
            },
          },
          context
        );

        expect(result.name).toBe('Updated Equipment');
        expect(result.status).toBe('IN_USE');
      });

      it('should update equipment with falsy name (should not update)', async () => {
        const equipment = await testFactory.createEquipment({
          name: 'Original Equipment',
          status: 'AVAILABLE',
        });

        const result = await mutations.updateEquipment(
          undefined,
          {
            id: equipment.id,
            input: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              name: null as any, // Falsy value should not update
            },
          },
          context
        );

        // When name is falsy, it should not be updated
        expect(result.name).toBe('Original Equipment');
      });

      it('should update equipment with member assignment', async () => {
        const { member, equipment } = await testPrisma.$transaction(async (tx) => {
          const m = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const e = await tx.equipment.create({
            data: { name: 'Test Equipment', status: 'AVAILABLE' },
          });
          return { member: m, equipment: e };
        });

        const result = await mutations.updateEquipment(
          undefined,
          {
            id: equipment.id,
            input: {
              memberId: member.id,
            },
          },
          context
        );

        expect(result.memberId).toBe(member.id);
      });

      it('should disconnect equipment from member when memberId is null', async () => {
        const { equipment } = await testPrisma.$transaction(async (tx) => {
          const m = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const e = await tx.equipment.create({
            data: {
              name: 'Test Equipment',
              status: 'AVAILABLE',
              memberId: m.id,
            },
          });
          return { equipment: e };
        });

        const result = await mutations.updateEquipment(
          undefined,
          {
            id: equipment.id,
            input: {
              memberId: null,
            },
          },
          context
        );

        expect(result.memberId).toBeNull();
      });

      it('should connect equipment to project', async () => {
        const { project, equipment } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const e = await tx.equipment.create({
            data: { name: 'Test Equipment', status: 'AVAILABLE' },
          });
          return { project: p, equipment: e };
        });

        const result = await mutations.updateEquipment(
          undefined,
          {
            id: equipment.id,
            input: {
              projectId: project.id,
            },
          },
          context
        );

        expect(result.projectId).toBe(project.id);
      });

      it('should disconnect equipment from project when projectId is null', async () => {
        const { equipment } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const e = await tx.equipment.create({
            data: {
              name: 'Test Equipment',
              status: 'AVAILABLE',
              projectId: p.id,
            },
          });
          return { equipment: e };
        });

        const result = await mutations.updateEquipment(
          undefined,
          {
            id: equipment.id,
            input: {
              projectId: null,
            },
          },
          context
        );

        expect(result.projectId).toBeNull();
      });

      it('should delete equipment via mutation', async () => {
        const equipment = await testFactory.createEquipment();

        const result = await mutations.deleteEquipment(
          undefined,
          { id: equipment.id },
          context
        );

        expect(result).toBe(true);

        const deleted = await testPrisma.equipment.findUnique({
          where: { id: equipment.id },
        });
        expect(deleted).toBeNull();
      });
    });

    describe('Event Mutations', () => {
      it('should create event via mutation', async () => {
        const date = new Date();
        const result = await mutations.createEvent(
          undefined,
          {
            input: {
              title: 'New Event',
              description: 'Event description',
              date,
              location: 'Conference Room',
            },
          },
          context
        );

        expect(result.title).toBe('New Event');
        expect(result.description).toBe('Event description');
        expect(result.location).toBe('Conference Room');
      });

      it('should update event via mutation', async () => {
        const date = new Date();
        const event = await testFactory.createEvent({
          title: 'Original Event',
          date,
        });

        const newDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
        const result = await mutations.updateEvent(
          undefined,
          {
            id: event.id,
            input: {
              title: 'Updated Event',
              location: 'New Location',
              date: newDate,
            },
          },
          context
        );

        expect(result.title).toBe('Updated Event');
        expect(result.location).toBe('New Location');
      });

      it('should update event with null location', async () => {
        const date = new Date();
        const event = await testFactory.createEvent({
          title: 'Original Event',
          date,
          location: 'Original Location',
        });

        const result = await mutations.updateEvent(
          undefined,
          {
            id: event.id,
            input: {
              location: null,
            },
          },
          context
        );

        expect(result.location).toBeNull();
      });

      it('should update event with undefined description', async () => {
        const date = new Date();
        const event = await testFactory.createEvent({
          title: 'Original Event',
          date,
          description: 'Original Description',
        });

        const result = await mutations.updateEvent(
          undefined,
          {
            id: event.id,
            input: {
              description: undefined,
            },
          },
          context
        );

        // When description is undefined, it should not be updated
        expect(result.description).toBe('Original Description');
      });

      it('should update event with falsy date (should not update)', async () => {
        const originalDate = new Date('2020-01-01');
        const event = await testFactory.createEvent({
          title: 'Original Event',
          date: originalDate,
        });

        const result = await mutations.updateEvent(
          undefined,
          {
            id: event.id,
            input: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              date: null as any, // Falsy value should not update
            },
          },
          context
        );

        // When date is falsy, it should not be updated
        expect(result.date).toEqual(originalDate);
      });

      it('should update event with falsy title (should not update)', async () => {
        const date = new Date();
        const event = await testFactory.createEvent({
          title: 'Original Event',
          date,
        });

        const result = await mutations.updateEvent(
          undefined,
          {
            id: event.id,
            input: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              title: null as any, // Falsy value should not update
            },
          },
          context
        );

        // When title is falsy, it should not be updated
        expect(result.title).toBe('Original Event');
      });

      it('should delete event via mutation', async () => {
        const date = new Date();
        const event = await testFactory.createEvent({
          title: 'Test Event',
          date,
        });

        const result = await mutations.deleteEvent(
          undefined,
          { id: event.id },
          context
        );

        expect(result).toBe(true);

        const deleted = await testPrisma.event.findUnique({
          where: { id: event.id },
        });
        expect(deleted).toBeNull();
      });
    });

    describe('Publication Mutations', () => {
      it('should create publication via mutation', async () => {
        const result = await mutations.createPublication(
          undefined,
          {
            input: {
              title: 'New Publication',
              published: new Date(),
              doi: '10.1000/test',
              url: 'https://example.com/paper',
            },
          },
          context
        );

        expect(result.title).toBe('New Publication');
        expect(result.doi).toBe('10.1000/test');
        expect(result.url).toBe('https://example.com/paper');
      });

      it('should create publication with null optional fields', async () => {
        const result = await mutations.createPublication(
          undefined,
          {
            input: {
              title: 'New Publication',
              published: null,
              doi: null,
              url: null,
            },
          },
          context
        );

        expect(result.title).toBe('New Publication');
        expect(result.published).toBeNull();
        expect(result.doi).toBeNull();
        expect(result.url).toBeNull();
      });

      it('should update publication via mutation', async () => {
        const publication = await testFactory.createPublication({
          title: 'Original Publication',
        });

        const result = await mutations.updatePublication(
          undefined,
          {
            id: publication.id,
            input: {
              title: 'Updated Publication',
              doi: '10.1000/updated',
            },
          },
          context
        );

        expect(result.title).toBe('Updated Publication');
        expect(result.doi).toBe('10.1000/updated');
      });

      it('should update publication with undefined/null optional fields', async () => {
        const publication = await testFactory.createPublication({
          title: 'Original Publication',
          published: new Date(),
          doi: '10.1000/original',
          url: 'https://example.com/original',
        });

        const result = await mutations.updatePublication(
          undefined,
          {
            id: publication.id,
            input: {
              published: undefined,
              doi: undefined,
              url: null,
            },
          },
          context
        );

        // When fields are undefined, they should not be updated
        expect(result.published).toBeInstanceOf(Date);
        expect(result.doi).toBe('10.1000/original');
        // When url is null, it should be set to null
        expect(result.url).toBeNull();
      });

      it('should update publication with falsy title (should not update)', async () => {
        const publication = await testFactory.createPublication({
          title: 'Original Publication',
        });

        const result = await mutations.updatePublication(
          undefined,
          {
            id: publication.id,
            input: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              title: null as any, // Falsy value should not update
            },
          },
          context
        );

        // When title is falsy, it should not be updated
        expect(result.title).toBe('Original Publication');
      });

      it('should delete publication via mutation', async () => {
        const publication = await testFactory.createPublication();

        const result = await mutations.deletePublication(
          undefined,
          { id: publication.id },
          context
        );

        expect(result).toBe(true);

        const deleted = await testPrisma.publication.findUnique({
          where: { id: publication.id },
        });
        expect(deleted).toBeNull();
      });
    });

    describe('Collaborator Mutations', () => {
      it('should create collaborator via mutation', async () => {
        const result = await mutations.createCollaborator(
          undefined,
          {
            input: {
              name: 'New Collaborator',
              organization: 'Test Organization',
            },
          },
          context
        );

        expect(result.name).toBe('New Collaborator');
        expect(result.organization).toBe('Test Organization');
      });

      it('should update collaborator via mutation', async () => {
        const collaborator = await testFactory.createCollaborator({
          name: 'Original Collaborator',
        });

        const result = await mutations.updateCollaborator(
          undefined,
          {
            id: collaborator.id,
            input: {
              name: 'Updated Collaborator',
              organization: 'New Organization',
            },
          },
          context
        );

        expect(result.name).toBe('Updated Collaborator');
        expect(result.organization).toBe('New Organization');
      });

      it('should update collaborator with undefined organization', async () => {
        const collaborator = await testFactory.createCollaborator({
          name: 'Original Collaborator',
          organization: 'Original Organization',
        });

        const result = await mutations.updateCollaborator(
          undefined,
          {
            id: collaborator.id,
            input: {
              organization: undefined,
            },
          },
          context
        );

        // When organization is undefined, it should not be updated
        expect(result.organization).toBe('Original Organization');
      });

      it('should update collaborator with falsy name (should not update)', async () => {
        const collaborator = await testFactory.createCollaborator({
          name: 'Original Collaborator',
        });

        const result = await mutations.updateCollaborator(
          undefined,
          {
            id: collaborator.id,
            input: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              name: null as any, // Falsy value should not update
            },
          },
          context
        );

        // When name is falsy, it should not be updated
        expect(result.name).toBe('Original Collaborator');
      });

      it('should delete collaborator via mutation', async () => {
        const collaborator = await testFactory.createCollaborator();

        const result = await mutations.deleteCollaborator(
          undefined,
          { id: collaborator.id },
          context
        );

        expect(result).toBe(true);

        const deleted = await testPrisma.collaborator.findUnique({
          where: { id: collaborator.id },
        });
        expect(deleted).toBeNull();
      });
    });

    describe('Document Mutations', () => {
      it('should create document via mutation', async () => {
        const result = await mutations.createDocument(
          undefined,
          {
            input: {
              filename: 'test.pdf',
              url: 'https://example.com/test.pdf',
            },
          },
          context
        );

        expect(result.filename).toBe('test.pdf');
        expect(result.url).toBe('https://example.com/test.pdf');
      });

      it('should update document via mutation', async () => {
        const document = await testFactory.createDocument({
          filename: 'original.pdf',
          url: 'https://example.com/original.pdf',
        });

        const result = await mutations.updateDocument(
          undefined,
          {
            id: document.id,
            input: {
              filename: 'updated.pdf',
              url: 'https://example.com/updated.pdf',
            },
          },
          context
        );

        expect(result.filename).toBe('updated.pdf');
        expect(result.url).toBe('https://example.com/updated.pdf');
      });

      it('should update document with undefined projectId and memberId', async () => {
        const { document, project, member } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const m = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const d = await tx.document.create({
            data: {
              filename: 'test.pdf',
              url: 'https://example.com/test.pdf',
              projectId: p.id,
              memberId: m.id,
            },
          });
          return { document: d, project: p, member: m };
        });

        const result = await mutations.updateDocument(
          undefined,
          {
            id: document.id,
            input: {
              projectId: undefined,
              memberId: undefined,
            },
          },
          context
        );

        // When projectId/memberId are undefined, they should not be updated
        expect(result.projectId).toBe(project.id);
        expect(result.memberId).toBe(member.id);
      });

      it('should update document with falsy filename and url (should not update)', async () => {
        const document = await testFactory.createDocument({
          filename: 'original.pdf',
          url: 'https://example.com/original.pdf',
        });

        const result = await mutations.updateDocument(
          undefined,
          {
            id: document.id,
            input: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              filename: null as any, // Falsy value should not update
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              url: null as any, // Falsy value should not update
            },
          },
          context
        );

        // When filename/url are falsy, they should not be updated
        expect(result.filename).toBe('original.pdf');
        expect(result.url).toBe('https://example.com/original.pdf');
      });

      it('should delete document via mutation', async () => {
        const document = await testFactory.createDocument();

        const result = await mutations.deleteDocument(
          undefined,
          { id: document.id },
          context
        );

        expect(result).toBe(true);

        const deleted = await testPrisma.document.findUnique({
          where: { id: document.id },
        });
        expect(deleted).toBeNull();
      });
    });

    describe('Expense Mutations', () => {
      it('should create expense via mutation', async () => {
        const { project } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          return { project: p };
        });

        const date = new Date();
        const result = await mutations.createExpense(
          undefined,
          {
            input: {
              description: 'Test Expense',
              amount: 1000,
              date,
          projectId: project.id,
            },
          },
          context
        );

        expect(result.description).toBe('Test Expense');
        expect(result.amount).toBe(1000);
        expect(result.projectId).toBe(project.id);
      });

      it('should create expense with null date (uses default)', async () => {
        const { project } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          return { project: p };
        });

        const result = await mutations.createExpense(
          undefined,
          {
            input: {
              description: 'New Expense',
              amount: 2000,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              date: null as any,
              projectId: project.id,
            },
          },
          context
        );

        expect(result.description).toBe('New Expense');
        expect(result.amount).toBe(2000);
        // When date is null, it should use new Date() as default
        expect(result.date).toBeInstanceOf(Date);
      });

      it('should update expense via mutation', async () => {
        const { expense } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const e = await tx.expense.create({
            data: {
              description: 'Original Expense',
          amount: 500,
              date: new Date(),
              projectId: p.id,
            },
          });
          return { expense: e };
        });

        const result = await mutations.updateExpense(
          undefined,
          {
            id: expense.id,
            input: {
              description: 'Updated Expense',
              amount: 1500,
            },
          },
          context
        );

        expect(result.description).toBe('Updated Expense');
        expect(result.amount).toBe(1500);
      });

      it('should update expense with valid date', async () => {
        const { expense } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const originalDate = new Date('2020-01-01');
          const e = await tx.expense.create({
            data: {
              description: 'Original Expense',
              amount: 500,
              date: originalDate,
              projectId: p.id,
            },
          });
          return { expense: e };
        });

        const newDate = new Date('2021-01-01');
        const result = await mutations.updateExpense(
          undefined,
          {
            id: expense.id,
            input: {
              date: newDate, // Valid date should update
            },
          },
          context
        );

        // When date is truthy, it should be updated
        expect(result.date).toEqual(newDate);
      });

      it('should update expense with falsy date (should not update)', async () => {
        const { expense } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const originalDate = new Date('2020-01-01');
          const e = await tx.expense.create({
            data: {
              description: 'Original Expense',
              amount: 500,
              date: originalDate,
              projectId: p.id,
            },
          });
          return { expense: e };
        });

        const result = await mutations.updateExpense(
          undefined,
          {
            id: expense.id,
            input: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              date: null as any, // Falsy value should not update
            },
          },
          context
        );

        // When date is falsy, it should not be updated
        expect(result.date).toEqual(new Date('2020-01-01'));
      });

      it('should update expense with undefined date (should not update)', async () => {
        const { expense } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const originalDate = new Date('2020-01-01');
          const e = await tx.expense.create({
            data: {
              description: 'Original Expense',
              amount: 500,
              date: originalDate,
              projectId: p.id,
            },
          });
          return { expense: e };
        });

        const result = await mutations.updateExpense(
          undefined,
          {
            id: expense.id,
            input: {
              date: undefined, // Undefined should not update
            },
          },
          context
        );

        // When date is undefined, it should not be updated
        expect(result.date).toEqual(new Date('2020-01-01'));
      });

      it('should update expense with undefined optional fields', async () => {
        const { expense, project, grant, event } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const g = await tx.grant.create({
            data: {
              name: 'Test Grant',
              budget: 100000,
              deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
          });
          const e = await tx.event.create({
            data: { title: 'Test Event', date: new Date() },
          });
          const exp = await tx.expense.create({
            data: {
              description: 'Original Expense',
              amount: 500,
              date: new Date(),
              projectId: p.id,
              grantId: g.id,
              eventId: e.id,
            },
          });
          return { expense: exp, project: p, grant: g, event: e };
        });

        const result = await mutations.updateExpense(
          undefined,
          {
            id: expense.id,
            input: {
              projectId: undefined,
              grantId: undefined,
              eventId: undefined,
            },
          },
          context
        );

        // When fields are undefined, they should not be updated
        expect(result.projectId).toBe(project.id);
        expect(result.grantId).toBe(grant.id);
        expect(result.eventId).toBe(event.id);
      });

      it('should delete expense via mutation', async () => {
        const { expense } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const e = await tx.expense.create({
            data: {
              description: 'Test Expense',
              amount: 1000,
              date: new Date(),
              projectId: p.id,
            },
          });
          return { expense: e };
        });

        const result = await mutations.deleteExpense(
          undefined,
          { id: expense.id },
          context
        );

        expect(result).toBe(true);

        const deleted = await testPrisma.expense.findUnique({
          where: { id: expense.id },
        });
        expect(deleted).toBeNull();
      });
    });

    describe('NoteTask Mutations', () => {
      it('should create noteTask via mutation', async () => {
        const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const result = await mutations.createNoteTask(
          undefined,
          {
            input: {
              title: 'New Task',
              content: 'Task content',
              completed: false,
              dueDate,
            },
          },
          context
        );

        expect(result.title).toBe('New Task');
        expect(result.content).toBe('Task content');
        expect(result.completed).toBe(false);
      });

      it('should update noteTask via mutation', async () => {
        const noteTask = await testFactory.createNoteTask({
          title: 'Original Task',
          content: 'Original content',
          completed: false,
        });

        const result = await mutations.updateNoteTask(
          undefined,
          {
            id: noteTask.id,
            input: {
              title: 'Updated Task',
              content: 'Updated content',
              completed: true,
            },
          },
          context
        );

        expect(result.title).toBe('Updated Task');
        expect(result.content).toBe('Updated content');
        expect(result.completed).toBe(true);
      });

      it('should update noteTask with null completed', async () => {
        const noteTask = await testFactory.createNoteTask({
          title: 'Original Task',
          content: 'Original content',
          completed: false,
        });

        const result = await mutations.updateNoteTask(
          undefined,
          {
            id: noteTask.id,
            input: {
              completed: null,
            },
          },
          context
        );

        // When completed is null, it should not be updated (due to !== null check)
        expect(result.completed).toBe(false);
      });

      it('should update noteTask with undefined completed', async () => {
        const noteTask = await testFactory.createNoteTask({
          title: 'Original Task',
          content: 'Original content',
          completed: false,
        });

        const result = await mutations.updateNoteTask(
          undefined,
          {
            id: noteTask.id,
            input: {
              completed: undefined,
            },
          },
          context
        );

        // When completed is undefined, it should not be updated
        expect(result.completed).toBe(false);
      });

      it('should update noteTask with undefined title and dueDate', async () => {
        const noteTask = await testFactory.createNoteTask({
          title: 'Original Task',
          content: 'Original content',
          dueDate: new Date('2024-12-31'),
        });

        const result = await mutations.updateNoteTask(
          undefined,
          {
            id: noteTask.id,
            input: {
              title: undefined,
              dueDate: undefined,
            },
          },
          context
        );

        // When title/dueDate are undefined, they should not be updated
        expect(result.title).toBe('Original Task');
        expect(result.dueDate).toEqual(new Date('2024-12-31'));
      });

      it('should update noteTask with valid title and dueDate', async () => {
        const noteTask = await testFactory.createNoteTask({
          title: 'Original Task',
          content: 'Original content',
          dueDate: new Date('2024-12-31'),
        });

        const newDueDate = new Date('2025-12-31');
        const result = await mutations.updateNoteTask(
          undefined,
          {
            id: noteTask.id,
            input: {
              title: 'Updated Task Title', // Valid title should update
              dueDate: newDueDate, // Valid dueDate should update
            },
          },
          context
        );

        // When title/dueDate are truthy, they should be updated
        expect(result.title).toBe('Updated Task Title');
        expect(result.dueDate).toEqual(newDueDate);
      });

      it('should update noteTask with falsy content (should not update)', async () => {
        const noteTask = await testFactory.createNoteTask({
          title: 'Original Task',
          content: 'Original content',
        });

        const result = await mutations.updateNoteTask(
          undefined,
          {
            id: noteTask.id,
            input: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              content: null as any, // Falsy value should not update
            },
          },
          context
        );

        // When content is falsy, it should not be updated
        expect(result.content).toBe('Original content');
      });

      it('should delete noteTask via mutation', async () => {
        const noteTask = await testFactory.createNoteTask();

        const result = await mutations.deleteNoteTask(
          undefined,
          { id: noteTask.id },
          context
        );

        expect(result).toBe(true);

        const deleted = await testPrisma.noteTask.findUnique({
          where: { id: noteTask.id },
        });
        expect(deleted).toBeNull();
      });
    });

    describe('AcademicInfo Mutations', () => {
      it('should create academicInfo via mutation', async () => {
        const { member } = await testPrisma.$transaction(async (tx) => {
          const m = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          return { member: m };
        });

        const result = await mutations.createAcademicInfo(
          undefined,
          {
            input: {
              degree: 'PhD',
              field: 'Computer Science',
              institution: 'Test University',
              graduationYear: 2020,
              memberId: member.id,
            },
          },
          context
        );

        expect(result.degree).toBe('PhD');
        expect(result.field).toBe('Computer Science');
        expect(result.institution).toBe('Test University');
        expect(result.graduationYear).toBe(2020);
        expect(result.memberId).toBe(member.id);
      });

      it('should update academicInfo via mutation', async () => {
        const { academicInfo } = await testPrisma.$transaction(async (tx) => {
          const m = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const ai = await tx.academicInfo.create({
            data: {
              degree: 'BSc',
              field: 'Biology',
              memberId: m.id,
            },
          });
          return { academicInfo: ai };
        });

        const result = await mutations.updateAcademicInfo(
          undefined,
          {
            id: academicInfo.id,
            input: {
              degree: 'MSc',
              field: 'Bioinformatics',
              graduationYear: 2022,
            },
          },
          context
        );

        expect(result.degree).toBe('MSc');
        expect(result.field).toBe('Bioinformatics');
        expect(result.graduationYear).toBe(2022);
      });

      it('should update academicInfo with null institution', async () => {
        const { academicInfo } = await testPrisma.$transaction(async (tx) => {
          const m = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const ai = await tx.academicInfo.create({
            data: {
              degree: 'BSc',
              field: 'Biology',
              institution: 'Test University',
              graduationYear: 2020,
              memberId: m.id,
            },
          });
          return { academicInfo: ai };
        });

        const result = await mutations.updateAcademicInfo(
          undefined,
          {
            id: academicInfo.id,
            input: {
              institution: null,
            },
          },
          context
        );

        // When institution is null, it should be set to null
        expect(result.institution).toBeNull();
      });

      it('should update academicInfo with falsy degree (should not update)', async () => {
        const { academicInfo } = await testPrisma.$transaction(async (tx) => {
          const m = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const ai = await tx.academicInfo.create({
            data: {
              degree: 'BSc',
              field: 'Biology',
              memberId: m.id,
            },
          });
          return { academicInfo: ai };
        });

        const result = await mutations.updateAcademicInfo(
          undefined,
          {
            id: academicInfo.id,
            input: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              degree: null as any, // Falsy value should not update
            },
          },
          context
        );

        // When degree is falsy, it should not be updated
        expect(result.degree).toBe('BSc');
      });

      it('should delete academicInfo via mutation', async () => {
        const { academicInfo } = await testPrisma.$transaction(async (tx) => {
          const m = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const ai = await tx.academicInfo.create({
            data: {
              degree: 'PhD',
              memberId: m.id,
            },
          });
          return { academicInfo: ai };
        });

        const result = await mutations.deleteAcademicInfo(
          undefined,
          { id: academicInfo.id },
          context
        );

        expect(result).toBe(true);

        const deleted = await testPrisma.academicInfo.findUnique({
          where: { id: academicInfo.id },
        });
        expect(deleted).toBeNull();
      });
    });

    describe('User Mutations', () => {
      it('should update user profile', async () => {
        const { user } = await testPrisma.$transaction(async (tx) => {
          const u = await tx.user.create({
            data: {
              email: 'test@example.com',
              name: 'Original Name',
            },
          });
          return { user: u };
        });

        const result = await mutations.updateUser(
          undefined,
          {
            id: user.id,
            input: {
              name: 'Updated Name',
              image: 'https://example.com/avatar.jpg',
            },
          },
          context
        );

        expect(result.name).toBe('Updated Name');
        expect(result.image).toBe('https://example.com/avatar.jpg');
      });

      it('should update user name only', async () => {
        const { user } = await testPrisma.$transaction(async (tx) => {
          const u = await tx.user.create({
            data: {
              email: 'test2@example.com',
              name: 'Original Name',
              image: 'https://example.com/old.jpg',
            },
          });
          return { user: u };
        });

        const result = await mutations.updateUser(
          undefined,
          {
            id: user.id,
            input: {
              name: 'Updated Name',
            },
          },
          context
        );

        expect(result.name).toBe('Updated Name');
        expect(result.image).toBe('https://example.com/old.jpg'); // Image unchanged
      });

      it('should update user image only', async () => {
        const { user } = await testPrisma.$transaction(async (tx) => {
          const u = await tx.user.create({
            data: {
              email: 'test3@example.com',
              name: 'Test User',
              image: 'https://example.com/old.jpg',
            },
          });
          return { user: u };
        });

        const result = await mutations.updateUser(
          undefined,
          {
            id: user.id,
            input: {
              image: 'https://example.com/new.jpg',
            },
          },
          context
        );

        expect(result.name).toBe('Test User'); // Name unchanged
        expect(result.image).toBe('https://example.com/new.jpg');
      });
    });

    describe('Equipment Assignment Mutations', () => {
      it('should assign equipment to member', async () => {
        const { member, equipment } = await testPrisma.$transaction(async (tx) => {
          const m = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const e = await tx.equipment.create({
            data: { name: 'Test Equipment', status: 'AVAILABLE' },
          });
          return { member: m, equipment: e };
        });

        const result = await mutations.assignEquipmentToMember(
          undefined,
          {
            equipmentId: equipment.id,
            memberId: member.id,
          },
          context
        );

        expect(result.memberId).toBe(member.id);
      });

      it('should unassign equipment from member', async () => {
        const { equipment } = await testPrisma.$transaction(async (tx) => {
          const m = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const e = await tx.equipment.create({
            data: {
              name: 'Test Equipment',
              status: 'AVAILABLE',
              memberId: m.id,
            },
          });
          return { equipment: e };
        });

        const result = await mutations.unassignEquipmentFromMember(
          undefined,
          {
            equipmentId: equipment.id,
          },
          context
        );

        expect(result.memberId).toBeNull();
      });
    });
  });

  describe('Type Resolvers (Computed Fields)', () => {
    describe('Project.totalInvestment', () => {
      it('should calculate total investment from expenses', async () => {
        // Create project and expenses in transaction to ensure visibility
        const { project } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          await tx.expense.create({
            data: { description: 'Expense 1', amount: 1000, date: new Date(), projectId: p.id },
          });
          await tx.expense.create({
            data: { description: 'Expense 2', amount: 2000, date: new Date(), projectId: p.id },
          });
          await tx.expense.create({
            data: { description: 'Expense 3', amount: 500, date: new Date(), projectId: p.id },
          });
          return { project: p };
        });

        const result = await types.Project.totalInvestment(
          { id: project.id },
          undefined,
          context
        );

        expect(result).toBe(3500); // 1000 + 2000 + 500
      });

      it('should return 0 for project with no expenses', async () => {
        const project = await testFactory.createProject();

        const result = await types.Project.totalInvestment(
          { id: project.id },
          undefined,
          context
        );

        expect(result).toBe(0);
      });
    });

    describe('Grant.totalSpent and remainingBudget', () => {
      it('should calculate total spent from expenses', async () => {
        // Create grant and expenses in transaction to ensure visibility
        const { grant } = await testPrisma.$transaction(async (tx) => {
          const g = await tx.grant.create({
            data: { name: 'Test Grant', budget: 100000, deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
          });
          await tx.expense.create({
            data: { description: 'Expense 1', amount: 10000, date: new Date(), grantId: g.id },
          });
          await tx.expense.create({
            data: { description: 'Expense 2', amount: 5000, date: new Date(), grantId: g.id },
          });
          return { grant: g };
        });

        const totalSpent = await types.Grant.totalSpent(
          { id: grant.id },
          undefined,
          context
        );
        const remainingBudget = await types.Grant.remainingBudget(
          { id: grant.id },
          undefined,
          context
        );

        expect(totalSpent).toBe(15000);
        expect(remainingBudget).toBe(85000);
      });

      it('should use provided budget when parent.budget is set', async () => {
        const { grant } = await testPrisma.$transaction(async (tx) => {
          const g = await tx.grant.create({
            data: { name: 'Test Grant', budget: 50000, deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
          });
          await tx.expense.create({
            data: { description: 'Expense 1', amount: 10000, date: new Date(), grantId: g.id },
          });
          return { grant: g };
        });

        // Test when parent.budget is provided (should not fetch from DB)
        const remainingBudget = await types.Grant.remainingBudget(
          { id: grant.id, budget: 50000 },
          undefined,
          context
        );

        expect(remainingBudget).toBe(40000); // 50000 - 10000
      });

      it('should fetch budget from DB when parent.budget is not provided', async () => {
        const { grant } = await testPrisma.$transaction(async (tx) => {
          const g = await tx.grant.create({
            data: { name: 'Test Grant', budget: 75000, deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
          });
          await tx.expense.create({
            data: { description: 'Expense 1', amount: 15000, date: new Date(), grantId: g.id },
          });
          return { grant: g };
        });

        // Test when parent.budget is not provided (should fetch from DB)
        const remainingBudget = await types.Grant.remainingBudget(
          { id: grant.id },
          undefined,
          context
        );

        expect(remainingBudget).toBe(60000); // 75000 - 15000
      });

      it('should handle when parent.budget is provided and DB grant is null', async () => {
        // This tests the branch where parent.budget is provided (not null/undefined)
        // so the DB fetch is skipped
        const { grant } = await testPrisma.$transaction(async (tx) => {
          const g = await tx.grant.create({
            data: { 
              name: 'Test Grant', 
              budget: 0,
              deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) 
            },
          });
          await tx.expense.create({
            data: { description: 'Test Expense', amount: 2000, date: new Date(), grantId: g.id },
          });
          return { grant: g };
        });

        // Test when parent.budget is explicitly provided (should use it, not fetch from DB)
        const remainingBudget = await types.Grant.remainingBudget(
          { id: grant.id, budget: 30000 }, // Explicitly provide budget
          undefined,
          context
        );

        // Should use provided budget (30000) not DB value (0)
        expect(remainingBudget).toBe(28000); // 30000 - 2000
      });

      it('should handle undefined budget when parent.budget is undefined and DB fetch returns null', async () => {
        const { grant } = await testPrisma.$transaction(async (tx) => {
          // Create grant without budget (Prisma will set it to 0 or null depending on schema)
          const g = await tx.grant.create({
            data: { 
              name: 'Test Grant', 
              budget: 0, // Use 0 instead of null since budget is Int
              deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) 
            },
          });
          await tx.expense.create({
            data: { description: 'Test Expense', amount: 5000, date: new Date(), grantId: g.id },
          });
          return { grant: g };
        });

        // Test when parent.budget is undefined (should fetch from DB, which returns 0)
        const remainingBudget = await types.Grant.remainingBudget(
          { id: grant.id }, // budget is undefined
          undefined,
          context
        );

        // When budget is 0, remainingBudget = 0 - 5000 = -5000
        expect(remainingBudget).toBe(-5000);
      });
    });
  });

  describe('Type Resolvers (Relationships)', () => {
    describe('AcademicInfo relationships', () => {
      it('should resolve academicInfo member', async () => {
        const { academicInfo, member } = await testPrisma.$transaction(async (tx) => {
          const m = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const ai = await tx.academicInfo.create({
            data: { degree: 'PhD', memberId: m.id },
          });
          return { academicInfo: ai, member: m };
        });

        const result = await types.AcademicInfo.member(
          { memberId: academicInfo.memberId },
          undefined,
          context
        );

        expect(result).toBeDefined();
        expect(result?.id).toBe(member.id);
      });
    });

    describe('Member relationships', () => {
      it('should resolve member academicInfo', async () => {
        const member = await testFactory.createMember();
        await testFactory.createAcademicInfo({
          memberId: member.id,
          degree: 'PhD',
        });

        const result = await types.Member.academicInfo(
          { id: member.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result[0].degree).toBe('PhD');
      });

      it('should resolve member user', async () => {
        const { member, user } = await testPrisma.$transaction(async (tx) => {
          const m = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const u = await tx.user.create({
            data: { email: 'test@example.com', name: 'Test User', memberId: m.id },
          });
          return { member: m, user: u };
        });

        const result = await types.Member.user(
          { id: member.id },
          undefined,
          context
        );

        expect(result).toBeDefined();
        expect(result?.id).toBe(user.id);
      });

      it('should resolve member equipments', async () => {
        const { member, equipment } = await testPrisma.$transaction(async (tx) => {
          const m = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const e = await tx.equipment.create({
            data: { name: 'Test Equipment', status: 'AVAILABLE', memberId: m.id },
          });
          return { member: m, equipment: e };
        });

        const result = await types.Member.equipments(
          { id: member.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result?.[0]?.id).toBe(equipment.id);
      });

      it('should resolve member bookings', async () => {
        const { member, booking } = await testPrisma.$transaction(async (tx) => {
          const m = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const equipment = await tx.equipment.create({
            data: { name: 'Test Equipment', status: 'AVAILABLE' },
          });
          const startTime = new Date();
          const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
          const b = await tx.booking.create({
            data: { startTime, endTime, equipmentId: equipment.id, memberId: m.id },
          });
          return { member: m, booking: b };
        });

        const result = await types.Member.bookings(
          { id: member.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(booking.id);
      });

      it('should resolve member projects', async () => {
        const { member, project } = await testPrisma.$transaction(async (tx) => {
          const m = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const p = await tx.project.create({
            data: {
              title: 'Test Project',
              members: { connect: [{ id: m.id }] },
            },
          });
          return { member: m, project: p };
        });

        const result = await types.Member.projects(
          { id: member.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result?.[0]?.id).toBe(project.id);
      });

      it('should resolve member publications', async () => {
        const { member, publication } = await testPrisma.$transaction(async (tx) => {
          const m = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const pub = await tx.publication.create({
            data: {
              title: 'Test Publication',
              members: { connect: [{ id: m.id }] },
            },
          });
          return { member: m, publication: pub };
        });

        const result = await types.Member.publications(
          { id: member.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result?.[0]?.id).toBe(publication.id);
      });

      it('should resolve member events', async () => {
        const { member, event } = await testPrisma.$transaction(async (tx) => {
          const m = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const e = await tx.event.create({
            data: {
              title: 'Test Event',
              date: new Date(),
              attendees: { connect: [{ id: m.id }] },
            },
          });
          return { member: m, event: e };
        });

        const result = await types.Member.events(
          { id: member.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result?.[0]?.id).toBe(event.id);
      });

      it('should resolve member documents', async () => {
        const { member, document } = await testPrisma.$transaction(async (tx) => {
          const m = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const d = await tx.document.create({
            data: { filename: 'test.pdf', url: 'https://example.com/test.pdf', memberId: m.id },
          });
          return { member: m, document: d };
        });

        const result = await types.Member.documents(
          { id: member.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(document.id);
      });

      it('should resolve member noteTasks', async () => {
        const { member, noteTask } = await testPrisma.$transaction(async (tx) => {
          const m = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const nt = await tx.noteTask.create({
            data: { content: 'Test Task', memberId: m.id },
          });
          return { member: m, noteTask: nt };
        });

        const result = await types.Member.noteTasks(
          { id: member.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(noteTask.id);
      });
    });

    describe('Project relationships', () => {
      it('should resolve project members', async () => {
        const project = await testFactory.createProject();
        const member = await testFactory.createMember();

        await testPrisma.project.update({
          where: { id: project.id },
          data: {
            members: { connect: [{ id: member.id }] },
          },
        });

        const result = await types.Project.members(
          { id: project.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result?.[0]?.id).toBe(member.id);
      });

      it('should resolve project equipments', async () => {
        const { project, equipment } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const e = await tx.equipment.create({
            data: { name: 'Test Equipment', status: 'AVAILABLE', projectId: p.id },
          });
          return { project: p, equipment: e };
        });

        const result = await types.Project.equipments(
          { id: project.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result?.[0]?.id).toBe(equipment.id);
      });

      it('should resolve project bookings', async () => {
        const { project, booking } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const member = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const equipment = await tx.equipment.create({
            data: { name: 'Test Equipment', status: 'AVAILABLE' },
          });
          const startTime = new Date();
          const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
          const b = await tx.booking.create({
            data: { startTime, endTime, equipmentId: equipment.id, memberId: member.id, projectId: p.id },
          });
          return { project: p, booking: b };
        });

        const result = await types.Project.bookings(
          { id: project.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(booking.id);
      });

      it('should resolve project grants', async () => {
        const { project, grant } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const g = await tx.grant.create({
            data: {
              name: 'Test Grant',
              budget: 100000,
              deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              projects: { connect: [{ id: p.id }] },
            },
          });
          return { project: p, grant: g };
        });

        const result = await types.Project.grants(
          { id: project.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result?.[0]?.id).toBe(grant.id);
      });

      it('should resolve project publications', async () => {
        const { project, publication } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const pub = await tx.publication.create({
            data: {
              title: 'Test Publication',
              projects: { connect: [{ id: p.id }] },
            },
          });
          return { project: p, publication: pub };
        });

        const result = await types.Project.publications(
          { id: project.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result?.[0]?.id).toBe(publication.id);
      });

      it('should resolve project collaborators', async () => {
        const { project, collaborator } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const c = await tx.collaborator.create({
            data: {
              name: 'Test Collaborator',
              projects: { connect: [{ id: p.id }] },
            },
          });
          return { project: p, collaborator: c };
        });

        const result = await types.Project.collaborators(
          { id: project.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result?.[0]?.id).toBe(collaborator.id);
      });

      it('should resolve project documents', async () => {
        const { project, document } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const d = await tx.document.create({
            data: { filename: 'test.pdf', url: 'https://example.com/test.pdf', projectId: p.id },
          });
          return { project: p, document: d };
        });

        const result = await types.Project.documents(
          { id: project.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(document.id);
      });

      it('should resolve project events', async () => {
        const { project, event } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const e = await tx.event.create({
            data: {
              title: 'Test Event',
              date: new Date(),
              projects: { connect: [{ id: p.id }] },
            },
          });
          return { project: p, event: e };
        });

        const result = await types.Project.events(
          { id: project.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result?.[0]?.id).toBe(event.id);
      });

      it('should resolve project expenses', async () => {
        const project = await testFactory.createProject();
        await testFactory.createExpense({
          projectId: project.id,
          amount: 1000,
        });

        const result = await types.Project.expenses(
          { id: project.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result[0].amount).toBe(1000);
      });

      it('should resolve project noteTasks', async () => {
        const { project, noteTask } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const nt = await tx.noteTask.create({
            data: { content: 'Test Task', projectId: p.id },
          });
          return { project: p, noteTask: nt };
        });

        const result = await types.Project.noteTasks(
          { id: project.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(noteTask.id);
      });
    });

    describe('Equipment relationships', () => {
      it('should resolve equipment project', async () => {
        const { equipment, project } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const e = await tx.equipment.create({
            data: { name: 'Test Equipment', status: 'AVAILABLE', projectId: p.id },
          });
          return { equipment: e, project: p };
        });

        const result = await types.Equipment.project(
          { projectId: equipment.projectId },
          undefined,
          context
        );

        expect(result).toBeDefined();
        expect(result?.id).toBe(project.id);
      });

      it('should return null for equipment project when not assigned', async () => {
        await testFactory.createEquipment();

        const result = await types.Equipment.project(
          { projectId: null },
          undefined,
          context
        );

        expect(result).toBeNull();
      });

      it('should resolve equipment member', async () => {
        const { equipment, member } = await testPrisma.$transaction(async (tx) => {
          const m = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const e = await tx.equipment.create({
            data: { name: 'Test Equipment', status: 'AVAILABLE', memberId: m.id },
          });
          return { equipment: e, member: m };
        });

        const result = await types.Equipment.member(
          { memberId: equipment.memberId },
          undefined,
          context
        );

        expect(result).toBeDefined();
        expect(result?.id).toBe(member.id);
      });

      it('should return null for equipment member when not assigned', async () => {
        await testFactory.createEquipment();

        const result = await types.Equipment.member(
          { memberId: null },
          undefined,
          context
        );

        expect(result).toBeNull();
      });

      it('should resolve equipment bookings', async () => {
        const { equipment, booking } = await testPrisma.$transaction(async (tx) => {
          const member = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const e = await tx.equipment.create({
            data: { name: 'Test Equipment', status: 'AVAILABLE' },
          });
          const startTime = new Date();
          const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
          const b = await tx.booking.create({
            data: { startTime, endTime, equipmentId: e.id, memberId: member.id },
          });
          return { equipment: e, booking: b };
        });

        const result = await types.Equipment.bookings(
          { id: equipment.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(booking.id);
      });

      it('should resolve equipment events', async () => {
        const { equipment, event } = await testPrisma.$transaction(async (tx) => {
          const e = await tx.equipment.create({
            data: { name: 'Test Equipment', status: 'AVAILABLE' },
          });
          const ev = await tx.event.create({
            data: {
              title: 'Test Event',
              date: new Date(),
              equipments: { connect: [{ id: e.id }] },
            },
          });
          return { equipment: e, event: ev };
        });

        const result = await types.Equipment.events(
          { id: equipment.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result?.[0]?.id).toBe(event.id);
      });

      it('should resolve equipment noteTasks', async () => {
        const { equipment, noteTask } = await testPrisma.$transaction(async (tx) => {
          const e = await tx.equipment.create({
            data: { name: 'Test Equipment', status: 'AVAILABLE' },
          });
          const nt = await tx.noteTask.create({
            data: { content: 'Test Task', equipmentId: e.id },
          });
          return { equipment: e, noteTask: nt };
        });

        const result = await types.Equipment.noteTasks(
          { id: equipment.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(noteTask.id);
      });
    });

    describe('Booking relationships', () => {
      it('should resolve booking equipment', async () => {
        const { booking, equipment } = await testPrisma.$transaction(async (tx) => {
          const member = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const e = await tx.equipment.create({
            data: { name: 'Test Equipment', status: 'AVAILABLE' },
          });
          const startTime = new Date();
          const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
          const b = await tx.booking.create({
            data: { startTime, endTime, equipmentId: e.id, memberId: member.id },
          });
          return { booking: b, equipment: e };
        });

        const result = await types.Booking.equipment(
          { equipmentId: booking.equipmentId },
          undefined,
          context
        );

        expect(result).toBeDefined();
        expect(result?.id).toBe(equipment.id);
      });

      it('should resolve booking member', async () => {
        const { booking, member } = await testPrisma.$transaction(async (tx) => {
          const m = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const equipment = await tx.equipment.create({
            data: { name: 'Test Equipment', status: 'AVAILABLE' },
          });
          const startTime = new Date();
          const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
          const b = await tx.booking.create({
            data: { startTime, endTime, equipmentId: equipment.id, memberId: m.id },
          });
          return { booking: b, member: m };
        });

        const result = await types.Booking.member(
          { memberId: booking.memberId },
          undefined,
          context
        );

        expect(result).toBeDefined();
        expect(result?.id).toBe(member.id);
      });

      it('should resolve booking project when assigned', async () => {
        const { booking, project } = await testPrisma.$transaction(async (tx) => {
          const member = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const equipment = await tx.equipment.create({
            data: { name: 'Test Equipment', status: 'AVAILABLE' },
          });
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const startTime = new Date();
          const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
          const b = await tx.booking.create({
            data: { startTime, endTime, equipmentId: equipment.id, memberId: member.id, projectId: p.id },
          });
          return { booking: b, project: p };
        });

        const result = await types.Booking.project(
          { projectId: booking.projectId },
          undefined,
          context
        );

        expect(result).toBeDefined();
        expect(result?.id).toBe(project.id);
      });

      it('should return null for booking project when not assigned', async () => {
        await testPrisma.$transaction(async (tx) => {
          const member = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const equipment = await tx.equipment.create({
            data: { name: 'Test Equipment', status: 'AVAILABLE' },
          });
          const startTime = new Date();
          const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
          await tx.booking.create({
            data: { startTime, endTime, equipmentId: equipment.id, memberId: member.id },
          });
        });

        const result = await types.Booking.project(
          { projectId: null },
          undefined,
          context
        );

        expect(result).toBeNull();
      });

      it('should resolve booking event when assigned', async () => {
        const { booking, event } = await testPrisma.$transaction(async (tx) => {
          const member = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const equipment = await tx.equipment.create({
            data: { name: 'Test Equipment', status: 'AVAILABLE' },
          });
          const e = await tx.event.create({
            data: { title: 'Test Event', date: new Date() },
          });
          const startTime = new Date();
          const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
          const b = await tx.booking.create({
            data: { startTime, endTime, equipmentId: equipment.id, memberId: member.id, eventId: e.id },
          });
          return { booking: b, event: e };
        });

        const result = await types.Booking.event(
          { eventId: booking.eventId },
          undefined,
          context
        );

        expect(result).toBeDefined();
        expect(result?.id).toBe(event.id);
      });

      it('should return null for booking event when not assigned', async () => {
        await testPrisma.$transaction(async (tx) => {
          const member = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const equipment = await tx.equipment.create({
            data: { name: 'Test Equipment', status: 'AVAILABLE' },
          });
          const startTime = new Date();
          const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
          await tx.booking.create({
            data: { startTime, endTime, equipmentId: equipment.id, memberId: member.id },
          });
        });

        const result = await types.Booking.event(
          { eventId: null },
          undefined,
          context
        );

        expect(result).toBeNull();
      });
    });

    describe('Event relationships', () => {
      it('should resolve event attendees', async () => {
        const { event, member } = await testPrisma.$transaction(async (tx) => {
          const m = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const e = await tx.event.create({
            data: {
              title: 'Test Event',
              date: new Date(),
              attendees: { connect: [{ id: m.id }] },
            },
          });
          return { event: e, member: m };
        });

        const result = await types.Event.attendees(
          { id: event.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result?.[0]?.id).toBe(member.id);
      });

      it('should resolve event projects', async () => {
        const { event, project } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const e = await tx.event.create({
            data: {
              title: 'Test Event',
              date: new Date(),
              projects: { connect: [{ id: p.id }] },
            },
          });
          return { event: e, project: p };
        });

        const result = await types.Event.projects(
          { id: event.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result?.[0]?.id).toBe(project.id);
      });

      it('should resolve event tasks', async () => {
        const { event, noteTask } = await testPrisma.$transaction(async (tx) => {
          const e = await tx.event.create({
            data: { title: 'Test Event', date: new Date() },
          });
          const nt = await tx.noteTask.create({
            data: { content: 'Test Task', eventId: e.id },
          });
          return { event: e, noteTask: nt };
        });

        const result = await types.Event.tasks(
          { id: event.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(noteTask.id);
      });

      it('should resolve event expenses', async () => {
        const { event, expense } = await testPrisma.$transaction(async (tx) => {
          const e = await tx.event.create({
            data: { title: 'Test Event', date: new Date() },
          });
          const exp = await tx.expense.create({
            data: { description: 'Test Expense', amount: 1000, date: new Date(), eventId: e.id },
          });
          return { event: e, expense: exp };
        });

        const result = await types.Event.expenses(
          { id: event.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(expense.id);
      });

      it('should resolve event equipments', async () => {
        const { event, equipment } = await testPrisma.$transaction(async (tx) => {
          const e = await tx.equipment.create({
            data: { name: 'Test Equipment', status: 'AVAILABLE' },
          });
          const ev = await tx.event.create({
            data: {
              title: 'Test Event',
              date: new Date(),
              equipments: { connect: [{ id: e.id }] },
            },
          });
          return { event: ev, equipment: e };
        });

        const result = await types.Event.equipments(
          { id: event.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result?.[0]?.id).toBe(equipment.id);
      });

      it('should resolve event bookings', async () => {
        const { event, booking } = await testPrisma.$transaction(async (tx) => {
          const member = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const equipment = await tx.equipment.create({
            data: { name: 'Test Equipment', status: 'AVAILABLE' },
          });
          const e = await tx.event.create({
            data: { title: 'Test Event', date: new Date() },
          });
          const startTime = new Date();
          const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
          const b = await tx.booking.create({
            data: { startTime, endTime, equipmentId: equipment.id, memberId: member.id, eventId: e.id },
          });
          return { event: e, booking: b };
        });

        const result = await types.Event.bookings(
          { id: event.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(booking.id);
      });
    });

    describe('Grant relationships', () => {
      it('should resolve grant projects', async () => {
        const { grant, project } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const g = await tx.grant.create({
            data: {
              name: 'Test Grant',
              budget: 100000,
              deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              projects: { connect: [{ id: p.id }] },
            },
          });
          return { grant: g, project: p };
        });

        const result = await types.Grant.projects(
          { id: grant.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result?.[0]?.id).toBe(project.id);
      });

      it('should resolve grant expenses', async () => {
        const { grant, expense } = await testPrisma.$transaction(async (tx) => {
          const g = await tx.grant.create({
            data: {
              name: 'Test Grant',
              budget: 100000,
              deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
          });
          const e = await tx.expense.create({
            data: { description: 'Test Expense', amount: 5000, date: new Date(), grantId: g.id },
          });
          return { grant: g, expense: e };
        });

        const result = await types.Grant.expenses(
          { id: grant.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(expense.id);
      });

      it('should resolve grant noteTasks', async () => {
        const { grant, noteTask } = await testPrisma.$transaction(async (tx) => {
          const g = await tx.grant.create({
            data: {
              name: 'Test Grant',
              budget: 100000,
              deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
          });
          const nt = await tx.noteTask.create({
            data: { content: 'Test Task', grantId: g.id },
          });
          return { grant: g, noteTask: nt };
        });

        const result = await types.Grant.noteTasks(
          { id: grant.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(noteTask.id);
      });
    });

    describe('Publication relationships', () => {
      it('should resolve publication members', async () => {
        const { publication, member } = await testPrisma.$transaction(async (tx) => {
          const m = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const pub = await tx.publication.create({
            data: {
              title: 'Test Publication',
              members: { connect: [{ id: m.id }] },
            },
          });
          return { publication: pub, member: m };
        });

        const result = await types.Publication.members(
          { id: publication.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result?.[0]?.id).toBe(member.id);
      });

      it('should resolve publication projects', async () => {
        const { publication, project } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const pub = await tx.publication.create({
            data: {
              title: 'Test Publication',
              projects: { connect: [{ id: p.id }] },
            },
          });
          return { publication: pub, project: p };
        });

        const result = await types.Publication.projects(
          { id: publication.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result?.[0]?.id).toBe(project.id);
      });

      it('should resolve publication noteTasks', async () => {
        const { publication, noteTask } = await testPrisma.$transaction(async (tx) => {
          const pub = await tx.publication.create({
            data: { title: 'Test Publication' },
          });
          const nt = await tx.noteTask.create({
            data: { content: 'Test Task', publicationId: pub.id },
          });
          return { publication: pub, noteTask: nt };
        });

        const result = await types.Publication.noteTasks(
          { id: publication.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(noteTask.id);
      });
    });

    describe('Collaborator relationships', () => {
      it('should resolve collaborator projects', async () => {
        const { collaborator, project } = await testPrisma.$transaction(async (tx) => {
          const c = await tx.collaborator.create({
            data: { name: 'Test Collaborator' },
          });
          const p = await tx.project.create({
            data: {
              title: 'Test Project',
              collaborators: { connect: [{ id: c.id }] },
            },
          });
          return { collaborator: c, project: p };
        });

        const result = await types.Collaborator.projects(
          { id: collaborator.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result?.[0]?.id).toBe(project.id);
      });

      it('should resolve collaborator noteTasks', async () => {
        const { collaborator, noteTask } = await testPrisma.$transaction(async (tx) => {
          const c = await tx.collaborator.create({
            data: { name: 'Test Collaborator' },
          });
          const nt = await tx.noteTask.create({
            data: { content: 'Test Task', collaboratorId: c.id },
          });
          return { collaborator: c, noteTask: nt };
        });

        const result = await types.Collaborator.noteTasks(
          { id: collaborator.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(noteTask.id);
      });
    });

    describe('Document relationships', () => {
      it('should resolve document project when assigned', async () => {
        const { document, project } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const d = await tx.document.create({
            data: { filename: 'test.pdf', url: 'https://example.com/test.pdf', projectId: p.id },
          });
          return { document: d, project: p };
        });

        const result = await types.Document.project(
          { projectId: document.projectId },
          undefined,
          context
        );

        expect(result).toBeDefined();
        expect(result?.id).toBe(project.id);
      });

      it('should return null for document project when not assigned', async () => {
        await testFactory.createDocument();

        const result = await types.Document.project(
          { projectId: null },
          undefined,
          context
        );

        expect(result).toBeNull();
      });

      it('should resolve document member when assigned', async () => {
        const { document, member } = await testPrisma.$transaction(async (tx) => {
          const m = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const d = await tx.document.create({
            data: { filename: 'test.pdf', url: 'https://example.com/test.pdf', memberId: m.id },
          });
          return { document: d, member: m };
        });

        const result = await types.Document.member(
          { memberId: document.memberId },
          undefined,
          context
        );

        expect(result).toBeDefined();
        expect(result?.id).toBe(member.id);
      });

      it('should return null for document member when not assigned', async () => {
        await testFactory.createDocument();

        const result = await types.Document.member(
          { memberId: null },
          undefined,
          context
        );

        expect(result).toBeNull();
      });

      it('should resolve document noteTasks', async () => {
        const { document, noteTask } = await testPrisma.$transaction(async (tx) => {
          const d = await tx.document.create({
            data: { filename: 'test.pdf', url: 'https://example.com/test.pdf' },
          });
          const nt = await tx.noteTask.create({
            data: { content: 'Test Task', documentId: d.id },
          });
          return { document: d, noteTask: nt };
        });

        const result = await types.Document.noteTasks(
          { id: document.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(noteTask.id);
      });
    });

    describe('Expense relationships', () => {
      it('should resolve expense project when assigned', async () => {
        const { expense, project } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const e = await tx.expense.create({
            data: { description: 'Test Expense', amount: 1000, date: new Date(), projectId: p.id },
          });
          return { expense: e, project: p };
        });

        const result = await types.Expense.project(
          { projectId: expense.projectId },
          undefined,
          context
        );

        expect(result).toBeDefined();
        expect(result?.id).toBe(project.id);
      });

      it('should return null for expense project when not assigned', async () => {
        await testPrisma.$transaction(async (tx) => {
          const g = await tx.grant.create({
            data: {
              name: 'Test Grant',
              budget: 100000,
              deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
          });
          await tx.expense.create({
            data: { description: 'Test Expense', amount: 1000, date: new Date(), grantId: g.id },
          });
        });

        const result = await types.Expense.project(
          { projectId: null },
          undefined,
          context
        );

        expect(result).toBeNull();
      });

      it('should resolve expense grant when assigned', async () => {
        const { expense, grant } = await testPrisma.$transaction(async (tx) => {
          const g = await tx.grant.create({
            data: {
              name: 'Test Grant',
              budget: 100000,
              deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
          });
          const e = await tx.expense.create({
            data: { description: 'Test Expense', amount: 1000, date: new Date(), grantId: g.id },
          });
          return { expense: e, grant: g };
        });

        const result = await types.Expense.grant(
          { grantId: expense.grantId },
          undefined,
          context
        );

        expect(result).toBeDefined();
        expect(result?.id).toBe(grant.id);
      });

      it('should return null for expense grant when not assigned', async () => {
        await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          await tx.expense.create({
            data: { description: 'Test Expense', amount: 1000, date: new Date(), projectId: p.id },
          });
        });

        const result = await types.Expense.grant(
          { grantId: null },
          undefined,
          context
        );

        expect(result).toBeNull();
      });

      it('should resolve expense event when assigned', async () => {
        const { expense, event } = await testPrisma.$transaction(async (tx) => {
          const e = await tx.event.create({
            data: { title: 'Test Event', date: new Date() },
          });
          const exp = await tx.expense.create({
            data: { description: 'Test Expense', amount: 1000, date: new Date(), eventId: e.id },
          });
          return { expense: exp, event: e };
        });

        const result = await types.Expense.event(
          { eventId: expense.eventId },
          undefined,
          context
        );

        expect(result).toBeDefined();
        expect(result?.id).toBe(event.id);
      });

      it('should return null for expense event when not assigned', async () => {
        await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          await tx.expense.create({
            data: { description: 'Test Expense', amount: 1000, date: new Date(), projectId: p.id },
          });
        });

        const result = await types.Expense.event(
          { eventId: null },
          undefined,
          context
        );

        expect(result).toBeNull();
      });

      it('should resolve expense noteTasks', async () => {
        const { expense, noteTask } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const e = await tx.expense.create({
            data: { description: 'Test Expense', amount: 1000, date: new Date(), projectId: p.id },
          });
          const nt = await tx.noteTask.create({
            data: { content: 'Test Task', expenseId: e.id },
          });
          return { expense: e, noteTask: nt };
        });

        const result = await types.Expense.noteTasks(
          { id: expense.id },
          undefined,
          context
        );

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(noteTask.id);
      });
    });

    describe('NoteTask relationships', () => {
      it('should resolve noteTask member when assigned', async () => {
        const { noteTask, member } = await testPrisma.$transaction(async (tx) => {
          const m = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const nt = await tx.noteTask.create({
            data: { content: 'Test Task', memberId: m.id },
          });
          return { noteTask: nt, member: m };
        });

        const result = await types.NoteTask.member(
          { memberId: noteTask.memberId },
          undefined,
          context
        );

        expect(result).toBeDefined();
        expect(result?.id).toBe(member.id);
      });

      it('should return null for noteTask member when not assigned', async () => {
        await testFactory.createNoteTask();

        const result = await types.NoteTask.member(
          { memberId: null },
          undefined,
          context
        );

        expect(result).toBeNull();
      });

      it('should resolve noteTask project when assigned', async () => {
        const { noteTask, project } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const nt = await tx.noteTask.create({
            data: { content: 'Test Task', projectId: p.id },
          });
          return { noteTask: nt, project: p };
        });

        const result = await types.NoteTask.project(
          { projectId: noteTask.projectId },
          undefined,
          context
        );

        expect(result).toBeDefined();
        expect(result?.id).toBe(project.id);
      });

      it('should return null for noteTask project when not assigned', async () => {
        await testFactory.createNoteTask();

        const result = await types.NoteTask.project(
          { projectId: null },
          undefined,
          context
        );

        expect(result).toBeNull();
      });

      it('should resolve noteTask grant when assigned', async () => {
        const { noteTask, grant } = await testPrisma.$transaction(async (tx) => {
          const g = await tx.grant.create({
            data: {
              name: 'Test Grant',
              budget: 100000,
              deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
          });
          const nt = await tx.noteTask.create({
            data: { content: 'Test Task', grantId: g.id },
          });
          return { noteTask: nt, grant: g };
        });

        const result = await types.NoteTask.grant(
          { grantId: noteTask.grantId },
          undefined,
          context
        );

        expect(result).toBeDefined();
        expect(result?.id).toBe(grant.id);
      });

      it('should return null for noteTask grant when not assigned', async () => {
        await testFactory.createNoteTask();

        const result = await types.NoteTask.grant(
          { grantId: null },
          undefined,
          context
        );

        expect(result).toBeNull();
      });

      it('should resolve noteTask event when assigned', async () => {
        const { noteTask, event } = await testPrisma.$transaction(async (tx) => {
          const e = await tx.event.create({
            data: { title: 'Test Event', date: new Date() },
          });
          const nt = await tx.noteTask.create({
            data: { content: 'Test Task', eventId: e.id },
          });
          return { noteTask: nt, event: e };
        });

        const result = await types.NoteTask.event(
          { eventId: noteTask.eventId },
          undefined,
          context
        );

        expect(result).toBeDefined();
        expect(result?.id).toBe(event.id);
      });

      it('should return null for noteTask event when not assigned', async () => {
        await testFactory.createNoteTask();

        const result = await types.NoteTask.event(
          { eventId: null },
          undefined,
          context
        );

        expect(result).toBeNull();
      });

      it('should resolve noteTask publication when assigned', async () => {
        const { noteTask, publication } = await testPrisma.$transaction(async (tx) => {
          const pub = await tx.publication.create({
            data: { title: 'Test Publication' },
          });
          const nt = await tx.noteTask.create({
            data: { content: 'Test Task', publicationId: pub.id },
          });
          return { noteTask: nt, publication: pub };
        });

        const result = await types.NoteTask.publication(
          { publicationId: noteTask.publicationId },
          undefined,
          context
        );

        expect(result).toBeDefined();
        expect(result?.id).toBe(publication.id);
      });

      it('should return null for noteTask publication when not assigned', async () => {
        await testFactory.createNoteTask();

        const result = await types.NoteTask.publication(
          { publicationId: null },
          undefined,
          context
        );

        expect(result).toBeNull();
      });

      it('should resolve noteTask document when assigned', async () => {
        const { noteTask, document } = await testPrisma.$transaction(async (tx) => {
          const d = await tx.document.create({
            data: { filename: 'test.pdf', url: 'https://example.com/test.pdf' },
          });
          const nt = await tx.noteTask.create({
            data: { content: 'Test Task', documentId: d.id },
          });
          return { noteTask: nt, document: d };
        });

        const result = await types.NoteTask.document(
          { documentId: noteTask.documentId },
          undefined,
          context
        );

        expect(result).toBeDefined();
        expect(result?.id).toBe(document.id);
      });

      it('should return null for noteTask document when not assigned', async () => {
        await testFactory.createNoteTask();

        const result = await types.NoteTask.document(
          { documentId: null },
          undefined,
          context
        );

        expect(result).toBeNull();
      });

      it('should resolve noteTask equipment when assigned', async () => {
        const { noteTask, equipment } = await testPrisma.$transaction(async (tx) => {
          const e = await tx.equipment.create({
            data: { name: 'Test Equipment', status: 'AVAILABLE' },
          });
          const nt = await tx.noteTask.create({
            data: { content: 'Test Task', equipmentId: e.id },
          });
          return { noteTask: nt, equipment: e };
        });

        const result = await types.NoteTask.equipment(
          { equipmentId: noteTask.equipmentId },
          undefined,
          context
        );

        expect(result).toBeDefined();
        expect(result?.id).toBe(equipment.id);
      });

      it('should return null for noteTask equipment when not assigned', async () => {
        await testFactory.createNoteTask();

        const result = await types.NoteTask.equipment(
          { equipmentId: null },
          undefined,
          context
        );

        expect(result).toBeNull();
      });

      it('should resolve noteTask collaborator when assigned', async () => {
        const { noteTask, collaborator } = await testPrisma.$transaction(async (tx) => {
          const c = await tx.collaborator.create({
            data: { name: 'Test Collaborator' },
          });
          const nt = await tx.noteTask.create({
            data: { content: 'Test Task', collaboratorId: c.id },
          });
          return { noteTask: nt, collaborator: c };
        });

        const result = await types.NoteTask.collaborator(
          { collaboratorId: noteTask.collaboratorId },
          undefined,
          context
        );

        expect(result).toBeDefined();
        expect(result?.id).toBe(collaborator.id);
      });

      it('should return null for noteTask collaborator when not assigned', async () => {
        await testFactory.createNoteTask();

        const result = await types.NoteTask.collaborator(
          { collaboratorId: null },
          undefined,
          context
        );

        expect(result).toBeNull();
      });

      it('should resolve noteTask expense when assigned', async () => {
        const { noteTask, expense } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const e = await tx.expense.create({
            data: { description: 'Test Expense', amount: 1000, date: new Date(), projectId: p.id },
          });
          const nt = await tx.noteTask.create({
            data: { content: 'Test Task', expenseId: e.id },
          });
          return { noteTask: nt, expense: e };
        });

        const result = await types.NoteTask.expense(
          { expenseId: noteTask.expenseId },
          undefined,
          context
        );

        expect(result).toBeDefined();
        expect(result?.id).toBe(expense.id);
      });

      it('should return null for noteTask expense when not assigned', async () => {
        await testFactory.createNoteTask();

        const result = await types.NoteTask.expense(
          { expenseId: null },
          undefined,
          context
        );

        expect(result).toBeNull();
      });
    });

    describe('User relationships', () => {
      it('should resolve user member when linked', async () => {
        const { user, member } = await testPrisma.$transaction(async (tx) => {
          const m = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const u = await tx.user.create({
            data: { email: 'test@example.com', name: 'Test User', memberId: m.id },
          });
          return { user: u, member: m };
        });

        const result = await types.User.member(
          { memberId: user.memberId! },
          undefined,
          context
        );

        expect(result).toBeDefined();
        expect(result?.id).toBe(member.id);
      });
    });
  });

  describe('Relationship Mutations', () => {
    describe('Project-Member Relationships', () => {
    it('should add member to project', async () => {
      // Use transaction to ensure both records are visible
      const { member, project } = await testPrisma.$transaction(async (tx) => {
        const m = await tx.member.create({
          data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
        });
        const p = await tx.project.create({ data: { title: 'Test Project' } });
        return { member: m, project: p };
      });

        await mutations.addMemberToProject(
        undefined,
        {
          projectId: project.id,
          memberId: member.id,
        },
        context
      );

      // Verify by querying the project
      const updatedProject = await testPrisma.project.findUnique({
        where: { id: project.id },
        include: { members: true },
      });

      expect(updatedProject?.members).toHaveLength(1);
      expect(updatedProject?.members[0].id).toBe(member.id);
    });

    it('should remove member from project', async () => {
      // Use transaction to ensure both records are visible
      const { member, project } = await testPrisma.$transaction(async (tx) => {
        const m = await tx.member.create({
          data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
        });
        const p = await tx.project.create({ data: { title: 'Test Project' } });
        // Add member within transaction
        await tx.project.update({
          where: { id: p.id },
          data: { members: { connect: { id: m.id } } },
        });
        return { member: m, project: p };
      });

      // Remove member
      await mutations.removeMemberFromProject(
        undefined,
        {
          projectId: project.id,
          memberId: member.id,
        },
        context
      );

      // Verify by querying the project
      const updatedProject = await testPrisma.project.findUnique({
        where: { id: project.id },
        include: { members: true },
      });

      expect(updatedProject?.members).toHaveLength(0);
    });
  });

    describe('Publication-Member Relationships', () => {
      it('should add member to publication', async () => {
        const { member, publication } = await testPrisma.$transaction(async (tx) => {
          const m = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const pub = await tx.publication.create({
            data: { title: 'Test Publication' },
          });
          return { member: m, publication: pub };
        });

        await mutations.addMemberToPublication(
          undefined,
          {
            publicationId: publication.id,
            memberId: member.id,
          },
          context
        );

        const updatedPublication = await testPrisma.publication.findUnique({
          where: { id: publication.id },
          include: { members: true },
        });

        expect(updatedPublication?.members).toHaveLength(1);
        expect(updatedPublication?.members[0].id).toBe(member.id);
      });

      it('should remove member from publication', async () => {
        const { member, publication } = await testPrisma.$transaction(async (tx) => {
          const m = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const pub = await tx.publication.create({
            data: {
              title: 'Test Publication',
              members: { connect: { id: m.id } },
            },
          });
          return { member: m, publication: pub };
        });

        await mutations.removeMemberFromPublication(
          undefined,
          {
            publicationId: publication.id,
            memberId: member.id,
          },
          context
        );

        const updatedPublication = await testPrisma.publication.findUnique({
          where: { id: publication.id },
          include: { members: true },
        });

        expect(updatedPublication?.members).toHaveLength(0);
      });
    });

    describe('Publication-Project Relationships', () => {
      it('should add project to publication', async () => {
        const { project, publication } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const pub = await tx.publication.create({
            data: { title: 'Test Publication' },
          });
          return { project: p, publication: pub };
        });

        await mutations.addProjectToPublication(
          undefined,
          {
            publicationId: publication.id,
            projectId: project.id,
          },
          context
        );

        const updatedPublication = await testPrisma.publication.findUnique({
          where: { id: publication.id },
          include: { projects: true },
        });

        expect(updatedPublication?.projects).toHaveLength(1);
        expect(updatedPublication?.projects[0].id).toBe(project.id);
      });

      it('should remove project from publication', async () => {
        const { project, publication } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const pub = await tx.publication.create({
            data: {
              title: 'Test Publication',
              projects: { connect: { id: p.id } },
            },
          });
          return { project: p, publication: pub };
        });

        await mutations.removeProjectFromPublication(
          undefined,
          {
            publicationId: publication.id,
            projectId: project.id,
          },
          context
        );

        const updatedPublication = await testPrisma.publication.findUnique({
          where: { id: publication.id },
          include: { projects: true },
        });

        expect(updatedPublication?.projects).toHaveLength(0);
      });
    });

    describe('Event-Member Relationships', () => {
      it('should add member to event', async () => {
        const { member, event } = await testPrisma.$transaction(async (tx) => {
          const m = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const e = await tx.event.create({
            data: { title: 'Test Event', date: new Date() },
          });
          return { member: m, event: e };
        });

        await mutations.addMemberToEvent(
          undefined,
          {
            eventId: event.id,
            memberId: member.id,
          },
          context
        );

        const updatedEvent = await testPrisma.event.findUnique({
          where: { id: event.id },
          include: { attendees: true },
        });

        expect(updatedEvent?.attendees).toHaveLength(1);
        expect(updatedEvent?.attendees[0].id).toBe(member.id);
      });

      it('should remove member from event', async () => {
        const { member, event } = await testPrisma.$transaction(async (tx) => {
          const m = await tx.member.create({
            data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
          });
          const e = await tx.event.create({
            data: {
              title: 'Test Event',
              date: new Date(),
              attendees: { connect: { id: m.id } },
            },
          });
          return { member: m, event: e };
        });

        await mutations.removeMemberFromEvent(
          undefined,
          {
            eventId: event.id,
            memberId: member.id,
          },
          context
        );

        const updatedEvent = await testPrisma.event.findUnique({
          where: { id: event.id },
          include: { attendees: true },
        });

        expect(updatedEvent?.attendees).toHaveLength(0);
      });
    });

    describe('Event-Project Relationships', () => {
      it('should add project to event', async () => {
        const { project, event } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const e = await tx.event.create({
            data: { title: 'Test Event', date: new Date() },
          });
          return { project: p, event: e };
        });

        await mutations.addProjectToEvent(
          undefined,
          {
            eventId: event.id,
            projectId: project.id,
          },
          context
        );

        const updatedEvent = await testPrisma.event.findUnique({
          where: { id: event.id },
          include: { projects: true },
        });

        expect(updatedEvent?.projects).toHaveLength(1);
        expect(updatedEvent?.projects[0].id).toBe(project.id);
      });

      it('should remove project from event', async () => {
        const { project, event } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const e = await tx.event.create({
            data: {
              title: 'Test Event',
              date: new Date(),
              projects: { connect: { id: p.id } },
            },
          });
          return { project: p, event: e };
        });

        await mutations.removeProjectFromEvent(
          undefined,
          {
            eventId: event.id,
            projectId: project.id,
          },
          context
        );

        const updatedEvent = await testPrisma.event.findUnique({
          where: { id: event.id },
          include: { projects: true },
        });

        expect(updatedEvent?.projects).toHaveLength(0);
      });
    });

    describe('Grant-Project Relationships', () => {
      it('should add project to grant', async () => {
        const { project, grant } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const g = await tx.grant.create({
            data: {
              name: 'Test Grant',
              budget: 100000,
              deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
          });
          return { project: p, grant: g };
        });

        await mutations.addProjectToGrant(
          undefined,
          {
            grantId: grant.id,
            projectId: project.id,
          },
          context
        );

        const updatedGrant = await testPrisma.grant.findUnique({
          where: { id: grant.id },
          include: { projects: true },
        });

        expect(updatedGrant?.projects).toHaveLength(1);
        expect(updatedGrant?.projects[0].id).toBe(project.id);
      });

      it('should remove project from grant', async () => {
        const { project, grant } = await testPrisma.$transaction(async (tx) => {
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          const g = await tx.grant.create({
            data: {
              name: 'Test Grant',
              budget: 100000,
              deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              projects: { connect: { id: p.id } },
            },
          });
          return { project: p, grant: g };
        });

        await mutations.removeProjectFromGrant(
          undefined,
          {
            grantId: grant.id,
            projectId: project.id,
          },
          context
        );

        const updatedGrant = await testPrisma.grant.findUnique({
          where: { id: grant.id },
          include: { projects: true },
        });

        expect(updatedGrant?.projects).toHaveLength(0);
      });
    });

    describe('Project-Collaborator Relationships', () => {
      it('should add collaborator to project', async () => {
        const { collaborator, project } = await testPrisma.$transaction(async (tx) => {
          const c = await tx.collaborator.create({
            data: { name: 'Test Collaborator' },
          });
          const p = await tx.project.create({
            data: { title: 'Test Project' },
          });
          return { collaborator: c, project: p };
        });

        await mutations.addCollaboratorToProject(
          undefined,
          {
            projectId: project.id,
            collaboratorId: collaborator.id,
          },
          context
        );

        const updatedProject = await testPrisma.project.findUnique({
          where: { id: project.id },
          include: { collaborators: true },
        });

        expect(updatedProject?.collaborators).toHaveLength(1);
        expect(updatedProject?.collaborators[0].id).toBe(collaborator.id);
      });

      it('should remove collaborator from project', async () => {
        const { collaborator, project } = await testPrisma.$transaction(async (tx) => {
          const c = await tx.collaborator.create({
            data: { name: 'Test Collaborator' },
          });
          const p = await tx.project.create({
            data: {
              title: 'Test Project',
              collaborators: { connect: { id: c.id } },
            },
          });
          return { collaborator: c, project: p };
        });

        await mutations.removeCollaboratorFromProject(
          undefined,
          {
            projectId: project.id,
            collaboratorId: collaborator.id,
          },
          context
        );

        const updatedProject = await testPrisma.project.findUnique({
          where: { id: project.id },
          include: { collaborators: true },
        });

        expect(updatedProject?.collaborators).toHaveLength(0);
      });
    });

    describe('Event-Equipment Relationships', () => {
      it('should add equipment to event', async () => {
        const { equipment, event } = await testPrisma.$transaction(async (tx) => {
          const e = await tx.equipment.create({
            data: { name: 'Test Equipment', status: 'AVAILABLE' },
          });
          const ev = await tx.event.create({
            data: { title: 'Test Event', date: new Date() },
          });
          return { equipment: e, event: ev };
        });

        await mutations.addEquipmentToEvent(
          undefined,
          {
            eventId: event.id,
            equipmentId: equipment.id,
          },
          context
        );

        const updatedEvent = await testPrisma.event.findUnique({
          where: { id: event.id },
          include: { equipments: true },
        });

        expect(updatedEvent?.equipments).toHaveLength(1);
        expect(updatedEvent?.equipments[0].id).toBe(equipment.id);
      });

      it('should remove equipment from event', async () => {
        const { equipment, event } = await testPrisma.$transaction(async (tx) => {
          const e = await tx.equipment.create({
            data: { name: 'Test Equipment', status: 'AVAILABLE' },
          });
          const ev = await tx.event.create({
            data: {
              title: 'Test Event',
              date: new Date(),
              equipments: { connect: { id: e.id } },
            },
          });
          return { equipment: e, event: ev };
        });

        await mutations.removeEquipmentFromEvent(
          undefined,
          {
            eventId: event.id,
            equipmentId: equipment.id,
          },
          context
        );

        const updatedEvent = await testPrisma.event.findUnique({
          where: { id: event.id },
          include: { equipments: true },
        });

        expect(updatedEvent?.equipments).toHaveLength(0);
      });
    });
  });
});

