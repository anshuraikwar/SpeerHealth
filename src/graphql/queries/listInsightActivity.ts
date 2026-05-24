import { gql } from '@apollo/client';

export const LIST_INSIGHT_ACTIVITY = gql`
  query GetInsightActivities(
    $first: Int = 5
    $filter: InsightActivitiesFilter
  ) {
    insightActivitiesCollection(
      first: $first
      filter: $filter
      orderBy: [{ createdAt: DescNullsLast }]
    ) {
      edges {
        node {
          id
          insight {
            id
            title
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
    }
  }
`;