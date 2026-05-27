export type CreateInsightResponseType = {
  insertIntoInsightsCollection: {
    records: InsightType[];
  }
}
export type UpdateInsightResponseType = {
  updateInsightsCollection: {
    records: InsightType[];
  }
}
export type ListInsightResponseType = {
  insightsCollection: {
    edges: InsightNodeType[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
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
  customFields: string;
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
export type CreateInsightType = {
  title: string;
  description?: string;
  stage: string;
  priority: string;
  customFields?: string;
  hcpId?: string;
  categoryId?: string;
  createdBy?: string;
  drugName?: string;
}