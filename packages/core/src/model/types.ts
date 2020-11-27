export type FilterQuery<T> = {
  [k in keyof T]?: any;
};

export interface ItemFilter<T> {
  where?: FilterQuery<T>;
  fields?: string; // select
  include?: string; // populate
}

export interface Filter<T> extends ItemFilter<T> {
  skip?: number;
  limit?: number;
  sort?: string;
}

export interface PaginationFilter<T> extends ItemFilter<T> {
  next?: string;
}
