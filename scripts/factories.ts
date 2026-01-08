// scripts/factories.ts
// Reusable data builders for creating test/seed data
// Uses Hasura GraphQL mutations instead of Prisma

import { hasuraQuery } from '../src/lib/hasura-client';

// Type definitions (matching Hasura schema)
type MemberRank = 'PROFESSOR' | 'PhD' | 'POSTDOC' | 'MSc' | 'BSc' | 'Mr' | 'Mrs';
type MemberStatus = 'ACTIVE' | 'ALUMNI' | 'INACTIVE';
type MemberRole = 'PI' | 'STUDENT' | 'LAB_MANAGER' | 'RESEARCHER' | 'ADVISOR' | 'INTERN' | 'CONTRACTOR' | 'GUEST' | 'ALUMNI' | 'OTHER';
type EquipmentStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
type ProtocolCategory = 'WET_LAB' | 'COMPUTATIONAL' | 'SAFETY' | 'GENERAL';

// Return types
interface Member {
  id: string;
  name: string;
  rank?: MemberRank;
  status?: MemberStatus;
  role?: MemberRole;
  scholarship?: number;
  photoUrl?: string;
  joinedDate?: string;
  createdAt: string;
}

interface Project {
  id: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

interface Grant {
  id: string;
  name: string;
  budget: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}

interface Equipment {
  id: string;
  name: string;
  description?: string;
  serialNumber?: string;
  status: EquipmentStatus;
  projectId?: string;
  memberId?: string;
  createdAt: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  projectId?: string;
  grantId?: string;
  eventId?: string;
}

interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  purpose?: string;
  equipmentId: string;
  memberId: string;
  projectId?: string;
  eventId?: string;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  createdAt: string;
}

interface Publication {
  id: string;
  title: string;
  published?: string;
  doi?: string;
  url?: string;
}

interface Collaborator {
  id: string;
  name: string;
  organization?: string;
}

interface Document {
  id: string;
  filename: string;
  url: string;
  projectId?: string;
  memberId?: string;
}

interface NoteTask {
  id: string;
  title?: string;
  content: string;
  completed: boolean;
  dueDate?: string;
}

interface AcademicInfo {
  id: string;
  degree: string;
  field?: string;
  institution?: string;
  graduationYear?: number;
  memberId: string;
}

interface Protocol {
  id: string;
  title: string;
  description?: string;
  category: ProtocolCategory;
  version: string;
  authorId?: string;
  projectId?: string;
}

// Input types
type MemberCreateInput = {
  name?: string;
  rank?: MemberRank;
  status?: MemberStatus;
  role?: MemberRole;
  scholarship?: number;
  photoUrl?: string;
  joinedDate?: Date;
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
  startDate?: Date;
  endDate?: Date;
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
  // Member factory
  async createMember(overrides: MemberCreateInput = {}): Promise<Member> {
    const defaults = {
      name: `Test Member ${Math.random().toString(36).substring(7)}`,
      rank: 'MSc' as MemberRank,
      status: 'ACTIVE' as MemberStatus,
      role: 'STUDENT' as MemberRole,
      scholarship: 30000,
    };

    const data = { ...defaults, ...overrides };
    
    // Convert dates to ISO strings
    const object = {
      ...data,
      joinedDate: data.joinedDate?.toISOString(),
    };

    const result = await hasuraQuery<{ insert_Member_one: Member }>(
      `mutation InsertMember($object: Member_insert_input!) {
        insert_Member_one(object: $object) {
          id name rank status role scholarship photoUrl joinedDate createdAt
        }
      }`,
      { object }
    );
    return result.insert_Member_one;
  }

  async createProfessor(overrides: MemberCreateInput = {}): Promise<Member> {
    return this.createMember({
      name: `Prof. ${overrides.name || `Test Professor ${Math.random().toString(36).substring(7)}`}`,
      rank: 'PROFESSOR',
      status: 'ACTIVE',
      role: 'PI',
      scholarship: undefined,
      ...overrides,
    });
  }

  async createPostdoc(overrides: MemberCreateInput = {}): Promise<Member> {
    return this.createMember({
      name: `Dr. ${overrides.name || `Test Postdoc ${Math.random().toString(36).substring(7)}`}`,
      rank: 'POSTDOC',
      status: 'ACTIVE',
      role: 'RESEARCHER',
      scholarship: 50000,
      ...overrides,
    });
  }

  async createStudent(overrides: MemberCreateInput = {}): Promise<Member> {
    return this.createMember({
      name: overrides.name || `Test Student ${Math.random().toString(36).substring(7)}`,
      rank: 'MSc',
      status: 'ACTIVE',
      role: 'STUDENT',
      scholarship: 30000,
      ...overrides,
    });
  }

  async createLabManager(overrides: MemberCreateInput = {}): Promise<Member> {
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
  async createProject(overrides: ProjectCreateInput = {}): Promise<Project> {
    const defaults = {
      title: `Test Project ${Math.random().toString(36).substring(7)}`,
      description: 'A test project description',
      startDate: new Date(),
    };

    const data = { ...defaults, ...overrides };
    const object = {
      ...data,
      startDate: data.startDate?.toISOString(),
      endDate: data.endDate?.toISOString(),
    };

    const result = await hasuraQuery<{ insert_Project_one: Project }>(
      `mutation InsertProject($object: Project_insert_input!) {
        insert_Project_one(object: $object) {
          id title description startDate endDate createdAt
        }
      }`,
      { object }
    );
    return result.insert_Project_one;
  }

  // Grant factory
  async createGrant(overrides: GrantCreateInput = {}): Promise<Grant> {
    const defaults = {
      name: `Test Grant ${Math.random().toString(36).substring(7)}`,
      budget: 100000,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
    };

    const data = { ...defaults, ...overrides };
    const object = {
      name: data.name,
      budget: data.budget,
      startDate: data.startDate?.toISOString(),
      endDate: data.endDate?.toISOString(),
    };

    const result = await hasuraQuery<{ insert_Grant_one: Grant }>(
      `mutation InsertGrant($object: Grant_insert_input!) {
        insert_Grant_one(object: $object) {
          id name budget startDate endDate createdAt
        }
      }`,
      { object }
    );
    return result.insert_Grant_one;
  }

  // Equipment factory
  async createEquipment(overrides: EquipmentCreateInput = {}): Promise<Equipment> {
    const defaults = {
      name: `Test Equipment ${Math.random().toString(36).substring(7)}`,
      description: 'Test equipment description',
      status: 'AVAILABLE' as EquipmentStatus,
    };

    if (overrides.memberId && overrides.projectId) {
      throw new Error('Equipment cannot be assigned to both a member and a project.');
    }

    let status: EquipmentStatus;
    if (overrides.status === 'MAINTENANCE') {
      status = 'MAINTENANCE';
    } else if (overrides.memberId || overrides.projectId) {
      status = 'IN_USE';
    } else {
      status = overrides.status || defaults.status;
    }

    const object = { ...defaults, ...overrides, status };

    const result = await hasuraQuery<{ insert_Equipment_one: Equipment }>(
      `mutation InsertEquipmentOne($object: Equipment_insert_input!) {
        insert_Equipment_one(object: $object) {
          id name description serialNumber status projectId memberId createdAt
        }
      }`,
      { object }
    );
    return result.insert_Equipment_one;
  }

  // Expense factory
  async createExpense(overrides: ExpenseCreateInput = {}): Promise<Expense> {
    if (!overrides.projectId && !overrides.grantId && !overrides.eventId) {
      const project = await this.createProject();
      overrides.projectId = project.id;
    }

    const defaults = {
      description: `Test Expense ${Math.random().toString(36).substring(7)}`,
      amount: 1000,
      date: new Date(),
    };

    const data = { ...defaults, ...overrides };
    const object = {
      ...data,
      date: data.date?.toISOString(),
    };

    const result = await hasuraQuery<{ insert_Expense_one: Expense }>(
      `mutation InsertExpense($object: Expense_insert_input!) {
        insert_Expense_one(object: $object) {
          id description amount date projectId grantId eventId
        }
      }`,
      { object }
    );
    return result.insert_Expense_one;
  }

  // Booking factory
  async createBooking(overrides: BookingCreateInput = {}): Promise<Booking> {
    const startTime = overrides.startTime || new Date();
    const endTime = overrides.endTime || new Date(startTime.getTime() + 3 * 60 * 60 * 1000);

    if (!overrides.equipmentId) {
      const equipment = await this.createEquipment();
      overrides.equipmentId = equipment.id;
    }

    if (!overrides.memberId) {
      const member = await this.createMember();
      overrides.memberId = member.id;
    }

    const object = {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      purpose: overrides.purpose || 'Test booking purpose',
      equipmentId: overrides.equipmentId,
      memberId: overrides.memberId,
      projectId: overrides.projectId,
      eventId: overrides.eventId,
    };

    const result = await hasuraQuery<{ insert_Booking_one: Booking }>(
      `mutation InsertBooking($object: Booking_insert_input!) {
        insert_Booking_one(object: $object) {
          id startTime endTime purpose equipmentId memberId projectId eventId
        }
      }`,
      { object }
    );
    return result.insert_Booking_one;
  }

  // Event factory
  async createEvent(overrides: {
    title?: string;
    description?: string;
    date?: Date;
    location?: string;
  } = {}): Promise<Event> {
    const defaults = {
      title: `Test Event ${Math.random().toString(36).substring(7)}`,
      description: 'Test event description',
      date: new Date(),
      location: 'Test Location',
    };

    const data = { ...defaults, ...overrides };
    const object = {
      ...data,
      date: data.date?.toISOString(),
    };

    const result = await hasuraQuery<{ insert_Event_one: Event }>(
      `mutation InsertEvent($object: Event_insert_input!) {
        insert_Event_one(object: $object) {
          id title description date location createdAt
        }
      }`,
      { object }
    );
    return result.insert_Event_one;
  }

  // Publication factory
  async createPublication(overrides: {
    title?: string;
    published?: Date;
    doi?: string;
    url?: string;
  } = {}): Promise<Publication> {
    const defaults = {
      title: `Test Publication ${Math.random().toString(36).substring(7)}`,
      published: new Date(),
      doi: `10.1234/test.${Math.random().toString(36).substring(7)}`,
      url: 'https://example.com/publication',
    };

    const data = { ...defaults, ...overrides };
    const object = {
      ...data,
      published: data.published?.toISOString(),
    };

    const result = await hasuraQuery<{ insert_Publication_one: Publication }>(
      `mutation InsertPublication($object: Publication_insert_input!) {
        insert_Publication_one(object: $object) {
          id title published doi url
        }
      }`,
      { object }
    );
    return result.insert_Publication_one;
  }

  // Collaborator factory
  async createCollaborator(overrides: {
    name?: string;
    organization?: string;
  } = {}): Promise<Collaborator> {
    const defaults = {
      name: `Test Collaborator ${Math.random().toString(36).substring(7)}`,
      organization: 'Test Organization',
    };

    const object = { ...defaults, ...overrides };

    const result = await hasuraQuery<{ insert_Collaborator_one: Collaborator }>(
      `mutation InsertCollaborator($object: Collaborator_insert_input!) {
        insert_Collaborator_one(object: $object) {
          id name organization
        }
      }`,
      { object }
    );
    return result.insert_Collaborator_one;
  }

  // Document factory
  async createDocument(overrides: {
    filename?: string;
    url?: string;
    projectId?: string;
    memberId?: string;
  } = {}): Promise<Document> {
    const defaults = {
      filename: `test-document-${Math.random().toString(36).substring(7)}.pdf`,
      url: `/documents/test-${Math.random().toString(36).substring(7)}.pdf`,
    };

    const object = { ...defaults, ...overrides };

    const result = await hasuraQuery<{ insert_Document_one: Document }>(
      `mutation InsertDocument($object: Document_insert_input!) {
        insert_Document_one(object: $object) {
          id filename url projectId memberId
        }
      }`,
      { object }
    );
    return result.insert_Document_one;
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
    protocolId?: string;
  } = {}): Promise<NoteTask> {
    const defaults = {
      title: `Test Task ${Math.random().toString(36).substring(7)}`,
      content: 'Test task content',
      completed: false,
    };

    const data = { ...defaults, ...overrides };
    const object = {
      ...data,
      dueDate: data.dueDate?.toISOString(),
    };

    const result = await hasuraQuery<{ insert_NoteTask_one: NoteTask }>(
      `mutation InsertNoteTask($object: NoteTask_insert_input!) {
        insert_NoteTask_one(object: $object) {
          id title content completed dueDate
        }
      }`,
      { object }
    );
    return result.insert_NoteTask_one;
  }

  // AcademicInfo factory
  async createAcademicInfo(overrides: {
    degree?: string;
    field?: string;
    institution?: string;
    graduationYear?: number;
    memberId: string;
  }): Promise<AcademicInfo> {
    const defaults = {
      degree: 'BSc',
      field: 'Biology',
      institution: 'Test University',
      graduationYear: 2020,
    };

    const object = { ...defaults, ...overrides };

    const result = await hasuraQuery<{ insert_AcademicInfo_one: AcademicInfo }>(
      `mutation InsertAcademicInfo($object: AcademicInfo_insert_input!) {
        insert_AcademicInfo_one(object: $object) {
          id degree field institution graduationYear memberId
        }
      }`,
      { object }
    );
    return result.insert_AcademicInfo_one;
  }

  // Protocol factory
  async createProtocol(overrides: {
    title?: string;
    description?: string;
    category?: ProtocolCategory;
    version?: string;
    authorId?: string;
    projectId?: string;
  } = {}): Promise<Protocol> {
    if (!overrides.authorId) {
      const member = await this.createMember();
      overrides.authorId = member.id;
    }

    if (!overrides.projectId) {
      const project = await this.createProject();
      overrides.projectId = project.id;
    }

    const defaults = {
      title: `Test Protocol ${Math.random().toString(36).substring(7)}`,
      category: 'GENERAL' as ProtocolCategory,
      version: '1.0',
    };

    const object = { ...defaults, ...overrides };

    const result = await hasuraQuery<{ insert_Protocol_one: Protocol }>(
      `mutation InsertProtocol($object: Protocol_insert_input!) {
        insert_Protocol_one(object: $object) {
          id title description category version authorId projectId
        }
      }`,
      { object }
    );
    return result.insert_Protocol_one;
  }
}
