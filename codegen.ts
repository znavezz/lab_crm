import type { CodegenConfig } from '@graphql-codegen/cli';

const HASURA_ENDPOINT = process.env.HASURA_ENDPOINT || 'http://localhost:8080/v1/graphql';
const HASURA_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET || 'hasura_admin_secret_change_in_production';

const config: CodegenConfig = {
  // Fetch schema directly from Hasura with admin privileges
  schema: [
    {
      [HASURA_ENDPOINT]: {
        headers: {
          'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
        },
      },
    },
  ],
  // Documents are the .graphql operation files
  documents: ['src/graphql/operations/**/*.graphql'],
  generates: {
    // Generate client-side types and operations
    'src/generated/graphql/': {
      preset: 'client',
      config: {
        // Use TypeScript enums
        enumsAsTypes: false,
        // Generate operation types
        documentMode: 'documentNode',
        // Avoid duplicate fragment imports
        dedupeFragments: true,
      },
      presetConfig: {
        // Generate fragment masking for type safety
        fragmentMasking: false,
      },
    },
  },
  // Ignore patterns
  ignoreNoDocuments: true,
};

export default config;
