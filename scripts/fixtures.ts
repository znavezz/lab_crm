// scripts/fixtures.ts
// Common test scenarios and data combinations

import { PrismaClient } from '@/generated/prisma';
import type { MemberRank, MemberStatus, MemberRole } from '@/generated/prisma';
import { DataFactory } from './factories';

export class TestFixtures {
  constructor(
    private prisma: PrismaClient,
    private factory: DataFactory
  ) {}

  /**
   * Creates a comprehensive lab setup with:
   * - 15 Members (mix of active and alumni)
   * - 30 Projects (spanning multiple years)
   * - 40-50 Publications
   * - 30-40 Equipment items
   * - 15-20 Grants
   * - Dozens of other entities (events, bookings, expenses, protocols, etc.)
   */
  async createCompleteLabSetup() {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // ========== CREATE 15 MEMBERS ==========
    const members = await this.prisma.$transaction(async (tx) => {
      const memberData = [
        // PI
        { name: 'Dr. Sarah Cohen', rank: 'PROFESSOR', status: 'ACTIVE', role: 'PI', joinedYear: currentYear - 10, scholarship: null },
        // Postdocs (3 active, 2 alumni)
        { name: 'Dr. Michael Levy', rank: 'POSTDOC', status: 'ACTIVE', role: 'RESEARCHER', joinedYear: currentYear - 2, scholarship: 50000 },
        { name: 'Dr. Yael Ben-David', rank: 'POSTDOC', status: 'ACTIVE', role: 'RESEARCHER', joinedYear: currentYear - 1, scholarship: 52000 },
        { name: 'Dr. Tomer Weiss', rank: 'POSTDOC', status: 'ACTIVE', role: 'RESEARCHER', joinedYear: currentYear - 3, scholarship: 48000 },
        { name: 'Dr. Erez Levanon', rank: 'POSTDOC', status: 'ALUMNI', role: 'RESEARCHER', joinedYear: currentYear - 5, scholarship: 50000 },
        { name: 'Dr. Noa Shapira', rank: 'POSTDOC', status: 'ALUMNI', role: 'RESEARCHER', joinedYear: currentYear - 4, scholarship: 50000 },
        // Students (4 active, 3 alumni)
        { name: 'David Ben-Ami', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT', joinedYear: currentYear - 1, scholarship: 30000 },
        { name: 'Rachel Mizrahi', rank: 'MSc', status: 'ACTIVE', role: 'STUDENT', joinedYear: currentYear - 1, scholarship: 30000 },
        { name: 'Amit Cohen', rank: 'PhD', status: 'ACTIVE', role: 'STUDENT', joinedYear: currentYear - 2, scholarship: 35000 },
        { name: 'Shira Levi', rank: 'BSc', status: 'ACTIVE', role: 'STUDENT', joinedYear: currentYear - 1, scholarship: 25000 },
        { name: 'Mr. David Gorelik', rank: 'PhD', status: 'ALUMNI', role: 'STUDENT', joinedYear: currentYear - 4, scholarship: 35000 },
        { name: 'Anna Rosen', rank: 'MSc', status: 'ALUMNI', role: 'STUDENT', joinedYear: currentYear - 3, scholarship: 30000 },
        { name: 'Daniel Katz', rank: 'MSc', status: 'ALUMNI', role: 'STUDENT', joinedYear: currentYear - 5, scholarship: 30000 },
        // Lab Manager
        { name: 'Yael Avraham', rank: 'MSc', status: 'ACTIVE', role: 'LAB_MANAGER', joinedYear: currentYear - 3, scholarship: null },
      ];

      const createdMembers = [];
      for (const data of memberData) {
      const member = await tx.member.create({
        data: {
          name: data.name,
          rank: data.rank as MemberRank,
          status: data.status as MemberStatus,
          role: data.role as MemberRole,
          scholarship: data.scholarship,
          joinedDate: new Date(`${data.joinedYear}-${data.role === 'PI' ? '01' : '09'}-01`),
        },
      });
        createdMembers.push(member);

        // Add academic info for most members
        if (data.rank !== 'PROFESSOR') {
          const institutions = ['Tel Aviv University', 'Hebrew University', 'Weizmann Institute', 'Ben-Gurion University', 'Technion'];
          const fields = ['Bioinformatics', 'Molecular Biology', 'Biochemistry', 'Genetics', 'Computational Biology'];
          await tx.academicInfo.create({
        data: {
              memberId: member.id,
              degree: data.rank === 'POSTDOC' ? 'PhD' : data.rank,
              field: fields[Math.floor(Math.random() * fields.length)],
              institution: institutions[Math.floor(Math.random() * institutions.length)],
              graduationYear: data.joinedYear - (data.rank === 'POSTDOC' ? 2 : 1),
        },
      });
        }
      }

      return createdMembers;
    });

    const professor = members[0];
    const activeMembers = members.filter(m => m.status === 'ACTIVE');
    const allMembers = members;

    // ========== CREATE 30 PROJECTS ==========
    const projectTitles = [
      'Genome Sequencing Analysis', 'Protein Structure Prediction', 'CRISPR Gene Editing Optimization',
      'Single-Cell RNA Sequencing', 'Machine Learning for Genomics', 'Cancer Biomarker Discovery',
      'Epigenetic Regulation Mechanisms', 'Stem Cell Differentiation', 'Drug Target Identification',
      'Metabolic Pathway Analysis', 'Immunotherapy Development', 'Neural Network Applications',
      'Bioinformatics Pipeline Development', 'Gene Expression Profiling', 'Protein-Protein Interactions',
      'Microbiome Analysis', 'Viral Vector Engineering', 'Tissue Engineering Approaches',
      'Computational Drug Design', 'Evolutionary Genomics', 'Regenerative Medicine',
      'Precision Medicine Applications', 'Biomarker Validation', 'Therapeutic Target Discovery',
      'Systems Biology Modeling', 'Functional Genomics', 'Comparative Genomics',
      'Structural Biology Studies', 'Molecular Dynamics Simulations', 'High-Throughput Screening'
    ];

    const projects = [];
    for (let i = 0; i < 30; i++) {
      const yearOffset = Math.floor(i / 5); // Projects spread across years
      const startYear = currentYear - yearOffset;
      const isActive = yearOffset <= 1; // Recent projects are active
      const numMembers = 2 + Math.floor(Math.random() * 4); // 2-5 members per project
      const selectedMembers = allMembers
        .filter(m => isActive ? m.status === 'ACTIVE' : true) // Active projects use active members
        .sort(() => Math.random() - 0.5)
        .slice(0, numMembers);

      const project = await this.prisma.project.create({
        data: {
          title: projectTitles[i],
          description: `Research project focusing on ${projectTitles[i].toLowerCase()}`,
          startDate: new Date(`${startYear}-${Math.floor(Math.random() * 12) + 1}-01`),
          endDate: isActive ? null : new Date(`${startYear + 2}-${Math.floor(Math.random() * 12) + 1}-01`),
          members: {
            connect: selectedMembers.map(m => ({ id: m.id })),
          },
        },
      });
      projects.push(project);
    }

    // ========== CREATE 18 GRANTS ==========
    const grantNames = [
      'ISF Research Grant', 'ERC Starting Grant', 'BIRAX Research Grant',
      'NIH Biomedical Research Fund', 'NSF Research Grant', 'Horizon Europe Grant',
      'Marie Curie Fellowship', 'Wellcome Trust Grant', 'Gates Foundation Grant',
      'Howard Hughes Medical Institute', 'EMBO Fellowship', 'Human Frontier Science Program',
      'Alexander von Humboldt Foundation', 'Fulbright Scholarship', 'DAAD Research Grant',
      'Royal Society Grant', 'CNRS Research Grant', 'DFG Research Grant'
    ];

    const grants = [];
    for (let i = 0; i < 18; i++) {
      const yearOffset = Math.floor(i / 3);
      const grantYear = currentYear - yearOffset;
      const grant = await this.prisma.grant.create({
        data: {
          name: `${grantNames[i]} ${grantYear}`,
          budget: 200000 + Math.floor(Math.random() * 800000), // $200k - $1M
          startDate: new Date(`${grantYear}-01-01`),
          endDate: new Date(`${grantYear + 2}-12-31`), // 3-year grant
          createdAt: new Date(`${grantYear}-${Math.floor(Math.random() * 12) + 1}-15`),
        },
      });
      grants.push(grant);
    }

    // Link grants to projects (each project gets 1-3 grants)
    for (const project of projects) {
      const numGrants = 1 + Math.floor(Math.random() * 3);
      const selectedGrants = grants.sort(() => Math.random() - 0.5).slice(0, numGrants);
      await this.prisma.project.update({
        where: { id: project.id },
        data: {
          grants: {
            connect: selectedGrants.map(g => ({ id: g.id })),
          },
        },
      });
    }

    // ========== CREATE 45 PUBLICATIONS ==========
    const publicationTitles = [
      'Novel Machine Learning Approach to Genomic Analysis',
      'CRISPR-Cas9 Optimization in Human Cell Lines',
      'Single-Cell Transcriptomics Reveals Cell Type Diversity',
      'Protein Folding Prediction Using Deep Learning',
      'Epigenetic Modifications in Cancer Development',
      'Stem Cell Differentiation Pathways',
      'Metabolic Network Analysis Using Systems Biology',
      'Immunotherapy Target Identification',
      'Neural Network Applications in Drug Discovery',
      'Bioinformatics Pipeline for Large-Scale Genomics',
      'Gene Expression Profiling in Disease States',
      'Protein-Protein Interaction Networks',
      'Microbiome Composition and Health',
      'Viral Vector Engineering for Gene Therapy',
      'Tissue Engineering Scaffold Design',
      'Computational Approaches to Drug Design',
      'Evolutionary Genomics of Model Organisms',
      'Regenerative Medicine Applications',
      'Precision Medicine Biomarker Discovery',
      'Therapeutic Target Validation',
      'Systems Biology Modeling of Cellular Processes',
      'Functional Genomics Screens',
      'Comparative Genomics Across Species',
      'Structural Biology of Membrane Proteins',
      'Molecular Dynamics of Protein Folding',
      'High-Throughput Screening Methods',
      'Cancer Genomics and Personalized Medicine',
      'Epigenetic Regulation Mechanisms',
      'Stem Cell Reprogramming Techniques',
      'Metabolic Engineering Strategies',
      'Immune System Modulation',
      'Machine Learning in Biomedical Research',
      'Next-Generation Sequencing Applications',
      'Gene Editing Technologies',
      'Single-Cell Analysis Methods',
      'Protein Structure Determination',
      'Drug Discovery Pipeline',
      'Biomarker Development',
      'Therapeutic Antibody Design',
      'Cell Line Engineering',
      'Genomic Data Integration',
      'Transcriptional Regulation',
      'Post-Translational Modifications',
      'Cellular Signaling Pathways',
      'Disease Mechanism Elucidation'
    ];

    const publications = [];
    for (let i = 0; i < 45; i++) {
      const yearOffset = Math.floor(i / 8); // Spread across years
      const publishYear = currentYear - yearOffset;
      const publication = await this.factory.createPublication({
        title: publicationTitles[i],
        published: new Date(`${publishYear}-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`),
        doi: `10.1234/example.${publishYear}.${String(i + 1).padStart(3, '0')}`,
        url: `https://example.com/paper${i + 1}`,
      });
      publications.push(publication);

      // Link to 2-5 authors
      const numAuthors = 2 + Math.floor(Math.random() * 4);
      const authors = allMembers
        .filter(m => {
          // Alumni can only be authors of older publications
          if (m.status === 'ALUMNI' && yearOffset > 2) return true;
          if (m.status === 'ACTIVE') return true;
          return false;
        })
        .sort(() => Math.random() - 0.5)
        .slice(0, numAuthors);

      // Link to 1-2 projects
      const numProjects = 1 + Math.floor(Math.random() * 2);
      const linkedProjects = projects
        .filter(p => {
          const pStartYear = p.startDate ? new Date(p.startDate).getFullYear() : currentYear;
          return Math.abs(pStartYear - publishYear) <= 2; // Projects within 2 years
        })
        .sort(() => Math.random() - 0.5)
        .slice(0, numProjects);

      await this.prisma.publication.update({
        where: { id: publication.id },
        data: {
          members: {
            connect: authors.map(a => ({ id: a.id })),
          },
          projects: linkedProjects.length > 0 ? {
            connect: linkedProjects.map(p => ({ id: p.id })),
          } : undefined,
        },
      });
    }

    // ========== CREATE 35 EQUIPMENT ITEMS ==========
    const equipmentNames = [
      'Illumina NextSeq 550', 'Confocal Microscope', 'MacBook Pro M3', 'High-Speed Centrifuge',
      'Flow Cytometer', 'PCR Machine', 'Gel Electrophoresis System', 'Microplate Reader',
      'Liquid Handling Robot', 'Cell Culture Incubator', 'Biosafety Cabinet', 'Autoclave',
      'Freezer -80°C', 'Refrigerated Centrifuge', 'NanoDrop Spectrophotometer', 'Qubit Fluorometer',
      'Real-Time PCR System', 'Western Blot Apparatus', 'ELISA Plate Reader', 'Fluorescence Microscope',
      'Inverted Microscope', 'CO2 Incubator', 'Water Bath', 'Vortex Mixer',
      'Magnetic Stirrer', 'pH Meter', 'Balance', 'Pipette Set',
      'DNA Sequencer', 'Mass Spectrometer', 'HPLC System', 'LC-MS System',
      'Electron Microscope', 'Atomic Force Microscope', 'X-ray Crystallography System'
    ];

    const equipment = [];
    for (let i = 0; i < 35; i++) {
      const assignToMember = Math.random() < 0.3; // 30% assigned to members
      const assignToProject = !assignToMember && Math.random() < 0.4; // 40% assigned to projects
      const isMaintenance = Math.random() < 0.1; // 10% in maintenance

      let memberId = undefined;
      let projectId = undefined;
      let status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | undefined = undefined;

      if (isMaintenance) {
        status = 'MAINTENANCE';
      } else if (assignToMember) {
        memberId = activeMembers[Math.floor(Math.random() * activeMembers.length)].id;
      } else if (assignToProject) {
        const activeProjects = projects.filter(p => !p.endDate);
        if (activeProjects.length > 0) {
          projectId = activeProjects[Math.floor(Math.random() * activeProjects.length)].id;
        }
      }

      const eq = await this.factory.createEquipment({
        name: equipmentNames[i] || `Equipment ${i + 1}`,
        description: `Laboratory equipment: ${equipmentNames[i] || `Equipment ${i + 1}`}`,
        serialNumber: `SN-${currentYear}-${String(i + 1).padStart(3, '0')}`,
        status,
        memberId,
        projectId,
      });
      equipment.push(eq);
      }

    // ========== CREATE 25 PROTOCOLS ==========
    const protocolTitles = [
      'DNA Extraction Protocol', 'PCR Amplification', 'Cell Culture Maintenance',
      'Western Blot Analysis', 'ELISA Assay', 'Flow Cytometry Staining',
      'Immunofluorescence Staining', 'RNA Extraction', 'qRT-PCR Analysis',
      'CRISPR-Cas9 Transfection', 'Protein Purification', 'Gel Electrophoresis',
      'Cell Transfection', 'Colony Picking', 'Plasmid Preparation',
      'Sequencing Library Prep', 'Cell Counting', 'Viability Assay',
      'Apoptosis Detection', 'Cell Cycle Analysis', 'Migration Assay',
      'Invasion Assay', 'Clonogenic Assay', 'MTT Assay',
      'Wound Healing Assay'
    ];

    const protocols = [];
    for (let i = 0; i < 25; i++) {
      const author = allMembers[Math.floor(Math.random() * allMembers.length)];
      const linkedProject = projects[Math.floor(Math.random() * projects.length)];

      const protocol = await this.factory.createProtocol({
        title: protocolTitles[i],
        category: ['WET_LAB', 'COMPUTATIONAL', 'SAFETY', 'GENERAL'][Math.floor(Math.random() * 4)] as 'WET_LAB' | 'COMPUTATIONAL' | 'SAFETY' | 'GENERAL',
        authorId: author.id,
        projectId: linkedProject.id,
      });
      protocols.push(protocol);
    }

    // ========== CREATE 30 EVENTS ==========
    const events = [];
    for (let i = 0; i < 30; i++) {
      const yearOffset = Math.floor(i / 10);
      const eventYear = currentYear - yearOffset;
      const month = Math.floor(Math.random() * 12) + 1;
      const day = Math.floor(Math.random() * 28) + 1;
      const event = await this.factory.createEvent({
        title: ['Weekly Lab Meeting', 'Journal Club', 'Progress Presentation', 'Guest Seminar', 'Training Session'][Math.floor(Math.random() * 5)],
        description: `Lab event scheduled for ${eventYear}`,
        date: new Date(eventYear, month - 1, day, 10, 0, 0),
        location: ['Conference Room A', 'Conference Room B', 'Lab', 'Auditorium'][Math.floor(Math.random() * 4)],
    });

      // Link 3-8 attendees
      const numAttendees = 3 + Math.floor(Math.random() * 6);
      const attendees = allMembers
        .filter(m => {
          const mJoinedYear = m.joinedDate ? new Date(m.joinedDate).getFullYear() : currentYear;
          return mJoinedYear <= eventYear;
        })
        .sort(() => Math.random() - 0.5)
        .slice(0, numAttendees);

      // Link 1-2 projects
      const numProjects = 1 + Math.floor(Math.random() * 2);
      const eventProjects = projects
        .filter(p => {
          const pStartYear = p.startDate ? new Date(p.startDate).getFullYear() : currentYear;
          return Math.abs(pStartYear - eventYear) <= 1;
        })
        .sort(() => Math.random() - 0.5)
        .slice(0, numProjects);

      await this.prisma.event.update({
        where: { id: event.id },
      data: {
          attendees: {
            connect: attendees.map(a => ({ id: a.id })),
      },
          projects: eventProjects.length > 0 ? {
            connect: eventProjects.map(p => ({ id: p.id })),
          } : undefined,
      },
    });

      events.push(event);
    }

    // ========== CREATE 40 EXPENSES ==========
    const expenseDescriptions = [
      'Sequencing reagents', 'Microscope maintenance', 'CRISPR reagents', 'Cell culture media',
      'Antibodies', 'DNA extraction kits', 'PCR reagents', 'Lab consumables',
      'Equipment repair', 'Software licenses', 'Conference registration', 'Travel expenses',
      'Publication fees', 'Reagent storage', 'Waste disposal', 'Equipment calibration',
      'Training courses', 'Lab supplies', 'Safety equipment', 'Computing resources'
    ];

    for (let i = 0; i < 40; i++) {
      const project = projects[Math.floor(Math.random() * projects.length)];
      const projectGrants = await this.prisma.project.findUnique({
        where: { id: project.id },
        include: { grants: true },
    });
      const grant = projectGrants?.grants[Math.floor(Math.random() * (projectGrants.grants.length || 1))];

      const yearOffset = Math.floor(i / 10);
      const expenseYear = currentYear - yearOffset;

    await this.factory.createExpense({
        description: expenseDescriptions[Math.floor(Math.random() * expenseDescriptions.length)],
        amount: 500 + Math.floor(Math.random() * 10000), // $500 - $10k
        date: new Date(`${expenseYear}-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`),
        projectId: project.id,
        grantId: grant?.id,
    });
    }

    // ========== CREATE 20 BOOKINGS ==========
    for (let i = 0; i < 20; i++) {
      const equipmentItem = equipment[Math.floor(Math.random() * equipment.length)];
      const member = activeMembers[Math.floor(Math.random() * activeMembers.length)];
      const project = projects.filter(p => !p.endDate)[Math.floor(Math.random() * projects.filter(p => !p.endDate).length)];

      const bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() + i);
      const startTime = new Date(bookingDate);
      startTime.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + (1 + Math.floor(Math.random() * 4)), 0, 0, 0);

    await this.factory.createBooking({
        startTime,
        endTime,
        purpose: ['Sample analysis', 'Equipment training', 'Research session', 'Maintenance check'][Math.floor(Math.random() * 4)],
        equipmentId: equipmentItem.id,
        memberId: member.id,
        projectId: project?.id,
    });
    }

    // ========== CREATE 15 COLLABORATORS ==========
    const collaboratorNames = [
      'Dr. John Smith', 'Dr. Maria Garcia', 'Dr. Chen Wei', 'Dr. Ahmed Hassan',
      'Dr. Sophie Martin', 'Dr. James Wilson', 'Dr. Li Mei', 'Dr. Roberto Silva',
      'Dr. Emma Thompson', 'Dr. Kenji Tanaka', 'Dr. Anna Kowalski', 'Dr. Pierre Dubois',
      'Dr. Lisa Anderson', 'Dr. Raj Patel', 'Dr. Ingrid Bergman'
    ];

    const organizations = [
      'Harvard Medical School', 'MIT', 'Stanford University', 'Oxford University',
      'Cambridge University', 'Max Planck Institute', 'Pasteur Institute', 'NIH',
      'Johns Hopkins University', 'University of Tokyo', 'ETH Zurich', 'Karolinska Institute',
      'Weizmann Institute', 'Tel Aviv University', 'Hebrew University'
    ];

    const collaborators = [];
    for (let i = 0; i < 15; i++) {
    const collaborator = await this.factory.createCollaborator({
        name: collaboratorNames[i],
        organization: organizations[i],
    });
      collaborators.push(collaborator);

      // Link to 1-3 projects
      const numProjects = 1 + Math.floor(Math.random() * 3);
      const linkedProjects = projects.sort(() => Math.random() - 0.5).slice(0, numProjects);
    await this.prisma.project.update({
        where: { id: linkedProjects[0].id },
      data: {
        collaborators: {
          connect: [{ id: collaborator.id }],
        },
      },
    });
    }

    // ========== CREATE 20 DOCUMENTS ==========
    for (let i = 0; i < 20; i++) {
      const isMemberDoc = Math.random() < 0.3; // 30% member documents
      if (isMemberDoc) {
        const member = allMembers[Math.floor(Math.random() * allMembers.length)];
    await this.factory.createDocument({
          filename: `${member.name.replace(/\s+/g, '_').toLowerCase()}_cv.pdf`,
          url: `/documents/cvs/${member.name.replace(/\s+/g, '_').toLowerCase()}_cv.pdf`,
          memberId: member.id,
        });
      } else {
        const project = projects[Math.floor(Math.random() * projects.length)];
    await this.factory.createDocument({
          filename: `${project.title.replace(/\s+/g, '_').toLowerCase()}_proposal.pdf`,
          url: `/documents/projects/${project.title.replace(/\s+/g, '_').toLowerCase()}_proposal.pdf`,
          projectId: project.id,
    });
      }
    }

    // ========== CREATE 15 NOTE TASKS ==========
    for (let i = 0; i < 15; i++) {
      const project = projects[Math.floor(Math.random() * projects.length)];
    await this.factory.createNoteTask({
        title: ['Review results', 'Update protocol', 'Prepare presentation', 'Submit report', 'Schedule meeting'][Math.floor(Math.random() * 5)],
        content: `Task related to ${project.title}`,
        completed: Math.random() < 0.3, // 30% completed
        dueDate: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        projectId: project.id,
    });
    }

    return {
      members: allMembers,
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
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          endDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000), // 11 months from now
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
