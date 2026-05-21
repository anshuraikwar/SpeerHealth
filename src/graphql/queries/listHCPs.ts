import { gql } from '@apollo/client';

export const LIST_HCPS = gql`
  query ListCategories($cursor: Cursor) {
    hcpsCollection(after: $cursor) {
      edges {
        node {
          id
          name
          specialty
          institution
          region
        }
      }

      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;
