export type UserResponseType = {
  usersCollection: {
    edges: UserNodeType[];
  }
}
export type UserNodeType = {
  node: User;
}
export type User = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  createdAt: string;
};