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
    });
  });

  describe('Type Resolvers (Relationships)', () => {
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
    });
  });

  describe('Relationship Mutations', () => {
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
});

