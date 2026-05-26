import { gql, TypedDocumentNode } from '@apollo/client';
import { HCPResponseType } from '../../type/HCPType';

export const LIST_HCPS: TypedDocumentNode<
  HCPResponseType,
  {
    filter?: any;
  }
> = gql`
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
