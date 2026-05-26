import { gql, TypedDocumentNode } from '@apollo/client';
import { ListInsightResponseType } from '../../type/InsightType';

export const LIST_INSIGHTS: TypedDocumentNode<
  ListInsightResponseType,
  {
    filter?: any;
  }
> = gql`
  query ListInsights($cursor: Cursor, $first: Int = 20, $filter: InsightsFilter) {
    insightsCollection(
      first: $first
      after: $cursor
      filter: $filter
      orderBy: [{ columnOrder: AscNullsLast }]
    ) {
      edges {
        node {
          nodeId
          id
          title
          description
          stage
          priority
          columnOrder
          drugName
          customFields
          createdAt
          updatedAt

          hcp {
            nodeId
            id
            name
            specialty
            institution
          }

          category {
            nodeId
            id
            name
            color
          }

          insightTagsCollection {
            edges {
              node {
                tag {
                  id
                  name
                }
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
