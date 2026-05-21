export type HCPResponseType = {
  hcpsCollection: {
    edges: HCPNodeType[];
  }
}
export type HCPNodeType = {
  node: HCPType;
}
export type HCPType = {
    nodeId: string;
    id: string;
    name: string;
    specialty: string;
    institution: string;
}