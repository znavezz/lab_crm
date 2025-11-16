// scripts/factories.ts
// Reusable data builders for creating test/seed data

import { PrismaClient } from '@/generated/prisma';
import type {
  MemberRank,
  MemberStatus,
  MemberRole,
  EquipmentStatus,
} from '@/generated/prisma';

type MemberCreateInput = {
  name?: string;
  rank?: MemberRank;
  status?: MemberStatus;
  role?: MemberRole;
  scholarship?: number;
};

type ProjectCreateInput = {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
};

type GrantCreateInput = {
  name?: string;
  budget?: number;
  deadline?: Date;
};

type EquipmentCreateInput = {
  name?: string;
  description?: string;
  serialNumber?: string;
  status?: EquipmentStatus;
  projectId?: string;
  memberId?: string;
};

type ExpenseCreateInput = {
  description?: string;
  amount?: number;
  date?: Date;
  projectId?: string;
  grantId?: string;
  eventId?: string;
};

type BookingCreateInput = {
  startTime?: Date;
  endTime?: Date;
  purpose?: string;
  equipmentId?: string;
  memberId?: string;
  projectId?: string;
  eventId?: string;
};

export class DataFactory {
  constructor(private prisma: PrismaClient) {}

  // Member factory
  async createMember(overrides: MemberCreateInput = {}) {
    const defaults = {
      name: `Test Member ${Math.random().toString(36).substring(7)}`,
      rank: 'MSc' as MemberRank,
      status: 'ACTIVE' as MemberStatus,
      role: 'STUDENT' as MemberRole,
      scholarship: 30000,
    };

    return await this.prisma.member.create({
      data: { ...defaults, ...overrides },
    });
  }

  async createProfessor(overrides: MemberCreateInput = {}) {
    return this.createMember({
      name: `Prof. ${overrides.name || `Test Professor ${Math.random().toString(36).substring(7)}`}`,
      rank: 'PROFESSOR',
      status: 'ACTIVE',
      role: 'PI',
      scholarship: undefined,
      ...overrides,
    });
  }

  async createPostdoc(overrides: MemberCreateInput = {}) {
    return this.createMember({
      name: `Dr. ${overrides.name || `Test Postdoc ${Math.random().toString(36).substring(7)}`}`,
      rank: 'POSTDOC',
      status: 'ACTIVE',
      role: 'RESEARCHER',
      scholarship: 50000,
      ...overrides,
    });
  }

  async createStudent(overrides: MemberCreateInput = {}) {
    return this.createMember({
      name: overrides.name || `Test Student ${Math.random().toString(36).substring(7)}`,
      rank: 'MSc',
      status: 'ACTIVE',
      role: 'STUDENT',
      scholarship: 30000,
      ...overrides,
    });
  }

  async createLabManager(overrides: MemberCreateInput = {}) {
    return this.createMember({
      name: overrides.name || `Test Lab Manager ${Math.random().toString(36).substring(7)}`,
      rank: 'MSc',
      status: 'ACTIVE',
      role: 'LAB_MANAGER',
      scholarship: undefined,
      ...overrides,
    });
  }

  // Project factory
  async createProject(overrides: ProjectCreateInput = {}) {
    const defaults = {
      title: `Test Project ${Math.random().toString(36).substring(7)}`,
      description: 'A test project description',
      startDate: new Date(),
    };

    return await this.prisma.project.create({
      data: { ...defaults, ...overrides },
    });
  }

  // Grant factory
  async createGrant(overrides: GrantCreateInput = {}) {
    const defaults = {
      name: `Test Grant ${Math.random().toString(36).substring(7)}`,
      budget: 100000,
      deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    };

    return await this.prisma.grant.create({
      data: { ...defaults, ...overrides },
    });
  }

  // Equipment factory
  async createEquipment(overrides: EquipmentCreateInput = {}) {
    const defaults = {
      name: `Test Equipment ${Math.random().toString(36).substring(7)}`,
      description: 'Test equipment description',
      status: 'AVAILABLE' as EquipmentStatus,
    };

    return await this.prisma.equipment.create({
      data: { ...defaults, ...overrides },
    });
  }

  // Expense factory
  async createExpense(overrides: ExpenseCreateInput = {}) {
    // Expense must be linked to either a project, grant, or event
    if (!overrides.projectId && !overrides.grantId && !overrides.eventId) {
      // Create a project if none provided
      const project = await this.createProject();
      overrides.projectId = project.id;
    } else if (overrides.projectId) {
      // Verify project exists
      const project = await this.prisma.project.findUnique({
        where: { id: overrides.projectId },
      });
      if (!project) {
        throw new Error(`Project with id ${overrides.projectId} does not exist`);
      }
    } else if (overrides.grantId) {
      // Verify grant exists
      const grant = await this.prisma.grant.findUnique({
        where: { id: overrides.grantId },
      });
      if (!grant) {
        throw new Error(`Grant with id ${overrides.grantId} does not exist`);
      }
    }

    const defaults = {
      description: `Test Expense ${Math.random().toString(36).substring(7)}`,
      amount: 1000,
      date: new Date(),
    };

    return await this.prisma.expense.create({
      data: { ...defaults, ...overrides },
    });
  }

  // Booking factory
  async createBooking(overrides: BookingCreateInput = {}) {
    const startTime = overrides.startTime || new Date();
    const endTime = overrides.endTime || new Date(startTime.getTime() + 3 * 60 * 60 * 1000); // 3 hours later

    // Create equipment if not provided
    if (!overrides.equipmentId) {
      const equipment = await this.createEquipment();
      overrides.equipmentId = equipment.id;
    }

    // Create member if not provided
    if (!overrides.memberId) {
      const member = await this.createMember();
      overrides.memberId = member.id;
    }

    const data = {
      startTime,
      endTime,
      purpose: overrides.purpose || 'Test booking purpose',
      equipmentId: overrides.equipmentId,
      memberId: overrides.memberId,
      projectId: overrides.projectId,
      eventId: overrides.eventId,
    };

    return await this.prisma.booking.create({
      data,
    });
  }

  // Event factory
  async createEvent(overrides: {
    title?: string;
    description?: string;
    date?: Date;
    location?: string;
  } = {}) {
    const defaults = {
      title: `Test Event ${Math.random().toString(36).substring(7)}`,
      description: 'Test event description',
      date: new Date(),
      location: 'Test Location',
    };

    return await this.prisma.event.create({
      data: { ...defaults, ...overrides },
    });
  }

  // Publication factory
  async createPublication(overrides: {
    title?: string;
    published?: Date;
    doi?: string;
    url?: string;
  } = {}) {
    const defaults = {
      title: `Test Publication ${Math.random().toString(36).substring(7)}`,
      published: new Date(),
      doi: `10.1234/test.${Math.random().toString(36).substring(7)}`,
      url: 'https://example.com/publication',
    };

    return await this.prisma.publication.create({
      data: { ...defaults, ...overrides },
    });
  }

  // Collaborator factory
  async createCollaborator(overrides: {
    name?: string;
    organization?: string;
  } = {}) {
    const defaults = {
      name: `Test Collaborator ${Math.random().toString(36).substring(7)}`,
      organization: 'Test Organization',
    };

    return await this.prisma.collaborator.create({
      data: { ...defaults, ...overrides },
    });
  }

  // Document factory
  async createDocument(overrides: {
    filename?: string;
    url?: string;
    projectId?: string;
    memberId?: string;
  } = {}) {
    const defaults = {
      filename: `test-document-${Math.random().toString(36).substring(7)}.pdf`,
      url: `/documents/test-${Math.random().toString(36).substring(7)}.pdf`,
    };

    return await this.prisma.document.create({
      data: { ...defaults, ...overrides },
    });
  }

  // NoteTask factory
  async createNoteTask(overrides: {
    title?: string;
    content?: string;
    completed?: boolean;
    dueDate?: Date;
    memberId?: string;
    projectId?: string;
    grantId?: string;
    eventId?: string;
    publicationId?: string;
    documentId?: string;
    equipmentId?: string;
    collaboratorId?: string;
    expenseId?: string;
  } = {}) {
    const defaults = {
      title: `Test Task ${Math.random().toString(36).substring(7)}`,
      content: 'Test task content',
      completed: false,
    };

    return await this.prisma.noteTask.create({
      data: { ...defaults, ...overrides },
    });
  }

  // AcademicInfo factory
  async createAcademicInfo(overrides: {
    degree?: string;
    field?: string;
    institution?: string;
    graduationYear?: number;
    memberId: string; // Required
  }) {
    const defaults = {
      degree: 'BSc',
      field: 'Biology',
      institution: 'Test University',
      graduationYear: 2020,
    };

    return await this.prisma.academicInfo.create({
      data: { ...defaults, ...overrides },
    });
  }
}

