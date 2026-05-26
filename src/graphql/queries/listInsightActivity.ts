import { gql } from '@apollo/client';

export const LIST_INSIGHT_ACTIVITY = gql`
  query GetInsightActivities(
    $cursor: Cursor, 
    $first: Int = 5
    $filter: InsightActivitiesFilter
  ) {
    insightActivitiesCollection(
      first: $first
      after: $cursor
      filter: $filter
      orderBy: [{ createdAt: DescNullsLast }]
    ) {
      edges {
        node {
          id
          insight {
            id
            title
            stage
          }
          user {
            nodeId
            id
            fullName
          }
          action
          fieldName
          oldValue
          newValue
          createdAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;