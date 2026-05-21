export type InsightResponseType = {
  insightsCollection: {
    edges: InsightNodeType[];
  }
}
export type InsightNodeType = {
  node: InsightType;
}
export type InsightType = {
  nodeId: string;
  id: string;
  title: string;
  description: string;
  stage: string;
  priority: string;
  columnOrder: number;
  drugName: string;
  customFields: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  hcp: {
    nodeId: string;
    id: string;
    name: string;
    specialty: string;
    institution: string;
  };
  category: {
    nodeId: string;
    id: string;
    name: string;
    color: string;
  };
  insightTagsCollection: {
    edges: {
      node: {
        tag: {
          id: string;
          name: string;
        }
      }
    }[]
  }
}