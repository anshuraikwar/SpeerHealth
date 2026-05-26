import { gql, TypedDocumentNode } from "@apollo/client";
import { UserResponseType } from "../../type/userType";

export const GET_USER: TypedDocumentNode<
  UserResponseType,
  {
    id?: string;
  }
> = gql`
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