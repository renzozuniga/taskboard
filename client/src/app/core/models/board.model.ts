/** Matches the Card document returned by the API. */
export interface ApiCard {
  _id: string;
  title: string;
  description: string;
  list: string;
  position: number;
  assignee: { name: string } | null;
  createdAt: string;
  updatedAt: string;
}

/** Matches the List document returned by the API. */
export interface ApiList {
  _id: string;
  title: string;
  board: string;
  position: number;
  createdAt: string;
  updatedAt: string;
  cards: ApiCard[];
}

/** Matches the Board document returned by the API. */
export interface ApiBoard {
  _id: string;
  title: string;
  description: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  /** Only populated by GET /api/boards/:id */
  lists?: ApiList[];
}
