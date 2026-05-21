import { gql } from '@apollo/client';

export const LIST_INSIGHT_ACTIVITY = gql`
  query GetInsightActivities($insightId: UUID!) {
    insightActivitiesCollection(
      filter: {
        insightId: { eq: $insightId }
      }
      orderBy: [{ createdAt: DescNullsLast }]
    ) {
      edges {
        node {
          id
          insightId
          userId
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