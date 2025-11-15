import { queries } from './queries';
import { mutations } from './mutations';
import { types } from './types';
import { DateTimeResolver } from 'graphql-scalars';

export const resolvers = {
  // Scalar resolvers
  DateTime: DateTimeResolver,
  
  // Query resolvers
  Query: queries,
  
  // Mutation resolvers
  Mutation: mutations,
  
  // Type resolvers (for relationships)
  ...types,
};

