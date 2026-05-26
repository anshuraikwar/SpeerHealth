export type CreateInsightTagsResponseType = {
  insertIntoInsightTagsCollection: {
    records: {
      nodeId: string;
      tagId: string;
      insightId: string;
      tag: TagType;
      insight: {
        nodeId: string;
      }
    }[];
  }
}
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