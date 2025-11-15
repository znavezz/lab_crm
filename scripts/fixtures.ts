// scripts/fixtures.ts
// Common test scenarios and data combinations

import { PrismaClient } from '@/generated/prisma';
import { DataFactory } from './factories';

export class TestFixtures {
  constructor(
    private prisma: PrismaClient,
    private factory: DataFactory
  ) {}

  /**
   * Creates a complete lab setup with:
   * - 1 Professor (PI)
   * - 1 Postdoc
   * - 2 Students
   * - 1 Lab Manager
   * - 2 Projects
   * - 2 Grants
   * - 4 Equipment items
   * - Some expenses and bookings
   */
  async createCompleteLabSetup() {
    // Create members and academic info in one transaction to ensure visibility
    const { professor, postdoc, student1, student2, labManager } = await this.prisma.$transaction(async (tx) => {
      const prof = await tx.member.create({
        data: {
          name: 'Dr. Sarah Cohen',
          rank: 'PROFESSOR',
          status: 'ACTIVE',
          role: 'PI',
        },
      });

      const post = await tx.member.create({
        data: {
          name: 'Dr. Michael Levy',
          rank: 'POSTDOC',
          status: 'ACTIVE',
          role: 'RESEARCHER',
          scholarship: 50000,
        },
      });

      const stud1 = await tx.member.create({
        data: {
          name: 'David Ben-Ami',
          rank: 'MSc',
          status: 'ACTIVE',
          role: 'STUDENT',
          scholarship: 30000,
        },
      });

      const stud2 = await tx.member.create({
        data: {
          name: 'Rachel Mizrahi',
          rank: 'MSc',
          status: 'ACTIVE',
          role: 'STUDENT',
          scholarship: 30000,
        },
      });

      const labMgr = await tx.member.create({
        data: {
          name: 'Yael Avraham',
          rank: 'MSc',
          status: 'ACTIVE',
          role: 'LAB_MANAGER',
        },
      });

      // Create academic info within the same transaction
      await tx.academicInfo.create({
        data: {
          memberId: prof.id,
          degree: 'PhD',
          field: 'Bioinformatics',
          institution: 'MIT',
          graduationYear: 2010,
        },
      });

      await tx.academicInfo.create({
        data: {
          memberId: post.id,
          degree: 'PhD',
          field: 'Molecular Biology',
          institution: 'Weizmann Institute',
          graduationYear: 2020,
        },
      });

      return { professor: prof, postdoc: post, student1: stud1, student2: stud2, labManager: labMgr };
    });

    // Create projects using direct Prisma calls to ensure same connection
    const project1 = await this.prisma.project.create({
      data: {
        title: 'Genome Sequencing Analysis',
        description: 'Advanced analysis of genomic data using machine learning',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
      },
    });

    const project2 = await this.prisma.project.create({
      data: {
        title: 'Protein Structure Prediction',
        description: 'Using AI to predict protein folding patterns',
        startDate: new Date('2024-06-01'),
      },
    });

    // Link members to projects
    await this.prisma.project.update({
      where: { id: project1.id },
      data: {
        members: {
          connect: [{ id: professor.id }, { id: postdoc.id }, { id: student1.id }],
        },
      },
    });

    await this.prisma.project.update({
      where: { id: project2.id },
      data: {
        members: {
          connect: [{ id: professor.id }, { id: student2.id }, { id: labManager.id }],
        },
      },
    });

    // Create grants using direct Prisma calls
    const grant1 = await this.prisma.grant.create({
      data: {
        name: 'ISF Research Grant 2024',
        budget: 500000,
        deadline: new Date('2026-12-31'),
      },
    });

    const grant2 = await this.prisma.grant.create({
      data: {
        name: 'ERC Starting Grant',
        budget: 1000000,
        deadline: new Date('2027-06-30'),
      },
    });

    // Link grants to projects
    await this.prisma.project.update({
      where: { id: project1.id },
      data: {
        grants: {
          connect: [{ id: grant1.id }, { id: grant2.id }],
        },
      },
    });

    await this.prisma.project.update({
      where: { id: project2.id },
      data: {
        grants: {
          connect: [{ id: grant2.id }],
        },
      },
    });

    // Create equipment
    const sequencer = await this.factory.createEquipment({
      name: 'Illumina NextSeq 550',
      description: 'High-throughput DNA sequencer',
      serialNumber: 'NS-2024-001',
      status: 'AVAILABLE',
      projectId: project1.id,
    });

    const microscope = await this.factory.createEquipment({
      name: 'Confocal Microscope',
      description: 'Zeiss LSM 880 with Airyscan',
      serialNumber: 'CM-2023-045',
      status: 'IN_USE',
      projectId: project2.id,
    });

    const laptop = await this.factory.createEquipment({
      name: 'MacBook Pro M3',
      description: 'Development laptop for data analysis',
      serialNumber: 'MBP-2024-123',
      status: 'AVAILABLE',
      memberId: postdoc.id,
    });

    const centrifuge = await this.factory.createEquipment({
      name: 'High-Speed Centrifuge',
      description: 'Eppendorf 5424R',
      status: 'AVAILABLE',
    });

    // Create expenses
    await this.factory.createExpense({
      description: 'Sequencing reagents',
      amount: 5000,
      date: new Date('2024-10-01'),
      projectId: project1.id,
      grantId: grant1.id,
    });

    await this.factory.createExpense({
      description: 'Microscope maintenance',
      amount: 3000,
      date: new Date('2024-11-01'),
      projectId: project2.id,
      grantId: grant2.id,
    });

    // Create bookings
    await this.factory.createBooking({
      startTime: new Date('2024-11-20T09:00:00Z'),
      endTime: new Date('2024-11-20T12:00:00Z'),
      purpose: 'Sample sequencing run',
      equipmentId: sequencer.id,
      memberId: student1.id,
      projectId: project1.id,
    });

    await this.factory.createBooking({
      startTime: new Date('2024-11-21T14:00:00Z'),
      endTime: new Date('2024-11-21T17:00:00Z'),
      purpose: 'Cell imaging session',
      equipmentId: microscope.id,
      memberId: student2.id,
      projectId: project2.id,
    });

    // Create events
    const labMeeting = await this.factory.createEvent({
      title: 'Weekly Lab Meeting',
      description: 'Progress updates and paper discussion',
      date: new Date('2024-11-25T10:00:00Z'),
      location: 'Conference Room A',
    });

    await this.prisma.event.update({
      where: { id: labMeeting.id },
      data: {
        attendees: {
          connect: [
            { id: professor.id },
            { id: postdoc.id },
            { id: student1.id },
            { id: student2.id },
            { id: labManager.id },
          ],
        },
        projects: {
          connect: [{ id: project1.id }, { id: project2.id }],
        },
      },
    });

    // Create publication
    const publication = await this.factory.createPublication({
      title: 'Novel Machine Learning Approach to Genomic Analysis',
      published: new Date('2024-08-15'),
      doi: '10.1234/example.2024.001',
      url: 'https://example.com/paper1',
    });

    await this.prisma.publication.update({
      where: { id: publication.id },
      data: {
        members: {
          connect: [{ id: professor.id }, { id: postdoc.id }],
        },
        projects: {
          connect: [{ id: project1.id }],
        },
      },
    });

    // Create collaborator
    const collaborator = await this.factory.createCollaborator({
      name: 'Dr. John Smith',
      organization: 'Harvard Medical School',
    });

    await this.prisma.project.update({
      where: { id: project1.id },
      data: {
        collaborators: {
          connect: [{ id: collaborator.id }],
        },
      },
    });

    // Create documents
    await this.factory.createDocument({
      filename: 'project1_proposal.pdf',
      url: '/documents/project1_proposal.pdf',
      projectId: project1.id,
    });

    await this.factory.createDocument({
      filename: 'sarah_cohen_cv.pdf',
      url: '/documents/cvs/sarah_cohen_cv.pdf',
      memberId: professor.id,
    });

    // Create note tasks
    await this.factory.createNoteTask({
      title: 'Review sequencing results',
      content: 'Check quality metrics and alignment rates',
      completed: false,
      dueDate: new Date('2024-11-22'),
      projectId: project1.id,
    });

    return {
      members: { professor, postdoc, student1, student2, labManager },
      projects: { project1, project2 },
      grants: { grant1, grant2 },
      equipment: { sequencer, microscope, laptop, centrifuge },
      events: { labMeeting },
      publication,
      collaborator,
    };
  }

  /**
   * Creates a minimal setup for quick testing:
   * - 1 Member
   * - 1 Project
   * - 1 Grant
   */
  async createMinimalSetup() {
    const member = await this.factory.createMember();
    const project = await this.factory.createProject();
    const grant = await this.factory.createGrant();

    await this.prisma.project.update({
      where: { id: project.id },
      data: {
        members: { connect: [{ id: member.id }] },
        grants: { connect: [{ id: grant.id }] },
      },
    });

    return { member, project, grant };
  }

  /**
   * Creates a project with expenses to test budget calculations
   */
  async createProjectWithExpenses() {
    const project = await this.factory.createProject();
    const grant = await this.factory.createGrant({ budget: 100000 });

    await this.prisma.project.update({
      where: { id: project.id },
      data: {
        grants: { connect: [{ id: grant.id }] },
      },
    });

    // Create multiple expenses
    const expenses = await Promise.all([
      this.factory.createExpense({
        amount: 10000,
        projectId: project.id,
        grantId: grant.id,
      }),
      this.factory.createExpense({
        amount: 5000,
        projectId: project.id,
        grantId: grant.id,
      }),
      this.factory.createExpense({
        amount: 3000,
        projectId: project.id,
        grantId: grant.id,
      }),
    ]);

    return { project, grant, expenses };
  }
}

