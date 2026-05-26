import { gql, TypedDocumentNode } from '@apollo/client';
import { TagResponseType } from '../../type/tagType';

export const LIST_TAGS: TypedDocumentNode<
  TagResponseType,
  {
    filter?: any;
  }
> = gql`
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
