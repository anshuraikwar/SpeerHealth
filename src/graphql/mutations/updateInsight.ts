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
  }
`;