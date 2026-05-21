import { gql } from '@apollo/client';

export const LIST_INSIGHTS = gql`
  query ListInsights($cursor: Cursor, $filter: InsightsFilter) {
    insightsCollection(
      first: 20
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
