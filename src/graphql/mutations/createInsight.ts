import { gql } from '@apollo/client';

export const CREATE_INSIGHT = gql`
  mutation CreateInsight($input: [InsightsInsertInput!]!) {
    insertIntoInsightsCollection(objects: $input) {
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
      }
    }
  }
`;