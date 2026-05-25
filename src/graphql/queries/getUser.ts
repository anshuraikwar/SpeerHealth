import { gql } from "@apollo/client";

export const GET_USER = gql`
  query GetUser($id: UUID!) {
    usersCollection(
      filter: {
        id: {
          eq: $id
        }
      }
      first: 1
    ) {
      edges {
        node {
          id
          email
          fullName
          avatarUrl
          createdAt
        }
      }
    }
  }
`