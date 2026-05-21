import { gql } from '@apollo/client';

export const UPDATE_INSIGHT = gql`
  mutation UpdateInsight(
    $filter: InsightsFilter!
    $set: InsightsUpdateInput!
  ) {
    updateInsightsCollection(
      filter: $filter
      set: $set
    ) {
      affectedCount

      records {
        nodeId
        id
        title
        stage
        priority
        columnOrder
        updatedAt
      }
    }
  }
`;