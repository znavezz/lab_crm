// tests/database.test.ts
// Database integration tests using seed scripts

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { testPrisma, setupTestDatabase, teardownTestDatabase, cleanTestDatabase } from './setup';
import { testFactory, testFixtures } from './helpers';

describe('Database Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await cleanTestDatabase();
  });

  describe('Seed Scripts', () => {
    it('should create minimal setup with factories', async () => {
      const minimal = await testFixtures.createMinimalSetup();
      
      expect(minimal.member).toBeDefined();
      expect(minimal.member.name).toBeTruthy();
      expect(minimal.project).toBeDefined();
      expect(minimal.project.title).toBeTruthy();
      expect(minimal.grant).toBeDefined();
      expect(minimal.grant.name).toBeTruthy();
    });

    it('should create complete lab setup', async () => {
      const data = await testFixtures.createCompleteLabSetup();
      
      expect(data.members).toHaveLength(5);
      expect(data.projects).toHaveLength(2);
      expect(data.grants).toHaveLength(2);
      expect(data.equipment).toHaveLength(4);
      expect(data.events).toHaveLength(1);
      expect(data.publication).toBeDefined();
    });

    it('should create project with expenses', async () => {
      const data = await testFixtures.createProjectWithExpenses();
      
      expect(data.project).toBeDefined();
      expect(data.grant).toBeDefined();
      expect(data.expenses).toHaveLength(3);
      expect(data.expenses[0]?.amount).toBe(10000);
      expect(data.expenses[1]?.amount).toBe(5000);
      expect(data.expenses[2]?.amount).toBe(3000);
    });
  });

  describe('Member Model', () => {
    it('should create a member with all fields', async () => {
      const member = await testFactory.createMember({
        name: 'Test Member',
        rank: 'MSc',
        status: 'ACTIVE',
        role: 'STUDENT',
        scholarship: 5000,
      });

      expect(member.id).toBeDefined();
      expect(member.name).toBe('Test Member');
      expect(member.rank).toBe('MSc');
      expect(member.status).toBe('ACTIVE');
      expect(member.role).toBe('STUDENT');
      expect(member.scholarship).toBe(5000);
    });

    it('should create a professor using factory method', async () => {
      const professor = await testFactory.createProfessor({
        name: 'Dr. Test Professor',
      });

      expect(professor.rank).toBe('PROFESSOR');
      expect(professor.role).toBe('PI');
      expect(professor.status).toBe('ACTIVE');
    });

    it('should query members from database', async () => {
      await testFactory.createMember({ name: 'Member 1' });
      await testFactory.createMember({ name: 'Member 2' });

      const members = await testPrisma.member.findMany();
      expect(members).toHaveLength(2);
    });
  });

  describe('Project Model', () => {
    it('should create a project with dates', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      
      const project = await testFactory.createProject({
        title: 'Test Project',
        description: 'Test Description',
        startDate,
        endDate,
      });

      expect(project.title).toBe('Test Project');
      expect(project.description).toBe('Test Description');
      expect(project.startDate).toEqual(startDate);
      expect(project.endDate).toEqual(endDate);
    });

    it('should link members to projects', async () => {
      // Use transaction to ensure both records are visible
      const { member, project } = await testPrisma.$transaction(async (tx) => {
        const m = await tx.member.create({
          data: {
            name: 'Test Member',
            rank: 'MSc',
            status: 'ACTIVE',
            role: 'STUDENT',
          },
        });
        const p = await tx.project.create({
          data: {
            title: 'Test Project',
            members: { connect: [{ id: m.id }] },
          },
        });
        return { member: m, project: p };
      });

      const updatedProject = await testPrisma.project.findUnique({
        where: { id: project.id },
        include: { members: true },
      });

      expect(updatedProject).toBeDefined();
      expect(updatedProject?.members).toHaveLength(1);
      expect(updatedProject?.members[0].id).toBe(member.id);
    });
  });

  describe('Grant and Expense Models', () => {
    it('should calculate grant budget correctly', async () => {
      // Use transaction to ensure grant is visible when creating expenses
      const result = await testPrisma.$transaction(async (tx) => {
        const grant = await tx.grant.create({
          data: {
            name: 'Test Grant',
            budget: 100000,
            deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
        });

        // Create expenses within the same transaction
        await tx.expense.create({
          data: { description: 'Expense 1', amount: 10000, grantId: grant.id, date: new Date() },
        });
        await tx.expense.create({
          data: { description: 'Expense 2', amount: 5000, grantId: grant.id, date: new Date() },
        });
        await tx.expense.create({
          data: { description: 'Expense 3', amount: 3000, grantId: grant.id, date: new Date() },
        });

        return grant;
      });

      const grantWithExpenses = await testPrisma.grant.findUnique({
        where: { id: result.id },
        include: { expenses: true },
      });

      const totalSpent = grantWithExpenses!.expenses.reduce(
        (sum, e) => sum + e.amount,
        0
      );
      const remaining = result.budget - totalSpent;

      expect(totalSpent).toBe(18000);
      expect(remaining).toBe(82000);
    });

    it('should link expenses to both project and grant', async () => {
      // Use transaction to ensure all records are created atomically
      const { project, grant, expense } = await testPrisma.$transaction(async (tx) => {
        const p = await tx.project.create({ data: { title: 'Test Project' } });
        const g = await tx.grant.create({
          data: {
            name: 'Test Grant',
            budget: 100000,
            deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
        });
        const e = await tx.expense.create({
          data: {
            description: 'Test Expense',
            amount: 5000,
            date: new Date(),
            projectId: p.id,
            grantId: g.id,
          },
        });
        return { project: p, grant: g, expense: e };
      });

      expect(expense.projectId).toBe(project.id);
      expect(expense.grantId).toBe(grant.id);
    });
  });

  describe('Equipment and Booking Models', () => {
    it('should create equipment with status', async () => {
      const equipment = await testFactory.createEquipment({
        name: 'Test Equipment',
        status: 'AVAILABLE',
        serialNumber: 'SN123',
      });

      expect(equipment.name).toBe('Test Equipment');
      expect(equipment.status).toBe('AVAILABLE');
      expect(equipment.serialNumber).toBe('SN123');
    });

    it('should create a booking for equipment', async () => {
      const member = await testFactory.createMember();
      const equipment = await testFactory.createEquipment();

      const startTime = new Date();
      startTime.setHours(startTime.getHours() + 1);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 3);

      const booking = await testFactory.createBooking({
        equipmentId: equipment.id,
        memberId: member.id,
        startTime,
        endTime,
        purpose: 'Testing',
      });

      expect(booking.equipmentId).toBe(equipment.id);
      expect(booking.memberId).toBe(member.id);
      expect(booking.purpose).toBe('Testing');
    });
  });

  describe('Publication Model', () => {
    it('should create a publication with DOI', async () => {
      const publication = await testFactory.createPublication({
        title: 'Test Paper',
        doi: '10.1000/test',
        url: 'https://example.com/paper',
      });

      expect(publication.title).toBe('Test Paper');
      expect(publication.doi).toBe('10.1000/test');
      expect(publication.url).toBe('https://example.com/paper');
    });

    it('should link publication to members and projects', async () => {
      // Create all records in transaction to ensure visibility
      const { publication } = await testPrisma.$transaction(async (tx) => {
        const m1 = await tx.member.create({
          data: { name: 'Member 1', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
        });
        const m2 = await tx.member.create({
          data: { name: 'Member 2', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
        });
        const p = await tx.project.create({ data: { title: 'Test Project' } });
        const pub = await tx.publication.create({
        data: {
            title: 'Test Publication',
            members: { connect: [{ id: m1.id }, { id: m2.id }] },
            projects: { connect: [{ id: p.id }] },
        },
        });
        return { publication: pub };
      });

      const updatedPublication = await testPrisma.publication.findUnique({
        where: { id: publication.id },
        include: { members: true, projects: true },
      });

      expect(updatedPublication).toBeDefined();
      expect(updatedPublication?.members).toHaveLength(2);
      expect(updatedPublication?.projects).toHaveLength(1);
    });
  });

  describe('Event Model', () => {
    it('should create an event with attendees', async () => {
      // Create all records in transaction to ensure visibility
      const { event } = await testPrisma.$transaction(async (tx) => {
        const m1 = await tx.member.create({
          data: { name: 'Member 1', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
        });
        const m2 = await tx.member.create({
          data: { name: 'Member 2', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
        });
        const e = await tx.event.create({
          data: {
            title: 'Lab Meeting',
            date: new Date(),
            location: 'Conference Room',
            attendees: { connect: [{ id: m1.id }, { id: m2.id }] },
          },
        });
        return { event: e };
      });

      const updatedEvent = await testPrisma.event.findUnique({
        where: { id: event.id },
        include: { attendees: true },
      });

      expect(updatedEvent?.attendees).toHaveLength(2);
    });
  });

  describe('NoteTask Model', () => {
    it('should create a note task linked to a project', async () => {
      const project = await testFactory.createProject();
      const task = await testFactory.createNoteTask({
        title: 'Test Task',
        content: 'Do something',
        projectId: project.id,
        completed: false,
      });

      expect(task.title).toBe('Test Task');
      expect(task.content).toBe('Do something');
      expect(task.projectId).toBe(project.id);
      expect(task.completed).toBe(false);
    });
  });

  describe('AcademicInfo Model', () => {
    it('should create academic info linked to member', async () => {
      // Use transaction to ensure member is visible
      const { member, academicInfo } = await testPrisma.$transaction(async (tx) => {
        const m = await tx.member.create({
          data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
        });
        const ai = await tx.academicInfo.create({
          data: {
            memberId: m.id,
            degree: 'PhD',
            field: 'Bioinformatics',
            institution: 'MIT',
            graduationYear: 2020,
          },
        });
        return { member: m, academicInfo: ai };
      });

      expect(academicInfo.memberId).toBe(member.id);
      expect(academicInfo.degree).toBe('PhD');
      
      const memberWithInfo = await testPrisma.member.findUnique({
        where: { id: member.id },
        include: { academicInfo: true },
      });

      expect(memberWithInfo?.academicInfo).toHaveLength(1);
    });

    it('should allow multiple academic info records per member', async () => {
      // Use transaction to ensure member is visible
      const { member } = await testPrisma.$transaction(async (tx) => {
        const m = await tx.member.create({
          data: { name: 'Test Member', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT' },
        });
        
        await tx.academicInfo.create({
          data: {
            memberId: m.id,
            degree: 'BSc',
            graduationYear: 2015,
          },
        });
        
        await tx.academicInfo.create({
          data: {
            memberId: m.id,
            degree: 'MSc',
            graduationYear: 2017,
          },
        });

        return { member: m };
      });

      const memberWithInfo = await testPrisma.member.findUnique({
        where: { id: member.id },
        include: { academicInfo: true },
      });

      expect(memberWithInfo?.academicInfo).toHaveLength(2);
    });
  });

  describe('Collaborator Model', () => {
    it('should create collaborator', async () => {
      const collaborator = await testFactory.createCollaborator({
        name: 'Dr. John Smith',
        organization: 'Harvard',
      });

      expect(collaborator.name).toBe('Dr. John Smith');
      expect(collaborator.organization).toBe('Harvard');
    });

    it('should link collaborator to projects', async () => {
      // Create all records in transaction to ensure visibility
      const { collaborator, project } = await testPrisma.$transaction(async (tx) => {
        const c = await tx.collaborator.create({
          data: { name: 'Test Collaborator', organization: 'Test Org' },
        });
        const p = await tx.project.create({
          data: {
            title: 'Test Project',
            collaborators: { connect: [{ id: c.id }] },
          },
        });
        return { collaborator: c, project: p };
      });

      const updatedProject = await testPrisma.project.findUnique({
        where: { id: project.id },
        include: { collaborators: true },
      });

      expect(updatedProject?.collaborators).toHaveLength(1);
      expect(updatedProject?.collaborators[0].id).toBe(collaborator.id);
    });
  });

  describe('Document Model', () => {
    it('should create document linked to project', async () => {
      const project = await testFactory.createProject();
      const document = await testFactory.createDocument({
        filename: 'proposal.pdf',
        url: '/documents/proposal.pdf',
        projectId: project.id,
      });

      expect(document.projectId).toBe(project.id);
      expect(document.filename).toBe('proposal.pdf');
    });

    it('should create document linked to member', async () => {
      const member = await testFactory.createMember();
      const document = await testFactory.createDocument({
        filename: 'cv.pdf',
        url: '/documents/cv.pdf',
        memberId: member.id,
      });

      expect(document.memberId).toBe(member.id);
    });
  });

  describe('Equipment Allocation', () => {
    it('should allocate equipment to project', async () => {
      const project = await testFactory.createProject();
      const equipment = await testFactory.createEquipment({
        name: 'Project Equipment',
        projectId: project.id,
      });

      expect(equipment.projectId).toBe(project.id);
    });

    it('should allocate equipment to member', async () => {
      const member = await testFactory.createMember();
      const equipment = await testFactory.createEquipment({
        name: 'Personal Laptop',
        memberId: member.id,
      });

      expect(equipment.memberId).toBe(member.id);
    });

    it('should link equipment to events', async () => {
      const equipment = await testFactory.createEquipment();
      const event = await testFactory.createEvent();

      await testPrisma.event.update({
        where: { id: event.id },
        data: {
          equipments: { connect: [{ id: equipment.id }] },
        },
      });

      const updatedEvent = await testPrisma.event.findUnique({
        where: { id: event.id },
        include: { equipments: true },
      });

      expect(updatedEvent?.equipments).toHaveLength(1);
    });
  });

  describe('Project Relationships', () => {
    it('should link grants to projects', async () => {
      const project = await testFactory.createProject();
      const grant = await testFactory.createGrant();

      await testPrisma.project.update({
        where: { id: project.id },
        data: {
          grants: { connect: [{ id: grant.id }] },
        },
      });

      const updatedProject = await testPrisma.project.findUnique({
        where: { id: project.id },
        include: { grants: true },
      });

      expect(updatedProject?.grants).toHaveLength(1);
    });

    it('should link publications to projects', async () => {
      const project = await testFactory.createProject();
      const publication = await testFactory.createPublication();

      await testPrisma.project.update({
        where: { id: project.id },
        data: {
          publications: { connect: [{ id: publication.id }] },
        },
      });

      const updatedProject = await testPrisma.project.findUnique({
        where: { id: project.id },
        include: { publications: true },
      });

      expect(updatedProject?.publications).toHaveLength(1);
    });

    it('should link events to projects', async () => {
      const project = await testFactory.createProject();
      const event = await testFactory.createEvent();

      await testPrisma.event.update({
        where: { id: event.id },
        data: {
          projects: { connect: [{ id: project.id }] },
        },
      });

      const updatedEvent = await testPrisma.event.findUnique({
        where: { id: event.id },
        include: { projects: true },
      });

      expect(updatedEvent?.projects).toHaveLength(1);
    });
  });

  describe('Booking Relationships', () => {
    it('should create booking linked to project', async () => {
      const member = await testFactory.createMember();
      const equipment = await testFactory.createEquipment();
      const project = await testFactory.createProject();

      const booking = await testFactory.createBooking({
        memberId: member.id,
        equipmentId: equipment.id,
        projectId: project.id,
      });

      expect(booking.projectId).toBe(project.id);
    });

    it('should create booking linked to event', async () => {
      const member = await testFactory.createMember();
      const equipment = await testFactory.createEquipment();
      const event = await testFactory.createEvent();

      const booking = await testFactory.createBooking({
        memberId: member.id,
        equipmentId: equipment.id,
        eventId: event.id,
      });

      expect(booking.eventId).toBe(event.id);
    });
  });

  describe('Expense Relationships', () => {
    it('should create expense linked to event', async () => {
      const event = await testFactory.createEvent();
      const expense = await testFactory.createExpense({
        amount: 500,
        eventId: event.id,
      });

      expect(expense.eventId).toBe(event.id);
    });
  });

  describe('NoteTask Polymorphic Relations', () => {
    it('should create note task linked to grant', async () => {
      const grant = await testFactory.createGrant();
      const task = await testFactory.createNoteTask({
        grantId: grant.id,
        content: 'Review grant proposal',
      });

      expect(task.grantId).toBe(grant.id);
    });

    it('should create note task linked to equipment', async () => {
      const equipment = await testFactory.createEquipment();
      const task = await testFactory.createNoteTask({
        equipmentId: equipment.id,
        content: 'Schedule maintenance',
      });

      expect(task.equipmentId).toBe(equipment.id);
    });

    it('should create note task linked to publication', async () => {
      const publication = await testFactory.createPublication();
      const task = await testFactory.createNoteTask({
        publicationId: publication.id,
        content: 'Submit to journal',
      });

      expect(task.publicationId).toBe(publication.id);
    });
  });

  describe('Database Constraints', () => {
    it('should enforce unique DOI for publications', async () => {
      await testFactory.createPublication({ doi: '10.1000/unique' });

      await expect(
        testFactory.createPublication({ doi: '10.1000/unique' })
      ).rejects.toThrow();
    });

    it('should enforce unique serial number for equipment', async () => {
      await testFactory.createEquipment({ serialNumber: 'SN-001' });

      await expect(
        testFactory.createEquipment({ serialNumber: 'SN-001' })
      ).rejects.toThrow();
    });

    it('should cascade delete when member is deleted', async () => {
      const member = await testFactory.createMember();
      const academicInfo = await testFactory.createAcademicInfo({
        memberId: member.id,
      });
      const document = await testFactory.createDocument({
        memberId: member.id,
      });

      await testPrisma.member.delete({ where: { id: member.id } });

      const deletedInfo = await testPrisma.academicInfo.findUnique({
        where: { id: academicInfo.id },
      });
      const deletedDoc = await testPrisma.document.findUnique({
        where: { id: document.id },
      });

      expect(deletedInfo).toBeNull();
      expect(deletedDoc).toBeNull();
    });

    it('should set null on equipment when project is deleted', async () => {
      const project = await testFactory.createProject();
      const equipment = await testFactory.createEquipment({
        projectId: project.id,
      });

      await testPrisma.project.delete({ where: { id: project.id } });

      const updatedEquipment = await testPrisma.equipment.findUnique({
        where: { id: equipment.id },
      });

      expect(updatedEquipment?.projectId).toBeNull();
    });
  });
});

