import { gql } from '@apollo/client';

export const LIST_TAGS = gql`
  query ListTags($cursor: Cursor) {
    tagsCollection(after: $cursor) {
      edges {
        node {
          id
          name
        }
      }

      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;
