import { gql, TypedDocumentNode } from '@apollo/client';
import { CategoriesResponseType } from '../../type/categoriesType';

export const LIST_CATEGORIES: TypedDocumentNode<
  CategoriesResponseType,
  {
    filter?: any;
  }
> = gql`
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
