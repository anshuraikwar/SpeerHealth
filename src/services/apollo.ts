import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  Observable,
  defaultDataIdFromObject,
} from '@apollo/client';

import { supabase } from '../lib/supabase';

const httpLink = new HttpLink({
  uri: `${process.env.EXPO_PUBLIC_SUPABASE_URL}/graphql/v1`,
});

const authLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        operation.setContext(({ headers = {} }) => ({
          headers: {
            ...headers,
            apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
            Authorization: data.session?.access_token
              ? `Bearer ${data.session.access_token}`
              : '',
          },
        }));

        const subscription = forward(operation).subscribe({
          next: observer.next.bind(observer),
          error: observer.error.bind(observer),
          complete: observer.complete.bind(observer),
        });

        return () => subscription.unsubscribe();
      })
      .catch((error) => {
        observer.error(error);
      });
  });
});

const cache = new InMemoryCache({
  dataIdFromObject(responseObject) {
    if ('nodeId' in responseObject) {
      return String(responseObject.nodeId);
    }

    return defaultDataIdFromObject(responseObject);
  },
  typePolicies: {
    Insights: {
      fields: {
        insightTagsCollection: {
          merge(existing, incoming) {
            return incoming;
          },
        },
      },
    },
  },
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache,
});
