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
   * - 2 Postdocs (1 active, 1 alumni)
   * - 4 Students (2 active, 2 alumni)
   * - 1 Lab Manager
   * - Multiple Projects spanning several years
   * - Multiple Grants
   * - Multiple Equipment items (with correct status logic)
   * - Publications spanning several years
   * - Some expenses and bookings
   */
  async createCompleteLabSetup() {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Create members and academic info in one transaction to ensure visibility
    const { professor, postdoc, postdocAlumni, student1, student2, studentAlumni1, studentAlumni2, labManager } = await this.prisma.$transaction(async (tx) => {
      const prof = await tx.member.create({
        data: {
          name: 'Dr. Sarah Cohen',
          rank: 'PROFESSOR',
          status: 'ACTIVE',
          role: 'PI',
          joinedDate: new Date(`${currentYear - 10}-01-01`), // 10 years ago
        },
      });

      const post = await tx.member.create({
        data: {
          name: 'Dr. Michael Levy',
          rank: 'POSTDOC',
          status: 'ACTIVE',
          role: 'RESEARCHER',
          scholarship: 50000,
          joinedDate: new Date(`${currentYear - 2}-09-01`), // 2 years ago
        },
      });

      const postAlumni = await tx.member.create({
        data: {
          name: 'Dr. Erez Levanon',
          rank: 'POSTDOC',
          status: 'ALUMNI',
          role: 'RESEARCHER',
          scholarship: 50000,
          joinedDate: new Date(`${currentYear - 5}-09-01`), // 5 years ago
        },
      });

      const stud1 = await tx.member.create({
        data: {
          name: 'David Ben-Ami',
          rank: 'MSc',
          status: 'ACTIVE',
          role: 'STUDENT',
          scholarship: 30000,
          joinedDate: new Date(`${currentYear - 1}-10-01`), // 1 year ago
        },
      });

      const stud2 = await tx.member.create({
        data: {
          name: 'Rachel Mizrahi',
          rank: 'MSc',
          status: 'ACTIVE',
          role: 'STUDENT',
          scholarship: 30000,
          joinedDate: new Date(`${currentYear - 1}-10-01`), // 1 year ago
        },
      });

      const studAlumni1 = await tx.member.create({
        data: {
          name: 'Mr. David Gorelik',
          rank: 'PhD',
          status: 'ALUMNI',
          role: 'STUDENT',
          scholarship: 35000,
          joinedDate: new Date(`${currentYear - 4}-10-01`), // 4 years ago
        },
      });

      const studAlumni2 = await tx.member.create({
        data: {
          name: 'Anna Rosen',
          rank: 'MSc',
          status: 'ALUMNI',
          role: 'STUDENT',
          scholarship: 30000,
          joinedDate: new Date(`${currentYear - 3}-10-01`), // 3 years ago
        },
      });

      const labMgr = await tx.member.create({
        data: {
          name: 'Yael Avraham',
          rank: 'MSc',
          status: 'ACTIVE',
          role: 'LAB_MANAGER',
          joinedDate: new Date(`${currentYear - 3}-01-01`), // 3 years ago
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

      await tx.academicInfo.create({
        data: {
          memberId: postAlumni.id,
          degree: 'PhD',
          field: 'Biochemistry',
          institution: 'Hebrew University',
          graduationYear: 2018,
        },
      });

      await tx.academicInfo.create({
        data: {
          memberId: studAlumni1.id,
          degree: 'MSc',
          field: 'Bioinformatics',
          institution: 'Tel Aviv University',
          graduationYear: 2020,
        },
      });

      await tx.academicInfo.create({
        data: {
          memberId: studAlumni2.id,
          degree: 'BSc',
          field: 'Biology',
          institution: 'Ben-Gurion University',
          graduationYear: 2020,
        },
      });

      return { 
        professor: prof, 
        postdoc: post, 
        postdocAlumni: postAlumni,
        student1: stud1, 
        student2: stud2,
        studentAlumni1: studAlumni1,
        studentAlumni2: studAlumni2,
        labManager: labMgr 
      };
    });

    // Create projects spanning several years
    const { project1, project2, project3, project4 } = await this.prisma.$transaction(async (tx) => {
      // Verify members exist before connecting
      const prof = await tx.member.findUnique({ where: { id: professor.id } });
      const post = await tx.member.findUnique({ where: { id: postdoc.id } });
      const postAlum = await tx.member.findUnique({ where: { id: postdocAlumni.id } });
      const stud1 = await tx.member.findUnique({ where: { id: student1.id } });
      const stud2 = await tx.member.findUnique({ where: { id: student2.id } });
      const studAlum1 = await tx.member.findUnique({ where: { id: studentAlumni1.id } });
      const studAlum2 = await tx.member.findUnique({ where: { id: studentAlumni2.id } });
      const labMgr = await tx.member.findUnique({ where: { id: labManager.id } });

      if (!prof || !post || !postAlum || !stud1 || !stud2 || !studAlum1 || !studAlum2 || !labMgr) {
        throw new Error('One or more members not found when creating projects');
      }

      // Current active project
      const p1 = await tx.project.create({
        data: {
          title: 'Genome Sequencing Analysis',
          description: 'Advanced analysis of genomic data using machine learning',
          startDate: new Date(`${currentYear}-01-01`),
          endDate: new Date(`${currentYear + 1}-12-31`),
          members: {
            connect: [{ id: professor.id }, { id: postdoc.id }, { id: student1.id }],
          },
        },
      });

      // Current active project
      const p2 = await tx.project.create({
        data: {
          title: 'Protein Structure Prediction',
          description: 'Using AI to predict protein folding patterns',
          startDate: new Date(`${currentYear}-06-01`),
          members: {
            connect: [{ id: professor.id }, { id: student2.id }, { id: labManager.id }],
          },
        },
      });

      // Completed project from 2 years ago (with alumni)
      const p3 = await tx.project.create({
        data: {
          title: 'CRISPR Gene Editing Optimization',
          description: 'Optimizing CRISPR-Cas9 protocols for higher efficiency',
          startDate: new Date(`${currentYear - 3}-01-01`),
          endDate: new Date(`${currentYear - 1}-12-31`),
          members: {
            connect: [{ id: professor.id }, { id: postdocAlumni.id }, { id: studentAlumni1.id }],
          },
        },
      });

      // Completed project from 4 years ago (with alumni)
      const p4 = await tx.project.create({
        data: {
          title: 'Single-Cell RNA Sequencing',
          description: 'Development of single-cell analysis pipelines',
          startDate: new Date(`${currentYear - 5}-01-01`),
          endDate: new Date(`${currentYear - 3}-06-30`),
          members: {
            connect: [{ id: professor.id }, { id: studentAlumni2.id }],
          },
        },
      });

      return { project1: p1, project2: p2, project3: p3, project4: p4 };
    });

    // Create grants spanning several years
    const grant1 = await this.prisma.grant.create({
      data: {
        name: `ISF Research Grant ${currentYear}`,
        budget: 500000,
        deadline: new Date(`${currentYear + 2}-12-31`),
        createdAt: new Date(`${currentYear}-01-15`),
      },
    });

    const grant2 = await this.prisma.grant.create({
      data: {
        name: 'ERC Starting Grant',
        budget: 1000000,
        deadline: new Date(`${currentYear + 3}-06-30`),
        createdAt: new Date(`${currentYear - 1}-03-01`),
      },
    });

    const grant3 = await this.prisma.grant.create({
      data: {
        name: `ISF Research Grant ${currentYear - 2}`,
        budget: 400000,
        deadline: new Date(`${currentYear}-12-31`),
        createdAt: new Date(`${currentYear - 2}-01-15`),
      },
    });

    const grant4 = await this.prisma.grant.create({
      data: {
        name: `BIRAX Research Grant ${currentYear - 4}`,
        budget: 300000,
        deadline: new Date(`${currentYear - 2}-12-31`),
        createdAt: new Date(`${currentYear - 4}-06-01`),
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

    await this.prisma.project.update({
      where: { id: project3.id },
      data: {
        grants: {
          connect: [{ id: grant3.id }],
        },
      },
    });

    await this.prisma.project.update({
      where: { id: project4.id },
      data: {
        grants: {
          connect: [{ id: grant4.id }],
        },
      },
    });

    // Create equipment - status is automatically derived from member/project assignment
    // Equipment with member OR project assigned will have status IN_USE automatically
    // Equipment cannot have both member AND project assigned
    const sequencer = await this.factory.createEquipment({
      name: 'Illumina NextSeq 550',
      description: 'High-throughput DNA sequencer',
      serialNumber: 'NS-2024-001',
      // Status will be automatically set to IN_USE because projectId is assigned
      projectId: project1.id,
    });

    const microscope = await this.factory.createEquipment({
      name: 'Confocal Microscope',
      description: 'Zeiss LSM 880 with Airyscan',
      serialNumber: 'CM-2023-045',
      // Status will be automatically set to IN_USE because projectId is assigned
      projectId: project2.id,
    });

    const laptop = await this.factory.createEquipment({
      name: 'MacBook Pro M3',
      description: 'Development laptop for data analysis',
      serialNumber: 'MBP-2024-123',
      // Status will be automatically set to IN_USE because memberId is assigned
      memberId: postdoc.id,
    });

    const centrifuge = await this.factory.createEquipment({
      name: 'High-Speed Centrifuge',
      description: 'Eppendorf 5424R',
      // No member or project assigned, status will be AVAILABLE
    });

    // Fix Flow Cytometer - status automatically IN_USE because member assigned
    const flowCytometer = await this.factory.createEquipment({
      name: 'Flow Cytometer',
      description: 'BD FACSAria Fusion cell sorter',
      serialNumber: 'FC-2023-078',
      // Status will be automatically set to IN_USE because memberId is assigned
      memberId: student1.id,
    });

    const pcrMachine = await this.factory.createEquipment({
      name: 'PCR Machine',
      description: 'Thermal cycler for DNA amplification',
      serialNumber: 'SN-1763388733271-0',
      // Status will be automatically set to IN_USE because memberId is assigned
      memberId: student2.id,
    });

    // Create expenses spanning several years
    await this.factory.createExpense({
      description: 'Sequencing reagents',
      amount: 5000,
      date: new Date(`${currentYear}-10-01`),
      projectId: project1.id,
      grantId: grant1.id,
    });

    await this.factory.createExpense({
      description: 'Microscope maintenance',
      amount: 3000,
      date: new Date(`${currentYear}-11-01`),
      projectId: project2.id,
      grantId: grant2.id,
    });

    await this.factory.createExpense({
      description: 'CRISPR reagents and supplies',
      amount: 4500,
      date: new Date(`${currentYear - 2}-06-15`),
      projectId: project3.id,
      grantId: grant3.id,
    });

    await this.factory.createExpense({
      description: 'Single-cell sequencing kits',
      amount: 8000,
      date: new Date(`${currentYear - 4}-09-20`),
      projectId: project4.id,
      grantId: grant4.id,
    });

    // Create bookings
    await this.factory.createBooking({
      startTime: new Date(`${currentYear}-11-20T09:00:00Z`),
      endTime: new Date(`${currentYear}-11-20T12:00:00Z`),
      purpose: 'Sample sequencing run',
      equipmentId: sequencer.id,
      memberId: student1.id,
      projectId: project1.id,
    });

    await this.factory.createBooking({
      startTime: new Date(`${currentYear}-11-21T14:00:00Z`),
      endTime: new Date(`${currentYear}-11-21T17:00:00Z`),
      purpose: 'Cell imaging session',
      equipmentId: microscope.id,
      memberId: student2.id,
      projectId: project2.id,
    });

    // Create events
    const labMeeting = await this.factory.createEvent({
      title: 'Weekly Lab Meeting',
      description: 'Progress updates and paper discussion',
      date: new Date(`${currentYear}-11-25T10:00:00Z`),
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

    // Create publications spanning several years
    const publication1 = await this.factory.createPublication({
      title: 'Novel Machine Learning Approach to Genomic Analysis',
      published: new Date(`${currentYear}-08-15`),
      doi: `10.1234/example.${currentYear}.001`,
      url: 'https://example.com/paper1',
    });

    const publication2 = await this.factory.createPublication({
      title: 'CRISPR-Cas9 Optimization in Human Cell Lines',
      published: new Date(`${currentYear - 1}-05-20`),
      doi: `10.1234/example.${currentYear - 1}.002`,
      url: 'https://example.com/paper2',
    });

    const publication3 = await this.factory.createPublication({
      title: 'Single-Cell Transcriptomics Reveals Cell Type Diversity',
      published: new Date(`${currentYear - 2}-11-10`),
      doi: `10.1234/example.${currentYear - 2}.003`,
      url: 'https://example.com/paper3',
    });

    const publication4 = await this.factory.createPublication({
      title: 'Protein Folding Prediction Using Deep Learning',
      published: new Date(`${currentYear - 3}-03-15`),
      doi: `10.1234/example.${currentYear - 3}.004`,
      url: 'https://example.com/paper4',
    });

    // Link publications to members and projects
    await this.prisma.publication.update({
      where: { id: publication1.id },
      data: {
        members: {
          connect: [{ id: professor.id }, { id: postdoc.id }],
        },
        projects: {
          connect: [{ id: project1.id }],
        },
      },
    });

    await this.prisma.publication.update({
      where: { id: publication2.id },
      data: {
        members: {
          connect: [{ id: professor.id }, { id: postdocAlumni.id }, { id: studentAlumni1.id }],
        },
        projects: {
          connect: [{ id: project3.id }],
        },
      },
    });

    await this.prisma.publication.update({
      where: { id: publication3.id },
      data: {
        members: {
          connect: [{ id: professor.id }, { id: studentAlumni2.id }],
        },
        projects: {
          connect: [{ id: project4.id }],
        },
      },
    });

    await this.prisma.publication.update({
      where: { id: publication4.id },
      data: {
        members: {
          connect: [{ id: professor.id }, { id: postdocAlumni.id }],
        },
        projects: {
          connect: [{ id: project3.id }],
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
      dueDate: new Date(`${currentYear}-11-22`),
      projectId: project1.id,
    });

    return {
      members: [professor, postdoc, postdocAlumni, student1, student2, studentAlumni1, studentAlumni2, labManager],
      projects: [project1, project2, project3, project4],
      grants: [grant1, grant2, grant3, grant4],
      equipment: [sequencer, microscope, laptop, centrifuge, flowCytometer, pcrMachine],
      events: [labMeeting],
      publications: [publication1, publication2, publication3, publication4],
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
    // Create everything in a transaction to ensure visibility
    return await this.prisma.$transaction(async (tx) => {
      const member = await tx.member.create({
        data: {
          name: `Test Member ${Math.random().toString(36).substring(7)}`,
          rank: 'MSc',
          status: 'ACTIVE',
          role: 'STUDENT',
          scholarship: 30000,
        },
      });
      const project = await tx.project.create({
        data: {
          title: `Test Project ${Math.random().toString(36).substring(7)}`,
          members: { connect: [{ id: member.id }] },
        },
      });
      const grant = await tx.grant.create({
        data: {
          name: `Test Grant ${Math.random().toString(36).substring(7)}`,
          budget: 100000,
          deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });

      await tx.project.update({
      where: { id: project.id },
      data: {
        grants: { connect: [{ id: grant.id }] },
      },
    });

    return { member, project, grant };
    });
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

