export type ActivityResponseType = {
  insightActivitiesCollection: {
    edges: ActivityNodeType[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  }
}
export type ActivityNodeType = {
  node: Activity;
}
export type Activity = {
  id: string;
  action: string;
  fieldName?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
  }
  insight: {
    id: string;
    title: string;
    stage: string;
  }
};
export type ActivitySubscriptionType = {
  id: string;
  action: string;
  field_name?: string | null;
  old_value?: string | null;
  new_value?: string | null;
  created_at: string;
  user_id: string;
  insight_id: string;
};