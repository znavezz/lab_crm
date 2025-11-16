// tests/factories.test.ts
// Test the factory methods themselves

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupTestDatabase, teardownTestDatabase, cleanTestDatabase } from './setup';
import { testFactory } from './helpers';

describe('Factory Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await cleanTestDatabase();
  });

  describe('Member Factory', () => {
    it('should create member with defaults', async () => {
      const member = await testFactory.createMember();
      expect(member.name).toBeTruthy();
      expect(member.id).toBeDefined();
    });

    it('should create professor with correct defaults', async () => {
      const professor = await testFactory.createProfessor();
      expect(professor.rank).toBe('PROFESSOR');
      expect(professor.role).toBe('PI');
    });

    it('should create student with correct defaults', async () => {
      const student = await testFactory.createStudent();
      expect(student.role).toBe('STUDENT');
    });

    it('should create postdoc with correct defaults', async () => {
      const postdoc = await testFactory.createPostdoc();
      expect(postdoc.rank).toBe('POSTDOC');
      expect(postdoc.role).toBe('RESEARCHER');
    });
  });

  describe('Project Factory', () => {
    it('should create project with defaults', async () => {
      const project = await testFactory.createProject();
      expect(project.title).toBeTruthy();
      expect(project.id).toBeDefined();
    });

    it('should create project with custom title', async () => {
      const project = await testFactory.createProject({
        title: 'Custom Project',
      });
      expect(project.title).toBe('Custom Project');
    });
  });

  describe('Grant Factory', () => {
    it('should create grant with defaults', async () => {
      const grant = await testFactory.createGrant();
      expect(grant.name).toBeTruthy();
      expect(grant.budget).toBeGreaterThan(0);
      expect(grant.deadline).toBeInstanceOf(Date);
    });

    it('should create grant with custom budget', async () => {
      const grant = await testFactory.createGrant({ budget: 500000 });
      expect(grant.budget).toBe(500000);
    });
  });

  describe('Equipment Factory', () => {
    it('should create equipment with defaults', async () => {
      const equipment = await testFactory.createEquipment();
      expect(equipment.name).toBeTruthy();
      expect(equipment.status).toBe('AVAILABLE');
    });

    it('should create equipment with custom status', async () => {
      const equipment = await testFactory.createEquipment({
        status: 'MAINTENANCE',
      });
      expect(equipment.status).toBe('MAINTENANCE');
    });
  });

  describe('Expense Factory', () => {
    it('should create expense without any IDs (auto-creates project)', async () => {
      const expense = await testFactory.createExpense({
        description: 'Test Expense',
        amount: 1000,
      });

      expect(expense.description).toBe('Test Expense');
      expect(expense.amount).toBe(1000);
      expect(expense.projectId).toBeDefined();
      // Verify the project was created
      const project = await testFactory.prisma.project.findUnique({
        where: { id: expense.projectId! },
      });
      expect(project).toBeDefined();
    });

    it('should create expense with valid projectId', async () => {
      const project = await testFactory.createProject();
      const expense = await testFactory.createExpense({
        projectId: project.id,
        description: 'Test Expense',
        amount: 1000,
      });

      expect(expense.projectId).toBe(project.id);
    });

    it('should throw error when projectId does not exist', async () => {
      await expect(
        testFactory.createExpense({
          projectId: 'non-existent-id',
          description: 'Test Expense',
          amount: 1000,
        })
      ).rejects.toThrow('Project with id non-existent-id does not exist');
    });

    it('should create expense with valid grantId', async () => {
      const grant = await testFactory.createGrant();
      const expense = await testFactory.createExpense({
        grantId: grant.id,
        description: 'Test Expense',
        amount: 1000,
      });

      expect(expense.grantId).toBe(grant.id);
    });

    it('should throw error when grantId does not exist', async () => {
      await expect(
        testFactory.createExpense({
          grantId: 'non-existent-id',
          description: 'Test Expense',
          amount: 1000,
        })
      ).rejects.toThrow('Grant with id non-existent-id does not exist');
    });

    it('should create expense with valid eventId', async () => {
      const event = await testFactory.createEvent();
      const expense = await testFactory.createExpense({
        eventId: event.id,
        description: 'Test Expense',
        amount: 1000,
      });

      expect(expense.eventId).toBe(event.id);
    });

    it('should throw error when eventId does not exist', async () => {
      await expect(
        testFactory.createExpense({
          eventId: 'non-existent-id',
          description: 'Test Expense',
          amount: 1000,
        })
      ).rejects.toThrow('Event with id non-existent-id does not exist');
    });
  });

  describe('Booking Factory', () => {
    it('should create booking with valid time range', async () => {
      const member = await testFactory.createMember();
      const equipment = await testFactory.createEquipment();

      const startTime = new Date();
      startTime.setHours(startTime.getHours() + 1);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 2);

      const booking = await testFactory.createBooking({
        memberId: member.id,
        equipmentId: equipment.id,
        startTime,
        endTime,
      });

      expect(booking.startTime).toEqual(startTime);
      expect(booking.endTime).toEqual(endTime);
      expect(booking.endTime.getTime()).toBeGreaterThan(booking.startTime.getTime());
    });

    it('should create booking without equipmentId (auto-creates equipment)', async () => {
      const member = await testFactory.createMember();
      const booking = await testFactory.createBooking({
        memberId: member.id,
      });

      expect(booking.memberId).toBe(member.id);
      expect(booking.equipmentId).toBeDefined();
      // Verify the equipment was created
      const equipment = await testFactory.prisma.equipment.findUnique({
        where: { id: booking.equipmentId! },
      });
      expect(equipment).toBeDefined();
    });

    it('should create booking without memberId (auto-creates member)', async () => {
      const equipment = await testFactory.createEquipment();
      const booking = await testFactory.createBooking({
        equipmentId: equipment.id,
      });

      expect(booking.equipmentId).toBe(equipment.id);
      expect(booking.memberId).toBeDefined();
      // Verify the member was created
      const member = await testFactory.prisma.member.findUnique({
        where: { id: booking.memberId! },
      });
      expect(member).toBeDefined();
    });

    it('should create booking without equipmentId or memberId (auto-creates both)', async () => {
      const booking = await testFactory.createBooking();

      expect(booking.equipmentId).toBeDefined();
      expect(booking.memberId).toBeDefined();
      // Verify both were created
      const equipment = await testFactory.prisma.equipment.findUnique({
        where: { id: booking.equipmentId! },
      });
      const member = await testFactory.prisma.member.findUnique({
        where: { id: booking.memberId! },
      });
      expect(equipment).toBeDefined();
      expect(member).toBeDefined();
    });
  });

  describe('Publication Factory', () => {
    it('should create publication with defaults', async () => {
      const publication = await testFactory.createPublication();
      expect(publication.title).toBeTruthy();
    });

    it('should create publication with unique DOI', async () => {
      const pub1 = await testFactory.createPublication({ doi: '10.1000/test1' });
      const pub2 = await testFactory.createPublication({ doi: '10.1000/test2' });

      expect(pub1.doi).toBe('10.1000/test1');
      expect(pub2.doi).toBe('10.1000/test2');
    });
  });

  describe('Lab Manager Factory', () => {
    it('should create lab manager with correct defaults', async () => {
      const labManager = await testFactory.createLabManager();
      expect(labManager.role).toBe('LAB_MANAGER');
      expect(labManager.status).toBe('ACTIVE');
    });
  });

  describe('Collaborator Factory', () => {
    it('should create collaborator with defaults', async () => {
      const collaborator = await testFactory.createCollaborator();
      expect(collaborator.name).toBeTruthy();
      expect(collaborator.organization).toBeTruthy();
    });

    it('should create collaborator with custom organization', async () => {
      const collaborator = await testFactory.createCollaborator({
        organization: 'MIT',
      });
      expect(collaborator.organization).toBe('MIT');
    });
  });

  describe('Document Factory', () => {
    it('should create document with defaults', async () => {
      const document = await testFactory.createDocument();
      expect(document.filename).toBeTruthy();
      expect(document.url).toBeTruthy();
    });

    it('should create document linked to project', async () => {
      const project = await testFactory.createProject();
      const document = await testFactory.createDocument({
        projectId: project.id,
      });
      expect(document.projectId).toBe(project.id);
    });
  });

  describe('Event Factory', () => {
    it('should create event with defaults', async () => {
      const event = await testFactory.createEvent();
      expect(event.title).toBeTruthy();
      expect(event.date).toBeInstanceOf(Date);
    });

    it('should create event with custom location', async () => {
      const event = await testFactory.createEvent({
        location: 'Conference Room A',
      });
      expect(event.location).toBe('Conference Room A');
    });
  });

  describe('NoteTask Factory', () => {
    it('should create note task with defaults', async () => {
      const task = await testFactory.createNoteTask();
      expect(task.content).toBeTruthy();
      expect(task.completed).toBe(false);
    });

    it('should create completed task', async () => {
      const task = await testFactory.createNoteTask({ completed: true });
      expect(task.completed).toBe(true);
    });
  });

  describe('AcademicInfo Factory', () => {
    it('should create academic info with member', async () => {
      const member = await testFactory.createMember();
      const academicInfo = await testFactory.createAcademicInfo({
        memberId: member.id,
      });
      expect(academicInfo.memberId).toBe(member.id);
      expect(academicInfo.degree).toBe('BSc');
    });

    it('should create academic info with custom degree', async () => {
      const member = await testFactory.createMember();
      const academicInfo = await testFactory.createAcademicInfo({
        memberId: member.id,
        degree: 'PhD',
        field: 'Computer Science',
      });
      expect(academicInfo.degree).toBe('PhD');
      expect(academicInfo.field).toBe('Computer Science');
    });
  });
});

