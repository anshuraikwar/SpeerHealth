export type CategoriesResponseType = {
  categoriesCollection: {
    edges: CategoriesNodeType[];
  }
}
export type CategoriesNodeType = {
  node: CategoriesType;
}
export type CategoriesType = {
  id: string;
  name: string;
  color: string;
}