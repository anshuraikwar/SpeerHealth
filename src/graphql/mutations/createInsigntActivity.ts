import { gql } from '@apollo/client';

export const CREATE_INSIGHT_ACTIVITY = gql`
  mutation CreateInsightActivity(
    $input: [InsightActivitiesInsertInput!]!
  ) {
    insertIntoInsightActivitiesCollection(objects: $input) {
      affectedCount
    }
  }
`;