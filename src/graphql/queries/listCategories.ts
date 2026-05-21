import { gql } from '@apollo/client';

export const LIST_CATEGORIES = gql`
  query ListCategories($cursor: Cursor) {
    categoriesCollection(after: $cursor) {
      edges {
        node {
          id
          name
          color
        }
      }

      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;
