import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

// Create an HTTP link to the Footium GraphQL API
const httpLink = createHttpLink({
  uri: 'https://live.api.footium.club/api/graphql',
});

// Create the Apollo Client
export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Add field policies here if needed
        },
      },
    },
  }),
  defaultOptions: {
    query: {
      fetchPolicy: 'network-only', // Don't cache query results by default
    },
  },
});
