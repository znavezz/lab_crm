import type { CodegenConfig } from '@graphql-codegen/cli';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load schema directly
const schema = readFileSync(join(process.cwd(), 'src/graphql/schema.graphql'), 'utf-8');

const config: CodegenConfig = {
  schema,
  generates: {
    'src/generated/graphql/resolvers-types.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        useIndexSignature: true,
        contextType: '@/graphql/context#GraphQLContext',
        enumValues: {
          MemberRank: '@/generated/prisma#MemberRank',
          MemberStatus: '@/generated/prisma#MemberStatus',
          MemberRole: '@/generated/prisma#MemberRole',
          EquipmentStatus: '@/generated/prisma#EquipmentStatus',
        },
        mappers: {
          Member: '@/generated/prisma#Member',
          Project: '@/generated/prisma#Project',
          Equipment: '@/generated/prisma#Equipment',
          Booking: '@/generated/prisma#Booking',
          Event: '@/generated/prisma#Event',
          Grant: '@/generated/prisma#Grant',
          Publication: '@/generated/prisma#Publication',
          Collaborator: '@/generated/prisma#Collaborator',
          Document: '@/generated/prisma#Document',
          Expense: '@/generated/prisma#Expense',
          NoteTask: '@/generated/prisma#NoteTask',
          AcademicInfo: '@/generated/prisma#AcademicInfo',
          User: '@/generated/prisma#User',
        },
      },
    },
  },
};

export default config;

