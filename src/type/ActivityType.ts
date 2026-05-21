export type ActivityResponseType = {
  insightActivitiesCollection: {
    edges: ActivityNodeType[];
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
};