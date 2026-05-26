import { gql } from '@apollo/client';

export const CREATE_INSIGHT_TAGS = gql`
  mutation CreateInsightTags(
    $input: [InsightTagsInsertInput!]!
  ) {
    insertIntoInsightTagsCollection(objects: $input) {
      affectedCount
      records {
        insightId
        tagId
        insight {
          nodeId
        }
        tag {
          id
          name
        }
      }
    }
  }
`;