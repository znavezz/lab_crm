import { MockedResponse } from '@apollo/client/testing';
import { DocumentNode } from 'graphql';

/**
 * Helper function to create a mock GraphQL response
 */
export function createMockResponse<TData = any>(
  query: DocumentNode,
  variables: Record<string, any> = {},
  data: TData,
  error?: Error
): MockedResponse<TData> {
  return {
    request: {
      query,
      variables,
    },
    result: error
      ? { errors: [error] }
      : {
          data,
        },
  };
}

/**
 * Helper function to create multiple mock responses
 */
export function createMockResponses(
  ...responses: Array<{
    query: DocumentNode;
    variables?: Record<string, any>;
    data: any;
    error?: Error;
  }>
): MockedResponse[] {
  return responses.map(({ query, variables = {}, data, error }) =>
    createMockResponse(query, variables, data, error)
  );
}

/**
 * Common mock data for dashboard queries
 */
export const mockDashboardData = {
  members: [
    {
      id: '1',
      name: 'Test Member',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
  ],
  projects: [
    {
      id: '1',
      title: 'Test Project',
      startDate: null,
      endDate: null,
      createdAt: new Date().toISOString(),
    },
  ],
  publications: [],
  grants: [],
  events: [],
  protocols: [],
  equipments: [],
};

