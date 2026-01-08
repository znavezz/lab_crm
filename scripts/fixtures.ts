// scripts/fixtures.ts
// Common test scenarios and data combinations
// Uses Hasura GraphQL mutations instead of Prisma

import { hasuraQuery } from '../src/lib/hasura-client';
import { DataFactory } from './factories';

// Type definitions
type MemberRank = 'PROFESSOR' | 'PhD' | 'POSTDOC' | 'MSc' | 'BSc' | 'Mr' | 'Mrs';
type MemberStatus = 'ACTIVE' | 'ALUMNI' | 'INACTIVE';
type MemberRole = 'PI' | 'STUDENT' | 'LAB_MANAGER' | 'RESEARCHER' | 'ADVISOR' | 'INTERN' | 'CONTRACTOR' | 'GUEST' | 'ALUMNI' | 'OTHER';

interface Member {
  id: string;
  name: string;
  rank?: MemberRank;
  status?: MemberStatus;
  role?: MemberRole;
  scholarship?: number;
  joinedDate?: string;
}

interface Project {
  id: string;
  title: string;
  startDate?: string;
  endDate?: string;
}

interface Grant {
  id: string;
  name: string;
  budget: number;
}

export class TestFixtures {
  constructor(private factory: DataFactory) {}

  /**
   * Creates a comprehensive lab setup with realistic data
   */
  async createCompleteLabSetup() {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // ========== CREATE MEMBERS ==========
      const memberData = [
      // PI
      { name: 'Prof. Sarah Cohen', rank: 'PROFESSOR' as MemberRank, status: 'ACTIVE' as MemberStatus, role: 'PI' as MemberRole, joinedYear: currentYear - 12, scholarship: undefined },
      // Postdocs
      { name: 'Dr. Michael Levy', rank: 'POSTDOC' as MemberRank, status: 'ACTIVE' as MemberStatus, role: 'RESEARCHER' as MemberRole, joinedYear: currentYear - 2, scholarship: 50000 },
      { name: 'Dr. Yael Ben-David', rank: 'POSTDOC' as MemberRank, status: 'ACTIVE' as MemberStatus, role: 'RESEARCHER' as MemberRole, joinedYear: currentYear - 1, scholarship: 52000 },
      { name: 'Dr. Tomer Weiss', rank: 'POSTDOC' as MemberRank, status: 'ACTIVE' as MemberStatus, role: 'RESEARCHER' as MemberRole, joinedYear: currentYear - 3, scholarship: 48000 },
      { name: 'Dr. Erez Levanon', rank: 'POSTDOC' as MemberRank, status: 'ALUMNI' as MemberStatus, role: 'RESEARCHER' as MemberRole, joinedYear: currentYear - 6, scholarship: 50000 },
      // PhD Students
      { name: 'Amit Cohen', rank: 'PhD' as MemberRank, status: 'ACTIVE' as MemberStatus, role: 'STUDENT' as MemberRole, joinedYear: currentYear - 3, scholarship: 38000 },
      { name: 'Nir Goldberg', rank: 'PhD' as MemberRank, status: 'ACTIVE' as MemberStatus, role: 'STUDENT' as MemberRole, joinedYear: currentYear - 2, scholarship: 36000 },
      { name: 'Tamar Rosenberg', rank: 'PhD' as MemberRank, status: 'ACTIVE' as MemberStatus, role: 'STUDENT' as MemberRole, joinedYear: currentYear - 1, scholarship: 35000 },
      // MSc Students
      { name: 'David Ben-Ami', rank: 'MSc' as MemberRank, status: 'ACTIVE' as MemberStatus, role: 'STUDENT' as MemberRole, joinedYear: currentYear - 1, scholarship: 30000 },
      { name: 'Rachel Mizrahi', rank: 'MSc' as MemberRank, status: 'ACTIVE' as MemberStatus, role: 'STUDENT' as MemberRole, joinedYear: currentYear - 1, scholarship: 30000 },
      // Lab Manager
      { name: 'Yael Avraham', rank: 'MSc' as MemberRank, status: 'ACTIVE' as MemberStatus, role: 'LAB_MANAGER' as MemberRole, joinedYear: currentYear - 4, scholarship: undefined },
    ];

    const members: Member[] = [];
      for (const data of memberData) {
      const member = await this.factory.createMember({
            name: data.name,
        rank: data.rank,
        status: data.status,
        role: data.role,
            scholarship: data.scholarship,
        joinedDate: new Date(`${data.joinedYear}-09-01`),
      });
      members.push(member);

      // Add academic info for each member
      if (data.rank !== 'BSc') {
        await this.factory.createAcademicInfo({
              memberId: member.id,
              degree: data.rank === 'POSTDOC' ? 'PhD' : data.rank,
          field: ['Bioinformatics', 'Molecular Biology', 'Biochemistry'][Math.floor(Math.random() * 3)],
          institution: ['Tel Aviv University', 'Hebrew University', 'Weizmann Institute'][Math.floor(Math.random() * 3)],
          graduationYear: data.joinedYear - 1,
          });
        }
      }

    const activeMembers = members.filter(m => m.status === 'ACTIVE');

    // ========== CREATE PROJECTS ==========
    const projectTitles = [
      'Genome Sequencing Analysis', 'Protein Structure Prediction', 'CRISPR Gene Editing',
      'Single-Cell RNA Sequencing', 'Machine Learning for Genomics', 'Cancer Biomarker Discovery',
      'Epigenetic Regulation', 'Drug Target Identification', 'Bioinformatics Pipeline',
      'Gene Expression Profiling'
    ];

    const projects: Project[] = [];
    for (let i = 0; i < 10; i++) {
      const yearOffset = Math.floor(i / 3);
      const startYear = currentYear - yearOffset;
      
      const project = await this.factory.createProject({
          title: projectTitles[i],
          description: `Research project focusing on ${projectTitles[i].toLowerCase()}`,
        startDate: new Date(`${startYear}-01-01`),
        endDate: yearOffset > 1 ? new Date(`${startYear + 2}-12-31`) : undefined,
      });
      projects.push(project);

      // Link members to project via many-to-many
      const projectMembers = activeMembers.slice(0, 2 + Math.floor(Math.random() * 3));
      for (const member of projectMembers) {
        await hasuraQuery(
          `mutation LinkMemberToProject($projectId: String!, $memberId: String!) {
            insert__ProjectMembers_one(object: { A: $memberId, B: $projectId }) { A B }
          }`,
          { projectId: project.id, memberId: member.id }
        ).catch(() => {}); // Ignore duplicates
      }
    }

    // ========== CREATE GRANTS ==========
    const grantNames = [
      'ISF Research Grant', 'ERC Starting Grant', 'BIRAX Research Grant',
      'NIH Biomedical Fund', 'Horizon Europe Grant', 'Marie Curie Fellowship'
    ];

    const grants: Grant[] = [];
    for (let i = 0; i < 6; i++) {
      const grantYear = currentYear - Math.floor(i / 2);
      const grant = await this.factory.createGrant({
          name: `${grantNames[i]} ${grantYear}`,
        budget: 200000 + Math.floor(Math.random() * 800000),
          startDate: new Date(`${grantYear}-01-01`),
        endDate: new Date(`${grantYear + 2}-12-31`),
      });
      grants.push(grant);

      // Link grants to projects
      const project = projects[Math.floor(Math.random() * projects.length)];
      await hasuraQuery(
        `mutation LinkGrantToProject($grantId: String!, $projectId: String!) {
          insert__GrantToProject_one(object: { A: $grantId, B: $projectId }) { A B }
        }`,
        { grantId: grant.id, projectId: project.id }
      ).catch(() => {});
    }

    // ========== CREATE EQUIPMENT ==========
    const equipmentNames = [
      'Illumina NextSeq 550', 'Confocal Microscope', 'High-Speed Centrifuge',
      'Flow Cytometer', 'PCR Machine', 'Gel Electrophoresis System',
      'Cell Culture Incubator', 'NanoDrop Spectrophotometer', 'Real-Time PCR System'
    ];

    const equipment = [];
    for (let i = 0; i < 9; i++) {
      const eq = await this.factory.createEquipment({
        name: equipmentNames[i],
        description: `Laboratory equipment: ${equipmentNames[i]}`,
        serialNumber: `SN-${currentYear}-${String(i + 1).padStart(3, '0')}`,
        status: i === 0 ? 'MAINTENANCE' : undefined,
        memberId: i < 2 ? activeMembers[i]?.id : undefined,
      });
      equipment.push(eq);
      }

    // ========== CREATE EVENTS ==========
    const events = [];
    for (let i = 0; i < 10; i++) {
      const event = await this.factory.createEvent({
        title: ['Weekly Lab Meeting', 'Journal Club', 'Progress Presentation', 'Guest Seminar'][i % 4],
        description: 'Lab event',
        date: new Date(Date.now() + i * 7 * 24 * 60 * 60 * 1000),
        location: ['Conference Room A', 'Conference Room B', 'Lab'][i % 3],
      });
      events.push(event);
    }

    // ========== CREATE PUBLICATIONS ==========
    const publications = [];
    for (let i = 0; i < 15; i++) {
      const pub = await this.factory.createPublication({
        title: `Research Paper on ${projectTitles[i % projectTitles.length]}`,
        published: new Date(`${currentYear - Math.floor(i / 5)}-${(i % 12) + 1}-15`),
        doi: `10.1234/example.${currentYear}.${String(i + 1).padStart(3, '0')}`,
      });
      publications.push(pub);
    }

    // ========== CREATE PROTOCOLS ==========
    const protocols = [];
    for (let i = 0; i < 8; i++) {
      const protocol = await this.factory.createProtocol({
        title: ['DNA Extraction', 'PCR Amplification', 'Cell Culture', 'Western Blot', 'ELISA', 'Flow Cytometry', 'RNA Extraction', 'qRT-PCR'][i],
        category: ['WET_LAB', 'COMPUTATIONAL', 'SAFETY', 'GENERAL'][i % 4] as 'WET_LAB' | 'COMPUTATIONAL' | 'SAFETY' | 'GENERAL',
        authorId: members[Math.floor(Math.random() * members.length)].id,
        projectId: projects[Math.floor(Math.random() * projects.length)].id,
      });
      protocols.push(protocol);
    }

    // ========== CREATE EXPENSES ==========
    for (let i = 0; i < 15; i++) {
    await this.factory.createExpense({
        description: ['Reagents', 'Equipment repair', 'Software license', 'Lab supplies', 'Conference'][i % 5],
        amount: 500 + Math.floor(Math.random() * 5000),
        date: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000),
        projectId: projects[Math.floor(Math.random() * projects.length)].id,
        grantId: grants[Math.floor(Math.random() * grants.length)]?.id,
      });
    }

    // ========== CREATE BOOKINGS ==========
    for (let i = 0; i < 10; i++) {
      const startTime = new Date();
      startTime.setDate(startTime.getDate() + i);
      startTime.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 2);

    await this.factory.createBooking({
        startTime,
        endTime,
        purpose: ['Sample analysis', 'Training', 'Research session'][i % 3],
        equipmentId: equipment[Math.floor(Math.random() * equipment.length)].id,
        memberId: activeMembers[Math.floor(Math.random() * activeMembers.length)].id,
        projectId: projects[Math.floor(Math.random() * projects.length)].id,
      });
    }

    // ========== CREATE COLLABORATORS ==========
    const collaborators = [];
    const collabNames = ['Dr. John Smith', 'Dr. Maria Garcia', 'Dr. Chen Wei', 'Dr. Ahmed Hassan', 'Dr. Sophie Martin'];
    for (let i = 0; i < 5; i++) {
      const collab = await this.factory.createCollaborator({
        name: collabNames[i],
        organization: ['Harvard', 'MIT', 'Stanford', 'Oxford', 'Cambridge'][i],
      });
      collaborators.push(collab);
    }

    return {
      members,
      projects,
      grants,
      equipment,
      events,
      publications,
      protocols,
      collaborators,
    };
  }

  /**
   * Creates a minimal setup for quick testing
   */
  async createMinimalSetup() {
    const member = await this.factory.createMember({
      name: 'Test Member',
          rank: 'MSc',
          status: 'ACTIVE',
          role: 'STUDENT',
          scholarship: 30000,
    });

    const project = await this.factory.createProject({
      title: 'Test Project',
    });

    // Link member to project
    await hasuraQuery(
      `mutation LinkMemberToProject($projectId: String!, $memberId: String!) {
        insert__ProjectMembers_one(object: { A: $memberId, B: $projectId }) { A B }
      }`,
      { projectId: project.id, memberId: member.id }
    ).catch(() => {});

    const grant = await this.factory.createGrant({
      name: 'Test Grant',
      budget: 100000,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
    });

    // Link grant to project
    await hasuraQuery(
      `mutation LinkGrantToProject($grantId: String!, $projectId: String!) {
        insert__GrantToProject_one(object: { A: $grantId, B: $projectId }) { A B }
      }`,
      { grantId: grant.id, projectId: project.id }
    ).catch(() => {});

    return { member, project, grant };
  }

  /**
   * Creates a project with expenses to test budget calculations
   */
  async createProjectWithExpenses() {
    const project = await this.factory.createProject();
    const grant = await this.factory.createGrant({ budget: 100000 });

    // Link grant to project
    await hasuraQuery(
      `mutation LinkGrantToProject($grantId: String!, $projectId: String!) {
        insert__GrantToProject_one(object: { A: $grantId, B: $projectId }) { A B }
      }`,
      { grantId: grant.id, projectId: project.id }
    ).catch(() => {});

    const expenses = await Promise.all([
      this.factory.createExpense({ amount: 10000, projectId: project.id, grantId: grant.id }),
      this.factory.createExpense({ amount: 5000, projectId: project.id, grantId: grant.id }),
      this.factory.createExpense({ amount: 3000, projectId: project.id, grantId: grant.id }),
    ]);

    return { project, grant, expenses };
  }
}
