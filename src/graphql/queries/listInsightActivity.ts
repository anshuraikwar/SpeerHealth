import { gql } from '@apollo/client';

export const LIST_INSIGHT_ACTIVITY = gql`
  query GetInsightActivities($insightId: UUID!) {
    insightActivitiesCollection(
      first: 5
      filter: {
        insightId: { eq: $insightId }
      }
      orderBy: [{ createdAt: DescNullsLast }]
    ) {
      edges {
        node {
          id
          insightId
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