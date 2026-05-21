export type TagResponseType = {
  tagsCollection: {
    edges: TagNodeType[];
  }
}
export type TagNodeType = {
  node: TagType;
}
export type TagType = {
  id: string;
  name: string;
}